# AAI Gateway Development Learnings

## Architecture Decisions

- **Executor Pattern**: Uses `AutomationExecutor` interface for platform abstraction.
- **Config Management**: Uses `zod` for validation and `ajv` for JSON Schema validation.
- **MCP Server**: Built on top of `@modelcontextprotocol/sdk` using `StdioServerTransport`.

## Implementation Details

- **Param Transformation**: Safe parameter replacement using `replaceParamsSecure` to prevent injection attacks.
- **Error Handling**: Standardized error codes in `src/errors/errors.ts`.
- **Discovery**: Scanning `~/.aai` (and other paths) for `aai.json` configuration files.

## Testing Strategy

- **Unit Tests**: `vitest` for logic verification.
- **E2E Tests**: Full chain verification using actual platform automation (e.g., Reminders on macOS).
- **Mocking**: Use mocks for platform-specific executors when running on CI/different platforms.

## Current Status (2025-02-07)

- **Completed**:
  - Core MCP Server implementation.
  - macOS Executor (AppleScript).
  - Basic Configuration Loading.
  - Error Handling & Logging.
  - E2E Test for Reminders App.

- **Pending**:
  - Auto-discovery for apps.
  - Windows/Linux Executors (implementation exists but untested).
  - Advanced features (AI generation, Web UI).
