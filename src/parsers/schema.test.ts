import { describe, it, expect } from 'vitest';

import {
  AaiJsonSchema,
  validateAaiJson,
  isValidAaiJson,
} from './schema.js';

describe('AaiJsonSchema', () => {
  const validConfig = {
    schema_version: '1.0',
    appId: 'com.example.app',
    name: 'Example App',
    description: 'An example application',
    version: '1.0.0',
    platforms: {
      macos: {
        automation: 'applescript',
        tools: [
          {
            name: 'test_tool',
            description: 'A test tool',
            parameters: {
              type: 'object',
              properties: {
                param1: { type: 'string', description: 'First parameter' },
              },
              required: ['param1'],
            },
            script: 'tell application "Finder" to return "test"',
          },
        ],
      },
    },
  };

  describe('validateAaiJson', () => {
    it('validates correct config', () => {
      const result = validateAaiJson(validConfig);
      expect(result.appId).toBe('com.example.app');
      expect(result.name).toBe('Example App');
    });

    it('rejects invalid appId format', () => {
      const invalid = { ...validConfig, appId: 'invalid' };
      expect(() => validateAaiJson(invalid)).toThrow();
    });

    it('rejects invalid schema_version format', () => {
      const invalid = { ...validConfig, schema_version: 'v1' };
      expect(() => validateAaiJson(invalid)).toThrow();
    });

    it('rejects empty platforms', () => {
      const invalid = { ...validConfig, platforms: {} };
      expect(() => validateAaiJson(invalid)).toThrow();
    });

    it('validates Windows COM config', () => {
      const windowsConfig = {
        ...validConfig,
        platforms: {
          windows: {
            automation: 'com',
            progid: 'Outlook.Application',
            tools: [
              {
                name: 'send_email',
                description: 'Send email',
                parameters: {
                  type: 'object',
                  properties: {
                    to: { type: 'string' },
                  },
                },
                script: [
                  { action: 'create', var: 'app', progid: 'Outlook.Application' },
                  { action: 'call', var: 'mail', object: 'app', method: 'CreateItem', args: [0] },
                  { action: 'return', value: '{"success":true}' },
                ],
              },
            ],
          },
        },
      };

      const result = validateAaiJson(windowsConfig);
      expect(result.platforms.windows).toBeDefined();
    });

    it('validates Linux DBus config', () => {
      const linuxConfig = {
        ...validConfig,
        platforms: {
          linux: {
            automation: 'dbus',
            service: 'org.example.App',
            object: '/org/example/App',
            interface: 'org.example.App',
            tools: [
              {
                name: 'do_something',
                description: 'Does something',
                parameters: {
                  type: 'object',
                  properties: {},
                },
                method: 'DoSomething',
              },
            ],
          },
        },
      };

      const result = validateAaiJson(linuxConfig);
      expect(result.platforms.linux).toBeDefined();
    });
  });

  describe('isValidAaiJson', () => {
    it('returns true for valid config', () => {
      expect(isValidAaiJson(validConfig)).toBe(true);
    });

    it('returns false for invalid config', () => {
      expect(isValidAaiJson({ invalid: true })).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isValidAaiJson('string')).toBe(false);
      expect(isValidAaiJson(null)).toBe(false);
      expect(isValidAaiJson(123)).toBe(false);
    });
  });
});
