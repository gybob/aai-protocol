import { createGateway } from '../src/mcp/server.js';
import { logger } from '../src/utils/logger.js';

logger.level = 'error';

async function run() {
  console.log('Starting memory check...');
  const gateway = await createGateway();
  await gateway.initialize();

  const iterations = 1000;
  const initialMemory = process.memoryUsage().heapUsed;

  for (let i = 0; i < iterations; i++) {
    gateway.getRegistry();

    if (i % 100 === 0) {
      if (global.gc) global.gc();
    }
  }

  if (global.gc) global.gc();
  const finalMemory = process.memoryUsage().heapUsed;
  const diff = finalMemory - initialMemory;

  console.log(`Initial: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Final: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Growth: ${(diff / 1024 / 1024).toFixed(2)} MB`);

  if (diff > 10 * 1024 * 1024) {
    console.error('Memory leak detected!');
    process.exit(1);
  } else {
    console.log('Memory usage stable.');
  }
}

run().catch(console.error);
