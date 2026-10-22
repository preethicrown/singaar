/* SINGAAR 60-second tour: walks a first-time visitor through the whole journey (choose, compare, book, reply, pay, artist side)
   and a "share with a friend" button. Everything is a demo on sample data and stays in this browser. */
(function(){
  var SG=window.SG;if(!SG)return;
  var $=function(i){return document.getElementById(i)},Store=SG.Store;
  var T={i:-1,pid:null,bid:null,poll:null,glow:null,timer:null};

  function pickArtist(){
    return SG.P.filter(function(x){return x.sample&&x.city===SG.state.city&&x.pk.bridal!=null&&!SG.busyOn(x,SG.state.date)})[0]
        ||SG.P.filter(function(x){return x.sample&&x.pk.bridal!=null})[0];
  }
  function bookingStatus(){var b=Store.d.bookings.filter(function(x){return x.id===T.bid})[0];return b?b.status:null}

  var STEPS=[
    {t:'Welcome to SINGAAR',x:'Brides, bridesmaids and families compare women artists and book them. Let us try the whole thing in 60 seconds.',btn:'Start the tour',view:'home'},
    {t:'1. Choose your look',x:'Pick what you need: a wedding, a party, hair, skin, nails or mehendi. Not sure? The quiz finds your look in four taps.',view:'explore',glow:'#cats'},
    {t:'2. Compare artists',x:'See her photos, a fair price and whether she is free on your date. We will open one profile for you.',view:'explore',glow:'#grid .card'},
    {t:'3. Open her profile',x:'Her work, her services and her prices. Tap "Check" for your date, then "Send booking request". We will send one for you.',enter:function(){var p=pickArtist();if(!p)return;T.pid=p.id;SG.profile(p.id)}},
    {t:'4. She replies',x:'We sent the request. A real artist answers on her phone. Here, the sample artist replies in a few seconds. Waiting for her…',view:'bookings',wait:true,enter:function(){
      var p=SG.byId(T.pid);if(!p)return;Store.d.autoReply=true;Store.save();
      var b=SG.createBooking(p,'bridal',SG.state.date,'Tour venue','You (tour)','');T.bid=b.id;SG.updateBadge();if(window.SGPortal)SGPortal.refresh();
    }},
    {t:'5. Lock your date',x:'She confirmed. Now pay a small advance to lock the date. Tap "Pay advance" (test: no money moves).',view:'bookings',glow:'[data-act="pay"]',late:true},
    {t:'6. Her side',x:'Now see it as the artist: her booking requests, calendar, prices and earnings. Everything the customer does shows up here.',view:'a-requests',enter:function(){if(T.pid){if(!Store.d.mine)Store.d.artistIn=T.pid;Store.save()}if(T.pid&&window.SGPortal&&SGPortal.setArtist)SGPortal.setArtist(T.pid)}},
    {t:'That is SINGAAR',x:'Choose, compare, book, pay, and watch her arrive. Try it yourself, and send the link to a friend.',view:'home',btn:'Finish',share:true}
  ];

  function unglow(){document.querySelectorAll('.tourglow').forEach(function(e){e.classList.remove('tourglow')})}
  function glow(sel,late){
    unglow();if(!sel)return;
    var go=function(){var e=document.querySelector(sel);if(e){e.classList.add('tourglow');e.scrollIntoView({block:'start',behavior:'smooth'})}};
    if(late)T.timer=setTimeout(go,450);else setTimeout(go,150);
  }
  function card(){
    var el=$('tour');
    if(!el){el=document.createElement('div');el.id='tour';el.setAttribute('role','dialog');el.setAttribute('aria-label','SINGAAR tour');document.body.appendChild(el)}
    return el;
  }
  function draw(){
    var s=STEPS[T.i],el=card(),n=STEPS.length;
    var waiting=s.wait&&bookingStatus()==='requested';
    var text=s.x;
    if(s.wait&&bookingStatus()==='confirmed')text='She confirmed your booking! A real artist would reply like this on her phone.';
    el.innerHTML='<div class="tstep">'+(T.i+1)+' of '+n+'</div><h3>'+SG.esc(s.t)+'</h3><p>'+SG.esc(text)+'</p><div class="tbar"><i style="width:'+Math.round((T.i+1)/n*100)+'%"></i></div>'
      +'<div class="actions"><button type="button" class="btn ghost small" data-tour-skip>'+(T.i===n-1?'Close':'Skip tour')+'</button><span class="actions">'
      +(T.i>0&&T.i<n-1?'<button type="button" class="btn ghost small" data-tour-back>Back</button>':'')
      +(s.share?'<button type="button" class="btn small" data-share>Share link</button>':'')
      +'<button type="button" class="btn red small" data-tour-next'+(waiting?' disabled':'')+'>'+(waiting?'Waiting…':(s.btn||'Next'))+'</button></span></div>';
  }
  function show(i){
    clearInterval(T.poll);clearTimeout(T.timer);unglow();
    T.i=i;var s=STEPS[i];
    if(s.view)SG.go(s.view,null,{noScroll:true});
    if(s.enter)s.enter();
    window.scrollTo(0,0);
    draw();
    if(s.wait){T.poll=setInterval(function(){if(bookingStatus()!=='requested'){clearInterval(T.poll);SG.burst();draw()}},500)}
    glow(s.glow,s.late);
  }
  function start(){
    if(SG.view&&SG.view()!=='home')SG.go('home',null,{noScroll:true});
    SG.closeModals();show(0);
  }
  function end(){clearInterval(T.poll);clearTimeout(T.timer);unglow();T.i=-1;var el=$('tour');if(el)el.remove()}

  document.addEventListener('click',function(e){
    var t=e.target,x;
    if(t.closest('[data-tour]')){e.preventDefault();start();return}
    if(t.closest('[data-tour-next]')){var n=T.i+1;if(n>=STEPS.length){end();return}show(n);return}
    if(t.closest('[data-tour-back]')){show(Math.max(0,T.i-1));return}
    if(t.closest('[data-tour-skip]')){end();return}
    if((x=t.closest('[data-share]'))){e.preventDefault();share();return}
  });

  function share(){
    var url=location.origin+location.pathname;
    var text='Have a look at SINGAAR: independent women artists and trusted salons for weddings, parties, hair, skin, nails and mehendi. Beauty meets you.';
    if(navigator.share){navigator.share({title:'SINGAAR',text:text,url:url}).catch(function(){})}
    else window.open('https://wa.me/?text='+encodeURIComponent(text+'\n'+url),'_blank','noopener');
  }
  SG.startTour=start;
})();
