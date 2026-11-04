import type {Router} from 'vue-router';
import {Capacitor} from '@capacitor/core';
export function previousPage(router:Router){
 document.documentElement.dataset.navigation='back';
 const back=window.history.state?.back;
 if(typeof back==='string'&&back.startsWith('/')&&!back.startsWith('//')){router.back();return;}
 const path=router.currentRoute.value.path;
 if(path.startsWith('/newsroom/'))void router.replace('/newsroom');
 else if(path==='/forum'&&router.currentRoute.value.query.topic)void router.replace('/forum');
 else if(path!=='/')void router.replace('/');
}
/** Keep navigation inside the SPA; native WKWebView history snapshots can flash black. */
export function connectPageGestures(router:Router){
 let start:{x:number;y:number;at:number}|null=null,lastBack=0,stage:HTMLElement|null=null,resetTimer:ReturnType<typeof setTimeout>|undefined;
 const reset=(commit=false)=>{if(stage){const element=stage;if(commit)element.style.removeProperty('transition');else{element.style.transition='transform 140ms ease-out';element.style.removeProperty('--route-drag');}clearTimeout(resetTimer);resetTimer=setTimeout(()=>{element.style.removeProperty('transition');element.style.removeProperty('will-change');element.style.removeProperty('--route-drag');},commit?240:150);}stage=null;};
 const begin=(event:TouchEvent)=>{
  reset();start=null;if(event.touches.length!==1||window.visualViewport&&window.visualViewport.scale>1.02)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target||target.closest('input,textarea,select,button,a,video,[contenteditable],.team-carousel,[data-swipe-ignore]'))return;
  for(let node:Element|null=target;node&&node!==document.body;node=node.parentElement){if(node.scrollWidth>node.clientWidth+4&&['auto','scroll'].includes(getComputedStyle(node).overflowX))return;}
  const t=event.touches[0]!;if(t.clientX<(Capacitor.isNativePlatform()?8:24)||t.clientX>Math.min(innerWidth*.7,360))return;start={x:t.clientX,y:t.clientY,at:Date.now()};stage=document.querySelector<HTMLElement>('.route-stage:not(.route-page-leave-active)');
 };
 const move=(event:TouchEvent)=>{if(!start||event.touches.length!==1){start=null;reset();return;}const t=event.touches[0]!,dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dy)>30&&Math.abs(dy)>Math.abs(dx)||dx< -24){start=null;reset();return;}if(dx>20&&dx>Math.abs(dy)*2){if(event.cancelable)event.preventDefault();if(stage&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){stage.style.transition='none';stage.style.willChange='transform';stage.style.setProperty('--route-drag',Math.min(64,dx*.25)+'px');}}};
 const end=(event:TouchEvent)=>{const point=start;start=null;if(!point||event.changedTouches.length!==1){reset();return;}const t=event.changedTouches[0]!,dx=t.clientX-point.x,dy=Math.abs(t.clientY-point.y),elapsed=Date.now()-point.at,commit=dx>=100&&dx>dy*2.5&&elapsed<800&&Date.now()-lastBack>400;reset(commit);if(commit){if(event.cancelable)event.preventDefault();lastBack=Date.now();previousPage(router);}};
 const cancel=()=>{start=null;reset();};document.addEventListener('touchstart',begin,{passive:true});document.addEventListener('touchmove',move,{passive:false});document.addEventListener('touchend',end,{passive:false});document.addEventListener('touchcancel',cancel,{passive:true});
 return()=>{cancel();clearTimeout(resetTimer);document.removeEventListener('touchstart',begin);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',end);document.removeEventListener('touchcancel',cancel);};
}
