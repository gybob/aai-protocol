# Complete Call Flow Example

## User Input

> "Send an email to alice@example.com with subject 'Hello' using Mail"

## Agent Behavior

1. Call `resources/list` -> Discover `app:com.apple.mail`
2. Call `resources/read(app:com.apple.mail)` -> Get `send_email` tool
3. Construct MCP `tools/call` request

## Gateway Behavior (macOS Example)

1. Parse `aai.json`
2. Replace parameters in script template:
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
3. Execute AppleScript:
   ```bash
   osascript -e 'tell application "Mail"...'
   ```
4. If it's the first call, macOS pops up TCC authorization dialog
5. After user authorizes, script executes successfully
6. Parse return value (JSON string)
7. Return result:

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

## User Experience

- macOS pops up TCC authorization dialog on first use
- User clicks [OK]
- Subsequent calls execute silently

---

[Back to Spec Index](./README.md)
