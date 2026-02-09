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

## 组件职责

| 组件                                     | 职责                                       | 实现要求                                                      |
| ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| **Agent**（Cursor、Continue、LM Studio）  | 发起操作请求                                | 支持 MCP over stdio                                        |
| **AAI Gateway**                          | 将 MCP 请求转换为对目标应用的调用              | 长驻服务进程，支持 `--mcp` 模式                                |
| **目标应用**（Mail、Outlook、Calendar）    | 执行具体操作                                | 支持平台原生自动化 + 提供 `aai.json`                           |

## 核心原则

- **Gateway 是一个长驻服务进程**，与 Agent 保持持久连接
- **应用可处于任何状态**（运行中、已停止），Gateway 会自动处理
- **所有通信均通过平台原生自动化工具的 IPC 完成**
- **利用应用程序现有的自动化能力**，无需额外开发

---

[← 返回规范索引](./README.md)
