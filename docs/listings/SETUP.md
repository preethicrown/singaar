# Artist listings: 10-minute setup

How it works:
- You send artists **singaar.vercel.app/join**.
- She fills in her details, services with starting prices, at least 2 work photos, and her WhatsApp or Instagram.
- She appears in the **SINGAAR app** right away, marked **Listed**, with WhatsApp and Instagram buttons.

Everything is saved in a **Google Sheet that you own**, and photos go to **your Google Drive**. You get an email for every new artist.

---

## Step 1. Make the Google Sheet (2 minutes)
1. Use a **personal Gmail** account (not the Mesa school account, which may block public photo sharing).
2. Go to **sheets.google.com** → **Blank spreadsheet** → name it **SINGAAR Listings**.

## Step 2. Paste the script (3 minutes)
1. In the sheet: **Extensions → Apps Script**.
2. Delete everything in the code box.
3. Open `docs/listings/singaar-listings.gs` from the project, copy **all** of it, and paste it in.
4. Press the **Save** icon (💾).

## Step 3. Run setup once (2 minutes)
1. At the top, next to "Debug", choose the function **setup** → press **Run**.
2. Google asks for permission → **Review permissions** → pick your account.
3. If you see "Google hasn't verified this app": click **Advanced → Go to (unsafe)**. That's normal for your own script.
4. Press **Allow**.
5. Go back to the sheet: a **Listings** tab with headings appears. A Drive folder "SINGAAR listing photos" is also created.

## Step 4. Publish it (2 minutes)
1. In Apps Script: **Deploy → New deployment**.
2. Click the gear ⚙ → **Web app**.
3. **Execute as: Me** · **Who has access: Anyone**.
4. **Deploy** → copy the **Web app URL** (it ends with `/exec`).
5. Send that URL to Claude. It goes into `assets/js/config.js` (`listingsApi`), and the site goes live.

---

## Every day
- **Send artists the link:** `singaar.vercel.app/join`.
- **New artist:** you get an email with her page link.
- **Hide someone** (spam, wrong photos, she asked): in the sheet, change her **status** from `live` to `hidden`. She disappears within a minute.
- **Fix a typo for her:** edit the cell in the sheet.

## Good to know
- It's free (Google's normal limits are far above what a pilot needs).
- If you ever change the script: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.
- Artists are told that listing is free in the pilot, that no documents are needed, and that they can ask to change or remove their page anytime.
