# aai.json Descriptor

## Overview

`aai.json` defines application capabilities using [JSON Schema](https://json-schema.org/). Each file describes a single platform deployment.

## Structure

```json
{
  "schema_version": "1.0",
  "platform": "web",
  "app": {
    "id": "com.example.app",
    "name": "Example App",
    "description": "Brief description",
    "version": "1.0.0"
  },
  "execution": {
    "type": "http",
    "base_url": "https://api.example.com/v1"
  },
  "tools": [
    {
      "name": "search",
      "description": "Search for items",
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
| `schema_version` | string | Yes | Version (`"1.0"`) |
| `platform` | string | Yes | Target platform: `desktop`, `web` |
| `app` | object | Yes | Application metadata |
| `execution` | object | No | Execution configuration |
| `auth` | object | No | Authentication (see [Security Model](./security.md)) |
| `tools` | array | Yes | Tool definitions |

### app Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Reverse-DNS identifier |
| `name` | string | Yes | Human-readable name |
| `description` | string | Yes | Brief description |
| `version` | string | No | Application version |

### execution Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `ipc` or `http` |
| `base_url` | string | HTTP only | Base URL (http/https determined by URL) |
| `default_headers` | object | No | Headers for all requests |

### tools[] Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tool identifier (snake_case) |
| `description` | string | Yes | What the tool does |
| `parameters` | object | Yes | JSON Schema for parameters |
| `returns` | object | No | JSON Schema for return value |
| `execution` | object | HTTP only | Tool-specific execution |

### tools[].execution Fields (HTTP only)

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | URL path |
| `method` | string | HTTP method |
| `headers` | object | Additional headers |

## Parameter Schema

Tool `parameters` and `returns` follow [JSON Schema Draft-07](https://json-schema.org/draft-07/json-schema-release-notes.html).

```json
{
  "name": "search",
  "description": "Search for items",
  "parameters": {
    "$schema": "https://json-schema.org/draft-07/schema",
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 10 }
    },
    "required": ["query"]
  },
  "returns": {
    "type": "object",
    "properties": {
      "results": { "type": "array" }
    }
  }
}
```

## Platform Types

| Platform | Execution Type | Authorization |
|----------|----------------|---------------|
| `desktop` | `ipc` | Operating System |
| `web` | `http` | Gateway (OAuth 2.1) |

### Desktop Example

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

### Web Example

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
    "default_headers": { "Content-Type": "application/json" }
  },
  "auth": { ... },
  "tools": [
    {
      "name": "search",
      "execution": { "path": "/search", "method": "POST" },
      "parameters": { ... }
    }
  ]
}
```

## Authentication

See [Security Model](./security.md).

---

[Back to Spec Index](./README.md)