import {apiUrl} from '../lib/urls';import {forumToken,forumUser,forumInbox,forumUnread,type ReplyNotice} from '../stores/community';
export interface ForumPost{id:number;parent:number|null;title:string;body:string;author:string;created:string;status:string;own:number;sticker:string|null;reply_to:number|null;quote_body?:string|null;quote_author?:string|null;quote_sticker?:string|null;replies?:number;reports?:number}
export async function communityApi<T>(path:string,data?:unknown):Promise<T>{
 const current=forumToken.value;const response=await fetch(apiUrl('/api/v1/community/'+path),{method:data===undefined?'GET':'POST',credentials:'omit',cache:'no-store',headers:{Accept:'application/json',...(data===undefined?{}:{'Content-Type':'application/json'}),...(current?{Authorization:'Bearer '+current}:{})},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
 const value=await response.json();if(response.status===401&&forumToken.value===current){forumUser.value=null;forumToken.value='';forumInbox.value=[];forumUnread.value=0;}if(!response.ok)throw Error(value.error||'Service unavailable');return value as T;
}
let inboxRequest:Promise<void>|null=null;
export async function refreshForumInbox(){
 if(!forumToken.value){forumInbox.value=[];forumUnread.value=0;return;}if(inboxRequest)return inboxRequest;const current=forumToken.value;
 inboxRequest=(async()=>{try{const result=await communityApi<{items:ReplyNotice[];unread:number}>('notifications');if(forumToken.value===current){forumInbox.value=result.items;forumUnread.value=result.unread;}}catch{/* A temporary outage does not erase pending notices. */}finally{inboxRequest=null;}})();return inboxRequest;
}
