# AAI (Agent App Interface)

**AAI** 是一个协议，让 AI Agent 通过应用的原生自动化接口直接交互——跳过"看屏幕、模拟点击"这种缓慢而脆弱的方式。

---

**从 GUI 到 AAI：Agent 时代的必然进化——从"看屏幕"到"直接执行"，应用与 Agent 交互的新范式。**

---

## Part I: 为什么需要 AAI？

### GUI vs AAI：两种交互范式的对比

```
┌─────────────────────────────────────────────────────────────────┐
│                      GUI 时代（过去）                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  人类 ↔ 应用                                                    │
│    ↓                                                            │
│  视觉界面（按钮、菜单、表单）                                    │
│    ↓                                                            │
│  鼠标点击、键盘输入                                              │
│    ↓                                                            │
│  GUI 事件处理                                                    │
│    ↓                                                            │
│  执行业务逻辑                                                    │
│                                                                 │
│  特点：                                                         │
│  • 专为人类设计的可视化界面                                       │
│  • 依赖视觉识别和定位                                             │
│  • 单线程、单焦点                                                 │
│  • Agent 必须模拟人类操作                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AAI 时代（未来）                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ↔ 应用                                                   │
│    ↓                                                            │
│  JSON 命令                                                       │
│    ↓                                                            │
│  自动化工具（AppleScript/COM/DBus）                              │
│    ↓                                                            │
│  原生 IPC 调用                                                  │
│    ↓                                                            │
│  执行业务逻辑                                                    │
│                                                                 │
│  特点：                                                         │
│  • 专为 Agent 设计的结构化接口                                    │
│  • 直接调用，无需视觉识别                                         │
│  • 支持并行、批量操作                                             │
│  • 人类和 Agent 各自独立访问                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 时代的呼唤：Agent 正在重塑生产力

2026年，像 **OpenClaw**、**Cowork**（Anthropic）这样的 AI Agent 正在改变我们与数字世界交互的方式。这些 Agent 越来越强大，能够理解复杂任务、规划执行步骤、协调多个工作流。

但现实是：**当 Agent 需要操作实际应用来完成工作时，它们仍然被迫像人类一样"看屏幕、点按钮"。**

这种"人类模拟"方式在 Agent 时代显得格格不入——就像让电力时代的工厂继续使用蒸汽机驱动皮带传送带一样。我们有更高效的方式。

---

### 现状：Agent 操作应用的效率瓶颈

#### 当前的自动化工具

| MCP 工具 | 用途 | 工作原理 | 操作流程 |
|-----------|------|----------|----------|
| **Playwright MCP** | 浏览器自动化 | 通过 CDP 直接连接浏览器 | 屏幕截取 → 图像处理 → OCR识别 → 定位元素 → 模拟点击 |
| **Chrome DevTools MCP** | Chrome 自动化 | WebSocket+JSON-RPC 协议 | 屏幕识别 → 定位坐标 → 模拟操作 |
| **Open Interpreter** | 计算机控制 | 截图+视觉识别 | 界面识别 → GUI 交互 |
| **Cursor / Continue** | AI 编程助手 | 混合方法 | 识别界面元素 → 模拟用户输入 |

**核心问题：这些工具本质上是"让 Agent 模拟人类操作 GUI"。**

#### 根本性限制

| 限制 | 说明 | 影响 |
|------|------|------|
| **速度慢：20-100倍的差距** | 屏幕OCR流程：截图(100ms) + 处理(200ms) + OCR识别(2000-4000ms) = **~2-4秒**；而直接 IPC 调用：**~1-10ms** | Agent 等待秒级响应，用户体验大幅下降 |
| **无法真正并行** | 桌面一次只能激活一个窗口，焦点切换耗时500-1000ms | Agent 无法同时协调多个应用，串行执行效率低下 |
| **脆弱且不稳定** | 依赖视觉识别，UI微调、弹窗、字体变化都会导致失败 | Agent 需要不断重试，可靠性无法保证 |

---

### 面向未来的应用应该是什么样？

#### 双接口架构：人类 + Agent

未来的应用不应该只是给人用的。它们应该提供**两套独立的接口**：

```
┌─────────────────────────────────────────────────────────────────┐
│                   面向未来的应用架构                        │
├─────────────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐      ┌──────────────────────┐ │
│  │   人类视觉界面       │      │   Agent 程序接口    │ │
│  │   (GUI)             │      │   (AAI)              │ │
│  │                      │      │                      │ │
│  │  • 按钮与表单        │      │  • 结构化技能          │ │
│  │  • 拖放与可视化        │      │  • 原生 IPC           │ │
│  │  • 即时反馈            │      │  • 并行调用支持         │ │
│  │  • 友好交互          │      │  • 类型安全参数         │ │
│  └──────────────────────┘      └──────────────────────┘ │
│                          ↓                   ↓         │
│                  ┌─────────────────────────────┐        │
│                  │        核心功能层          │        │
│                  │  (Business Logic)         │        │
│                  └─────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────────────┘
```

**关键洞察**：
- **UI（用户界面）**：服务于人类，注重视觉体验、直观操作、即时反馈
- **API（Agent接口）**：服务于Agent，注重结构化、可发现、可编程

两者**互不干扰**，但访问同一个核心功能层。

#### 为什么这很重要？

| 维度 | 传统应用（仅 GUI） | 双接口应用（GUI + AAI） |
|------|----------|------------|
| **开发者体验** | 只能通过 GUI 测试，难以自动化 | Agent 可以直连 IPC，测试简单 |
| **Agent 效率** | OCR 识别 2-4 秒，无法并行 | IPC 调用 1-10ms，支持并行 |
| **维护成本** | UI 变化需要更新 Agent 脚本 | IPC 接口稳定，Agent 零适配成本 |
| **可扩展性** | 受限于桌面焦点问题 | 多 Agent 并发调用同一 App |
| **未来就绪** | 难以集成 AI | 原生支持 AI 工作流 |

---

### 行业趋势：Agent-Native 设计

#### 2026 年的共识

> **"如果网站仍然无法清晰地与 AI Agent 通信，那么它对 ChatGPT、Claude 和 Gemini 等 AI 搜索引擎来说实际上是不可见的。"**
> — Prerender.io，《如何构建 Agent 友好的网站》

> **"AI Agent 正成为商业逻辑的主要接口...93% 的公司认为自动化是推动数字转型的关键。"**
> — Monday AI Agent 报告

**主要平台已经在行动**：

| 平台 | Agent-Native 能力 | 协议 |
|--------|----------------|--------|
| **Salesforce** | AgentForce，ACP（Agentic Commerce Protocol） | ACP |
| **Slack** | 内置 Agent 集成 | 私有协议 |
| **Stripe** | Agentic Checkout | ACP |
| **Notion/Figma** | API-first 架构 | OpenAPI/MCP |
| **Google** | A2UI（Agent-to-User Interface） | A2UI |

#### Google A2UI 协议

2025 年，Google发布了 **A2UI 协议**，定义了 Agent 如何动态生成上下文相关的界面：
- **Agent 生成 UI 组件**：基于对话上下文创建表单、预览、控制面板
- **超越静态聊天**：不再是简单的对话框，而是功能完整的界面
- **上下文感知**：界面根据当前任务自动调整

这证明：**Agent 需要的不是"更好的聊天"，而是"直接访问应用能力的标准化接口"。**

---

### AAI 的解决思路

#### 方式对比

```
传统方式（通过 MCP 工具）：
Agent → [Playwright/Chrome DevTools MCP] → [屏幕 OCR/识别] → [模拟点击] → GUI → 应用
  ↑ 每次操作 2-4 秒                      ↑ 无法跨应用并行

AAI 方式：
Agent → [AAI Gateway] → [MCP JSON-RPC] → [原生自动化 IPC] → 应用
  ↑ 毫秒级响应                      ↑ 支持多应用并行
```

#### AAI 的定位

```
┌─────────────────────────────────────────────────────┐
│                   LLM Agent Stack                   │
├─────────────────────────────────────────────────────┤
│  Model (GPT/Claude) - 智能核心                      │
├─────────────────────────────────────────────────────┤
│  Context (MCP) - 模型获取信息                        │
├─────────────────────────────────────────────────────┤
│  Action (AAI) - 模型执行操作 ← 本协议               │
├─────────────────────────────────────────────────────┤
│  Platform (OS/Browser) - 执行载体                    │
└─────────────────────────────────────────────────────┘
```

**AAI 是 Agent 的执行层，基于 MCP 标准，对现有框架零侵入。它让应用暴露能力，让 Agent 直接调用——这就是"Agent-Native"设计的实现路径。**

---

## Part II: 技术规范

---

### 2.1 协议概述

AAI (Agent App Interface) 是一个基于 MCP 标准的协议，定义了 Agent 与应用之间的交互方式。

#### 核心设计原则

| 原则 | 说明 |
|------|------|
| **标准化** | 统一的应用接口描述格式（aai.json） |
| **平台原生** | 使用各平台主流自动化工具及其支持的 IPC 方式 |
| **零侵入** | 利用应用现有的自动化能力，无需修改核心代码 |
| **低成本接入** | 兼容已有应用，新应用只需提供 aai.json |
| **安全合规** | 复用操作系统原生授权机制 |
| **Agent 零侵入** | 通过标准 MCP 集成，兼容所有支持 MCP 的 Agent 框架 |

---

### 2.2 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          LLM Agent                               │
│                        (Cursor/Continue/etc)                     │
└────────────────────────┬────────────────────────────────────────┘
                          │ MCP over Stdio
                          ↓ JSON-RPC
┌─────────────────────────────────────────────────────────────────┐
│                      AAI Gateway                                │
│                 (长期运行的 MCP Server)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. MCP Server (stdio)                                   │  │
│  │    - resources/list                                     │  │
│  │    - resources/read                                     │  │
│  │    - tools/call                                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 2. 自动化执行器（平台特定）                             │  │
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
│  │ 3. aai.json 解析器                                      │  │
│  │    - Schema 验证                                        │  │
│  │    - 自动化脚本模板解析                                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 4. 错误处理                                             │  │
│  │    - 标准化错误码                                        │  │
│  │    - 友好错误消息                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────┬──────────────────────┘
          │                               │
          │ 平台原生 IPC                  │ 平台原生 IPC
          │                               │
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

#### 组件职责

| 组件 | 职责 | 实现要求 |
|------|------|----------|
| **Agent** (Cursor, Continue, LM Studio) | 发起操作请求 | 支持 MCP over stdio |
| **AAI Gateway** | 翻译 MCP 请求 → 调用目标 App | 长期运行的服务进程，支持 `--mcp` 模式 |
| **Target App** (Mail, Outlook, Calendar) | 执行具体操作 | 支持平台原生自动化 + 提供 `aai.json` |

#### 关键原则

- **Gateway 是长期运行的服务进程**，与 Agent 保持持久连接
- **App 可以是任何状态**（运行中、已停止），Gateway 自动处理
- **所有通信通过平台原生自动化工具的 IPC 完成**
- **利用应用现有的自动化能力**，无需额外开发

---

### 2.3 平台自动化机制

AAI 使用各平台**主流自动化工具及其原生 IPC 方式**，确保最佳兼容性和性能。

| 平台 | 自动化工具 | IPC 方式 | 兼容性 | App 改造成本 |
|-----|-----------|---------|-------|------------|
| **macOS** | AppleScript / JXA | AppleEvents | ✅ 所有 macOS 应用 | **零代码**（已有自动化） |
| **Windows** | COM Automation | COM IPC | ✅ 大多数 Windows 应用 | **零代码**（已有自动化） |
| **Linux** | DBus | DBus IPC | ✅ 支持桌面应用 | **零代码**（已有自动化） |
| **Android** | Intent | Binder IPC | ✅ 所有 Android 应用 | **零代码**（原生机制） |
| **iOS** | URL Scheme | iOS IPC | ✅ 所有 iOS 应用 | **零代码**（原生机制） |

#### 2.3.1 macOS: AppleScript / JXA

**AppleScript** 是 macOS 原生的脚本语言，几乎所有系统应用和许多第三方应用都支持。

**JXA (JavaScript for Automation)** 是 AppleScript 的现代替代，使用 JavaScript 语法，更受开发者欢迎。

**IPC 方式：AppleEvents**
- AppleScript 底层使用 AppleEvents 进行进程间通信
- 这是 macOS 的原生 IPC 机制，性能极佳

**示例（AppleScript）：**
```applescript
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"Hello", content:"Hi Alice...", visible:false}
    tell newMessage
        make new to recipient at beginning of to recipients with properties {address:"alice@example.com"}
        send
    end tell
end tell
```

**示例（JXA）：**
```javascript
const Mail = Application('Mail');
const msg = Mail.OutgoingMessage({
  subject: 'Hello',
  content: 'Hi Alice...'
});
msg.toRecipients.push(Mail.Recipient({address: 'alice@example.com'}));
msg.send();
```

#### 2.3.2 Windows: COM Automation

**COM (Component Object Model)** 是 Windows 的二进制接口标准，几乎所有 Windows 应用和 Office 套件都支持。

**IPC 方式：COM IPC**
- COM 使用 IDispatch 接口进行跨进程调用
- 这是 Windows 的原生 IPC 机制，性能极佳

**示例（PowerShell）：**
```powershell
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "alice@example.com"
$mail.Subject = "Hello"
$mail.Body = "Hi Alice..."
$mail.Send()
```

**示例（Python with pywin32）：**
```python
import win32com.client

outlook = win32com.client.Dispatch("Outlook.Application")
mail = outlook.CreateItem(0)
mail.To = "alice@example.com"
mail.Subject = "Hello"
mail.Body = "Hi Alice..."
mail.Send()
```

#### 2.3.3 Linux: DBus

**DBus** 是 Linux 桌面系统的标准消息总线系统，大多数桌面应用都支持。

**IPC 方式：DBus IPC**
- DBus 提供进程间消息传递
- 这是 Linux 桌面的标准 IPC 机制

**示例（Python）：**
```python
import dbus

bus = dbus.SessionBus()
mail_obj = bus.get_object('org.example.Mail', '/org/example/Mail')
mail_iface = dbus.Interface(mail_obj, 'org.example.Mail')

mail_iface.send_email("alice@example.com", "Hello", "Hi Alice...")
```

#### 2.3.4 Android: Intent

**Intent** 是 Android 原生的消息传递机制，用于组件间通信。

**IPC 方式：Binder IPC**
- Intent 底层使用 Android Binder 进行跨进程通信
- 这是 Android 的原生 IPC 机制

**示例（Kotlin）：**
```kotlin
val intent = Intent("com.example.MAIL_SEND").apply {
    putExtra("to", "alice@example.com")
    putExtra("subject", "Hello")
    putExtra("body", "Hi Alice...")
}
startService(intent)
```

#### 2.3.5 iOS: URL Scheme

**URL Scheme** 是 iOS 原生的应用间通信方式。

**IPC 方式：iOS IPC**
- URL Scheme 通过 iOS 系统进行应用间调用
- 这是 iOS 应用间通信的标准方式

**示例（Swift）：**
```swift
let url = URL(string: "mailapp://send?to=alice@example.com&subject=Hello&body=Hi%20Alice...")!
UIApplication.shared.open(url)
```

---

### 2.4 安全模型

AAI 使用操作系统原生的安全机制，无需额外的授权协议。

| 平台 | 授权机制 | 用户体验 |
|------|----------|----------|
| **macOS** | 系统 TCC（Transparency, Consent, and Control） | 首次使用自动化工具时弹窗："AAI Gateway 想控制 Mail" → [允许]/[拒绝] |
| **Windows** | UAC（User Account Control）或应用自有提示 | 首次使用 COM 时，某些应用会弹出安全警告 |
| **Linux** | Polkit 或桌面环境安全框架 | 系统级安全提示 |
| **Android** | 运行时权限 | 应用首次使用相关功能时，系统弹窗请求权限 |
| **iOS** | 系统沙盒 + URL Scheme 限制 | URL Scheme 调用时，系统会提示用户确认 |

#### macOS TCC 授权流程

```
1. Agent 请求调用 Mail 应用
   ↓
2. Gateway 执行 AppleScript
   ↓
3. macOS 检测到自动化调用
   ↓
4. 系统弹窗（首次）：
   ┌─────────────────────────────────────┐
   │  "AAI Gateway" 想要控制 "Mail"      │
   │                                     │
   │  如果您不信任该应用程序，请将其拒绝。  │
   │                                     │
   │  [拒绝]            [好]            │
   └─────────────────────────────────────┘
   ↓
5. 用户点击 [好]
   ↓
6. 系统记录授权
   ↓
7. 后续调用无需弹窗
```

#### Windows COM 安全流程

```
1. Agent 请求调用 Outlook
   ↓
2. Gateway 创建 COM 对象
   ↓
3. Windows 检查 COM 安全设置
   ↓
4. 某些应用会弹窗（首次）：
   ┌─────────────────────────────────────┐
   │  允许此网站打开 Outlook 吗？        │
   │                                     │
   │  [不允许]       [允许]            │
   └─────────────────────────────────────┘
   ↓
5. 用户点击 [允许]
   ↓
6. 后续调用可能仍需确认（取决于应用设置）
```

**注意：** AAI 不强制验证 Gateway 身份，完全信任操作系统和应用自身的安全机制。

---

### 2.5 App 描述文件：aai.json

每个支持 AAI 的应用在统一的 AAI 配置目录中提供 `aai.json`。

#### 文件位置

| 平台 | 路径 |
|------|------|
| macOS / Linux | `~/.aai/<appId>/aai.json` |
| Windows | `%USERPROFILE%\.aai\<appId>\aai.json` |

**示例：**
- macOS: `~/.aai/com.apple.mail/aai.json`
- Windows: `C:\Users\Alice\.aai\com.microsoft.outlook\aai.json`

**优势：**
- 无需修改已签名的应用包
- 无需管理员权限
- 用户或社区可以自由添加、修改配置
- Gateway 只需扫描单一目录即可发现所有应用

#### 结构示例

```json
{
  "schema_version": "1.0",
  "appId": "com.apple.mail",
  "name": "Mail",
  "description": "Apple's native email client",
  "version": "1.0",
  "platforms": {
    "macos": {
      "automation": "applescript",
      "skills": [
        {
          "name": "send_email",
          "description": "Send a new email via Apple Mail",
          "script": "tell application \"Mail\"\n  set newMessage to make new outgoing message with properties {subject:\"${subject}\", content:\"${body}\", visible:false}\n  tell newMessage\n    make new to recipient at beginning of to recipients with properties {address:\"${to}\"}\n    send\n  end tell\nend tell\nreturn \"{\\\"success\\\":true, \\\"message_id\\\":\\\"generated\\\"}\"",
          "output_parser": "result as text"
        },
        {
          "name": "search_emails",
          "description": "Search emails in mailbox",
          "script": "tell application \"Mail\"\n  set results to (messages whose subject contains \"${query}\")\nend tell\nreturn \"{\\\"emails\\\":[\\\"result1\\\", \\\"result2\\\"]}\"",
          "output_parser": "result as text"
        }
      ]
    },
    "windows": {
      "automation": "com",
      "progid": "Outlook.Application",
      "skills": [
        {
          "name": "send_email",
          "description": "Send a new email via Microsoft Outlook",
          "script": [
            {"action": "create", "var": "app", "progid": "Outlook.Application"},
            {"action": "call", "var": "mail", "object": "app", "method": "CreateItem", "args": [0]},
            {"action": "set", "object": "mail", "property": "To", "value": "${to}"},
            {"action": "set", "object": "mail", "property": "Subject", "value": "${subject}"},
            {"action": "set", "object": "mail", "property": "Body", "value": "${body}"},
            {"action": "call", "object": "mail", "method": "Send"},
            {"action": "return", "value": "{\"success\":true, \"message_id\":\"generated\"}"}
          ],
          "output_parser": "last_result"
        }
      ]
    },
    "linux": {
      "automation": "dbus",
      "service": "org.example.Mail",
      "object": "/org/example/Mail",
      "interface": "org.example.Mail",
      "skills": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "method": "SendEmail",
          "output_parser": "json"
        }
      ]
    },
    "android": {
      "automation": "intent",
      "package": "com.example.mail",
      "skills": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "action": "com.example.MAIL_SEND",
          "extras": {
            "to": "${to}",
            "subject": "${subject}",
            "body": "${body}"
          },
          "result_type": "content_provider",
          "result_uri": "content://com.example.mail/results"
        }
      ]
    },
    "ios": {
      "automation": "url_scheme",
      "scheme": "mailapp",
      "skills": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "url_template": "mailapp://send?to=${to}&subject=${subject}&body=${body}",
          "result_type": "app_group",
          "app_group_id": "group.com.example.mail"
        }
      ]
    }
  }
}
```

#### 字段说明

##### 通用字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `schema_version` | string | aai.json 的 schema 版本，用于兼容性检查 |
| `appId` | string | 唯一标识（建议使用 reverse-DNS 格式） |
| `name` | string | 应用名称 |
| `description` | string | 应用描述 |
| `version` | string | aai.json 版本号 |
| `platforms` | object | 各平台的自动化配置 |

##### macOS 特定字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platforms.macos.automation` | string | 自动化类型：`applescript` 或 `jxa` |
| `platforms.macos.skills[].script` | string | 脚本模板，支持 `${param}` 占位符 |
| `platforms.macos.skills[].output_parser` | string | 输出解析方式：`result as text`（字符串）、`result as record`（字典） |
| `platforms.macos.skills[].timeout` | integer | 超时时间（秒），默认 30 |

##### Windows 特定字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platforms.windows.automation` | string | 自动化类型：`com` |
| `platforms.windows.progid` | string | COM ProgID（如 `Outlook.Application`） |
| `platforms.windows.skills[].script` | array | COM 操作序列 |
| `platforms.windows.skills[].script[].action` | string | 操作类型：`create`（创建对象）、`call`（调用方法）、`set`（设置属性）、`get`（获取属性）、`return`（返回结果） |
| `platforms.windows.skills[].script[].var` | string | 变量名（用于存储返回值） |
| `platforms.windows.skills[].script[].object` | string | 对象引用（如 `mail`、`app`） |
| `platforms.windows.skills[].script[].progid` | string | ProgID（仅在 `create` 操作中使用） |
| `platforms.windows.skills[].script[].method` | string | 方法名（仅在 `call` 操作中使用） |
| `platforms.windows.skills[].script[].property` | string | 属性名（仅在 `set`/`get` 操作中使用） |
| `platforms.windows.skills[].script[].value` | string | 属性值（支持 `${param}` 占位符） |
| `platforms.windows.skills[].script[].args` | array | 方法参数（支持 `${param}` 占位符） |
| `platforms.windows.skills[].output_parser` | string | 输出解析方式：`last_result`（最后一个操作的返回值） |
| `platforms.windows.skills[].timeout` | integer | 超时时间（秒），默认 30 |

##### Linux 特定字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platforms.linux.automation` | string | 自动化类型：`dbus` |
| `platforms.linux.service` | string | DBus 服务名（如 `org.example.Mail`） |
| `platforms.linux.object` | string | DBus 对象路径（如 `/org/example/Mail`） |
| `platforms.linux.interface` | string | DBus 接口名（如 `org.example.Mail`） |
| `platforms.linux.skills[].method` | string | DBus 方法名（如 `SendEmail`） |
| `platforms.linux.skills[].output_parser` | string | 输出解析方式：`json`（假设返回 JSON）、`string` |
| `platforms.linux.skills[].timeout` | integer | 超时时间（秒），默认 30 |

##### Android 特定字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platforms.android.automation` | string | 自动化类型：`intent` |
| `platforms.android.package` | string | Android 包名（如 `com.example.mail`） |
| `platforms.android.skills[].action` | string | Intent Action（如 `com.example.MAIL_SEND`） |
| `platforms.android.skills[].extras` | object | Intent Extra 参数（支持 `${param}` 占位符） |
| `platforms.android.skills[].result_type` | string | 结果获取方式：`content_provider`（Content Provider）、`broadcast`（广播） |
| `platforms.android.skills[].result_uri` | string | Content Provider URI（仅在 `result_type=content_provider` 时使用） |
| `platforms.android.skills[].timeout` | integer | 超时时间（毫秒），默认 5000 |

##### iOS 特定字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platforms.ios.automation` | string | 自动化类型：`url_scheme` |
| `platforms.ios.scheme` | string | URL Scheme（如 `mailapp`） |
| `platforms.ios.skills[].url_template` | string | URL 模板（支持 `${param}` 占位符） |
| `platforms.ios.skills[].result_type` | string | 结果获取方式：`app_group`（App Groups）、`clipboard`（剪贴板） |
| `platforms.ios.skills[].app_group_id` | string | App Group ID（仅在 `result_type=app_group` 时使用） |
| `platforms.ios.skills[].timeout` | integer | 超时时间（秒），默认 10 |

---

### 2.6 渐进式技能发现（避免上下文爆炸）

AAI 通过 MCP 资源模型实现按需加载：

#### Step 1: 列出可用 App

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}

// Gateway → Agent
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "app:com.apple.mail",
        "name": "Mail",
        "description": "Apple's native email client",
        "mimeType": "application/aai+json"
      },
      {
        "uri": "app:com.apple.calendar",
        "name": "Calendar",
        "description": "Apple's calendar application",
        "mimeType": "application/aai+json"
      }
    ]
  }
}
```

#### Step 2: 按需加载技能详情

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "app:com.apple.mail"
  }
}

// Gateway → Agent
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [
      {
        "uri": "app:com.apple.mail",
        "mimeType": "application/json",
        "text": "{\n  \"schema_version\": \"3.0\",\n  \"appId\": \"com.apple.mail\",\n  \"skills\": [...]\n}"
      }
    ]
  }
}
```

#### Step 3: 调用技能

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "com.apple.mail:send_email",
    "arguments": {
      "to": "alice@example.com",
      "subject": "Hello",
      "body": "Hi Alice, ..."
    }
  }
}

// Gateway → Agent
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Email sent successfully. Message ID: 12345"
      }
    ]
  }
}
```

**优势：** 仅当用户提及某 App 时，才加载其技能，极大节省上下文。

---

### 2.7 错误处理

Gateway 应返回标准化的错误响应：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32001,
    "message": "Automation failed",
    "data": {
      "type": "EXECUTION_FAILED",
      "detail": "Script execution timed out after 30 seconds"
    }
  }
}
```

#### 错误码定义

| 错误码 | 类型 | 说明 |
|--------|------|------|
| -32001 | AUTOMATION_FAILED | 自动化脚本执行失败 |
| -32002 | APP_NOT_FOUND | 目标应用未安装或无法找到 |
| -32003 | SKILL_NOT_FOUND | 请求的技能在 aai.json 中不存在 |
| -32004 | PERMISSION_DENIED | 权限不足，需要用户授权 |
| -32005 | INVALID_PARAMS | 参数校验失败 |
| -32006 | AUTOMATION_NOT_SUPPORTED | 平台不支持指定的自动化类型 |
| -32007 | AAI_JSON_INVALID | aai.json 格式错误或不符合 schema |
| -32008 | TIMEOUT | 操作超时 |
| -32009 | APP_NOT_RUNNING | 应用未运行且无法启动 |
| -32010 | SCRIPT_PARSE_ERROR | 脚本解析错误 |

---

### 2.8 完整调用流程示例

#### 用户输入

> "用 Mail 给 alice@example.com 发一封主题为'Hello'的邮件"

#### Agent 行为

1. 调用 `resources/list` → 发现 `app:com.apple.mail`
2. 调用 `resources/read(app:com.apple.mail)` → 获取 `send_email` 技能
3. 构造 MCP `tools/call` 请求

#### Gateway 行为（macOS 示例）

1. 解析 `aai.json`
2. 替换脚本模板中的参数：
   ```applescript
   tell application "Mail"
       set newMessage to make new outgoing message with properties {subject:"Hello", content:"Hi Alice...", visible:false}
       tell newMessage
           make new to recipient at beginning of to recipients with properties {address:"alice@example.com"}
           send
       end tell
   end tell
   return "{\"success\":true, \"message_id\":\"generated\"}"
   ```
3. 执行 AppleScript：
   ```bash
   osascript -e 'tell application "Mail"...'
   ```
4. 如果是首次调用，macOS 弹出 TCC 授权框
5. 用户授权后，脚本执行成功
6. 解析返回值（JSON 字符串）
7. 返回结果：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Email sent successfully. Message ID: generated"
      }
    ]
  }
}
```

#### 用户体验

- macOS 首次弹出 TCC 授权框
- 用户点击 [好]
- 后续调用静默执行

---

### 2.9 App 开发者集成指南

#### macOS 集成

**已有自动化支持：**
如果应用已经支持 AppleScript 或 JXA，**零代码**即可接入 AAI：
1. 编写 `aai.json` 配置文件
2. 放置在 `~/.aai/<appId>/aai.json`
3. 完成！

**无自动化支持：**
如果应用没有自动化支持，需要：
1. 在 `Info.plist` 中启用 AppleScript：
   ```xml
   <key>NSAppleScriptEnabled</key>
   <true/>
   ```
2. 实现脚本命令（Swift/ObjC）或利用 JXA
3. 编写 `aai.json` 配置文件

#### Windows 集成

**已有自动化支持：**
如果应用已经支持 COM，**零代码**即可接入 AAI：
1. 确认应用的 ProgID（如 `MyApp.Application`）
2. 编写 `aai.json` 配置文件
3. 放置在 `%USERPROFILE%\.aai\<appId>\aai.json`
4. 完成！

**无自动化支持：**
如果应用没有自动化支持，需要：
1. 实现 COM IDispatch 接口（C#/C++）
2. 注册 ProgID
3. 编写 `aai.json` 配置文件

#### Linux 集成

**已有自动化支持：**
如果应用已经支持 DBus，**零代码**即可接入 AAI：
1. 确认 DBus 服务名、对象路径、接口
2. 编写 `aai.json` 配置文件
3. 放置在 `~/.aai/<appId>/aai.json`
4. 完成！

**无自动化支持：**
如果应用没有自动化支持，需要：
1. 实现 DBus 接口
2. 编写 `aai.json` 配置文件

#### Android 集成

所有 Android 应用都支持 Intent，只需：
1. 在 `AndroidManifest.xml` 中声明 Service：
   ```xml
   <service
       android:name=".AAIService"
       android:exported="true">
       <intent-filter>
           <action android:name="com.example.MAIL_SEND" />
       </intent-filter>
   </service>
   ```
2. 实现 Intent 处理逻辑
3. 编写 `aai.json` 配置文件

#### iOS 集成

所有 iOS 应用都支持 URL Scheme，只需：
1. 在 `Info.plist` 中声明 URL Scheme：
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>myapp</string>
           </array>
       </dict>
   </array>
   ```
2. 实现 URL Scheme 处理逻辑
3. 编写 `aai.json` 配置文件

#### 第三方配置

用户或社区也可以为已有应用创建 aai.json 配置：
1. 创建目录：`~/.aai/<appId>/`
2. 编写 `aai.json`，描述应用已有的自动化接口
3. Gateway 自动发现并加载

**关键：无需 HTTP 服务器、无需 OAuth、无需额外开发。**

---

### 2.10 Agent 配置示例

#### Continue.dev (`~/.continue/config.ts`)

```typescript
mcpServers: {
  aai: {
    command: "aai-gateway",
    args: ["--mcp"]
  }
}
```

#### LM Studio / Jan

在插件设置中添加 MCP 服务器：
- Command: `aai-gateway`
- Args: `--mcp`

#### Cursor / Cline

在 MCP 服务器配置中添加：
```json
{
  "mcpServers": {
    "aai": {
      "command": "aai-gateway",
      "args": ["--mcp"]
    }
  }
}
```

---

### 2.11 技术约束

AAI 明确以下约束以确保协议的简洁性和安全性：

| 约束 | 说明 |
|------|------|
| **仅使用** 平台原生自动化工具 | AppleScript、COM、DBus、Intent、URL Scheme |
| **不要求** App 启动额外的 HTTP Server | 避免资源浪费和复杂度 |
| **不要求** App 实现 OAuth | 使用操作系统原生的授权机制 |
| **不替代** 系统安全机制 | TCC/COM 权限由 OS 管理 |
| **支持** 已有应用 | 利用应用现有的自动化能力 |
| **不强制** 使用特定编程语言 | 应用可用任何语言实现自动化接口 |

---

### 2.12 改造成本分析

#### 成本分层

| 应用类型 | 现有能力 | 人力成本 | AI 辅助后成本 |
|----------|----------|----------|---------------|
| **已有自动化支持** | macOS 系统应用、Office 系列、支持 COM/DBus 的应用 | **零代码**（写 aai.json） | **秒级**（AI 自动生成） |
| **有脚本接口** | 支持 Python/PowerShell 脚本的应用 | **零代码**（包装为 aai.json） | **分钟级**（AI 自动包装） |
| **无自动化接口** | 原生应用、游戏 | 3-5 天（添加自动化） | **小时级到天级**（AI 改造代码） |

#### AI Coding 加速示例

**场景：为 Mail 应用生成 aai.json**

**给 AI 的指令：**
```
分析 Apple Mail 的 AppleScript 文档，生成 AAI 的 aai.json 描述文件。
需要暴露这些技能：
- 邮件发送（send_email）：参数包括 to, subject, body
- 邮件搜索（search_emails）：参数包括 query, limit
- 标记邮件（mark_as_read）：参数包括 message_id

返回完整的 JSON 格式。
```

**AI 输出：** 直接生成符合规范的 `aai.json`

**时间：** 秒级

---

### 2.13 与 Agent 框架集成

#### AAI 的设计理念

AAI 基于 MCP 标准，对现有 Agent 框架**零侵入**：

```
现有 Agent 框架（Cursor, Continue, AutoGPT 等）
    ↓ (已支持 MCP)
添加 AAI Gateway 配置
    ↓
即可使用 AAI 能力
```

#### 兼容的框架

| 框架 | MCP 支持 | 集成方式 |
|-------|-----------|----------|
| **Cursor** | ✅ 原生支持 | MCP 服务器配置 |
| **Continue.dev** | ✅ 原生支持 | 配置 `mcpServers` |
| **Cline** | ✅ 原生支持 | MCP 配置文件 |
| **LibreChat** | ✅ 原生支持 | MCP 连接配置 |
| **Cherry Studio** | ✅ 原生支持 | MCP 服务配置 |
| **LobeHub** | ✅ 原生支持 | MCP 客户端配置 |

**无需修改框架代码，只需添加 AAI Gateway 配置。**

---

### 2.14 优势总结

| 问题 | AAI 方案 |
|------|----------|
| App 改造成本高？ | 绝大多数应用只需 **零代码**（已有自动化） |
| 需要额外服务器？ | **不需要**，使用平台原生自动化 |
| 需要 OAuth？ | **不需要**，使用系统原生的授权机制 |
| Agent 需定制开发？ | 零代码，标准 MCP 即可 |
| 上下文过大？ | 渐进式技能加载 |
| 跨平台？ | 统一抽象，分平台实现 |
| 操作速度慢？ | **微秒级调用**，比 OCR 快 1000 倍 |
| 无法并行？ | 支持多应用并行操作 |
| 兼容现有应用？ | ✅ 利用应用现有的自动化能力 |

---

## Part III: Roadmap

### 当前状态

✅ **协议设计完成（初版）**
- 定义基于平台原生自动化的通信标准
- 支持所有主流操作系统（macOS、Windows、Linux、Android、iOS）
- 定义 aai.json Schema（初版）
- 利用现有自动化能力，零代码兼容

🚧 **待实现功能**

### Phase 1: AAI Gateway MCP 功能开发（当前优先级）

#### 1.1 核心功能

- [ ] **MCP Server 实现**
  - [ ] `resources/list` - 列出所有已安装的 AAI 应用
  - [ ] `resources/read` - 读取应用的 aai.json 和技能详情
  - [ ] `tools/call` - 调用应用技能

- [ ] **自动化执行器**
  - [ ] **macOS 执行器**
    - [ ] AppleScript 执行器（`osascript`）
    - [ ] JXA 执行器（`osascript -l JavaScript`）
    - [ ] 脚本模板参数替换
    - [ ] 输出解析（字符串/字典/JSON）
    - [ ] TCC 错误处理和重试
  - [ ] **Windows 执行器**
    - [ ] COM 对象创建和调用
    - [ ] 脚本序列执行（create/call/set/get/return）
    - [ ] 参数替换
    - [ ] 输出解析
    - [ ] UAC 错误处理
  - [ ] **Linux 执行器**
    - [ ] DBus 方法调用
    - [ ] 输出解析
  - [ ] **Android 执行器**
    - [ ] Intent 发送
    - [ ] Content Provider 结果读取
  - [ ] **iOS 执行器**
    - [ ] URL Scheme 调用
    - [ ] App Groups 结果读取

#### 1.2 配置管理

- [ ] **自动发现应用**
  - [ ] 扫描 `~/.aai/` 目录（跨平台路径适配）
  - [ ] 加载所有 `aai.json` 文件
  - [ ] Schema 验证
  - [ ] 按平台过滤技能

- [ ] **配置文件支持**
  - [ ] `~/.aai/config.json` - Gateway 配置
  - [ ] 支持自定义扫描路径
  - [ ] 支持超时时间配置

#### 1.3 错误处理和日志

- [ ] **标准化错误处理**
  - [ ] 错误码映射
  - [ ] 友好错误消息
  - [ ] 自动重试机制

- [ ] **日志系统**
  - [ ] 操作日志记录
  - [ ] 错误日志记录
  - [ ] 日志级别控制

### Phase 2: Agent 原生应用商店

#### 2.1 核心概念

**Agent 原生应用（Agent-Native App）**：
- 专为 Agent 设计的应用，提供标准化的自动化接口
- 可以在 AAI 应用商店中发布和发现
- Agent 可以直接调用，无需任何模拟或视觉识别

#### 2.2 应用商店功能

- [ ] **Web 应用商店**
  - [ ] 应用展示页面（名称、描述、作者、评分）
  - [ ] 搜索和分类浏览
  - [ ] 用户评价和评分系统
  - [ ] 应用版本管理

- [ ] **应用安装**
  - [ ] 一键安装（下载 aai.json）
  - [ ] 自动配置（放置到正确的目录）
  - [ ] 安装后自动在 Gateway 中注册

- [ ] **Agent 集成**
  - [ ] Gateway 可以搜索应用商店
  - [ ] Agent 发现未安装的应用时，自动提示安装
  - [ ] 支持"按需安装"模式

#### 2.3 应用商店 API

```json
// 应用列表 API
GET https://store.aai.dev/api/apps

{
  "apps": [
    {
      "id": "com.example.taskmanager",
      "name": "Task Manager Pro",
      "description": "AI-native task management app",
      "author": "Example Inc.",
      "version": "2.1.0",
      "rating": 4.8,
      "downloads": 10245,
      "platforms": ["macos", "windows", "linux"],
      "aai_url": "https://store.aai.dev/apps/com.example.taskmanager/aai.json"
    }
  ]
}
```

#### 2.4 Agent 按需安装体验

**场景：Agent 发现用户需要一个未安装的应用**

```
User: "帮我创建一个任务，下周一截止，名为'完成项目报告'"

Agent → Gateway: tools/call({name: "com.example.taskmanager:create_task"})

Gateway 检查：
  - 应用 "com.example.taskmanager" 的 aai.json 未找到

Gateway → Agent (MCP Response):
{
  "error": {
    "code": -32002,
    "message": "App not found",
    "data": {
      "app_id": "com.example.taskmanager",
      "app_name": "Task Manager Pro",
      "suggestion": "This app is available in AAI App Store. Install it?",
      "install_command": "aai-gateway install com.example.taskmanager"
    }
  }
}

Agent → User:
"要完成这个任务，我需要使用 Task Manager Pro 应用。
这个应用支持创建任务、设置截止日期等功能。

应用名称：Task Manager Pro
作者：Example Inc.
评分：4.8/5.0
支持平台：macOS, Windows, Linux

要安装这个应用吗？安装后我就可以帮您创建任务了。"

User: "好的，安装"

Gateway:
  1. 从应用商店下载 aai.json
  2. 放置到 ~/.aai/com.example.taskmanager/aai.json
  3. 自动注册到 Gateway

Agent → Gateway: tools/call({name: "com.example.taskmanager:create_task"})

Gateway:
  1. 调用应用自动化
  2. 成功创建任务

Agent → User:
"任务已成功创建！

任务名称：完成项目报告
截止日期：下周一
状态：待办

应用已安装并授权。"
```

### Phase 3: 高级功能（未来规划）

- [ ] **工作流编排**
  - [ ] 支持跨应用的工作流
  - [ ] 事务性操作（支持回滚）
  - [ ] 事件订阅和触发

- [ ] **批量操作**
  - [ ] 支持批量调用技能
  - [ ] 并行执行优化
  - [ ] 结果聚合

- [ ] **技能发现增强**
  - [ ] 智能推荐技能
  - [ ] 技能使用统计
  - [ ] 技能评级系统

---

## 附录 A：术语表

| 术语 | 说明 |
|------|------|
| **AAI** | Agent App Interface，Agent 与应用之间的接口协议 |
| **MCP** | Model Context Protocol，LLM Agent 标准工具协议 |
| **IPC** | Inter-Process Communication，进程间通信 |
| **AppleScript** | macOS 原生脚本语言，用于应用自动化 |
| **JXA** | JavaScript for Automation，AppleScript 的现代替代 |
| **COM** | Component Object Model，Windows 原生组件通信机制 |
| **DBus** | Linux 桌面系统的标准消息总线系统 |
| **Intent** | Android 原生的消息传递机制 |
| **URL Scheme** | iOS 应用间通信的标准方式 |
| **TCC** | Transparency, Consent, and Control，macOS 隐私框架 |
| **UAC** | User Account Control，Windows 用户账户控制 |
| **AppleEvents** | AppleScript 底层的 IPC 机制 |
| **Gateway** | AAI 协议的网关实现，负责翻译 MCP 请求到平台自动化 |

---

## 附录 B：实现参考

### AAI Gateway 实现要点

```
┌─────────────────────────────────────────┐
│      AAI Gateway (长期运行服务)         │
├─────────────────────────────────────────┤
│  1. MCP Server 实现                    │
│     - resources/list                   │
│     - resources/read                   │
│     - tools/call                       │
├─────────────────────────────────────────┤
│  2. 自动化执行器（平台特定）           │
│     - macOS: AppleScript/JXA 执行器     │
│     - Windows: COM 执行器              │
│     - Linux: DBus 执行器              │
│     - Android: Intent 执行器           │
│     - iOS: URL Scheme 执行器          │
├─────────────────────────────────────────┤
│  3. aai.json 解析器                   │
│     - Schema 验证                      │
│     - 脚本模板参数替换                 │
│     - 平台技能过滤                     │
├─────────────────────────────────────────┤
│  4. 错误处理                           │
│     - 标准化错误码                      │
│     - 友好错误消息                      │
│     - 自动重试机制                      │
└─────────────────────────────────────────┘
```

### 推荐技术栈

| 组件 | 推荐实现 | 说明 |
|------|----------|------|
| MCP Server | `@modelcontextprotocol/sdk` TypeScript SDK / Python SDK | 官方 SDK |
| aai.json 解析 | `jsonschema` Python / `ajv` JavaScript | Schema 验证 |
| macOS 自动化 | `osascript` CLI / `pyobjc` | AppleScript/JXA 执行 |
| Windows 自动化 | `pywin32` / `win32com` | COM 调用 |
| Linux 自动化 | `dbus-python` | DBus 调用 |
| Android 自动化 | `adb` / Android SDK | Intent 发送 |
| iOS 自动化 | `xcrun simctl` / iOS SDK | URL Scheme 调用 |

---

## 附录 C：Schema 定义

### aai.json Schema (初版)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["schema_version", "appId", "name", "platforms"],
  "properties": {
    "schema_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$"
    },
    "appId": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*)+$",
      "description": "Reverse-DNS 格式的唯一标识符"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "platforms": {
      "type": "object",
      "description": "各平台的自动化配置",
      "properties": {
        "macos": {
          "type": "object",
          "properties": {
            "automation": {
              "type": "string",
              "enum": ["applescript", "jxa"]
            },
            "skills": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "script"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "script": { "type": "string" },
                  "output_parser": { "type": "string" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        },
        "windows": {
          "type": "object",
          "properties": {
            "automation": { "type": "string", "enum": ["com"] },
            "progid": { "type": "string" },
            "skills": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "script"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "script": { "type": "array" },
                  "output_parser": { "type": "string" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        },
        "linux": {
          "type": "object",
          "properties": {
            "automation": { "type": "string", "enum": ["dbus"] },
            "service": { "type": "string" },
            "object": { "type": "string" },
            "interface": { "type": "string" },
            "skills": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "method"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "method": { "type": "string" },
                  "output_parser": { "type": "string" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        },
        "android": {
          "type": "object",
          "properties": {
            "automation": { "type": "string", "enum": ["intent"] },
            "package": { "type": "string" },
            "skills": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "action"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "action": { "type": "string" },
                  "extras": { "type": "object" },
                  "result_type": { "type": "string" },
                  "result_uri": { "type": "string" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        },
        "ios": {
          "type": "object",
          "properties": {
            "automation": { "type": "string", "enum": ["url_scheme"] },
            "scheme": { "type": "string" },
            "skills": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "url_template"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "url_template": { "type": "string" },
                  "result_type": { "type": "string" },
                  "app_group_id": { "type": "string" },
                  "timeout": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 附录 D：快速开始指南

### 1. 安装 AAI Gateway

```bash
# macOS / Linux
curl -fsSL https://get.aai.dev/install.sh | sh

# Windows
# 下载安装包从 https://github.com/your-org/aai-gateway/releases
```

### 2. 配置 Agent（以 Continue.dev 为例）

编辑 `~/.continue/config.ts`：

```typescript
mcpServers: {
  aai: {
    command: "aai-gateway",
    args: ["--mcp"]
  }
}
```

### 3. 添加 AAI 应用

**为已有应用添加支持：**
```bash
# 创建应用目录
mkdir -p ~/.aai/com.apple.mail

# 下载或编写 aai.json
curl -o ~/.aai/com.apple.mail/aai.json \
  https://store.aai.dev/apps/com.apple.mail/aai.json

# 或者手动编写 aai.json（见 2.5 节）
```

### 4. 启动 Gateway

```bash
aai-gateway --mcp
```

### 5. 使用

在 Agent 中输入：
> "用 Mail 给 alice@example.com 发一封主题为'Hello'的邮件"

首次使用时，操作系统会弹出授权框，点击 [好] 即可。

---

**AAI：从 GUI 到 AAI——让 Agent 不再模拟人类，而是直接执行。**

---

**从 GUI 到 AAI：应用与 Agent 交互的新范式——这是 Agent 时代的必然进化。**

---

*许可证：本协议采用 CC BY-SA 4.0，欢迎自由使用与改进。*
