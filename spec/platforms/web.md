# Web App: REST API + OAuth 2.1

## Overview

Web apps expose their REST APIs through AAI with OAuth 2.1 authentication. Gateway handles all token management.

## OAuth 2.1 Features

OAuth 2.1 consolidates best practices from OAuth 2.0:

- **PKCE** required for all public clients
- **Refresh token rotation** for security
- **Short-lived access tokens**
- **No implicit grant**

## Authentication Config

### OAuth 2.1 Authorization Code + PKCE

```json
{
  "auth": {
    "type": "oauth2",
    "flow": "authorization_code",
    "authorization_endpoint": "https://example.com/oauth/authorize",
    "token_endpoint": "https://example.com/oauth/token",
    "scopes": ["read", "write"],
    "pkce": {
      "method": "S256"
    }
  }
}
```

### API Key

```json
{
  "auth": {
    "type": "api_key",
    "placement": "header",
    "name": "X-API-Key",
    "env_var": "AAI_EXAMPLE_KEY"
  }
}
```

## Authorization Flow

```
1. Agent calls web tool
   ↓
2. Gateway checks token store
   ├─ Valid → inject Authorization header, call API
   ├─ Expired → use refresh token (with rotation)
   └─ Missing → start OAuth flow
   ↓
3. Display domain verification to user
   ↓
4. Generate PKCE challenge (S256)
   ↓
5. Open browser for authorization
   ↓
6. Exchange code for tokens
   ↓
7. Store tokens securely
   ↓
8. Call API with Bearer token
```

## Token Storage

```
~/.aai/tokens/<app_id>.json
```

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": 1700000000,
  "token_type": "Bearer"
}
```

## Tool Execution

Gateway maps tool calls to REST API requests:

| Descriptor | REST API |
|------------|----------|
| Tool name | Endpoint |
| Parameters | Request body / query params |
| Auth config | Authorization header |

Example tool call:

```json
// Tool: search
// Params: { "query": "hello", "limit": 10 }

// Gateway builds:
POST https://api.example.com/v1/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "hello",
  "limit": 10
}
```

## Error Handling

| HTTP Status | AAI Error |
|-------------|-----------|
| 401 | `AUTH_TOKEN_EXPIRED` → auto-refresh |
| 403 | `AUTH_PERMISSION_DENIED` |
| 429 | `RATE_LIMIT_EXCEEDED` |
| 5xx | `SERVICE_UNAVAILABLE` |

## Descriptor Discovery

Web apps publish their descriptor at:

```
https://api.example.com/.well-known/aai.json
```

Register with AAI Registry for discovery.

---

[Back to Spec Index](../README.md) | [Desktop Platform](./macos.md)
