# Web Platform Guide

## Overview

Web apps expose HTTP APIs with OAuth 2.1 authorization. Gateway handles token management; your app validates tokens and serves API requests.

## Prerequisites

| Resource | Description |
|----------|-------------|
| [AAI Protocol Overview](../../README.md) | What is AAI and why it matters |
| [Protocol Specification](../README.md) | Full spec index |
| [aai.json Descriptor](../aai-json.md) | Descriptor format |
| [Security Model](../security.md) | OAuth 2.1 flow details |

## Implementation Steps

> **Note**: Code snippets below are simplified examples. Adapt them to your framework and architecture.

### 1. Implement OAuth 2.1 Endpoints

#### Authorization Endpoint (`GET /oauth/authorize`)

Display login UI, then redirect with auth code:

```
GET /oauth/authorize?
  response_type=code&
  client_id=aai-gateway&
  redirect_uri=http://localhost:3000/callback&
  scope=read%20write&
  state=xyz&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256&
  aai_tools=send_email,read_inbox
```

After user login and consent, redirect to:

```
http://localhost:3000/callback?code=abc123&state=xyz
```

#### Token Endpoint (`POST /oauth/token`)

Handle two grant types:

**Authorization Code Exchange:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=abc123&
redirect_uri=http://localhost:3000/callback&
code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

**Refresh Token:**

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=def456
```

**Response:**

```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcy...",
  "scope": "read write"
}
```

### 2. Implement API Endpoints

Each tool maps to an HTTP endpoint:

```python
# EXAMPLE: Flask endpoint (illustrative)
@app.route("/v1/search", methods=["POST"])
def search():
    # Validate Bearer token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not validate_token(token):
        return {"error": "unauthorized"}, 401

    query = request.json.get("query")
    limit = request.json.get("limit", 10)

    results = perform_search(query, limit)
    return {"items": results}
```

### 3. Create aai.json

```json
{
  "schema_version": "1.0",
  "version": "1.0.0",
  "platform": "web",
  "app": {
    "id": "com.yourcompany.api",
    "name": "Your API",
    "description": "Your service description"
  },
  "execution": {
    "type": "http",
    "base_url": "https://api.yourcompany.com/v1",
    "default_headers": {
      "Content-Type": "application/json"
    }
  },
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "authorization_endpoint": "https://yourcompany.com/oauth/authorize",
      "token_endpoint": "https://yourcompany.com/oauth/token",
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
          "query": { "type": "string", "description": "Search query" },
          "limit": { "type": "integer", "minimum": 1, "maximum": 100, "default": 10 }
        },
        "required": ["query"]
      },
      "returns": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "type": "object" } }
        }
      }
    }
  ]
}
```

### 4. Host Descriptor

Publish at the well-known location:

```
https://yourcompany.com/.well-known/aai.json
```

Configure your web server:

```nginx
location /.well-known/aai.json {
    alias /var/www/aai.json;
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

**That's all.** No registration with any external service is needed. Gateway fetches your descriptor automatically when an agent needs to use your app, using the URL the agent resolves from the user's request.

## How Users Access Your App

Users don't install your web app manually. When a user tells their agent "help me do X in YourApp", the agent resolves your URL (from its own knowledge or by asking the user), then Gateway fetches your descriptor on demand. The first time requires OAuth authorization in the browser; subsequent sessions reuse the cached token.

## Tool Execution Mapping

| Tool Field | HTTP Mapping |
|------------|--------------|
| `name` | Used for logging/routing |
| `execution.path` | Appended to `base_url` |
| `execution.method` | HTTP method |
| `parameters` | JSON request body |
| Auth | `Authorization: Bearer <token>` (added by Gateway) |

## Token Validation

Validate JWT or look up token in your database:

```python
# EXAMPLE: Token validation (illustrative)
def validate_token(token):
    # Option 1: JWT validation
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload["scope"]

    # Option 2: Database lookup
    # token_record = db.query(Token).filter_by(access_token=token).first()
    # return token_record.scopes if token_record else None
```

## Error Responses

Return standard error format:

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "query parameter is required"
  }
}
```

## Testing

### Test Descriptor

```bash
curl https://yourcompany.com/.well-known/aai.json | python -m json.tool
```

### Test OAuth Flow

```bash
# 1. Get authorization code (manual browser step)
open "https://yourcompany.com/oauth/authorize?response_type=code&client_id=aai-gateway&redirect_uri=http://localhost:3000/callback&scope=read%20write&state=test&code_challenge=test&code_challenge_method=S256"

# 2. Exchange code for token
curl -X POST https://yourcompany.com/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code_verifier=test"

# 3. Test API endpoint
curl -X POST https://api.yourcompany.com/v1/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

## Checklist

- [ ] OAuth 2.1 authorization endpoint returns auth code
- [ ] Token endpoint handles `authorization_code` grant
- [ ] Token endpoint handles `refresh_token` grant
- [ ] Token response includes `access_token`, `refresh_token`, `expires_in`
- [ ] API endpoints validate Bearer token
- [ ] API endpoints accept JSON request body
- [ ] `aai.json` hosted at `/.well-known/aai.json` with `Access-Control-Allow-Origin: *`
- [ ] Error responses follow standard format

---

[Back to Spec Index](../README.md) | [macOS Platform](./macos.md)
