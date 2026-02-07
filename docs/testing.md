# Testing Guide

We use `vitest` for testing.

## Unit Tests

Run all unit tests:

```bash
npm test
```

Unit tests are located in `tests/unit/`.

## Integration Tests

Integration tests verify component interactions (e.g., Web API).
Located in `tests/integration/`.

## E2E Tests

End-to-end tests run against real applications (macOS only currently).
Located in `tests/e2e/`.

**Note**: E2E tests require local environment setup (e.g. Reminders app) and may trigger TCC prompts.

## Performance Tests

Benchmark scripts are in `tests/performance/`.
