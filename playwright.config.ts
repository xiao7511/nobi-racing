import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile-web', use: { ...devices['iPhone 13'] } }],
  webServer: [
    { command: 'pnpm dev:fan', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
    { command: 'pnpm dev:admin', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
  ],
});
