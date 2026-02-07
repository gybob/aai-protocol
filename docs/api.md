# AAI Gateway API

## MCP Protocol

The Gateway implements the Model Context Protocol (MCP).

### Resources

- `app:<appId>`: Get configuration for a specific app.
  - Example: `resources/read` with `uri="app:com.apple.mail"`

### Tools

Tools are dynamically loaded from `aai.json` files.

- List tools: `tools/list`
- Call tool: `tools/call`
  - Name format: `<appId>:<toolName>`
  - Arguments: Defined in `aai.json` schema.

## Web API

The Gateway provides a REST API for management.

### Endpoints

- `GET /api/apps`: List all registered applications.
- `GET /api/apps/:appId`: Get details for an application.
- `GET /api/config`: Get Gateway configuration.
- `POST /api/scan`: Trigger application scan.
- `GET /api/history`: Get tool call history.
