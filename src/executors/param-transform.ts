import { Platform } from '../parsers/schema.js';

export interface ParamTransformOptions {
  escapeForShell?: boolean;
  platform: Platform;
  automation: string;
}

export type ParamValue = string | number | boolean | null | undefined | ParamValue[] | { [key: string]: ParamValue };

export function escapeAppleScript(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function escapePowerShell(value: string): string {
  return value
    .replace(/`/g, '``')
    .replace(/"/g, '`"')
    .replace(/\$/g, '`$')
    .replace(/\n/g, '`n')
    .replace(/\r/g, '`r')
    .replace(/\t/g, '`t');
}

export function escapeDBus(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

export function transformValue(
  value: ParamValue,
  options: ParamTransformOptions
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    if (options.automation === 'applescript' || options.automation === 'jxa') {
      return value ? 'true' : 'false';
    }
    if (options.automation === 'com') {
      return value ? '$true' : '$false';
    }
    return String(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (options.automation === 'applescript') {
      const items = value.map(v => `"${escapeAppleScript(String(v))}"`).join(', ');
      return `{${items}}`;
    }
    if (options.automation === 'com') {
      return `@(${value.map(v => transformValue(v, options)).join(', ')})`;
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const str = String(value);
  
  switch (options.automation) {
    case 'applescript':
    case 'jxa':
      return escapeAppleScript(str);
    case 'com':
      return escapePowerShell(str);
    case 'dbus':
      return escapeDBus(str);
    default:
      return str.replace(/"/g, '\\"');
  }
}

export function replaceParamsSecure(
  template: string,
  params: Record<string, unknown>,
  options: ParamTransformOptions
): string {
  return template.replace(/\$\{(\w+)\}/g, (match, key: string) => {
    if (key in params) {
      return transformValue(params[key] as ParamValue, options);
    }
    return match;
  });
}

export function validateParamTypes(
  params: Record<string, unknown>,
  schema: {
    properties: Record<string, { type: string }>;
    required?: string[];
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const requiredKey of schema.required ?? []) {
    if (!(requiredKey in params) || params[requiredKey] === undefined) {
      errors.push(`Missing required parameter: ${requiredKey}`);
    }
  }

  for (const [key, value] of Object.entries(params)) {
    const propSchema = schema.properties[key];
    if (!propSchema) {
      continue;
    }

    const actualType = Array.isArray(value) ? 'array' : typeof value;
    const expectedType = propSchema.type;

    if (expectedType === 'integer' && typeof value === 'number') {
      if (!Number.isInteger(value)) {
        errors.push(`Parameter '${key}' must be an integer, got float`);
      }
      continue;
    }

    if (expectedType !== actualType && value !== null && value !== undefined) {
      errors.push(`Parameter '${key}' expected ${expectedType}, got ${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface TransformRule {
  platform: Platform;
  automation: string;
  transform: (script: string | object, params: Record<string, unknown>) => string;
}

export const TRANSFORM_RULES: TransformRule[] = [
  {
    platform: 'macos',
    automation: 'applescript',
    transform: (script, params) => {
      if (typeof script !== 'string') {
        throw new Error('AppleScript requires string script template');
      }
      return replaceParamsSecure(script, params, {
        platform: 'macos',
        automation: 'applescript',
      });
    },
  },
  {
    platform: 'macos',
    automation: 'jxa',
    transform: (script, params) => {
      if (typeof script !== 'string') {
        throw new Error('JXA requires string script template');
      }
      return replaceParamsSecure(script, params, {
        platform: 'macos',
        automation: 'jxa',
      });
    },
  },
  {
    platform: 'windows',
    automation: 'com',
    transform: (script, params) => {
      if (!Array.isArray(script)) {
        throw new Error('COM automation requires array of actions');
      }
      const processedActions = script.map(action => {
        const processed = { ...action };
        if (typeof processed.value === 'string' && processed.value.startsWith('${')) {
          const key = processed.value.slice(2, -1);
          if (key in params) {
            processed.value = transformValue(params[key] as ParamValue, {
              platform: 'windows',
              automation: 'com',
            });
          }
        }
        if (Array.isArray(processed.args)) {
          processed.args = processed.args.map((arg: unknown) => {
            if (typeof arg === 'string' && arg.startsWith('${')) {
              const key = arg.slice(2, -1);
              if (key in params) {
                return params[key];
              }
            }
            return arg;
          });
        }
        return processed;
      });
      return JSON.stringify(processedActions);
    },
  },
  {
    platform: 'linux',
    automation: 'dbus',
    transform: (_script, params) => {
      return Object.entries(params)
        .map(([_k, v]) => {
          if (typeof v === 'string') return `string:"${escapeDBus(v)}"`;
          if (typeof v === 'number') return Number.isInteger(v) ? `int32:${v}` : `double:${v}`;
          if (typeof v === 'boolean') return `boolean:${v}`;
          return `string:"${escapeDBus(JSON.stringify(v))}"`;
        })
        .join(' ');
    },
  },
];

export function getTransformRule(platform: Platform, automation: string): TransformRule | undefined {
  return TRANSFORM_RULES.find(
    rule => rule.platform === platform && rule.automation === automation
  );
}
