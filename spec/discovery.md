# Progressive Skill Discovery (Avoiding Context Explosion)

AAI implements on-demand loading through the MCP resource model.

## Step 1: List Available Apps

```json
// Agent -> Gateway
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}

// Gateway -> Agent
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

## Step 2: Load Skill Details On Demand

```json
// Agent -> Gateway
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "app:com.apple.mail"
  }
}

// Gateway -> Agent
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

## Step 3: Call Skill

```json
// Agent -> Gateway
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

// Gateway -> Agent
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

## Web App Discovery

Desktop apps are discovered by scanning `~/.aai/` on the local filesystem. Web Apps cannot write to the local filesystem, so they are discovered via the **AAI Registry**.

### Discovery Flow

```
Gateway Startup
   ↓
1. Scan ~/.aai/ for local desktop app descriptors
   ↓
2. Fetch Web App directory from AAI Registry
   (registry returns list of aai.json URLs)
   ↓
3. Download each aai.json → cache locally at ~/.aai/web/<appId>/aai.json
   ↓
4. All apps (desktop + web) are now available via resources/list
```

### Registry API

Gateway fetches the Web App directory from the AAI Registry on startup:

```json
// Gateway -> AAI Registry
GET https://registry.aai-protocol.com/api/v1/apps

// AAI Registry -> Gateway
{
  "apps": [
    {
      "appId": "com.notion.api",
      "name": "Notion",
      "descriptor_url": "https://api.notion.com/.well-known/aai.json"
    },
    {
      "appId": "com.slack.api",
      "name": "Slack",
      "descriptor_url": "https://slack.com/.well-known/aai.json"
    }
  ]
}
```

Gateway then fetches each `descriptor_url` to load the full `aai.json`.

### First-Time Web App Access

When an Agent calls a Web App tool for the first time, Gateway prompts the user to verify the domain and SSL certificate before proceeding with authorization. See [Security Model](./security.md) for details.

---

[Back to Spec Index](./README.md)
