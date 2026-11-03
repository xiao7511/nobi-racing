import {chromium,webkit,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const base=process.env.NOBI_NEWS_PREVIEW||'http://127.0.0.1:5276/';
const expect=baseExpect.configure({timeout:30000});
const output=new URL('../docs/verification/newsroom/',import.meta.url);await mkdir(output,{recursive:true});const results=[];
for(const [engine,label,width]of [[webkit,'webkit-320',320],[webkit,'webkit-390',390],[chromium,'edge-desktop',1440]]){
 const browser=await engine.launch(engine===chromium?{channel:'msedge'}:{});
 try{const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[],thirdParty=[],badLinks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/youtube|googlevideo|ytimg|google\.com/.test(new URL(r.url()).hostname))thirdParty.push(r.url());if(/github\.com/.test(new URL(r.url()).hostname))badLinks.push(r.url());});
 await page.addInitScript(()=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'})));
 await page.goto(base+'#/news');await page.locator('a[href="#/newsroom"]').first().click();await expect(page.locator('h1')).toHaveText('F1 新闻专栏');
 await expect(page.locator('.newsroom-card').first()).toBeVisible();assert.ok(await page.locator('.newsroom-card').count()>=1);
 const api=await page.evaluate(async root=>(await fetch(root+'api/v1/newsroom')).json(),base);assert.ok(api.items.length);assert.equal(api.source,'GDELT Project');assert.ok(api.items.every(i=>i.publishedAt===null&&i.url.startsWith('https://')));
 await expect(page.locator('.newsroom-card h2').first()).toContainText(/[\u3400-\u9fff]/);
 const category=page.getByLabel('分类',{exact:true}),subject=page.getByLabel('关注对象',{exact:true});
 for(const kind of ['driver','team','race']){await category.selectOption(kind);assert.ok(await page.locator('.newsroom-card').count()>0);}
 await category.selectOption('team');await subject.selectOption('team:ferrari');await expect(page.locator('.newsroom-card').first()).toContainText('法拉利');
 await page.getByLabel('搜索标题',{exact:true}).fill('no-match-unique-zxv');await expect(page.locator('.newsroom-card')).toHaveCount(0);await page.getByLabel('搜索标题',{exact:true}).fill('');await category.selectOption('all');
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const control of await page.locator('.newsroom-filters input,.newsroom-filters select').all())if(width<600)assert.ok(parseFloat(await control.evaluate(e=>getComputedStyle(e).fontSize))>=16);
 await page.locator('h1').focus();await page.screenshot({path:fileURLToPath(new URL(label+'-news.png',output)),fullPage:false});
 await page.getByRole('button',{name:'图片',exact:true}).click();await expect(page.locator('.newsroom-photo').first()).toBeVisible();await expect.poll(()=>page.locator('.newsroom-photo img').first().evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 assert.ok(await page.locator('.newsroom-photo').count()>=22);await expect(page.locator('.newsroom-photo figcaption').first()).toContainText(/2026/);await page.locator('.newsroom-photo').first().scrollIntoViewIfNeeded();await page.screenshot({path:fileURLToPath(new URL(label+'-photos.png',output)),fullPage:false});
 await page.getByRole('button',{name:'视频',exact:true}).click();await expect(page.locator('.newsroom-player')).toHaveCount(0);assert.deepEqual(thirdParty,[]);
 await page.getByRole('button',{name:'同意并加载官方播放器'}).click();await expect(page.locator('.newsroom-player')).toBeVisible();await expect(page.locator('.newsroom-player')).toHaveAttribute('src',/media\/news-player.html\?channel=formula1/);
 assert.ok(await page.locator('.newsroom-player').evaluate(e=>e.getBoundingClientRect().width)>=200);await expect(page.getByRole('link',{name:'在 YouTube 查看频道最新视频'})).toHaveAttribute('href','https://www.youtube.com/@Formula1/videos');
 await page.getByRole('button',{name:'关闭播放器'}).click();await expect(page.locator('.newsroom-player')).toHaveCount(0);await page.getByLabel('官方视频频道').selectOption('mercedes');await expect(page.getByRole('button',{name:'同意并加载官方播放器'})).toBeVisible();
 if(width<600){const nav=page.locator('.main-nav');assert.equal(await nav.locator('a:visible').count(),4);await nav.locator('a[href="#/races"]').click();await expect(page).toHaveURL(base+'#/races');await expect(page.locator('main h1')).toBeVisible({timeout:20000});await nav.locator('a[href="#/news"]').click();await expect(page).toHaveURL(base+'#/news');await expect(page.locator('main h1')).toHaveText('不止于头条。',{timeout:20000});const view=await page.evaluate(()=>({scale:visualViewport.scale,width:innerWidth,height:document.querySelector('.sidebar').getBoundingClientRect().height}));assert.deepEqual(view,{scale:1,width,height:64});}
 await page.goto(base+'#/legal');await expect(page.getByRole('heading',{name:'新闻专栏来源与媒体使用'})).toBeVisible({timeout:20000});
 const links=await page.locator('a[href]').evaluateAll(anchors=>anchors.filter(a=>/github\.com/.test(new URL(a.href).hostname)).map(a=>a.href));assert.deepEqual(links,[]);assert.deepEqual(badLinks,[]);assert.deepEqual(errors,[]);
 results.push({engine:label,width,newsItems:api.items.length,dynamicPhotos:api.photos?.items.length,passed:true,thirdPartyRequestsBeforeConsent:0,videoAvailability:'provider-controlled; official-channel fallback verified'});await context.close();console.log(label+' newsroom verified');
 }finally{await browser.close();}
}
await writeFile(new URL(base.startsWith('http://127.0.0.1')?'local.json':'public.json',output),JSON.stringify({checkedAt:new Date().toISOString(),base,results},null,2)+'\n');
