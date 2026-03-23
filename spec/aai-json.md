# AAI JSON

**Spec version:** 0.3.0  
**Status:** Draft

`aai.json` is the discovery and capability manifest for AAI-compliant apps. It is the **only** file a gateway ever needs to find, trust, and use an app.

---

## Core Principles

| Principle | Implication |
|---|---|
| **Single URL** | One URL per app. Apps can live anywhere — CDN, static hosting, serverless. |
| **Single manifest** | No app registry. No package managers. The manifest is the app. |
| **Human-readable by design** | `summary` and `keywords` are for AI consumption — but they are plain text, not binary blobs. |
| **Zero coupling** | The gateway does not install, run, or manage app lifecycle. It only fetches a manifest and executes operations on demand. |
| **Progressive disclosure** | Raw tool definitions are never exposed upfront. Only app-level metadata is visible; detailed guides are fetched on demand. |

---

## App-Level vs Tool-Level Exposure

AAI Gateway operates at **app level**, not tool level. Tools are grouped into apps and only the app interface is visible initially.

```
┌─────────────────────────────────────────────────────┐
│              AAI Gateway (MCP Client)               │
├─────────────────────────────────────────────────────┤
│  ListTools → only apps visible (app:*)              │
│  Raw tool definitions NOT exposed upfront           │
├─────────────────────────────────────────────────────┤
│  Call app:filesystem                                │
│  → returns app guide (operation list + details)    │
│  → user/AI selects operation                       │
│  → aai:exec with operation name + args             │
│  → gateway calls downstream tool                   │
└─────────────────────────────────────────────────────┘
```

This keeps context small. The AI sees an app description, not dozens of raw tool schemas.

---

## Exposure Modes

Apps support two exposure modes, chosen by the user at import time:

| Mode | Description | Use When |
|---|---|---|
| `summary` | Natural language description of the app's purpose and capabilities | You want the AI to automatically understand when to use this app |
| `keywords` | Compact keyword set triggering app usage | You want to explicitly mention keywords to trigger; leaves room for more tools |

Both modes expose the same app interface — only the trigger mechanism differs.

---

## Manifest Structure

```json
{
  "aai": "0.3",
  "app": { ... },
  "exposure": { ... },
  "access": { ... }
}
```

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `aai` | string | ✅ | Format version. Must be `"0.3"`. |
| `app` | App | ✅ | App identity and localization. |
| `exposure` | Exposure | ✅ | What the gateway exposes to AI clients. |
| `access` | Access | ✅ | How the gateway reaches the app backend. |

---

## App

```json
{
  "name": {
    "en": "Filesystem",
    "zh": "文件系统"
  },
  "description": "Read, write, and navigate the local filesystem."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | Record\<string, string\> | ✅ | Localized app names. Must include at least `"en"`. |
| `description` | string | ❌ | Short description for general discovery (shown in remote:discover results). |

---

## Exposure

```json
{
  "mode": "summary",
  "summary": "Read, write, and navigate the local filesystem. Use for checking configs, reading project files, or writing logs.",
  "keywords": ["filesystem", "file", "read", "write", "edit", "folder", "directory"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `"summary"` \| `"keywords"` | ✅ | How this app is exposed to AI clients. |
| `summary` | string | When `mode` is `"summary"` | Natural language description of what this app does and when to use it. |
| `keywords` | string[] | When `mode` is `"keywords"` | Trigger keywords. The AI uses these to decide when to call the app. |

### Mode Selection Guide

**Use `summary` when:**
- The app has a clear, distinct purpose
- You want the AI to infer when to use it without explicit trigger words
- Context window efficiency is a priority

**Use `keywords` when:**
- The app overlaps with many others (sharing keywords is fine)
- You want explicit, precise control over triggering
- You plan to have many apps and need fine-grained disambiguation

---

## Access

```json
{
  "protocol": "mcp",
  "config": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/repo"]
  }
}
```

### Protocol: `mcp`

For local stdio MCP servers:

```json
{
  "protocol": "mcp",
  "config": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/repo"],
    "env": { "DEBUG": "1" },
    "cwd": "/workspace"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | ✅ | Executable to launch. |
| `args` | string[] | ❌ | Command arguments. |
| `env` | Record\<string, string\> | ❌ | Environment variables. |
| `cwd` | string | ❌ | Working directory. |

For remote MCP servers:

```json
{
  "protocol": "mcp",
  "config": {
    "url": "https://mcp.example.com/transport",
    "headers": { "Authorization": "Bearer <token>" }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | ✅ | Remote MCP endpoint URL. |
| `headers` | Record\<string, string\> | ❌ | HTTP headers (e.g., Authorization). |
| `transport` | `"streamable-http"` \| `"sse"` | ❌ | Transport type. Defaults to `"streamable-http"`. |

### Protocol: `acp-agent`

For ACP agent backends:

```json
{
  "protocol": "acp-agent",
  "config": {
    "agentId": "filesystem-agent",
    "command": "uvx",
    "args": ["aai-agent-filesystem"],
    "env": { "FILESYSTEM_ROOT": "/repo" }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `agentId` | string | ✅ | ACP agent identifier. |
| `command` | string | ✅ | Executable to launch. |
| `args` | string[] | ❌ | Command arguments. |
| `env` | Record\<string, string\> | ❌ | Environment variables. |

### Protocol: `cli`

For CLI-backed apps:

```json
{
  "protocol": "cli",
  "config": {
    "command": "gh",
    "subcommands": ["issue", "pr", "repo"]
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | ✅ | CLI executable. |
| `subcommands` | string[] | ❌ | Known subcommands for guide generation. |

### Protocol: `skill`

For skill-backed apps (referencing a skill by path or URL):

```json
{
  "protocol": "skill",
  "config": {
    "path": "/path/to/skill"
  }
}
```

Or for remote skills:

```json
{
  "protocol": "skill",
  "config": {
    "url": "https://example.com/skill"
  }
}
```

---

## Examples

### Minimal manifest

```json
{
  "aai": "0.3",
  "app": {
    "name": { "en": "Hello World" }
  },
  "exposure": {
    "mode": "summary",
    "summary": "Prints hello world messages."
  },
  "access": {
    "protocol": "cli",
    "config": { "command": "echo", "args": ["Hello, World!"] }
  }
}
```

### Full manifest

```json
{
  "aai": "0.3",
  "app": {
    "name": { "en": "Filesystem", "zh": "文件系统" },
    "description": "Read, write, and navigate the local filesystem."
  },
  "exposure": {
    "mode": "keywords",
    "keywords": ["filesystem", "file", "read", "write", "edit", "folder", "directory"]
  },
  "access": {
    "protocol": "mcp",
    "config": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/repo"]
    }
  }
}
```

---

## Discovery Flow

```
1. Gateway starts
2. Scan local config directories for aai.json files
3. Register each app in the local registry
4. For each app:
   a. Read aai.json
   b. Validate required fields
   c. Generate app guide (operation details via downstream protocol)
   d. Register app under localId
5. Expose apps via MCP ListTools (app:* tools)
6. On app:* call → return app guide
7. On aai:exec → call downstream tool, return result
```

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial draft. |
| 0.2 | 2026-01-15 | Added CLI and skill protocols. |
| 0.3 | 2026-03-20 | App-level exposure model with summary/keywords modes. |

---

## Implementations

- [aai-gateway](https://github.com/example/aai-gateway) — Reference gateway implementation
