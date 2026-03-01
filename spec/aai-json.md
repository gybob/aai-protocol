# aai.json Descriptor

## Overview

`aai.json` defines application capabilities using [JSON Schema](https://json-schema.org/). Each file describes a single platform deployment.

## Structure

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "platform": "macos",
  "app": {
    "id": "com.example.app",
    "name": "Example App",
    "description": "Brief description"
  },
  "execution": {
    "type": "ipc"
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
| `schema_version` | string | Yes | AAI spec version (`"1.0"`) |
| `version` | string | Yes | Descriptor version (semver) |
| `platform` | string | Yes | Target platform |
| `app` | object | Yes | Application metadata |
| `execution` | object | No | Execution configuration |
| `auth` | object | No | OAuth 2.1 config (web only) |
| `tools` | array | Yes | Tool definitions |

### Platform Values

| Platform | Execution Type | Authorization |
|----------|----------------|---------------|
| `macos` | `ipc` | Operating System |
| `linux` | `ipc` | Operating System |
| `windows` | `ipc` | Operating System |
| `web` | `http` | OAuth 2.1 |

### app Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Reverse-DNS identifier |
| `name` | string | Yes | Human-readable name. Multi-language names separated by `\|` (e.g., `"Reminders\|提醒事项\|Rappels"`) |
| `description` | string | Yes | Brief description in English (for agent consumption) |
| `aliases` | string[] | No | Alternative names for app discovery (e.g., `["reminder", "todo", "待办"]`) |

#### Multi-language Name Format

The `name` field supports multiple languages using the pipe (`|`) character as separator:

```json
{
  "name": "Reminders|提醒事项|Rappels|Erinnerungen"
}
```

- The first name is the primary (typically English) name
- Subsequent names are localized versions
- This allows agents to match user intent across languages

#### Aliases

The `aliases` array provides additional keywords for fuzzy matching:

```json
{
  "aliases": ["reminder", "todo", "待办", "tasks", "task manager"]
}
```
### execution Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `ipc` or `http` |
| `base_url` | string | web only | Base URL |
| `default_headers` | object | No | Headers for all requests |

### tools[] Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tool identifier (snake_case) |
| `description` | string | Yes | What the tool does |
| `parameters` | object | Yes | JSON Schema for parameters |
| `returns` | object | No | JSON Schema for return value |
| `execution` | object | web only | Tool-specific HTTP config |

### tools[].execution Fields (web only)

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
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query" },
      "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 10 }
    },
    "required": ["query"]
  }
}
```

## Version Specification

The `version` field follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Change Type | Version Bump | Examples |
|-------------|--------------|----------|
| Add new tool | MINOR | `1.0.0` → `1.1.0` |
| Add optional parameter | MINOR | `1.0.0` → `1.1.0` |
| Add tool description | PATCH | `1.0.0` → `1.0.1` |
| Remove tool | MAJOR | `1.0.0` → `2.0.0` |
| Add required parameter | MAJOR | `1.0.0` → `2.0.0` |
| Rename tool | MAJOR | `1.0.0` → `2.0.0` |
| Change parameter type | MAJOR | `1.0.0` → `2.0.0` |

**Rule of thumb**: If existing Agents might break, bump MAJOR. Otherwise, MINOR for new features, PATCH for fixes.

### Desktop (macOS)

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "platform": "macos",
  "app": {
    "id": "com.example.reminders",
    "name": "Reminders|提醒事项|Rappels|Erinnerungen",
    "description": "Task and reminder management",
    "aliases": ["reminder", "todo", "待办", "tasks"]
  },
  "execution": { "type": "ipc" },
  "tools": [ ... ]
}
```

### Web

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "platform": "web",
  "app": {
    "id": "com.example.api",
    "name": "Example API|示例API",
    "description": "REST API service",
    "aliases": ["api", "rest"]
  },
  "execution": {
    "type": "http",
    "base_url": "https://api.example.com/v1",
    "default_headers": { "Content-Type": "application/json" }
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
      "execution": { "path": "/search", "method": "POST" },
      "parameters": { ... }
    }
  ]
}
```

## Authentication (web only)

See [Security Model](./security.md) for OAuth 2.1 configuration.

---

[Back to Spec Index](./README.md)