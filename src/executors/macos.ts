import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

import {
  AutomationExecutor,
  ExecutionResult,
  ExecutorOptions,
  parseJsonOutput,
} from './base.js';
import { replaceParamsSecure } from './param-transform.js';
import { Errors } from '../errors/errors.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

const DEFAULT_TIMEOUT = 30000;

export class MacOSExecutor implements AutomationExecutor {
  readonly platform = 'macos' as const;

  async execute(
    script: string,
    params: Record<string, unknown>,
    options?: ExecutorOptions
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = (options?.timeout ?? 30) * 1000 || DEFAULT_TIMEOUT;

    const processedScript = replaceParamsSecure(script, params, {
      platform: 'macos',
      automation: 'applescript',
    });

    try {
      const result = await this.executeScript(processedScript, timeout);
      const duration = Date.now() - startTime;

      logger.debug({ duration, outputLength: result.length }, 'Script executed');

      return {
        success: true,
        data: parseJsonOutput(result),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('execution error') && errorMessage.includes('-1743')) {
        throw Errors.permissionDenied('TCC authorization required. Please allow access in System Settings > Privacy & Security');
      }

      if (errorMessage.includes('timed out')) {
        throw Errors.timeout(timeout / 1000);
      }

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  private async executeScript(script: string, timeout: number): Promise<string> {
    const isMultiLine = script.includes('\n');

    if (isMultiLine) {
      return this.executeMultiLineScript(script, timeout);
    }

    return this.executeSingleLineScript(script, timeout);
  }

  private async executeSingleLineScript(script: string, timeout: number): Promise<string> {
    const escapedScript = script.replace(/'/g, "'\\''");
    const command = `osascript -e '${escapedScript}'`;

    const { stdout } = await execAsync(command, { timeout });
    return stdout;
  }

  private async executeMultiLineScript(script: string, timeout: number): Promise<string> {
    const tempFile = join(tmpdir(), `aai-${randomUUID()}.scpt`);

    try {
      await writeFile(tempFile, script, 'utf-8');
      const { stdout } = await execAsync(`osascript "${tempFile}"`, { timeout });
      return stdout;
    } finally {
      try {
        await unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  isSupported(): boolean {
    return process.platform === 'darwin';
  }
}

export function createMacOSExecutor(): MacOSExecutor {
  return new MacOSExecutor();
}
