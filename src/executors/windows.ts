import { exec } from 'child_process';
import { promisify } from 'util';

import {
  AutomationExecutor,
  ExecutionResult,
  ExecutorOptions,
  parseJsonOutput,
} from './base.js';
import { replaceParamsSecure, transformValue } from './param-transform.js';
import { Errors } from '../errors/errors.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

const DEFAULT_TIMEOUT = 30000;

interface COMScriptAction {
  action: 'create' | 'call' | 'set' | 'get' | 'return';
  var?: string;
  object?: string;
  progid?: string;
  method?: string;
  property?: string;
  value?: string | number | boolean;
  args?: unknown[];
}

export class WindowsExecutor implements AutomationExecutor {
  readonly platform = 'windows' as const;

  async execute(
    script: COMScriptAction[] | string,
    params: Record<string, unknown>,
    options?: ExecutorOptions
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = (options?.timeout ?? 30) * 1000 || DEFAULT_TIMEOUT;

    if (typeof script === 'string') {
      return this.executePowerShell(script, params, timeout, startTime);
    }

    return this.executeCOMScript(script, params, timeout, startTime);
  }

  private async executePowerShell(
    script: string,
    params: Record<string, unknown>,
    timeout: number,
    startTime: number
  ): Promise<ExecutionResult> {
    const processedScript = replaceParamsSecure(script, params, {
      platform: 'windows',
      automation: 'com',
    });

    try {
      const { stdout } = await execAsync(`powershell -Command "${processedScript}"`, { timeout });
      const duration = Date.now() - startTime;

      return {
        success: true,
        data: parseJsonOutput(stdout),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  private async executeCOMScript(
    actions: COMScriptAction[],
    params: Record<string, unknown>,
    timeout: number,
    startTime: number
  ): Promise<ExecutionResult> {
    const psScript = this.generatePowerShellFromActions(actions, params);

    try {
      const escapedScript = psScript.replace(/"/g, '\\"');
      const { stdout } = await execAsync(`powershell -Command "${escapedScript}"`, { timeout });
      const duration = Date.now() - startTime;

      logger.debug({ duration }, 'COM script executed');

      return {
        success: true,
        data: parseJsonOutput(stdout),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('HRESULT')) {
        throw Errors.automationFailed(`COM error: ${errorMessage}`);
      }

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  private generatePowerShellFromActions(
    actions: COMScriptAction[],
    params: Record<string, unknown>
  ): string {
    const lines: string[] = [];

    for (const action of actions) {
      switch (action.action) {
        case 'create':
          if (action.var && action.progid) {
            lines.push(`$${action.var} = New-Object -ComObject ${action.progid}`);
          }
          break;

        case 'call':
          if (action.object && action.method) {
            const args = action.args
              ? action.args
                  .map((arg) => {
                    if (typeof arg === 'string' && arg.startsWith('${')) {
                      const key = arg.slice(2, -1);
                      const value = params[key];
                      return typeof value === 'string' 
                        ? `"${transformValue(value, { platform: 'windows', automation: 'com' })}"` 
                        : String(value);
                    }
                    return typeof arg === 'string' ? `"${arg}"` : String(arg);
                  })
                  .join(', ')
              : '';

            if (action.var) {
              lines.push(`$${action.var} = $${action.object}.${action.method}(${args})`);
            } else {
              lines.push(`$${action.object}.${action.method}(${args})`);
            }
          }
          break;

        case 'set':
          if (action.object && action.property) {
            let value = action.value;
            if (typeof value === 'string' && value.startsWith('${')) {
              const key = value.slice(2, -1);
              value = params[key] as string;
            }
            const psValue = typeof value === 'string' 
              ? `"${transformValue(value, { platform: 'windows', automation: 'com' })}"` 
              : String(value);
            lines.push(`$${action.object}.${action.property} = ${psValue}`);
          }
          break;

        case 'get':
          if (action.var && action.object && action.property) {
            lines.push(`$${action.var} = $${action.object}.${action.property}`);
          }
          break;

        case 'return':
          if (action.value !== undefined) {
            let value = action.value;
            if (typeof value === 'string') {
              value = replaceParamsSecure(value, params, { platform: 'windows', automation: 'com' });
            }
            lines.push(`Write-Output '${value}'`);
          }
          break;
      }
    }

    return lines.join('; ');
  }

  isSupported(): boolean {
    return process.platform === 'win32';
  }
}

export function createWindowsExecutor(): WindowsExecutor {
  return new WindowsExecutor();
}
