import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const origin=process.env.NOBI_OPEN_PREVIEW||'http://127.0.0.1:5279';assert.match(origin,/^http:\/\/127\.0\.0\.1:[0-9]+$/);
const output=new URL('../docs/verification/season-insights/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [device,engine,viewport] of [['desktop',chromium,{width:1440,height:1000}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(device==='desktop'&&process.env.NOBI_BROWSER_CHANNEL?{channel:process.env.NOBI_BROWSER_CHANNEL}:{});
 try{
  for(const locale of ['zh-CN','en-US'])for(const theme of ['dark','light']){
   const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[],external=[],legacy=[];
   page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(origin+'/'))external.push(request.url());if(/\/api\/v1\/(seasons|standings)\?/.test(request.url()))legacy.push(request.url());});
   await page.addInitScript(preferences=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify(preferences)),{locale,theme,timeZone:'Asia/Shanghai'});
   const response=await page.request.get(origin+'/api/v1/season-insights');assert.equal(response.status(),200);const source=await response.json();assert.equal(source.status,'ready');assert.ok(source.rounds.length>1);
   for(const round of source.rounds)assert.ok(Date.parse(round.endsAt)+1800000<=Date.now());
   const latest=source.rounds.at(-1);await page.goto(origin+'/#/stats?type=driver');const table=page.getByTestId('insight-standings');await table.waitFor();
   assert.equal(await table.locator('tbody tr').count(),latest.drivers.length);assert.ok((await table.locator('tbody tr').first().innerText()).includes(latest.drivers[0].points));
   assert.ok(!(await page.locator('.preview-banner').innerText()).includes('MOCK'));assert.equal(await page.locator('.insight-trend path').count(),2);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:fileURLToPath(new URL(`${device}-${locale}-${theme}-drivers.png`,output)),fullPage:true});
   await page.locator('.insight-comparators select').nth(1).selectOption(latest.drivers.at(-1).id);assert.ok(!(await page.locator('.insight-trend').innerHTML()).includes('NaN'));
   await page.locator('.insight-select select').selectOption(String(source.rounds[0].id));assert.equal(await table.locator('tbody tr').count(),source.rounds[0].drivers.length);assert.equal(await page.locator('.insight-trend circle').count(),2);
   await page.locator('.insight-select select').selectOption('');await page.locator('.insight-controls .filter-group button').nth(1).click();assert.equal(await table.locator('tbody tr').count(),latest.teams.length);assert.ok((await table.locator('tbody tr').first().innerText()).includes(latest.teams[0].points));
   await page.locator('.insight-table-controls input').fill(latest.teams[0].name);assert.equal(await table.locator('tbody tr').count(),1);await page.locator('.insight-table-controls input').fill('');
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL(`${device}-${locale}-${theme}-teams.png`,output)),fullPage:true});
   if(locale==='zh-CN'&&theme==='dark'){await context.setOffline(true);assert.equal(await table.count(),0);await context.setOffline(false);await table.waitFor();}
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(legacy,[]);
   results.push({device,locale,theme,passed:true,rounds:source.rounds.length,drivers:latest.drivers.length,teams:latest.teams.length,lastCircuit:latest.circuit,externalRequests:0,syntheticRequests:0,source:'Real local API; no browser API replacements'});await context.close();
  }
 }finally{await browser.close();}
}
await writeFile(new URL('live-browser.json',output),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS real season standings, history, comparison, search, themes, locales and responsive layout');
