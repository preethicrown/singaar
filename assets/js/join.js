/* SINGAAR pilot: artist self-listing form (/join).
   Uses the app's own lists (app/data.js: services, artist types, areas) so every listing fits the app exactly.
   Sends the details to the Google Apps Script in config.listingsApi; the artist shows in the app right away. */
(function(){
  var API=(window.SINGAAR_CONFIG||{}).listingsApi||'',D=window.SGD;
  var $=function(i){return document.getElementById(i)},f=$('f');
  var AREAS=Object.keys(D.AREAS.Bangalore);
  var FIRST=['Hulimavu','Arekere','Bannerghatta Road','Gottigere','Begur','Akshayanagar','Bilekahalli','Kalena Agrahara','Hongasandra','Bommanahalli','JP Nagar','BTM Layout'];
  AREAS=FIRST.filter(function(a){return AREAS.indexOf(a)>-1}).concat(AREAS.filter(function(a){return FIRST.indexOf(a)<0}).sort());
  var photos=[];
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function tidy(s){s=String(s||'').replace(/\s+/g,' ').trim();return s&&s===s.toLowerCase()?s.replace(/(^|\s)(\S)/g,function(m,a,b){return a+b.toUpperCase()}):s}
  function radios(id,name,opts){$(id).innerHTML=opts.map(function(o){return '<label><input type="radio" name="'+name+'" value="'+esc(o[0])+'"> '+esc(o[1])+'</label>'}).join('')}

  radios('type','type',[['artist','Independent artist'],['salon','Salon or parlour'],['studio','Studio']]);
  radios('travel','travel',[['home',"I go to the customer's home"],['salon','Customers come to me'],['both','Both']]);
  $('area').innerHTML='<option value="">Choose your area</option>'+AREAS.map(function(a){return '<option>'+esc(a)+'</option>'}).join('');
  $('svcs').innerHTML=Object.keys(D.SV).map(function(k){
    return '<div class="lsvc lsvc2"><label class="lcheck" style="align-items:center"><input type="checkbox" class="sk" value="'+k+'"> '+esc(D.SV[k].n)+'</label>'
      +'<div class="lprice"><span>₹</span><input class="sp" data-k="'+k+'" type="number" inputmode="numeric" min="100" max="500000" placeholder="From" aria-label="Starting price for '+esc(D.SV[k].n)+'" disabled></div></div>';
  }).join('');
  $('svcs').addEventListener('change',function(e){
    if(!e.target.classList.contains('sk'))return;
    var p=$('svcs').querySelector('.sp[data-k="'+e.target.value+'"]');p.disabled=!e.target.checked;if(e.target.checked)p.focus();else p.value='';
  });

  function shrink(file){
    return new Promise(function(res){
      var img=new Image(),url=URL.createObjectURL(file);
      img.onload=function(){
        var m=1280,w=img.naturalWidth,h=img.naturalHeight,k=Math.min(1,m/Math.max(w,h));
        if(w<300||h<300){URL.revokeObjectURL(url);return res('small')}
        var c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg',0.8));
      };
      img.onerror=function(){URL.revokeObjectURL(url);res(null)};
      img.src=url;
    });
  }
  function drawThumbs(){
    $('thumbs').innerHTML=photos.map(function(p,i){return '<figure><img src="'+p+'" alt="Your photo '+(i+1)+'"><button type="button" data-rm="'+i+'" aria-label="Remove photo">×</button></figure>'}).join('');
    $('pick').hidden=photos.length>=6;
  }
  $('thumbs').addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(b){photos.splice(+b.getAttribute('data-rm'),1);drawThumbs()}});
  $('files').addEventListener('change',function(e){
    var list=[].slice.call(e.target.files||[]).filter(function(x){return /^image\//.test(x.type)}).slice(0,6-photos.length);
    e.target.value='';
    Promise.all(list.map(shrink)).then(function(r){
      if(r.indexOf('small')>-1)fail('Some photos were too small or blurry and were skipped. Please use clear photos.');
      photos=photos.concat(r.filter(function(x){return x&&x!=='small'})).slice(0,6);drawThumbs();
    });
  });

  function fail(m){var e=$('err');e.textContent=m;e.hidden=false;e.scrollIntoView({block:'center',behavior:'smooth'})}
  if(!API){$('closed').hidden=false;$('go').disabled=true}

  f.addEventListener('submit',function(e){
    e.preventDefault();$('err').hidden=true;
    var fd=new FormData(f),get=function(k){return String(fd.get(k)||'').replace(/\s+/g,' ').trim()};
    var pk={},bad='';
    [].slice.call($('svcs').querySelectorAll('.sk:checked')).forEach(function(c){
      var v=Math.round(Number($('svcs').querySelector('.sp[data-k="'+c.value+'"]').value));
      if(!(v>=100&&v<=500000))bad=D.SV[c.value].n;else pk[c.value]=v;
    });
    var wa=get('whatsapp').replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,'').replace(/^0(?=\d{10}$)/,'');
    var ig=get('instagram').replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/[/?].*$/,'');
    var body={
      business:tidy(get('business')),founder:tidy(get('founder')),type:get('type'),area:get('area'),travel:get('travel'),story:get('story'),
      pk:pk,instagram:ig,website:get('website'),facebook:get('facebook'),whatsapp:wa,show_whatsapp:!!fd.get('show_whatsapp'),
      consent:!!fd.get('consent'),company_site:get('company_site'),photos:photos
    };
    if(body.business.length<2)return fail('Please add your business or studio name.');
    if(body.founder.length<2)return fail('Please add your name.');
    if(!body.type)return fail('Please choose: independent artist, salon or studio.');
    if(!body.area)return fail('Please choose your area.');
    if(!body.travel)return fail('Please choose where you work.');
    if(bad)return fail('Please write a starting price for "'+bad+'" (₹100 or more).');
    if(!Object.keys(pk).length)return fail('Please tick at least one service and write its starting price.');
    if(photos.length<2)return fail('Please add at least 2 photos of your own work.');
    if(!wa&&!ig)return fail('Please add your WhatsApp number or Instagram, so customers can reach you.');
    if(wa&&!/^[6-9]\d{9}$/.test(wa))return fail('Please check your WhatsApp number (10 digits).');
    if(ig&&!/^[A-Za-z0-9._]{1,30}$/.test(ig))return fail('Please check your Instagram username.');
    if(body.website&&!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(body.website))return fail('Website should look like https://yourname.com');
    if(body.facebook&&!/^https?:\/\/(www\.|m\.)?(facebook|fb)\.com\/\S+$/i.test(body.facebook))return fail('Facebook link should look like https://facebook.com/yourpage');
    if(!body.consent)return fail('Please tick the box to agree to be listed.');
    var go=$('go');go.disabled=true;go.textContent='Uploading your photos…';
    fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)})
      .then(function(r){return r.json()})
      .then(function(j){
        if(!j||!j.ok){go.disabled=false;go.textContent='List me on SINGAAR';return fail((j&&j.message)||'Something went wrong. Please try again.')}
        var link=location.origin+'/app/#/artist/l-'+encodeURIComponent(j.id);
        var share='https://wa.me/?text='+encodeURIComponent('I am now on SINGAAR! See my work and services: '+link);
        f.hidden=true;var d=$('done');d.hidden=false;
        d.innerHTML='<div class="big">🎉</div><h1>'+(j.existed?'You are already on SINGAAR!':'You are listed on SINGAAR!')+'</h1>'
          +'<p class="psub">'+(j.existed?'We found your page from before. To change something, message the SINGAAR team.':'Your page is live in the SINGAAR app now. Share it with your customers and on your Instagram.')+'</p>'
          +'<div class="lrow"><a class="pbtn" href="'+esc(link)+'">See my page</a><a class="pbtn lwa" href="'+esc(share)+'" target="_blank" rel="noopener">Share on WhatsApp</a></div>'
          +'<button type="button" class="pbtn ghost sm" id="copy">Copy my link</button>';
        $('copy').addEventListener('click',function(){(navigator.clipboard?navigator.clipboard.writeText(link):Promise.reject()).then(function(){$('copy').textContent='Copied ✓'},function(){prompt('Copy your link:',link)})});
        window.scrollTo(0,0);
      })
      .catch(function(){go.disabled=false;go.textContent='List me on SINGAAR';fail('Could not connect. Please check your internet and try again.')});
  });
})();
