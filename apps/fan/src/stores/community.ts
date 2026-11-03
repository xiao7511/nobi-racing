import {ref} from 'vue';
export interface ForumUser{id:number;name:string;admin:boolean}
// Page-memory only: navigation preserves the session, a full reload clears it.
export const forumUser=ref<ForumUser|null>(null);
export const forumToken=ref('');
export interface ReplyNotice{id:number;message_id:number;topic_id:number;title:string;body:string;sticker:string|null;author:string;created:string;read_at:string|null}
export const forumInbox=ref<ReplyNotice[]>([]);
export const forumUnread=ref(0);
