import { expect, test, type APIRequestContext } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
async function control(request: APIRequestContext, action: string) {
  const url = process.env.NOBI_TEST_CONTROL_URL;
  const key = process.env.NOBI_TEST_CONTROL_KEY;
  if (!url || !key) throw Error('Run through pnpm verify:phase3 for an isolated database and test-only control server');
  const result = await request.post(url + '/' + action, { headers: { 'X-Test-Key': key } });
  expect(result.status()).toBe(200);
}
test.beforeEach(async ({ page, request }) => {
  await control(request, 'restore');
  await page.addInitScript(() => { if (!localStorage.getItem('nobi-racing:preferences:v1')) localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale: 'en-US', timeZone: 'UTC', theme: 'dark' })); });
});
test('uses complete server snapshots and server team totals instead of client aggregation', async ({ page, request }) => {
  await page.goto('/#/stats');
  await expect(page.locator('[data-transport=backend]')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await expect(page.locator('tbody tr').first()).toContainText('286.5');
  await expect(page.locator('.source-note')).toContainText('Snapshot');
  await control(request, 'team-points');
  await page.getByRole('button', { name: 'Teams', exact: true }).click();
  await expect(page.locator('tbody tr').first()).toContainText('999.125');
  await page.locator('tbody tr').first().getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aurora Racing');
  await expect(page.getByRole('definition').filter({ hasText: '999.125' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Season roster entries' })).toBeVisible();
});
test('reads database race sessions and named results with DNF', async ({ page }) => {
  await page.goto('/#/races');
  await page.getByRole('button', { name: 'Completed', exact: true }).click();
  await page.getByRole('link', { name: /Coastal Grand Prix/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Coastal Grand Prix');
  await expect(page.locator('[data-testid=session-results] tbody tr')).toHaveCount(4);
  await expect(page.locator('[data-testid=session-results]')).toContainText('Alex Rowan');
  await expect(page.locator('[data-testid=session-results]')).toContainText('DNF');
  await expect(page.locator('.source-note').filter({ hasText: 'NOBI original synthetic' })).toHaveCount(2);
});
test('driver follows survive reload, translation and theme changes without invented career totals', async ({ page }) => {
  await page.goto('/#/stats');
  await page.getByRole('link', { name: /Alex Rowan/ }).click();
  await page.getByRole('button', { name: 'Follow driver', exact: true }).click();
  await expect(page.getByText('Career starts', { exact: true })).toHaveCount(0);
  await page.getByRole('navigation').getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page).toHaveURL(/#\/profile$/);
  await expect(page.getByRole('link', { name: /Alex Rowan/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: /Alex Rowan/ })).toBeVisible();
  await page.goto('/#/settings');
  await page.locator('#theme').selectOption('light');
  await page.locator('#locale').selectOption('zh-CN');
  await page.getByRole('navigation').getByRole('link', { name: '赛事', exact: true }).click();
  await expect(page.getByRole('link', { name: /港湾大奖赛/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('real grant revocation removes previously displayed database facts and rechecks restoration', async ({ page, request }) => {
  await page.goto('/#/stats');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await control(request, 'revoke');
  try {
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('Nothing here yet');
    await expect(page.getByText('Alex Rowan', { exact: true })).toHaveCount(0);
  } finally { await control(request, 'restore'); }
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('tbody tr')).toHaveCount(4);
});
test('clears facts offline and does not substitute bundled data for a failed backend', async ({ page, context }) => {
  await page.goto('/#/stats');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await context.setOffline(true);
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Reconnect');
  await context.setOffline(false);
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.route('**/api/v1/seasons?**', route => route.fulfill({ status: 503, headers: { 'Content-Type': 'application/problem+json', 'X-Request-ID': 'phase3-test-reference' }, body: JSON.stringify({ code: 'SOURCE_UNAVAILABLE', detail: 'Internal SQL must remain hidden' }) }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('alert')).toContainText('phase3-test-reference');
  await expect(page.getByRole('alert')).not.toContainText('Internal SQL');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
});
test('rejects corrupt payloads and shows rate-limit cooldown', async ({ page }) => {
  await page.route('**/api/v1/standings?**', async route => {
    const response = await route.fetch(); const body = await response.json(); body.items[0].points = 286.5;
    await route.fulfill({ response, json: body });
  });
  await page.goto('/#/stats');
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await page.route('**/api/v1/seasons?**', route => route.fulfill({ status: 429, headers: { 'Content-Type': 'application/problem+json', 'Retry-After': '60' }, body: JSON.stringify({ code: 'RATE_LIMITED' }) }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Please wait');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeDisabled();
});
test('validates legacy identifiers and unavailable seasons without showing fabricated replacements', async ({ page }) => {
  await page.goto('/#/stats');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  const selector = page.getByRole('combobox', { name: 'Season', exact: true });
  const prior = await selector.locator('option').filter({ hasText: '2025' }).getAttribute('value');
  const current = await selector.locator('option').filter({ hasText: '2026' }).getAttribute('value');
  await selector.selectOption(prior!);
  await expect(page.getByRole('status')).toContainText('Nothing here yet');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await selector.selectOption(current!);
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.goto('/#/drivers/mock-alex');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await page.goto('/#/stats?season=00000000-0000-4000-8000-000000000001');
  await expect(page.getByRole('alert')).toContainText('selection is invalid');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await page.goto('/#/stats');
  await expect(page.locator('tbody tr')).toHaveCount(4);
});
test('validates without unsafe-eval and sends no requests to third-party origins', async ({ page }) => {
  const errors: string[] = []; const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5276/')) external.push(request.url()); });
  await page.route('http://127.0.0.1:5276/', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' ws:; style-src 'self' 'unsafe-inline'; img-src 'self' data:" } });
  });
  await page.goto('/#/stats');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  expect(errors).toEqual([]);expect(external).toEqual([]);
});
test('captures bilingual backend views in both themes with no horizontal overflow', async ({ page }, info) => {
  test.setTimeout(120000);
  const directory = resolve('docs/verification/phase-3/screenshots');await mkdir(directory, { recursive: true });
  for (const locale of ['en-US','zh-CN']) for (const theme of ['dark','light']) {
    await page.goto('/#/settings');
    await page.locator('#theme').selectOption(theme);
    await page.locator('#locale').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    for (const path of ['/races','/stats','/profile'] as const) {
      await page.getByRole('navigation').locator(`a[href="#${path}"]`).click();
      const titles = { '/races': ['Every weekend matters.', '每个周末，都值得期待。'], '/stats': ['The season, in numbers.', '用数字，读懂赛季。'], '/profile': ['Made yours.', '你的赛车世界。'] } as const;
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titles[path][locale === 'en-US' ? 0 : 1]);
      await expect(page.locator('.skeleton')).toHaveCount(0);
      await expect(page.getByRole('alert')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: resolve(directory, `${info.project.name}-${locale}-${theme}-${path.slice(1)}.png`), fullPage: info.project.name === 'backend-chromium', animations: 'disabled' });
    }
  }
});
