# Disha App — Deployment & Account Reference

Complete record of all accounts, configurations, and steps taken to publish the Disha app.

---

## Accounts Used

| Service | Username / Email | Notes |
|---|---|---|
| **Google Account** | gyanendu1197@gmail.com | Master account for all Google services |
| **Google Play Console** | gyanendu1197@gmail.com | Paid $25 one-time developer fee |
| **GitHub** | gyanendu1234 | Repo owner |
| **Expo / EAS** | gyanendu1197 | expo.dev account for cloud builds |
| **Supabase** | gyanendu1197@gmail.com | Backend database + auth |

---

## App Identifiers

| Field | Value |
|---|---|
| **App name** | Disha (ଦିଶା) |
| **Android package name** | `com.disha.odia.app` |
| **iOS bundle identifier** | `com.disha.odia.app` |
| **Expo project slug** | `disha` |
| **Expo project ID** | `4a161e8a-3cbf-45a1-bfbb-d538f100192a` |
| **Expo owner** | `gyanendu1197` |
| **GitHub repo** | https://github.com/gyanendu1234/DISHA |
| **Privacy policy URL** | https://gyanendu1234.github.io/DISHA/privacy-policy.html |
| **Data deletion URL** | https://gyanendu1234.github.io/DISHA/data-deletion.html |

> Note: `com.disha.app` was already taken on Play Store — that's why `com.disha.odia.app` was used.

---

## GitHub Setup

- Repo created at: https://github.com/gyanendu1234/DISHA
- Made **public** (required for free GitHub Pages hosting)
- GitHub Pages enabled: **main branch → /docs folder**
- Files hosted via Pages:
  - `docs/privacy-policy.html`
  - `docs/data-deletion.html`

---

## EAS / Expo Build Setup

- EAS CLI installed: `npm install -g eas-cli`
- Logged in with: `eas login` (gyanendu1197)
- `eas.json` configured for production Android AAB build
- `.npmrc` set to `legacy-peer-deps=true` (fixes peer dependency conflict from expo-router)
- Environment variables stored in EAS:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Build History

| Build | Result | Notes |
|---|---|---|
| Build 1 | Failed | Peer dependency conflict → fixed with .npmrc |
| Build 2 | Failed | Corrupt PNG files (66-byte stubs) → fixed with proper PNG generator |
| Build 3 | **Success** | Package name changed to com.disha.odia.app |
| Latest AAB | https://expo.dev/artifacts/eas/pFjA62SWcGhz9nBMd3jToe.aab | Ready to upload |

---

## Google Play Console Setup

### App Creation
- Console URL: https://play.google.com/console
- App type: **App** (not Game)
- Free or paid: **Free**
- Declaration: Agreed to Play App Signing and Developer Program Policies

### Store Listing Selections

**App details:**
- App name: Disha - ଦିଶା
- Short description: ଓଡ଼ିଶାର ଗ୍ରାମୀଣ ପରିବାର ପାଇଁ ଦୈନନ୍ଦିନ ସହାୟକ · Daily companion for rural Odisha families
- Category: **Lifestyle**
- Tags: Weather, Calendar, Family

**App access:** All or most functionality available without special access

**Ads:** No ads

**Content rating:**
- Category: All Other App Types (Utility)
- User Content Sharing: Yes (family messaging, invited friends only)
- All other questions: No
- **Final rating: Everyone / PEGI 3 / All ages**

**Target audience:** 18 and over

**Data safety:**
- Collects data: Yes
- Encrypted in transit: Yes
- Account creation: No (app does not allow account creation)
- Data deletion: Yes → https://gyanendu1234.github.io/DISHA/data-deletion.html
- Data types collected:
  - App activity → App interactions (push notification token)
  - Messages → Other in-app messages (family messaging)
- Data shared with third parties: No

**Privacy policy:** https://gyanendu1234.github.io/DISHA/privacy-policy.html

---

## App Configuration (app.json)

```json
{
  "name": "Disha",
  "slug": "disha",
  "version": "1.0.0",
  "android": {
    "package": "com.disha.odia.app",
    "versionCode": 1,
    "minSdkVersion": 23,
    "targetSdkVersion": 34
  },
  "ios": {
    "bundleIdentifier": "com.disha.odia.app"
  }
}
```

---

## Brand

| Element | Value |
|---|---|
| Primary color | `#C41C1C` (vermilion red) |
| Font (Odia) | NotoSansOdia-Bold |
| Font (English) | Poppins |
| Splash background | `#C41C1C` |
| Icon style | Red ring + white compass arrow (direction = Disha) |

---

## Play Store Release Steps (Checklist)

- [x] Google Play developer account created ($25 paid)
- [x] App created in Play Console
- [x] Content rating completed (Everyone / PEGI 3)
- [x] Data safety completed
- [x] Privacy policy published
- [x] Data deletion page published
- [x] AAB built via EAS (production)
- [ ] Store listing filled (descriptions, screenshots, feature graphic)
- [ ] AAB uploaded to Internal Testing track
- [ ] Internal testing release submitted
- [ ] Promoted to Production

---

## Supabase

- Project hosted at: supabase.com
- Login: gyanendu1197@gmail.com
- Anon key is `EXPO_PUBLIC_` prefix — safe to be in app bundle (protected by Row Level Security)
- Tables: districts, festivals, weather, holidays, mandi_prices, daily_content, odia_calendar, app_users, quick_messages, family_links

---

## Key Files in Repo

| File | Purpose |
|---|---|
| `app.json` | Expo config, package name, icons, colors |
| `eas.json` | EAS build + submit config |
| `.npmrc` | legacy-peer-deps=true (peer dep fix) |
| `.gitignore` | Excludes .env, android/, ios/, dist/ |
| `docs/privacy-policy.html` | Live privacy policy (GitHub Pages) |
| `docs/data-deletion.html` | Data deletion request page (GitHub Pages) |
| `lib/supabase.ts` | Supabase client |
| `lib/quickMessageService.ts` | Family messaging CRUD + push |
| `hooks/useDynamicFont.ts` | Font scaling (must be used in every screen) |

---

*Last updated: April 19, 2026*
