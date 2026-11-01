import { test, expect } from '@playwright/test';
test('official sync, expiry, revocation, real photography and source policy', async ({ page }, info) => {
  let revoked = false;
  await page.route('**/api/v1/latest-news',route=>route.fulfill({json:{status:'disabled',sourceName:'BBC Sport',sourceUrl:'https://www.bbc.co.uk/sport/formula1',termsUrl:'https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds',usage:'personal-local-only',checkedAt:null,syncedAt:null,expiresAt:null,sourceUpdatedAt:null,newestPublishedAt:null,items:[]}}));
  await page.route('**/api/v1/open-catalog', route => route.fulfill({ json: { status: 'ready', license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', syncedAt: new Date().toISOString(), expiresAt: new Date(Date.now()+3600000).toISOString(), items: ['Q173365','Q9673','Q2239218'].map((id, index) => ({ id, name: ['Ferrari F2005', 'Lewis Hamilton', 'Max Verstappen'][index], nameZh: '', description: 'CC0 test metadata', descriptionZh: '', sourceUrl: 'https://www.wikidata.org/wiki/'+id, sourceUpdatedAt: '2026-01-01T00:00:00Z', revision: 1 })) } }));
  await page.route('**/api/v1/official-news', async route => route.fulfill({ json: { sources: [
    { id: 'formula1', name: 'www.formula1.com', homepage: 'https://www.formula1.com/en/latest', status: revoked ? 'rights_required' : 'ready', syncedAt: revoked ? null : new Date().toISOString(), expiresAt: revoked ? null : new Date(Date.now() + 10000).toISOString(), items: revoked ? [] : [{ title: 'Authorized test headline', url: 'https://www.formula1.com/en/latest/article/test', publishedAt: null }] },
    { id: 'fia', name: 'FIA', homepage: 'https://www.fia.com/news', status: 'rights_required', syncedAt: null, expiresAt: null, items: [] },
  ] } }));
  await page.goto('/#/news');
  await expect(page.getByRole('link', { name: 'Lewis Hamilton' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Authorized test headline' })).toHaveAttribute('href', 'https://www.formula1.com/en/latest/article/test');
  await expect(page.getByText('Publication date not supplied')).toBeVisible();
  await expect(page.locator('.news-card').first().locator('img')).toBeVisible();
  await expect.poll(() => page.locator('.news-card img').first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(1000);
  await page.screenshot({ path: `docs/verification/official-content/news-${info.project.name}.png`, fullPage: true });
  await expect(page.getByRole('link', { name: 'Authorized test headline' })).toHaveCount(0, { timeout: 12000 });
  revoked = true;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('No valid syndication grant.', { exact: false })).toHaveCount(2);
  await page.locator('.page-footer a').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  await expect(page.getByRole('link', { name: 'CC BY-SA 2.0 ↗', exact: true })).toBeVisible();
  await page.getByRole('combobox').first().selectOption('zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('隐私');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: `docs/verification/official-content/legal-${info.project.name}.png`, fullPage: true });
});
