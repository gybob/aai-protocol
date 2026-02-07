import { Platform } from '../parsers/schema.js';

export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
}

export interface ExecutorOptions {
  timeout?: number;
  workingDirectory?: string;
}

export interface AutomationExecutor {
  readonly platform: Platform;
  execute(
    script: string | object,
    params: Record<string, unknown>,
    options?: ExecutorOptions
  ): Promise<ExecutionResult>;
  isSupported(): boolean;
}

export function replaceParams(template: string, params: Record<string, unknown>): string {
  return template.replace(/\$\{(\w+)\}/g, (match, key: string) => {
    if (key in params) {
      const value = params[key];
      if (typeof value === 'string') {
        return value.replace(/"/g, '\\"');
      }
      return String(value);
    }
    return match;
  });
}

export function parseJsonOutput(output: string): unknown {
  const trimmed = output.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

export function getCurrentPlatform(): Platform {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      return 'linux';
  }
}
