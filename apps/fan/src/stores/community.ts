import {ref} from 'vue';
export interface ForumUser{id:number;name:string;admin:boolean}
// Page-memory only: navigation preserves the session, a full reload clears it.
export const forumUser=ref<ForumUser|null>(null);
export const forumToken=ref('');
