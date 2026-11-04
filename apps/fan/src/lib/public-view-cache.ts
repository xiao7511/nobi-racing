/** A short in-memory first paint for public data; every view still revalidates. */
const values=new Map<string,{value:unknown;at:number}>();
export function cachedPublic<T>(key:string):T|null{const item=values.get(key);if(!item)return null;const expiry=(item.value as {expiresAt?:string})?.expiresAt;if(Date.now()-item.at>120000||expiry&&Date.parse(expiry)<=Date.now()){values.delete(key);return null;}return item.value as T;}
export function cachePublic(key:string,value:unknown){values.delete(key);values.set(key,{value,at:Date.now()});if(values.size>12)values.delete(values.keys().next().value!);}
export function forgetPublic(key:string){values.delete(key);}
