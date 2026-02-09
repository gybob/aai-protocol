# Web / SaaS Applications (REST API)

AAI supports web-based and SaaS applications through REST API calls with OAuth 2.0 / API Key authentication. This makes thousands of cloud services (Notion, Slack, GitHub, Jira, Stripe, etc.) accessible to Agents.

## Why Web/SaaS Support Matters

Desktop apps are only part of the picture. Modern productivity relies heavily on SaaS services, and most of them already have REST APIs. AAI bridges the gap:

| SaaS App | Has REST API | LLM Knows It | With AAI |
|----------|-------------|-------------|----------|
| Notion   | Yes         | Partially   | Full structured access |
| Slack    | Yes         | Partially   | Full structured access |
| Your SaaS| Yes         | No          | Fully discoverable |

## Automation Mechanism

- **Protocol**: HTTPS REST API calls
- **Authentication**: OAuth 2.0 (Authorization Code / Client Credentials) or API Key
- **Data Format**: JSON request/response
- **Token Management**: Gateway handles token storage, refresh, and injection

## Authentication Types

### OAuth 2.0

For SaaS apps that require user authorization (Notion, Slack, Google, etc.):

```json
{
  "auth": {
    "type": "oauth2",
    "auth_url": "https://api.notion.com/v1/oauth/authorize",
    "token_url": "https://api.notion.com/v1/oauth/token",
    "scopes": ["read_content", "update_content"],
    "token_placement": "header",
    "token_prefix": "Bearer"
  }
}
```

**OAuth Flow** (handled by Gateway):

```
1. Agent calls a web tool for the first time
   ↓
2. Gateway detects: no valid token for this app
   ↓
3. Gateway opens browser for user authorization:
   ┌──────────────────────────────────────┐
   │  Notion wants you to grant access    │
   │                                      │
   │  AAI Gateway is requesting:          │
   │  • Read your content                 │
   │  • Update your content               │
   │                                      │
   │  [Cancel]            [Allow Access]  │
   └──────────────────────────────────────┘
   ↓
4. User clicks [Allow Access]
   ↓
5. Gateway receives authorization code → exchanges for tokens
   ↓
6. Gateway stores tokens in ~/.aai/tokens/<appId>.json
   ↓
7. Subsequent calls: Gateway auto-injects token, auto-refreshes when expired
```

### API Key

For services with simpler authentication:

```json
{
  "auth": {
    "type": "api_key",
    "key_placement": "header",
    "key_name": "X-API-Key",
    "env_var": "AAI_MYAPP_API_KEY"
  }
}
```

The API key is read from the environment variable specified in `env_var`. Users set it once in their shell profile.

### Bearer Token

For services using static tokens:

```json
{
  "auth": {
    "type": "bearer",
    "env_var": "AAI_GITHUB_TOKEN"
  }
}
```

## aai.json Example (Notion)

```json
{
  "schema_version": "1.0",
  "appId": "com.notion.api",
  "name": "Notion",
  "description": "Notion workspace - notes, docs, wikis, and project management",
  "version": "1.0",
  "platforms": {
    "web": {
      "automation": "restapi",
      "base_url": "https://api.notion.com/v1",
      "auth": {
        "type": "oauth2",
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "scopes": ["read_content", "update_content", "insert_content"],
        "token_placement": "header",
        "token_prefix": "Bearer"
      },
      "default_headers": {
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      "tools": [
        {
          "name": "search",
          "description": "Search pages and databases in Notion workspace",
          "parameters": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "Search query text" },
              "page_size": { "type": "integer", "description": "Max results (1-100)", "default": 10 }
            },
            "required": ["query"]
          },
          "endpoint": "/search",
          "method": "POST",
          "body": {
            "query": "${query}",
            "page_size": "${page_size}"
          },
          "output_parser": "json"
        },
        {
          "name": "create_page",
          "description": "Create a new page in a Notion database",
          "parameters": {
            "type": "object",
            "properties": {
              "database_id": { "type": "string", "description": "Target database ID" },
              "title": { "type": "string", "description": "Page title" },
              "content": { "type": "string", "description": "Page content in plain text" }
            },
            "required": ["database_id", "title"]
          },
          "endpoint": "/pages",
          "method": "POST",
          "body": {
            "parent": { "database_id": "${database_id}" },
            "properties": {
              "title": {
                "title": [{ "text": { "content": "${title}" } }]
              }
            }
          },
          "output_parser": "json"
        }
      ]
    }
  }
}
```

## aai.json Field Reference (Web Platform)

| Field | Type | Description |
|-------|------|-------------|
| `platforms.web.automation` | string | Must be `"restapi"` |
| `platforms.web.base_url` | string | Base URL for all API calls (e.g., `https://api.notion.com/v1`) |
| `platforms.web.auth` | object | Authentication configuration (see below) |
| `platforms.web.default_headers` | object | Headers sent with every request |
| `platforms.web.tools[].endpoint` | string | API endpoint path (appended to `base_url`) |
| `platforms.web.tools[].method` | string | HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| `platforms.web.tools[].body` | object | Request body template (supports `${param}` placeholders) |
| `platforms.web.tools[].query_params` | object | URL query parameters (supports `${param}` placeholders) |
| `platforms.web.tools[].headers` | object | Additional headers for this specific tool |
| `platforms.web.tools[].output_parser` | string | `json` (default) or `text` |
| `platforms.web.tools[].timeout` | integer | Timeout in seconds, default 30 |

### Auth Fields (OAuth 2.0)

| Field | Type | Description |
|-------|------|-------------|
| `auth.type` | string | `"oauth2"` |
| `auth.auth_url` | string | Authorization endpoint URL |
| `auth.token_url` | string | Token exchange endpoint URL |
| `auth.scopes` | array | Required OAuth scopes |
| `auth.token_placement` | string | `"header"` (Authorization header) or `"query"` (URL parameter) |
| `auth.token_prefix` | string | Token prefix in header (e.g., `"Bearer"`) |

### Auth Fields (API Key)

| Field | Type | Description |
|-------|------|-------------|
| `auth.type` | string | `"api_key"` |
| `auth.key_placement` | string | `"header"` or `"query"` |
| `auth.key_name` | string | Header name or query parameter name |
| `auth.env_var` | string | Environment variable holding the API key |

### Auth Fields (Bearer Token)

| Field | Type | Description |
|-------|------|-------------|
| `auth.type` | string | `"bearer"` |
| `auth.env_var` | string | Environment variable holding the token |

## Token Storage

Gateway stores OAuth tokens securely at:

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.aai/tokens/<appId>.json` |
| Windows | `%USERPROFILE%\.aai\tokens\<appId>.json` |

Token files contain access token, refresh token, and expiry time. Gateway automatically refreshes expired tokens.

## Integration Guide

### For SaaS Providers

1. Your app already has a REST API? **Zero backend changes needed.**
2. Register an OAuth application (provide client_id/client_secret)
3. Write `aai.json` describing your API endpoints as tools
4. Place in `~/.aai/<appId>/aai.json`
5. Done -- any Agent can now discover and use your service

### For Community Contributors

Most SaaS apps have public API documentation. You can write `aai.json` for any service:

1. Read the API docs (endpoints, parameters, authentication)
2. Create `aai.json` with the REST API tools
3. Share via the AAI community registry

---

[Back to Spec Index](../README.md) | [macOS Platform](./macos.md)
