import { exec } from 'child_process';
import { promisify } from 'util';

import {
  AutomationExecutor,
  ExecutionResult,
  ExecutorOptions,
  parseJsonOutput,
} from './base.js';
import { escapeDBus } from './param-transform.js';
import { Errors } from '../errors/errors.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

const DEFAULT_TIMEOUT = 30000;

export interface DBusConfig {
  service: string;
  objectPath: string;
  interface: string;
}

export class LinuxExecutor implements AutomationExecutor {
  readonly platform = 'linux' as const;
  private dbusConfig: DBusConfig | null = null;

  setDBusConfig(config: DBusConfig): void {
    this.dbusConfig = config;
  }

  async execute(
    method: string,
    params: Record<string, unknown>,
    options?: ExecutorOptions
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = (options?.timeout ?? 30) * 1000 || DEFAULT_TIMEOUT;

    if (!this.dbusConfig) {
      throw Errors.automationFailed('DBus configuration not set');
    }

    try {
      const result = await this.callDBusMethod(method, params, timeout);
      const duration = Date.now() - startTime;

      logger.debug({ method, duration }, 'DBus method called');

      return {
        success: true,
        data: parseJsonOutput(result),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('org.freedesktop.DBus.Error.ServiceUnknown')) {
        throw Errors.appNotRunning(this.dbusConfig.service);
      }

      if (errorMessage.includes('org.freedesktop.DBus.Error.AccessDenied')) {
        throw Errors.permissionDenied('DBus access denied');
      }

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  private async callDBusMethod(
    method: string,
    params: Record<string, unknown>,
    timeout: number
  ): Promise<string> {
    if (!this.dbusConfig) {
      throw new Error('DBus config not set');
    }

    const { service, objectPath, interface: iface } = this.dbusConfig;

    const args = Object.values(params)
      .map((v) => {
        if (typeof v === 'string') return `string:"${escapeDBus(v)}"`;
        if (typeof v === 'number') return Number.isInteger(v) ? `int32:${v}` : `double:${v}`;
        if (typeof v === 'boolean') return `boolean:${v}`;
        return `string:"${escapeDBus(JSON.stringify(v))}"`;
      })
      .join(' ');

    const command = `dbus-send --session --print-reply --dest=${service} ${objectPath} ${iface}.${method} ${args}`;

    const { stdout } = await execAsync(command, { timeout });
    return this.parseDBusOutput(stdout);
  }

  private parseDBusOutput(output: string): string {
    const lines = output.split('\n').slice(1);
    const values: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('string "')) {
        const match = /string "(.*)"/s.exec(trimmed);
        if (match) values.push(match[1]);
      } else if (trimmed.startsWith('int32 ')) {
        values.push(trimmed.replace('int32 ', ''));
      } else if (trimmed.startsWith('boolean ')) {
        values.push(trimmed.replace('boolean ', ''));
      }
    }

    if (values.length === 1) return values[0];
    if (values.length === 0) return '';
    return JSON.stringify(values);
  }

  isSupported(): boolean {
    return process.platform === 'linux';
  }
}

export function createLinuxExecutor(config?: DBusConfig): LinuxExecutor {
  const executor = new LinuxExecutor();
  if (config) {
    executor.setDBusConfig(config);
  }
  return executor;
}
