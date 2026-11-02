import {isPublicNewsUrl} from './news-links';
/** Keep source attribution readable inside the app; never open a code repository. */
export function safeHref(value:string|null|undefined):string|undefined{
 if(!value)return undefined;
 try{const url=new URL(value);if(['github.com','www.github.com','raw.githubusercontent.com'].includes(url.hostname))return '#/sources?ref='+encodeURIComponent(url.href);}catch{/* Relative and hash links stay local. */}
 return value;
}
export function newsHref(value:string):string|undefined{return isPublicNewsUrl(value)?'#/brief?source='+encodeURIComponent(value):safeHref(value);}
