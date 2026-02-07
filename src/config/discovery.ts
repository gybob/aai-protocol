import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

import { logger } from '../utils/logger.js';
import { AaiJson, validateAaiJson, isValidAaiJson } from '../parsers/schema.js';
import { Errors } from '../errors/errors.js';

export interface DiscoveredApp {
  appId: string;
  name: string;
  description?: string;
  path: string;
  config: AaiJson;
}

export class AppRegistry {
  private apps: Map<string, DiscoveredApp> = new Map();

  register(app: DiscoveredApp): void {
    this.apps.set(app.appId, app);
    logger.debug({ appId: app.appId, path: app.path }, 'App registered');
  }

  unregister(appId: string): boolean {
    return this.apps.delete(appId);
  }

  get(appId: string): DiscoveredApp | undefined {
    return this.apps.get(appId);
  }

  getAll(): DiscoveredApp[] {
    return Array.from(this.apps.values());
  }

  has(appId: string): boolean {
    return this.apps.has(appId);
  }

  clear(): void {
    this.apps.clear();
  }

  get size(): number {
    return this.apps.size;
  }
}

export async function scanDirectory(dirPath: string): Promise<DiscoveredApp[]> {
  const apps: DiscoveredApp[] = [];

  if (!existsSync(dirPath)) {
    logger.warn({ path: dirPath }, 'Scan directory does not exist');
    return apps;
  }

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const appPath = join(dirPath, entry);
      const aaiJsonPath = join(appPath, 'aai.json');

      try {
        const stats = await stat(appPath);
        if (!stats.isDirectory()) continue;

        if (!existsSync(aaiJsonPath)) continue;

        const content = await readFile(aaiJsonPath, 'utf-8');
        const rawConfig = JSON.parse(content) as unknown;

        if (!isValidAaiJson(rawConfig)) {
          logger.warn({ path: aaiJsonPath }, 'Invalid aai.json, skipping');
          continue;
        }

        const config = validateAaiJson(rawConfig);

        apps.push({
          appId: config.appId,
          name: config.name,
          description: config.description,
          path: appPath,
          config,
        });

        logger.info({ appId: config.appId, path: appPath }, 'Application discovered');
      } catch (error) {
        logger.warn({ path: appPath, error }, 'Failed to load app configuration');
      }
    }
  } catch (error) {
    logger.error({ path: dirPath, error }, 'Failed to scan directory');
  }

  return apps;
}

export async function loadAppConfig(appId: string, basePath: string): Promise<AaiJson> {
  const aaiJsonPath = join(basePath, appId, 'aai.json');

  if (!existsSync(aaiJsonPath)) {
    throw Errors.appNotFound(appId);
  }

  try {
    const content = await readFile(aaiJsonPath, 'utf-8');
    const rawConfig = JSON.parse(content) as unknown;
    return validateAaiJson(rawConfig);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw Errors.invalidAaiJson(appId, error.message);
    }
    throw error;
  }
}

export async function scanAllPaths(paths: string[]): Promise<AppRegistry> {
  const registry = new AppRegistry();

  for (const path of paths) {
    const apps = await scanDirectory(path);
    for (const app of apps) {
      registry.register(app);
    }
  }

  logger.info({ count: registry.size }, 'Scan complete');
  return registry;
}
