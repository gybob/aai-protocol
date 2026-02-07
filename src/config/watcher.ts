import { watch } from 'fs';
import { logger } from '../utils/logger.js';

export function startConfigWatcher(paths: string[], onChange: () => void): void {
  const debounceTime = 1000;
  let timer: NodeJS.Timeout | null = null;

  paths.forEach((path) => {
    try {
      watch(path, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('aai.json')) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            logger.info({ path, filename }, 'Configuration change detected, reloading...');
            onChange();
          }, debounceTime);
        }
      });
      logger.info({ path }, 'Watching for configuration changes');
    } catch (error) {
      logger.debug({ path, error }, 'Failed to watch path');
    }
  });
}
