import { describe, it, expect } from 'vitest';

import {
  escapeAppleScript,
  escapePowerShell,
  escapeDBus,
  transformValue,
  replaceParamsSecure,
  validateParamTypes,
  getTransformRule,
} from './param-transform.js';

describe('escapeAppleScript', () => {
  it('escapes double quotes', () => {
    expect(escapeAppleScript('say "hello"')).toBe('say \\"hello\\"');
  });

  it('escapes backslashes', () => {
    expect(escapeAppleScript('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('escapes newlines', () => {
    expect(escapeAppleScript('line1\nline2')).toBe('line1\\nline2');
  });

  it('escapes tabs', () => {
    expect(escapeAppleScript('col1\tcol2')).toBe('col1\\tcol2');
  });

  it('handles complex strings', () => {
    const input = 'Hello "World"\nNew line\tTab\\Backslash';
    const expected = 'Hello \\"World\\"\\nNew line\\tTab\\\\Backslash';
    expect(escapeAppleScript(input)).toBe(expected);
  });
});

describe('escapePowerShell', () => {
  it('escapes backticks', () => {
    expect(escapePowerShell('`test`')).toBe('``test``');
  });

  it('escapes double quotes', () => {
    expect(escapePowerShell('say "hello"')).toBe('say `"hello`"');
  });

  it('escapes dollar signs', () => {
    expect(escapePowerShell('$variable')).toBe('`$variable');
  });

  it('escapes newlines', () => {
    expect(escapePowerShell('line1\nline2')).toBe('line1`nline2');
  });
});

describe('escapeDBus', () => {
  it('escapes backslashes', () => {
    expect(escapeDBus('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('escapes double quotes', () => {
    expect(escapeDBus('say "hello"')).toBe('say \\"hello\\"');
  });
});

describe('transformValue', () => {
  const appleScriptOptions = { platform: 'macos' as const, automation: 'applescript' };
  const comOptions = { platform: 'windows' as const, automation: 'com' };

  it('handles null and undefined', () => {
    expect(transformValue(null, appleScriptOptions)).toBe('');
    expect(transformValue(undefined, appleScriptOptions)).toBe('');
  });

  it('handles booleans for AppleScript', () => {
    expect(transformValue(true, appleScriptOptions)).toBe('true');
    expect(transformValue(false, appleScriptOptions)).toBe('false');
  });

  it('handles booleans for PowerShell', () => {
    expect(transformValue(true, comOptions)).toBe('$true');
    expect(transformValue(false, comOptions)).toBe('$false');
  });

  it('handles numbers', () => {
    expect(transformValue(42, appleScriptOptions)).toBe('42');
    expect(transformValue(3.14, appleScriptOptions)).toBe('3.14');
  });

  it('handles arrays for AppleScript', () => {
    expect(transformValue(['a', 'b'], appleScriptOptions)).toBe('{"a", "b"}');
  });

  it('handles arrays for PowerShell', () => {
    expect(transformValue([1, 2], comOptions)).toBe('@(1, 2)');
  });

  it('handles strings with escaping', () => {
    expect(transformValue('Hello "World"', appleScriptOptions)).toBe('Hello \\"World\\"');
  });
});

describe('replaceParamsSecure', () => {
  it('replaces single parameter', () => {
    const result = replaceParamsSecure(
      'Hello ${name}!',
      { name: 'World' },
      { platform: 'macos', automation: 'applescript' }
    );
    expect(result).toBe('Hello World!');
  });

  it('escapes special characters', () => {
    const result = replaceParamsSecure(
      'say "${message}"',
      { message: 'He said "hi"' },
      { platform: 'macos', automation: 'applescript' }
    );
    expect(result).toBe('say "He said \\"hi\\""');
  });

  it('handles multiple parameters', () => {
    const result = replaceParamsSecure(
      '${greeting} ${name}!',
      { greeting: 'Hello', name: 'World' },
      { platform: 'macos', automation: 'applescript' }
    );
    expect(result).toBe('Hello World!');
  });

  it('leaves unknown parameters unchanged', () => {
    const result = replaceParamsSecure(
      '${known} ${unknown}',
      { known: 'yes' },
      { platform: 'macos', automation: 'applescript' }
    );
    expect(result).toBe('yes ${unknown}');
  });
});

describe('validateParamTypes', () => {
  const schema = {
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' },
    },
    required: ['name'],
  };

  it('validates correct params', () => {
    const result = validateParamTypes(
      { name: 'John', age: 30, active: true },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing required params', () => {
    const result = validateParamTypes({ age: 30 }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required parameter: name');
  });

  it('detects type mismatches', () => {
    const result = validateParamTypes({ name: 123 }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("expected string, got number");
  });
});

describe('getTransformRule', () => {
  it('finds AppleScript rule', () => {
    const rule = getTransformRule('macos', 'applescript');
    expect(rule).toBeDefined();
    expect(rule?.platform).toBe('macos');
  });

  it('finds COM rule', () => {
    const rule = getTransformRule('windows', 'com');
    expect(rule).toBeDefined();
    expect(rule?.platform).toBe('windows');
  });

  it('finds DBus rule', () => {
    const rule = getTransformRule('linux', 'dbus');
    expect(rule).toBeDefined();
    expect(rule?.platform).toBe('linux');
  });

  it('returns undefined for unknown automation', () => {
    const rule = getTransformRule('macos', 'unknown');
    expect(rule).toBeUndefined();
  });
});

describe('TRANSFORM_RULES integration', () => {
  it('AppleScript transform escapes properly', () => {
    const rule = getTransformRule('macos', 'applescript');
    const result = rule?.transform(
      'tell app to say "${message}"',
      { message: 'Hello "World"\nNew line' }
    );
    expect(result).toBe('tell app to say "Hello \\"World\\"\\nNew line"');
  });

  it('COM transform handles structured actions', () => {
    const rule = getTransformRule('windows', 'com');
    const actions = [
      { action: 'set', object: 'mail', property: 'To', value: '${to}' },
    ];
    const result = rule?.transform(actions, { to: 'test@example.com' });
    const parsed = JSON.parse(result!);
    expect(parsed[0].value).toBe('test@example.com');
  });

  it('DBus transform creates proper argument string', () => {
    const rule = getTransformRule('linux', 'dbus');
    const result = rule?.transform('', { name: 'test', count: 42, active: true });
    expect(result).toContain('string:"test"');
    expect(result).toContain('int32:42');
    expect(result).toContain('boolean:true');
  });
});
