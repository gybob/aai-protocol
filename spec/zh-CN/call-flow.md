# 完整调用流程示例

## 用户输入

> "使用 Mail 给 alice@example.com 发一封邮件，主题为 'Hello'"

## Agent 行为

1. 调用 `resources/list` -> 发现 `app:com.apple.mail`
2. 调用 `resources/read(app:com.apple.mail)` -> 获取 `send_email` 工具
3. 构造 MCP `tools/call` 请求

## Gateway 行为（macOS 示例）

1. 解析 `aai.json`
2. 在脚本模板中替换参数：
   ```applescript
   tell application "Mail"
       set newMessage to make new outgoing message with properties {subject:"Hello", content:"Hi Alice...", visible:false}
       tell newMessage
           make new to recipient at beginning of to recipients with properties {address:"alice@example.com"}
           send
       end tell
   end tell
   return "{\"success\":true, \"message_id\":\"generated\"}"
   ```
3. 执行 AppleScript：
   ```bash
   osascript -e 'tell application "Mail"...'
   ```
4. 如果是首次调用，macOS 会弹出 TCC 授权对话框
5. 用户授权后，脚本成功执行
6. 解析返回值（JSON 字符串）
7. 返回结果：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Email sent successfully. Message ID: generated"
      }
    ]
  }
}
```

## 用户体验

- 首次使用时 macOS 弹出 TCC 授权对话框
- 用户点击 [好]
- 后续调用将静默执行

---

[← 返回规范索引](./README.md)
