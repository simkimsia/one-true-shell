import { defineConfig } from '@playwright/test';
import * as path from 'path';

const PORT = process.env.PORT || '8000';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
if (!process.env.IMPL_DIR && !process.env.NO_SERVER) {
  throw new Error('Set IMPL_DIR to your implementation (the directory with run.sh), or NO_SERVER=1 with BASE_URL.');
}
const IMPL_DIR = path.resolve(process.cwd(), process.env.IMPL_DIR || '.');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 20_000,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: process.env.NO_SERVER ? undefined : {
    command: './run.sh',
    cwd: IMPL_DIR,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PORT },
  },
});
