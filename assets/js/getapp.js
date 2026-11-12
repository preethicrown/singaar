/* On a phone, the SINGAAR website invites people into the app (like YesMadam and Urban Company do):
   a bottom sheet the first time, then a slim "Get the app" bar at the top.
   Android: download the app. iPhone: open the app in the browser and Add to Home Screen.
   Laptops never see this. Someone who already opened the app as installed never sees it either. */
(function(){
  var APK='https://github.com/preethicrown/singaar/releases/latest/download/singaar.apk';
  var ua=navigator.userAgent||'',phone=/android|iphone|ipod|mobile/i.test(ua)||window.innerWidth<700;
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  if(!phone||standalone)return;
  var ios=/iphone|ipad|ipod/i.test(ua),android=/android/i.test(ua);
  var KEY='singaar.getapp',seen=false;try{seen=sessionStorage.getItem(KEY)==='1'}catch(e){}
  var css='.ga-wrap{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;font-family:Jost,system-ui,sans-serif}'
    +'.ga-scrim{position:absolute;inset:0;background:rgba(20,2,4,.62)}'
    +'.ga{position:relative;width:100%;max-width:480px;background:#FBF6F1;color:#2A1214;border-radius:26px 26px 0 0;padding:0 0 calc(18px + env(safe-area-inset-bottom));overflow:hidden;animation:gaUp .32s cubic-bezier(.2,.8,.2,1)}'
    +'@keyframes gaUp{from{transform:translateY(100%)}}'
    +'.ga-top{background:radial-gradient(120% 100% at 50% 0%,#7A0D14,#2E0306);padding:18px 20px 22px;text-align:center}'
    +'.ga-top img{width:190px;margin:0 auto;display:block;border-radius:12px}'
    +'.ga-bd{padding:16px 20px 0}'
    +'.ga h2{margin:0;font-size:21px;font-weight:600;line-height:1.2}'
    +'.ga ul{list-style:none;margin:12px 0 16px;padding:0;display:grid;gap:8px}'
    +'.ga li{display:flex;gap:10px;align-items:center;font-size:14.5px}'
    +'.ga li i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#F9E9E6;color:#6E0B12;font-style:normal;font-size:14px}'
    +'.ga a.ga-btn,.ga button.ga-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:52px;border:0;border-radius:14px;font:600 16px Jost,system-ui,sans-serif;text-decoration:none;cursor:pointer}'
    +'.ga .ga-main{background:linear-gradient(135deg,#B3121F,#6E0B12);color:#fff;box-shadow:0 8px 20px rgba(110,11,18,.3)}'
    +'.ga .ga-alt{background:#fff;color:#6E0B12;border:1.5px solid #6E0B12;margin-top:8px}'
    +'.ga .ga-skip{display:block;width:100%;background:none;border:0;color:#7A6763;font:500 14px Jost,system-ui,sans-serif;padding:14px 0 2px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}'
    +'.ga small{display:block;text-align:center;color:#7A6763;font-size:12px;margin-top:8px}'
    +'.ga-bar{position:relative;z-index:81;display:flex;align-items:center;gap:10px;background:#2E0306;color:#fff;padding:8px 10px;font:500 13.5px Jost,system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
    +'.ga-bar img{width:34px;height:34px;border-radius:9px;object-fit:cover}'
    +'.ga-bar span{flex:1;line-height:1.25}.ga-bar b{display:block;font-size:14px}'
    +'.ga-bar a{background:linear-gradient(135deg,#F2D79B,#C9974A);color:#2E0306;border-radius:999px;padding:7px 14px;font-weight:600;text-decoration:none;white-space:nowrap}'
    +'.ga-bar button{background:none;border:0;color:#BFA79C;font-size:20px;padding:0 4px;cursor:pointer}'
    ;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var appUrl='app/';
  function bar(){
    if(document.querySelector('.ga-bar'))return;
    var b=document.createElement('div');b.className='ga-bar';
    b.innerHTML='<img src="assets/icon-192.webp" alt=""><span><b>SINGAAR app</b>Book faster. Track your artist live.</span><a href="'+(android?APK:appUrl)+'">'+(android?'Get app':'Open app')+'</a><button type="button" aria-label="Close">×</button>';
    b.querySelector('button').addEventListener('click',function(){b.remove()});
    document.body.insertBefore(b,document.body.firstChild);
  }
  function sheet(){
    var w=document.createElement('div');w.className='ga-wrap';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-label','Get the SINGAAR app');
    w.innerHTML='<div class="ga-scrim"></div><div class="ga"><div class="ga-top"><img src="assets/logo.webp" alt="SINGAAR. Beauty meets you"></div><div class="ga-bd">'
      +'<h2>SINGAAR is better in the app</h2>'
      +'<ul><li><i>✦</i>AI look plan from a photo of your outfit</li><li><i>◉</i>Watch your artist arrive, live</li><li><i>✓</i>Book in 3 taps, pay after the service</li></ul>'
      +(android?'<a class="ga-btn ga-main" href="'+APK+'">Download the app</a><a class="ga-btn ga-alt" href="'+appUrl+'">Open in browser instead</a>'
        :'<a class="ga-btn ga-main" href="'+appUrl+'">Open the SINGAAR app</a>'+(ios?'<small>On iPhone: open it, tap Share, then Add to Home Screen. App Store version coming soon.</small>':''))
      +'<button type="button" class="ga-skip">Continue to the website</button></div></div>';
    function close(){w.remove();bar();try{sessionStorage.setItem(KEY,'1')}catch(e){}}
    w.querySelector('.ga-skip').addEventListener('click',close);
    w.querySelector('.ga-scrim').addEventListener('click',close);
    document.addEventListener('keydown',function k(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',k)}});
    document.body.appendChild(w);
  }
  function start(){if(seen)bar();else setTimeout(sheet,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
