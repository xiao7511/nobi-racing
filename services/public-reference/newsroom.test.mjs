import {test} from 'node:test';import assert from 'node:assert/strict';import {zipSync,strToU8} from 'fflate';import {createHash} from 'node:crypto';import {mkdtemp} from 'node:fs/promises';import {tmpdir} from 'node:os';
import {parseRecord,metadataRecord,topicsFor,indexFile,readGkg,createNewsroom,createNewsroomEvents} from './newsroom.mjs';import {createHeadlineTranslator} from './newsroom-translation.mjs';
import {EventEmitter} from 'node:events';
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

test('GKG and discovery use the same source-language inference rather than sending Spanish titles to the English model',()=>{
 for(const [url,title,language]of [
  ['https://as.com/motor/f1/norris-hamilton/','F1 | Tercera seguida de Norris y doble sanción para Hamilton','es'],
  ['https://www.grandepremio.com.br/f1/noticias/hamilton/','F1: Hamilton recebe punição no Brasil','pt'],
  ['https://www.motorsport-total.com/formel-1/news/hamilton','F1: Hamilton in Brasilien bestraft','de'],
  ['https://www.gazzetta.it/Formula-1/hamilton.shtml','F1: Hamilton penalizzato in Brasile','it'],
 ]){
  const item=parseRecord(line(title,url),topics);assert.equal(item.originalLanguage,language);assert.equal(item.language,'en');
  assert.equal(metadataRecord({title,url,indexedAt:item.indexedAt},topics).originalLanguage,language);
  assert.equal(metadataRecord({title,url,indexedAt:item.indexedAt,originalLanguage:'ENGLISH'},topics).originalLanguage,'en','Explicit provider language remains authoritative');
 }
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

test('SSE backpressure coalesces updates until drain and request close clears listeners and heartbeat',context=>{
 const timers=new Set();let heartbeat,unrefs=0;
 context.mock.method(globalThis,'setInterval',(callback,delay)=>{assert.equal(delay,15000);heartbeat={callback,unref(){unrefs++;}};timers.add(heartbeat);return heartbeat;});
 context.mock.method(globalThis,'clearInterval',timer=>{timers.delete(timer);});
 let revision=0,accepting=false,ended=0;const writes=[],request=new EventEmitter(),response=new EventEmitter();
 response.writeHead=(status,headers)=>{assert.equal(status,200);assert.equal(headers['Content-Type'],'text/event-stream; charset=utf-8');};
 response.write=value=>{writes.push(value);return accepting;};response.end=()=>{ended++;};
 const events=createNewsroomEvents(()=>({revision})),event=value=>'event: newsroom\ndata: '+JSON.stringify({revision:value})+'\n\n';
 events.listen(request,response);assert.deepEqual(writes,[event(0)]);assert.equal(ended,0);assert.equal(unrefs,1);
 for(revision=1;revision<=100;revision++){events.publish();heartbeat.callback();}
 assert.equal(writes.length,1,'A blocked connection must not accumulate more writes or heartbeats');
 accepting=true;response.emit('drain');assert.deepEqual(writes,[event(0),event(100)]);assert.equal(ended,0);
 accepting=false;heartbeat.callback();assert.equal(writes.at(-1),': heartbeat\n\n');
 revision=101;events.publish();revision=102;events.publish();heartbeat.callback();assert.equal(writes.length,3);
 accepting=true;response.emit('drain');assert.equal(writes.at(-1),event(102));assert.equal(writes.length,4);
 accepting=false;revision=103;events.publish();revision=104;events.publish();const beforeClose=writes.length;
 request.emit('close');assert.equal(timers.size,0);assert.equal(request.listenerCount('close'),0);assert.equal(response.listenerCount('drain'),0);assert.equal(response.listenerCount('close'),0);assert.equal(response.listenerCount('error'),0);
 heartbeat.callback();response.emit('drain');events.publish();assert.equal(writes.length,beforeClose);assert.equal(ended,0);
});

test('SSE response close and write errors release the heartbeat and pending drain callback',context=>{
 const timers=new Set();
 context.mock.method(globalThis,'setInterval',callback=>{const timer={callback,unref(){}};timers.add(timer);return timer;});
 context.mock.method(globalThis,'clearInterval',timer=>{timers.delete(timer);});
 for(const failure of ['close','error','write']){
  const request=new EventEmitter(),response=new EventEmitter();response.writeHead=()=>{};response.end=()=>{};
  response.write=()=>{if(failure==='write')throw Error('closed socket');return false;};
  const events=createNewsroomEvents(()=>({status:'ready'}));events.listen(request,response);
  if(failure!=='write')response.emit(failure,...(failure==='error'?[Error('closed socket')]:[]));
  assert.equal(timers.size,0);assert.equal(request.listenerCount('close'),0);assert.equal(response.listenerCount('drain'),0);
  assert.equal(response.listenerCount('close'),0);assert.equal(response.listenerCount('error'),0);
 }
});
