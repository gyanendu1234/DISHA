#!/usr/bin/env node
// scripts/seed-panjika.js
// Usage: node scripts/seed-panjika.js [--force]
// Place Odia_Calendar_2026_Superset.json in the scripts/ folder first.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://mglepgrjqguxfiwklgup.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cePoJby3i-pVCWXZXwDLaA_-Gd4K-8-';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Load JSON ─────────────────────────────────────────────────────────────────
const jsonPath = process.argv.find(a => a.endsWith('.json')) || path.join(__dirname, 'Odia_Calendar_2026_Superset.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`ERROR: JSON file not found at: ${jsonPath}`);
  console.error('Place Odia_Calendar_2026_Superset.json in the scripts/ folder.');
  process.exit(1);
}
const { months } = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// ── Lookup sets ───────────────────────────────────────────────────────────────
const NATIONAL_HOLIDAY_DATES = new Set([
  '2026-01-26', // Republic Day
  '2026-04-02', // Mahavir Jayanti
  '2026-04-03', // Good Friday
  '2026-04-14', // Ambedkar Jayanti
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-10-17', // Diwali (Odisha bank holiday)
  '2026-11-03', // Diwali (alternative date in data)
  '2026-12-25', // Christmas
]);
const BANK_HOLIDAY_DATES = new Set([...NATIONAL_HOLIDAY_DATES]);

const ODIA_FESTIVAL_KEYWORDS = [
  'Pana Sankranti', 'Maha Vishuba', 'Raja Parba', 'Raja Sankranti',
  'Kumar Purnima', 'Boita Bandana', 'Dola Purnima', 'Dola Yatra',
  'Chitalagi', 'Gamha Purnima', 'Snana Yatra', 'Bahuda',
  'Rath Yatra', 'Gundicha', 'Ratha Yatra',
  'Pahili Raja', 'Bhudaha', 'Basi Raja', 'Basumati',
  'Nuakhai', 'Prathamastami',
];

const NON_RELIGIOUS_FESTIVALS = new Set([
  'New Year 2026', 'Republic Day', 'Independence Day',
  'Gandhi Jayanti', 'Ambedkar Jayanti', 'National Youth Day',
  'International Women\'s Day', 'International Yoga Day',
  'Martyrs\' Day', 'Parakram Diwas', 'Netaji Jayanti',
]);

// ── Builder: odia_panchanga_days ──────────────────────────────────────────────
function buildPanchangaDays(months) {
  const rows = [];
  for (const month of months) {
    for (const day of month.days) {
      rows.push({
        iso_date: day.iso_date,
        day_of_month: day.day,
        month_number: month.month_number,
        month_name: month.month,
        weekday: day.weekday,
        tithi: day.tithi || null,
        paksha: normalizePaksha(day.paksha),
        nakshatra: day.nakshatra || null,
        festival: day.festival || null,
        significance: day.significance || null,
        year: 2026,
      });
    }
  }
  return rows;
}

function normalizePaksha(paksha) {
  if (!paksha) return null;
  if (paksha.includes('Shukla')) return 'Shukla';
  if (paksha.includes('Krishna') || paksha.includes('Krushna')) return 'Krishna';
  return paksha.split(' ')[0] || null;
}

// ── Builder: odia_festivals ───────────────────────────────────────────────────
function buildFestivals(months) {
  const rows = [];
  const seen = new Set();

  for (const month of months) {
    for (const day of month.days) {
      if (!day.festival || !day.festival.trim()) continue;

      const festivalNames = day.festival
        .split(/[;,]/)
        .map(f => f.trim())
        .filter(Boolean);

      for (const name of festivalNames) {
        const key = `${day.iso_date}|${name}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const isNational = NATIONAL_HOLIDAY_DATES.has(day.iso_date);
        const isOdia = ODIA_FESTIVAL_KEYWORDS.some(k => name.includes(k));
        const isReligious = !NON_RELIGIOUS_FESTIVALS.has(name);

        rows.push({
          iso_date: day.iso_date,
          month_number: month.month_number,
          festival_name: name,
          festival_name_or: null,
          significance: day.significance || null,
          is_national_holiday: isNational,
          is_odia_specific: isOdia,
          is_religious: isReligious,
          is_bank_holiday: BANK_HOLIDAY_DATES.has(day.iso_date),
          year: 2026,
        });
      }
    }
  }
  return rows;
}

// ── Builder: odia_lunar_events ────────────────────────────────────────────────
function buildLunarEvents(months) {
  const rows = [];
  const seen = new Set(); // (iso_date, event_type)

  function add(isoDate, monthNum, type, name, paksha, significance, isMajor) {
    const key = `${isoDate}|${type}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      iso_date: isoDate,
      month_number: monthNum,
      event_type: type,
      event_name: name.slice(0, 100),
      event_name_or: null,
      paksha: paksha || null,
      significance: significance || null,
      is_major: isMajor,
      year: 2026,
    });
  }

  const MAJOR_EKADASHIS = new Set([
    'Nirjala Ekadashi', 'Devutthana Ekadashi', 'Prabodhini Ekadashi',
    'Mokshada Ekadashi', 'Jaya Ekadashi', 'Vaikunta Ekadashi',
  ]);

  for (const month of months) {
    for (const day of month.days) {
      const tithi = day.tithi || '';
      const festival = day.festival || '';
      const paksha = normalizePaksha(day.paksha);

      // Ekadashi
      if (tithi.includes('Ekadashi') || festival.includes('Ekadashi')) {
        const name = pickName(festival, 'Ekadashi') || 'Ekadashi';
        add(day.iso_date, month.month_number, 'ekadashi', name, paksha,
          day.significance, MAJOR_EKADASHIS.has(name));
      }

      // Amavasya
      if (tithi.includes('Amavasya') || tithi.includes('Amabasya') ||
          festival.toLowerCase().includes('amavasya') || festival.toLowerCase().includes('amabasya')) {
        const name = pickName(festival, ['Amavasya', 'Amabasya']) || 'Amavasya';
        add(day.iso_date, month.month_number, 'amavasya', name, 'Krishna',
          day.significance, true);
      }

      // Purnima
      if (tithi.includes('Purnima') || festival.includes('Purnima')) {
        const name = pickName(festival, 'Purnima') || 'Purnima';
        add(day.iso_date, month.month_number, 'purnima', name, 'Shukla',
          day.significance, true);
      }

      // Sankranti
      if (festival.includes('Sankranti')) {
        const name = pickName(festival, 'Sankranti') || 'Sankranti';
        add(day.iso_date, month.month_number, 'sankranti', name, null,
          day.significance, festival.includes('Makar') || festival.includes('Pana') || festival.includes('Mesha') || festival.includes('Maha Vishuba'));
      }

      // Pradosh
      if (festival.includes('Pradosh')) {
        const name = pickName(festival, 'Pradosh') || 'Pradosh Vrat';
        add(day.iso_date, month.month_number, 'pradosh', name, paksha,
          day.significance, false);
      }

      // Sankashti Chaturthi (Krishna paksha only)
      if (festival.includes('Sankashti') && paksha === 'Krishna') {
        const name = pickName(festival, 'Sankashti') || 'Sankashti Chaturthi';
        add(day.iso_date, month.month_number, 'chaturthi', name, 'Krishna',
          day.significance, false);
      }
    }
  }
  return rows;
}

function pickName(festival, keywords) {
  const kws = Array.isArray(keywords) ? keywords : [keywords];
  const parts = festival.split(/[;,]/).map(f => f.trim());
  for (const kw of kws) {
    const found = parts.find(p => p.includes(kw));
    if (found) return found;
  }
  return null;
}

// ── Builder: odia_auspicious_dates ────────────────────────────────────────────
function buildAuspiciousDates(months) {
  const rows = [];
  const seen = new Set();

  // Pattern 1: Parse from individual day notes (marriage muhurtas)
  const timePattern = /(?:Subha(?:\s+Bela|\s+Time)?|Marriage\s+(?:muhurta|Muhurta))\s+(\d{1,2}:\d{2}\s*(?:[AP]M)?)\s+(?:to|[-–])\s+(\d{1,2}:\d{2}\s*(?:[AP]M)?)/i;
  const nextDayPattern = /\((\w{3,9})\s+(\d{1,2})\)/; // "(Jan 10)"
  const nakshatraPattern = /(?:Nakshatra[:\s]+|,\s*Nak:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const nakshatraAlt = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+nakshatra/i;

  for (const month of months) {
    for (const day of month.days) {
      const notes = day.notes || '';
      const tMatch = notes.match(timePattern);
      if (!tMatch) continue;

      const key = `${day.iso_date}|marriage`;
      if (seen.has(key)) continue;
      seen.add(key);

      const nextDay = notes.match(nextDayPattern);
      const nMatch = notes.match(nakshatraPattern) || notes.match(nakshatraAlt);

      rows.push({
        iso_date: day.iso_date,
        month_number: month.month_number,
        date_type: 'marriage',
        subha_start: tMatch[1].trim(),
        subha_end: tMatch[2].trim(),
        subha_end_next_day: !!nextDay,
        nakshatra: nMatch ? nMatch[1].trim() : (day.nakshatra || null),
        tithi: day.tithi || null,
        notes: notes.replace(/^[^;]+;\s*/, '').slice(0, 200) || null,
        year: 2026,
      });
    }
  }

  // Pattern 2: Parse griha_pravesh from monthly_notes "[Annual reference]"
  // Format: "14 – Auspicious Griha Pravesh date" (em-dash may be garbled as â or â€")
  const gpDayPattern = /(\d{1,2})\s*[^\d\s\w]+\s*Auspicious\s+Griha\s+Pravesh/gi;

  for (const month of months) {
    const gpText = month.monthly_notes.griha_pravesh || '';
    const annualMatch = gpText.match(/\[Annual reference\][:\s]+(.+)/);
    if (!annualMatch) continue;

    const refText = annualMatch[1];
    let m;
    while ((m = gpDayPattern.exec(refText)) !== null) {
      const dayNum = parseInt(m[1]);
      if (dayNum < 1 || dayNum > 31) continue;
      const isoDate = `2026-${String(month.month_number).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const key = `${isoDate}|griha_pravesh`;
      if (seen.has(key)) continue;
      seen.add(key);

      const dayData = month.days.find(d => d.day === dayNum);
      rows.push({
        iso_date: isoDate,
        month_number: month.month_number,
        date_type: 'griha_pravesh',
        subha_start: null,
        subha_end: null,
        subha_end_next_day: false,
        nakshatra: dayData?.nakshatra || null,
        tithi: dayData?.tithi || null,
        notes: 'Auspicious Griha Pravesh muhurta',
        year: 2026,
      });
    }
    gpDayPattern.lastIndex = 0; // reset global regex
  }

  // Pattern 3: Parse marriage dates from monthly_notes where day notes didn't have them
  // Format in monthly notes: "May 5 (Tuesday, Anuradha nakshatra)" or "Jun 1 (Mon, Subha 11:38 PM - 06:56 AM Jun 2, Nak: Magha)"
  const monthAbbr = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12, January:1, February:2, March:3, April:4, June:6, July:7, August:8, September:9, October:10, November:11, December:12 };

  for (const month of months) {
    const mdText = month.monthly_notes.marriage_dates || '';
    // Match "MMM D (..." or "D MMM (...)"
    const entryPattern = /(?:(\w+)\s+(\d{1,2})|(\d{1,2})\s+(\w+))\s*\([^)]*\)/g;
    let em;
    while ((em = entryPattern.exec(mdText)) !== null) {
      let dayNum, monthNum;
      if (em[1] && monthAbbr[em[1]]) {
        monthNum = monthAbbr[em[1]];
        dayNum = parseInt(em[2]);
      } else if (em[4] && monthAbbr[em[4]]) {
        dayNum = parseInt(em[3]);
        monthNum = monthAbbr[em[4]];
      } else {
        continue;
      }
      if (!monthNum || !dayNum) continue;

      const isoDate = `2026-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const key = `${isoDate}|marriage`;
      if (seen.has(key)) continue;

      // Only add if it's in or near this month (avoid double-parsing)
      if (Math.abs(monthNum - month.month_number) > 1) continue;
      seen.add(key);

      // Extract time from the matched segment
      const segment = em[0];
      const segTimeMatch = segment.match(/(\d{1,2}:\d{2}\s*(?:[AP]M)?)\s*[-–to]+\s*(\d{1,2}:\d{2}\s*(?:[AP]M)?)/i);
      const segNakMatch = segment.match(/Nak(?:shatra)?[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);

      const dayData = month.days.find(d => d.day === dayNum);

      rows.push({
        iso_date: isoDate,
        month_number: monthNum,
        date_type: 'marriage',
        subha_start: segTimeMatch ? segTimeMatch[1].trim() : null,
        subha_end: segTimeMatch ? segTimeMatch[2].trim() : null,
        subha_end_next_day: false,
        nakshatra: segNakMatch ? segNakMatch[1] : (dayData?.nakshatra || null),
        tithi: dayData?.tithi || null,
        notes: segment.slice(0, 200),
        year: 2026,
      });
    }
  }

  return rows;
}

// ── Builder: odia_calendar_months ─────────────────────────────────────────────
function buildCalendarMonths(months) {
  return months.map(month => ({
    month_number: month.month_number,
    month_name: month.month,
    days_in_month: month.days_in_month,
    marriage_dates_text: month.monthly_notes.marriage_dates || null,
    griha_pravesh_text: month.monthly_notes.griha_pravesh || null,
    amabasya_text: month.monthly_notes.amabasya || null,
    purnima_text: month.monthly_notes.purnima || null,
    ekadashi_text: month.monthly_notes.ekadashi || null,
    sankranti_text: month.monthly_notes.sankranti || null,
    other_observances: month.monthly_notes.other_observances || null,
    astrological_notes: month.monthly_notes.astrological_notes || null,
    year: 2026,
  }));
}

// ── Batch Insert ──────────────────────────────────────────────────────────────
async function batchInsert(table, rows, batchSize = 100) {
  if (rows.length === 0) {
    console.log(`  ${table}: no rows to insert`);
    return 0;
  }
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      console.error(`\n  ERROR in ${table} batch ${i}: ${error.message}`);
      // Continue with remaining batches
    } else {
      total += batch.length;
    }
    process.stdout.write(`\r  ${table}: ${Math.min(i + batchSize, rows.length)}/${rows.length} rows`);
  }
  console.log(` → ${total} inserted`);
  return total;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const force = process.argv.includes('--force');

  // Check if data already exists (check both panchanga_days and calendar_months)
  const { count: dayCount } = await supabase
    .from('odia_panchanga_days').select('*', { count: 'exact', head: true }).eq('year', 2026);
  const { count: monthCount } = await supabase
    .from('odia_calendar_months').select('*', { count: 'exact', head: true });

  const hasData = (dayCount ?? 0) > 0 || (monthCount ?? 0) > 0;

  if (hasData) {
    console.log(`Found existing data: ${dayCount} panchanga_days, ${monthCount} calendar_months`);
    if (!force) {
      console.log('  Run with --force to delete existing data and re-seed.');
      return;
    }
    console.log('  Deleting existing data...');
    for (const table of ['odia_auspicious_dates', 'odia_lunar_events', 'odia_festivals', 'odia_panchanga_days']) {
      const { error: delErr } = await supabase.from(table).delete().eq('year', 2026);
      if (delErr) console.error(`  Delete error in ${table}: ${delErr.message}`);
      else console.log(`  Cleared ${table}`);
    }
    // calendar_months: unique on month_number, delete all rows
    const { error: delMonthErr } = await supabase.from('odia_calendar_months').delete().gte('month_number', 1);
    if (delMonthErr) console.error(`  Delete error in odia_calendar_months: ${delMonthErr.message}`);
    else console.log('  Cleared odia_calendar_months');
  }

  // Build all datasets
  console.log('\nBuilding data from JSON...');
  const panchangaDays   = buildPanchangaDays(months);
  const festivals       = buildFestivals(months);
  const lunarEvents     = buildLunarEvents(months);
  const auspiciousDates = buildAuspiciousDates(months);
  const calendarMonths  = buildCalendarMonths(months);

  console.log(`  odia_panchanga_days:   ${panchangaDays.length} rows`);
  console.log(`  odia_festivals:        ${festivals.length} rows`);
  console.log(`  odia_lunar_events:     ${lunarEvents.length} rows`);
  console.log(`  odia_auspicious_dates: ${auspiciousDates.length} rows`);
  console.log(`  odia_calendar_months:  ${calendarMonths.length} rows`);

  // Insert in order
  console.log('\nInserting...');
  await batchInsert('odia_calendar_months',  calendarMonths);
  await batchInsert('odia_panchanga_days',   panchangaDays);
  await batchInsert('odia_festivals',        festivals);
  await batchInsert('odia_lunar_events',     lunarEvents);
  await batchInsert('odia_auspicious_dates', auspiciousDates);

  console.log('\n✓ Seeding complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
