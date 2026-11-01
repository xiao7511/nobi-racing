import { chromium, webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.NOBI_OPEN_PREVIEW || 'http://127.0.0.1:5279';
assert.match(origin, /^http:\/\/127\.0\.0\.1:[0-9]+$/);
const directory = new URL('../docs/verification/official-content/', import.meta.url);
await mkdir(directory, { recursive: true });
const results = [];
for (const [name, engine, viewport] of [['desktop', chromium, { width: 1440, height: 1000 }], ['mobile', webkit, { width: 390, height: 844 }]]) {
  const browser = await engine.launch(name === 'desktop' && process.env.NOBI_BROWSER_CHANNEL ? { channel: process.env.NOBI_BROWSER_CHANNEL } : {});
  try {
    const page = await browser.newPage({ viewport });
    await page.addInitScript(() => localStorage.setItem('nobi-racing:preferences:v1', JSON.stringify({ locale: 'zh-CN', theme: 'dark', timeZone: 'Asia/Shanghai' })));
    const response = await page.request.get(origin + '/api/v1/open-catalog');
    assert.equal(response.status(), 200);
    const catalog = await response.json();
    assert.equal(catalog.status, 'ready'); assert.equal(catalog.items.length, 3);
    const news = await (await page.request.get(origin + '/api/v1/official-news')).json();
    assert.ok(news.sources.every(source => source.status === 'rights_required' && source.items.length === 0));
    await page.goto(origin + '/#/news');
    await page.locator('.open-catalog-grid article').nth(2).waitFor();
    assert.equal(await page.locator('.open-catalog-grid article').count(), 3);
    const photo = page.locator('.news-card img').first(); await photo.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.news-card img')?.naturalWidth > 1000);
    await page.evaluate(() => scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: new URL(`live-news-${name}.png`, directory).pathname.replace(/^\/([A-Za-z]:)/, '$1'), fullPage: true });
    results.push({ name, passed: true, status: catalog.status, source: 'Real Java HTTP synchronization from Wikidata, no browser API mocks', syncedAt: catalog.syncedAt, revisions: catalog.items.map(item => ({ id: item.id, revision: item.revision })) });
  } finally { await browser.close(); }
}
await writeFile(new URL('live-browser.json', directory), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
console.log('PASS actual synchronized CC0 data, rights blocks and photography in desktop Chromium/Edge and mobile WebKit');
