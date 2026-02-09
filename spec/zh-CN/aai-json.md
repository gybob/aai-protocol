# 应用描述文件：aai.json

每个支持 AAI 的应用在统一的 AAI 配置目录中提供 `aai.json` 文件。

## 文件位置

| 平台          | 路径                                  |
| ------------- | ------------------------------------- |
| macOS / Linux | `~/.aai/<appId>/aai.json`             |
| Windows       | `%USERPROFILE%\.aai\<appId>\aai.json` |

**示例：**

- macOS: `~/.aai/com.apple.mail/aai.json`
- Windows: `C:\Users\Alice\.aai\com.microsoft.outlook\aai.json`

**优势：**

- 无需修改已签名的应用程序包
- 无需管理员权限
- 用户或社区可自由添加、修改、删除配置
- Gateway 只需扫描单一目录即可发现所有应用

## 结构示例

```json
{
  "schema_version": "1.0",
  "appId": "com.apple.mail",
  "name": "Mail",
  "description": "Apple's native email client",
  "version": "1.0",
  "platforms": {
    "macos": {
      "automation": "applescript",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email via Apple Mail",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "script": "tell application \"Mail\"\n  set newMessage to make new outgoing message with properties {subject:\"${subject}\", content:\"${body}\", visible:false}\n  tell newMessage\n    make new to recipient at beginning of to recipients with properties {address:\"${to}\"}\n    send\n  end tell\nend tell\nreturn \"{\\\"success\\\":true, \\\"message_id\\\":\\\"generated\\\"}\"",
          "output_parser": "result as text"
        },
        {
          "name": "search_emails",
          "description": "Search emails in mailbox",
          "parameters": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "Search query string" }
            },
            "required": ["query"]
          },
          "script": "tell application \"Mail\"\n  set results to (messages whose subject contains \"${query}\")\nend tell\nreturn \"{\\\"emails\\\":[\\\"result1\\\", \\\"result2\\\"]}\"",
          "output_parser": "result as text"
        }
      ]
    },
    "windows": {
      "automation": "com",
      "progid": "Outlook.Application",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email via Microsoft Outlook",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "script": [
            { "action": "create", "var": "app", "progid": "Outlook.Application" },
            {
              "action": "call",
              "var": "mail",
              "object": "app",
              "method": "CreateItem",
              "args": [0]
            },
            { "action": "set", "object": "mail", "property": "To", "value": "${to}" },
            { "action": "set", "object": "mail", "property": "Subject", "value": "${subject}" },
            { "action": "set", "object": "mail", "property": "Body", "value": "${body}" },
            { "action": "call", "object": "mail", "method": "Send" },
            { "action": "return", "value": "{\"success\":true, \"message_id\":\"generated\"}" }
          ],
          "output_parser": "last_result"
        }
      ]
    },
    "linux": {
      "automation": "dbus",
      "service": "org.example.Mail",
      "object": "/org/example/Mail",
      "interface": "org.example.Mail",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "method": "SendEmail",
          "output_parser": "json"
        }
      ]
    },
    "android": {
      "automation": "intent",
      "package": "com.example.mail",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "action": "com.example.MAIL_SEND",
          "extras": {
            "to": "${to}",
            "subject": "${subject}",
            "body": "${body}"
          },
          "result_type": "content_provider",
          "result_uri": "content://com.example.mail/results"
        }
      ]
    },
    "ios": {
      "automation": "url_scheme",
      "scheme": "mailapp",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "url_template": "mailapp://send?to=${to}&subject=${subject}&body=${body}",
          "result_type": "app_group",
          "app_group_id": "group.com.example.mail"
        }
      ]
    },
    "web": {
      "automation": "restapi",
      "base_url": "https://api.notion.com/v1",
      "auth": {
        "type": "oauth2",
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "scopes": ["read_content", "update_content"],
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
          "description": "Search pages and databases",
          "parameters": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "Search query text" }
            },
            "required": ["query"]
          },
          "endpoint": "/search",
          "method": "POST",
          "body": { "query": "${query}" },
          "output_parser": "json"
        }
      ]
    }
  }
}
```

## 字段说明

### 通用字段

| 字段             | 类型   | 描述                                      |
| ---------------- | ------ | ----------------------------------------- |
| `schema_version` | string | aai.json 的 Schema 版本，用于兼容性检查   |
| `appId`          | string | 唯一标识符（建议使用反向 DNS 格式）         |
| `name`           | string | 应用名称                                   |
| `description`    | string | 应用描述                                   |
| `version`        | string | aai.json 版本号                            |
| `platforms`      | object | 各平台的自动化配置                          |

### macOS 专有字段

| 字段                                    | 类型    | 描述                                                                          |
| --------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `platforms.macos.automation`            | string  | 自动化类型：`applescript` 或 `jxa`                                            |
| `platforms.macos.tools[].script`        | string  | 脚本模板，支持 `${param}` 占位符                                               |
| `platforms.macos.tools[].output_parser` | string  | 输出解析方式：`result as text`（字符串）、`result as record`（字典）             |
| `platforms.macos.tools[].timeout`       | integer | 超时时间（秒），默认 30                                                        |

### Windows 专有字段

| 字段                                          | 类型    | 描述                                                                                                         |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `platforms.windows.automation`                | string  | 自动化类型：`com`                                                                                            |
| `platforms.windows.progid`                    | string  | COM ProgID（例如 `Outlook.Application`）                                                                      |
| `platforms.windows.tools[].script`            | array   | COM 操作序列                                                                                                  |
| `platforms.windows.tools[].script[].action`   | string  | 操作类型：`create`（创建对象）、`call`（调用方法）、`set`（设置属性）、`get`（获取属性）、`return`（返回结果） |
| `platforms.windows.tools[].script[].var`      | string  | 变量名（用于存储返回值）                                                                                      |
| `platforms.windows.tools[].script[].object`   | string  | 对象引用（例如 `mail`、`app`）                                                                                |
| `platforms.windows.tools[].script[].progid`   | string  | ProgID（仅用于 `create` 操作）                                                                                |
| `platforms.windows.tools[].script[].method`   | string  | 方法名（仅用于 `call` 操作）                                                                                  |
| `platforms.windows.tools[].script[].property` | string  | 属性名（仅用于 `set`/`get` 操作）                                                                             |
| `platforms.windows.tools[].script[].value`    | string  | 属性值（支持 `${param}` 占位符）                                                                              |
| `platforms.windows.tools[].script[].args`     | array   | 方法参数（支持 `${param}` 占位符）                                                                            |
| `platforms.windows.tools[].output_parser`     | string  | 输出解析方式：`last_result`（返回最后一个操作的返回值）                                                        |
| `platforms.windows.tools[].timeout`           | integer | 超时时间（秒），默认 30                                                                                       |

### Linux 专有字段

| 字段                                    | 类型    | 描述                                                        |
| --------------------------------------- | ------- | ----------------------------------------------------------- |
| `platforms.linux.automation`            | string  | 自动化类型：`dbus`                                          |
| `platforms.linux.service`               | string  | DBus 服务名（例如 `org.example.Mail`）                       |
| `platforms.linux.object`                | string  | DBus 对象路径（例如 `/org/example/Mail`）                    |
| `platforms.linux.interface`             | string  | DBus 接口名（例如 `org.example.Mail`）                       |
| `platforms.linux.tools[].method`        | string  | DBus 方法名（例如 `SendEmail`）                              |
| `platforms.linux.tools[].output_parser` | string  | 输出解析方式：`json`（假设返回 JSON）、`string`               |
| `platforms.linux.tools[].timeout`       | integer | 超时时间（秒），默认 30                                      |

### Android 专有字段

| 字段                                    | 类型    | 描述                                                                                  |
| --------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `platforms.android.automation`          | string  | 自动化类型：`intent`                                                                  |
| `platforms.android.package`             | string  | Android 包名（例如 `com.example.mail`）                                                |
| `platforms.android.tools[].action`      | string  | Intent Action（例如 `com.example.MAIL_SEND`）                                          |
| `platforms.android.tools[].extras`      | object  | Intent Extra 参数（支持 `${param}` 占位符）                                             |
| `platforms.android.tools[].result_type` | string  | 结果获取方式：`content_provider`（Content Provider）、`broadcast`（广播）                |
| `platforms.android.tools[].result_uri`  | string  | Content Provider URI（仅当 `result_type=content_provider` 时使用）                      |
| `platforms.android.tools[].timeout`     | integer | 超时时间（毫秒），默认 5000                                                            |

### iOS 专有字段

| 字段                                 | 类型    | 描述                                                                     |
| ------------------------------------ | ------- | ------------------------------------------------------------------------ |
| `platforms.ios.automation`           | string  | 自动化类型：`url_scheme`                                                  |
| `platforms.ios.scheme`               | string  | URL Scheme（例如 `mailapp`）                                              |
| `platforms.ios.tools[].url_template` | string  | URL 模板（支持 `${param}` 占位符）                                        |
| `platforms.ios.tools[].result_type`  | string  | 结果获取方式：`app_group`（App Groups）、`clipboard`（剪贴板）             |
| `platforms.ios.tools[].app_group_id` | string  | App Group ID（仅当 `result_type=app_group` 时使用）                       |
| `platforms.ios.tools[].timeout`      | integer | 超时时间（秒），默认 10                                                   |

### Web / SaaS 专有字段

| 字段 | 类型 | 描述 |
|------|------|------|
| `platforms.web.automation` | string | 自动化类型：`restapi` |
| `platforms.web.base_url` | string | 所有 API 调用的基础 URL（例如 `https://api.notion.com/v1`） |
| `platforms.web.auth` | object | 认证配置 |
| `platforms.web.auth.type` | string | 认证类型：`oauth2`、`api_key` 或 `bearer` |
| `platforms.web.auth.auth_url` | string | OAuth 授权端点（仅用于 `oauth2`） |
| `platforms.web.auth.token_url` | string | OAuth 令牌端点（仅用于 `oauth2`） |
| `platforms.web.auth.scopes` | array | 所需的 OAuth 权限范围（仅用于 `oauth2`） |
| `platforms.web.auth.token_placement` | string | 令牌放置位置：`header` 或 `query` |
| `platforms.web.auth.token_prefix` | string | 请求头中的令牌前缀（例如 `Bearer`） |
| `platforms.web.auth.env_var` | string | 用于存放 API Key / Bearer 令牌的环境变量 |
| `platforms.web.auth.key_name` | string | 请求头或查询参数名称（仅用于 `api_key`） |
| `platforms.web.auth.key_placement` | string | `header` 或 `query`（仅用于 `api_key`） |
| `platforms.web.default_headers` | object | 每个请求都会发送的请求头 |
| `platforms.web.tools[].endpoint` | string | API 端点路径（追加到 `base_url` 之后） |
| `platforms.web.tools[].method` | string | HTTP 方法：`GET`、`POST`、`PUT`、`PATCH`、`DELETE` |
| `platforms.web.tools[].body` | object | 请求体模板（支持 `${param}` 占位符） |
| `platforms.web.tools[].query_params` | object | URL 查询参数（支持 `${param}` 占位符） |
| `platforms.web.tools[].headers` | object | 该工具特有的附加请求头 |
| `platforms.web.tools[].output_parser` | string | `json`（默认）或 `text` |
| `platforms.web.tools[].timeout` | integer | 超时时间（秒），默认 30 |

---

[返回规范索引](./README.md)
