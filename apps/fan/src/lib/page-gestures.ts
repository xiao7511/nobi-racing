import type {Router} from 'vue-router';
import {Capacitor} from '@capacitor/core';
export function previousPage(router:Router){
 const back=window.history.state?.back;
 if(typeof back==='string'&&back.startsWith('/')&&!back.startsWith('//')){router.back();return;}
 const path=router.currentRoute.value.path;
 if(path.startsWith('/newsroom/'))void router.replace('/newsroom');
 else if(path==='/forum'&&router.currentRoute.value.query.topic)void router.replace('/forum');
 else if(path!=='/')void router.replace('/');
}
/** Native iOS uses WKWebView's edge gesture; other surfaces use one horizontal touch. */
export function connectPageGestures(router:Router){
 if(Capacitor.getPlatform()==='ios')return()=>{};
 let start:{x:number;y:number;at:number}|null=null,lastBack=0;
 const begin=(event:TouchEvent)=>{
  start=null;if(event.touches.length!==1||window.visualViewport&&window.visualViewport.scale>1.02)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target||target.closest('input,textarea,select,button,a,video,[contenteditable],.team-carousel,[data-swipe-ignore]'))return;
  for(let node:Element|null=target;node&&node!==document.body;node=node.parentElement){if(node.scrollWidth>node.clientWidth+4&&['auto','scroll'].includes(getComputedStyle(node).overflowX))return;}
  const t=event.touches[0]!;if(t.clientX<24||t.clientX>Math.min(innerWidth*.7,360))return;start={x:t.clientX,y:t.clientY,at:Date.now()};
 };
 const move=(event:TouchEvent)=>{if(!start||event.touches.length!==1){start=null;return;}const t=event.touches[0]!,dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dy)>30&&Math.abs(dy)>Math.abs(dx)||dx< -24){start=null;return;}if(dx>20&&dx>Math.abs(dy)*2&&event.cancelable)event.preventDefault();};
 const end=(event:TouchEvent)=>{const point=start;start=null;if(!point||event.changedTouches.length!==1)return;const t=event.changedTouches[0]!,dx=t.clientX-point.x,dy=Math.abs(t.clientY-point.y),elapsed=Date.now()-point.at;if(dx>=100&&dx>dy*2.5&&elapsed<800&&Date.now()-lastBack>400){if(event.cancelable)event.preventDefault();lastBack=Date.now();previousPage(router);}};
 const cancel=()=>{start=null;};document.addEventListener('touchstart',begin,{passive:true});document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',end,{passive:false});document.addEventListener('touchcancel',cancel,{passive:true});
 return()=>{document.removeEventListener('touchstart',begin);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',end);document.removeEventListener('touchcancel',cancel);};
}
