# Architecture Design

## Overview

AAI Gateway acts as a bridge between LLM Agents (via MCP) and local applications (via platform automation).

## Components

### MCP Server (`src/mcp/`)

Handles MCP protocol requests (`resources/list`, `tools/call`).

### Executors (`src/executors/`)

Platform-specific automation implementations:

- **macOS**: `osascript` (AppleScript/JXA)
- **Windows**: `powershell` / COM
- **Linux**: `dbus-send`

### Configuration (`src/config/`)

- **Discovery**: Scans `~/.aai` for `aai.json`.
- **Loader**: Loads and validates configurations.
- **Watcher**: Hot-reloads configuration changes.

### Web UI (`src/web/`)

Provides a dashboard for management and history viewing.

## Data Flow

1. Agent sends `tools/call` request.
2. Gateway validates request against `aai.json` schema.
3. Gateway selects appropriate Executor based on platform.
4. Executor runs automation script.
5. Result is parsed and returned to Agent.
