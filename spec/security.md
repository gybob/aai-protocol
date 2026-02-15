# Security Model

AAI uses different security mechanisms for desktop and web apps.

## Desktop Apps

Desktop apps use the operating system's native authorization.

### macOS: TCC (Transparency, Consent, and Control)

```
1. Agent requests to call an app
   ↓
2. Gateway executes via Apple Events
   ↓
3. macOS detects automation call
   ↓
4. System popup (first time):
   ┌─────────────────────────────────────┐
   │  "AAI Gateway" wants to control     │
   │  "Mail"                             │
   │                                     │
   │  [Deny]               [OK]          │
   └─────────────────────────────────────┘
   ↓
5. User approves → authorization recorded
6. Subsequent calls don't require popup
```

## Web Apps

Web apps use OAuth 2.1 for authentication, managed entirely by Gateway.

### OAuth 2.1 Authorization Flow

```
1. Agent calls a web tool
   ↓
2. Gateway checks for valid token
   ├─ Valid token → proceed to step 8
   ├─ Expired token → auto-refresh → proceed to step 8
   └─ No token → start OAuth flow
   ↓
3. Gateway displays domain verification:
   ┌──────────────────────────────────────────────┐
   │  AAI Gateway - Authorization Required        │
   │                                              │
   │  Domain:       api.example.com               │
   │  SSL Cert:     ✅ Valid                      │
   │  Permissions:  read, write                   │
   │                                              │
   │  [Cancel]                    [Authorize]     │
   └──────────────────────────────────────────────┘
   ↓
4. User authorizes → Gateway opens browser
   ↓
5. User grants permissions in browser
   ↓
6. Gateway receives auth code → exchanges for tokens
   ↓
7. Tokens stored securely
   ↓
8. API request sent with token
```

### Token Storage

| Platform | Path |
|----------|------|
| macOS | `~/.aai/tokens/<app_id>.json` |

Token file structure:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": 1700000000,
  "token_type": "Bearer"
}
```

### API Key Authentication

For services that don't use OAuth:

```json
{
  "auth": {
    "type": "api_key",
    "header": "X-API-Key",
    "env_var": "AAI_MYAPP_KEY"
  }
}
```

Gateway reads the key from the environment variable.

## Security Principles

| Principle | Implementation |
|-----------|----------------|
| No secrets in descriptors | Client secrets stored separately in Gateway config |
| Local token storage | Tokens never sent to Agent or LLM |
| Agent isolation | Agent only sees API responses, not tokens |
| User control | Users can revoke by deleting token files |
| Explicit scopes | Scopes declared in descriptor for transparency |

---

[Back to Spec Index](./README.md)
