import { expect, test } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('nobi-racing:preferences:v1')) localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale: 'en-US', timeZone: 'UTC', theme: 'dark' }));
  });
});
test('story saving, driver following and profile survive reload', async ({ page }) => {
  await page.goto('/#/news/mock-aero');
  await page.getByRole('button', { name: 'Save story', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Story saved' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('navigation').getByRole('link', { name: 'Stats', exact: true }).click();
  await page.getByRole('link', { name: /AR Alex Rowan/ }).click();
  await page.getByRole('button', { name: 'Follow driver', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('link', { name: /Alex Rowan/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The art of finding the next tenth' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: /Alex Rowan/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The art of finding the next tenth' })).toBeVisible();
});
test('news filters, searches and empty states work', async ({ page }) => {
  await page.goto('/#/news');
  await expect(page.locator('.news-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(page.locator('.news-card')).toHaveCount(2);
  await page.getByRole('searchbox').fill('nothing-matches');
  await expect(page.getByRole('status')).toContainText('Nothing here yet');
});
test('race filters and track timezone change the displayed sessions', async ({ page }) => {
  await page.goto('/#/races');
  await page.getByRole('button', { name: 'Completed', exact: true }).click();
  await expect(page.locator('.race-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Upcoming', exact: true }).click();
  await page.getByRole('link', { name: /Desert Grand Prix/ }).click();
  await expect(page.locator('.session-list').getByText(/15:00/)).toHaveCount(3);
  await page.getByRole('button', { name: 'Track time', exact: true }).click();
  await expect(page.locator('.session-list').getByText(/19:00/)).toHaveCount(3);
  await expect(page.getByText('Asia/Dubai', { exact: true })).toBeVisible();
});
test('team standings aggregate correctly', async ({ page }) => {
  await page.goto('/#/stats');
  await page.getByRole('button', { name: 'Teams', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.locator('tbody tr').first()).toContainText('517.5');
});
test('settings persist language, light appearance and timezone', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('#theme').selectOption('light');
  await page.locator('#timezone').selectOption('Asia/Shanghai');
  await page.locator('#locale').selectOption('zh-CN');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('#theme')).toHaveValue('light');
  await expect(page.locator('#timezone')).toHaveValue('Asia/Shanghai');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('设置');
});
test('system appearance follows device changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/#/settings');
  await page.locator('#theme').selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('keyboard skip link focuses the content without changing the hash route', async ({ page }) => {
  await page.goto('/#/news');
  await expect(page.locator('.news-card')).toHaveCount(4);
  const original = page.url();
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(original);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Beyond the headlines.');
});
test('unknown routes and missing entities offer a way home', async ({ page }) => {
  for (const route of ['/#/not-a-page', '/#/news/mock-missing', '/#/races/mock-missing', '/#/drivers/mock-missing']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Home', exact: true })).toBeVisible();
  }
});
test('mock failures retry and empty fixtures are explicit', async ({ page }) => {
  await page.goto('/#/news?scenario=error');
  await expect(page.getByRole('alert')).toContainText('Unable to load');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Loading');
  await expect(page.getByRole('alert')).toContainText('Unable to load');
  await page.goto('/#/news?scenario=empty');
  await expect(page.getByRole('status')).toContainText('Nothing here yet');
  await page.goto('/#/news');
  await expect(page.locator('.news-card')).toHaveCount(4);
});
test('network outage is announced while bundled mock remains readable', async ({ page, context }) => {
  await page.goto('/#/news');
  await expect(page.locator('.news-card')).toHaveCount(4);
  await context.setOffline(true);
  await expect(page.getByRole('status')).toContainText('You are offline');
  await expect(page.locator('.news-card')).toHaveCount(4);
  await context.setOffline(false);
  await expect(page.getByText('You are offline', { exact: false })).toHaveCount(0);
});
test('preview sends no requests to external origins and reports no runtime errors', async ({ page }) => {
  const errors: string[] = []; const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5273/')) external.push(request.url()); });
  for (const route of ['/', '/#/news/mock-aero', '/#/races/mock-harbor', '/#/drivers/mock-mei', '/#/settings']) {
    await page.goto(route); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(external).toEqual([]); expect(errors).toEqual([]);
});
