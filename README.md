# AAI (Agent App Interface)

**AAI** is an open protocol that enables AI Agents to directly invoke application capabilities -- bypassing the slow, fragile approach of "watching screens and simulating clicks."

> From GUI to AAI: The inevitable evolution of the Agent era.

## What is AAI?

- **For App Developers**: Expose your app's capabilities to AI Agents by writing a simple `aai.json` descriptor. Zero code changes needed if your app already supports platform automation (AppleScript, COM, DBus).
- **For Agent Developers**: Connect to any AAI-enabled application through standard MCP. No custom integrations needed.
- **For Users**: Let your AI Agent directly control applications -- send emails, manage calendars, edit documents -- in milliseconds instead of seconds.

## Quick Links

| Resource | Description |
|----------|-------------|
| [Protocol Specification](./spec/README.md) | Full technical specification |
| [aai.json Schema](./schema/aai.schema.json) | Machine-readable JSON Schema |
| [Examples](./examples/com.apple.mail.aai.json) | Example aai.json descriptor |
| [AAI Gateway](https://github.com/gybob/aai-protocol) | Reference implementation |

## Core Concept

```
Traditional:  Agent -> [Screenshot] -> [OCR] -> [Click] -> GUI -> App  (seconds)
AAI:          Agent -> [MCP] -> AAI Gateway -> [IPC] -> App            (milliseconds)
```

Applications provide two independent interfaces:

- **GUI** -- for humans (visual, intuitive)
- **AAI** -- for Agents (structured, programmable, parallel)

Both access the same core business logic. Neither interferes with the other.

## Protocol Overview

1. Apps describe their capabilities in `aai.json` (placed in `~/.aai/<appId>/aai.json`)
2. AAI Gateway discovers and loads these descriptors
3. Agents connect to the Gateway via standard MCP (stdio)
4. Gateway translates MCP requests into platform-native automation calls

See the [full specification](./spec/README.md) for details.

## License

CC BY-SA 4.0
