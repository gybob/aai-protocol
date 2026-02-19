# macOS Platform Guide

## Overview

macOS apps use **Apple Events** as the standard IPC mechanism. Gateway sends Apple Events containing JSON, app handles them, returns JSON responses.

## IPC Protocol

| Aspect | Value |
|--------|-------|
| Mechanism | Apple Events |
| Event Class | `AAI ` (4 chars: A, A, I, space) |
| Event ID | `call` |
| Request | JSON string in `keyDirectObject` |
| Response | JSON string as return value |

## Implementation Steps

### 1. Register Apple Event Handler

```swift
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSAppleEventManager.shared().setEventHandler(
            self,
            andSelector: #selector(handleAAIEvent(_:withReplyEvent:)),
            forEventClass: AEEventClass("AAI "),
            andEventID: AEEventID("call")
        )
    }
    
    @objc func handleAAIEvent(_ event: NSAppleEventDescriptor, withReplyEvent replyEvent: NSAppleEventDescriptor) {
        // Extract JSON request
        guard let jsonString = event.paramDescriptor(forKeyword: AEKeyword(keyDirectObject))?.stringValue else {
            replyEvent.setParamDescriptor(
                NSAppleEventDescriptor(string: encodeError(code: "INVALID_REQUEST", message: "Missing request")),
                forKeyword: AEKeyword(keyDirectObject)
            )
            return
        }
        
        // Parse and execute
        let response = processAAIRequest(jsonString)
        
        // Set response
        replyEvent.setParamDescriptor(
            NSAppleEventDescriptor(string: response),
            forKeyword: AEKeyword(keyDirectObject)
        )
    }
    
    func processAAIRequest(_ jsonString: String) -> String {
        guard let data = jsonString.data(using: .utf8),
              let request = try? JSONDecoder().decode(AAIRequest.self, from: data) else {
            return encodeError(code: "INVALID_REQUEST", message: "Invalid JSON")
        }
        
        let result = executeTool(request.tool, params: request.params)
        return encodeResponse(requestId: request.request_id, result: result)
    }
}
```

### 2. Define Request/Response Types

```swift
struct AAIRequest: Codable {
    let version: String
    let tool: String
    let params: [String: AnyCodable]  // Use AnyCodable for flexible JSON
    let request_id: String
}

struct AAIResponse: Codable {
    let version: String
    let request_id: String
    let status: String
    let result: [String: AnyCodable]?
    let error: AAIError?
}

struct AAIError: Codable {
    let code: String
    let message: String
}
```

### 3. Message Protocol

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

### 4. Create aai.json

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

### 5. Place Descriptor

```
~/.aai/<app_id>/aai.json
```

Example: `~/.aai/com.yourcompany.yourapp/aai.json`

Your app should create this file on first launch:

```swift
func installAADescriptor() {
    let aaiDir = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent(".aai")
        .appendingPathComponent("com.yourcompany.yourapp")
    
    try? FileManager.default.createDirectory(at: aaiDir, withIntermediateDirectories: true)
    
    let aaiPath = aaiDir.appendingPathComponent("aai.json")
    let aaiJson = """
    {
      "schema_version": "1.0",
      "version": "1.0.0",
      "platform": "macos",
      ...
    }
    """
    try? aaiJson.write(to: aaiPath, atomically: true, encoding: .utf8)
}
```

## Authorization

macOS handles authorization natively. First time Gateway calls your app, OS prompts user for permission.

No code changes needed. User approves once, OS remembers.

## Testing

### Test via AppleScript

```bash
osascript -e 'tell application "YourApp" to get result of ¬
  {event "AAI call", ¬
   «class kfil»: "{\"version\":\"1.0\",\"tool\":\"search_items\",\"params\":{\"query\":\"test\"},\"request_id\":\"test_1\"}"}'
```

### Simpler Test (if you expose a script command)

Add to your app's `sdef` (Scripting Definition):

```xml
<suite name="AAI Suite" code="AAI ">
    <command name="aai call" code="AAI call">
        <parameter name="request" code="kfil" type="text">
            <cocoa key="Request"/>
        </parameter>
        <result type="text">
            <cocoa key="Result"/>
        </result>
    </command>
</suite>
```

Then test with:

```bash
osascript -e 'tell application "YourApp" to aai call "{\"version\":\"1.0\",\"tool\":\"search_items\",\"params\":{\"query\":\"test\"},\"request_id\":\"test_1\"}"'
```

### Verify Descriptor

```bash
cat ~/.aai/com.yourcompany.yourapp/aai.json | python -m json.tool
```

## Checklist

- [ ] Apple Event handler registered for `AAI ` / `call`
- [ ] Request extracted from `keyDirectObject`
- [ ] Response returned via reply event's `keyDirectObject`
- [ ] JSON parsing handles malformed input gracefully
- [ ] Tool routing works for all defined tools
- [ ] Error responses use standard error codes
- [ ] aai.json placed at `~/.aai/<app_id>/aai.json`
- [ ] aai.json `version` follows semver

---

[Back to Spec Index](../README.md) | [Web Platform](./web.md)
