(function(){
  /* ---------- catalogue ---------- */
  var SV={
    bridal:['Bridal makeup','Bridal makeup (wedding day)'],engagement:['Engagement look','Engagement look'],reception:['Reception look','Reception look'],
    saree:['Saree draping','Saree draping'],bridesmaid:['Bridesmaid look','Bridesmaid look, per person'],
    party:['Party makeup','Party makeup'],guest:['Wedding-guest look','Wedding-guest look'],
    hair:['Hair styling','Hair styling'],blowdry:['Blow-dry and set','Blow-dry and set'],hairspa:['Hair spa','Hair spa'],
    facial:['Glow facial','Glow facial'],prebridal:['Pre-bridal package','Pre-bridal package'],
    nails:['Nail art and gel','Nail art and gel'],mehendi:['Mehendi design','Mehendi design'],accessory:['Accessory styling','Accessory styling (jewellery, hair accessories)']
  };
  var CATS=[
    {id:'bridal',n:'Bridal and wedding',k:['bridal','engagement','reception','saree','bridesmaid']},
    {id:'party',n:'Party and occasion',k:['party','guest']},
    {id:'hair',n:'Hair',k:['hair','blowdry','hairspa']},
    {id:'skin',n:'Skin and pre-bridal',k:['facial','prebridal']},
    {id:'nails',n:'Nails',k:['nails']},
    {id:'mehendi',n:'Mehendi',k:['mehendi']},
    {id:'styling',n:'Accessories and styling',k:['accessory']}
  ];
  var TYPE={artist:'Independent artist',salon:'Salon',studio:'Studio'};
  var HUES=[[350,60],[8,55],[22,58],[336,50],[2,62],[14,54]];

  /* Photo library: free-licence stock photography (Pexels). Illustrative only, not the listed sample artists. See assets/photos/CREDITS.md */
  function ph(id){return 'assets/photos/pexels-'+id+'.jpg'}
  var IMG={
    bridal:[12792004,14848717,2119095,5376556,18694202,10214422,13022612,10429558,730056],
    engagement:[16651974,10429558,13022612,730056],
    reception:[10214422,13022612,36721897,12792004],
    saree:[8442980,730056,2119095,14848717],
    bridesmaid:[16651974,1828877,9317089,7593048],
    party:[11836377,11865986,12008356,1828877,7593048],
    guest:[1828877,7593048,16651974,11865986],
    hair:[2995337,14825057,696285],
    blowdry:[696285,2995337,14825057],
    hairspa:[696285,14825057,2995337],
    facial:[6543489,6543645],
    prebridal:[6543645,6543489,14848717],
    nails:[17280274,5871311,22668324,16363470,9649301,5871831],
    mehendi:[32029488,6197905,5467615],
    accessory:[9317089,18694196,8442980,14825057]
  };
  var COVER={1:14848717,2:2119095,3:11865986,4:12792004,5:10429558,6:10214422,7:12008356,8:1828877,9:5376556,10:18694202,11:11836377,12:13022612,13:9317089,14:6543645,15:17280274,16:2995337};
  var CATIMG={bridal:12792004,party:11836377,hair:2995337,skin:6543489,nails:5871311,mehendi:32029488,styling:9317089};
  var MOOD=[[12792004,'Bridal'],[11836377,'Party'],[32029488,'Mehendi'],[2995337,'Hair'],[18694202,'Jewellery'],[17280274,'Nails'],[14848717,'Bridal'],[12008356,'Glam'],[6197905,'Mehendi'],[10429558,'Maang tikka'],[6543489,'Skin'],[5376556,'Bridal']];
  /* where the face sits in each tall photo, so crops never cut it off */
  var FOCUS={12792004:'center 4%',13022612:'center 3%',10214422:'center 5%',16651974:'center 22%',36721897:'center 25%',730056:'center 10%',10429558:'center 10%',2119095:'center 12%',14848717:'center 20%',5376556:'center 18%',18694202:'center 25%'};
  function fpos(id){return 'object-position:'+(FOCUS[id]||'center 20%')}
  function mainKey(p){var k=Object.keys(p.pk);return k.indexOf('bridal')>-1?'bridal':k[0]}
  function cover(p){if(COVER[p.id])return COVER[p.id];var l=IMG[mainKey(p)]||IMG.bridal;return l[Math.abs(p.id)%l.length]}
  function gallery(p){
    var out=[cover(p)];
    Object.keys(p.pk).forEach(function(k){var l=IMG[k]||[];l.forEach(function(id,i){var c=l[(i+Math.abs(p.id))%l.length];if(out.indexOf(c)<0&&out.length<6)out.push(c)})});
    (IMG.bridal).forEach(function(id){if(out.length<6&&out.indexOf(id)<0)out.push(id)});
    return out.slice(0,6);
  }

  function mk(id,name,type,city,area,handle,styles,travel,bio,pk,booked){return {id:id,name:name,type:type,city:city,area:area,handle:handle,styles:styles,travel:travel,bio:bio,pk:pk,booked:booked||[],sample:true}}
  var P=[
    mk(1,'Anita R','artist','Chennai','Adyar','@anita.makeovers',['soft glam','traditional'],true,'Independent artist. Soft glam and traditional South Indian looks, with trials before the big day.',{bridal:18000,reception:12000,engagement:9000,saree:1500,hair:3000,party:4500,guest:3500,blowdry:900},['2026-12-13','2027-01-24']),
    mk(2,"Meena's Bridal Parlour",'salon','Chennai','T. Nagar','@meenas.bridal.parlour',['traditional','minimal'],false,'A family-run parlour with fifteen years of bridal work. Bridal packages include saree draping and hair.',{bridal:22000,reception:14000,saree:1200,hair:2500,bridesmaid:3500,mehendi:2500,facial:1800,prebridal:15000,hairspa:1500,blowdry:700,nails:900},['2026-12-12']),
    mk(3,'Kavya N','artist','Bangalore','Indiranagar','@kavya.glam.stories',['airbrush','soft glam'],true,'Airbrush and soft glam for modern brides and party looks. Travels within Bangalore.',{bridal:28000,reception:18000,engagement:12000,saree:2000,hair:4000,party:6000,guest:4500,accessory:2000},['2026-12-06']),
    mk(4,'Divya & Co. Studio','studio','Chennai','Nungambakkam','@divyaandco.studio',['HD','airbrush'],true,'An established studio with a team for large wedding parties.',{bridal:38000,reception:25000,engagement:16000,saree:2500,hair:5000,bridesmaid:6000,party:9000,guest:6500,accessory:3000},['2026-12-20']),
    mk(5,'Priya M','artist','Chennai','Anna Nagar','@priya.bridalartist',['traditional','minimal'],true,'Clean, natural looks that last through long ceremonies.',{bridal:14000,reception:9000,engagement:7000,saree:1000,hair:2000,party:3000,guest:2500,blowdry:600}),
    mk(6,'Lakshmi Beauty Care','salon','Bangalore','Jayanagar','@lakshmibeautycare',['traditional'],false,'Bridal, pre-bridal, skin and mehendi under one roof.',{bridal:20000,reception:13000,saree:1500,hair:2800,bridesmaid:3000,mehendi:2000,facial:1500,prebridal:12000,hairspa:1400,blowdry:600,nails:800},['2026-12-13']),
    mk(7,'Sowmya K','artist','Bangalore','Koramangala','@sowmya.makeup',['HD','soft glam'],true,'HD finish for photos and video, with a trial look included.',{bridal:24000,reception:15000,engagement:10000,saree:1800,hair:3500,party:5000,guest:4000,blowdry:1000},['2026-12-27']),
    mk(8,'Nandini V','artist','Chennai','Velachery','@nandini.weekendglam',['soft glam','minimal'],true,'A weekend artist who styles brides and party looks on Saturdays and Sundays.',{bridal:12000,reception:8000,engagement:6000,saree:900,hair:1800,party:2500,nails:1200},['2026-12-06']),
    mk(9,'Roja Beauty Lounge','salon','Bangalore','Malleshwaram','@roja.beautylounge',['traditional','minimal'],false,'A neighbourhood salon for bridal packages, skin and hair for the whole family.',{bridal:16000,reception:10000,saree:1200,hair:2200,bridesmaid:2800,facial:1300,hairspa:1200,blowdry:500,nails:700,prebridal:9000}),
    mk(10,'Harini S','artist','Chennai','Mylapore','@harini.makeovers',['traditional','airbrush'],true,'Traditional Tamil bridal looks with airbrush finish.',{bridal:30000,reception:20000,engagement:13000,saree:2200,hair:4500,accessory:2500},['2026-12-12','2026-12-20']),
    mk(11,'Ishita B','artist','Bangalore','Whitefield','@ishita.glamroom',['HD','soft glam','minimal'],true,'Party and bridal looks for the Whitefield and tech-park crowd. Evening and weekend slots.',{bridal:21000,reception:14000,engagement:9500,saree:1600,hair:3200,party:4000,guest:3200,accessory:1800,blowdry:800},['2026-12-06']),
    mk(12,'Shruthi G','artist','Bangalore','HSR Layout','@shruthi.bridalstories',['traditional','soft glam'],true,'Traditional Karnataka and South Indian bridal looks, with mehendi.',{bridal:17000,reception:11000,engagement:8000,saree:1400,hair:2600,party:3500,guest:2800,mehendi:3000},[]),
    mk(13,'Fatima Q','artist','Bangalore','Frazer Town','@fatima.makeover',['traditional','minimal'],true,'Nikah, walima and festive looks, with mehendi and bridesmaid styling.',{bridal:19000,reception:12500,engagement:8500,hair:2800,mehendi:3500,party:3800,bridesmaid:3200},['2026-12-13']),
    mk(14,'Glow & Grace Salon','salon','Bangalore','BTM Layout','@glowandgrace.btm',['minimal','soft glam'],false,'Skin, hair and nails in one visit, with party makeup on weekends.',{facial:1600,hairspa:1300,blowdry:550,nails:1000,party:3200,prebridal:10000,hair:1800}),
    mk(15,'Aarohi Nails & Beauty','salon','Bangalore','Koramangala','@aarohi.nailsbeauty',['nail art','minimal'],false,'Nail art, glow facials and blow-dries for a quick get-ready.',{nails:1500,facial:1900,blowdry:650,party:3600,accessory:1200}),
    mk(16,'Rashmi P','artist','Bangalore','Basavanagudi','@rashmi.hairandstyle',['traditional'],true,'Hair is her craft: styling, spa and blow-dries, plus accessory styling for sarees and lehengas.',{hair:2400,hairspa:1800,blowdry:700,accessory:1500,saree:1100,guest:2600,party:2800,mehendi:2200},['2026-12-20'])
  ];
  var AREA={
    Chennai:{'Anna Nagar':[290,120],'Nungambakkam':[400,205],'T. Nagar':[330,300],'Mylapore':[470,310],'Adyar':[470,410],'Velachery':[340,455]},
    Bangalore:{'Malleshwaram':[290,120],'Frazer Town':[470,135],'Indiranagar':[550,205],'Whitefield':[690,225],'Basavanagudi':[330,320],'Koramangala':[505,335],'Jayanagar':[290,405],'BTM Layout':[420,425],'HSR Layout':[570,415]}
  };
  var CENTER={Chennai:[420,300],Bangalore:[420,260]};
  var VENUE={Chennai:{p:[570,235],n:'Venue, Mylapore'},Bangalore:{p:[430,250],n:'Your venue, Bangalore'}};
  var STORE='singaar.listings.v2';

  var state={city:'Bangalore',cat:'bridal',occ:'bridal',budget:0,date:'2026-12-06',sort:'rec',cmp:[],boost:{},why:{},f:{area:'any',where:'any',style:'any',type:'any',free:false}};
  function filtersActive(){var f=state.f;return f.area!=='any'||f.where!=='any'||f.style!=='any'||f.type!=='any'||f.free}
  var $=function(id){return document.getElementById(id)};
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function inr(n){return '₹'+Number(n).toLocaleString('en-IN')}
  function short(n){return n>=1000?'₹'+(Math.round(n/100)/10).toString().replace(/\.0$/,'')+'k':'₹'+n}
  function hueOf(p){return HUES[Math.abs(p.id)%HUES.length]}
  function art(p){var h=hueOf(p);return 'linear-gradient(160deg,hsl('+h[0]+','+(h[1]+10)+'%,22%),hsl('+(h[0]+12)+','+(h[1]+10)+'%,36%))'}
  function initials(n){return n.replace(/[^A-Za-z ]/g,'').trim().charAt(0).toUpperCase()||'S'}
  /* Shared demo store. Lives only in this browser (localStorage). No server, no personal data leaves the device. */
  var Store=(function(){
    var K='singaar.v3',d={saved:[],bookings:[],blocked:{},overrides:{},reviews:[],autoReply:true,autoV:0,artistIn:0,mine:null,clientName:''};
    try{var s=JSON.parse(localStorage.getItem(K)||'null');if(s&&typeof s==='object'){for(var k in d){if(s[k]!==undefined&&typeof s[k]===typeof d[k]&&(Array.isArray(s[k])===Array.isArray(d[k])))d[k]=s[k]}}}catch(e){}
    if(d.autoV!==2){d.autoReply=true;d.autoV=2}
    function save(){try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}}
    d.artistIn=0;try{d.artistIn=parseInt(sessionStorage.getItem('sg.in')||'0',10)||0}catch(e){}
    function setIn(id){d.artistIn=id||0;try{sessionStorage.setItem('sg.in',String(id||0))}catch(e){}}
    return {d:d,save:save,setIn:setIn};
  })();
  function busyOn(p,date){
    if(!date)return false;
    if(p.booked.indexOf(date)>-1)return true;
    var b=Store.d.blocked[p.id];if(Array.isArray(b)&&b.indexOf(date)>-1)return true;
    return Store.d.bookings.some(function(x){return x.pid===p.id&&x.date===date&&x.status==='confirmed'});
  }
  function isBooked(p){return busyOn(p,state.date)}
  function catOf(k){for(var i=0;i<CATS.length;i++)if(CATS[i].k.indexOf(k)>-1)return CATS[i].id;return 'bridal'}
  var MANDALA='<svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g fill="none" stroke="#F8E3AE" stroke-width="1"><circle cx="100" cy="140" r="30"/><circle cx="100" cy="140" r="52" stroke-dasharray="2 5"/><circle cx="100" cy="140" r="74"/><circle cx="100" cy="140" r="98" stroke-dasharray="2 6"/><path d="M100 140 L100 40 M100 140 L30 70 M100 140 L170 70" stroke-width=".7"/></g></svg>';

  try{var sv=JSON.parse(localStorage.getItem(STORE)||'[]');if(Array.isArray(sv))sv.forEach(function(x){if(x&&typeof x.name==='string'&&x.pk&&typeof x.pk==='object'&&x.city&&AREA[x.city]){x.booked=Array.isArray(x.booked)?x.booked:[];x.styles=Array.isArray(x.styles)?x.styles:[];P.unshift(x)}})}catch(e){}
  P.forEach(function(p){var o=Store.d.overrides[p.id];if(o&&o.pk&&typeof o.pk==='object')p.pk=o.pk});
  function saveListing(np){try{var s=JSON.parse(localStorage.getItem(STORE)||'[]');s.unshift(np);localStorage.setItem(STORE,JSON.stringify(s))}catch(e){}}

  var toastTimer;
  function toast(msg){var t=$('toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.hidden=true},4600)}

  /* ---------- selects ---------- */
  (function(){
    var h='';CATS.forEach(function(c){h+='<optgroup label="'+c.n+'">'+c.k.map(function(k){return '<option value="'+k+'">'+SV[k][0]+'</option>'}).join('')+'</optgroup>'});
    $('occasion').innerHTML=h;$('occasion').value=state.occ;
    var j='';Object.keys(SV).forEach(function(k){j+='<option value="'+k+'">'+SV[k][0]+'</option>'});$('jSvc').innerHTML=j;
  })();

  function offers(city,k){return P.filter(function(p){return p.city===city&&p.pk[k]!=null})}
  function stats(city,k){
    var v=offers(city,k).map(function(p){return p.pk[k]}).sort(function(a,b){return a-b});
    if(v.length<3)return null;
    return {min:v[0],max:v[v.length-1],med:v[Math.floor((v.length-1)/2)],n:v.length};
  }

  function drawCity(){document.querySelectorAll('.citypill button').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-city')===state.city))});$('city').value=state.city}

  function drawCats(){
    var h='';CATS.forEach(function(c){
      var prices=offers(state.city,c.k[0]).map(function(p){return p.pk[c.k[0]]});
      var from=prices.length?'from '+short(Math.min.apply(null,prices)):'coming soon';
      h+='<button type="button" class="cat" data-cat="'+c.id+'" aria-pressed="'+(state.cat===c.id)+'"><img src="'+ph(CATIMG[c.id])+'" alt="" loading="lazy" decoding="async"><span class="catx"><b>'+c.n+'</b><small>'+from+'</small></span></button>'});
    $('cats').innerHTML=h;
    var cur=CATS.filter(function(c){return c.id===state.cat})[0],k='';
    cur.k.forEach(function(s){k+='<button type="button" class="chip" data-occ="'+s+'" aria-pressed="'+(state.occ===s)+'">'+SV[s][0]+'</button>'});
    $('chips').innerHTML=k;
  }

  function list(){
    var occ=state.occ;
    var f=state.f;
    var out=offers(state.city,occ).filter(function(p){
      if(state.budget&&p.pk[occ]>state.budget)return false;
      if(f.area!=='any'&&p.area!==f.area)return false;
      if(f.where==='yes'&&!p.travel)return false;
      if(f.where==='salon'&&p.travel)return false;
      if(f.type!=='any'&&p.type!==f.type)return false;
      if(f.style!=='any'&&p.styles.indexOf(f.style)<0)return false;
      if(f.free&&isBooked(p))return false;
      return true;
    });
    if(state.sort==='low')out.sort(function(a,b){return a.pk[occ]-b.pk[occ]});
    else if(state.sort==='high')out.sort(function(a,b){return b.pk[occ]-a.pk[occ]});
    else out.sort(function(a,b){return ((state.boost[b.id]||0)-(state.boost[a.id]||0))||((isBooked(a)?1:0)-(isBooked(b)?1:0))||(a.pk[occ]-b.pk[occ])});
    return out;
  }

  function drawFilters(){
    var base=offers(state.city,state.occ),f=state.f,areas=[],styles=[];
    base.forEach(function(p){if(areas.indexOf(p.area)<0)areas.push(p.area);p.styles.forEach(function(s){if(styles.indexOf(s)<0)styles.push(s)})});
    areas.sort();styles.sort();
    if(f.area!=='any'&&areas.indexOf(f.area)<0)f.area='any';
    if(f.style!=='any'&&styles.indexOf(f.style)<0)f.style='any';
    function sel(key,label,opts){return '<label class="fl"><span>'+label+'</span><select data-f="'+key+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(f[key]===o[0]?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>'}
    $('filters').innerHTML=sel('area','Area',[['any','All areas']].concat(areas.map(function(a){return [a,a]})))
      +sel('where','Where',[['any','Anywhere'],['yes','She comes to me'],['salon','At the salon']])
      +sel('style','Style',[['any','Any style']].concat(styles.map(function(s){return [s,s]})))
      +sel('type','Type',[['any','Artists and salons'],['artist','Independent artists'],['salon','Salons'],['studio','Studios']])
      +'<label class="fl chk"><input type="checkbox" data-f="free"'+(f.free?' checked':'')+'> Free on my date only</label>'
      +(filtersActive()?'<button type="button" class="btn ghost dark small" data-f-reset>Clear filters</button>':'');
  }
  function render(){
    drawCity();drawCats();drawFilters();
    var occ=state.occ,out=list(),all=offers(state.city,occ),stt=stats(state.city,occ);
    $('resTitle').textContent=SV[occ][0]+' in '+state.city;
    var free=out.filter(function(p){return !isBooked(p)}).length;
    $('resCount').textContent=out.length+(filtersActive()?' match your filters':' listed')+(state.date?' · '+free+' free on '+new Date(state.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'');
    var g=$('guide');
    if(stt){g.hidden=false;g.innerHTML='<b>Usually</b><span><b style="font-size:20px">'+inr(stt.min)+'</b> to <b style="font-size:20px">'+inr(stt.max)+'</b> for '+esc(SV[occ][0].toLowerCase())+' in '+state.city+'</span>'}
    else g.hidden=true;
    if(!out.length){$('grid').innerHTML='<div class="empty"><strong>No listings match yet.</strong><br>Try a higher budget, another service'+(filtersActive()?', or clear your filters':'')+'.'+(filtersActive()?'<br><br><button type="button" class="btn red small" data-f-reset>Clear filters</button>':'')+'</div>';fire();return}
    var h='';
    out.forEach(function(p){
      var booked=isBooked(p),checked=state.cmp.indexOf(p.id)>-1?' checked':'';
      var why=state.boost[p.id]?'<p class="why">'+esc(state.why[p.id]||'Matches your description')+'</p>':'';
      var rank=0,sorted=all.map(function(q){return q.pk[occ]}).sort(function(a,b){return a-b});
      var pos=sorted.length>1?sorted.indexOf(p.pk[occ])/(sorted.length-1):0.5,lab=pos<0.34?'Lower than most in '+state.city:(pos<0.67?'Typical for '+state.city:'Premium for '+state.city);
      h+='<article class="card'+(booked?' booked':'')+'">'
       +'<button type="button" class="art" style="background:'+art(p)+'" data-open="'+p.id+'" aria-label="Open '+esc(p.name)+'"><img src="'+ph(cover(p))+'" style="'+fpos(cover(p))+'" alt="Illustrative photo: '+esc(SV[mainKey(p)][0].toLowerCase())+' look" loading="lazy" decoding="async"><span class="tag">'+TYPE[p.type]+'</span></button>'
       +'<div class="body">'
       +'<div><h3>'+esc(p.name)+'</h3><p class="meta">'+esc(p.area)+', '+esc(p.city)+' · '+esc(p.handle)+'</p></div>'
       +'<div class="styles">'+p.styles.map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+(p.travel?'<span>comes to you</span>':'<span>at the salon</span>')+'</div>'
       +why
       +'<div class="priceline"><div><div class="lbl">'+SV[occ][0]+'</div><div class="amt">'+inr(p.pk[occ])+'<small>'+(p.sample?'sample':'')+'</small></div></div>'
       +'<span class="avail '+(booked?'no':'free')+'">'+(booked?'Booked on your date':'Free on your date')+'</span></div>'
       +(sorted.length>1?'<div><div class="gbar"><i style="left:'+(6+pos*88)+'%"></i></div><div class="fair">'+lab+'</div></div>':'')
       +'<div class="cardfoot"><label class="cmp"><input type="checkbox" data-cmp="'+p.id+'"'+checked+'> Compare</label><button class="save" type="button" data-save="'+p.id+'" aria-pressed="'+(Store.d.saved.indexOf(p.id)>-1)+'" aria-label="Save '+esc(p.name)+'">'+(Store.d.saved.indexOf(p.id)>-1?'♥':'♡')+'</button><button class="btn red small" type="button" data-open="'+p.id+'">View profile</button></div>'
       +'</div></article>';
    });
    $('grid').innerHTML=h;fire();
  }
  var hooks=[];function fire(){hooks.forEach(function(f){f()})}

  function cmpBar(){
    var n=state.cmp.length;$('cmpBar').hidden=n<1;
    $('cmpText').textContent=n+' selected'+(n<2?'. Pick one more to compare.':'. Compare up to 3.');
    $('cmpOpen').disabled=n<2;
  }
  var MODALS=['profileModal','compareModal','joinModal','infoModal','quizModal','lightModal'],lastFocus=null;
  function openLight(id,cap){
    $('lightSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close photo">×</button><img src="'+ph(id)+'" alt="Illustrative photo: '+esc(cap.toLowerCase())+'"><p>'+esc(cap)+' · illustrative stock photo</p>';
    $('lightModal').hidden=false;document.body.style.overflow='hidden';$('lightSheet').querySelector('.x').focus();
  }
  function closeLight(){$('lightModal').hidden=true;var open=MODALS.some(function(i){return !$(i).hidden});if(!open)document.body.style.overflow=''}
  function openModal(id){lastFocus=document.activeElement;var m=$(id);m.hidden=false;document.body.style.overflow='hidden';var b=m.querySelector('.x');if(b)b.focus()}
  function closeModals(){MODALS.forEach(function(i){$(i).hidden=true});document.body.style.overflow='';if(lastFocus&&lastFocus.focus&&document.body.contains(lastFocus))lastFocus.focus();lastFocus=null}
  function openModalOnly(id){MODALS.forEach(function(i){if(i!==id)$(i).hidden=true});var f=lastFocus;openModal(id);if(f)lastFocus=f}
  /* keep keyboard focus inside the open dialog */
  document.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var vis=MODALS.map($).filter(function(x){return !x.hidden}),m=vis[vis.length-1];if(!m)return;
    var f=[].slice.call(m.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(x){return !x.disabled&&x.offsetParent!==null});
    if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}else if(!m.contains(document.activeElement)){e.preventDefault();first.focus()}
  });
  function byId(id){return P.filter(function(x){return x.id===id})[0]}

  function profile(id){
    var p=byId(id);if(!p)return;
    var rows='';
    CATS.forEach(function(c){var r='';c.k.forEach(function(k){if(p.pk[k]!=null)r+='<tr><td>'+SV[k][1]+'</td><td class="amt">'+inr(p.pk[k])+'</td></tr>'});if(r)rows+='<tr class="grp"><td colspan="2">'+c.n+'</td></tr>'+r});
    var offered=Object.keys(p.pk),tiles='',gal=gallery(p);
    gal.forEach(function(id,i){var cap='Her style',ks=offered.concat(Object.keys(IMG));for(var q=0;q<ks.length;q++){if((IMG[ks[q]]||[]).indexOf(id)>-1){cap=SV[ks[q]][0];break}}tiles+='<button type="button" class="tile" data-light="'+id+'" data-cap="'+esc(cap)+'" aria-label="View larger: '+esc(cap)+'"><img src="'+ph(id)+'" style="'+fpos(id)+'" alt="Illustrative photo: '+esc(cap.toLowerCase())+'" loading="lazy" decoding="async"><span>'+esc(cap)+'</span></button>'});
    $('profileSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button>'
     +'<div class="phead cover"><div class="av"><img src="'+ph(cover(p))+'" style="'+fpos(cover(p))+'" alt="" decoding="async"></div>'
     +'<div><span class="badge">'+TYPE[p.type]+'</span><h2 id="pName" style="margin-top:8px">'+esc(p.name)+'</h2><p class="meta">'+esc(p.area)+', '+esc(p.city)+(p.travel?' · comes to your venue':' · at the salon')+'</p></div></div>'
     +'<div class="pbody">'
     +'<div><p>'+esc(p.bio)+'</p>'+contactHtml(p)+'</div>'
     +'<div><h3>Her work</h3><div class="portfolio">'+tiles+'</div><p class="note" style="margin-top:8px">Sample photos for the prototype.</p></div>'
     +'<div>'+(p.pk[state.occ]!=null?'<div class="onepick"><span>'+esc(SV[state.occ][1])+'</span><b>'+inr(p.pk[state.occ])+'</b></div>':'')+'<details class="allprices"'+(p.pk[state.occ]!=null?'':' open')+'><summary>'+(p.pk[state.occ]!=null?'See all her prices':'Her prices')+'</summary><div class="tablewrap"><table class="pk"><tbody>'+rows+'</tbody></table></div><p class="note" style="margin-top:8px">Sample prices.</p></details></div>'
     +reviewsHtml(p)
     +'<div><h3>Check your date</h3><div class="bookrow"><div class="field"><label for="pDate">Event date</label><input id="pDate" type="date" min="2026-10-21" value="'+esc(state.date||'')+'"></div><button class="btn red" id="pCheck" type="button">Check</button></div><div id="pResult" style="margin-top:12px"></div></div>'
     +'</div>';
    openModal('profileModal');
    $('pCheck').onclick=function(){
      var d=$('pDate').value,r=$('pResult');if(!d){r.innerHTML='<div class="result no">Pick a date first.</div>';return}
      if(busyOn(p,d)){r.innerHTML='<div class="result no">'+esc(p.name)+' is booked on that date. Try another date or compare other artists.</div>';return}
      var svcs=Object.keys(p.pk).map(function(k){return '<option value="'+k+'"'+(k===state.occ?' selected':'')+'>'+esc(SV[k][0])+' · '+inr(p.pk[k])+'</option>'}).join('');
      r.innerHTML='<div class="result free">Free on that date.</div>'
        +'<form class="reqform" id="reqForm"><div class="formgrid">'
        +'<div class="field"><label for="rSvc">Service</label><select id="rSvc">'+svcs+'</select></div>'
        +'<div class="field"><label for="rName">Your first name</label><input id="rName" required maxlength="40" autocomplete="given-name" value="'+esc(Store.d.clientName||'')+'"></div>'
        +'<div class="field full"><label for="rVenue">Venue or area</label><input id="rVenue" required maxlength="80" placeholder="Example: Hotel name, or your area"></div>'
        +'<div class="field full"><label for="rNote">Anything she should know? (optional)</label><textarea id="rNote" maxlength="240" placeholder="Outfit colour, trial look, number of people"></textarea></div></div>'
        +'<button class="btn red" type="submit">Send booking request</button>'
        +'<p class="note" style="margin-top:8px">Saved on this device only.</p></form>';
      $('reqForm').onsubmit=function(ev){
        ev.preventDefault();
        var b=createBooking(p,$('rSvc').value,d,$('rVenue').value.trim(),$('rName').value.trim(),$('rNote').value.trim());
        updateBadge();burst();
        var msg='Hi '+p.name.split(' ')[0]+', this is '+(b.name||'a customer')+'. I just sent a booking request on SINGAAR for '+SV[b.svc][0].toLowerCase()+' on '+fmtDate(b.date)+' at '+b.venue+'. Please confirm when you can.';
        r.innerHTML='<div class="result free">Request sent to '+esc(p.name)+'</div>'
          +'<div class="contact" style="margin-top:12px"><button class="btn red small" type="button" id="asArtist">View booking</button><a class="btn small wa" href="'+waLink(p,msg)+'" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>';
        $('asArtist').onclick=function(){closeModals();if(window.SG&&SG.go)SG.go('bookings')};
      };
    };
  }
  function reviewsHtml(p){
    var rv=Store.d.reviews.filter(function(r){return r.pid===p.id});
    if(!rv.length)return '';
    var avg=rv.reduce(function(a,r){return a+r.rating},0)/rv.length;
    return '<div><h3>Reviews <small style="font-family:var(--body);font-size:15px;color:var(--muted)">'+avg.toFixed(1)+' of 5 · '+rv.length+' from completed bookings (sample)</small></h3>'+rv.slice(0,4).map(function(r){return '<p style="margin-top:8px"><span style="color:var(--gold-deep)">'+'★'.repeat(r.rating)+'☆'.repeat(5-r.rating)+'</span> '+esc(r.text||'')+' <span class="note">· '+esc(r.name||'A customer')+'</span></p>'}).join('')+'</div>';
  }

  /* ---------- WhatsApp and Instagram ----------
     Sample artists have no real phone number or Instagram account, so they never link to a real person.
     WhatsApp for a sample artist opens a message with no recipient (you choose who to send it to).
     Only artists who list themselves, with their own number and handle, get direct links. */
  function waNumber(raw){var d=String(raw||'').replace(/\D/g,'');if(d.length===10&&/^[6-9]/.test(d))return '91'+d;if(d.length===12&&d.indexOf('91')===0&&/^[6-9]/.test(d.slice(2)))return d;return ''}
  function waLink(p,text){var n=(p&&typeof p.wa==='string'&&/^91[6-9]\d{9}$/.test(p.wa))?p.wa:'';return 'https://wa.me/'+n+'?text='+encodeURIComponent(text)}
  function igLink(p){return(p&&!p.sample&&typeof p.handle==='string'&&/^@[A-Za-z0-9._]{1,30}$/.test(p.handle))?'https://www.instagram.com/'+p.handle.slice(1)+'/':''}
  function hiText(p,svc,date){return 'Hi '+p.name.split(' ')[0]+', I found you on SINGAAR (prototype). I am looking for '+SV[svc||state.occ][0].toLowerCase()+(date?' on '+fmtDate(date):'')+'. Are you available?'}
  function contactHtml(p){
    var ig=igLink(p),direct=!!(p.wa&&/^91[6-9]\d{9}$/.test(p.wa));
    return '<div class="contact"><a class="btn small wa" href="'+waLink(p,hiText(p,state.occ,state.date))+'" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>'
      +(ig?'<a class="btn ghost dark small" href="'+ig+'" target="_blank" rel="noopener noreferrer">View on Instagram</a>':'<span class="note">Instagram '+esc(p.handle)+' (sample handle, not linked)</span>')
      +'</div>';
  }

  /* ---------- bookings ---------- */
  var REPLIES=['Happy to do this! I will message you a few days before to confirm timings.','Confirmed. I will bring everything for your look and arrive on time.','Lovely, you are on my calendar. See you then!'];
  function createBooking(p,svc,date,venue,name,note){
    var b={id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),pid:p.id,svc:svc,date:date,venue:venue,name:name,note:note,price:p.pk[svc],status:'requested',created:Date.now(),reply:''};
    Store.d.bookings.unshift(b);if(name)Store.d.clientName=name;Store.save();
    scheduleAuto(b);return b;
  }
  function scheduleAuto(b){
    var p=byId(b.pid);if(!p||!p.sample||b.status!=='requested')return;
    setTimeout(function(){
      var cur=Store.d.bookings.filter(function(x){return x.id===b.id})[0];
      if(!cur||cur.status!=='requested'||!Store.d.autoReply)return;
      if(busyOn(p,cur.date)){setBookingStatus(cur.id,'declined','Sorry, I just got booked for that date.');return}
      setBookingStatus(cur.id,'confirmed',REPLIES[Math.floor(Math.random()*REPLIES.length)]);
      toast(p.name+' confirmed your booking for '+fmtDate(cur.date)+'.');burst();
    },35000);
  }
  function setBookingStatus(id,status,reply){
    var b=Store.d.bookings.filter(function(x){return x.id===id})[0];if(!b)return null;
    b.status=status;if(reply!==undefined)b.reply=reply;b.updated=Date.now();Store.save();
    render();updateBadge();if(window.SGPortal&&SGPortal.refresh)SGPortal.refresh();return b;
  }
  function fmtDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}}
  function updateBadge(){
    var n=Store.d.bookings.filter(function(b){return b.status==='confirmed'||b.status==='requested'}).length,el=$('portalBadge');
    if(el){el.textContent=n;el.hidden=n<1}
  }
  /* kumkum and gold dust celebration */
  function burst(){
    if(reduce)return;
    var c=document.createElement('canvas');c.className='burst';c.width=innerWidth;c.height=innerHeight;c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    var x=c.getContext('2d'),cols=['#F8E3AE','#D8AA5C','#B3121F','#D6283A','#FBF1E1'],ps=[];
    for(var i=0;i<140;i++){var a=Math.random()*Math.PI*2,s=4+Math.random()*9;ps.push({x:c.width/2,y:c.height*0.45,vx:Math.cos(a)*s,vy:Math.sin(a)*s-5,r:2+Math.random()*3.5,c:cols[i%cols.length],l:1})}
    var f=0;(function tick(){x.clearRect(0,0,c.width,c.height);ps.forEach(function(q){q.x+=q.vx;q.y+=q.vy;q.vy+=0.26;q.vx*=0.99;q.l-=0.011;x.globalAlpha=Math.max(q.l,0);x.fillStyle=q.c;x.beginPath();x.arc(q.x,q.y,q.r,0,6.3);x.fill()});
      if(++f<110)requestAnimationFrame(tick);else c.remove()})();
  }
  /* add a confirmed booking to the user's calendar (.ics file made on this device) */
  function downloadIcs(b){
    var p=byId(b.pid),d=b.date.replace(/-/g,''),n=new Date(b.date+'T00:00:00');n.setDate(n.getDate()+1);
    var e=n.getFullYear()+('0'+(n.getMonth()+1)).slice(-2)+('0'+n.getDate()).slice(-2);
    var clean=function(s){return String(s).replace(/[\r\n]+/g,' ').replace(/[,;\\]/g,' ')};
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SINGAAR//Prototype//EN','BEGIN:VEVENT','UID:'+b.id+'@singaar.prototype','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART;VALUE=DATE:'+d,'DTEND;VALUE=DATE:'+e,'SUMMARY:'+clean(SV[b.svc][0]+' with '+(p?p.name:'your artist')),'LOCATION:'+clean(b.venue),'DESCRIPTION:'+clean('Booked on SINGAAR (prototype). Agreed price '+inr(b.price)),'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='singaar-booking.ics';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  }

  function compare(){
    var sel=state.cmp.map(byId).filter(Boolean);
    var head='<tr><th></th>'+sel.map(function(p){return '<th>'+esc(p.name)+'<br><span class="badge'+(p.type==='studio'?' studio':'')+'">'+TYPE[p.type]+'</span></th>'}).join('')+'</tr>';
    var body='<tr><td>Area</td>'+sel.map(function(p){return '<td>'+esc(p.area)+', '+esc(p.city)+'</td>'}).join('')+'</tr>';
    body+='<tr><td>Styles</td>'+sel.map(function(p){return '<td>'+p.styles.map(esc).join(', ')+'</td>'}).join('')+'</tr>';
    var keys=Object.keys(SV).filter(function(k){return sel.some(function(p){return p.pk[k]!=null})});
    keys.forEach(function(k){body+='<tr><td'+(k===state.occ?' style="font-weight:600"':'')+'>'+SV[k][1]+'</td>'+sel.map(function(p){return '<td class="amt">'+(p.pk[k]!=null?inr(p.pk[k]):'Not offered')+'</td>'}).join('')+'</tr>'});
    body+='<tr><td>Comes to your venue</td>'+sel.map(function(p){return '<td>'+(p.travel?'Yes':'At the salon')+'</td>'}).join('')+'</tr>';
    body+='<tr><td>Free on your date</td>'+sel.map(function(p){return '<td>'+(isBooked(p)?'Booked':'Free')+'</td>'}).join('')+'</tr>';
    body+='<tr><td>Instagram</td>'+sel.map(function(p){return '<td>'+esc(p.handle)+'</td>'}).join('')+'</tr>';
    $('compareSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button>'
      +'<div class="phead"><div><h2 id="cmpTitle">Side by side</h2><p class="meta">Sample prices for the prototype</p></div></div>'
      +'<div class="pbody"><div class="tablewrap"><table class="pk"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div></div>';
    openModal('compareModal');
  }

  /* ---------- describe your look ---------- */
  function parseAsk(txt){
    var t=txt.toLowerCase(),res={occ:null,city:null,budget:0,styles:[]};
    if(/bangalore|bengaluru|blr/.test(t))res.city='Bangalore';else if(/chennai/.test(t))res.city='Chennai';
    var map=[[/pre[- ]?bridal/,'prebridal'],[/engagement|betroth|mangni/,'engagement'],[/reception|walima/,'reception'],[/bridesmaid/,'bridesmaid'],[/mehendi|henna|mehndi/,'mehendi'],[/blow[- ]?dry|blowout|blow out/,'blowdry'],[/hair ?spa/,'hairspa'],[/facial|glow|skin|clean[- ]?up/,'facial'],[/nail/,'nails'],[/accessor|jewel/,'accessory'],[/guest/,'guest'],[/party|birthday|cocktail|date night|night out|sangeet|festival|diwali/,'party'],[/saree|sari|drap/,'saree'],[/bridal|wedding|bride|nikah|muhurtham/,'bridal'],[/hair/,'hair']];
    for(var i=0;i<map.length;i++){if(map[i][0].test(t)){res.occ=map[i][1];break}}
    var m=t.match(/(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(k|thousand)?/g);
    if(m){m.forEach(function(x){var n=parseFloat(x.replace(/,/g,''));if(/k|thousand/.test(x))n*=1000;if(n>=300&&n<=200000&&!res.budget)res.budget=n})}
    [['soft glam',/soft|natural|glow/],['traditional',/traditional|classic|south indian|kanjivaram/],['airbrush',/airbrush/],['minimal',/minimal|simple|natural/],['HD',/\bhd\b/],['nail art',/nail art/]].forEach(function(s){if(t.indexOf(s[0].toLowerCase())>-1||s[1].test(t))res.styles.push(s[0])});
    return res;
  }
  function applyAsk(txt){
    var r=parseAsk(txt);
    if(r.city)state.city=r.city;
    if(r.occ){state.occ=r.occ;state.cat=catOf(r.occ)}
    $('occasion').value=state.occ;
    state.budget=0;
    if(r.budget){var opts=[2000,5000,10000,20000,30000,40000],pick=0;opts.forEach(function(o){if(o>=r.budget&&!pick)pick=o});state.budget=pick||40000}
    $('budget').value=String(state.budget);
    state.boost={};state.why={};
    P.forEach(function(p){
      var s=0,why=[];
      r.styles.forEach(function(st){if(p.styles.indexOf(st)>-1){s+=2;why.push(st)}});
      if(/travel|venue|home|my place|come to/.test(txt.toLowerCase())&&p.travel){s+=1;why.push('comes to you')}
      if(r.budget&&p.pk[state.occ]!=null&&p.pk[state.occ]<=r.budget)s+=1;
      if(s>0&&p.city===state.city&&p.pk[state.occ]!=null){state.boost[p.id]=s;state.why[p.id]=why.length?'Matches: '+why.join(', '):'Within your budget'}
    });
    var found=Object.keys(state.boost).length,sg=$('suggest');sg.hidden=false;
    sg.innerHTML='<strong>Here is what we understood</strong><p>'+esc(SV[state.occ][0])+' in '+state.city+(r.budget?', around '+inr(r.budget):'')+(r.styles.length?', style: '+r.styles.map(esc).join(', '):'')+'. '+(found?found+' listings match your words and are shown first.':'No exact style match, so showing everyone for this look.')+' <span class="note" style="color:#CDB3A3">(AI understanding of your description arrives with launch.)</span></p>';
    state.sort='rec';$('sort').value='rec';render();
    $('browse').scrollIntoView({behavior:'smooth'});
  }

  /* ---------- events ---------- */
  document.addEventListener('click',function(e){
    var t=e.target,x;
    if((x=t.closest('[data-open]'))){profile(parseInt(x.getAttribute('data-open'),10));return}
    if((x=t.closest('[data-cat]'))){var c=CATS.filter(function(k){return k.id===x.getAttribute('data-cat')})[0];state.cat=c.id;state.occ=c.k[0];$('occasion').value=state.occ;state.boost={};$('suggest').hidden=true;render();return}
    if((x=t.closest('[data-occ]'))){state.occ=x.getAttribute('data-occ');$('occasion').value=state.occ;state.boost={};$('suggest').hidden=true;render();return}
    if((x=t.closest('[data-city]'))){state.city=x.getAttribute('data-city');state.boost={};$('suggest').hidden=true;render();return}
    if(t.closest('[data-f-reset]')){state.f={area:'any',where:'any',style:'any',type:'any',free:false};render();return}
    if((x=t.closest('[data-light]'))){openLight(x.getAttribute('data-light'),x.getAttribute('data-cap')||'');return}
    if(t.closest('#lightModal')&&(t.closest('[data-close]')||t.id==='lightModal')){closeLight();return}
    if(t.closest('[data-close]')||t.classList.contains('modal')){closeModals();return}
    if(t.id==='cmpOpen'&&state.cmp.length>1){compare();return}
    if(t.id==='cmpClear'){state.cmp=[];cmpBar();render();return}
    if(t.id==='joinTop'||t.id==='joinBand'){openModal('joinModal');return}
  });
  document.addEventListener('change',function(e){
    var t=e.target;
    if(t.hasAttribute&&t.hasAttribute('data-f')){
      var key=t.getAttribute('data-f');state.f[key]=t.type==='checkbox'?t.checked:t.value;state.boost={};render();
      var again=document.querySelector('[data-f="'+key+'"]');if(again)again.focus();return;
    }
    if(t.hasAttribute&&t.hasAttribute('data-cmp')){
      var id=parseInt(t.getAttribute('data-cmp'),10),i=state.cmp.indexOf(id);
      if(t.checked){if(state.cmp.length>=3){t.checked=false;toast('You can compare up to 3 at a time.');return}state.cmp.push(id)}else if(i>-1){state.cmp.splice(i,1)}
      cmpBar();
    }
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!$('lightModal').hidden)closeLight();else closeModals()}});
  $('searchForm').addEventListener('submit',function(e){
    e.preventDefault();
    state.city=$('city').value;state.occ=$('occasion').value;state.cat=catOf(state.occ);state.budget=parseInt($('budget').value,10)||0;state.date=$('date').value;
    state.boost={};$('suggest').hidden=true;render();$('browse').scrollIntoView({behavior:'smooth'});
  });
  $('askForm').addEventListener('submit',function(e){
    e.preventDefault();var v=$('ask').value.trim();
    if(!v){toast('Write a few words about the look you want first.');return}
    state.date=$('date').value;applyAsk(v);
  });
  $('sort').addEventListener('change',function(){state.sort=$('sort').value;render()});
  $('date').addEventListener('change',function(){state.date=$('date').value;render()});
  $('budget').addEventListener('change',function(){state.budget=parseInt($('budget').value,10)||0;state.boost={};render()});
  $('joinForm').addEventListener('submit',function(e){
    e.preventDefault();
    var price=parseInt($('jPrice').value,10);if(!price)return;
    var h=$('jHandle').value.trim();if(h&&h.charAt(0)!=='@')h='@'+h;
    if(h&&!/^@[A-Za-z0-9._]{1,30}$/.test(h)){toast('Your Instagram handle can only use letters, numbers, dots and underscores.');return}
    var waRaw=$('jWa').value.trim(),wa='';
    if(waRaw){wa=waNumber(waRaw);if(!wa){toast('Enter a 10-digit Indian mobile number for WhatsApp, or leave it empty.');return}}
    var svc=$('jSvc').value,pk={};pk[svc]=price;
    var np={wa:wa,id:Date.now(),name:$('jName').value.trim(),type:$('jType').value,city:$('jCity').value,area:$('jArea').value.trim()||$('jCity').value,handle:h||'@your.handle',styles:['new on SINGAAR'],travel:true,bio:'New on SINGAAR. '+SV[svc][0]+' from '+inr(price)+'.',pk:pk,booked:[],sample:false};
    P.unshift(np);saveListing(np);Store.d.mine=np.id;Store.setIn(np.id);Store.save();
    state.city=np.city;state.occ=svc;state.cat=catOf(svc);$('occasion').value=svc;state.budget=0;$('budget').value='0';state.boost={};state.boost[np.id]=9;state.why={};state.why[np.id]='Just joined';
    closeModals();$('joinForm').reset();render();
    toast('You are listed in '+np.city+'. Welcome! This is your artist dashboard. Prototype: your profile is saved in this browser only.');
    if(window.SG&&SG.go)SG.go('a-requests');else $('browse').scrollIntoView({behavior:'smooth'});
  });

  /* ---------- live map ---------- */
  var NS='http://www.w3.org/2000/svg';
  /* On a phone the 800-wide map is shown at about 40% size. Scale pins, labels and markers up so they stay readable. */
  function mapScale(){var w=Math.min(window.innerWidth-36,1160);return Math.max(1,Math.min(2.6,640/Math.max(w,300)))}
  function baseMap(city,sc){
    var s='<defs><linearGradient id="sea" x1="0" x2="1"><stop offset="0" stop-color="#D3E6EA"/><stop offset="1" stop-color="#B4D3DA"/></linearGradient></defs><rect width="800" height="520" fill="#F2E3D2"/>';
    for(var bi=0;bi<10;bi++)for(var bj=0;bj<6;bj++){s+='<rect x="'+(bi*82+8)+'" y="'+(bj*88+8)+'" width="68" height="74" rx="12" fill="'+(((bi*3+bj*5)%4===0)?'#EBD5BF':((bi+bj)%2?'#F0DFCB':'#EFDCC6'))+'"/>'}
    if(city==='Chennai'){
      s+='<path d="M630,0 C600,130 650,260 610,380 C590,450 620,500 600,520 L800,520 L800,0Z" fill="url(#sea)"/>';
      s+='<path d="M0,372 C120,355 200,420 330,395 C430,378 520,430 612,408" fill="none" stroke="#B4D3DA" stroke-width="16" stroke-linecap="round"/>';
      s+='<text class="lbl" x="710" y="260" text-anchor="middle">Bay of Bengal</text>';
    }else{
      s+='<path d="M360,230 q40,-30 90,0 q20,40 -20,60 q-60,10 -70,-60z" fill="#C9DFB0"/><path d="M130,300 q40,-30 90,0 q10,40 -40,50 q-50,-10 -50,-50z" fill="#C9DFB0"/><path d="M560,120 q40,-26 80,4 q14,36 -30,50 q-50,4 -50,-54z" fill="#C9DFB0"/>';
      s+='<text class="lbl" x="410" y="268" text-anchor="middle">Cubbon Park</text>';
    }
    var roads=city==='Chennai'?['M0,150 L800,200','M120,0 L260,520','M0,330 L620,280','M400,0 L360,520','M520,0 L470,520','M0,470 L610,430']:['M0,260 L800,250','M420,0 L430,520','M60,100 L760,420','M70,430 L770,110','M200,0 L180,520','M650,0 L670,520'];
    roads.forEach(function(d){s+='<path d="'+d+'" fill="none" stroke="#E3CBB2" stroke-width="17" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="#FFFBF5" stroke-width="13" stroke-linecap="round"/>'});
    var a=AREA[city];Object.keys(a).forEach(function(k){s+='<text class="lbl" x="'+a[k][0]+'" y="'+(a[k][1]+(sc>1.3?62:54))+'" text-anchor="middle">'+k+'</text>'});
    return s.replace(/<text class="lbl"/g,'<text class="lbl" style="font-size:'+(11*Math.min(sc||1,1.35))+'px"');
  }
  function areaPos(p,list){
    var a=AREA[p.city][p.area],base=a||CENTER[p.city];
    var same=list.filter(function(q){return q.city===p.city&&(a?q.area===p.area:!AREA[q.city][q.area])}),i=same.indexOf(p),n=same.length;
    if(n<2&&a)return [base[0],base[1]];
    var ang=(i/Math.max(n,1))*Math.PI*2+0.6,r=n<2?40:32;
    return [base[0]+Math.cos(ang)*r*1.5,base[1]+Math.sin(ang)*r];
  }
  var live={pins:[]};
  function drawLive(){
    var occ=state.occ,out=list();
    var sc=mapScale(),s=baseMap(state.city,sc);live.pins=[];
    out.forEach(function(p,i){
      var pos=areaPos(p,out),booked=isBooked(p),amt=short(p.pk[occ]);
      var w=amt.length*10+24,col=booked?'#8A5A00':'#2F6B3F',bg=booked?'#FBEBC8':'#E3F1E3';
      s+='<g class="pin" id="pin'+i+'" tabindex="0" role="button" aria-label="'+esc(p.name)+', '+amt+', '+(booked?'booked':'free')+'" data-pid="'+p.id+'"><g transform="scale('+sc+')">'
        +(p.travel?'<circle r="46" fill="none" stroke="'+col+'" stroke-width="1.5" stroke-dasharray="2 6" opacity=".55"/>':'')
        +'<rect x="'+(-w/2)+'" y="-16" width="'+w+'" height="30" rx="15" fill="'+bg+'" stroke="'+col+'" stroke-width="2.5"/>'
        +'<path d="M-6,13 L0,22 L6,13z" fill="'+bg+'" stroke="'+col+'" stroke-width="2.5"/><rect x="-7" y="10" width="14" height="4" fill="'+bg+'"/>'
        +'<text text-anchor="middle" y="5" fill="'+col+'">'+amt+'</text></g></g>';
      live.pins.push({id:p.id,x:pos[0],y:pos[1],ph:i*1.7,booked:booked,i:i});
    });
    if(!out.length)s+='<text x="400" y="260" text-anchor="middle" class="lbl">No listings match. Try another service or budget.</text>';
    $('liveMap').innerHTML=s;placePins(0);
    $('mapCard').innerHTML='<span class="note" style="color:var(--muted)">'+out.length+' listed for '+esc(SV[occ][0].toLowerCase())+' in '+state.city+'. Tap a price pin to see who it is.</span>';
  }
  function placePins(t){
    live.pins.forEach(function(q){
      var el=$('pin'+q.i);if(!el)return;
      var dx=q.booked?0:Math.cos(t/900+q.ph)*5,dy=q.booked?0:Math.sin(t/1100+q.ph)*4;
      el.setAttribute('transform','translate('+(q.x+dx)+','+(q.y+dy)+')');
    });
  }
  function pinCard(id){
    var p=byId(id);if(!p)return;var occ=state.occ,booked=isBooked(p);
    $('mapCard').innerHTML='<img class="avt" src="'+ph(cover(p))+'" alt=""><div style="flex:1;min-width:200px"><span class="badge'+(p.type==='studio'?' studio':'')+'">'+TYPE[p.type]+'</span><h3 style="margin-top:6px">'+esc(p.name)+'</h3><p class="meta">'+esc(p.area)+' · '+esc(p.handle)+' · '+SV[occ][0]+' <b>'+inr(p.pk[occ])+'</b> <span class="avail '+(booked?'no':'free')+'">'+(booked?'Booked on your date':'Free on your date')+'</span></p></div><button class="btn red" type="button" data-open="'+p.id+'">View profile</button>';
  }
  document.addEventListener('click',function(e){var pin=e.target.closest('#liveMap .pin');if(pin)pinCard(parseInt(pin.getAttribute('data-pid'),10))});
  document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('#liveMap .pin')){e.preventDefault();pinCard(parseInt(e.target.getAttribute('data-pid'),10))}});
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches,vis=false;
  if('IntersectionObserver' in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe($('liveMap'));else vis=true;
  setInterval(function(){if(vis&&!reduce)placePins(Date.now())},90);

  /* ---------- live arrival ---------- */
  /* Every step is an offset (minutes) from the event time the user sets, so the schedule works backwards from the muhurtham. */
  var SCN={
    wedding:{key:'bridal',event:'Muhurtham',def:'08:30',steps:[[-300,'Artist leaves for your venue',''],[-240,'Artist arrives','{n} has arrived. Base and makeup are in progress.'],[-135,'Base and bridal makeup','{n} is working on your base and makeup.'],[-90,'Saree draping, jewellery and hair','Saree draping, jewellery and hair set.'],[-30,'Bride is ready for photographs','Almost there. Final touches.'],[0,'Muhurtham','It is muhurtham time. Congratulations!']]},
    quick:{key:'quick',event:'Your look',def:'18:00',steps:[[-45,'Artist leaves for you',''],[-30,'Artist arrives','{n} has arrived. Getting started.'],[-20,'Service in progress','{n} is working on your look.'],[-8,'Final touches','Almost done. Final touches.'],[-3,'All set','You look stunning!'],[0,'Done','Enjoy your day!']]},
    party:{key:'party',event:'Party',def:'19:00',steps:[[-210,'Artist leaves for you',''],[-150,'Artist arrives','{n} has arrived. Makeup is starting.'],[-90,'Makeup','{n} is finishing your makeup.'],[-45,'Hair and accessories','Hair and accessories being styled.'],[-15,'You are ready to step out','You look stunning. Time to go!'],[0,'Party time','Have the best night!']]}
  };
  var TK={t:0,timer:null,path:null,len:0,art:null,scn:null,force:null,svc:null};
  function nowPlus(m){var d=new Date(Date.now()+m*60000);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
  function fmt(m){m=((Math.floor(m)%1440)+1440)%1440;var h=Math.floor(m/60),mm=m%60,ap=h>=12?'pm':'am',h12=h%12||12;return h12+':'+(mm<10?'0':'')+mm+' '+ap}
  function buildScn(){
    var base=SCN[$('tkScn').value],tv=($('tkTime').value||base.def).split(':'),ev=(parseInt(tv[0],10)||0)*60+(parseInt(tv[1],10)||0);
    var steps=base.steps.map(function(s){return [ev+s[0],s[1],s[2]]});
    return {key:(base.key==='quick'&&TK.svc)?TK.svc:base.key,event:base.event,steps:steps,ev:ev,leave:steps[0][0],arrive:steps[1][0]};
  }
  function tkOptions(){
    var sc=buildScn();TK.scn=sc;
    $('tkNote').textContent='To be ready by '+fmt(sc.steps[4][0])+', ask your artist to arrive by '+fmt(sc.arrive)+'.';
    var arr=P.filter(function(p){return p.city===state.city&&p.travel&&p.pk[sc.key]!=null&&!busyOn(p,state.date)});
    if(TK.force){var fp=byId(TK.force);if(fp&&arr.indexOf(fp)<0)arr.unshift(fp);if(fp)state.city=fp.city}
    var keep=TK.force?String(TK.force):$('tkArtist').value;
    $('tkArtist').innerHTML=arr.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+' · '+inr(p.pk[sc.key])+'</option>'}).join('')||'<option value="">No artist free on your date who comes to you</option>';
    if(arr.some(function(p){return String(p.id)===keep}))$('tkArtist').value=keep;
    $('tkGo').disabled=!arr.length;
  }
  function tkSetup(){
    var sc=mapScale(),c=state.city,p=byId(parseInt($('tkArtist').value,10)),svg=$('trkMap'),s=baseMap(c,sc),v=VENUE[c].p;
    TK.art=p;
    if(!p){svg.innerHTML=s;tkDraw(TK.scn.steps[0][0]-1);return}
    var a=AREA[c][p.area]||CENTER[c],lf=a[0]<=v[0],sw=Math.round(7*Math.min(sc,1.8));
    var ts=!p.travel,S=ts?v:a,E=ts?a:v,d='M'+S[0]+','+S[1]+' L'+E[0]+','+S[1]+' L'+E[0]+','+E[1];
    s+='<defs><clipPath id="trkClip"><circle r="22"/></clipPath></defs>';
    s+='<path d="'+d+'" fill="none" stroke="#fff" stroke-width="'+(sw+6)+'" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<path d="'+d+'" fill="none" stroke="#F0D9A6" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<path id="trkDone" d="'+d+'" fill="none" stroke="#B3121F" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 9999"/>';
    s+='<g transform="translate('+E[0]+','+E[1]+')"><g transform="scale('+sc+')"><circle r="24" fill="#D8AA5C" opacity=".35"><animate attributeName="r" values="16;34;16" dur="2.4s" repeatCount="indefinite"/></circle><path d="M0,0 C-16,-22 -16,-40 0,-40 C16,-40 16,-22 0,0z" transform="translate(0,2)" fill="#B3121F" stroke="#FFF7EC" stroke-width="3"/><circle cy="-26" r="6" fill="#FFF7EC"/><text x="'+(lf?20:-20)+'" y="-24" text-anchor="'+(lf?'start':'end')+'" style="font:600 14px Jost,sans-serif" fill="#3F0407">'+esc(ts?p.name.split(' ')[0]+'’s salon':VENUE[c].n)+'</text></g></g>';
    s+='<g transform="translate('+S[0]+','+S[1]+')"><g transform="scale('+sc+')"><circle r="8" fill="#2A0A0C"/><text x="'+(lf?-36:36)+'" y="5" text-anchor="'+(lf?'end':'start')+'" style="font:600 13px Jost,sans-serif" fill="#2A0A0C">'+esc(ts?'You':p.name.split(' ')[0]+'’s place')+'</text></g></g>';
    s+='<g id="trkBike" transform="translate('+S[0]+','+S[1]+')"><g transform="scale('+sc+')">'+(ts?'<circle r="22" fill="#fff"/><circle r="19" fill="#B3121F"/><text y="5" text-anchor="middle" style="font:700 13px Jost,sans-serif" fill="#fff">You</text>':'<circle r="27" fill="#fff"/><circle r="25" fill="#D8AA5C"/><g clip-path="url(#trkClip)"><image href="'+ph(cover(p))+'" x="-22" y="-22" width="44" height="44" preserveAspectRatio="xMidYMid slice"/></g><circle r="22" fill="none" stroke="#2A0A0C" stroke-width="2"/>')+'</g></g>';
    svg.innerHTML=s;
    TK.path=document.createElementNS(NS,'path');TK.path.setAttribute('d',d);TK.len=TK.path.getTotalLength();
    tkDraw(TK.scn.steps[0][0]);
  }
  function tkDraw(t){
    function labelFor(x){if(TK.art&&!TK.art.travel){if(/^Artist leaves/.test(x))return 'You leave for the salon';if(/^Artist arrives/.test(x))return 'You arrive'}return x}
    var sc=TK.scn,st=sc.steps,t0=st[0][0],arrive=st[1][0],end=st[st.length-1][0],p=TK.art,first=p?p.name.split(' ')[0]:'Your artist';
    var prog=t<=arrive?Math.max(0,(t-t0)/(arrive-t0)):1;
    if(TK.path){var pt=TK.path.getPointAtLength(TK.len*prog),b=$('trkBike'),dn=$('trkDone');if(b)b.setAttribute('transform','translate('+pt.x+','+pt.y+')');if(dn)dn.setAttribute('stroke-dasharray',(TK.len*prog)+' 9999')}
    var big='Press start to begin.',cur=-1;
    for(var i=0;i<st.length;i++)if(t>=st[i][0])cur=i;
    if(!p)big='No artist available for this date.';
    else if(cur<0)big='Press start to begin.';
    else if(cur===0)big=(p&&!p.travel)?'Leave now. '+first+'’s salon is '+Math.max(1,Math.ceil(arrive-t))+' min away':first+' is '+Math.max(1,Math.ceil(arrive-t))+' min away';
    else big=st[cur][2].replace('{n}',first);
    $('tkBig').textContent=big;
    var left=Math.round(end-t);$('tkClock').textContent=fmt(t)+' · '+(left>0?sc.event+' in '+(left>=60?Math.floor(left/60)+' h ':'')+(left%60)+' min':sc.event+' now');
    $('tkBar').style.width=Math.min(100,Math.max(0,(t-t0)/(end-t0)*100))+'%';
    var h='';st.forEach(function(sx,i){var next=st[i+1]?st[i+1][0]:Infinity,cl=t>=next?'done':(t>=sx[0]?'now':'');h+='<li class="'+cl+'"><i>'+(cl==='done'?'✓':'')+'</i><span>'+labelFor(sx[1])+'</span><time>'+fmt(sx[0])+'</time></li>'});
    $('tkSteps').innerHTML=h;
  }
  function tkStart(){
    clearInterval(TK.timer);tkSetup();if(!TK.art)return;
    var st=TK.scn.steps,end=st[st.length-1][0];TK.t=st[0][0];var sp=parseFloat($('tkSpeed').value)||4,last=Date.now();
    TK.timer=setInterval(function(){var n=Date.now();TK.t+=(n-last)/1000*sp;last=n;if(TK.t>=end){TK.t=end;clearInterval(TK.timer);TK.timer=null}tkDraw(TK.t)},100);
    $('tkGo').textContent='Replay';
  }
  function tkReset(){clearInterval(TK.timer);TK.timer=null;$('tkGo').textContent='Replay';tkOptions();tkSetup()}
  /* the tracker starts moving as soon as it is opened, nobody has to find a Start button */
  function tkAuto(){if(!TK.timer&&!$('tkGo').disabled)tkStart()}
  var rsz;window.addEventListener('resize',function(){clearTimeout(rsz);rsz=setTimeout(function(){drawLive();if(!TK.timer)tkSetup()},200)});
  $('tkGo').addEventListener('click',tkStart);
  $('tkArtist').addEventListener('change',function(){TK.force=null;tkReset()});
  $('tkScn').addEventListener('change',function(){TK.svc=null;$('tkTime').value=SCN[$('tkScn').value].def;tkReset()});
  $('tkTime').addEventListener('change',tkReset);

  /* ---------- occasion plan ---------- */
  var TRAD={
    hindu:[['Pre-bridal glow','Skin and care in the weeks before.',['prebridal']],['Mehendi evening','Mehendi for the bride, the night before.',['mehendi']],['Engagement','Nichayathartham or engagement ceremony look.',['engagement']],['Muhurtham','The wedding morning: bridal makeup and saree draping.',['bridal','saree']],['Reception','An evening look for the reception.',['reception']],['Family and bridesmaids','Looks for sisters and friends, per person.',['bridesmaid']]],
    muslim:[['Pre-bridal glow','Skin and care in the weeks before.',['prebridal']],['Mehendi','Mehendi for the bride and family.',['mehendi']],['Mangni (engagement)','Ring ceremony look.',['engagement']],['Nikah','The nikah day: bridal makeup and hair.',['bridal','hair']],['Walima','The reception hosted by the groom\'s family.',['reception']],['Family and friends','Looks for sisters and friends, per person.',['bridesmaid']]],
    christian:[['Pre-bridal glow','Skin and care in the weeks before.',['prebridal']],['Engagement','Betrothal or engagement party look.',['engagement']],['Church wedding','Bridal makeup and hair for the ceremony.',['bridal','hair']],['Reception','An evening look for the reception.',['reception']],['Bridesmaids','Looks for the bridal party, per person.',['bridesmaid']]],
    party:[['Glow facial','A few days before, so your skin is ready.',['facial']],['Hair day','Blow-dry and set.',['blowdry']],['Party makeup','Makeup for the evening.',['party']],['Nails','Nail art or gel.',['nails']],['Accessory styling','Jewellery and hair accessories, styled for your outfit.',['accessory']]]
  };
  var JR={pick:{}};
  function costOf(p,keys){var t=0;for(var i=0;i<keys.length;i++){if(p.pk[keys[i]]==null)return null;t+=p.pk[keys[i]]}return t}
  function jrKey(i){return $('jrTrad').value+'|'+state.city+'|'+i}
  function drawJourney(){
    var tr=$('jrTrad').value,city=state.city,h='';$('jrCityLbl').textContent=city;
    TRAD[tr].forEach(function(r,i){
      var opts=P.filter(function(p){return p.city===city&&costOf(p,r[2])!=null});
      var cur=JR.pick[jrKey(i)];if(cur&&!opts.some(function(p){return String(p.id)===cur}))cur=null;
      h+='<div class="rit"><div class="n"><img src="'+ph((IMG[r[2][0]]||IMG.bridal)[0])+'" alt="" loading="lazy" decoding="async"><span>'+(i+1)+'</span></div><div><h3>'+esc(r[0])+'</h3><p>'+esc(r[1])+'</p></div>'
        +'<select data-rit="'+i+'" aria-label="Artist for '+esc(r[0])+'"><option value="">'+(opts.length?'Choose an artist':'No one listed yet')+'</option>'+opts.map(function(p){return '<option value="'+p.id+'"'+(String(p.id)===cur?' selected':'')+'>'+esc(p.name)+' · '+inr(costOf(p,r[2]))+'</option>'}).join('')+'</select>'
        +'<div class="amt" id="rc'+i+'"></div></div>';
    });
    $('jrList').innerHTML=h;sumJourney();
  }
  function sumJourney(){
    var tr=$('jrTrad').value,tot=0;
    TRAD[tr].forEach(function(r,i){var v=JR.pick[jrKey(i)],p=v&&byId(parseInt(v,10)),c=p?costOf(p,r[2]):null;$('rc'+i).textContent=c==null?'':inr(c);if(c)tot+=c});
    $('jrTotal').textContent=inr(tot);
  }
  $('jrList').addEventListener('change',function(e){var s=e.target;if(s.hasAttribute('data-rit')){JR.pick[jrKey(s.getAttribute('data-rit'))]=s.value;sumJourney()}});
  $('jrTrad').addEventListener('change',drawJourney);
  $('jrAuto').addEventListener('click',function(){
    var tr=$('jrTrad').value;
    TRAD[tr].forEach(function(r,i){var opts=P.filter(function(p){return p.city===state.city&&costOf(p,r[2])!=null}).sort(function(a,b){return costOf(a,r[2])-costOf(b,r[2])});if(opts.length)JR.pick[jrKey(i)]=String(opts[Math.floor((opts.length-1)/2)].id)});
    drawJourney();toast('We picked a mid-priced artist for each step. Change any of them.');
  });
  $('jrCopy').addEventListener('click',function(){
    var tr=$('jrTrad').value,lines=['My SINGAAR plan ('+state.city+', sample prices)'];
    TRAD[tr].forEach(function(r,i){var v=JR.pick[jrKey(i)],p=v&&byId(parseInt(v,10));lines.push((i+1)+'. '+r[0]+': '+(p?p.name+' '+inr(costOf(p,r[2])):'not chosen yet'))});
    lines.push('Total: '+$('jrTotal').textContent);
    var txt=lines.join('\n');
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){toast('Plan copied. Paste it into your family WhatsApp group.')},function(){toast('Could not copy. Select the plan and copy it yourself.')});else toast('Copy is not available in this browser.');
  });

  /* ---------- earnings calculator ---------- */
  function calc(){
    var b=parseFloat($('cB').value)||0,pr=parseFloat($('cP').value)||0,g=b*pr,f=g*0.10+299;
    $('cG').textContent=inr(Math.round(g));$('cF').textContent=inr(Math.round(f));$('cK').textContent=inr(Math.max(0,Math.round(g-f)));
  }
  ['cB','cP'].forEach(function(i){$(i).addEventListener('input',calc)});calc();

  /* ---------- share and info ---------- */
  var INFO={
    privacy:['Privacy','<p>SINGAAR is a prototype. It has <b>no server and no database</b>. Everything you type (your name on a booking request, a profile you list, saved artists) stays in <b>this browser on this device</b> and is never sent to us or anyone else.</p><p>You can erase it any time: use the button below, or clear this site\'s data in your browser settings.</p><p>If you list yourself, the optional WhatsApp number and Instagram handle are saved in this browser only, and are used only to build the chat and profile links when someone clicks them. The WhatsApp and Instagram buttons open those apps in a new tab, and they then follow those services\' own privacy rules. Please do not type anyone else\'s number, addresses or other private details into the prototype. When SINGAAR launches for real, we will ask for what is needed to confirm a booking and tell you clearly how it is used and protected.</p><button class="btn ghost dark small" type="button" id="wipeData">Erase my data on this device</button>'],
    terms:['Terms of use (prototype)','<p>This is a prototype built for the Mesa ForgeX hackathon. <b>No real bookings are made, no payments are taken, and no messages are sent to artists.</b> The advance payment screen is a demo: no money moves and no payment details are collected.</p><p>The artists, salons, prices, reviews and availability shown are <b>sample data</b> created for the demo. They are not real businesses unless a profile is marked otherwise. Prices are examples, not offers.</p><p>Calendar files, plans and share links you create are for your own use.</p>'],
    about:['About SINGAAR','<p><b>Beauty meets you.</b> SINGAAR (singaar means adornment) is a marketplace for independent women artists and trusted salons, for weddings, parties, hair, skin, nails, mehendi and accessories, starting in Bangalore.</p><p>It was started by Preethi S, inspired by her mother, who has run a beauty parlour for about fifteen years and often loses bookings because her customers cannot easily compare her with bigger names.</p><p>The goal: women who create looks get a place to be found, compared and booked at a fair price, rooted in Indian rituals and Indian beauty.</p><p class="note">This is a prototype. The quality checks described on the page are standards we are building, not a working verification system yet.</p>']
  };
  function showInfo(k){
    var i=INFO[k];if(!i)return;
    $('infoSheet').innerHTML='<button class="x" type="button" data-close aria-label="Close">×</button><div class="phead"><div><h2 id="infoTitle">'+i[0]+'</h2></div></div><div class="pbody infotext">'+i[1]+'</div>';
    openModal('infoModal');
    var w=$('wipeData');if(w)w.onclick=function(){try{localStorage.removeItem('singaar.v3');localStorage.removeItem(STORE)}catch(e){}toast('Your data on this device has been erased.');setTimeout(function(){location.reload()},900)};
  }
  document.addEventListener('click',function(e){
    var x;
    if((x=e.target.closest('[data-info]'))){e.preventDefault();showInfo(x.getAttribute('data-info'));return}
    if((x=e.target.closest('[data-save]'))){var id=parseInt(x.getAttribute('data-save'),10),i=Store.d.saved.indexOf(id);if(i>-1)Store.d.saved.splice(i,1);else{Store.d.saved.push(id);toast('Saved. Find it under My SINGAAR.')}Store.save();render();if(window.SGPortal&&SGPortal.refresh)SGPortal.refresh();return}
  });
  $('jrWa').addEventListener('click',function(){
    var tr=$('jrTrad').value,lines=['My SINGAAR plan ('+state.city+', sample prices)'];
    TRAD[tr].forEach(function(r,i){var v=JR.pick[jrKey(i)],p=v&&byId(parseInt(v,10));lines.push((i+1)+'. '+r[0]+': '+(p?p.name+' '+inr(costOf(p,r[2])):'not chosen yet'))});
    lines.push('Total: '+$('jrTotal').textContent);
    window.open('https://wa.me/?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
  });

  /* scrolling gallery of looks (duplicated so the loop is seamless) */
  (function(){
    var t=$('moodTrack');if(!t)return;
    var one=MOOD.map(function(m){return '<figure class="moodcard"><img src="'+ph(m[0])+'" style="'+fpos(m[0])+'" alt="Illustrative photo: '+esc(m[1].toLowerCase())+'" loading="lazy" decoding="async"><figcaption>'+esc(m[1])+'</figcaption></figure>'}).join('');
    t.innerHTML=one+one.replace(/<img /g,'<img aria-hidden="true" ').replace(/alt="[^"]*"/g,'alt=""');
  })();
  window.SG={tkAuto:tkAuto,createBooking:createBooking,cmpBar:cmpBar,compare:compare,offers:offers,stats:stats,onRender:function(f){hooks.push(f)},waLink:waLink,igLink:igLink,ph:ph,cover:cover,P:P,state:state,Store:Store,SV:SV,CATS:CATS,TYPE:TYPE,AREA:AREA,inr:inr,esc:esc,short:short,toast:toast,byId:byId,render:render,fire:fire,openModal:openModal,openModalOnly:openModalOnly,closeModals:closeModals,busyOn:busyOn,setBookingStatus:setBookingStatus,fmtDate:fmtDate,downloadIcs:downloadIcs,burst:burst,updateBadge:updateBadge,art:art,initials:initials,profile:profile,reviewsHtml:reviewsHtml,
    startTracking:function(b){var p=byId(b.pid);if(!p)return;TK.force=p.id;closeModals();state.city=p.city;state.date=b.date;$('date').value=b.date;state.boost={};render();TK.svc=b.svc;$('tkScn').value=(b.svc==='bridal')?'wedding':'quick';$('tkTime').value=(b.svc==='bridal')?SCN.wedding.def:nowPlus(45);tkOptions();if([].some.call($('tkArtist').options,function(o){return o.value===String(p.id)}))$('tkArtist').value=String(p.id);tkReset();$('tracker').scrollIntoView({behavior:'smooth'})}};

  hooks.push(function(){drawLive();drawJourney();if(!TK.timer)tkReset()});
  render();cmpBar();updateBadge();
  Store.d.bookings.forEach(scheduleAuto);
})();
