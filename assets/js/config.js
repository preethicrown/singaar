/* Live database settings for SINGAAR (Supabase).
   Both values are public by design: every Supabase website ships them to the browser,
   and the database rules (docs/supabase-setup.sql) decide what each phone may read or change.
   Never put the service_role key, a secret key or the database password in this file.
   Leave them empty to run the site in demo mode only. */
window.SINGAAR_CONFIG={
  supabaseUrl:'https://ffkvszkoyejaphkesnir.supabase.co',
  supabaseKey:'sb_publishable_9vFGh_YcXZQHvZdH57BW8A_0QFfCoBY',
  /* false = customers still see the demo artists (safe for pitches); true = customers see only real, approved artists */
  customerReal:true
};
