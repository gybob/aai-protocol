import { createServer, IncomingMessage, ServerResponse } from 'http';

import { logger } from '../utils/logger.js';
import { AppRegistry, scanAllPaths } from '../config/discovery.js';
import { loadConfig } from '../config/config-loader.js';
import type { GatewayConfig } from '../config/config-loader.js';
import { metrics } from '../utils/metrics.js';

export interface CallHistoryEntry {
  id: string;
  timestamp: Date;
  appId: string;
  tool: string;
  params: Record<string, unknown>;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}

export class WebServer {
  private config: GatewayConfig;
  private registry: AppRegistry;
  private callHistory: CallHistoryEntry[] = [];
  private maxHistorySize = 1000;
  private server: import('http').Server | null = null;

  constructor(config: GatewayConfig, registry: AppRegistry) {
    this.config = config;
    this.registry = registry;
  }

  addToHistory(entry: CallHistoryEntry): void {
    this.callHistory.unshift(entry);
    if (this.callHistory.length > this.maxHistorySize) {
      this.callHistory.pop();
    }
  }

  async start(port: number): Promise<void> {
    this.server = createServer((req, res) => {
      this.handleRequest(req, res).catch((error) => {
        logger.error({ error }, 'Request handler error');
        this.sendJson(res, 500, { error: 'Internal server error' });
      });
    });

    return new Promise((resolve) => {
      this.server!.listen(port, () => {
        logger.info({ port }, 'Web UI server started');
        console.log(`\nAAI Gateway Web UI: http://localhost:${port}`);
        console.log(`API Endpoints:`);
        console.log(`  GET  /api/apps          - List all applications`);
        console.log(`  GET  /api/apps/:appId   - Get application details`);
        console.log(`  GET  /api/config        - Get gateway configuration`);
        console.log(`  POST /api/scan          - Trigger application scan`);
        console.log(`  GET  /api/history       - Get call history`);
        console.log(`  POST /api/test          - Test a tool call`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method ?? 'GET';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (path === '/' || path === '/ui') {
      await this.serveUI(res);
      return;
    }

    if (path === '/api/apps' && method === 'GET') {
      await this.handleListApps(res);
      return;
    }

    if (path.startsWith('/api/apps/') && method === 'GET') {
      const appId = path.slice('/api/apps/'.length);
      await this.handleGetApp(res, appId);
      return;
    }

    if (path === '/api/config' && method === 'GET') {
      await this.handleGetConfig(res);
      return;
    }

    if (path === '/api/scan' && method === 'POST') {
      await this.handleScan(res);
      return;
    }

    if (path === '/api/history' && method === 'GET') {
      await this.handleGetHistory(res, url);
      return;
    }

    if (path === '/api/test' && method === 'POST') {
      await this.handleTestTool(req, res);
      return;
    }

    if (path === '/metrics' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(metrics.export());
      return;
    }

    this.sendJson(res, 404, { error: 'Not found' });
  }

  private async handleListApps(res: ServerResponse): Promise<void> {
    const apps = this.registry.getAll().map((app) => ({
      appId: app.appId,
      name: app.name,
      description: app.description,
      path: app.path,
      platforms: Object.keys(app.config.platforms),
    }));

    this.sendJson(res, 200, { apps, total: apps.length });
  }

  private async handleGetApp(res: ServerResponse, appId: string): Promise<void> {
    const app = this.registry.get(appId);

    if (!app) {
      this.sendJson(res, 404, { error: `Application '${appId}' not found` });
      return;
    }

    this.sendJson(res, 200, {
      appId: app.appId,
      name: app.name,
      description: app.description,
      path: app.path,
      config: app.config,
    });
  }

  private async handleGetConfig(res: ServerResponse): Promise<void> {
    this.sendJson(res, 200, {
      config: this.config,
      registeredApps: this.registry.size,
    });
  }

  private async handleScan(res: ServerResponse): Promise<void> {
    if (!this.config) {
      this.sendJson(res, 500, { error: 'Configuration not loaded' });
      return;
    }

    const previousCount = this.registry.size;
    this.registry = await scanAllPaths(this.config.scanPaths);
    const newCount = this.registry.size;

    this.sendJson(res, 200, {
      success: true,
      previousCount,
      newCount,
      apps: this.registry.getAll().map((app) => app.appId),
    });
  }

  private async handleGetHistory(res: ServerResponse, url: URL): Promise<void> {
    const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);
    const appId = url.searchParams.get('appId');
    const tool = url.searchParams.get('tool');

    let filtered = this.callHistory;

    if (appId) {
      filtered = filtered.filter((entry) => entry.appId === appId);
    }

    if (tool) {
      filtered = filtered.filter((entry) => entry.tool === tool);
    }

    this.sendJson(res, 200, {
      history: filtered.slice(0, limit),
      total: filtered.length,
    });
  }

  private async handleTestTool(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.parseBody(req);

    if (!body.appId || !body.tool) {
      this.sendJson(res, 400, { error: 'Missing appId or tool' });
      return;
    }

    const app = this.registry.get(body.appId as string);
    if (!app) {
      this.sendJson(res, 404, { error: `Application '${body.appId}' not found` });
      return;
    }

    this.sendJson(res, 200, {
      message: 'Tool test endpoint - actual execution requires MCP connection',
      appId: body.appId,
      tool: body.tool,
      params: body.params ?? {},
    });
  }

  private async serveUI(res: ServerResponse): Promise<void> {
    const html = this.generateUIHtml();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  private generateUIHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AAI Gateway - Web UI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { background: #161b22; border-bottom: 1px solid #30363d; padding: 16px 0; margin-bottom: 24px; }
    header h1 { font-size: 24px; font-weight: 600; }
    header .subtitle { color: #8b949e; font-size: 14px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
    .card h2 { font-size: 16px; margin-bottom: 12px; color: #58a6ff; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat { text-align: center; padding: 20px; }
    .stat .value { font-size: 36px; font-weight: 700; color: #58a6ff; }
    .stat .label { color: #8b949e; font-size: 14px; }
    .app-list { list-style: none; }
    .app-item { padding: 12px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; }
    .app-item:last-child { border-bottom: none; }
    .app-item .name { font-weight: 600; }
    .app-item .id { color: #8b949e; font-size: 12px; font-family: monospace; }
    .app-item .platforms { display: flex; gap: 4px; }
    .platform-badge { background: #238636; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
    .btn { background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn:hover { background: #2ea043; }
    .btn-secondary { background: #30363d; }
    .btn-secondary:hover { background: #484f58; }
    .actions { display: flex; gap: 8px; margin-bottom: 16px; }
    #status { padding: 8px 12px; background: #1f6feb20; border: 1px solid #1f6feb; border-radius: 6px; margin-bottom: 16px; display: none; }
    .loading { opacity: 0.5; pointer-events: none; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #30363d; }
    th { color: #8b949e; font-weight: 500; font-size: 12px; text-transform: uppercase; }
    .success { color: #3fb950; }
    .error { color: #f85149; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>AAI Gateway</h1>
      <div class="subtitle">Agent App Interface - Web Management Console</div>
    </div>
  </header>
  
  <div class="container">
    <div id="status"></div>
    
    <div class="actions">
      <button class="btn" onclick="scanApps()">Scan Applications</button>
      <button class="btn btn-secondary" onclick="loadData()">Refresh</button>
    </div>
    
    <div class="stats">
      <div class="card stat">
        <div class="value" id="app-count">-</div>
        <div class="label">Registered Apps</div>
      </div>
      <div class="card stat">
        <div class="value" id="call-count">-</div>
        <div class="label">Total Calls</div>
      </div>
      <div class="card stat">
        <div class="value" id="platform">-</div>
        <div class="label">Platform</div>
      </div>
    </div>
    
    <div class="card">
      <h2>Registered Applications</h2>
      <ul class="app-list" id="app-list">
        <li class="app-item">Loading...</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>Recent Call History</h2>
      <table id="history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>App</th>
            <th>Tool</th>
            <th>Status</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody id="history-body">
          <tr><td colspan="5">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <script>
    const API_BASE = '';
    
    async function loadData() {
      try {
        const [appsRes, configRes, historyRes] = await Promise.all([
          fetch(API_BASE + '/api/apps'),
          fetch(API_BASE + '/api/config'),
          fetch(API_BASE + '/api/history?limit=20')
        ]);
        
        const apps = await appsRes.json();
        const config = await configRes.json();
        const history = await historyRes.json();
        
        document.getElementById('app-count').textContent = apps.total;
        document.getElementById('call-count').textContent = history.total;
        document.getElementById('platform').textContent = getPlatform();
        
        renderApps(apps.apps);
        renderHistory(history.history);
      } catch (error) {
        showStatus('Failed to load data: ' + error.message, true);
      }
    }
    
    function getPlatform() {
      const ua = navigator.userAgent;
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Linux')) return 'Linux';
      return 'Unknown';
    }
    
    function renderApps(apps) {
      const list = document.getElementById('app-list');
      if (apps.length === 0) {
        list.innerHTML = '<li class="app-item">No applications registered. Add aai.json files to ~/.aai/</li>';
        return;
      }
      
      list.innerHTML = apps.map(app => \`
        <li class="app-item">
          <div>
            <div class="name">\${app.name}</div>
            <div class="id">\${app.appId}</div>
          </div>
          <div class="platforms">
            \${app.platforms.map(p => \`<span class="platform-badge">\${p}</span>\`).join('')}
          </div>
        </li>
      \`).join('');
    }
    
    function renderHistory(history) {
      const tbody = document.getElementById('history-body');
      if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No call history yet</td></tr>';
        return;
      }
      
      tbody.innerHTML = history.map(entry => \`
        <tr>
          <td>\${new Date(entry.timestamp).toLocaleTimeString()}</td>
          <td>\${entry.appId}</td>
          <td>\${entry.tool}</td>
          <td class="\${entry.success ? 'success' : 'error'}">\${entry.success ? 'Success' : 'Failed'}</td>
          <td>\${entry.duration}ms</td>
        </tr>
      \`).join('');
    }
    
    async function scanApps() {
      showStatus('Scanning for applications...');
      try {
        const res = await fetch(API_BASE + '/api/scan', { method: 'POST' });
        const data = await res.json();
        showStatus(\`Scan complete: \${data.newCount} applications found\`);
        loadData();
      } catch (error) {
        showStatus('Scan failed: ' + error.message, true);
      }
    }
    
    function showStatus(message, isError = false) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.style.display = 'block';
      status.style.borderColor = isError ? '#f85149' : '#1f6feb';
      status.style.background = isError ? '#f8514920' : '#1f6feb20';
      setTimeout(() => { status.style.display = 'none'; }, 3000);
    }
    
    loadData();
  </script>
</body>
</html>`;
  }

  private sendJson(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  private async parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(body ? (JSON.parse(body) as Record<string, unknown>) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', reject);
    });
  }

  getRegistry(): AppRegistry {
    return this.registry;
  }
}

export async function startWebServer(port: number = 3000): Promise<WebServer> {
  const config = await loadConfig();
  const registry = await scanAllPaths(config.scanPaths);
  const server = new WebServer(config, registry);
  await server.start(port);
  return server;
}
