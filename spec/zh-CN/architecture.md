# 系统架构

## 架构图

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

## 组件职责

| 组件 | 职责 | 实现要求 |
|------|------|----------|
| **Agent** (Cursor, Continue, LM Studio) | 发起操作请求 | 支持 MCP over stdio |
| **AAI Gateway** | 将 MCP 请求转换为对目标应用的调用 | 长驻服务进程，支持 `--mcp` 模式 |
| **桌面应用** (Mail, Outlook, Calendar) | 执行具体操作 | 支持平台原生自动化 + 提供 `aai.json` |
| **Web / SaaS 应用** (Notion, Slack, GitHub) | 通过 API 执行操作 | 具备 REST API + 提供 `aai.json` |

## 核心原则

- **Gateway 是一个长驻服务进程**，与 Agent 保持持久连接
- **桌面应用可以处于任何状态**（运行中、已停止），Gateway 自动处理
- **桌面通信使用平台原生 IPC**（AppleScript、COM、DBus）
- **Web/SaaS 通信使用 HTTPS**，采用 OAuth 2.0 / API Key 认证
- **Gateway 管理所有认证状态**（令牌存储、刷新、注入）
- **利用现有接口** -- 桌面自动化和 REST API 均无需额外开发

---

[返回规范索引](./README.md)
