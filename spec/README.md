# AAI Protocol Specification

This directory contains the technical specification for the AAI (Agent App Interface) protocol.

## Core Documents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture and component responsibilities |
| [aai.json Descriptor](./aai-json.md) | Descriptor format, JSON Schema based tool definitions |
| [Security Model](./security.md) | Authorization flows for desktop and web apps |
| [Progressive Skill Discovery](./discovery.md) | On-demand tool discovery via MCP |

## Platform Implementation Guides

| Platform | Description |
|----------|-------------|
| [Desktop](./platforms/macos.md) | JSON-based IPC protocol on Apple Events |
| [Web App](./platforms/web.md) | REST API + OAuth 2.1 integration |

## Resources

| Resource | Description |
|----------|-------------|
| [aai.schema.json](../schema/aai.schema.json) | JSON Schema for descriptor validation |
| [Examples](../examples/) | Sample descriptor files |
