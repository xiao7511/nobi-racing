// HTTPS wrapper supplies a valid HTTP referrer for iOS/Android WebView embeds.
const channels={formula1:'UUB_qr75-ydFVKSF9Dmo6izg',mercedes:'UU7_VGkwCoKfqh1eZEkzey3A',ferrari:'UUd8iY-kEHtaB8qt8MH--zGw'};
const query=new URLSearchParams(location.search),key=query.get('channel'),english=query.get('lang')==='en';
let player,timer;
function unavailable(){clearTimeout(timer);player?.destroy();document.getElementById('player')?.remove();const message=document.getElementById('error');message.textContent=english?'The provider cannot play this video here. Use the official channel link below.':'提供方暂不能在此播放该视频，请使用下方官方频道入口。';message.hidden=false;}
if(key&&Object.hasOwn(channels,key)){
 window.onYouTubeIframeAPIReady=()=>{
  player=new window.YT.Player('player',{host:'https://www.youtube-nocookie.com',width:'100%',height:'100%',playerVars:{listType:'playlist',list:channels[key],autoplay:0,playsinline:1,origin:location.origin,cc_load_policy:1,cc_lang_pref:english?'en':'zh-Hans'},events:{onReady:()=>clearTimeout(timer),onError:unavailable}});
 };
 timer=setTimeout(unavailable,20000);const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=unavailable;document.head.append(script);
}else unavailable();
