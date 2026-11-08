import assert from 'node:assert/strict';
import {chromium,webkit,expect as baseExpect} from '@playwright/test';
import {siteBase,checkMedia,chinese,officialPlayer} from './newsroom-checks.mjs';

const base=siteBase(process.env.NOBI_NEWSROOM_PREVIEW||process.env.NOBI_NEWS_PREVIEW||'http://127.0.0.1:5276/');
const expect=baseExpect.configure({timeout:30000}),results=[];
const scenarios=[[chromium,'chromium',1440],[webkit,'webkit',390]].filter(([,name])=>!process.env.NOBI_NEWSROOM_ENGINE||process.env.NOBI_NEWSROOM_ENGINE===name);
assert.ok(scenarios.length,'NOBI_NEWSROOM_ENGINE must be chromium or webkit');
for(const [engine,name,width] of scenarios){
 const browser=await engine.launch(engine===chromium?{channel:process.env.NOBI_NEWSROOM_BROWSER_CHANNEL||process.env.NOBI_BROWSER_CHANNEL||'msedge'}:{});
 try{
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('nobi-racing:preferences:v1',JSON.stringify({locale:'zh-CN',theme:'dark',timeZone:'Asia/Shanghai'})));
  const responsePromise=page.waitForResponse(response=>new URL(response.url()).pathname.endsWith('/api/v1/newsroom')&&response.status()===200);
  await page.goto(base+'#/newsroom');const feed=await(await responsePromise).json(),media=checkMedia(feed.media);
  await expect(page.locator('h1')).toHaveText('F1 新闻专栏');await expect(page.locator('.newsroom-index-card').first()).toBeVisible();
  const cards=await page.locator('.newsroom-index-card').evaluateAll(nodes=>nodes.map(node=>({title:node.querySelector('h2 a')?.textContent,href:node.querySelector('h2 a')?.getAttribute('href'),button:node.querySelector('a.button')?.getAttribute('href')})));
  assert.ok(cards.length,'There are no visible headlines to verify');
  for(const [index,card] of cards.entries()){assert.ok(chinese(card.title),'Chinese mode displayed an untranslated headline');assert.match(card.href||'',/^#\/newsroom\/[a-f0-9]{24}$/);assert.equal(card.button,card.href,'Every news card must expose both navigation actions');
   await page.locator(`.newsroom-index-card h2 a[href="${card.href}"]`).first().click();
   await expect(page).toHaveURL(base+card.href);await expect(page.locator('.newsroom-reader h1')).toBeVisible();assert.ok(chinese(await page.locator('.newsroom-reader h1').innerText()));await expect(page.locator('.newsroom-reader .prose p').first()).toBeVisible();assert.ok((await page.locator('.newsroom-reader .prose p').allTextContents()).every(chinese));assert.equal(context.pages().length,1);
   if(index===0){const titleZh=await page.locator('.newsroom-reader h1').innerText();await page.getByRole('combobox',{name:'语言',exact:true}).selectOption('en-US');await expect(page.locator('.newsroom-reader')).toHaveAttribute('lang','en-US');assert.ok(/[a-z]/i.test(await page.locator('.newsroom-reader .prose').innerText()));await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('zh-CN');await expect(page.locator('.newsroom-reader h1')).toHaveText(titleZh);await expect(page.locator('.newsroom-reader')).toHaveAttribute('lang','zh-CN');}
   await page.locator('.newsroom-reader > a.button').click();await expect(page).toHaveURL(base+'#/newsroom');await expect(page.locator('.newsroom-index-card').first()).toBeVisible();
  }
  await page.getByRole('button',{name:'图片',exact:true}).click();const photos=page.locator('.newsroom-live-media .newsroom-media-card');await expect(photos).toHaveCount(media.photos.length);let decodedPhotos=0;
  for(let i=0;i<media.photos.length;i++){const card=photos.nth(i),item=media.photos[i];assert.ok(chinese(await card.locator('h3').innerText()));await expect(card.locator('h3 a')).toHaveAttribute('href','#/newsroom/'+item.id);await expect(card.locator('.caption')).toContainText(item.publishedAt?'发布：':'来源更新：');if(item.imageUrl){const image=card.locator('img');await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);decodedPhotos++;}}
  assert.ok(decodedPhotos,'No current official photo actually decoded');
  await page.getByRole('button',{name:'视频',exact:true}).click();await expect(page.locator('iframe')).toHaveCount(0);const videos=page.locator('.newsroom-live-media .newsroom-media-card');await expect(videos).toHaveCount(media.videos.length);
  for(let i=0;i<media.videos.length;i++){assert.ok(chinese(await videos.nth(i).locator('h3').innerText()));await expect(videos.nth(i).locator('h3 a')).toHaveAttribute('href','#/newsroom/'+media.videos[i].id);}
  await videos.first().getByRole('button',{name:/^站内播放/}).click();const frame=page.locator('.newsroom-live-player iframe');await expect(frame).toHaveCount(1);officialPlayer(await frame.getAttribute('src'));
  await page.getByRole('button',{name:'关闭播放器',exact:true}).click();await expect(page.locator('iframe')).toHaveCount(0);await expect(page.locator('.newsroom-live-player')).toHaveCount(0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Newsroom overflows the viewport');assert.deepEqual(errors,[]);assert.equal(context.pages().length,1);
  results.push({engine:name,width,visibleNewsOpened:cards.length,decodedPhotos,officialVideos:media.videos.length,embeddedOnlyAfterClick:true,playerUnloadedOnClose:true,playbackVerified:false,translationsPending:feed.items.filter(item=>!item.titleZh&&item.language!=='zh').length});await context.close();
 }finally{await browser.close();}
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),base,results},null,2));
