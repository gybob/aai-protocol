# Discovery

AAI uses on-demand loading via MCP resources to avoid context explosion.

## The Problem

Loading all app descriptors at once would flood the Agent's context:

```
50 apps × 10 tools × 500 tokens = 250,000 tokens
```

Progressive discovery solves this by loading only what's needed.

## Discovery Flow

### Step 1: List Available Apps

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
        "uri": "app:com.example.mail",
        "name": "Mail",
        "description": "Email client"
      },
      {
        "uri": "app:com.example.calendar",
        "name": "Calendar",
        "description": "Calendar application"
      }
    ]
  }
}
```

### Step 2: Load App Details On Demand

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "app:com.example.mail"
  }
}

// Gateway → Agent (returns full descriptor)
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [{
      "uri": "app:com.example.mail",
      "mimeType": "application/json",
      "text": "{ \"tools\": [...] }"
    }]
  }
}
```

### Step 3: Call Tool

```json
// Agent → Gateway
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "com.example.mail:send_email",
    "arguments": {
      "to": ["alice@example.com"],
      "body": "Hello!"
    }
  }
}

// Gateway → Agent
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "Email sent. Message ID: msg_123"
    }]
  }
}
```

## Descriptor Sources

### Desktop Apps

Local filesystem discovery:

```
~/.aai/
├── com.example.mail/
│   └── aai.json
└── com.example.calendar/
    └── aai.json
```

Gateway scans this directory on startup.

### Web Apps

Discovered via AAI Registry:

```
1. Gateway fetches app directory from registry
2. Downloads each descriptor_url
3. Caches locally at ~/.aai/web/<app_id>/aai.json
```

Registry API:
```json
GET https://registry.aai-protocol.org/v1/apps

{
  "apps": [
    {
      "id": "com.notion.api",
      "name": "Notion",
      "descriptor_url": "https://api.notion.com/.well-known/aai.json"
    }
  ]
}
```

## Benefits

| Approach | Context Usage | Use Case |
|----------|---------------|----------|
| Load all | ~250k tokens | Never |
| Progressive | ~5k per app | On demand |

Agent only loads descriptors when the user mentions an app.

---

[Back to Spec Index](./README.md)
