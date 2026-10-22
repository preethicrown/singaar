/* SINGAAR Partner: the separate app for artists and salons (like Uber Driver or Zomato Partner).
   Sign in -> 5-step onboarding (about you, services and prices, work photos, verification, review)
   -> "under review" until the SINGAAR team approves -> dashboard (requests, calendar, prices, earnings, profile).
   Everything is stored in Supabase; row-level security means she only ever sees her own data. */
(function(){
  var A=window.SGAuth,$=function(i){return document.getElementById(i)},esc=A?A.esc:function(s){return s};
  var SV={bridal:'Bridal makeup (wedding day)',engagement:'Engagement look',reception:'Reception look',saree:'Saree draping',bridesmaid:'Bridesmaid look, per person',party:'Party makeup',guest:'Wedding-guest look',hair:'Hair styling',blowdry:'Blow-dry and set',hairspa:'Hair spa',facial:'Glow facial',prebridal:'Pre-bridal package',nails:'Nail art and gel',mehendi:'Mehendi design',accessory:'Accessory styling'};
  var AREAS={Bangalore:['Malleshwaram','Frazer Town','Indiranagar','Whitefield','Basavanagudi','Koramangala','Jayanagar','BTM Layout','HSR Layout'],Chennai:['Anna Nagar','Nungambakkam','T. Nagar','Mylapore','Adyar','Velachery']};
  var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var ID_TYPES=['PAN','Voter ID','Driving licence','Passport','Masked Aadhaar'];
  var STEPS=['About you','Services','Work photos','Verification','Review'];
  var db=A&&A.db,me=null,art=null,priv=null,step=0,tab='requests',bookings=[],msgs={},trips={},chatOpen=null,chan=null,month=null;

  function inr(n){return '₹'+Math.round(n||0).toLocaleString('en-IN')}
  function fmtDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}}
  function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  var tt;function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},4200)}
  function oops(what,err){if(window.console)console.warn(what,err);toast('Could not '+what+'. '+(A?A.friendly(err):''))}
  function view(h){$('app').innerHTML=h;window.scrollTo(0,0)}
  function first(){return art&&art.name?art.name.split(' ')[0]:'there'}

  /* ---------- start ---------- */
  if(!A||!A.on){view('<div class="pcard center"><h1>SINGAAR Partner</h1><p>We are switching on partner accounts. Please check back soon.</p><p><a class="pbtn ghost" href="../">Open SINGAAR</a></p></div>');return}
  $('signOut').addEventListener('click',function(){Object.keys(trips).forEach(stopTrip);A.signOut().then(function(){location.reload()})});
  A.onChange(function(u){
    me=u;$('signOut').hidden=!u;
    if(!u){$('tabs').hidden=true;welcome();return}
    load();
  });

  function welcome(){
    view('<section class="phero"><h1>Grow your bookings with SINGAAR</h1><p>For independent women artists and salons. Your prices, your dates, your clients.</p>'
      +'<ul class="pperks"><li><b>10%</b><span>only when you earn</span></li><li><b>₹0</b><span>platform fee for 3 months</span></li><li><b>Live</b><span>requests on your phone</span></li></ul></section>'
      +'<div class="pcard" id="login"></div>');
    A.mount($('login'),{title:'Sign in or join',subtitle:'New partners join in about 5 minutes.'});
  }

  function load(){
    view('<div class="pload">Loading your account…</div>');
    db.from('artists').select('*').eq('owner',me.id).maybeSingle().then(function(r){
      if(r.error){oops('load your profile',r.error);return}
      art=r.data;
      if(!art){priv=null;step=0;onboard();return}
      db.from('artist_private').select('*').eq('artist_id',art.id).maybeSingle().then(function(p){
        priv=p.data||null;route();
      });
    });
  }
  function route(){
    if(!art||art.status==='draft'){onboard();return}
    if(art.status==='pending'){review('pending');return}
    if(art.status==='rejected'){review('rejected');return}
    dashboard();
  }

  /* ---------- onboarding (5 steps) ---------- */
  function stepper(){return '<ol class="psteps" aria-label="Step '+(step+1)+' of 5">'+STEPS.map(function(s,i){return '<li class="'+(i<step?'done':(i===step?'now':''))+'"><i>'+(i<step?'✓':i+1)+'</i><span>'+s+'</span></li>'}).join('')+'</ol>'}
  function onboard(){
    $('tabs').hidden=true;
    var a=art||{},h=(a.status==='approved'?'<button type="button" class="pbtn ghost sm" id="toDash">‹ Back to dashboard</button>':'')+stepper()+'<div class="pcard">';
    if(step===0){
      var city=a.city||'Bangalore';
      h+='<h2>About you</h2><p class="psub">This is what customers see first.</p><form id="f0" class="pform" novalidate>'
        +'<label>Your name or salon name<input name="name" maxlength="60" required value="'+esc(a.name||'')+'" autocomplete="name"></label>'
        +'<fieldset class="pchoice"><legend>You are</legend>'+[['artist','Independent artist'],['salon','Small salon'],['studio','Studio']].map(function(o){return '<label><input type="radio" name="type" value="'+o[0]+'"'+((a.type||'artist')===o[0]?' checked':'')+'> '+o[1]+'</label>'}).join('')+'</fieldset>'
        +'<div class="prow"><label>City<select name="city" id="fCity">'+Object.keys(AREAS).map(function(c){return '<option'+(c===city?' selected':'')+'>'+c+'</option>'}).join('')+'</select></label>'
        +'<label>Area<select name="area" id="fArea">'+AREAS[city].map(function(x){return '<option'+(x===a.area?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label></div>'
        +'<fieldset class="pchoice"><legend>Where do you work?</legend><label><input type="radio" name="travel" value="1"'+(a.travel!==false?' checked':'')+'> I go to the customer</label><label><input type="radio" name="travel" value="0"'+(a.travel===false?' checked':'')+'> Customers come to my salon</label></fieldset>'
        +'<label>WhatsApp number (optional)<input name="wa" inputmode="tel" maxlength="14" placeholder="10-digit mobile" value="'+esc(a.wa?a.wa.slice(2):'')+'"></label>'
        +'<label>Instagram (optional)<input name="handle" maxlength="31" placeholder="@yourwork" value="'+esc(a.handle||'')+'"></label>'
        +'<label>A line about your work (optional)<textarea name="bio" maxlength="400" rows="3" placeholder="Bridal and party looks, South Indian traditional, 8 years">'+esc(a.bio||'')+'</textarea></label>'
        +'<button class="pbtn" type="submit">Save and continue</button></form>';
    }else if(step===1){
      var sv=a.services||{},days=a.days&&a.days.length?a.days:DAYS;
      h+='<h2>Services and prices</h2><p class="psub">Tick what you offer and set your own price.</p><form id="f1" class="pform" novalidate><div class="psvc">'
        +Object.keys(SV).map(function(k){var on=sv[k]!=null;return '<label class="psv'+(on?' on':'')+'"><input type="checkbox" name="svc" value="'+k+'"'+(on?' checked':'')+'><span>'+SV[k]+'</span><span class="ppr">₹<input type="number" name="p_'+k+'" min="100" max="200000" step="100" inputmode="numeric" value="'+(on?sv[k]:'')+'" aria-label="Price for '+SV[k]+'"></span></label>'}).join('')
        +'</div><fieldset class="pchoice days"><legend>Days you work</legend>'+DAYS.map(function(d){return '<label><input type="checkbox" name="day" value="'+d+'"'+(days.indexOf(d)>-1?' checked':'')+'> '+d+'</label>'}).join('')+'</fieldset>'
        +'<div class="pnav"><button type="button" class="pbtn ghost" data-step="0">Back</button><button class="pbtn" type="submit">Save and continue</button></div></form>';
    }else if(step===2){
      var ph=a.photos||[];
      h+='<h2>Photos of your work</h2><p class="psub">Add 3 to 8 photos of looks you have done. Customers book from these. Only upload photos you took or have permission to use.</p>'
        +'<div class="pgal" id="gal">'+ph.map(function(u,i){return '<figure><img src="'+esc(u)+'" alt="Your work '+(i+1)+'"><button type="button" class="pdel" data-del="'+i+'" aria-label="Remove photo '+(i+1)+'">×</button></figure>'}).join('')
        +(ph.length<8?'<label class="padd"><input type="file" id="phIn" accept="image/jpeg,image/png,image/webp" multiple><span>+ Add photos</span></label>':'')+'</div>'
        +'<p class="pnote" id="phMsg">'+ph.length+' of 8 added</p>'
        +'<div class="pnav"><button type="button" class="pbtn ghost" data-step="1">Back</button><button type="button" class="pbtn" id="ph2" '+(ph.length<3?'disabled':'')+'>Continue</button></div>';
    }else if(step===3){
      var p=priv||{};
      h+='<h2>Verification</h2><p class="psub">Keeps customers safe. Only the SINGAAR team can see this. It is never shown on your profile.</p><form id="f3" class="pform" novalidate>'
        +'<label>ID document type<select name="id_type">'+ID_TYPES.map(function(t){return '<option'+(t===p.id_type?' selected':'')+'>'+t+'</option>'}).join('')+'</select></label>'
        +'<p class="pnote">Using Aadhaar? Cover the first 8 digits before you upload (masked Aadhaar). We never store Aadhaar numbers.</p>'
        +'<label class="pfile"><span>'+(p.id_doc?'ID uploaded ✓ (tap to replace)':'Upload a photo or PDF of your ID')+'</span><input type="file" name="doc" accept="image/jpeg,image/png,image/webp,application/pdf"></label>'
        +'<label>UPI ID for payouts<input name="upi" maxlength="80" placeholder="name@okhdfcbank" value="'+esc(p.upi||'')+'" autocomplete="off"></label>'
        +'<p class="pnote">Payouts start when online payments go live. You can change this later.</p>'
        +'<div class="pnav"><button type="button" class="pbtn ghost" data-step="2">Back</button><button class="pbtn" type="submit">Save and continue</button></div></form>';
    }else{
      var s=a.services||{},p2=priv||{};
      h+='<h2>Check and submit</h2><p class="psub">The SINGAAR team reviews every new partner, usually within 24 hours.</p>'
        +'<dl class="psum"><dt>Name</dt><dd>'+esc(a.name)+'</dd><dt>Where</dt><dd>'+esc(a.area)+', '+esc(a.city)+' · '+(a.travel?'goes to customers':'at the salon')+'</dd>'
        +'<dt>Services</dt><dd>'+Object.keys(s).map(function(k){return esc(SV[k]||k)+' '+inr(s[k])}).join(' · ')+'</dd>'
        +'<dt>Photos</dt><dd>'+(a.photos||[]).length+' added</dd><dt>ID</dt><dd>'+(p2.id_doc?esc(p2.id_type)+' uploaded':'<b class="pwarn">Missing</b>')+'</dd><dt>UPI</dt><dd>'+(p2.upi?esc(p2.upi):'Not added')+'</dd></dl>'
        +'<label class="pagree"><input type="checkbox" id="agree"> I confirm these details and photos are mine, and I agree to SINGAAR\'s partner terms (10% commission on completed bookings; ₹299 a month platform fee after the first 3 months).</label>'
        +'<div class="pnav"><button type="button" class="pbtn ghost" data-step="3">Back</button><button type="button" class="pbtn" id="submitApp">Submit for review</button></div>';
    }
    view(h+'</div>');
    wireStep();
  }
  function goStep(n){step=n;onboard()}
  function wireStep(){
    [].forEach.call(document.querySelectorAll('[data-step]'),function(b){b.addEventListener('click',function(){goStep(parseInt(b.getAttribute('data-step'),10))})});
    if($('toDash'))$('toDash').addEventListener('click',dashboard);
    var f0=$('f0'),f1=$('f1'),f3=$('f3');
    if(f0){
      $('fCity').addEventListener('change',function(){$('fArea').innerHTML=AREAS[this.value].map(function(x){return '<option>'+x+'</option>'}).join('')});
      f0.addEventListener('submit',function(e){
        e.preventDefault();var fd=new FormData(f0),name=String(fd.get('name')||'').trim(),wa=String(fd.get('wa')||'').replace(/\D/g,''),h=String(fd.get('handle')||'').trim();
        if(name.length<2){toast('Enter your name or salon name.');return}
        if(wa&&!/^[6-9]\d{9}$/.test(wa.slice(-10))){toast('Enter a 10-digit Indian mobile number, or leave WhatsApp empty.');return}
        if(h&&h.charAt(0)!=='@')h='@'+h;if(h&&!/^@[A-Za-z0-9._]{1,30}$/.test(h)){toast('Instagram can only use letters, numbers, dots and underscores.');return}
        var row={name:name,type:fd.get('type')||'artist',city:fd.get('city'),area:fd.get('area'),travel:fd.get('travel')==='1',wa:wa?'91'+wa.slice(-10):null,handle:h||null,bio:String(fd.get('bio')||'').trim()||null};
        saveArtist(row,function(){goStep(1)});
      });
    }
    if(f1){
      [].forEach.call(f1.querySelectorAll('input[name=svc]'),function(c){c.addEventListener('change',function(){c.closest('.psv').classList.toggle('on',c.checked);if(c.checked){var p=c.closest('.psv').querySelector('input[type=number]');if(!p.value)p.focus()}})});
      f1.addEventListener('submit',function(e){
        e.preventDefault();var sv={},bad='';
        [].forEach.call(f1.querySelectorAll('input[name=svc]:checked'),function(c){var v=parseInt(f1.querySelector('[name=p_'+c.value+']').value,10);if(!(v>=100&&v<=200000))bad=SV[c.value];else sv[c.value]=v});
        if(bad){toast('Set a price between ₹100 and ₹2,00,000 for '+bad+'.');return}
        if(!Object.keys(sv).length){toast('Tick at least one service and set its price.');return}
        var days=[].map.call(f1.querySelectorAll('input[name=day]:checked'),function(c){return c.value});
        if(!days.length){toast('Choose at least one working day.');return}
        saveArtist({services:sv,days:days},function(){goStep(2)});
      });
    }
    var pin=$('phIn');
    if(pin)pin.addEventListener('change',function(){uploadPhotos([].slice.call(pin.files))});
    [].forEach.call(document.querySelectorAll('[data-del]'),function(b){b.addEventListener('click',function(){var i=parseInt(b.getAttribute('data-del'),10),ph=(art.photos||[]).slice();ph.splice(i,1);saveArtist({photos:ph},function(){onboard()})})});
    if($('ph2'))$('ph2').addEventListener('click',function(){goStep(3)});
    if(f3)f3.addEventListener('submit',function(e){
      e.preventDefault();var fd=new FormData(f3),upi=String(fd.get('upi')||'').trim(),file=f3.querySelector('[name=doc]').files[0];
      if(upi&&!/^[A-Za-z0-9.\-_]{2,256}@[A-Za-z]{2,64}$/.test(upi)){toast('That UPI ID does not look right. Example: name@okhdfcbank');return}
      if(!file&&!(priv&&priv.id_doc)){toast('Upload your ID document to continue.');return}
      var b=f3.querySelector('[type=submit]');b.disabled=true;b.textContent='Saving…';
      var done=function(path){
        var row={artist_id:art.id,id_type:fd.get('id_type'),upi:upi||null,updated_at:new Date().toISOString()};if(path)row.id_doc=path;
        db.from('artist_private').upsert(row).select().single().then(function(r){b.disabled=false;b.textContent='Save and continue';if(r.error){oops('save verification',r.error);return}priv=r.data;goStep(4)});
      };
      if(!file){done(null);return}
      if(file.size>5242880&&file.type==='application/pdf'){b.disabled=false;b.textContent='Save and continue';toast('That PDF is over 5 MB. Upload a photo of the ID instead.');return}
      shrink(file,1800).then(function(blob){
        var path=me.id+'/id-'+Date.now()+(file.type==='application/pdf'?'.pdf':'.jpg');
        db.storage.from('ids').upload(path,blob,{contentType:file.type==='application/pdf'?'application/pdf':'image/jpeg',upsert:false}).then(function(r){if(r.error){b.disabled=false;b.textContent='Save and continue';oops('upload your ID',r.error);return}done(path)});
      });
    });
    if($('submitApp'))$('submitApp').addEventListener('click',function(){
      if(!$('agree').checked){toast('Please tick the box to confirm.');return}
      if(!(art.photos||[]).length||!(priv&&priv.id_doc)||!Object.keys(art.services||{}).length){toast('Some steps are missing. Go back and complete them.');return}
      saveArtist({status:'pending'},route);
    });
  }
  function saveArtist(row,next){
    var q=art?db.from('artists').update(row).eq('id',art.id):db.from('artists').insert(Object.assign({status:'draft',name:row.name||'New partner',area:row.area||'',city:row.city||'Bangalore'},row));
    q.select().single().then(function(r){if(r.error){oops('save',r.error);return}art=r.data;next&&next()});
  }
  function shrink(file,max){
    return new Promise(function(res){
      if(!/^image\//.test(file.type)){res(file);return}
      var img=new Image(),u=URL.createObjectURL(file);
      img.onload=function(){var s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){res(b||file)},'image/jpeg',0.82)};
      img.onerror=function(){URL.revokeObjectURL(u);res(file)};img.src=u;
    });
  }
  function uploadPhotos(files){
    var have=(art.photos||[]).slice(),room=8-have.length;files=files.slice(0,room);if(!files.length)return;
    $('phMsg').textContent='Uploading '+files.length+' photo'+(files.length>1?'s':'')+'…';
    Promise.all(files.map(function(f,i){
      return shrink(f,1600).then(function(blob){
        var path=me.id+'/'+Date.now()+'-'+i+'.jpg';
        return db.storage.from('portfolio').upload(path,blob,{contentType:'image/jpeg',upsert:false}).then(function(r){if(r.error)throw r.error;return db.storage.from('portfolio').getPublicUrl(path).data.publicUrl});
      });
    })).then(function(urls){saveArtist({photos:have.concat(urls)},function(){onboard()})}).catch(function(e){oops('upload your photos',e);onboard()});
  }

  function review(kind){
    $('tabs').hidden=true;
    view('<div class="pcard center">'+(kind==='pending'
      ?'<div class="pbig">⏳</div><h2>Thank you, '+esc(first())+'!</h2><p>Your profile is with the SINGAAR team. We check every partner to keep customers safe, usually within 24 hours. This page updates by itself when you are approved.</p>'
      :'<div class="pbig">✎</div><h2>A few changes needed</h2><p>'+esc(art.review_note||'Please update your profile and submit again.')+'</p>')
      +'<div class="pnav center"><button type="button" class="pbtn ghost" id="editApp">Edit my profile</button></div></div>');
    $('editApp').addEventListener('click',function(){step=0;onboard()});
    listen();
  }

  /* ---------- dashboard ---------- */
  var TABS=[['requests','Requests'],['calendar','Calendar'],['prices','Prices'],['earnings','Earnings'],['profile','Profile']];
  function dashboard(){
    $('tabs').hidden=false;
    $('tabs').innerHTML=TABS.map(function(t){return '<button type="button" data-tab="'+t[0]+'"'+(tab===t[0]?' aria-current="page"':'')+'>'+t[1]+(t[0]==='requests'?'<b class="pdot" id="newDot" hidden></b>':'')+'</button>'}).join('');
    loadBookings().then(function(){drawTab();listen()});
  }
  $('tabs').addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(!b)return;tab=b.getAttribute('data-tab');[].forEach.call($('tabs').children,function(x){x.toggleAttribute('aria-current',x===b)});drawTab()});
  function loadBookings(){
    return db.from('bookings').select('*').eq('artist_id',art.id).order('date',{ascending:true}).then(function(r){
      if(r.error){oops('load bookings',r.error);return}bookings=r.data||[];
      var ids=bookings.map(function(b){return b.id});if(!ids.length)return;
      return db.from('messages').select('*').in('booking_id',ids).order('created_at').then(function(m){msgs={};(m.data||[]).forEach(addMsg)});
    });
  }
  function addMsg(m){(msgs[m.booking_id]=msgs[m.booking_id]||[]);if(!msgs[m.booking_id].some(function(x){return x.id===m.id}))msgs[m.booking_id].push(m)}
  function listen(){
    if(chan)return;
    chan=db.channel('partner-'+me.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'artists',filter:'owner=eq.'+me.id},function(p){var was=art&&art.status;art=p.new;if(was!==art.status){if(art.status==='approved'){toast('You are approved! Customers can now book you.');dashboard()}else route()}})
      .on('postgres_changes',{event:'*',schema:'public',table:'bookings'},function(p){
        var b=p.new;if(!b||!art||b.artist_id!==art.id)return;var i=bookings.findIndex(function(x){return x.id===b.id});
        if(i<0){bookings.push(b);if(b.status==='requested'){toast('New booking request from '+b.customer_name+' for '+fmtDate(b.date)+'!');ping()}}
        else{var old=bookings[i];bookings[i]=b;if(old.status!==b.status&&b.status==='cancelled')toast(b.customer_name+' cancelled the booking for '+fmtDate(b.date)+'.')}
        if(b.status!=='confirmed')stopTrip(b.id);
        if(art.status==='approved')drawTab();
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},function(p){
        var m=p.new,b=bookings.filter(function(x){return x.id===m.booking_id})[0];if(!b)return;addMsg(m);
        if(chatOpen===m.booking_id)drawChat();else if(m.side==='customer'){toast('Message from '+b.customer_name+': '+m.body.slice(0,60));ping()}
      }).subscribe();
  }
  function ping(){try{if(navigator.vibrate)navigator.vibrate(120)}catch(e){}var d=$('newDot');if(d)d.hidden=false}
  function drawTab(){
    if(tab==='requests'){var d=$('newDot');if(d)d.hidden=true}
    ({requests:drawRequests,calendar:drawCalendar,prices:drawPrices,earnings:drawEarnings,profile:drawProfile})[tab]();
  }
  function dchip(ds){var d=new Date(ds+'T00:00:00');return '<span class="pdate"><b>'+d.getDate()+'</b><i>'+d.toLocaleDateString('en-IN',{month:'short'})+'</i></span>'}
  function card(b,actions){
    return '<article class="pbk"><div class="pbkh">'+dchip(b.date)+'<div><h3>'+esc(b.customer_name)+'</h3><p>'+esc(SV[b.svc]||b.svc)+' · '+inr(b.price)+'</p></div></div>'
      +'<p class="pmeta">'+esc(b.venue)+(b.note?' · '+esc(b.note):'')+(b.paid?' · <b class="pok">advance paid</b>':'')+'</p>'+(actions||'')+'</article>';
  }
  function drawRequests(){
    var nw=bookings.filter(function(b){return b.status==='requested'}),up=bookings.filter(function(b){return b.status==='confirmed'}),past=bookings.filter(function(b){return ['completed','declined','cancelled'].indexOf(b.status)>-1}).reverse();
    var h='<h1 class="phi">Hi '+esc(first())+', '+(nw.length?nw.length+' new request'+(nw.length>1?'s':''):'no new requests')+'</h1>';
    h+=nw.length?nw.map(function(b){return card(b,'<div class="pact2"><button class="pbtn" data-acc="'+b.id+'">Accept</button><button class="pbtn ghost" data-dec="'+b.id+'">Decline</button></div>')}).join(''):'<div class="pempty">New requests appear here instantly, with a buzz on your phone.</div>';
    if(up.length)h+='<h2 class="psec">Upcoming</h2>'+up.map(function(b){var sh=!!trips[b.id];return card(b,'<div class="pact"><button class="pbtn'+(sh?' live':'')+'" data-trip="'+b.id+'">'+(sh?'Stop sharing location':'Start trip')+'</button><button class="pbtn ghost" data-chat="'+b.id+'">Chat'+((msgs[b.id]||[]).length?' ('+msgs[b.id].length+')':'')+'</button><button class="pbtn ghost" data-done="'+b.id+'">Mark completed</button></div>')}).join('');
    if(past.length)h+='<h2 class="psec">Past</h2>'+past.slice(0,20).map(function(b){return card(b,'<p class="pst '+b.status+'">'+b.status+'</p>')}).join('');
    view(h);
  }
  function setStatus(id,status,reply){
    var row={status:status,updated_at:new Date().toISOString()};if(reply!=null)row.reply=reply;
    db.from('bookings').update(row).eq('id',id).select().single().then(function(r){
      if(r.error){oops('update the booking',r.error);return}
      var i=bookings.findIndex(function(x){return x.id===id});if(i>-1)bookings[i]=r.data;
      if(status!=='confirmed')stopTrip(id);
      toast(status==='confirmed'?'Accepted. The customer has been told, and the date is blocked.':status==='declined'?'Declined. The customer has been told.':'Marked as completed.');drawTab();
    });
  }
  $('app').addEventListener('click',function(e){
    var t=e.target,x;
    if((x=t.closest('[data-acc]'))){var b=bookings.filter(function(y){return y.id===x.getAttribute('data-acc')})[0];if(b&&blockedOn(b.date)){toast('You have blocked this date. Open it in Calendar first, or decline.');return}setStatus(x.getAttribute('data-acc'),'confirmed','Happy to do this! I will message you a few days before to confirm timings.');return}
    if((x=t.closest('[data-dec]'))){setStatus(x.getAttribute('data-dec'),'declined','Sorry, I am not available for this one. Thank you for asking!');return}
    if((x=t.closest('[data-done]'))){setStatus(x.getAttribute('data-done'),'completed');return}
    if((x=t.closest('[data-trip]'))){var id=x.getAttribute('data-trip');if(trips[id])stopTrip(id,true);else startTrip(id);drawTab();return}
    if((x=t.closest('[data-chat]'))){openChat(x.getAttribute('data-chat'));return}
    if((x=t.closest('[data-day]'))){toggleDay(x.getAttribute('data-day'));return}
    if((x=t.closest('[data-month]'))){var p=month.split('-'),d=new Date(+p[0],+p[1]-1+parseInt(x.getAttribute('data-month'),10),1);month=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);drawCalendar();return}
    if((x=t.closest('[data-edit]'))){step=parseInt(x.getAttribute('data-edit'),10);$('tabs').hidden=true;onboard();return}
  });

  /* trip: share live location with this one customer while travelling */
  function startTrip(id){
    if(!('geolocation' in navigator)){toast('This phone cannot share its location.');return}
    var last=0;
    trips[id]=navigator.geolocation.watchPosition(function(pos){
      var n=Date.now();if(n-last<6000)return;last=n;
      db.from('locations').upsert({booking_id:id,lat:pos.coords.latitude,lng:pos.coords.longitude,updated_at:new Date().toISOString()}).then(function(r){if(r.error)oops('share your location',r.error)});
    },function(err){stopTrip(id);toast(err&&err.code===1?'Allow location for SINGAAR Partner to share your trip.':'Could not read your location.');drawTab()},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
    toast('Trip started. The customer can see you on the map until you stop.');
  }
  function stopTrip(id,say){if(trips[id]==null)return;try{navigator.geolocation.clearWatch(trips[id])}catch(e){}delete trips[id];if(say)toast('Trip stopped. Your location is no longer shared.')}

  /* chat */
  function openChat(id){chatOpen=id;$('modal').hidden=false;drawChat()}
  function drawChat(){
    var b=bookings.filter(function(x){return x.id===chatOpen})[0];if(!b)return;
    var l=(msgs[b.id]||[]).map(function(m){return '<div class="pmsg '+(m.side==='artist'?'me':'her')+'">'+esc(m.body)+'</div>'}).join('')||'<p class="pnote">No messages yet. Say hello!</p>';
    $('sheet').innerHTML='<div class="pchh"><b>'+esc(b.customer_name)+'</b><span>'+esc(SV[b.svc]||b.svc)+' · '+fmtDate(b.date)+'</span><button type="button" class="px" id="chatX" aria-label="Close">×</button></div><div class="pchat" id="chatBox">'+l+'</div><form class="pchf" id="chatF"><input id="chatIn" maxlength="500" placeholder="Type a message" autocomplete="off" aria-label="Message"><button class="pbtn" type="submit">Send</button></form>';
    var bx=$('chatBox');bx.scrollTop=bx.scrollHeight;
    $('chatX').onclick=function(){$('modal').hidden=true;chatOpen=null;drawTab()};
    $('chatF').onsubmit=function(e){e.preventDefault();var v=$('chatIn').value.trim();if(!v)return;$('chatIn').value='';
      db.from('messages').insert({booking_id:b.id,side:'artist',body:v}).select().single().then(function(r){if(r.error){oops('send the message',r.error);return}addMsg(r.data);drawChat()})};
    $('chatIn').focus();
  }

  /* calendar */
  function blockedOn(d){return (art.blocked||[]).indexOf(d)>-1}
  function toggleDay(d){
    var l=(art.blocked||[]).slice(),i=l.indexOf(d);if(i>-1)l.splice(i,1);else l.push(d);
    saveArtist({blocked:l},function(){drawCalendar();toast(i>-1?'Date open again.':'Date blocked. Customers will not see you as free.')});
  }
  function drawCalendar(){
    if(!month)month=today().slice(0,7);
    var p=month.split('-'),y=+p[0],m=+p[1]-1,f=new Date(y,m,1),dim=new Date(y,m+1,0).getDate(),off=(f.getDay()+6)%7,t=today();
    var h='<div class="pcalh"><button type="button" class="pbtn ghost sm" data-month="-1" aria-label="Previous month">‹</button><h2>'+f.toLocaleDateString('en-IN',{month:'long',year:'numeric'})+'</h2><button type="button" class="pbtn ghost sm" data-month="1" aria-label="Next month">›</button></div><div class="pcal">'+DAYS.map(function(d){return '<b>'+d+'</b>'}).join('');
    for(var i=0;i<off;i++)h+='<span></span>';
    for(var d=1;d<=dim;d++){
      var ds=y+'-'+('0'+(m+1)).slice(-2)+'-'+('0'+d).slice(-2),bk=bookings.filter(function(b){return b.date===ds&&b.status==='confirmed'})[0],bl=blockedOn(ds),past=ds<t;
      h+='<button type="button" class="pday'+(bk?' bk':bl?' bl':'')+(past?' past':'')+'" '+(past||bk?'disabled':'data-day="'+ds+'"')+' aria-label="'+ds+(bk?' booked':bl?' blocked':' free')+'"><b>'+d+'</b><span>'+(bk?esc(bk.customer_name.slice(0,7)):bl?'Off':'')+'</span></button>';
    }
    view(h+'</div><p class="pnote">Tap a free day to block it, tap again to open it. Booked days are filled in.</p>');
  }

  /* prices */
  function drawPrices(){
    var sv=art.services||{};
    view('<h1 class="phi">Your prices</h1><p class="psub">Changes show on your profile straight away.</p><form id="fp" class="pform">'+Object.keys(SV).map(function(k){return '<label class="psv'+(sv[k]!=null?' on':'')+'"><input type="checkbox" name="svc" value="'+k+'"'+(sv[k]!=null?' checked':'')+'><span>'+SV[k]+'</span><span class="ppr">₹<input type="number" name="p_'+k+'" min="100" max="200000" step="100" value="'+(sv[k]!=null?sv[k]:'')+'" aria-label="Price for '+SV[k]+'"></span></label>'}).join('')+'<button class="pbtn" type="submit">Save prices</button></form>');
    $('fp').addEventListener('submit',function(e){
      e.preventDefault();var f=$('fp'),out={},bad='';
      [].forEach.call(f.querySelectorAll('input[name=svc]:checked'),function(c){var v=parseInt(f.querySelector('[name=p_'+c.value+']').value,10);if(!(v>=100&&v<=200000))bad=SV[c.value];else out[c.value]=v});
      if(bad){toast('Set a price between ₹100 and ₹2,00,000 for '+bad+'.');return}
      if(!Object.keys(out).length){toast('Keep at least one service.');return}
      saveArtist({services:out},function(){toast('Prices saved.')});
    });
  }

  /* earnings */
  function drawEarnings(){
    var done=bookings.filter(function(b){return b.status==='completed'}),g=done.reduce(function(s,b){return s+b.price},0),fee=Math.round(g*0.10);
    var up=bookings.filter(function(b){return b.status==='confirmed'}),upv=up.reduce(function(s,b){return s+b.price},0);
    var joined=new Date(art.created_at),free=new Date(joined.getFullYear(),joined.getMonth()+3,joined.getDate());
    view('<h1 class="phi">Your earnings</h1><div class="pstats"><div><span>Earned</span><b>'+inr(g)+'</b></div><div><span>SINGAAR 10%</span><b>'+inr(fee)+'</b></div><div><span>You keep</span><b>'+inr(g-fee)+'</b></div></div>'
      +'<p class="pline">Coming up: '+up.length+' booking'+(up.length===1?'':'s')+' worth '+inr(upv)+'.</p>'
      +'<p class="pline">Platform fee: <b>'+(new Date()<free?'₹0 until '+free.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'₹299 a month')+'</b>. Commission is taken only on completed bookings.</p>'
      +'<p class="pnote">Payouts to your UPI start when online payments go live.</p>');
  }

  /* profile */
  function drawProfile(){
    var sv=art.services||{};
    view('<div class="pprof">'+(art.photos&&art.photos[0]?'<img src="'+esc(art.photos[0])+'" alt="">':'')+'<div><h1 class="phi">'+esc(art.name)+'</h1><p>'+esc(art.area)+', '+esc(art.city)+' · '+(art.travel?'goes to customers':'at the salon')+'</p><p class="pst approved">Approved · live on SINGAAR</p></div></div>'
      +'<div class="pgal view">'+(art.photos||[]).map(function(u){return '<figure><img src="'+esc(u)+'" alt="Your work"></figure>'}).join('')+'</div>'
      +'<p class="pline">'+Object.keys(sv).map(function(k){return esc(SV[k])+' '+inr(sv[k])}).join(' · ')+'</p>'
      +'<div class="pact"><button class="pbtn ghost" data-edit="0">Edit details</button><button class="pbtn ghost" data-edit="2">Edit photos</button><button class="pbtn ghost" data-edit="3">Verification and UPI</button></div>'
      +'<p class="pnote">Need help? Write to the SINGAAR team from the email you signed in with.</p>');
  }
})();
