# AAI (Agent App Interface)

<p align="center">
  <img src="./images/aai-protocol-diagram.png" alt="AAI Protocol" width="600" />
</p>

<p align="center">
  <strong>一个让任何应用都能被 AI Agent 使用的开放协议。</strong>
</p>

---

## 问题

AI Agent（Claude、GPT、Cursor 等）已经能操作 Apple Mail、Microsoft Outlook 等知名应用——因为大模型的训练数据中包含了这些应用的 AppleScript/COM 接口信息。

**但是你的应用呢？**

- **桌面应用**：即使你的应用支持 AppleScript、COM 或 DBus，大模型也从未见过你的文档。它不知道你的命令名称、参数格式、数据模型。**你的应用对 Agent 来说是隐形的。**
- **SaaS 应用**：你的服务有 REST API，但 Agent 不知道你的接口地址、认证方式、请求格式。没有标准化的描述文件，**你的 API 只是一个未被发现的 URL。**
- **完全没有自动化接口的应用**：Agent 根本无法触及。

## 解决方案

AAI 为每个应用——无论桌面应用还是 SaaS 服务——提供一个**标准化的、机器可读的描述文件**（`aai.json`），告诉 Agent 你的应用能做什么、怎么调用。

```
没有 AAI:
  Agent 知道 Apple Mail          ✅  (在大模型训练数据中)
  Agent 知道 Microsoft Word      ✅  (在大模型训练数据中)
  Agent 知道你的桌面应用          ❌  (从未见过)
  Agent 知道你的 SaaS API        ❌  (从未见过)

有了 AAI:
  Agent 通过 aai.json 发现你的应用      ✅
  Agent 读取工具定义                    ✅
  Agent 直接调用（IPC 或 API）          ✅
```

**一个 `aai.json` 文件，让你的应用从隐形变为完全可被 Agent 调用。**

## 谁会受益

### 应用开发者——让你的应用具备 Agent 能力

| 你的应用现状 | 没有 AAI | 有了 AAI |
|-------------|---------|---------|
| 知名桌面应用（Mail、Outlook） | Agent 已经知道它 | Agent 正式发现它 |
| 有自动化支持但大模型不认识的桌面应用 | **Agent 找不到也不会用** | Agent 自动发现并调用 |
| 有 REST API 的 SaaS 应用（Notion、你的 SaaS） | **Agent 不知道你的接口** | Agent 通过 aai.json 发现 API 工具 |
| 完全没有自动化/API 支持 | **完全不可达** | 添加接口 + `aai.json`，即可被 Agent 使用 |

关键洞察：**仅有 API 或自动化支持是不够的。** 没有标准化的描述文件，Agent 无法发现你的应用能力。AAI 就是"有接口"和"能被 Agent 使用"之间的桥梁。

### Agent 开发者——零集成成本

通过标准 MCP 连接任何支持 AAI 的应用。无需针对每个应用写定制代码，无需爬文档，无需硬编码命令。桌面应用和 SaaS 服务均适用。

### 用户——毫秒级响应，而非秒级等待

```
GUI 自动化:  截图 → OCR → 点击 → 等待      (每次操作 2-4 秒)
AAI:         MCP → Gateway → IPC/API → 完成  (1-10 毫秒)
```

## 工作原理

1. 应用提供 `aai.json` 描述自身工具（放置在 `~/.aai/<appId>/aai.json`）
2. AAI Gateway 自动发现并加载所有描述文件
3. Agent 通过标准 MCP（stdio）连接 Gateway
4. Agent 按需发现可用应用和工具
5. Gateway 执行调用：
   - **桌面应用** → 平台原生自动化（AppleScript / COM / DBus）
   - **SaaS 应用** → REST API 调用 + OAuth 2.0 / API Key 认证（Gateway 管理认证）

人类（通过 GUI）和 Agent（通过 AAI）访问同一套核心应用逻辑，互不干扰。

## 快速链接

| 资源 | 描述 |
|------|------|
| [协议规范](./spec/zh-CN/README.md) | 完整技术规范 |
| [aai.json Schema](./schema/aai.schema.json) | 机器可读的 JSON Schema |
| [示例：Apple Mail](./examples/com.apple.mail.aai.json) | 桌面应用描述文件 |
| [示例：Notion](./examples/com.notion.api.aai.json) | SaaS 应用描述文件（OAuth + REST） |
| [AAI Gateway](https://github.com/gybob/aai-protocol) | 参考实现 |

## 许可证

Apache 2.0
