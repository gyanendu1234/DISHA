# Odisha Sahayaka — Technical Architecture

## Design Principles
1. **Near-zero cost at launch** — pay only when you grow
2. **AI agents manage content, not humans** — festivals, weather, mandi prices all automated
3. **Offline-first** — village users have patchy internet
4. **APK under 5MB** — low-end phones have 16-32GB storage
5. **Works on Android 8+** — covers 95% of budget phones in India

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    USERS                             │
│  Android App (React Native / Expo)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ SQLite   │ │ Offline  │ │ Push     │            │
│  │ Cache DB │ │ Calendar │ │ Notif    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS (only when online)
                   ▼
┌─────────────────────────────────────────────────────┐
│              SUPABASE (Backend-as-a-Service)          │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Postgres │ │ Auth     │ │ Edge     │ │ Storage│ │
│  │ Database │ │ (free)   │ │ Functions│ │ (images│ │
│  │          │ │          │ │ (Deno)   │ │ audio) │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Realtime │ │ Cron Jobs│                          │
│  │ (push)   │ │ (pg_cron)│                          │
│  └──────────┘ └──────────┘                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              AI AGENT LAYER                          │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │  Claude Agent (via Claude Code / SDK)     │       │
│  │                                           │       │
│  │  Daily Jobs:                              │       │
│  │  • Fetch weather → write to Supabase      │       │
│  │  • Fetch mandi prices → write to Supabase │       │
│  │  • Generate Odia content → store           │       │
│  │  • Check festival calendar → send notifs   │       │
│  │                                           │       │
│  │  Weekly Jobs:                             │       │
│  │  • Update scheme alerts                   │       │
│  │  • Generate farming tips for season       │       │
│  │  • Curate district news digest            │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  Data Sources (free APIs):                           │
│  • OpenWeatherMap (free 1000 calls/day)              │
│  • IMD RSS feeds (free)                              │
│  • Agmarknet (mandi prices, free)                    │
│  • data.gov.in (govt schemes, free)                  │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack — Final Choices

### Mobile App

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | **Expo (React Native)** | One codebase → Android + iOS. Expo EAS builds free for open-source. No Mac needed for Android builds |
| **Language** | TypeScript | AI agents write better TS than JS — type safety helps agents not break things |
| **Offline DB** | **WatermelonDB** (on top of SQLite) | Sync-ready, fast on low-end devices, offline-first by design |
| **State** | Zustand | Tiny (1KB), simple, AI agents can reason about it easily |
| **Navigation** | Expo Router (file-based) | Simple folder structure — AI agent just creates a file to add a screen |
| **Push Notifications** | Expo Notifications + FCM | Free tier handles 100K+ users |
| **OTA Updates** | Expo Updates (EAS) | Push content/UI fixes without Play Store review — critical for speed |
| **Odia Font** | Noto Sans Odia (bundled) | Guaranteed rendering even on phones without Odia font |
| **APK Size** | Target: < 8MB | Expo managed workflow keeps it lean |

### Backend

| Layer | Choice | Why Not Others | Cost |
|-------|--------|----------------|------|
| **Database + Auth + API** | **Supabase** (free tier) | Firebase = vendor lock-in, harder for AI agents. Supabase = standard Postgres + REST API that Claude can directly query/write | **FREE** up to 500MB DB, 1GB storage, 50K monthly active users |
| **Edge Functions** | Supabase Edge Functions (Deno) | No server to manage. AI agent writes a function → deploy | **FREE** 500K invocations/month |
| **File Storage** | Supabase Storage | Audio files (puja bhajan), festival images | **FREE** 1GB |
| **Cron/Scheduling** | pg_cron (in Supabase) + Claude Scheduled Tasks | Database-level cron for data refresh. Claude agent for content generation | **FREE** |
| **Push Delivery** | FCM (Firebase Cloud Messaging) | Industry standard, unlimited free | **FREE** |

### AI Agent Layer

| Agent | Tool | Job | Schedule |
|-------|------|-----|----------|
| **Weather Agent** | Claude Code + OpenWeatherMap API | Fetch weather for 30 Odisha districts, write conversational Odia descriptions, store in Supabase | Every 6 hours |
| **Festival Agent** | Claude Code + static Panchang data | Calculate upcoming festivals, generate significance text in Odia/English, prepare push notification content | Daily at 5 AM |
| **Mandi Agent** | Claude Code + Agmarknet scraper | Fetch vegetable/rice/dal prices for Odisha mandis, format in Odia | Daily at 8 AM |
| **Content Agent** | Claude Code | Generate "Odia proverb of the day", farming tips for current season, scheme alerts | Daily at 6 AM |
| **News Agent** | Claude Code + RSS/web scrape | Curate 3-4 line district news digest in Odia from Sambad/Dharitri/Pragativadi | Daily at 7 AM |
| **Ops Agent** | Claude Code | Monitor error logs, check if other agents ran successfully, alert if something failed | Every 12 hours |

---

## Database Schema (Supabase Postgres)

```sql
-- Core tables

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name_or TEXT NOT NULL,        -- ଖୋର୍ଦ୍ଧା
  name_en TEXT NOT NULL,        -- Khordha
  lat DECIMAL, lon DECIMAL
);

CREATE TABLE festivals (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name_or TEXT NOT NULL,
  name_en TEXT NOT NULL,
  odia_month TEXT,              -- ଚୈତ୍ର
  tithi TEXT,
  significance_or TEXT,
  significance_en TEXT,
  traditions_or TEXT[],
  is_bank_holiday BOOLEAN DEFAULT FALSE,
  is_govt_holiday BOOLEAN DEFAULT FALSE,
  is_odisha_specific BOOLEAN DEFAULT FALSE,
  image_url TEXT
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  district_id INTEGER REFERENCES districts(id),
  date DATE NOT NULL,
  temp_current DECIMAL,
  temp_high DECIMAL,
  temp_low DECIMAL,
  feels_like DECIMAL,
  humidity INTEGER,
  wind_speed DECIMAL,
  rain_chance INTEGER,
  condition TEXT,               -- sunny, cloudy, rainy
  description_or TEXT,          -- ଗରମ ଲାଗୁଛି ଭାଇ!
  description_en TEXT,
  hourly JSONB,                 -- [{time, temp, icon, desc_or}]
  forecast_7day JSONB,
  agri_tips_or TEXT[],          -- farming tips in Odia
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, date)
);

CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name_or TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT CHECK (type IN ('bank', 'govt', 'both')),
  is_odisha_specific BOOLEAN DEFAULT FALSE
);

CREATE TABLE mandi_prices (
  id SERIAL PRIMARY KEY,
  district_id INTEGER REFERENCES districts(id),
  date DATE NOT NULL,
  commodity_or TEXT,            -- ଚାଉଳ
  commodity_en TEXT,            -- Rice
  price DECIMAL,               -- per kg/quintal
  unit TEXT,
  market_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_content (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  proverb_or TEXT,              -- ଆଜିର କଥା
  proverb_en TEXT,
  farming_tip_or TEXT,
  farming_tip_en TEXT,
  scheme_alert_or TEXT,
  scheme_alert_en TEXT
);

CREATE TABLE odia_calendar (
  date DATE PRIMARY KEY,
  odia_day INTEGER,             -- ୨୧
  odia_month TEXT,              -- ଚୈତ୍ର
  odia_year INTEGER,            -- ୧୯୪୬
  era TEXT DEFAULT 'ଶକାବ୍ଦ',
  season_or TEXT,               -- ବସନ୍ତ
  season_en TEXT,               -- Spring
  sunrise TIME,
  sunset TIME,
  nakshatra TEXT,
  tithi TEXT
);

-- User tables (Phase 3+)

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT,
  district_id INTEGER REFERENCES districts(id),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'ghar_sanga', 'paribara')),
  plan_expires_at TIMESTAMPTZ,
  language TEXT DEFAULT 'both' CHECK (language IN ('or', 'en', 'both')),
  font_size TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_links (
  id SERIAL PRIMARY KEY,
  parent_user_id UUID REFERENCES users(id),
  child_user_id UUID REFERENCES users(id),
  relationship TEXT,            -- son, daughter
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  amount INTEGER,               -- in paisa
  razorpay_sub_id TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

---

## Cost Projection

### Phase 1: Launch (0 to 10K users)

| Item | Cost/Month |
|------|-----------|
| Supabase Free Tier | Rs 0 |
| Expo EAS Build (free tier) | Rs 0 |
| OpenWeatherMap Free (1000 calls/day) | Rs 0 |
| Google Play Developer Account | Rs 2,100 (one-time) |
| Claude API for agents (~1000 calls/day) | Rs 500-800 |
| Domain (odishasahayaka.in) | Rs 500/year |
| **TOTAL** | **~Rs 800/month** |

### Phase 2: Growth (10K to 50K users)

| Item | Cost/Month |
|------|-----------|
| Supabase Pro (8GB DB, 100GB storage) | Rs 2,100 ($25) |
| OpenWeatherMap Paid (100K calls/day) | Rs 0 (still free) |
| Claude API (heavier usage) | Rs 2,000 |
| FCM / Push | Rs 0 |
| **TOTAL** | **~Rs 4,100/month** |

### Phase 3: Revenue (50K+ users, 2000 subscribers)

| Item | Cost/Month | Revenue/Month |
|------|-----------|--------------|
| Supabase Pro | Rs 2,100 | |
| Claude API | Rs 3,000 | |
| Storage (audio) | Rs 500 | |
| **Total Cost** | **Rs 5,600** | |
| 1000 × Rs 29 (Ghar Sanga) | | Rs 29,000 |
| 500 × Rs 99 (Paribara) | | Rs 49,500 |
| Hyperlocal ads (5 districts) | | Rs 10,000 |
| **Total Revenue** | | **Rs 88,500** |
| **Profit** | | **Rs 82,900/month** |

---

## AI Agent Management — How It Works

```
┌─────────────────────────────────────────┐
│         YOU (Gyan) — Operator            │
│                                          │
│  "Update festival data for Rath Yatra"   │
│  "Add new district: Mayurbhanj"          │
│  "Change weather tone to more casual"    │
│                                          │
│          ↓ Natural language               │
├─────────────────────────────────────────┤
│      MANAGER AGENT (Claude Code)         │
│                                          │
│  • Understands your instruction          │
│  • Decides which sub-agent to trigger    │
│  • Writes code if schema change needed   │
│  • Deploys Edge Function if needed       │
│  • Verifies data in Supabase             │
│  • Reports back: "Done. 47 festivals     │
│    updated, Rath Yatra now shows         │
│    Gundicha temple photo."               │
│                                          │
├─────────────────────────────────────────┤
│      SCHEDULED AGENTS (auto-run)         │
│                                          │
│  05:00  Festival Agent                   │
│  06:00  Content Agent (proverb, tips)    │
│  06:30  Weather Agent (30 districts)     │
│  08:00  Mandi Agent (prices)             │
│  09:00  News Agent (district digest)     │
│  12:00  Weather Agent (refresh)          │
│  18:00  Weather Agent (evening update)   │
│  22:00  Ops Agent (health check)         │
│                                          │
│  All write directly to Supabase.         │
│  App pulls from Supabase.                │
│  No human in the loop.                   │
└─────────────────────────────────────────┘
```

### What AI Agents Can Do Without You

| Task | Agent Does It Automatically |
|------|----------------------------|
| Daily weather in Odia for 30 districts | Yes — fetches API, writes Odia description |
| Festival reminders + push notifications | Yes — reads festival table, schedules push via FCM |
| Mandi price updates | Yes — scrapes Agmarknet, formats, stores |
| "Odia proverb of the day" | Yes — generates from curated list or creates new |
| Farming tips per season | Yes — knows Odia month → season → crop cycle |
| Bug detection | Yes — Ops Agent checks error rates, alerts you |
| Content moderation | Yes — reviews generated content before publish |
| New festival entry | Yes — you say "add Raja festival", agent does the rest |

### What Needs You (Human-in-the-loop)

| Task | Why |
|------|-----|
| Pricing changes | Business decision |
| New feature design | Product decision |
| Partnership (mandi, local shops) | Relationship |
| Play Store submission | Account ownership |
| Payment gateway setup (Razorpay) | KYC/legal |

---

## Payment Integration

| Provider | Why | Min Amount | Fee |
|----------|-----|-----------|-----|
| **Razorpay** | Best for subscriptions in India, UPI + card + wallet | Rs 1 | 2% |
| Google Play Billing | Required for in-app on Play Store | - | 15% (first Rs 7.5L/year) |

**Strategy:** Use Razorpay for web/direct subscriptions (2% fee). Use Google Play Billing only because Play Store requires it for in-app purchases (15% cut). Push users to subscribe via website to save 13%.

---

## Folder Structure (Expo Project)

```
odisha-sahayaka/
├── app/                        # Expo Router (file-based routing)
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── index.tsx           # Home/Dashboard
│   │   ├── calendar.tsx        # Odia Calendar
│   │   ├── weather.tsx         # Weather
│   │   └── holidays.tsx        # Holidays
│   ├── festival/[id].tsx       # Festival detail (dynamic)
│   ├── settings.tsx            # Settings
│   └── _layout.tsx             # Root layout
├── components/
│   ├── HeroCard.tsx
│   ├── WeatherCard.tsx
│   ├── FestivalListItem.tsx
│   ├── HolidayItem.tsx
│   ├── CalendarGrid.tsx
│   ├── AgriTips.tsx
│   └── OdiaText.tsx            # Bilingual text component
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── offline.ts              # WatermelonDB sync
│   ├── odia-calendar.ts        # Odia date calculations
│   └── weather-phrases.ts      # Odia conversational weather
├── agents/                     # AI Agent scripts
│   ├── weather-agent.ts
│   ├── festival-agent.ts
│   ├── mandi-agent.ts
│   ├── content-agent.ts
│   └── ops-agent.ts
├── assets/
│   ├── fonts/NotoSansOdia.ttf
│   └── images/                 # Pattachitra SVGs
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge Functions
└── app.json                    # Expo config
```

---

## Why This Stack for AI Agent Management

| Requirement | How This Stack Delivers |
|-------------|------------------------|
| AI reads/writes data | Supabase REST API — Claude agents call it directly via HTTP |
| AI deploys code | Expo OTA updates — push JS bundle without Play Store |
| AI monitors health | Supabase dashboard + pg_cron health checks |
| AI generates content | Claude writes Odia text, stores in Postgres |
| AI handles errors | Ops Agent reads Supabase logs, retries failed jobs |
| Human override | You talk to Manager Agent in Claude Code — it does the rest |
| No DevOps needed | Supabase = managed Postgres, Expo = managed builds |
| Scales to 100K | Supabase Pro handles it; upgrade to Supabase Team if needed |
