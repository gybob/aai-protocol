# Security Model

**Spec version:** 0.3.0  
**Status:** Draft

AAI Gateway uses a **two-phase authorization model**:

| Phase | Who Authorizes | What | Example |
|---|---|---|---|
| **Phase 1** | AAI Gateway | User grants access to an app | Gateway prompts: "Allow filesystem app to run?" |
| **Phase 2** | Downstream Protocol | Protocol handles its own auth | MCP OAuth, API key, token exchange |

```
┌──────────────────────────────────────────────────────────────┐
│                      Phase 1: AAI Gateway                     │
│                                                              │
│  User → Gateway: "I want to use app:filesystem"               │
│  Gateway → User: "Grant permission?"                          │
│  User → Gateway: "Allow"                                     │
│  Gateway: Records consent, proceeds                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    Phase 2: Downstream Protocol               │
│                                                              │
│  MCP: Own OAuth / token flow (if required by server)         │
│  CLI: No auth (local command)                                │
│  ACP-Agent: Agent-level auth (agent's own mechanism)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Gateway Authorization

Gateway-level authorization is **app-scoped**. When a user first uses an app, the gateway:

1. Shows a consent prompt describing the app
2. User grants or denies access
3. Decision is stored locally (per app, not per operation)

> There is no `consent` field in `aai.json`. The gateway handles this automatically on first use.

**Design intent:** Simple yes/no per app. No capability-level or operation-level granularity at this layer.

---

## Phase 2: Downstream Protocol Authorization

After gateway-level consent, the gateway routes to the downstream protocol. Each protocol handles its own auth:

### MCP

MCP servers may have their own auth requirements. If an MCP server requires authentication (e.g., OAuth flow), the MCP client built into the gateway handles it independently.

```
Gateway → MCP Client → MCP Server
                      └→ OAuth / API key / token exchange (server's responsibility)
```

**The gateway does not translate or proxy MCP auth.** If the MCP server requires credentials, those are configured in the MCP server's environment or config, not in `aai.json`.

### CLI

CLI apps run as local processes. Auth is typically none (local command) or environment variables / config files on disk.

### ACP-Agent

ACP agents run as separate processes. Auth is agent-specific — the agent manages its own credentials and session state.

---

## Access Credentials

The `access` section in `aai.json` does **not** contain secrets:

```json
{
  "access": {
    "protocol": "mcp",
    "config": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/repo"]
    }
  }
}
```

Secrets (API keys, tokens, credentials) belong in:

- **Environment variables** — set on the machine, not in the manifest
- **Config files** — MCP server config, `.env` files, keychains
- **Downstream auth flows** — MCP OAuth, agent credential prompts

> **Never put secrets in `aai.json`.** It is a plain-text manifest designed to be shareable.

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `E_CONSENT_REQUIRED` | 403 | App requires user consent before use. |
| `E_CONSENT_DENIED` | 403 | User denied consent for this app. |
| `E_ACCESS_DENIED` | 403 | Downstream protocol refused the request (e.g., MCP auth failure). |

---

## Threat Model

| Threat | Mitigation |
|---|---|
| Malicious app manifest | User consent required before any app runs |
| Credential leakage | No secrets in `aai.json`; credentials stay in downstream systems |
| Unauthorized downstream access | Phase 2 auth is the downstream protocol's responsibility |
| Tampering with manifest | `aai.json` is plain text; integrity verification is out of scope for 0.3 |

---

## Future Considerations

The following are out of scope for 0.3 but may be addressed in future versions:

- **Manifest signing** — verify `aai.json` author identity
- **Capability-level consent** — ask per operation, not per app
- **Audit logging** — record all app executions
- **Revocation UI** — let users revoke past consents

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial draft. |
| 0.2 | 2026-01-15 | Added ACP-Agent protocol. |
| 0.3 | 2026-03-23 | Two-phase auth model: gateway + downstream protocol. |
