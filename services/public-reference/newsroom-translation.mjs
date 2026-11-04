import {readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function createHeadlineTranslator(directory,names={}){
 const path=directory+'/headline-translations.json';let cache={day:'',used:0,values:{}};
 const zh=JSON.parse(await readFile(new URL('./newsroom-reviewed.json',import.meta.url),'utf8'));
 const en=JSON.parse(await readFile(new URL('./newsroom-reviewed-en.json',import.meta.url),'utf8'));
 try{const saved=JSON.parse(await readFile(path,'utf8'));if(saved&&typeof saved.values==='object'&&Object.keys(saved.values).length<1000)cache=saved;}catch{/* First cache */}
 return async(items,allowRequests=true)=>{
  const day=new Date().toISOString().slice(0,10);if(cache.day!==day){cache.day=day;cache.used=0;}let requests=0;
  for(const item of items){
   const source=item.originalLanguage||item.language,chinese=source==='zh',target=chinese?'en':'zh-CN',field=chinese?'titleEn':'titleZh',status=chinese?'translationEn':'translation';
   if(chinese){item.titleZh=item.title;item.translation='original';}else if(source==='en'){item.titleEn=item.title;item.translationEn='original';}else{item.titleEn=null;item.translationEn='unavailable';}
   const reviewed=chinese?en:zh;if(Object.hasOwn(reviewed,item.title)){item[field]=reviewed[item.title];item[status]='edited';continue;}
   const key=createHash('sha256').update('v4:'+source+':'+target+':'+item.title).digest('hex');if(cache.values[key]){item[field]=cache.values[key];item[status]='machine';continue;}
   item[field]=null;item[status]='unavailable';if(!['en','zh','es','it','fr','de','pt','nl'].includes(source)||!allowRequests||requests>=4||cache.used+item.title.length>4000||Buffer.byteLength(item.title)>500)continue;
   requests++;cache.used+=item.title.length;
   try{
    let query=item.title;
    if(source==='en')for(const [name,label]of Object.entries(names).sort((a,b)=>b[0].length-a[0].length)){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');query=query.replace(new RegExp(escaped,'gi'),label);}
    if(Buffer.byteLength(query)>500)continue;
    const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',query);url.searchParams.set('langpair',chinese?'zh-CN|en':source+'|zh-CN');url.searchParams.set('mt','1');
    const response=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'error'});if(!response.ok)break;const raw=await response.text();if(raw.length>50000)throw Error('Translation too large');const data=JSON.parse(raw),title=data.responseData?.translatedText;
    if(data.responseStatus!==200||typeof title!=='string'||title.length>700||/[<>]|MYMEMORY WARNING|QUOTA|USED ALL/i.test(title))continue;
    if(chinese?(!/[a-z]/i.test(title)||/[\u3400-\u9fff]/.test(title)):!/[\u3400-\u9fff]/.test(title))continue;
    if(!chinese&&(/F1冠$|[（(][^）)]*$/i.test(title)||(title.match(/“/g)||[]).length!==(title.match(/”/g)||[]).length))continue;
    cache.values[key]=title;item[field]=title;item[status]='machine';
   }catch{/* Only retain a reviewed or usable translation, never invent missing text. */}
  }
  const keys=Object.keys(cache.values);for(const key of keys.slice(0,Math.max(0,keys.length-600)))delete cache.values[key];await writeFile(path+'.tmp',JSON.stringify(cache));await rename(path+'.tmp',path);return items;
 };
}
