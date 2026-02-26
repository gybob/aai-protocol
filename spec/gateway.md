# AAI Gateway

The AAI Gateway is a **stdio MCP server** that bridges LLM agents and AAI-compatible apps. It handles discovery, consent, and execution.

**Official Implementation**: [github.com/gybob/aai-gateway](https://github.com/gybob/aai-gateway)

## Deployment

Gateway runs as a stdio process managed by the agent client (e.g. Claude Desktop). No daemon or background service is required.

**Claude Desktop configuration** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "aai-gateway": {
      "command": "aai-gateway"
    }
  }
}
```

Gateway starts when the agent client launches and stops when it exits.

## Startup Behavior

On startup, Gateway:

1. Scans for desktop app descriptors:
   ```bash
   find /Applications ~/Applications -maxdepth 4 \
     -path "*/Contents/Resources/aai.json" 2>/dev/null
   ```
2. Loads and validates each found `aai.json`
3. Loads the local name cache (`~/.config/aai-gateway/name-cache.json`)
4. Loads consent records from OS keychain
5. Becomes ready to serve MCP requests

Startup scan typically completes in under one second.

## MCP Interface

Gateway exposes three MCP methods:

### `resources/list`

Returns all discovered desktop apps.

```json
// Response
{
  "resources": [
    {
      "uri": "app:com.example.mail",
      "name": "Mail",
      "description": "Email client"
    }
  ]
}
```

Web apps are not included — they are fetched on demand via `resources/read`.

### `resources/read`

Returns a full app descriptor. Accepts two URI formats:

**Desktop app** (by bundle ID):
```json
{ "uri": "app:com.example.mail" }
```

**Web app** (by URL):
```json
{ "uri": "https://notion.so" }
```

For web apps, Gateway:
1. Checks local cache (`~/.cache/aai-gateway/<host>/aai.json`)
2. If cache is missing or expired (TTL: 24h): fetches `<url>/.well-known/aai.json`
3. Validates the descriptor against JSON Schema
4. Saves to cache with timestamp
5. Returns the descriptor

### `tools/call`

Executes a tool on the target app.

```json
{
  "name": "com.example.mail:send_email",
  "arguments": { "to": ["alice@example.com"], "body": "Hello!" }
}
```

Execution order:
1. Resolve app from tool name prefix
2. Check Gateway consent for this tool (see [Security Model](./security.md))
3. If desktop: send Apple Event to app
4. If web: send HTTPS request with OAuth token
5. Return result to agent

## Local Storage

All Gateway state is stored in user-space. No system-wide files are written.

| Data | Location | Format |
|------|----------|--------|
| Web descriptor cache | `~/.cache/aai-gateway/<host>/aai.json` | JSON file + `.meta` for TTL |
| Name→URL mappings | `~/.config/aai-gateway/name-cache.json` | JSON |
| Consent decisions | OS Keychain | Encrypted (see [Security Model](./security.md)) |
| OAuth tokens | OS Keychain | Encrypted |

### Name Cache Format

```json
{
  "notion": "https://notion.so",
  "jira": "https://jira.mycompany.com",
  "our crm": "https://crm.internal.example.com"
}
```

Keys are lowercase, trimmed strings as the user said them. Gateway writes to this file when the agent resolves a new name mapping after asking the user.

### Cache Metadata Format

```json
{
  "fetched_at": "2026-02-24T10:00:00Z",
  "ttl_seconds": 86400,
  "source_url": "https://notion.so/.well-known/aai.json"
}
```

## Error Handling

| Scenario | Gateway Behavior |
|----------|-----------------|
| `aai.json` not found at `.well-known` | Return `UNKNOWN_APP` error |
| `aai.json` fails schema validation | Return `INVALID_REQUEST` error with details |
| App not running (desktop) | Apple Event delivery fails → return `SERVICE_UNAVAILABLE` |
| OAuth token expired, no refresh token | Return `AUTH_REQUIRED`, agent prompts user to re-authorize |
| Network timeout fetching web descriptor | Return cached version if available, else `SERVICE_UNAVAILABLE` |

See [Error Codes](./error-codes.md) for full reference.

---

[Back to Spec Index](./README.md)
