/**
 * AAI Gateway - Error Types
 *
 * Standardized error codes and types for the AAI protocol.
 * Based on JSON-RPC 2.0 error code conventions.
 */

/**
 * AAI Protocol Error Codes
 * Range: -32001 to -32010
 */
export enum ErrorCode {
  /** Automation script execution failed */
  AUTOMATION_FAILED = -32001,
  /** Target application not installed or cannot be found */
  APP_NOT_FOUND = -32002,
  /** Requested tool does not exist in aai.json */
  TOOL_NOT_FOUND = -32003,
  /** Insufficient permissions, requires user authorization */
  PERMISSION_DENIED = -32004,
  /** Parameter validation failed */
  INVALID_PARAMS = -32005,
  /** Platform does not support specified automation type */
  AUTOMATION_NOT_SUPPORTED = -32006,
  /** aai.json format error or does not match schema */
  AAI_JSON_INVALID = -32007,
  /** Operation timed out */
  TIMEOUT = -32008,
  /** Application not running and cannot be started */
  APP_NOT_RUNNING = -32009,
  /** Script parsing error */
  SCRIPT_PARSE_ERROR = -32010,
}

/**
 * Error type strings for structured error responses
 */
export const ErrorType: Record<ErrorCode, string> = {
  [ErrorCode.AUTOMATION_FAILED]: 'AUTOMATION_FAILED',
  [ErrorCode.APP_NOT_FOUND]: 'APP_NOT_FOUND',
  [ErrorCode.TOOL_NOT_FOUND]: 'TOOL_NOT_FOUND',
  [ErrorCode.PERMISSION_DENIED]: 'PERMISSION_DENIED',
  [ErrorCode.INVALID_PARAMS]: 'INVALID_PARAMS',
  [ErrorCode.AUTOMATION_NOT_SUPPORTED]: 'AUTOMATION_NOT_SUPPORTED',
  [ErrorCode.AAI_JSON_INVALID]: 'AAI_JSON_INVALID',
  [ErrorCode.TIMEOUT]: 'TIMEOUT',
  [ErrorCode.APP_NOT_RUNNING]: 'APP_NOT_RUNNING',
  [ErrorCode.SCRIPT_PARSE_ERROR]: 'SCRIPT_PARSE_ERROR',
};

/**
 * Default error messages for each error code
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTOMATION_FAILED]: 'Automation failed',
  [ErrorCode.APP_NOT_FOUND]: 'Application not found',
  [ErrorCode.TOOL_NOT_FOUND]: 'Tool not found',
  [ErrorCode.PERMISSION_DENIED]: 'Permission denied',
  [ErrorCode.INVALID_PARAMS]: 'Invalid parameters',
  [ErrorCode.AUTOMATION_NOT_SUPPORTED]: 'Automation not supported on this platform',
  [ErrorCode.AAI_JSON_INVALID]: 'Invalid aai.json configuration',
  [ErrorCode.TIMEOUT]: 'Operation timed out',
  [ErrorCode.APP_NOT_RUNNING]: 'Application not running',
  [ErrorCode.SCRIPT_PARSE_ERROR]: 'Script parsing error',
};

/**
 * AAI Automation Error
 *
 * Custom error class for AAI protocol errors with structured data.
 */
export class AutomationError extends Error {
  public readonly code: ErrorCode;
  public readonly type: string;
  public readonly detail?: string;

  constructor(code: ErrorCode, detail?: string) {
    const message = ErrorMessage[code];
    super(message);
    this.name = 'AutomationError';
    this.code = code;
    this.type = ErrorType[code];
    this.detail = detail;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AutomationError);
    }
  }

  /**
   * Convert to JSON-RPC 2.0 error format
   */
  toJSON(): {
    code: number;
    message: string;
    data: { type: string; detail?: string };
  } {
    return {
      code: this.code,
      message: this.message,
      data: {
        type: this.type,
        detail: this.detail,
      },
    };
  }

  /**
   * Create error from error code
   */
  static fromCode(code: ErrorCode, detail?: string): AutomationError {
    return new AutomationError(code, detail);
  }

  /**
   * Check if an error is an AutomationError
   */
  static isAutomationError(error: unknown): error is AutomationError {
    return error instanceof AutomationError;
  }
}

/**
 * Helper functions for creating common errors
 */
export const Errors = {
  automationFailed: (detail?: string): AutomationError =>
    new AutomationError(ErrorCode.AUTOMATION_FAILED, detail),

  appNotFound: (appId: string): AutomationError =>
    new AutomationError(ErrorCode.APP_NOT_FOUND, `Application '${appId}' not found`),

  toolNotFound: (appId: string, tool: string): AutomationError =>
    new AutomationError(ErrorCode.TOOL_NOT_FOUND, `Tool '${tool}' not found in '${appId}'`),

  permissionDenied: (detail?: string): AutomationError =>
    new AutomationError(ErrorCode.PERMISSION_DENIED, detail),

  invalidParams: (detail: string): AutomationError =>
    new AutomationError(ErrorCode.INVALID_PARAMS, detail),

  automationNotSupported: (platform: string, automation: string): AutomationError =>
    new AutomationError(
      ErrorCode.AUTOMATION_NOT_SUPPORTED,
      `Platform '${platform}' does not support '${automation}' automation`
    ),

  invalidAaiJson: (appId: string, detail: string): AutomationError =>
    new AutomationError(ErrorCode.AAI_JSON_INVALID, `Invalid aai.json for '${appId}': ${detail}`),

  timeout: (seconds: number): AutomationError =>
    new AutomationError(ErrorCode.TIMEOUT, `Operation timed out after ${seconds} seconds`),

  appNotRunning: (appId: string): AutomationError =>
    new AutomationError(ErrorCode.APP_NOT_RUNNING, `Application '${appId}' is not running`),

  scriptParseError: (detail: string): AutomationError =>
    new AutomationError(ErrorCode.SCRIPT_PARSE_ERROR, detail),
};
