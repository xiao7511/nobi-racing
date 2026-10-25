import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: {
    '@nobi/i18n': fileURLToPath(new URL('./packages/i18n/src/index.ts', import.meta.url)),
    '@nobi/contracts/api': fileURLToPath(new URL('./packages/contracts/src/generated/api.ts', import.meta.url)),
    '@nobi/contracts/validators': fileURLToPath(new URL('./packages/contracts/src/generated/validators.mjs', import.meta.url)),
    '@nobi/contracts/schemas': fileURLToPath(new URL('./packages/contracts/src/generated/schemas.json', import.meta.url)),
    '@nobi/contracts': fileURLToPath(new URL('./packages/contracts/src/index.ts', import.meta.url)),
    '@capacitor/core': fileURLToPath(new URL('./apps/fan/node_modules/@capacitor/core/dist/index.js', import.meta.url)),
    '@capacitor/app': fileURLToPath(new URL('./apps/fan/node_modules/@capacitor/app/dist/esm/index.js', import.meta.url)),
  } },
  test: { include: ['tests/**/*.test.ts'], environment: 'jsdom', restoreMocks: true },
});
