# Error Handling

Gateway should return standardized error responses.

## Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32001,
    "message": "Automation failed",
    "data": {
      "type": "EXECUTION_FAILED",
      "detail": "Script execution timed out after 30 seconds"
    }
  }
}
```

## Error Code Definitions

| Error Code | Type                     | Description                                           |
| ---------- | ------------------------ | ----------------------------------------------------- |
| -32001     | AUTOMATION_FAILED        | Automation script execution failed                    |
| -32002     | APP_NOT_FOUND            | Target application not installed or cannot be found   |
| -32003     | TOOL_NOT_FOUND           | Requested tool does not exist in aai.json             |
| -32004     | PERMISSION_DENIED        | Insufficient permissions, requires user authorization |
| -32005     | INVALID_PARAMS           | Parameter validation failed                           |
| -32006     | AUTOMATION_NOT_SUPPORTED | Platform does not support specified automation type   |
| -32007     | AAI_JSON_INVALID         | aai.json format error or does not match schema        |
| -32008     | TIMEOUT                  | Operation timed out                                   |
| -32009     | APP_NOT_RUNNING          | Application not running and cannot be started         |
| -32010     | SCRIPT_PARSE_ERROR       | Script parsing error                                  |
| -32011     | AUTH_REQUIRED            | OAuth authorization required, user must authorize via browser |
| -32012     | AUTH_EXPIRED             | OAuth token expired and refresh failed                |
| -32013     | API_REQUEST_FAILED       | REST API request failed (HTTP 4xx/5xx)                |
| -32014     | AUTH_CONFIG_INVALID      | Auth configuration invalid (missing env_var, bad OAuth config) |

---

[Back to Spec Index](./README.md)
