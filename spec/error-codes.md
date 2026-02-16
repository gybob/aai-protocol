# Error Codes

AAI uses structured error responses following JSON-RPC 2.0 conventions.

## Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "CODE_NAME",
    "message": "Human-readable description"
  }
}
```

## Standard Codes

### Protocol Errors (1xx)

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed JSON or invalid structure |
| `UNKNOWN_APP` | App not found |
| `UNKNOWN_TOOL` | Tool not found in descriptor |
| `INVALID_PARAMS` | Parameters don't match schema |

### Authorization Errors (2xx)

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_DENIED` | User denied authorization |
| `AUTH_EXPIRED` | Token expired, refresh failed |
| `AUTH_INVALID` | Invalid credentials or token |

### Execution Errors (3xx)

| Code | Description |
|------|-------------|
| `TIMEOUT` | Operation timed out |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Too many requests |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Internal Errors (5xx)

| Code | Description |
|------|-------------|
| `INTERNAL_ERROR` | Unexpected server error |
| `NOT_IMPLEMENTED` | Feature not implemented |

## HTTP Status Mapping

For HTTP execution, standard HTTP status codes apply:

| HTTP | AAI Code |
|------|----------|
| 400 | `INVALID_REQUEST` |
| 401 | `AUTH_REQUIRED` / `AUTH_EXPIRED` |
| 403 | `AUTH_DENIED` |
| 404 | `UNKNOWN_APP` / `UNKNOWN_TOOL` / `NOT_FOUND` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` |
| 501 | `NOT_IMPLEMENTED` |
| 503 | `SERVICE_UNAVAILABLE` |

---

[Back to Spec Index](./README.md)
