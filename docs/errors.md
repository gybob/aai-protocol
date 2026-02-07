# Error Codes

AAI Gateway uses standardized error codes to communicate issues.

| Code   | Type                     | Description                                                   |
| ------ | ------------------------ | ------------------------------------------------------------- |
| -32001 | AUTOMATION_FAILED        | Automation script execution failed (e.g., AppleScript error). |
| -32002 | APP_NOT_FOUND            | Target application not installed or configured.               |
| -32003 | TOOL_NOT_FOUND           | Requested tool does not exist in `aai.json`.                  |
| -32004 | PERMISSION_DENIED        | Insufficient permissions (e.g., TCC denied).                  |
| -32005 | INVALID_PARAMS           | Parameter validation failed against schema.                   |
| -32006 | AUTOMATION_NOT_SUPPORTED | Platform does not support specified automation type.          |
| -32007 | AAI_JSON_INVALID         | `aai.json` format error.                                      |
| -32008 | TIMEOUT                  | Operation timed out.                                          |
| -32009 | APP_NOT_RUNNING          | Application not running and cannot be started.                |
| -32010 | SCRIPT_PARSE_ERROR       | Script parsing/template replacement error.                    |

## Troubleshooting

### PERMISSION_DENIED (-32004)

On macOS, this usually means the user denied the TCC prompt.
**Fix**: Go to System Settings > Privacy & Security > Automation, and allow your terminal/editor to control the target app.

### TIMEOUT (-32008)

The operation took longer than the configured timeout (default 30s).
**Fix**: Check if the application is hung or waiting for user input (e.g., a dialog). You can increase `defaultTimeout` in `~/.aai/config.json`.
