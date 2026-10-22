# SINGAAR: Beauty meets you

**Live product (open on a phone):** https://singaar.vercel.app/
**Code:** https://github.com/preethicrown/singaar
**Built by:** Preethi S, Mesa School of Business ForgeX hackathon
**Status:** working prototype with sample data. Artists, prices, reviews and payments are simulated and labelled as such on the site.

---

## 1. What SINGAAR is

SINGAAR is a marketplace where **independent women artists and small salons** list their services and prices, and customers (brides, bridesmaids, families) find, compare and book them. It covers weddings and the muhurtham, parties, hair, skin, nails, mehendi and accessories. It starts in **Bangalore**, with Chennai next.

It is a **marketplace, not a company with its own staff**: it connects customers with artists and holds no inventory. It is built for women who create looks, and for the people who book them.

Two products in one:
- **Customer app:** discover, compare, book, chat, pay an advance, track the artist arriving.
- **Artist app:** sign in, accept or decline requests, manage the calendar and prices, see earnings.

## 2. The problem

Small salons and independent women artists in Bangalore and Chennai lose bookings and regular customers because they have no simple way to be **found, compared and booked**. Today it happens through Instagram messages, WhatsApp haggling and phone calls. Customers, especially brides, cannot easily judge a fair price, and cannot be sure the artist will turn up on time on the wedding morning.

This came from home. My mother has run a beauty parlour for about fifteen years. Her customers only phone her, and she loses bridal bookings to big parlours.

## 3. Research

**Primary:** conversations and videos with salon owners and artists, and my mother's own experience of how customers book.

**Secondary** (full write-up in the repo, `docs/research`):
- Brides in Chennai and Bangalore say in public forums that they cannot judge fair bridal prices.
- Closest competitors: **WedMeGood** (bridal directory with starting prices) and **Fresha** (salon booking marketplace). **Urban Company** and **YesMadam** are at-home services with an assigned professional, a different model.
- How SINGAAR differs (a hypothesis still to prove): built for **small, independent women artists**, across every kind of look and not only weddings, with a visible price guide and a live arrival tracker.

**Mentor feedback and what we changed because of it:**
- *The home screen was confusing and full of text* → home is now the logo, one search bar and two clear spaces; text-heavy sections became photos and icons.
- *Adoption by artists may be the real problem* → a separate artist space with sign-in, request cards with Accept or Decline, a calendar, prices and earnings.
- *Customers use WhatsApp, not apps* → WhatsApp links on every profile and booking, plus an in-app chat.
- *Make it feel like Zomato or Rapido, one tap and live tracking* → after a booking is confirmed the customer can watch the artist arrive on a map.
- *We need a business model* → see section 8.

**Honest limits:** owner-side evidence in our two cities is still thin. The next step is to talk to many more artists and test whether they would really list themselves.

## 4. User journeys

**A. Customer (bride, bridesmaid, family member)**
1. Opens SINGAAR and sees the logo and one search bar. Chooses a look and a city, then taps **Get started**. Not sure? She takes a four-tap **"Find my look"** quiz.
2. **Compares** artists: photos, a price guide for the city, who is free on her date, and who comes to her venue. The profile shows the price of the service she searched for.
3. Checks her date and **sends a booking request** (service, name, venue, a note). She can also open WhatsApp.
4. The artist **confirms** (in this demo, a sample artist confirms by herself after about 35 seconds). The customer pays a **small advance** (20%, minimum ₹500) to lock the date. Test checkout: no money moves.
5. In **Bookings** she opens the **booking chat**: she types a message, sends it, and the artist replies.
6. **Track arrival:**
   - For a **home visit** (saree draping, party makeup and similar) tracking starts straight away, like Rapido: "She is 7 min away".
   - For an **artist who works from a salon**, the map shows the customer's route to the salon.
   - For the **muhurtham**, a schedule counts back from the wedding time: artist leaves, arrives, makeup, draping, ready for photographs.
7. After the service she leaves a **review**.
8. Planning tools: wedding **countdown**, ritual-by-ritual **plan** (Hindu, nikah, Christian, party), and a **bridal party planner**.

**B. Artist or salon**
1. Taps **I am an artist**, then **Sign in** (a demo sign-in, no password; phone verification comes at launch) or **List yourself** (name, first service, price, optional WhatsApp and Instagram). Sign-in lasts only for that visit.
2. **Requests:** a card with the date, customer, service, price and place, and big **Accept** or **Decline** buttons. Past bookings are listed below (sample history is shown for each artist).
3. **Calendar:** blocks dates; accepted dates show as booked in customer search.
4. **Prices:** edits her services and prices, which show on her profile at once.
5. **Earnings:** earned, SINGAAR commission (10%), what she keeps, and the platform fee.
6. **Chat** with the customer from a confirmed booking.

## 5. How AI was used

- **Building:** the prototype was designed, coded, tested and revised with **Claude Code** (Anthropic's AI coding assistant), working from my brand, research and mentor feedback. Every feature was checked in a real browser at phone and desktop sizes, with automated checks of each journey.
- **In the product (class web app, `web/` folder):** two Claude calls. One turns a bride's free-text sentence into a structured search (city, look, budget, style). One drafts the artist's reply. Everything else is plain code: filtering, budget, date checks and ranking, plus a **price check that blocks any drafted message that contains a rupee amount not on the artist's own list**. The AI cannot invent a price.
- **On the main prototype site:** the booking chat replies, the "describe your look" box and the artist's automatic reply are **simple pre-written demo logic, not AI**, and the site says so. The full product would use the same Claude calls.
- **Photos** are free stock photography (Pexels), labelled "illustrative". They are not the sample artists, and are replaced by artists' own work at launch.

## 6. Tech stack and architecture

| Layer | What we used |
|---|---|
| Frontend | HTML, CSS and JavaScript (no framework), built as a phone-style app with a customer space and an artist space |
| Install on phone | Progressive Web App: manifest, service worker, icons ("Add to Home Screen") |
| Hosting | Vercel (live link) and GitHub Pages, both deployed automatically from the GitHub repo |
| Data (prototype) | Browser storage on the user's own device. No server, no personal data collected |
| AI app (`web/`) | Next.js, TypeScript, Anthropic Claude API |
| Maps | Hand-built SVG map with a moving marker, no map vendor |
| Messaging | WhatsApp click-to-chat links (wa.me) |
| Languages | English, with a beta Hindi, Tamil and Kannada switcher |
| Security | Content Security Policy, escaped user text, no secrets in the repository |
| Accessibility | Skip link, labelled controls, keyboard focus handling, reduced-motion support |

**Planned services (not built yet):** Supabase (accounts and a shared database), Razorpay (real payments, test mode first), WhatsApp Business API (automatic messages), Instagram portfolios (Meta approval).

## 7. What works today, and what is a demo

**Works in the prototype:** search, filters, compare, profiles with galleries, price guide, quiz, booking requests, artist sign-in, accept and decline, calendar blocking, price editing, earnings, reviews, booking chat, wedding countdown with calendar reminders, ritual planner, bridal party planner, live arrival tracker for home visits, salon visits and the muhurtham, WhatsApp links, language switcher, guided tour, installable phone app.

**Demo only (clearly labelled on the site):**
- All artist profiles, prices, reviews, history and availability are **sample data**.
- The artist's automatic reply, the chat replies, the advance payment and the live arrival are **simulated**. No money moves and no messages are sent.
- The artist sign-in has no password.
- Bookings are saved only in the visitor's own browser, so a booking made on one phone is not visible on another device.

## 8. Business model (proposed)

We want to be far cheaper than the big platforms, so artists keep most of what they earn.

- **Commission: 10%** on completed bookings only. If she is not paid, we earn nothing.
- **Platform fee: ₹299 a month** for using the platform (profile, calendar, bookings, tracking), **free for the first 3 months**.
- Example: an artist with 4 bookings of ₹15,000 earns ₹60,000 a month; SINGAAR takes ₹6,299; she keeps ₹53,701.

This is a hypothesis and the launch pricing is still to be finalised together with the first artists. It is shown on the artist pages as "proposed launch pricing".

## 9. What comes next

1. **Test with real people:** show 5 to 10 customers and artists the app and measure whether they understand it in five seconds.
2. **Real backend** (Supabase): accounts and a database so bookings are saved for real and shared between customer and artist; real artist sign-in with phone verification.
3. **Real payments** with Razorpay (test mode first). Needs KYC.
4. **Automatic WhatsApp messages** and **Instagram portfolios**.
5. **Verified artists:** portfolio checks, trial looks, and reviews only from completed bookings.
6. **Real AI in the booking chat** using the same Claude calls and price check.
7. A native Android and iPhone app once the backend exists.

## 10. Risks we are honest about

- **Adoption:** will small artists list themselves and keep their calendar updated? This is the biggest risk and the first thing to test.
- **Competition:** WedMeGood and Fresha exist. Our edge is small, independent women artists, every kind of look, fair price visibility and live arrival, which still needs proof.
- **Trust and safety:** the quality promise is a standard we are building, not a working verification system yet.
- **Pricing:** 10% plus ₹299 a month is untested; artists may prefer a different structure.
