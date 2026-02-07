import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebServer } from '../../src/web/server.js';
import { AppRegistry } from '../../src/config/discovery.js';
import type { GatewayConfig } from '../../src/config/config-loader.js';

describe('Web UI API', () => {
  let server: WebServer;
  let port: number;
  const baseUrl = () => `http://localhost:${port}`;

  beforeAll(async () => {
    const config: GatewayConfig = {
      scanPaths: [],
      defaultTimeout: 30,
      logLevel: 'error',
      enableWebUI: true,
      scanIntervalMinutes: 60,
    };
    const registry = new AppRegistry();
    registry.register({
      appId: 'com.test.app',
      name: 'Test App',
      path: '/path/to/app',
      config: {
        schema_version: '1.0',
        appId: 'com.test.app',
        name: 'Test App',
        version: '1.0',
        platforms: {},
      },
    });

    server = new WebServer(config, registry);

    port = 4000 + Math.floor(Math.random() * 1000);
    await server.start(port);
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('GET /api/config returns configuration', async () => {
    const res = await fetch(`${baseUrl()}/api/config`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.config.enableWebUI).toBe(true);
  });

  it('GET /api/apps returns registered apps', async () => {
    const res = await fetch(`${baseUrl()}/api/apps`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.apps[0].appId).toBe('com.test.app');
  });

  it('GET /api/history returns history', async () => {
    const res = await fetch(`${baseUrl()}/api/history`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.history)).toBe(true);
  });
});
