export { MacOSExecutor, createMacOSExecutor } from './macos.js';
export { WindowsExecutor, createWindowsExecutor } from './windows.js';
export { LinuxExecutor, createLinuxExecutor } from './linux.js';
export type { DBusConfig } from './linux.js';
export {
  replaceParams,
  parseJsonOutput,
  getCurrentPlatform,
} from './base.js';
export type {
  AutomationExecutor,
  ExecutionResult,
  ExecutorOptions,
} from './base.js';
export {
  escapeAppleScript,
  escapePowerShell,
  escapeDBus,
  transformValue,
  replaceParamsSecure,
  validateParamTypes,
  getTransformRule,
  TRANSFORM_RULES,
} from './param-transform.js';
export type {
  ParamTransformOptions,
  ParamValue,
  TransformRule,
} from './param-transform.js';
