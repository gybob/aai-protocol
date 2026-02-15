# aai.json Descriptor

## Overview

`aai.json` is a **platform-agnostic descriptor** that defines application capabilities using JSON Schema. It follows the same patterns as agent tool schemas, making it natural for LLMs to understand and use.

## Design Philosophy

1. **Abstract**: No platform-specific terminology
2. **Schema-based**: Tool parameters use JSON Schema
3. **Agent-friendly**: Mirrors MCP tool definition patterns
4. **Extensible**: Supports custom metadata

## Structure

```json
{
  "schema_version": "1.0",
  "app": {
    "id": "com.example.app",
    "name": "Example App",
    "description": "Brief description of the application",
    "version": "1.0.0"
  },
  "execution": {
    "type": "http",
    "base_url": "https://api.example.com/v1"
  },
  "auth": { ... },
  "tools": [
    {
      "name": "tool_name",
      "description": "What this tool does",
      "execution": {
        "path": "/resource",
        "method": "POST"
      },
      "parameters": {
        "type": "object",
        "properties": { ... },
        "required": [ ... ]
      }
    }
  ]
}
```

## Field Reference

### Root Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | Yes | Descriptor version (`"1.0"`) |
| `app` | object | Yes | Application metadata |
| `execution` | object | No | Execution configuration |
| `auth` | object | No | Authentication configuration |
| `tools` | array | Yes | List of tool definitions |

### app Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (reverse-DNS format) |
| `name` | string | Yes | Human-readable name |
| `description` | string | Yes | Brief description |
| `version` | string | No | Application version |

### execution Fields (Root Level)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Execution type: `ipc` or `http` |
| `base_url` | string | Conditional | Base URL for HTTP execution |
| `default_headers` | object | No | Headers for all requests |

### tools[] Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tool identifier (snake_case) |
| `description` | string | Yes | What the tool does |
| `execution` | object | No | Tool-specific execution config |
| `parameters` | object | Yes | JSON Schema for parameters |
| `returns` | object | No | JSON Schema for return value |

### tools[].execution Fields

| Field | Type | Applicable To | Description |
|-------|------|---------------|-------------|
| `path` | string | HTTP | URL path (appended to base_url) |
| `method` | string | HTTP | HTTP method: `GET`, `POST`, `PUT`, `DELETE` |
| `headers` | object | HTTP | Additional headers for this tool |
| `body_template` | object | HTTP | Request body template |

## Execution Types

### IPC (Inter-Process Communication)

For desktop applications using native IPC:

```json
{
  "execution": {
    "type": "ipc"
  }
}
```

No additional configuration needed. The Gateway routes calls through the native IPC mechanism.

### HTTP

For web services:

```json
{
  "execution": {
    "type": "http",
    "base_url": "https://api.example.com/v1",
    "default_headers": {
      "Content-Type": "application/json"
    }
  },
  "tools": [
    {
      "name": "search",
      "execution": {
        "path": "/search",
        "method": "POST",
        "body_template": {
          "query": "${query}",
          "limit": "${limit}"
        }
      },
      "parameters": { ... }
    }
  ]
}
```

## Authentication

### OAuth 2.1

```json
{
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorization_endpoint": "https://example.com/oauth/authorize",
      "token_endpoint": "https://example.com/oauth/token",
      "scopes": ["read", "write"],
      "pkce": {
        "method": "S256"
      }
    }
  }
}
```

### API Key

```json
{
  "auth": {
    "type": "api_key",
    "api_key": {
      "placement": "header",
      "name": "X-API-Key",
      "env_var": "AAI_EXAMPLE_KEY"
    }
  }
}
```

## Tool Schema

Tool parameters follow JSON Schema Draft-07:

```json
{
  "name": "send_message",
  "description": "Send a message to a recipient",
  "parameters": {
    "type": "object",
    "properties": {
      "to": {
        "type": "string",
        "description": "Recipient address",
        "format": "email"
      },
      "subject": {
        "type": "string",
        "description": "Message subject"
      },
      "body": {
        "type": "string",
        "description": "Message content"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high"],
        "default": "normal"
      }
    },
    "required": ["to", "body"]
  },
  "returns": {
    "type": "object",
    "properties": {
      "message_id": { "type": "string" },
      "status": { "type": "string" }
    }
  }
}
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| App ID | reverse-DNS | `com.example.app` |
| Tool name | snake_case | `send_email`, `search_pages` |
| Parameters | snake_case | `page_size`, `include_archived` |

## Platform Binding

The descriptor uses abstract execution types. Platform-specific details are handled by:

1. **Gateway**: Maps abstract tool calls to platform execution
2. **App**: Implements the protocol for its platform

This separation allows the same descriptor structure to work across different deployment scenarios.

---

[Back to Spec Index](./README.md)