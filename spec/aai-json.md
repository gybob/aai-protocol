# aai.json Descriptor

## Overview

`aai.json` defines application capabilities using [JSON Schema](https://json-schema.org/). Each file describes a single platform deployment.

## Structure

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "macos",
  "app": {
    "id": "com.example.app",
    "name": {
      "en": "Example App",
      "zh-CN": "示例应用"
    },
    "defaultLang": "en",
    "description": "Brief description"
  },
  "execution": {
    "type": "apple-events"
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

| Field           | Type   | Required | Description                      |
| --------------- | ------ | -------- | -------------------------------- |
| `schemaVersion` | string | Yes      | AAI spec version (`"1.0"`)       |
| `version`       | string | Yes      | Descriptor version (semver)      |
| `platform`      | string | Yes      | Target platform                  |
| `app`           | object | Yes      | Application metadata             |
| `execution`     | object | No       | Execution configuration          |
| `auth`          | object | No       | Authentication config (web only) |
| `tools`         | array  | Yes      | Tool definitions                 |

### Platform Values

| Platform  | Typical Execution Type | Authorization    |
| --------- | ---------------------- | ---------------- |
| `macos`   | `apple-events`         | Operating System |
| `linux`   | `dbus`                 | Operating System |
| `windows` | `com`                  | Operating System |
| `web`     | `http`                 | Auth config      |

### app Fields

| Field         | Type     | Required | Description                                                                          |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `id`          | string   | Yes      | Reverse-DNS identifier                                                               |
| `name`        | object   | Yes      | Internationalized name object. See [Internationalized Name](#internationalized-name) |
| `defaultLang` | string   | Yes      | Default language tag (must exist in `name`)                                          |
| `description` | string   | Yes      | Brief description in English (for agent consumption)                                 |
| `aliases`     | string[] | No       | Alternative names for app discovery                                                  |

#### Internationalized Name

The `name` field uses a structured object with [BCP 47](https://tools.ietf.org/html/bcp47) language tags:

```json
{
  "name": {
    "en": "Reminders",
    "zh-CN": "提醒事项",
    "zh-TW": "提醒事項",
    "ja": "リマインダー"
  },
  "defaultLang": "en"
}
```

**Language Tags** (lowercase language, uppercase region):

- `en` - English
- `zh-CN` - Simplified Chinese (China)
- `zh-TW` - Traditional Chinese (Taiwan)
- `zh-HK` - Traditional Chinese (Hong Kong)
- `ja` - Japanese
- `ko` - Korean
- `de` - German
- `fr` - French
- `es` - Spanish

**Fallback Logic**:

1. Exact match: `name[locale]`
2. Language family: `zh-TW` → `zh-CN`
3. Default: `name[defaultLang]`

#### Aliases

The `aliases` array provides additional keywords for fuzzy matching:

```json
{
  "aliases": ["reminder", "todo", "待办", "tasks", "task manager"]
}
```

### execution Fields

| Field            | Type   | Required           | Description                                |
| ---------------- | ------ | ------------------ | ------------------------------------------ |
| `type`           | string | Yes                | `http`, `stdio`, `acp`, `apple-events`, `dbus`, or `com` |
| `baseUrl`        | string | http only          | Base URL                                   |
| `defaultHeaders` | object | No                 | Headers for all requests                   |
| `command`        | string | stdio only         | Command to start local adapter             |
| `args`           | array  | No                 | Process args for stdio                     |
| `env`            | object | No                 | Environment variables for stdio/acp        |
| `timeout`        | number | No                 | Optional execution timeout in milliseconds |
| `start`          | object | acp only           | ACP process start config                   |
| `bundleId`       | string | apple-events only  | Target app bundle identifier               |
| `eventClass`     | string | apple-events only  | Four-character Apple Event class           |
| `eventId`        | string | apple-events only  | Four-character Apple Event ID              |
| `service`        | string | dbus only          | DBus service name                          |
| `objectPath`     | string | dbus only          | DBus object path                           |
| `interface`      | string | dbus only          | DBus interface name                        |
| `bus`            | string | dbus only          | `session` or `system`                      |
| `progId`         | string | com only           | COM ProgID                                 |

### execution Examples

#### HTTP

```json
{
  "execution": {
    "type": "http",
    "baseUrl": "https://api.example.com/v1",
    "defaultHeaders": { "Content-Type": "application/json" }
  }
}
```

#### Stdio

```json
{
  "execution": {
    "type": "stdio",
    "command": "aai-anything-example",
    "args": ["--exec"],
    "timeout": 120000
  }
}
```

### execution.start Fields (acp only)

| Field     | Type                | Required | Description                |
| --------- | ------------------- | -------- | -------------------------- |
| `command` | string              | Yes      | CLI command to start agent |
| `args`    | string[]            | No       | Command-line arguments     |
| `env`     | object (string map) | No       | Environment variables      |

```json
{
  "execution": {
    "type": "acp",
    "start": {
      "command": "opencode",
      "args": ["--mcp"],
      "env": {}
    }
  }
}
```

#### Apple Events

```json
{
  "execution": {
    "type": "apple-events",
    "bundleId": "com.example.reminders",
    "eventClass": "AAI ",
    "eventId": "call"
  }
}
```

#### DBus

```json
{
  "execution": {
    "type": "dbus",
    "service": "com.example.files",
    "objectPath": "/com/example/files/Executor",
    "interface": "com.example.files.Executor",
    "bus": "session"
  }
}
```

#### COM

```json
{
  "execution": {
    "type": "com",
    "progId": "Example.Application"
  }
}
```

### tools[] Fields

| Field         | Type   | Required | Description                  |
| ------------- | ------ | -------- | ---------------------------- |
| `name`        | string | Yes      | Tool identifier (camelCase)  |
| `description` | string | Yes      | What the tool does           |
| `parameters`  | object | Yes      | JSON Schema for parameters   |
| `returns`     | object | No       | JSON Schema for return value |
| `execution`   | object | web only | Tool-specific HTTP config    |

### tools[].execution Fields (web only)

| Field     | Type   | Description        |
| --------- | ------ | ------------------ |
| `path`    | string | URL path           |
| `method`  | string | HTTP method        |
| `headers` | object | Additional headers |

## Authentication (web only)

### Auth Types

| Type            | Use Case           | Description                                 |
| --------------- | ------------------ | ------------------------------------------- |
| `oauth2`        | User authorization | OAuth 2.0 with PKCE                         |
| `apiKey`        | Static API token   | Never expires (e.g., Notion, Yuque)         |
| `appCredential` | Enterprise apps    | App ID + Secret to get token (e.g., Feishu) |
| `cookie`        | No official API    | Browser session cookies (e.g., Xiaohongshu) |

### oauth2 Fields

| Field                   | Type     | Required | Description         |
| ----------------------- | -------- | -------- | ------------------- |
| `type`                  | string   | Yes      | `"oauth2"`          |
| `authorizationEndpoint` | string   | Yes      | OAuth authorize URL |
| `tokenEndpoint`         | string   | Yes      | Token exchange URL  |
| `scopes`                | string[] | Yes      | Required scopes     |
| `pkce`                  | object   | No       | PKCE config         |
| `pkce.method`           | string   | Yes      | `"S256"`            |

```json
{
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorizationEndpoint": "https://example.com/oauth/authorize",
      "tokenEndpoint": "https://example.com/oauth/token",
      "scopes": ["read", "write"],
      "pkce": { "method": "S256" }
    }
  }
}
```

### apiKey Fields

| Field          | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `type`         | string | Yes      | `"apiKey"`                      |
| `location`     | string | Yes      | `"header"` or `"query"`         |
| `name`         | string | Yes      | Header/param name               |
| `prefix`       | string | No       | Value prefix (e.g., `"Bearer"`) |
| `obtainUrl`    | string | Yes      | URL to get API key              |
| `instructions` | string | No       | User guidance returned to the agent when the user requests help |

```json
{
  "auth": {
    "type": "apiKey",
    "apiKey": {
      "location": "header",
      "name": "X-Auth-Token",
      "obtainUrl": "https://example.com/settings/tokens",
      "instructions": "Open settings, create a token, copy it, and paste it into the gateway prompt."
    }
  }
}
```

### appCredential Fields

| Field           | Type   | Required | Description                                                    |
| --------------- | ------ | -------- | -------------------------------------------------------------- |
| `type`          | string | Yes      | `"appCredential"`                                              |
| `tokenEndpoint` | string | Yes      | URL to exchange credentials for token                          |
| `tokenType`     | string | Yes      | `"tenantAccessToken"`, `"appAccessToken"`, `"userAccessToken"` |
| `expiresIn`     | number | No       | Token lifetime in seconds (default: 7200)                      |
| `instructions`  | string | No       | User guidance returned to the agent when the user requests help |

```json
{
  "auth": {
    "type": "appCredential",
    "appCredential": {
      "tokenEndpoint": "https://api.example.com/auth/token",
      "tokenType": "tenantAccessToken",
      "expiresIn": 7200,
      "instructions": "Open the developer console, find the App ID and App Secret, then paste them into the gateway prompt."
    }
  }
}
```

### cookie Fields

| Field             | Type     | Required | Description             |
| ----------------- | -------- | -------- | ----------------------- |
| `type`            | string   | Yes      | `"cookie"`              |
| `loginUrl`        | string   | Yes      | URL to login            |
| `requiredCookies` | string[] | Yes      | Cookie names to extract |
| `domain`          | string   | Yes      | Cookie domain           |
| `instructions`    | string   | No       | User guidance           |

```json
{
  "auth": {
    "type": "cookie",
    "cookie": {
      "loginUrl": "https://example.com/login",
      "requiredCookies": ["session", "authToken"],
      "domain": ".example.com",
      "instructions": "Login in browser, then extract cookies from DevTools"
    }
  }
}
```

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
      "limit": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 10
      }
    },
    "required": ["query"]
  }
}
```

## Version Specification

The `version` field follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Change Type            | Version Bump | Examples          |
| ---------------------- | ------------ | ----------------- |
| Add new tool           | MINOR        | `1.0.0` → `1.1.0` |
| Add optional parameter | MINOR        | `1.0.0` → `1.1.0` |
| Add tool description   | PATCH        | `1.0.0` → `1.0.1` |
| Remove tool            | MAJOR        | `1.0.0` → `2.0.0` |
| Add required parameter | MAJOR        | `1.0.0` → `2.0.0` |
| Rename tool            | MAJOR        | `1.0.0` → `2.0.0` |
| Change parameter type  | MAJOR        | `1.0.0` → `2.0.0` |

**Rule of thumb**: If existing Agents might break, bump MAJOR. Otherwise, MINOR for new features, PATCH for fixes.

## Examples

### Desktop (macOS)

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "macos",
  "app": {
    "id": "com.example.reminders",
    "name": {
      "en": "Reminders",
      "zh-CN": "提醒事项",
      "zh-TW": "提醒事項",
      "de": "Erinnerungen",
      "fr": "Rappels"
    },
    "defaultLang": "en",
    "description": "Task and reminder management",
    "aliases": ["reminder", "todo", "待办", "tasks"]
  },
  "execution": { "type": "apple-events" },
  "tools": [ ... ]
}
```

### Web with OAuth2

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "web",
  "app": {
    "id": "com.example.api",
    "name": {
      "en": "Example API",
      "zh-CN": "示例API"
    },
    "defaultLang": "en",
    "description": "REST API service",
    "aliases": ["api", "rest"]
  },
  "execution": {
    "type": "http",
    "baseUrl": "https://api.example.com/v1",
    "defaultHeaders": { "Content-Type": "application/json" }
  },
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorizationEndpoint": "https://example.com/oauth/authorize",
      "tokenEndpoint": "https://example.com/oauth/token",
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

### Web with API Key

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "web",
  "app": {
    "id": "com.yuque.api",
    "name": {
      "en": "Yuque",
      "zh-CN": "语雀"
    },
    "defaultLang": "en",
    "description": "Knowledge management platform",
    "aliases": ["语雀", "yuque", "knowledge", "doc"]
  },
  "execution": {
    "type": "http",
    "baseUrl": "https://www.yuque.com/api/v2",
    "defaultHeaders": { "Content-Type": "application/json" }
  },
  "auth": {
    "type": "apiKey",
    "apiKey": {
      "location": "header",
      "name": "X-Auth-Token",
      "obtainUrl": "https://www.yuque.com/settings/tokens",
      "instructions": "Open Settings > Tokens, create a token, copy it immediately, and paste it into the gateway prompt."
    }
  },
  "tools": [ ... ]
}
```

### Web with App Credential

```json
{
  "schemaVersion": "1.0",
  "version": "1.0.0",
  "platform": "web",
  "app": {
    "id": "com.feishu.api",
    "name": {
      "en": "Feishu",
      "zh-CN": "飞书"
    },
    "defaultLang": "en",
    "description": "Enterprise collaboration platform",
    "aliases": ["飞书", "feishu", "lark"]
  },
  "execution": {
    "type": "http",
    "baseUrl": "https://open.feishu.cn/open-apis",
    "defaultHeaders": { "Content-Type": "application/json" }
  },
  "auth": {
    "type": "appCredential",
    "appCredential": {
      "tokenEndpoint": "https://open.feishu.cn/open-apis/auth/v3/tenantAccessToken/internal",
      "tokenType": "tenantAccessToken",
      "expiresIn": 7200,
      "instructions": "Open Feishu Open Platform, copy the App ID and App Secret from your app settings, then paste them into the gateway prompt."
    }
  },
  "tools": [ ... ]
}
```

---

[Back to Spec Index](./README.md)
