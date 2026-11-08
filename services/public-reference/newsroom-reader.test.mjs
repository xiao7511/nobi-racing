import {test} from 'node:test';import assert from 'node:assert/strict';
import {originalArticles,indexedArticle,hasReviewedBody,reviewedArticle,articleSummary,createArticleReader} from './newsroom-reader.mjs';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
test('bilingual in-app reports retain data attribution and distinguish cumulative standings from race classifications',()=>{
 const data={news:[{title:'Test Grand Prix: Driver wins',titleZh:'测试大奖赛：车手夺冠',summary:'A source classification.',summaryZh:'公开赛果摘要。',url:'https://github.com/f1db/f1db/blob/main/race-results.yml',publishedAt:'2026-03-01T10:00:00Z'}],weekends:[{id:1,name:'Test Grand Prix',nameZh:'测试大奖赛'}],rounds:[{meetingId:1,drivers:[{position:1,name:'Driver',team:'Team',points:'25'}],teams:[{position:1,name:'Team',points:'40'}]}]};
 const [article]=originalArticles(data,{Driver:'车手',Team:'车队'});assert.match(article.id,/^nobi-[a-f0-9]{24}$/);assert.equal(article.kind,'original');assert.equal(article.paragraphsZh[0],'公开赛果摘要。');assert.match(article.paragraphsEn[2],/season totals/);assert.match(article.sections[0].rows[0].zh,/25 分/);assert.equal(originalArticles(data)[0].id,article.id);assert.equal(originalArticles(null).length,0);
});
test('every reviewed live headline has a specific bilingual body and a durable reader id',()=>{
 const briefs=JSON.parse(readFileSync(new URL('./newsroom-briefs.json',import.meta.url),'utf8'));
 for(const brief of briefs)for(const url of brief.urls){
  assert.equal(hasReviewedBody(url),true);const id=createHash('sha256').update(url).digest('hex').slice(0,24);
  const article=reviewedArticle(id,null,{});assert.ok(article);assert.equal(article.kind,'original');assert.equal(article.format,'news-brief');assert.ok(article.paragraphsZh.length>=2&&article.paragraphsEn.length>=2);assert.ok(article.paragraphsZh.every(p=>p.length>20));assert.equal(article.sourceUrl,brief.reference);assert.equal(article.indexedAt,brief.indexedDates[url]);assert.match(article.noticeZh,/简报|核验/);
 }
 assert.equal(hasReviewedBody('https://unknown.example/new-report'),false);assert.equal(reviewedArticle('0'.repeat(24),null,{}),null);
});
test('unlicensed indexed reports never masquerade as the original article or a full translation',()=>{
 const item={id:'a'.repeat(24),title:'F1 news',titleZh:'F1 动态',language:'en',topics:[],publisher:'www.formula1.com',url:'https://www.formula1.com/en/latest',indexedAt:'2026-11-03T01:00:00Z'};
 const article=indexedArticle(item,{topics:[]},null);assert.equal(article.kind,'index-note');assert.equal(article.publishedAt,null);assert.match(article.noticeZh,/不是原文全文/);assert.match(article.paragraphsEn[1],/does not invent/);assert.deepEqual(article.sections,[]);assert.equal(indexedArticle(null,{topics:[]},null),null);
});

const discovered={id:'a'.repeat(24),title:'F1 latest title',language:'en',topics:[],publisher:'www.formula1.com',url:'https://www.formula1.com/en/latest/article/update',indexedAt:'2026-11-08T01:00:00Z'};
const allowed=value=>{try{const url=new URL(value);return url.origin==='https://www.formula1.com'?url.href:null;}catch{return null;}};
const description='The team has announced a new development ahead of the next Formula 1 race weekend.';

test('public metadata reader selects and decodes a description without extracting article bodies or scripts',()=>{
 assert.equal(articleSummary(`<html><head><meta content="${description.replace('team','team &amp; drivers')}" property="og:description"></head><body>SECRET ARTICLE BODY</body></html>`),description.replace('team','team & drivers'));
 assert.equal(articleSummary('<head></head><body><meta name="description" content="'+description+'"></body>'),null);
 assert.equal(articleSummary('<head><meta property="og:description" content="Please enable JavaScript and verify you are human to access the requested content."></head>'),null);
 assert.equal(articleSummary('<meta name="description" content="Too short">'),null);
});

test('every discovered article opens in-app with a real translated public summary and preserves source attribution',async()=>{
 let fetches=0;const requests=[];
 const reader=createArticleReader({validateUrl:allowed,translateText:async(value,options)=>{requests.push({value,...options});return value===discovered.title?'F1 最新动态':'车队已宣布新进展，为下一个一级方程式比赛周末做好准备。';},fetchImpl:async()=>{fetches++;return new Response('<head><meta name="description" content="'+description+'"></head><body>Do not republish this body.</body>',{headers:{'Content-Type':'text/html; charset=utf-8'}});}});
 const article=await reader(discovered,{topics:[]},null);assert.equal(article.titleZh,'F1 最新动态');assert.equal(article.detailStatus,'summary');assert.equal(article.translationStatus,'ready');assert.equal(article.summaryProvider,'publisher-metadata');assert.match(article.paragraphsZh[0],/车队已宣布/);assert.equal(article.paragraphsEn[0],description);assert.match(article.noticeZh,/机器翻译/);assert.equal(article.sourceUrl,discovered.url);assert.ok(!JSON.stringify(article).includes('Do not republish'));
 await reader(discovered,{topics:[]},null);assert.equal(fetches,1);assert.ok(requests.every(request=>request.source==='en'&&request.target==='zh-CN'));
});

test('source redirect allowlist and failed translation produce a Chinese index note without leaking English into Chinese content',async()=>{
 const urls=[];const reader=createArticleReader({validateUrl:allowed,translateText:async()=>null,fetchImpl:async url=>{urls.push(url);return new Response('',{status:302,headers:{Location:'http://127.0.0.1/private'}});}});
 const article=await reader(discovered,{topics:[]},null);assert.deepEqual(urls,[discovered.url]);assert.equal(article.detailStatus,'index-only');assert.equal(article.translationStatus,'unavailable');assert.match(article.titleZh,/中文译文暂不可用/);assert.ok(!article.paragraphsZh.join('').includes(discovered.title));assert.equal(article.originalTitle,discovered.title);
 await reader(discovered,{topics:[]},null);assert.equal(urls.length,1);
});

test('reader caches only source metadata, so changed headlines and recovered translation appear immediately',async()=>{
 let available=false,fetches=0;
 const reader=createArticleReader({validateUrl:allowed,translateText:async()=>available?'完整的中文摘要已恢复':null,fetchImpl:async()=>{fetches++;return new Response('<meta property="og:description" content="'+description+'">',{headers:{'Content-Type':'text/html'}});}});
 const first=await reader(discovered,{topics:[]},null);assert.equal(first.translationStatus,'unavailable');assert.ok(!first.paragraphsZh.join('').includes(description));
 available=true;const second=await reader(discovered,{topics:[]},null);assert.equal(second.translationStatus,'ready');assert.equal(second.titleZh,'完整的中文摘要已恢复');assert.equal(fetches,1);
 const changed=await reader({...discovered,title:'F1 changed title'},{topics:[]},null);assert.equal(changed.translationStatus,'ready');assert.equal(changed.title,'F1 changed title');assert.equal(fetches,1);
});

test('a busy background translator cannot block reader navigation; the deduplicated job completes for a later retry',async()=>{
 let finish,translations=0,fetches=0;
 const waiting=new Promise(resolve=>{finish=resolve;});
 const reader=createArticleReader({timeoutMs:20,validateUrl:allowed,translateText:async()=>{translations++;await waiting;return '排队完成后的中文新闻';},fetchImpl:async()=>{fetches++;return new Response('<meta property="og:description" content="'+description+'">',{headers:{'Content-Type':'text/html'}});}});
 const before=Date.now();const first=await reader(discovered,{topics:[]},null);assert.ok(Date.now()-before<500);assert.equal(first.translationStatus,'pending');assert.match(first.titleZh,/中文译文准备中/);
 const second=await reader(discovered,{topics:[]},null);assert.equal(second.translationStatus,'pending');assert.equal(fetches,1);assert.equal(translations,1);
 finish();await new Promise(resolve=>setImmediate(resolve));const third=await reader(discovered,{topics:[]},null);assert.equal(third.translationStatus,'ready');assert.equal(third.titleZh,'排队完成后的中文新闻');assert.equal(fetches,1);assert.equal(translations,2);
});

test('trusted official media descriptions open immediately without another publisher request or translation queue',async()=>{
 const reader=createArticleReader({validateUrl:allowed,translateText:()=>{throw Error('Already translated official summary must not queue translation');},fetchImpl:()=>{throw Error('Known official summary must not refetch its article');}});
 const article=await reader({...discovered,titleZh:'官方图片新闻标题',description,descriptionZh:'官方图片新闻的完整中文摘要。'},{topics:[]},null);
 assert.equal(article.translationStatus,'ready');assert.equal(article.detailStatus,'summary');assert.equal(article.paragraphsZh[0],'官方图片新闻的完整中文摘要。');assert.equal(article.paragraphsEn[0],description);
});

test('reader deadline stays pending, a finished rejection becomes unavailable, and an explicit retry can recover',async()=>{
 let finish,available=false,fetches=0;const waiting=new Promise(resolve=>{finish=resolve;});
 const reader=createArticleReader({timeoutMs:20,validateUrl:allowed,translateText:async()=>{await waiting;return available?'恢复后的中文新闻内容':null;},fetchImpl:async()=>{
  fetches++;return new Response('<meta name="description" content="'+description+'">',{headers:{'Content-Type':'text/html'}});
 }});
 const loading=await reader(discovered,{topics:[]},null);assert.equal(loading.translationStatus,'pending');
 finish();await new Promise(resolve=>setImmediate(resolve));
 const failed=await reader(discovered,{topics:[]},null);assert.equal(failed.translationStatus,'unavailable');assert.match(failed.titleZh,/暂不可用/);assert.match(failed.paragraphsZh[0],/暂不可用/);
 available=true;const recovered=await reader(discovered,{topics:[]},null);assert.equal(recovered.translationStatus,'ready');assert.equal(recovered.titleZh,'恢复后的中文新闻内容');assert.equal(fetches,1);
});
