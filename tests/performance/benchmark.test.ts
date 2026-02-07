import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join } from 'path';

describe('Performance Benchmark', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const scriptPath = join(process.cwd(), 'dist/cli.js');

    transport = new StdioClientTransport({
      command: 'node',
      args: [scriptPath, '--mcp'],
    });

    client = new Client(
      {
        name: 'perf-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('measures resources/list latency', async () => {
    const iterations = 50;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await client.listResources();
    }

    const end = performance.now();
    const avg = (end - start) / iterations;
    console.log(`Average resources/list latency: ${avg.toFixed(2)}ms`);
    expect(avg).toBeLessThan(100);
  });

  it('measures tools/list latency', async () => {
    const iterations = 50;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await client.listTools();
    }

    const end = performance.now();
    const avg = (end - start) / iterations;
    console.log(`Average tools/list latency: ${avg.toFixed(2)}ms`);
    expect(avg).toBeLessThan(100);
  });
});
