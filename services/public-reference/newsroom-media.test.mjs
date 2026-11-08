import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createNewsMedia,officialMediaRecords,MEDIA_INTERVAL} from './newsroom-media.mjs';

const NOW=Date.parse('2026-11-08T08:00:00Z'),date='2026-11-07T21:12:36.373Z';
const html=value=>'<script>self.__next_f.push('+JSON.stringify([1,'a:'+JSON.stringify(value)+'\n'])+')</script>';
const video=()=>({videoId:'1881235230803014139',caption:'Qualifying Highlights: 2026 Sao Paulo Grand Prix',description:'Watch highlights from Qualifying ahead of the 2026 Formula 1 Sao Paulo Grand Prix.',publishedAt:date,videoDuration:'7:52',thumbnail:{url:'https://d2n9h2wits23hf.cloudfront.net/image/v1/static/6057949432001/test/640x360/match/image.jpg'},url:'/en/video/qualifying-highlights-2026-sao-paulo-grand-prix.1881235230803014139',sensitive:false,isProtected:false});
const photo=()=>({id:'43LN93l0g5l5n6VMNHSV7F',title:'Camara disappointed after crash in debut Qualifying',slug:'camara-disappointed-after-crashing-in-debut-qualifying-session-at-interlagos',articleType:'News',updatedAt:date,metaDescription:'Rafael Camara was disappointed after crashing in his debut Qualifying session ahead of the Sao Paulo Grand Prix.',thumbnail:{caption:'Rafael Camara at Interlagos. (Photo by Alex Pantling/Getty Images)',image:{url:'https://media.formula1.com/image/upload/t_16by9Centre/f_auto/q_auto/v1794082586/trackside-images/2026/test.jpg'}},isProtected:false,isExclusiveArticle:false});

test('official streamed metadata yields linked photo news and official player embeds with truthful dates',()=>{
 const v=video(),older={...v,videoId:'1881218274686428941',publishedAt:'2026-11-06T21:12:36.373Z',url:'/en/video/older.1881218274686428941'};
 const videos=officialMediaRecords(html(['$','component',null,{videos:[older,v,v]}]),'video',NOW);
 assert.equal(videos.length,2);assert.equal(videos[0].title,v.caption);assert.equal(videos[0].publishedAt,date);assert.equal(videos[0].titleZh,null);
 assert.equal(videos[0].embedUrl,'https://players.brightcove.net/6057949432001/FC1Xxg8gIw_default/index.html?videoId=1881235230803014139&autoplay=false&playsinline=true');
 assert.match(videos[0].id,/^[a-f0-9]{24}$/);
 const [p]=officialMediaRecords(html({items:[photo()]}),'photo',NOW);assert.equal(p.publishedAt,null);assert.equal(p.updatedAt,date);assert.equal(p.credit,'Alex Pantling/Getty Images');assert.match(p.url,/^https:\/\/www.formula1.com\/en\/latest\/article\//);
});

test('byte-counted Flight text records cannot swallow the following video index',()=>{
 const title='最新视频：Qualifying Highlights',raw='图片地址 https://example.com/very-long-path';
 const stream='1:T'+Buffer.byteLength(raw).toString(16)+','+raw+'2:T'+Buffer.byteLength(title).toString(16)+','+title+'3:'+JSON.stringify({videos:[{...video(),caption:'$2'}]})+'\n';
 const page='<script>self.__next_f.push('+JSON.stringify([1,stream.slice(0,33)])+')</script><script>self.__next_f.push('+JSON.stringify([1,stream.slice(33)])+')</script>';
 const items=officialMediaRecords(page,'video',NOW);assert.equal(items.length,1);assert.equal(items[0].title,title);
});

test('official media excludes protected, stale, malformed and untrusted embedded content',()=>{
 for(const update of [{isProtected:true},{sensitive:true},{publishedAt:'2025-11-01T00:00:00Z'},{publishedAt:'2026-12-01T00:00:00Z'},{url:'https://www.formula1.com.evil.example/en/video/x.1881235230803014139'},{url:'javascript:alert(1)'},{caption:'<script>bad</script>'},{videoId:'evil-id'},{thumbnail:{url:'https://d2n9h2wits23hf.cloudfront.net.evil.example/test.jpg'}},{thumbnail:{url:'https://user:secret@media.formula1.com/test.jpg'}},{thumbnail:{url:'https://media.formula1.com/test.jpg?token=unexpected'}}]){
  assert.deepEqual(officialMediaRecords(html({...video(),...update}),'video',NOW),[]);
 }
 assert.deepEqual(officialMediaRecords(html({...photo(),isExclusiveArticle:true}),'photo',NOW),[]);
 assert.deepEqual(officialMediaRecords('<script>globalThis.compromised=true</script>','video',NOW),[]);
 assert.equal(globalThis.compromised,undefined);
 assert.throws(()=>officialMediaRecords('x'.repeat(2000001),'video',NOW));
});

test('media sync translates titles and summaries, pushes updates, persists, and exposes every item to the Chinese reader',async()=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-official-media-'),requested=[];let updates=0;
 const fetchImpl=async(url,init)=>{requested.push(url);assert.equal(init.redirect,'error');return new Response(html(url.endsWith('/video')?{videos:[video()]}:{items:[photo()]}));};
 const translate=async items=>{for(const item of items){item.titleZh='已翻译：'+item.title;item.translation='machine';}};
 const media=await createNewsMedia(directory,translate,{now:()=>NOW,fetchImpl});assert.equal(media.state().syncedAt,null);
 await media.sync(()=>updates++);const state=media.state();assert.equal(state.status,'ready');assert.equal(updates,3);assert.equal(state.checkIntervalSeconds,600);assert.equal(requested.length,2);
 assert.match(state.photos[0].titleZh,/已翻译/);assert.match(state.photos[0].summaryZh,/已翻译/);
 const item=media.readerItem(state.photos[0].id);assert.equal(item.publisher,'www.formula1.com');assert.equal(item.descriptionZh,state.photos[0].summaryZh);assert.deepEqual(item.topics,[]);assert.equal(item.bodyAvailable,true);
 assert.equal(media.readerItem('f'.repeat(24)),null);
 await media.sync();assert.equal(requested.length,2,'scheduled checks respect interval');
 const saved=JSON.parse(await readFile(directory+'/newsroom-official-media.json','utf8'));assert.equal(saved.photos[0].id,state.photos[0].id);
 const restarted=await createNewsMedia(directory,translate,{now:()=>NOW,fetchImpl});assert.equal(restarted.state().photos[0].titleZh,state.photos[0].titleZh);
});

test('fresh photos and videos publish before a busy translator, and cached Chinese survives provider failures',async()=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-media-publish-');let release,now=NOW,requested=0,updates=0;
 const blocked=new Promise(resolve=>{release=resolve;});
 const translator=async items=>{await blocked;for(const item of items)item.titleZh='中文报道';};
 const fetchImpl=async url=>{requested++;return new Response(html(url.endsWith('/video')?{videos:[video()]}:{items:[photo()]}));};
 const media=await createNewsMedia(directory,translator,{now:()=>now,fetchImpl});const syncing=media.sync(()=>updates++);
 while(requested<2||updates<2)await new Promise(resolve=>setTimeout(resolve,1));
 assert.equal(media.state().photos.length,1);assert.equal(media.state().videos.length,1);assert.equal(media.state().syncedAt,new Date(NOW).toISOString());
 release();await syncing;assert.equal(media.state().photos[0].titleZh,'中文报道');
 now+=MEDIA_INTERVAL;
 const restarted=await createNewsMedia(directory,async items=>{for(const item of items)item.titleZh=null;throw Error('Translation offline');},{now:()=>now,fetchImpl});
 await restarted.sync();assert.equal(restarted.state().photos[0].titleZh,'中文报道');assert.equal(restarted.state().photos[0].summaryZh,'中文报道');assert.equal(restarted.state().status,'ready');
});

test('failed channels retain last good content and never receive fabricated success dates',async()=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-partial-media-');let failPhotos=true,now=NOW;
 const fetchImpl=async url=>url.endsWith('/latest')&&failPhotos?new Response('',{status:503}):new Response(html(url.endsWith('/video')?{videos:[video()]}:{items:[photo()]}));
 const media=await createNewsMedia(directory,undefined,{now:()=>now,fetchImpl});await media.sync();assert.equal(media.state().status,'delayed');assert.equal(media.state().channels[0].syncedAt,null);assert.equal(media.state().videos.length,1);
 failPhotos=false;now+=MEDIA_INTERVAL;await media.sync();assert.equal(media.state().status,'ready');const previous=media.state().channels[0].syncedAt;
 failPhotos=true;now+=MEDIA_INTERVAL;await media.sync();assert.equal(media.state().photos.length,1);assert.equal(media.state().channels[0].syncedAt,previous);assert.equal(media.state().status,'delayed');
 now+=8*86400000;assert.equal(media.state().photos.length,0);assert.equal(media.state().videos.length,0);assert.equal(media.readerItem(media.state().photos[0]?.id),null);
});

test('an oversized or empty index cannot mark media synchronization successful',async()=>{
 const directory=await mkdtemp(tmpdir()+'/nobi-oversized-media-');
 const media=await createNewsMedia(directory,undefined,{now:()=>NOW,fetchImpl:async url=>new Response(url.endsWith('/video')?'x'.repeat(2000001):'<html>Unavailable</html>')});
 await media.sync();assert.equal(media.state().status,'unavailable');assert.equal(media.state().syncedAt,null);assert.ok(media.state().channels.every(channel=>channel.syncedAt===null));
});
