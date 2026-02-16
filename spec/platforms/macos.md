# Desktop App

## Overview

Desktop apps communicate via JSON-based protocol over native IPC.

## Descriptor

```json
{
  "schema_version": "1.0",
  "platform": "desktop",
  "app": {
    "id": "com.example.mail",
    "name": "Mail",
    "description": "Email client"
  },
  "execution": { "type": "ipc" },
  "tools": [ ... ]
}
```

## Message Protocol

### Request

```json
{
  "version": "1.0",
  "tool": "send_email",
  "params": { "to": ["alice@example.com"], "body": "Hello!" },
  "request_id": "req_123"
}
```

### Response

```json
{
  "version": "1.0",
  "request_id": "req_123",
  "status": "success",
  "result": { "message_id": "msg_456" }
}
```

### Error

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

## Implementation Guide

### App Side

Register IPC handler to receive JSON requests, execute tools, return JSON responses.

### Descriptor Location

```
~/.aai/<app_id>/aai.json
```

---

[Back to Spec Index](../README.md) | [Web Platform](./web.md)
