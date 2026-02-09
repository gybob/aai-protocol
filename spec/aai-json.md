# App Description File: aai.json

Each application supporting AAI provides `aai.json` in a unified AAI configuration directory.

## File Location

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

## Structure Example

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

## Field Descriptions

### Common Fields

| Field            | Type   | Description                                                 |
| ---------------- | ------ | ----------------------------------------------------------- |
| `schema_version` | string | Schema version of aai.json, used for compatibility checking |
| `appId`          | string | Unique identifier (recommended to use reverse-DNS format)   |
| `name`           | string | Application name                                            |
| `description`    | string | Application description                                     |
| `version`        | string | aai.json version number                                     |
| `platforms`      | object | Automation configuration for each platform                  |

### macOS Specific Fields

| Field                                   | Type    | Description                                                                       |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `platforms.macos.automation`            | string  | Automation type: `applescript` or `jxa`                                           |
| `platforms.macos.tools[].script`        | string  | Script template, supports `${param}` placeholders                                 |
| `platforms.macos.tools[].output_parser` | string  | Output parsing method: `result as text` (string), `result as record` (dictionary) |
| `platforms.macos.tools[].timeout`       | integer | Timeout in seconds, default 30                                                    |

### Windows Specific Fields

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

### Linux Specific Fields

| Field                                   | Type    | Description                                                   |
| --------------------------------------- | ------- | ------------------------------------------------------------- |
| `platforms.linux.automation`            | string  | Automation type: `dbus`                                       |
| `platforms.linux.service`               | string  | DBus service name (e.g., `org.example.Mail`)                  |
| `platforms.linux.object`                | string  | DBus object path (e.g., `/org/example/Mail`)                  |
| `platforms.linux.interface`             | string  | DBus interface name (e.g., `org.example.Mail`)                |
| `platforms.linux.tools[].method`        | string  | DBus method name (e.g., `SendEmail`)                          |
| `platforms.linux.tools[].output_parser` | string  | Output parsing method: `json` (assumes JSON return), `string` |
| `platforms.linux.tools[].timeout`       | integer | Timeout in seconds, default 30                                |

### Android Specific Fields

| Field                                   | Type    | Description                                                                             |
| --------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `platforms.android.automation`          | string  | Automation type: `intent`                                                               |
| `platforms.android.package`             | string  | Android package name (e.g., `com.example.mail`)                                         |
| `platforms.android.tools[].action`      | string  | Intent Action (e.g., `com.example.MAIL_SEND`)                                           |
| `platforms.android.tools[].extras`      | object  | Intent Extra parameters (supports `${param}` placeholders)                              |
| `platforms.android.tools[].result_type` | string  | Result retrieval method: `content_provider` (Content Provider), `broadcast` (broadcast) |
| `platforms.android.tools[].result_uri`  | string  | Content Provider URI (only used when `result_type=content_provider`)                    |
| `platforms.android.tools[].timeout`     | integer | Timeout in milliseconds, default 5000                                                   |

### iOS Specific Fields

| Field                                | Type    | Description                                                                |
| ------------------------------------ | ------- | -------------------------------------------------------------------------- |
| `platforms.ios.automation`           | string  | Automation type: `url_scheme`                                              |
| `platforms.ios.scheme`               | string  | URL Scheme (e.g., `mailapp`)                                               |
| `platforms.ios.tools[].url_template` | string  | URL template (supports `${param}` placeholders)                            |
| `platforms.ios.tools[].result_type`  | string  | Result retrieval method: `app_group` (App Groups), `clipboard` (clipboard) |
| `platforms.ios.tools[].app_group_id` | string  | App Group ID (only used when `result_type=app_group`)                      |
| `platforms.ios.tools[].timeout`      | integer | Timeout in seconds, default 10                                             |

---

[Back to Spec Index](./README.md)
