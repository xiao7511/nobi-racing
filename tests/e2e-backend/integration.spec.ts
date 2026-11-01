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
async function standings(request: APIRequestContext, type = 'driver') {
  const seasons = await request.get('/api/v1/seasons?locale=en-US&limit=100');
  expect(seasons.ok()).toBeTruthy();
  const season = (await seasons.json()).items.sort((a:{year:number},b:{year:number})=>b.year-a.year)[0];
  const response = await request.get('/api/v1/standings?locale=en-US&limit=100&seasonId='+season.id+'&type='+type);
  expect(response.ok()).toBeTruthy();return {season,body:await response.json()};
}
async function openDriver(page: import('@playwright/test').Page, request: APIRequestContext) {
  const {season,body}=await standings(request);const driver=body.items.find((row:{name:string})=>row.name==='Alex Rowan');
  expect(driver).toBeTruthy();const url='/#/drivers/'+driver.id+'?season='+season.id;await page.goto(url);return {driver,url,season};
}

test.beforeEach(async ({ page, request }) => {
  await control(request, 'restore');
  await page.addInitScript(() => { if (!localStorage.getItem('nobi-racing:preferences:v1')) localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale: 'en-US', timeZone: 'UTC', theme: 'dark' })); });
});
test('uses complete server snapshots and server team totals instead of client aggregation', async ({ page, request }) => {
  const {body}=await standings(request);expect(body.items).toHaveLength(4);expect(body.items[0].points).toBe('286.5');
  await openDriver(page,request);await expect(page.locator('[data-transport=backend]')).toBeVisible();await expect(page.locator('.source-note').filter({hasText:'Snapshot'})).toBeVisible();
  await control(request,'team-points');const teams=await standings(request,'team');expect(teams.body.items[0].points).toBe('999.125');
  await page.goto('/#/teams/'+teams.body.items[0].id+'?season='+teams.season.id);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Aurora Racing');
  await expect(page.getByRole('definition').filter({hasText:'999.125'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Season roster entries'})).toBeVisible();
});

test('reads database race sessions and named results with DNF', async ({ page, request }) => {
  const response=await request.get('/api/v1/races?status=completed&locale=en-US&limit=100');
  expect(response.ok()).toBeTruthy();
  const race=(await response.json()).items.find((item:{name:string})=>item.name==='Coastal Grand Prix');
  expect(race).toBeTruthy();
  await page.goto('/#/races/'+race.id+'?season='+race.seasonId);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Coastal Grand Prix');
  await expect(page.locator('[data-testid=session-results] tbody tr')).toHaveCount(4);
  await expect(page.locator('[data-testid=session-results]')).toContainText('Alex Rowan');
  await expect(page.locator('[data-testid=session-results]')).toContainText('DNF');
  await expect(page.locator('.source-note').filter({ hasText: 'NOBI original synthetic' })).toHaveCount(2);
});
test('driver follows survive reload, translation and theme changes without invented career totals', async ({ page, request }) => {
  const {driver}=await openDriver(page,request);
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
  await page.getByRole('navigation').getByRole('link', { name: '我的', exact: true }).click();
  await expect(page.locator('a[href*="'+driver.id+'"]').first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('real grant revocation removes previously displayed database facts and rechecks restoration', async ({ page, request }) => {
  await openDriver(page,request);
  await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
  await control(request, 'revoke');
  try {
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
    await expect(page.getByText('Alex Rowan', { exact: true })).toHaveCount(0);
  } finally { await control(request, 'restore'); }
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
});
test('clears facts offline and does not substitute bundled data for a failed backend', async ({ page, context, request }) => {
  await openDriver(page,request);
  await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
  await context.setOffline(true);
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Reconnect');
  await context.setOffline(false);
  await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
  await page.route('**/api/v1/seasons?**', route => route.fulfill({ status: 503, headers: { 'Content-Type': 'application/problem+json', 'X-Request-ID': 'phase3-test-reference' }, body: JSON.stringify({ code: 'SOURCE_UNAVAILABLE', detail: 'Internal SQL must remain hidden' }) }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('alert')).toContainText('phase3-test-reference');
  await expect(page.getByRole('alert')).not.toContainText('Internal SQL');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
});
test('rejects corrupt payloads and shows rate-limit cooldown', async ({ page, request }) => {
  await page.route('**/api/v1/standings?**', async route => {
    const response = await route.fetch(); const body = await response.json(); body.items[0].points = 286.5;
    await route.fulfill({ response, json: body });
  });
  await openDriver(page,request);
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await page.route('**/api/v1/seasons?**', route => route.fulfill({ status: 429, headers: { 'Content-Type': 'application/problem+json', 'Retry-After': '60' }, body: JSON.stringify({ code: 'RATE_LIMITED' }) }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Please wait');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeDisabled();
});
test('validates legacy identifiers and unavailable seasons without fabricated replacements', async ({ page, request }) => {
  const {driver,url,season}=await openDriver(page,request);await expect(page.locator('.metric-grid')).toBeVisible();
  const response=await request.get('/api/v1/seasons?locale=en-US&limit=100');const prior=(await response.json()).items.find((item:{year:number})=>item.year===2025);
  await page.goto('/#/drivers/'+driver.id+'?season='+prior.id);await expect(page.getByRole('heading',{level:1})).toHaveText('Alex Rowan');await expect(page.locator('.metric-grid')).toHaveCount(0);
  await page.goto(url);await expect(page.locator('.metric-grid')).toBeVisible();
  await page.goto('/#/drivers/mock-alex');await expect(page.getByRole('heading',{name:'Page not found',exact:true})).toBeVisible();
  await page.goto('/#/drivers/'+driver.id+'?season=00000000-0000-4000-8000-000000000001');await expect(page.getByRole('alert')).toContainText('selection is invalid');await expect(page.locator('[data-testid=backend-data]')).toHaveCount(0);
  await page.goto('/#/drivers/'+driver.id+'?season='+season.id);await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
});

test('validates without unsafe-eval and sends no requests to third-party origins', async ({ page, request }) => {
  const errors: string[] = []; const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:5276/')) external.push(request.url()); });
  await page.route('http://127.0.0.1:5276/', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' ws:; style-src 'self' 'unsafe-inline'; img-src 'self' data:" } });
  });
  await openDriver(page,request);
  await expect(page.locator('[data-testid=backend-data]')).toBeVisible();
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
