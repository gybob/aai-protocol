# Web / SaaS 应用（REST API）

AAI 通过 REST API 调用配合 OAuth 2.0 / API Key 认证来支持基于 Web 的应用和 SaaS 应用。这使得数千个云服务（Notion、Slack、GitHub、Jira、Stripe 等）可以被 Agent 访问。

## 为什么 Web/SaaS 支持很重要

桌面应用只是全局的一部分。现代生产力高度依赖 SaaS 服务，而且其中大多数已经有了 REST API。AAI 弥合了这一差距：

| SaaS 应用 | 有 REST API | LLM 了解程度 | 配合 AAI |
|-----------|-------------|-------------|----------|
| Notion    | 是          | 部分        | 完整的结构化访问 |
| Slack     | 是          | 部分        | 完整的结构化访问 |
| 你的 SaaS | 是          | 否          | 完全可发现 |

## 自动化机制

- **协议**：HTTPS REST API 调用
- **认证**：OAuth 2.0（Authorization Code / Client Credentials）或 API Key
- **数据格式**：JSON 请求/响应
- **令牌管理**：Gateway 负责令牌的存储、刷新和注入

## 认证类型

### OAuth 2.0

适用于需要用户授权的 SaaS 应用（Notion、Slack、Google 等）：

```json
{
  "auth": {
    "type": "oauth2",
    "auth_url": "https://api.notion.com/v1/oauth/authorize",
    "token_url": "https://api.notion.com/v1/oauth/token",
    "scopes": ["read_content", "update_content"],
    "token_placement": "header",
    "token_prefix": "Bearer"
  }
}
```

**OAuth 流程**（由 Gateway 处理）：

```
1. Agent calls a web tool for the first time
   ↓
2. Gateway detects: no valid token for this app
   ↓
3. Gateway opens browser for user authorization:
   ┌──────────────────────────────────────┐
   │  Notion wants you to grant access    │
   │                                      │
   │  AAI Gateway is requesting:          │
   │  • Read your content                 │
   │  • Update your content               │
   │                                      │
   │  [Cancel]            [Allow Access]  │
   └──────────────────────────────────────┘
   ↓
4. User clicks [Allow Access]
   ↓
5. Gateway receives authorization code → exchanges for tokens
   ↓
6. Gateway stores tokens in ~/.aai/tokens/<appId>.json
   ↓
7. Subsequent calls: Gateway auto-injects token, auto-refreshes when expired
```

### API Key

适用于认证方式较简单的服务：

```json
{
  "auth": {
    "type": "api_key",
    "key_placement": "header",
    "key_name": "X-API-Key",
    "env_var": "AAI_MYAPP_API_KEY"
  }
}
```

API Key 从 `env_var` 指定的环境变量中读取。用户只需在 shell 配置文件中设置一次即可。

### Bearer Token

适用于使用静态令牌的服务：

```json
{
  "auth": {
    "type": "bearer",
    "env_var": "AAI_GITHUB_TOKEN"
  }
}
```

## aai.json 示例（Notion）

```json
{
  "schema_version": "1.0",
  "appId": "com.notion.api",
  "name": "Notion",
  "description": "Notion workspace - notes, docs, wikis, and project management",
  "version": "1.0",
  "platforms": {
    "web": {
      "automation": "restapi",
      "base_url": "https://api.notion.com/v1",
      "auth": {
        "type": "oauth2",
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "scopes": ["read_content", "update_content", "insert_content"],
        "token_placement": "header",
        "token_prefix": "Bearer"
      },
      "default_headers": {
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      "tools": [
        {
          "name": "search",
          "description": "Search pages and databases in Notion workspace",
          "parameters": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "Search query text" },
              "page_size": { "type": "integer", "description": "Max results (1-100)", "default": 10 }
            },
            "required": ["query"]
          },
          "endpoint": "/search",
          "method": "POST",
          "body": {
            "query": "${query}",
            "page_size": "${page_size}"
          },
          "output_parser": "json"
        },
        {
          "name": "create_page",
          "description": "Create a new page in a Notion database",
          "parameters": {
            "type": "object",
            "properties": {
              "database_id": { "type": "string", "description": "Target database ID" },
              "title": { "type": "string", "description": "Page title" },
              "content": { "type": "string", "description": "Page content in plain text" }
            },
            "required": ["database_id", "title"]
          },
          "endpoint": "/pages",
          "method": "POST",
          "body": {
            "parent": { "database_id": "${database_id}" },
            "properties": {
              "title": {
                "title": [{ "text": { "content": "${title}" } }]
              }
            }
          },
          "output_parser": "json"
        }
      ]
    }
  }
}
```

## aai.json 字段参考（Web 平台）

| 字段 | 类型 | 描述 |
|------|------|------|
| `platforms.web.automation` | string | 必须为 `"restapi"` |
| `platforms.web.base_url` | string | 所有 API 调用的基础 URL（例如 `https://api.notion.com/v1`） |
| `platforms.web.auth` | object | 认证配置（见下文） |
| `platforms.web.default_headers` | object | 每个请求都会发送的请求头 |
| `platforms.web.tools[].endpoint` | string | API 端点路径（追加到 `base_url` 之后） |
| `platforms.web.tools[].method` | string | HTTP 方法：`GET`、`POST`、`PUT`、`PATCH`、`DELETE` |
| `platforms.web.tools[].body` | object | 请求体模板（支持 `${param}` 占位符） |
| `platforms.web.tools[].query_params` | object | URL 查询参数（支持 `${param}` 占位符） |
| `platforms.web.tools[].headers` | object | 该工具特有的附加请求头 |
| `platforms.web.tools[].output_parser` | string | `json`（默认）或 `text` |
| `platforms.web.tools[].timeout` | integer | 超时时间（秒），默认 30 |

### 认证字段（OAuth 2.0）

| 字段 | 类型 | 描述 |
|------|------|------|
| `auth.type` | string | `"oauth2"` |
| `auth.auth_url` | string | 授权端点 URL |
| `auth.token_url` | string | 令牌交换端点 URL |
| `auth.scopes` | array | 所需的 OAuth 权限范围 |
| `auth.token_placement` | string | `"header"`（Authorization 请求头）或 `"query"`（URL 参数） |
| `auth.token_prefix` | string | 请求头中的令牌前缀（例如 `"Bearer"`） |

### 认证字段（API Key）

| 字段 | 类型 | 描述 |
|------|------|------|
| `auth.type` | string | `"api_key"` |
| `auth.key_placement` | string | `"header"` 或 `"query"` |
| `auth.key_name` | string | 请求头名称或查询参数名称 |
| `auth.env_var` | string | 存放 API Key 的环境变量 |

### 认证字段（Bearer Token）

| 字段 | 类型 | 描述 |
|------|------|------|
| `auth.type` | string | `"bearer"` |
| `auth.env_var` | string | 存放令牌的环境变量 |

## 令牌存储

Gateway 将 OAuth 令牌安全地存储在：

| 平台 | 路径 |
|------|------|
| macOS / Linux | `~/.aai/tokens/<appId>.json` |
| Windows | `%USERPROFILE%\.aai\tokens\<appId>.json` |

令牌文件包含访问令牌、刷新令牌和过期时间。Gateway 会自动刷新过期的令牌。

## 集成指南

### 面向 SaaS 提供商

1. 你的应用已经有 REST API 了？**无需任何后端改动。**
2. 注册一个 OAuth 应用（提供 client_id/client_secret）
3. 编写 `aai.json`，将你的 API 端点描述为工具
4. 放置在 `~/.aai/<appId>/aai.json`
5. 完成 -- 任何 Agent 现在都可以发现并使用你的服务

### 面向社区贡献者

大多数 SaaS 应用都有公开的 API 文档。你可以为任何服务编写 `aai.json`：

1. 阅读 API 文档（端点、参数、认证方式）
2. 创建包含 REST API 工具的 `aai.json`
3. 通过 AAI 社区注册表分享

---

[返回规范索引](../README.md) | [macOS 平台](./macos.md)
