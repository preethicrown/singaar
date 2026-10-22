# Switching SINGAAR to real accounts

Everything stays on the same links Mesa has: **singaar.vercel.app** and **preethicrown.github.io/singaar**.

| Who | Where |
|---|---|
| Customers | singaar.vercel.app |
| Artists and salons (SINGAAR Partner) | singaar.vercel.app/partner |
| You, approving artists (Admin) | singaar.vercel.app/admin |
| Pitch demo with sample artists | singaar.vercel.app/demo |

Until step 5 is done, the main site keeps working exactly as today (sample artists, no accounts).

## 1. Database (Supabase, free)
1. supabase.com → New project → name `singaar`, region **Mumbai**, generate a database password and keep it yourself.
2. **SQL Editor → New query** → paste all of `docs/supabase-setup.sql` → **Run**.

## 2. Website addresses Supabase may send people back to
**Authentication → URL Configuration**
- Site URL: `https://singaar.vercel.app`
- Redirect URLs: add `https://singaar.vercel.app/**` and `https://preethicrown.github.io/singaar/**`

## 3. Email code sign-in
**Authentication → Emails → Magic Link** template: make sure the email shows the code, for example:
`Your SINGAAR code is {{ .Token }}`
Supabase's built-in email only sends a few emails per hour. For real use, add a free sender (for example Resend) under **Authentication → Emails → SMTP Settings**.

## 4. Google sign-in
1. console.cloud.google.com → create a project → **APIs & Services → OAuth consent screen** (External, app name SINGAAR).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   Authorised redirect URI: the **Callback URL** shown in Supabase under **Authentication → Sign In / Providers → Google**.
3. Paste the Google **Client ID** and **Client secret** into that Supabase Google page and switch it on.
   (The secret goes only into Supabase. Never into the website or chat.)

## 5. Connect the website
Send Claude the **Project URL** and the **anon public / publishable key** (Project Settings → API Keys). They go into `assets/js/config.js`. Never share the service_role key or the database password.

## 6. Make yourself the admin
Open singaar.vercel.app/admin, sign in once. The page shows a one-line SQL command with your account id: run it in the SQL Editor, reload, and new artists appear there for approval.

## 7. Phone OTP (later)
Needs DLT registration (about 1–2 weeks) and an SMS provider (MSG91 or Twilio), then **Authentication → Sign In / Providers → Phone**. The button is already in the app, marked "Coming soon".
