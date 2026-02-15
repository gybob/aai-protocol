# Desktop: JSON Protocol over Apple Events

## Overview

AAI desktop apps on macOS communicate via a **JSON-based protocol** over Apple Events. This provides:

- Modern JSON message format
- Native IPC performance via Apple Events
- No AppleScript knowledge required
- Type-safe communication

## Architecture

```
┌─────────────────┐     Apple Events      ┌─────────────────┐
│  AAI Gateway    │ ───────────────────── │  Desktop App    │
│                 │     JSON Messages     │                 │
│  JSON → AE      │                       │  AE → JSON      │
└─────────────────┘                       └─────────────────┘
```

## Message Protocol

### Request Format

```json
{
  "version": "1.0",
  "tool": "send_email",
  "params": {
    "to": ["alice@example.com"],
    "subject": "Hello",
    "body": "Hi Alice!"
  },
  "request_id": "req_123"
}
```

### Response Format

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "success",
  "result": {
    "message_id": "msg_456"
  }
}
```

### Error Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "error",
  "error": {
    "code": "INVALID_RECIPIENT",
    "message": "Invalid email address"
  }
}
```

## Apple Events Mapping

| Layer | Content |
|-------|---------|
| Event Class | `'aai '` (AAI protocol) |
| Event ID | `'exec'` (execute tool) |
| Direct Parameter | JSON request string |
| Reply | JSON response string |

## Implementation Guide

### App Side: Register AAI Handler

Swift example:

```swift
// Register Apple Event handler
NSAppleEventManager.shared().setEventHandler(
    self,
    andSelector: #selector(handleAAIEvent(_:withReplyEvent:)),
    forEventClass: AEEventClass(kAAIEventClass),
    andEventID: AEEventID(kAAIEventExecute)
)

@objc func handleAAIEvent(_ event: NSAppleEventDescriptor, 
                          withReplyEvent replyEvent: NSAppleEventDescriptor) {
    // Extract JSON request
    guard let jsonStr = event.paramDescriptor(forKeyword: keyDirectObject)?.stringValue,
          let data = jsonStr.data(using: .utf8),
          let request = try? JSONDecoder().decode(AAIRequest.self, from: data) else {
        sendError(replyEvent, "Invalid request format")
        return
    }
    
    // Execute tool
    let result = executeTool(request.tool, params: request.params)
    
    // Send JSON response
    let response = AAIResponse(requestId: request.requestId, result: result)
    sendResponse(replyEvent, response)
}
```

### Gateway Side: Send Apple Event

```swift
func callTool(appId: String, tool: String, params: [String: Any]) async throws -> [String: Any] {
    let request: [String: Any] = [
        "version": "1.0",
        "tool": tool,
        "params": params,
        "request_id": UUID().uuidString
    ]
    
    let jsonData = try JSONSerialization.data(withJSONObject: request)
    guard let jsonStr = String(data: jsonData, encoding: .utf8) else {
        throw AAIError.encodingFailed
    }
    
    // Create and send Apple Event
    let event = NSAppleEventDescriptor(
        eventClass: AEEventClass(kAAIEventClass),
        eventID: AEEventID(kAAIEventExecute),
        targetDescriptor: NSAppleEventDescriptor(bundleIdentifier: appId)
    )
    event.setParam(NSAppleEventDescriptor(string: jsonStr), forKeyword: keyDirectObject)
    
    // Send and wait for reply
    let reply = try event.sendEvent(timeout: 30)
    
    // Parse JSON response
    guard let replyStr = reply.paramDescriptor(forKeyword: keyDirectObject)?.stringValue,
          let replyData = replyStr.data(using: .utf8),
          let response = try JSONSerialization.jsonObject(with: replyData) as? [String: Any] else {
        throw AAIError.invalidResponse
    }
    
    return response
}
```

## Standard Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed JSON request |
| `UNKNOWN_TOOL` | Tool not found in descriptor |
| `INVALID_PARAMS` | Parameters don't match schema |
| `PERMISSION_DENIED` | User denied access |
| `INTERNAL_ERROR` | App-specific error |

## Advantages Over AppleScript

| Aspect | AppleScript | AAI JSON Protocol |
|--------|-------------|-------------------|
| Message format | Natural language | JSON |
| Type safety | Weak | Strong (via schema) |
| Learning curve | High | Low |
| Error handling | String parsing | Structured errors |
| Cross-language | Poor | Universal |

## App Descriptor Location

```
~/.aai/<app_id>/aai.json
```

Example: `~/.aai/com.example.mail/aai.json`

---

[Back to Spec Index](../README.md) | [Web Platform](./web.md)
