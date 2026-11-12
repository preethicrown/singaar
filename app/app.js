/* SINGAAR app: one file, hash routes, every screen built from the same small pieces.
   Data:
   - Preview artists (demo/samples.js) are shown, labelled "Preview", unless config.js sets customerReal:true.
   - Verified artists come from the live database (approved only). Booking them needs a sign-in and goes to
     the real artist in SINGAAR Partner, with real chat and real live location.
   - Bookings with preview artists stay on this phone and are clearly marked as previews. */
(function(){
'use strict';
var D=window.SGD,A=window.SGAuth||{on:false},C=window.SINGAAR_CONFIG||{},SAM=window.SINGAAR_SAMPLES||{artists:[],cover:{}};
var ROOT='../',API=ROOT+'api/ai',APK='https://github.com/preethicrown/singaar/releases/latest/download/singaar.apk';
var NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function inr(n){return '₹'+Math.round(Number(n)||0).toLocaleString('en-IN')}
function ph(id){id=String(id);if(/^https?:\/\//.test(id))return id;if(id.indexOf('app/')===0)return ROOT+'assets/'+id+'.jpg';return ROOT+'assets/photos/pexels-'+id+'.jpg'}
function fpos(id){return 'object-position:'+(D.FOCUS[id]||'center 20%')}
function img(id,alt){return '<img src="'+esc(ph(id))+'" alt="'+esc(alt||'')+'" loading="lazy" referrerpolicy="no-referrer" style="'+fpos(id)+'">'}
function pad(n){return (n<10?'0':'')+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function today(){return iso(new Date())}
function addDays(s,n){var d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function daysTo(s){return Math.round((new Date(s+'T12:00:00')-new Date(today()+'T12:00:00'))/864e5)}
var WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(s){if(!s)return '';var d=new Date(s+'T12:00:00');return WD[d.getDay()]+', '+d.getDate()+' '+MO[d.getMonth()]}
function fmtTime(t){if(!t)return '';var p=t.split(':'),h=+p[0];return (h%12||12)+':'+p[1]+(h<12?' am':' pm')}
function minus(t,m){var p=t.split(':'),x=(+p[0])*60+(+p[1])-m;x=((x%1440)+1440)%1440;return pad(Math.floor(x/60))+':'+pad(x%60)}
function uid(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,function(c){return (c^Math.random()*16>>c/4).toString(16)})}
function initials(n){return String(n||'S').trim().split(/\s+/).map(function(w){return w[0]}).slice(0,2).join('').toUpperCase()}

/* ---------- icons ---------- */
var IC={
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  plan:'<path d="M9 4h6M8 4H6a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2"/><path d="M9 11l2 2 4-4M9 17h6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  pin:'<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',
  heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',send:'<path d="M4 12l16-8-6 16-2-6z"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  brush:'<path d="M14 4l6 6-8 8H6v-6z"/><path d="M4 20l2-2"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  logout:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  family:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 3-5 6-5s6 1.5 6 5M14 20c0-2.5 1.5-4 3.5-4S22 17.5 22 20"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  home2:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',store:'<path d="M3 9l2-5h14l2 5"/><path d="M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2M3 10h18"/>',upi:'<path d="M7 4l5 16M12 4l5 16"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',check:'<path d="M5 12l4.5 4.5L19 7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  partner:'<path d="M12 21s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/><path d="M9 11h6M12 8v6"/>'
};
function ic(n,cls){return '<svg class="i'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(IC[n]||'')+'</svg>'}

/* ---------- saved state (this phone) ---------- */
var KEY='singaar.app.v1';
var S=(function(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}})();
function def(k,v){if(S[k]==null)S[k]=v}
def('city','Bangalore');def('area','');def('onboarded',false);def('cart',null);def('bookings',[]);def('favs',[]);def('notifs',[]);
def('profile',{name:'',phone:'',addr:''});def('reviews',[]);def('wedding',{date:'',name:''});def('family',[]);def('briefs',[]);def('recent',[]);def('done',{});def('rituals',['muhurtham']);
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- artists ---------- */
var P=[];
if(C.customerReal!==true)SAM.artists.forEach(function(a){
  P.push({id:'s'+a.id,n:a.id,name:a.name,type:a.type,city:a.city,area:a.area,styles:a.styles||[],travel:a.travel,bio:a.bio,pk:a.pk,booked:a.booked||[],sample:true,photos:[],handle:a.handle});
});
function byId(id){for(var i=0;i<P.length;i++)if(String(P[i].id)===String(id))return P[i];return null}
function mainKey(p){var k=Object.keys(p.pk);return k.indexOf('bridal')>-1?'bridal':k[0]}
var NEWP=['app/bride','app/occ-reception','app/occ-nikah','app/occ-engagement','app/cat-party','app/occ-church','app/cat-styling','app/occ-haldi','app/cat-hair','app/cat-mehendi'];
function cover(p){if(p.photos&&p.photos.length)return p.photos[0];if(p.sample)return NEWP[p.n%NEWP.length];var l=D.IMG[mainKey(p)]||D.IMG.bridal;return l[String(p.id).length%l.length]}
function gallery(p){
  if(p.photos&&p.photos.length)return p.photos.slice(0,9);
  var out=[cover(p)];Object.keys(p.pk).forEach(function(k){var f=(D.IMG[k]||[])[0];if(f&&out.indexOf(f)<0)out.push(f)});out=out,seed=p.n||3;
  Object.keys(p.pk).forEach(function(k){(D.IMG[k]||[]).forEach(function(x,i,l){var c=l[(i+seed)%l.length];if(out.indexOf(c)<0&&out.length<9)out.push(c)})});
  return out;
}
function fromPrice(p,keys){var v=(keys||Object.keys(p.pk)).map(function(k){return p.pk[k]}).filter(function(x){return x!=null});return v.length?Math.min.apply(null,v):null}
function busyOn(p,d){return (p.booked||[]).indexOf(d)>-1||S.bookings.some(function(b){return b.pid===p.id&&b.date===d&&/requested|confirmed|onway|started/.test(b.status)})}
function shown(p){return !p.sample||!P.some(function(q){return !q.sample&&q.city===p.city})}
function inCity(){return P.filter(function(p){return p.city===S.city&&shown(p)})}
function badge(p){return p.listed?'<span class="tag">Listed</span>':p.sample?'<span class="tag">Preview</span>':'<span class="tag ok">Verified</span>'}
function typeLine(p){return esc(D.TYPE[p.type]||'Artist')+'<i class="sep"></i>'+esc(p.area)}
function isFav(p){return S.favs.indexOf(String(p.id))>-1}
function favBtn(p){return '<button type="button" class="fav" data-act="fav" data-id="'+esc(p.id)+'" aria-label="Save '+esc(p.name)+'" aria-pressed="'+isFav(p)+'">'+ic('heart')+'</button>'}
function rating(p){var r=S.reviews.filter(function(x){return String(x.pid)===String(p.id)});if(!r.length)return null;return {avg:r.reduce(function(a,x){return a+x.stars},0)/r.length,n:r.length,list:r}}

/* ---------- small UI helpers ---------- */
var toastT;
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200)}
function sheet(html,onOpen){var w=$('sheetWrap'),s=$('sheet');s.innerHTML=html;w.hidden=false;document.body.style.overflow='hidden';if(onOpen)onOpen(s);var f=s.querySelector('[autofocus]');if(f)setTimeout(function(){f.focus()},250)}
function closeSheet(){$('sheetWrap').hidden=true;$('sheet').innerHTML='';document.body.style.overflow=''}
function notify(title,body,link){S.notifs.unshift({t:title,b:body,at:Date.now(),read:false,link:link||''});S.notifs=S.notifs.slice(0,40);save();drawNav()}
function vibrate(){try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}}
function go(h){if(location.hash===h)render();else location.hash=h}
var depth=0;
function back(){if(depth>0){depth-=2;history.back()}else go('#/home')}
function aiCall(body){
  return fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){return r.json().catch(function(){return null}).then(function(j){if(!r.ok||!j||!j.ok)throw new Error('ai');return j})});
}
function bar(title,opts){opts=opts||{};return '<header class="bar'+(opts.clear?' clear':'')+'"><button type="button" class="iconbtn" data-act="back" aria-label="Back">'+ic('back')+'</button><h1>'+esc(title||'')+'</h1>'+(opts.right||'')+'</header>'}

/* ---------- cart (one artist at a time, like any booking app) ---------- */
function cartTotal(){if(!S.cart)return 0;var p=byId(S.cart.pid);if(!p)return 0;return Object.keys(S.cart.items).reduce(function(s,k){return s+(p.pk[k]||0)*S.cart.items[k]},0)}
function cartCount(){return S.cart?Object.keys(S.cart.items).reduce(function(s,k){return s+S.cart.items[k]},0):0}
function toggleSvc(pid,k){
  var lp=byId(pid);if(lp&&lp.listed){go('#/artist/'+pid);toast('Message her on WhatsApp or Instagram to book.');return}
  if(S.cart&&S.cart.pid!==pid&&cartCount()){
    var o=byId(S.cart.pid);
    sheet('<h2>Start a new booking?</h2><p class="sub">Your cart has services from '+esc(o?o.name:'another artist')+'. One booking is with one artist.</p><div style="display:flex;gap:10px;margin-top:18px"><button class="btn line block" data-close>Keep it</button><button class="btn main block" data-act="cartReplace" data-id="'+esc(pid)+'" data-k="'+k+'">Start new</button></div>');
    return;
  }
  if(!S.cart||S.cart.pid!==pid)S.cart={pid:pid,items:{}};
  if(S.cart.items[k])delete S.cart.items[k];else{S.cart.items[k]=1;vibrate()}
  if(!cartCount())S.cart=null;
  save();render(true);
}
var MULTI={bridesmaid:1,party:1,guest:1,saree:1,hair:1,mehendi:1};

/* ---------- live database (verified artists, real bookings, chat, location) ---------- */
var db=A.on?A.db:null,me=null,chan=null;
function loadArtists(){
  if(!db)return;
  db.from('artists').select('id,owner,name,area,city,type,travel,services,bio,handle,wa,photos,blocked,status').eq('status','approved').limit(500).then(function(r){
    if(r.error||!r.data)return;
    r.data.forEach(function(x){
      var pk={};Object.keys(x.services||{}).forEach(function(k){var v=parseInt(x.services[k],10);if(D.SV[k]&&v>=100)pk[k]=v});
      if(!Object.keys(pk).length||!D.AREAS[x.city])return;
      var a=byId(x.id)||{};var fresh=!a.id;
      Object.assign(a,{id:x.id,owner:x.owner,name:x.name,type:D.TYPE[x.type]?x.type:'artist',city:x.city,area:x.area||x.city,styles:[],travel:x.travel!==false,bio:x.bio||'Verified SINGAAR artist.',pk:pk,booked:x.blocked||[],sample:false,photos:(x.photos||[]).filter(function(u){return /^https:\/\//.test(u)}),handle:x.handle||'',wa:x.wa||''});
      if(fresh)P.unshift(a);
    });
    render(true);
  });
}
/* Pilot: artists who listed themselves at /join (Google Sheet via config.listingsApi). Shown at once, marked "Listed". */
function driveImg(id){return /^[A-Za-z0-9_-]{10,}$/.test(id)?'https://drive.google.com/thumbnail?id='+id+'&sz=w1200':''}
function loadListed(){
  if(!C.listingsApi)return;
  fetch(C.listingsApi).then(function(r){return r.json()}).then(function(j){
    ((j&&j.artists)||[]).forEach(function(x){
      var pk={};Object.keys(x.pk||{}).forEach(function(k){var v=parseInt(x.pk[k],10);if(D.SV[k]&&v>=100)pk[k]=v});
      var photos=(x.photos||[]).map(driveImg).filter(Boolean);
      if(!Object.keys(pk).length||photos.length<2||!D.AREAS[x.city||'Bangalore'])return;
      var id='l-'+x.id;if(byId(id))return;
      P.unshift({id:id,name:x.business,founder:x.founder,type:D.TYPE[x.type]?x.type:'artist',city:x.city||'Bangalore',area:x.area,styles:[],travel:x.travel!=='salon',bio:x.story||('Beauty artist in '+x.area+'.'),pk:pk,booked:[],sample:false,listed:true,photos:photos,handle:x.instagram||'',wa:/^91[6-9]\d{9}$/.test(x.whatsapp||'')?x.whatsapp:'',web:/^https?:\/\//.test(x.website||'')?x.website:'',fb:/^https?:\/\//.test(x.facebook||'')?x.facebook:''});
    });
    render(true);
  }).catch(function(){});
}
function contactBtns(p){
  var b='';
  if(p.wa)b+='<a class="btn main" href="https://wa.me/'+esc(p.wa)+'?text='+encodeURIComponent('Hi '+(p.founder||p.name)+', I found you on SINGAAR and would like to book.')+'" target="_blank" rel="noopener">WhatsApp</a>';
  if(p.handle)b+='<a class="btn '+(p.wa?'line':'main')+'" href="https://instagram.com/'+encodeURIComponent(p.handle)+'" target="_blank" rel="noopener">Instagram</a>';
  return b;
}
function rowToBooking(r){
  var b=S.bookings.filter(function(x){return x.id===r.id})[0],fresh=!b,was=b&&b.status;
  b=b||{id:r.id,msgs:[],remote:true,items:{}};
  b.remote=true;b.pid=r.artist_id;b.date=r.date;b.venue=r.venue;b.price=r.price;b.paid=!!r.paid;b.reply=r.reply||'';
  if(!(b.status==='onway'&&r.status==='confirmed'))b.status=r.status;
  if(!Object.keys(b.items||{}).length){b.items={};b.items[r.svc]=1}
  b.note=r.note||'';b.name=r.customer_name;b.created=b.created||Date.parse(r.created_at)||Date.now();
  if(fresh)S.bookings.unshift(b);
  if(was&&was!==b.status){var p=byId(b.pid),n=p?p.name:'Your artist';
    if(b.status==='confirmed'){notify('Booking confirmed',n+' accepted your booking for '+fmtDate(b.date)+'.','#/booking/'+b.id);toast(n+' accepted your booking!')}
    if(b.status==='declined'){notify('Booking declined',n+' cannot take this date. Try another artist.','#/booking/'+b.id)}
    if(b.status==='completed'){notify('Service complete','Please rate '+n+'.','#/booking/'+b.id)}
  }
  return b;
}
function loadMine(){
  if(!db||!me)return;
  db.from('bookings').select('*').eq('customer',me.id).order('created_at',{ascending:false}).limit(100).then(function(r){
    if(r.error)return;r.data.forEach(rowToBooking);save();render(true);
    var ids=r.data.map(function(x){return x.id});if(!ids.length)return;
    db.from('messages').select('*').in('booking_id',ids).order('created_at').then(function(m){if(m.error)return;m.data.forEach(addMsg);save();render(true)});
  });
  if(chan)db.removeChannel(chan);
  chan=db.channel('app-'+me.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'bookings',filter:'customer=eq.'+me.id},function(p){if(p.new&&p.new.id){rowToBooking(p.new);save();render(true)}})
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(p){if(p.new&&addMsg(p.new)){save();var b=S.bookings.filter(function(x){return x.id===p.new.booking_id})[0];if(p.new.side==='artist'&&b){var a=byId(b.pid);notify('New message',(a?a.name:'Artist')+': '+p.new.body.slice(0,80),'#/booking/'+b.id)}render(true)}})
    .on('postgres_changes',{event:'*',schema:'public',table:'locations'},function(p){if(p.new&&p.new.booking_id)liveLoc(p.new)})
    .on('postgres_changes',{event:'*',schema:'public',table:'quotes'},function(){if(route().name==='studio')loadRequests()})
    .subscribe();
}
function addMsg(m){
  var b=S.bookings.filter(function(x){return x.id===m.booking_id})[0];if(!b)return false;
  b.msgs=b.msgs||[];if(b.msgs.some(function(x){return x.id===m.id}))return false;
  b.msgs.push({id:m.id,side:m.side==='artist'?'them':'me',text:m.body,at:Date.parse(m.created_at)||Date.now()});return true;
}
var pendingLogin=null;
function needLogin(then,title){
  if(!db){toast('Sign-in is being switched on. Please try again soon.');return true}
  if(me)return false;
  pendingLogin=then;
  sheet('<div id="authHost"></div>',function(s){A.mount(s.querySelector('#authHost'),{title:title||'Sign in to continue',subtitle:'One quick step. Your number is never shown to artists.'})});
  return true;
}

/* =====================================================================
   SCREENS
   ===================================================================== */
var V={};

/* ---------- Home ---------- */
V.home=function(){
  var list=inCity().slice().sort(function(a,b){return (a.sample-b.sample)||((b.pk.bridal!=null)-(a.pk.bridal!=null))||((b.area===S.area)-(a.area===S.area))||((b.travel)-(a.travel))});
  var unread=S.notifs.some(function(n){return !n.read});
  var up=S.bookings.filter(function(b){return /requested|confirmed|onway|started/.test(b.status)&&b.date>=today()}).sort(function(a,b){return a.date<b.date?-1:1})[0];
  var h='<header class="top red"><div class="toprow"><img class="toplogo" src="'+ROOT+'assets/logo.webp" alt="SINGAAR"><button type="button" class="loc" data-act="city">'+ic('pin')+'<div><b>'+esc(S.area||S.city)+' ▾</b><small>'+(S.area?esc(S.city):'Tap to set your area')+'</small></div></button>'
    +'<button type="button" class="iconbtn" data-go="#/notifs" aria-label="Notifications">'+ic('bell')+(unread?'<i class="dot"></i>':'')+'</button></div>'
    +'<button type="button" class="search" data-go="#/search">'+ic('search')+'<span>Search bridal, mehendi, nails, artists…</span><i class="ai">AI</i></button></header>';
  if(up){var ua=byId(up.pid);h+='<div class="sec"><button type="button" class="bk" data-go="#/booking/'+esc(up.id)+'" style="margin:0"><div class="top2"><div class="ph">'+(ua?img(cover(ua)):'')+'</div><div style="flex:1;min-width:0"><span class="status '+up.status+'">'+statusLabel(up.status)+'</span><h3 style="margin-top:4px">'+esc(ua?ua.name:'Your artist')+'</h3><p class="sub">'+fmtDate(up.date)+(up.time?' · '+fmtTime(up.time):'')+'</p></div>'+ic('chev','chev')+'</div></button></div>'}
  h+='<div class="sec"><div class="rail" id="banners">'
    +bannerHtml('AI Look Studio','Upload your outfit. Get your look plan.','Our AI stylist plans every ritual for you.','app/ban-ai','#/studio','Try it free')
    +bannerHtml('Live arrival','Watch your artist arrive','Live map and arrival time on your wedding morning.','app/ban-arrive',up?'#/booking/'+up.id:'#/cat/bridal','Book an artist')
    +bannerHtml('Wedding planner','Know exactly what to book when','Countdown, checklist and looks for the family.','app/ban-plan','#/plan','Open planner')
    +bannerHtml('For artists','List yourself on SINGAAR','Free during the pilot. Your work, services and Instagram in one place.','app/ban-artist',ROOT+'join/','List yourself')
    +'</div><div class="dots" id="bdots"><i class="on"></i><i></i><i></i><i></i></div></div>';
  h+='<div class="sec"><div class="sech"><h2>What do you need today?</h2></div><div class="cats">'+D.CATS.map(function(c){return '<button type="button" class="cat" data-go="#/cat/'+c.id+'"><span class="ph">'+img(c.img,'')+'</span>'+esc(c.n)+'</button>'}).join('')+'</div></div>';
  h+='<div class="sec"><button type="button" class="aipromo" data-go="#/studio"><span class="orb">'+ic('spark')+'</span><div><b>Not sure what look suits you?</b><span>Snap your saree or lehenga. AI plans your makeup, hair, colours and artists.</span></div></button></div>';
  h+='<div class="sec"><div class="sech"><h2>Shop by occasion</h2></div><div class="rail">'+D.RITUALS.slice(0,7).map(function(r){return '<button type="button" class="occ" data-go="#/cat/occ-'+r.id+'"><span class="ph">'+img(r.img,'')+'<b>'+esc(r.n)+'</b></span></button>'}).join('')+'</div></div>';
  h+='<div class="sec"><div class="sech"><h2>Top artists in '+esc(S.city)+'</h2><button type="button" data-go="#/cat/all">See all</button></div><div class="rail">'+list.slice(0,8).map(acard).join('')+'</div></div>';
  h+='<div class="sec"><div class="sech"><h2>The SINGAAR promise</h2></div><div class="prom">'+D.PROMISES.map(function(p){return '<div>'+ic(p[0])+'<b>'+esc(p[1])+'</b><span>'+esc(p[2])+'</span></div>'}).join('')+'</div></div>';
  h+='<div class="sec"><button type="button" class="aipromo gold" data-href="'+ROOT+'join/"><span class="orb">'+ic('brush')+'</span><div><b>Are you a makeup artist or salon?</b><span>List yourself free during the pilot. Your work, services and Instagram in one place.</span></div></button></div>';
  h+='<div class="foot-brand"><b>SINGAAR</b><span>Beauty meets you · Made in India</span></div>';
  if(list.some(function(p){return p.sample}))h+='<p class="legal">Artists marked Preview show how SINGAAR works while verified artists join in your city. Photos are illustrative.</p>';
  return {html:h,nav:'home',after:function(){
    var r=$('banners'),d=$('bdots');if(!r)return;
    r.addEventListener('scroll',function(){var i=Math.round(r.scrollLeft/(r.firstChild.offsetWidth+12));[].forEach.call(d.children,function(x,j){x.className=j===i?'on':''})},{passive:true});
    clearInterval(V._bt);V._bt=setInterval(function(){if(!document.body.contains(r)){clearInterval(V._bt);return}var w=r.firstChild.offsetWidth+12,n=Math.round(r.scrollLeft/w)+1;if(n>3)n=0;r.scrollTo({left:n*w,behavior:'smooth'})},4500);
  }};
};
function occFrom(r){var v=inCity().map(function(p){return p.pk[r.s[0]]}).filter(Boolean);return v.length?'<small>from '+inr(Math.min.apply(null,v))+'</small>':''}
function bannerHtml(eb,t,p,photo,link,cta){return '<button type="button" class="banner" '+(link.indexOf('#')===0?'data-go':'data-href')+'="'+esc(link)+'">'+img(photo,'')+'<div><span class="eyebrow">'+esc(eb)+'</span><h3>'+esc(t)+'</h3><p>'+esc(p)+'</p><span class="go">'+esc(cta)+'</span></div></button>'}
function acard(p){var mk=mainKey(p),f=p.pk[mk];return '<div class="acard" role="button" tabindex="0" data-go="#/artist/'+esc(p.id)+'"><div class="ph">'+img(cover(p),'')+badge(p)+favBtn(p)+'</div><div class="bd"><h3>'+esc(p.name)+'</h3><div class="meta">'+typeLine(p)+'</div><div class="meta" style="margin-top:6px"><span class="price">'+inr(f)+'</span><span>'+esc(D.SV[mk].n)+'</span>'+'</div></div></div>'}

/* ---------- Category / occasion list ---------- */
var listState={sort:'rec',svc:'',mode:''};
V.cat=function(id){
  var title,keys;
  if(id==='all'){title='All artists';keys=Object.keys(D.SV)}
  else if(id.indexOf('occ-')===0){var r=D.RITUALS.filter(function(x){return 'occ-'+x.id===id})[0]||D.RITUALS[0];title=r.n;keys=r.s}
  else{var c=D.CATS.filter(function(x){return x.id===id})[0]||D.CATS[0];title=c.n;keys=c.k}
  if(listState.id!==id){listState={sort:'rec',svc:'',mode:'',id:id}}
  var want=listState.svc?[listState.svc]:keys;
  var L=inCity().filter(function(p){return want.some(function(k){return p.pk[k]!=null})});
  if(listState.mode==='home')L=L.filter(function(p){return p.travel});
  if(listState.mode==='salon')L=L.filter(function(p){return p.type!=='artist'});
  L=L.map(function(p){return {p:p,f:p.pk[want[0]]!=null?p.pk[want[0]]:fromPrice(p,want)}});
  if(listState.sort==='low')L.sort(function(a,b){return a.f-b.f});
  else if(listState.sort==='high')L.sort(function(a,b){return b.f-a.f});
  else L.sort(function(a,b){return (a.p.sample-b.p.sample)||((b.p.area===S.area)-(a.p.area===S.area))||(a.f-b.f)});
  var h=bar(title,{right:'<button type="button" class="iconbtn" data-go="#/map" aria-label="Map view">'+ic('map')+'</button><button type="button" class="iconbtn" data-go="#/search" aria-label="Search">'+ic('search')+'</button>'});
  if(keys.length>1)h+='<div class="fchips" role="group" aria-label="Service"><button type="button" class="fc" data-act="lsvc" data-k="" aria-pressed="'+(!listState.svc)+'">All</button>'+keys.map(function(k){return '<button type="button" class="fc" data-act="lsvc" data-k="'+k+'" aria-pressed="'+(listState.svc===k)+'">'+esc(D.SV[k].n)+'</button>'}).join('')+'</div>';
  h+='<div class="fchips" style="top:'+(keys.length>1?'115px':'57px')+'" role="group" aria-label="Sort and filter">'
    +[['rec','Recommended'],['low','Price: low to high'],['high','Price: high to low']].map(function(s){return '<button type="button" class="fc" data-act="lsort" data-k="'+s[0]+'" aria-pressed="'+(listState.sort===s[0])+'">'+s[1]+'</button>'}).join('')
    +'<button type="button" class="fc" data-act="lmode" data-k="home" aria-pressed="'+(listState.mode==='home')+'">Comes home</button><button type="button" class="fc" data-act="lmode" data-k="salon" aria-pressed="'+(listState.mode==='salon')+'">Salons and studios</button></div>';
  h+='<div class="sec" style="padding-top:6px"><p class="sub" style="margin-bottom:12px">'+L.length+' '+(L.length===1?'artist':'artists')+' in '+esc(S.city)+(id.indexOf('occ-')===0?' for your '+esc(title.toLowerCase()):'')+'</p>';
  if(id.indexOf('occ-')===0)h+='<button type="button" class="aipromo" data-act="studioFor" data-k="'+esc(id.slice(4))+'" style="margin-bottom:14px"><span class="orb">'+ic('spark')+'</span><div><b>Plan this look with AI</b><span>Add your outfit photo for colours, makeup and hair for every ritual.</span></div></button>';
  h+=L.length?'<div class="alist">'+L.map(function(x){return arow(x.p,x.f,want)}).join('')+'</div>':empty('search','No artists here yet','Try another service, or switch city. Verified artists are joining every week.','Change city','city');
  h+='</div>';
  return {html:h,nav:'home'};
};
function arow(p,f,keys){
  var has=(keys||[]).filter(function(k){return p.pk[k]!=null}).slice(0,3);
  return '<div class="arow" role="button" tabindex="0" data-go="#/artist/'+esc(p.id)+'"><div class="ph">'+img(cover(p),'')+badge(p)+'</div><div class="bd"><h3>'+esc(p.name)+'</h3><div class="meta">'+typeLine(p)+'</div>'
    +'<div class="chips">'+(p.travel?'<span class="chip ok">'+ic('home2')+'Comes home</span>':'<span class="chip">'+ic('store')+'At salon</span>')+(p.styles||[]).slice(0,2).map(function(s){return '<span class="chip gold">'+esc(s)+'</span>'}).join('')+'</div>'
    +'<div class="cta"><span class="price">'+inr(f)+' <small>onwards</small></span><span class="add">View</span></div>'
    +'<span class="sub" style="font-size:12px">'+has.map(function(k){return esc(D.SV[k].n)}).join(' · ')+'</span></div>'+favBtn(p)+'</div>';
}
function empty(icon,t,p,btn,act){return '<div class="empty"><div class="art">'+ic(icon)+'</div><h3>'+esc(t)+'</h3><p>'+esc(p)+'</p>'+(btn?'<button type="button" class="btn main" '+(act.indexOf('#')===0?'data-go':'data-act')+'="'+esc(act)+'">'+esc(btn)+'</button>':'')+'</div>'}

/* ---------- Artist profile ---------- */
V.artist=function(id){
  var p=byId(id);if(!p)return {html:bar('Artist')+empty('search','Artist not found','This profile is not available any more.','Back to home','#/home'),nav:'home'};
  var g=gallery(p),keys=Object.keys(p.pk),rt=rating(p);
  var inCart=S.cart&&S.cart.pid===p.id?S.cart.items:{};
  var nextBusy=(p.booked||[]).filter(function(d){return d>=today()}).sort().slice(0,4);
  var h='<div class="hero"><div class="slides" id="slides">'+g.map(function(x){return '<img src="'+esc(ph(x))+'" alt="" referrerpolicy="no-referrer" style="'+fpos(x)+'">'}).join('')+'</div><span class="count" id="slideN">1 / '+g.length+'</span></div>'
    +bar('',{clear:true,right:'<button type="button" class="iconbtn" data-act="share" data-id="'+esc(p.id)+'" aria-label="Share">'+ic('share')+'</button><button type="button" class="iconbtn" data-act="fav" data-id="'+esc(p.id)+'" aria-pressed="'+isFav(p)+'" aria-label="Save" style="color:'+(isFav(p)?'var(--ruby)':'inherit')+'">'+ic('heart')+'</button>'});
  h+='<div class="pcard"><div class="chips" style="margin-bottom:8px">'+(p.listed?'<span class="chip">Listed by the artist</span>':p.sample?'<span class="chip">Preview profile</span>':'<span class="chip ok">'+ic('shield')+'Verified by SINGAAR</span>')+(p.travel?'<span class="chip ok">'+ic('home2')+'Comes home</span>':'')+'</div>'
    +'<h1>'+esc(p.name)+'</h1><div class="meta" style="font-size:14px">'+typeLine(p)+'<i class="sep"></i>'+esc(p.city)+'</div>'
    +(p.founder?'<p class="sub" style="margin-top:4px">by '+esc(p.founder)+'</p>':'')+'<p style="margin-top:10px;font-size:14.5px">'+esc(p.bio)+'</p>'+(p.listed&&(p.web||p.fb||p.handle)?'<div class="chips" style="margin-top:10px">'+(p.handle?'<a class="chip gold" href="https://instagram.com/'+encodeURIComponent(p.handle)+'" target="_blank" rel="noopener">@'+esc(p.handle)+'</a>':'')+(p.web?'<a class="chip gold" href="'+esc(p.web)+'" target="_blank" rel="noopener nofollow">Website</a>':'')+(p.fb?'<a class="chip gold" href="'+esc(p.fb)+'" target="_blank" rel="noopener nofollow">Facebook</a>':'')+'</div>':'')
    +((p.styles||[]).length?'<div class="chips" style="margin-top:10px">'+p.styles.map(function(s){return '<span class="chip gold">'+esc(s)+'</span>'}).join('')+'</div>':'')
    +'<div class="stats"><div><b>'+(rt?rt.avg.toFixed(1)+' ★':'New')+'</b><span>'+(rt?rt.n+' reviews':'on SINGAAR')+'</span></div><div><b>'+keys.length+'</b><span>services</span></div><div><b>'+inr(fromPrice(p))+'</b><span>starting price</span></div></div></div>';
  h+='<div class="sec"><div class="sech"><h2>Services and prices</h2></div><div class="card" style="padding-block:4px">'+keys.map(function(k){var on=!!inCart[k],sv=D.SV[k];
    return '<div class="svc"><div class="ph">'+img((D.IMG[k]||D.IMG.bridal)[0],'')+'</div><div class="bd"><h4>'+esc(sv.n)+'</h4><p>'+esc(sv.d)+'</p><span class="price">'+inr(p.pk[k])+(MULTI[k]?' <small>per person</small>':'')+' <small>· '+(sv.t>=60?Math.round(sv.t/60*10)/10+' hr':sv.t+' min')+'</small></span></div>'
      +(p.listed?'':'<button type="button" class="add'+(on?' on':'')+'" data-act="svc" data-id="'+esc(p.id)+'" data-k="'+k+'" aria-pressed="'+on+'">'+(on?'Added':'Add')+'</button>')+'</div>'}).join('')+'</div><p class="note" style="margin-top:8px">'+ic('tag')+(p.listed?' Starting prices from the artist. Message her to confirm your look and price.':' The price you see is the price you pay. No hidden charges.')+'</p></div>';
  h+='<div class="sec"><div class="sech"><h2>Her work</h2><span class="sub">'+(p.sample?'Illustrative photos':p.listed?'Photos from the artist':'From her portfolio')+'</span></div><div class="gal">'+g.map(function(x,i){return '<button type="button" data-act="viewImg" data-i="'+i+'" data-id="'+esc(p.id)+'">'+img(x,'Work photo '+(i+1))+'</button>'}).join('')+'</div></div>';
  h+='<div class="sec"><div class="sech"><h2>Reviews</h2></div><div class="card">'+(rt?rt.list.slice(0,5).map(function(r){return '<div style="padding:6px 0"><span style="color:var(--gold)">'+'★'.repeat(r.stars)+'<span style="color:#E3D3C8">'+'★'.repeat(5-r.stars)+'</span></span> <b style="font-size:13.5px">'+esc(r.name||'You')+'</b><p style="font-size:14px;margin-top:2px">'+esc(r.text||'')+'</p></div>'}).join(''):'<p class="sub">No reviews yet. On SINGAAR, only customers who completed a booking can review, so every review is real.</p>')+'</div></div>';
  if(p.listed)h+='<div class="sec"><div class="sech"><h2>Availability</h2></div><div class="card"><p style="font-size:14.5px">Message her to check your date.</p><p class="note" style="margin-top:6px">'+(p.travel?'Comes to your home or venue.':'Visit her in '+esc(p.area)+'.')+'</p></div></div>';else h+='<div class="sec"><div class="sech"><h2>Availability</h2></div><div class="card"><p style="font-size:14.5px">'+(nextBusy.length?'Already booked on '+nextBusy.map(fmtDate).join(', ')+'. Other dates are open.':'Open for bookings. Pick your date at checkout.')+'</p>'+(p.travel?'<p class="note" style="margin-top:6px">Travels to your home or venue across '+esc(p.city)+'.</p>':'<p class="note" style="margin-top:6px">Visit the salon in '+esc(p.area)+'.</p>')+'</div></div>';
  var n=Object.keys(inCart).length,tot=n?cartTotal():0;
  h+='<div class="dock">'+(p.listed?'<div class="sum"><b>from '+inr(fromPrice(p))+'</b><span>Book directly with her</span></div><div style="display:flex;gap:8px">'+contactBtns(p)+'</div>':n?'<div class="sum"><b>'+inr(tot)+'</b><span>'+n+' service'+(n>1?'s':'')+' added</span></div><button type="button" class="btn main" data-go="#/cart">Continue '+ic('chev')+'</button>':'<div class="sum"><b>from '+inr(fromPrice(p))+'</b><span>Add a service to book</span></div><button type="button" class="btn main" data-act="addMain" data-id="'+esc(p.id)+'">Book now</button>')+'</div>';
  return {html:h,nav:false,cls:'nonav',after:function(){var s=$('slides');if(s)s.addEventListener('scroll',function(){$('slideN').textContent=(Math.round(s.scrollLeft/s.offsetWidth)+1)+' / '+g.length},{passive:true})}};
};

/* ---------- Checkout ---------- */
var co={};
V.cart=function(){
  var p=S.cart&&byId(S.cart.pid);
  if(!p||!cartCount())return {html:bar('Your cart')+empty('bag','Your cart is empty','Add a service from any artist to book it.','Find an artist','#/cat/all'),nav:'home'};
  if(co.pid!==p.id){co={pid:p.id,date:S.wedding.date&&S.wedding.date>today()&&!busyOn(p,S.wedding.date)?S.wedding.date:'',time:'',mode:p.travel?'home':'salon',pay:'after',name:S.profile.name||'',phone:S.profile.phone||'',addr:S.profile.addr||'',note:''}}
  if(!p.travel)co.mode='salon';
  var items=S.cart.items,sub=cartTotal(),adv=Math.round(sub*0.2/10)*10;
  var h=bar('Book with '+p.name);
  h+='<div class="sec"><div class="card" style="display:flex;gap:12px;align-items:center"><div class="ph" style="width:54px;height:54px;border-radius:14px;overflow:hidden;flex:none">'+img(cover(p),'')+'</div><div style="flex:1"><b>'+esc(p.name)+'</b><div class="meta">'+typeLine(p)+'</div></div><button type="button" class="link" data-go="#/artist/'+esc(p.id)+'">Add more</button></div></div>';
  h+='<div class="sec"><div class="sech"><h2>Services</h2></div><div class="card" style="padding-block:4px">'+Object.keys(items).map(function(k){return '<div class="svc" style="padding:12px 0"><div class="bd"><h4>'+esc(D.SV[k].n)+'</h4><span class="price">'+inr(p.pk[k])+(MULTI[k]?' <small>per person</small>':'')+'</span></div>'
    +(MULTI[k]?'<div style="display:flex;align-items:center;gap:10px;border:1.5px solid var(--v);border-radius:10px;padding:4px 10px;color:var(--v);font-weight:600"><button type="button" class="link" style="text-decoration:none;font-size:20px" data-act="qty" data-k="'+k+'" data-d="-1" aria-label="One less">−</button>'+items[k]+'<button type="button" class="link" style="text-decoration:none;font-size:20px" data-act="qty" data-k="'+k+'" data-d="1" aria-label="One more">+</button></div>':'<button type="button" class="link" data-act="svc" data-id="'+esc(p.id)+'" data-k="'+k+'">Remove</button>')+'</div>'}).join('')+'</div></div>';
  /* date and time */
  var days=[];for(var i=0;i<45;i++)days.push(addDays(today(),i));
  h+='<div class="sec"><div class="sech"><h2>When?</h2>'+(co.date?'<span class="sub">'+fmtDate(co.date)+'</span>':'')+'</div><div class="days" id="days">'+days.map(function(d){var x=new Date(d+'T12:00:00'),b=busyOn(p,d);return '<button type="button" class="day" data-act="day" data-d="'+d+'" aria-pressed="'+(co.date===d)+'"'+(b?' disabled aria-label="'+fmtDate(d)+', booked"':'')+'><small>'+(d===today()?'Today':WD[x.getDay()])+'</small><b>'+x.getDate()+'</b><small>'+MO[x.getMonth()]+'</small></button>'}).join('')+'</div>'
    +'<div class="field" style="margin-top:6px"><label for="coOther">Or pick a date further away</label><input type="date" id="coOther" min="'+today()+'" value="'+esc(co.date)+'"></div>';
  if(co.date)h+=D.SLOTS.map(function(g){return '<p class="sub" style="font-weight:500">'+g[0]+'</p><div class="slots">'+g[1].map(function(t){var past=co.date===today()&&+t.split(':')[0]<=new Date().getHours()+1;return '<button type="button" class="slot" data-act="slot" data-t="'+t+'" aria-pressed="'+(co.time===t)+'"'+(past?' disabled style="opacity:.35"':'')+'>'+fmtTime(t).replace(':00','')+'</button>'}).join('')+'</div>'}).join('');
  h+='</div>';
  /* where */
  h+='<div class="sec"><div class="sech"><h2>Where?</h2></div>'
    +(p.travel?'<button type="button" class="opt" data-act="mode" data-k="home" aria-pressed="'+(co.mode==='home')+'"><i class="rd"></i><div style="flex:1"><b>At my home or venue</b><span>She comes to you, with her kit. No travel charge in '+esc(p.city)+'.</span></div>'+ic('home2')+'</button>':'')
    +'<button type="button" class="opt" data-act="mode" data-k="salon" aria-pressed="'+(co.mode==='salon')+'"><i class="rd"></i><div style="flex:1"><b>At the '+(p.type==='artist'?'artist\'s studio':esc(p.type))+'</b><span>'+esc(p.area)+', '+esc(p.city)+'</span></div>'+ic('store')+'</button>'
    +'<div class="card" style="margin-top:12px"><div class="row2"><div class="field"><label for="coName">Your name</label><input id="coName" autocomplete="name" maxlength="40" value="'+esc(co.name)+'" placeholder="Name"></div><div class="field"><label for="coPhone">Mobile</label><input id="coPhone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" value="'+esc(co.phone)+'" placeholder="10 digits"></div></div>'
    +(co.mode==='home'?'<div class="field"><label for="coAddr">Home or venue address</label><textarea id="coAddr" maxlength="80" placeholder="House, street, landmark ('+esc(S.area||'area')+')">'+esc(co.addr)+'</textarea></div>':'')
    +'<div class="field" style="margin:0"><label for="coNote">Note for the artist (optional)</label><input id="coNote" maxlength="200" value="'+esc(co.note)+'" placeholder="e.g. Red Kanchipuram saree, early muhurtham"></div></div></div>';
  /* payment */
  h+='<div class="sec"><div class="sech"><h2>Payment</h2></div>'
    +'<button type="button" class="opt" data-act="pay" data-k="after" aria-pressed="'+(co.pay==='after')+'"><i class="rd"></i><div style="flex:1"><b>Pay after the service</b><span>UPI or cash to the artist, once you are happy.</span></div>'+ic('wallet')+'</button>'
    +'<button type="button" class="opt" data-act="pay" data-k="advance" aria-pressed="'+(co.pay==='advance')+'"><i class="rd"></i><div style="flex:1"><b>Pay '+inr(adv)+' advance now</b><span>Locks your date. The rest after the service.</span></div>'+ic('upi')+'</button></div>';
  h+='<div class="sec"><div class="card"><div class="kv"><span>Services</span><span>'+inr(sub)+'</span></div><div class="kv"><span>Travel</span><span style="color:var(--ok)">'+(co.mode==='home'?'Free':'Not needed')+'</span></div><div class="kv"><span>Booking fee</span><span style="color:var(--ok)">Free</span></div>'
    +'<div class="kv tot"><span>Total</span><span>'+inr(sub)+'</span></div>'+(co.pay==='advance'?'<div class="kv"><span>Pay now</span><span>'+inr(adv)+'</span></div><div class="kv"><span>Pay after the service</span><span>'+inr(sub-adv)+'</span></div>':'')+'</div>'
    +'<p class="note" style="margin-top:10px">Free cancellation up to 48 hours before. '+(p.sample?'This is a preview artist: your booking stays on this phone and no money is taken.':'Your request goes to '+esc(p.name)+', who confirms in the SINGAAR Partner app.')+'</p></div>';
  h+='<div class="dock"><div class="sum"><b>'+inr(co.pay==='advance'?adv:sub)+'</b><span>'+(co.pay==='advance'?'advance now':'pay after service')+'</span></div><button type="button" class="btn main" data-act="placeOrder">Book now</button></div>';
  return {html:h,nav:false,cls:'nonav',after:function(){
    ['coName','coPhone','coAddr','coNote'].forEach(function(i){var e=$(i);if(e)e.addEventListener('input',function(){co[{coName:'name',coPhone:'phone',coAddr:'addr',coNote:'note'}[i]]=e.value})});
    $('coOther').addEventListener('change',function(){var v=this.value;if(!v)return;if(busyOn(p,v)){toast(p.name+' is already booked on '+fmtDate(v)+'.');return}co.date=v;co.time='';render(true)});
    var sel=document.querySelector('.day[aria-pressed="true"]');if(sel)sel.scrollIntoView({inline:'center',block:'nearest'});
  }};
};
function placeOrder(){
  var p=byId(S.cart.pid);if(!p)return;
  if(!co.date){toast('Pick a date.');return}
  if(!co.time){toast('Pick a time.');return}
  if(!co.name.trim()){toast('Add your name.');$('coName').focus();return}
  var ph10=co.phone.replace(/\D/g,'');if(ph10&&!/^[6-9]\d{9}$/.test(ph10)){toast('Enter a 10-digit mobile number, or leave it empty.');return}
  if(co.mode==='home'&&co.addr.trim().length<6){toast('Add the address where she should come.');$('coAddr').focus();return}
  S.profile.name=co.name.trim();if(ph10)S.profile.phone=ph10;if(co.mode==='home')S.profile.addr=co.addr.trim();save();
  if(!p.sample&&needLogin(placeOrder,'Sign in to book '+p.name))return;
  var sub=cartTotal(),adv=Math.round(sub*0.2/10)*10;
  var b={id:p.sample?'b'+Date.now():uid(),pid:p.id,items:Object.assign({},S.cart.items),date:co.date,time:co.time,mode:co.mode,venue:co.mode==='home'?co.addr.trim():p.area+' (at the '+(p.type==='artist'?'studio':p.type)+')',name:co.name.trim(),note:co.note.trim(),price:sub,advance:co.pay==='advance'?adv:0,paid:false,status:'requested',created:Date.now(),sample:!!p.sample,remote:!p.sample,msgs:[]};
  function finish(){
    S.bookings.unshift(b);S.cart=null;co={};save();
    notify('Booking requested',p.name+' · '+fmtDate(b.date)+' at '+fmtTime(b.time),'#/booking/'+b.id);
    if(p.sample)setTimeout(function(){var x=findB(b.id);if(x&&x.status==='requested'){x.status='confirmed';x.msgs.push({side:'them',text:'Hi '+x.name.split(' ')[0]+', I have blocked '+fmtDate(x.date)+' for you. Looking forward to it!',at:Date.now()});save();notify('Booking confirmed',p.name+' accepted your booking.','#/booking/'+x.id);toast(p.name+' accepted your booking!');vibrate();render(true)}},6000);
    go('#/done/'+b.id);
  }
  if(!p.sample){
    var row={id:b.id,artist_id:p.id,customer_name:b.name.slice(0,40),svc:mainKey({pk:b.items}),date:b.date,venue:b.venue.slice(0,80),note:(Object.keys(b.items).map(function(k){return D.SV[k].n+(b.items[k]>1?' x'+b.items[k]:'')}).join(', ')+' · '+fmtTime(b.time)+(b.note?' · '+b.note:'')).slice(0,240),price:Math.min(200000,b.price)};
    var btn=document.querySelector('[data-act="placeOrder"]');if(btn){btn.disabled=true;btn.innerHTML='<span class="spin sm"></span> Booking…'}
    db.from('bookings').insert(row).then(function(r){
      if(r.error){if(btn){btn.disabled=false;btn.textContent='Book now'}toast('Could not send your booking. '+A.friendly(r.error));return}
      if(b.advance)paySheet(b,finish);else finish();
    });
    return;
  }
  if(b.advance)paySheet(b,finish);else finish();
}
function paySheet(b,done){
  sheet('<h2>Pay '+inr(b.advance)+' advance</h2><p class="sub">Test checkout: no money is taken while payments are being switched on.</p>'
    +'<div style="margin-top:14px"><button type="button" class="opt" aria-pressed="true"><i class="rd"></i><div style="flex:1"><b>UPI</b><span>GPay, PhonePe, Paytm, BHIM</span></div>'+ic('upi')+'</button><button type="button" class="opt" aria-pressed="false" disabled style="opacity:.55"><i class="rd"></i><div style="flex:1"><b>Card or net banking</b><span>Coming soon</span></div>'+ic('wallet')+'</button></div>'
    +'<button type="button" class="btn main block" style="margin-top:16px" id="payGo">Pay '+inr(b.advance)+' (test)</button><button type="button" class="btn line block" style="margin-top:8px" data-act="payLater">Pay after the service instead</button>',function(s){
      s.querySelector('#payGo').addEventListener('click',function(){var t=this;t.disabled=true;t.innerHTML='<span class="spin sm"></span> Processing…';setTimeout(function(){b.paid=true;closeSheet();done();toast('Advance paid (test). Your date is locked.')},1400)});
      s.querySelector('[data-act="payLater"]').addEventListener('click',function(e){e.stopPropagation();b.advance=0;closeSheet();done()});
    });
}
function findB(id){return S.bookings.filter(function(b){return String(b.id)===String(id)})[0]}

V.done=function(id){
  var b=findB(id),p=b&&byId(b.pid);if(!b)return V.bookings();
  var h='<div class="empty" style="padding-top:calc(60px + var(--safe-t))"><div class="art" style="background:var(--okbg);color:var(--ok);animation:pulse .6s ease">'+ic('check')+'</div><p class="eyebrow">Booking requested</p><h3 style="font-size:24px;margin-top:6px">You are all set!</h3><p>'+esc(p?p.name:'Your artist')+' will confirm shortly. We will notify you.</p></div>'
    +'<div class="sec"><div class="card"><div class="kv"><span>Date</span><b>'+fmtDate(b.date)+'</b></div><div class="kv"><span>Time</span><b>'+fmtTime(b.time)+'</b></div><div class="kv"><span>Where</span><b style="text-align:right">'+esc(b.venue)+'</b></div><div class="kv tot"><span>Total</span><span>'+inr(b.price)+'</span></div></div>'
    +'<button type="button" class="btn main block" style="margin-top:16px" data-go="#/booking/'+esc(b.id)+'">View booking</button><button type="button" class="btn line block" style="margin-top:8px" data-act="ics" data-id="'+esc(b.id)+'">Add to my calendar</button><button type="button" class="btn ghost block" style="margin-top:8px" data-go="#/home">Back to home</button></div>';
  return {html:h,nav:false,cls:'nonav'};
};

/* ---------- Bookings ---------- */
var bkTab='up';
function statusLabel(s){return {requested:'Waiting for artist',confirmed:'Confirmed',onway:'On the way',started:'In progress',completed:'Completed',declined:'Declined',cancelled:'Cancelled'}[s]||s}
V.bookings=function(){
  var up=S.bookings.filter(function(b){return /requested|confirmed|onway|started/.test(b.status)}).sort(function(a,b){return a.date<b.date?-1:1});
  var past=S.bookings.filter(function(b){return !/requested|confirmed|onway|started/.test(b.status)});
  var L=bkTab==='up'?up:past;
  var h='<header class="top"><div class="toprow"><h1 style="font-size:24px;font-weight:600;flex:1">My bookings</h1>'+(db&&!me?'<button type="button" class="btn sm ghost" data-act="login">Sign in</button>':'')+'</div></header>'
    +'<div class="tabs" style="margin-top:0"><button type="button" data-act="bktab" data-k="up" aria-pressed="'+(bkTab==='up')+'">Upcoming ('+up.length+')</button><button type="button" data-act="bktab" data-k="past" aria-pressed="'+(bkTab==='past')+'">Past ('+past.length+')</button></div><div class="sec">';
  h+=L.length?L.map(bkCard).join(''):empty('cal',bkTab==='up'?'No upcoming bookings':'Nothing here yet',bkTab==='up'?'Your next look is a few taps away.':'Completed and cancelled bookings show here.',bkTab==='up'?'Book an artist':'',bkTab==='up'?'#/cat/all':'');
  return {html:h+'</div>',nav:'bookings'};
};
function bkCard(b){
  var p=byId(b.pid);
  return '<button type="button" class="bk" data-go="#/booking/'+esc(b.id)+'"><div class="top2"><div class="ph">'+(p?img(cover(p)):'')+'</div><div style="flex:1;min-width:0"><span class="status '+b.status+'">'+statusLabel(b.status)+'</span><h3 style="margin-top:4px">'+esc(p?p.name:'Artist')+'</h3><p class="sub">'+Object.keys(b.items||{}).map(function(k){return D.SV[k]?D.SV[k].n:k}).join(', ')+'</p></div></div>'
    +'<div class="foot"><span>'+ic('cal')+' '+fmtDate(b.date)+(b.time?' · '+fmtTime(b.time):'')+'</span><b>'+inr(b.price)+'</b></div></button>';
}
V.booking=function(id){
  var b=findB(id);if(!b)return {html:bar('Booking')+empty('cal','Booking not found','It may have been removed from this phone.','My bookings','#/bookings'),nav:'bookings'};
  var p=byId(b.pid),name=p?p.name:'Your artist';
  var steps=[['requested','Request sent','Waiting for '+name+' to accept'],['confirmed','Confirmed',name+' has blocked your date'],['onway','On the way','Track her live'],['started','Getting ready','Your look is in progress'],['completed','Completed','Rate your experience']];
  var order=steps.map(function(s){return s[0]}),at=order.indexOf(b.status);
  var h=bar('Booking details',{right:'<button type="button" class="iconbtn" data-act="help" aria-label="Help">'+ic('help')+'</button>'});
  h+='<div class="sec"><div class="card"><div style="display:flex;gap:12px;align-items:center"><div class="ph" style="width:56px;height:56px;border-radius:14px;overflow:hidden;flex:none">'+(p?img(cover(p)):'')+'</div><div style="flex:1;min-width:0"><span class="status '+b.status+'">'+statusLabel(b.status)+'</span><h3 style="font-size:17px;margin-top:4px">'+esc(name)+'</h3><p class="sub">'+(p?esc(D.TYPE[p.type])+' · '+esc(p.area):'')+'</p></div>'+(p?'<button type="button" class="iconbtn" style="background:var(--rose);color:var(--v)" data-go="#/artist/'+esc(p.id)+'" aria-label="Profile">'+ic('user')+'</button>':'')+'</div>'
    +(b.sample?'<p class="note" style="margin-top:10px">Preview booking: kept on this phone only.</p>':'')+(b.reply?'<p style="margin-top:10px;font-size:14px"><b>'+esc(name)+':</b> '+esc(b.reply)+'</p>':'')+'</div>';
  if(at>-1)h+='<div class="card"><ol class="tl">'+steps.map(function(s,i){return '<li class="'+(i<at?'done':i===at?'now':'')+'">'+s[1]+'<small>'+s[2]+'</small></li>'}).join('')+'</ol></div>';
  h+='</div>';
  /* live arrival */
  if(/confirmed|onway|started/.test(b.status)){
    h+='<div class="sec"><div class="sech"><h2>Live arrival</h2>'+(b.status==='confirmed'&&b.sample?'<button type="button" data-act="track" data-id="'+esc(b.id)+'">Start preview</button>':'')+'</div><div class="map" id="map"></div><div class="eta" id="eta"><div style="flex:1"><b id="etaT">'+(b.status==='started'?'Arrived':b.status==='onway'?'…':'On '+fmtDate(b.date).split(', ')[1])+'</b><span id="etaS" style="display:block">'+(b.status==='confirmed'?(b.sample?'Tap Start preview to see how live tracking works.':'Her live location appears here when she starts travelling.'):b.status==='started'?'Your artist has arrived.':'Updating live…')+'</span></div>'+ic('pin')+'</div></div>';
  }
  /* details */
  h+='<div class="sec"><div class="sech"><h2>Details</h2></div><div class="card">'+Object.keys(b.items||{}).map(function(k){return '<div class="kv"><span>'+esc(D.SV[k]?D.SV[k].n:k)+(b.items[k]>1?' × '+b.items[k]:'')+'</span><span>'+(p&&p.pk[k]?inr(p.pk[k]*b.items[k]):'')+'</span></div>'}).join('')
    +'<div class="kv tot"><span>Total</span><span>'+inr(b.price)+'</span></div><div class="kv"><span>Payment</span><span>'+(b.paid?'Advance '+inr(b.advance)+' paid':b.advance?'Advance '+inr(b.advance)+' due':'After the service')+'</span></div></div>'
    +'<div class="card"><div class="kv"><span>'+ic('cal')+' Date</span><b>'+fmtDate(b.date)+'</b></div>'+(b.time?'<div class="kv"><span>'+ic('clock')+' Time</span><b>'+fmtTime(b.time)+'</b></div>':'')+'<div class="kv"><span>'+ic('pin')+' Where</span><b style="text-align:right;max-width:60%">'+esc(b.venue)+'</b></div>'+(b.note?'<div class="kv"><span>Note</span><span style="text-align:right;max-width:60%">'+esc(b.note)+'</span></div>':'')+'</div></div>';
  /* chat */
  if(!/declined|cancelled/.test(b.status)){
    h+='<div class="sec"><div class="sech"><h2>Chat with '+esc(name.split(' ')[0])+'</h2></div><div class="card"><div class="chat" id="chat">'+((b.msgs||[]).length?b.msgs.map(function(m){return '<div class="msg '+m.side+'">'+esc(m.text)+'</div>'}).join(''):'<div class="msg sys">Ask about the look, timing or anything else. Phone numbers stay private.</div>')+'</div>'
      +'<form class="chatf" id="chatF"><input id="chatIn" maxlength="500" placeholder="Type a message" autocomplete="off" aria-label="Message"><button type="submit" aria-label="Send">'+ic('send')+'</button></form></div></div>';
  }
  /* actions */
  h+='<div class="sec">';
  if(b.status==='completed'&&!b.rated)h+='<div class="card"><h3 style="font-size:17px">How was your look?</h3><div class="stars" id="stars" style="margin:10px 0">'+[1,2,3,4,5].map(function(n){return '<button type="button" data-n="'+n+'" aria-label="'+n+' stars">★</button>'}).join('')+'</div><div class="field"><textarea id="rvT" maxlength="300" placeholder="Tell other brides what you loved"></textarea></div><button type="button" class="btn main block" data-act="review" data-id="'+esc(b.id)+'">Submit review</button></div>';
  if(b.rated)h+='<div class="card"><p>You rated '+esc(name)+' '+'★'.repeat(b.rated)+'. Thank you!</p><button type="button" class="btn line block" style="margin-top:10px" data-act="rebook" data-id="'+esc(b.id)+'">Book again</button></div>';
  if(b.status==='started'&&b.sample)h+='<button type="button" class="btn main block" data-act="finish" data-id="'+esc(b.id)+'">Mark service complete (preview)</button>';
  if(/requested|confirmed/.test(b.status)&&b.advance&&!b.paid)h+='<button type="button" class="btn gold block" style="margin-top:8px" data-act="payNow" data-id="'+esc(b.id)+'">Pay '+inr(b.advance)+' advance</button>';
  if(/requested|confirmed|onway/.test(b.status))h+='<button type="button" class="btn line block" style="margin-top:8px" data-act="ics" data-id="'+esc(b.id)+'">'+ic('cal')+' Add to calendar</button>';
  if(/requested|confirmed/.test(b.status))h+='<button type="button" class="btn ghost block" style="margin-top:8px" data-act="cancel" data-id="'+esc(b.id)+'">Cancel booking</button>';
  if(/declined|cancelled/.test(b.status))h+='<button type="button" class="btn main block" data-go="#/cat/all">Find another artist</button>';
  h+='</div>';
  return {html:h,nav:'bookings',after:function(){
    var c=$('chat');if(c)c.scrollTop=c.scrollHeight;
    var f=$('chatF');if(f)f.addEventListener('submit',function(e){e.preventDefault();sendMsg(b,$('chatIn').value)});
    var st=$('stars');if(st)st.addEventListener('click',function(e){var x=e.target.closest('[data-n]');if(!x)return;st.setAttribute('data-v',x.getAttribute('data-n'));[].forEach.call(st.children,function(y,i){y.className=i<+x.getAttribute('data-n')?'on':''})});
    if($('map'))drawMap(b);
  }};
};
function sendMsg(b,text){
  text=String(text||'').trim();if(!text)return;
  var p=byId(b.pid);
  if(!b.sample&&db){
    db.from('messages').insert({booking_id:b.id,side:'customer',body:text.slice(0,500)}).select().single().then(function(r){if(r.error){toast('Could not send. '+A.friendly(r.error));return}addMsg(r.data);save();render(true)});
    $('chatIn').value='';return;
  }
  b.msgs.push({side:'me',text:text,at:Date.now()});save();render(true);
  var hist=b.msgs.slice(-10).map(function(m){return {from:m.side==='me'?'customer':'artist',text:m.text}});
  aiCall({task:'chat',message:text,history:hist,artist:{name:p.name,prices:Object.keys(p.pk).map(function(k){return {label:D.SV[k].n,amount:p.pk[k]}})},booking:{service:Object.keys(b.items).map(function(k){return D.SV[k].n}).join(', '),date:b.date,venue:b.venue,status:b.status}})
    .then(function(j){return j.reply}).catch(function(){
      var t=text.toLowerCase();
      if(/price|cost|rate|how much|discount/.test(t))return 'My prices are exactly as listed on my SINGAAR profile, and there are no extra charges.';
      if(/time|when|early|arrive|reach/.test(t))var hrs=Math.ceil((Math.max.apply(null,Object.keys(b.items).map(function(k){return D.SV[k].t}))+30)/60);return 'I will reach by '+(b.time?fmtTime(b.time):'the booked time')+' with my kit. Your look takes about '+hrs+' hour'+(hrs>1?'s':'')+'. You can track me live in the app.';
      if(/trial/.test(t))return 'Yes, I can do a trial a few weeks before. Shall we fix a date?';
      return 'Thank you! Noted. I will confirm everything with you before the day.';
    }).then(function(reply){setTimeout(function(){b.msgs.push({side:'them',text:reply,at:Date.now()});save();if(route().name==='booking')render(true)},700)});
}

/* ---------- live map (arrival) ---------- */
var mapObj=null,sim=null,MR={};
function ll(city,area){var a=D.AREAS[city]||{};return a[area]||D.CENTER[city]||D.CENTER.Bangalore}
function drawMap(b){
  if(!window.L)return;
  var p=byId(b.pid);if(!p)return;
  if(mapObj){mapObj.remove();mapObj=null}
  var from=ll(p.city,p.area),to=ll(p.city,S.area&&D.AREAS[p.city][S.area]?S.area:Object.keys(D.AREAS[p.city])[Math.max(0,Object.keys(D.AREAS[p.city]).indexOf(p.area)+2)%Object.keys(D.AREAS[p.city]).length]);
  if(b.mode==='salon')to=from;
  mapObj=L.map('map',{zoomControl:false,attributionControl:true}).setView(to,13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapObj);
  L.marker(to,{icon:L.divIcon({className:'',html:'<div class="pin me"></div>',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(mapObj);
  var her=L.marker(b.pos||from,{icon:L.divIcon({className:'',html:'<div class="pin" style="background-image:url(\''+ph(cover(p))+'\')"></div>',iconSize:[38,38],iconAnchor:[19,19]})}).addTo(mapObj);
  MR[b.id]={her:her,to:to,from:from};
  if(b.mode!=='salon')L.polyline([from,to],{color:'#A3101F',weight:4,opacity:.6,dashArray:'6 8'}).addTo(mapObj);
  mapObj.fitBounds(L.latLngBounds([from,to]).pad(.35));
  if(b.sample&&b.status==='onway')runSim(b);
  if(!b.sample&&db)db.from('locations').select('*').eq('booking_id',b.id).maybeSingle().then(function(r){if(r.data)liveLoc(r.data)});
}
function liveLoc(row){
  var b=findB(row.booking_id);if(!b)return;
  b.pos=[row.lat,row.lng];
  if(b.status==='confirmed'){b.status='onway';save()}
  var m=MR[b.id];if(m&&mapObj&&document.getElementById('map')){m.her.setLatLng(b.pos);var km=mapObj.distance(b.pos,m.to)/1000,min=Math.max(1,Math.round(km/22*60));var e=$('etaT');if(e){e.textContent=km<.15?'Arrived':min+' min away';$('etaS').textContent=km.toFixed(1)+' km · updated '+new Date(Date.parse(row.updated_at)||Date.now()).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}}
}
function runSim(b){
  clearInterval(sim);var t0=b.simStart||Date.now(),dur=40000;b.simStart=t0;save();
  sim=setInterval(function(){
    var m=MR[b.id];if(!m||!document.getElementById('map')){clearInterval(sim);return}
    var k=Math.min(1,(Date.now()-t0)/dur),f=m.from,t=m.to,pos=[f[0]+(t[0]-f[0])*k,f[1]+(t[1]-f[1])*k+Math.sin(k*Math.PI)*0.004];
    m.her.setLatLng(pos);
    var km=mapObj.distance(pos,t)/1000,min=Math.max(0,Math.ceil((1-k)*Math.max(8,km/22*60)));
    $('etaT').textContent=k>=1?'Arrived':min+' min away';$('etaS').textContent=k>=1?'Your artist is at your door.':km.toFixed(1)+' km away · on the way to you';
    if(k>=1){clearInterval(sim);b.status='started';b.msgs.push({side:'them',text:'I have arrived! Coming up now.',at:Date.now()});save();notify('She has arrived',(byId(b.pid)||{}).name+' is at your door.','#/booking/'+b.id);vibrate();setTimeout(function(){render(true)},900)}
  },500);
}

/* ---------- Map of artists ---------- */
V.map=function(){
  var h=bar('Artists near you in '+S.city)+'<div style="position:relative"><div id="amap" style="height:calc(100vh - 57px - var(--navh));height:calc(100dvh - 57px - var(--navh) - var(--safe-b))"></div></div>';
  return {html:h,nav:'home',cls:'nonav',after:function(){
    if(!window.L)return;if(mapObj){mapObj.remove();mapObj=null}
    mapObj=L.map('amap',{zoomControl:false}).setView(D.CENTER[S.city],12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapObj);
    var used={};
    inCity().forEach(function(p){
      var c=ll(p.city,p.area),n=used[p.area]=(used[p.area]||0)+1,pos=[c[0]+(n-1)*0.0045,c[1]+(n-1)*0.004];
      L.marker(pos,{icon:L.divIcon({className:'',html:'<div style="transform:translate(-50%,-100%);display:inline-block;white-space:nowrap;background:'+(p.sample?'#A3101F':'#14966B')+';color:#fff;font:600 12.5px Jost,sans-serif;outline:1px solid #D8AA5C;padding:5px 9px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.3);border:2px solid #fff">'+inr(fromPrice(p))+'</div>',iconSize:[0,0]})}).addTo(mapObj).on('click',function(){go('#/artist/'+p.id)});
    });
  }};
};

/* ---------- AI Look Studio ---------- */
var st={rit:'muhurtham',photo:null,busy:false,out:null};
V.studio=function(){
  var R=D.RITUALS.filter(function(r){return r.id===st.rit})[0]||D.RITUALS[0];
  var h='<div class="studio-hero"><p class="eyebrow">AI Look Studio</p><h1>Your look plan, made by our AI stylist</h1><p>Snap your outfit. Get colours, makeup and hair for every ritual.</p></div>';
  h+='<form class="sec" id="stF" novalidate><p class="sub" style="font-weight:500;margin-bottom:8px">What is the occasion?</p><div class="occpick">'+D.RITUALS.map(function(r){return '<button type="button" data-act="rit" data-k="'+r.id+'" aria-pressed="'+(st.rit===r.id)+'">'+esc(r.n)+'</button>'}).join('')+'</div>'
    +'<label class="upload" style="margin-top:14px"><span class="th">'+(st.photo?'<img src="'+st.photo+'" alt="Your outfit">':ic('camera'))+'</span><span><b>'+(st.photo?'Outfit added':'Add a photo of your outfit')+'</b><span>'+(st.photo?'Tap to change':'Saree, lehenga or gown. Optional, but it makes the plan yours.')+'</span></span><input type="file" id="stPhoto" accept="image/*" class="sr"></label>'
    +'<div class="row2" style="margin-top:14px"><div class="field"><label for="stDate">Date</label><input type="date" id="stDate" min="'+today()+'" value="'+esc(st.date||S.wedding.date||'')+'"></div><div class="field"><label for="stTime">Muhurtham or start time</label><input type="time" id="stTime" value="'+esc(st.time||'')+'"></div></div>'
    +'<div class="field"><label for="stBudget">Budget for this look: <b id="stBv">'+inr(st.budget||25000)+'</b></label><input type="range" id="stBudget" min="2000" max="100000" step="1000" value="'+(st.budget||25000)+'" style="accent-color:var(--v)"></div>'
    +'<div class="field"><label for="stNotes">Anything else? (your words)</label><textarea id="stNotes" maxlength="500" placeholder="e.g. Red Kanchipuram silk, temple jewellery, I want a natural look that lasts a long muhurtham">'+esc(st.notes||'')+'</textarea></div>'
    +'<button type="submit" class="btn main block" '+(st.busy?'disabled':'')+'>'+(st.busy?'<span class="spin sm"></span> Creating your look plan…':ic('spark')+' Create my look plan')+'</button></form>';
  h+='<div class="sec" id="stOut">'+(st.busy?'<div class="think"><div class="spin"></div><b>Our AI stylist is working…</b><span class="sub">'+(st.photo?'Reading the colours and work on your outfit, then planning':'Planning')+' each look for your '+esc(R.n.toLowerCase())+'.</span></div>':st.out?briefHtml(st.out):'')+'</div>';
  if(db)h+='<div class="sec" id="myReq"></div>';
  if(S.briefs.length)h+='<div class="sec"><div class="sech"><h2>Saved look plans</h2></div>'+S.briefs.slice(0,6).map(function(x,i){return '<button type="button" class="bk" data-act="openBrief" data-i="'+i+'"><div class="top2"><div class="ph" style="background:linear-gradient(135deg,'+(x.brief.palette[0]||{hex:'#B3121F'}).hex+','+(x.brief.palette[1]||{hex:'#C9974A'}).hex+')"></div><div style="flex:1"><h3>'+esc(x.ritual)+'</h3><p class="sub">'+fmtDate(x.date)+' · '+esc(x.city)+'</p></div>'+ic('chev','chev')+'</div></button>'}).join('')+'</div>';
  return {html:h,nav:'studio',after:function(){
    $('stPhoto').addEventListener('change',function(){var f=this.files[0];if(!f)return;if(!/^image\//.test(f.type)){toast('Please choose a photo.');return}shrink(f,1024).then(function(d){if(!d){toast('Could not read that photo.');return}st.photo=d;keepForm();render(true)})});
    $('stBudget').addEventListener('input',function(){$('stBv').textContent=inr(this.value)});
    $('stF').addEventListener('submit',function(e){e.preventDefault();makeBrief()});
    if(db)loadRequests();
    if(st.out&&st.scroll){st.scroll=false;$('stOut').scrollIntoView({behavior:'smooth'})}
  }};
};
function keepForm(){var g=function(i){var e=$(i);return e?e.value:''};st.date=g('stDate');st.time=g('stTime');st.budget=+g('stBudget')||25000;st.notes=g('stNotes')}
function shrink(file,max){return new Promise(function(res){var im=new Image(),u=URL.createObjectURL(file);im.onload=function(){var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',0.82))};im.onerror=function(){URL.revokeObjectURL(u);res(null)};im.src=u})}
function makeBrief(){
  keepForm();
  if(!st.date){toast('Choose the date of your occasion.');$('stDate').focus();return}
  var R=D.RITUALS.filter(function(r){return r.id===st.rit})[0];
  st.busy=true;st.out=null;render(true);$('stOut').scrollIntoView({behavior:'smooth',block:'center'});
  aiCall({task:'brief',ritual:R.n,city:S.city,budget:st.budget,notes:st.notes,services:Object.keys(D.SV),image:st.photo||undefined})
    .then(function(j){return {brief:j.brief,ai:true,saw:j.sawPhoto}})
    .catch(function(){return {brief:localBrief(R),ai:false}})
    .then(function(x){
      if(!x.brief.services||!x.brief.services.length)x.brief.services=R.s.slice();
      st.busy=false;st.scroll=true;
      st.out={ritual:R.n,rit:R.id,date:st.date,time:st.time,city:S.city,area:S.area,budget:st.budget,notes:st.notes,brief:x.brief,ai:x.ai,saw:x.saw,at:Date.now()};
      S.briefs.unshift(st.out);S.briefs=S.briefs.slice(0,10);save();vibrate();render(true);
    });
}
/* when the AI stylist cannot be reached, the phone still builds a useful plan from SINGAAR's own rules */
function localBrief(R){
  var PAL={muhurtham:[['Kumkum red','#B3121F'],['Temple gold','#C9974A'],['Rose nude','#C98B7E'],['Kajal black','#1E1414']],nikah:[['Emerald','#1F6E4A'],['Ivory','#F3EBDD'],['Antique gold','#B8893E'],['Dusty rose','#D69A92']],church:[['Ivory','#F6F0E6'],['Blush','#E8B9B0'],['Champagne','#D9C29A'],['Mauve','#9E6B78']],mehendi:[['Leaf green','#6E8B3D'],['Marigold','#F2A007'],['Coral','#F06A4E'],['Gold','#C9974A']],haldi:[['Turmeric','#E8B10C'],['Marigold','#F2A007'],['Peach','#F4B38B'],['Ivory','#F3EBDD']]};
  var p=(PAL[R.id]||[['Wine','#6E0B12'],['Soft gold','#D8B26A'],['Rose','#D48A8A'],['Mocha','#7A5546']]).map(function(x){return {name:x[0],hex:x[1]}});
  var LOOK={makeup:{muhurtham:'Long-wear matte base, defined kajal, bold red lip for the muhurtham',nikah:'Soft glow base, smoky kohl eyes, rosy nude lip',church:'Dewy skin, soft brown eyes, blush-pink lip',haldi:'Barely-there skin tint, waterproof mascara, tinted balm',mehendi:'Fresh glowy skin, colourful liner, peach lip'}[R.id]||'Balanced base that lasts, eyes to match the outfit, lip in the palette',
    hair:{muhurtham:'Classic bun with jasmine strings and a jadai',nikah:'Low bun or soft waves under the dupatta, pinned securely',church:'Soft curls or a romantic updo for the veil',haldi:'Simple braid with fresh flowers',mehendi:'Side braid or loose waves with floral pins'}[R.id]||'Style that frames the face and holds all day',
    draping:/muhurtham|reception|family/.test(R.id)?'Pleats pinned firm for long sitting, pallu set for photos':'Dupatta or veil pinned so it stays in place',
    jewellery:/nikah/.test(R.id)?'Jhoomar or passa, matching earrings':'Temple or kundan set matched to the gold tones'};
  return {summary:'A '+R.n.toLowerCase()+' look that suits your day and lasts through the rituals.',outfit:'',palette:p,looks:[{ritual:R.n,makeup:LOOK.makeup,hair:LOOK.hair,draping:LOOK.draping,jewellery:LOOK.jewellery}],services:R.s.slice(),
    checklist:['Book your artist and a trial date','Start a glow facial 3 weeks before','Drink water and sleep well the week before','Keep outfit, jewellery and pins ready the night before','Share the venue address and timing with your artist'],
    ask_artist:['Can we do a trial before the day?','Which products do you use for long wear?','How early will you arrive?']};
}
function matches(o){
  var k=o.brief.services;
  return P.filter(shown).filter(function(p){return p.city===o.city&&k.some(function(s){return p.pk[s]!=null})&&!busyOn(p,o.date)})
    .map(function(p){var cover2=k.filter(function(x){return p.pk[x]!=null});return {p:p,cost:cover2.reduce(function(s,x){return s+p.pk[x]},0),cover:cover2.length}})
    .sort(function(a,b){return (b.cover-a.cover)||((o.budget&&a.cost>o.budget?1:0)-(o.budget&&b.cost>o.budget?1:0))||(a.p.sample-b.p.sample)||(a.cost-b.cost)}).slice(0,6);
}
function briefHtml(o){
  var br=o.brief,k=br.services,dur=Math.max.apply(null,k.map(function(s){return (D.SV[s]||{t:60}).t}));
  var h='<article class="brief"><div class="bh"><p class="eyebrow">Your SINGAAR Look Brief</p><h3>'+esc(o.ritual)+' · '+fmtDate(o.date)+(o.time?' · '+fmtTime(o.time):'')+'</h3><p style="margin-top:6px;font-size:14.5px">'+esc(br.summary)+'</p>'
    +(br.outfit?'<p class="note" style="margin-top:6px"><b>Your outfit:</b> '+esc(br.outfit)+'</p>':'')+(!o.ai?'<p class="note" style="margin-top:6px">Quick plan made on your phone. Our AI stylist adds detail from your photo when it is online.</p>':'')+'</div><div class="bb">';
  if(br.palette.length)h+='<h4>Colours for you</h4><div class="pal">'+br.palette.map(function(c){return '<span><i style="background:'+esc(c.hex)+'"></i>'+esc(c.name)+'</span>'}).join('')+'</div>';
  h+='<h4>Your looks</h4>'+br.looks.map(function(l){return '<div class="look"><h5>'+esc(l.ritual||o.ritual)+'</h5><dl>'+(l.makeup?'<dt>Makeup</dt><dd>'+esc(l.makeup)+'</dd>':'')+(l.hair?'<dt>Hair</dt><dd>'+esc(l.hair)+'</dd>':'')+(l.draping?'<dt>Draping</dt><dd>'+esc(l.draping)+'</dd>':'')+(l.jewellery?'<dt>Jewellery</dt><dd>'+esc(l.jewellery)+'</dd>':'')+'</dl></div>'}).join('');
  h+='<h4>Services you need</h4><div class="chips">'+k.map(function(s){return '<span class="chip">'+esc(D.SV[s]?D.SV[s].n:s)+'</span>'}).join('')+'</div>';
  if(o.time)h+='<h4>Your timeline</h4><ol class="tl"><li class="done">'+fmtTime(minus(o.time,dur+30))+'<small>Artist arrives</small></li><li class="done">'+fmtTime(minus(o.time,30))+'<small>You are ready for photos</small></li><li class="now">'+fmtTime(o.time)+'<small>'+esc(o.ritual)+'</small></li></ol>';
  h+='<h4>Before the day</h4><ul class="ticks">'+br.checklist.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>';
  if(br.ask_artist&&br.ask_artist.length)h+='<h4>Ask your artist</h4><ul class="ticks">'+br.ask_artist.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>';
  h+='</div></article>';
  var m=matches(o);
  h+='<div class="sech" style="margin-top:20px"><h2>Artists for this look</h2><span class="sub">'+esc(o.city)+'</span></div>';
  h+=m.length?'<div class="alist">'+m.map(function(x){return '<div class="arow"><div class="ph">'+img(cover(x.p),'')+badge(x.p)+'</div><div class="bd" style="padding-right:0"><h3>'+esc(x.p.name)+'</h3><div class="meta">'+typeLine(x.p)+'</div><span class="sub">'+x.cover+' of '+k.length+' services · '+inr(x.cost)+(o.budget&&x.cost>o.budget?' · above budget':'')+'</span><div class="cta"><button type="button" class="link" data-go="#/artist/'+esc(x.p.id)+'">Profile</button><button type="button" class="add on" data-act="bookBrief" data-id="'+esc(x.p.id)+'">Book look</button></div></div></div>'}).join('')+'</div>':'<p class="sub">Verified artists are joining in '+esc(o.city)+'. Send your brief and they will quote you.</p>';
  h+='<div style="display:flex;gap:10px;margin-top:14px">'+(db?'<button type="button" class="btn main block" data-act="sendBrief">Get quotes from verified artists</button>':'')+'<button type="button" class="btn line'+(db?'':' block')+'" data-act="shareBrief">'+ic('share')+(db?'':' Share with family')+'</button></div>';
  if(db)h+='<p class="note" style="margin-top:8px">Verified artists in '+esc(o.city)+' reply with their price. You choose. Your number is never shared.</p>';
  return h;
}
function sendBrief(){
  var o=st.out;if(!o||!db)return;
  if(needLogin(sendBrief,'Sign in to get quotes'))return;
  var row={customer_name:(S.profile.name||(me.email||'Customer').split('@')[0]).slice(0,40),city:o.city,area:(o.area||'').slice(0,60),ritual:o.ritual.slice(0,40),date:o.date,time:o.time||null,budget:o.budget||0,services:o.brief.services,brief:o.brief,notes:(o.notes||'').slice(0,500)};
  db.from('requests').insert(row).select().single().then(function(r){if(r.error){toast('Could not send. '+A.friendly(r.error));return}toast('Sent! Verified artists in '+o.city+' will quote you here.');notify('Look brief sent','Artists in '+o.city+' will reply with quotes.','#/studio');loadRequests()});
}
var reqs=[],quotes={};
function loadRequests(){
  if(!db||!me){var n=$('myReq');if(n)n.innerHTML='';return}
  db.from('requests').select('*').eq('customer',me.id).order('created_at',{ascending:false}).limit(10).then(function(r){
    if(r.error)return;reqs=r.data||[];var ids=reqs.map(function(x){return x.id});
    if(!ids.length){drawReq();return}
    db.from('quotes').select('*').in('request_id',ids).order('price').then(function(q){quotes={};(q.data||[]).forEach(function(x){(quotes[x.request_id]=quotes[x.request_id]||[]).push(x)});drawReq()});
  });
}
function drawReq(){
  var n=$('myReq');if(!n)return;if(!reqs.length){n.innerHTML='';return}
  n.innerHTML='<div class="sech"><h2>Quotes from artists</h2></div>'+reqs.map(function(r){var q=quotes[r.id]||[];return '<div class="card"><b>'+esc(r.ritual)+'</b> <span class="sub">· '+fmtDate(r.date)+' · '+(r.status==='booked'?'Booked':q.length?q.length+' quote'+(q.length>1?'s':''):'Waiting for quotes')+'</span>'
    +q.map(function(x){var a=byId(x.artist_id);return '<div class="kv" style="align-items:center;border-top:1px solid var(--line);margin-top:8px;padding-top:10px"><div><b>'+esc(a?a.name:'Verified artist')+'</b><p class="sub">'+esc(x.message||'')+'</p></div><div style="text-align:right"><b>'+inr(x.price)+'</b>'+(r.status==='open'&&x.status==='sent'?'<br><button type="button" class="add on" style="margin-top:4px" data-act="acceptQ" data-r="'+r.id+'" data-q="'+x.id+'">Accept</button>':'<br><span class="sub">'+esc(x.status)+'</span>')+'</div></div>'}).join('')+'</div>'}).join('');
}
function acceptQuote(rid,qid){
  var r=reqs.filter(function(x){return x.id===rid})[0],q=(quotes[rid]||[]).filter(function(x){return x.id===qid})[0];if(!r||!q)return;
  var bid=uid();
  db.from('bookings').insert({id:bid,artist_id:q.artist_id,customer_name:r.customer_name,svc:(r.services&&r.services[0])||'bridal',date:r.date,venue:(r.area||r.city).slice(0,80),note:('Look request: '+r.ritual).slice(0,240),price:q.price,status:'confirmed',quote_id:q.id}).then(function(res){
    if(res.error){toast('Could not book. '+A.friendly(res.error));return}
    db.from('quotes').update({status:'accepted'}).eq('id',q.id).then(function(){
      (quotes[rid]||[]).forEach(function(z){if(z.id!==q.id&&z.status==='sent')db.from('quotes').update({status:'declined'}).eq('id',z.id)});
      db.from('requests').update({status:'booked'}).eq('id',rid).then(function(){toast('Booked! Your artist is confirmed.');loadMine();loadRequests()});
    });
  });
}

/* ---------- Wedding planner ---------- */
V.plan=function(){
  var w=S.wedding,dl=w.date?daysTo(w.date):null;
  var h='<header class="top"><div class="toprow"><h1 style="font-size:24px;font-weight:600;flex:1">Wedding planner</h1><button type="button" class="iconbtn" data-act="sharePlan" aria-label="Share plan">'+ic('share')+'</button></div></header><div class="sec" style="padding-top:4px">';
  if(w.date&&dl>=0){var pc=Math.max(0,Math.min(1,1-dl/180)),C2=2*Math.PI*42;
    h+='<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="8"/><circle cx="50" cy="50" r="42" fill="none" stroke="#F2D79B" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+C2+'" stroke-dashoffset="'+(C2*(1-pc))+'" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" fill="#fff" font-size="22" font-family="Cinzel">'+Math.round(pc*100)+'%</text></svg><div><b>'+dl+'</b><span>'+(dl===1?'day':'days')+' to go'+(w.name?' · '+esc(w.name):'')+'</span><span style="margin-top:6px">'+fmtDate(w.date)+' · <button type="button" class="link" style="color:var(--gold-hi)" data-act="wedDate">Change</button></span></div></div>';
  }else{
    h+='<div class="card"><h3 style="font-size:18px">When is the big day?</h3><p class="sub" style="margin:4px 0 12px">We count back and tell you exactly what to book when.</p><div class="row2"><div class="field"><label for="wDate">Wedding date</label><input type="date" id="wDate" min="'+today()+'"></div><div class="field"><label for="wName">Whose wedding?</label><input id="wName" maxlength="30" placeholder="e.g. Priya and Arjun"></div></div><button type="button" class="btn main block" data-act="saveWed">Start my plan</button></div>';
  }
  h+='</div>';
  /* rituals */
  h+='<div class="sec"><div class="sech"><h2>Your rituals</h2><span class="sub">Tap all that apply</span></div><div class="occpick" style="flex-wrap:wrap">'+D.RITUALS.map(function(r){return '<button type="button" data-act="ritToggle" data-k="'+r.id+'" aria-pressed="'+(S.rituals.indexOf(r.id)>-1)+'">'+esc(r.n)+'</button>'}).join('')+'</div>';
  var need={};S.rituals.forEach(function(id){var r=D.RITUALS.filter(function(x){return x.id===id})[0];if(r)r.s.forEach(function(s){need[s]=(need[s]||[]).concat(r.n)})});
  if(Object.keys(need).length)h+='<div class="card" style="margin-top:12px"><p class="sub" style="margin-bottom:6px">Looks you will need</p>'+Object.keys(need).map(function(k){return '<div class="kv"><span><b>'+esc(D.SV[k].n)+'</b><br><small class="sub">'+esc(need[k].join(', '))+'</small></span><button type="button" class="add" data-go="#/cat/'+(D.CATS.filter(function(c){return c.k.indexOf(k)>-1})[0]||D.CATS[0]).id+'">Find</button></div>'}).join('')+'</div>';
  h+='</div>';
  /* checklist */
  h+='<div class="sec"><div class="sech"><h2>What to book when</h2></div><div class="card tasks">'+D.PLAN.map(function(t,i){var due=w.date?addDays(w.date,-t.d):'',past=due&&due<today(),done=!!S.done[i];
    return '<div class="t'+(past?' past':'')+'"><div class="when"><b>'+(w.date?(t.d?fmtDate(due).split(', ')[1]:'The day'):(t.d?t.d+' days':'The day'))+'</b>'+(w.date&&t.d?'before':t.d?'before':'')+'</div><div style="flex:1"><h4 style="'+(done?'text-decoration:line-through;color:var(--muted)':'')+'">'+esc(t.t)+'</h4><p>'+esc(t.why)+'</p>'
      +'<div style="display:flex;gap:8px"><button type="button" class="btn sm ghost" data-act="taskDone" data-i="'+i+'">'+(done?'Undo':'Mark done')+'</button>'+(done?'':'<button type="button" class="btn sm line" data-go="#/cat/'+((D.CATS.filter(function(c){return c.k.indexOf(t.s)>-1})[0]||D.CATS[0]).id)+'">Book</button>')+'</div></div></div>'}).join('')+'</div></div>';
  /* family */
  h+='<div class="sec"><div class="sech"><h2>Bridal party and family</h2><span class="sub">'+S.family.length+' people</span></div><div class="card">'
    +(S.family.length?S.family.map(function(f,i){return '<div class="person"><span class="av">'+esc(initials(f.n))+'</span><div class="bd"><b>'+esc(f.n)+'</b><span>'+esc(f.r)+' · '+esc(D.SV[f.s]?D.SV[f.s].n:'')+'</span></div><button type="button" class="x" data-act="famDel" data-i="'+i+'" aria-label="Remove '+esc(f.n)+'">×</button></div>'}).join(''):'<p class="sub">Add sisters, friends and family who need a look. Book them together, one artist team.</p>')
    +'<form id="famF" style="margin-top:12px" novalidate><div class="row2"><div class="field"><label for="fN">Name</label><input id="fN" maxlength="30" placeholder="Name"></div><div class="field"><label for="fR">Relation</label><select id="fR"><option>Sister</option><option>Mother</option><option>Friend</option><option>Cousin</option><option>Aunt</option><option>Groom\'s side</option></select></div></div><div class="field"><label for="fS">Look</label><select id="fS"><option value="bridesmaid">Bridesmaid look</option><option value="guest">Wedding-guest look</option><option value="saree">Saree draping</option><option value="hair">Hair styling</option><option value="mehendi">Mehendi</option></select></div><button type="submit" class="btn line block">Add person</button></form>'
    +(S.family.length?'<button type="button" class="btn main block" style="margin-top:10px" data-go="#/cat/occ-family">Book looks for everyone</button>':'')+'</div></div>';
  return {html:h,nav:'plan',after:function(){
    var f=$('famF');if(f)f.addEventListener('submit',function(e){e.preventDefault();var n=$('fN').value.trim();if(!n){toast('Add a name.');return}S.family.push({n:n.slice(0,30),r:$('fR').value,s:$('fS').value});save();render(true)});
  }};
};

/* ---------- Account ---------- */
V.account=function(){
  var nm=S.profile.name||(me&&me.email?me.email.split('@')[0]:'');
  var h='<header class="top red" style="padding-bottom:22px"><div class="me"><span class="av">'+esc(nm?initials(nm):'☺')+'</span><div style="flex:1;min-width:0"><b>'+esc(nm||'Hello, beautiful')+'</b><span style="opacity:.85;font-size:13.5px">'+(me?esc(me.email||'Signed in'):'Sign in to sync bookings across phones')+'</span></div>'+(!me&&db?'<button type="button" class="btn sm gold" data-act="login">Sign in</button>':'')+'</div></header><div class="sec">';
  h+='<div class="menu">'+mi('#/bookings','cal','My bookings',S.bookings.length?S.bookings.length+'':'')+mi('#/saved','heart','Saved artists',S.favs.length?S.favs.length+'':'')+mi('#/studio','spark','My look plans',S.briefs.length?S.briefs.length+'':'')+mi('#/plan','plan','Wedding planner','')+mi('#/notifs','bell','Notifications',S.notifs.filter(function(n){return !n.read}).length||'')+'</div>';
  h+='<div class="menu">'+mi('profile','user','Profile and address',S.profile.addr?'Saved':'')+mi('city','pin','City and area',esc(S.area?S.area+', ':'')+esc(S.city))+mi('lang','globe','Language','English')+'</div>';
  h+='<div class="menu">'+mi('help','help','Help and support','')+mi('share','share','Share SINGAAR with a friend','')+(NATIVE?'':mi('install','download','Get the SINGAAR app',''))+mi(ROOT+'join/','brush','I am an artist: list my work','')+'</div>';
  h+='<div class="menu">'+mi('about','doc','About, terms and privacy','')+(me?mi('logout','logout','Sign out',''):'')+'</div>';
  h+='<div class="foot-brand"><b>SINGAAR</b><span>Beauty meets you · Version 1.0</span></div></div>';
  return {html:h,nav:'account'};
};
function mi(target,icon,label,right){var go2=target.indexOf('#')===0?'data-go="'+target+'"':target.indexOf('/')>-1?'data-href="'+target+'"':'data-act="'+target+'"';return '<button type="button" class="mi" '+go2+'>'+ic(icon)+'<span>'+label+'</span>'+(right?'<small>'+right+'</small>':'')+ic('chev','chev')+'</button>'}

V.saved=function(){
  var L=S.favs.map(byId).filter(Boolean);
  return {html:bar('Saved artists')+'<div class="sec">'+(L.length?'<div class="alist">'+L.map(function(p){return arow(p,fromPrice(p),Object.keys(p.pk))}).join('')+'</div>':empty('heart','No saved artists yet','Tap the heart on any artist to keep her here.','Explore artists','#/cat/all'))+'</div>',nav:'account'};
};
V.notifs=function(){
  var h=bar('Notifications')+'<div class="sec">'+(S.notifs.length?S.notifs.map(function(n,i){return '<button type="button" class="bk" data-act="notif" data-i="'+i+'" style="'+(n.read?'':'border-left:4px solid var(--v)')+'"><b>'+esc(n.t)+'</b><p class="sub">'+esc(n.b)+'</p><small class="sub">'+new Date(n.at).toLocaleString([], {day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'</small></button>'}).join(''):empty('bell','All caught up','Booking updates, messages and quotes show here.','',''))+'</div>';
  S.notifs.forEach(function(n){n.read=true});save();
  return {html:h,nav:'account',after:drawNav};
};

/* ---------- Search ---------- */
V.search=function(){
  var h='<header class="bar"><button type="button" class="iconbtn" data-act="back" aria-label="Back">'+ic('back')+'</button><form id="sF" class="search" style="margin:0;height:44px;box-shadow:none;border:1.5px solid var(--line);flex:1">'+ic('search')+'<input id="sIn" type="search" placeholder="Try: bridal under 20k in Indiranagar" autocomplete="off" aria-label="Search" autofocus></form></header><div id="sOut" class="sec"></div>';
  return {html:h,nav:false,cls:'nonav',after:function(){
    var i=$('sIn');i.addEventListener('input',function(){drawSearch(i.value)});
    $('sF').addEventListener('submit',function(e){e.preventDefault();aiSearch(i.value)});
    drawSearch('');setTimeout(function(){i.focus()},120);
  }};
};
function drawSearch(q){
  var o=$('sOut');if(!o)return;q=q.trim().toLowerCase();
  if(!q){o.innerHTML=(S.recent.length?'<div class="sech"><h2>Recent</h2></div><div class="chips" style="margin-bottom:18px">'+S.recent.map(function(r){return '<button type="button" class="fc" data-act="sRecent" data-k="'+esc(r)+'">'+esc(r)+'</button>'}).join('')+'</div>':'')
    +'<div class="sech"><h2>Popular</h2></div><div class="chips" style="margin-bottom:18px">'+['Bridal makeup','Mehendi','Saree draping','Party makeup','Nail art','Hair spa','Pre-bridal'].map(function(r){return '<button type="button" class="fc" data-act="sRecent" data-k="'+r+'">'+r+'</button>'}).join('')+'</div>'
    +'<button type="button" class="aipromo" data-go="#/studio"><span class="orb">'+ic('spark')+'</span><div><b>Describe it in your own words</b><span>Type anything, like "nikah look under 20k in Frazer Town". Our AI finds the right artists.</span></div></button>';return}
  var svc=Object.keys(D.SV).filter(function(k){return D.SV[k].n.toLowerCase().indexOf(q)>-1||k.indexOf(q)>-1});
  var art=P.filter(shown).filter(function(p){return (p.name+' '+p.area+' '+(p.styles||[]).join(' ')).toLowerCase().indexOf(q)>-1});
  var occ=D.RITUALS.filter(function(r){return r.n.toLowerCase().indexOf(q)>-1});
  var h='<button type="button" class="opt" data-act="aiSearch" style="margin-bottom:14px">'+ic('spark')+'<div style="flex:1"><b>Ask SINGAAR AI</b><span>"'+esc(q)+'"</span></div>'+ic('chev','chev')+'</button>';
  if(svc.length)h+='<div class="sech"><h2>Services</h2></div><div class="menu" style="margin-bottom:14px">'+svc.map(function(k){var c=D.CATS.filter(function(x){return x.k.indexOf(k)>-1})[0];return '<button type="button" class="mi" data-act="sSvc" data-k="'+k+'" data-c="'+(c?c.id:'all')+'">'+ic('tag')+'<span>'+esc(D.SV[k].n)+'</span>'+ic('chev','chev')+'</button>'}).join('')+'</div>';
  if(occ.length)h+='<div class="sech"><h2>Occasions</h2></div><div class="menu" style="margin-bottom:14px">'+occ.map(function(r){return mi('#/cat/occ-'+r.id,'cal',esc(r.n),'')}).join('')+'</div>';
  if(art.length)h+='<div class="sech"><h2>Artists and salons</h2></div><div class="alist">'+art.slice(0,12).map(function(p){return arow(p,fromPrice(p),Object.keys(p.pk))}).join('')+'</div>';
  if(!svc.length&&!art.length&&!occ.length)h+='<p class="sub">No direct match. Tap Ask SINGAAR AI and we will understand what you mean.</p>';
  o.innerHTML=h;
}
function rememberQ(q){q=q.trim();if(!q)return;S.recent=[q].concat(S.recent.filter(function(x){return x!==q})).slice(0,6);save()}
function aiSearch(q){
  q=String(q||'').trim();if(q.length<3){toast('Type a few words.');return}rememberQ(q);
  var o=$('sOut');if(o)o.innerHTML='<div class="think"><div class="spin"></div><b>Understanding your request…</b></div>';
  aiCall({task:'look',text:q,looks:Object.keys(D.SV),styles:['soft glam','traditional','airbrush','HD','minimal','nail art']}).then(function(j){
    if(j.city&&j.city!==S.city){S.city=j.city;save()}
    var k=j.occ||'bridal',c=D.CATS.filter(function(x){return x.k.indexOf(k)>-1})[0];
    listState={id:c?c.id:'all',svc:k,sort:j.budget?'low':'rec',mode:''};
    if(j.budget)toast('Showing '+D.SV[k].n.toLowerCase()+' in '+S.city+', lowest price first (your budget '+inr(j.budget)+').');
    go('#/cat/'+(c?c.id:'all'));
  }).catch(function(){
    var t=q.toLowerCase(),k=Object.keys(D.SV).filter(function(x){return t.indexOf(x)>-1||t.indexOf(D.SV[x].n.toLowerCase().split(' ')[0])>-1})[0]||(/nikah|muhurtham|wedding|bride|kalyan/.test(t)?'bridal':/nail/.test(t)?'nails':/hair/.test(t)?'hair':/skin|facial|glow/.test(t)?'facial':'party');
    if(/chennai/.test(t))S.city='Chennai';if(/bangalore|bengaluru/.test(t))S.city='Bangalore';save();
    var c=D.CATS.filter(function(x){return x.k.indexOf(k)>-1})[0];listState={id:c?c.id:'all',svc:k,sort:/under|budget|cheap|k\b/.test(t)?'low':'rec',mode:''};
    go('#/cat/'+(c?c.id:'all'));
  });
}

/* ---------- Onboarding (first open only) ---------- */
var OB=[['app/bride','Beauty meets you','Book verified women makeup artists, salons and stylists, for every ritual and every occasion.'],['app/ban-ai','Your look, planned by AI','Snap your outfit. Our AI stylist plans colours, makeup, hair and draping, then finds the right artists.'],['app/ban-arrive','Watch her arrive','Fair prices you can see, pay after the service, and live tracking on the big morning.']];
function onboard(i){
  var w=document.createElement('div');w.className='ob';w.id='ob';document.body.appendChild(w);
  function draw(n){
    if(n<OB.length){var o=OB[n];w.innerHTML='<div class="img">'+img(o[0],'')+'</div><button class="skip" data-ob="city">Skip</button><img class="logo" src="'+ROOT+'assets/logo.webp" alt="SINGAAR"><div class="bd"><h1>'+esc(o[1])+'</h1><p>'+esc(o[2])+'</p><div class="dots">'+OB.map(function(_,j){return '<i class="'+(j===n?'on':'')+'"></i>'}).join('')+'</div><button class="btn gold block" data-ob="'+(n+1)+'">'+(n===OB.length-1?'Get started':'Next')+'</button></div>'}
    else w.innerHTML='<div class="img">'+img('app/occ-reception','')+'</div><img class="logo" src="'+ROOT+'assets/logo.webp" alt="SINGAAR"><div class="bd"><h1>Where are you?</h1><p>We show artists who serve your city.</p><div class="citypick"><button data-obc="Bangalore"><b>Bangalore</b><span>'+Object.keys(D.AREAS.Bangalore).length+' areas</span></button><button data-obc="Chennai"><b>Chennai</b><span>'+Object.keys(D.AREAS.Chennai).length+' areas</span></button></div></div>';
  }
  w.addEventListener('click',function(e){var b=e.target.closest('[data-ob]');if(b){var v=b.getAttribute('data-ob');draw(v==='city'?OB.length:+v);return}var c=e.target.closest('[data-obc]');if(c){S.city=c.getAttribute('data-obc');S.onboarded=true;save();w.remove();render()}});
  var sx=0;w.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  w.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,cur=w.querySelector('[data-ob]:not(.skip)');if(Math.abs(dx)>50&&cur){var n=+cur.getAttribute('data-ob')-1;draw(Math.max(0,Math.min(OB.length,n+(dx<0?1:-1))))}},{passive:true});
  draw(i||0);
}

/* =====================================================================
   ROUTER AND NAV
   ===================================================================== */
function route(){var m=location.hash.replace(/^#\/?/,'').split('/');return {name:m[0]||'home',arg:decodeURIComponent(m.slice(1).join('/')||'')}}
var lastKey='';
function render(keepScroll){
  var r=route(),fn=V[r.name]||V.home,y=window.scrollY,key=r.name+'/'+r.arg;
  if(r.name!=='booking'){clearInterval(sim)}
  if(mapObj){mapObj.remove();mapObj=null}
  var out=fn(r.arg);
  var s=$('screen');s.className='screen'+(out.cls?' '+out.cls:'');s.innerHTML=out.html;
  curNav=out.nav;drawNav();$('nav').hidden=out.nav===false;
  if(keepScroll&&key===lastKey)window.scrollTo(0,y);else window.scrollTo(0,0);
  lastKey=key;
  if(out.after)out.after();
}
var curNav='home';
/* four tabs only: everything else (planner, saved, map) is one tap away inside them */
var NAV=[['home','Home','home','#/home'],['bookings','Bookings','cal','#/bookings'],['studio','AI Studio','spark','#/studio'],['plan','Planner','plan','#/plan'],['account','Account','user','#/account']];
function drawNav(){
  var up=S.bookings.filter(function(b){return /requested|confirmed|onway|started/.test(b.status)}).length,un=S.notifs.filter(function(n){return !n.read}).length;
  var cur=curNav;
  $('nav').innerHTML=NAV.map(function(n){var fab=n[0]==='studio';return '<button type="button" class="'+(fab?'fab':'')+'" data-go="'+n[3]+'"'+(cur===n[0]?' aria-current="page"':'')+'>'+(fab?'<span class="orb">'+ic('spark')+'</span>':ic(n[2]))+'<span>'+n[1]+'</span>'+(n[0]==='bookings'&&up?'<i class="badge">'+up+'</i>':'')+(n[0]==='account'&&un?'<i class="badge">'+un+'</i>':'')+'</button>'}).join('');
}

/* ---------- one click handler for the whole app ---------- */
var ACT={
  back:back,
  city:function(){
    sheet('<h2>Your city and area</h2><p class="sub">We show artists who serve you.</p><div class="tabs" style="margin:14px 0">'+Object.keys(D.AREAS).map(function(c){return '<button type="button" data-act="setCity" data-k="'+c+'" aria-pressed="'+(S.city===c)+'">'+c+'</button>'}).join('')+'</div><div class="chips">'+Object.keys(D.AREAS[S.city]).map(function(a){return '<button type="button" class="fc" data-act="setArea" data-k="'+esc(a)+'" aria-pressed="'+(S.area===a)+'">'+esc(a)+'</button>'}).join('')+'</div><button type="button" class="btn line block" style="margin-top:16px" data-act="locate">'+ic('pin')+' Use my current location</button>');
  },
  setCity:function(e,x){S.city=x.getAttribute('data-k');S.area='';save();ACT.city();render(true)},
  setArea:function(e,x){S.area=x.getAttribute('data-k');save();closeSheet();render(true);toast('Showing artists near '+S.area)},
  locate:function(){
    if(!navigator.geolocation){toast('Location is not available on this phone.');return}
    navigator.geolocation.getCurrentPosition(function(pos){
      var best=null,bd=1e9;Object.keys(D.AREAS).forEach(function(c){Object.keys(D.AREAS[c]).forEach(function(a){var p=D.AREAS[c][a],d=Math.pow(p[0]-pos.coords.latitude,2)+Math.pow(p[1]-pos.coords.longitude,2);if(d<bd){bd=d;best=[c,a]}})});
      if(best&&bd<0.05){S.city=best[0];S.area=best[1];save();closeSheet();render(true);toast('Showing artists near '+S.area)}else toast('SINGAAR is live in Bangalore and Chennai. Pick your area.');
    },function(){toast('Allow location, or pick your area.')},{timeout:8000});
  },
  fav:function(e,x){e.stopPropagation();var id=x.getAttribute('data-id'),i=S.favs.indexOf(id);if(i>-1)S.favs.splice(i,1);else{S.favs.push(id);vibrate();toast('Saved. Find her in Account > Saved artists.')}save();render(true)},
  svc:function(e,x){toggleSvc(x.getAttribute('data-id'),x.getAttribute('data-k'))},
  cartReplace:function(e,x){S.cart=null;closeSheet();toggleSvc(x.getAttribute('data-id'),x.getAttribute('data-k'))},
  addMain:function(e,x){var p=byId(x.getAttribute('data-id'));toggleSvc(p.id,mainKey(p));if(S.cart)go('#/cart')},
  qty:function(e,x){var k=x.getAttribute('data-k'),v=(S.cart.items[k]||1)+(+x.getAttribute('data-d'));if(v<1)delete S.cart.items[k];else S.cart.items[k]=Math.min(15,v);if(!cartCount())S.cart=null;save();render(true)},
  day:function(e,x){co.date=x.getAttribute('data-d');co.time='';render(true)},
  slot:function(e,x){co.time=x.getAttribute('data-t');render(true)},
  mode:function(e,x){co.mode=x.getAttribute('data-k');render(true)},
  pay:function(e,x){co.pay=x.getAttribute('data-k');render(true)},
  placeOrder:placeOrder,
  lsvc:function(e,x){listState.svc=x.getAttribute('data-k');render(true)},
  lsort:function(e,x){listState.sort=x.getAttribute('data-k');render(true)},
  lmode:function(e,x){var k=x.getAttribute('data-k');listState.mode=listState.mode===k?'':k;render(true)},
  bktab:function(e,x){bkTab=x.getAttribute('data-k');render(true)},
  track:function(e,x){var b=findB(x.getAttribute('data-id'));b.status='onway';b.simStart=Date.now();b.msgs.push({side:'them',text:'I have started from '+((byId(b.pid)||{}).area||'my place')+'. See you soon!',at:Date.now()});save();notify('She is on the way','Track her live in the app.','#/booking/'+b.id);render(true)},
  finish:function(e,x){var b=findB(x.getAttribute('data-id'));b.status='completed';save();notify('Look complete','Please rate '+((byId(b.pid)||{}).name||'your artist')+'.','#/booking/'+b.id);render(true)},
  review:function(e,x){var b=findB(x.getAttribute('data-id')),n=+($('stars').getAttribute('data-v')||0);if(!n){toast('Tap the stars to rate.');return}b.rated=n;S.reviews.unshift({pid:b.pid,stars:n,text:$('rvT').value.trim().slice(0,300),name:(S.profile.name||'You').split(' ')[0],at:Date.now()});save();toast('Thank you for your review!');render(true)},
  rebook:function(e,x){var b=findB(x.getAttribute('data-id'));S.cart={pid:b.pid,items:Object.assign({},b.items)};save();go('#/cart')},
  payNow:function(e,x){var b=findB(x.getAttribute('data-id'));paySheet(b,function(){save();render(true)})},
  cancel:function(e,x){var id=x.getAttribute('data-id');sheet('<h2>Cancel this booking?</h2><p class="sub">Free cancellation up to 48 hours before. The artist will be told at once.</p><div style="display:flex;gap:10px;margin-top:18px"><button class="btn line block" data-close>Keep it</button><button class="btn main block" data-act="cancelYes" data-id="'+esc(id)+'">Yes, cancel</button></div>')},
  cancelYes:function(e,x){var b=findB(x.getAttribute('data-id'));closeSheet();if(b.remote&&db){db.from('bookings').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',b.id).then(function(r){if(r.error){toast('Could not cancel. '+A.friendly(r.error));return}b.status='cancelled';save();render(true)});return}b.status='cancelled';save();toast('Booking cancelled.');render(true)},
  ics:function(e,x){var b=findB(x.getAttribute('data-id')),p=byId(b.pid);var d=b.date.replace(/-/g,''),t=(b.time||'09:00').replace(':','')+'00';
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SINGAAR//App//EN','BEGIN:VEVENT','UID:'+b.id+'@singaar','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z','DTSTART:'+d+'T'+t,'DURATION:PT3H','SUMMARY:SINGAAR: '+(p?p.name:'Artist')+' ('+Object.keys(b.items).map(function(k){return D.SV[k].n}).join(', ')+')','LOCATION:'+String(b.venue).replace(/[,;]/g,' '),'BEGIN:VALARM','TRIGGER:-PT2H','ACTION:DISPLAY','DESCRIPTION:Your SINGAAR artist arrives soon','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='singaar-booking.ics';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)},
  rit:function(e,x){keepForm();st.rit=x.getAttribute('data-k');render(true)},
  studioFor:function(e,x){st.rit=x.getAttribute('data-k');st.out=null;go('#/studio')},
  bookBrief:function(e,x){var p=byId(x.getAttribute('data-id'));if(p&&p.listed){go('#/artist/'+p.id);return}var o=st.out,items={};o.brief.services.forEach(function(k){if(p.pk[k]!=null)items[k]=1});if(!Object.keys(items).length)items[mainKey(p)]=1;S.cart={pid:p.id,items:items};save();co={};go('#/cart');setTimeout(function(){if(o.date&&!busyOn(p,o.date)){co.date=o.date;if(o.time){var hh=minus(o.time,(Math.max.apply(null,Object.keys(items).map(function(k){return D.SV[k].t}))+30)).split(':')[0];co.time=hh+':00'}co.note=('Look plan: '+o.ritual+'. '+(o.notes||'')).slice(0,200);render(true)}},30)},
  sendBrief:sendBrief,
  shareBrief:function(){var o=st.out;shareText('My '+o.ritual+' look plan from SINGAAR: '+o.brief.summary+' Colours: '+o.brief.palette.map(function(c){return c.name}).join(', ')+'. Services: '+o.brief.services.map(function(k){return D.SV[k]?D.SV[k].n:k}).join(', ')+'.')},
  openBrief:function(e,x){st.out=S.briefs[+x.getAttribute('data-i')];st.rit=st.out.rit||st.rit;st.scroll=true;render(true)},
  acceptQ:function(e,x){acceptQuote(x.getAttribute('data-r'),x.getAttribute('data-q'))},
  saveWed:function(){var d=$('wDate').value;if(!d){toast('Pick the wedding date.');return}S.wedding={date:d,name:$('wName').value.trim().slice(0,30)};save();vibrate();render(true)},
  wedDate:function(){S.wedding.date='';save();render(true)},
  ritToggle:function(e,x){var k=x.getAttribute('data-k'),i=S.rituals.indexOf(k);if(i>-1)S.rituals.splice(i,1);else S.rituals.push(k);save();render(true)},
  taskDone:function(e,x){var i=x.getAttribute('data-i');S.done[i]=!S.done[i];save();render(true)},
  famDel:function(e,x){S.family.splice(+x.getAttribute('data-i'),1);save();render(true)},
  sharePlan:function(){var w=S.wedding;shareText((w.name||'Our wedding')+(w.date?' on '+fmtDate(w.date):'')+'. Our SINGAAR beauty plan: '+D.PLAN.map(function(t){return (w.date?(t.d?fmtDate(addDays(w.date,-t.d)):'The day'):t.d+' days before')+': '+t.t}).join('; ')+'.')},
  login:function(){needLogin(function(){toast('Signed in.')},'Sign in to SINGAAR')},
  logout:function(){A.signOut().then(function(){me=null;S.bookings=S.bookings.filter(function(b){return !b.remote});save();toast('Signed out.');render()})},
  profile:function(){sheet('<h2>Profile and address</h2><p class="sub">Saved on this phone to make booking faster.</p><div style="margin-top:14px"><div class="field"><label for="pN">Name</label><input id="pN" maxlength="40" value="'+esc(S.profile.name)+'" autocomplete="name"></div><div class="field"><label for="pP">Mobile</label><input id="pP" type="tel" inputmode="numeric" maxlength="10" value="'+esc(S.profile.phone)+'" autocomplete="tel"></div><div class="field"><label for="pA">Home address</label><textarea id="pA" maxlength="80">'+esc(S.profile.addr)+'</textarea></div><button type="button" class="btn main block" data-act="profileSave">Save</button></div>')},
  profileSave:function(){var ph10=$('pP').value.replace(/\D/g,'');if(ph10&&!/^[6-9]\d{9}$/.test(ph10)){toast('Enter a 10-digit mobile number.');return}S.profile={name:$('pN').value.trim().slice(0,40),phone:ph10,addr:$('pA').value.trim().slice(0,80)};save();closeSheet();toast('Saved.');render(true)},
  lang:function(){sheet('<h2>Language</h2><div style="margin-top:12px"><button type="button" class="opt" aria-pressed="true" data-close><i class="rd"></i><div style="flex:1"><b>English</b></div></button>'+['हिन्दी Hindi','தமிழ் Tamil','ಕನ್ನಡ Kannada'].map(function(l){return '<button type="button" class="opt" aria-pressed="false" disabled style="opacity:.6"><i class="rd"></i><div style="flex:1"><b>'+l+'</b><span>Coming soon</span></div></button>'}).join('')+'</div>')},
  help:function(){sheet('<h2>Help and support</h2><p class="sub">We usually reply within an hour, 8 am to 10 pm.</p><div class="menu" style="margin-top:14px">'
    +[['How do I pay?','Pay the artist after the service by UPI or cash, or pay a small advance in the app to lock your date.'],['Can I cancel?','Yes, free up to 48 hours before. Open the booking and tap Cancel.'],['Are the artists verified?','Artists marked Verified sent us their ID and portfolio, and our team checked them. Preview profiles show how SINGAAR works.'],['Is my number shared?','No. You chat in the app. Artists never see your number unless you share it.']].map(function(q){return '<details class="mi" style="display:block"><summary style="font-weight:500;cursor:pointer">'+q[0]+'</summary><p class="sub" style="margin-top:6px">'+q[1]+'</p></details>'}).join('')
    +'</div><a class="btn main block" style="margin-top:14px" href="https://wa.me/?text='+encodeURIComponent('Hi SINGAAR, I need help with my booking.')+'" target="_blank" rel="noopener">Chat with us on WhatsApp</a><a class="btn line block" style="margin-top:8px" href="mailto:hello@singaar.in?subject=Help%20with%20SINGAAR">Email us</a>')},
  share:function(){shareText('SINGAAR: book verified women makeup artists and salons for every ritual, with AI look plans and live arrival tracking. '+location.origin+location.pathname)},
  install:installApp,
  about:function(){sheet('<img src="'+ROOT+'assets/logo.webp" alt="SINGAAR" style="width:180px;margin:4px auto 10px;border-radius:14px"><h2 style="text-align:center">Beauty meets you</h2><p class="sub" style="text-align:center;margin-bottom:12px">SINGAAR connects you with independent women artists and trusted salons for every ritual and occasion, at fair, visible prices.</p><div class="card"><p class="note">Artists marked Preview and their photos are illustrative and show how SINGAAR works; bookings with them stay on your phone. Verified artists are real, checked by our team. Payments run in test mode until our payment partner is live. We never sell your data. Location is used only to show artists near you and is never stored.</p></div><a class="btn line block" style="margin-top:12px" href="'+ROOT+'#/home">Open the SINGAAR website</a>')},
  notif:function(e,x){var n=S.notifs[+x.getAttribute('data-i')];if(n&&n.link)go(n.link)},
  viewImg:function(e,x){var p=byId(x.getAttribute('data-id')),g=gallery(p),i=+x.getAttribute('data-i');sheet('<img src="'+esc(ph(g[i]))+'" alt="" style="width:100%;border-radius:16px;max-height:70vh;object-fit:contain;background:#000"><p class="note" style="text-align:center;margin-top:8px">'+(p.sample?'Illustrative photo':esc(p.name)+' · portfolio')+'</p>')},
  sRecent:function(e,x){var q=x.getAttribute('data-k');$('sIn').value=q;rememberQ(q);drawSearch(q)},
  sSvc:function(e,x){rememberQ($('sIn').value);listState={id:x.getAttribute('data-c'),svc:x.getAttribute('data-k'),sort:'rec',mode:''};go('#/cat/'+x.getAttribute('data-c'))},
  aiSearch:function(){aiSearch($('sIn').value)}
};
function shareText(t){if(navigator.share){navigator.share({title:'SINGAAR',text:t}).catch(function(){})}else{window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank','noopener')}}
/* artist profile share uses the artist's link */
var shareArtist=function(id){var p=byId(id);shareText(p.name+' on SINGAAR ('+(D.TYPE[p.type]||'')+', '+p.area+'): '+location.origin+location.pathname+'#/artist/'+encodeURIComponent(p.id))};

document.addEventListener('click',function(e){
  var t=e.target,x;
  if(t.closest('[data-close]')){closeSheet();return}
  if((x=t.closest('[data-act]'))){var a=x.getAttribute('data-act');
    if(a==='share'&&x.getAttribute('data-id')){shareArtist(x.getAttribute('data-id'));return}
    if(a!=='payLater'&&ACT[a]){e.preventDefault();ACT[a](e,x);return}}
  if((x=t.closest('[data-go]'))){e.preventDefault();var h=x.getAttribute('data-go');if(!$('sheetWrap').hidden)closeSheet();go(h);return}
  if((x=t.closest('[data-href]'))){location.href=x.getAttribute('data-href');return}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!$('sheetWrap').hidden)closeSheet();
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"][data-go]')){e.preventDefault();go(e.target.getAttribute('data-go'))}
});
window.addEventListener('hashchange',function(){depth++;closeSheet();render()});

/* ---------- install: Android APK, or Add to Home Screen ---------- */
var deferred=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e});
function installApp(){
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  sheet('<h2>Get the SINGAAR app</h2><p class="sub">Faster booking, live arrival alerts, and your plans saved on your phone.</p>'
    +'<a class="btn main block" style="margin-top:16px" href="'+APK+'">'+ic('download')+' Download for Android</a>'
    +(deferred?'<button type="button" class="btn line block" style="margin-top:8px" id="pwaGo">Install from this browser</button>':'')
    +(ios?'<div class="card" style="margin-top:12px"><b>On iPhone</b><p class="sub" style="margin-top:4px">Tap the Share button in Safari, then <b>Add to Home Screen</b>. SINGAAR opens like an app. The App Store version is coming soon.</p></div>':'<p class="note" style="margin-top:10px">If Android asks, allow installing from your browser. Google Play listing is coming soon.</p>'),
    function(s){var b=s.querySelector('#pwaGo');if(b)b.addEventListener('click',function(){deferred.prompt();deferred.userChoice.then(function(){deferred=null;closeSheet()})})});
}

/* ---------- start ---------- */
if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
loadArtists();loadListed();
render();
if(A.onChange)A.onChange(function(u){var was=me&&me.id;me=u;if(u&&u.id!==was){loadMine();if(pendingLogin){var f=pendingLogin;pendingLogin=null;closeSheet();f()}}if((u&&u.id)!==was)render(true)});
setTimeout(function(){var sp=$('splash');sp.classList.add('gone');setTimeout(function(){sp.remove()},600);if(!S.onboarded)onboard()},NATIVE?1200:900);
/* keep "requested" preview bookings moving if the app was closed before they were confirmed */
S.bookings.forEach(function(b){if(b.sample&&b.status==='requested'&&Date.now()-b.created>6000){b.status='confirmed';save()}});
window.SGApp={state:S,go:go};
})();
