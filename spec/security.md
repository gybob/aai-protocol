# Security Model

AAI uses different security mechanisms for desktop apps and Web Apps:

- **Desktop apps**: Operating system's native authorization (TCC, UAC, Polkit)
- **Web Apps**: OAuth 2.0 / API Key authentication, managed by Gateway

## Desktop App Authorization

| Platform    | Authorization Mechanism                                | User Experience                                                                            |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **macOS**   | System TCC (Transparency, Consent, and Control)        | First-time automation tool use popup: "AAI Gateway wants to control Mail" -> [Allow]/[Deny] |
| **Windows** | UAC (User Account Control) or application's own prompt | Some apps show security warning when using COM for the first time                          |
| **Linux**   | Polkit or desktop environment security framework       | System-level security prompt                                                               |

### macOS TCC Authorization Flow

```
1. Agent requests to call Mail application
   ↓
2. Gateway executes AppleScript
   ↓
3. macOS detects automation call
   ↓
4. System popup (first time):
   ┌─────────────────────────────────────┐
   │  "AAI Gateway" wants to control "Mail"   │
   │                                     │
   │  If you don't trust this application, │
   │  please deny it.                     │
   │                                     │
   │  [Deny]               [OK]          │
   └─────────────────────────────────────┘
   ↓
5. User clicks [OK]
   ↓
6. System records authorization
   ↓
7. Subsequent calls don't require popup
```

### Windows COM Security Flow

```
1. Agent requests to call Outlook
   ↓
2. Gateway creates COM object
   ↓
3. Windows checks COM security settings
   ↓
4. Some apps show popup (first time):
   ┌─────────────────────────────────────┐
   │  Allow this website to open Outlook?   │
   │                                     │
   │  [Don't Allow]       [Allow]         │
   └─────────────────────────────────────┘
   ↓
5. User clicks [Allow]
   ↓
6. Subsequent calls may still require confirmation (depends on app settings)
```

## Web App Authorization

For Web Apps, Gateway handles OAuth 2.0 authentication or API key management.

### User Confirmation (Domain & Certificate Verification)

Before initiating any authentication flow for a Web App, Gateway **must** display domain and certificate information to the user:

```
1. Agent calls a Web App tool for the first time
   ↓
2. Gateway shows domain verification prompt:
   ┌──────────────────────────────────────────────┐
   │  AAI Gateway - Web App Authorization         │
   │                                              │
   │  Domain:       api.notion.com                │
   │  SSL Cert:     ✅ Valid (issued by DigiCert) │
   │  App Name:     Notion                        │
   │  Permissions:  read_content, update_content  │
   │                                              │
   │  [Cancel]                    [Authorize]     │
   └──────────────────────────────────────────────┘
   ↓
3a. User clicks [Cancel] → return AUTH_REQUIRED error
3b. User clicks [Authorize] → proceed to OAuth or API Key flow
```

This ensures users are aware of which domain they are granting access to and can verify the SSL certificate is valid.

### OAuth 2.0 Authorization Flow

```
1. Agent calls a web tool (e.g., Notion search)
   ↓
2. Gateway checks: does ~/.aai/tokens/com.notion.api.json exist?
   ↓
3a. Token exists and valid → inject into request, proceed to step 8
3b. Token exists but expired → auto-refresh via token_url, proceed to step 8
3c. No token → user confirmation (see above), then start OAuth flow (step 4)
   ↓
4. Gateway opens browser for user authorization:
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
5. User clicks [Allow Access]
   ↓
6. Gateway receives auth code → exchanges for access + refresh tokens
   → stores in ~/.aai/tokens/<appId>.json
   ↓
7. Gateway sends API request with token in Authorization header
   ↓
8. Web App returns response → Gateway returns to Agent
```

### API Key / Bearer Token Flow

```
1. Agent calls a web tool
   ↓
2. Gateway reads API key from environment variable (defined in aai.json auth.env_var)
   ↓
3a. Key found → inject into request header/query
3b. Key not found → return PERMISSION_DENIED error with instructions
   ↓
4. Send API request → return response to Agent
```

### Token Storage

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.aai/tokens/<appId>.json` |
| Windows | `%USERPROFILE%\.aai\tokens\<appId>.json` |

Token files contain:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": 1700000000,
  "token_type": "Bearer"
}
```

### Security Principles

- **Gateway never stores client secrets in aai.json** -- secrets are stored separately in Gateway config
- **Tokens are stored locally** in the user's home directory, not transmitted to Agent or LLM
- **Agent only sees API responses**, never raw tokens
- **Users can revoke access** at any time via the Web App provider's settings or by deleting token files
- **Scopes are explicitly declared** in aai.json so users know what access is requested

---

[Back to Spec Index](./README.md)
