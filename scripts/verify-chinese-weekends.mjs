import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const origin=process.env.NOBI_OPEN_PREVIEW||'http://127.0.0.1:5279';assert.match(origin,/^http:\/\/127\.0\.0\.1:[0-9]+$/);
const output=new URL('../docs/verification/chinese-weekends/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [name,engine,viewport] of [['desktop',chromium,{width:1440,height:1000}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(name==='desktop'&&process.env.NOBI_BROWSER_CHANNEL?{channel:process.env.NOBI_BROWSER_CHANNEL}:{});
 try{
  const page=await browser.newPage({viewport});await page.addInitScript(()=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'})));
  const news=await(await page.request.get(origin+'/api/v1/latest-news')).json();const calendar=await(await page.request.get(origin+'/api/v1/weekends')).json();
  assert.equal(news.status,'ready');assert.ok(news.items.every(item=>/machine|edited/.test(item.translationStatus)&&/[\u3400-\u9fff]/.test(item.titleZh)&&/[\u3400-\u9fff]/.test(item.summaryZh)));
  assert.equal(calendar.status,'ready');assert.ok(calendar.items.length>20);
  await page.goto(origin+'/#/news');await page.locator('.latest-headline').first().waitFor();
  assert.equal(await page.locator('.latest-headline').count(),news.items.length);assert.ok((await page.locator('.latest-headline').first().textContent()).includes(news.items[0].titleZh));
  assert.ok((await page.locator('.latest-summary').first().textContent()).includes(news.items[0].summaryZh));
  await page.getByRole('searchbox').first().fill('汉密尔顿');assert.ok(await page.locator('.latest-headline').count()>0);await page.getByRole('searchbox').first().fill('');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:fileURLToPath(new URL('news-'+name+'.png',output)),fullPage:true});
  await page.goto(origin+'/#/races');const panel=page.getByTestId('weekend-calendar');await panel.locator('.weekend-card').first().waitFor();
  await panel.getByRole('button',{name:'全部周末',exact:true}).click();assert.equal(await panel.locator('.weekend-card').count(),calendar.items.length);
  await panel.getByRole('button',{name:'本周及接下来',exact:true}).click();assert.ok((await panel.locator('.weekend-card').first().textContent()).includes('墨西哥城'));
  await panel.locator('.weekend-news a').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:fileURLToPath(new URL('weekends-'+name+'.png',output)),fullPage:true});
  await panel.getByRole('link',{name:'墨西哥城大奖赛 ↗',exact:true}).click();await page.waitForURL('**/#/weekends/1298');await page.locator('.weekend-schedule time').first().waitFor();
  await page.getByRole('button',{name:'赛道时间',exact:true}).click();assert.ok((await page.locator('.weekend-schedule time').last().textContent()).includes('14:00'));
  await page.screenshot({path:fileURLToPath(new URL('weekend-detail-'+name+'.png',output)),fullPage:true});
  results.push({name,passed:true,news:news.items.length,translated:news.items.filter(item=>item.titleZh).length,weekends:calendar.items.length,cancelled:calendar.items.filter(item=>item.cancelled).length,source:'Actual Java RSS + offline translations + OpenF1, no browser API mocks'});
 }finally{await browser.close();}
}
await writeFile(new URL('live-browser.json',output),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');console.log('PASS real Simplified Chinese news, summaries, weekend schedules, related coverage, details and track time on desktop/mobile');
