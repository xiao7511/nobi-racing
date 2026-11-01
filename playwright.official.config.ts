import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e-official',
  use: { baseURL: 'http://127.0.0.1:5278', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...(process.env.NOBI_BROWSER_CHANNEL ? { channel: process.env.NOBI_BROWSER_CHANNEL } : {}) } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: { command: 'pnpm --filter @nobi/fan dev --port 5278', url: 'http://127.0.0.1:5278', reuseExistingServer: false, env: { VITE_DATA_TRANSPORT: 'backend' } },
});
