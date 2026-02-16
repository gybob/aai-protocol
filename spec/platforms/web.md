# Web App

## Overview

Web apps expose HTTP APIs. Gateway handles all authentication and token management.

## Descriptor

```json
{
  "schema_version": "1.0",
  "platform": "web",
  "app": {
    "id": "com.example.api",
    "name": "Example API",
    "description": "REST API service"
  },
  "execution": {
    "type": "http",
    "base_url": "https://api.example.com/v1",
    "default_headers": {
      "Content-Type": "application/json"
    }
  },
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorization_endpoint": "https://example.com/oauth/authorize",
      "token_endpoint": "https://example.com/oauth/token",
      "scopes": ["read", "write"],
      "pkce": { "method": "S256" }
    }
  },
  "tools": [
    {
      "name": "search",
      "description": "Search for items",
      "execution": {
        "path": "/search",
        "method": "POST"
      },
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "limit": { "type": "integer", "default": 10 }
        },
        "required": ["query"]
      }
    }
  ]
}
```

## Authentication

See [Security Model](../security.md) for OAuth 2.1 flow details.

## Tool Execution

Gateway maps tool calls to HTTP requests:

| Tool | HTTP Request |
|------|--------------|
| `name` | `base_url` + `execution.path` |
| `method` | `execution.method` |
| `parameters` | Request body (JSON) |
| `auth` | `Authorization: Bearer <token>` |

## Descriptor Discovery

Web apps publish descriptors at:

```
https://api.example.com/.well-known/aai.json
```

Register with AAI Registry for automatic discovery.

---

[Back to Spec Index](../README.md) | [Desktop Platform](./macos.md)
