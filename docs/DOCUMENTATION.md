# SINGAAR: Beauty meets you

**Live prototype:** https://preethicrown.github.io/singaar/
**Code:** https://github.com/preethicrown/singaar
**Built by:** Preethi S, Mesa School of Business ForgeX hackathon

---

## 1. What SINGAAR is

SINGAAR is a marketplace where **independent women artists and small salons** list their services and prices, and customers browse, compare and book them. It covers weddings, parties, hair, skin, nails, mehendi and accessories. It starts in **Bangalore**, with Chennai next.

It is a **marketplace**, not a company with its own staff: it connects customers with artists and holds no inventory. It is built for women who create looks, and for the brides, bridesmaids and families who book them.

## 2. The problem

Small salons and independent women artists in Chennai and Bangalore lose bookings and regular customers because they have no simple way to be **found, compared and booked**. Customers, especially brides, cannot easily judge what a fair price is, and a lower price can look like lower quality.

This came from home. My mother has run a beauty parlour for about fifteen years. Her customers only phone her, and she loses bridal bookings to big parlours.

## 3. Research

**Primary:** conversations and videos with salon owners and artists, and my mother's own experience of how customers book.

**Secondary** (full write-up in `docs/research`):
- Brides in Chennai and Bangalore say, in public forums, that they cannot judge fair bridal prices.
- Closest competitors: **WedMeGood** (a bridal directory with starting prices) and **Fresha** (a salon booking marketplace with an India presence). **Urban Company** and **YesMadam** are at-home services with an assigned professional, a different model.
- How SINGAAR differs, as a hypothesis we still need to prove: it is built for **small, independent women artists** across every kind of look (not only weddings), with a visible price guide and live arrival.

**Mentor feedback (Param):** adoption by artists may be the real problem; we need a business model; many customers use calls and WhatsApp, not apps. The home screen was too confusing, so we simplified it to the logo, one search bar and two clear spaces.

**Honest limits:** owner-side evidence in our two cities is still thin. The next step is to talk to many more artists and test whether they would really list themselves.

## 4. User journeys

**A. Customer (bride, bridesmaid, family member)**
1. Opens SINGAAR and sees the logo and one search bar. Chooses a look and a city, then taps **Get started**. Not sure? She takes a four-tap **"Find my look"** quiz.
2. **Compares** artists: photos, a price guide showing how each price compares with the city, who is free on her date, and who comes to her venue.
3. Opens a profile (her work, services and prices) and **sends a booking request**. She can also **chat on WhatsApp**.
4. The artist **confirms**. The customer pays a **small advance** to lock the date (demo).
5. On the day, she **watches her artist arrive** on a live map, with a countdown to the muhurtham or party.
6. After the service she leaves a **review**.
7. Planning tools: wedding **countdown**, ritual-by-ritual **plan** (Hindu, nikah, Christian, party), and a **bridal party planner** to cover mother, sister and bridesmaids with one artist.

**B. Artist or salon**
1. Switches to **"I am an artist"** and taps **List yourself** (name, first service, price, optional WhatsApp and Instagram).
2. Receives **booking requests** and accepts or declines, with a reply.
3. Blocks dates on her **calendar**; accepted dates show as booked in customer search.
4. Edits her **services and prices**, which show on her profile at once.
5. Sees her **earnings** and advances received, and what she keeps after an example platform fee.

## 5. How AI was used

- **Building:** the prototype was designed, coded and tested with **Claude Code** (Anthropic's AI coding assistant), working from my brand, research and mentor feedback. Every feature was tested in a real browser on desktop and phone sizes, including an automated regression test of every journey.
- **In the product (class web app, `web/` folder):** two Claude calls. One turns a bride's free-text sentence into a structured search (city, look, budget, style). One drafts the artist's reply. Everything else is plain code: filtering, budget, date checks, ranking, and a **price check that blocks any drafted message containing a rupee amount that is not on the artist's own list**. The AI cannot invent a price.
- **On the main prototype site:** the "describe your look" box is a simple rule-based demo, and is labelled as such. The full product would use the same Claude calls.
- **Photos** are free stock photography (Pexels), labelled "illustrative", and not the sample artists. They are replaced by artists' own work at launch.

## 6. Tech stack

| Part | What we used |
|---|---|
| Website and app | HTML, CSS and JavaScript (no framework), organised as a phone-style app with a customer space and an artist space |
| Install on phone | Progressive Web App: manifest, service worker, icons ("Add to Home Screen") |
| Hosting | GitHub Pages and Vercel, deployed from the GitHub repo |
| Data (prototype) | Browser storage on the user's device. No server, no personal data collected |
| AI app (`web/`) | Next.js, TypeScript, Anthropic Claude API |
| Languages | English, with a beta Hindi, Tamil and Kannada switcher |
| Security | Content Security Policy, escaped user text, no secrets in the repo |
| Accessibility | Skip link, labelled controls, keyboard focus handling, reduced-motion support |

## 7. What works today, and what is a demo

**Works in the prototype:** search, filters, compare, profiles with galleries, price guide, quiz, booking requests, artist accept and decline, calendar blocking, price editing, earnings, reviews, wedding countdown with calendar reminders, ritual planner, bridal party planner, live arrival tracker, WhatsApp chat links, language switcher, guided tour, installable phone app.

**Demo only (clearly labelled on the site):**
- All artist profiles, prices, reviews and availability are **sample data**.
- The artist's reply, the advance payment and the live arrival are **simulated**. No money moves and no messages are sent.
- Bookings are saved only in the visitor's own browser.

## 8. What comes next

1. **Test with real people:** show 5 to 10 customers and artists the app and measure whether they understand it in five seconds.
2. **Real backend** (Supabase): accounts and a database so bookings are saved for real and shared between customer and artist.
3. **Real payments** with Razorpay (test mode first). Needs KYC.
4. **Automatic WhatsApp messages** (WhatsApp Business API) and **Instagram portfolios** (Meta approval).
5. **Verified artists:** portfolio checks, trial looks and reviews only from completed bookings, which is the SINGAAR promise.
6. **Business model to test:** a small fee only on completed bookings, with the rate set together with artists. This is a hypothesis, not yet proven.
7. A native Android and iPhone app once the backend exists.

## 9. Risks we are honest about

- **Adoption:** will small artists list themselves and keep their calendar updated? This is the biggest risk and the first thing to test.
- **Competition:** WedMeGood and Fresha exist. Our edge is small, independent women artists, every kind of look, fair price visibility and live arrival, which still needs proof.
- **Trust:** the quality promise is a standard we are building, not a working verification system yet.
