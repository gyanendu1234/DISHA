-- ============================================================
-- WEATHER AGENT — Sample upsert query
-- Run by the Claude agent daily for each district
-- Uses: service_role key (NOT the anon key)
-- ============================================================

-- This is the UPSERT pattern the agent uses for each district.
-- The agent calls OpenWeatherMap, processes the data, then runs:

INSERT INTO weather (
  district_id, date,
  temp_current, temp_high, temp_low, feels_like,
  humidity, wind_speed, rain_chance,
  condition, icon_code,
  description_or, description_en,
  advice_or, advice_en,
  hourly, forecast_7day, agri_tips
) VALUES (
  19,                          -- district_id (Khordha/Bhubaneswar = 19)
  '2026-04-04',                -- today's date
  32.5, 36.0, 26.0, 35.8,     -- temp_current, high, low, feels_like
  55, 12.0, 15,                -- humidity%, wind km/h, rain_chance%
  'Clear', '01d',              -- OWM condition, icon_code
  'ଗରମ ଲାଗୁଛି!',             -- description_or
  'It''s hot today!',          -- description_en
  'ଛାଇରେ ରୁହନ୍ତୁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ।',  -- advice_or
  'Stay in shade, drink plenty of water.',  -- advice_en

  -- hourly: array of {time, temp, icon, condition, desc_or}
  '[
    {"time":"06:00","temp":28,"icon":"01d","condition":"Clear","desc_or":"ଠଣ୍ଡା ସକାଳ"},
    {"time":"09:00","temp":31,"icon":"01d","condition":"Clear","desc_or":"ଖରା ଲାଗୁଛି"},
    {"time":"12:00","temp":35,"icon":"01d","condition":"Clear","desc_or":"ଅତ୍ୟଧିକ ଗରମ"},
    {"time":"15:00","temp":36,"icon":"01d","condition":"Clear","desc_or":"ଅତ୍ୟଧିକ ଗରମ"},
    {"time":"18:00","temp":33,"icon":"02d","condition":"Clouds","desc_or":"ଟିକେ ଥଣ୍ଡା"},
    {"time":"21:00","temp":29,"icon":"01n","condition":"Clear","desc_or":"ଆରାମ ରାତ"}
  ]'::jsonb,

  -- forecast_7day
  '[
    {"date":"2026-04-05","day_or":"ରବି","day_en":"Sun","icon":"01d","temp_high":36,"temp_low":26,"condition":"Clear","desc_or":"ଗରମ"},
    {"date":"2026-04-06","day_or":"ସୋମ","day_en":"Mon","icon":"02d","temp_high":34,"temp_low":25,"condition":"Clouds","desc_or":"ମେଘୁଆ"},
    {"date":"2026-04-07","day_or":"ମଙ୍ଗଳ","day_en":"Tue","icon":"10d","temp_high":30,"temp_low":23,"condition":"Rain","desc_or":"ବର୍ଷା"},
    {"date":"2026-04-08","day_or":"ବୁଧ","day_en":"Wed","icon":"10d","temp_high":29,"temp_low":22,"condition":"Rain","desc_or":"ବର୍ଷା"},
    {"date":"2026-04-09","day_or":"ଗୁରୁ","day_en":"Thu","icon":"02d","temp_high":31,"temp_low":23,"condition":"Clouds","desc_or":"ମେଘୁଆ"},
    {"date":"2026-04-10","day_or":"ଶୁକ୍ର","day_en":"Fri","icon":"01d","temp_high":33,"temp_low":24,"condition":"Clear","desc_or":"ଖରା"},
    {"date":"2026-04-11","day_or":"ଶନି","day_en":"Sat","icon":"01d","temp_high":35,"temp_low":25,"condition":"Clear","desc_or":"ଗରମ"}
  ]'::jsonb,

  -- agri_tips
  '[
    {"tip_or":"ଗ୍ରୀଷ୍ମ ସମୟ — ଲଙ୍କା ଓ ଭେଣ୍ଡି ଲଗାଇବାର ଭଲ ସମୟ।","tip_en":"Summer — good time for chilli and okra planting.","icon":"🌶️"},
    {"tip_or":"ଅଧିକ ଗରମ — ସଞ୍ଜ ବେଳେ ସେଚ କରନ୍ତୁ।","tip_en":"Extreme heat — water crops in the evening.","icon":"🌡️"}
  ]'::jsonb
)
ON CONFLICT (district_id, date) DO UPDATE SET
  temp_current   = EXCLUDED.temp_current,
  temp_high      = EXCLUDED.temp_high,
  temp_low       = EXCLUDED.temp_low,
  feels_like     = EXCLUDED.feels_like,
  humidity       = EXCLUDED.humidity,
  wind_speed     = EXCLUDED.wind_speed,
  rain_chance    = EXCLUDED.rain_chance,
  condition      = EXCLUDED.condition,
  icon_code      = EXCLUDED.icon_code,
  description_or = EXCLUDED.description_or,
  description_en = EXCLUDED.description_en,
  advice_or      = EXCLUDED.advice_or,
  advice_en      = EXCLUDED.advice_en,
  hourly         = EXCLUDED.hourly,
  forecast_7day  = EXCLUDED.forecast_7day,
  agri_tips      = EXCLUDED.agri_tips,
  updated_at     = NOW();
