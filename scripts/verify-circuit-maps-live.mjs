import {chromium,webkit} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const origin=process.env.NOBI_OPEN_PREVIEW||'http://127.0.0.1:5279';assert.match(origin,/^http:\/\/127\.0\.0\.1:[0-9]+$/);
const maps=JSON.parse(await readFile(new URL('../apps/fan/src/content/circuit-maps.json',import.meta.url),'utf8'));
const output=new URL('../docs/verification/circuit-maps/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [name,engine,viewport] of [['desktop',chromium,{width:1440,height:1000}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(name==='desktop'&&process.env.NOBI_BROWSER_CHANNEL?{channel:process.env.NOBI_BROWSER_CHANNEL}:{});
 try{
  const page=await browser.newPage({viewport});await page.addInitScript(()=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'})));
  const response=await page.request.get(origin+'/api/v1/weekends');assert.equal(response.status(),200);const calendar=await response.json();assert.equal(calendar.status,'ready');
  for(const weekend of calendar.items){assert.ok(maps[weekend.circuit],'Missing map: '+weekend.circuit);const asset=await page.request.get(origin+maps[weekend.circuit].src);assert.equal(asset.status(),200);assert.ok((await asset.text()).startsWith('<svg'));}
  const databaseRequests=[];page.on('request',request=>{if(/\/api\/v1\/(seasons|races|standings)/.test(request.url()))databaseRequests.push(request.url());});
  await page.goto(origin+'/#/races');const panel=page.getByTestId('weekend-calendar');await panel.locator('.circuit-map-preview img').first().waitFor();
  assert.equal(await page.locator('.mock-calendar').count(),0);assert.ok(!(await page.locator('main').innerText()).includes('开发样例赛历'));
  await panel.getByRole('button',{name:'全部周末',exact:true}).click();assert.equal(await panel.locator('.circuit-map-preview').count(),calendar.items.length);
  const missing=await panel.locator('.circuit-map-preview img').evaluateAll(images=>images.filter(image=>!image.getAttribute('src')?.startsWith('/media/circuits/')).length);assert.equal(missing,0);
  await panel.getByRole('button',{name:'本周及接下来',exact:true}).click();const preview=panel.locator('.circuit-map-preview').first();await preview.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.circuit-map-preview img')?.naturalWidth>0);await preview.click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();assert.ok((await dialog.innerText()).includes('罗德里格斯兄弟赛道'));
  await page.screenshot({path:fileURLToPath(new URL('enlarged-'+name+'.png',output))});await page.getByRole('button',{name:'关闭赛道地图'}).click();
  assert.equal(await dialog.isVisible(),false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL('races-'+name+'.png',output)),fullPage:true});
  await panel.getByRole('link',{name:'墨西哥城大奖赛 ↗',exact:true}).click();await page.waitForURL('**/#/weekends/1298');await page.locator('.circuit-map-preview img').waitFor();
  assert.equal(await page.locator('.circuit-map-preview img').getAttribute('src'),'/media/circuits/mexico-city-3.svg');assert.equal(databaseRequests.length,0);
  results.push({name,passed:true,weekends:calendar.items.length,mapsVerified:calendar.items.length,mockCalendarRemoved:true,databaseRequests:databaseRequests.length,source:'Real local API and locally served F1DB SVG assets; no API mocks'});
 }finally{await browser.close();}
}
await writeFile(new URL('live-browser.json',output),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS all real weekend maps, enlargement, details, responsive layout and removed mock calendar');
