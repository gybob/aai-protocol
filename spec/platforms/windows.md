# Windows Platform Guide

## Overview

Windows apps use **COM Automation** and **PowerShell** as the IPC mechanism. Gateway executes PowerShell scripts that interact with apps via COM interfaces.

## Prerequisites

| Resource                                 | Description                    |
| ---------------------------------------- | ------------------------------ |
| [AAI Protocol Overview](../../README.md) | What is AAI and why it matters |
| [Protocol Specification](../README.md)   | Full spec index                |
| [aai.json Descriptor](../aai-json.md)    | Descriptor format              |
| [Security Model](../security.md)         | Authorization details          |

## IPC Protocol

| Aspect    | Value                                       |
| --------- | ------------------------------------------- |
| Mechanism | COM Automation + PowerShell                 |
| Execution | PowerShell script with JSON in/out          |
| Request   | JSON string passed to PowerShell            |
| Response  | JSON string written to stdout by PowerShell |
| Security  | Windows UAC and app-specific permissions    |

## Implementation Steps

> **Note**: Code snippets below are simplified examples. Adapt them to your app's architecture.

### 1. Implement COM Interface

Your app must expose a COM interface that accepts JSON commands:

```csharp
using System.Runtime.InteropServices;
using System.Runtime.Versioning;

[ComVisible(true)]
[Guid("YOUR-GUID-HERE")]
[InterfaceType(ComInterfaceType.InterfaceIsIDispatch)]
public interface IAAIHandler
{
    string Execute(string jsonRequest);
}

[ComVisible(true)]
[Guid("ANOTHER-GUID-HERE")]
[ClassInterface(ClassInterfaceType.None)]
public class AAIHandler : IAAIHandler
{
    public string Execute(string jsonRequest)
    {
        try
        {
            var request = JsonSerializer.Deserialize<AAIRequest>(jsonRequest);
            var result = ProcessTool(request.Tool, request.Params);
            return JsonSerializer.Serialize(new AAIResponse
            {
                Version = "1.0",
                RequestId = request.RequestId,
                Status = "success",
                Result = result
            });
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new AAIResponse
            {
                Version = "1.0",
                RequestId = "",
                Status = "error",
                Error = new AAIError
                {
                    Code = "INTERNAL_ERROR",
                    Message = ex.Message
                }
            });
        }
    }

    private object ProcessTool(string tool, Dictionary<string, object> args)
    {
        // Route to appropriate tool implementation
        return new { success = true };
    }
}
```

### 2. Register COM Component

```csharp
// In your installer or at app startup
[ComRegisterFunction]
public static void RegisterClass(string key)
{
    // Register the COM component
    // This is typically done by the installer
}
```

### 3. PowerShell Execution

The Gateway uses PowerShell to invoke your app's COM interface:

```powershell
# Example: Gateway's PowerShell command
$app = New-Object -ComObject "YourApp.AAIHandler"
$result = $app.Execute($args[0])
Write-Output $result
```

### 4. Message Protocol

#### Request Format

```json
{
  "version": "1.0",
  "tool": "createDocument",
  "params": { "name": "report.docx", "folder": "C:\\Documents" },
  "request_id": "req_123"
}
```

#### Success Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "success",
  "result": { "document_id": "doc_456" }
}
```

#### Error Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "error",
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The specified folder does not exist"
  }
}
```

### 5. Create aai.json

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "windows",
  "app": {
    "id": "com.yourcompany.yourapp",
    "name": {
      "en": "Your App",
      "zh-CN": "你的应用"
    },
    "defaultLang": "en",
    "description": "Brief description of your app"
  },
  "execution": { "type": "ipc" },
  "tools": [
    {
      "name": "createDocument",
      "description": "Create a new document",
      "parameters": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "description": "Document name" },
          "folder": { "type": "string", "description": "Target folder path" }
        },
        "required": ["name"]
      }
    }
  ]
}
```

### 6. Place Descriptor

Add `aai.json` to one of these locations:

| Location                           | Purpose                 |
| ---------------------------------- | ----------------------- |
| `%PROGRAMDATA%\\YourApp\\aai.json` | System-wide (all users) |
| `%APPDATA%\\YourApp\\aai.json`     | User-specific           |

**Installation**: The descriptor is installed with your app via Windows Installer (MSI) or other installation method.

## Authorization

Windows uses **UAC (User Account Control)** for sensitive operations. Additionally:

- **COM Security**: Apps can implement their own permission checks
- **AppLocker**: Windows 10+ AppLocker can restrict app execution
- **Credential Guard**: Windows Defender can monitor suspicious behavior

For standard operations, no additional authorization is needed.

## Testing

### Test via PowerShell

```powershell
# Test your COM interface directly
$handler = New-Object -ComObject "YourApp.AAIHandler"
$request = @{
    version = "1.0"
    tool = "createDocument"
    params = @{
        name = "test.txt"
        folder = "C:\Temp"
    }
    request_id = "test_1"
} | ConvertTo-Json -Compress
$result = $handler.Execute($request)
Write-Host $result
```

### Verify COM Registration

```powershell
# Check that COM object is registered
Get-ItemProperty -Path "Registry::CLSID\*" | Where-Object { $_.PSPath -like "*YourApp*" }
```

### Verify Descriptor Location

```powershell
# Check that aai.json is in the expected location
Get-Content "$env:APPDATA\YourApp\aai.json" | ConvertFrom-Json
```

## Discovery Paths

The Gateway scans these paths for `aai.json` files:

| Path                         | Description        |
| ---------------------------- | ------------------ |
| `%PROGRAMDATA%\\aai\\*.json` | System-wide apps   |
| `%APPDATA%\\aai\\*.json`     | User-specific apps |

## Distribution

### Windows Installer (MSI)

```xml
<!-- In your .wxs file -->
<Directory Id="AppDataFolder" Name="AppData">
    <Component Id="AaiJsonComponent" Guid="*">
        <File Id="aai.json" Source="aai.json" KeyFile="yes"
    </Component>
</Directory>
```

### ClickOnce

```
<file name="aai.json" target="AppData">
  <copyFile source="aai.json" target="AppData\YourApp\aai.json" />
</file>
```

## Checklist

- [ ] COM interface implemented with `Execute` method
- [ ] COM component registered with unique GUID
- [ ] JSON request parsing handles malformed input
- [ ] Tool routing works for all defined tools
- [ ] Error responses use standard error codes
- [ ] `aai.json` included in installer
- [ ] `aai.json` `version` follows semver
- [ ] COM registration tested on clean machine

---

[Back to Spec Index](../README.md) | [macOS Platform](./macos.md) | [Linux Platform](./linux.md)
