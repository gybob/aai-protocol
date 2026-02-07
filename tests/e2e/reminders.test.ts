import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, rm, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { AAIGateway, createGateway } from '../../src/mcp/server.js';
import { MacOSExecutor } from '../../src/executors/macos.js';
import { scanAllPaths, AppRegistry } from '../../src/config/discovery.js';
import { replaceParamsSecure } from '../../src/executors/param-transform.js';

const TEST_LIST = '生活';
const AAI_DIR = join(homedir(), '.aai');
const REMINDERS_DIR = join(AAI_DIR, 'com.apple.reminders');

describe('Reminders E2E Test', () => {
  let gateway: AAIGateway;
  let executor: MacOSExecutor;
  let createdReminderTitle: string;

  beforeAll(async () => {
    executor = new MacOSExecutor();
    gateway = await createGateway();
    await gateway.initialize();
  });

  describe('Gateway Discovery', () => {
    it('should discover Reminders app from ~/.aai/', async () => {
      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');

      expect(app).toBeDefined();
      expect(app?.name).toBe('Reminders');
      expect(app?.config.platforms.macos).toBeDefined();
    });

    it('should have create_reminder tool', async () => {
      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');
      const tools = app?.config.platforms.macos?.tools;

      const createTool = tools?.find(t => t.name === 'create_reminder');
      expect(createTool).toBeDefined();
      expect(createTool?.parameters.required).toContain('title');
    });
  });

  describe('Direct Executor Test', () => {
    it('should get lists via AppleScript', async () => {
      const script = `tell application "Reminders"
  set listNames to name of every list
  return "{\\\"lists\\\": " & my listToJSON(listNames) & "}"
end tell

on listToJSON(theList)
  set jsonStr to "["
  repeat with i from 1 to count of theList
    set jsonStr to jsonStr & "\\"" & item i of theList & "\\""
    if i < count of theList then set jsonStr to jsonStr & ","
  end repeat
  return jsonStr & "]"
end listToJSON`;

      const result = await executor.execute(script, {}, { timeout: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as { lists: string[] };
      expect(Array.isArray(data.lists)).toBe(true);
      expect(data.lists.length).toBeGreaterThan(0);
    });
  });

  describe('Full Chain: Create Reminder', () => {
    it('should create a reminder via Gateway executor', async () => {
      const timestamp = Date.now();
      createdReminderTitle = `AAI Test Reminder ${timestamp}`;

      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');
      const tool = app?.config.platforms.macos?.tools.find(t => t.name === 'create_reminder');

      expect(tool).toBeDefined();

      const params = {
        title: createdReminderTitle,
        list_name: TEST_LIST,
        notes: 'Created by AAI Gateway E2E test',
      };

      const processedScript = replaceParamsSecure(tool!.script, params, {
        platform: 'macos',
        automation: 'applescript',
      });

      const result = await executor.execute(processedScript, {}, { timeout: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as { success: boolean; id: string };
      expect(data.success).toBe(true);
      expect(data.id).toBeDefined();
      expect(data.id).toContain('x-apple-reminder://');

      console.log(`✅ Created reminder: "${createdReminderTitle}" with ID: ${data.id}`);
    });

    it('should list reminders and find the created one', async () => {
      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');
      const tool = app?.config.platforms.macos?.tools.find(t => t.name === 'list_reminders');

      expect(tool).toBeDefined();

      const params = {
        list_name: TEST_LIST,
        completed: false,
      };

      const processedScript = replaceParamsSecure(tool!.script, params, {
        platform: 'macos',
        automation: 'applescript',
      });

      const result = await executor.execute(processedScript, {}, { timeout: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as { reminders: string[] };
      expect(Array.isArray(data.reminders)).toBe(true);
      expect(data.reminders).toContain(createdReminderTitle);

      console.log(`✅ Found reminder in list: ${data.reminders.length} reminders total`);
    });

    it('should complete the reminder', async () => {
      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');
      const tool = app?.config.platforms.macos?.tools.find(t => t.name === 'complete_reminder');

      expect(tool).toBeDefined();

      const params = {
        title: createdReminderTitle,
        list_name: TEST_LIST,
      };

      const processedScript = replaceParamsSecure(tool!.script, params, {
        platform: 'macos',
        automation: 'applescript',
      });

      const result = await executor.execute(processedScript, {}, { timeout: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as { success: boolean; completed: boolean };
      expect(data.success).toBe(true);
      expect(data.completed).toBe(true);

      console.log(`✅ Completed reminder: "${createdReminderTitle}"`);
    });

    it('should delete the reminder', async () => {
      const registry = gateway.getRegistry();
      const app = registry.get('com.apple.reminders');
      const tool = app?.config.platforms.macos?.tools.find(t => t.name === 'delete_reminder');

      expect(tool).toBeDefined();

      const params = {
        title: createdReminderTitle,
        list_name: TEST_LIST,
      };

      const processedScript = replaceParamsSecure(tool!.script, params, {
        platform: 'macos',
        automation: 'applescript',
      });

      const result = await executor.execute(processedScript, {}, { timeout: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as { success: boolean; deleted: boolean };
      expect(data.success).toBe(true);
      expect(data.deleted).toBe(true);

      console.log(`✅ Deleted reminder: "${createdReminderTitle}"`);
    });
  });
});
