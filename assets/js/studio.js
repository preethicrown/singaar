/* SINGAAR AI Look Studio: the core flow on the home page.
   1. A customer describes her occasion and can add a photo of her outfit.
   2. AI (api/ai, task "brief") writes her Look Brief: palette from the outfit, look per ritual, services needed, prep checklist.
   3. Plain code adds the timeline from her muhurtham time and matches verified artists by service, city and budget.
   4. "Send to verified artists" stores the brief as a request; approved artists in her city quote in SINGAAR Partner;
      she accepts a quote and a confirmed booking is created. */
(function(){
  var SG=window.SG,A=window.SGAuth;if(!SG)return;
  var $=function(i){return document.getElementById(i)},esc=SG.esc,inr=SG.inr,SV=SG.SV;
  var RIT={'Wedding (muhurtham)':['bridal','saree','hair'],'Engagement':['engagement','hair'],'Reception':['reception','hair'],'Mehendi':['mehendi'],'Haldi':['prebridal','facial'],'Sangeet':['party','hair'],'Nikah':['bridal','hair'],'Church wedding':['bridal','hair'],'Party or function':['party','blowdry'],'Bridesmaid or family':['bridesmaid','saree']};
  var DUR={bridal:240,engagement:150,reception:150,party:90,bridesmaid:90,mehendi:180,saree:30,hair:60,prebridal:90,facial:60,blowdry:45};
  var form=$('stForm');if(!form)return;
  var photo=null,last=null,real=!!window.SINGAAR_REAL;
  var tt=function(m){SG.toast(m)};

  /* ---------- outfit photo: resized on the phone before it is sent ---------- */
  function shrink(file,max){
    return new Promise(function(res){
      var img=new Image(),u=URL.createObjectURL(file);
      img.onload=function(){var s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',0.82))};
      img.onerror=function(){URL.revokeObjectURL(u);res(null)};img.src=u;
    });
  }
  $('stPhoto').addEventListener('change',function(){
    var f=this.files[0];if(!f)return;
    if(!/^image\//.test(f.type)){tt('Please choose a photo.');return}
    shrink(f,1024).then(function(d){photo=d;var p=$('stPrev');if(d){p.src=d;p.hidden=false;$('stPhotoTxt').textContent='Outfit added. Tap to change.'}else tt('Could not read that photo.')});
  });

  /* ---------- the AI brief ---------- */
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ritual=$('stRitual').value,date=$('stDate').value,time=$('stTime').value,city=$('stCity').value,budget=parseInt($('stBudget').value,10)||0,notes=$('stNotes').value.trim();
    if(!date){tt('Choose the date of your occasion.');$('stDate').focus();return}
    var b=form.querySelector('button[type=submit]');b.disabled=true;b.innerHTML='<span class="stspin" aria-hidden="true"></span> Creating your look plan…';
    $('stOut').innerHTML='<div class="stthink"><b>Our AI stylist is working…</b><span>'+(photo?'Reading the colours and work on your outfit, then ':'')+'planning each look for your '+esc(ritual.toLowerCase())+'.</span></div>';
    $('stOut').scrollIntoView({behavior:'smooth',block:'nearest'});
    fetch('api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:'brief',ritual:ritual,city:city,budget:budget,notes:notes,services:Object.keys(SV),image:photo||undefined})})
      .then(function(r){return r.json().catch(function(){return null}).then(function(j){return {ok:r.ok,j:j}})})
      .then(function(x){
        b.disabled=false;b.innerHTML='Create my look plan';
        if(!x.ok||!x.j||!x.j.ok){$('stOut').innerHTML='<div class="sterr">Our AI stylist is not available right now. Please try again in a minute.</div>';return}
        var svcs=x.j.brief.services.length?x.j.brief.services:RIT[ritual]||['bridal'];
        x.j.brief.services=svcs;
        last={ritual:ritual,date:date,time:time,city:city,area:$('stArea').value.trim(),budget:budget,notes:notes,brief:x.j.brief,sawPhoto:x.j.sawPhoto};
        draw();
      }).catch(function(){b.disabled=false;b.innerHTML='Create my look plan';$('stOut').innerHTML='<div class="sterr">No connection. Check your internet and try again.</div>'});
  });

  function minus(t,m){if(!t)return '';var p=t.split(':'),x=(+p[0])*60+(+p[1])-m;x=((x%1440)+1440)%1440;var h=Math.floor(x/60),mm=x%60;return (h%12||12)+':'+(mm<10?'0':'')+mm+(h<12?' am':' pm')}
  function matches(){
    var k=last.brief.services,main=k[0];
    return SG.P.filter(function(p){return p.city===last.city&&k.some(function(s){return p.pk[s]!=null})&&!SG.busyOn(p,last.date)})
      .map(function(p){var cost=k.reduce(function(s,x){return s+(p.pk[x]||0)},0),cover=k.filter(function(x){return p.pk[x]!=null}).length;return {p:p,cost:cost,cover:cover}})
      .sort(function(a,b){return (b.cover-a.cover)||((last.budget&&a.cost>last.budget?1:0)-(last.budget&&b.cost>last.budget?1:0))||(a.cost-b.cost)}).slice(0,4);
  }
  function draw(){
    var br=last.brief,k=br.services,mainDur=Math.max.apply(null,k.map(function(s){return DUR[s]||60}));
    var h='<article class="stbrief"><header><p class="eyebrow">Your SINGAAR Look Brief</p><h3>'+esc(last.ritual)+' · '+esc(SG.fmtDate(last.date))+(last.time?' · '+esc(minus(last.time,0)):'')+'</h3><p>'+esc(br.summary)+'</p>'
      +(br.outfit?'<p class="stoutfit"><b>Your outfit:</b> '+esc(br.outfit)+'</p>':'')+'</header>';
    if(br.palette.length)h+='<div class="stpal" aria-label="Colours for your look">'+br.palette.map(function(c){return '<span><i style="background:'+c.hex+'"></i>'+esc(c.name)+'</span>'}).join('')+'</div>';
    h+='<div class="stlooks">'+br.looks.map(function(l){return '<section class="stlook"><h4>'+esc(l.ritual||last.ritual)+'</h4><dl>'+(l.makeup?'<dt>Makeup</dt><dd>'+esc(l.makeup)+'</dd>':'')+(l.hair?'<dt>Hair</dt><dd>'+esc(l.hair)+'</dd>':'')+(l.draping?'<dt>Draping</dt><dd>'+esc(l.draping)+'</dd>':'')+(l.jewellery?'<dt>Jewellery</dt><dd>'+esc(l.jewellery)+'</dd>':'')+'</dl></section>'}).join('')+'</div>';
    h+='<div class="stgrid"><section><h4>Services you need</h4><div class="stchips">'+k.map(function(s){return '<span>'+esc(SV[s][0])+'</span>'}).join('')+'</div>';
    if(last.time)h+='<h4>Your timeline</h4><ul class="sttime"><li><b>'+minus(last.time,mainDur+30)+'</b> artist arrives</li><li><b>'+minus(last.time,30)+'</b> you are ready for photos</li><li><b>'+minus(last.time,0)+'</b> '+esc(last.ritual.toLowerCase())+'</li></ul>';
    h+='</section><section><h4>Before the day</h4><ul class="stcheck">'+br.checklist.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>'
      +(br.ask_artist.length?'<h4>Ask your artist</h4><ul class="stcheck">'+br.ask_artist.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>':'')+'</section></div>';
    var m=matches();
    h+='<section class="stmatch"><h4>Verified artists for this brief in '+esc(last.city)+'</h4>';
    h+=m.length?'<div class="stmlist">'+m.map(function(x){return '<button type="button" class="stm" data-open="'+x.p.id+'"><img src="'+SG.ph(SG.cover(x.p))+'" alt=""><b>'+esc(x.p.name)+'</b><span>'+x.cover+' of '+k.length+' services · '+inr(x.cost)+(last.budget&&x.cost>last.budget?' · above budget':'')+'</span></button>'}).join('')+'</div>'
      :'<p class="stnone">Verified artists are joining in '+esc(last.city)+'. Send your brief and they will quote you directly.</p>';
    h+='</section><div class="stsend">'+(real?'<button type="button" class="btn red" id="stSend">Send my brief to verified artists</button><p>Artists in '+esc(last.city)+' reply with their price and a message. You choose. Your phone number is never shared.</p>':'<p>On the live site this brief is sent to verified artists for quotes.</p>')+'</div></article>';
    $('stOut').innerHTML=h;
    var s=$('stSend');if(s)s.addEventListener('click',send);
  }

  /* ---------- send the brief as a real request ---------- */
  function send(){
    if(!A||!A.on||!window.SGLive)return;
    if(SGLive.needLogin()){SGLive.login(send,'Sign in to send your brief');return}
    var u=A.user(),name=(u&&u.email||'Customer').split('@')[0].slice(0,40);
    var row={customer_name:prompt('Your first name, so artists know who they are talking to:',name)||name,city:last.city,area:last.area||null,ritual:last.ritual,date:last.date,time:last.time||null,budget:last.budget||null,services:last.brief.services,brief:last.brief,notes:last.notes||null};
    row.customer_name=String(row.customer_name).trim().slice(0,40)||name;
    var b=$('stSend');b.disabled=true;b.textContent='Sending…';
    A.db.from('requests').insert(row).select().single().then(function(r){
      if(r.error){b.disabled=false;b.textContent='Send my brief to verified artists';tt('Could not send. '+A.friendly(r.error));return}
      $('stOut').querySelector('.stsend').innerHTML='<p class="stok"><b>Sent!</b> Verified artists in '+esc(last.city)+' can now quote you. You will see their offers under <a href="#/bookings" data-go="bookings">Bookings</a>, live.</p>';
      SG.burst();loadMine();
    });
  }

  /* ---------- my requests and the quotes on them (Bookings screen) ---------- */
  var mine=[],quotes={},sub=null;
  function loadMine(){
    if(!A||!A.on||!A.user()){mine=[];drawMine();return}
    A.db.from('requests').select('*').eq('customer',A.user().id).order('created_at',{ascending:false}).limit(20).then(function(r){
      if(r.error)return;mine=r.data||[];var ids=mine.map(function(x){return x.id});
      if(!ids.length){quotes={};drawMine();return}
      A.db.from('quotes').select('*').in('request_id',ids).order('price').then(function(q){quotes={};(q.data||[]).forEach(function(x){(quotes[x.request_id]=quotes[x.request_id]||[]).push(x)});drawMine()});
    });
  }
  function artistOf(uuid){return SG.P.filter(function(p){return p.uuid===uuid})[0]}
  function drawMine(){
    var box=$('reqList');if(!box)return;
    if(!mine.length){box.innerHTML='';box.hidden=true;return}
    box.hidden=false;
    box.innerHTML='<h3 class="sech">Your look requests</h3>'+mine.map(function(r){
      var q=quotes[r.id]||[];
      return '<article class="bk"><div class="bkhead"><div><h3>'+esc(r.ritual)+'</h3><p class="meta">'+esc(SG.fmtDate(r.date))+' · '+esc(r.city)+(r.budget?' · budget '+inr(r.budget):'')+'</p></div><span class="st '+(r.status==='booked'?'ok':'wait')+'">'+(r.status==='booked'?'Booked':q.length?q.length+' quote'+(q.length>1?'s':''):'Waiting for quotes')+'</span></div>'
        +(q.length?q.map(function(x){var a=artistOf(x.artist_id);return '<div class="quote"><div class="qwho">'+(a?'<img src="'+SG.ph(SG.cover(a))+'" alt="">':'')+'<div><b>'+esc(a?a.name:'Verified artist')+'</b><span>'+esc(a?a.area:'')+'</span></div><b class="qprice">'+inr(x.price)+'</b></div>'+(x.message?'<p>'+esc(x.message)+'</p>':'')
          +(r.status==='open'&&x.status==='sent'?'<div class="actions">'+(a?'<button class="btn ghost dark small" type="button" data-open="'+a.id+'">Her profile</button>':'')+'<button class="btn red small" type="button" data-acceptq="'+x.id+'">Accept '+inr(x.price)+'</button></div>':'<p class="note">'+(x.status==='accepted'?'Accepted. See the booking below.':'Not chosen.')+'</p>')+'</div>'}).join('')
          :'<p class="note">Verified artists in '+esc(r.city)+' have been told. Quotes appear here the moment they reply.</p>')
        +'</article>';
    }).join('');
  }
  document.addEventListener('click',function(e){
    var x=e.target.closest('[data-acceptq]');if(!x)return;
    var qid=x.getAttribute('data-acceptq'),r=null,q=null;
    mine.forEach(function(m){(quotes[m.id]||[]).forEach(function(z){if(z.id===qid){r=m;q=z}})});
    if(!r||!q)return;var a=artistOf(q.artist_id);
    x.disabled=true;x.textContent='Booking…';
    var bid=SGLive.newId();
    A.db.from('bookings').insert({id:bid,artist_id:q.artist_id,customer_name:r.customer_name,svc:(r.services&&r.services[0])||'bridal',date:r.date,venue:(r.area||r.city).slice(0,80),note:('Look request: '+r.ritual).slice(0,240),price:q.price,status:'confirmed',quote_id:q.id}).then(function(res){
      if(res.error){x.disabled=false;x.textContent='Accept '+inr(q.price);tt('Could not book. '+A.friendly(res.error));return}
      A.db.from('quotes').update({status:'accepted'}).eq('id',q.id).then(function(){
        (quotes[r.id]||[]).forEach(function(z){if(z.id!==q.id&&z.status==='sent')A.db.from('quotes').update({status:'declined'}).eq('id',z.id)});
        A.db.from('requests').update({status:'booked'}).eq('id',r.id).then(function(){loadMine()});
      });
      tt('Booked with '+(a?a.name:'your artist')+'. Chat with her and track her arrival from your booking.');SG.burst();
    });
  });
  function listen(){
    if(!A||!A.on||sub)return;
    sub=A.db.channel('studio-'+A.user().id)
      .on('postgres_changes',{event:'*',schema:'public',table:'quotes'},function(p){if(p.new&&mine.some(function(r){return r.id===p.new.request_id})){if(p.eventType==='INSERT'){var a=artistOf(p.new.artist_id);tt((a?a.name:'An artist')+' sent you a quote: '+inr(p.new.price));SG.burst()}loadMine()}})
      .subscribe();
  }
  if(A&&A.on)A.onChange(function(u){if(u){loadMine();listen()}else{mine=[];quotes={};drawMine();if(sub){try{A.db.removeChannel(sub)}catch(e){}sub=null}}});
  var dd=$('stDate');if(dd){var t=new Date(Date.now()+86400000);dd.min=t.toISOString().slice(0,10)}
})();
