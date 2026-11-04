import {Unzip,UnzipInflate} from 'fflate';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setImmediate as yieldIO} from 'node:timers/promises';
import {createPhotoLibrary} from './newsroom-photos.mjs';
import {createNewsChannels} from './newsroom-channels.mjs';
import {createHeadlineTranslator} from './newsroom-translation.mjs';
import {hasReviewedBody} from './newsroom-reader.mjs';
import {grandsPrix,teams} from './config.mjs';
export const NEWS_INTERVAL=120000,NEWS_TTL=6*3600000;
export const GDELT='https://www.gdeltproject.org/';
const host='data.gdeltproject.org';
const roots=['formula1.com','fia.com','autosport.com','motorsport.com','the-race.com','racefans.net','planetf1.com','racingnews365.com','gpblog.com','bbc.com','bbc.co.uk','skysports.com','espn.com','reuters.com','apnews.com','theguardian.com','sina.com.cn','sohu.com','qq.com','163.com','dongqiudi.com','zhibo8.com','crash.net','scmp.com','scuderiafans.com','motorsportweek.com','pitpass.com','f1technical.net','f1i.com','gpupdate.net','grandprix.com','speedcafe.com','speedweek.com','paddocknews24.com','motorsport-total.com','auto-motor-und-sport.de','sport.sky.de','sport.es','marca.com','as.com','lequipe.fr','corriere.it','gazzetta.it','abc.net.au','sbs.com.au','rnz.co.nz','channelnewsasia.com','f1.com','mercedesamgf1.com','ferrari.com','mclaren.com','redbullracing.com','williamsf1.com','astonmartinf1.com','audi-mediacenter.com','whenstherace.com','infobae.com','ole.com.ar','terra.com.br','globo.com','grandepremio.com.br','express.co.uk','dailymail.co.uk','mirror.co.uk','independent.co.uk','standard.co.uk','sportingnews.com','news.com.au','foxsports.com.au','news24.com','news18.com','hindustantimes.com','timesofindia.indiatimes.com','firstpost.com','ndtv.com','indiatoday.in','f1oversteer.com','formula1news.co.uk','total-motorsport.com','gpfans.com','f1maximaal.nl'];
export function publisherUrl(value){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||value.length>2000||!roots.some(root=>url.hostname===root||url.hostname.endsWith('.'+root)))return null;if(url.pathname==='/'||/\/(?:author|authors|tag|tags|category|categories|search|writers)(?:\/|$)/i.test(url.pathname))return null;url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$/.test(key))url.searchParams.delete(key);return url.href;}catch{return null;}}
export function unescape(value){return value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));|&(amp|quot|apos|lt|gt);/gi,(_m,hex,decimal,name)=>{if(name)return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'}[name.toLowerCase()];const n=parseInt(hex||decimal,hex?16:10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});}
const slug=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function topicsFor(names){
 const drivers=Object.entries(names).filter(([name])=>/\b[A-Z]{3,}\b/.test(name)).map(([name,zh])=>({id:'driver:'+slug(name),kind:'driver',name,nameZh:zh,terms:[name.toLowerCase(),name.split(' ').at(-1).toLowerCase(),zh,zh.split('·').at(-1)]}));
 const constructors=Object.entries(teams).map(([id,name])=>({id:'team:'+id,kind:'team',name,nameZh:names[name]||name,terms:[name.toLowerCase(),(names[name]||name).toLowerCase(),...(id==='red-bull'?['red bull','红牛']:id==='haas'?['haas','哈斯']:[])]}));
 const races=Object.entries(grandsPrix).map(([id,[name,nameZh]])=>({id:'race:'+id,kind:'race',name,nameZh,terms:[name.toLowerCase(),name.replace(' Grand Prix','').toLowerCase(),nameZh,nameZh.replace('大奖赛','')]}));
 return [...drivers,...constructors,...races];
}
export function parseRecord(line,topics){
 const fields=line.split('\t');if(fields.length<27)return null;
 const url=publisherUrl(fields[4]);if(!url)return null;
 const match=fields[26].match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/i);if(!match)return null;
 const title=unescape(match[1]).trim().replace(/\s+/g,' ');if(title.length<5||title.length>500||/[<>]|betting|casino|\bodds\b|博彩|投注|赔率/i.test(title))return null;
 const lower=title.toLowerCase();const selected=topics.filter(topic=>topic.terms.some(term=>term&&lower.includes(term.toLowerCase())));
 const explicit=/\bf[ -]?1\b|formula\s*(one|1)|一级方程式|一級方程式/i.test(title);
 if(!explicit&&/moto\s?gp|moto2|moto3|motocross|snooker|badminton|乒乓|羽毛球|斯诺克|斯諾克/i.test(title))return null;
 const specialist=/\b(planetf1|racefans|the-race|racingnews365|gpblog|scuderiafans)\./.test(new URL(url).hostname);
 const f1Path=/\/(?:f1|formula-?1|formula-one)(?:[/-]|$)/i.test(new URL(url).pathname);
 const fullDriver=selected.some(topic=>topic.kind==='driver'&&(lower.includes(topic.name.toLowerCase())||title.includes(topic.nameZh)));
 if(!explicit&&!specialist&&!f1Path&&!fullDriver&&!(selected.some(t=>t.kind==='driver')&&selected.some(t=>t.kind==='team')))return null;
 if(!/^\d{14}$/.test(fields[1]))return null;const d=fields[1],indexedAt=`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T${d.slice(8,10)}:${d.slice(10,12)}:${d.slice(12,14)}Z`;if(!Number.isFinite(Date.parse(indexedAt))||Date.parse(indexedAt)>Date.now()+300000)return null;
 const categories=[...new Set(selected.map(t=>t.kind))];if(!categories.length)categories.push('race');
 return {id:createHash('sha256').update(url).digest('hex').slice(0,24),title,url,publisher:new URL(url).hostname,indexedAt,publishedAt:null,language:/[\u3400-\u9fff]/.test(title)?'zh':'en',topics:selected.map(t=>t.id),categories};
}
export function indexFile(text){const row=text.split('\n').map(line=>line.trim().split(/\s+/)).find(parts=>parts.length===3&&/\/\d{14}(?:\.translation)?\.gkg\.csv\.zip$/.test(parts[2]));if(!row||!/^\d+$/.test(row[0])||Number(row[0])>16000000||! /^[a-f0-9]{32}$/.test(row[1]))throw Error('Invalid GDELT manifest');const url=new URL(row[2]);if(url.hostname!==host||url.username||url.password||url.port||!/^\/gdeltv2\/\d{14}(?:\.translation)?\.gkg\.csv\.zip$/.test(url.pathname))throw Error('Invalid dataset URL');url.protocol='https:';return {url:url.href,size:Number(row[0]),md5:row[1],stamp:url.pathname.match(/\d{14}/)[0]};}
export async function readGkg(response,topics){
 if(!response.ok||!response.body)throw Error('GDELT HTTP '+response.status+' '+response.url);const records=[],decoder=new TextDecoder();let pending='',bytes=0,expanded=0,entries=0,failure=null;
 const hash=createHash('md5');const archive=new Unzip(file=>{if(++entries>1||!/^\d{14}(?:\.translation)?\.gkg\.csv$/i.test(file.name))throw Error('Unexpected archive entry');file.ondata=(error,data,final)=>{if(error){failure=error;return;}expanded+=data.length;if(expanded>128000000){failure=Error('Expanded source too large');return;}pending+=decoder.decode(data,{stream:!final});let end;while((end=pending.indexOf('\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+1);if(line.length<1000000){const item=parseRecord(line,topics);if(item)records.push(item);}}if(pending.length>1000000){failure=Error('Source line too large');return;}if(final&&pending){const item=parseRecord(pending,topics);if(item)records.push(item);pending='';}};file.start();});archive.register(UnzipInflate);
 for await(const chunk of response.body){bytes+=chunk.length;if(bytes>16000000)throw Error('Source too large');hash.update(chunk);archive.push(chunk,false);if(failure)throw failure;await yieldIO();}
 archive.push(new Uint8Array(),true);if(failure||entries!==1)throw failure||Error('Empty archive');return {records,md5:hash.digest('hex'),bytes};
}
const languageCodes={english:'en',eng:'en',en:'en',chinese:'zh',zho:'zh',chi:'zh',zh:'zh',spanish:'es',spa:'es',es:'es',italian:'it',ita:'it',it:'it',french:'fr',fra:'fr',fre:'fr',fr:'fr',german:'de',deu:'de',ger:'de',de:'de',portuguese:'pt',por:'pt',pt:'pt',dutch:'nl',nld:'nl',nl:'nl',russian:'ru',ru:'ru',japanese:'ja',ja:'ja',korean:'ko',ko:'ko',arabic:'ar',ar:'ar',hindi:'hi',hi:'hi',turkish:'tr',tr:'tr'};
export function metadataRecord({title,url,indexedAt,originalLanguage},topics){
 const fields=Array(27).fill('');fields[1]=indexedAt.replace(/[-:TZ.]/g,'').slice(0,14);fields[4]=unescape(url);fields[26]='<PAGE_TITLE>'+title+'</PAGE_TITLE>';const item=parseRecord(fields.join('\t'),topics);if(item){const host=item.publisher,known=languageCodes[String(originalLanguage||'').toLowerCase()]||(/^[a-z]{2}$/.test(String(originalLanguage))?originalLanguage:null);item.originalLanguage=known||(/[\u3040-\u30ff]/.test(item.title)?'ja':item.language==='zh'?'zh':/(?:infobae|marca\.com|ole\.com\.ar|as\.com|sport\.es)/.test(host)?'es':/(?:gazzetta|corriere)/.test(host)?'it':/(?:globo|grandepremio|terra\.com\.br)/.test(host)?'pt':/(?:lequipe)/.test(host)?'fr':/(?:motorsport-total|auto-motor-und-sport|speedweek)/.test(host)?'de':'en');item.language=item.originalLanguage==='zh'?'zh':'en';}return item;
}
export function pendingBatches(stamp,processed,translated,limit=4){const d=stamp,date=Date.parse(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T${d.slice(8,10)}:${d.slice(10,12)}:${d.slice(12,14)}Z`);if(!Number.isFinite(date))throw Error('Invalid timestamp');return Array.from({length:96},(_,offset)=>{const value=new Date(date-offset*900000).toISOString().replace(/[-:TZ.]/g,'').slice(0,14);return {url:`https://${host}/gdeltv2/${value}${translated?'.translation':''}.gkg.csv.zip`,date:new Date(date-offset*900000).toISOString(),latest:offset===0};}).filter(job=>!processed.includes(job.url)).slice(0,limit);}
export async function createNewsroom(stateDir,names){
 const translateImpl=await createHeadlineTranslator(stateDir,names);let translationQueue=Promise.resolve();const translate=(...args)=>{const job=translationQueue.then(()=>translateImpl(...args));translationQueue=job.catch(()=>{});return job;};
 const topics=topicsFor(names),cache=stateDir+'/newsroom.json',photoLibrary=await createPhotoLibrary(stateDir,topics);let items=[],processed=[],checkedAt=null,syncedAt=null,datasetAt=null,error=null,running=false;let streamHealth=[];const listeners=new Set();
 try{const value=JSON.parse(await readFile(cache,'utf8').catch(()=>readFile(new URL('./newsroom-seed.json',import.meta.url),'utf8')));if(value.version===1&&Array.isArray(value.items)&&value.items.length<=300&&value.items.every(item=>publisherUrl(item.url)&&typeof item.title==='string'&&!/[<>]/.test(item.title))){items=value.items;processed=value.processed||[];syncedAt=value.syncedAt;datasetAt=value.datasetAt;streamHealth=value.channels||[];}}catch{/* First sync */}
 await translate(items,false);
 const extra=await createNewsChannels(stateDir,value=>metadataRecord(value,topics));await translate(extra.state().items.filter(i=>!i.openBrief),false);
 const state=()=>{
  const aux=extra.state(),all=new Map(items.filter(i=>Date.now()-Date.parse(i.indexedAt)<7*86400000).map(i=>[i.url,{...i,channel:i.channel||'gkg'}]));
  for(const item of aux.items){const old=all.get(item.url);all.set(item.url,old?{...old,...item,indexedAt:old.indexedAt<item.indexedAt?old.indexedAt:item.indexedAt}:item);}
  const latest=[syncedAt,...aux.channels.map(c=>c.syncedAt)].filter(Boolean).sort().at(-1)||null,available=latest&&Date.now()-Date.parse(latest)<7*86400000;
  const channels=[...streamHealth,...aux.channels],healthy=channels.some(c=>c.id!=='open-calendar'&&c.status==='ready'&&c.syncedAt&&Date.now()-Date.parse(c.syncedAt)<3600000);
  const combined=available?[...all.values()].sort((a,b)=>b.indexedAt.localeCompare(a.indexedAt)).slice(0,300):[];
  return {status:!available?(error?'unavailable':'pending'):healthy?'ready':'delayed',source:'GDELT Project',sourceUrl:GDELT,termsUrl:'https://www.gdeltproject.org/about.html#termsofuse',checkedAt:[checkedAt,...channels.map(c=>c.checkedAt)].filter(Boolean).sort().at(-1)||null,syncedAt:latest,datasetAt:[datasetAt,...aux.channels.map(c=>c.datasetAt)].filter(Boolean).sort().at(-1)||null,checkIntervalSeconds:NEWS_INTERVAL/1000,sourceCadenceMinutes:15,expiresAt:latest?new Date(Date.parse(latest)+7*86400000).toISOString():null,channels,publisherCount:new Set(combined.map(i=>i.publisher)).size,photos:photoLibrary.state(),topics:topics.map(({terms:_terms,...topic})=>topic),items:combined.map(item=>({...item,bodyAvailable:!!item.openBrief||hasReviewedBody(item.url),openBrief:undefined,scheduleSignature:undefined})),error:healthy?null:error?'部分新闻通道延迟，显示已获取内容 / Some channels are delayed; showing collected stories':null};
 };
 const readerItem=id=>{const item=extra.state().items.find(i=>i.id===id);return item?.openBrief?item:null;};
 const publish=()=>{const message='event: newsroom\ndata: '+JSON.stringify(state())+'\n\n';for(const response of listeners)if(!response.write(message)){listeners.delete(response);response.end();}};
 const fetchSource=async url=>{const target=new URL(url);if(target.origin!=='https://'+host)throw Error('Source allowlist');return fetch(url,{signal:AbortSignal.timeout(45000),redirect:'error',headers:{'User-Agent':'NOBI-Racing-Newsroom/1.0',Accept:'*/*'}});};
 const persist=async()=>{await writeFile(cache+'.tmp',JSON.stringify({version:1,items,processed,syncedAt,datasetAt,channels:streamHealth}));await rename(cache+'.tmp',cache);};
 const sync=async()=>{
  if(running)return;running=true;checkedAt=new Date().toISOString();let confirmed=false;
  try{for(const translated of [false,true]){
   const channelId=translated?'gkg-translated':'gkg-english',previous=streamHealth.find(c=>c.id===channelId),health={id:channelId,name:translated?'GDELT · 多语种新闻':'GDELT · 英文新闻',nameEn:translated?'GDELT · multilingual news':'GDELT · English news',intervalSeconds:120,checkedAt:new Date().toISOString(),syncedAt:previous?.syncedAt||null,datasetAt:previous?.datasetAt||null,lastVerifiedBatch:previous?.lastVerifiedBatch||null,status:'unavailable',error:null};
   try{
    const response=await fetchSource('https://'+host+'/gdeltv2/lastupdate'+(translated?'-translation':'')+'.txt');if(!response.ok)throw Error('Manifest HTTP '+response.status);const text=await response.text();if(text.length>3000)throw Error('Manifest too large');const manifest=indexFile(text);if(manifest.url.includes('.translation.')!==translated)throw Error('Manifest stream mismatch');const jobs=pendingBatches(manifest.stamp,processed,translated);
    const stamp=manifest.stamp,latestDate=new Date(`${stamp.slice(0,4)}-${stamp.slice(4,6)}-${stamp.slice(6,8)}T${stamp.slice(8,10)}:${stamp.slice(10,12)}:${stamp.slice(12,14)}Z`).toISOString();health.manifestAt=latestDate;if(health.lastVerifiedBatch!==manifest.url&&!jobs.some(job=>job.latest))jobs.unshift({url:manifest.url,date:latestDate,latest:true});
    let sourceConfirmed=health.lastVerifiedBatch===manifest.url,count=0;
    for(const job of jobs){const batch=await fetchSource(job.url);if(batch.status===404){if(!job.latest&&Date.now()-Date.parse(job.date)>3600000)processed.push(job.url);continue;}const result=await readGkg(batch,topics);if(job.latest&&manifest.md5!==result.md5)throw Error('Source checksum mismatch');sourceConfirmed=true;if(!health.datasetAt||job.date>health.datasetAt)health.datasetAt=job.date;if(job.latest)health.lastVerifiedBatch=job.url;const map=new Map(items.map(item=>[item.url,item]));for(const item of result.records){const old=map.get(item.url);map.set(item.url,{...(old?.title===item.title?old:{}),...item,indexedAt:old?.indexedAt&&old.indexedAt<item.indexedAt?old.indexedAt:item.indexedAt,channel:channelId});}items=[...map.values()].filter(item=>Date.now()-Date.parse(item.indexedAt)<7*86400000).sort((a,b)=>b.indexedAt.localeCompare(a.indexedAt)).slice(0,300);processed.push(job.url);processed=processed.slice(-256);count+=result.records.length;}
    if(!sourceConfirmed)throw Error('No source batches available');confirmed=true;health.syncedAt=new Date().toISOString();health.status=Date.now()-Date.parse(health.datasetAt)>3600000?'delayed':'ready';health.items=count;syncedAt=health.syncedAt;datasetAt=!datasetAt||health.datasetAt>datasetAt?health.datasetAt:datasetAt;
   }catch(cause){health.status=health.syncedAt?'delayed':'unavailable';health.error=String(cause.message).slice(0,100);}
   streamHealth=streamHealth.filter(c=>c.id!==channelId).concat(health);await persist();publish();
  }
  error=confirmed?null:'upstream';await translate(items);await persist();publish();
  }finally{running=false;}
 };
 let syncingExtra=false;
 const syncChannels=async()=>{if(syncingExtra)return;syncingExtra=true;try{await extra.sync(publish);await translate(extra.state().items.filter(i=>!i.openBrief));publish();}catch(cause){console.error('News channel refresh: '+cause.name);}finally{syncingExtra=false;}};
 return {state,sync,syncChannels,readerItem,async syncPhotos(){await photoLibrary.sync();publish();},servePhoto:photoLibrary.serve,listen(request,response){if(listeners.size>=100){response.writeHead(503);response.end('{}');return;}response.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','X-Accel-Buffering':'no'});response.write('event: newsroom\ndata: '+JSON.stringify(state())+'\n\n');listeners.add(response);const heartbeat=setInterval(()=>response.write(': heartbeat\n\n'),15000);heartbeat.unref();request.on('close',()=>{clearInterval(heartbeat);listeners.delete(response);});}};
}
