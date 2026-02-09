# AAI (Agent App Interface)

**AAI** 是一个开放协议，让 AI Agent 能够直接调用应用能力——跳过"看屏幕、模拟点击"这种缓慢而脆弱的方式。

> 从 GUI 到 AAI：Agent 时代的必然进化。

## 什么是 AAI？

- **对于应用开发者**：编写一个简单的 `aai.json` 描述文件，即可将应用能力暴露给 AI Agent。如果你的应用已支持平台自动化（AppleScript、COM、DBus），则无需任何代码改动。
- **对于 Agent 开发者**：通过标准 MCP 连接任何支持 AAI 的应用，无需定制集成。
- **对于用户**：让你的 AI Agent 直接控制应用——发送邮件、管理日历、编辑文档——毫秒级响应，而非秒级等待。

## 快速链接

| 资源 | 描述 |
|------|------|
| [协议规范](./spec/zh-CN/README.md) | 完整技术规范 |
| [aai.json Schema](./schema/aai.schema.json) | 机器可读的 JSON Schema |
| [示例](./examples/com.apple.mail.aai.json) | aai.json 描述文件示例 |
| [AAI Gateway](https://github.com/gybob/aai-protocol) | 参考实现 |

## 核心概念

```
Traditional:  Agent -> [Screenshot] -> [OCR] -> [Click] -> GUI -> App  (seconds)
AAI:          Agent -> [MCP] -> AAI Gateway -> [IPC] -> App            (milliseconds)
```

应用提供两套独立的接口：

- **GUI** -- 面向人类（可视化、直观）
- **AAI** -- 面向 Agent（结构化、可编程、可并行）

两者访问同一套核心业务逻辑，互不干扰。

## 协议概述

1. 应用在 `aai.json` 中描述自身能力（放置在 `~/.aai/<appId>/aai.json`）
2. AAI Gateway 自动发现并加载这些描述文件
3. Agent 通过标准 MCP（stdio）连接 Gateway
4. Gateway 将 MCP 请求翻译为平台原生自动化调用

详见[完整规范](./spec/zh-CN/README.md)。

## 许可证

CC BY-SA 4.0
