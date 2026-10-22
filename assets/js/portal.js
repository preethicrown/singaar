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
  /* The portal now lives inline as the "Bookings" screen (customer) and the artist screens
     (Requests, Calendar, Prices, Earnings). The app shell in shell.js decides which one shows. */
  var VIEWS={'bookings':['client','bookings'],'a-requests':['artist','requests'],'a-calendar':['artist','calendar'],'a-services':['artist','services'],'a-earnings':['artist','earnings']};
  function show(view){
    var m=VIEWS[view];if(!m)return;
    if(m[0]!==ui.role)ui.pay=null;
    ui.role=m[0];
    if(m[0]==='artist')ui.tab=m[1];else if(ui.tab!=='saved')ui.tab='bookings';
    if(!ui.artist||!p(ui.artist)||(Store.d.mine&&ui.mineSeen!==Store.d.mine)){ui.artist=defaultArtist();ui.mineSeen=Store.d.mine}
    if(m[0]==='artist'&&Store.d.artistIn&&p(Store.d.artistIn))ui.artist=Store.d.artistIn;
    render();
  }
  function open(role){SG.go(role==='artist'?'a-requests':'bookings')}
  function refresh(){if(SG.view&&VIEWS[SG.view()])render()}
  var TITLES={bookings:'My bookings',saved:'Saved artists',requests:'Booking requests',calendar:'Your calendar',services:'Your services and prices',earnings:'Your earnings'};
  var HELP={bookings:'',saved:'Artists you hearted. Ask your family to help you choose.',requests:'',calendar:'Tap a day to block it.',services:'Your prices show on your profile.',earnings:'What you earn, and what you keep.'};
  function dchip(ds){var d=new Date(ds+'T00:00:00');return '<span class="dchip"><b>'+d.getDate()+'</b><i>'+d.toLocaleDateString('en-IN',{month:'short'})+'</i></span>'}
  var HNAMES=['Ananya','Divya','Meera','Sana','Keerthi','Nisha','Priya','Kavya'];
  function sampleHistory(pid){
    var a=p(pid);if(!a||!a.sample)return [];var ks=Object.keys(a.pk),offs=[6,13,21,34,48],out=[];
    for(var i=0;i<5;i++){var k=ks[(i+pid)%ks.length],d=new Date(TODAY+'T00:00:00');d.setDate(d.getDate()-offs[i]);
      var ds=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
      out.push({id:'h'+pid+'_'+i,pid:pid,svc:k,date:ds,venue:'Sample booking',name:HNAMES[(i*3+pid)%HNAMES.length],note:'',price:a.pk[k],status:'completed',sample:true,created:0,reply:''})}
    return out;
  }
  function signedIn(){return !!(Store.d.artistIn&&p(Store.d.artistIn))}
  function renderGate(){
    var cnt={};mine().forEach(function(b){if(b.status==='requested')cnt[b.pid]=(cnt[b.pid]||0)+1});
    var list=artistList().filter(function(a){return !a.remote||a.id===Store.d.mine||(window.SGLive&&SGLive.isMine(a))}).sort(function(a,b){return ((b.id===Store.d.mine)-(a.id===Store.d.mine))||((cnt[b.id]||0)-(cnt[a.id]||0))});
    var opts=list.map(function(a){var c=cnt[a.id];return '<option value="'+a.id+'">'+esc(a.name)+' · '+esc(a.area)+(a.id===Store.d.mine?' · your listing':'')+(c?' · '+c+' new request'+(c>1?'s':''):'')+'</option>'}).join('');
    $('portalSheet').innerHTML='<div class="phead"><div><p class="eyebrow">Artist space</p><h2 id="portalTitle">Artist sign in</h2></div></div><div class="pbody gate"><div class="field"><label for="gateSel">Your profile</label><select id="gateSel">'+opts+'</select></div><button class="btn red" type="button" data-act="signin">Sign in</button><p class="gatenew">New here? <button class="linkbtn" type="button" data-join>List yourself</button></p><p class="note">Demo sign-in. Phone verification comes with launch.</p></div>';
  }
  function render(){
    var isC=ui.role==='client';if(!isC&&!signedIn()){renderGate();return}
    var tabs=isC?[['bookings','Bookings'],['saved','Saved artists']]:[];
    if(isC&&!tabs.some(function(t){return t[0]===ui.tab}))ui.tab='bookings';
    var title=TITLES[ui.tab],help=isC&&ui.tab==='bookings'?daysLine():HELP[ui.tab];
    if(!isC&&ui.tab==='requests'){
      var me=p(ui.artist),nNew=mine().filter(function(b){return b.pid===ui.artist&&b.status==='requested'}).length;
      title='Hi '+esc(me?me.name.split(' ')[0]:'there')+', '+(nNew?nNew+' new request'+(nNew===1?'':'s'):'no new requests');help='';
    }
    var h='<div class="phead"><div><p class="eyebrow">'+(isC?'My SINGAAR':'Artist dashboard')+'</p><h2 id="portalTitle">'+title+'</h2>'
      +(help?'<p class="meta">'+help+'</p>':'')+'</div></div>'
      +'<div class="pbody">';
    if(tabs.length)h+='<div class="ptabs" role="tablist">'+tabs.map(function(t){return '<button type="button" role="tab" aria-selected="'+(ui.tab===t[0])+'" data-act="tab" data-v="'+t[0]+'">'+t[1]+tabCount(t[0])+'</button>'}).join('')+'</div>';
    h+='<div id="pPanel">'+(ui.pay&&isC?payPanel():panel())+'</div>';
    h+='<details class="democtl"><summary>Demo controls</summary>';
    if(!isC)h+='<div class="field"><label for="pArtist">Show the dashboard of</label><select id="pArtist" data-act="artist">'+artistList().map(function(a){return '<option value="'+a.id+'"'+(a.id===ui.artist?' selected':'')+'>'+esc(a.name)+' · '+esc(a.area)+', '+esc(a.city)+(a.sample?'':' (you)')+'</option>'}).join('')+'</select></div>';
    h+='<label class="autor"><input type="checkbox" data-act="auto"'+(Store.d.autoReply?' checked':'')+'> Sample artists reply automatically (preview)</label>';
    if(!isC&&ui.tab==='requests')h+='<div class="actions" style="margin-top:10px">'+btn('simulate','','Add a sample booking request','ghost dark')+'</div>';
    if(!isC&&Store.d.artistIn)h+='<div class="actions" style="margin-top:10px">'+btn('signout','','Sign out','ghost dark')+'</div>';h+='</details></div>';
    $('portalSheet').innerHTML=h;
  }
  /* ---------- advance payment (test checkout) ----------
     Nothing is charged and no card or UPI details are collected. The live product will use Razorpay,
     with orders created and verified on a server. */
  function advance(b){return Math.min(b.price,Math.max(500,Math.round(b.price*0.2/100)*100))}
  function wa(href,label){return '<a class="btn ghost dark small" href="'+href+'" target="_blank" rel="noopener noreferrer">'+label+'</a>'}
  function famLink(list){
    var occ=SG.state.occ,lines=['Help me choose! I am looking for '+SV[occ][0].toLowerCase()+' ('+SG.state.city+', sample prices on SINGAAR). Reply with the number you like best:'];
    list.forEach(function(a,i){lines.push((i+1)+'. '+a.name+' ('+a.area+')'+(a.pk[occ]!=null?' '+inr(a.pk[occ]):''))});
    return waOpen(lines.join('\n'));
  }
  function waOpen(text){return 'https://wa.me/?text='+encodeURIComponent(text)}
  function payPanel(){
    var b=mine().filter(function(x){return x.id===ui.pay})[0],a=b&&p(b.pid);
    if(!b||!a||b.paid||b.status!=='confirmed'){ui.pay=null;return panel()}
    var adv=advance(b);
    return '<div class="checkout"><h3>Secure your date</h3>'
      +'<div class="sum"><div><span>Artist</span><b>'+esc(a.name)+'</b></div><div><span>Service</span><b>'+esc(SV[b.svc][0])+'</b></div><div><span>Date</span><b>'+esc(SG.fmtDate(b.date))+'</b></div><div><span>Full price</span><b>'+inr(b.price)+'</b></div><div class="due"><span>Advance due now</span><b>'+inr(adv)+'</b></div><div><span>Balance after the service</span><b>'+inr(b.price-adv)+'</b></div></div>'
      +'<fieldset class="methods"><legend>Pay with</legend><label><input type="radio" name="pm" checked> UPI</label><label><input type="radio" name="pm"> Card</label><label><input type="radio" name="pm"> Netbanking</label></fieldset>'
      +'<p class="note demo">Test checkout: no money moves.</p>'
      +'<div class="actions"><button class="btn red" type="button" data-act="payconfirm" data-id="'+b.id+'">Pay '+inr(adv)+' (test)</button><button class="btn ghost dark" type="button" data-act="paycancel">Back</button></div></div>';
  }
  function daysLine(){
    var c=mine().filter(function(b){return b.status==='confirmed'&&daysTo(b.date)>=0}).sort(function(a,b){return a.date<b.date?-1:1})[0];
    if(c){var n=daysTo(c.date);return n===0?'Your day is today. Shine!':n+' day'+(n===1?'':'s')+' to your '+SV[c.svc][0].toLowerCase()+' with '+(p(c.pid)?p(c.pid).name:'your artist')+'.'}
    return '';
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
    var av=(side==='client'&&a)?'<img class="avt" src="'+SG.ph(SG.cover(a))+'" alt="" loading="lazy">':(side==='artist'?dchip(b.date):'');
    var h='<article class="bk"><div class="bkhead"><div class="who">'+av+'<div><h3>'+esc(side==='artist'?(b.name||'A customer'):(a?a.name:'Artist'))+'</h3><p class="meta">'+esc(SV[b.svc][0])+' · '+esc(SG.fmtDate(b.date))+' · '+inr(b.price)+'</p></div></div>'+statusBadge(b.status)+'</div>'
      +(side==='artist'?'<p class="meta">Venue: '+esc(b.venue)+(b.note?' · Note: '+esc(b.note):'')+'</p>':'');
    
    var act='';
    if(side==='client'){
      var hi='Hi '+(a?a.name.split(' ')[0]:'')+', this is '+(b.name||'a customer')+' about my SINGAAR booking for '+SV[b.svc][0].toLowerCase()+' on '+SG.fmtDate(b.date)+'.';
      if(b.status==='requested')act+=btn('chat',b.id,'Chat','red')+btn('cancel',b.id,'Cancel request','ghost dark');
      if(b.status==='confirmed'){
        var adv=advance(b);
        
        
        act+=(b.paid?'':btn('pay',b.id,'Pay advance '+inr(adv),'red'))+btn('track',b.id,'Track arrival',b.paid?'red':'ghost dark')+btn('chat',b.id,'Chat','ghost dark');
        if(b.svc==='bridal'){if(n>=0)h+='<p class="countdown">'+(n===0?'Today!':n+' day'+(n===1?'':'s')+' to go')+'</p>'}else h+='<p class="visit">'+(a&&a.travel?'She comes to you':'You visit her salon')+'</p>';
      }
      if(b.refund)h+='<p class="payline">Your advance of '+inr(advance(b))+' would be refunded (test).</p>';
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
      if(b.status==='confirmed'){
        h+='<p class="payline'+(b.paid?' ok':'')+'">'+(b.paid?'Advance received: '+inr(advance(b))+' (test).':'Waiting for the advance of '+inr(advance(b))+'.')+'</p>';
        act+=(b.remote&&window.SGLive?btn('trip',b.id,SGLive.sharing(b.id)?'Stop sharing location':'Start trip','red'):'')+btn('complete',b.id,'Mark completed',b.remote?'ghost dark':'red')+btn('achat',b.id,'Chat','ghost dark')+wa(waOpen('Hi '+(b.name||'')+', this is '+(a?a.name.split(' ')[0]:'your artist')+' from SINGAAR. About your '+SV[b.svc][0].toLowerCase()+' on '+SG.fmtDate(b.date)+': '),'Message on WhatsApp')+btn('cancel',b.id,'Cancel','ghost dark');
      }
    }
    if(act)h+='<div class="actions">'+act+'</div>';
    return h+'</article>';
  }
  function autoLine(t){
    t=t.toLowerCase();
    if(/time|when|arrive|late/.test(t))return 'I will be there on time, and confirm the exact timing a day before.';
    if(/price|cost|charge|extra/.test(t))return 'The price is as listed. No hidden charges.';
    if(/trial|photo|look|design/.test(t))return 'Yes, please send a photo of the look you like. I will plan it.';
    return 'Noted, thank you! See you then.';
  }
  function openChat(id,side){
    var b=bookingById(id);if(!b)return;side=side||'client';
    var a=p(b.pid),first=a?a.name.split(' ')[0]:'Artist',cust=b.name||'Customer',adv=advance(b),st=b.status,art=side==='artist';
    var old=$('infoSheet').querySelector('[name=t]'),keep=old?old.value:'';
    var hi='Hi '+first+', this is '+cust+' about my SINGAAR booking for '+SV[b.svc][0].toLowerCase()+' on '+SG.fmtDate(b.date)+'.';
    b.msgs=b.msgs||[];
    function bub(mine,html,small){return '<div class="cbub '+(mine?'me':'her')+'">'+html+(small?'<small>'+small+'</small>':'')+'</div>'}
    var m=bub(!art,esc(SV[b.svc][0])+' · '+esc(SG.fmtDate(b.date)),esc(b.venue)+(b.note?' · '+esc(b.note):''));
    if(st==='requested')m+='<div class="csys">'+(art?'Waiting for your reply':'Waiting for '+esc(first))+'</div>';
    if(b.reply&&st!=='requested')m+=bub(art,esc(b.reply));
    if(st==='confirmed')m+='<div class="csys ok">Booking confirmed</div>'+(b.paid?'<div class="csys ok">Advance '+inr(adv)+' paid (test)</div>':'<div class="csys">Advance '+inr(adv)+' to lock the date</div>');
    if(st==='completed')m+='<div class="csys ok">Service done</div>';
    if(st==='declined'||st==='cancelled')m+='<div class="csys">'+(st==='declined'?'Declined':'Cancelled')+'</div>';
    b.msgs.forEach(function(x){m+=bub(art?x.f==='her':x.f==='me',esc(x.t))});
    function chip(k,l,cls){return '<button class="btn '+(cls||'ghost dark')+' small" type="button" data-chat-act="'+k+'" data-id="'+b.id+'">'+l+'</button>'}
    var c='';
    if(!art){
      if(st==='confirmed')c+=(b.paid?'':chip('pay','Pay advance '+inr(adv),'red'))+chip('track','Track arrival',b.paid?'red':'')+chip('ics','Add to calendar')+(a?wa(SG.waLink(a,hi),'WhatsApp'):'')+chip('complete','Service done (test)')+chip('cancel','Cancel');
      if(st==='requested')c+=(a?wa(SG.waLink(a,hi),'WhatsApp'):'')+chip('cancel','Cancel request');
    }
    var form=(st==='declined'||st==='cancelled')?'':'<form class="chatform" data-chat-form="'+b.id+'" data-side="'+side+'"><input name="t" maxlength="140" placeholder="Type a message" autocomplete="off" aria-label="Message"><button class="btn red small" type="submit">Send</button></form>';
    $('infoSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button><div class="phead chathead">'+((!art&&a)?'<img class="avt" src="'+SG.ph(SG.cover(a))+'" alt="">':'')+'<div><h2 id="infoTitle">'+esc(art?cust:(a?a.name:'Artist'))+'</h2><p class="meta">'+({requested:'Request sent',confirmed:'Confirmed',completed:'Completed',declined:'Declined',cancelled:'Cancelled'}[st]||'')+'</p></div></div><div class="pbody"><div class="chat" id="chatBox">'+m+'</div>'+(c?'<div class="actions chatchips">'+c+'</div>':'')+form+'</div>';
    SG.openModal('infoModal');
    var box=$('chatBox');if(box)box.scrollTop=box.scrollHeight;
    var inp=$('infoSheet').querySelector('[name=t]');if(inp){inp.value=keep;if(old||true)inp.focus()}
  }
  $('infoSheet').addEventListener('submit',function(e){
    var f=e.target.closest('[data-chat-form]');if(!f)return;e.preventDefault();
    var id=f.getAttribute('data-chat-form'),side=f.getAttribute('data-side'),t=String(f.t.value||'').trim().slice(0,140);
    if(!t)return;var b=bookingById(id);if(!b)return;
    if(b.remote&&window.SGLive){f.t.value='';SGLive.sendMsg(b,side,t);return}
    b.msgs=b.msgs||[];b.msgs.push({f:side==='artist'?'her':'me',t:t});save();f.t.value='';openChat(id,side);
    var a=p(b.pid);
    if(side!=='artist'&&a&&a.sample){setTimeout(function(){var x=bookingById(id);if(!x)return;x.msgs=x.msgs||[];x.msgs.push({f:'her',t:autoLine(t)});save();if(!$('infoModal').hidden&&$('infoSheet').querySelector('[data-chat-form="'+id+'"]'))openChat(id,'client')},2500)}
  });
  $('infoSheet').addEventListener('click',function(e){
    var el=e.target.closest('[data-chat-act]');if(!el)return;
    var a=el.getAttribute('data-chat-act');SG.closeModals();
    if(a==='pay'){SG.go('bookings')}
    act(a,el);
  });
  function btn(act,id,label,cls){return '<button class="btn '+cls+' small" type="button" data-act="'+act+'" data-id="'+id+'">'+label+'</button>'}
  function bookingsPanel(){
    var l=mine().filter(function(b){return !b.remote||b.asCustomer}).sort(function(a,b){return b.created-a.created});
    if(!l.length)return '<div class="empty">No bookings yet.<br>Find an artist you like, check her date and send a request.<br><br>'+btn('explore','','Explore artists','red')+'</div>';
    return '<div class="bklist">'+l.map(function(b){return bookingCard(b,'client')}).join('')+'</div>';
  }
  function savedPanel(){
    var l=Store.d.saved.map(p).filter(Boolean);
    if(!l.length)return '<div class="empty">No saved artists yet.<br>Tap the heart on any artist to keep her here.<br><br>'+btn('explore','','Explore artists','red')+'</div>';
    var tools='<div class="shortlist"><b>Choosing with your family?</b><p class="note">Send your shortlist to the family WhatsApp group and ask everyone to vote, or compare up to three side by side.</p><div class="actions">'+wa(famLink(l),'Ask my family on WhatsApp')+(l.length>1?btn('cmpsaved','','Compare my saved','ghost dark'):'')+'</div></div>';
    return tools+'<div class="bklist">'+l.map(function(a){return '<article class="bk"><div class="bkhead"><div class="who"><img class="avt" src="'+SG.ph(SG.cover(a))+'" alt="" loading="lazy"><div><h3>'+esc(a.name)+'</h3><p class="meta">'+esc(a.area)+', '+esc(a.city)+' · '+esc(a.handle)+'</p></div></div><span class="badge">'+SG.TYPE[a.type]+'</span></div><div class="actions">'+btn('profile',a.id,'View profile','red')+btn('unsave',a.id,'Remove','ghost dark')+'</div></article>'}).join('')+'</div>';
  }

  /* ---------- artist ---------- */
  function reqCard(b){
    var a=p(b.pid),clash=SG.busyOn(a,b.date),nm=b.name||'A customer';
    return '<article class="rq"><div class="rqtop">'+dchip(b.date)+'<div><h3>'+esc(nm)+'</h3><p class="rqwhat">'+esc(SV[b.svc][0])+'</p></div><b class="rqprice">'+inr(b.price)+'</b></div>'
      +'<p class="rqmeta"><span>'+esc(b.venue)+'</span></p>'
      +(clash?'<p class="note" style="color:var(--warn)">You already have this date taken.</p>':'')
      +'<form class="rqact" data-form="accept" data-id="'+b.id+'"><input type="hidden" name="msg" value="Happy to do this! I will message you a few days before to confirm timings."><button class="btn red" type="submit"'+(clash?' disabled':'')+'>Accept</button><button class="btn ghost dark" type="button" data-act="decline" data-id="'+b.id+'">Decline</button></form></article>';
  }
  function requestsPanel(){
    var all=mine().filter(function(b){return b.pid===ui.artist}).sort(function(a,b){return b.created-a.created});
    var pend=all.filter(function(b){return b.status==='requested'}),up=all.filter(function(b){return b.status==='confirmed'}),past=all.filter(function(b){return ['completed','declined','cancelled'].indexOf(b.status)>-1}).concat(sampleHistory(ui.artist)).sort(function(x,y){return x.date<y.date?1:-1});
    var h='';
    if(ui.done&&bookingById(ui.done))h='<div class="donebar"><span>Accepted. Date blocked.</span><button class="btn red small" type="button" data-act="backcust">See it as the customer</button></div>';
    if(false)return h+'<div class="empty">No requests yet.<br>They will appear here as soon as a customer asks for your date.</div>';
    function sec(t,l){return l.length?'<h3 class="sech">'+t+'</h3><div class="bklist">'+l.map(function(b){return bookingCard(b,'artist')}).join('')+'</div>':''}
    var nw=pend.length?'<div class="bklist">'+pend.map(reqCard).join('')+'</div>':'<div class="empty">All caught up. No new requests.</div>';
    return h+nw+sec('Upcoming',up)+sec('Past',past);
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
    var l=mine().filter(function(b){return b.pid===ui.artist}).concat(sampleHistory(ui.artist)),done=l.filter(function(b){return b.status==='completed'}),up=l.filter(function(b){return b.status==='confirmed'});
    var sum=function(x){return x.reduce(function(s,b){return s+(b.price||0)},0)};
    var advSum=l.filter(function(b){return b.paid&&(b.status==='confirmed'||b.status==='completed')}).reduce(function(s,b){return s+advance(b)},0);
    var rate=10,g=sum(done),fee=Math.round(g*rate/100);
    var a=p(ui.artist),strength=[a.handle&&a.handle.length>3,Object.keys(a.pk).length>=3,a.styles&&a.styles.length>0,a.bio&&a.bio.length>30].filter(Boolean).length;
    return '<div class="out3"><div>Earned so far<b>'+inr(g)+'</b></div><div>SINGAAR commission ('+rate+'%)<b>'+inr(fee)+'</b></div><div>You keep<b>'+inr(g-fee)+'</b></div></div>'
      +'<p class="feeline"><b>Platform fee: ₹299 a month.</b> Free for your first 3 months. Commission is taken only on completed bookings.</p>'
      +'<p class="note" style="margin-top:8px">Coming up: '+up.length+' confirmed booking'+(up.length===1?'':'s')+' worth '+inr(sum(up))+'. Advances received so far: '+inr(advSum)+' (test).</p>'
      +'<div class="strength"><b>Profile strength</b><div class="sbar"><i style="width:'+(strength/4*100)+'%"></i></div><p class="note">'+strength+' of 4: Instagram handle, three or more services, style tags, a short bio. More complete profiles are easier to trust.</p></div>';
  }

  /* ---------- actions ---------- */
  function bookingById(id){return mine().filter(function(b){return b.id===id})[0]}
  function act(a,el){
    var id=el.getAttribute('data-id'),v=el.getAttribute('data-v'),b;
    switch(a){
      case 'tab':ui.pay=null;ui.tab=v;render();break;
      case 'pay':if(bookingById(id)){ui.pay=id;render();window.scrollTo(0,0)}break;
      case 'paycancel':ui.pay=null;render();break;
      case 'payconfirm':
        b=bookingById(id);if(!b||b.paid)break;
        el.disabled=true;el.textContent='Processing…';
        setTimeout(function(){var x=bookingById(id);if(!x)return;x.paid=true;x.paidAt=Date.now();save();if(x.remote&&window.SGLive)SGLive.updateBooking(x);ui.pay=null;SG.burst();SG.toast('Advance paid (test). Your date is locked.');render();SG.updateBadge()},1400);
        break;
      case 'cancel':b=bookingById(id);if(b){if(b.paid){b.refund=true;save()}SG.setBookingStatus(id,'cancelled');SG.toast(b.refund?'Cancelled. Your advance would be refunded (test).':'Cancelled.')}break;
      case 'complete':if(bookingById(id)){SG.setBookingStatus(id,'completed');SG.burst();SG.toast('Marked as completed. You can now leave a review.')}break;
      case 'decline':SG.setBookingStatus(id,'declined','Sorry, I am not available for this one. Thank you for asking!');SG.toast('Declined. The customer has been told.');break;
      case 'ics':b=bookingById(id);if(b)SG.downloadIcs(b);break;
      case 'track':b=bookingById(id);if(b){if(b.remote&&window.SGLive)SGLive.track(b);else SG.startTracking(b)}break;
      case 'trip':b=bookingById(id);if(b&&window.SGLive)SGLive.toggleTrip(b);break;
      case 'explore':SG.go('explore');break;
      case 'chat':openChat(id);break;
      case 'achat':openChat(id,'artist');break;
      case 'signin':var gs=$('gateSel');if(gs){Store.setIn(parseInt(gs.value,10));ui.artist=Store.d.artistIn;save();SG.burst();render()}break;
      case 'signout':Store.setIn(0);save();SG.go('a-profile');break;
      case 'backcust':ui.done=null;SG.go('bookings');SG.toast('Customer view: booking confirmed.');break;
      case 'profile':SG.closeModals();SG.profile(parseInt(id,10));break;
      case 'unsave':var i=Store.d.saved.indexOf(parseInt(id,10));if(i>-1){Store.d.saved.splice(i,1);save();SG.render();render()}break;
      case 'cmpsaved':
        SG.state.cmp=Store.d.saved.filter(function(i){return p(i)}).slice(0,3);SG.cmpBar();SG.closeModals();SG.compare();break;
      case 'month':var pr=ui.month.split('-'),dt=new Date(+pr[0],+pr[1]-1+parseInt(v,10),1);ui.month=dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2);render();break;
      case 'block':
        var arr=Store.d.blocked[ui.artist]=Store.d.blocked[ui.artist]||[],k=arr.indexOf(v);
        if(k>-1)arr.splice(k,1);else arr.push(v);save();SG.render();render();break;
      case 'rmsvc':var ar=p(ui.artist);if(Object.keys(ar.pk).length<=1){SG.toast('Keep at least one service.');break}delete ar.pk[id];persistPrices(ar);SG.render();render();break;
      case 'simulate':
        var ar2=p(ui.artist),ks=Object.keys(ar2.pk),svc=ks[Math.floor(Math.random()*ks.length)],dd=nextFree(ar2);
        var nb={id:'b'+Date.now().toString(36)+'x',pid:ar2.id,svc:svc,date:dd,venue:'Sample venue, '+ar2.city,name:DEMO_NAMES[Math.floor(Math.random()*DEMO_NAMES.length)],note:'Demo request',price:ar2.pk[svc],status:'requested',created:Date.now(),reply:''};
        Store.d.bookings.unshift(nb);save();SG.updateBadge();render();SG.toast('A sample booking request arrived.');break;
    }
  }
  function nextFree(a){
    var d=new Date(TODAY+'T00:00:00');
    for(var i=14;i<120;i++){var x=new Date(d.getTime()+i*86400000),s=x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2);if(!SG.busyOn(a,s))return s}
    return '2027-02-14';
  }
  function persistPrices(a){
    Store.d.overrides[a.id]={pk:a.pk};save();
    if(a.remote&&window.SGLive)SGLive.updateListing(a);
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
      SG.setBookingStatus(id,'confirmed',String(fd.get('msg')||'').slice(0,140));ui.done=id;SG.burst();SG.toast('Accepted. The date is blocked in search.');render();
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
    if(a==='artist'){ui.artist=parseInt(el.value,10);ui.picked=true;Store.setIn(ui.artist);save();render()}
    if(a==='auto'){Store.d.autoReply=el.checked;save();SG.toast(el.checked?'Sample artists will reply in a few seconds.':'Auto-reply is off. Reply yourself from the artist dashboard.')}
  });
  sheet.addEventListener('input',function(e){var el=e.target;if(el.getAttribute('data-act')==='rate'){ui.rate=parseFloat(el.value)||0;var keep=document.activeElement===el;var panelEl=$('pPanel');panelEl.innerHTML=earningsPanel();var r=$('pRate');if(r&&keep)r.focus()}});
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-open-portal]');if(a){open(a.getAttribute('data-open-portal'))}
  });
  window.SGPortal={open:open,refresh:refresh,show:show,views:VIEWS,chat:openChat,setArtist:function(id){ui.artist=id;ui.mineSeen=Store.d.mine}};
})();
