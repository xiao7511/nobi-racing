import {mkdir,readFile,writeFile,rename,stat,unlink} from 'node:fs/promises';import {createHash} from 'node:crypto';
const licenses=new Set(['CC BY 4.0','CC BY-SA 4.0','CC BY-SA 3.0','CC BY 2.0','CC BY-SA 2.0','CC0','CC0 1.0']);
const decode=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();
const safeUrl=(value,hosts)=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&hosts.includes(url.hostname)?url:null;}catch{return null;}};
export function photoMetadata(page,topics){
 const image=page.imageinfo?.[0],meta=image?.extmetadata;if(!meta||!licenses.has(meta.LicenseShortName?.value))return null;
 const title=decode(page.title).replace(/^File:/,'');const description=decode(meta.ImageDescription?.value),categories=decode(meta.Categories?.value);const searchable=(title+' '+description+' '+categories).toLowerCase();
 if(!/2026/.test(title)||!/\bf1\b|formula[ -]?1|formula one|formel 1/i.test(searchable)||/generated|render|concept|logo|replica/i.test(title))return null;
 const team=topics.find(t=>t.kind==='team'&&searchable.includes(t.name.toLowerCase().replace(' racing','').replace(' f1 team','')));const driver=topics.find(t=>t.kind==='driver'&&searchable.includes(t.name.split(' ').at(-1).toLowerCase()));if(!team||!driver)return null;
 const captured=String(meta.DateTimeOriginal?.value||'').match(/2026-\d{2}-\d{2}/)?.[0];if(!captured||!Number.isFinite(Date.parse(captured))||Date.parse(captured)>Date.now()+86400000)return null;
 const licenseUrl=safeUrl(meta.LicenseUrl?.value,['creativecommons.org']),source=safeUrl(image.descriptionurl,['commons.wikimedia.org']),asset=safeUrl(image.thumburl||image.url,['upload.wikimedia.org','thumb.wikimedia.org']);if(!licenseUrl||!source||!asset||!source.pathname.startsWith('/wiki/File:'))return null;
 const author=decode(meta.Attribution?.value||meta.Artist?.value);if(!author||author.length>300||title.length>500||/[<>]/.test(author+title))return null;
 const races=topics.filter(t=>t.kind==='race'&&searchable.includes(t.name.toLowerCase()));return {title,team:team.name,author,license:meta.LicenseShortName.value,licenseUrl:licenseUrl.href,source:source.href,captured,topics:[team.id,driver.id,...races.map(t=>t.id)],asset};
}
export async function createPhotoLibrary(directory,topics){
 const root=directory+'/newsroom-media';await mkdir(root,{recursive:true});let photos=[],syncedAt=null,checkedAt=null,failed=false,running=false;
 const seed=new URL('./newsroom-media-seed/',import.meta.url);
 try{const data=JSON.parse(await readFile(root+'/index.json','utf8').catch(()=>readFile(new URL('index.json',seed),'utf8')));if(Array.isArray(data.photos)&&data.photos.length<=20&&data.photos.every(p=>/^[a-f0-9]{32}$/.test(p.id)&&licenses.has(p.license))){photos=data.photos;syncedAt=data.syncedAt;}}catch{/* No photo cache yet */}
 const state=()=>({status:syncedAt?(failed?'delayed':'ready'):'pending',checkedAt,syncedAt,checkIntervalSeconds:1800,items:photos});
 const sync=async()=>{if(running||syncedAt&&Date.now()-Date.parse(syncedAt)<1800000)return;running=true;const created=[];checkedAt=new Date().toISOString();try{
  const url=new URL('https://commons.wikimedia.org/w/api.php');for(const [key,value]of Object.entries({action:'query',format:'json',generator:'search',gsrsearch:'2026 Grand Prix filetype:bitmap',gsrsort:'create_timestamp_desc',gsrnamespace:'6',gsrlimit:'50',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1280'}))url.searchParams.set(key,value);
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error',headers:{'User-Agent':'NOBI-Racing-Newsroom/1.0 (editorial fan photo gallery)'}});if(!response.ok)throw Error('Photo source HTTP '+response.status);const raw=await response.text();if(raw.length>1000000)throw Error('Photo metadata too large');const data=JSON.parse(raw);if(data.error)throw Error('Photo source error');const next=[];
  for(const page of Object.values(data.query?.pages||{})){const metadata=photoMetadata(page,topics);if(!metadata)continue;const {asset,...photo}=metadata;
   const id=createHash('sha256').update(photo.source).digest('hex').slice(0,32),path=root+'/'+id;let mime='image/jpeg';
   try{await stat(path);mime=photos.find(p=>p.id===id)?.mime||mime;}catch{const r=await fetch(asset,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)continue;mime=r.headers.get('content-type')?.split(';')[0];if(!['image/jpeg','image/png'].includes(mime))continue;const parts=[];let size=0;for await(const part of r.body){size+=part.length;if(size>3000000)throw Error('Photo too large');parts.push(part);}const bytes=Buffer.concat(parts);if(mime==='image/jpeg'&&(bytes[0]!==255||bytes[1]!==216)||mime==='image/png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')continue;await writeFile(path+'.tmp',bytes);await rename(path+'.tmp',path);created.push(id);}
   next.push({...photo,id,mime,src:'/api/v1/newsroom/photos/'+id});if(next.length>=12)break;
  }
  if(!next.length)throw Error('No matching licensed photos');const keep=new Map([...photos,...next].map(p=>[p.id,p]));const previous=photos;photos=[...keep.values()].sort((a,b)=>b.captured.localeCompare(a.captured)).slice(0,20);syncedAt=new Date().toISOString();failed=false;await writeFile(root+'/index.json.tmp',JSON.stringify({photos,syncedAt}));await rename(root+'/index.json.tmp',root+'/index.json');for(const photo of previous)if(!photos.some(p=>p.id===photo.id))await unlink(root+'/'+photo.id).catch(()=>{});
 }catch(e){failed=true;console.error('Newsroom photos unavailable: '+e.name+' / '+String(e.message).slice(0,160));}finally{for(const id of created)if(!photos.some(p=>p.id===id))await unlink(root+'/'+id).catch(()=>{});running=false;}};
 return {state,sync,async serve(id,response){const photo=photos.find(p=>p.id===id);if(!photo){response.writeHead(404);response.end('{}');return;}try{const bytes=await readFile(root+'/'+id).catch(()=>readFile(new URL(id,seed)));response.writeHead(200,{'Content-Type':photo.mime,'Cache-Control':'public, max-age=1800, no-transform'});response.end(bytes);}catch{response.writeHead(503);response.end('{}');}}};
}
