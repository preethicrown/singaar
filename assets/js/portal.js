/* SINGAAR portals: "My SINGAAR" for customers and the dashboard for artists.
   Prototype: both sides run in this browser on the shared store from app.js, so a booking made as a customer
   appears in the artist's inbox, and her reply (and blocked dates) flow back to the customer and to search. */
(function(){
  var SG=window.SG;if(!SG)return;
  var Store=SG.Store,P=SG.P,SV=SG.SV,esc=SG.esc,inr=SG.inr,$=function(i){return document.getElementById(i)};
  var TODAY='2026-10-21',LISTINGS='singaar.listings.v2';
  var ui={role:'client',tab:'bookings',artist:null,month:'2026-12'};
  var STATUS={requested:['Waiting for reply','wait'],confirmed:['Confirmed','ok'],declined:['Declined','no'],cancelled:['Cancelled','no'],completed:['Completed','done']};
  var DEMO_NAMES=['Meera','Divya','Ananya','Sana','Keerthi','Nisha'];

  function p(id){return SG.byId(id)}
  function mine(){return Store.d.bookings}
  function save(){Store.save()}
  function daysTo(d){var a=new Date(TODAY+'T00:00:00'),b=new Date(d+'T00:00:00');return Math.round((b-a)/86400000)}
  function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
  function statusBadge(s){var x=STATUS[s]||[s,'wait'];return '<span class="st '+x[1]+'">'+x[0]+'</span>'}
  function artistList(){return P.slice().sort(function(a,b){return (a.city===SG.state.city?0:1)-(b.city===SG.state.city?0:1)||a.name.localeCompare(b.name)})}
  function defaultArtist(){
    var m=Store.d.mine&&p(Store.d.mine);if(m)return m.id;
    var l=artistList();return l.length?l[0].id:null;
  }

  /* ---------- open and shell ---------- */
  function open(role){
    if(role)ui.role=role;
    if(!ui.artist||!p(ui.artist))ui.artist=defaultArtist();
    render();SG.openModalOnly('portalModal');
  }
  function refresh(){if(!$('portalModal').hidden)render()}
  function render(){
    var isC=ui.role==='client';
    var tabs=isC?[['bookings','My bookings'],['saved','Saved artists']]:[['requests','Requests'],['calendar','Calendar'],['services','Services and prices'],['earnings','Earnings']];
    if(!tabs.some(function(t){return t[0]===ui.tab}))ui.tab=tabs[0][0];
    var h='<button class="x" type="button" data-close aria-label="Close">×</button>'
      +'<div class="phead"><div><p class="eyebrow">'+(isC?'Customer':'Artist dashboard')+'</p><h2 id="portalTitle">'+(isC?'My SINGAAR':'Your SINGAAR dashboard')+'</h2>'
      +'<p class="meta">'+(isC?daysLine():'Manage requests, dates, prices and earnings.')+'</p></div></div>'
      +'<div class="pbody">'
      +'<div class="demobar"><div class="rolebar" role="group" aria-label="Switch view"><button type="button" data-act="role" data-v="client" aria-pressed="'+isC+'">I am a customer</button><button type="button" data-act="role" data-v="artist" aria-pressed="'+!isC+'">I am an artist</button></div>'
      +'<label class="autor"><input type="checkbox" data-act="auto"'+(Store.d.autoReply?' checked':'')+'> Sample artists reply automatically (demo)</label></div>'
      +'<p class="note">Demo mode: switch between customer and artist to see both sides of a booking. Everything stays on this device.</p>';
    if(!isC){
      h+='<div class="field"><label for="pArtist">Viewing the dashboard of</label><select id="pArtist" data-act="artist">'+artistList().map(function(a){return '<option value="'+a.id+'"'+(a.id===ui.artist?' selected':'')+'>'+esc(a.name)+' · '+esc(a.area)+', '+esc(a.city)+(a.sample?'':' (you)')+'</option>'}).join('')+'</select></div>';
    }
    h+='<div class="ptabs" role="tablist">'+tabs.map(function(t){return '<button type="button" role="tab" aria-selected="'+(ui.tab===t[0])+'" data-act="tab" data-v="'+t[0]+'">'+t[1]+tabCount(t[0])+'</button>'}).join('')+'</div>';
    h+='<div id="pPanel">'+panel()+'</div></div>';
    $('portalSheet').innerHTML=h;
  }
  function daysLine(){
    var c=mine().filter(function(b){return b.status==='confirmed'&&daysTo(b.date)>=0}).sort(function(a,b){return a.date<b.date?-1:1})[0];
    if(c){var n=daysTo(c.date);return n===0?'Your day is today. Shine!':n+' day'+(n===1?'':'s')+' to your '+SV[c.svc][0].toLowerCase()+' with '+(p(c.pid)?p(c.pid).name:'your artist')+'.'}
    return 'Your bookings and saved artists, in one place.';
  }
  function tabCount(t){
    var n=0;
    if(t==='bookings')n=mine().filter(function(b){return b.status==='requested'||b.status==='confirmed'}).length;
    if(t==='saved')n=Store.d.saved.length;
    if(t==='requests')n=mine().filter(function(b){return b.pid===ui.artist&&b.status==='requested'}).length;
    return n?' <span class="pbadge">'+n+'</span>':'';
  }
  function panel(){
    if(ui.role==='client')return ui.tab==='saved'?savedPanel():bookingsPanel();
    if(ui.tab==='calendar')return calendarPanel();
    if(ui.tab==='services')return servicesPanel();
    if(ui.tab==='earnings')return earningsPanel();
    return requestsPanel();
  }

  /* ---------- customer ---------- */
  function bookingCard(b,side){
    var a=p(b.pid),n=daysTo(b.date);
    var av=(side==='client'&&a)?'<img class="avt" src="'+SG.ph(SG.cover(a))+'" alt="" loading="lazy">':'';
    var h='<article class="bk"><div class="bkhead"><div class="who">'+av+'<div><h3>'+esc(side==='artist'?(b.name||'A customer'):(a?a.name:'Artist'))+'</h3><p class="meta">'+esc(SV[b.svc][0])+' · '+esc(SG.fmtDate(b.date))+' · '+inr(b.price)+'</p></div></div>'+statusBadge(b.status)+'</div>'
      +'<p class="meta">Venue: '+esc(b.venue)+(b.note?' · Note: '+esc(b.note):'')+'</p>';
    if(b.reply)h+='<p class="reply">'+(side==='artist'?'Your reply: ':esc(a?a.name.split(' ')[0]:'She')+' says: ')+'“'+esc(b.reply)+'”</p>';
    var act='';
    if(side==='client'){
      if(b.status==='requested')act+=btn('cancel',b.id,'Cancel request','ghost dark');
      if(b.status==='confirmed'){
        act+=btn('track',b.id,'Track arrival','red')+btn('ics',b.id,'Add to calendar','ghost dark')+btn('complete',b.id,'Service done (demo)','ghost dark')+btn('cancel',b.id,'Cancel','ghost dark');
        if(n>=0)h+='<p class="countdown">'+(n===0?'Today!':n+' day'+(n===1?'':'s')+' to go')+'</p>';
      }
      if(b.status==='declined'||b.status==='cancelled')act+=btn('explore',b.id,'Find another artist','ghost dark');
      if(b.status==='completed'){
        var rv=Store.d.reviews.filter(function(r){return r.bid===b.id})[0];
        if(rv)h+='<p class="reply"><span class="starsy">'+stars(rv.rating)+'</span> “'+esc(rv.text||'')+'”</p>';
        else h+='<form class="revform" data-form="review" data-id="'+b.id+'"><div class="field"><label for="rv'+b.id+'">How was it?</label><select id="rv'+b.id+'" name="rating"><option value="5">★★★★★ Loved it</option><option value="4">★★★★ Very good</option><option value="3">★★★ Okay</option><option value="2">★★ Not great</option><option value="1">★ Poor</option></select></div><div class="field"><label for="rt'+b.id+'">A line about it (optional)</label><input id="rt'+b.id+'" name="text" maxlength="140" placeholder="Her work, her timing, her kindness"></div><button class="btn red small" type="submit">Post review</button></form>';
      }
    }else{
      if(b.status==='requested'){
        var clash=SG.busyOn(a,b.date);
        h+='<form class="revform" data-form="accept" data-id="'+b.id+'"><div class="field"><label for="ac'+b.id+'">Your reply to '+esc(b.name||'her')+'</label><input id="ac'+b.id+'" name="msg" maxlength="140" value="Happy to do this! I will message you a few days before to confirm timings."></div>'
          +(clash?'<p class="note" style="color:var(--warn)">You already have this date taken. Decline, or unblock the date in your calendar.</p>':'')
          +'<div class="actions"><button class="btn red small" type="submit"'+(clash?' disabled':'')+'>Accept</button><button class="btn ghost dark small" type="button" data-act="decline" data-id="'+b.id+'">Decline</button></div></form>';
      }
      if(b.status==='confirmed')act+=btn('complete',b.id,'Mark completed','red')+btn('cancel',b.id,'Cancel','ghost dark');
    }
    if(act)h+='<div class="actions">'+act+'</div>';
    return h+'</article>';
  }
  function btn(act,id,label,cls){return '<button class="btn '+cls+' small" type="button" data-act="'+act+'" data-id="'+id+'">'+label+'</button>'}
  function bookingsPanel(){
    var l=mine().slice().sort(function(a,b){return b.created-a.created});
    if(!l.length)return '<div class="empty">No bookings yet.<br>Find an artist you like, check her date and send a request.<br><br>'+btn('explore','','Explore artists','red')+'</div>';
    return '<div class="bklist">'+l.map(function(b){return bookingCard(b,'client')}).join('')+'</div>';
  }
  function savedPanel(){
    var l=Store.d.saved.map(p).filter(Boolean);
    if(!l.length)return '<div class="empty">No saved artists yet.<br>Tap the heart on any artist to keep her here.<br><br>'+btn('explore','','Explore artists','red')+'</div>';
    return '<div class="bklist">'+l.map(function(a){return '<article class="bk"><div class="bkhead"><div class="who"><img class="avt" src="'+SG.ph(SG.cover(a))+'" alt="" loading="lazy"><div><h3>'+esc(a.name)+'</h3><p class="meta">'+esc(a.area)+', '+esc(a.city)+' · '+esc(a.handle)+'</p></div></div><span class="badge">'+SG.TYPE[a.type]+'</span></div><div class="actions">'+btn('profile',a.id,'View profile','red')+btn('unsave',a.id,'Remove','ghost dark')+'</div></article>'}).join('')+'</div>';
  }

  /* ---------- artist ---------- */
  function requestsPanel(){
    var all=mine().filter(function(b){return b.pid===ui.artist}).sort(function(a,b){return b.created-a.created});
    var pend=all.filter(function(b){return b.status==='requested'}),up=all.filter(function(b){return b.status==='confirmed'}),past=all.filter(function(b){return ['completed','declined','cancelled'].indexOf(b.status)>-1});
    var h='<div class="actions" style="margin-bottom:14px">'+btn('simulate','','Simulate a new customer request (demo)','ghost dark')+'</div>';
    if(!all.length)return h+'<div class="empty">No requests for her yet.<br>Send one from the customer side (open her profile and check a date), or simulate one above.</div>';
    function sec(t,l){return l.length?'<h3 class="sech">'+t+'</h3><div class="bklist">'+l.map(function(b){return bookingCard(b,'artist')}).join('')+'</div>':''}
    return h+sec('New requests',pend)+sec('Upcoming',up)+sec('Past',past);
  }
  function calendarPanel(){
    var a=p(ui.artist),parts=ui.month.split('-'),y=+parts[0],m=+parts[1]-1,first=new Date(y,m,1),dim=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7;
    var title=first.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    var h='<div class="calhead"><button type="button" class="btn ghost dark small" data-act="month" data-v="-1" aria-label="Previous month">‹</button><h3>'+title+'</h3><button type="button" class="btn ghost dark small" data-act="month" data-v="1" aria-label="Next month">›</button></div>'
      +'<div class="calgrid" role="grid">'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(d){return '<div class="dow">'+d+'</div>'}).join('');
    for(var i=0;i<off;i++)h+='<div></div>';
    for(var d=1;d<=dim;d++){
      var ds=y+'-'+('0'+(m+1)).slice(-2)+'-'+('0'+d).slice(-2),cls='free',lab='',past=ds<TODAY;
      var cb=mine().filter(function(b){return b.pid===a.id&&b.date===ds&&b.status==='confirmed'})[0];
      var bl=(Store.d.blocked[a.id]||[]).indexOf(ds)>-1;
      if(cb){cls='conf';lab=(cb.name||'Booked').slice(0,8)}
      else if(a.booked.indexOf(ds)>-1){cls='sbk';lab='Booked'}
      else if(bl){cls='blk';lab='Blocked'}
      var can=!past&&!cb&&a.booked.indexOf(ds)<0;
      h+='<button type="button" class="day '+cls+(past?' past':'')+'" '+(can?'data-act="block" data-v="'+ds+'"':'disabled')+' aria-label="'+ds+' '+(lab||'free')+'"><b>'+d+'</b><span>'+esc(lab)+'</span></button>';
    }
    return h+'</div><p class="legendline"><span class="k conf"></span>Confirmed <span class="k sbk"></span>Already booked <span class="k blk"></span>Blocked by you <span class="k free"></span>Free. Tap a free day to block it, or a blocked day to open it again. Customers see these dates when they search.</p>';
  }
  function servicesPanel(){
    var a=p(ui.artist),rows='';
    Object.keys(a.pk).forEach(function(k){
      rows+='<form class="svrow" data-form="price" data-k="'+k+'"><label for="sv'+k+'">'+esc(SV[k][1])+'</label><input id="sv'+k+'" name="price" type="number" min="100" max="200000" step="100" value="'+a.pk[k]+'"><button class="btn ghost dark small" type="submit">Save</button><button class="btn ghost dark small" type="button" data-act="rmsvc" data-id="'+k+'" aria-label="Remove '+esc(SV[k][0])+'">Remove</button></form>';
    });
    var free=Object.keys(SV).filter(function(k){return a.pk[k]==null});
    return '<p class="note" style="margin-bottom:10px">Customers see these prices and how they compare with the city. Changes show up in search straight away.</p>'+rows
      +(free.length?'<form class="svrow add" data-form="addsvc"><select name="svc" aria-label="New service">'+free.map(function(k){return '<option value="'+k+'">'+esc(SV[k][0])+'</option>'}).join('')+'</select><input name="price" type="number" min="100" max="200000" step="100" placeholder="Price (₹)" required aria-label="Price"><button class="btn red small" type="submit">Add service</button></form>':'');
  }
  function earningsPanel(){
    var l=mine().filter(function(b){return b.pid===ui.artist}),done=l.filter(function(b){return b.status==='completed'}),up=l.filter(function(b){return b.status==='confirmed'});
    var sum=function(x){return x.reduce(function(s,b){return s+(b.price||0)},0)};
    var rate=ui.rate==null?5:ui.rate,g=sum(done),fee=Math.round(g*rate/100);
    var a=p(ui.artist),strength=[a.handle&&a.handle.length>3,Object.keys(a.pk).length>=3,a.styles&&a.styles.length>0,a.bio&&a.bio.length>30].filter(Boolean).length;
    return '<div class="out3"><div>Earned so far<b>'+inr(g)+'</b></div><div>SINGAAR fee ('+rate+'%)<b>'+inr(fee)+'</b></div><div>You keep<b>'+inr(g-fee)+'</b></div></div>'
      +'<div class="field" style="margin-top:14px"><label for="pRate">Example fee: '+rate+'% only on completed bookings</label><input id="pRate" type="range" min="0" max="15" step="0.5" value="'+rate+'" data-act="rate"></div>'
      +'<p class="note" style="margin-top:8px">Coming up: '+up.length+' confirmed booking'+(up.length===1?'':'s')+' worth '+inr(sum(up))+'. The real fee will be decided together with artists.</p>'
      +'<div class="strength"><b>Profile strength</b><div class="sbar"><i style="width:'+(strength/4*100)+'%"></i></div><p class="note">'+strength+' of 4: Instagram handle, three or more services, style tags, a short bio. More complete profiles are easier to trust.</p></div>';
  }

  /* ---------- actions ---------- */
  function bookingById(id){return mine().filter(function(b){return b.id===id})[0]}
  function act(a,el){
    var id=el.getAttribute('data-id'),v=el.getAttribute('data-v'),b;
    switch(a){
      case 'role':ui.role=v;ui.tab=v==='client'?'bookings':'requests';render();break;
      case 'tab':ui.tab=v;render();break;
      case 'cancel':if(bookingById(id)){SG.setBookingStatus(id,'cancelled');SG.toast('Cancelled.')}break;
      case 'complete':if(bookingById(id)){SG.setBookingStatus(id,'completed');SG.burst();SG.toast('Marked as completed. You can now leave a review.')}break;
      case 'decline':SG.setBookingStatus(id,'declined','Sorry, I am not available for this one. Thank you for asking!');SG.toast('Declined. The customer has been told.');break;
      case 'ics':b=bookingById(id);if(b)SG.downloadIcs(b);break;
      case 'track':b=bookingById(id);if(b)SG.startTracking(b);break;
      case 'explore':SG.closeModals();$('browse').scrollIntoView({behavior:'smooth'});break;
      case 'profile':SG.closeModals();SG.profile(parseInt(id,10));break;
      case 'unsave':var i=Store.d.saved.indexOf(parseInt(id,10));if(i>-1){Store.d.saved.splice(i,1);save();SG.render();render()}break;
      case 'month':var pr=ui.month.split('-'),dt=new Date(+pr[0],+pr[1]-1+parseInt(v,10),1);ui.month=dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2);render();break;
      case 'block':
        var arr=Store.d.blocked[ui.artist]=Store.d.blocked[ui.artist]||[],k=arr.indexOf(v);
        if(k>-1)arr.splice(k,1);else arr.push(v);save();SG.render();render();break;
      case 'rmsvc':var ar=p(ui.artist);if(Object.keys(ar.pk).length<=1){SG.toast('Keep at least one service.');break}delete ar.pk[id];persistPrices(ar);SG.render();render();break;
      case 'simulate':
        var ar2=p(ui.artist),ks=Object.keys(ar2.pk),svc=ks[Math.floor(Math.random()*ks.length)],dd=nextFree(ar2);
        var nb={id:'b'+Date.now().toString(36)+'x',pid:ar2.id,svc:svc,date:dd,venue:'Sample venue, '+ar2.city,name:DEMO_NAMES[Math.floor(Math.random()*DEMO_NAMES.length)],note:'Demo request',price:ar2.pk[svc],status:'requested',created:Date.now(),reply:''};
        Store.d.bookings.unshift(nb);save();SG.updateBadge();render();SG.toast('A new demo request arrived.');break;
    }
  }
  function nextFree(a){
    var d=new Date(TODAY+'T00:00:00');
    for(var i=14;i<120;i++){var x=new Date(d.getTime()+i*86400000),s=x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2);if(!SG.busyOn(a,s))return s}
    return '2027-02-14';
  }
  function persistPrices(a){
    Store.d.overrides[a.id]={pk:a.pk};save();
    if(!a.sample){try{var l=JSON.parse(localStorage.getItem(LISTINGS)||'[]');l.forEach(function(x){if(x.id===a.id)x.pk=a.pk});localStorage.setItem(LISTINGS,JSON.stringify(l))}catch(e){}}
  }
  function submit(f,e){
    var kind=f.getAttribute('data-form'),id=f.getAttribute('data-id'),fd=new FormData(f);
    if(kind==='review'){
      var b=bookingById(id);if(!b)return;
      var rt=parseInt(fd.get('rating'),10);if(!(rt>=1&&rt<=5))return;
      Store.d.reviews.unshift({bid:id,pid:b.pid,rating:rt,text:String(fd.get('text')||'').slice(0,140),name:b.name||'A customer'});save();SG.burst();SG.toast('Thank you! Your review is now on her profile.');render();SG.render();
    }
    if(kind==='accept'){
      var bk=bookingById(id);if(!bk)return;
      if(SG.busyOn(p(bk.pid),bk.date)){SG.toast('That date is already taken.');return}
      SG.setBookingStatus(id,'confirmed',String(fd.get('msg')||'').slice(0,140));SG.burst();SG.toast('Accepted. The date is now blocked in search.');
    }
    if(kind==='price'){
      var a=p(ui.artist),k=f.getAttribute('data-k'),n=parseInt(fd.get('price'),10);
      if(!(n>=100&&n<=200000)){SG.toast('Enter a price between ₹100 and ₹2,00,000.');return}
      a.pk[k]=n;persistPrices(a);SG.render();SG.toast('Price saved.');render();
    }
    if(kind==='addsvc'){
      var a2=p(ui.artist),k2=String(fd.get('svc')),n2=parseInt(fd.get('price'),10);
      if(!SV[k2]||!(n2>=100&&n2<=200000)){SG.toast('Enter a price between ₹100 and ₹2,00,000.');return}
      a2.pk[k2]=n2;persistPrices(a2);SG.render();SG.toast('Service added.');render();
    }
  }

  /* ---------- wiring ---------- */
  var sheet=$('portalSheet');
  sheet.addEventListener('click',function(e){var el=e.target.closest('[data-act]');if(!el||el.tagName==='SELECT'||el.type==='checkbox'||el.type==='range')return;act(el.getAttribute('data-act'),el)});
  sheet.addEventListener('submit',function(e){e.preventDefault();var f=e.target.closest('[data-form]');if(f)submit(f,e)});
  sheet.addEventListener('change',function(e){
    var el=e.target,a=el.getAttribute('data-act');
    if(a==='artist'){ui.artist=parseInt(el.value,10);render()}
    if(a==='auto'){Store.d.autoReply=el.checked;save();SG.toast(el.checked?'Sample artists will reply in a few seconds.':'Auto-reply is off. Reply yourself from the artist dashboard.')}
  });
  sheet.addEventListener('input',function(e){var el=e.target;if(el.getAttribute('data-act')==='rate'){ui.rate=parseFloat(el.value)||0;var keep=document.activeElement===el;var panelEl=$('pPanel');panelEl.innerHTML=earningsPanel();var r=$('pRate');if(r&&keep)r.focus()}});
  $('portalBtn').addEventListener('click',function(){open('client')});
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-open-portal]');if(a){open(a.getAttribute('data-open-portal'))}
  });
  window.SGPortal={open:open,refresh:refresh};
})();
