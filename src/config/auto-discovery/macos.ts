import { readdir, stat } from 'fs/promises';
import { join, parse } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { homedir } from 'os';
import { logger } from '../../utils/logger.js';
import { AaiJson } from '../../parsers/schema.js';
import { DiscoveredApp } from '../discovery.js';

const execAsync = promisify(exec);

const APP_DIRS = [
  '/Applications',
  '/System/Applications',
  '/System/Applications/Utilities',
  join(homedir(), 'Applications'),
];

async function getBundleId(plistPath: string): Promise<string | null> {
  try {
    const pathWithoutExt = plistPath.replace(/\.plist$/, '');
    const { stdout } = await execAsync(`defaults read "${pathWithoutExt}" CFBundleIdentifier`);
    return stdout.trim();
  } catch (error) {
    return null;
  }
}

async function isAppleScriptEnabled(plistPath: string): Promise<boolean> {
  try {
    const pathWithoutExt = plistPath.replace(/\.plist$/, '');
    try {
      const { stdout } = await execAsync(`defaults read "${pathWithoutExt}" NSAppleScriptEnabled`);
      if (stdout.trim() === '1') return true;
    } catch {
      return false;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function hasSdefFile(resourcesPath: string): Promise<boolean> {
  try {
    const files = await readdir(resourcesPath);
    return files.some((file) => file.endsWith('.sdef'));
  } catch {
    return false;
  }
}

async function generateAppConfig(appName: string, bundleId: string): Promise<AaiJson> {
  return {
    schema_version: '1.0',
    appId: bundleId,
    name: appName,
    description: `Auto-discovered configuration for ${appName}`,
    version: '0.0.1',
    platforms: {
      macos: {
        automation: 'applescript',
        tools: [
          {
            name: 'activate',
            description: `Activate ${appName}`,
            parameters: {
              type: 'object',
              properties: {},
            },
            script: `tell application "${appName}" to activate\nreturn "{\\"success\\": true}"`,
            output_parser: 'result as text',
          },
          {
            name: 'get_properties',
            description: 'Get application properties',
            parameters: {
              type: 'object',
              properties: {},
            },
            script: `tell application "${appName}"\n  set props to properties\n  return "{\\"properties\\": \\"TODO: Serialize properties\\"}"\nend tell`,
            output_parser: 'result as text',
          },
        ],
      },
    },
  };
}

export async function scanMacApps(): Promise<DiscoveredApp[]> {
  const discoveredApps: DiscoveredApp[] = [];
  const processedPaths = new Set<string>();

  for (const dir of APP_DIRS) {
    try {
      const dirEntries = await readdir(dir).catch(() => []);

      for (const entry of dirEntries) {
        if (!entry.endsWith('.app')) continue;

        const appPath = join(dir, entry);
        if (processedPaths.has(appPath)) continue;
        processedPaths.add(appPath);

        try {
          const stats = await stat(appPath);
          if (!stats.isDirectory()) continue;

          const contentsPath = join(appPath, 'Contents');
          const plistPath = join(contentsPath, 'Info.plist');

          const bundleId = await getBundleId(plistPath);
          if (!bundleId) continue;

          const resourcesPath = join(contentsPath, 'Resources');
          const sdefExists = await hasSdefFile(resourcesPath);
          const scriptEnabled = await isAppleScriptEnabled(plistPath);

          if (sdefExists || scriptEnabled) {
            const appName = parse(entry).name;
            const config = await generateAppConfig(appName, bundleId);

            discoveredApps.push({
              appId: bundleId,
              name: appName,
              path: appPath,
              config,
            });

            logger.info({ appId: bundleId, path: appPath }, 'Auto-discovered macOS app');
          }
        } catch (error) {
          logger.debug({ path: appPath, error }, 'Failed to scan app');
        }
      }
    } catch (error) {
      logger.debug({ dir, error }, 'Failed to scan directory');
    }
  }

  return discoveredApps;
}
