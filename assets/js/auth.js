/* SINGAAR sign-in, shared by the customer app, SINGAAR Partner (/partner) and the admin page (/admin).
   Real accounts through Supabase Auth: Google, or a 6-digit code sent by email.
   Phone OTP is shown as "coming soon" until SMS (DLT registration) is ready.
   Real mode is on only when assets/js/config.js has the project URL and public key, and never on /demo. */
(function(){
  var C=window.SINGAAR_CONFIG||{};
  var on=!!(C.supabaseUrl&&C.supabaseKey&&window.supabase&&window.SINGAAR_MODE!=='demo');
  window.SINGAAR_REAL=on;
  var db=on?window.supabase.createClient(C.supabaseUrl,C.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'singaar.auth.v2'}}):null;
  var user=null,known=!on,subs=[];
  function emit(){subs.slice().forEach(function(f){try{f(user)}catch(e){if(window.console)console.error(e)}})}
  if(db){
    db.auth.onAuthStateChange(function(ev,s){var u=s?s.user:null;if(!known||(u&&u.id)!==(user&&user.id)){user=u;known=true;emit()}});
    db.auth.getSession().then(function(r){var u=r.data&&r.data.session?r.data.session.user:null;if(!known||(u&&u.id)!==(user&&user.id)){user=u;known=true;emit()}});
  }
  function onChange(f){subs.push(f);if(known)f(user)}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function friendly(err){
    var m=(err&&err.message)||'';
    if(/rate|too many|security purposes/i.test(m))return 'Too many tries. Please wait a minute and try again.';
    if(/expired|invalid/i.test(m))return 'That code is wrong or has expired. Check it, or send a new one.';
    if(/provider is not enabled|Unsupported provider/i.test(m))return 'This sign-in option is not switched on yet.';
    if(/network|fetch/i.test(m))return 'No connection. Check your internet and try again.';
    return 'Something went wrong. Please try again.';
  }
  var G='<svg viewBox="0 0 48 48" aria-hidden="true" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';

  /* Draws the sign-in box into el. opts: {title, subtitle, back} */
  function mount(el,opts){
    opts=opts||{};
    if(!db){el.innerHTML='<div class="authbox"><h2>'+esc(opts.title||'Sign in')+'</h2><p class="authsub">Accounts are being switched on. Please try again soon.</p></div>';return}
    el.innerHTML='<div class="authbox">'
      +'<h2>'+esc(opts.title||'Welcome')+'</h2>'+(opts.subtitle?'<p class="authsub">'+esc(opts.subtitle)+'</p>':'')
      +'<button type="button" class="authbtn google" data-a="google">'+G+'<span>Continue with Google</span></button>'
      +'<div class="author"><span>or use your email</span></div>'
      +'<form class="authform" data-a="email" novalidate><label for="aEmail">Email</label><input id="aEmail" type="email" inputmode="email" autocomplete="email" maxlength="120" placeholder="you@example.com" required><button class="authbtn main" type="submit">Send me a code</button></form>'
      +'<form class="authform" data-a="code" novalidate hidden><label for="aCode">Enter the code we emailed to <b class="aWho"></b></label><input id="aCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="6-digit code" required><button class="authbtn main" type="submit">Verify and continue</button><button type="button" class="authlink" data-a="back">Use a different email</button></form>'
      +'<button type="button" class="authbtn phone" disabled aria-disabled="true"><span>Phone number (OTP)</span><small>Coming soon</small></button>'
      +'<p class="autherr" role="alert" aria-live="polite"></p>'
      +'<p class="authnote">By continuing you agree to SINGAAR\'s terms. We never sell your data.</p></div>';
    var err=el.querySelector('.autherr'),fE=el.querySelector('[data-a="email"]'),fC=el.querySelector('[data-a="code"]'),email='';
    function say(t){err.textContent=t||''}
    function busy(b,on2,label){b.disabled=on2;if(label)b.textContent=label}
    el.querySelector('[data-a="google"]').addEventListener('click',function(){
      say('');var to=location.origin+location.pathname;
      db.auth.signInWithOAuth({provider:'google',options:{redirectTo:to}}).then(function(r){if(r.error)say(friendly(r.error))});
    });
    fE.addEventListener('submit',function(e){
      e.preventDefault();say('');var v=fE.querySelector('input').value.trim().toLowerCase();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){say('Enter a valid email address.');return}
      var b=fE.querySelector('button');busy(b,true,'Sending…');
      db.auth.signInWithOtp({email:v,options:{shouldCreateUser:true}}).then(function(r){
        busy(b,false,'Send me a code');
        if(r.error){say(friendly(r.error));return}
        email=v;fE.hidden=true;fC.hidden=false;fC.querySelector('.aWho').textContent=v;fC.querySelector('input').focus();
      });
    });
    fC.addEventListener('submit',function(e){
      e.preventDefault();say('');var t=fC.querySelector('input').value.replace(/\D/g,'');
      if(t.length<6){say('Enter the code from the email.');return}
      var b=fC.querySelector('button[type=submit]');busy(b,true,'Checking…');
      db.auth.verifyOtp({email:email,token:t,type:'email'}).then(function(r){busy(b,false,'Verify and continue');if(r.error)say(friendly(r.error))});
    });
    fC.querySelector('[data-a="back"]').addEventListener('click',function(){fC.hidden=true;fE.hidden=false;say('')});
  }
  window.SGAuth={on:on,db:db,user:function(){return user},known:function(){return known},onChange:onChange,mount:mount,esc:esc,friendly:friendly,
    signOut:function(){return db?db.auth.signOut():Promise.resolve()}};
})();
