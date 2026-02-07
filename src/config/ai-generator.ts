import { exec } from 'child_process';
import { promisify } from 'util';
import { basename } from 'path';
import { AaiJson } from '../parsers/schema.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

interface LLMRequest {
  model: string;
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  temperature?: number;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getSdef(appPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`sdef "${appPath}"`);
    return stdout;
  } catch (error) {
    logger.warn({ appPath, error }, 'Failed to get sdef');
    return '';
  }
}

export async function generateConfigWithAI(
  appPath: string,
  apiKey: string,
  apiEndpoint: string = 'https://api.openai.com/v1/chat/completions',
  model: string = 'gpt-4o'
): Promise<AaiJson | null> {
  const appName = basename(appPath, '.app');
  let bundleId = '';

  try {
    const { stdout } = await execAsync(
      `defaults read "${appPath}/Contents/Info" CFBundleIdentifier`
    );
    bundleId = stdout.trim();
  } catch (error) {
    logger.error({ appPath, error }, 'Failed to get bundle ID');
    return null;
  }

  const sdefContent = await getSdef(appPath);
  if (!sdefContent) {
    logger.error({ appPath }, 'No sdef content available for AI generation');
    return null;
  }

  const truncatedSdef =
    sdefContent.length > 100000 ? sdefContent.substring(0, 100000) + '...' : sdefContent;

  const systemPrompt = `You are an expert in macOS automation and AppleScript.
Your task is to generate an AAI (Agent App Interface) configuration file (aai.json) for a macOS application based on its scripting definition (sdef).

The aai.json format is:
{
  "schema_version": "1.0",
  "appId": "${bundleId}",
  "name": "${appName}",
  "platforms": {
    "macos": {
      "automation": "applescript",
      "tools": [
        {
          "name": "tool_name",
          "description": "Description",
          "parameters": { ...JSON Schema... },
          "script": "AppleScript code with \${param} placeholders",
          "output_parser": "result as text"
        }
      ]
    }
  }
}

Rules:
1. Identify the most useful commands from the sdef.
2. Create 3-5 high-value tools (e.g., create, list, search, delete).
3. Ensure AppleScript is valid and uses \${param_name} for substitution.
4. Output ONLY valid JSON.
`;

  const userPrompt = `Application: ${appName}
Bundle ID: ${bundleId}

SDEF Content:
\`\`\`xml
${truncatedSdef}
\`\`\`

Generate aai.json:`;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      } as LLMRequest),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as LLMResponse;
    const content = data.choices[0].message.content;

    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    return JSON.parse(jsonString) as AaiJson;
  } catch (error) {
    logger.error({ error }, 'Failed to generate config with AI');
    return null;
  }
}
