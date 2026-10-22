/* SINGAAR admin: the team reviews new partners (profile, work photos, ID document, UPI) and approves or rejects them.
   Only accounts listed in the admins table can see anything here; the database enforces it. */
(function(){
  var A=window.SGAuth,$=function(i){return document.getElementById(i)},esc=A?A.esc:String,db=A&&A.db,me=null,filter='pending',list=[];
  var SV={bridal:'Bridal makeup',engagement:'Engagement',reception:'Reception',saree:'Saree draping',bridesmaid:'Bridesmaid',party:'Party makeup',guest:'Wedding guest',hair:'Hair styling',blowdry:'Blow-dry',hairspa:'Hair spa',facial:'Glow facial',prebridal:'Pre-bridal',nails:'Nails',mehendi:'Mehendi',accessory:'Accessory styling'};
  function inr(n){return '₹'+Math.round(n||0).toLocaleString('en-IN')}
  var tt;function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},4000)}
  function view(h){$('app').innerHTML=h}
  if(!A||!A.on){view('<div class="pcard center"><h1>SINGAAR Admin</h1><p>The database is not connected yet.</p></div>');return}
  $('signOut').addEventListener('click',function(){A.signOut().then(function(){location.reload()})});
  A.onChange(function(u){
    me=u;$('signOut').hidden=!u;
    if(!u){view('<div class="pcard" id="login"></div>');A.mount($('login'),{title:'SINGAAR team sign in'});return}
    db.from('admins').select('user_id').eq('user_id',u.id).maybeSingle().then(function(r){
      if(!r.data){view('<div class="pcard"><h2>Not an admin yet</h2><p class="psub">You are signed in as <b>'+esc(u.email||'')+'</b>. To make this account the SINGAAR admin, run this once in Supabase (SQL Editor):</p><pre style="white-space:pre-wrap;background:#F6EBDD;padding:12px;border-radius:10px;font-size:13px">insert into public.admins (user_id) values (\''+esc(u.id)+'\') on conflict do nothing;</pre><p class="pnote">Then reload this page.</p></div>');return}
      load();
    });
  });
  function load(){
    db.from('artists').select('*, artist_private(*)').order('submitted_at',{ascending:false,nullsFirst:false}).then(function(r){
      if(r.error){toast('Could not load partners.');return}list=r.data||[];draw();
    });
  }
  function draw(){
    var counts={pending:0,approved:0,rejected:0,draft:0};list.forEach(function(a){counts[a.status]=(counts[a.status]||0)+1});
    var l=list.filter(function(a){return a.status===filter});
    var h='<h1 class="phi">Partners</h1><div class="admtabs">'+[['pending','To review'],['approved','Approved'],['rejected','Rejected'],['draft','Not finished']].map(function(t){return '<button type="button" class="pbtn ghost sm" data-f="'+t[0]+'" aria-pressed="'+(filter===t[0])+'">'+t[1]+' ('+(counts[t[0]]||0)+')</button>'}).join('')+'</div><div class="adm">';
    h+=l.length?l.map(function(a){
      var p=(a.artist_private&&a.artist_private[0])||a.artist_private||{},sv=a.services||{};
      return '<article class="pbk"><div class="pbkh"><div><h3>'+esc(a.name)+'</h3><p>'+esc(a.type)+' · '+esc(a.area)+', '+esc(a.city)+' · '+(a.travel?'goes to customers':'at the salon')+'</p></div></div>'
        +'<div class="admphotos">'+(a.photos||[]).map(function(u){return '<a href="'+esc(u)+'" target="_blank" rel="noopener"><img src="'+esc(u)+'" alt="Work photo"></a>'}).join('')+'</div>'
        +'<p class="pmeta">'+Object.keys(sv).map(function(k){return esc(SV[k]||k)+' '+inr(sv[k])}).join(' · ')+'</p>'
        +'<p class="pmeta">'+(a.bio?esc(a.bio)+'<br>':'')+'WhatsApp: '+(a.wa?'+'+esc(a.wa):'—')+' · Instagram: '+esc(a.handle||'—')+' · Days: '+esc((a.days||[]).join(', ')||'—')+'</p>'
        +'<p class="pmeta">ID: '+(p.id_doc?esc(p.id_type||'')+' <button type="button" class="pbtn ghost sm" data-doc="'+esc(p.id_doc)+'">View ID</button>':'<b class="pwarn">not uploaded</b>')+' · UPI: '+esc(p.upi||'—')+'</p>'
        +(a.status!=='approved'?'<div class="pact"><button class="pbtn" data-ok="'+a.id+'">Approve</button><button class="pbtn ghost" data-no="'+a.id+'">Ask for changes</button></div>':'<div class="pact"><button class="pbtn ghost" data-no="'+a.id+'">Pause listing</button></div>')
        +(a.review_note?'<p class="pnote">Last note: '+esc(a.review_note)+'</p>':'')+'</article>';
    }).join(''):'<div class="pempty">Nothing here.</div>';
    view(h+'</div>');
  }
  $('app').addEventListener('click',function(e){
    var x;
    if((x=e.target.closest('[data-f]'))){filter=x.getAttribute('data-f');draw();return}
    if((x=e.target.closest('[data-doc]'))){db.storage.from('ids').createSignedUrl(x.getAttribute('data-doc'),120).then(function(r){if(r.error){toast('Could not open the ID.');return}window.open(r.data.signedUrl,'_blank','noopener')});return}
    if((x=e.target.closest('[data-ok]'))){set(x.getAttribute('data-ok'),'approved',null);return}
    if((x=e.target.closest('[data-no]'))){var note=prompt('What should she change? (She will see this message.)','Please add clearer photos of your own work.');if(note===null)return;set(x.getAttribute('data-no'),'rejected',note.slice(0,300));return}
  });
  function set(id,status,note){
    db.from('artists').update({status:status,review_note:note}).eq('id',id).select().single().then(function(r){
      if(r.error){toast('Could not update.');return}
      var i=list.findIndex(function(a){return a.id===id});if(i>-1){r.data.artist_private=list[i].artist_private;list[i]=r.data}
      toast(status==='approved'?'Approved. She is now live for customers.':'Sent back with your note.');draw();
    });
  }
})();
