# Windows: COM Automation

## Automation Mechanism

**COM (Component Object Model)** is Windows's binary interface standard, supported by almost all Windows applications and the Office suite.

**IPC Method: COM IPC**

- COM uses the IDispatch interface for cross-process calls
- This is Windows's native IPC mechanism with excellent performance

## Examples

### PowerShell

```powershell
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "alice@example.com"
$mail.Subject = "Hello"
$mail.Body = "Hi Alice..."
$mail.Send()
```

### Python (pywin32)

```python
import win32com.client

outlook = win32com.client.Dispatch("Outlook.Application")
mail = outlook.CreateItem(0)
mail.To = "alice@example.com"
mail.Subject = "Hello"
mail.Body = "Hi Alice..."
mail.Send()
```

## Integration Guide

### Existing automation support

If the application already supports COM, **zero code** is needed to integrate with AAI:

1. Confirm the application's ProgID (e.g., `MyApp.Application`)
2. Write `aai.json` configuration file
3. Place in `%USERPROFILE%\.aai\<appId>\aai.json`
4. Done!

### No automation support

If the application has no automation support, you need to:

1. Implement COM IDispatch interface (C#/C++)
2. Register ProgID
3. Write `aai.json` configuration file

## aai.json Fields

| Field                                         | Type    | Description                                                                                                                          |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `platforms.windows.automation`                | string  | Automation type: `com`                                                                                                               |
| `platforms.windows.progid`                    | string  | COM ProgID (e.g., `Outlook.Application`)                                                                                             |
| `platforms.windows.tools[].script`            | array   | COM operation sequence                                                                                                               |
| `platforms.windows.tools[].script[].action`   | string  | Operation type: `create` (create object), `call` (call method), `set` (set property), `get` (get property), `return` (return result) |
| `platforms.windows.tools[].script[].var`      | string  | Variable name (for storing return values)                                                                                            |
| `platforms.windows.tools[].script[].object`   | string  | Object reference (e.g., `mail`, `app`)                                                                                               |
| `platforms.windows.tools[].script[].progid`   | string  | ProgID (only used in `create` operations)                                                                                            |
| `platforms.windows.tools[].script[].method`   | string  | Method name (only used in `call` operations)                                                                                         |
| `platforms.windows.tools[].script[].property` | string  | Property name (only used in `set`/`get` operations)                                                                                  |
| `platforms.windows.tools[].script[].value`    | string  | Property value (supports `${param}` placeholders)                                                                                    |
| `platforms.windows.tools[].script[].args`     | array   | Method arguments (supports `${param}` placeholders)                                                                                  |
| `platforms.windows.tools[].output_parser`     | string  | Output parsing method: `last_result` (return value of last operation)                                                                |
| `platforms.windows.tools[].timeout`           | integer | Timeout in seconds, default 30                                                                                                       |

---

[Back to Spec Index](../README.md) | [Back to Platforms](./linux.md)
