// All Odia + English string constants

export const ODIA_DAYS = ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର'];
export const ODIA_DAYS_SHORT = ['ର', 'ସୋ', 'ମ', 'ବୁ', 'ଗୁ', 'ଶୁ', 'ଶ'];
export const EN_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ODIA_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const ODIA_MONTHS_OR = [
  'ଜାନୁଆରୀ', 'ଫେବ୍ରୁଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଏପ୍ରିଲ', 'ମେ', 'ଜୁନ',
  'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର',
];

export const PANCHANG_MONTHS = [
  { or: 'ବୈଶାଖ',    en: 'Baishakha',   season_or: 'ଗ୍ରୀଷ୍ମ',   season_en: 'Summer' },
  { or: 'ଜ୍ୟେଷ୍ଠ',   en: 'Jyeshtha',    season_or: 'ଗ୍ରୀଷ୍ମ',   season_en: 'Summer' },
  { or: 'ଆଷାଢ଼',    en: 'Ashadha',     season_or: 'ବର୍ଷା',    season_en: 'Monsoon' },
  { or: 'ଶ୍ରାବଣ',   en: 'Shrabana',    season_or: 'ବର୍ଷା',    season_en: 'Monsoon' },
  { or: 'ଭାଦ୍ରବ',   en: 'Bhadrab',     season_or: 'ବର୍ଷା',    season_en: 'Monsoon' },
  { or: 'ଆଶ୍ୱିନ',   en: 'Ashwina',     season_or: 'ଶରତ',     season_en: 'Autumn' },
  { or: 'କାର୍ତ୍ତିକ', en: 'Kartika',     season_or: 'ଶରତ',     season_en: 'Autumn' },
  { or: 'ମାର୍ଗଶିର',  en: 'Margashira',  season_or: 'ହେମନ୍ତ',   season_en: 'Pre-winter' },
  { or: 'ପୌଷ',      en: 'Pousha',      season_or: 'ହେମନ୍ତ',   season_en: 'Pre-winter' },
  { or: 'ମାଘ',      en: 'Magha',       season_or: 'ଶୀତ',     season_en: 'Winter' },
  { or: 'ଫାଲ୍ଗୁନ',  en: 'Phalguna',    season_or: 'ଶୀତ',     season_en: 'Winter' },
  { or: 'ଚୈତ୍ର',    en: 'Chaitra',     season_or: 'ବସନ୍ତ',   season_en: 'Spring' },
];

// Odia numeral conversion
const ODIA_NUMERALS = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
export function toOdiaNumerals(n: number): string {
  return String(n).split('').map(d => ODIA_NUMERALS[parseInt(d)] ?? d).join('');
}

// Greetings by time
export function getGreeting(): { or: string; en: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { or: 'ସୁପ୍ରଭାତ!', en: 'Good Morning!' };
  if (hour >= 12 && hour < 17) return { or: 'ଶୁଭ ଅପରାହ୍ନ!', en: 'Good Afternoon!' };
  if (hour >= 17 && hour < 21) return { or: 'ଶୁଭ ସନ୍ଧ୍ୟା!', en: 'Good Evening!' };
  return { or: 'ଶୁଭ ରାତ୍ରି!', en: 'Good Night!' };
}

// Countdown label
export function countdownLabel(days: number): { or: string; en: string } {
  if (days === 0) return { or: 'ଆଜି!', en: 'Today!' };
  if (days === 1) return { or: 'ଆସନ୍ତାକାଲି', en: 'Tomorrow' };
  return { or: `ଆଉ ${toOdiaNumerals(days)} ଦିନ`, en: `In ${days} days` };
}

// Holiday type labels
export const HOLIDAY_LABELS = {
  bank: { or: 'ବ୍ୟାଙ୍କ ଛୁଟି', en: 'Bank Holiday' },
  govt: { or: 'ସରକାରୀ ଛୁଟି', en: 'Govt Holiday' },
  both: { or: 'ବ୍ୟାଙ୍କ ଓ ସରକାରୀ ଛୁଟି', en: 'Bank & Govt Holiday' },
};

// Screen titles
export const SCREEN_TITLES = {
  home:     { or: 'ଦିଶା', en: 'Disha' },
  calendar: { or: 'ଓଡ଼ିଆ ପଞ୍ଜିକା', en: 'Odia Calendar' },
  weather:  { or: 'ପାଣିପାଗ', en: 'Weather' },
  holidays: { or: 'ଛୁଟି ତାଲିକା', en: 'Holidays' },
  settings: { or: 'ସେଟିଂ', en: 'Settings' },
  detail:   { or: 'ପର୍ବ ବିବରଣୀ', en: 'Festival Detail' },
  messages: { or: 'ବାର୍ତ୍ତା', en: 'Messages' },
  compose:  { or: 'ବାର୍ତ୍ତା ପଠାଅ', en: 'Send Message' },
};

// Nav labels
export const NAV_LABELS = {
  home:     { or: 'ଘର', en: 'Home' },
  calendar: { or: 'ପଞ୍ଜିକା', en: 'Calendar' },
  weather:  { or: 'ପାଣିପାଗ', en: 'Weather' },
  holidays: { or: 'ଛୁଟି', en: 'Holiday' },
  messages: { or: 'ବାର୍ତ୍ତା', en: 'Messages' },
};

// Quick message templates — supporter selects, parent reads in Odia
export const QUICK_MESSAGES = [
  { en: 'I sent you money. Please go to ATM.', or: 'ଟଙ୍କା ପଠାଯାଇଛି। ଦୟାକରି ATM ରୁ ନିଅନ୍ତୁ।', icon: '💰' },
  { en: 'Today you need to visit the doctor.', or: 'ଆଜି ଡାକ୍ତରଙ୍କ ପାଖକୁ ଯିବାକୁ ହେବ।', icon: '🏥' },
  { en: 'Please take medicine after dinner.', or: 'ଦୟାକରି ରାତ ଖାଇବା ପରେ ଔଷଧ ଖାଅ।', icon: '💊' },
  { en: 'Send money to uncle.', or: 'ଚାଚାଙ୍କୁ ଟଙ୍କା ପଠାଅ।', icon: '🤝' },
  { en: 'Tomorrow is festival. Go to temple early.', or: 'ଆସନ୍ତାକାଲି ଉତ୍ସବ। ସକାଳୁ ମନ୍ଦିରକୁ ଯାଅ।', icon: '🛕' },
  { en: 'I will call you in the evening.', or: 'ସନ୍ଧ୍ୟାରେ ଫୋନ କରିବି।', icon: '📞' },
  { en: 'All is well. Stay healthy.', or: 'ସବୁ ଭଲ ଅଛି। ସୁସ୍ଥ ରୁ।', icon: '❤️' },
  { en: 'Please eat on time.', or: 'ସମୟ ମତେ ଖାଇବାକୁ ଭୁଲ ନ ଯିବ।', icon: '🍛' },
] as const;

// Messaging UI strings
export const MSG = {
  inbox:           { or: 'ଆଗ ବାର୍ତ୍ତା', en: 'Inbox' },
  sent:            { or: 'ପଠାଇଥିବା', en: 'Sent' },
  compose:         { or: 'ବାର୍ତ୍ତା ଲେଖ', en: 'Write Message' },
  send:            { or: 'ପଠାଅ', en: 'Send' },
  sending:         { or: 'ପଠାଉଛି...', en: 'Sending...' },
  markRead:        { or: 'ପଢ଼ିଲି', en: 'Mark Read' },
  markDone:        { or: 'ସମ୍ପୂର୍ଣ', en: 'Done' },
  noMessages:      { or: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ବାର୍ତ୍ତା ନାହିଁ', en: 'No messages yet' },
  noMessagesSub:   { or: 'ଯେତେବେଳେ ବାର୍ତ୍ତା ଆସିବ, ଏଠାରେ ଦେଖିବ', en: 'Messages from your family will appear here' },
  from:            { or: 'ଠାରୁ', en: 'from' },
  yourCode:        { or: 'ତୁମ୍ଭ ଲିଙ୍କ କୋଡ', en: 'Your Link Code' },
  codeCopied:      { or: 'କପି ହୋଇଗଲା!', en: 'Copied!' },
  shareCode:       { or: 'ଏହି କୋଡ ତୁମ୍ଭ ପିଲାଙ୍କୁ ଦିଅ', en: 'Share this code with your family' },
  linkParent:      { or: 'ପରିବାରର ଲୋକ ସହ ଯୋଡ଼', en: 'Link to Family' },
  enterCode:       { or: 'ଲିଙ୍କ କୋଡ ଦିଅ', en: 'Enter Link Code' },
  connect:         { or: 'ଯୋଡ଼', en: 'Connect' },
  connected:       { or: 'ଯୋଡ଼ି ହୋଇଗଲା!', en: 'Connected!' },
  connectedTo:     { or: 'ସଙ୍ଗ ଯୋଡ଼ି ହୋଇଛ', en: 'Linked to' },
  notConnected:    { or: 'ଏପର୍ଯ୍ୟନ୍ତ ଯୋଡ଼ି ହୋଇ ନାହିଁ', en: 'Not linked yet' },
  setupTitle:      { or: 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ସେଟ କରନ୍ତୁ', en: 'Set Up Your Profile' },
  yourName:        { or: 'ଆପଣଙ୍କ ନାମ', en: 'Your Name' },
  iAmSupporter:    { or: 'ମୁଁ ପୁଅ/ଝିଅ (Supporter)', en: "I'm a Supporter (Son/Daughter)" },
  iAmParent:       { or: 'ମୁଁ ବଡ଼ (Parent)', en: "I'm a Parent / Elder" },
  save:            { or: 'ସଂରକ୍ଷଣ', en: 'Save' },
  odiaPreview:     { or: 'ଓଡ଼ିଆ ଦେଖ', en: 'Odia Preview' },
  typeMessage:     { or: 'ଇଂରାଜୀରେ ବାର୍ତ୍ତା ଲେଖ...', en: 'Type message in English...' },
  quickMessages:   { or: 'ଶୀଘ୍ର ବାର୍ତ୍ତା', en: 'Quick Messages' },
  readAt:          { or: 'ପଢ଼ା ହୋଇଛି', en: 'Read' },
  doneAt:          { or: 'ସମ୍ପୂର୍ଣ ହୋଇଛି', en: 'Done' },
  unread:          { or: 'ନୂଆ', en: 'New' },
  offline:         { or: 'ଅଫଲାଇନ — ସଂରକ୍ଷିତ ବାର୍ତ୍ତା', en: 'Offline — Showing saved messages' },
};

// Misc UI
export const UI = {
  viewAll:    { or: 'ସବୁ ଦେଖନ୍ତୁ →', en: 'View All' },
  today:      { or: 'ଆଜି', en: 'Today' },
  tomorrow:   { or: 'ଆସନ୍ତାକାଲି', en: 'Tomorrow' },
  loading:    { or: 'ଲୋଡ଼ ହେଉଛି...', en: 'Loading...' },
  offline:    { or: 'ଅଫଲାଇନ', en: 'Offline' },
  lastUpdated:{ or: 'ଶେଷ ଅପଡ଼େଟ', en: 'Last updated' },
  sunrise:    { or: 'ସୂର୍ଯ୍ୟୋଦୟ', en: 'Sunrise' },
  sunset:     { or: 'ସୂର୍ଯ୍ୟାସ୍ତ', en: 'Sunset' },
  setReminder:{ or: '🔔 ରିମାଇଣ୍ଡର ସେଟ କରନ୍ତୁ', en: '🔔 Set Reminder' },
  significance:{ or: 'ମହତ୍ତ୍ୱ', en: 'Significance' },
  traditions: { or: 'ପରମ୍ପରା', en: 'Traditions' },
  atGlance:   { or: 'ଗୋଟିଏ ନଜରରେ', en: 'At a Glance' },
  bankHoliday:{ or: 'ବ୍ୟାଙ୍କ ଛୁଟି', en: 'Bank Holiday' },
  govtHoliday:{ or: 'ସରକାରୀ ଛୁଟି', en: 'Govt Holiday' },
  yes:        { or: 'ହଁ', en: 'Yes' },
  no:         { or: 'ନାଁ', en: 'No' },
  odiaDate:   { or: 'ଓଡ଼ିଆ ତାରିଖ', en: 'Odia Date' },
  thisMonth:  { or: 'ଏହି ମାସର ପର୍ବ', en: "This Month's Festivals" },
  coming:     { or: 'ଆସୁଥିବା', en: 'Upcoming' },
  farmWeather:{ or: 'କୃଷି ପାଣିପାଗ', en: 'Farm Weather' },
  change:     { or: 'ବଦଳାନ୍ତୁ', en: 'Change' },
  wind:       { or: 'ପବନ', en: 'Wind' },
  humidity:   { or: 'ଆର୍ଦ୍ରତା', en: 'Humidity' },
  rain:       { or: 'ବର୍ଷା', en: 'Rain' },
  visibility: { or: 'ଦୃଶ୍ୟତା', en: 'Visibility' },
  feelsLike:  { or: 'ଅନୁଭବ ହେଉଛି', en: 'Feels like' },
  morning:    { or: '🌅 ସକାଳ', en: 'Morning' },
  afternoon:  { or: '🌞 ଦୁପହର', en: 'Afternoon' },
  evening:    { or: '🌆 ସନ୍ଧ୍ୟା', en: 'Evening' },
  night:      { or: '🌙 ରାତି', en: 'Night' },
  todayWeather:{ or: 'ଆଜିର ପାଣିପାଗ', en: "Today's Weather" },
  sevenDay:   { or: '୭ ଦିନର ପୂର୍ବାନୁମାନ', en: '7-Day Forecast' },
  todaySpecial:{ or: 'ଆଜିର ବିଶେଷ', en: "Today's Special" },
  holidayInfo:{ or: 'ଛୁଟି ସୂଚନା', en: 'Holiday Info' },
  odiaCal:    { or: 'ଓଡ଼ିଆ ତାରିଖ', en: 'Odia Date' },
  sakaEra:    { or: 'ଶକାବ୍ଦ', en: 'Saka Era' },
};
