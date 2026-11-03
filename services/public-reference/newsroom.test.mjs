import {test} from 'node:test';import assert from 'node:assert/strict';import {zipSync,strToU8} from 'fflate';import {createHash} from 'node:crypto';import {mkdtemp} from 'node:fs/promises';import {tmpdir} from 'node:os';
import {parseRecord,topicsFor,indexFile,readGkg,createNewsroom} from './newsroom.mjs';import {createHeadlineTranslator} from './newsroom-translation.mjs';
import {photoMetadata} from './newsroom-photos.mjs';
const topics=topicsFor({'Lewis HAMILTON':'刘易斯·汉密尔顿','Ferrari':'法拉利'});
function line(title='F1: Lewis Hamilton and Ferrari at Mexico City Grand Prix',url='https://www.planetf1.com/news/test-story'){const fields=Array(27).fill('');fields[1]=new Date(Date.now()-3600000).toISOString().replace(/[-:TZ.]/g,'').slice(0,14);fields[4]=url;fields[26]='<PAGE_TITLE>'+title+'</PAGE_TITLE>';return fields.join('\t');}
test('news index distinguishes discovery time, rejects unrelated and unsafe metadata, and matches F1 topics',()=>{
 const item=parseRecord(line(),topics);assert.ok(item);assert.equal(item.publishedAt,null);assert.ok(item.topics.includes('team:ferrari'));assert.ok(item.topics.includes('driver:lewis-hamilton'));assert.ok(item.topics.includes('race:mexico'));
 for(const [title,url]of [['F1 betting odds','https://www.planetf1.com/news/x'],['MotoGP Grand Prix results','https://www.motorsport.com/news/x'],['F1 news','https://evil.example/x'],['F1 news','https://www.planetf1.com.evil.example/x'],['F1 news','javascript:alert(1)'],['F1 <script>news','https://www.planetf1.com/news/x']])assert.equal(parseRecord(line(title,url),topics),null);
});
test('manifest URLs are constrained and ZIP stream parsing verifies raw compressed bytes',async()=>{
 const bytes=zipSync({'20261103000000.gkg.csv':strToU8(line('F1 Ferrari &amp; Lewis Hamilton news')+'\n')});const md5=createHash('md5').update(bytes).digest('hex');const m=indexFile(`${bytes.length} ${md5} http://data.gdeltproject.org/gdeltv2/20261103000000.gkg.csv.zip`);assert.ok(m.url.startsWith('https:'));
 assert.throws(()=>indexFile(`${bytes.length} ${md5} http://evil.example/gdeltv2/20261103000000.gkg.csv.zip`));
 const result=await readGkg(new Response(bytes),topics);assert.equal(result.md5,md5);assert.equal(result.records.length,1);assert.equal(result.records[0].title,'F1 Ferrari & Lewis Hamilton news');
 await assert.rejects(readGkg(new Response(zipSync({'../../outside.csv':strToU8('x')})),topics));
});
test('reviewed Chinese headlines are tied to exact indexed titles and never require translation requests',async()=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-headlines-');const translate=await createHeadlineTranslator(directory);const items=[{title:'George Russell breaks silence after Kimi Antonelli seals F1 2026 title',language:'en'},{title:'20岁零68天！安东内利成为F1历史上最年轻世界冠军',language:'zh'}];await translate(items,false);assert.equal(items[0].translation,'edited');assert.match(items[0].titleZh,/拉塞尔/);assert.equal(items[1].titleZh,items[1].title);assert.equal(items[1].translationEn,'edited');assert.match(items[1].titleEn,/youngest world champion/);
});
test('photo ingestion requires a named F1 subject, explicit reusable license, attribution and trusted image hosts',()=>{
 const page={title:'File:2026 F1 Lewis Hamilton Ferrari.jpg',imageinfo:[{descriptionurl:'https://commons.wikimedia.org/wiki/File:2026_F1.jpg',thumburl:'https://upload.wikimedia.org/test.jpg',extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'},Artist:{value:'<a>Photographer</a>'},DateTimeOriginal:{value:'2026-03-01'}}}]};
 assert.equal(photoMetadata(page,topics).author,'Photographer');
 const noRights=structuredClone(page);noRights.imageinfo[0].extmetadata.LicenseShortName.value='All rights reserved';assert.equal(photoMetadata(noRights,topics),null);
 const unsafe=structuredClone(page);unsafe.imageinfo[0].thumburl='https://upload.wikimedia.org.evil.example/x';assert.equal(photoMetadata(unsafe,topics),null);
 const noCredit=structuredClone(page);noCredit.imageinfo[0].extmetadata.Artist.value='';assert.equal(photoMetadata(noCredit,topics),null);
});
test('missing source batches never receive a successful synchronization timestamp',async context=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-missing-news-');
 context.mock.method(globalThis,'fetch',async url=>String(url).endsWith('.txt')?new Response('100 0123456789abcdef0123456789abcdef https://data.gdeltproject.org/gdeltv2/20261103000000.gkg.csv.zip'):new Response('',{status:404}));
 const newsroom=await createNewsroom(directory,{});await newsroom.sync();assert.equal(newsroom.state().syncedAt,null);assert.equal(newsroom.state().status,'unavailable');assert.deepEqual(newsroom.state().items,[]);
});
