/* SINGAAR live mode for customers: real, approved artists, real bookings, live chat and the artist's live location.
   Runs only in real mode (assets/js/config.js filled in, not /demo). Customers can browse without an account and
   sign in (Google or email code) when they book. Artists use their own app, SINGAAR Partner (/partner).
   The database rules make sure a booking, its chat and its location are visible only to that customer and that artist. */
(function(){
  var SG=window.SG,A=window.SGAuth;
  if(!SG||!A||!A.on||!window.SINGAAR_REAL)return;
  var $=function(i){return document.getElementById(i)},Store=SG.Store,esc=SG.esc,db=A.db;
  var me=null,chan=null,track=null,pendingLogin=null;

  function nid(uuid){return parseInt(String(uuid).replace(/-/g,'').slice(0,12),16)}
  function byUuid(u){return SG.P.filter(function(p){return p.uuid===u})[0]}
  function findBooking(id){return Store.d.bookings.filter(function(b){return b.id===id})[0]}
  function newId(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,function(c){return (c^Math.random()*16>>c/4).toString(16)})}
  function refresh(){Store.save();SG.updateBadge();if(window.SGPortal)SGPortal.refresh()}
  function oops(what,err){if(window.console)console.warn('SINGAAR live:',what,err&&err.message);SG.toast('Could not '+what+'. '+A.friendly(err))}

  /* ---------- artists (approved only; anyone can see them) ---------- */
  function mergeArtist(r){
    if(!r||!r.id||!SG.AREA[r.city])return null;
    var id=nid(r.id),a=SG.byId(id),fresh=!a;
    if(r.status!=='approved'){if(a){var i=SG.P.indexOf(a);if(i>-1)SG.P.splice(i,1)}return null}
    a=a||{};
    var pk={};Object.keys(r.services||{}).forEach(function(k){var v=parseInt(r.services[k],10);if(SG.SV[k]&&v>=100)pk[k]=v});
    if(!Object.keys(pk).length)return null;
    a.id=id;a.uuid=r.id;a.owner=r.owner;a.remote=true;a.sample=false;
    a.name=r.name;a.area=r.area||r.city;a.city=r.city;a.type=SG.TYPE[r.type]?r.type:'artist';a.travel=r.travel!==false;
    a.pk=pk;a.bio=r.bio||'Verified SINGAAR artist.';a.handle=r.handle||'';a.wa=r.wa||'';
    a.photos=(r.photos||[]).filter(function(u){return /^https:\/\//.test(u)});a.booked=(r.blocked||[]).slice();
    a.styles=['verified'];
    if(fresh)SG.P.unshift(a);
    return a;
  }
  function loadArtists(){
    return db.from('artists').select('id,owner,name,area,city,type,travel,services,bio,handle,wa,photos,blocked,status').eq('status','approved').order('created_at',{ascending:false}).limit(500).then(function(res){
      if(res.error)return oops('load artists',res.error);
      res.data.forEach(mergeArtist);SG.render();refresh();
    });
  }

  /* ---------- bookings (signed-in customer only) ---------- */
  function mergeBooking(r,quiet){
    if(!r||!r.id||!me||r.customer!==me.id)return;
    var a=byUuid(r.artist_id);if(!a)return;
    var b=findBooking(r.id),fresh=!b,was=b&&b.status;
    b=b||{id:r.id,msgs:[]};
    b.remote=true;b.asCustomer=true;b.pid=a.id;b.svc=r.svc;b.date=r.date;b.venue=r.venue;b.name=r.customer_name;b.note=r.note||'';
    b.price=r.price;b.status=r.status;b.paid=!!r.paid;b.reply=r.reply||'';b.created=Date.parse(r.created_at)||Date.now();
    if(fresh)Store.d.bookings.unshift(b);
    if(!quiet&&was&&was!==r.status){
      if(r.status==='confirmed'){SG.toast(a.name+' accepted your booking!');SG.burst()}
      if(r.status==='declined')SG.toast(a.name+' cannot take this booking. Try another artist.');
      if(r.status==='completed')SG.toast('Your booking with '+a.name+' is complete. Please leave a review.');
    }
    refresh();
  }
  function rowOf(b){var a=SG.byId(b.pid);return {id:b.id,artist_id:a&&a.uuid,customer_name:(b.name||'Customer').slice(0,40),svc:b.svc,date:b.date,venue:(b.venue||'').slice(0,80),note:(b.note||'').slice(0,240),price:b.price}}
  function pushBooking(b){
    b.remote=true;b.asCustomer=true;
    db.from('bookings').insert(rowOf(b)).then(function(res){
      if(res.error){oops('send your booking request',res.error);var i=Store.d.bookings.indexOf(b);if(i>-1){Store.d.bookings.splice(i,1);refresh()}}
    });
  }
  function updateBooking(b){
    var row={status:b.status,paid:!!b.paid,updated_at:new Date().toISOString()};
    db.from('bookings').update(row).eq('id',b.id).then(function(res){if(res.error)oops('update the booking',res.error)});
  }
  function loadBookings(){
    return db.from('bookings').select('*').eq('customer',me.id).order('created_at',{ascending:false}).limit(200).then(function(res){
      if(res.error)return oops('load your bookings',res.error);
      res.data.forEach(function(r){mergeBooking(r,true)});
      var ids=res.data.map(function(r){return r.id});if(!ids.length)return;
      return db.from('messages').select('*').in('booking_id',ids).order('created_at',{ascending:true}).then(function(m){if(!m.error)m.data.forEach(function(r){mergeMsg(r,true)})});
    });
  }
  function clearMine(){for(var i=Store.d.bookings.length-1;i>=0;i--)if(Store.d.bookings[i].remote)Store.d.bookings.splice(i,1);refresh()}

  /* ---------- chat ---------- */
  function openChatSide(id){var f=$('infoSheet')&&$('infoSheet').querySelector('[data-chat-form="'+id+'"]');return f&&!$('infoModal').hidden?f.getAttribute('data-side'):null}
  function mergeMsg(r,quiet){
    var b=findBooking(r.booking_id);if(!b)return;b.msgs=b.msgs||[];
    if(b.msgs.some(function(x){return x.rid===r.id}))return;
    b.msgs.push({rid:r.id,f:r.side==='customer'?'me':'her',t:r.body});Store.save();
    var side=openChatSide(b.id);
    if(side&&window.SGPortal&&SGPortal.chat)SGPortal.chat(b.id,side);
    else if(!quiet&&r.side==='artist'){var a=SG.byId(b.pid);SG.toast('New message from '+(a?a.name:'your artist')+': '+r.body.slice(0,60))}
  }
  function sendMsg(b,side,text){
    db.from('messages').insert({booking_id:b.id,side:'customer',body:text.slice(0,500)}).select().single()
      .then(function(res){if(res.error)oops('send your message',res.error);else mergeMsg(res.data,true)});
  }

  /* ---------- tracking: watch the artist on a real map ---------- */
  var CITY={Bangalore:[12.9716,77.5946],Chennai:[13.0827,80.2707]};
  function km(a,b){var R=6371,r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r,x=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)*Math.sin(dLo/2);return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
  function etaText(){
    if(!track)return;var a=SG.byId(track.b.pid),first=a?a.name.split(' ')[0]:'Your artist',el=$('liveEta');if(!el)return;
    if(!track.her){el.textContent=a&&!a.travel?'You visit '+first+'’s salon for this booking.':'Waiting for '+first+' to start her trip. She appears here as soon as she does.';return}
    var ago=Math.max(0,Math.round((Date.now()-track.at)/1000)),txt=first+' is on the way';
    if(track.you){var d=km(track.her,track.you),mins=Math.max(1,Math.round(d/22*60));txt=d<0.15?first+' has arrived.':first+' is about '+mins+' min away ('+d.toFixed(1)+' km, estimate)'}
    el.textContent=txt+'. Updated '+(ago<10?'just now':ago+' s ago')+'.';
  }
  function placeHer(lat,lng,at){
    if(!track)return;track.her=[lat,lng];track.at=at||Date.now();
    if(!track.herM)track.herM=L.circleMarker(track.her,{radius:11,color:'#FFF7EC',weight:3,fillColor:'#B3121F',fillOpacity:1}).addTo(track.map).bindTooltip(esc((SG.byId(track.b.pid)||{}).name||'Artist'),{permanent:true,direction:'top',offset:[0,-10]});
    else track.herM.setLatLng(track.her);
    fit();etaText();
  }
  function fit(){if(!track)return;var pts=[track.her,track.you].filter(Boolean);if(pts.length===2)track.map.fitBounds(pts,{padding:[40,40],maxZoom:16});else if(pts.length===1)track.map.setView(pts[0],15)}
  function openTrack(b){
    if(!window.L){SG.toast('The map could not load. Check your connection.');return}
    var a=SG.byId(b.pid),first=a?a.name.split(' ')[0]:'your artist';
    if(track&&track.map){try{track.map.remove()}catch(e){}clearInterval(track.tick)}
    $('infoSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button><div class="phead"><div><p class="eyebrow">Live arrival</p><h2 id="infoTitle">Track '+esc(first)+'</h2></div></div><div class="pbody"><div id="liveMapBox" class="livemap" role="img" aria-label="Map showing where your artist is"></div><p id="liveEta" class="liveeta" aria-live="polite"></p><p class="note">Her real location, shared only with you while she travels. Map data © OpenStreetMap contributors.</p></div>';
    SG.openModal('infoModal');
    var map=L.map('liveMapBox').setView(CITY[(a&&a.city)||'Bangalore'],12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'© OpenStreetMap'}).addTo(map);
    track={b:b,map:map,her:null,you:null,herM:null,at:0};track.tick=setInterval(etaText,5000);
    setTimeout(function(){map.invalidateSize()},250);etaText();
    db.from('locations').select('*').eq('booking_id',b.id).maybeSingle().then(function(res){if(!res.error&&res.data)placeHer(res.data.lat,res.data.lng,Date.parse(res.data.updated_at))});
    if('geolocation' in navigator)navigator.geolocation.getCurrentPosition(function(pos){
      if(!track||track.b.id!==b.id)return;track.you=[pos.coords.latitude,pos.coords.longitude];
      L.circleMarker(track.you,{radius:9,color:'#fff',weight:3,fillColor:'#1F6FB2',fillOpacity:1}).addTo(map).bindTooltip('You',{permanent:true,direction:'top',offset:[0,-8]});
      fit();etaText();
    },function(){},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  }

  /* ---------- sign in when needed ---------- */
  function login(cb,title){
    pendingLogin=cb||null;
    $('infoSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button><div class="pbody" id="loginBox"></div>';
    A.mount($('loginBox'),{title:title||'Sign in to SINGAAR',subtitle:'So your artist can reply to you, and only you can see your bookings.'});
    SG.openModal('infoModal');
  }

  /* ---------- live updates ---------- */
  function subscribe(){
    if(chan){try{db.removeChannel(chan)}catch(e){}chan=null}
    chan=db.channel('singaar-'+(me?me.id:'guest'))
      .on('postgres_changes',{event:'*',schema:'public',table:'artists'},function(p){if(p.new&&p.new.id){mergeArtist(p.new);SG.render();refresh()}});
    if(me)chan=chan
      .on('postgres_changes',{event:'*',schema:'public',table:'bookings'},function(p){if(p.new&&p.new.id)mergeBooking(p.new)})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(p){mergeMsg(p.new)})
      .on('postgres_changes',{event:'*',schema:'public',table:'locations'},function(p){var r=p.new;if(track&&r&&r.booking_id===track.b.id&&!$('infoModal').hidden)placeHer(r.lat,r.lng,Date.parse(r.updated_at))});
    chan.subscribe();
  }

  document.body.setAttribute('data-live','on');
  var started=false;
  loadArtists().then(function(){
    A.onChange(function(u){
      var changed=(u&&u.id)!==(me&&me.id)||!started;started=true;me=u;
      if(!changed)return;
      if(!u){clearMine();subscribe();return}
      loadBookings().then(function(){
        subscribe();
        if(pendingLogin){var f=pendingLogin;pendingLogin=null;var m=$('infoModal');if(m)m.hidden=true;document.body.style.overflow='';f()}
      });
    });
  });

  window.SGLive={ready:function(){return true},newId:newId,nid:nid,pushBooking:pushBooking,updateBooking:updateBooking,sendMsg:sendMsg,track:openTrack,
    needLogin:function(){return !me},signedIn:function(){return !!me},email:function(){return me&&me.email||''},login:login,logout:function(){A.signOut().then(function(){SG.toast('Signed out.')})},
    pushListing:function(){},updateListing:function(){},toggleTrip:function(){},sharing:function(){return false},isMine:function(){return false}};
})();
