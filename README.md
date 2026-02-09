# AAI (Agent App Interface)

<p align="center">
  <img src="./images/aai-protocol-diagram.png" alt="AAI Protocol" width="600" />
</p>

<p align="center">
  <strong>An open protocol that makes any application accessible to AI Agents.</strong>
</p>

---

## The Problem

AI Agents (Claude, GPT, Cursor, etc.) can already operate well-known applications like Apple Mail or Microsoft Outlook -- because LLMs have seen their AppleScript/COM interfaces in training data.

**But what about your app?**

- **Desktop apps**: Even if your app supports AppleScript, COM, or DBus, the LLM has never seen your documentation. It doesn't know your command names, your parameters, or your data model. **Your app is invisible to Agents.**
- **SaaS apps**: Your service has a REST API, but the Agent doesn't know your endpoints, auth flow, or request format. Without a standardized descriptor, **your API is just another undiscovered URL.**
- **Apps with no automation at all**: Completely unreachable.

## The Solution

AAI gives every application -- desktop or SaaS -- a **standardized, machine-readable descriptor** (`aai.json`) that tells Agents exactly what your app can do and how to call it.

```
Without AAI:
  Agent knows Apple Mail        ✅  (in LLM training data)
  Agent knows Microsoft Word    ✅  (in LLM training data)
  Agent knows your desktop app  ❌  (never seen it before)
  Agent knows your SaaS API     ❌  (never seen it before)

With AAI:
  Agent discovers your app via aai.json  ✅
  Agent reads tool definitions           ✅
  Agent calls it directly (IPC or API)   ✅
```

**One `aai.json` file turns your app from invisible to fully Agent-accessible.**

## Who Benefits

### App Developers -- Make Your App Agent-Ready

| Your App's Situation | Without AAI | With AAI |
|----------------------|-------------|----------|
| Well-known desktop app (Mail, Outlook) | Agents already know it | Agents discover it formally |
| Desktop app with automation, unknown to LLMs | **Agent can't find or use it** | Agent discovers and calls it |
| SaaS with REST API (Notion, your SaaS) | **Agent doesn't know your endpoints** | Agent discovers API tools via aai.json |
| No automation / no API at all | **Completely unreachable** | Add interface + `aai.json`, Agent-ready |

The key insight: **Having an API or automation support is not enough.** Without a standardized descriptor, Agents have no way to discover your app's capabilities. AAI is the bridge between "having an interface" and "being Agent-accessible."

### Agent Developers -- Zero Integration Work

Connect to any AAI-enabled app through standard MCP. No per-app custom code, no scraping documentation, no hardcoding commands. Works for both desktop apps and SaaS services.

### Users -- Milliseconds, Not Seconds

```
GUI automation:  Screenshot → OCR → Click → Wait      (2-4 seconds per action)
AAI:             MCP → Gateway → IPC/API → Done        (1-10 milliseconds)
```

## How It Works

1. App provides `aai.json` describing its tools (placed in `~/.aai/<appId>/aai.json`)
2. AAI Gateway discovers and loads all descriptors
3. Agent connects to Gateway via standard MCP (stdio)
4. Agent discovers available apps and tools on demand
5. Gateway executes the call:
   - **Desktop apps** → platform-native automation (AppleScript / COM / DBus)
   - **SaaS apps** → REST API calls with OAuth 2.0 / API Key (Gateway handles auth)

Both humans (via GUI) and Agents (via AAI) access the same core application logic. Neither interferes with the other.

## Quick Links

| Resource | Description |
|----------|-------------|
| [Protocol Specification](./spec/README.md) | Full technical specification |
| [aai.json Schema](./schema/aai.schema.json) | Machine-readable JSON Schema |
| [Example: Apple Mail](./examples/com.apple.mail.aai.json) | Desktop app descriptor |
| [Example: Notion](./examples/com.notion.api.aai.json) | SaaS app descriptor (OAuth + REST) |
| [AAI Gateway](https://github.com/gybob/aai-protocol) | Reference implementation |

## License

Apache 2.0
