import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const routes = [ ['home', '/'], ['news', '/news'], ['races', '/races'], ['stats', '/stats'], ['profile', '/profile'], ['article', '/news/mock-aero'], ['race', '/races/mock-harbor'], ['driver', '/drivers/mock-mei'], ['settings', '/settings'] ];
test('capture bilingual desktop and mobile pages in both themes', async ({ page }, testInfo) => {
  test.setTimeout(240000);
  const directory = resolve('docs/verification/phase-1/screenshots');
  await mkdir(directory, { recursive: true });
  const widths = testInfo.project.name === 'chromium' ? [1440, 768, 390, 320] : [390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    for (const locale of ['en-US', 'zh-CN']) for (const theme of ['dark', 'light']) {
      await page.goto('/');
      await page.evaluate(({ locale, theme }) => localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale, theme, timeZone: 'Asia/Shanghai' })), { locale, theme });
      await page.reload();
      for (const [name, route] of routes) {
        await page.goto(`/#${route}`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('.skeleton')).toHaveCount(0);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 1440 || (width === 390 && testInfo.project.name === 'chromium')) {
          await page.screenshot({ path: resolve(directory, `${testInfo.project.name}-${width}-${locale}-${theme}-${name}.png`), fullPage: width > 600, animations: 'disabled' });
        }
      }
    }
  }
});
