import {readFile,writeFile,rename} from 'node:fs/promises';import {createHash} from 'node:crypto';
export async function createHeadlineTranslator(directory,names={}){
 const path=directory+'/headline-translations.json';let cache={day:'',used:0,values:{}};
 const reviewed=JSON.parse(await readFile(new URL('./newsroom-reviewed.json',import.meta.url),'utf8'));
 try{const saved=JSON.parse(await readFile(path,'utf8'));if(saved&&typeof saved.values==='object'&&Object.keys(saved.values).length<1000)cache=saved;}catch{/* New cache */}
 return async(items,allowRequests=true)=>{
  const day=new Date().toISOString().slice(0,10);if(cache.day!==day){cache.day=day;cache.used=0;}let requests=0;
  for(const item of items){if(item.language==='zh'){item.titleZh=item.title;item.translation='original';continue;}if(Object.hasOwn(reviewed,item.title)){item.titleZh=reviewed[item.title];item.translation='edited';continue;}const key=createHash('sha256').update('v2:'+item.title).digest('hex');
   if(cache.values[key]){item.titleZh=cache.values[key];item.translation='machine';continue;}
   item.titleZh=null;item.translation='unavailable';if(!allowRequests||requests>=4||cache.used+item.title.length>4000||Buffer.byteLength(item.title)>500)continue;
   requests++;cache.used+=item.title.length;
   try{let query=item.title;for(const [name,zh]of Object.entries(names).sort((a,b)=>b[0].length-a[0].length)){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');query=query.replace(new RegExp(escaped,'gi'),zh);}if(Buffer.byteLength(query)>500)continue;const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',query);url.searchParams.set('langpair','en|zh-CN');url.searchParams.set('mt','1');const r=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'error'});if(!r.ok)break;const raw=await r.text();if(raw.length>50000)throw Error('Translation too large');const d=JSON.parse(raw),title=d.responseData?.translatedText;if(d.responseStatus!==200||typeof title!=='string'||title.length>700||!/[\u3400-\u9fff]/.test(title)||/[<>]/.test(title)||/MYMEMORY WARNING|QUOTA|USED ALL|F1冠$|[（(][^）)]*$/i.test(title)||(title.match(/“/g)||[]).length!==(title.match(/”/g)||[]).length)continue;
    cache.values[key]=title;item.titleZh=title;item.translation='machine';
   }catch{/* Original headline stays available, never fabricate a translation. */}
  }
  const keys=Object.keys(cache.values);for(const key of keys.slice(0,Math.max(0,keys.length-600)))delete cache.values[key];await writeFile(path+'.tmp',JSON.stringify(cache));await rename(path+'.tmp',path);return items;
 };
}
