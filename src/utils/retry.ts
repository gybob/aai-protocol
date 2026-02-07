import { logger } from './logger.js';
import { AutomationError } from '../errors/errors.js';

export interface RetryOptions {
  retries: number;
  minTimeout: number;
  maxTimeout: number;
  factor: number;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
  factor: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > opts.retries || !isRetryable(error)) {
        throw error;
      }

      if (opts.onRetry && error instanceof Error) {
        opts.onRetry(error, attempt);
      }

      const timeout = Math.min(
        opts.maxTimeout,
        opts.minTimeout * Math.pow(opts.factor, attempt - 1)
      );

      logger.warn({ error, attempt, nextRetryIn: timeout }, 'Operation failed, retrying...');

      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof AutomationError) {
    if (error.code === -32004) return false;
    if (error.code === -32010) return false;
    if (error.code === -32002) return false;
    if (error.code === -32003) return false;

    if (error.code === -32008) return true;
    if (error.code === -32001) return true;
  }

  return true;
}
