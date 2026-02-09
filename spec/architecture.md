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
│  │ 2. Automation Executors                                   │  │
│  │                                                           │  │
│  │    Desktop (Platform-native IPC)                          │  │
│  │    ┌────────────┐ ┌────────────┐ ┌────────────┐        │  │
│  │    │ macOS      │ │ Windows    │ │ Linux      │        │  │
│  │    │ AppleScript│ │ COM        │ │ DBus       │        │  │
│  │    │ / JXA      │ │ Automation │ │            │        │  │
│  │    └────────────┘ └────────────┘ └────────────┘        │  │
│  │                                                           │  │
│  │    Web / SaaS (REST API + Auth)                           │  │
│  │    ┌─────────────────────────────────────────────┐      │  │
│  │    │ REST API Executor                           │      │  │
│  │    │ + OAuth 2.0 / API Key / Bearer Token        │      │  │
│  │    │ + Token Storage & Auto-Refresh              │      │  │
│  │    └─────────────────────────────────────────────┘      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 3. aai.json Parser                                        │  │
│  │    - Schema validation                                    │  │
│  │    - Script / endpoint template parsing                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 4. Error Handling                                         │  │
│  │    - Standardized error codes                             │  │
│  │    - Friendly error messages                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬──────────────────┬──────────────────┬────────────────┘
          │                  │                  │
          │ Platform IPC     │ Platform IPC     │ HTTPS
          ↓                  ↓                  ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│   Desktop App     │ │  Desktop App  │ │    SaaS / Web App    │
│  (Mail, Calendar) │ │ (Outlook,Word)│ │  (Notion, Slack,     │
│                   │ │               │ │   GitHub, Jira...)   │
│  AppleScript/JXA  │ │ COM Automation│ │                      │
│  (AppleEvents)    │ │ (COM IPC)     │ │  REST API + OAuth    │
│                   │ │               │ │                      │
│  + aai.json       │ │ + aai.json    │ │  + aai.json          │
└──────────────────┘ └──────────────┘ └──────────────────────┘
```

## Component Responsibilities

| Component | Responsibilities | Implementation Requirements |
|-----------|------------------|-----------------------------|
| **Agent** (Cursor, Continue, LM Studio) | Initiates operation requests | Supports MCP over stdio |
| **AAI Gateway** | Translates MCP requests -> calls target App | Long-running service process, supports `--mcp` mode |
| **Desktop App** (Mail, Outlook, Calendar) | Executes specific operations | Supports platform-native automation + provides `aai.json` |
| **Web / SaaS App** (Notion, Slack, GitHub) | Executes operations via API | Has REST API + provides `aai.json` |

## Key Principles

- **Gateway is a long-running service process** that maintains a persistent connection with the Agent
- **Desktop apps can be in any state** (running, stopped), Gateway handles automatically
- **Desktop communication uses platform-native IPC** (AppleScript, COM, DBus)
- **Web/SaaS communication uses HTTPS** with OAuth 2.0 / API Key authentication
- **Gateway manages all authentication state** (token storage, refresh, injection)
- **Leverages existing interfaces** -- both desktop automation and REST APIs require no additional development

---

[Back to Spec Index](./README.md)
