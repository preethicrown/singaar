# SINGAAR

**Beauty meets you.**

SINGAAR (*singaar* means adornment) is a marketplace where independent women artists and trusted salons list their services and prices, and customers browse, compare and book. Weddings, parties, hair, skin, nails, mehendi and accessories, starting in **Bangalore**, with Chennai next.

Built for the Mesa School of Business ForgeX hackathon by Preethi S.

## Why this exists

My mother has run a beauty parlour for about 15 years. Her customers only phone her, and she loses bridal bookings to big parlours because a lower price looks like lower quality. Brides say they cannot judge what a fair price is. Small salons and independent women artists have no simple way to be found, compared and booked, and get no platform to grow.

SINGAAR is about women's work and women's income, rooted in Indian rituals and Indian beauty. It is not an at-home-service company like Urban Company or YesMadam, and not only a wedding directory. It is a marketplace: it connects customers with independent artists and salons and holds no inventory.

Research: [`docs/research`](docs/research). Scope: [`docs/scope`](docs/scope). Brand: [`docs/brand`](docs/brand).

## How the app is organised

SINGAAR works like a phone app, with two clear spaces. A switch at the top ("Find an artist" / "I am an artist") moves between them, and each has its own few tabs. On a phone the tabs sit at the bottom.

**Customer space** (brides, bridesmaids, family, friends)

| Tab | What is there |
|---|---|
| Home | What SINGAAR is, three steps, "Find my look" |
| Explore | Search, categories, filters, artist cards and profiles, live map |
| Plan | Countdown, Rituals, Family (bridal party planner) and Live arrival |
| Bookings | Your requests, advance payment, reviews, saved artists |

**Artist space**

| Tab | What is there |
|---|---|
| Requests | Accept or decline booking requests, chat on WhatsApp |
| Calendar | Block and open dates |
| Prices | Set your services and prices |
| Earnings | What you earned and keep, advances received |
| Profile | Start-earning guide and "List yourself" |

**Install it on your phone:** open the live link in Chrome and choose "Add to Home Screen" (or "Install app"). It opens full-screen like a native app with the SINGAAR crown icon.

## Prototype

No build step: open [`index.html`](index.html) in a browser, or run `npx serve .` and open the address it shows.

- **Explore**: 7 categories (bridal and wedding, party, hair, skin and pre-bridal, nails, mehendi, accessories), filter by service, budget and date, sort by price
- **Price guide**: each service shows the city's price range and where each listing sits in it
- **Compare**: up to 3 artists side by side, with full profiles and a date check
- **Describe your look**: type what you want in your own words and get matches (rule-based demo; the product version uses AI)
- **Live map**: every artist as a price pin on a city map, green if free on your date
- **Live arrival**: Zomato-style tracker for the wedding morning or a party evening, with the artist travelling to you and a countdown to the event (simulated)
- **Plan an occasion**: Hindu, Muslim (nikah), Christian weddings or a party night; pick an artist per step, see the total, copy it to share with family
- **My SINGAAR (customer portal)**: send a booking request from any profile, track its status, add confirmed bookings to your calendar (.ics), track your artist's arrival, mark a service done and leave a review, save favourite artists
- **Artist dashboard**: inbox to accept or decline requests, a calendar where you block dates, edit your services and prices, see earnings and the example fee. Customers and artists share one booking, so an accepted date shows as booked in search straight away. Switch between the two sides in the portal to see the whole flow (demo mode; sample artists can reply automatically)
- **Bridal party planner**: add the bride, her mother, sisters and friends with the look each needs, and see which artists can cover the most people, with the group total and who is free on your date
- **Family shortlist**: save artists, then send the shortlist to the family WhatsApp group with "reply with the number you like", or compare up to three side by side
- **Languages (beta)**: switch the main page headings and menus to हिन्दी, தமிழ் or ಕನ್ನಡ. Artist details stay in English for now; translations need review by native speakers before launch
- **Find my look**: a four-tap quiz with photo choices (occasion, mood, where, price feel) that ranks artists and explains each match ("her style: HD, she comes to you, free on your date"), then applies them to the results
- **Wedding countdown**: enter a wedding date and see the timeline of when to book, trial and prepare (12 weeks to the day), what is due now, and download calendar reminders
- **Smart filters**: area, comes-to-me or at-the-salon, style, type (artist, salon, studio) and "free on my date only"
- **WhatsApp**: "Chat on WhatsApp" on every profile and booking, with a ready-written message; after a request is sent you can nudge the artist on WhatsApp. Artists who list themselves add their own number for a direct chat. Sample artists have no real number, so their button opens a message with no recipient
- **Instagram**: artists who list themselves get a "View on Instagram" link built from their handle (checked for a valid format). Sample handles are shown but never linked, so no real stranger is linked
- **Advance payment (demo)**: once an artist confirms, the customer can pay a small advance to lock the date (20% of the price, at least ₹500), see the balance due after the service, and get a refund note if cancelled. The artist sees "advance received". Demo only: no money moves and no payment details are collected
- **Muhurtham Clock**: set your event time and the whole morning's schedule works backwards, including when the artist must arrive
- **Magic touches**: gold and kumkum celebration on confirmation, WhatsApp share for your plan, installable on a phone (web app manifest)
- **For artists**: list yourself (saved in your browser) and an earnings calculator
- **The SINGAAR promise**: the quality standards every listing will be held to

Sample or not built yet, on purpose:

- All 16 starting profiles and their prices are **sample data**, labelled as such in the page
- No server, accounts, payments or real messaging yet; booking requests and live tracking are demos
- The quality promise (portfolio checks, trial looks, reviews from completed bookings) is a standard we are building, not yet a working verification system

## Photography

The site uses 36 free-licence stock photos from Pexels (bridal, party, hair, skin, nails, mehendi, jewellery), in `assets/photos/`, with credits in [`assets/photos/CREDITS.md`](assets/photos/CREDITS.md). They appear on listing cards, a scrolling gallery of looks, category tiles, artist profiles (with a full-screen viewer) and the ritual plan.

**They are illustrative only.** They are not the sample artists, and the page says so wherever they appear. Pexels does not allow implying that an identifiable person endorses a service, so before launch every photo must be replaced with real work from artists who have agreed to be listed.

## Built carefully for a live site

- No server and no tracking: everything a visitor types stays in their own browser, with an "Erase my data" button in Privacy
- Content Security Policy blocks inline scripts and outside connections; all user text is escaped before display
- Keyboard accessible: skip link, focus kept inside dialogs, labelled controls, reduced-motion respected
- Works on phones (checked at 375 px wide, no sideways scroll); custom 404 page
- Clear Privacy, Terms and About pages that say plainly this is a prototype with sample data

## Known limits (honest list)

- Real payments need a Razorpay account (KYC) and a server to create and verify orders; automatic WhatsApp messages need Meta WhatsApp Business API approval; pulling Instagram photos needs a Meta app review. The links and demo screens here are the front end those will plug into
- Accounts, real bookings, payments, messaging and tracking need a backend; today the two portals run in one browser to demonstrate the flow
- Sample profiles, prices, reviews and availability are invented for the demo and labelled as such
- Add a real contact email and a social preview image URL once the live address is known

## Project layout

```
index.html              page
assets/css/site.css     design system (velvet and gold)
assets/css/portal.css   portals, bookings, calendar
assets/js/app.js        browse, compare, map, tracker, plan, bookings, store
assets/js/portal.js     customer portal and artist dashboard
assets/js/extras.js     Find my look quiz, wedding countdown, bridal party planner
assets/js/i18n.js       language switcher (Hindi, Tamil, Kannada beta)
assets/js/shell.js      app shell: customer and artist spaces, tab bar, routing, installable app
assets/css/app.css      app shell, tab bar, simple home
sw.js, manifest.webmanifest   make it installable as a phone app
assets/css/extras.css   filters, quiz, countdown
assets/logo.webp        brand logo
docs/                   research, scope, brand
```

## Roadmap

1. Real backend and accounts for artists and customers
2. Booking requests over WhatsApp and phone call (many customers call, not app-chat)
3. Pull portfolios from Instagram
4. Real live tracking for home visits
5. AI: understand a described look, suggest fair price ranges, draft replies
6. Business model to test with artists: a small fee only on completed bookings

## Brand

Logo and palette are in [`docs/brand`](docs/brand). Colours: crimson velvet, antique gold, kumkum red. Fonts: Cinzel (wordmark), Cormorant Garamond (headings), Jost (body).

## Status

Prototype stage. See [PROGRESS.md](PROGRESS.md).
