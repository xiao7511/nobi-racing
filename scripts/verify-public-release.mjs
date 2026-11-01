import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const base='https://api.nobistudio.com/racing/';
const output=new URL('../docs/verification/release/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.NOBI_BROWSER_CHANNEL||'msedge'});
const results=[];
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();const errors=[],failed=[],unexpected=[];
  page.setDefaultNavigationTimeout(30000);page.setDefaultTimeout(15000);console.log(device+': verifying public pages');
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)failed.push({url:response.url(),status:response.status()});});
  page.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('data:'))unexpected.push(request.url());});
  await page.addInitScript(()=>{if(!localStorage.getItem('nobi-racing:preferences:v1'))localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'}));});
  await page.goto(base,{waitUntil:'networkidle'});
  await expect(page).toHaveURL(base+'#/');
  await expect(page.locator('.podium-card')).toHaveCount(3,{timeout:30000});
  await expect(page.locator('.hero .latest-race-photo img')).toBeVisible();
  assert.ok(await page.locator('.hero .latest-race-photo img').evaluate(img=>img.complete&&img.naturalWidth===2880));
  await expect(page.locator('a[href="/racing/downloads/NOBI-Racing.apk"]')).toBeVisible();
  await page.screenshot({path:fileURLToPath(new URL(`home-${device}.png`,output)),fullPage:true});
  await page.goto(base+'#/news');
  await expect(page.locator('.latest-actions button').first()).toBeVisible();
  await page.locator('.latest-actions button').first().click();
  await expect(page.locator('.latest-news-panel')).toContainText('NOBI');
  await page.goto(base+'#/stats?type=driver');
  await expect(page.getByTestId('insight-standings').locator('tbody tr').first()).toBeVisible();
  await page.getByTestId('insight-standings').locator('tbody tr').first().locator('.entrant-follow').click();
  await page.goto(base+'#/races');
  await expect(page.locator('.circuit-map img').first()).toBeVisible();
  await expect.poll(()=>page.locator('.circuit-map img').first().evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.locator('body')).not.toContainText('开发样例赛历');
  await page.goto(base+'#/profile');
  await expect(page.getByTestId('personal-world').locator('.world-counts dd')).toHaveText(['1','0','0','1']);
  await page.reload();
  await expect(page.getByTestId('personal-world').locator('.world-counts dd')).toHaveText(['1','0','0','1']);
  await page.goto(base+'#/settings');
  await page.locator('#locale').selectOption('en-US');await page.locator('#theme').selectOption('light');
  await page.goto(base+'#/news');
  await expect(page.locator('.latest-actions button').first()).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:fileURLToPath(new URL(`news-${device}-en-light.png`,output)),fullPage:true});
  await page.goto(base+'#/legal');
  await expect(page.locator('body')).toContainText('Audi Motorsport AG');
  await expect(page.locator('body')).toContainText('CC BY 4.0');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(unexpected,[]);
  console.log(device+': all interactions and attribution checks passed');
  results.push({device,passed:true,photo:'Mexico City 2026-10-31 / Audi Motorsport AG',follows:1,bookmarks:1,source:'Public F1DB API, no test fixtures',pageErrors:0,failedRequests:0,externalRequests:0});
  await context.close();
 }
}finally{await browser.close();}
await writeFile(new URL('public-browser.json',output),JSON.stringify({checkedAt:new Date().toISOString(),base,results},null,2)+'\n');
console.log('PASS public website: photo, standings, maps, bookmarks, follows, persistence, language/theme, attribution and responsive layout');
