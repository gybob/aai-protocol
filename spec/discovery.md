# Discovery

## Overview

AAI Gateway uses a **guide-based discovery model** that minimizes context explosion while enabling progressive app discovery. Instead of exposing all tools upfront, Gateway provides app entries that return operation guides on demand.

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

### On-Demand Fetch

Web app descriptors are fetched lazily via the `web:discover` tool when the agent needs them.

## MCP Interface

### tools/list

Returns all discovered desktop apps plus universal tools for web discovery and execution:

```json
{
  "tools": [
    {
      "name": "app:com.apple.reminders",
      "description": "【Reminders|提醒事项|Rappels】macOS reminders app. Aliases: reminder, todo, 待办. Call to get guide.",
      "inputSchema": { "type": "object", "properties": {} }
    },
    {
      "name": "app:com.apple.mail",
      "description": "【Mail|邮件】macOS email client. Aliases: mail, email. Call to get guide.",
      "inputSchema": { "type": "object", "properties": {} }
    },
    {
      "name": "web:discover",
      "description": "Discover web app guide. Use when user mentions a web service. Supports URL/domain/name.",
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
    {
      "name": "aai:exec",
      "description": "Execute app operation. Parameters: app, tool, args. Use after reading guide.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "app": { "type": "string", "description": "App ID or URL" },
          "tool": { "type": "string", "description": "Operation name" },
          "args": { "type": "object", "description": "Parameters" }
        },
        "required": ["app", "tool"]
      }
    }
  ]
}
```

**Context Efficiency**: Only `O(apps + 2)` entries instead of `O(apps × tools)`.

### Description Format

App descriptions follow this pattern for optimal agent matching:

```
【{multi-language-names}】{description}. Aliases: {alias-list}. Call to get guide.
```

- **Multi-language names**: From `app.name` field (pipe-separated)
- **Description**: From `app.description` field
- **Aliases**: From `app.aliases` field (comma-separated)

### App Matching

Agents match user intent to apps using:

1. **Multi-language names**: User says "提醒事项" → matches `app:com.apple.reminders`
2. **Aliases**: User says "todo" → matches via aliases
3. **Fuzzy matching**: Agent's LLM capabilities handle variations

## Discovery Flow

### Desktop App Flow

```
User: "帮我在提醒事项里创建提醒"

1. tools/list → Agent sees "【Reminders|提醒事项|Rappels】"
2. Match "提醒事项" → app:com.apple.reminders
3. tools/call("app:com.apple.reminders", {}) → Returns operation guide
4. tools/call("aai:exec", {app, tool, args}) → Executes operation
```

### Web App Flow

```
User: "帮我在 Notion 里创建页面"

1. tools/list → No matching app found
2. tools/call("web:discover", {url: "notion.com"}) → Returns Notion guide
3. tools/call("aai:exec", {app: "https://api.notion.com", tool, args}) → Executes
```

## Operation Guide Format

When calling `app:*` or `web:discover`, Gateway returns a guide:

```markdown
# Reminders Operation Guide

## App Info

- ID: com.apple.reminders
- Platform: macos

## Authentication

Uses OS-level consent (TCC). First execution shows native dialog.

## Available Operations

### create_reminder

Create a new reminder

**Parameters**:

- title (string, required): Reminder title
- due (string, optional): Due datetime YYYY-MM-DD HH:MM
- list (string, optional): List name

**Example**:
aai:exec({
app: "com.apple.reminders",
tool: "create_reminder",
args: { title: "Submit report", due: "2024-12-31 15:00" }
})

---

Use aai:exec tool to execute operations.
```

## Name Resolution (Web Apps)

When agent calls `web:discover`, Gateway:

1. Normalizes URL input (adds `https://`, handles domain-only)
2. Fetches `.well-known/aai.json`
3. Caches descriptor (TTL: 24 hours)
4. Generates and returns operation guide

**URL Input Formats**:

- Full URL: `https://api.example.com`
- Domain: `api.example.com` → `https://api.example.com`
- Service name: Agent infers URL from knowledge

## Local Storage

| Data                 | Location                               | Format         |
| -------------------- | -------------------------------------- | -------------- |
| Web descriptor cache | `~/.cache/aai-gateway/<host>/aai.json` | JSON + `.meta` |
| Consent decisions    | OS Keychain                            | Encrypted      |
| OAuth tokens         | OS Keychain                            | Encrypted      |

---

[Back to Spec Index](./README.md)
