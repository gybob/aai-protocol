# Discovery

AAI uses on-demand loading via MCP resources to avoid context explosion.

## The Problem

Loading all app descriptors at once would flood the Agent's context:

```
50 apps × 10 tools × 500 tokens = 250,000 tokens
```

Progressive discovery solves this by loading only what's needed.

## Desktop App Discovery

### Descriptor Location

AAI-compatible macOS apps bundle their descriptor inside the app itself:

```
/Applications/YourApp.app/Contents/Resources/aai.json
~/Applications/YourApp.app/Contents/Resources/aai.json
```

### Scanning

Gateway scans for `aai.json` files in all installed app bundles on startup:

```bash
find /Applications ~/Applications -maxdepth 4 \
  -path "*/Contents/Resources/aai.json" 2>/dev/null
```

Gateway rebuilds the app list each startup. No persistent registry is needed — the filesystem is the source of truth.

## Web App Discovery

### Descriptor Location

Web apps publish their descriptor at a well-known URL:

```
https://yourapp.com/.well-known/aai.json
```

No registration with any central service is required.

### Auto-Fetch on Demand

Gateway fetches web app descriptors lazily when the agent needs them. The agent passes a URL as the resource URI:

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "https://notion.so"
  }
}

// Gateway → Agent (fetched from notion.so/.well-known/aai.json)
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [{
      "uri": "https://notion.so",
      "mimeType": "application/json",
      "text": "{ \"tools\": [...] }"
    }]
  }
}
```

Gateway caches the fetched descriptor locally and reuses it for subsequent calls (TTL: 24 hours).

### Name Resolution

The agent receives user intent in natural language (e.g. "帮我在 Notion 创建一个页面"). The agent is responsible for resolving the app name to a URL before calling `resources/read`.

**Resolution order:**

**1. User's cached mappings (highest priority)**

Gateway persists name→URL mappings learned from past sessions:

```json
// ~/.config/aai-gateway/name-cache.json
{
  "jira": "https://jira.mycompany.com",
  "our crm": "https://crm.internal.example.com"
}
```

**2. LLM inference**

For well-known apps, the agent infers the URL from its training knowledge:

```
"Notion"  → notion.so
"Gmail"   → mail.google.com
"GitHub"  → github.com
```

**3. Ask the user (fallback)**

If the agent cannot confidently resolve the name:

```
Agent: "I need to access your Jira instance. What's the URL?"
User: "jira.mycompany.com"
Agent: → calls resources/read("https://jira.mycompany.com")
       → Gateway fetches, caches descriptor
       → Gateway saves "jira" → "https://jira.mycompany.com" to name cache
```

The mapping is saved permanently. Next time the user says "Jira", the cached URL is used directly.

## Discovery Flow (Full)

### Step 1: List Available Apps

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}

// Gateway → Agent
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "app:com.apple.mail",
        "name": "Mail",
        "description": "Email client"
      },
      {
        "uri": "app:com.example.worklens",
        "name": "WorkLens",
        "description": "AI-powered task management"
      }
    ]
  }
}
```

`resources/list` returns **desktop apps only** (discovered from Bundle scan). Web apps are not listed here — they are fetched on demand.

### Step 2: Load App Descriptor On Demand

**Desktop app** (by app ID):

```json
{ "method": "resources/read", "params": { "uri": "app:com.apple.mail" } }
```

**Web app** (by URL):

```json
{ "method": "resources/read", "params": { "uri": "https://notion.so" } }
```

### Step 3: Call Tool

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "com.apple.mail:send_email",
    "arguments": {
      "to": ["alice@example.com"],
      "body": "Hello!"
    }
  }
}
```

Tool names are prefixed with the app ID to avoid collisions across apps.

## Context Usage

| Approach | Context Usage | When |
|----------|---------------|------|
| Load all | ~250k tokens | Never |
| Progressive (per app) | ~5k tokens | On demand |

Agent only loads a descriptor when the user's intent requires that specific app.

---

[Back to Spec Index](./README.md)
