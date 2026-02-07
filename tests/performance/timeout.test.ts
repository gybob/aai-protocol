import { describe, it, expect, vi } from 'vitest';
import { AAIGateway } from '../../src/mcp/server.js';
import { AutomationExecutor, ExecutionResult } from '../../src/executors/base.js';
import { AppRegistry } from '../../src/config/discovery.js';
import { getCurrentPlatform } from '../../src/executors/base.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

class MockHangingExecutor implements AutomationExecutor {
  async execute(
    script: string,
    params: Record<string, any>,
    options?: { timeout?: number }
  ): Promise<ExecutionResult> {
    const timeout = options?.timeout ?? 30;
    const duration = 2000;

    if (duration > timeout * 1000) {
      throw new Error('Execution timed out');
    }

    await new Promise((resolve) => setTimeout(resolve, duration));
    return { success: true, data: 'done' };
  }
}

describe('Timeout Handling', () => {
  it('should timeout if execution takes too long', async () => {
    const gateway = new AAIGateway();

    (gateway as any).executors.set('mock', new MockHangingExecutor());

    const registry = (gateway as any).registry as AppRegistry;
    const platform = getCurrentPlatform();

    registry.register({
      appId: 'com.test.timeout',
      name: 'Timeout App',
      path: '/path',
      config: {
        schema_version: '1.0',
        appId: 'com.test.timeout',
        name: 'Timeout App',
        version: '1.0',
        platforms: {
          [platform]: {
            automation: 'mock',
            tools: [
              {
                name: 'hang',
                description: 'Hangs',
                parameters: { type: 'object', properties: {} },
                script: '',
                timeout: 1,
              },
            ],
          },
        },
      },
    });

    let callHandler: any;
    (gateway as any).server = {
      setRequestHandler: (schema: any, handler: any) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      },
      connect: vi.fn(),
    };

    (gateway as any).setupHandlers();

    expect(callHandler).toBeDefined();

    const request = {
      params: {
        name: 'com.test.timeout:hang',
        arguments: {},
      },
    };

    const result = await callHandler(request);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Execution timed out');
  });
});

    // Mock server.setRequestHandler to capture the handler
    let callHandler: any;
    (gateway as any).server = {
      setRequestHandler: (schema: any, handler: any) => {
        if (schema === CallToolRequestSchema) {
          callHandler = handler;
        }
      },
      connect: vi.fn(),
    };

    // Initialize triggers setupHandlers
    (gateway as any).setupHandlers();

    expect(callHandler).toBeDefined();

    // Call the handler
    const request = {
      params: {
        name: 'com.test.timeout:hang',
        arguments: {},
      },
    };

    // The handler should throw or return error
    // In server.ts, we catch errors.
    // If timeout happens, it throws Error.

    // But wait, who enforces timeout?
    // In server.ts:
    /*
        const result = await withRetry(async () => {
          return await executor.execute(script as string, args ?? {}, {
            timeout: tool.timeout ?? this.config?.defaultTimeout ?? 30,
          });
        });
    */
    // `executor.execute` receives timeout option.
    // Does `MockHangingExecutor` respect timeout? No!
    // Real executors (MacOSExecutor) implement timeout logic (e.g. via child_process timeout).

    // So if I use a custom executor that IGNORES timeout, the Gateway itself doesn't enforce it?
    // Let's check `withRetry`.

    // `withRetry` logic:
    /*
      const timeout = ... (this is retry delay)
      await new Promise(...)
    */
    // It doesn't enforce execution timeout.

    // So the EXECUTOR is responsible for timeout.
    // If I want to test Gateway handling of timeout error, I should make MockExecutor throw a timeout error.
    // Or I should update `server.ts` or `base.ts` to enforce timeout at a higher level (Promise.race).

    // It is safer to enforce timeout at Gateway level too.

    // Let's first test if it fails (it will hang 2 seconds then succeed, failing the "should timeout" expectation if I expect immediate failure, but I can't set expectation on duration easily here).

    // I will simulate a Timeout Error from executor.
  });
});
