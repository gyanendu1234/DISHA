# Disha — ଦିଶା

**Your Daily Companion for Rural Odisha**  
Bilingual (Odia + English) Android app for village users — offline-first, designed for 2G internet and budget phones.

---

## What It Does

| Screen | What It Shows |
|--------|--------------|
| **Home** | Today's Odia date, sunrise/sunset, upcoming festivals, bank holidays |
| **Calendar** | Full Odia calendar grid with festivals and holidays marked |
| **Weather** | Current weather + 7-day forecast for the selected Odisha district |
| **Holidays** | Bank & government holiday list for the year |
| **Settings** | District selector, language (Odia / English / Both), font size, notification prefs |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK ~54 (React Native) |
| Language | TypeScript |
| Navigation | Expo Router v6 (file-based) |
| State | Zustand |
| Backend | Supabase (Postgres + REST) |
| Offline | Local cache via AsyncStorage |
| Sunrise/Sunset | SunCalc (fully offline) |
| Fonts | NotoSansOdia (bundled), Poppins (Google Fonts) |
| Notifications | Expo Notifications + FCM |
| Min Android | API 26 (Android 8.0) |

---

## Prerequisites

Install these **once** on your machine:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 LTS or 20 LTS | https://nodejs.org |
| npm | ships with Node | — |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI (for builds) | latest | `npm install -g eas-cli` |
| Git | any | https://git-scm.com |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |

> **macOS / Linux only** — to build iOS you also need Xcode 15+ and a Mac.

---

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get these values:**
1. Log in to [supabase.com](https://supabase.com)
2. Create a new project (free tier is enough)
3. Go to **Project Settings → API**
4. Copy **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
5. Copy **anon / public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## Database Setup (Supabase)

Run the schema file in Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Click **SQL Editor → New query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables: `states`, `districts`, `weather`, `festivals`, `holidays`, `odia_calendar`, `mandi_prices`, `daily_content`.

The `districts` table is pre-seeded with all 30 Odisha districts.

> Weather and festival data are populated by the AI agents described in `ARCHITECTURE.md`. For local testing, you can insert sample rows manually — see [Sample Data](#sample-data) below.

---

## Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/disha.git
cd disha
npm install
```

---

## Run on Device / Emulator

### Android Emulator (via Android Studio)

```bash
# Start an AVD from Android Studio first, then:
npm run android
```

### Physical Android Device (recommended for realistic testing)

1. Enable **Developer Options** on your phone (tap Build Number 7 times)
2. Enable **USB Debugging**
3. Connect via USB cable
4. Run:

```bash
npm run android
```

Expo will detect the device automatically. The app will install and launch.

### Expo Go (quickest — no build needed)

```bash
npm start
```

Scan the QR code with the **Expo Go** app (Android / iOS).

> Note: Expo Go does not support all native modules. The notification permission flow may behave differently. Use a development build for full fidelity.

---

## Build a Local APK (for sharing or device testing without USB)

### One-time EAS setup

```bash
eas login          # uses your Expo account
eas build:configure
```

### Development build (installable on any device, includes dev tools)

```bash
eas build --platform android --profile development
```

### Preview APK (closest to production, no Play Store needed)

```bash
eas build --platform android --profile preview
```

EAS will build in the cloud. When done, you get a download link for the `.apk` file.

---

## Project Structure

```
disha/
├── app/                     # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar
│   │   ├── index.tsx        # Home
│   │   ├── calendar.tsx     # Odia Calendar
│   │   ├── weather.tsx      # Weather
│   │   └── holidays.tsx     # Holidays
│   ├── festival/[id].tsx    # Festival detail (dynamic route)
│   ├── settings.tsx         # Settings
│   ├── onboarding.tsx       # First-run district picker
│   └── _layout.tsx          # Root layout + font loading
├── constants/
│   ├── theme.ts             # Colors, FontSize, Spacing, Radius
│   ├── odia.ts              # Odia numerals, month names, labels
│   ├── districts.ts         # All 30 Odisha districts (offline)
│   └── festivals.ts         # Local festival data fallback
├── lib/
│   ├── supabase.ts          # Supabase client + typed fetchers
│   ├── odia-calendar.ts     # Odia date calculations
│   ├── storage.ts           # AsyncStorage helpers
│   ├── weather-phrases.ts   # Odia weather descriptions
│   └── notifications.ts     # Push notification setup
├── store/
│   └── useAppStore.ts       # Zustand global state
├── supabase/
│   ├── schema.sql           # Full database schema + seed data
│   ├── weather_agent.sql    # Weather agent stored procedures
│   └── functions/
│       └── fetch-weather/   # Supabase Edge Function
├── assets/
│   ├── fonts/
│   │   └── Noto_Sans_Oriya/ # NotoSansOdia variable font
│   └── images/              # App icon, splash, adaptive icon
├── app.json                 # Expo config (package name, permissions)
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Key Design Decisions

- **Offline-first**: Districts, festivals, and holidays are bundled in `constants/`. Weather is fetched from Supabase and cached locally. The app works without internet for calendar/festival data.
- **Village users**: Minimum 16px body text, 44×44dp touch targets, bilingual labels on every element, large font option in settings.
- **Slow internet**: No images in critical paths. Weather data is a single JSON row (~3KB). No polling — data is fetched once and cached.
- **Odia font**: `NotoSansOdia` is bundled (not downloaded at runtime) so Odia script renders correctly on all Android phones regardless of system font.

---

## Sample Data

To test the app locally without running the AI agents, insert sample weather data:

```sql
-- Replace district_id 19 with any valid district (19 = Khordha/Bhubaneswar)
INSERT INTO weather (
  district_id, date, temp_current, temp_high, temp_low, feels_like,
  humidity, wind_speed, rain_chance, condition, icon_code,
  description_or, description_en, advice_or, advice_en,
  hourly, forecast_7day, agri_tips, updated_at
) VALUES (
  19,
  CURRENT_DATE,
  34, 38, 27, 36,
  72, 12, 20,
  'sunny', '01d',
  'ଆଜି ଗରମ ଅଛି। ଛାତା ନିଅନ୍ତୁ।',
  'Hot today. Carry an umbrella.',
  'ଦୁପହରରେ ଘରୁ ବାହାରନ୍ତୁ ନାହିଁ।',
  'Avoid going out in the afternoon.',
  '[{"time":"06:00","temp":28,"icon":"01d","condition":"sunny","desc_or":"ସକାଳ ଭଲ"},
    {"time":"12:00","temp":36,"icon":"01d","condition":"sunny","desc_or":"ଗରମ"},
    {"time":"18:00","temp":32,"icon":"02d","condition":"cloudy","desc_or":"ଆଂଶିକ ମେଘ"},
    {"time":"21:00","temp":29,"icon":"01n","condition":"clear","desc_or":"ରାତି ଠଣ୍ଡା"}]',
  '[{"date":"2026-04-20","day_or":"ସୋମ","day_en":"Mon","icon":"01d","temp_high":38,"temp_low":27,"condition":"sunny","desc_or":"ଗରମ"},
    {"date":"2026-04-21","day_or":"ମଙ୍ଗଳ","day_en":"Tue","icon":"10d","temp_high":34,"temp_low":25,"condition":"rainy","desc_or":"ବର୍ଷା ସମ୍ଭାବନା"}]',
  '[{"tip_or":"ଫସଲରେ ଜଳ ଦିଅନ୍ତୁ","tip_en":"Water your crops","icon":"💧"}]',
  NOW()
);
```

---

## Testing Steps

After the app is running, verify each screen:

### 1. Onboarding
- First launch shows district picker
- Select any district → saved to storage
- Second launch skips onboarding

### 2. Home Screen
- Odia date (e.g., "ଚୈତ୍ର ୨୯") shown in hero card
- Sunrise and sunset times shown (offline, via SunCalc)
- Upcoming festivals listed (from `constants/festivals.ts`)
- Tap a festival row → opens Festival Detail screen
- Tap ← or "ଫେରନ୍ତୁ" → returns to Home
- Tap settings icon (top right) → opens Settings

### 3. Calendar Screen
- Monthly grid with Odia day numbers
- Orange dot = festival on that day
- Previous / Next month arrows work
- Tap a day with a festival → modal or highlight

### 4. Weather Screen
- Shows weather for selected district
- If Supabase has data → live data shown with "ସତ୍ ସୂଚନା" badge
- If offline or no data → "No weather data" fallback shown (not a crash)
- Hourly scroll and 7-day forecast visible

### 5. Holidays Screen
- Full list of bank + govt holidays for the year
- Odia name primary, English secondary

### 6. Settings Screen
- Back button (←) returns to previous screen
- District dropdown expands / collapses
- District selection saves and reflects on Home/Weather
- Language toggle (Odia / English / Both) — persists across restarts
- Font size (Small / Medium / Large) — affects text size
- Notification toggles save state

### 7. Slow Network Test
- Enable "Network throttling" in Android Emulator (Extended Controls → Cellular → LTE or EDGE)
- App should load Home from cache instantly
- Weather screen shows stale data with cache age, not spinner forever

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `NotoSansOdia` not loading | Check `assets/fonts/Noto_Sans_Oriya/` exists and font is loaded in `app/_layout.tsx` |
| Supabase 401 errors | Check `.env` values are correct and the project is active |
| Weather shows nothing | Insert sample data (see above) or check `district_id` matches |
| Build fails on Windows | Ensure Android Studio + ANDROID_HOME env var set correctly |
| Expo Metro bundler crash | Delete `.expo/` folder and run `npm start` again |
| `react-native-reanimated` error | Ensure `babel.config.js` has `react-native-reanimated/plugin` as last plugin |

---

## Fonts Note

The app uses two font families:

| Font | File | Usage |
|------|------|-------|
| `NotoSansOdia` | `assets/fonts/Noto_Sans_Oriya/NotoSansOriya-VariableFont_wdth,wght.ttf` | All Odia script text |
| `NotoSansOdia-Bold` | Same variable font, weight 700 loaded separately | Odia headings |
| `Poppins` family | Loaded via `@expo-google-fonts/poppins` at runtime | English text |

Poppins requires a one-time internet download on first app launch. Subsequent launches use the cached copy.

---

## Useful Commands

```bash
npm start              # Start Metro bundler (Expo Go)
npm run android        # Run on Android device/emulator
npm run lint           # ESLint check
eas build --platform android --profile preview   # Build preview APK
eas build --platform android --profile production # Build for Play Store
```
