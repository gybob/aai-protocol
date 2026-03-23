# AAI Protocol Specification

> **Spec version: 0.3.0** — App-level MCP gateway with progressive disclosure.

---

## Overview

The AAI Protocol specification defines how apps are packaged, discovered, and executed behind a single MCP gateway — with **progressive disclosure** of capabilities.

**Key principle**: Raw tool definitions are never exposed upfront. Only app-level interfaces (via `summary` or `keywords`) are visible to AI clients. Detailed operation guides are generated on demand.

---

## Specification Documents

| Document | Description |
|---|---|
| [AAI JSON](aai-json.md) | App manifest format (`aai.json` structure and fields) |
| [Architecture](architecture.md) | Gateway internals, data flow, and progressive disclosure |
| [Discovery](discovery.md) | How the gateway finds and registers apps |
| [Gateway](gateway.md) | Tool interface, routing, and configuration |
| [Security](security.md) | Authentication, authorization, and trust |
| [MCP Bridge](mcp-bridge.md) | MCP server integration (stdio and HTTP) |
| [Error Codes](error-codes.md) | Machine-readable error code registry |

---

## Core Concepts

### App

An **app** is a capability bundle with an `aai.json` manifest. Apps can wrap MCP servers, CLI tools, ACP agents, skills, or remote services.

### Exposure Mode

How an app is presented to AI clients:

| Mode | AI Sees | Use When |
|---|---|---|
| `summary` | Natural language description | Clear, distinct purpose; automatic triggering |
| `keywords` | Keyword trigger set | Overlapping domains; explicit control |

### App Guide

When an app is called, the gateway returns an **AppGuide** — a user-friendly list of operations the app supports. Raw downstream tool schemas are never exposed directly.

### Consent

Apps can declare **consent requirements** for sensitive operations (e.g., filesystem write). The gateway enforces consent before execution.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-12-19 | Initial spec with MCP-only backend. |
| 0.2 | 2026-01-15 | Added CLI, skill, and ACP agent protocols. |
| 0.3 | 2026-03-20 | App-level exposure model with summary/keywords modes and progressive disclosure. |

---

## Implementations

- [aai-gateway](https://github.com/example/aai-gateway) — Reference gateway implementation in TypeScript/Node.js
