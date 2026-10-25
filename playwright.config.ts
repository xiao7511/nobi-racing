import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:5273', trace: 'retain-on-failure' },
  workers: 2,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(process.env.NOBI_BROWSER_CHANNEL ? { channel: process.env.NOBI_BROWSER_CHANNEL } : {}) } },
    { name: 'mobile-web', use: { ...devices['iPhone 13'] } },
  ],
  webServer: [
    { command: 'pnpm --filter @nobi/fan dev --port 5273', url: 'http://127.0.0.1:5273', reuseExistingServer: false, env: { VITE_DATA_TRANSPORT: 'fixture' } },
    { command: 'pnpm --filter @nobi/admin dev --port 5274', url: 'http://127.0.0.1:5274', reuseExistingServer: false },
  ],
});
