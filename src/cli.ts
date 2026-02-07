#!/usr/bin/env node

import { createGateway } from './mcp/server.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AAI Gateway - Agent App Interface Protocol Gateway

Usage:
  aai-gateway [options]

Options:
  --mcp         Start in MCP mode (default)
  --web         Start Web UI server
  --port <num>  Port for Web UI (default: 3000)
  --scan        Scan for applications and exit
  --discover    Auto-discover system apps
  --generate <app>  Generate configuration for an app using AI
  --version     Show version
  --help, -h    Show this help message

Environment Variables:
  AAI_LOG_LEVEL   Log level (debug, info, warn, error)
  AAI_API_KEY     API Key for AI generation (OpenAI format)
  AAI_API_ENDPOINT Custom AI API Endpoint (optional)

Configuration:
  ~/.aai/config.json   Gateway configuration file
  ~/.aai/<appId>/      Application configuration directories

Examples:
  aai-gateway --mcp          # Start MCP server (for Agent integration)
  aai-gateway --web          # Start Web UI on port 3000
  aai-gateway --web --port 8080  # Start Web UI on port 8080
`);
    process.exit(0);
  }

  if (args.includes('--version')) {
    console.log('aai-gateway v0.1.0');
    process.exit(0);
  }

  if (args.includes('--scan')) {
    const gateway = await createGateway();
    await gateway.initialize();
    const apps = gateway.getRegistry().getAll();

    console.log('\nDiscovered Applications:');
    console.log('========================\n');

    if (apps.length === 0) {
      console.log('No applications found.');
      console.log('Add aai.json files to ~/.aai/<appId>/ directories.');
    } else {
      for (const app of apps) {
        console.log(`  ${app.appId}`);
        console.log(`    Name: ${app.name}`);
        console.log(`    Path: ${app.path}`);
        if (app.description) {
          console.log(`    Description: ${app.description}`);
        }
        console.log('');
      }
      console.log(`Total: ${apps.length} application(s)`);
    }

    process.exit(0);
  }

  if (args.includes('--discover')) {
    console.log('Starting auto-discovery...');

    if (process.platform === 'darwin') {
      try {
        const { scanMacApps } = await import('./config/auto-discovery/macos.js');
        const apps = await scanMacApps();

        console.log(`\nDiscovered ${apps.length} automatable apps on macOS:`);
        console.log('========================================\n');

        apps.forEach((app) => {
          console.log(`  ${app.appId}`);
          console.log(`    Name: ${app.name}`);
          console.log(`    Path: ${app.path}`);
          console.log('');
        });
      } catch (error) {
        console.error('Auto-discovery failed:', error);
      }
    } else {
      console.log('Auto-discovery is currently only supported on macOS.');
    }
    process.exit(0);
  }

  const generateIndex = args.indexOf('--generate');
  if (generateIndex !== -1) {
    const appPathOrName = args[generateIndex + 1];
    if (!appPathOrName) {
      console.error('Error: Please specify an application path or name.');
      process.exit(1);
    }

    const apiKey = process.env.AAI_API_KEY;
    if (!apiKey) {
      console.error('Error: AAI_API_KEY environment variable is required.');
      process.exit(1);
    }

    const apiEndpoint = process.env.AAI_API_ENDPOINT;

    if (process.platform !== 'darwin') {
      console.error('AI generation currently only supports macOS.');
      process.exit(1);
    }

    try {
      const { generateConfigWithAI } = await import('./config/ai-generator.js');

      let appPath = appPathOrName;
      if (!appPath.startsWith('/') && !appPath.endsWith('.app')) {
        appPath = `/Applications/${appPath}.app`;
      }

      console.log(`Generating configuration for ${appPath}...`);
      const config = await generateConfigWithAI(appPath, apiKey, apiEndpoint);

      if (config) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.error('Failed to generate configuration.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    process.exit(0);
  }

  const startWeb = args.includes('--web');
  const startMcp =
    args.includes('--mcp') ||
    (!startWeb &&
      !args.includes('--scan') &&
      !args.includes('--discover') &&
      !args.includes('--generate'));

  try {
    const gateway = await createGateway();
    await gateway.initialize();

    if (startWeb) {
      const portIndex = args.indexOf('--port');
      const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : undefined;
      gateway.enableWebUI(port);
    }

    await gateway.start(startMcp);
  } catch (error) {
    logger.fatal({ error }, 'Failed to start AAI Gateway');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
