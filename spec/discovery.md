# Discovery

**Spec version:** 0.3.0

Discovery is the process by which the gateway finds and registers apps. AAI supports three discovery methods:

1. **Local scan** — scanning configured directories for `aai.json` files
2. **Remote scan** — fetching `/.well-known/aai.json` from specified hosts
3. **Import tools** — user-initiated import of MCP servers, skills, or remote apps

---

## Discovery Methods

### Local Scan

The gateway scans configured local directories at startup:

```
Config: { "appDirs": ["/path/to/apps", "~/.local/share/aai/apps"] }

Scan each directory:
  /path/to/apps/
  ├── filesystem/aai.json
  ├── github/aai.json
  └── my-custom-app/aai.json
```

For each `aai.json` found:
1. Parse and validate the manifest
2. Derive `localId` from the directory name or `app.name`
3. Generate exposure based on user preference (summary or keywords)
4. Register in the gateway registry

### Remote Scan

The gateway fetches `aai.json` from well-known URLs:

```
Config: { "remoteHosts": ["https://aai.example.com"] }

For each host:
  GET https://aai.example.com/.well-known/aai.json
  → Returns manifest or redirect
```

Remote apps are imported as-is (exposure mode set to whatever the remote manifest declares).

### Import Tools

Users can manually import apps via gateway tools:

| Tool | Description |
|---|---|
| `mcp:import` | Import a local or remote MCP server |
| `skill:import` | Import a local or remote skill |
| `remote:discover` | Fetch and preview a remote `aai.json` |
| `import:config` | Update exposure metadata for an imported app |

---

## The Registry

All discovered apps are stored in the **gateway registry** as `RuntimeAppRecord`:

```typescript
interface RuntimeAppRecord {
  localId: string;           // Unique per gateway, e.g., "filesystem"
  descriptor: AaiJson;      // Parsed aai.json
  guide?: AppGuide;          // Generated on-demand
  exposure: Exposure;        // Current exposure (summary or keywords)
  importedAt: number;       // Timestamp
  lastAccessed?: number;     // Timestamp
  source: 'local' | 'remote' | 'import';
}
```

---

## localId Derivation

`localId` is derived deterministically from the app name:

```typescript
function deriveLocalId(name: Record<string, string>): string {
  const enName = name.en || Object.values(name)[0];
  return enName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Examples:
// { en: "Filesystem" }        → "filesystem"
// { en: "GitHub CLI" }        → "github-cli"
// { en: "我的应用" }           → "我的应用"
```

---

## App Guide Generation

The **AppGuide** is generated on-demand when an app is first called:

```typescript
interface AppGuide {
  localId: string;
  name: Record<string, string>;
  description: string;
  exposure: Exposure;
  operations: Operation[];
  source: 'local' | 'remote' | 'import';
}

interface Operation {
  name: string;         // e.g., "read", "write"
  summary: string;      // One-liner: "Read a file from the filesystem."
  input: string;       // Input description
  output: string;       // Output description
}
```

**Key design**: The guide is a *view* of the app's capabilities, not the raw tool schemas from downstream. The gateway transforms downstream tool definitions into user-friendly operation guides.

---

## Exposure Modes

### Summary Mode

```json
{
  "mode": "summary",
  "summary": "Read, write, and navigate the local filesystem. Use for checking configs, reading project files, or writing logs."
}
```

The AI reads this description and decides when to use the app. No explicit keyword matching needed.

### Keywords Mode

```json
{
  "mode": "keywords",
  "keywords": ["filesystem", "file", "read", "write", "edit", "folder", "directory"]
}
```

The AI matches user input against these keywords to decide when to trigger the app.

### Switching Modes

Users can switch modes via `import:config`:

```
import:config({ appId: "filesystem", updates: { exposure: { mode: "keywords", keywords: [...] } } })
```

---

## Discovery Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Gateway Startup                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Load config                                               │
│    └── appDirs, remoteHosts, preferences                    │
│                                                              │
│ 2. Local scan                                               │
│    └── Find aai.json in each appDir                         │
│    └── Validate manifest                                    │
│    └── Derive localId                                        │
│    └── Store in registry (exposure: default mode)           │
│                                                              │
│ 3. Remote scan                                               │
│    └── GET /.well-known/aai.json from each host             │
│    └── Validate manifest                                     │
│    └── Store in registry (exposure: from manifest)          │
│                                                              │
│ 4. Register meta tools                                      │
│    └── aai:exec, remote:discover, mcp:import, etc.          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Runtime (per request)                       │
├─────────────────────────────────────────────────────────────┤
│ ListTools:                                                   │
│   → Return all registered apps (app:*)                      │
│   → Only expose summary or keywords, not raw tools           │
│                                                              │
│ CallTool(app:*):                                             │
│   → Lookup app in registry                                   │
│   → Generate guide if not cached                            │
│   → Return app guide with operations list                    │
│                                                              │
│ CallTool(aai:exec):                                          │
│   → Lookup operation in guide                                │
│   → Check consent if required                               │
│   → Route to appropriate executor                            │
│   → Return result                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial discovery draft. |
| 0.3 | 2026-03-20 | App-level discovery with exposure modes. |
