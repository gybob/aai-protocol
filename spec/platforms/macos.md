# macOS Platform Guide

## Overview

macOS apps use **Apple Events** as the IPC mechanism. Gateway sends Apple Events containing JSON; the app handles them and returns JSON responses.

## Prerequisites

| Resource | Description |
|----------|-------------|
| [AAI Protocol Overview](../../README.md) | What is AAI and why it matters |
| [Protocol Specification](../README.md) | Full spec index |
| [aai.json Descriptor](../aai-json.md) | Descriptor format |
| [Security Model](../security.md) | Authorization details |

## IPC Protocol

| Aspect | Value |
|--------|-------|
| Mechanism | Apple Events |
| Event Class | `AAI ` (4 chars: A, A, I, space) |
| Event ID | `call` |
| Request | JSON string in `keyDirectObject` |
| Response | JSON string as return value |

## Implementation Steps

> **Note**: Code snippets below are simplified examples. Adapt them to your app's architecture.

### 1. Register Apple Event Handler

```swift
// EXAMPLE: Simplified Apple Event handler
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
        guard let jsonString = event.paramDescriptor(forKeyword: AEKeyword(keyDirectObject))?.stringValue else {
            replyEvent.setParamDescriptor(
                NSAppleEventDescriptor(string: encodeError(code: "INVALID_REQUEST", message: "Missing request")),
                forKeyword: AEKeyword(keyDirectObject)
            )
            return
        }

        let response = processAAIRequest(jsonString)

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
// EXAMPLE: Basic type definitions
struct AAIRequest: Codable {
    let version: String
    let tool: String
    let params: [String: AnyCodable]
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
          "items": { "type": "array", "items": { "type": "object" } }
        }
      }
    }
  ]
}
```

### 5. Place Descriptor in App Bundle

Add `aai.json` to your Xcode project as a **Bundle Resource**:

1. Drag `aai.json` into your Xcode project
2. In the file inspector, ensure **Target Membership** is checked for your app target
3. Verify it appears in **Build Phases → Copy Bundle Resources**

The file will be placed at:

```
YourApp.app/Contents/Resources/aai.json
```

**That's all.** No runtime installation code needed. Gateway discovers the descriptor automatically by scanning `/Applications/` on startup. The descriptor is installed when the user installs the app and removed when they uninstall it.

## Authorization

macOS handles authorization natively. The first time Gateway calls your app via Apple Events, the OS prompts the user for permission. The user approves once; the OS remembers permanently.

No code changes are needed to support this.

## Testing

### Test via AppleScript

```bash
osascript -e 'tell application "YourApp" to get result of ¬
  {event "AAI call", ¬
   «class kfil»: "{\"version\":\"1.0\",\"tool\":\"search_items\",\"params\":{\"query\":\"test\"},\"request_id\":\"test_1\"}"}'
```

### Add Scripting Definition (Optional)

Add to your app's `sdef` for cleaner AppleScript syntax:

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

### Verify Descriptor is Bundled

```bash
cat /Applications/YourApp.app/Contents/Resources/aai.json | python -m json.tool
```

## Checklist

- [ ] Apple Event handler registered for `AAI ` / `call`
- [ ] Request extracted from `keyDirectObject`
- [ ] Response returned via reply event's `keyDirectObject`
- [ ] JSON parsing handles malformed input gracefully
- [ ] Tool routing works for all defined tools
- [ ] Error responses use standard error codes
- [ ] `aai.json` added to Xcode project as Bundle Resource
- [ ] `aai.json` `version` follows semver

---

[Back to Spec Index](../README.md) | [Web Platform](./web.md)
