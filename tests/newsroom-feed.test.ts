import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {mount,type VueWrapper,flushPromises} from '@vue/test-utils';
import {defineComponent} from 'vue';
import {useNewsroom,type Newsroom} from '../apps/fan/src/api/newsroom';
import {forgetPublic} from '../apps/fan/src/lib/public-view-cache';
class Events extends EventTarget{
 static current:Events;onerror:(()=>void)|null=null;
 constructor(){super();Events.current=this;}
 close(){}
 send(value:Newsroom){this.dispatchEvent(new MessageEvent('newsroom',{data:JSON.stringify(value)}));}
}
const feed=(titleZh:string):Newsroom=>({status:'ready',source:'GDELT Project',sourceUrl:'https://www.gdeltproject.org/',termsUrl:'https://www.gdeltproject.org/about.html#termsofuse',checkedAt:new Date().toISOString(),syncedAt:new Date().toISOString(),datasetAt:null,checkIntervalSeconds:120,sourceCadenceMinutes:15,expiresAt:new Date(Date.now()+3600000).toISOString(),topics:[],error:null,items:[{id:'a'.repeat(24),title:'F1 racing news',titleZh,url:'https://www.formula1.com/en/latest/article/test',publisher:'www.formula1.com',indexedAt:new Date().toISOString(),publishedAt:null,language:'en',topics:[],categories:['race']}]});
let wrapper:VueWrapper|undefined,current:ReturnType<typeof useNewsroom>;
const component=defineComponent({setup(){current=useNewsroom();return()=>null;}});
beforeEach(()=>{forgetPublic('newsroom');vi.stubGlobal('EventSource',Events);});
afterEach(()=>{wrapper?.unmount();wrapper=undefined;vi.unstubAllGlobals();forgetPublic('newsroom');});
it('never replaces a freshly streamed Chinese translation with an older in-flight poll',async()=>{
 let finish!:(response:Response)=>void;
 vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;})));
 wrapper=mount(component);Events.current.send(feed('刚完成的中文译文'));
 finish(Response.json(feed('旧的中文译文')));await flushPromises();
 expect(current.data.value?.items[0]?.titleZh).toBe('刚完成的中文译文');
 expect(current.error.value).toBe(false);
});
it('ignores a superseded request failure after the newer refresh succeeds',async()=>{
 let fail!:(reason:unknown)=>void;
 vi.stubGlobal('fetch',vi.fn().mockImplementationOnce(()=>new Promise<Response>((_resolve,reject)=>{fail=reject;})).mockResolvedValue(Response.json(feed('新刷新译文'))));
 wrapper=mount(component);await current.reload();fail(new DOMException('Cancelled','AbortError'));await flushPromises();
 expect(current.data.value?.items[0]?.titleZh).toBe('新刷新译文');expect(current.error.value).toBe(false);
});
