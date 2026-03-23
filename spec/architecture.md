# Architecture

**Spec version:** 0.3.0

AAI Gateway is an MCP server that acts as a **smart proxy** — it speaks MCP to clients, but delegates actual work to a variety of backends (other MCP servers, ACP agents, CLI tools, skills, or remote apps discovered via URL).

The gateway never exposes raw tool definitions upfront. Instead, it exposes **app-level interfaces** with user-selected exposure modes (`summary` or `keywords`), and generates detailed guides only when an app is actually invoked.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          AI Client                                │
│                   (Claude, GPT, Gemini, etc.)                     │
└──────────────────────────┬───────────────────────────────────────┘
                           │ MCP
┌──────────────────────────▼───────────────────────────────────────┐
│                      AAI Gateway                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Registry   │  │   Consent    │  │    Discovery Manager    │  │
│  │  (apps map) │  │   Manager    │  │  (local + remote scan)  │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                       │                │
│  ┌──────▼─────────────────▼───────────────────────▼────────────┐  │
│  │                  MCP Request Handlers                         │  │
│  │  • ListTools → app:* + meta tools (no raw tools)             │  │
│  │  • CallTool → route to executor by protocol                  │  │
│  └──────┬─────────────────────────────────────────┬────────────┘  │
└─────────┼─────────────────────────────────────────┼────────────────┘
          │                                         │
          ▼                                         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│  MCP Executor   │  │  ACP Executor   │  │     CLI Executor        │
│  (stdio/HTTP)   │  │  (agent proxy)   │  │  (child_process spawn)  │
└─────────────────┘  └─────────────────┘  └─────────────────────────┘
          │                   │                         │
          ▼                   ▼                         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│  Raw MCP Server │  │  ACP Agent      │  │  CLI Tool              │
│  (e.g., filesystem,   │  (subprocess)  │  │  (echo, gh, git, etc.) │
│  brave-search, etc.)  │                │  │                        │
└─────────────────┘  └─────────────────┘  └─────────────────────────┘
```

---

## Core Components

### Registry

Stores discovered apps in memory as `RuntimeAppRecord`:

```typescript
interface RuntimeAppRecord {
  localId: string;           // derived from app name, unique per gateway
  descriptor: AaiJson;       // parsed aai.json
  guide?: AppGuide;           // generated on-demand
  importedAt: number;        // timestamp
  lastAccessed?: number;     // timestamp
}
```

Apps are registered via:
1. **Local discovery** — scanning configured directories for `aai.json` files
2. **Remote discovery** — fetching `https://<host>/.well-known/aai.json`
3. **Import tools** — `mcp:import`, `skill:import`, `import:config`

### Discovery Manager

Scans both local paths and remote URLs for `aai.json` manifests:

- **Local scan**: reads `aai.json` files from configured directories
- **Remote scan**: fetches `/.well-known/aai.json` from specified hosts
- **Import**: adds user-imported MCP servers or skills to the registry

### Consent Manager

Handles user consent for sensitive operations:

- Tracks granted/denied permissions per capability
- Shows consent dialogs when sensitive operations are first called
- Persists consent decisions in secure storage
- Supports capability-level and operation-level consent

### MCP Request Handlers

#### ListTools Handler

Returns **only app-level tools** — never raw tool definitions:

```typescript
// Always registered:
'aai:exec'      // Execute an operation for a discovered app
'remote:discover' // Discover a remote app via URL
'mcp:import'    // Import a new MCP server
'mcp:refresh'   // Refresh an imported MCP app
'skill:import'  // Import a local or remote skill
'import:config' // Inspect or update exposure metadata

// Per-app (one tool per discovered app):
'app:<localId>' // App guide (operation list + descriptions)
```

The AI client sees app names and summaries/keywords, not individual tool schemas.

#### CallTool Handler

Routes execution by name prefix:

| Tool Name Pattern | Handler |
|---|---|
| `app:*` | Return app guide (operations list + detailed guide for specific operation) |
| `aai:exec` | Execute an operation via the appropriate executor |
| `remote:discover` | Fetch and return guide from a remote `aai.json` |
| `mcp:import` | Import an MCP server and register it |
| `mcp:refresh` | Refresh an imported MCP app's exposure |
| `skill:import` | Import a skill and register it |
| `import:config` | Update exposure metadata for an imported app |

### Executors

Each protocol has its own executor:

| Protocol | Executor | Transport |
|---|---|---|
| `mcp` (stdio) | `McpExecutor` | Child process with stdio |
| `mcp` (HTTP) | `McpExecutor` | HTTP/WebSocket |
| `acp-agent` | `AcpExecutor` | Subprocess + stdio/json-rpc |
| `cli` | `CliExecutor` | Child process spawn |
| `skill` | `SkillExecutor` | Direct function call |

---

## Progressive Disclosure Flow

### Step 1: Discovery (at gateway startup or user import)

```
Discovery Manager scans:
├── Local config directories → aai.json files
├── Remote hosts → /.well-known/aai.json
└── User imports → mcp:import, skill:import

For each discovered app:
1. Parse aai.json
2. Derive localId from app name
3. Generate exposure (summary or keywords) based on user choice
4. Store in registry
```

### Step 2: ListTools (when AI client connects)

```
Gateway returns only app-level tools:
[
  { name: "app:filesystem", description: "Filesystem. Guide only." },
  { name: "app:github", description: "GitHub CLI. Guide only." },
  { name: "aai:exec", description: "Execute an app operation." },
  { name: "remote:discover", description: "Discover a remote app." },
  { name: "mcp:import", description: "Import an MCP server." },
  { name: "mcp:refresh", description: "Refresh an imported MCP app." },
  { name: "skill:import", description: "Import a skill." },
  { name: "import:config", description: "Update exposure metadata." }
]
```

### Step 3: App Selection (AI client calls app:filesystem)

```
1. Client calls "app:filesystem"
2. Gateway checks registry for localId
3. If guide not cached → call downstream protocol to get tool definitions
4. Generate AppGuide with operations list + details
5. Return guide to client (no raw tool exposure yet)
```

### Step 4: Operation Execution (AI client calls aai:exec)

```
1. Client calls "aai:exec" with { appId, operation, args }
2. Gateway checks consent (prompt if needed)
3. Route to appropriate executor (MCP/ACP/CLI/Skill)
4. Executor calls downstream tool
5. Return result to client
```

---

## App Guide Generation

When `app:<localId>` is called, the gateway generates an **AppGuide**:

```typescript
interface AppGuide {
  localId: string;
  name: Record<string, string>;        // Localized names
  description: string;                 // App description
  exposure: Exposure;                  // Original exposure config
  operations: Operation[];            // All available operations
}

interface Operation {
  name: string;                         // Operation identifier
  summary: string;                      // What this operation does
  input: string;                        // Input description
  output: string;                       // Output description
}
```

**Key design**: Raw tool schemas from downstream servers are never exposed directly. The gateway transforms them into user-friendly operation guides.

---

## Exposure Modes

### `summary` Mode

App is exposed as a single natural-language description:

```
"Filesystem: Read, write, and navigate the local filesystem. Use for checking configs, reading project files, or writing logs."
```

The AI reads this and decides when to use the app. No keywords needed.

### `keywords` Mode

App is exposed via a compact keyword set:

```
["filesystem", "file", "read", "write", "edit", "folder", "directory"]
```

The AI matches user input against keywords to decide when to trigger the app.

### Switching Modes

Users can switch exposure mode via `import:config`:

```typescript
// Change from summary to keywords
await tools['import:config']({
  appId: "filesystem",
  updates: {
    exposure: {
      mode: "keywords",
      keywords: ["filesystem", "file", "read", "write", "edit"]
    }
  }
});
```

---

## Consent Flow

```
1. App registered with consent requirements (operations: ["write", "edit"])
2. AI calls "aai:exec" with operation "write"
3. Consent Manager checks if consent already granted
4. If not → return consent_required error with capability details
5. User grants consent → Consent Manager stores decision
6. Retry "aai:exec" → proceeds to executor
```

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial architecture draft. |
| 0.2 | 2026-01-15 | Added CLI and skill protocols. |
| 0.3 | 2026-03-20 | App-level exposure model with progressive disclosure. |

---

## See Also

- [AAI JSON Spec](./aai-json.md) — App manifest format
- [Security](./security.md) — Authentication and authorization
- [MCP Bridge](./mcp-bridge.md) — MCP server integration
