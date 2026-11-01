import {chromium,webkit,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const origin=process.env.NOBI_OPEN_PREVIEW||'http://127.0.0.1:5279';assert.match(origin,/^http:\/\/127\.0\.0\.1:[0-9]+$/);
const output=new URL('../docs/verification/personal-world/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [device,engine,viewport] of [['desktop',chromium,{width:1440,height:1000}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(device==='desktop'&&process.env.NOBI_BROWSER_CHANNEL?{channel:process.env.NOBI_BROWSER_CHANNEL}:{});
 try{
  const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[],external=[],legacy=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(origin+'/'))external.push(request.url());if(/\/api\/v1\/(seasons|drivers|standings)\?/.test(request.url()))legacy.push(request.url());});
  await page.addInitScript(()=>{if(!localStorage.getItem('nobi-racing:preferences:v1'))localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'}));});
  const feeds={};for(const path of ['season-insights','weekends','latest-news']){const response=await page.request.get(origin+'/api/v1/'+path);assert.equal(response.status(),200);feeds[path]=await response.json();assert.equal(feeds[path].status,'ready',path+' source is not ready');}
  const latest=feeds['season-insights'].rounds.at(-1);const meeting=feeds.weekends.items.find(item=>!item.cancelled&&Date.parse(item.endsAt)>Date.now());assert.ok(meeting);const article=feeds['latest-news'].items[0];assert.ok(article);
  await page.goto(origin+'/#/profile');const panel=page.getByTestId('personal-world');await expect(panel.locator('.world-counts dd')).toHaveText(['0','0','0','0']);await page.getByRole('button',{name:'关注所选车手',exact:true}).waitFor();await page.screenshot({path:fileURLToPath(new URL(`${device}-empty.png`,output)),fullPage:true});
  await page.goto(origin+'/#/stats?type=driver');await page.getByTestId('insight-standings').locator('tbody tr').first().locator('.entrant-follow').click();
  await page.locator('.insight-controls .filter-group button').nth(1).click();await page.getByTestId('insight-standings').locator('tbody tr').first().locator('.entrant-follow').click();
  await page.goto(origin+'/#/weekends/'+meeting.id);await page.locator('.weekend-follow button').click();
  await page.goto(origin+'/#/news');await page.locator('.latest-actions button').first().click();
  await page.goto(origin+'/#/profile');await expect(panel.locator('.world-counts dd')).toHaveText(['1','1','1','1']);await expect(page.getByTestId('world-drivers').locator('.world-card-facts')).toContainText(latest.drivers[0].points);await expect(page.getByTestId('world-teams').locator('.world-card-facts')).toContainText(latest.teams[0].points);await expect(panel.locator('.world-next')).toBeVisible();
  await page.reload();await expect(panel.locator('.world-counts dd')).toHaveText(['1','1','1','1']);
  await page.getByRole('button',{name:'关注所选车手',exact:true}).click();await expect(page.getByTestId('world-drivers').locator('.world-card')).toHaveCount(2);
  for(const locale of ['zh-CN','en-US'])for(const theme of ['dark','light']){
   await page.goto(origin+'/#/settings');await page.locator('#locale').selectOption(locale);await page.locator('#theme').selectOption(theme);await page.goto(origin+'/#/profile');await expect(panel.locator('.world-counts dd')).toHaveText(['2','1','1','1']);await expect(page.getByTestId('world-drivers').locator('.world-card-facts')).toHaveCount(2);await expect(panel.locator('.world-bookmark h3')).not.toContainText('Saved BBC Sport original link');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:fileURLToPath(new URL(`profile-${device}-${locale}-${theme}.png`,output)),fullPage:true});
   results.push({device,locale,theme,passed:true,driverFollows:2,teamFollows:1,weekendFollows:1,newsBookmarks:1,externalRequests:0,syntheticRequests:0,source:'Real local Java APIs; no browser API replacements'});
  }
  await context.setOffline(true);await expect(panel.locator('.world-card-facts')).toHaveCount(0);await expect(panel.locator('.world-next')).toHaveCount(0);await expect(panel.locator('.world-counts dd')).toHaveText(['2','1','1','1']);await expect(panel.locator('.world-bookmark h3')).toContainText('Saved BBC Sport original link');
  await context.setOffline(false);await expect(page.getByTestId('world-drivers').locator('.world-card-facts')).toHaveCount(2);
  await page.getByTestId('world-drivers').locator('.world-card').first().getByRole('button').click();await expect(panel.locator('.world-counts dd')).toHaveText(['1','1','1','1']);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('nobi-racing:preferences:v1')));assert.deepEqual(stored.followedDriverIds,['openf1:driver:'+latest.drivers[0].id]);const canonical=new URL(article.url);canonical.search='';assert.deepEqual(stored.savedNewsUrls,[canonical.href]);assert.ok(!JSON.stringify(stored).includes(article.title));
  await page.goto(origin+'/#/settings');await page.getByRole('button',{name:'Clear all bookmarks and follows',exact:true}).click();await page.goto(origin+'/#/profile');await expect(panel.locator('.world-counts dd')).toHaveText(['0','0','0','0']);assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(legacy,[]);await context.close();
 }finally{await browser.close();}
}
await writeFile(new URL('live-browser.json',output),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS real follows, bookmarks, persistence, source expiry/offline behavior, clearing, locales and responsive layouts');
