import {chromium,webkit,expect} from '@playwright/test';import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const base=process.env.NOBI_NAV_PREVIEW||'http://127.0.0.1:5276/';const output=new URL('../docs/verification/navigation/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [engine,label,width]of [[webkit,'webkit-320',320],[webkit,'webkit-390',390],[chromium,'edge-390',390]]){
 const browser=await engine.launch(engine===chromium?{channel:'msedge'}:{});try{
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:\/\/(?:www\.)?github\.com\//.test(r.url()))external.push(r.url());});
 await page.addInitScript(()=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'})));
 await page.goto(base);const nav=page.locator('.main-nav');await expect(nav.locator('a:visible')).toHaveText(['⌂首页','▤资讯','⚑赛事','◎我的']);const measurements=[];
 for(const path of ['news','races','profile','','news']){
  await nav.locator(`a[href="#/${path}"]`).click();await expect(page).toHaveURL(base+'#/'+path);await expect(page.locator('main h1')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const metrics=await page.evaluate(()=>{const n=document.querySelector('.sidebar').getBoundingClientRect();return {innerWidth,clientWidth:document.documentElement.clientWidth,scale:visualViewport.scale,navWidth:n.width,navHeight:n.height,navBottom:n.bottom};});measurements.push(metrics);assert.equal(metrics.scale,1);assert.equal(metrics.innerWidth,width);assert.equal(metrics.navWidth,width);assert.equal(metrics.navHeight,64);assert.equal(metrics.navBottom,844);
 }
 await page.goto(base+'#/settings');await expect(page.locator('#locale')).toBeVisible();for(const selector of ['#locale','#theme'])assert.ok(Number.parseFloat(await page.locator(selector).evaluate(e=>getComputedStyle(e).fontSize))>=16);await page.locator('#locale').focus();await nav.locator('a[href="#/news"]').click();assert.notEqual(await page.evaluate(()=>document.activeElement?.tagName),'SELECT');
 await expect(page.locator('.latest-news-panel .button').first()).toBeVisible();const source=page.locator('.latest-news-panel .button').first();await expect(source).toHaveAttribute('href',/#\/sources/);await source.click();await expect(page).toHaveURL(/#\/sources/);await expect(page.locator('h1')).toHaveText('数据来源与许可');assert.equal(context.pages().length,1);
 for(const path of ['news','races','stats','profile','legal','sources','forum']){
  await page.goto(base+'#/'+path);await expect(page.locator('main h1')).toBeVisible();await page.waitForLoadState('networkidle');
  const bad=await page.locator('a[href]').evaluateAll(links=>links.filter(a=>['github.com','www.github.com','raw.githubusercontent.com'].includes(new URL(a.href).hostname)).map(a=>a.href));assert.deepEqual(bad,[],path+' leaks repository links');
 }
 await page.goto(base+'#/news');await expect(page.locator('.latest-headline').first()).toBeVisible();await page.locator('.latest-headline').first().click();await expect(page).toHaveURL(/#\/brief\?/);await expect(page.locator('h1')).not.toBeEmpty();assert.deepEqual(await page.locator('a[href]').evaluateAll(links=>links.filter(a=>new URL(a.href).hostname==='github.com').map(a=>a.href)),[]);
 await page.goto(base+'#/profile');await page.getByRole('link',{name:'数据 ↗',exact:true}).click();await expect(page).toHaveURL(/#\/stats/);await expect(nav.locator('a.mobile-selected:visible')).toHaveText('◎我的');
 await page.goto(base+'#/news');await page.screenshot({path:fileURLToPath(new URL(label+'-news.png',output)),fullPage:false});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);results.push({engine:label,width,passed:true,measurements,repositoryRequests:0});await context.close();console.log(label+' stable navigation and source audit passed');
 }finally{await browser.close();}
}
await writeFile(new URL(base.startsWith('http://127.0.0.1')?'local.json':'public.json',output),JSON.stringify({checkedAt:new Date().toISOString(),base,results},null,2)+'\n');
