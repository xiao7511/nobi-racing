import { expect, test } from '@playwright/test';
test('fan navigation and language switch', async ({ page }) => {
  await page.goto('/');
  await page.locator('select').selectOption('en-US');
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(5);
  await page.getByRole('navigation').getByRole('link', { name: 'Races', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every weekend matters.');
  await page.locator('select').selectOption('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('每个周末，都值得期待。');
});
test('admin preview exposes no protected action', async ({ page }) => {
  await page.goto('http://127.0.0.1:5274');
  await page.locator('select').selectOption('en-US');
  await expect(page.getByRole('status')).toContainText('No staff session');
  await expect(page.getByRole('button')).toHaveCount(0);
});
