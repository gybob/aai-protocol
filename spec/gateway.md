# AAI Gateway

The AAI Gateway is a **stdio MCP server** that bridges LLM agents and AAI-compatible apps. It uses a **guide-based discovery model** to minimize context while enabling progressive app interaction.

**Official Implementation**: [github.com/gybob/aai-gateway](https://github.com/gybob/aai-gateway)

## Deployment

Gateway runs as a stdio process managed by the agent client (e.g. Claude Desktop, Cursor, Windsurf). No daemon or background service is required.

**MCP Client configuration**:

```json
{
  "mcpServers": {
    "aai-gateway": {
      "command": "npx",
      "args": ["aai-gateway"]
    }
  }
}
```

**Development mode** (scans Xcode build directories):

```json
{
  "mcpServers": {
    "aai-gateway": {
      "command": "npx",
      "args": ["aai-gateway", "--dev"]
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
3. Loads consent records from OS keychain
4. Becomes ready to serve MCP requests

Startup scan typically completes in under one second.

## MCP Interface

Gateway exposes **tools only** (no resources). This simplifies the agent workflow and ensures all capabilities are discoverable via `tools/list`.

### `tools/list`

Returns all discoverable apps plus universal tools:

```json
{
  "tools": [
    // Desktop apps (one entry per app)
    {
      "name": "app:com.apple.reminders",
      "description": "【Reminders|提醒事项】macOS reminders. Aliases: todo, 待办. Call to get guide.",
      "inputSchema": { "type": "object", "properties": {} }
    },

    // Web discovery tool
    {
      "name": "web:discover",
      "description": "Discover web app guide. Use when user mentions a web service not in list.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "Web app URL, domain, or name"
          }
        },
        "required": ["url"]
      }
    },

    // Universal execution tool
    {
      "name": "aai:exec",
      "description": "Execute app operation. Use after reading operation guide.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "app": { "type": "string", "description": "App ID or URL" },
          "tool": { "type": "string", "description": "Operation name" },
          "args": { "type": "object", "description": "Operation parameters" }
        },
        "required": ["app", "tool"]
      }
    }
  ]
}
```

**Context Efficiency**: `O(apps + 2)` instead of `O(apps × tools)`.

### `tools/call`

#### App Guide Request

```json
{
  "name": "app:com.apple.reminders",
  "arguments": {}
}
```

Returns operation guide with available tools, parameters, and usage examples.

#### Web App Discovery

```json
{
  "name": "web:discover",
  "arguments": { "url": "notion.com" }
}
```

Fetches `.well-known/aai.json`, generates guide, returns to agent.

#### Tool Execution

```json
{
  "name": "aai:exec",
  "arguments": {
    "app": "com.apple.reminders",
    "tool": "create_reminder",
    "args": {
      "title": "Submit report",
      "due": "2024-12-31 15:00"
    }
  }
}
```

Execution order:

1. Resolve app descriptor (from registry or web fetch)
2. Check consent (see [Security Model](./security.md))
3. If desktop: execute via native IPC
4. If web: execute via HTTP with OAuth token
5. Return result to agent

## Authorization Flow

### Desktop Apps (OS Consent)

First execution triggers native consent dialog:

```
┌─────────────────────────────────────────┐
│ ⚠️ AAI Gateway 请求权限                 │
│                                         │
│ 应用: 提醒事项 │
│                                         │
│ 请求执行操作:                           │
│ create_reminder                         │
│                                         │
│ [拒绝] [授权此操作] [授权所有操作]      │
└─────────────────────────────────────────┘
```

User clicks once to authorize. Decision is remembered.

### Web Apps (OAuth)

First execution triggers browser-based OAuth:

1. Gateway opens browser automatically
2. User completes authorization on website
3. Browser redirects to local callback
4. Gateway exchanges tokens automatically
5. Tool executes

User experience: just complete website login/authorization.

## Local Storage

All Gateway state is stored in user-space. No system-wide files are written.

| Data                 | Location                               | Format              |
| -------------------- | -------------------------------------- | ------------------- |
| Web descriptor cache | `~/.cache/aai-gateway/<host>/aai.json` | JSON file + `.meta` |
| Consent decisions    | OS Keychain                            | Encrypted           |
| OAuth tokens         | OS Keychain                            | Encrypted           |

### Cache Metadata Format

```json
{
  "fetched_at": "2026-02-24T10:00:00Z",
  "ttl_seconds": 86400,
  "source_url": "https://notion.so/.well-known/aai.json"
}
```

## CLI Commands

Gateway supports minimal CLI for configuration:

```bash
# Start MCP server (default)
npx aai-gateway

# Development mode (scan Xcode build directories)
npx aai-gateway --dev

# Debug: list discovered apps
npx aai-gateway --scan

# Show version
npx aai-gateway --version
```

All operations are performed via MCP tools, not CLI commands.

## Error Handling

| Scenario                              | Gateway Behavior                   |
| ------------------------------------- | ---------------------------------- |
| `aai.json` not found at `.well-known` | Return `UNKNOWN_APP` error         |
| `aai.json` fails schema validation    | Return `INVALID_REQUEST` error     |
| App not running (desktop)             | Return `SERVICE_UNAVAILABLE`       |
| OAuth token expired                   | Return `AUTH_REQUIRED`             |
| Network timeout                       | Return cached version if available |

See [Error Codes](./error-codes.md) for full reference.

---

[Back to Spec Index](./README.md)
