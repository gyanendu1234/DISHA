# Odisha Sahayaka — API Integrations & Data Flow

## Complete Data Source Map

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                             │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │OpenWeather│ │IMD (Govt)│ │Agmarknet │ │data.gov  │       │
│  │   Map     │ │RSS/API   │ │(Mandi)   │ │.in       │       │
│  │  Weather  │ │ Cyclone  │ │  Prices  │ │ Schemes  │       │
│  │  FREE     │ │  FREE    │ │  FREE    │ │  FREE    │       │
│  └─────┬─────┘ └─────┬────┘ └────┬─────┘ └────┬─────┘       │
│        │             │           │             │              │
│        ▼             ▼           ▼             ▼              │
│  ┌───────────────────────────────────────────────────┐       │
│  │           CLAUDE AGENT (runs on schedule)          │       │
│  │                                                    │       │
│  │  1. Fetch raw data from API                        │       │
│  │  2. Transform → Odia text + structured data        │       │
│  │  3. Write to Supabase                              │       │
│  │  4. Trigger push notification if needed            │       │
│  └──────────────────────┬────────────────────────────┘       │
│                         │                                     │
│                         ▼                                     │
│  ┌──────────────────────────────────────────────┐            │
│  │              SUPABASE (Postgres)              │            │
│  │  weather | festivals | holidays | mandi_prices│            │
│  │  odia_calendar | daily_content | users        │            │
│  └──────────────────────┬───────────────────────┘            │
│                         │                                     │
│                         ▼                                     │
│  ┌──────────────────────────────────────────────┐            │
│  │           MOBILE APP (Expo)                   │            │
│  │  Reads from Supabase REST API                 │            │
│  │  Caches in local SQLite for offline           │            │
│  └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**KEY PRINCIPLE:** The app NEVER calls external APIs directly.
Claude Agent fetches → transforms to Odia → stores in Supabase → App reads from Supabase.
This means: less battery, less data usage, offline works, and one clean API for the app.

---

## 1. WEATHER — OpenWeatherMap API

### Why OpenWeatherMap (not IMD directly)
- IMD has no proper JSON API — only RSS feeds and PDFs
- OpenWeatherMap has structured JSON, district-level accuracy
- Free tier = 1,000 calls/day = enough for 30 districts × 4 times/day = 120 calls

### API Details

| Field | Value |
|-------|-------|
| **Provider** | OpenWeatherMap |
| **Endpoint** | `https://api.openweathermap.org/data/2.5/` |
| **API Key** | Free signup → get key instantly |
| **Free Tier** | 1,000 calls/day, 60 calls/min |
| **Cost if exceeded** | $0 up to 1,000/day; beyond = One Call API 3.0 at $0.0015/call |
| **Data** | Current weather, 7-day forecast, hourly, alerts |

### API Calls Needed

#### a) Current Weather (per district)
```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}&lon={lon}
  &appid={API_KEY}
  &units=metric
  &lang=or          ← Odia language support!
```

Response (what we use):
```json
{
  "main": {
    "temp": 32.5,
    "feels_like": 36.1,
    "humidity": 45,
    "temp_min": 24.0,
    "temp_max": 35.0
  },
  "wind": { "speed": 3.4 },
  "weather": [{
    "main": "Clear",
    "description": "clear sky"    // We replace this with Odia
  }],
  "visibility": 6000,
  "clouds": { "all": 10 }
}
```

#### b) 7-Day Forecast + Hourly (One Call API)
```
GET https://api.openweathermap.org/data/3.0/onecall
  ?lat={lat}&lon={lon}
  &appid={API_KEY}
  &units=metric
  &exclude=minutely
```

Response gives: `current`, `hourly[48]`, `daily[8]`, `alerts[]`

#### c) How Many Calls Per Day

| Task | Calls | Frequency | Daily Total |
|------|-------|-----------|-------------|
| Current weather × 30 districts | 30 | 4x/day (6AM, 12PM, 6PM, 10PM) | 120 |
| 7-day forecast × 30 districts | 30 | 2x/day (6AM, 6PM) | 60 |
| **TOTAL** | | | **180 calls/day** |

180 out of 1,000 free = **well within free tier**

### Claude Agent: Weather → Odia Conversion

The agent fetches raw data, then generates conversational Odia:

```
Raw: temp=38, humidity=80, condition="Rain"

Claude Agent generates:
  description_or: "ବର୍ଷା ହେବ ଭାଇ! ଛତା ନେଇ ବାହାରନ୍ତୁ। ଗରମ ସହ ବର୍ଷା — ଶରୀର ଯତ୍ନ ନିଅନ୍ତୁ।"
  description_en: "It's going to rain! Take an umbrella. Hot and rainy — take care of yourself."
  agri_tips_or: ["ବର୍ଷା ପରେ ଧାନ ରୋଇବା ଭଲ ସମୟ", "ଫସଲରେ ପାଣି ଜମା ହେଲେ ନିଷ୍କାସନ କରନ୍ତୁ"]
```

Conversion rules (hardcoded, no AI needed for basic):

| Condition | Temp Range | Odia Output |
|-----------|-----------|-------------|
| Clear | > 38°C | ଗରମ ବହୁତ! ପାଣି ପିଅନ୍ତୁ, ଛାଇରେ ରୁହନ୍ତୁ |
| Clear | 25-35°C | ଭଲ ପାଣିପାଗ! ସୁନ୍ଦର ଦିନ |
| Clear | < 15°C | ଥଣ୍ଡା ବହୁତ! ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ |
| Clouds | any | ମେଘୁଆ ଆକାଶ, ବର୍ଷା ହୋଇପାରେ |
| Rain | any | ବର୍ଷା ହେବ! ଛତା ନିଅନ୍ତୁ |
| Thunderstorm | any | ⚠️ ବଜ୍ର ସହ ବର୍ଷା! ଘରେ ରୁହନ୍ତୁ |
| Drizzle | any | ହାଲୁକା ବର୍ଷା ହେଉଛି |
| Haze/Fog | any | କୁହୁଡ଼ି ପଡ଼ିଛି, ଧୀରେ ଯାଆନ୍ତୁ |

For agricultural tips, Claude uses: current condition + Odia month + season → generates relevant tip.

---

## 2. CYCLONE / SEVERE WEATHER — IMD

### Why Separate from OpenWeatherMap
- IMD is the **official** source for cyclone warnings in India
- People trust "ସରକାରୀ ସତର୍କତା" (Government alert) more
- Critical for coastal Odisha (Puri, Ganjam, Balasore, Kendrapara)

### Data Source

| Field | Value |
|-------|-------|
| **Provider** | India Meteorological Department (IMD) |
| **URL** | `https://mausam.imd.gov.in/` — RSS feeds |
| **Cyclone bulletins** | `https://mausam.imd.gov.in/responsive/cyclonefcst.php` |
| **Format** | HTML/RSS (needs scraping) |
| **Cost** | FREE |

### How Agent Fetches

```
Agent scrapes IMD page every 6 hours:
  1. Check RSS feed for cyclone/warning keywords
  2. If alert found for "Odisha" or Bay of Bengal:
     - Parse severity, affected districts, timing
     - Generate Odia alert text
     - Push URGENT notification to all users in affected districts
     - Store in Supabase `weather_alerts` table
```

This is **critical safety feature** — Odisha gets 2-3 cyclones per year.

---

## 3. MANDI PRICES — Agmarknet

### What Is Agmarknet
- Government portal for agricultural commodity prices across India
- Every APMC mandi reports daily prices
- Odisha has 40+ mandis

### Data Source

| Field | Value |
|-------|-------|
| **Provider** | Agmarknet (Govt of India) |
| **URL** | `https://agmarknet.gov.in/` |
| **API** | `https://api.data.gov.in/resource/` (via data.gov.in) |
| **API Key** | Free signup at data.gov.in |
| **Format** | JSON |
| **Cost** | FREE (10,000 calls/day) |

### API Call

```
GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
  ?api-key={KEY}
  &format=json
  &filters[state]=Odisha
  &filters[district]={district_name}
  &filters[arrival_date]={today}
  &limit=50
```

Response:
```json
{
  "records": [
    {
      "state": "Odisha",
      "district": "Khordha",
      "market": "Bhubaneswar",
      "commodity": "Tomato",
      "variety": "Local",
      "min_price": "1500",    // per quintal
      "max_price": "2000",
      "modal_price": "1800",
      "arrival_date": "04/04/2026"
    }
  ]
}
```

### Claude Agent Transforms

```
Raw: commodity="Tomato", modal_price=1800 (per quintal)

Agent output:
  commodity_or: "ଟମାଟୋ"
  commodity_en: "Tomato"
  price: 18                    // converted to per-kg
  unit: "per kg"
  display_or: "ଟମାଟୋ — ₹୧୮/କେଜି (ଭୁବନେଶ୍ୱର ମଣ୍ଡି)"
```

### Key Commodities to Track

| Odia Name | English | Why |
|-----------|---------|-----|
| ଚାଉଳ | Rice | Staple food — #1 priority |
| ଡାଲି | Dal (Lentils) | Daily cooking essential |
| ଆଳୁ | Potato | Most used vegetable |
| ପିଆଜ | Onion | Price-sensitive item |
| ଟମାଟୋ | Tomato | Price-sensitive item |
| ମୁଗ | Moong Dal | Common pulse |
| ସୋରିଷ ତେଲ | Mustard Oil | Cooking oil in Odisha |
| ଅଣ୍ଡା | Egg | Protein source |

---

## 4. ODIA CALENDAR / PANCHANG — No API Needed

### Why No API
- Odia Panchang is a **fixed astronomical calculation**
- Same rules for 100+ years — doesn't change daily
- We pre-compute and store in database

### Data Source

| Method | Details |
|--------|---------|
| **Primary** | Kohinoor Odia Panjika (published annually) — digitize manually once |
| **Calculation** | Solar calendar conversion: Gregorian date → Odia date using Saka era offset |
| **Verification** | Cross-check with drikpanchang.com |

### Odia Date Calculation Logic

```
// Simplified — Odia calendar is Saka-based solar calendar
// Odia New Year = 14 April (Maha Vishuba Sankranti)
// Month lengths vary slightly by year (astronomical)

Odia months start approximately:
  Baishakha   → 14 April  (31 days)
  Jyeshtha    → 15 May    (31 days)
  Ashadha     → 15 June   (31 days)
  Shrabana    → 16 July   (31 days)
  Bhadrab     → 16 August (31 days)
  Ashwina     → 16 Sept   (30 days)
  Kartika     → 16 Oct    (30 days)
  Margashira  → 15 Nov    (30 days)
  Pousha      → 15 Dec    (30 days)
  Magha       → 14 Jan    (30 days)
  Phalguna    → 13 Feb    (30 days)
  Chaitra     → 15 March  (30 days)

Saka Year = Gregorian Year - 78 (before April 14)
          = Gregorian Year - 77 (after April 14)

Example: 4 April 2026
  → Before April 14, so Chaitra month
  → Saka year = 2026 - 78 = 1948
  → Day of Chaitra = days since March 15 = 20
  → Result: ୨୦ ଚୈତ୍ର ୧୯୪୮
```

### What We Pre-Load (One-Time)

| Data | Source | Size |
|------|--------|------|
| Odia date for every day 2025-2030 | Calculated + verified | ~2,200 rows |
| Tithi (lunar day) for each date | drikpanchang.com scrape | Added to same table |
| Nakshatra for each date | drikpanchang.com scrape | Added to same table |
| Sunrise/Sunset per district | SunCalc npm library (offline calculation) | Calculated on device |

### Tithi / Nakshatra Source

```
Agent one-time scrapes drikpanchang.com:
  https://www.drikpanchang.com/panchang/day-panchang.html
    ?date=04/04/2026

  Extracts: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal
  Stores in odia_calendar table

  This is a ONE-TIME bulk operation for 5 years of data.
  After that, no API calls needed — pure offline.
```

---

## 5. FESTIVALS & HOLIDAYS — Static Data + Yearly Update

### No API Needed — Manually Curated + AI Maintained

| Data | Source | Update Frequency |
|------|--------|-----------------|
| Odisha govt holidays | Official gazette (published Jan each year) | Once per year |
| Bank holidays (RBI) | RBI circular (published Dec for next year) | Once per year |
| Odia festivals | Fixed dates + lunar dates from Panchang | Once per year |
| Festival significance | Written by Claude Agent | One-time + refinements |

### Festival Data Structure

```json
{
  "name_or": "ରଥ ଯାତ୍ରା",
  "name_en": "Rath Yatra",
  "date": "2026-06-20",
  "odia_date": "୬ ଆଷାଢ଼ ୧୯୪୮",
  "tithi": "ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟା",
  "is_bank_holiday": true,
  "is_govt_holiday": true,
  "is_odisha_specific": true,
  "significance_or": "ଶ୍ରୀ ଜଗନ୍ନାଥ, ବଳଭଦ୍ର ଓ ସୁଭଦ୍ରାଙ୍କ ରଥ ଯାତ୍ରା...",
  "significance_en": "The chariot festival of Lord Jagannath...",
  "traditions_or": ["ରଥ ଟଣା", "ଛେରା ପହଁରା", "ପୋଡ଼ପିଠା"],
  "location": "Puri, Odisha",
  "notify_days_before": 3
}
```

### Yearly Update Process

```
Every January, Claude Agent:
  1. Reads new year's govt gazette for holidays
  2. Calculates lunar-based festival dates for the year
  3. Updates festivals table in Supabase
  4. Generates fresh significance text if needed
  5. Schedules push notifications for each festival

  Human input needed: ZERO (Agent reads official sources)
```

### Major Odisha Festivals to Cover (40+)

| Month | Festivals |
|-------|-----------|
| Baishakha (Apr-May) | ପଣା ସଂକ୍ରାନ୍ତି, ଅକ୍ଷୟ ତୃତୀୟା, ଚନ୍ଦନ ଯାତ୍ରା |
| Jyeshtha (May-Jun) | ସାବିତ୍ରୀ ବ୍ରତ, ଷିଠି ଲେଞ୍ଜ ଧରା |
| Ashadha (Jun-Jul) | ରଥ ଯାତ୍ରା, ବାହୁଡ଼ା ଯାତ୍ରା, ସୁନାବେଶ |
| Shrabana (Jul-Aug) | ରାଖୀ ପୂର୍ଣ୍ଣିମା, ଝୁଲଣ ଯାତ୍ରା, ଗମ୍ଭା ପୂର୍ଣ୍ଣିମା |
| Bhadrab (Aug-Sep) | ଜନ୍ମାଷ୍ଟମୀ, ଗଣେଶ ପୂଜା, ନୁଆଖାଇ |
| Ashwina (Sep-Oct) | ଦୁର୍ଗା ପୂଜା, କୁମାର ପୂର୍ଣ୍ଣିମା, ଦଶହରା |
| Kartika (Oct-Nov) | ଦୀପାବଳୀ, କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା, ବୋଇତ ବନ୍ଦାଣ |
| Margashira (Nov-Dec) | ପ୍ରଥମାଷ୍ଟମୀ, ମାଣବସା ଗୁରୁବାର |
| Pousha (Dec-Jan) | ପୌଷ ପୂର୍ଣ୍ଣିମା, ଧନୁ ସଂକ୍ରାନ୍ତି |
| Magha (Jan-Feb) | ମକର ସଂକ୍ରାନ୍ତି, ସରସ୍ୱତୀ ପୂଜା, ଅଦ୍ୟପଣା |
| Phalguna (Feb-Mar) | ମହାଶିବରାତ୍ରି, ହୋଲି / ଦୋଳ ପୂର୍ଣ୍ଣିମା |
| Chaitra (Mar-Apr) | ରାମ ନବମୀ, ହନୁମାନ ଜୟନ୍ତୀ |

---

## 6. GOVT SCHEMES — data.gov.in

### API Details

| Field | Value |
|-------|-------|
| **Provider** | data.gov.in (Open Government Data Platform) |
| **API Key** | Free signup |
| **Cost** | FREE |
| **Relevant datasets** | PM Kisan, MGNREGA, Kalia Yojana, Ration card |

### Key Schemes for Odisha Rural Users

| Scheme | API/Source | What We Show |
|--------|-----------|-------------|
| **KALIA Yojana** (Odisha state) | kalia.odisha.gov.in | Beneficiary status, payment dates |
| **PM-KISAN** | pmkisan.gov.in API | Next installment date, status check |
| **Ration Card / PDS** | Odisha food supplies portal | Rice/wheat distribution dates |
| **MGNREGA** | nrega.nic.in | Job card status, work availability |
| **Biju Swasthya Kalyan** | Odisha health portal | Hospital empanelment, coverage |

### How Agent Fetches

```
Weekly scrape (not daily — schemes don't change daily):
  1. Check PM-KISAN for next installment announcement
  2. Check KALIA for new beneficiary list
  3. Check ration distribution schedule
  4. Format in Odia: "PM-KISAN ୧୮ତମ କିସ୍ତି ଏପ୍ରିଲ ୧୫ରେ ଆସିବ"
  5. Store in daily_content.scheme_alert_or
```

---

## 7. NEWS DIGEST — RSS Feeds (Odia Newspapers)

### Sources

| Paper | RSS Feed | Language |
|-------|----------|---------|
| **Sambad** | sambad.in/feed | Odia |
| **Dharitri** | dharitri.com/feed | Odia |
| **Pragativadi** | pragativadi.com/feed | Odia/English |
| **OdishaTV** | odishatv.in/feed | English |

### How Agent Creates News Digest

```
Daily at 7 AM:
  1. Fetch RSS from 4 sources
  2. Filter for: user's district name, "ଓଡ଼ିଶା", key topics
  3. Claude summarizes top 3-4 stories in 2-3 lines each
  4. Outputs bilingual: Odia primary, English secondary
  5. Stores in daily_content table

Example output:
  "ଭୁବନେଶ୍ୱରରେ ନୂଆ ବସ ସେବା ଆରମ୍ଭ — ନନ୍ଦନକାନନ ରୁଟରେ ୧୦ଟି ବସ ଚଳାଚଳ ହେବ।
   New bus service in Bhubaneswar — 10 buses on Nandankanan route."
```

---

## 8. SUNRISE / SUNSET — No API Needed

### Calculated Locally on Device

```typescript
// Use 'suncalc' npm package (2KB, no API call)
import SunCalc from 'suncalc';

const times = SunCalc.getTimes(new Date(), lat, lon);
// times.sunrise = Date object
// times.sunset = Date object

// Works 100% offline — pure math, no internet needed
```

| District | Lat | Lon |
|----------|-----|-----|
| Bhubaneswar | 20.2961 | 85.8245 |
| Puri | 19.8135 | 85.8312 |
| Cuttack | 20.4625 | 85.8830 |
| ... (30 districts pre-stored in app) | | |

---

## Complete API Summary

| # | Data | Source | API Type | Cost | Frequency | Calls/Day |
|---|------|--------|----------|------|-----------|-----------|
| 1 | Current Weather | OpenWeatherMap | REST JSON | FREE | 4x/day × 30 districts | 120 |
| 2 | 7-Day Forecast | OpenWeatherMap | REST JSON | FREE | 2x/day × 30 districts | 60 |
| 3 | Cyclone Alerts | IMD | HTML scrape | FREE | Every 6 hours | 4 |
| 4 | Mandi Prices | data.gov.in | REST JSON | FREE | 1x/day × 30 districts | 30 |
| 5 | Odia Calendar | Pre-computed | None (DB) | FREE | 0 | 0 |
| 6 | Festivals | Static data | None (DB) | FREE | 0 | 0 |
| 7 | Holidays | Static data | None (DB) | FREE | 0 | 0 |
| 8 | Govt Schemes | Web scrape | HTML scrape | FREE | Weekly | ~1 |
| 9 | News Digest | RSS feeds | XML/RSS | FREE | 1x/day | 4 |
| 10 | Sunrise/Sunset | SunCalc lib | None (math) | FREE | 0 | 0 |
| 11 | Odia Weather Text | Claude API | API | ~Rs 500/mo | With weather calls | ~180 |
| | **TOTAL** | | | **~Rs 500/mo** | | **~400/day** |

---

## Data Flow: End-to-End Example

### "User opens app at 7 AM in Balangir"

```
WHAT ALREADY HAPPENED (before user woke up):

  05:00 → Festival Agent ran
         → Checked: any festival today? No.
         → Checked: festival in 3 days? Yes — Ram Navami
         → Updated daily_content with reminder text

  06:00 → Content Agent ran
         → Generated Odia proverb: "ଯାହା ବୁଣିବ ତାହା ଲୁଣିବ"
         → Generated farming tip for Chaitra/Summer
         → Stored in daily_content

  06:30 → Weather Agent ran
         → Called OpenWeatherMap for Balangir (lat:20.72, lon:83.48)
         → Got: temp=28, forecast_high=38, condition=Clear
         → Claude generated: "ଆଜି ଗରମ ପଡ଼ିବ, ୩୮° ପର୍ଯ୍ୟନ୍ତ ଯିବ।
            ପାଣି ବେଶୀ ପିଅନ୍ତୁ।"
         → Agri tip: "ଗ୍ରୀଷ୍ମ ସମୟ — ପଲାଣ୍ଡୁ ଓ ଲଙ୍କା ବୁଣିବାର ଶେଷ ସମୟ"
         → Stored in weather table (district_id=balangir, date=today)

  07:00 → News Agent ran
         → Fetched RSS from Sambad, Dharitri
         → Found 1 Balangir-related story
         → Summary: "ବଲାଙ୍ଗୀର ଜିଲ୍ଲାରେ ନୂଆ ପାନୀୟ ଜଳ ପ୍ରକଳ୍ପ ଅନୁମୋଦିତ"

  08:00 → Mandi Agent ran
         → Called data.gov.in for Balangir mandi
         → Got: Rice=₹22/kg, Onion=₹35/kg, Tomato=₹15/kg
         → Stored in mandi_prices

WHAT HAPPENS WHEN USER OPENS APP AT 7 AM:

  App → Supabase REST API:

  1. GET /rest/v1/odia_calendar?date=eq.2026-04-04
     → Returns: ୨୧ ଚୈତ୍ର ୧୯୪୮, ବସନ୍ତ, sunrise/sunset

  2. GET /rest/v1/weather?district_id=eq.balangir&date=eq.2026-04-04
     → Returns: 28°C, forecast 38°C, "ଆଜି ଗରମ ପଡ଼ିବ..."

  3. GET /rest/v1/festivals?date=gte.2026-04-04&date=lte.2026-04-30&order=date
     → Returns: Ram Navami (Apr 5), Pana Sankranti (Apr 14)...

  4. GET /rest/v1/holidays?date=gte.2026-04-04&order=date&limit=3
     → Returns: next 3 upcoming holidays

  5. GET /rest/v1/daily_content?date=eq.2026-04-04
     → Returns: proverb, farming tip, scheme alert, news digest

  Total: 5 lightweight Supabase calls
  Data size: ~2-3 KB total
  Time: < 500ms on 3G

  ALL data cached in local SQLite → next open = INSTANT (0 API calls)
```

---

## API Keys You Need to Get (all free)

| # | Service | Signup URL | Key Type | Time to Get |
|---|---------|-----------|----------|-------------|
| 1 | OpenWeatherMap | openweathermap.org/api | API Key | Instant |
| 2 | data.gov.in | data.gov.in/user/register | API Key | Instant |
| 3 | Supabase | supabase.com | Project URL + anon key | Instant |
| 4 | Firebase (FCM) | console.firebase.google.com | Server key | 5 min |
| 5 | Claude API | console.anthropic.com | API Key | Instant |

**Total signup time: ~15 minutes. Total cost: Rs 0.**

---

## Offline Strategy

| Data | Offline Behavior | Sync Frequency |
|------|-----------------|----------------|
| Odia Calendar | Full year pre-loaded in app | Never (static) |
| Festivals | Full year pre-loaded | Monthly update check |
| Holidays | Full year pre-loaded | Monthly update check |
| Weather | Last fetched data shown with "ଶେଷ ଅପଡେଟ: ୨ ଘଣ୍ଟା ଆଗ" | When online |
| Mandi Prices | Last fetched shown with timestamp | When online |
| News | Last fetched shown | When online |

**Calendar, festivals, holidays = 100% offline. Weather, prices, news = cached + stale indicator.**
