/* SINGAAR app shell: two clear spaces, one for customers (brides, bridesmaids, family) and one for artists.
   Each space has its own few tabs. On a phone the tabs sit at the bottom, like a native app.
   Every part of the page is a "view" (data-view in index.html); this file shows one view at a time. */
(function(){
  var SG=window.SG;if(!SG)return;
  var $=function(i){return document.getElementById(i)};
  var Store=SG.Store;

  var ICON={
    home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    explore:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    plan:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bookings:'<path d="M4 8h16v12H4z"/><path d="M9 8V5h6v3M4 13h16"/>',
    requests:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 15h3"/>',
    services:'<path d="M7 5h10M7 9h10M9 9c5 0 6 3 3 5l-3 1 7 5"/>',
    earnings:'<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
  };
  var CUST=[['home','Home','home'],['explore','Explore','explore'],['plan','Plan','plan'],['bookings','Bookings','bookings']];
  var ART=[['a-requests','Requests','requests'],['a-calendar','Calendar','calendar'],['a-services','Prices','services'],['a-earnings','Earnings','earnings'],['a-profile','Profile','profile']];
  var SUBS=[['countdown','Countdown'],['rituals','Rituals'],['family','Family'],['arrival','Live arrival']];
  var KNOWN=CUST.concat(ART).map(function(t){return t[0]});
  var cur='home',sub='countdown',last={customer:'home',artist:null};

  function roleOf(v){return String(v||cur).indexOf('a-')===0?'artist':'customer'}
  function artistHome(){return Store.d.mine?'a-requests':'a-profile'}

  function drawTabbar(){
    var list=roleOf()==='artist'?ART:CUST;
    $('tabbar').innerHTML=list.map(function(t){
      return '<button type="button" data-go="'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[t[2]]+'</svg><span>'+t[1]+'</span>'+(t[0]==='bookings'?'<i class="pbadge" id="portalBadge" hidden>0</i>':'')+'</button>';
    }).join('');
    SG.updateBadge();
  }
  function drawRole(){
    var b=$('roleBtn');if(!b)return;
    var art=roleOf()==='artist';
    b.setAttribute('data-role',art?'customer':'artist');
    b.textContent=art?'Find an artist':'I am an artist';
    b.classList.toggle('back',art);
  }
  function drawSubs(){
    var n=$('planTabs');if(!n)return;
    n.innerHTML=SUBS.map(function(s){return '<button type="button" data-sub-go="'+s[0]+'" aria-pressed="'+(sub===s[0])+'">'+s[1]+'</button>'}).join('');
  }
  function measure(){var h=document.querySelector('header.top');if(h)document.documentElement.style.setProperty('--hdr',h.offsetHeight+'px')}
  window.addEventListener('resize',measure);
  function apply(){
    document.querySelectorAll('[data-view]').forEach(function(el){
      var on=el.getAttribute('data-view').split(' ').indexOf(cur)>-1;
      if(on&&cur==='plan'&&el.hasAttribute('data-sub')&&el.getAttribute('data-sub')!==sub)on=false;
      el.hidden=!on;
    });
    document.body.setAttribute('data-screen',cur);
    document.body.setAttribute('data-role',roleOf());
    drawTabbar();drawRole();drawSubs();measure();
    if(window.SGPortal&&SGPortal.views[cur])SGPortal.show(cur);
  }
  function setHash(){
    var h='#/'+cur+(cur==='plan'?'/'+sub:'');
    try{if(location.hash!==h)history.pushState(null,'',h)}catch(e){}
  }
  function go(view,s,opts){
    if(KNOWN.indexOf(view)<0)view='home';
    if(SG.closeModals&&!(opts&&opts.keepModals))SG.closeModals();
    if(s)sub=s;
    cur=view;last[roleOf()]=view;
    apply();setHash();
    if(!(opts&&opts.noScroll))window.scrollTo(0,0);
  }
  function fromHash(){
    var m=location.hash.match(/^#\/([a-z-]+)(?:\/([a-z]+))?/);
    if(!m)return false;
    if(KNOWN.indexOf(m[1])<0)return false;
    if(m[2]&&SUBS.some(function(s){return s[0]===m[2]}))sub=m[2];
    cur=m[1];last[roleOf()]=cur;apply();return true;
  }

  /* old code scrolls to sections by id (for example the Browse section). Send those to the right view first. */
  var MAP={browse:['explore'],live:['explore'],tracker:['plan','arrival'],plan:['plan','rituals'],family:['plan','family'],countdown:['plan','countdown'],artists:['a-profile'],promise:['home']};
  Object.keys(MAP).forEach(function(id){
    var el=$(id);if(!el)return;
    el.scrollIntoView=function(o){
      go(MAP[id][0],MAP[id][1],{noScroll:true});
      requestAnimationFrame(function(){Element.prototype.scrollIntoView.call(el,o&&o.behavior?{block:'start'}:o)});
    };
  });

  document.addEventListener('click',function(e){
    var t=e.target,x;
    if((x=t.closest('[data-go]'))){
      e.preventDefault();var v=x.getAttribute('data-go').split(':');go(v[0],v[1]);return;
    }
    if((x=t.closest('[data-sub-go]'))){go('plan',x.getAttribute('data-sub-go'),{noScroll:true});return}
    if((x=t.closest('[data-role]'))){
      var r=x.getAttribute('data-role');
      if(r===roleOf())return;
      go(r==='artist'?(last.artist||artistHome()):(last.customer||'home'));return;
    }
    if((x=t.closest('[data-role-go]'))){go(x.getAttribute('data-role-go')==='artist'?artistHome():'home');return}
    if(t.closest('[data-join]')){SG.openModal('joinModal');return}
  });
  window.addEventListener('popstate',function(){if(!fromHash()){cur='home';apply()}});

  /* the home search bar: pick a look and a city, then go straight to the matching artists */
  var TILES=[['bridal','Bridal makeup',12792004,'center 4%'],['party','Party makeup',11836377,'center 20%'],['hair','Hair',2995337,'center 25%'],['nails','Nails',17280274,'center 35%'],['mehendi','Mehendi',32029488,'center 30%'],['facial','Skin',6543489,'center 25%']];
  function runSearch(occ){
    if(occ)$('occasion').value=occ;
    $('searchForm').requestSubmit();
  }
  function drawTiles(){
    var n=$('homeTiles');if(!n)return;
    n.innerHTML=TILES.map(function(t){
      var l=SG.offers(SG.state.city,t[0]).map(function(p){return p.pk[t[0]]});
      var from=l.length?'from '+SG.short(Math.min.apply(null,l)):'coming soon';
      return '<button type="button" class="tile2" data-pop="'+t[0]+'"><img src="'+SG.ph(t[2])+'" style="object-position:'+t[3]+'" alt="" loading="eager" decoding="async"><span class="t2x"><b>'+t[1]+'</b><small>'+from+'</small></span></button>';
    }).join('');
  }
  document.addEventListener('click',function(e){var p=e.target.closest('[data-pop]');if(p)runSearch(p.getAttribute('data-pop'))});
  SG.onRender(drawTiles);drawTiles();

  /* Filters live behind one button, so the results come first */
  var fb=$('filterBtn'),fp=$('filterPanel');
  if(fb&&fp){
    fb.addEventListener('click',function(){var open=fp.hidden;fp.hidden=!open;fb.setAttribute('aria-expanded',String(open))});
    SG.onRender(function(){
      var f=SG.state.f,n=0;['area','where','style','type'].forEach(function(k){if(f[k]!=='any')n++});if(f.free)n++;if(SG.state.budget)n++;
      var c=$('filterCount');if(c){c.textContent=n;c.hidden=n<1}
    });
  }

  /* on a phone the search options start folded away so the artists come first */
  var sd=$('searchDet');if(sd&&window.innerWidth<760)sd.open=false;

  /* installable app: lets people "Add to Home Screen" and keeps the site usable on a weak signal */
  if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){
    window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
  }

  SG.go=go;SG.view=function(){return cur};
  if(!fromHash())apply();
})();
