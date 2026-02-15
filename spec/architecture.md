# System Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          LLM Agent                               │
│                        (Cursor/Claude/etc)                       │
└────────────────────────┬────────────────────────────────────────┘
                          │ MCP over Stdio (JSON-RPC)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                        AAI Gateway                               │
│                   (Long-running MCP Server)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. MCP Interface                                           │  │
│  │    - resources/list, resources/read                        │  │
│  │    - tools/call                                            │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ 2. Descriptor Parser                                       │  │
│  │    - JSON Schema validation                                │  │
│  │    - Tool schema extraction                                │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ 3. Execution Layer                                         │  │
│  │                                                            │  │
│  │    Desktop Executor              Web Executor              │  │
│  │    ┌─────────────────┐         ┌─────────────────┐        │  │
│  │    │ JSON Protocol   │         │ REST API        │        │  │
│  │    │ over Native IPC │         │ + Auth Manager  │        │  │
│  │    │                 │         │   (OAuth 2.1)   │        │  │
│  │    └─────────────────┘         └─────────────────┘        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────┬──────────────────────────────────┬────────────────────┘
          │                                  │
          │ Native IPC                       │ HTTPS
          │ (OS handles auth)                │ (Gateway handles auth)
          ↓                                  ↓
┌──────────────────┐               ┌──────────────────────┐
│   Desktop App    │               │      Web App         │
│                  │               │                      │
│  Native IPC      │               │  REST API            │
│  + aai.json      │               │  + aai.json          │
└──────────────────┘               └──────────────────────┘
```

## Core Design Principles

### 1. Abstract Descriptor

`aai.json` is a **platform-agnostic descriptor** that defines capabilities using JSON Schema, similar to agent tool schemas. It contains no platform-specific terminology.

### 2. Gateway Handles Platform Details

The Gateway translates abstract tool definitions to platform-specific execution:
- **Desktop**: JSON protocol over native IPC (authorization handled by OS)
- **Web**: REST API calls with OAuth 2.1 (authorization handled by Gateway)

### 3. Progressive Discovery

Agents load tool definitions on-demand, avoiding context explosion.

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Agent** | Discovers apps, calls tools via MCP |
| **Gateway** | Parses descriptors, executes calls |
| **Desktop App** | Exposes tools via JSON/IPC protocol |
| **Web App** | Exposes REST API |

## Authorization Model

| Platform | Authorization Handler |
|----------|----------------------|
| Desktop | Operating System (TCC, etc.) |
| Web | Gateway (OAuth 2.1, API Keys) |

Desktop apps rely on the OS's native authorization mechanisms. The Gateway does not manage auth for desktop calls.

## Data Flow

```
1. Agent requests available apps → resources/list
2. Agent loads specific app descriptor → resources/read
3. Agent calls tool → tools/call
4. Gateway:
   - Validates parameters against tool schema
   - Routes to appropriate executor
   - Returns result
```

## Separation of Concerns

| Layer | Concern |
|-------|---------|
| **aai.json** | What the app can do (abstract) |
| **Gateway** | How to call it (platform-specific) |
| **App** | Execute the operation |

This separation allows:
- Same descriptor works across platforms
- Gateway updates without descriptor changes
- Apps implement only their core logic

---

[Back to Spec Index](./README.md)
