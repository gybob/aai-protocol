import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  appId?: string;
  tool?: string;
  platform?: string;
  duration?: number;
  [key: string]: unknown;
}

const logLevel = (process.env.AAI_LOG_LEVEL as LogLevel) || 'info';

export const logger = pino({
  level: logLevel,
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    service: 'aai-gateway',
  },
});

export function createChildLogger(context: LogContext): pino.Logger {
  return logger.child(context);
}

export function logToolCall(
  appId: string,
  tool: string,
  platform: string,
  duration: number,
  success: boolean,
  error?: string
): void {
  const logFn = success ? logger.info.bind(logger) : logger.error.bind(logger);
  logFn(
    {
      appId,
      tool,
      platform,
      duration,
      success,
      error,
    },
    success ? 'Tool executed successfully' : 'Tool execution failed'
  );
}

export function logAppDiscovery(appId: string, path: string): void {
  logger.info({ appId, path }, 'Application discovered');
}

export function logConfigLoad(path: string, success: boolean, error?: string): void {
  if (success) {
    logger.info({ path }, 'Configuration loaded');
  } else {
    logger.error({ path, error }, 'Failed to load configuration');
  }
}
