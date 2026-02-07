# AAI (Agent App Interface)

**AAI** is a protocol that enables AI Agents to directly invoke application capabilities—bypassing the slow, fragile approach of "watching screens and simulating clicks."

---

**From GUI to AAI: The inevitable evolution of the Agent era—Moving from "watching screens" to "direct execution", a new paradigm for application-Agent interaction.**

---

## Part I: Why do we need AAI?

### GUI vs AAI: A Comparison of Two Interaction Paradigms

```
┌─────────────────────────────────────────────────────────────────┐
│                      GUI Era (Past)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Human ↔ Application                                            │
│    ↓                                                            │
│  Visual Interface (buttons, menus, forms)                      │
│    ↓                                                            │
│  Mouse clicks, keyboard input                                   │
│    ↓                                                            │
│  GUI event handling                                              │
│    ↓                                                            │
│  Execute business logic                                          │
│                                                                 │
│  Features:                                                      │
│  • Visual interfaces designed for humans                        │
│  • Relies on visual recognition and positioning                 │
│  • Single-threaded, single-focus                                │
│  • Agents must simulate human operations                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AAI Era (Future)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ↔ Application                                           │
│    ↓                                                            │
│  Structured commands (JSON)                                     │
│    ↓                                                            │
│  Direct capability invocation                                   │
│    ↓                                                            │
│  Execute business logic                                          │
│                                                                 │
│  Features:                                                      │
│  • Structured interfaces designed for Agents                    │
│  • Direct invocation, no visual recognition needed             │
│  • Supports parallel and batch operations                       │
│  • Human and Agent access independently                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Call of the Times: Agents are Reshaping Productivity

AI Agents are becoming increasingly powerful—capable of understanding complex tasks, planning execution steps, and coordinating multiple workflows.

But the reality is: **when Agents need to operate actual applications to complete work, they are still forced to "watch screens and click buttons" like humans.**

This "human simulation" approach feels out of place in the Agent era. We have a more efficient way.

---

### Current Status: Efficiency Bottlenecks in Agent-Application Interaction

#### Current Automation Tools

| Tool Type              | Example                             | Working Principle                                           |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------- |
| **Browser Automation** | Playwright MCP, Chrome DevTools MCP | DOM selectors or visual recognition → Simulate clicks/input |
| **Desktop Automation** | Open Interpreter, Computer Use      | Screenshots + visual recognition → GUI interaction          |

**Core Problem: These tools still operate through the GUI layer, simulating human interactions rather than directly invoking application capabilities.**

#### Fundamental Limitations

| Limitation             | Description                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Slow**               | GUI automation (screenshot + recognition + action) takes seconds; direct capability invocation takes milliseconds |
| **Cannot parallelize** | Desktop focus limitations prevent coordinating multiple applications simultaneously                               |
| **Fragile**            | UI changes, popups, resolution differences, and font changes break automation                                     |

---

### What Should Future Applications Look Like?

#### Dual Interface Architecture: Human + Agent

Future applications shouldn't just be for humans. They should provide **two independent interfaces**:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Future Application Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐      ┌──────────────────────┐ │
│  │  Human Visual UI     │      │   Agent Program Interface  │ │
│  │   (GUI)             │      │      (AAI)            │ │
│  │                      │      │                      │ │
│  │  • Buttons & Forms   │      │  • Structured Skills     │ │
│  │  • Drag & Drop       │      │  • Native IPC           │ │
│  │  • Instant Feedback  │      │  • Parallel Call Support │ │
│  │  • Friendly Interaction│     │  • Type-safe Parameters  │ │
│  └──────────────────────┘      └──────────────────────┘ │
│                          ↓                   ↓         │
│                  ┌─────────────────────────────┐        │
│                  │        Core Logic Layer      │        │
│                  │  (Business Logic)         │        │
│                  └─────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:**

- **GUI (Graphical User Interface):** Serves humans, focuses on visual experience, intuitive operation, instant feedback
- **AAI (Agent App Interface):** Serves Agents, focuses on structure, discoverability, programmability

The two **do not interfere** with each other, but access the same core functionality layer.

#### Why is this Important?

| Dimension                | Traditional Application (GUI Only)              | Dual Interface Application (GUI + AAI)                 |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------ |
| **Developer Experience** | Can only test via GUI, difficult to automate    | Agents can connect directly via IPC, simple testing    |
| **Agent Efficiency**     | OCR recognition 2-4 seconds, cannot parallelize | IPC calls 1-10ms, supports parallelization             |
| **Maintenance Cost**     | UI changes require updating Agent scripts       | IPC interface stable, Agents have zero adaptation cost |
| **Scalability**          | Limited by desktop focus issues                 | Multiple Agents can concurrently call the same App     |
| **Future-Ready**         | Difficult to integrate with AI                  | Natively supports AI workflows                         |

---

### Industry Trends: Agent-Native Design

AI Agents like **OpenClaw** and **Claude Cowork** (Anthropic) are changing how we interact with the digital world. These Agents are becoming increasingly powerful, capable of understanding complex tasks, planning execution steps, and coordinating multiple workflows.

**Major Platforms Are Already Taking Action:**

| Platform         | Agent-Native Capabilities                   | Protocol             |
| ---------------- | ------------------------------------------- | -------------------- |
| **Salesforce**   | AgentForce, ACP (Agentic Commerce Protocol) | ACP                  |
| **Slack**        | Built-in Agent integration                  | Proprietary protocol |
| **Stripe**       | Agentic Checkout                            | ACP                  |
| **Notion/Figma** | API-first architecture                      | OpenAPI/MCP          |
| **Google**       | A2UI (Agent-to-User Interface)              | A2UI                 |
| **CopilotKit**   | AG-UI (Agent-User Interaction Protocol)     | AG-UI                |

#### Related Protocols

**AG-UI (Agent-User Interaction Protocol):** An open, lightweight, event-based protocol that standardizes how agents connect to user-facing applications. It provides real-time streaming, state management, and interactive UI components for agentic experiences.

**A2UI (Google):** A generative UI specification that agents can use to deliver UI widgets dynamically based on conversation context.

**The key insight:** Agents don't need "better chat"—they need **standardized interfaces for direct access to application capabilities.**

---

### AAI's Solution Approach

#### Comparison of Approaches

```
Traditional Approach (GUI-based):
Agent → [Screen capture/recognition] → [Simulate clicks] → GUI → Application
       (seconds per operation, cannot parallelize across apps)

AAI Approach:
Agent → [AAI Gateway] → [Direct invocation] → Application
       (milliseconds per operation, supports parallelization)
```

#### AAI's Positioning

```
┌─────────────────────────────────────────────────────┐
│                   LLM Agent Stack                   │
├─────────────────────────────────────────────────────┤
│  Model (GPT/Claude) - Intelligence Core             │
├─────────────────────────────────────────────────────┤
│  Context (MCP) - Model gets information             │
├─────────────────────────────────────────────────────┤
│  Action (AAI) - Model executes operations ← This protocol │
├─────────────────────────────────────────────────────┤
│  Platform (OS/Browser) - Execution carrier          │
└─────────────────────────────────────────────────────┘
```

**AAI is the Agent execution layer, based on MCP standards, with zero intrusion to existing frameworks. It allows applications to expose capabilities and Agents to call them directly—this is the implementation path for "Agent-Native" design.**

---

## Part II: Technical Specifications

---

### 2.1 Protocol Overview

AAI (Agent App Interface) is a protocol based on MCP standards that defines how Agents interact with applications.

#### Core Design Principles

| Principle                | Description                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **Standardization**      | Unified application interface description format (aai.json)                                |
| **Platform Native**      | Uses mainstream automation tools and their supported IPC methods on each platform          |
| **Zero Intrusion**       | Leverages application's existing automation capabilities, no core code modification needed |
| **Low Barrier to Entry** | Compatible with existing applications, new applications only need to provide aai.json      |
| **Security Compliant**   | Reuses operating system's native authorization mechanisms                                  |
| **Agent Zero Intrusion** | Integrates via standard MCP, compatible with all Agent frameworks that support MCP         |

---

### 2.2 System Architecture

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

#### Component Responsibilities

| Component                                | Responsibilities                           | Implementation Requirements                               |
| ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| **Agent** (Cursor, Continue, LM Studio)  | Initiates operation requests               | Supports MCP over stdio                                   |
| **AAI Gateway**                          | Translates MCP requests → calls target App | Long-running service process, supports `--mcp` mode       |
| **Target App** (Mail, Outlook, Calendar) | Executes specific operations               | Supports platform-native automation + provides `aai.json` |

#### Key Principles

- **Gateway is a long-running service process** that maintains a persistent connection with the Agent
- **App can be in any state** (running, stopped), Gateway handles automatically
- **All communication is done via platform-native automation tools' IPC**
- **Leverages application's existing automation capabilities**, no additional development needed

---

### 2.3 Platform Automation Mechanisms

AAI uses **mainstream automation tools and their native IPC methods** on each platform to ensure best compatibility and performance.

| Platform    | Automation Mechanism | Integration Cost                                |
| ----------- | -------------------- | ----------------------------------------------- |
| **macOS**   | AppleScript / JXA    | Zero code if app already supports AppleScript   |
| **Windows** | COM Automation       | Zero code if app already exposes COM interface  |
| **Linux**   | DBus                 | Zero code if app already exposes DBus interface |

#### 2.3.1 macOS: AppleScript / JXA

**AppleScript** is macOS's native scripting language, supported by almost all system applications and many third-party applications.

**JXA (JavaScript for Automation)** is AppleScript's modern alternative using JavaScript syntax, more popular among developers.

**IPC Method: AppleEvents**

- AppleScript uses AppleEvents for inter-process communication underneath
- This is macOS's native IPC mechanism with excellent performance

**Example (AppleScript):**

```applescript
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"Hello", content:"Hi Alice...", visible:false}
    tell newMessage
        make new to recipient at beginning of to recipients with properties {address:"alice@example.com"}
        send
    end tell
end tell
```

**Example (JXA):**

```javascript
const Mail = Application('Mail');
Mail.activate();
const msg = Mail.OutgoingMessage({
  subject: 'Hello',
  content: 'Hi Alice...',
  visible: false,
});
Mail.outgoingMessages.push(msg);
msg.toRecipients.push(Mail.Recipient({ address: 'alice@example.com' }));
msg.send();
```

#### 2.3.2 Windows: COM Automation

**COM (Component Object Model)** is Windows's binary interface standard, supported by almost all Windows applications and the Office suite.

**IPC Method: COM IPC**

- COM uses the IDispatch interface for cross-process calls
- This is Windows's native IPC mechanism with excellent performance

**Example (PowerShell):**

```powershell
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "alice@example.com"
$mail.Subject = "Hello"
$mail.Body = "Hi Alice..."
$mail.Send()
```

**Example (Python with pywin32):**

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

**DBus** is the standard message bus system for Linux desktop environments, supported by most desktop applications.

**IPC Method: DBus IPC**

- DBus provides inter-process message passing
- This is the standard IPC mechanism for Linux desktops

**Example (Python):**

```python
import dbus

bus = dbus.SessionBus()
mail_obj = bus.get_object('org.example.Mail', '/org/example/Mail')
mail_iface = dbus.Interface(mail_obj, 'org.example.Mail')

mail_iface.send_email("alice@example.com", "Hello", "Hi Alice...")
```

---

### 2.4 Security Model

AAI uses operating system's native security mechanisms, no additional authorization protocol needed.

| Platform    | Authorization Mechanism                                | User Experience                                                                            |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **macOS**   | System TCC (Transparency, Consent, and Control)        | First-time automation tool use popup: "AAI Gateway wants to control Mail" → [Allow]/[Deny] |
| **Windows** | UAC (User Account Control) or application's own prompt | Some apps show security warning when using COM for the first time                          |
| **Linux**   | Polkit or desktop environment security framework       | System-level security prompt                                                               |

#### macOS TCC Authorization Flow

```
1. Agent requests to call Mail application
   ↓
2. Gateway executes AppleScript
   ↓
3. macOS detects automation call
   ↓
4. System popup (first time):
   ┌─────────────────────────────────────┐
   │  "AAI Gateway" wants to control "Mail"   │
   │                                     │
   │  If you don't trust this application, │
   │  please deny it.                     │
   │                                     │
   │  [Deny]               [OK]          │
   └─────────────────────────────────────┘
   ↓
5. User clicks [OK]
   ↓
6. System records authorization
   ↓
7. Subsequent calls don't require popup
```

#### Windows COM Security Flow

```
1. Agent requests to call Outlook
   ↓
2. Gateway creates COM object
   ↓
3. Windows checks COM security settings
   ↓
4. Some apps show popup (first time):
   ┌─────────────────────────────────────┐
   │  Allow this website to open Outlook?   │
   │                                     │
   │  [Don't Allow]       [Allow]         │
   └─────────────────────────────────────┘
   ↓
5. User clicks [Allow]
   ↓
6. Subsequent calls may still require confirmation (depends on app settings)
```

**Note:** AAI doesn't enforce Gateway identity verification, fully trusting the operating system and the application's own security mechanisms.

---

### 2.5 App Description File: aai.json

Each application supporting AAI provides `aai.json` in a unified AAI configuration directory.

#### File Location

| Platform      | Path                                  |
| ------------- | ------------------------------------- |
| macOS / Linux | `~/.aai/<appId>/aai.json`             |
| Windows       | `%USERPROFILE%\.aai\<appId>\aai.json` |

**Examples:**

- macOS: `~/.aai/com.apple.mail/aai.json`
- Windows: `C:\Users\Alice\.aai\com.microsoft.outlook\aai.json`

**Advantages:**

- No need to modify signed application packages
- No administrator permissions required
- Users or the community can freely add, modify, and delete configurations
- Gateway only needs to scan a single directory to discover all applications

#### Structure Example

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
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email via Apple Mail",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "script": "tell application \"Mail\"\n  set newMessage to make new outgoing message with properties {subject:\"${subject}\", content:\"${body}\", visible:false}\n  tell newMessage\n    make new to recipient at beginning of to recipients with properties {address:\"${to}\"}\n    send\n  end tell\nend tell\nreturn \"{\\\"success\\\":true, \\\"message_id\\\":\\\"generated\\\"}\"",
          "output_parser": "result as text"
        },
        {
          "name": "search_emails",
          "description": "Search emails in mailbox",
          "parameters": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "Search query string" }
            },
            "required": ["query"]
          },
          "script": "tell application \"Mail\"\n  set results to (messages whose subject contains \"${query}\")\nend tell\nreturn \"{\\\"emails\\\":[\\\"result1\\\", \\\"result2\\\"]}\"",
          "output_parser": "result as text"
        }
      ]
    },
    "windows": {
      "automation": "com",
      "progid": "Outlook.Application",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email via Microsoft Outlook",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "script": [
            { "action": "create", "var": "app", "progid": "Outlook.Application" },
            {
              "action": "call",
              "var": "mail",
              "object": "app",
              "method": "CreateItem",
              "args": [0]
            },
            { "action": "set", "object": "mail", "property": "To", "value": "${to}" },
            { "action": "set", "object": "mail", "property": "Subject", "value": "${subject}" },
            { "action": "set", "object": "mail", "property": "Body", "value": "${body}" },
            { "action": "call", "object": "mail", "method": "Send" },
            { "action": "return", "value": "{\"success\":true, \"message_id\":\"generated\"}" }
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
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "method": "SendEmail",
          "output_parser": "json"
        }
      ]
    },
    "android": {
      "automation": "intent",
      "package": "com.example.mail",
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
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
      "tools": [
        {
          "name": "send_email",
          "description": "Send a new email",
          "parameters": {
            "type": "object",
            "properties": {
              "to": { "type": "string", "description": "Recipient email address" },
              "subject": { "type": "string", "description": "Email subject" },
              "body": { "type": "string", "description": "Email body content" }
            },
            "required": ["to", "subject", "body"]
          },
          "url_template": "mailapp://send?to=${to}&subject=${subject}&body=${body}",
          "result_type": "app_group",
          "app_group_id": "group.com.example.mail"
        }
      ]
    }
  }
}
```

#### Field Descriptions

##### Common Fields

| Field            | Type   | Description                                                 |
| ---------------- | ------ | ----------------------------------------------------------- |
| `schema_version` | string | Schema version of aai.json, used for compatibility checking |
| `appId`          | string | Unique identifier (recommended to use reverse-DNS format)   |
| `name`           | string | Application name                                            |
| `description`    | string | Application description                                     |
| `version`        | string | aai.json version number                                     |
| `platforms`      | object | Automation configuration for each platform                  |

##### macOS Specific Fields

| Field                                   | Type    | Description                                                                       |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `platforms.macos.automation`            | string  | Automation type: `applescript` or `jxa`                                           |
| `platforms.macos.tools[].script`        | string  | Script template, supports `${param}` placeholders                                 |
| `platforms.macos.tools[].output_parser` | string  | Output parsing method: `result as text` (string), `result as record` (dictionary) |
| `platforms.macos.tools[].timeout`       | integer | Timeout in seconds, default 30                                                    |

##### Windows Specific Fields

| Field                                         | Type    | Description                                                                                                                          |
| --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `platforms.windows.automation`                | string  | Automation type: `com`                                                                                                               |
| `platforms.windows.progid`                    | string  | COM ProgID (e.g., `Outlook.Application`)                                                                                             |
| `platforms.windows.tools[].script`            | array   | COM operation sequence                                                                                                               |
| `platforms.windows.tools[].script[].action`   | string  | Operation type: `create` (create object), `call` (call method), `set` (set property), `get` (get property), `return` (return result) |
| `platforms.windows.tools[].script[].var`      | string  | Variable name (for storing return values)                                                                                            |
| `platforms.windows.tools[].script[].object`   | string  | Object reference (e.g., `mail`, `app`)                                                                                               |
| `platforms.windows.tools[].script[].progid`   | string  | ProgID (only used in `create` operations)                                                                                            |
| `platforms.windows.tools[].script[].method`   | string  | Method name (only used in `call` operations)                                                                                         |
| `platforms.windows.tools[].script[].property` | string  | Property name (only used in `set`/`get` operations)                                                                                  |
| `platforms.windows.tools[].script[].value`    | string  | Property value (supports `${param}` placeholders)                                                                                    |
| `platforms.windows.tools[].script[].args`     | array   | Method arguments (supports `${param}` placeholders)                                                                                  |
| `platforms.windows.tools[].output_parser`     | string  | Output parsing method: `last_result` (return value of last operation)                                                                |
| `platforms.windows.tools[].timeout`           | integer | Timeout in seconds, default 30                                                                                                       |

##### Linux Specific Fields

| Field                                   | Type    | Description                                                   |
| --------------------------------------- | ------- | ------------------------------------------------------------- |
| `platforms.linux.automation`            | string  | Automation type: `dbus`                                       |
| `platforms.linux.service`               | string  | DBus service name (e.g., `org.example.Mail`)                  |
| `platforms.linux.object`                | string  | DBus object path (e.g., `/org/example/Mail`)                  |
| `platforms.linux.interface`             | string  | DBus interface name (e.g., `org.example.Mail`)                |
| `platforms.linux.tools[].method`        | string  | DBus method name (e.g., `SendEmail`)                          |
| `platforms.linux.tools[].output_parser` | string  | Output parsing method: `json` (assumes JSON return), `string` |
| `platforms.linux.tools[].timeout`       | integer | Timeout in seconds, default 30                                |

##### Android Specific Fields

| Field                                   | Type    | Description                                                                             |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `platforms.android.automation`          | string  | Automation type: `intent`                                                               |
| `platforms.android.package`             | string  | Android package name (e.g., `com.example.mail`)                                         |
| `platforms.android.tools[].action`      | string  | Intent Action (e.g., `com.example.MAIL_SEND`)                                           |
| `platforms.android.tools[].extras`      | object  | Intent Extra parameters (supports `${param}` placeholders)                              |
| `platforms.android.tools[].result_type` | string  | Result retrieval method: `content_provider` (Content Provider), `broadcast` (broadcast) |
| `platforms.android.tools[].result_uri`  | string  | Content Provider URI (only used when `result_type=content_provider`)                    |
| `platforms.android.tools[].timeout`     | integer | Timeout in milliseconds, default 5000                                                   |

##### iOS Specific Fields

| Field                                | Type    | Description                                                                |
| ------------------------------------ | ------- | -------------------------------------------------------------------------- |
| `platforms.ios.automation`           | string  | Automation type: `url_scheme`                                              |
| `platforms.ios.scheme`               | string  | URL Scheme (e.g., `mailapp`)                                               |
| `platforms.ios.tools[].url_template` | string  | URL template (supports `${param}` placeholders)                            |
| `platforms.ios.tools[].result_type`  | string  | Result retrieval method: `app_group` (App Groups), `clipboard` (clipboard) |
| `platforms.ios.tools[].app_group_id` | string  | App Group ID (only used when `result_type=app_group`)                      |
| `platforms.ios.tools[].timeout`      | integer | Timeout in seconds, default 10                                             |

---

### 2.6 Progressive Skill Discovery (Avoiding Context Explosion)

AAI implements on-demand loading through the MCP resource model:

#### Step 1: List Available Apps

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

#### Step 2: Load Skill Details On Demand

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
        "text": "{\n  \"schema_version\": \"1.0\",\n  \"appId\": \"com.apple.mail\",\n  \"tools\": [...]\n}"
      }
    ]
  }
}
```

#### Step 3: Call Skill

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

**Advantage:** Only loads an application's tools when the user mentions it, greatly saving context.

---

### 2.7 Error Handling

Gateway should return standardized error responses:

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

#### Error Code Definitions

| Error Code | Type                     | Description                                           |
| ---------- | ------------------------ | ----------------------------------------------------- |
| -32001     | AUTOMATION_FAILED        | Automation script execution failed                    |
| -32002     | APP_NOT_FOUND            | Target application not installed or cannot be found   |
| -32003     | TOOL_NOT_FOUND           | Requested tool does not exist in aai.json             |
| -32004     | PERMISSION_DENIED        | Insufficient permissions, requires user authorization |
| -32005     | INVALID_PARAMS           | Parameter validation failed                           |
| -32006     | AUTOMATION_NOT_SUPPORTED | Platform does not support specified automation type   |
| -32007     | AAI_JSON_INVALID         | aai.json format error or does not match schema        |
| -32008     | TIMEOUT                  | Operation timed out                                   |
| -32009     | APP_NOT_RUNNING          | Application not running and cannot be started         |
| -32010     | SCRIPT_PARSE_ERROR       | Script parsing error                                  |

---

### 2.8 Complete Call Flow Example

#### User Input

> "Send an email to alice@example.com with subject 'Hello' using Mail"

#### Agent Behavior

1. Call `resources/list` → Discover `app:com.apple.mail`
2. Call `resources/read(app:com.apple.mail)` → Get `send_email` tool
3. Construct MCP `tools/call` request

#### Gateway Behavior (macOS Example)

1. Parse `aai.json`
2. Replace parameters in script template:
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
3. Execute AppleScript:
   ```bash
   osascript -e 'tell application "Mail"...'
   ```
4. If it's the first call, macOS pops up TCC authorization dialog
5. After user authorizes, script executes successfully
6. Parse return value (JSON string)
7. Return result:

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

#### User Experience

- macOS pops up TCC authorization dialog on first use
- User clicks [OK]
- Subsequent calls execute silently

---

### 2.9 App Developer Integration Guide

#### macOS Integration

**Existing automation support:**
If the application already supports AppleScript or JXA, **zero code** is needed to integrate with AAI:

1. Write `aai.json` configuration file
2. Place in `~/.aai/<appId>/aai.json`
3. Done!

**No automation support:**
If the application has no automation support, you need to:

1. Enable AppleScript in `Info.plist`:
   ```xml
   <key>NSAppleScriptEnabled</key>
   <true/>
   ```
2. Implement script commands (Swift/ObjC) or leverage JXA
3. Write `aai.json` configuration file

#### Windows Integration

**Existing automation support:**
If the application already supports COM, **zero code** is needed to integrate with AAI:

1. Confirm the application's ProgID (e.g., `MyApp.Application`)
2. Write `aai.json` configuration file
3. Place in `%USERPROFILE%\.aai\<appId>\aai.json`
4. Done!

**No automation support:**
If the application has no automation support, you need to:

1. Implement COM IDispatch interface (C#/C++)
2. Register ProgID
3. Write `aai.json` configuration file

#### Linux Integration

**Existing automation support:**
If the application already supports DBus, **zero code** is needed to integrate with AAI:

1. Confirm DBus service name, object path, interface
2. Write `aai.json` configuration file
3. Place in `~/.aai/<appId>/aai.json`
4. Done!

**No automation support:**
If the application has no automation support, you need to:

1. Implement DBus interface
2. Write `aai.json` configuration file

#### iOS Integration

All iOS apps support URL Scheme, you only need to:

1. Declare URL Scheme in `Info.plist`:
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
2. Implement URL Scheme handling logic
3. Write `aai.json` configuration file

#### Third-Party Configuration

Users or the community can also create aai.json configuration for existing applications:

1. Create directory: `~/.aai/<appId>/`
2. Write `aai.json` describing the application's existing automation interfaces
3. Gateway automatically discovers and loads

**Key: No HTTP server, no OAuth, no additional development.**

---

### 2.10 Agent Configuration Examples

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

Add MCP server in plugin settings:

- Command: `aai-gateway`
- Args: `--mcp`

#### Cursor / Cline

Add in MCP server configuration:

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

### 2.11 Technical Constraints

AAI defines the following constraints to ensure protocol simplicity and security:

| Constraint                                             | Description                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| **Only use** platform-native automation tools          | AppleScript, COM, DBus, Intent, URL Scheme                       |
| **Do not require** App to start additional HTTP Server | Avoids resource waste and complexity                             |
| **Do not require** App to implement OAuth              | Use operating system's native authorization mechanisms           |
| **Do not replace** system security mechanisms          | TCC/COM permissions managed by OS                                |
| **Support** existing applications                      | Leverage application's existing automation capabilities          |
| **Do not force** use of specific programming language  | Applications can implement automation interfaces in any language |

---

### 2.12 Integration Cost Analysis

#### Cost Tiers

| Application Type                | Existing Capabilities                                     | Human Cost                       | Cost with AI Assistance              |
| ------------------------------- | --------------------------------------------------------- | -------------------------------- | ------------------------------------ |
| **Existing automation support** | macOS system apps, Office suite, apps supporting COM/DBus | **Zero code** (write aai.json)   | **Seconds** (AI auto-generates)      |
| **Has script interface**        | Apps supporting Python/PowerShell scripts                 | **Zero code** (wrap as aai.json) | **Minutes** (AI auto-wraps)          |
| **No automation interface**     | Native apps, games                                        | 3-5 days (add automation)        | **Hours to days** (AI modifies code) |

#### AI Coding Acceleration Example

**Scenario: Generate aai.json for Mail application**

**Prompt to AI:**

```
Analyze Apple Mail's AppleScript documentation and generate an AAI aai.json description file.
Need to expose these tools:
- Email sending (send_email): parameters include to, subject, body
- Email searching (search_emails): parameters include query, limit
- Mark email as read (mark_as_read): parameters include message_id

Return the complete JSON format.
```

**AI Output:** Directly generates compliant `aai.json`

**Time:** Seconds

---

### 2.13 Integration with Agent Frameworks

#### AAI's Design Philosophy

AAI is **zero-intrusion** to existing Agent frameworks based on MCP standards:

```
Existing Agent Frameworks (Cursor, Continue, AutoGPT, etc.)
    ↓ (Already support MCP)
Add AAI Gateway Configuration
    ↓
Ready to use AAI capabilities
```

#### Compatible Frameworks

| Framework         | MCP Support       | Integration Method           |
| ----------------- | ----------------- | ---------------------------- |
| **Cursor**        | ✅ Native support | MCP server configuration     |
| **Continue.dev**  | ✅ Native support | Configure `mcpServers`       |
| **Cline**         | ✅ Native support | MCP configuration file       |
| **LibreChat**     | ✅ Native support | MCP connection configuration |
| **Cherry Studio** | ✅ Native support | MCP service configuration    |
| **LobeHub**       | ✅ Native support | MCP client configuration     |

**No need to modify framework code, just add AAI Gateway configuration.**

---

### 2.14 Advantages Summary

| Issue                           | AAI Solution                                              |
| ------------------------------- | --------------------------------------------------------- |
| High app integration cost?      | Apps only need to provide `aai.json` descriptor           |
| Need additional server?         | **No**, direct invocation                                 |
| Need OAuth?                     | **No**, uses system's native authorization mechanisms     |
| Agent needs custom development? | Zero code, standard MCP is enough                         |
| Context too large?              | Progressive tool loading                                  |
| Cross-platform?                 | Unified abstraction, platform-specific implementation     |
| Slow operation speed?           | **Millisecond-level calls** vs seconds for GUI automation |
| Cannot parallelize?             | Supports multi-application parallel operations            |

---

## Part III: Getting Started

### Installation

```bash
npm install -g aai-gateway
```

### Usage

Start the Gateway in MCP mode (standard usage):

```bash
aai-gateway --mcp
```

Start with Web UI:

```bash
aai-gateway --web
```

### CLI Commands

- `aai-gateway --scan`: Manually scan for configured applications.
- `aai-gateway --discover`: Auto-discover system applications (macOS).
- `aai-gateway --generate <app>`: Use AI to generate `aai.json` for an application.

### Configuration

Configuration file location: `~/.aai/config.json`

```json
{
  "scanPaths": ["~/.aai"],
  "defaultTimeout": 30,
  "logLevel": "info",
  "enableWebUI": true,
  "httpPort": 3000
}
```

---

## Part IV: Roadmap

### Current Status

✅ **Protocol design complete**

- Defined aai.json schema for describing application tools
- Based on MCP standards for Agent integration
- Cross-platform support (macOS, Windows, Linux, Android, iOS)

🚧 **Implementation in progress**

### TODO: AAI Gateway Development

#### Core Features

- [x] **MCP Server Implementation** (resources/list, resources/read, tools/call)

- [x] **Automation Executors**
  - [x] macOS (AppleScript/JXA executor, parameter replacement, output parsing)
  - [x] Windows (COM object creation, script execution, UAC handling)
  - [x] Linux (DBus method invocation)
  - [ ] Android (Intent sending, Content Provider results) - **Removed**
  - [ ] iOS (URL Scheme invocation, App Groups results) - **Removed**

#### Configuration Management

- [x] **Application Discovery and Auto-Generation**
  - [x] Scan `~/.aai/` directory and load existing `aai.json` files
  - [x] Auto-discover system apps with automation support (macOS AppleScript/JXA, Windows COM, Linux DBus)
  - [x] Generate `aai.json` automatically from app automation interfaces
  - [x] AI-powered descriptor generation for discovered apps
  - [x] Scheduled periodic scanning (configurable interval)
  - [x] Manual scan trigger (CLI/Web UI)

- [x] **Configuration File Support**
  - [x] `~/.aai/config.json` - Gateway configuration
  - [x] Support custom scan paths
  - [x] Support timeout time configuration

#### Error Handling and Logging

- [x] Standardized error handling (error codes, retry mechanism)
- [x] Logging system (operation/error logs, log level control)

#### Web UI (HTTP Interface)

- [x] HTTP server on same port as MCP server with `/ui` endpoint
- [x] Configuration management (view settings, scan paths, timeouts)
- [x] App management (list/view applications)
- [x] Call history viewer (filter by app/tool/time, show request/response details)

### TODO: Phase 2 - Agent-Native App Store

- [ ] **Web App Store** (application showcase, search, reviews, ratings, version management)
- [ ] **Application Installation** (one-click install, auto-config, auto-registration)
- [ ] **Agent Integration** (store search, installation prompts, on-demand install mode)

### TODO: Phase 3 - Advanced Features

- [ ] **Workflow Orchestration** (cross-app workflows, transactions, rollback, events)
- [ ] **Batch Operations** (batch tool calls, parallel execution, result aggregation)
- [ ] **Enhanced Tool Discovery** (smart recommendation, usage stats, rating system)

---

## Appendix A: Glossary

| Term            | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| **AAI**         | Agent App Interface, interface protocol between Agents and applications  |
| **MCP**         | Model Context Protocol, LLM Agent standard tool protocol                 |
| **IPC**         | Inter-Process Communication, communication between processes             |
| **AppleScript** | macOS native scripting language for application automation               |
| **JXA**         | JavaScript for Automation, AppleScript's modern alternative              |
| **COM**         | Component Object Model, Windows native component communication mechanism |
| **DBus**        | Linux desktop system's standard message bus system                       |

| **TCC** | Transparency, Consent, and Control, macOS privacy framework |
| **UAC** | User Account Control, Windows user account control |
| **AppleEvents** | IPC mechanism underlying AppleScript |
| **Gateway** | AAI protocol gateway implementation, responsible for translating MCP requests to platform automation |

---

## Appendix B: Implementation Reference

### AAI Gateway Implementation Points

```
┌─────────────────────────────────────────┐
│      AAI Gateway (Long-running service) │
├─────────────────────────────────────────┤
│  1. MCP Server Implementation          │
│     - resources/list                   │
│     - resources/read                   │
│     - tools/call                       │
├─────────────────────────────────────────┤
│  2. Automation Executors (Platform-specific)│
│     - macOS: AppleScript/JXA Executor   │
│     - Windows: COM Executor           │
│     - Linux: DBus Executor            │
├─────────────────────────────────────────┤
│  3. aai.json Parser                    │
│     - Schema validation                │
│     - Script template parameter replacement│
│     - Platform tool filtering         │
├─────────────────────────────────────────┤
│  4. Error Handling                     │
│     - Standardized error codes         │
│     - Friendly error messages           │
│     - Automatic retry mechanism        │
└─────────────────────────────────────────┘
```

### Recommended Technology Stack

| Component          | Recommended Implementation                              | Description               |
| ------------------ | ------------------------------------------------------- | ------------------------- |
| MCP Server         | `@modelcontextprotocol/sdk` TypeScript SDK / Python SDK | Official SDK              |
| aai.json Parsing   | `jsonschema` Python / `ajv` JavaScript                  | Schema validation         |
| macOS Automation   | `osascript` CLI / `pyobjc`                              | AppleScript/JXA execution |
| Windows Automation | `pywin32` / `win32com`                                  | COM calls                 |
| Linux Automation   | `dbus-python`                                           | DBus calls                |

---

## Appendix C: Schema Definition

### aai.json Schema (Initial Version)

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
      "description": "Reverse-DNS format unique identifier"
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
      "description": "Automation configuration for each platform",
      "properties": {
        "macos": {
          "type": "object",
          "properties": {
            "automation": {
              "type": "string",
              "enum": ["applescript", "jxa"]
            },
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "script"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
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
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "script"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": { "type": "object", "description": "JSON Schema for tool parameters" },
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
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "method"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
                  "method": { "type": "string" },
                  "output_parser": { "type": "string" },
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
              }
            }
          }
        },
        "windows": {
          "type": "object",
          "properties": {
            "automation": { "type": "string", "enum": ["com"] },
            "progid": { "type": "string" },
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "script"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
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
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "method"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
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
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "action"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
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
            "tools": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name", "description", "parameters", "url_template"],
                "properties": {
                  "name": { "type": "string" },
                  "description": { "type": "string" },
                  "parameters": {
                    "type": "object",
                    "description": "JSON Schema for tool parameters"
                  },
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

## Appendix D: Quick Start Guide

> **Note:** AAI Gateway is currently under development. The following describes the intended usage flow.

### 1. Configure Agent

Add AAI Gateway to your Agent's MCP configuration (e.g., Continue.dev `~/.continue/config.ts`):

```typescript
mcpServers: {
  aai: {
    command: "aai-gateway",
    args: ["--mcp"]
  }
}
```

### 2. Add Application Descriptor

Create an `aai.json` file for your target application:

```bash
mkdir -p ~/.aai/com.apple.mail
# Write aai.json (see Section 2.5 for schema)
```

### 3. Usage

In your Agent, request actions like:

> "Send an email to alice@example.com with subject 'Hello' using Mail"

On first use, the operating system will show an authorization dialog.

---

**AAI: Let Agents directly invoke application capabilities instead of simulating human GUI operations.**

---

_License: CC BY-SA 4.0_
