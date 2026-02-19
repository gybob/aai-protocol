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
            E1["macOS Executor<br/>JSON over Apple Events"]
            E2["Web Executor<br/>JSON over HTTP"]
            E3["..."]
        end
        
        G1 --> G2 --> G3
    end

    subgraph Apps["Applications"]
        D1["macOS App<br/>Apple Events + aai.json"]
        W1["Web App<br/>HTTP API + aai.json"]
        X1["..."]
    end

    Agent -->|"MCP over Stdio (JSON-RPC)"| G1
    E1 -->|"Apple Events"| D1
    E2 -->|"HTTP"| W1

    style Agent fill:#e1f5fe
    style Gateway fill:#fff3e0
    style Apps fill:#e8f5e9
```

## Core Design Principles

### 1. Abstract Descriptor

`aai.json` is a **platform-agnostic descriptor** that defines capabilities using JSON Schema. See [aai.json Descriptor](./aai-json.md).

### 2. Pluggable Executors

Gateway uses platform-specific executors. Each executor handles transport and authorization:

| Platform | Transport | Authorization |
|----------|-----------|---------------|
| macOS | JSON over Apple Events | Operating System |
| web | JSON over HTTP | OAuth 2.1 |
| linux | JSON over IPC (TBD) | Operating System |
| windows | JSON over IPC (TBD) | Operating System |
| ... | ... | ... |

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
| **Gateway** | How to call it (platform-specific executor) |
| **App** | Execute the operation |

---

[Back to Spec Index](./README.md)
