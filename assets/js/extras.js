/* SINGAAR extras: "Find my look" quiz and the wedding countdown.
   Both run in the browser on the sample listings. Nothing is sent anywhere. */
(function(){
  var SG=window.SG;if(!SG)return;
  var $=function(i){return document.getElementById(i)},esc=SG.esc,inr=SG.inr,state=SG.state,SV=SG.SV;

  /* ---------- Find my look ---------- */
  var OCC=[['bridal','Wedding day',12792004],['engagement','Engagement or reception',10429558],['party','A party night',11836377],['guest','Wedding guest',1828877],['prebridal','Pre-wedding glow',6543489],['blowdry','A hair day',2995337]];
  var MOOD=[['royal','Royal and traditional',18694202,['traditional']],['soft','Soft and natural',11865986,['soft glam','minimal']],['bold','Bold and glamorous',12008356,['HD','airbrush']],['clean','Clean and minimal',7593048,['minimal']]];
  var PRICE=[['low','Lower than most'],['mid','Typical for the city'],['high','Premium, the best'],['any','Show me everything']];
  var Q={step:0,a:{occ:'bridal',mood:'soft',where:'any',price:'any'}};

  function openQuiz(){Q.step=0;Q.a={occ:null,mood:null,where:'any',price:'any'};drawQuiz();SG.openModalOnly('quizModal')}
  function dots(){var h='<div class="qdots" aria-hidden="true">';for(var i=0;i<4;i++)h+='<i class="'+(i<=Q.step?'on':'')+'"></i>';return h+'</div>'}
  function tile(group,val,label,img,on){return '<button type="button" class="qtile" data-q="'+group+'" data-v="'+val+'" aria-pressed="'+on+'"><img src="'+SG.ph(img)+'" alt="" loading="lazy" decoding="async"><span>'+esc(label)+'</span></button>'}
  function drawQuiz(){
    var head='<button class="x" type="button" data-close aria-label="Close">×</button><div class="phead"><div><p class="eyebrow">Find my look</p><h2 id="quizTitle">'+(Q.step<4?'Four quick taps':'Your matches')+'</h2></div></div><div class="pbody">';
    var body='';
    if(Q.step===0)body=dots()+'<h3>What are you getting ready for?</h3><div class="qgrid">'+OCC.map(function(o){return tile('occ',o[0],o[1],o[2],Q.a.occ===o[0])}).join('')+'</div>';
    if(Q.step===1)body=dots()+'<h3>Which mood feels like you?</h3><div class="qgrid">'+MOOD.map(function(o){return tile('mood',o[0],o[1],o[2],Q.a.mood===o[0])}).join('')+'</div>'+back();
    if(Q.step===2)body=dots()+'<h3>Where, and when?</h3><div class="qopts" role="group" aria-label="Where">'+[['yes','She comes to me'],['salon','I will go to her salon'],['any','Either is fine']].map(function(o){return '<button type="button" class="qopt" data-q="where" data-v="'+o[0]+'" aria-pressed="'+(Q.a.where===o[0])+'">'+o[1]+'</button>'}).join('')+'</div>'
      +'<div class="field" style="max-width:260px;margin-top:14px"><label for="qDate">Your date</label><input id="qDate" type="date" min="2026-10-21" value="'+esc(state.date||'')+'"></div>'
      +'<div class="actions" style="margin-top:16px">'+backBtn()+'<button class="btn red" type="button" data-qnext>Next</button></div>';
    if(Q.step===3)body=dots()+'<h3>What feels right for the price?</h3><p class="note">Compared with other listings in '+esc(state.city)+' for this look.</p><div class="qopts" role="group" aria-label="Price">'+PRICE.map(function(o){return '<button type="button" class="qopt" data-q="price" data-v="'+o[0]+'" aria-pressed="'+(Q.a.price===o[0])+'">'+o[1]+'</button>'}).join('')+'</div>'+back();
    if(Q.step===4)body=results();
    $('quizSheet').innerHTML=head+body+'</div>';
  }
  function backBtn(){return '<button class="btn ghost dark" type="button" data-qback>Back</button>'}
  function back(){return '<div class="actions" style="margin-top:16px">'+backBtn()+'</div>'}

  function score(){
    var a=Q.a,occ=a.occ,list=SG.offers(state.city,occ),mood=MOOD.filter(function(m){return m[0]===a.mood})[0],tags=mood?mood[3]:[];
    var prices=list.map(function(p){return p.pk[occ]}).sort(function(x,y){return x-y});
    var res=list.map(function(p){
      var s=0,why=[],hit=tags.filter(function(t){return p.styles.indexOf(t)>-1});
      if(hit.length){s+=3;why.push('Her style: '+hit[0])}
      if(a.where==='yes'&&p.travel){s+=2;why.push('She comes to you')}
      else if(a.where==='salon'&&!p.travel){s+=2;why.push('You visit her salon')}
      var pos=prices.length>1?prices.indexOf(p.pk[occ])/(prices.length-1):0.5,band=pos<0.34?'low':(pos<0.67?'mid':'high');
      if(a.price!=='any'&&band===a.price){s+=2;why.push(band==='low'?'Lower than most in '+state.city:(band==='mid'?'A typical price for '+state.city:'A premium choice'))}
      if(!SG.busyOn(p,state.date)){s+=2;why.push('Free on '+SG.fmtDate(state.date))}else{s-=3;why.push('Booked on '+SG.fmtDate(state.date))}
      return {p:p,s:s,why:why};
    });
    res.sort(function(x,y){return (y.s-x.s)||(x.p.pk[occ]-y.p.pk[occ])});
    return res;
  }
  function results(){
    var occ=Q.a.occ,res=score().slice(0,3);
    if(!res.length)return '<div class="empty">No one is listed for '+esc(SV[occ][0].toLowerCase())+' in '+esc(state.city)+' yet.<br>Try another look.<br><br>'+backBtn()+'</div>';
    var h='<p class="note" style="margin-bottom:12px">For '+esc(SV[occ][0].toLowerCase())+' in '+esc(state.city)+', on '+esc(SG.fmtDate(state.date))+'. Sample listings and prices.</p><div class="qres">';
    res.forEach(function(r,i){
      var lab=r.s>=7?'Perfect match':(r.s>=5?'Great match':'Good match');
      h+='<article class="qr"><img src="'+SG.ph(SG.cover(r.p))+'" alt="Illustrative photo" loading="lazy" decoding="async"><div><span class="badge">'+(i+1)+'. '+lab+'</span><h3>'+esc(r.p.name)+'</h3><p class="meta">'+esc(r.p.area)+' · '+inr(r.p.pk[occ])+'</p><ul>'+r.why.map(function(w){return '<li>'+esc(w)+'</li>'}).join('')+'</ul><button type="button" class="btn red small" data-qopen="'+r.p.id+'">View profile</button></div></article>';
    });
    return h+'</div><div class="actions" style="margin-top:18px"><button class="btn" type="button" data-qall>See all matches</button>'+backBtn().replace('data-qback','data-qrestart').replace('Back','Start again')+'</div>';
  }
  function applyAll(){
    var a=Q.a,res=score();
    var c=SG.CATS.filter(function(k){return k.k.indexOf(a.occ)>-1})[0];
    state.occ=a.occ;state.cat=c?c.id:'bridal';state.budget=0;$('budget').value='0';$('occasion').value=a.occ;
    state.f={area:'any',where:a.where,style:'any',type:'any',free:false};
    state.boost={};state.why={};res.forEach(function(r){if(r.s>0){state.boost[r.p.id]=r.s;state.why[r.p.id]=r.why.slice(0,2).join(' · ')}});
    state.sort='rec';$('sort').value='rec';$('suggest').hidden=true;
    SG.closeModals();SG.render();$('browse').scrollIntoView({behavior:'smooth'});
    SG.toast('Your best matches are shown first.');
  }
  var qm=$('quizModal');
  qm.addEventListener('click',function(e){
    var t=e.target.closest('[data-q],[data-qnext],[data-qback],[data-qopen],[data-qall],[data-qrestart]');if(!t)return;
    if(t.hasAttribute('data-q')){
      var g=t.getAttribute('data-q'),v=t.getAttribute('data-v');Q.a[g]=v;
      if(g==='occ'||g==='mood'){Q.step++}
      else if(g==='price'){Q.step=4}
      drawQuiz();return;
    }
    if(t.hasAttribute('data-qnext')){var d=$('qDate').value;if(d){state.date=d;$('date').value=d}Q.step=3;drawQuiz();return}
    if(t.hasAttribute('data-qback')){Q.step=Math.max(0,Q.step-1);drawQuiz();return}
    if(t.hasAttribute('data-qrestart')){Q.step=0;drawQuiz();return}
    if(t.hasAttribute('data-qopen')){var id=parseInt(t.getAttribute('data-qopen'),10);SG.closeModals();SG.profile(id);return}
    if(t.hasAttribute('data-qall'))applyAll();
  });
  document.addEventListener('click',function(e){if(e.target.closest('[data-quiz]')){e.preventDefault();openQuiz()}});

  /* ---------- Wedding countdown ---------- */
  var MS=[
    [12,'Book your makeup artist','Popular dates can fill up, so lock your artist early. Compare prices and check your date.','bridal'],
    [10,'Choose your mehendi artist','Mehendi takes hours, so plan the evening and the design.','mehendi'],
    [8,'Begin pre-bridal skin and hair care','A few weeks of care shows on the day.','prebridal'],
    [4,'Have your trial look','Meet your look before the wedding morning. Bring photos of your outfit and jewellery.','bridal'],
    [3,'Plan accessories and draping','Confirm jewellery, hair accessories and saree draping for each ritual.','accessory'],
    [2,'Confirm timings with every artist','Share your muhurtham time and work out arrival times with the Muhurtham Clock.','clock'],
    [1,'Final glow','A facial and hair spa a few days before the wedding.','facial'],
    [0,'Your day','Your artist arrives, you glow. Congratulations!','clock']
  ];
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function parse(s){return s?new Date(s+'T00:00:00'):null}
  function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())}
  function dueDates(){
    var w=parse(state.date);if(!w||isNaN(w))return null;
    return MS.map(function(m){var d=new Date(w.getTime()-m[0]*7*86400000);return {w:m[0],title:m[1],desc:m[2],act:m[3],due:d}});
  }
  function drawCountdown(){
    var c=$('cdDate');if(c&&c.value!==state.date)c.value=state.date;
    var ds=dueDates(),box=$('cdList'),big=$('cdBig');if(!box)return;
    if(!ds){box.innerHTML='<li class="empty">Pick your wedding date to see your timeline.</li>';big.textContent='';return}
    var t=today(),wd=parse(state.date),days=Math.round((wd-t)/86400000);
    if(days<0){big.textContent='That date has passed';box.innerHTML='<li class="empty">Pick a future date to plan the weeks before it.</li>';return}
    big.textContent=days===0?'Your day is today. Shine!':days+' day'+(days===1?'':'s')+' to go ('+Math.floor(days/7)+' week'+(Math.floor(days/7)===1?'':'s')+')';
    var firstUpcoming=-1;
    ds.forEach(function(m,i){if(firstUpcoming<0&&m.due>=t)firstUpcoming=i});
    var h='';
    ds.forEach(function(m,i){
      var left=Math.round((m.due-t)/86400000),st,cl;
      if(left<0){st=m.w===0?'':'Time to do this now';cl='late'}
      else if(left<=7){st='This week';cl='soon'}
      else{st='In '+Math.round(left/7)+' week'+(Math.round(left/7)===1?'':'s');cl=''}
      var cta=m.act==='clock'?'<button type="button" class="btn ghost dark small" data-cd="clock">Open the Muhurtham Clock</button>':'<button type="button" class="btn red small" data-cd="'+m.act+'">Find artists</button>';
      h+='<li class="tl '+cl+(i===firstUpcoming?' next':'')+'"><span class="dot"></span><div class="tlbody"><div class="tlhead"><b>'+esc(m.title)+'</b><time>'+esc(SG.fmtDate(iso(m.due)))+'</time></div><p>'+esc(m.desc)+'</p><div class="actions">'+(st?'<span class="tlst">'+st+'</span>':'')+cta+'</div></div></li>';
    });
    box.innerHTML=h;
  }
  function icsEscape(s){return String(s).replace(/[\r\n]+/g,' ').replace(/[,;\\]/g,' ')}
  function downloadReminders(){
    var ds=dueDates();if(!ds)return;
    var t=today(),stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
    var ev=ds.filter(function(m){return m.due>=t}).map(function(m,i){
      var d=iso(m.due).replace(/-/g,''),n=new Date(m.due.getTime()+86400000),e=iso(n).replace(/-/g,'');
      return ['BEGIN:VEVENT','UID:cd'+i+'-'+d+'@singaar.prototype','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+d,'DTEND;VALUE=DATE:'+e,'SUMMARY:'+icsEscape('SINGAAR: '+m.title),'DESCRIPTION:'+icsEscape(m.desc),'END:VEVENT'].join('\r\n');
    });
    if(!ev.length){SG.toast('Nothing left to remind you about for that date.');return}
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SINGAAR//Prototype//EN'].concat(ev).concat(['END:VCALENDAR']).join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='singaar-wedding-reminders.ics';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
    SG.toast('Reminders saved. Open the file to add them to your calendar.');
  }
  var cd=$('cdDate');
  if(cd){
    cd.addEventListener('change',function(){if(cd.value){state.date=cd.value;$('date').value=cd.value;state.boost={};SG.render()}});
    $('cdIcs').addEventListener('click',downloadReminders);
    $('cdList').addEventListener('click',function(e){
      var b=e.target.closest('[data-cd]');if(!b)return;var a=b.getAttribute('data-cd');
      if(a==='clock'){$('tracker').scrollIntoView({behavior:'smooth'});return}
      var c=SG.CATS.filter(function(k){return k.k.indexOf(a)>-1})[0];
      state.occ=a;state.cat=c?c.id:'bridal';state.boost={};$('occasion').value=a;SG.render();$('browse').scrollIntoView({behavior:'smooth'});
    });
  }
  SG.onRender(drawCountdown);
  drawCountdown();

  /* ---------- Bridal party planner ---------- */
  var G=[{n:'Me',s:'bridal'},{n:'Mother',s:'saree'},{n:'Sister',s:'bridesmaid'},{n:'Friend',s:'bridesmaid'}];
  function svcOptions(sel){return Object.keys(SV).map(function(k){return '<option value="'+k+'"'+(k===sel?' selected':'')+'>'+esc(SV[k][0])+'</option>'}).join('')}
  function drawGroupRows(){
    var box=$('gpRows');if(!box)return;
    box.innerHTML=G.map(function(g,i){return '<div class="gprow"><label class="sr" for="gn'+i+'">Name</label><input id="gn'+i+'" data-gn="'+i+'" maxlength="24" value="'+esc(g.n)+'" placeholder="Name"><label class="sr" for="gs'+i+'">Look</label><select id="gs'+i+'" data-gs="'+i+'">'+svcOptions(g.s)+'</select><button type="button" class="btn ghost dark small" data-gx="'+i+'" aria-label="Remove '+esc(g.n||'person')+'">Remove</button></div>'}).join('');
    $('gpAdd').disabled=G.length>=10;
  }
  function drawGroupOut(){
    var out=$('gpOut');if(!out)return;
    if(!G.length){out.innerHTML='<div class="empty">Add the people who need a look.</div>';return}
    var rows=SG.P.filter(function(p){return p.city===state.city}).map(function(p){
      var cov=G.filter(function(g){return p.pk[g.s]!=null}),miss=G.filter(function(g){return p.pk[g.s]==null});
      return {p:p,cov:cov,miss:miss,cost:cov.reduce(function(s,g){return s+p.pk[g.s]},0)};
    }).filter(function(r){return r.cov.length>0});
    rows.sort(function(a,b){return (b.cov.length-a.cov.length)||(a.cost-b.cost)});
    var top=rows.slice(0,4);
    if(!top.length){out.innerHTML='<div class="empty">No one in '+esc(state.city)+' offers these looks yet.</div>';return}
    var h='<p class="note" style="margin:6px 0 12px">Artists in '+esc(state.city)+' who can look after the most people, with the total for those they cover. Sample prices. For a big group, ask her about her team size and timings.</p><div class="gpres">';
    top.forEach(function(r){
      var all=r.miss.length===0,busy=SG.busyOn(r.p,state.date);
      h+='<article class="gpc'+(all?' best':'')+'"><img src="'+SG.ph(SG.cover(r.p))+'" alt="Illustrative photo" loading="lazy" decoding="async"><div><span class="badge">'+(all?'Covers everyone ('+G.length+')':'Covers '+r.cov.length+' of '+G.length)+'</span><h3>'+esc(r.p.name)+'</h3><p class="meta">'+esc(r.p.area)+' · '+(r.p.travel?'comes to you':'at the salon')+' · <span class="avail '+(busy?'no':'free')+'">'+(busy?'Booked on '+esc(SG.fmtDate(state.date)):'Free on '+esc(SG.fmtDate(state.date)))+'</span></p>'
        +'<p class="gptotal">'+inr(r.cost)+'<small> for '+r.cov.length+' '+(r.cov.length===1?'person':'people')+'</small></p>'
        +(r.miss.length?'<p class="note">Not offered: '+r.miss.map(function(g){return esc(g.n||'Someone')+' ('+esc(SV[g.s][0].toLowerCase())+')'}).join(', ')+'</p>':'')
        +'<button type="button" class="btn red small" data-gp="'+r.p.id+'">View profile</button></div></article>';
    });
    out.innerHTML=h+'</div>';
  }
  function drawGroup(){drawGroupOut()}
  if($('gpRows')){
    drawGroupRows();drawGroupOut();
    $('gpRows').addEventListener('input',function(e){var i=e.target.getAttribute('data-gn');if(i!==null){G[+i].n=e.target.value;drawGroupOut()}});
    $('gpRows').addEventListener('change',function(e){var i=e.target.getAttribute('data-gs');if(i!==null){G[+i].s=e.target.value;drawGroupOut()}});
    $('gpRows').addEventListener('click',function(e){var x=e.target.closest('[data-gx]');if(x){G.splice(+x.getAttribute('data-gx'),1);drawGroupRows();drawGroupOut()}});
    $('gpAdd').addEventListener('click',function(){if(G.length<10){G.push({n:'',s:'bridesmaid'});drawGroupRows();drawGroupOut();var l=$('gpRows').querySelectorAll('input');l[l.length-1].focus()}});
    $('gpOut').addEventListener('click',function(e){var b=e.target.closest('[data-gp]');if(b)SG.profile(parseInt(b.getAttribute('data-gp'),10))});
    SG.onRender(drawGroup);
  }
})();
