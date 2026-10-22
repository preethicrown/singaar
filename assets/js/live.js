/* SINGAAR live mode: real listings, bookings, chat and trip location shared between phones through Supabase.
   It stays off until assets/js/config.js has the project URL and public key. The sample artists and the
   demo flow keep working exactly as before; only artists who list themselves become live.
   Each phone gets its own private session (no phone number needed yet); the database rules make sure a
   booking, its chat and its location are visible only to that customer and that artist. */
(function(){
  var SG=window.SG,C=window.SINGAAR_CONFIG||{};
  if(!SG||!C.supabaseUrl||!C.supabaseKey||!window.supabase)return;
  var $=function(i){return document.getElementById(i)},Store=SG.Store,esc=SG.esc;
  var db=window.supabase.createClient(C.supabaseUrl,C.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'singaar.auth'}});
  var me=null,isReady=false,readyFns=[],trips={},track=null;

  function whenReady(f){if(isReady)f();else readyFns.push(f)}
  function newId(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,function(c){return (c^Math.random()*16>>c/4).toString(16)})}
  function nid(uuid){return parseInt(String(uuid).replace(/-/g,'').slice(0,12),16)}
  function byUuid(u){return SG.P.filter(function(p){return p.uuid===u})[0]}
  function findBooking(id){return Store.d.bookings.filter(function(b){return b.id===id})[0]}
  function refresh(){Store.save();SG.updateBadge();if(window.SGPortal)SGPortal.refresh()}
  function oops(what,err){if(window.console)console.warn('SINGAAR live:',what,err&&err.message);SG.toast('Could not '+what+'. Check your connection and try again.')}

  /* ---------- listings ---------- */
  function mergeArtist(r){
    if(!r||!r.id||!SG.AREA[r.city])return null;
    var id=nid(r.id),a=SG.byId(id),fresh=!a;a=a||{};
    var pk={};Object.keys(r.services||{}).forEach(function(k){var v=parseInt(r.services[k],10);if(SG.SV[k]&&v>=100)pk[k]=v});
    a.id=id;a.uuid=r.id;a.owner=r.owner;a.remote=true;a.sample=false;
    a.name=r.name;a.area=r.area||r.city;a.city=r.city;a.type=SG.TYPE[r.type]?r.type:'artist';a.travel=r.travel!==false;
    a.pk=Object.keys(pk).length?pk:(a.pk||{});a.bio=r.bio||'New on SINGAAR.';a.handle=r.handle||'@new.on.singaar';a.wa=r.wa||'';
    a.styles=a.styles&&a.styles.length?a.styles:['new on SINGAAR'];a.booked=a.booked||[];
    if(fresh)SG.P.unshift(a);
    return a;
  }
  function loadArtists(){
    return db.from('artists').select('*').order('created_at',{ascending:false}).limit(300).then(function(res){
      if(res.error)return oops('load artists',res.error);
      res.data.forEach(mergeArtist);SG.render();refresh();
    });
  }
  function pushListing(np){
    whenReady(function(){
      var row={id:np.uuid,name:np.name,area:np.area,city:np.city,type:np.type,travel:np.travel!==false,services:np.pk,bio:np.bio,handle:np.handle&&np.handle!=='@your.handle'?np.handle:null,wa:np.wa||null};
      db.from('artists').insert(row).then(function(res){if(res.error)oops('publish your listing',res.error);else{np.owner=me;SG.toast('You are live. Customers on any phone can now find and book you.')}});
    });
  }
  function updateListing(a){
    if(!a||!a.remote)return;
    whenReady(function(){db.from('artists').update({services:a.pk}).eq('id',a.uuid).then(function(res){if(res.error)oops('save your prices',res.error)})});
  }

  /* ---------- bookings ---------- */
  function mergeBooking(r){
    if(!r||!r.id)return;
    var a=byUuid(r.artist_id);if(!a)return;
    var b=findBooking(r.id),fresh=!b,was=b&&b.status;
    b=b||{id:r.id,msgs:[]};
    b.remote=true;b.pid=a.id;b.svc=r.svc;b.date=r.date;b.venue=r.venue;b.name=r.customer_name;b.note=r.note||'';
    b.price=r.price;b.status=r.status;b.paid=!!r.paid;b.reply=r.reply||'';b.created=Date.parse(r.created_at)||Date.now();
    b.asCustomer=r.customer===me;b.asArtist=a.owner===me;
    if(fresh)Store.d.bookings.unshift(b);
    if(b.asArtist&&fresh&&r.status==='requested'&&isReady)SG.toast('New booking request from '+b.name+' for '+SG.fmtDate(b.date)+'.');
    if(b.asCustomer&&was&&was!==r.status){
      if(r.status==='confirmed'){SG.toast(a.name+' confirmed your booking.');SG.burst()}
      if(r.status==='declined')SG.toast(a.name+' cannot take this booking. Try another artist.');
    }
    if(b.status!=='confirmed')stopTrip(b.id,true);
    refresh();
  }
  function rowOf(b){var a=SG.byId(b.pid);return {id:b.id,artist_id:a&&a.uuid,customer_name:(b.name||'Customer').slice(0,40),svc:b.svc,date:b.date,venue:(b.venue||'').slice(0,80),note:(b.note||'').slice(0,240),price:b.price}}
  function pushBooking(b){
    b.remote=true;b.asCustomer=true;
    whenReady(function(){db.from('bookings').insert(rowOf(b)).then(function(res){if(res.error)oops('send your booking request',res.error)})});
  }
  function updateBooking(b){
    whenReady(function(){
      db.from('bookings').update({status:b.status,reply:(b.reply||'').slice(0,140),paid:!!b.paid,updated_at:new Date().toISOString()}).eq('id',b.id)
        .then(function(res){if(res.error)oops('update the booking',res.error)});
    });
    if(b.status!=='confirmed')stopTrip(b.id,true);
  }
  function loadBookings(){
    return db.from('bookings').select('*').order('created_at',{ascending:false}).limit(200).then(function(res){
      if(res.error)return oops('load your bookings',res.error);
      res.data.forEach(mergeBooking);
      var ids=res.data.map(function(r){return r.id});if(!ids.length)return;
      return db.from('messages').select('*').in('booking_id',ids).order('created_at',{ascending:true}).then(function(m){if(!m.error)m.data.forEach(function(r){mergeMsg(r,true)})});
    });
  }

  /* ---------- chat ---------- */
  function openChatSide(id){var f=$('infoSheet')&&$('infoSheet').querySelector('[data-chat-form="'+id+'"]');return f&&!$('infoModal').hidden?f.getAttribute('data-side'):null}
  function mergeMsg(r,quiet){
    var b=findBooking(r.booking_id);if(!b)return;b.msgs=b.msgs||[];
    if(b.msgs.some(function(x){return x.rid===r.id}))return;
    b.msgs.push({rid:r.id,f:r.side==='customer'?'me':'her',t:r.body});Store.save();
    var side=openChatSide(b.id);
    if(side&&window.SGPortal&&SGPortal.chat)SGPortal.chat(b.id,side);
    else if(!quiet&&r.sender!==me){var a=SG.byId(b.pid);SG.toast('New message from '+(r.side==='customer'?b.name:(a?a.name:'your artist'))+': '+r.body.slice(0,60))}
  }
  function sendMsg(b,side,text){
    whenReady(function(){
      db.from('messages').insert({booking_id:b.id,side:side==='artist'?'artist':'customer',body:text.slice(0,500)}).select().single()
        .then(function(res){if(res.error)oops('send your message',res.error);else mergeMsg(res.data,true)});
    });
  }

  /* ---------- trip: the artist shares her live location with that one customer ---------- */
  function sharing(id){return !!trips[id]}
  function startTrip(b){
    if(!('geolocation' in navigator)){SG.toast('This phone cannot share its location.');return}
    var last=0;
    trips[b.id]=navigator.geolocation.watchPosition(function(pos){
      var now=Date.now();if(now-last<6000)return;last=now;
      db.from('locations').upsert({booking_id:b.id,lat:pos.coords.latitude,lng:pos.coords.longitude,updated_at:new Date().toISOString()})
        .then(function(res){if(res.error)oops('share your location',res.error)});
    },function(err){stopTrip(b.id,true);SG.toast(err&&err.code===1?'Allow location for SINGAAR to share your trip.':'Could not read your location. Try again outside or near a window.');refresh()},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
    SG.toast('Trip started. '+b.name+' can now see you on the map until you stop.');refresh();
  }
  function stopTrip(id,quiet){if(trips[id]==null)return;try{navigator.geolocation.clearWatch(trips[id])}catch(e){}delete trips[id];if(!quiet)SG.toast('Trip stopped. Your location is no longer shared.');refresh()}
  function toggleTrip(b){whenReady(function(){if(sharing(b.id))stopTrip(b.id);else startTrip(b)})}

  /* ---------- tracking: the customer watches the artist on a real map ---------- */
  var CITY={Bangalore:[12.9716,77.5946],Chennai:[13.0827,80.2707]};
  function km(a,b){var R=6371,r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r,x=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)*Math.sin(dLo/2);return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
  function etaText(){
    if(!track)return;var a=SG.byId(track.b.pid),first=a?a.name.split(' ')[0]:'Your artist',el=$('liveEta');if(!el)return;
    if(!track.her){el.textContent='Waiting for '+first+' to start her trip. Her position appears here as soon as she does.';return}
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
  function fit(){
    if(!track)return;var pts=[track.her,track.you].filter(Boolean);
    if(pts.length===2)track.map.fitBounds(pts,{padding:[40,40],maxZoom:16});else if(pts.length===1)track.map.setView(pts[0],15);
  }
  function openTrack(b){
    if(!window.L){SG.toast('The map could not load. Check your connection.');return}
    var a=SG.byId(b.pid),first=a?a.name.split(' ')[0]:'your artist';
    if(track&&track.map){try{track.map.remove()}catch(e){}clearInterval(track.tick)}
    $('infoSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button><div class="phead"><div><p class="eyebrow">Live arrival</p><h2 id="infoTitle">Track '+esc(first)+'</h2></div></div><div class="pbody"><div id="liveMapBox" class="livemap" role="img" aria-label="Map showing where your artist is"></div><p id="liveEta" class="liveeta" aria-live="polite"></p><p class="note">Her real location, shared only with you while she travels. Map data © OpenStreetMap contributors.</p></div>';
    SG.openModal('infoModal');
    var c=CITY[(a&&a.city)||'Bangalore'];
    var map=L.map('liveMapBox',{zoomControl:true,attributionControl:true}).setView(c,12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'© OpenStreetMap'}).addTo(map);
    track={b:b,map:map,her:null,you:null,herM:null,youM:null,at:0};
    track.tick=setInterval(etaText,5000);
    setTimeout(function(){map.invalidateSize()},250);
    etaText();
    db.from('locations').select('*').eq('booking_id',b.id).maybeSingle().then(function(res){if(!res.error&&res.data)placeHer(res.data.lat,res.data.lng,Date.parse(res.data.updated_at))});
    if('geolocation' in navigator)navigator.geolocation.getCurrentPosition(function(pos){
      if(!track||track.b.id!==b.id)return;track.you=[pos.coords.latitude,pos.coords.longitude];
      track.youM=L.circleMarker(track.you,{radius:9,color:'#fff',weight:3,fillColor:'#1F6FB2',fillOpacity:1}).addTo(map).bindTooltip('You',{permanent:true,direction:'top',offset:[0,-8]});
      fit();etaText();
    },function(){},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  }
  function onLoc(r){if(track&&r&&r.booking_id===track.b.id&&!$('infoModal').hidden)placeHer(r.lat,r.lng,Date.parse(r.updated_at))}

  /* ---------- start ---------- */
  function subscribe(){
    db.channel('singaar-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'artists'},function(p){if(p.new&&p.new.id){mergeArtist(p.new);SG.render();refresh()}})
      .on('postgres_changes',{event:'*',schema:'public',table:'bookings'},function(p){if(p.new&&p.new.id)mergeBooking(p.new)})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(p){mergeMsg(p.new)})
      .on('postgres_changes',{event:'*',schema:'public',table:'locations'},function(p){onLoc(p.new)})
      .subscribe();
  }
  db.auth.getSession().then(function(res){
    var s=res.data&&res.data.session;
    return s?s:db.auth.signInAnonymously().then(function(r){if(r.error)throw r.error;return r.data.session});
  }).then(function(s){
    me=s.user.id;
    return loadArtists().then(loadBookings);
  }).then(function(){
    isReady=true;document.body.setAttribute('data-live','on');
    readyFns.splice(0).forEach(function(f){f()});
    subscribe();
  }).catch(function(e){oops('connect to SINGAAR live',e)});

  window.SGLive={ready:function(){return isReady},newId:newId,nid:nid,pushListing:pushListing,updateListing:updateListing,pushBooking:pushBooking,updateBooking:updateBooking,sendMsg:sendMsg,toggleTrip:toggleTrip,sharing:sharing,track:openTrack,isMine:function(a){return !!(a&&a.owner&&a.owner===me)}};
})();
