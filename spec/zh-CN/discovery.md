# 渐进式技能发现（避免上下文爆炸）

AAI 通过 MCP 资源模型实现按需加载。

## 第一步：列出可用应用

```json
// Agent -> Gateway
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}

// Gateway -> Agent
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "app:com.apple.mail",
        "name": "Mail",
        "description": "Apple's native email client",
        "mimeType": "application/aai+json"
      },
      {
        "uri": "app:com.apple.calendar",
        "name": "Calendar",
        "description": "Apple's calendar application",
        "mimeType": "application/aai+json"
      }
    ]
  }
}
```

## 第二步：按需加载技能详情

```json
// Agent -> Gateway
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "app:com.apple.mail"
  }
}

// Gateway -> Agent
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [
      {
        "uri": "app:com.apple.mail",
        "mimeType": "application/json",
        "text": "{\n  \"schema_version\": \"1.0\",\n  \"appId\": \"com.apple.mail\",\n  \"tools\": [...]\n}"
      }
    ]
  }
}
```

## 第三步：调用技能

```json
// Agent -> Gateway
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "com.apple.mail:send_email",
    "arguments": {
      "to": "alice@example.com",
      "subject": "Hello",
      "body": "Hi Alice, ..."
    }
  }
}

// Gateway -> Agent
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Email sent successfully. Message ID: 12345"
      }
    ]
  }
}
```

**优势：** 仅在用户提及某个应用时才加载其工具，极大地节省上下文。

## Web 应用发现

桌面应用通过扫描本地文件系统中的 `~/.aai/` 来发现。Web 应用无法写入本地文件系统，因此通过 **AAI Registry** 来发现。

### 发现流程

```
Gateway 启动
   ↓
1. 扫描 ~/.aai/ 查找本地桌面应用描述符
   ↓
2. 从 AAI Registry 获取 Web 应用目录
   （Registry 返回 aai.json URL 列表）
   ↓
3. 下载每个 aai.json → 缓存到本地 ~/.aai/web/<appId>/aai.json
   ↓
4. 所有应用（桌面 + Web）现在可通过 resources/list 访问
```

### Registry API

Gateway 在启动时从 AAI Registry 获取 Web 应用目录：

```json
// Gateway -> AAI Registry
GET https://registry.aai-protocol.com/api/v1/apps

// AAI Registry -> Gateway
{
  "apps": [
    {
      "appId": "com.notion.api",
      "name": "Notion",
      "descriptor_url": "https://api.notion.com/.well-known/aai.json"
    },
    {
      "appId": "com.slack.api",
      "name": "Slack",
      "descriptor_url": "https://slack.com/.well-known/aai.json"
    }
  ]
}
```

Gateway 然后获取每个 `descriptor_url` 来加载完整的 `aai.json`。

### 首次访问 Web 应用

当 Agent 首次调用 Web 应用工具时，Gateway 会提示用户在继续授权之前验证域名和 SSL 证书。详情请参阅 [安全模型](./security.md)。

---

[← 返回规范索引](./README.md)
