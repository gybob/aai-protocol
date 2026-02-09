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

---

[← 返回规范索引](./README.md)
