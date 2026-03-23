# Gateway

**Spec version:** 0.3.0

The AAI Gateway is an MCP server that acts as a unified entry point for multiple capability backends. It never exposes raw tool definitions — only **app-level interfaces** with user-controlled exposure.

---

## Gateway Role

```
AI Client (Claude, GPT, etc.)
        │
        │ MCP
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    AAI Gateway                               │
│                                                              │
│  Input:  MCP ListTools / CallTool requests                  │
│  Output: App guides, operation results                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Tool Registry                            │   │
│  │  app:filesystem  →  AppGuide(operations: [...])      │   │
│  │  app:github      →  AppGuide(operations: [...])      │   │
│  │  aai:exec        →  Execute operations                │   │
│  │  remote:discover →  Fetch remote aai.json            │   │
│  │  mcp:import      →  Import MCP server                │   │
│  │  mcp:refresh     →  Refresh imported app              │   │
│  │  skill:import    →  Import skill                     │   │
│  │  import:config   →  Update exposure                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  MCP Servers    │  │  ACP Agents     │  │  CLI Tools      │
│  (stdio/HTTP)   │  │  (subprocess)    │  │  (spawn)        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Tool Interface

### App Tools (`app:*`)

One tool per discovered app. Each tool returns an **AppGuide** when called.

**Input:** None (or optional operation name for detailed guide)

**Output:** AppGuide

```typescript
interface AppGuide {
  localId: string;              // "filesystem"
  name: Record<string, string>; // { en: "Filesystem", zh: "文件系统" }
  description: string;          // From aai.json
  exposure: Exposure;           // Current exposure config
  operations: Operation[];      // Transformed from downstream tools
  source: 'local' | 'remote' | 'import';
}

interface Operation {
  name: string;   // "read"
  summary: string; // "Read a file from the filesystem"
  input: string;  // "{ path: string }"
  output: string; // "file contents as string"
}
```

### Meta Tools

| Tool | Input | Output |
|---|---|---|
| `aai:exec` | `{ appId, operation, args }` | Operation result |
| `remote:discover` | `{ url }` | Remote AppGuide preview |
| `mcp:import` | `{ command, args?, env? }` or `{ url }` | New app registered |
| `mcp:refresh` | `{ appId }` | Refreshed AppGuide |
| `skill:import` | `{ path }` or `{ url }` | New app registered |
| `import:config` | `{ appId, updates }` | Updated exposure |

---

## Request Routing

```
CallTool(name, args)
  │
  ├─ name.startsWith("app:")
  │    └─→ Return AppGuide (operations list)
  │
  ├─ name === "aai:exec"
  │    └─→ Lookup operation → Check consent → Route to executor
  │
  ├─ name === "remote:discover"
  │    └─→ Fetch aai.json from URL → Return preview
  │
  ├─ name === "mcp:import"
  │    └─→ Spawn/connect MCP server → Register app
  │
  ├─ name === "mcp:refresh"
  │    └─→ Reconnect MCP server → Regenerate guide
  │
  ├─ name === "skill:import"
  │    └─→ Load skill → Register as app
  │
  └─ name === "import:config"
       └─→ Update exposure in registry
```

---

## Consent Enforcement (Planned)

> **Note:** Consent enforcement is planned for a future spec version.

The gateway will enforce consent before routing to executors:

```typescript
// Planned future implementation
async function routeWithConsent(appId: string, operation: string, args: unknown) {
  const app = registry.get(appId);
  const capability = findRequiredCapability(app.descriptor.consent, operation);

  if (capability && !consentManager.isGranted(appId, capability.id)) {
    throw new AaiError('E_CONSENT_REQUIRED', `Operation '${operation}' requires consent.`, {
      appId,
      operation,
      capabilityId: capability.id
    });
  }

  return executor.execute(app, operation, args);
}
```

---

## Configuration

```json
{
  "gateway": {
    "appDirs": ["./apps", "~/.local/share/aai/apps"],
    "remoteHosts": ["https://aai.example.com"],
    "defaultExposure": "summary",
    "consentStore": "~/.config/aai/consent.json"
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `appDirs` | string[] | `[]` | Directories to scan for local `aai.json` files |
| `remoteHosts` | string[] | `[]` | Hosts to fetch remote `aai.json` from |
| `defaultExposure` | `"summary"` \| `"keywords"` | `"summary"` | Default exposure mode for discovered apps |
| `consentStore` | string | `~/.config/aai/consent.json` | Path to persistent consent storage |

---

## Startup Sequence

```
1. Load config (from file or environment)
2. Init registry (empty)
3. Init consent manager (load from consentStore)
4. Local scan → parse aai.json → register apps
5. Remote scan → fetch aai.json → register apps
6. Register meta tools (aai:exec, remote:discover, etc.)
7. Start MCP server (stdio or HTTP)
8. Ready for requests
```

---

## Transport Modes

### Stdio (default)

For local CLI tools and subprocess-based MCP servers:

```typescript
{
  transport: "stdio",
  // Gateway stdin/stdout used for MCP protocol
}
```

### Streamable HTTP

For remote MCP servers:

```typescript
{
  transport: "streamable-http",
  port: 3100,
  // Gateway listens on HTTP for MCP requests
}
```

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial gateway spec. |
| 0.3 | 2026-03-20 | App-level tools, meta tools, consent enforcement. |
