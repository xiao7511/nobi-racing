import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e-backend',
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5276', trace: 'retain-on-failure' },
  projects: [
    { name: 'backend-chromium', use: { ...devices['Desktop Chrome'], ...(process.env.NOBI_BROWSER_CHANNEL ? { channel: process.env.NOBI_BROWSER_CHANNEL } : {}) } },
    { name: 'backend-webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: { command: 'pnpm --filter @nobi/fan dev --port 5276', url: 'http://127.0.0.1:5276', reuseExistingServer: false, env: { VITE_DATA_TRANSPORT: 'backend', NOBI_API_PROXY: process.env.NOBI_API_PROXY || 'http://127.0.0.1:5280' } },
});
