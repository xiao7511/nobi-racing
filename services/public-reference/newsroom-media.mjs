import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const MEDIA_INTERVAL=600000;
const ORIGIN='https://www.formula1.com';
const SOURCES={photo:ORIGIN+'/en/latest',video:ORIGIN+'/en/video'};
const IMAGE_HOSTS=new Set(['media.formula1.com','d2n9h2wits23hf.cloudfront.net']);
const PLAYER='https://players.brightcove.net/6057949432001/FC1Xxg8gIw_default/index.html';
const MAX_AGE=7*86400000;
const hash=value=>createHash('sha256').update(value).digest('hex').slice(0,24);
const plain=(value,max=500)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[<>]/.test(value)&&![...value].some(character=>character.charCodeAt(0)<32);
const clean=value=>typeof value==='string'?value.replace(/[\r\n\t]+/g,' ').trim():'';
function imageUrl(value){
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&IMAGE_HOSTS.has(url.hostname)&&!url.search?url.href:null;}catch{return null;}
}
function sourceUrl(value,kind){
 try{const url=new URL(value,ORIGIN);return url.origin===ORIGIN&&!url.username&&!url.password&&!url.search&&!url.hash&&(kind==='video'?/^\/en\/video\/[a-z0-9-]+\.\d{10,24}$/:/^\/en\/latest\/article\/[a-z0-9-]+\.[a-zA-Z0-9]{15,40}$/).test(url.pathname)?url.href:null;}catch{return null;}
}
const recent=(value,now)=>Number.isFinite(Date.parse(value))&&Date.parse(value)<=now+300000&&Date.parse(value)>=now-MAX_AGE;

// Next.js streams JSON data in script strings. Parse it as data; never execute publisher scripts.
function streamedData(html){
 if(typeof html!=='string'||html.length>2000000||/<!ENTITY/i.test(html))throw Error('Invalid official media index');
 const chunks=[];
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
  const script=match[1],prefix='self.__next_f.push(',start=script.indexOf(prefix);
  if(start<0)continue;
  try{const value=JSON.parse(script.slice(start+prefix.length,script.lastIndexOf(')')));if(value[0]===1&&typeof value[1]==='string')chunks.push(value[1]);}catch{/* Ignore framework scripts and incomplete records. */}
 }
 const values=[],texts=new Map(),bytes=Buffer.from(chunks.join(''));let offset=0;
 // Flight text records are byte-counted, not newline-delimited. A long URL or
 // caption can precede the JSON row without a newline; skipping its exact byte
 // length keeps the rest of the public index readable (including UTF-8 text).
 while(offset<bytes.length){
  if(bytes[offset]===10){offset++;continue;}
  const colon=bytes.indexOf(58,offset);if(colon<0||colon-offset>20)break;
  const id=bytes.subarray(offset,colon).toString();if(!/^[a-f0-9]+$/i.test(id))break;
  if(bytes[colon+1]===84){
   const comma=bytes.indexOf(44,colon+2);if(comma<0||comma-colon>12)break;
   const sizeText=bytes.subarray(colon+2,comma).toString();if(!/^[a-f0-9]+$/i.test(sizeText))break;
   const end=comma+1+Number.parseInt(sizeText,16);if(end>bytes.length)break;
   texts.set('$'+id,bytes.subarray(comma+1,end).toString('utf8'));offset=end;continue;
  }
  let end=bytes.indexOf(10,colon+1);if(end<0)end=bytes.length;
  try{values.push(JSON.parse(bytes.subarray(colon+1,end).toString('utf8')));}catch{/* Imports and framework hints are not metadata. */}
  offset=end+1;
 }
 const resolve=(value,depth=0)=>{
  if(typeof value==='string'&&texts.has(value))return texts.get(value);
  if(value&&typeof value==='object'&&depth<60)for(const key of Object.keys(value))value[key]=resolve(value[key],depth+1);
  return value;
 };
 for(const value of values)resolve(value);
 return values;
}

/** Public publisher thumbnails and public player embeds only; no media download or rehosting. */
export function officialMediaRecords(html,kind,now=Date.now()){
 if(!Object.hasOwn(SOURCES,kind))throw Error('Unknown media kind');
 const records=new Map();
 const visit=(value,depth=0)=>{
  if(!value||typeof value!=='object'||depth>60)return;
  if(!Array.isArray(value)){
   const title=clean(kind==='video'?value.caption:value.title),summary=clean(kind==='video'?value.description:value.metaDescription);
   const date=kind==='video'?value.publishedAt:value.updatedAt;
   const url=sourceUrl(kind==='video'?value.url:`/en/latest/article/${value.slug}.${value.id}`,kind);
   const image=imageUrl(kind==='video'?value.thumbnail?.url:value.thumbnail?.image?.url);
   const identified=kind==='video'?typeof value.videoId==='string'&&/^\d{10,24}$/.test(value.videoId)&&url?.endsWith('.'+value.videoId):typeof value.articleType==='string';
   if(identified&&url&&image&&plain(title)&&recent(date,now)&&value.isProtected===false&&!value.sensitive&&!value.isExclusiveArticle){
    const credit=clean(value.thumbnail?.caption).match(/\(Photo by ([^)]+)\)/i)?.[1]||'Formula 1';
    records.set(url,{id:hash(url),kind,title,titleZh:null,url,imageUrl:image,publishedAt:kind==='video'?date:null,updatedAt:date,publisher:'Formula 1',language:'en',originalLanguage:'en',summary:plain(summary,1200)?summary:'',summaryZh:null,credit,
     ...(kind==='video'?{videoId:value.videoId,duration:plain(value.videoDuration,20)?value.videoDuration:null,embedUrl:PLAYER+'?videoId='+value.videoId+'&autoplay=false&playsinline=true'}:{})});
   }
  }
  for(const child of Object.values(value))visit(child,depth+1);
 };
 for(const value of streamedData(html))visit(value);
 return [...records.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,12);
}

function validRecord(item,kind){
 return item&&item.kind===kind&&sourceUrl(item.url,kind)===item.url&&item.id===hash(item.url)&&imageUrl(item.imageUrl)===item.imageUrl&&plain(item.title)&&item.publisher==='Formula 1'&&plain(item.credit,500)&&
  (item.titleZh==null||plain(item.titleZh,1000))&&(item.summaryZh==null||plain(item.summaryZh,2000))&&(item.summary===''||plain(item.summary,1200))&&
  Number.isFinite(Date.parse(item.updatedAt))&&(kind==='photo'?item.publishedAt===null:item.publishedAt===item.updatedAt&&/^\d{10,24}$/.test(item.videoId)&&item.embedUrl===PLAYER+'?videoId='+item.videoId+'&autoplay=false&playsinline=true');
}

export async function createNewsMedia(directory,translate=async()=>{},options={}){
 const file=directory+'/newsroom-official-media.json',fetchImpl=options.fetchImpl||((...args)=>fetch(...args)),now=options.now||Date.now;
 let photos=[],videos=[],running=false;
 const channels=Object.entries(SOURCES).map(([kind,url])=>({kind,url,checkedAt:null,syncedAt:null,error:null}));
 try{
  const value=JSON.parse(await readFile(file,'utf8'));
  if(Array.isArray(value.photos)&&value.photos.length<=12&&value.photos.every(item=>validRecord(item,'photo')))photos=value.photos;
  if(Array.isArray(value.videos)&&value.videos.length<=12&&value.videos.every(item=>validRecord(item,'video')))videos=value.videos;
  for(const channel of channels){const saved=value.channels?.find(item=>item.kind===channel.kind);if(saved?.syncedAt&&Number.isFinite(Date.parse(saved.syncedAt))&&Date.parse(saved.syncedAt)<=now()+300000)channel.syncedAt=saved.syncedAt;}
 }catch{/* First synchronization; no invented seed date. */}
 const state=()=>{
  const available=channels.filter(c=>c.syncedAt&&now()-Date.parse(c.syncedAt)<MAX_AGE),healthy=available.length===channels.length&&channels.every(c=>!c.error&&now()-Date.parse(c.syncedAt)<MEDIA_INTERVAL*3);
  return {status:healthy?'ready':available.length?'delayed':channels.some(c=>c.error)?'unavailable':'pending',checkedAt:channels.map(c=>c.checkedAt).filter(Boolean).sort().at(-1)||null,syncedAt:available.map(c=>c.syncedAt).sort().at(-1)||null,checkIntervalSeconds:MEDIA_INTERVAL/1000,sourceName:'Formula 1',sourceUrl:SOURCES.video,
   photos:photos.filter(item=>recent(item.updatedAt,now())),videos:videos.filter(item=>recent(item.publishedAt,now())),error:channels.some(c=>c.error)?'官方媒体暂有延迟，恢复后自动同步 / Official media is delayed and will retry automatically':null,
   channels:channels.map(c=>({...c,status:!c.syncedAt?'unavailable':c.error||now()-Date.parse(c.syncedAt)>=MEDIA_INTERVAL*3?'delayed':'ready'}))};
 };
 const persist=async()=>{await writeFile(file+'.tmp',JSON.stringify({photos,videos,channels}));await rename(file+'.tmp',file);};
 async function request(url){
  if(!Object.values(SOURCES).includes(url))throw Error('Media source allowlist');
  const response=await fetchImpl(url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'NOBI-Racing-Newsroom/1.0 (public media index; links and embeds only)',Accept:'text/html'}});
  if(!response.ok||!response.body)throw Error('Media index HTTP '+response.status);
  const reader=response.body.getReader(),chunks=[];let size=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2000000)throw Error('Media index too large');chunks.push(value);}}finally{await reader.cancel();}
  return Buffer.concat(chunks).toString('utf8');
 }
 const sync=async(onUpdate=()=>{},force=false)=>{
  if(running)return;running=true;const pending=[];
  try{for(const channel of channels){
   if(!force&&channel.checkedAt&&now()-Date.parse(channel.checkedAt)<MEDIA_INTERVAL)continue;
   channel.checkedAt=new Date(now()).toISOString();
   try{
    const next=officialMediaRecords(await request(channel.url),channel.kind,now());if(!next.length)throw Error('No recent public media entries');
    const previous=channel.kind==='photo'?photos:videos;
    for(const item of next){const old=previous.find(p=>p.url===item.url&&p.title===item.title);if(old){item.titleZh=old.titleZh;item.summaryZh=old.summary===item.summary?old.summaryZh:null;}}
    if(channel.kind==='photo')photos=next;else videos=next;
    channel.syncedAt=new Date(now()).toISOString();channel.error=null;
    pending.push(...next);
   }catch(error){channel.error=String(error.message).slice(0,120);}
   await persist();onUpdate();
  }
  if(pending.length){
   // Publish both fresh indexes before joining the headline translation queue.
   // Provider failures must not hide media or erase a previously cached Chinese title.
   const previous=new Map(pending.map(item=>[item.url,{titleZh:item.titleZh,summaryZh:item.summaryZh}]));
   try{
    const summaries=pending.filter(item=>item.summary).map(item=>({title:item.summary,originalLanguage:'en',language:'en'}));
    await translate([...pending,...summaries]);let index=0;
    for(const item of pending){item.titleZh=item.titleZh||previous.get(item.url).titleZh;if(item.summary)item.summaryZh=summaries[index++].titleZh||previous.get(item.url).summaryZh;}
   }catch{for(const item of pending){item.titleZh=item.titleZh||previous.get(item.url).titleZh;item.summaryZh=item.summaryZh||previous.get(item.url).summaryZh;}}
   await persist();onUpdate();
  }}finally{running=false;}
 };
 function readerItem(id){
  const item=[...state().photos,...state().videos].find(entry=>entry.id===id);
  return item?{...item,publisher:'www.formula1.com',indexedAt:state().syncedAt,publishedAt:item.publishedAt,sourceUpdatedAt:item.updatedAt,topics:[],categories:[],channel:'official-media',bodyAvailable:true,description:item.summary,descriptionZh:item.summaryZh}:null;
 }
 return {state,sync,readerItem};
}
