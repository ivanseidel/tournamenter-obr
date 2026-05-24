import path from 'node:path';
import { defineConfig } from '@playwright/test';

const pluginRoot = process.cwd();
const tournamenterRoot =
  process.env.TOURNAMENTER_ROOT || path.resolve(pluginRoot, '..', 'Tournamenter');
const nodeCompatShim = path.join(pluginRoot, 'test-e2e', 'tournamenter-node-compat.cjs');

export default defineConfig({
  testDir: './test-e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: [
      'PORT=3000',
      'TMP_PATH=/tmp/tournamenter-obr-e2e-tmp',
      'DB_FOLDER=/tmp/tournamenter-obr-e2e-db',
      `NODE_OPTIONS=--require=${nodeCompatShim}`,
      `TOURNAMENTER_EXTENSIONS=${pluginRoot}`,
      `node ${path.join(tournamenterRoot, 'app.js')}`,
    ].join(' '),
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
