import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const languages=new Set(['en','zh','es','it','fr','de','pt','nl','ru','ja','ko','ar','hi','tr']);
const chinese=value=>/[\u3400-\u9fff]/.test(value);
const plain=value=>typeof value==='string'&&value.length>0&&value.length<=8000&&!/[<>]|MYMEMORY WARNING|QUOTA|USED ALL/i.test(value)&&![...value].some(char=>char.charCodeAt(0)<32);
const cacheKey=(value,source,target)=>createHash('sha256').update('v4:'+source+':'+target+':'+value).digest('hex');
const chineseOutput=value=>chinese(value)&&!/[a-z]/i.test(value.replace(/\b(?:F[123]|FIA|DRS|ERS|KERS|MGU|GP[23]?|V(?:6|8|10|12)|ABS|LED|GPS|AI|CEO|TV|BBC|CNN|AP|USD|EUR|km|mph|kmh|kW|bhp|kg|mm|[PQ]\d|[A-Z]{1,3}\d{2,3})\b/g,''));
const usable=(value,target)=>plain(value)&&(target==='zh-CN'?chineseOutput(value):/[a-z]/i.test(value)&&!chinese(value));

/** The local service has no daily quota; the public fallback keeps its provider's limits. */
export async function createHeadlineTranslator(directory,names={},options={}){
 const path=directory+'/headline-translations.json';let cache={version:5,day:'',used:0,values:{},providers:{}};
 const zh=JSON.parse(await readFile(new URL('./newsroom-reviewed.json',import.meta.url),'utf8'));
 const en=JSON.parse(await readFile(new URL('./newsroom-reviewed-en.json',import.meta.url),'utf8'));
 try{const saved=JSON.parse(await readFile(path,'utf8'));if(saved&&saved.values&&typeof saved.values==='object'&&!Array.isArray(saved.values)&&Object.keys(saved.values).length<=2000)cache={version:5,day:typeof saved.day==='string'?saved.day:'',used:Number.isFinite(saved.used)&&saved.used>=0?saved.used:0,values:Object.fromEntries(Object.entries(saved.values).filter(([key,value])=>plain(value)&&(saved.version===5||saved.providers?.[key]!=='local'))),providers:saved.providers&&typeof saved.providers==='object'?saved.providers:{}};}catch{/* First cache. */}
 const fetchImpl=options.fetchImpl||((...args)=>fetch(...args));
 const now=options.now||Date.now;
 const batchSize=Number(options.batchSize??process.env.NEWS_TRANSLATION_BATCH_SIZE??40);
 if(!Number.isInteger(batchSize)||batchSize<1||batchSize>40)throw Error('NEWS_TRANSLATION_BATCH_SIZE must be an integer from 1 to 40');
 const endpoint=options.endpoint??(process.env.NEWS_TRANSLATION_ENABLED==='false'?'':process.env.NEWS_TRANSLATION_URL||'http://127.0.0.1:5291/translate');
 if(endpoint){const url=new URL(endpoint);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('Invalid translation endpoint');}
 let localRetryAt=0,queue=Promise.resolve();
 const enqueue=task=>{const result=queue.then(task);queue=result.catch(()=>{});return result;};
 const persist=async()=>{const keys=Object.keys(cache.values);for(const key of keys.slice(0,Math.max(0,keys.length-1500))){delete cache.values[key];delete cache.providers[key];}await writeFile(path+'.tmp',JSON.stringify(cache));await rename(path+'.tmp',path);};
 const refreshDay=()=>{const day=new Date(now()).toISOString().slice(0,10);if(cache.day!==day){cache.day=day;cache.used=0;}};
 const readJson=async(response,max=100000)=>{
  if(!response.ok||!response.body)throw Error('Translation unavailable');
  const reader=response.body.getReader();const chunks=[];let size=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw Error('Translation too large');chunks.push(value);}}finally{await reader.cancel();}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
 };
 async function translateValues(entries,allowRequests=true){
  refreshDay();
  const output=entries.map(entry=>{const key=cacheKey(entry.value,entry.source,entry.target);return {...entry,key,valueZh:usable(cache.values[key],entry.target)&&cache.values[key].length<=(entry.maxLength||8000)?cache.values[key]:null,provider:cache.providers[key]||'mymemory'};});
  if(!allowRequests)return output;
  // Complete all missing English headlines in bounded batches, rather than stopping after four.
  for(const source of ['en','zh']){
   const local=output.filter(entry=>!entry.valueZh&&entry.source===source&&entry.target==='zh-CN'&&entry.value.length<=1200);
   for(let start=0;endpoint&&now()>=localRetryAt&&start<local.length;start+=batchSize){
   const batch=local.slice(start,start+batchSize);
   try{
    const response=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts:batch.map(entry=>entry.value),source,target:'zh-CN'}),signal:AbortSignal.timeout(45000),redirect:'error'});
    const result=await readJson(response);
    if(!Array.isArray(result.translations)||result.translations.length!==batch.length)throw Error('Invalid local translation batch');
    batch.forEach((entry,index)=>{const value=typeof result.translations[index]==='string'?result.translations[index].trim():null;if(!usable(value,entry.target)||value.length>(entry.maxLength||8000))return;entry.valueZh=value;entry.provider='local';cache.values[entry.key]=value;cache.providers[entry.key]='local';});
   }catch{localRetryAt=now()+60000;}
   }
  }
  let requests=0;
  for(const entry of output){
   if(entry.valueZh||entry.source==='zh'&&entry.target==='zh-CN'||!languages.has(entry.source)||requests>=4||cache.used+entry.value.length>4000||Buffer.byteLength(entry.value)>500)continue;
   requests++;cache.used+=entry.value.length;
   try{
    let query=entry.value;
    if(entry.source==='en')for(const [name,label]of Object.entries(names).sort((a,b)=>b[0].length-a[0].length)){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');query=query.replace(new RegExp(escaped,'gi'),label);}
    if(Buffer.byteLength(query)>500)continue;
    const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',query);url.searchParams.set('langpair',entry.source==='zh'?'zh-CN|en':entry.source+'|'+entry.target);url.searchParams.set('mt','1');
    const result=await readJson(await fetchImpl(url,{signal:AbortSignal.timeout(12000),redirect:'error'}),50000),value=typeof result.responseData?.translatedText==='string'?result.responseData.translatedText.trim():null;
    if(result.responseStatus!==200||!usable(value,entry.target)||value.length>(entry.maxLength||8000))continue;
    if(entry.target==='zh-CN'&&(/F1冠$|[（(][^）)]*$/i.test(value)||(value.match(/“/g)||[]).length!==(value.match(/”/g)||[]).length))continue;
    entry.valueZh=value;entry.provider='mymemory';cache.values[entry.key]=value;cache.providers[entry.key]='mymemory';
   }catch{/* Leave pending; a later synchronization or reader request retries. */}
  }
  return output;
 }
 const translate=(items,allowRequests=true)=>enqueue(async()=>{
  const missing=[],chineseTitles=[];
  for(const item of items){
   const source=item.originalLanguage||item.language,chineseSource=source==='zh',target=chineseSource?'en':'zh-CN',field=chineseSource?'titleEn':'titleZh',status=chineseSource?'translationEn':'translation';
   if(chineseSource){item.titleZh=item.title;item.translation='original';chineseTitles.push({item,source:'zh',target:'zh-CN',value:item.title});}else if(source==='en'){item.titleEn=item.title;item.translationEn='original';}else{item.titleEn=null;item.translationEn='unavailable';}
   const reviewed=chineseSource?en:zh;
   if(Object.hasOwn(reviewed,item.title)){item[field]=reviewed[item.title];item[status]='edited';continue;}
   missing.push({item,source,target,field,status,value:item.title,maxLength:item.title.length<=500?700:2000});
  }
  const normalized=await translateValues(chineseTitles,allowRequests);normalized.forEach(entry=>{if(entry.valueZh)entry.item.titleZh=entry.valueZh;});
  const values=await translateValues(missing,allowRequests);
  values.forEach(entry=>{const value=entry.valueZh&&entry.valueZh.length<=(entry.value.length<=500?700:2000)?entry.valueZh:null;entry.item[entry.field]=value;entry.item[entry.status]=value?'machine':'pending';entry.item.translationProvider=value?entry.provider:null;});
  await persist();return items;
 });
 // The reader shares the same serialized provider and cache as the background headline queue.
 translate.text=(value,{source='en',target='zh-CN',allowRequests=true}={})=>enqueue(async()=>{
  if(typeof value!=='string'||!value.trim()||value.length>1200||/[<>]/.test(value)||[...value].some(char=>char.charCodeAt(0)<32))return null;
  const reviewed=target==='zh-CN'?zh:en;if(Object.hasOwn(reviewed,value))return reviewed[value];
  const [entry]=await translateValues([{value,source,target}],allowRequests);await persist();return entry.valueZh||(source==='zh'&&target==='zh-CN'?value:null);
 });
 return translate;
}
