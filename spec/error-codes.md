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

---

[Back to Spec Index](./README.md)
