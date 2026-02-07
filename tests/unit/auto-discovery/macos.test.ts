import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanMacApps } from '../../../src/config/auto-discovery/macos.js';

vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('os', () => ({
  homedir: () => '/Users/test',
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { readdir, stat } from 'fs/promises';
import { exec } from 'child_process';

describe('macOS Auto-Discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should discover apps with NSAppleScriptEnabled', async () => {
    (readdir as any).mockImplementation(async (path: string) => {
      if (path === '/Applications') return ['TestApp.app'];
      if (path.includes('Contents/Resources')) return [];
      return [];
    });

    (stat as any).mockResolvedValue({
      isDirectory: () => true,
    });

    (exec as any).mockImplementation((cmd: string, cb: any) => {
      if (cmd.includes('CFBundleIdentifier')) {
        cb(null, { stdout: 'com.test.app\n' });
      } else if (cmd.includes('NSAppleScriptEnabled')) {
        cb(null, { stdout: '1\n' });
      } else {
        cb(new Error('Command failed'));
      }
    });

    const apps = await scanMacApps();

    expect(apps).toHaveLength(1);
    expect(apps[0].appId).toBe('com.test.app');
    expect(apps[0].name).toBe('TestApp');
    expect(apps[0].config.platforms.macos?.automation).toBe('applescript');
  });

  it('should discover apps with .sdef file', async () => {
    (readdir as any).mockImplementation(async (path: string) => {
      if (path === '/Applications') return ['ScriptableApp.app'];
      if (path.includes('Contents/Resources')) return ['app.sdef'];
      return [];
    });

    (stat as any).mockResolvedValue({
      isDirectory: () => true,
    });

    (exec as any).mockImplementation((cmd: string, cb: any) => {
      if (cmd.includes('CFBundleIdentifier')) {
        cb(null, { stdout: 'com.scriptable.app\n' });
      } else if (cmd.includes('NSAppleScriptEnabled')) {
        cb(new Error('Key not found'));
      } else {
        cb(new Error('Command failed'));
      }
    });

    const apps = await scanMacApps();

    expect(apps).toHaveLength(1);
    expect(apps[0].appId).toBe('com.scriptable.app');
  });

  it('should ignore apps without automation support', async () => {
    (readdir as any).mockImplementation(async (path: string) => {
      if (path === '/Applications') return ['DumbApp.app'];
      if (path.includes('Contents/Resources')) return ['icon.icns'];
      return [];
    });

    (stat as any).mockResolvedValue({
      isDirectory: () => true,
    });

    (exec as any).mockImplementation((cmd: string, cb: any) => {
      if (cmd.includes('CFBundleIdentifier')) {
        cb(null, { stdout: 'com.dumb.app\n' });
      } else {
        cb(new Error('Command failed'));
      }
    });

    const apps = await scanMacApps();

    expect(apps).toHaveLength(0);
  });
});
