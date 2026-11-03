import http from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {buildDataset} from './dataset.mjs';
import {community} from './community.mjs';
import {createNewsroom,NEWS_INTERVAL} from './newsroom.mjs';
import {originalArticles,indexedArticle} from './newsroom-reader.mjs';
import {YEAR,SOURCE,LICENSE,LICENSE_URL,TTL} from './config.mjs';
const port=Number(process.env.PORT||5292),stateDir=resolve(process.env.STATE_DIR||'.cache/public-reference');
if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
const labels=JSON.parse(await readFile(new URL('./labels.json',import.meta.url),'utf8'));
const names=JSON.parse(await readFile(new URL('./names.json',import.meta.url),'utf8'));
let snapshot=null,attempted=null,failed=false,running=false,nextFetch=0,sourceCache=null;
const cacheFile=resolve(stateDir,'snapshot.json');await mkdir(stateDir,{recursive:true});
const handleCommunity=community(stateDir);
const newsroom=await createNewsroom(stateDir,names);
try{const cached=JSON.parse(await readFile(cacheFile,'utf8'));if(cached.checkedAt&&Date.now()-Date.parse(cached.checkedAt)<TTL&&/^[a-f0-9]{40}$/.test(cached.data?.revision)&&cached.data.rounds?.length)snapshot=cached;}catch{/* No verified local snapshot yet. */}
async function download(url,optional=false,max=200000){
 const address=new URL(url);if(address.protocol!=='https:'||!['api.github.com','raw.githubusercontent.com'].includes(address.hostname)||address.username||address.password)throw Error('Source allowlist');
 const start=Math.max(nextFetch,Date.now());nextFetch=start+150;await delay(Math.max(0,start-Date.now()));
 const response=await fetch(address,{signal:AbortSignal.timeout(15000),redirect:'error',headers:{Accept:'application/vnd.github+json','User-Agent':'NOBI-Racing-Public-Reference/1.0'}});
 if(optional&&response.status===404)return null;if(!response.ok)throw Error('Source HTTP '+response.status);
 const reader=response.body.getReader();const chunks=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw Error('Source size limit');chunks.push(value);}}finally{await reader.cancel();}
 return Buffer.concat(chunks).toString('utf8');
}
async function sync(){
 if(running)return;running=true;attempted=new Date().toISOString();
 try{
  const commits=JSON.parse(await download(`https://api.github.com/repos/f1db/f1db/commits?path=src/data/seasons/${YEAR}&per_page=1`));
  const revision=commits[0]?.sha,sourceUpdatedAt=commits[0]?.commit?.committer?.date;if(!/^[a-f0-9]{40}$/.test(revision)||!Number.isFinite(Date.parse(sourceUpdatedAt)))throw Error('Invalid source revision');
  let data=snapshot?.data;
  // Rebuild even on unchanged revisions: newly finished sessions become eligible by time.
  if(sourceCache?.revision!==revision){
   const tree=JSON.parse(await download(`https://api.github.com/repos/f1db/f1db/contents/src/data/seasons/${YEAR}/races?ref=${revision}`));
   sourceCache={revision,directories:tree.filter(entry=>entry.type==='dir').map(entry=>entry.name),files:new Map()};
  }
  const directories=sourceCache.directories;
  let active=0;const queue=[];
  const read=async(path,optional=false)=>{
   if(sourceCache.files.has(path))return sourceCache.files.get(path);
   if(active>=4)await new Promise(resolve=>queue.push(resolve));active++;
   try{const value=await download(`https://raw.githubusercontent.com/f1db/f1db/${revision}/${path}`,optional);sourceCache.files.set(path,value);return value;}
   finally{active--;queue.shift()?.();}
  };
  data=await buildDataset({revision,directories,read,labels,names});data.sourceUpdatedAt=new Date(sourceUpdatedAt).toISOString();
  const next={checkedAt:new Date().toISOString(),data};const temporary=cacheFile+'.tmp';await writeFile(temporary,JSON.stringify(next));await rename(temporary,cacheFile);snapshot=next;failed=false;console.log('F1DB public reference verified: '+data.revision+' / '+data.rounds.length+' rounds');
 }catch(error){failed=true;console.error('F1DB public reference unavailable: '+error.name);}
 finally{running=false;}
}
const cors=new Set(['capacitor://localhost','https://localhost']);const limits=new Map();
// Only the trusted loopback Nginx can reach this server; it overwrites X-Real-IP.
setInterval(()=>{const minute=Math.floor(Date.now()/60000);for(const [key,value]of limits)if(value.minute<minute)limits.delete(key);},60000).unref();
const server=http.createServer(async(request,response)=>{
 response.setHeader('Content-Type','application/json; charset=utf-8');response.setHeader('Cache-Control','no-store');response.setHeader('X-Content-Type-Options','nosniff');
 const origin=request.headers.origin;if(origin&&cors.has(origin)){response.setHeader('Access-Control-Allow-Origin',origin);response.setHeader('Vary','Origin');response.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');response.setHeader('Access-Control-Allow-Headers','Accept, Content-Type, Authorization');}
 if(request.method==='OPTIONS'){response.writeHead(cors.has(origin)?204:403);response.end();return;}
 const route=new URL(request.url,'http://127.0.0.1').pathname;
 if(await handleCommunity(request,response,route))return;
 if(request.method!=='GET'){response.writeHead(405);response.end('{}');return;}
 const forwarded=request.headers['x-real-ip'];const ip=typeof forwarded==='string'&&forwarded.length<=45?forwarded:request.socket.remoteAddress,minute=Math.floor(Date.now()/60000),previous=limits.get(ip);const count=previous?.minute===minute?previous.count+1:1;limits.set(ip,{minute,count});if(limits.size>1000)for(const [key,value]of limits)if(value.minute!==minute)limits.delete(key);
 if(count>180){response.setHeader('Retry-After','60');response.writeHead(429);response.end('{}');return;}
 const ready=snapshot&&Date.now()-Date.parse(snapshot.checkedAt)<TTL,status=ready?'ready':failed?'upstream_error':'pending';
 const syncedAt=ready?snapshot.checkedAt:null,expiresAt=ready?new Date(Date.parse(snapshot.checkedAt)+TTL).toISOString():null,data=ready?snapshot.data:null;
 const common={status,year:YEAR,source:'F1DB',sourceUrl:SOURCE,license:LICENSE,licenseUrl:LICENSE_URL,syncedAt,expiresAt};
 const path=new URL(request.url,'http://127.0.0.1').pathname;let body;
 if(/^\/api\/v1\/newsroom\/photos\/[a-f0-9]{32}$/.test(path)){await newsroom.servePhoto(path.split('/').at(-1),response);return;}
 else if(path==='/api/v1/newsroom/events'){newsroom.listen(request,response);return;}
 else if(path==='/api/v1/newsroom/articles')body={status,items:originalArticles(data,names)};
 else if(/^\/api\/v1\/newsroom\/articles\/(?:nobi-)?[a-f0-9]{24}$/.test(path)){
  const id=path.split('/').at(-1),feed=newsroom.state();body=originalArticles(data,names).find(a=>a.id===id)||indexedArticle(feed.items.find(a=>a.id===id),feed,data,names);if(!body){response.writeHead(404);body={code:'ARTICLE_UNAVAILABLE'};}
 }
 else if(path==='/api/v1/newsroom')body=newsroom.state();
 else if(path==='/api/v1/season-insights')body={...common,rounds:data?.rounds||[]};
 else if(path==='/api/v1/weekends')body={...common,items:data?.weekends||[]};
 else if(path==='/api/v1/latest-news')body={status,sourceName:'NOBI Racing',sourceUrl:SOURCE,termsUrl:LICENSE_URL,usage:'public-open-data',checkedAt:attempted,syncedAt,expiresAt,sourceUpdatedAt:data?.sourceUpdatedAt||null,newestPublishedAt:data?.news[0]?.publishedAt||null,items:data?.news||[]};
 else if(path==='/api/v1/open-catalog')body={status:'disabled',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',syncedAt:null,expiresAt:null,items:[]};
 else if(path==='/api/v1/official-news')body={sources:[{id:'formula1',name:'www.formula1.com',homepage:'https://www.formula1.com/en/latest',status:'rights_required',syncedAt:null,expiresAt:null,items:[]},{id:'fia',name:'FIA',homepage:'https://www.fia.com/news',status:'rights_required',syncedAt:null,expiresAt:null,items:[]}]};
 else if(path==='/api/v1/public-reference')body={status,revision:data?.revision||null,sourceUpdatedAt:data?.sourceUpdatedAt||null,checkedAt:syncedAt,sourceUrl:SOURCE,license:LICENSE,licenseUrl:LICENSE_URL};
 else if(path==='/healthz')body={status:'up',referenceStatus:status};
 else {response.writeHead(404);body={code:'RESOURCE_NOT_FOUND'};}
 response.end(JSON.stringify(body));
});
server.listen(port,'127.0.0.1',()=>console.log('Public reference listens on loopback port '+port));void sync();setInterval(()=>{void sync();},120000).unref();
void newsroom.sync();setInterval(()=>{void newsroom.sync();},NEWS_INTERVAL).unref();

void newsroom.syncPhotos();setInterval(()=>{void newsroom.syncPhotos();},1800000).unref();
