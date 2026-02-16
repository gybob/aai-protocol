# Security Model

## Authorization by Platform Type

| Platform | Authorization Handler |
|----------|----------------------|
| Desktop App | Operating System |
| Web App | Gateway (OAuth 2.1) |

## Desktop App Authorization

Desktop apps rely on the operating system's native authorization. The Gateway does not participate in authorization decisions.

When an Agent calls a desktop tool:
1. Gateway sends request via native IPC
2. OS detects the cross-process call
3. OS prompts user (first time only)
4. User approves/denies
5. OS enforces the decision

The specific mechanism varies by platform but is transparent to AAI.

## Web App Authorization

### OAuth 2.1 Authorization Code + PKCE

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Agent  │     │ Gateway │     │ Browser │     │   API   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ tools/call    │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ check token   │               │
     │               │ (none/expired)│               │
     │               │               │               │
     │               │ show consent  │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │ user approves │               │
     │               │<──────────────│               │
     │               │               │               │
     │               │ open browser  │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │ GET /authorize│
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ login + consent
     │               │               │<──────────────│
     │               │               │               │
     │               │               │ redirect      │
     │               │               │ with code     │
     │               │               │──────────────>│
     │               │               │               │
     │               │ capture code  │               │
     │               │<──────────────│               │
     │               │               │               │
     │               │ POST /token   │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │ access_token  │               │
     │               │ refresh_token │               │
     │               │ expires_in    │               │
     │               │<──────────────────────────────│
     │               │               │               │
     │               │ store token   │               │
     │               │               │               │
     │               │ API request   │               │
     │               │ Authorization:Bearer xxx      │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │ API response  │               │
     │               │<──────────────────────────────│
     │               │               │               │
     │ tool result   │               │               │
     │<──────────────│               │               │
     │               │               │               │
```

### Authorization Endpoint

**Request** (via browser redirect):

| Parameter | Type | Description |
|-----------|------|-------------|
| `response_type` | string | Fixed: `code` |
| `client_id` | string | Client identifier |
| `redirect_uri` | string | Callback URL |
| `scope` | string | Space-separated scopes |
| `state` | string | CSRF token |
| `code_challenge` | string | PKCE challenge (S256) |
| `code_challenge_method` | string | Fixed: `S256` |

**Response** (redirect back):

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Authorization code |
| `state` | string | Must match request |

### Token Endpoint

**Request**:

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=<code>&
redirect_uri=<uri>&
code_verifier=<verifier>
```

**Response**:

```json
{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcy...",
  "scope": "read write"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | Token for API calls |
| `token_type` | string | Fixed: `Bearer` |
| `expires_in` | number | Token lifetime in seconds |
| `refresh_token` | string | Token for refresh |
| `scope` | string | Granted scopes |

### Token Refresh

When `access_token` expires, Gateway uses `refresh_token`:

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=<refresh_token>
```

### Token Storage

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

### User Consent

Before starting OAuth, Gateway displays:

```
┌──────────────────────────────────────────────┐
│  AAI Gateway - Authorization Required        │
│                                              │
│  Domain:       api.example.com               │
│  Permissions:  read, write                   │
│                                              │
│  [Cancel]                    [Authorize]     │
└──────────────────────────────────────────────┘
```

### API Key Authentication

For services without OAuth:

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

Gateway reads the key from the environment variable.

## Security Principles

| Principle | Implementation |
|-----------|----------------|
| No secrets in descriptors | Stored in Gateway config |
| Local token storage | Never sent to Agent/LLM |
| PKCE required | Prevents authorization code interception |
| Token refresh | Automatic, transparent to user |

---

[Back to Spec Index](./README.md)
