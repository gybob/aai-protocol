# Security Model

## Authorization by Platform Type

| Platform | Authorization Handler |
|----------|----------------------|
| Desktop App | Operating System |
| Web App | Web App (via OAuth 2.1) |

## Desktop App Authorization

Desktop apps rely on the operating system's native authorization. Gateway does not participate.

1. Gateway sends request via native IPC
2. OS prompts user (first time only)
3. User approves/denies
4. OS enforces the decision

## Web App Authorization

Web apps handle authorization via OAuth 2.1. Gateway manages tokens but does not make authorization decisions—that's the Web App's responsibility.

### Token Check Flow

```
Agent calls tool
       ↓
Gateway checks token store
       ↓
┌──────────────────┐
│ Token valid?     │
└────────┬─────────┘
         │
    ┌────┴────┐
    ↓         ↓
   Yes        No
    │          │
    │          ↓
    │     Start OAuth
    │          │
    ↓          ↓
Call API with token
```

### OAuth 2.1 Flow (when token missing/expired)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Agent  │     │ Gateway │     │ Browser │     │ Web App │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     │ tools/call    │               │               │
     │──────────────>│               │               │
     │               │               │               │
     │               │ no valid token│               │
     │               │               │               │
     │               │ open browser  │               │
     │               │──────────────>│               │
     │               │               │               │
     │               │               │ GET /authorize│
     │               │               │──────────────>│
     │               │               │               │
     │               │               │   user login  │
     │               │               │  + authorize  │
     │               │               │<──────────────│
     │               │               │               │
     │               │               │ redirect      │
     │               │               │ with auth code│
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
     │               │ call API      │               │
     │               │ with token    │               │
     │               │──────────────────────────────>│
     │               │               │               │
     │               │ API response  │               │
     │               │<──────────────────────────────│
     │               │               │               │
     │ tool result   │               │               │
     │<──────────────│               │               │
```

### Authorization Endpoint

**Request** (browser redirect):

| Parameter | Type | Description |
|-----------|------|-------------|
| `response_type` | string | `code` |
| `client_id` | string | Client identifier |
| `redirect_uri` | string | Callback URL |
| `scope` | string | Space-separated scopes |
| `state` | string | CSRF token |
| `code_challenge` | string | PKCE challenge |
| `code_challenge_method` | string | `S256` |

**Response** (redirect):

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
| `token_type` | string | `Bearer` |
| `expires_in` | number | Token lifetime in seconds |
| `refresh_token` | string | Token for refresh |

### Token Refresh

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

### API Key

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

---

[Back to Spec Index](./README.md)
