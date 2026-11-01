import { test, expect } from '@playwright/test';
test('real local photography and bilingual license/privacy page', async ({ page }) => {
  await page.goto('/#/');
  const photo = page.locator('.hero .racing-photo img');
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(1000);
  await page.locator('.page-footer a').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  await expect(page.getByRole('link', { name: 'CC BY-SA 2.0 ↗', exact: true })).toBeVisible();
  await page.getByRole('combobox').first().selectOption('zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('隐私');
  await expect(page.getByText('本地开发预览', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
