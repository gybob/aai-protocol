# Linux Platform Guide

## Overview

Linux apps use **DBus** as the IPC mechanism. Gateway sends DBus method calls containing JSON; the app handles them and returns JSON responses.

## Prerequisites

| Resource                                 | Description                    |
| ---------------------------------------- | ------------------------------ |
| [AAI Protocol Overview](../../README.md) | What is AAI and why it matters |
| [Protocol Specification](../README.md)   | Full spec index                |
| [aai.json Descriptor](../aai-json.md)    | Descriptor format              |
| [Security Model](../security.md)         | Authorization details          |

## IPC Protocol

| Aspect      | Value                              |
| ----------- | ---------------------------------- |
| Mechanism   | DBus (Session Bus)                 |
| Bus Name    | `com.aai.gateway` (configurable)   |
| Object Path | `/com/aai/handler` (configurable)  |
| Interface   | `com.aai.Executor`                 |
| Method      | `Execute(json_request)`            |
| Request     | JSON string as method argument     |
| Response    | JSON string as method return value |
| Security    | Polkit (PolicyKit)                 |

## Implementation Steps

> **Note**: Code snippets below are simplified examples. Adapt them to your app's architecture.

### 1. Implement DBus Service

```python
# EXAMPLE: Simplified DBus service implementation
import dbus
import dbus.service
from gi.repository import GLib

class AAIExecutor(dbus.service.Object):
    def __init__(self, bus_name, object_path):
        super().__init__(bus_name, object_path)

    @dbus.service.method("com.aai.Executor", in_signature='s', out_signature='s')
    def Execute(self, json_request):
        try:
            request = json.loads(json_request)
            result = self.process_tool(request['tool'], request.get('params', {}))
            response = {
                "version": "1.0",
                "request_id": request['request_id'],
                "status": "success",
                "result": result
            }
            return json.dumps(response)
        except Exception as e:
            return json.dumps({
                "version": "1.0",
                "request_id": "",
                "status": "error",
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": str(e)
                }
            })

    def process_tool(self, tool, params):
        # Route to appropriate tool implementation
        return {"success": True}

if __name__ == '__main__':
    bus = dbus.SessionBus()
    bus_name = dbus.service.BusName("com.yourcompany.yourapp", bus)
    executor = AAIExecutor(bus_name, "/com/yourcompany/executor")
    GLib.MainLoop().run()
```

### 2. Install DBus Service File

Create `/usr/share/dbus-1/services/com.yourcompany.yourapp.service`:

```
[D-BUS Service]
Name=com.yourcompany.yourapp
Exec=/usr/bin/your-app --dbus-mode
```

### 3. Define Polkit Policy (Optional)

If your app needs elevated permissions, create `/usr/share/polkit-1/actions/com.yourcompany.yourapp.policy`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE policyconfig PUBLIC
  "-//freedesktop//DTD PolicyKit Policy Configuration 1.0//EN"
  "http://www.freedesktop.org/standards/PolicyKit/1/policyconfig.dtd">
<policyconfig>
  <vendor>Your Company</vendor>
  <vendor_url>https://yourcompany.com</vendor_url>

  <action id="com.yourcompany.yourapp.execute">
    <description>Execute AAI operations</description>
    <message>Allow AAI Gateway to execute operations in this app</message>
    <defaults>
      <allow_any>auth_self</allow_any>
      <allow_inactive>auth_self</allow_inactive>
      <allow_active>auth_self</allow_active>
    </defaults>
  </action>
</policyconfig>
```

### 4. Message Protocol

#### Request Format

```json
{
  "version": "1.0",
  "tool": "createFile",
  "params": { "path": "/home/user/document.txt", "content": "Hello, World!" },
  "request_id": "req_123"
}
```

#### Success Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "success",
  "result": { "file_id": "file_456" }
}
```

#### Error Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "error",
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Cannot write to the specified path"
  }
}
```

### 5. Create aai.json

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "linux",
  "app": {
    "id": "com.yourcompany.yourapp",
    "name": {
      "en": "Your App",
      "zh-CN": "你的应用"
    },
    "defaultLang": "en",
    "description": "Brief description of your app"
  },
  "execution": {
    "type": "dbus",
    "service": "com.yourcompany.yourapp",
    "objectPath": "/com/yourcompany/executor",
    "interface": "com.aai.Executor",
    "bus": "session"
  },
  "tools": [
    {
      "name": "createFile",
      "description": "Create a new file",
      "parameters": {
        "type": "object",
        "properties": {
          "path": { "type": "string", "description": "Absolute file path" },
          "content": { "type": "string", "description": "File content" }
        },
        "required": ["path"]
      }
    }
  ]
}
```

### 6. Place Descriptor in XDG Paths

The `aai.json` file should be placed in one of these locations:

- **System-wide**: `/usr/share/applications/aai/yourapp.json`
- **User-local**: `~/.local/share/applications/aai/yourapp.json`
- **App directory**: `/opt/yourapp/aai.json`

**Installation**: The descriptor is installed with your app package (deb, rpm, etc.) and removed on uninstall.

## Authorization

Linux uses **Polkit (PolicyKit)** for authorization. For operations requiring elevated privileges, the system will prompt the user for consent via a native dialog.

For standard DBus operations, no additional authorization is needed if the app runs under the user's session.

## Testing

### Test via DBus CLI

```bash
# Test your DBus interface directly
dbus-send --session --print-reply --dest=com.yourcompany.yourapp \
  /com/yourcompany/executor \
  com.aai.Executor.Execute \
  string:'{"version":"1.0","tool":"createFile","params":{"path":"/tmp/test.txt"},"request_id":"test_1"}'
```

### Test via Python

```python
import dbus

bus = dbus.SessionBus()
proxy = bus.get_object('com.yourcompany.yourapp', '/com/yourcompany/executor')
executor = dbus.Interface(proxy, 'com.aai.Executor')

request = {
    "version": "1.0",
    "tool": "createFile",
    "params": {"path": "/tmp/test.txt"},
    "request_id": "test_1"
}
result = executor.Execute(json.dumps(request))
print(result)
```

### Verify Descriptor Location

```bash
# Check that aai.json is in the expected location
cat /usr/share/applications/aai/yourapp.json | python -m json.tool
```

## Discovery Paths

The Gateway scans these paths for `aai.json` files:

| Path                                     | Description        |
| ---------------------------------------- | ------------------ |
| `/usr/share/applications/aai/*.json`     | System-wide apps   |
| `~/.local/share/applications/aai/*.json` | User-local apps    |
| `/opt/*/aai.json`                        | Opt-installed apps |

## Distribution

### Debian/Ubuntu

```
# In your debian package
/usr/share/applications/aai/yourapp.json
/usr/share/dbus-1/services/com.yourcompany.yourapp.service
/usr/bin/your-app
```

### Fedora/RHEL

```
# In your RPM package
/usr/share/applications/aai/yourapp.json
/usr/share/dbus-1/services/com.yourcompany.ydoorapp.service
/usr/bin/your-app
```

## Checklist

- [ ] DBus service implemented with `Execute` method
- [ ] DBus service file installed in `/usr/share/dbus-1/services/`
- [ ] JSON request parsing handles malformed input
- [ ] Tool routing works for all defined tools
- [ ] Error responses use standard error codes
- [ ] `aai.json` placed in one of the discovery paths
- [ ] `aai.json` `version` follows semver

---

[Back to Spec Index](../README.md) | [macOS Platform](./macos.md) | [Windows Platform](./windows.md)
