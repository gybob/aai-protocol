import { describe, it, expect } from 'vitest';

import {
  AutomationError,
  ErrorCode,
  ErrorType,
  ErrorMessage,
  Errors,
} from './errors.js';

describe('AutomationError', () => {
  describe('constructor', () => {
    it('creates error with correct code and message', () => {
      const error = new AutomationError(ErrorCode.APP_NOT_FOUND, 'test detail');

      expect(error.code).toBe(ErrorCode.APP_NOT_FOUND);
      expect(error.message).toBe('Application not found');
      expect(error.type).toBe('APP_NOT_FOUND');
      expect(error.detail).toBe('test detail');
      expect(error.name).toBe('AutomationError');
    });

    it('creates error without detail', () => {
      const error = new AutomationError(ErrorCode.TIMEOUT);

      expect(error.code).toBe(ErrorCode.TIMEOUT);
      expect(error.detail).toBeUndefined();
    });
  });

  describe('toJSON', () => {
    it('returns JSON-RPC 2.0 error format', () => {
      const error = new AutomationError(ErrorCode.PERMISSION_DENIED, 'TCC denied');
      const json = error.toJSON();

      expect(json).toEqual({
        code: -32004,
        message: 'Permission denied',
        data: {
          type: 'PERMISSION_DENIED',
          detail: 'TCC denied',
        },
      });
    });
  });

  describe('isAutomationError', () => {
    it('returns true for AutomationError', () => {
      const error = new AutomationError(ErrorCode.TIMEOUT);
      expect(AutomationError.isAutomationError(error)).toBe(true);
    });

    it('returns false for regular Error', () => {
      const error = new Error('test');
      expect(AutomationError.isAutomationError(error)).toBe(false);
    });

    it('returns false for non-error', () => {
      expect(AutomationError.isAutomationError('string')).toBe(false);
      expect(AutomationError.isAutomationError(null)).toBe(false);
    });
  });
});

describe('Errors helper', () => {
  it('creates appNotFound error', () => {
    const error = Errors.appNotFound('com.example.app');

    expect(error.code).toBe(ErrorCode.APP_NOT_FOUND);
    expect(error.detail).toContain('com.example.app');
  });

  it('creates toolNotFound error', () => {
    const error = Errors.toolNotFound('com.example.app', 'send_email');

    expect(error.code).toBe(ErrorCode.TOOL_NOT_FOUND);
    expect(error.detail).toContain('send_email');
    expect(error.detail).toContain('com.example.app');
  });

  it('creates timeout error', () => {
    const error = Errors.timeout(30);

    expect(error.code).toBe(ErrorCode.TIMEOUT);
    expect(error.detail).toContain('30');
  });

  it('creates invalidParams error', () => {
    const error = Errors.invalidParams('missing required field');

    expect(error.code).toBe(ErrorCode.INVALID_PARAMS);
    expect(error.detail).toBe('missing required field');
  });
});

describe('ErrorCode enum', () => {
  it('has correct values', () => {
    expect(ErrorCode.AUTOMATION_FAILED).toBe(-32001);
    expect(ErrorCode.APP_NOT_FOUND).toBe(-32002);
    expect(ErrorCode.TOOL_NOT_FOUND).toBe(-32003);
    expect(ErrorCode.PERMISSION_DENIED).toBe(-32004);
    expect(ErrorCode.INVALID_PARAMS).toBe(-32005);
    expect(ErrorCode.AUTOMATION_NOT_SUPPORTED).toBe(-32006);
    expect(ErrorCode.AAI_JSON_INVALID).toBe(-32007);
    expect(ErrorCode.TIMEOUT).toBe(-32008);
    expect(ErrorCode.APP_NOT_RUNNING).toBe(-32009);
    expect(ErrorCode.SCRIPT_PARSE_ERROR).toBe(-32010);
  });
});

describe('ErrorType mapping', () => {
  it('maps all error codes to types', () => {
    for (const code of Object.values(ErrorCode)) {
      if (typeof code === 'number') {
        expect(ErrorType[code]).toBeDefined();
        expect(typeof ErrorType[code]).toBe('string');
      }
    }
  });
});

describe('ErrorMessage mapping', () => {
  it('maps all error codes to messages', () => {
    for (const code of Object.values(ErrorCode)) {
      if (typeof code === 'number') {
        expect(ErrorMessage[code]).toBeDefined();
        expect(typeof ErrorMessage[code]).toBe('string');
      }
    }
  });
});
