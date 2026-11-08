import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {createHeadlineTranslator} from './newsroom-translation.mjs';

const local='http://127.0.0.1:5291/translate';
const temporary=()=>mkdtemp(tmpdir()+'/nobi-news-translation-');
const headlines=count=>Array.from({length:count},(_,index)=>({title:`F1 breaking news number ${index}: the latest detailed development from the paddock`,language:'en'}));

test('local translation clears more than four titles and the 4000 character fallback quota in bounded batches',async()=>{
 const directory=await temporary(),batches=[];
 const translate=await createHeadlineTranslator(directory,{}, {endpoint:local,fetchImpl:async(url,request)=>{
  assert.equal(url,local);const body=JSON.parse(request.body);assert.equal(body.source,'en');assert.equal(body.target,'zh-CN');batches.push(body.texts.length);
  return Response.json({translations:body.texts.map(text=>'中文新闻：'+text.match(/number (\d+)/)[1])});
 }});
 const items=headlines(85);await translate(items);assert.deepEqual(batches,[40,40,5]);assert.ok(items.every(item=>item.titleZh?.startsWith('中文新闻：')&&item.translation==='machine'&&item.translationProvider==='local'));
 assert.equal(JSON.parse(await readFile(directory+'/headline-translations.json','utf8')).used,0);
 await translate(headlines(85));assert.deepEqual(batches,[40,40,5]);
 const cached=await createHeadlineTranslator(directory,{}, {endpoint:local,fetchImpl:()=>{throw Error('A cached reader translation must not use the network');}});
 assert.equal(await cached.text(items[0].title),'中文新闻：0');
});

test('traditional Chinese normalization uses OpenCC mode, never the English model',async()=>{
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async(url,request)=>{
  const body=JSON.parse(request.body);if(url!==local)return Response.json({responseStatus:403});
  assert.equal(body.source,'zh');assert.equal(body.target,'zh-CN');return Response.json({translations:body.texts.map(()=> '车队夺得世界冠军')});
 }});
 const [item]=await translate([{title:'車隊奪得世界冠軍',language:'zh'}]);assert.equal(item.titleZh,'车队夺得世界冠军');assert.equal(item.translation,'original');
 assert.equal(await translate.text('車隊奪得世界冠軍',{source:'zh'}),'车队夺得世界冠军');
});

test('low CPU deployment uses a validated smaller batch without truncating the title queue',async()=>{
 const previous=process.env.NEWS_TRANSLATION_BATCH_SIZE,batches=[];
 try{
  process.env.NEWS_TRANSLATION_BATCH_SIZE='10';
  const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async(_url,request)=>{const texts=JSON.parse(request.body).texts;batches.push(texts.length);return Response.json({translations:texts.map(()=> '已完成中文新闻翻译')});}});
  const items=headlines(23);await translate(items);assert.deepEqual(batches,[10,10,3]);assert.ok(items.every(item=>item.titleZh==='已完成中文新闻翻译'));
  for(const batchSize of [0,41,1.5,'invalid'])await assert.rejects(createHeadlineTranslator(await temporary(),{}, {batchSize}),/integer from 1 to 40/);
 }finally{if(previous===undefined)delete process.env.NEWS_TRANSLATION_BATCH_SIZE;else process.env.NEWS_TRANSLATION_BATCH_SIZE=previous;}
});

test('translation batches bound aggregate characters while preserving a single long public summary',async()=>{
 const batches=[];
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,batchSize:5,batchCharacters:1200,fetchImpl:async(_url,request)=>{const texts=JSON.parse(request.body).texts;batches.push(texts.map(text=>text.length));return Response.json({translations:texts.map(()=> '公开新闻摘要的中文译文')});}});
 const items=[600,600,1200,700].map((size,index)=>({title:('F1 report '+index+' ').padEnd(size,'a'),language:'en'}));
 await translate(items);assert.deepEqual(batches,[[600,600],[1200],[700]]);assert.ok(items.every(item=>item.titleZh==='公开新闻摘要的中文译文'));
 for(const batchCharacters of [1199,48001,1.5,'invalid'])await assert.rejects(createHeadlineTranslator(await temporary(),{}, {batchCharacters}),/integer from 1200 to 48000/);
});

test('unavailable local provider opens a circuit, finishes unavailable and retries after recovery',async()=>{
 let time=100000,localCalls=0,available=false;
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,now:()=>time,fetchImpl:async(url,request)=>{
  if(url!==local)return Response.json({responseStatus:403,responseData:{translatedText:'MYMEMORY WARNING: quota'}});
  localCalls++;if(!available)throw Error('offline');return Response.json({translations:JSON.parse(request.body).texts.map(()=> '恢复后的中文新闻')});
 }});
 const items=headlines(12);await translate(items);assert.equal(localCalls,1);assert.ok(items.every(item=>item.titleZh===null&&item.translation==='unavailable'));
 assert.equal(await translate.text('F1 another update'),null);assert.equal(localCalls,1);
 available=true;time+=61000;await translate(items);assert.equal(localCalls,2);assert.ok(items.every(item=>item.titleZh==='恢复后的中文新闻'));
});

test('malformed machine output is rejected, concurrent reader requests share a serialized persistent cache',async()=>{
 let calls=0;
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async(url,request)=>{
  if(url!==local)return Response.json({responseStatus:403});calls++;const texts=JSON.parse(request.body).texts;
  return Response.json({translations:texts.map(text=>text==='F1 unsafe output'?'<script>中文</script>':'最新中文消息')});
 }});
 assert.equal(await translate.text('F1 unsafe output'),null);
 const result=await Promise.all([translate.text('F1 safe update'),translate.text('F1 safe update')]);assert.deepEqual(result,['最新中文消息','最新中文消息']);assert.equal(calls,2);
});

test('residual English, overlong card titles and obsolete local machine cache do not count as Chinese translations',async()=>{
 const directory=await temporary(),title='F1 latest quality probe',key=createHash('sha256').update('v4:en:zh-CN:'+title).digest('hex');
 await writeFile(directory+'/headline-translations.json',JSON.stringify({day:new Date().toISOString().slice(0,10),used:4000,values:{[key]:'质量不足的旧中文缓存'},providers:{[key]:'local'}}));
 const translate=await createHeadlineTranslator(directory,{}, {endpoint:local,fetchImpl:async()=>Response.json({translations:['中文 English leftover']})});
 const [item]=await translate([{title,language:'en'}]);assert.equal(item.titleZh,null);assert.equal(item.translation,'unavailable');
 const long=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async()=>Response.json({translations:['中'.repeat(701)]})});
 const [oversized]=await long([{title:'F1 short title',language:'en'}]);assert.equal(oversized.titleZh,null);assert.equal(oversized.translation,'unavailable');
});

test('reader requests take priority between background batches while completed headlines publish and persist immediately',{timeout:5000},async()=>{
 const directory=await temporary(),calls=[],progress=[];let active=0,maximum=0,finished=false;
 let releaseFirst,releaseSecond,startedFirst,startedSecond;
 const first=new Promise(resolve=>{releaseFirst=resolve;}),second=new Promise(resolve=>{releaseSecond=resolve;});
 const firstStarted=new Promise(resolve=>{startedFirst=resolve;}),secondStarted=new Promise(resolve=>{startedSecond=resolve;});
 const translate=await createHeadlineTranslator(directory,{}, {endpoint:local,batchSize:2,onProgress:async items=>{
  const saved=JSON.parse(await readFile(directory+'/headline-translations.json','utf8'));
  progress.push({completed:items.filter(item=>item.translation==='machine').length,persisted:Object.keys(saved.values).length});
 },fetchImpl:async(url,request)=>{
  assert.equal(url,local);const texts=JSON.parse(request.body).texts;calls.push(texts);active++;maximum=Math.max(maximum,active);
  try{
   if(texts[0].includes('number 0:')){startedFirst();await first;}
   if(texts[0].includes('number 2:')){startedSecond();await second;}
   return Response.json({translations:texts.map(text=>text==='F1 reader priority request'?'读者优先请求的中文译文':'后台中文新闻：'+text.match(/number (\d+)/)[1])});
  }finally{active--;}
 }});
 const items=headlines(6),bulk=translate(items).then(()=>{finished=true;});
 try{
  await firstStarted;const reader=translate.text('F1 reader priority request');releaseFirst();
  assert.equal(await reader,'读者优先请求的中文译文');await secondStarted;
  assert.equal(calls[1][0],'F1 reader priority request');assert.equal(maximum,1);assert.equal(finished,false);
  assert.ok(progress.some(value=>value.completed===2&&value.persisted>=2));
  assert.ok(items.slice(0,2).every(item=>item.titleZh&&item.translation==='machine'));
  assert.ok(items.slice(2).every(item=>item.titleZh===null&&item.translation==='pending'));
  const saved=JSON.parse(await readFile(directory+'/headline-translations.json','utf8'));
  assert.equal(Object.keys(saved.values).length,3);
 }finally{releaseFirst();releaseSecond();await bulk;}
 assert.ok(items.every(item=>item.translation==='machine'));assert.equal(maximum,1);
});

test('concurrent readers and headline progress serialize atomic cache writes without losing translations',async()=>{
 const directory=await temporary();let active=0,maximum=0;
 const translate=await createHeadlineTranslator(directory,{}, {endpoint:local,batchSize:1,fetchImpl:async(_url,request)=>{
  active++;maximum=Math.max(maximum,active);await new Promise(resolve=>setImmediate(resolve));active--;
  return Response.json({translations:JSON.parse(request.body).texts.map(()=> '持久保存的中文译文')});
 }});
 await Promise.all([translate(headlines(8)),...Array.from({length:12},(_,index)=>translate.text('F1 reader request '+index))]);
 const saved=JSON.parse(await readFile(directory+'/headline-translations.json','utf8'));
 assert.equal(maximum,1);assert.equal(saved.version,5);assert.equal(Object.keys(saved.values).length,20);
 const cached=await createHeadlineTranslator(directory,{}, {endpoint:local,fetchImpl:()=>{throw Error('Persisted translations must survive a restart');}});
 assert.equal(await cached.text('F1 reader request 11'),'持久保存的中文译文');
});

test('a failed refresh preserves usable headline translations when their cache entry has expired',async()=>{
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async()=>{throw Error('offline');}});
 const item={...headlines(1)[0],titleZh:'已经完成的中文标题',translation:'machine',translationProvider:'local'};
 await translate([item]);assert.equal(item.titleZh,'已经完成的中文标题');assert.equal(item.translation,'machine');
 assert.equal(await translate.text(item.title,{allowRequests:false}),item.titleZh);
});

test('cache-only headline hydration completes while a background provider batch is still running',{timeout:5000},async()=>{
 let release,started;const waiting=new Promise(resolve=>{release=resolve;}),running=new Promise(resolve=>{started=resolve;});let calls=0;
 const translate=await createHeadlineTranslator(await temporary(),{}, {endpoint:local,fetchImpl:async(_url,request)=>{
  calls++;const texts=JSON.parse(request.body).texts;
  if(texts[0]!=='F1 cached translation'){started();await waiting;}
  return Response.json({translations:texts.map(()=> '缓存命中的中文标题')});
 }});
 await translate.text('F1 cached translation');const bulk=translate(headlines(2));
 try{
  await running;const items=[{title:'F1 cached translation',language:'en'}],hydrated=translate(items,false);
  assert.equal(items[0].titleZh,'缓存命中的中文标题');await hydrated;assert.equal(calls,2);
 }finally{release();await bulk;}
});

test('finished rejected translations publish unavailable after pending progress and an exhausted daily quota',async()=>{
 const directory=await temporary(),statuses=[];
 await writeFile(directory+'/headline-translations.json',JSON.stringify({version:5,day:new Date().toISOString().slice(0,10),used:4000,values:{},providers:{}}));
 const translate=await createHeadlineTranslator(directory,{}, {endpoint:local,onProgress:items=>{statuses.push(items[0].translation);},fetchImpl:async url=>{
  assert.equal(url,local,'An exhausted public quota must not be retried');
  return Response.json({translations:['中文 incomplete translation']});
 }});
 const [item]=await translate(headlines(1));assert.equal(item.titleZh,null);assert.equal(item.translation,'unavailable');
 assert.equal(statuses[0],'pending');assert.equal(statuses.at(-1),'unavailable');
});
