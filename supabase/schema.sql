-- ============================================================
-- DISHA APP — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. STATES  (for multi-state expansion)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,       -- 'OD', 'WB', 'TN' etc.
  name_local  TEXT NOT NULL,              -- 'ଓଡ଼ିଶା'
  name_en     TEXT NOT NULL,              -- 'Odisha'
  language    TEXT NOT NULL,              -- 'or', 'bn', 'ta'
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO states (id, code, name_local, name_en, language) VALUES
  (1, 'OD', 'ଓଡ଼ିଶା', 'Odisha', 'or')
ON CONFLICT (code) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. DISTRICTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS districts (
  id          SERIAL PRIMARY KEY,
  state_id    INT NOT NULL REFERENCES states(id),
  name_local  TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  division    TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lon         DOUBLE PRECISION NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);

INSERT INTO districts (id, state_id, name_local, name_en, division, lat, lon) VALUES
  (1,  1, 'ଅନୁଗୁଳ',      'Angul',      'Central',  20.8408, 85.1018),
  (2,  1, 'ବଲାଙ୍ଗୀର',     'Balangir',   'Northern', 20.7160, 83.4866),
  (3,  1, 'ବଲେଶ୍ୱର',      'Balasore',   'Northern', 21.4942, 86.9336),
  (4,  1, 'ବର୍ଗଡ଼',       'Bargarh',    'Northern', 21.3360, 83.6191),
  (5,  1, 'ଭଦ୍ରକ',       'Bhadrak',    'Northern', 21.0544, 86.5108),
  (6,  1, 'ବୌଦ୍ଧ',        'Boudh',      'Southern', 20.8449, 84.3240),
  (7,  1, 'କଟକ',         'Cuttack',    'Central',  20.4625, 85.8830),
  (8,  1, 'ଦେବଗଡ଼',      'Deogarh',    'Northern', 21.5353, 84.7377),
  (9,  1, 'ଢ଼େଙ୍କାନାଳ',   'Dhenkanal',  'Central',  20.6507, 85.5977),
  (10, 1, 'ଗଜପତି',       'Gajapati',   'Southern', 19.3254, 84.1017),
  (11, 1, 'ଗଞ୍ଜାମ',      'Ganjam',     'Southern', 19.3921, 84.9887),
  (12, 1, 'ଜଗତସିଂହପୁର',  'Jagatsinghpur','Central', 20.2573, 86.1707),
  (13, 1, 'ଜାଜପୁର',      'Jajpur',     'Northern', 20.8386, 86.3313),
  (14, 1, 'ଝାରସୁଗୁଡ଼ା',  'Jharsuguda', 'Northern', 21.8550, 84.0063),
  (15, 1, 'କଳାହାଣ୍ଡି',   'Kalahandi',  'Southern', 19.9068, 83.1672),
  (16, 1, 'କନ୍ଧମାଳ',     'Kandhamal',  'Southern', 20.4671, 84.2299),
  (17, 1, 'କେନ୍ଦ୍ରାପଡ଼ା', 'Kendrapara', 'Northern', 20.5019, 86.4240),
  (18, 1, 'କେନ୍ଦୁଝର',    'Keonjhar',   'Northern', 21.6290, 85.5811),
  (19, 1, 'ଖୋର୍ଧା',      'Khordha',    'Central',  20.1833, 85.8000),
  (20, 1, 'କୋରାପୁଟ',     'Koraput',    'Southern', 18.8135, 82.7126),
  (21, 1, 'ମଲ୍କାନଗିରି',  'Malkangiri', 'Southern', 18.3512, 81.8995),
  (22, 1, 'ମୟୂରଭଞ୍ଜ',    'Mayurbhanj', 'Northern', 21.9358, 86.7390),
  (23, 1, 'ନବରଙ୍ଗପୁର',   'Nabarangpur','Southern', 19.2295, 82.5466),
  (24, 1, 'ନୟାଗଡ଼',      'Nayagarh',   'Central',  20.1283, 85.0956),
  (25, 1, 'ନୂଆପଡ଼ା',     'Nuapada',    'Northern', 20.8083, 82.5395),
  (26, 1, 'ପୁରୀ',        'Puri',       'Central',  19.8134, 85.8312),
  (27, 1, 'ରାୟଗଡ଼ା',     'Rayagada',   'Southern', 19.1700, 83.4160),
  (28, 1, 'ସମ୍ବଲପୁର',    'Sambalpur',  'Northern', 21.4669, 83.9812),
  (29, 1, 'ସୁବର୍ଣ୍ଣପୁର', 'Subarnapur', 'Northern', 20.8308, 83.9113),
  (30, 1, 'ସୁନ୍ଦରଗଡ଼',   'Sundargarh', 'Northern', 22.1174, 84.0302)
ON CONFLICT DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 3. WEATHER  (updated daily by Claude agent)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather (
  id              BIGSERIAL PRIMARY KEY,
  district_id     INT NOT NULL REFERENCES districts(id),
  date            DATE NOT NULL,
  temp_current    REAL NOT NULL,          -- °C current temperature
  temp_high       REAL NOT NULL,          -- °C daily high
  temp_low        REAL NOT NULL,          -- °C daily low
  feels_like      REAL NOT NULL,          -- °C feels like
  humidity        INT NOT NULL,           -- % 0-100
  wind_speed      REAL NOT NULL,          -- km/h
  rain_chance     INT NOT NULL DEFAULT 0, -- % 0-100
  condition       TEXT NOT NULL,          -- OWM main: Clear|Clouds|Rain|Thunderstorm|Drizzle|Snow|Mist|Fog|Haze
  icon_code       TEXT NOT NULL,          -- OWM icon: 01d, 02d ...
  description_or  TEXT NOT NULL DEFAULT '',  -- Odia conversational phrase (set by agent)
  description_en  TEXT NOT NULL DEFAULT '',  -- English phrase
  advice_or       TEXT NOT NULL DEFAULT '',  -- Odia advice
  advice_en       TEXT NOT NULL DEFAULT '',  -- English advice
  hourly          JSONB NOT NULL DEFAULT '[]',       -- HourlyWeather[]
  forecast_7day   JSONB NOT NULL DEFAULT '[]',       -- DailyForecast[]
  agri_tips       JSONB NOT NULL DEFAULT '[]',       -- {tip_or, tip_en, icon}[]
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (district_id, date)
);

CREATE INDEX IF NOT EXISTS idx_weather_district_date ON weather(district_id, date DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weather_updated_at
  BEFORE UPDATE ON weather
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 4. FESTIVALS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS festivals (
  id                TEXT PRIMARY KEY,     -- e.g. 'pana-sankranti-2026'
  state_id          INT NOT NULL REFERENCES states(id),
  date              DATE NOT NULL,
  name_local        TEXT NOT NULL,         -- name in state language
  name_en           TEXT NOT NULL,
  odia_day          INT,
  odia_month        TEXT,
  odia_year         INT,
  tithi             TEXT,
  significance_local TEXT NOT NULL DEFAULT '',
  significance_en   TEXT NOT NULL DEFAULT '',
  traditions_local  JSONB NOT NULL DEFAULT '[]',  -- string[]
  traditions_en     JSONB NOT NULL DEFAULT '[]',  -- string[]
  is_bank_holiday   BOOLEAN NOT NULL DEFAULT FALSE,
  is_govt_holiday   BOOLEAN NOT NULL DEFAULT FALSE,
  is_state_specific BOOLEAN NOT NULL DEFAULT FALSE,
  emoji             TEXT NOT NULL DEFAULT '🪔',
  location          TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festivals_state_date ON festivals(state_id, date);

-- Seed Odisha 2026 festivals
INSERT INTO festivals
  (id, state_id, date, name_local, name_en, odia_day, odia_month, odia_year, tithi,
   significance_local, significance_en, traditions_local, traditions_en,
   is_bank_holiday, is_govt_holiday, is_state_specific, emoji, location)
VALUES
  ('ram-navami-2026', 1, '2026-04-05', 'ରାମ ନବମୀ', 'Ram Navami', 22, 'ଚୈତ୍ର', 1948, 'ଚୈତ୍ର ଶୁକ୍ଳ ନବମୀ',
   'ଭଗବାନ ଶ୍ରୀ ରାମଙ୍କ ଜନ୍ମ ଦିବସ। ଏହି ଦିନ ରାମ ମନ୍ଦିରରେ ବିଶେଷ ପୂଜା ଅର୍ଚ୍ଚନା ହୁଏ।',
   'Birthday of Lord Rama. Special prayers at Ram temples.',
   '["ଉପବାସ ରଖିବା","ରାମ ନାମ ଜପ","ସୁନ୍ଦରକାଣ୍ଡ ପାଠ","ମନ୍ଦିରରେ ଦର୍ଶନ"]',
   '["Fasting","Ram Naam chanting","Sundarkand recitation","Temple visit"]',
   FALSE, FALSE, FALSE, '🙏', NULL),

  ('pana-sankranti-2026', 1, '2026-04-14', 'ପଣା ସଂକ୍ରାନ୍ତି', 'Pana Sankranti', 1, 'ବୈଶାଖ', 1948, 'ମେଷ ସଂକ୍ରାନ୍ତି',
   'ଏହା ଓଡ଼ିଆ ନୂଆ ବର୍ଷ। ପଣା ଜଗନ୍ନାଥଙ୍କୁ ଅର୍ପଣ କରାଯାଏ।',
   'Odia New Year. Pana (special drink) is offered to Lord Jagannath and distributed to all.',
   '["ପଣା ପ୍ରସ୍ତୁତି ଓ ବିତରଣ","ଜଗନ୍ନାଥ ମନ୍ଦିରରେ ପୂଜା","ଘର ସଫା ଓ ରଙ୍ଗୋଳି","ନୂଆ ବର୍ଷ ଶୁଭେଚ୍ଛା"]',
   '["Pana preparation & sharing","Jagannath temple puja","House cleaning & rangoli","New Year wishes"]',
   TRUE, TRUE, TRUE, '🎊', 'Odisha'),

  ('ambedkar-jayanti-2026', 1, '2026-04-14', 'ଡ଼ଃ ଆମ୍ବେଦକର ଜୟନ୍ତୀ', 'Dr. Ambedkar Jayanti', 1, 'ବୈଶାଖ', 1948, NULL,
   'ଭାରତ ରତ୍ନ ଡ଼ଃ ଭୀମରାଓ ଆମ୍ବେଦକରଙ୍କ ଜନ୍ମ ଦିବସ।',
   'Birth anniversary of Dr. B.R. Ambedkar, architect of the Indian Constitution.',
   '["ଶ୍ରଦ୍ଧାଞ୍ଜଳି ଅର୍ପଣ","ସ୍ମୃତି ସଭା","ସାମାଜିକ ସଚେତନତା ର‌ୟାଲି"]',
   '["Tributes","Memorial gatherings","Social awareness rallies"]',
   TRUE, TRUE, FALSE, '🇮🇳', NULL),

  ('good-friday-2026', 1, '2026-04-03', 'ଗୁଡ଼ ଫ୍ରାଇଡ଼େ', 'Good Friday', 20, 'ଚୈତ୍ର', 1948, NULL,
   'ଯୀଶୁ ଖ୍ରୀଷ୍ଟଙ୍କ ସ୍ମୃତିରେ ଖ୍ରୀଷ୍ଟ ଧର୍ମାବଲମ୍ବୀ ମାନଙ୍କ ଦ୍ୱାରା ପାଳିତ ଦିବସ।',
   'Commemorates the crucifixion of Jesus Christ.',
   '["ଗିର୍ଜାଘରରେ ପ୍ରାର୍ଥନା","ଉପବାସ"]',
   '["Church prayers","Fasting","Processions"]',
   TRUE, FALSE, FALSE, '✝️', NULL),

  ('rath-yatra-2026', 1, '2026-06-20', 'ରଥ ଯାତ୍ରା', 'Rath Yatra', 6, 'ଆଷାଢ଼', 1948, 'ଆଷାଢ଼ ଶୁକ୍ଳ ଦ୍ୱିତୀୟା',
   'ଶ୍ରୀ ଜଗନ୍ନାଥ, ବଳଭଦ୍ର ଓ ସୁଭଦ୍ରାଙ୍କ ରଥ ଯାତ୍ରା। ବିଶ୍ୱର ସବୁଠାରୁ ବଡ଼ ରଥ ଉତ୍ସବ।',
   'Grand chariot festival of Lord Jagannath at Puri — world''s largest chariot festival.',
   '["ରଥ ଟଣା","ଛେରା ପହଁରା","ପୋଡ଼ପିଠା ଖାଇବା","୯ ଦିନ ଧରି ଉତ୍ସବ"]',
   '["Chariot pulling","Chhera Pahanra","Poda Pitha sweets","9-day celebration"]',
   TRUE, TRUE, TRUE, '🛕', 'Puri, Odisha'),

  ('nuakhai-2026', 1, '2026-09-01', 'ନୁଆଖାଇ', 'Nuakhai', 10, 'ଭାଦ୍ରବ', 1948, 'ଭାଦ୍ର ଶୁକ୍ଳ ପଞ୍ଚମୀ',
   'ପଶ୍ଚିମ ଓଡ଼ିଶାର ସବୁଠାରୁ ବଡ଼ ଫସଲ ଉତ୍ସବ। ନୂଆ ଚାଉଳ ଦେବୀଙ୍କୁ ଅର୍ପଣ।',
   'Biggest harvest festival of Western Odisha. New rice offered to deity.',
   '["ନୂଆ ଚାଉଳ ଅର୍ପଣ","ପ୍ରସାଦ ଖାଇବା","ଜୁହାର ଗ୍ରହଣ","ଲୋକ ନୃତ୍ୟ ଓ ଗୀତ"]',
   '["Offering new rice","Eating prasad","Blessing exchange","Folk dance & songs"]',
   FALSE, TRUE, TRUE, '🌾', 'Western Odisha'),

  ('durga-puja-2026', 1, '2026-10-02', 'ଦୁର୍ଗା ପୂଜା', 'Durga Puja', 10, 'ଆଶ୍ୱିନ', 1948, 'ଆଶ୍ୱିନ ଶୁକ୍ଳ ଦଶମୀ',
   'ମା ଦୁର୍ଗାଙ୍କ ବିଜୟ ଉତ୍ସବ। ଦଶ ଦିନ ଧରି ପୂଜା।',
   'Victory festival of Goddess Durga. 10-day celebration.',
   '["ଦୁର୍ଗା ପ୍ରତିମା ପୂଜା","ଧୁନୁଚି ନୃତ୍ୟ","ବିଜୟ ଦଶମୀ ଶୋଭାଯାତ୍ରା"]',
   '["Durga idol worship","Dhunuchi dance","Vijayadashami procession"]',
   TRUE, TRUE, FALSE, '🪔', NULL),

  ('kartika-purnima-2026', 1, '2026-11-05', 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା / ବୋଇତ ବନ୍ଦାଣ', 'Kartika Purnima / Boita Bandana',
   15, 'କାର୍ତ୍ତିକ', 1948, 'କାର୍ତ୍ତିକ ଶୁକ୍ଳ ପୂର୍ଣ୍ଣିମା',
   'ଓଡ଼ିଶାର ପ୍ରାଚୀନ ବଣିଜ ଯୁଗ ସ୍ମରଣ। ନଦୀ ଓ ସମୁଦ୍ରରେ ଗଡ଼ ଭସାଯାଏ।',
   'Celebrates Odisha seafaring heritage. Paper boats floated on rivers and sea at dawn.',
   '["ଭୋରରେ ଗଡ଼ ଭସେଇବା","ପ୍ରଦୀପ ଜ୍ୱାଳାଇ ପୂଜା","ସ୍ନାନ ଓ ଦୀପ ଦାନ"]',
   '["Floating paper boats at dawn","Lamp lighting","Holy bath & lamp donation"]',
   FALSE, FALSE, TRUE, '🪔', 'Rivers & coastal areas of Odisha'),

  ('diwali-2026', 1, '2026-10-20', 'ଦୀପାବଳୀ', 'Diwali', 28, 'ଆଶ୍ୱିନ', 1948, 'ଆଶ୍ୱିନ ଅମାବାସ୍ୟା',
   'ଆଲୋକର ଉତ୍ସବ। ଘରେ ଘରେ ମାଟି ଦୀପ ଜ୍ୱଳାଯାଏ।',
   'Festival of Lights. Clay lamps lit in every home.',
   '["ଦୀପ ସଜ୍ଜା","ଲକ୍ଷ୍ମୀ ପୂଜା","ଆତସ ବାଜି","ମିଠା ବିତରଣ"]',
   '["Lamp decoration","Lakshmi puja","Fireworks","Sweet distribution"]',
   TRUE, TRUE, FALSE, '✨', NULL),

  ('prathamashtami-2026', 1, '2026-11-25', 'ପ୍ରଥମାଷ୍ଟମୀ', 'Prathamashtami', 6, 'ମାର୍ଗଶିର', 1948, 'ମାର୍ଗଶିର ଶୁକ୍ଳ ଅଷ୍ଟମୀ',
   'ଘରର ବଡ଼ ସନ୍ତାନ (ଜ୍ୟେଷ୍ଠ ପୁତ୍ର ବା ପୁତ୍ରୀ) ଙ୍କ ଦୀର୍ଘ ଜୀବନ ପ୍ରାର୍ଥନା।',
   'Celebrates the first-born child. Special rituals and enduri pitha.',
   '["ବଡ଼ ଛୁଆ ର ପୂଜା","ଏଣ୍ଡୁରି ପିଠା","ବିଶେଷ ଭୋଜ"]',
   '["Worship of first-born","Enduri pitha","Special offerings"]',
   FALSE, FALSE, TRUE, '👶', NULL),

  ('makar-sankranti-2026', 1, '2026-01-14', 'ମକର ସଂକ୍ରାନ୍ତି', 'Makar Sankranti', 30, 'ପୌଷ', 1947, NULL,
   'ସୂର୍ଯ୍ୟ ମକର ରାଶିରେ ପ୍ରବେଶ। ଖଡ଼ ଖଡ଼ ପିଠା ଓ ତିଳ ମିଠା।',
   'Sun enters Capricorn. Rice cakes and sesame sweets prepared.',
   '["ଚୁଙ୍ଗୁଡ଼ି ପିଠା","ତିଳ ଲଡ଼ୁ","ନଦୀ ସ୍ନାନ"]',
   '["Chungudi pitha","Til ladoo","River bath"]',
   FALSE, FALSE, FALSE, '🌞', NULL)

ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 5. HOLIDAYS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holidays (
  id          TEXT PRIMARY KEY,
  state_id    INT NOT NULL REFERENCES states(id),
  date        DATE NOT NULL,
  name_local  TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('bank', 'govt', 'both')),
  is_state    BOOLEAN NOT NULL DEFAULT FALSE,   -- state-specific vs national
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holidays_state_date ON holidays(state_id, date);

-- Seed Odisha 2026 holidays
INSERT INTO holidays (id, state_id, date, name_local, name_en, type, is_state) VALUES
  ('h1',  1, '2026-01-14', 'ମକର ସଂକ୍ରାନ୍ତି',      'Makar Sankranti',      'govt', TRUE),
  ('h2',  1, '2026-01-26', 'ଗଣତନ୍ତ୍ର ଦିବସ',        'Republic Day',         'both', FALSE),
  ('h3',  1, '2026-04-03', 'ଗୁଡ଼ ଫ୍ରାଇଡ଼େ',          'Good Friday',          'bank', FALSE),
  ('h4',  1, '2026-04-14', 'ଡ଼ଃ ଆମ୍ବେଦକର ଜୟନ୍ତୀ',  'Dr. Ambedkar Jayanti', 'both', FALSE),
  ('h5',  1, '2026-04-14', 'ପଣା ସଂକ୍ରାନ୍ତି',        'Pana Sankranti',       'govt', TRUE),
  ('h6',  1, '2026-05-01', 'ମେ ଦିବସ',               'May Day',              'both', FALSE),
  ('h7',  1, '2026-05-26', 'ବୁଦ୍ଧ ପୂର୍ଣ୍ଣିମା',       'Buddha Purnima',       'both', FALSE),
  ('h8',  1, '2026-06-20', 'ରଥ ଯାତ୍ରା',             'Rath Yatra',           'both', TRUE),
  ('h9',  1, '2026-08-15', 'ସ୍ୱାଧୀନତା ଦିବସ',         'Independence Day',     'both', FALSE),
  ('h10', 1, '2026-09-01', 'ନୁଆଖାଇ',                'Nuakhai',              'govt', TRUE),
  ('h11', 1, '2026-10-02', 'ଗାନ୍ଧି ଜୟନ୍ତୀ',          'Gandhi Jayanti',       'both', FALSE),
  ('h12', 1, '2026-10-02', 'ଦୁର୍ଗା ପୂଜା',            'Durga Puja',           'both', FALSE),
  ('h13', 1, '2026-10-20', 'ଦୀପାବଳୀ',               'Diwali',               'both', FALSE),
  ('h14', 1, '2026-11-14', 'ଶ୍ରୀ ଜଗନ୍ନାଥ ଜୟନ୍ତୀ',   'Jagannath Jayanti',    'govt', TRUE),
  ('h15', 1, '2026-12-25', 'ଖ୍ରୀଷ୍ଟ ଜନ୍ମ ଦିବସ',      'Christmas Day',        'both', FALSE)
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 6. MANDI PRICES  (updated daily by Claude agent)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mandi_prices (
  id              BIGSERIAL PRIMARY KEY,
  district_id     INT NOT NULL REFERENCES districts(id),
  date            DATE NOT NULL,
  commodity_local TEXT NOT NULL,     -- Odia name: ଧାନ
  commodity_en    TEXT NOT NULL,     -- English: Paddy
  price           NUMERIC(10,2) NOT NULL,  -- ₹ per quintal
  unit            TEXT NOT NULL DEFAULT 'quintal',
  market_name     TEXT NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (district_id, date, commodity_en, market_name)
);

CREATE INDEX IF NOT EXISTS idx_mandi_district_date ON mandi_prices(district_id, date DESC);


-- ────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE states       ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather      ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;

-- Public read access for app users (anon + authenticated)
CREATE POLICY "Public read states"       ON states       FOR SELECT USING (TRUE);
CREATE POLICY "Public read districts"    ON districts    FOR SELECT USING (TRUE);
CREATE POLICY "Public read weather"      ON weather      FOR SELECT USING (TRUE);
CREATE POLICY "Public read festivals"    ON festivals    FOR SELECT USING (TRUE);
CREATE POLICY "Public read holidays"     ON holidays     FOR SELECT USING (TRUE);
CREATE POLICY "Public read mandi"        ON mandi_prices FOR SELECT USING (TRUE);

-- Service role write access (used by Claude agent via service key — never exposed in app)
-- NOTE: The service_role key bypasses RLS automatically in Supabase,
-- so no explicit write policy needed. Just use the service key in the agent.


-- ────────────────────────────────────────────────────────────
-- 8. HELPFUL VIEWS
-- ────────────────────────────────────────────────────────────

-- Today's weather for all districts
CREATE OR REPLACE VIEW today_weather AS
SELECT w.*, d.name_local AS district_name_local, d.name_en AS district_name_en
FROM weather w
JOIN districts d ON d.id = w.district_id
WHERE w.date = CURRENT_DATE;

-- Upcoming festivals (next 30 days)
CREATE OR REPLACE VIEW upcoming_festivals AS
SELECT f.*, s.name_local AS state_name, s.code AS state_code
FROM festivals f
JOIN states s ON s.id = f.state_id
WHERE f.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY f.date;

-- Upcoming holidays (next 30 days)
CREATE OR REPLACE VIEW upcoming_holidays AS
SELECT h.*, s.name_local AS state_name
FROM holidays h
JOIN states s ON s.id = h.state_id
WHERE h.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY h.date;


-- ────────────────────────────────────────────────────────────
-- DONE — Verify with:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ────────────────────────────────────────────────────────────
