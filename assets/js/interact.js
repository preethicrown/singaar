/* SINGAAR interactions: swipe deck, live budget slider, flip cards, heart burst, ritual journey,
   the "Ask SINGAAR" stylist bubble and animated counters. Built on top of app.js (SG) and portal.js. */
(function(){
  var SG=window.SG;if(!SG)return;
  var $=function(i){return document.getElementById(i)},esc=SG.esc,inr=SG.inr,SV=SG.SV;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- heart burst when saving an artist ---------- */
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-save]');if(!b||b.getAttribute('aria-pressed')==='true'||reduce)return;
    var r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    for(var i=0;i<9;i++){
      var h=document.createElement('span');h.className='hburst';h.textContent='♥';
      var ang=(i/9)*Math.PI*2,dist=34+Math.random()*26;
      h.style.left=cx+'px';h.style.top=cy+'px';h.style.setProperty('--dx',Math.cos(ang)*dist+'px');h.style.setProperty('--dy',Math.sin(ang)*dist-18+'px');
      document.body.appendChild(h);setTimeout(function(x){return function(){x.remove()}}(h),900);
    }
  },true);

  /* ---------- swipe deck: big photo cards you swipe through ---------- */
  function drawDeck(){
    var box=$('swipeDeck');if(!box)return;
    var occ=SG.state.occ,l=SG.list().slice(0,12);
    if(l.length<2){box.hidden=true;box.innerHTML='';return}
    box.hidden=false;
    box.innerHTML='<div class="sdhead"><b>Swipe the looks</b><span>'+l.length+' artists · tap the heart to save</span></div><div class="sdtrack" id="sdTrack">'+l.map(function(p){
      var saved=SG.Store.d.saved.indexOf(p.id)>-1,busy=SG.busyOn(p,SG.state.date);
      return '<article class="sdcard"><button type="button" class="sdimg" data-open="'+p.id+'" aria-label="Open '+esc(p.name)+'"><img src="'+SG.ph(SG.cover(p))+'" alt="Illustrative photo" loading="lazy" decoding="async"></button>'
        +'<button class="save sdheart" type="button" data-save="'+p.id+'" aria-pressed="'+saved+'" aria-label="Save '+esc(p.name)+'">'+(saved?'♥':'♡')+'</button>'
        +'<div class="sdinfo"><b>'+esc(p.name)+'</b><span>'+esc(p.area)+(p.travel?' · comes to you':' · at her salon')+'</span><span class="sdprice">'+inr(p.pk[occ])+(busy?' · booked on your date':'')+'</span></div></article>';
    }).join('')+'</div><div class="sdnav"><button type="button" data-sd="-1" aria-label="Previous">‹</button><button type="button" data-sd="1" aria-label="Next">›</button></div>';
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-sd]');if(!b)return;
    var t=$('sdTrack');if(t)t.scrollBy({left:parseInt(b.getAttribute('data-sd'),10)*t.clientWidth*0.8,behavior:reduce?'auto':'smooth'});
  });

  /* ---------- live budget slider ---------- */
  var bs=$('budgetRange'),bsTimer=null,bsLast=0;
  function bsLabel(){var v=SG.state.budget;$('bsVal').textContent=v?'Up to '+inr(v):'Any'}
  function bsSync(){
    if(!bs)return;
    var st=SG.stats(SG.state.city,SG.state.occ),max=st?Math.ceil(st.max/1000)*1000:40000,step=max>10000?1000:100,min=st?Math.floor(st.min/step)*step:0;
    bs.min=String(min);bs.max=String(Math.max(min+step,max));bs.step=String(step);
    if(document.activeElement!==bs)bs.value=String(SG.state.budget||bs.max);
    bsLabel();
  }
  if(bs)bs.addEventListener('input',function(){
    var v=parseInt(bs.value,10)||0;SG.state.budget=v>=parseInt(bs.max,10)?0:v;SG.state.boost={};bsLabel();
    var now=Date.now();clearTimeout(bsTimer);
    if(now-bsLast>140){bsLast=now;SG.render()}else bsTimer=setTimeout(function(){bsLast=Date.now();SG.render()},140);
  });

  /* ---------- flip cards: tap "All prices" to see her whole menu ---------- */
  function addFlips(){
    [].forEach.call(document.querySelectorAll('#grid .card'),function(c){
      if(c.querySelector('.flipbtn'))return;
      var o=c.querySelector('[data-open]');if(!o)return;var p=SG.byId(parseInt(o.getAttribute('data-open'),10));if(!p)return;
      var rows=Object.keys(p.pk).slice(0,7).map(function(k){return '<li><span>'+esc(SV[k][0])+'</span><b>'+inr(p.pk[k])+'</b></li>'}).join('');
      var back=document.createElement('div');back.className='cardback';back.setAttribute('aria-hidden','true');
      back.innerHTML='<b class="cbtitle">'+esc(p.name)+'</b><ul>'+rows+'</ul><div class="cbact"><button type="button" class="btn red small" data-open="'+p.id+'">View profile</button><button type="button" class="btn ghost dark small flipback">Back</button></div>';
      c.appendChild(back);
      var fb=document.createElement('button');fb.type='button';fb.className='flipbtn';fb.textContent='All prices';
      var foot=c.querySelector('.cardfoot');if(foot)foot.insertBefore(fb,foot.firstChild.nextSibling);
    });
  }
  document.addEventListener('click',function(e){
    var f=e.target.closest('.flipbtn,.flipback');if(!f)return;
    var c=f.closest('.card');if(!c)return;var on=!c.classList.contains('flipped');
    c.classList.toggle('flipped',on);var back=c.querySelector('.cardback');if(back)back.setAttribute('aria-hidden',String(!on));
  });

  SG.onRender(function(){drawDeck();bsSync();addFlips()});
  drawDeck();bsSync();addFlips();

  /* ---------- ritual journey on Home ---------- */
  var RIT=[['Haldi','prebridal','Glow for the turmeric morning'],['Mehendi','mehendi','Henna for the evening before'],['Sangeet','party','Dance-night makeup'],['Muhurtham','bridal','The wedding morning look'],['Reception','reception','The evening glamour']];
  var ri=0,rauto=null;
  function ritualData(k){
    var l=SG.P.filter(function(p){return p.city===SG.state.city&&p.pk[k]!=null}).sort(function(a,b){return a.pk[k]-b.pk[k]});
    return {list:l,min:l.length?l[0].pk[k]:0};
  }
  function drawRitual(){
    var box=$('ritualJ');if(!box)return;
    var r=RIT[ri],d=ritualData(r[1]),top=d.list.slice(0,3),ph=top[0]?SG.ph(SG.cover(top[0])):'';
    box.querySelector('.rjpills').innerHTML=RIT.map(function(x,i){return '<button type="button" data-rj="'+i+'" aria-pressed="'+(i===ri)+'"><i>'+(i+1)+'</i>'+x[0]+'</button>'}).join('');
    var panel=box.querySelector('.rjpanel');panel.classList.remove('in');void panel.offsetWidth;panel.classList.add('in');
    panel.innerHTML=(ph?'<div class="rjimg"><img src="'+ph+'" alt="Illustrative photo: '+esc(r[0])+' look" loading="lazy" decoding="async"></div>':'')
      +'<div class="rjtext"><span class="rjstep">'+(ri+1)+' of '+RIT.length+'</span><h3>'+r[0]+'</h3><p>'+r[2]+'</p>'
      +(d.list.length?'<p class="rjfrom">'+d.list.length+' artists in '+SG.state.city+' · from <b>'+inr(d.min)+'</b></p>':'<p class="rjfrom">Artists coming soon in '+SG.state.city+'</p>')
      +'<div class="rjavs">'+top.map(function(p){return '<button type="button" data-open="'+p.id+'" aria-label="Open '+esc(p.name)+'"><img src="'+SG.ph(SG.cover(p))+'" alt=""></button>'}).join('')+'</div>'
      +'<button type="button" class="btn red small" data-rjgo="'+r[1]+'">See '+r[0]+' artists</button></div>';
  }
  function rjStop(){clearInterval(rauto);rauto=null}
  function rjGo(i){ri=(i+RIT.length)%RIT.length;drawRitual()}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-rj]');if(b){rjStop();rjGo(parseInt(b.getAttribute('data-rj'),10));return}
    var g=e.target.closest('[data-rjgo]');
    if(g){
      var k=g.getAttribute('data-rjgo');SG.state.occ=k;
      SG.CATS.forEach(function(c){if(c.k.indexOf(k)>-1)SG.state.cat=c.id});
      SG.state.boost={};var oc=$('occasion');if(oc)oc.value=k;SG.render();SG.go('explore');
    }
  });
  (function(){
    var box=$('ritualJ');if(!box)return;var x0=null;
    box.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    box.addEventListener('touchend',function(e){if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){rjStop();rjGo(ri+(dx<0?1:-1))}},{passive:true});
    drawRitual();
    if(!reduce)rauto=setInterval(function(){if(!document.hidden&&box.offsetParent)rjGo(ri+1)},4500);
    SG.onRender(drawRitual);
  })();

  /* ---------- "Ask SINGAAR" stylist bubble ---------- */
  (function(){
    var btn=document.createElement('button');btn.type='button';btn.className='askbubble';btn.id='askBubble';btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','askSheet');
    btn.innerHTML='<span aria-hidden="true">✦</span> Ask SINGAAR';
    var sh=document.createElement('div');sh.className='asksheet';sh.id='askSheet';sh.hidden=true;sh.setAttribute('role','dialog');sh.setAttribute('aria-label','Ask SINGAAR');
    sh.innerHTML='<div class="ashead"><b>Ask SINGAAR</b><button type="button" class="asx" aria-label="Close">×</button></div>'
      +'<p class="asintro">Tell me what you need. I\'ll find the artists.</p>'
      +'<div class="aschips"><button type="button" data-asq="Muhurtham makeup in Chennai under 20k, traditional">Muhurtham, under 20k</button><button type="button" data-asq="Saree draping at home in Bangalore">Saree draping at home</button><button type="button" data-asq="Soft glam party makeup this weekend">Soft glam party</button></div>'
      +'<form class="asform" id="asForm"><input id="asIn" maxlength="300" placeholder="e.g. bridal makeup near Indiranagar under 25k" autocomplete="off" aria-label="What are you looking for?"><button class="btn red small" type="submit">Ask</button></form>'
      +'<p class="asnote" id="asNote"></p>';
    document.body.appendChild(sh);document.body.appendChild(btn);
    function open(on){sh.hidden=!on;btn.setAttribute('aria-expanded',String(on));if(on)setTimeout(function(){$('asIn').focus()},30)}
    btn.addEventListener('click',function(){open(sh.hidden)});
    sh.querySelector('.asx').addEventListener('click',function(){open(false)});
    sh.addEventListener('click',function(e){var c=e.target.closest('[data-asq]');if(c){$('asIn').value=c.getAttribute('data-asq');$('asForm').requestSubmit()}});
    $('asForm').addEventListener('submit',function(e){
      e.preventDefault();var v=$('asIn').value.trim();if(v.length<3){$('asNote').textContent='Type a few words first.';return}
      $('asNote').textContent='Finding your artists…';
      var ask=$('ask'),form=$('askForm');
      if(!ask||!form){$('asNote').textContent='Search is not available right now.';return}
      ask.value=v;SG.go('explore');form.requestSubmit();
      setTimeout(function(){open(false);$('asNote').textContent='';$('asIn').value=''},700);
    });
  })();

  /* ---------- animated counters (artist dashboard) ---------- */
  function count(root){
    [].forEach.call((root||document).querySelectorAll('[data-count]'),function(el){
      var to=parseFloat(el.getAttribute('data-count'))||0,money=el.hasAttribute('data-money'),t0=null,dur=reduce?0:900;
      function fmt(v){return money?inr(Math.round(v)):String(Math.round(v))}
      if(!dur){el.textContent=fmt(to);return}
      function step(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(step)}
      requestAnimationFrame(step);
      setTimeout(function(){el.textContent=fmt(to)},dur+150);
    });
  }
  window.SGI={count:count};
})();
