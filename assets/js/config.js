/* Live database settings for SINGAAR (Supabase).
   Both values are public by design: every Supabase website ships them to the browser,
   and the database rules (docs/supabase-setup.sql) decide what each phone may read or change.
   Never put the service_role key, a secret key or the database password in this file.
   Leave them empty to run the site in demo mode only. */
window.SINGAAR_CONFIG={
  supabaseUrl:'',
  supabaseKey:''
};
