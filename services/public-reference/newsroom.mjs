import {Unzip,UnzipInflate} from 'fflate';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setImmediate as yieldIO} from 'node:timers/promises';
import {createPhotoLibrary} from './newsroom-photos.mjs';
import {createHeadlineTranslator} from './newsroom-translation.mjs';
import {grandsPrix,teams} from './config.mjs';
export const NEWS_INTERVAL=120000,NEWS_TTL=6*3600000;
export const GDELT='https://www.gdeltproject.org/';
const host='data.gdeltproject.org';
const roots=['formula1.com','fia.com','autosport.com','motorsport.com','the-race.com','racefans.net','planetf1.com','racingnews365.com','gpblog.com','bbc.com','bbc.co.uk','skysports.com','espn.com','reuters.com','apnews.com','theguardian.com','sina.com.cn','sohu.com','qq.com','163.com','dongqiudi.com','zhibo8.com','crash.net','scmp.com','scuderiafans.com'];
export function publisherUrl(value){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||value.length>2000||!roots.some(root=>url.hostname===root||url.hostname.endsWith('.'+root)))return null;url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^fbclid$|^gclid$/.test(key))url.searchParams.delete(key);return url.href;}catch{return null;}}
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
 const fullDriver=selected.some(topic=>topic.kind==='driver'&&(lower.includes(topic.name.toLowerCase())||title.includes(topic.nameZh)));
 if(!explicit&&!specialist&&!fullDriver&&!(selected.some(t=>t.kind==='driver')&&selected.some(t=>t.kind==='team')))return null;
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
export async function createNewsroom(stateDir,names){
 const translate=await createHeadlineTranslator(stateDir,names);
 const topics=topicsFor(names),cache=stateDir+'/newsroom.json',photoLibrary=await createPhotoLibrary(stateDir,topics);let items=[],processed=[],checkedAt=null,syncedAt=null,datasetAt=null,error=null,running=false;const listeners=new Set();
 try{const value=JSON.parse(await readFile(cache,'utf8').catch(()=>readFile(new URL('./newsroom-seed.json',import.meta.url),'utf8')));if(value.version===1&&Array.isArray(value.items)&&value.items.length<=300&&value.items.every(item=>publisherUrl(item.url)&&typeof item.title==='string'&&!/[<>]/.test(item.title))){items=value.items;processed=value.processed||[];syncedAt=value.syncedAt;datasetAt=value.datasetAt;}}catch{/* First sync */}
 await translate(items,false);
 const state=()=>{const fresh=syncedAt&&Date.now()-Date.parse(syncedAt)<NEWS_TTL;const sourceDelayed=!datasetAt||Date.now()-Date.parse(datasetAt)>3600000;return {status:!fresh?(error?'unavailable':'pending'):error||sourceDelayed?'delayed':'ready',source:'GDELT Project',sourceUrl:GDELT,termsUrl:'https://www.gdeltproject.org/about.html#termsofuse',checkedAt,syncedAt,datasetAt,checkIntervalSeconds:NEWS_INTERVAL/1000,sourceCadenceMinutes:15,expiresAt:syncedAt?new Date(Date.parse(syncedAt)+NEWS_TTL).toISOString():null,photos:photoLibrary.state(),topics:topics.map(({terms:_terms,...topic})=>topic),items:fresh?items:[],error:error?'数据源暂不可用，将自动重试 / Source unavailable; retry scheduled':null};};
 const publish=()=>{const message='event: newsroom\ndata: '+JSON.stringify(state())+'\n\n';for(const response of listeners)if(!response.write(message)){listeners.delete(response);response.end();}};
 const fetchSource=async url=>{const target=new URL(url);if(target.origin!=='https://'+host)throw Error('Source allowlist');return fetch(url,{signal:AbortSignal.timeout(45000),redirect:'error',headers:{'User-Agent':'NOBI-Racing-Newsroom/1.0',Accept:'*/*'}});};
 const sync=async()=>{
  if(running)return;running=true;checkedAt=new Date().toISOString();try{
   let latest=0;let backfillMissing=false;let sourceConfirmed=false;
   for(const translated of [false,true]){
    const manifestResponse=await fetchSource('https://'+host+'/gdeltv2/lastupdate'+(translated?'-translation':'')+'.txt');if(!manifestResponse.ok)throw Error('Manifest HTTP '+manifestResponse.status);const text=await manifestResponse.text();if(text.length>3000)throw Error('Manifest too large');const manifest=indexFile(text),d=manifest.stamp;
    const date=Date.parse(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T${d.slice(8,10)}:${d.slice(10,12)}:${d.slice(12,14)}Z`);latest=Math.max(latest,date);
    const count=processed.filter(url=>url.includes('.translation.')===translated).length;
    const offsets=count<13?[0,1,2,4,8,12,16,24,32,48,64,80,96]:[0,1,2,3,4,5,6,7];
    const jobs=offsets.map((offset,i)=>{const stamp=new Date(date-offset*900000).toISOString().replace(/[-:TZ.]/g,'').slice(0,14);return {url:`https://${host}/gdeltv2/${stamp}${translated?'.translation':''}.gkg.csv.zip`,...(i===0?{md5:manifest.md5}:{})};});
    for(const [i,job]of jobs.entries()){
     if(processed.includes(job.url)){if(i===0)sourceConfirmed=true;continue;}const response=await fetchSource(job.url);if(response.status===404){backfillMissing=true;if(i>0)processed.push(job.url);continue;}
     const result=await readGkg(response,topics);if(job.md5&&job.md5!==result.md5)throw Error('Source checksum mismatch');sourceConfirmed=true;const map=new Map(items.map(item=>[item.url,item]));for(const item of result.records)map.set(item.url,item);items=[...map.values()].filter(item=>Date.now()-Date.parse(item.indexedAt)<7*86400000).sort((a,b)=>b.indexedAt.localeCompare(a.indexedAt)).slice(0,300);processed.push(job.url);processed=processed.slice(-256);syncedAt=new Date().toISOString();datasetAt=new Date(latest).toISOString();error=null;await writeFile(cache+'.tmp',JSON.stringify({version:1,items,processed,syncedAt,datasetAt}));await rename(cache+'.tmp',cache);publish();
    }
   }
   if(!sourceConfirmed)throw Error('No source batches available');await translate(items);syncedAt=new Date().toISOString();datasetAt=new Date(latest).toISOString();error=backfillMissing?'partial_backfill':null;await writeFile(cache+'.tmp',JSON.stringify({version:1,items,processed,syncedAt,datasetAt}));await rename(cache+'.tmp',cache);publish();
  }catch(e){error=e.name||'upstream';publish();console.error('Newsroom source unavailable: '+e.name+' / '+String(e.message).slice(0,160));}finally{running=false;}
 };
 return {state,sync,async syncPhotos(){await photoLibrary.sync();publish();},servePhoto:photoLibrary.serve,listen(request,response){if(listeners.size>=100){response.writeHead(503);response.end('{}');return;}response.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','X-Accel-Buffering':'no'});response.write('event: newsroom\ndata: '+JSON.stringify(state())+'\n\n');listeners.add(response);const heartbeat=setInterval(()=>response.write(': heartbeat\n\n'),15000);heartbeat.unref();request.on('close',()=>{clearInterval(heartbeat);listeners.delete(response);});}};
}
