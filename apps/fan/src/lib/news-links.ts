export function isNewsUrl(value:string):boolean {
  try {
    const url=new URL(value);
    if(isPublicNewsUrl(value))return true;
    return value.length<=2000&&url.protocol==='https:'&&['www.bbc.co.uk','www.bbc.com'].includes(url.hostname)&&!url.username&&!url.password&&!url.port&&!url.hash
      &&/^\/sport\/formula1\/(?:articles\/[a-z0-9]+|[0-9]+)$/.test(url.pathname)
      &&(!url.search||url.search==='?at_medium=RSS&at_campaign=rss')&&!/%|\\/.test(value);
  }catch{return false;}
}
export function isPublicNewsUrl(value:string):boolean {
  try{const url=new URL(value);return value.length<=2000&&url.origin==='https://github.com'&&!url.username&&!url.password&&!url.search&&!url.hash&&/^\/f1db\/f1db\/blob\/(?:main|[a-f0-9]{40})\/src\/data\/seasons\/2026\/races\/[0-9]{2}-[a-z-]+\/(?:race-results|qualifying-results)\.yml$/.test(url.pathname);}catch{return false;}
}
export function newsBookmarkKey(value:unknown):string|null {
  if(typeof value!=='string'||!isNewsUrl(value))return null;
  const url=new URL(value);url.search='';return url.href;
}
