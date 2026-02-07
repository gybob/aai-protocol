import { z } from 'zod';

export type Platform = 'macos' | 'windows' | 'linux' | 'android' | 'ios';
export type MacOSAutomation = 'applescript' | 'jxa';
export type WindowsAutomation = 'com';
export type LinuxAutomation = 'dbus';
export type AndroidAutomation = 'intent';
export type IOSAutomation = 'url_scheme';

const ToolParametersSchema = z.object({
  type: z.literal('object'),
  properties: z.record(
    z.object({
      type: z.string(),
      description: z.string().optional(),
      enum: z.array(z.string()).optional(),
      default: z.unknown().optional(),
    })
  ),
  required: z.array(z.string()).optional(),
});

const MacOSToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ToolParametersSchema,
  script: z.string(),
  output_parser: z.string().optional(),
  timeout: z.number().optional(),
  cache_ttl: z.number().int().min(0).optional(),
});

const WindowsScriptActionSchema = z.object({
  action: z.enum(['create', 'call', 'set', 'get', 'return']),
  var: z.string().optional(),
  object: z.string().optional(),
  progid: z.string().optional(),
  method: z.string().optional(),
  property: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  args: z.array(z.unknown()).optional(),
});

const WindowsToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ToolParametersSchema,
  script: z.array(WindowsScriptActionSchema),
  output_parser: z.string().optional(),
  timeout: z.number().optional(),
  cache_ttl: z.number().int().min(0).optional(),
});

const LinuxToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ToolParametersSchema,
  method: z.string(),
  output_parser: z.string().optional(),
  timeout: z.number().optional(),
  cache_ttl: z.number().int().min(0).optional(),
});

const AndroidToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ToolParametersSchema,
  action: z.string(),
  extras: z.record(z.string()).optional(),
  result_type: z.enum(['content_provider', 'broadcast']).optional(),
  result_uri: z.string().optional(),
  timeout: z.number().optional(),
  cache_ttl: z.number().int().min(0).optional(),
});

const IOSToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ToolParametersSchema,
  url_template: z.string(),
  result_type: z.enum(['app_group', 'clipboard']).optional(),
  app_group_id: z.string().optional(),
  timeout: z.number().optional(),
  cache_ttl: z.number().int().min(0).optional(),
});

const MacOSPlatformSchema = z.object({
  automation: z.enum(['applescript', 'jxa']),
  tools: z.array(MacOSToolSchema),
});

const WindowsPlatformSchema = z.object({
  automation: z.literal('com'),
  progid: z.string().optional(),
  tools: z.array(WindowsToolSchema),
});

const LinuxPlatformSchema = z.object({
  automation: z.literal('dbus'),
  service: z.string(),
  object: z.string(),
  interface: z.string(),
  tools: z.array(LinuxToolSchema),
});

const AndroidPlatformSchema = z.object({
  automation: z.literal('intent'),
  package: z.string(),
  tools: z.array(AndroidToolSchema),
});

const IOSPlatformSchema = z.object({
  automation: z.literal('url_scheme'),
  scheme: z.string(),
  tools: z.array(IOSToolSchema),
});

export const AaiJsonSchema = z.object({
  schema_version: z.string().regex(/^\d+\.\d+$/),
  appId: z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  platforms: z
    .object({
      macos: MacOSPlatformSchema.optional(),
      windows: WindowsPlatformSchema.optional(),
      linux: LinuxPlatformSchema.optional(),
      android: AndroidPlatformSchema.optional(),
      ios: IOSPlatformSchema.optional(),
    })
    .refine((platforms) => Object.keys(platforms).length > 0, {
      message: 'At least one platform must be defined',
    }),
});

export type AaiJson = z.infer<typeof AaiJsonSchema>;
export type MacOSTool = z.infer<typeof MacOSToolSchema>;
export type WindowsTool = z.infer<typeof WindowsToolSchema>;
export type LinuxTool = z.infer<typeof LinuxToolSchema>;
export type AndroidTool = z.infer<typeof AndroidToolSchema>;
export type IOSTool = z.infer<typeof IOSToolSchema>;
export type ToolParameters = z.infer<typeof ToolParametersSchema>;

export function validateAaiJson(data: unknown): AaiJson {
  return AaiJsonSchema.parse(data);
}

export function isValidAaiJson(data: unknown): data is AaiJson {
  return AaiJsonSchema.safeParse(data).success;
}
