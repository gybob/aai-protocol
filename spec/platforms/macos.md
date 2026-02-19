# macOS Platform Guide

## Overview

macOS apps communicate via JSON over native IPC. Gateway sends requests, app handles them, returns JSON responses.

## Implementation Steps

### 1. Expose IPC Interface

Create an XPC service or use Apple Events to receive JSON requests:

```swift
// NSXPCConnection approach
class AAIHandler: NSObject, AAIProtocol {
    func handleRequest(_ json: String, reply: @escaping (String) -> Void) {
        guard let data = json.data(using: .utf8),
              let request = try? JSONDecoder().decode(AAIRequest.self, from: data) else {
            reply(encodeError(code: "INVALID_REQUEST", message: "Invalid JSON"))
            return
        }
        
        // Route to appropriate tool handler
        let result = executeTool(request.tool, params: request.params)
        reply(encodeResponse(requestId: request.request_id, result: result))
    }
}
```

Or use Apple Events:

```swift
// Apple Events approach
NSAppleEventManager.shared().setEventHandler(
    self,
    andSelector: #selector(handleAppleEvent(_:withReplyEvent:)),
    forEventClass: AEEventClass("AAI "),
    andEventID: AEEventID("call")
)
```

### 2. Implement Message Protocol

#### Request Format

```json
{
  "version": "1.0",
  "tool": "send_email",
  "params": { "to": ["alice@example.com"], "body": "Hello!" },
  "request_id": "req_123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Protocol version (`"1.0"`) |
| `tool` | string | Tool name to execute |
| `params` | object | Tool parameters |
| `request_id` | string | Unique request identifier |

#### Success Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "success",
  "result": { "message_id": "msg_456" }
}
```

#### Error Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "error",
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Description"
  }
}
```

See [Error Codes](../error-codes.md) for standard codes.

### 3. Create aai.json

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "platform": "macos",
  "app": {
    "id": "com.yourcompany.yourapp",
    "name": "Your App",
    "description": "Brief description of your app"
  },
  "execution": { "type": "ipc" },
  "tools": [
    {
      "name": "search_items",
      "description": "Search for items in the app",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Search query" },
          "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 10 }
        },
        "required": ["query"]
      },
      "returns": {
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": { "type": "object" }
          }
        }
      }
    }
  ]
}
```

### 4. Place Descriptor

```
~/.aai/<app_id>/aai.json
```

Example: `~/.aai/com.yourcompany.yourapp/aai.json`

Your app should create this file on first launch or provide an install script:

```swift
let aaiDir = FileManager.default.homeDirectoryForCurrentUser
    .appendingPathComponent(".aai")
    .appendingPathComponent("com.yourcompany.yourapp")

try FileManager.default.createDirectory(at: aaiDir, withIntermediateDirectories: true)

let aaiPath = aaiDir.appendingPathComponent("aai.json")
try aaiJson.write(to: aaiPath, atomically: true, encoding: .utf8)
```

## Authorization

macOS handles authorization natively. First time Gateway calls your app, OS prompts user for permission.

No code changes needed. User approves once, OS remembers.

## Testing

### Manual Test

```bash
# Simulate Gateway request via command line
osascript -e 'tell app "YourApp" to handleAAIRequest "{\"tool\":\"search_items\",\"params\":{\"query\":\"test\"},\"request_id\":\"test_1\"}"'
```

### Verify Descriptor

```bash
# Check descriptor is valid JSON
cat ~/.aai/com.yourcompany.yourapp/aai.json | python -m json.tool
```

## Checklist

- [ ] IPC handler receives JSON requests
- [ ] Request parsing handles malformed JSON gracefully
- [ ] Tool routing works for all defined tools
- [ ] Success responses include `request_id`
- [ ] Error responses use standard error codes
- [ ] aai.json placed at `~/.aai/<app_id>/aai.json`
- [ ] aai.json `version` follows semver

---

[Back to Spec Index](../README.md) | [Web Platform](./web.md)
