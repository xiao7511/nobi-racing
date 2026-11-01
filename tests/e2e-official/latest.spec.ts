import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/open-catalog', route => route.fulfill({ json: { status:'disabled',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',syncedAt:null,expiresAt:null,items:[] } }));
  await page.route('**/api/v1/official-news', route => route.fulfill({ json: { sources: [
    {id:'formula1',name:'www.formula1.com',homepage:'https://www.formula1.com/en/latest',status:'rights_required',syncedAt:null,expiresAt:null,items:[]},
    {id:'fia',name:'FIA',homepage:'https://www.fia.com/news',status:'rights_required',syncedAt:null,expiresAt:null,items:[]},
  ] } }));
});
function response() {
  const now=new Date().toISOString();
  return { status:'ready',sourceName:'BBC Sport',sourceUrl:'https://www.bbc.co.uk/sport/formula1',termsUrl:'https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds',usage:'personal-local-only',checkedAt:now,syncedAt:now,expiresAt:new Date(Date.parse(now)+900000).toISOString(),sourceUpdatedAt:now,newestPublishedAt:now,items:[{title:'Original engine update',summary:'Source short summary',titleZh:'赛车动力单元新进展',summaryZh:'来源简短摘要的中文机器翻译。',translationStatus:'machine',url:'https://www.bbc.co.uk/sport/formula1/articles/abc123?at_medium=RSS&at_campaign=rss',publishedAt:now},{title:'Original weekend report',summary:'Source short summary',titleZh:'赛事周末报道',summaryZh:'来源简短摘要的中文机器翻译。',translationStatus:'machine',url:'https://www.bbc.com/sport/formula1/articles/def456',publishedAt:null}] };
}
test('personal reader preserves source links, searches and hides expired headlines',async({page})=>{
  await page.clock.install();
  await page.route('**/api/v1/latest-news',route=>route.fulfill({json:response()}));
  await page.goto('/#/news');
  const panel=page.getByTestId('latest-news');
  await expect(panel.locator('.latest-headline')).toHaveCount(2);
  await expect(panel.locator('.latest-headline').first()).toHaveAttribute('href','https://www.bbc.co.uk/sport/formula1/articles/abc123?at_medium=RSS&at_campaign=rss');
  await expect(panel).toContainText('Publication date not supplied');
  await panel.getByRole('searchbox').fill('engine'); await expect(panel.locator('.latest-headline')).toHaveCount(1);
  await panel.getByRole('searchbox').focus(); await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(panel.getByRole('searchbox')).toBeFocused();
  await panel.getByRole('searchbox').fill('not-present'); await expect(panel).toContainText('No matching headlines');
  await panel.getByRole('searchbox').fill('');
  await page.getByRole('combobox').first().selectOption('zh-CN');
  await expect(panel.getByRole('heading',{name:'最新赛车资讯'})).toBeVisible();
  await expect(panel.locator('.latest-headline').first()).toHaveText('赛车动力单元新进展 ↗');
  await page.clock.setSystemTime(new Date(Date.now()+901000)); await page.clock.runFor(1000);
  await expect(panel.locator('.latest-headline')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('disabled and invalid news never fall back to fictional headlines',async({page})=>{
  const disabled={...response(),status:'disabled',checkedAt:null,syncedAt:null,expiresAt:null,sourceUpdatedAt:null,newestPublishedAt:null,items:[]};
  await page.route('**/api/v1/latest-news',route=>route.fulfill({json:disabled}));
  await page.goto('/#/news'); const panel=page.getByTestId('latest-news');
  await expect(panel).toContainText('disabled for this deployment');
  await expect(panel.locator('.latest-headline')).toHaveCount(0);
  await page.unroute('**/api/v1/latest-news');
  await page.route('**/api/v1/latest-news',route=>route.fulfill({json:{...response(),items:[{title:'Unsafe headline',url:'javascript:alert(1)',publishedAt:null}]}}));
  await page.reload();
  await expect(panel.locator('[role=alert]')).toBeVisible();
  await expect(panel.locator('.latest-headline')).toHaveCount(0);
  await expect(panel.getByRole('link',{name:'BBC Sport ↗',exact:true})).toBeVisible();
});
