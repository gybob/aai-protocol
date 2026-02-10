# AAI (Agent App Interface)

<p align="center">
  <img src="./images/aai-protocol-diagram.png" alt="AAI Protocol" width="600" />
</p>

<p align="center">
  <strong>An open protocol that makes any application accessible to AI Agents.</strong>
</p>

---

## The AI Paradox: Two Events That Redefined the Software Landscape (Early 2026)

In January and February 2026, two events sent shockwaves through the technology industry:

**January 30, 2026 — A $285 Billion Rout Triggered by AI**

Anthropic released 11 industry-specific plugins for Claude Cowork—a tool that enables autonomous execution of multi-step workflows. One of these plugins could handle legal contract review, NDA triage, risk flagging, and compliance tracking.

The market reaction was immediate and brutal:

- **$285 billion wiped out in a single day**
- **Over $1 trillion erased from software sector within the week**
- Thomson Reuters plunged 15%+
- LegalZoom dropped 20%+
- Goldman Sachs' US software basket fell 6%—its worst day since April
- The sell-off cascaded globally: US, Asia, India, Japan, Hong Kong

Investors' fear: AI foundation models were no longer infrastructure—they were competing directly with software companies.

**February 4, 2026 — NVIDIA CEO's Rebuttal**

Five days later, at an AI conference hosted by Cisco Systems in San Francisco, NVIDIA CEO Jensen Huang addressed the panic head-on:

> "There is a view that tools in the software industry are declining and will be replaced by artificial intelligence... This is the most illogical thing in the world. The truth will reveal itself."

> "If you're human or AI—an artificial, general-purpose robot, would you use tools or reinvent tools? The answer is obviously to use tools... This is why the latest breakthroughs in AI are all about tool usage, because tool design is explicit."

Huang's core thesis: **AI will work with existing software tools, not replace them.** The design intent is collaboration, not substitution.

---

## The Key Insight

These two events reveal a crucial truth:

**The software industry will NOT be replaced by AI**—Jensen Huang is right. AI needs tools, needs data sources, needs structured capabilities.

**BUT: Applications that cannot be accessed by AI Agents are at high risk of obsolescence.**

Why? Because if an Agent cannot "use" your tool, it has to "reinvent" similar functionality—or choose an accessible alternative.

**Current State:**

| Application Type | Agent Accessibility | Risk |
|----------------|-------------------|--------|
| Well-known apps | ✅ Apple Mail, Outlook (in LLM training data) | Low |
| APIs without standardized descriptors | ❌ Agents don't know your endpoints | **High** |
| No automation at all | ❌ Agents cannot reach it | **Extreme** |

This is the core value of the AAI Protocol: **bridging the gap between "having an interface" and "being Agent-accessible."**

---

## The Problem

AI Agents (Claude, GPT, Cursor, etc.) can already operate well-known applications like Apple Mail or Microsoft Outlook -- because LLMs have seen their AppleScript/COM interfaces in training data.

**But what about your app?**

- **Desktop apps**: Even if your app supports AppleScript, COM, or DBus, LLMs have never seen your documentation. They don't know your command names, your parameters, or your data model. **Your app is invisible to Agents.**
- **Web Apps**: Your service has a REST API, but Agents don't know your endpoints, auth flow, or request format. Without a standardized descriptor, **your API is just another undiscovered URL.**
- **Apps with no automation at all**: Completely unreachable.

## The Solution

AAI gives every application -- desktop or Web App -- a **standardized, machine-readable descriptor** (`aai.json`) that tells Agents exactly what your app can do and how to call it.

```
Without AAI:
  Agent knows Apple Mail        ✅  (in LLM training data)
  Agent knows Microsoft Word    ✅  (in LLM training data)
  Agent knows your desktop app  ❌  (never seen it before)
  Agent knows your Web App API   ❌  (never seen it before)

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
| Web App with REST API (Notion, your Web App) | **Agent doesn't know your endpoints** | Agent discovers API tools via aai.json |
| No automation / no API at all | **Completely unreachable** | Add interface + `aai.json`, Agent-ready |

The key insight: **Having an API or automation support is not enough.** Without a standardized descriptor, Agents have no way to discover your app's capabilities. AAI is the bridge between "having an interface" and "being Agent-accessible."

### Agent Developers -- Zero Integration Work

Connect to any AAI-enabled app through standard MCP. No per-app custom code, no scraping documentation, no hardcoding commands. Works for both desktop apps and Web Apps.

### Users -- Milliseconds, Not Seconds

```
GUI automation:  Screenshot → OCR → Click → Wait      (2-4 seconds per action)
AAI:             MCP → Gateway → IPC/API → Done        (1-10 milliseconds)
```

## How It Works

1. App provides `aai.json` describing its tools:
   - **Desktop apps** → placed in `~/.aai/<appId>/aai.json`
   - **Web Apps** → hosted on their domain, registered to [AAI Registry](https://aai-protocol.com)
2. AAI Gateway discovers and loads all descriptors (local scan + registry fetch)
3. Agent connects to Gateway via standard MCP (stdio)
4. Agent discovers available apps and tools on demand
5. Gateway executes the call:
   - **Desktop apps** → platform-native automation (AppleScript / COM / DBus)
   - **Web Apps** → REST API calls with OAuth 2.0 / API Key (Gateway handles auth, user confirms domain before first authorization)

Both humans (via GUI) and Agents (via AAI) access the same core application logic. Neither interferes with the other.

## Quick Links

| Resource | Description |
|----------|-------------|
| [Protocol Specification](./spec/README.md) | Full technical specification |
| [aai.json Schema](./schema/aai.schema.json) | Machine-readable JSON Schema |
| [Example: Apple Mail](./examples/com.apple.mail.aai.json) | Desktop app descriptor |
| [Example: Notion](./examples/com.notion.api.aai.json) | Web App descriptor (OAuth + REST) |
| [AAI Gateway](https://github.com/gybob/aai-protocol) | Reference implementation |

## License

Apache 2.0
