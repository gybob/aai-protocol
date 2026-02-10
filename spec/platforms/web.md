# Web App (REST API)

AAI supports Web Apps through REST API calls with OAuth 2.0 / API Key authentication. This makes thousands of cloud services (Notion, Slack, GitHub, Jira, Stripe, etc.) accessible to Agents.

## Why Web App Support Matters

Desktop apps are only part of the picture. Modern productivity relies heavily on Web Apps, and most of them already have REST APIs. AAI bridges the gap:

| Web App  | Has REST API | LLM Knows It | With AAI |
|----------|-------------|-------------|----------|
| Notion   | Yes         | Partially   | Full structured access |
| Slack    | Yes         | Partially   | Full structured access |
| Your App | Yes         | No          | Fully discoverable |

## Automation Mechanism

- **Protocol**: HTTPS REST API calls
- **Authentication**: OAuth 2.0 (Authorization Code / Client Credentials) or API Key
- **Data Format**: JSON request/response
- **Token Management**: Gateway handles token storage, refresh, and injection

## Authentication Types

### OAuth 2.0

For Web Apps that require user authorization (Notion, Slack, Google, etc.):

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

## Discovery Mechanism

Unlike desktop apps (which place `aai.json` in `~/.aai/`), Web Apps cannot write to the user's local filesystem. AAI solves this through the **AAI Registry**.

### How It Works

```
1. Web App owner writes aai.json, hosts it on their domain
   (e.g., https://api.notion.com/.well-known/aai.json)
   ↓
2. Owner submits the aai.json URL to AAI Registry (official website)
   ↓
3. AAI Registry stores the URL in its directory
   ↓
4. Gateway loads the registry on startup → fetches all registered aai.json descriptors
   ↓
5. Web App tools become available to Agents
```

### Registration

Web App owners only need to submit one thing to the AAI Registry:

- **The URL of their `aai.json` file**

The AAI Registry fetches and indexes the descriptor. No domain verification or complex onboarding is required.

### Security: User Confirmation Before Authorization

When an Agent calls a Web App tool for the first time, Gateway **must** prompt the user before proceeding with OAuth or API access:

```
┌──────────────────────────────────────────────────────┐
│  AAI Gateway - Web App Authorization                 │
│                                                      │
│  The Agent wants to access:                          │
│                                                      │
│  Domain:       api.notion.com                        │
│  SSL Cert:     ✅ Valid (issued by DigiCert)         │
│  App Name:     Notion                                │
│  Permissions:  read_content, update_content          │
│                                                      │
│  Please verify this is the service you intend to     │
│  access. Proceed with authorization?                 │
│                                                      │
│  [Cancel]                        [Authorize]         │
└──────────────────────────────────────────────────────┘
```

The user sees:
1. **Domain name** -- is this the service they expect?
2. **SSL certificate status** -- is the certificate valid?
3. **Requested permissions** -- what scopes will be granted?

Only after the user confirms does Gateway proceed with OAuth authorization or API key injection.

### Local Cache

Gateway caches downloaded Web App descriptors locally at `~/.aai/web/<appId>/aai.json`. This ensures:
- Offline access to previously loaded descriptors
- Faster startup without re-fetching every time
- Users can inspect and remove cached descriptors

### Manual Install

Users can also manually install Web App descriptors for private or internal APIs:

```bash
mkdir -p ~/.aai/com.internal.api
# Place aai.json manually
cp my-internal-api.aai.json ~/.aai/com.internal.api/aai.json
```

Manually installed descriptors work the same as desktop app descriptors and do not require registry registration.

## Integration Guide

### For Web App Providers

1. Your app already has a REST API? **Zero backend changes needed.**
2. Write `aai.json` describing your API endpoints as tools
3. Host `aai.json` on your domain (e.g., `https://api.yourapp.com/.well-known/aai.json`)
4. Submit the URL to the AAI Registry
5. Done -- any Agent can now discover and use your service

### For Community Contributors

Most Web Apps have public API documentation. You can write `aai.json` for any service:

1. Read the API docs (endpoints, parameters, authentication)
2. Create `aai.json` with the REST API tools
3. Host it or submit to the AAI Registry

---

[Back to Spec Index](../README.md) | [macOS Platform](./macos.md)
