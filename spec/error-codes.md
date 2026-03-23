# Error Codes

**Spec version:** 0.3.0

All AAI errors follow this structure:

```typescript
interface AaiError {
  code: string;      // Machine-readable error code
  message: string;   // Human-readable description
  details?: unknown; // Additional context (optional)
}
```

---

## Error Code Registry

### Discovery Errors (`1xxx`)

| Code | HTTP Status | Description |
|---|---|---|
| `E_APP_NOT_FOUND` | 404 | App `localId` not found in registry. |
| `E_INVALID_APP_ID` | 400 | App `localId` format is invalid. |
| `E_MANIFEST_INVALID` | 422 | `aai.json` is malformed or missing required fields. |
| `E_MANIFEST_FETCH_FAILED` | 502 | Failed to fetch `aai.json` from remote URL. |

### Access Errors (`2xxx`)

| Code | HTTP Status | Description |
|---|---|---|
| `E_PROTOCOL_UNSUPPORTED` | 400 | Unknown `protocol` in `access.config`. |
| `E_COMMAND_NOT_FOUND` | 404 | CLI command or MCP server not found. |
| `E_CONNECTION_FAILED` | 502 | Cannot connect to remote MCP endpoint. |
| `E_SUBPROCESS_EXITED` | 500 | Subprocess exited unexpectedly. |

### Consent Errors (`3xxx`) — Planned

> **Note:** Consent errors are planned for a future spec version when consent enforcement is implemented.

| Code | HTTP Status | Description |
|---|---|---|
| `E_CONSENT_REQUIRED` | 403 | Operation requires user consent. |
| `E_CONSENT_DENIED` | 403 | User denied consent for this capability. |
| `E_CAPABILITY_NOT_FOUND` | 404 | Unknown `capabilityId` in consent config. |

### Execution Errors (`4xxx`)

| Code | HTTP Status | Description |
|---|---|---|
| `E_OPERATION_NOT_FOUND` | 404 | Operation name not found in app guide. |
| `E_INVALID_ARGS` | 400 | Arguments fail schema validation. |
| `E_EXECUTION_FAILED` | 500 | Downstream tool returned an error. |
| `E_TIMEOUT` | 504 | Operation timed out. |

### Guide Errors (`5xxx`)

| Code | HTTP Status | Description |
|---|---|---|
| `E_GUIDE_GENERATION_FAILED` | 500 | Failed to generate app guide from downstream. |
| `E_GUIDE_NOT_CACHED` | 500 | Guide requested but not yet generated. |

---

## Error Response Examples

### App Not Found

```json
{
  "code": "E_APP_NOT_FOUND",
  "message": "App 'my-app' not found in registry.",
  "details": { "requestedId": "my-app" }
}
```

### Manifest Invalid

```json
{
  "code": "E_MANIFEST_INVALID",
  "message": "Missing required field 'access.protocol'.",
  "details": {
    "missingFields": ["access.protocol"],
    "rawError": "Field 'access.protocol' is required."
  }
}
```

### Consent Required

```json
{
  "code": "E_CONSENT_REQUIRED",
  "message": "Operation 'write' requires user consent.",
  "details": {
    "appId": "filesystem",
    "operation": "write",
    "capabilityId": "fs-write"
  }
}
```

### Operation Not Found

```json
{
  "code": "E_OPERATION_NOT_FOUND",
  "message": "Operation 'delete' not found in app 'filesystem'.",
  "details": {
    "appId": "filesystem",
    "requestedOperation": "delete",
    "availableOperations": ["read", "write", "list"]
  }
}
```

---

## Error Handling Guidelines

1. **Always include `code`** — clients may branch on error codes.
2. **Use `details` for debugging** — never expose sensitive info.
3. **Keep `message` human-readable** — this is for developers and users.
4. **Prefer specific codes over generic ones** — `E_OPERATION_NOT_FOUND` over `E_EXECUTION_FAILED`.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial error code registry. |
| 0.3 | 2026-03-20 | Added guide errors and expanded execution errors. |
