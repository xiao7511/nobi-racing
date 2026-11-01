import { chromium, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const origin = process.env.NOBI_OPEN_PREVIEW || 'http://127.0.0.1:5279';
assert.match(origin, /^http:\/\/127\.0\.0\.1:[0-9]+$/);
const directory = new URL('../docs/verification/latest-news/', import.meta.url);
await mkdir(directory, { recursive: true });
const results = [];
for (const [name, engine, viewport] of [['desktop', chromium, { width: 1440, height: 1000 }], ['mobile', webkit, { width: 390, height: 844 }]]) {
  const browser = await engine.launch(name === 'desktop' && process.env.NOBI_BROWSER_CHANNEL ? { channel: process.env.NOBI_BROWSER_CHANNEL } : {});
  try {
    const page = await browser.newPage({ viewport });
    await page.addInitScript(() => localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale: 'zh-CN', theme: 'dark', timeZone: 'Asia/Shanghai' })));
    const response = await page.request.get(origin + '/api/v1/latest-news'); assert.equal(response.status(), 200);
    const news = await response.json(); assert.equal(news.status, 'ready'); assert.ok(news.items.length > 0); assert.equal(news.usage, 'personal-local-only');
    assert.equal(news.sourceName, 'BBC Sport'); assert.ok(Date.parse(news.expiresAt) > Date.now());
    await page.goto(origin + '/#/news'); const panel = page.getByTestId('latest-news');
    await panel.locator('.latest-headline').first().waitFor();
    assert.equal(await panel.locator('.latest-headline').count(), news.items.length);
    assert.equal(await panel.locator('.latest-headline').first().getAttribute('href'), news.items[0].url);
    assert.ok((await panel.locator('.latest-headline').first().textContent()).includes(news.items[0].titleZh));
    assert.ok((await panel.locator('.latest-items time').first().getAttribute('datetime')) === news.items[0].publishedAt);
    await panel.getByRole('searchbox').fill('not-a-real-headline-search-4321'); assert.equal(await panel.locator('.latest-headline').count(), 0);
    await panel.getByRole('searchbox').fill('');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: fileURLToPath(new URL(`latest-news-${name}.png`, directory)), fullPage: true });
    await page.goto(origin + '/#/'); await page.locator('.hero').waitFor(); await page.locator('.latest-headline').first().waitFor();
    assert.equal(await page.locator('.latest-headline').count(), Math.min(5, news.items.length));
    await page.waitForFunction(() => document.querySelector('.hero img')?.naturalWidth > 1000);
    await page.screenshot({ path: fileURLToPath(new URL(`home-${name}.png`, directory)), fullPage: true });
    results.push({ name, passed: true, source: 'Actual Java BBC Sport RSS fetch; no browser API mocks', count: news.items.length, checkedAt: news.checkedAt, syncedAt: news.syncedAt, newestPublishedAt: news.newestPublishedAt });
  } finally { await browser.close(); }
}
await writeFile(new URL('live-browser.json', directory), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
console.log('PASS actual BBC Sport RSS headlines, source links, publication dates, search and homepage on desktop and mobile');
