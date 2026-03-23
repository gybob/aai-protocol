# AAI Protocol

> **App-level MCP gateway with progressive disclosure.**

[![Spec Version](https://img.shields.io/badge/spec-0.3.0-blue.svg)](spec/aai-json.md)
[![Status](https://img.shields.io/badge/status-draft-orange.svg)]()

**AAI (Agent App Interface) Protocol** is a lightweight specification for packaging, discovering, and executing capability-backed apps behind a single MCP gateway.

Instead of connecting one MCP server per app, AAI lets you expose **multiple apps through one MCP connection** — with full control over what the AI client sees upfront.

---

## The Problem

Traditional MCP setups require one connection per capability provider:

```
AI Client → MCP → filesystem server
AI Client → MCP → github server
AI Client → MCP → slack server
...
```

Every tool from every server is dumped into the context. This is noisy, expensive, and reveals capabilities before you need them.

## The Solution

AAI Gateway sits in front of everything and applies **progressive disclosure**:

```
AI Client → MCP → AAI Gateway → filesystem MCP server
                         → github MCP server
                         → slack MCP server
                         → CLI tools
                         → ACP agents
                         → Remote apps (via URL)
```

Only app-level interfaces are exposed upfront. Detailed tool execution happens on demand.

---

## Key Features

### Progressive Disclosure — App Level, Not Tool Level

Tools are grouped into **apps**. Only the app interface is visible to the AI client — never raw tool schemas.

Users choose how each app is exposed:

| Mode | Description |
|---|---|
| `summary` | Natural language description; AI infers when to use |
| `keywords` | Compact keyword set; explicit triggering with minimal context |

Both modes expose the same capability. Only the trigger mechanism differs.

### One Connection, Many Apps

One MCP connection to the gateway — it routes to any backend: MCP servers, ACP agents, CLI tools, skills, or remote apps.

### Human-Readable Discovery

All manifests are plain JSON with localized names and descriptions. No binary blobs, no proprietary formats.

### Consent-First

Sensitive operations (e.g., filesystem write) can declare consent requirements. The gateway enforces them before execution.

---

## How It Works

### 1. Apps Declare Capabilities in `aai.json`

```json
{
  "aai": "0.3",
  "app": {
    "name": { "en": "Filesystem", "zh": "文件系统" }
  },
  "exposure": {
    "mode": "summary",
    "summary": "Read, write, and navigate the local filesystem."
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

### 2. Gateway Exposes Only Apps

The AI client sees `app:filesystem`, not the 10 underlying MCP tools:

```
ListTools →
  app:filesystem  "Read, write, and navigate the local filesystem."
  app:github      "GitHub CLI for issues, PRs, and repos."
  aai:exec        "Execute an app operation."
```

### 3. On Demand, Detailed Guides

When `app:filesystem` is called, the gateway returns the operation guide — a human-friendly list of what this app can do:

```
app:filesystem →
  read(path)      → Read a file
  write(path, content) → Write a file
  list(dir)       → List directory contents
```

### 4. Execution via `aai:exec`

The AI calls `aai:exec` with `{ appId: "filesystem", operation: "read", args: { path: "/repo/README.md" } }`.

Gateway checks consent → routes to MCP server → returns result.

---

## Spec Overview

| Document | Description |
|---|---|
| [AAI JSON](spec/aai-json.md) | App manifest format (`aai.json` structure) |
| [Architecture](spec/architecture.md) | Gateway internals and data flow |
| [Security](spec/security.md) | Authentication and authorization |
| [MCP Bridge](spec/mcp-bridge.md) | MCP server integration |

---

## Implementations

### Gateway

- **[aai-gateway](https://github.com/example/aai-gateway)** — Reference gateway implementation in TypeScript/Node.js

### Apps

Apps are just directories with an `aai.json` manifest. See [example-apps/](example-apps/) for templates.

---

## Version History

| Version | Date | Summary |
|---|---|---|
| 0.1 | 2025-12-19 | Initial draft with MCP-only backend. |
| 0.2 | 2026-01-15 | Added CLI, skill, and ACP agent protocols. |
| 0.3 | 2026-03-20 | App-level exposure with summary/keywords modes. |

---

## Motivation

We built AAI because:

1. **Context is expensive.** Every tool definition in the context costs tokens.
2. **Discovery should be gradual.** Showing every capability upfront is overwhelming.
3. **Users should be in control.** Different users have different privacy and UX preferences.

AAI is our answer to "how do we expose many capabilities through one MCP connection without blowing up context size?"

---

## License

MIT
