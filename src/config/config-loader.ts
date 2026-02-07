import { z } from 'zod';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import { logger } from '../utils/logger.js';

export const GatewayConfigSchema = z.object({
  scanPaths: z.array(z.string()).default(['~/.aai']),
  defaultTimeout: z.number().min(1).max(300).default(30),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  aiApiEndpoint: z.string().optional(),
  httpPort: z.number().min(1).max(65535).optional(),
  enableWebUI: z.boolean().default(false),
  scanIntervalMinutes: z.number().min(1).default(60),
  rateLimit: z
    .object({
      maxTokens: z.number().default(10),
      refillRate: z.number().default(2),
    })
    .default({}),
});

export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;

const DEFAULT_CONFIG: GatewayConfig = {
  scanPaths: ['~/.aai'],
  defaultTimeout: 30,
  logLevel: 'info',
  enableWebUI: false,
  scanIntervalMinutes: 60,
  rateLimit: {
    maxTokens: 10,
    refillRate: 2,
  },
};

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return path;
}

export function getConfigPath(): string {
  return expandPath('~/.aai/config.json');
}

export async function loadConfig(): Promise<GatewayConfig> {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    logger.debug({ configPath }, 'Config file not found, using defaults');
    return {
      ...DEFAULT_CONFIG,
      scanPaths: DEFAULT_CONFIG.scanPaths.map(expandPath),
    };
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const rawConfig = JSON.parse(content) as unknown;
    const config = GatewayConfigSchema.parse(rawConfig);

    config.scanPaths = config.scanPaths.map(expandPath);

    logger.info({ configPath }, 'Configuration loaded');
    return config;
  } catch (error) {
    logger.error({ configPath, error }, 'Failed to load configuration, using defaults');
    return DEFAULT_CONFIG;
  }
}

export function getDefaultConfig(): GatewayConfig {
  return { ...DEFAULT_CONFIG };
}

export function validateConfig(config: unknown): GatewayConfig {
  return GatewayConfigSchema.parse(config);
}
