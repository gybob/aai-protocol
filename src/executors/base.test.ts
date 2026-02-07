import { describe, it, expect } from 'vitest';

import { replaceParams, parseJsonOutput, getCurrentPlatform } from './base.js';

describe('replaceParams', () => {
  it('replaces single parameter', () => {
    const result = replaceParams('Hello ${name}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('replaces multiple parameters', () => {
    const result = replaceParams('${greeting} ${name}!', {
      greeting: 'Hello',
      name: 'World',
    });
    expect(result).toBe('Hello World!');
  });

  it('escapes quotes in string values', () => {
    const result = replaceParams('say "${message}"', { message: 'He said "hi"' });
    expect(result).toBe('say "He said \\"hi\\""');
  });

  it('converts numbers to strings', () => {
    const result = replaceParams('count: ${count}', { count: 42 });
    expect(result).toBe('count: 42');
  });

  it('leaves unmatched placeholders unchanged', () => {
    const result = replaceParams('${found} ${missing}', { found: 'yes' });
    expect(result).toBe('yes ${missing}');
  });

  it('handles empty params', () => {
    const result = replaceParams('no params here', {});
    expect(result).toBe('no params here');
  });
});

describe('parseJsonOutput', () => {
  it('parses valid JSON object', () => {
    const result = parseJsonOutput('{"success": true}');
    expect(result).toEqual({ success: true });
  });

  it('parses valid JSON array', () => {
    const result = parseJsonOutput('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('trims whitespace before parsing', () => {
    const result = parseJsonOutput('  {"key": "value"}  \n');
    expect(result).toEqual({ key: 'value' });
  });

  it('returns string for invalid JSON', () => {
    const result = parseJsonOutput('not json');
    expect(result).toBe('not json');
  });

  it('returns null for empty string', () => {
    const result = parseJsonOutput('');
    expect(result).toBeNull();
  });

  it('returns null for whitespace only', () => {
    const result = parseJsonOutput('   \n\t  ');
    expect(result).toBeNull();
  });
});

describe('getCurrentPlatform', () => {
  it('returns a valid platform string', () => {
    const platform = getCurrentPlatform();
    expect(['macos', 'windows', 'linux']).toContain(platform);
  });
});
