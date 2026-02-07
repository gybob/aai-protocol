import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../../src/utils/retry.js';
import { Errors } from '../../../src/errors/errors.js';

describe('withRetry', () => {
  it('should return result if function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error', async () => {
    const fn = vi.fn().mockRejectedValueOnce(Errors.timeout()).mockResolvedValue('success');

    const result = await withRetry(fn, { minTimeout: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(Errors.timeout());

    await expect(withRetry(fn, { retries: 2, minTimeout: 1 })).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable error', async () => {
    const fn = vi.fn().mockRejectedValue(Errors.permissionDenied());

    await expect(withRetry(fn, { retries: 3 })).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
