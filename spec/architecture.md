# System Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          LLM Agent                               │
│                        (Cursor/Continue/etc)                     │
└────────────────────────┬────────────────────────────────────────┘
                          │ MCP over Stdio
                          ↓ JSON-RPC
┌─────────────────────────────────────────────────────────────────┐
│                      AAI Gateway                                │
│                 (Long-running MCP Server)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. MCP Server (stdio)                                    │  │
│  │    - resources/list                                       │  │
│  │    - resources/read                                       │  │
│  │    - tools/call                                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 2. Automation Executors (Platform-specific)               │  │
│  │    ┌────────────┐ ┌────────────┐ ┌────────────┐       │  │
│  │    │ macOS     │ │ Windows    │ │ Linux      │       │  │
│  │    │ AppleScript│ │  COM       │ │  DBus      │       │  │
│  │    │   / JXA    │ │ Automation │ │            │       │  │
│  │    └────────────┘ └────────────┘ └────────────┘       │  │
│  │    ┌────────────┐ ┌────────────┐                     │  │
│  │    │ Android    │ │   iOS      │                     │  │
│  │    │  Intent     │ │URL Scheme  │                     │  │
│  │    └────────────┘ └────────────┘                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 3. aai.json Parser                                        │  │
│  │    - Schema validation                                    │  │
│  │    - Automation script template parsing                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 4. Error Handling                                         │  │
│  │    - Standardized error codes                             │  │
│  │    - Friendly error messages                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────┬──────────────────────┘
          │                               │
          │ Platform Native               │ Platform Native
          │ Automation                    │ Automation
          ↓                               ↓
┌──────────────────────┐      ┌──────────────────────┐
│      macOS App        │      │     Windows App       │
│  (Mail, Calendar)    │      │ (Outlook, Word)       │
│                      │      │                      │
│  AppleScript / JXA    │      │  COM Automation       │
│  (AppleEvents IPC)    │      │  (COM IPC)            │
│                      │      │                      │
│  + aai.json          │      │  + aai.json           │
└──────────────────────┘      └──────────────────────┘
```

## Component Responsibilities

| Component                                | Responsibilities                           | Implementation Requirements                               |
| ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| **Agent** (Cursor, Continue, LM Studio)  | Initiates operation requests               | Supports MCP over stdio                                   |
| **AAI Gateway**                          | Translates MCP requests -> calls target App | Long-running service process, supports `--mcp` mode       |
| **Target App** (Mail, Outlook, Calendar) | Executes specific operations               | Supports platform-native automation + provides `aai.json` |

## Key Principles

- **Gateway is a long-running service process** that maintains a persistent connection with the Agent
- **App can be in any state** (running, stopped), Gateway handles automatically
- **All communication is done via platform-native automation tools' IPC**
- **Leverages application's existing automation capabilities**, no additional development needed

---

[Back to Spec Index](./README.md)
