# AAI Protocol Specification Index

This directory contains the full technical specification for the AAI (Agent App Interface) protocol.

## Specification Documents

| Document | Description |
|----------|-------------|
| [Overview](./overview.md) | Why AAI? Motivation, current limitations, and the dual-interface vision |
| [Architecture](./architecture.md) | System architecture diagram, component responsibilities, key principles |
| [aai.json Descriptor](./aai-json.md) | App description file format, file locations, structure, and all field descriptions |
| [Security Model](./security.md) | Platform authorization flows (macOS TCC, Windows COM, Linux Polkit) |
| [Progressive Discovery](./discovery.md) | 3-step skill discovery via MCP resource model (list, read, call) |
| [Error Codes](./error-codes.md) | Standardized error response format and error code table |
| [Call Flow](./call-flow.md) | Complete end-to-end call flow example |
| [Glossary](./glossary.md) | Definitions of key terms |

## Platform Guides

| Platform | Description |
|----------|-------------|
| [macOS](./platforms/macos.md) | AppleScript / JXA automation, integration guide |
| [Windows](./platforms/windows.md) | COM automation, integration guide |
| [Linux](./platforms/linux.md) | DBus automation, integration guide |

## Schema and Examples

| Resource | Description |
|----------|-------------|
| [aai.schema.json](../schema/aai.schema.json) | Machine-readable JSON Schema for aai.json validation |
| [com.apple.mail.aai.json](../examples/com.apple.mail.aai.json) | Example multi-platform aai.json for Apple Mail |
