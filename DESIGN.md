# Odisha Sahayaka - Mobile App Design

## Context
A mobile app for Odisha village and rural district people — a daily "Sahayaka" (helper) that shows:
1. **Odia Calendar** — today's date in both English & Odia (Odia months like Pousha, Magha, Phalguna etc.), upcoming festivals/pujas, past events, significance — all in Odia/English mix
2. **Government & Bank Holidays** — full calendar of holidays
3. **Weather Forecast** — local weather in conversational Odia style (garam, barsa, thanda, pabana etc.)

Target audience: Rural Odisha villagers. Must be simple, visual, accessible.

---

## App Name Options
- **ଓଡ଼ିଶା ସହାୟକ** (Odisha Sahayaka)
- Tagline: "ଆପଣଙ୍କ ଦୈନିକ ସାଥୀ" (Your Daily Companion)

---

## Design System

### Color Palette
| Token | Color | Usage |
|-------|-------|-------|
| Primary | `#E85D04` (Saffron/Orange) | Headers, CTAs, festival highlights — inspired by temple marigolds |
| Primary Dark | `#C13A00` | Active states, pressed buttons |
| Secondary | `#1B4332` (Deep Green) | Calendar sections, nature/weather — Odisha's lush greenery |
| Accent | `#FFD166` (Gold/Turmeric) | Festival badges, puja highlights, star ratings |
| Background | `#FFF8F0` (Warm Cream) | Main background — like handmade paper |
| Surface | `#FFFFFF` | Cards, modals |
| Text Primary | `#1A1A2E` | Body text |
| Text Secondary | `#6B7280` | Captions, secondary info |
| Weather Blue | `#0077B6` | Weather section accent |
| Holiday Red | `#DC2626` | Holiday markers, alerts |
| Success Green | `#16A34A` | Filed/done status |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | **Noto Sans Odia** | 28sp | Bold |
| Section Header | Noto Sans Odia | 22sp | SemiBold |
| Card Title | Noto Sans Odia | 18sp | Medium |
| Body (Odia) | Noto Sans Odia | 16sp | Regular |
| Body (English) | Noto Sans / Inter | 14sp | Regular |
| Caption | Noto Sans Odia | 12sp | Regular |

> **Bilingual rule**: Odia text always primary (larger), English secondary (smaller, grey)

### Iconography
- Style: Rounded, filled icons with Odisha cultural motifs
- Custom icons for: Jagannath temple silhouette, paddy field, konark wheel, palm tree
- Weather: Animated Lottie icons (sun, clouds, rain, wind)

### Spacing & Layout
- Base unit: 8dp
- Card border radius: 16dp
- Card elevation: 2dp soft shadow
- Screen padding: 16dp horizontal
- Minimum touch target: 48x48dp (critical for rural users with rough hands)

---

## Screen Designs

---

### SCREEN 1: HOME / DASHBOARD (Main Screen)

```
┌─────────────────────────────────┐
│  ☰                    🔔  ⚙️    │  ← Top bar (hamburger, notifications, settings)
│                                 │
│  ┌─────────────────────────────┐│
│  │  🔆  ସୁପ୍ରଭାତ!              ││  ← Greeting (changes: ସୁପ୍ରଭାତ/ଶୁଭ ସନ୍ଧ୍ୟା)
│  │  ଶୁକ୍ରବାର, ୪ ଏପ୍ରିଲ ୨୦୨୬    ││  ← Full date in Odia
│  │  Friday, 4 April 2026       ││  ← English date below
│  │                             ││
│  │  ଓଡ଼ିଆ ତାରିଖ:               ││
│  │  ୨୧ ଚୈତ୍ର ୧୯୪୬ (ଶକାବ୍ଦ)    ││  ← Odia calendar date (Chaitra month)
│  │                             ││
│  │  🌅 ସୂର୍ଯ୍ୟୋଦୟ 5:42  🌇 6:18││  ← Sunrise/Sunset times
│  └─────────────────────────────┘│
│                                 │
│  ── ଆଜିର ବିଶେଷ ────────────── │  ← "Today's Special" section
│  ┌─────────────────────────────┐│
│  │ 🪔  ଚୈତ୍ର ମାସ ଚାଲିଛି       ││
│  │ Chaitra month is ongoing    ││
│  │                             ││
│  │ ⏭️ ଆସନ୍ତା: ପଣା ସଂକ୍ରାନ୍ତି    ││  ← Next upcoming: Pana Sankranti
│  │    (୧୪ ଏପ୍ରିଲ ୨୦୨୬)         ││     with date
│  │ ⏭️ ଆସନ୍ତା: ରାମ ନବମୀ        ││
│  │    (୫ ଏପ୍ରିଲ ୨୦୨୬)          ││
│  │                   ସବୁ ଦେଖନ୍ତୁ ➜││  ← "View All" link
│  └─────────────────────────────┘│
│                                 │
│  ── ଆଜିର ପାଣିପାଗ ───────────  │  ← "Today's Weather"
│  ┌─────────────────────────────┐│
│  │  ☀️        ୩୨°C             ││  ← Animated weather icon + temp
│  │  ଗରମ ଲାଗୁଛି!               ││  ← Conversational: "It's hot!"
│  │  ସନ୍ଧ୍ୟାରେ ଟିକେ ଥଣ୍ଡା ପଡ଼ିବ ││  ← "Evening will be cooler"
│  │  💨 ପବନ: ୧୨ km/h   💧 ୪୫%  ││  ← Wind + Humidity
│  │                   ବିସ୍ତୃତ ➜ ││  ← "Detailed" link
│  └─────────────────────────────┘│
│                                 │
│  ── ଛୁଟି ସୂଚନା ──────────────  │  ← "Holiday Info"
│  ┌─────────────────────────────┐│
│  │ 🏦 ଆସନ୍ତା ବ୍ୟାଙ୍କ ଛୁଟି:      ││
│  │ ୧୪ ଏପ୍ରିଲ — ଡ଼ଃ ଆମ୍ବେଦକର    ││
│  │             ଜୟନ୍ତୀ           ││
│  │ 🏛️ ସରକାରୀ ଛୁଟି:             ││
│  │ ୧୪ ଏପ୍ରିଲ — ପଣା ସଂକ୍ରାନ୍ତି    ││
│  │                   ସବୁ ଦେଖନ୍ତୁ ➜││
│  └─────────────────────────────┘│
│                                 │
│ ┌──────┬──────┬──────┬────────┐ │  ← Bottom Navigation Bar
│ │  🏠  │  📅  │  🌤️  │  🏛️   │ │
│ │ ଘର  │ପଞ୍ଜିକା│ପାଣିପାଗ│ ଛୁଟି  │ │
│ │ Home │Calendar│Weather│Holiday│ │
│ └──────┴──────┴──────┴────────┘ │
└─────────────────────────────────┘
```

**Key interactions:**
- Pull-to-refresh updates weather + calendar
- Tapping any card opens the detailed section
- Greeting changes by time of day
- Festival card shows countdown "ଆଉ ୧୦ ଦିନ" (10 days left)

---

### SCREEN 2: ଓଡ଼ିଆ ପଞ୍ଜିକା (Odia Calendar)

```
┌─────────────────────────────────┐
│  ←  ଓଡ଼ିଆ ପଞ୍ଜିକା               │  ← Header with back arrow
│     Odia Calendar               │
│                                 │
│  ┌─────────────────────────────┐│
│  │  ◀  ଚୈତ୍ର ୧୯୪୬ / Apr 2026  ▶ ││  ← Month switcher (Odia + English)
│  └─────────────────────────────┘│
│                                 │
│  ┌───┬───┬───┬───┬───┬───┬───┐ │
│  │ ର │ ସୋ│ ମ │ ବୁ│ ଗୁ│ ଶୁ│ ଶ │ │  ← Day headers (Odia abbreviations)
│  │Sun│Mon│Tue│Wed│Thu│Fri│Sat│ │     Rabi, Soma, Mangala, Budha, Guru, Shukra, Shani
│  ├───┼───┼───┼───┼───┼───┼───┤ │
│  │   │   │   │ 1 │ 2 │ 3 │🔴│ │  ← 🔴 = Holiday/Festival
│  │   │   │   │   │   │   │ 4 │ │
│  ├───┼───┼───┼───┼───┼───┼───┤ │
│  │ 5 │ 6 │ 7 │ 8 │ 9 │10 │11│ │
│  │🟡 │   │   │   │   │   │   │ │  ← 🟡 = Puja/special day
│  ├───┼───┼───┼───┼───┼───┼───┤ │
│  │12 │13 │🔴│15 │16 │17 │18│ │
│  │   │   │14 │   │   │   │   │ │  ← 14 April = Pana Sankranti (red)
│  ├───┼───┼───┼───┼───┼───┼───┤ │
│  │19 │20 │21 │22 │23 │24 │25│ │
│  ├───┼───┼───┼───┼───┼───┼───┤ │
│  │26 │27 │28 │29 │30 │   │   │ │
│  └───┴───┴───┴───┴───┴───┴───┘ │
│                                 │
│  ── ୧୪ ଏପ୍ରିଲ ──────────────── │  ← Tapped date detail
│  ┌─────────────────────────────┐│
│  │ 🪔 ପଣା ସଂକ୍ରାନ୍ତି              ││
│  │   (Pana Sankranti)          ││
│  │   ମହା ବିଷୁବ ସଂକ୍ରାନ୍ତି        ││
│  │                             ││
│  │ ଓଡ଼ିଆ ତାରିଖ: ୧ ବୈଶାଖ ୧୯୪୭   ││  ← Odia date
│  │                             ││
│  │ 📖 ମହତ୍ତ୍ୱ (Significance):    ││
│  │ ଏହା ଓଡ଼ିଆ ନୂଆ ବର୍ଷ। ଏହି      ││  ← Significance in Odia
│  │ ଦିନ ପଣା (ଏକ ବିଶେଷ ପାନୀୟ)    ││
│  │ ପ୍ରସ୍ତୁତ କରି ଜଗନ୍ନାଥଙ୍କୁ       ││
│  │ ଅର୍ପଣ କରାଯାଏ। ଘରେ ଘରେ       ││
│  │ ପଣା ତିଆରି ହୁଏ।               ││
│  │                             ││
│  │ This is Odia New Year. Pana ││  ← English translation
│  │ (a special drink) is prepared││
│  │ and offered to Lord          ││
│  │ Jagannath on this day.       ││
│  │                             ││
│  │ 🏦 ବ୍ୟାଙ୍କ ଛୁଟି: ହଁ           ││  ← Bank holiday: Yes
│  │ 🏛️ ସରକାରୀ ଛୁଟି: ହଁ          ││  ← Govt holiday: Yes
│  └─────────────────────────────┘│
│                                 │
│  ── ଏହି ମାସର ପର୍ବ ────────── │  ← "This month's festivals"
│  ┌─────────────────────────────┐│
│  │ 🟡 ୫ Apr  — ରାମ ନବମୀ       ││
│  │ 🔴 ୧୪ Apr — ପଣା ସଂକ୍ରାନ୍ତି    ││
│  │ 🟡 ୧୫ Apr — ଦଶହରା (ବସନ୍ତ)   ││
│  └─────────────────────────────┘│
│                                 │
│ ┌──────┬──────┬──────┬────────┐ │
│ │  🏠  │  📅  │  🌤️  │  🏛️   │ │
│ └──────┴──────┴──────┴────────┘ │
└─────────────────────────────────┘
```

**Odia Month Mapping (for reference):**
| Odia Month | Approx. English | Season |
|---|---|---|
| ବୈଶାଖ (Baishakha) | Apr-May | ଗ୍ରୀଷ୍ମ (Summer) |
| ଜ୍ୟେଷ୍ଠ (Jyeshtha) | May-Jun | ଗ୍ରୀଷ୍ମ (Summer) |
| ଆଷାଢ଼ (Ashadha) | Jun-Jul | ବର୍ଷା (Monsoon) |
| ଶ୍ରାବଣ (Shrabana) | Jul-Aug | ବର୍ଷା (Monsoon) |
| ଭାଦ୍ରବ (Bhadrab) | Aug-Sep | ବର୍ଷା (Monsoon) |
| ଆଶ୍ୱିନ (Ashwina) | Sep-Oct | ଶରତ (Autumn) |
| କାର୍ତ୍ତିକ (Kartika) | Oct-Nov | ଶରତ (Autumn) |
| ମାର୍ଗଶିର (Margashira) | Nov-Dec | ହେମନ୍ତ (Pre-winter) |
| ପୌଷ (Pousha) | Dec-Jan | ହେମନ୍ତ (Pre-winter) |
| ମାଘ (Magha) | Jan-Feb | ଶୀତ (Winter) |
| ଫାଲ୍ଗୁନ (Phalguna) | Feb-Mar | ଶୀତ (Winter) |
| ଚୈତ୍ର (Chaitra) | Mar-Apr | ବସନ୍ତ (Spring) |

---

### SCREEN 3: ପାଣିପାଗ (Weather Forecast)

```
┌─────────────────────────────────┐
│  ←  ପାଣିପାଗ                     │
│     Weather                     │
│                                 │
│  📍 ଭୁବନେଶ୍ୱର, ଓଡ଼ିଶା   [ବଦଳାନ୍ତୁ]│  ← Location + Change button
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │     ☀️  (large animated)     ││  ← Big animated weather icon
│  │                             ││
│  │       ୩୨°C                  ││  ← Temperature (large)
│  │  ଅନୁଭବ ହେଉଛି: ୩୬°C         ││  ← "Feels like: 36°C"
│  │                             ││
│  │  🌡️ ଗରମ ଲାଗୁଛି ଭାଇ!        ││  ← Conversational weather
│  │  ବାହାରକୁ ଯିବା ବେଳେ ଛତା     ││     "It's hot brother!"
│  │  ଧରନ୍ତୁ, ପାଣି ପିଅନ୍ତୁ।       ││     "Carry umbrella, drink water"
│  └─────────────────────────────┘│
│                                 │
│  ┌──────┬──────┬──────┬──────┐ │  ← Weather detail cards
│  │ 💨   │ 💧   │ 🌧️   │ 👁️   │ │
│  │ପବନ  │ଆର୍ଦ୍ରତା│ବର୍ଷା  │ଦୃଶ୍ୟତା│ │
│  │12km/h│ 45%  │ 10%  │ 6km  │ │
│  │Wind  │Humid │Rain  │Visib │ │
│  └──────┴──────┴──────┴──────┘ │
│                                 │
│  ── ଆଜି ଦିନସାରା ────────────  │  ← "Throughout today"
│  ┌─────────────────────────────┐│
│  │ 🌅 ସକାଳ    ୨୬°C  ☀️ ଖରା     ││
│  │ 🌞 ଦୁପହର   ୩୫°C  ☀️ ଗରମ     ││  ← "Afternoon 35°C Hot"
│  │ 🌆 ସନ୍ଧ୍ୟା   ୨୯°C  🌤️ ଟିକେ ଥଣ୍ଡା││  ← "Evening 29°C A bit cool"
│  │ 🌙 ରାତି    ୨୪°C  🌙 ଆରାମ    ││  ← "Night 24°C Comfortable"
│  └─────────────────────────────┘│
│                                 │
│  ── ୭ ଦିନର ପାଣିପାଗ ─────────  │  ← "7-day forecast"
│  ┌─────────────────────────────┐│
│  │ ଶୁ  ☀️  ୩୨° / ୨୪°  ଗରମ     ││
│  │ ଶ   ⛅  ୩୦° / ୨୩°  ମେଘୁଆ   ││  ← "Cloudy"
│  │ ର   🌧️  ୨୮° / ୨୨°  ବର୍ଷା!  ││  ← "Rain!"
│  │ ସୋ  🌧️  ୨୭° / ୨୧°  ବର୍ଷା   ││
│  │ ମ   ⛅  ୨୯° / ୨୨°  ମେଘୁଆ   ││
│  │ ବୁ  ☀️  ୩୧° / ୨୩°  ଖରା     ││
│  │ ଗୁ  ☀️  ୩୩° / ୨୫°  ଗରମ     ││
│  └─────────────────────────────┘│
│                                 │
│  ── 🌾 କୃଷି ପାଣିପାଗ ─────────  │  ← "Agricultural Weather"
│  ┌─────────────────────────────┐│   (UNIQUE to rural users!)
│  │ 🌱 ଆସନ୍ତା ୩ ଦିନରେ ବର୍ଷା     ││
│  │    ସମ୍ଭାବନା — ଧାନ ବୁଣିବାର   ││  ← "Rain likely in 3 days —
│  │    ଭଲ ସମୟ                   ││     good time for paddy sowing"
│  │ 🐛 ଅଧିକ ଆର୍ଦ୍ରତା — ଫସଲରେ     ││  ← "High humidity — watch
│  │    ପୋକ ଧ୍ୟାନ ଦିଅନ୍ତୁ          ││     for crop pests"
│  └─────────────────────────────┘│
│                                 │
│ ┌──────┬──────┬──────┬────────┐ │
│ │  🏠  │  📅  │  🌤️  │  🏛️   │ │
│ └──────┴──────┴──────┴────────┘ │
└─────────────────────────────────┘
```

**Conversational weather phrases (Odia):**
| Condition | Odia Phrase | Translation |
|---|---|---|
| Hot (>35°C) | ଗରମ ଲାଗୁଛି ଭାଇ! ପାଣି ପିଅନ୍ତୁ | "It's hot brother! Drink water" |
| Rainy | ବର୍ଷା ହେବ, ଛତା ନିଅନ୍ତୁ | "It'll rain, take umbrella" |
| Cold (<15°C) | ଥଣ୍ଡା ବହୁତ! ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ | "Very cold! Wear warm clothes" |
| Windy | ପବନ ଜୋରରେ ବହୁଛି | "Wind is blowing hard" |
| Pleasant | ବହୁତ ଭଲ ପାଣିପାଗ! | "Very nice weather!" |
| Cyclone alert | ⚠️ ବାତ୍ୟା ସତର୍କତା! ଘରେ ରୁହନ୍ତୁ | "Cyclone alert! Stay home" |

---

### SCREEN 4: ଛୁଟି (Holidays)

```
┌─────────────────────────────────┐
│  ←  ଛୁଟି ତାଲିକା                  │
│     Holidays                    │
│                                 │
│  ┌──────────────┬──────────────┐│
│  │  🏦 ବ୍ୟାଙ୍କ   │  🏛️ ସରକାରୀ  ││  ← Tab toggle
│  │  Bank        │  Govt        ││
│  └──────────────┴──────────────┘│
│                                 │
│  ┌────────────────────────┐     │
│  │ ▼ 2026  │  ▼ ସମସ୍ତ ମାସ │     │  ← Year + Month filter
│  └────────────────────────┘     │
│                                 │
│  ── ଏପ୍ରିଲ ୨୦୨୬ ─────────────  │
│  ┌─────────────────────────────┐│
│  │ 🔴 ୧୪ ଏପ୍ରିଲ (ମଙ୍ଗଳ)        ││
│  │   ଡ଼ଃ ଆମ୍ବେଦକର ଜୟନ୍ତୀ        ││
│  │   Dr. Ambedkar Jayanti      ││
│  │   🏦 ବ୍ୟାଙ୍କ ✓  🏛️ ସରକାରୀ ✓  ││  ← Both bank + govt
│  ├─────────────────────────────┤│
│  │ 🔴 ୧୪ ଏପ୍ରିଲ (ମଙ୍ଗଳ)        ││
│  │   ପଣା ସଂକ୍ରାନ୍ତି / ଓଡ଼ିଆ ନୂଆବର୍ଷ││
│  │   Pana Sankranti / Odia     ││
│  │   New Year                  ││
│  │   🏛️ ସରକାରୀ ✓  (ଓଡ଼ିଶା)     ││  ← State holiday
│  ├─────────────────────────────┤│
│  │ 🟡 ୧୮ ଏପ୍ରିଲ (ଶନି)          ││
│  │   ଗୁଡ୍ ଫ୍ରାଇଡ଼େ               ││
│  │   Good Friday               ││
│  │   🏦 ବ୍ୟାଙ୍କ ✓               ││
│  └─────────────────────────────┘│
│                                 │
│  ── ମେ ୨୦୨୬ ──────────────── │
│  ┌─────────────────────────────┐│
│  │ 🔴 ୧ ମେ (ଶୁକ୍ର)             ││
│  │   ମେ ଦିବସ / ଶ୍ରମିକ ଦିବସ      ││
│  │   May Day / Labour Day      ││
│  │   🏦 ✓  🏛️ ✓                ││
│  ├─────────────────────────────┤│
│  │ 🔴 ୨୬ ମେ (ମଙ୍ଗଳ)            ││
│  │   ବୁଦ୍ଧ ପୂର୍ଣ୍ଣିମା             ││
│  │   Buddha Purnima            ││
│  │   🏦 ✓  🏛️ ✓                ││
│  └─────────────────────────────┘│
│                                 │
│  ... (scrollable list)          │
│                                 │
│ ┌──────┬──────┬──────┬────────┐ │
│ │  🏠  │  📅  │  🌤️  │  🏛️   │ │
│ └──────┴──────┴──────┴────────┘ │
└─────────────────────────────────┘
```

---

### SCREEN 5: Festival/Puja Detail Page

```
┌─────────────────────────────────┐
│  ←  ପର୍ବ ବିବରଣୀ                 │
│                                 │
│  ┌─────────────────────────────┐│
│  │  [  🎨 Beautiful Pattachitra ││  ← Cultural illustration
│  │      style illustration     ││     (Pattachitra art style)
│  │      of the festival  ]     ││
│  └─────────────────────────────┘│
│                                 │
│  🪔 ରଥ ଯାତ୍ରା                    │  ← Festival name (Odia)
│  Rath Yatra                     │  ← English
│  ୨୦ ଜୁନ ୨୦୨୬ (ଶନିବାର)          │  ← Date
│  ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟା             │  ← Tithi (lunar date)
│                                 │
│  ── ମହତ୍ତ୍ୱ (Significance) ──── │
│  ┌─────────────────────────────┐│
│  │ ଶ୍ରୀ ଜଗନ୍ନାଥ, ବଳଭଦ୍ର ଓ       ││
│  │ ସୁଭଦ୍ରାଙ୍କ ରଥ ଯାତ୍ରା ପୁରୀ ଧାମରେ││
│  │ ଅନୁଷ୍ଠିତ ହୁଏ। ଏହା ବିଶ୍ୱର      ││
│  │ ସବୁଠାରୁ ବଡ଼ ରଥ ଉତ୍ସବ।        ││
│  │                             ││
│  │ The chariot festival of Lord ││
│  │ Jagannath, Balabhadra &     ││
│  │ Subhadra at Puri. It is the ││
│  │ world's largest chariot     ││
│  │ festival.                   ││
│  └─────────────────────────────┘│
│                                 │
│  ── ପରମ୍ପରା (Traditions) ────── │
│  ┌─────────────────────────────┐│
│  │ • ରଥ ଟଣା (Chariot pulling)  ││
│  │ • ଛେରା ପହଁରା (King sweeps)  ││
│  │ • ପୋଡ଼ପିଠା ଖାଇବା             ││
│  │ • ୯ ଦିନ ଧରି ଉତ୍ସବ            ││
│  └─────────────────────────────┘│
│                                 │
│  ── ଗୋଟିଏ ନଜରରେ ────────────  │  ← "At a glance"
│  ┌──────┬──────┬──────────────┐ │
│  │🏦 ଛୁଟି│🏛️ ଛୁଟି│📍 ପୁରୀ, ଓଡ଼ିଶା│ │
│  │  ହଁ  │  ହଁ  │ Main venue   │ │
│  └──────┴──────┴──────────────┘ │
│                                 │
│  [  🔔 ରିମାଇଣ୍ଡର ସେଟ କରନ୍ତୁ  ]  │  ← "Set Reminder" button
│                                 │
│ ┌──────┬──────┬──────┬────────┐ │
│ │  🏠  │  📅  │  🌤️  │  🏛️   │ │
│ └──────┴──────┴──────┴────────┘ │
└─────────────────────────────────┘
```

---

## Navigation Architecture

```
Bottom Nav (4 tabs):
├── 🏠 ଘର (Home)           → Dashboard with all summaries
├── 📅 ପଞ୍ଜିକା (Calendar)   → Full Odia calendar + festivals
│   └── Date tap            → Festival/Puja detail page
├── 🌤️ ପାଣିପାଗ (Weather)   → Detailed weather + agri advisory
└── 🏛️ ଛୁଟି (Holidays)     → Bank + Govt holiday list

Hamburger Menu (☰):
├── ⚙️ ସେଟିଂ (Settings)
│   ├── Language toggle (ଓଡ଼ିଆ / English / Both)
│   ├── District/Location selector
│   ├── Notification preferences
│   └── Font size (ଛୋଟ / ମଧ୍ୟମ / ବଡ଼)
├── 🔔 ସୂଚନା (Notifications)
├── 📖 ବିଷୟରେ (About)
└── 📤 ସେୟାର (Share app)
```

---

## Key Design Principles for Rural Odisha Users

| Principle | Implementation |
|---|---|
| **Large touch targets** | Min 48dp, buttons 56dp height, generous spacing |
| **Bilingual always** | Odia primary (large), English secondary (small, grey) |
| **Low data usage** | Cache aggressively, offline calendar works without internet |
| **Simple navigation** | 4 bottom tabs max, no deep nesting |
| **Conversational tone** | Weather in spoken Odia, not formal — "ଗରମ ଲାଗୁଛି ଭାଇ!" |
| **Cultural visuals** | Pattachitra-style illustrations, temple motifs, ikat patterns |
| **Font size option** | Settings allow ଛୋଟ/ମଧ୍ୟମ/ବଡ଼ (Small/Medium/Large) |
| **Offline first** | Calendar + holidays work offline; weather needs internet |
| **Agricultural relevance** | Weather includes farming tips — key for rural users |
| **Notification reminders** | Alert 1 day before festivals & holidays |

---

## Tech Stack Recommendation (for later implementation)

| Layer | Technology |
|---|---|
| Framework | React Native / Flutter |
| Calendar logic | Custom Odia Panchang calculation or API |
| Weather API | OpenWeatherMap (free tier) or IMD RSS feeds |
| Offline storage | SQLite / AsyncStorage |
| Notifications | Firebase Cloud Messaging |
| Illustrations | Custom Pattachitra-style SVGs |
| Font | Google Noto Sans Odia (free, excellent rendering) |
| Deployment | Google Play Store (APK also for sideloading) |

---

## Unique Differentiators

1. **🌾 Krushi Panipaag (Agricultural Weather)** — No other app gives farming tips alongside weather in Odia
2. **Conversational Odia weather** — Not dry data, but "ଗରମ ଲାଗୁଛି ଭାଇ!" style
3. **Full Odia Panchang integration** — Tithi, Nakshatra, Odia month, all mapped
4. **Pattachitra art style** — Visually unique, culturally rooted
5. **Offline calendar** — Works without internet in remote villages
6. **Font size controls** — Accessibility for elderly users
