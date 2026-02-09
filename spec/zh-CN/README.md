# AAI 协议规范索引

本目录包含 AAI（Agent App Interface）协议的完整技术规范。

## 规范文档

| 文档 | 描述 |
|------|------|
| [概述](./overview.md) | 为什么需要 AAI？动机、当前局限性以及双接口愿景 |
| [架构](./architecture.md) | 系统架构图、组件职责、核心原则 |
| [aai.json 描述文件](./aai-json.md) | 应用描述文件格式、文件位置、结构及所有字段说明 |
| [安全模型](./security.md) | 平台授权流程（macOS TCC、Windows COM、Linux Polkit） |
| [渐进式发现](./discovery.md) | 通过 MCP 资源模型的三步技能发现（list、read、call） |
| [错误码](./error-codes.md) | 标准化错误响应格式及错误码表 |
| [调用流程](./call-flow.md) | 完整的端到端调用流程示例 |
| [术语表](./glossary.md) | 关键术语定义 |

## 平台指南

| 平台 | 描述 |
|------|------|
| [macOS](./platforms/macos.md) | AppleScript / JXA 自动化，集成指南 |
| [Windows](./platforms/windows.md) | COM 自动化，集成指南 |
| [Linux](./platforms/linux.md) | DBus 自动化，集成指南 |
| [Web / SaaS](./platforms/web.md) | REST API + OAuth 2.0，SaaS 集成指南 |

## Schema 与示例

| 资源 | 描述 |
|------|------|
| [aai.schema.json](../schema/aai.schema.json) | 机器可读的 JSON Schema，用于 aai.json 校验 |
| [com.apple.mail.aai.json](../examples/com.apple.mail.aai.json) | 示例：Apple Mail（桌面应用，多平台） |
| [com.notion.api.aai.json](../examples/com.notion.api.aai.json) | 示例：Notion（Web/SaaS，OAuth + REST API） |
