# Disha — Product Requirements Document (PRD)

**ଦିଶା — ଘରର ଦିଶା | Disha — The Direction to Home**

| Field | Value |
|-------|-------|
| **Product** | Disha — Hyperlocal Indian State Companion App |
| **Version** | 1.0 (MVP — Odisha first) |
| **Author** | Gyanendu Rout |
| **Date** | 4 April 2026 |
| **Status** | Pre-Development |

---

## 1. PRODUCT VISION

A mobile app that serves as a daily companion for people connected to rural and semi-urban India — either living there or staying away. It brings the feel of home to your phone: your local calendar, your festivals, your weather in your language, your mandi prices, your holidays — all in one place.

**One-line pitch:** "WhatsApp connects you to people back home. Disha connects you to *home itself*."

### 1.1 Target Users

| User Persona | Description | Where They Are | What They Need |
|---|---|---|---|
| **Maa-Bapa (Parents)** | 50-70 years, basic smartphone, village/small town | At home in village | Simple daily info — date, puja, weather, holiday. No English-only apps |
| **Ghar ra Pilaa (Son/Daughter)** | 22-40 years, educated, migrated for work | Bangalore, Hyderabad, Delhi, Pune, Mumbai | Stay connected to what's happening at home — festivals, weather, news |
| **NRI/NRO** | 25-50 years, abroad or far from home state | US, UK, Gulf, Singapore, Australia | Nostalgia, planning visits around festivals, knowing what parents experience daily |
| **Educated Villager** | 18-35, college-educated, smartphone savvy | Still in village/district town | Daily utility — weather for farming, mandi prices, govt schemes, holiday calendar |

### 1.2 Core Problem Statements

| # | Problem | Who Faces It |
|---|---------|-------------|
| P1 | "What is today's Odia date? What month is it in our calendar?" — No good app shows this simply | Everyone |
| P2 | "Is there a bank holiday tomorrow? Will the govt office be open?" — scattered across websites | Parents, villagers |
| P3 | "What's the weather in my village today? Will it rain? How hot is it?" — national apps show city-level only | Parents, farmers, NROs |
| P4 | "What festival is coming? What's its significance? When should I call home?" | Son/daughter away from home |
| P5 | "What's the price of rice/onion in our local mandi?" — no easy way to check | Farmers, parents |
| P6 | "Is there a new govt scheme I'm eligible for? When is next PM-KISAN installment?" | Villagers, farmers |
| P7 | "I want my parents to have a simple, useful app — but everything is in English or too complex" | Son/daughter who installs it |

---

## 2. PRODUCT SCOPE

### 2.1 MVP Scope (v1.0 — Odisha Only)

| Feature | In MVP? | Priority |
|---------|---------|----------|
| Odia Calendar (date, month, season, tithi) | Yes | P0 — Core |
| Festival list with significance in Odia + English | Yes | P0 — Core |
| Government & Bank holiday calendar | Yes | P0 — Core |
| Weather forecast (district-level, conversational Odia) | Yes | P0 — Core |
| Agricultural weather tips | Yes | P1 — High |
| Bottom tab navigation (Home, Calendar, Weather, Holidays) | Yes | P0 — Core |
| Festival detail page (significance, traditions) | Yes | P0 — Core |
| Push notifications before festivals/holidays | Yes | P1 — High |
| District selector (30 Odisha districts) | Yes | P0 — Core |
| Offline calendar/festivals/holidays | Yes | P0 — Core |
| Bilingual (Odia primary + English secondary) | Yes | P0 — Core |
| Font size control (ଛୋଟ/ମଧ୍ୟମ/ବଡ଼) | Yes | P1 — High |
| Mandi prices | No | Phase 2 |
| Govt scheme alerts | No | Phase 2 |
| News digest | No | Phase 2 |
| Subscription / payment | No | Phase 3 |
| Family linking | No | Phase 4 |
| Multi-state support | No | Phase 5 |

### 2.2 Out of Scope (Will Never Be In Disha)

| Feature | Why Not |
|---------|---------|
| Social media / feed / comments | Not a social app — utility only |
| E-commerce / shopping | Not a marketplace |
| Video content / reels | Data-heavy, not for 3G users |
| Gaming | Not relevant |
| Loan / finance products | Regulatory complexity, trust risk |
| Political content / election | Must remain neutral and trusted |

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 FR-HOME: Home Dashboard

| ID | Requirement | Details |
|----|-------------|---------|
| FR-HOME-01 | Display today's date in Odia | Full format: ଦିନ, ତାରିଖ ମାସ ବର୍ଷ (e.g., ଶୁକ୍ରବାର, ୪ ଏପ୍ରିଲ ୨୦୨୬) |
| FR-HOME-02 | Display today's date in English | Below Odia date, smaller font, grey color |
| FR-HOME-03 | Display Odia calendar date | Odia day + month + Saka year (e.g., ୨୧ ଚୈତ୍ର ୧୯୪୮) |
| FR-HOME-04 | Display sunrise and sunset time | Based on user's district coordinates |
| FR-HOME-05 | Show time-based greeting | ସୁପ୍ରଭାତ (5AM-12PM), ଶୁଭ ଅପରାହ୍ନ (12-5PM), ଶୁଭ ସନ୍ଧ୍ୟା (5-9PM), ଶୁଭ ରାତ୍ରି (9PM-5AM) |
| FR-HOME-06 | Show upcoming festivals (next 3) | Name in Odia + English, date, countdown badge ("ଆଉ ୧୦ ଦିନ") |
| FR-HOME-07 | Show weather summary card | Current temp, one-line conversational Odia, wind + humidity |
| FR-HOME-08 | Show next upcoming holidays (next 3) | Bank and/or Govt, with date and name |
| FR-HOME-09 | "View All" links to respective screens | Tapping festival card → Calendar screen, weather → Weather screen, holiday → Holiday screen |
| FR-HOME-10 | Pull-to-refresh | Updates weather from server; calendar/festivals from local cache |

### 3.2 FR-CAL: Odia Calendar Screen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-CAL-01 | Monthly calendar grid view | 7-column grid (ର/ସୋ/ମ/ବୁ/ଗୁ/ଶୁ/ଶ), Sundays in red |
| FR-CAL-02 | Odia day abbreviations as headers | ରବି, ସୋମ, ମଙ୍ଗଳ, ବୁଧ, ଗୁରୁ, ଶୁକ୍ର, ଶନି (abbreviated) with English below |
| FR-CAL-03 | Today highlighted | Orange filled circle on today's date |
| FR-CAL-04 | Festival dates marked | Golden dot below date. Odia font weight bold |
| FR-CAL-05 | Holiday dates marked | Red dot below date. Red font color |
| FR-CAL-06 | Month switcher (prev/next) | Shows Odia month + Saka year and English month + year |
| FR-CAL-07 | Tap date → show details | Below calendar: Odia date, festival name, significance, holiday status |
| FR-CAL-08 | "This month's festivals" list | Below calendar grid. Each item: dot icon, name Odia + English, date badge |
| FR-CAL-09 | Odia month info card | Current Odia month name, English equivalent, season, brief description |
| FR-CAL-10 | Color legend | Today (orange), Puja (gold), Holiday (red) |
| FR-CAL-11 | Works fully offline | Calendar data for full year pre-loaded in local SQLite |

### 3.3 FR-WEA: Weather Screen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-WEA-01 | Show current location (district) | User's selected district. "Change" button to switch |
| FR-WEA-02 | Large temperature display | Current temp in Odia numerals + °C |
| FR-WEA-03 | "Feels like" temperature | Below main temp, smaller |
| FR-WEA-04 | Conversational weather description | In spoken Odia, not formal. E.g., "ଗରମ ଲାଗୁଛି ଭାଇ! ପାଣି ପିଅନ୍ତୁ" |
| FR-WEA-05 | Weather advice line | Actionable: "ଛତା ନିଅନ୍ତୁ", "ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ" |
| FR-WEA-06 | 4-box detail grid | Wind speed (ପବନ), Humidity (ଆର୍ଦ୍ରତା), Rain chance (ବର୍ଷା), Visibility (ଦୃଶ୍ୟତା) |
| FR-WEA-07 | Throughout-today breakdown | 4 time slots: ସକାଳ (morning), ଦୁପହର (afternoon), ସନ୍ଧ୍ୟା (evening), ରାତି (night) — each with icon, temp, one-word Odia description |
| FR-WEA-08 | 7-day forecast | Day abbreviation (Odia), icon, high/low temp, one-word description in Odia |
| FR-WEA-09 | Agricultural weather card | 2-3 farming tips based on current weather + Odia month/season. E.g., "ବର୍ଷା ପରେ ଧାନ ରୋଇବା ଭଲ ସମୟ" |
| FR-WEA-10 | Cyclone/severe weather alert | If IMD issues alert for user's district: red banner at top with "⚠️ ବାତ୍ୟା ସତର୍କତା! ଘରେ ରୁହନ୍ତୁ" |
| FR-WEA-11 | Stale data indicator | If offline or data > 2 hours old: "ଶେଷ ଅପଡେଟ: ୨ ଘଣ୍ଟା ଆଗ" |
| FR-WEA-12 | District-level accuracy | Weather per district, not state-level. 30 Odisha districts supported |

### 3.4 FR-HOL: Holidays Screen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-HOL-01 | Tab toggle: Bank / Govt | Two tabs at top. "Both" shown by default (all holidays) |
| FR-HOL-02 | Month filter chips | Scrollable chips: All, Apr, May, Jun... Active chip highlighted |
| FR-HOL-03 | Grouped by month | Month header: "ଏପ୍ରିଲ ୨୦୨୬ · April 2026" |
| FR-HOL-04 | Holiday card | Date (Odia + English), name (Odia + English), badges (Bank/Govt/State-specific) |
| FR-HOL-05 | Color-coded marker bar | Left border: Blue = Bank, Red = Govt, Gradient = Both |
| FR-HOL-06 | State-specific badge | If holiday is Odisha-specific (not national): show "ଓଡ଼ିଶା Odisha" badge |
| FR-HOL-07 | Full year data | Show holidays for entire current year |
| FR-HOL-08 | Works fully offline | Holiday data for full year pre-loaded |

### 3.5 FR-DET: Festival Detail Screen

| ID | Requirement | Details |
|----|-------------|---------|
| FR-DET-01 | Hero section with cultural art | Large icon/illustration, gradient background |
| FR-DET-02 | Festival name (Odia + English) | Large Odia, smaller English below |
| FR-DET-03 | Date display | Full date in Odia + English + day of week |
| FR-DET-04 | Tithi (lunar date) | Odia lunar calendar date (e.g., ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟା) |
| FR-DET-05 | Significance section | 3-5 lines in Odia explaining the festival. English translation below |
| FR-DET-06 | Traditions section | Bulleted list of traditions/customs in Odia + English |
| FR-DET-07 | At-a-glance grid | Bank holiday (Yes/No), Govt holiday (Yes/No), Main location |
| FR-DET-08 | Set Reminder button | Tapping sets a local notification 1 day before the festival |
| FR-DET-09 | Back navigation | Back arrow returns to previous screen (Calendar or Home) |

### 3.6 FR-SET: Settings

| ID | Requirement | Details |
|----|-------------|---------|
| FR-SET-01 | District selector | Dropdown/picker with all 30 Odisha districts. Stored locally |
| FR-SET-02 | Language preference | Options: ଓଡ଼ିଆ Only / English Only / Both (default: Both) |
| FR-SET-03 | Font size | ଛୋଟ (Small — 14sp) / ମଧ୍ୟମ (Medium — 16sp, default) / ବଡ଼ (Large — 20sp) |
| FR-SET-04 | Notification preferences | Toggle: Festival reminders (on/off), Holiday reminders (on/off), Weather alerts (on/off) |
| FR-SET-05 | About page | App version, credits, contact/feedback link |
| FR-SET-06 | Share app | Share Play Store link via WhatsApp/SMS — pre-filled Odia message |

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | App launch to content visible | < 2 seconds (cold start), < 0.5 seconds (warm start) |
| NFR-PERF-02 | Screen transition | < 300ms animation |
| NFR-PERF-03 | API response (Supabase) | < 500ms on 4G, < 1.5s on 3G |
| NFR-PERF-04 | Offline content load | < 200ms from local SQLite |
| NFR-PERF-05 | Memory usage | < 80MB RAM (budget phones have 2-3GB total) |
| NFR-PERF-06 | Battery impact | < 2% battery per day (background sync max 4x/day) |

### 4.2 Device & Network Compatibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-DEV-01 | Minimum Android version | Android 8.0 (API 26) — covers 95%+ of Indian budget phones |
| NFR-DEV-02 | Minimum RAM | 2GB |
| NFR-DEV-03 | APK size | < 10MB (target 8MB) |
| NFR-DEV-04 | Network: 3G | App must be fully functional. Weather loads in < 2 seconds |
| NFR-DEV-05 | Network: offline | Calendar, festivals, holidays work 100%. Weather shows cached data |
| NFR-DEV-06 | Network: 2G | App opens with cached data. Background sync paused |
| NFR-DEV-07 | Screen sizes | 4.5" to 6.7" (360dp to 430dp width) |
| NFR-DEV-08 | iOS support | Phase 2 (same Expo codebase, just build for iOS) |

### 4.3 Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-ACC-01 | Touch targets | Minimum 48x48dp (all buttons, cards, nav items) |
| NFR-ACC-02 | Font rendering | Bundled Noto Sans Odia — guaranteed rendering on all devices |
| NFR-ACC-03 | Contrast ratio | Text on backgrounds: minimum 4.5:1 (WCAG AA) |
| NFR-ACC-04 | Font size scaling | 3 levels (Small/Medium/Large) controlled in settings |
| NFR-ACC-05 | No gesture-only actions | Everything accessible by tap. No swipe-only features |
| NFR-ACC-06 | Screen reader | Basic TalkBack support for visually impaired users |

### 4.4 Data & Privacy

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-DATA-01 | Data collected | District selection, language preference only. No PII required for free tier |
| NFR-DATA-02 | No login required | Free tier works without any signup. Just select district → use |
| NFR-DATA-03 | Login (Phase 3+) | Phone number OTP only. No email/password complexity |
| NFR-DATA-04 | Data storage | All user preferences stored locally on device. Server stores only anonymized usage |
| NFR-DATA-05 | No tracking | No third-party analytics (no Google Analytics, no Facebook SDK). Only basic Supabase analytics |
| NFR-DATA-06 | GDPR/IT Act compliance | Data deletion on request. No data sharing with third parties |

### 4.5 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-01 | App crash rate | < 0.5% of sessions |
| NFR-REL-02 | Backend uptime | 99.5% (Supabase SLA) |
| NFR-REL-03 | Data freshness — weather | Updated every 6 hours |
| NFR-REL-04 | Data freshness — festivals/holidays | Pre-loaded for full year. Updated yearly |
| NFR-REL-05 | Graceful degradation | If API fails → show cached data + "offline" indicator. Never blank screen |

### 4.6 Localization & Multi-State Readiness

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-LOC-01 | All UI strings externalized | No hardcoded Odia text in components. All strings from locale files |
| NFR-LOC-02 | State as a database dimension | Every content table has `state_id` column |
| NFR-LOC-03 | Font per language | App bundles font per active state (Noto Sans Odia for v1) |
| NFR-LOC-04 | Calendar system abstraction | Calendar calculation pluggable — Saka (Odia), Bengali, Tamil, etc. |
| NFR-LOC-05 | RTL ready | Layout must not break for Urdu (future — Jammu & Kashmir) |
| NFR-LOC-06 | Adding a new state | Should require: 1 database state row + content population. Zero code changes |

---

## 5. USER FLOWS

### 5.1 First Launch Flow

```
1. Splash screen: Disha logo + "ଦିଶା — ଘରର ଦିଶା"
   (2 seconds)

2. State selection:
   "ଆପଣଙ୍କ ରାଜ୍ୟ ବାଛନ୍ତୁ | Select your state"
   → Odisha (only option in v1, others greyed out with "ଶୀଘ୍ର ଆସୁଛି | Coming Soon")

3. District selection:
   "ଆପଣଙ୍କ ଜିଲ୍ଲା ବାଛନ୍ତୁ | Select your district"
   → List of 30 Odisha districts
   → User taps their district

4. Language preference:
   "ଭାଷା ବାଛନ୍ତୁ | Choose language"
   → ଓଡ଼ିଆ + English (default, recommended)
   → ଓଡ଼ିଆ ମାତ୍ର (Odia only)
   → English only

5. Notification permission:
   "ପର୍ବ ଓ ଛୁଟି ସୂଚନା ପାଇବେ? | Get festival & holiday alerts?"
   → Allow / Later

6. → Home Dashboard (fully loaded)

Total time: < 30 seconds
Data downloaded: < 500KB (full year calendar + festivals + holidays)
```

### 5.2 Daily Usage Flow (Returning User)

```
User opens app (morning):
  → Home screen loads instantly from cache
  → Background: app checks Supabase for weather update
  → Weather card refreshes (if online)
  → User sees: date, upcoming festivals, weather, holidays
  → Taps weather card → Weather detail
  → Reads agricultural tip
  → Closes app

Total time spent: 30-60 seconds
Data used: < 5KB
```

### 5.3 Festival Exploration Flow

```
User sees "ରଥ ଯାତ୍ରା — ଆଉ ୧୫ ଦିନ" on Home
  → Taps it
  → Festival Detail screen opens
  → Reads significance in Odia
  → Sees traditions list
  → Taps "🔔 ରିମାଇଣ୍ଡର ସେଟ କରନ୍ତୁ"
  → Notification scheduled for 1 day before
  → Back to Home

14 days later:
  → Push notification: "ଆସନ୍ତାକାଲି ରଥ ଯାତ୍ରା! ଜୟ ଜଗନ୍ନାଥ 🙏"
  → User opens app → sees Rath Yatra detail
```

### 5.4 "Install for Parents" Flow

```
Son in Bangalore:
  1. Downloads Disha from Play Store
  2. Selects: Odisha → Balangir → Odia + English → Allow notifications
  3. Uses for a few days, finds it useful
  4. Visits home on weekend
  5. Installs on mother's phone
  6. Selects: Odisha → Balangir → ଓଡ଼ିଆ ମାତ୍ର → Font: ବଡ଼ (Large) → Allow notifications
  7. Shows mother: "ଏଠି ଚାପନ୍ତୁ, ଆଜିର ପାଣିପାଗ ଦେଖିବେ"
  8. Mother uses daily — checks date, weather, holidays

No login needed. No account. Just install → select district → use.
```

---

## 6. CONTENT REQUIREMENTS

### 6.1 Festival Database (MVP — Odisha)

| Requirement | Count |
|-------------|-------|
| Total Odisha festivals to cover | 45-50 per year |
| Each festival must have | Name (Odia + English), date, Odia calendar date, tithi, significance (Odia + English, 3-5 lines each), traditions list (3-5 items), bank/govt holiday status, reminder eligibility |
| Significance text quality | Must read naturally in Odia — not machine-translated. Written or reviewed by Odia speaker |
| Traditions | Specific to Odisha practice, not generic Hindu practice |

### 6.2 Holiday Database (MVP — Odisha)

| Requirement | Details |
|-------------|---------|
| Bank holidays | All RBI-notified holidays for Odisha (typically 15-18 per year) |
| Government holidays | Odisha state government gazette holidays (typically 20-25 per year) |
| Restricted holidays | Listed separately, marked as optional |
| Source of truth | RBI circular (bank), Odisha Govt gazette (govt) — updated annually in January |

### 6.3 Weather Content

| Requirement | Details |
|-------------|---------|
| Conversational phrases | Minimum 20 unique Odia phrases covering: hot, very hot, cold, very cold, rain, heavy rain, thunderstorm, drizzle, cloudy, fog, pleasant, windy, cyclone alert |
| Agricultural tips | Minimum 30 tips mapped to: 6 seasons × 5 weather conditions. Must be relevant to Odisha crops (paddy, ragi, groundnut, sugarcane, turmeric) |
| District coverage | All 30 Odisha districts with lat/lon coordinates |

### 6.4 Odia Calendar Data

| Requirement | Details |
|-------------|---------|
| Date range | Pre-computed for 2025-2030 (5 years) |
| Data per date | Odia day, Odia month, Saka year, season (Odia + English), tithi, nakshatra |
| Accuracy | Verified against published Kohinoor Panjika or drikpanchang.com |
| Sunrise/sunset | Calculated per district using SunCalc library (offline) |

---

## 7. MONETIZATION REQUIREMENTS

### 7.1 Free Tier (Forever Free)

| Feature | Included |
|---------|----------|
| Odia calendar + festivals + significance | Yes |
| Bank & Govt holidays | Yes |
| Basic district-level weather | Yes |
| Agricultural weather tips | Yes |
| Push notifications (festivals, holidays) | Yes |
| Offline calendar | Yes |

### 7.2 "ଘର ସଙ୍ଗ" (Ghar Sanga) — Rs 29/month or Rs 249/year

| Feature | Details |
|---------|---------|
| Village-level weather | Hyper-local, not just district |
| Mandi/Market prices | Daily rice, dal, vegetable prices from local mandi |
| Local news digest | 3-4 lines daily from district |
| Govt scheme alerts | PM-KISAN, KALIA, ration card updates |
| Crop calendar | Season-specific farming reminders |

### 7.3 "ପରିବାର" (Paribara) — Rs 99/month

| Feature | Details |
|---------|---------|
| Family linking | Connect parent's phone to yours. You pay, they get premium |
| Daily Odia audio | Puja audio, Bhagabata patha, Jagannath bhajan |
| Health reminders | Set medicine/checkup reminders for parents remotely |
| Emergency SOS | One-tap button on parents' phone → location + call to family |
| Simple photo sharing | One-button photo share between linked family members |

### 7.4 Payment Integration Requirements

| Requirement | Details |
|-------------|---------|
| Payment gateway | Razorpay (for web/direct) + Google Play Billing (in-app) |
| Minimum payment | Rs 1 (Razorpay supports it) |
| UPI mandatory | Must support UPI — 70%+ of rural digital payments |
| Subscription management | Auto-renew with 3-day grace period. Cancel anytime |
| Free trial | 7 days free trial for Ghar Sanga |
| Family billing | One subscription covers linked family members |

---

## 8. PHASE PLAN

### Phase 1 — MVP (Month 1-2)
**Goal: Working app for Odisha with core 4 features**

| Deliverable | Details |
|-------------|---------|
| Expo project setup | React Native + TypeScript + Expo Router |
| Supabase setup | Database schema, seed data, REST API |
| Home Dashboard | Hero date card, festival summary, weather summary, holiday summary |
| Odia Calendar | Monthly grid, Odia dates, festival markers, month info |
| Weather Screen | Current + hourly + 7-day + agri tips |
| Holidays Screen | Bank/Govt tabs, month filters, holiday cards |
| Festival Detail | Significance, traditions, at-a-glance, reminder |
| Settings | District selector, language, font size, notifications |
| Offline support | SQLite cache for calendar, festivals, holidays |
| Weather Agent | Claude agent fetches OpenWeatherMap → Odia → Supabase |
| Festival Agent | Pre-populated database for FY 2026-27 |
| Play Store listing | APK build, store listing in Odia + English |

### Phase 2 — Stickiness (Month 3-4)
**Goal: Daily habit, push notifications, mandi prices**

| Deliverable | Details |
|-------------|---------|
| Push notifications | Festival reminders (1 day before), holiday alerts, weather alerts |
| Mandi prices screen | New tab or section — daily commodity prices per district |
| Mandi Agent | Claude agent fetches data.gov.in → Supabase |
| Govt scheme section | PM-KISAN, KALIA alerts |
| "Odia proverb of the day" | Content Agent generates daily |
| Improved weather | Cyclone alerts from IMD, better agri tips |
| Analytics | Basic usage tracking (anonymous) — which screens used most |

### Phase 3 — Monetize (Month 5-6)
**Goal: Launch subscriptions, start revenue**

| Deliverable | Details |
|-------------|---------|
| User accounts | Phone number OTP login (Supabase Auth) |
| Razorpay integration | Subscription checkout for Ghar Sanga (Rs 29/mo) |
| Paywall logic | Free users see basic weather; subscribers see mandi + schemes + news |
| News digest | Daily district news from RSS feeds |
| Referral system | "Share with friends" — free month for referrer |

### Phase 4 — Premium (Month 7-9)
**Goal: Launch Paribara tier, family features**

| Deliverable | Details |
|-------------|---------|
| Family linking | Link parent's phone to subscriber's account |
| Odia audio content | Daily puja audio, bhajan player |
| Health reminders | Remote reminder setting for family |
| Emergency SOS | One-tap emergency button |
| Photo sharing | Simple family photo sharing |
| Paribara subscription | Rs 99/mo tier |

### Phase 5 — Multi-State (Month 10-12)
**Goal: Expand to 2-3 more states**

| Deliverable | Details |
|-------------|---------|
| State selection on first launch | Odisha, West Bengal, Bihar (first expansion) |
| Bengali calendar + festivals | Content Agent populates Bengali data |
| Hindi/Bhojpuri support for Bihar | Content Agent populates |
| State-specific agents | Weather + mandi + festivals per state |
| Regional font bundles | Noto Sans Bengali, Noto Sans Devanagari |

### Phase 6 — All India (Month 12-18)
**Goal: Cover 15+ states, 1M+ users**

| Deliverable | Details |
|-------------|---------|
| South India expansion | Tamil Nadu, Karnataka, Andhra, Kerala |
| Tamil, Telugu, Kannada, Malayalam | Calendar systems + festival databases |
| Custom backend (if needed) | Only if Supabase can't handle scale |
| iOS launch | Same Expo codebase → App Store |

---

## 9. SUCCESS METRICS

### MVP Success (Phase 1, Month 2)

| Metric | Target |
|--------|--------|
| Play Store downloads | 5,000 |
| Daily Active Users (DAU) | 1,000 |
| App rating | 4.0+ stars |
| Crash rate | < 1% |
| Average session duration | > 30 seconds |
| Retention (Day 7) | > 30% |

### Growth Success (Phase 2-3, Month 6)

| Metric | Target |
|--------|--------|
| Total downloads | 50,000 |
| DAU | 10,000 |
| Push notification opt-in | > 60% |
| Subscription conversion | 2-3% of MAU |
| Monthly Recurring Revenue (MRR) | Rs 25,000 |

### Scale Success (Phase 5-6, Month 12)

| Metric | Target |
|--------|--------|
| Total downloads | 500,000 |
| DAU | 100,000 |
| States active | 5+ |
| MRR | Rs 2,00,000+ |
| NPS score | > 50 |

---

## 10. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low adoption in villages (parents don't use apps) | High | High | Son/daughter installs + shows. Ultra-simple UI. No login needed |
| Odia text rendering issues on old phones | Medium | High | Bundle Noto Sans Odia font. Test on Android 8 devices |
| Weather data inaccuracy for small villages | Medium | Medium | Use district-level (not village). Show "approximate" disclaimer |
| OpenWeatherMap API changes/pricing | Low | Medium | Abstract weather source. Can switch to IMD or WeatherAPI.com |
| Content quality (auto-generated Odia) | Medium | High | Claude generates, human reviews monthly. Build phrase library |
| Competitors (Odia calendar apps exist) | Medium | Medium | Differentiate with weather + mandi + conversational tone |
| Internet connectivity in remote villages | High | Medium | Offline-first design. Core features work without internet |
| Play Store rejection | Low | High | Follow all guidelines. No copyrighted content |
| Supabase free tier limits | Low (at MVP) | Medium | Monitor usage. Upgrade to Pro before hitting limits |
| Multi-state content quality at scale | Medium | High | One state at a time. Don't rush. Quality > coverage |

---

## 11. DEPENDENCIES

| Dependency | Owner | Status |
|-----------|-------|--------|
| OpenWeatherMap API key | Gyan | Pending — signup needed |
| data.gov.in API key | Gyan | Pending — signup needed |
| Supabase project | Gyan | Pending — create project |
| Google Play Developer account | Gyan | Pending — Rs 2,100 one-time |
| Claude API key (for agents) | Gyan | Available |
| Festival data (Odisha) | AI Agent + Gyan review | Pending |
| Holiday data (Odisha 2026-27) | AI Agent + Gyan review | Pending |
| Odia calendar data (5 years) | AI Agent calculation | Pending |
| District coordinates (30 districts) | AI Agent | Pending |
| Pattachitra-style illustrations | Designer / AI generated | Pending |

---

## 12. GLOSSARY

| Term | Meaning |
|------|---------|
| Odia / ଓଡ଼ିଆ | Official language of Odisha |
| Panchang / ପଞ୍ଜିକା | Hindu calendar system with tithi, nakshatra, yoga |
| Tithi | Lunar day (Shukla Paksha / Krishna Paksha) |
| Nakshatra | Lunar mansion / star constellation |
| Saka Era / ଶକାବ୍ଦ | Indian national calendar era (Gregorian year - 78) |
| Mandi | Agricultural wholesale market |
| NRO | Non-Resident Odia (person from Odisha living elsewhere) |
| NRI | Non-Resident Indian |
| KALIA | Krushak Assistance for Livelihood and Income Augmentation (Odisha scheme) |
| PM-KISAN | Pradhan Mantri Kisan Samman Nidhi (central scheme) |
| FCM | Firebase Cloud Messaging (push notifications) |
| OTA | Over-The-Air updates (app updates without Play Store) |
| IMD | India Meteorological Department |
| APMC | Agricultural Produce Market Committee |
| Pattachitra | Traditional Odisha art form — used for app illustrations |
