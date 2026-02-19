# System Architecture

## Architecture Overview

```mermaid
flowchart TB
    subgraph Agent["LLM Agent"]
        A1[OpenClaw / Claude / etc]
    end

    subgraph Gateway["AAI Gateway"]
        G1["MCP Interface<br/>resources/list, resources/read<br/>tools/call"]
        G2["Descriptor Parser<br/>JSON Schema validation"]
        G3["Execution Layer"]
        
        subgraph G3["Execution Layer"]
            E1["Desktop Executor<br/>JSON over IPC<br/>OS-managed auth"]
            E2["Web Executor<br/>JSON over HTTP<br/>OAuth 2.1"]
        end
        
        G1 --> G2 --> G3
    end

    subgraph Apps["Applications"]
        D1["Desktop App<br/>Native IPC + aai.json"]
        W1["Web App<br/>HTTP API + aai.json"]
    end

    Agent -->|"MCP over Stdio (JSON-RPC)"| G1
    E1 -->|"Native IPC"| D1
    E2 -->|"HTTP"| W1

    style Agent fill:#e1f5fe
    style Gateway fill:#fff3e0
    style Apps fill:#e8f5e9
```

## Core Design Principles

### 1. Abstract Descriptor

`aai.json` is a **platform-agnostic descriptor** that defines capabilities using JSON Schema. See [aai.json Descriptor](./aai-json.md).

### 2. Gateway Translates to Platform Execution

| Platform | Transport | Authorization |
|----------|-----------|---------------|
| Desktop | JSON over native IPC | Operating System |
| Web | JSON over HTTP | Gateway (OAuth 2.1) |

### 3. Progressive Discovery

Agents load tool definitions on-demand via MCP resources, avoiding context explosion.

## Data Flow

```
1. Agent → resources/list    → Gateway returns available apps
2. Agent → resources/read    → Gateway returns app descriptor
3. Agent → tools/call        → Gateway validates, executes, returns result
```

## Separation of Concerns

| Layer | Concern |
|-------|---------|
| **aai.json** | What the app can do (abstract) |
| **Gateway** | How to call it (platform-specific) |
| **App** | Execute the operation |

---

[Back to Spec Index](./README.md)
