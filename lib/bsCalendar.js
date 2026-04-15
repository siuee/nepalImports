/**
 * Bikram Sambat month labels for UI — AD→BS via nepali-date-converter (published BS calendars).
 * Each Gregorian month is mapped using the BS date on the 15th of that month (mid-month rule).
 */

import NepaliDate from "nepali-date-converter";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** BS month name (Nepali script) for Gregorian month index 0–11, using AD date = 15th of that month. */
export function bsMonthNameNpForAdMidMonth(gregorianMonthIndex, adYear) {
  const y = Number.isFinite(adYear) ? Math.floor(adYear) : new Date().getFullYear();
  const mi = Math.max(0, Math.min(11, gregorianMonthIndex | 0));
  const nd = new NepaliDate(new Date(y, mi, 15));
  return nd.format("MMMM", "np");
}

function monthIndexForEnglishToken(token) {
  const t = token.trim();
  const lower = t.toLowerCase();
  const full = FULL_MONTHS.findIndex((m) => m.toLowerCase() === lower);
  if (full >= 0) return full;
  const ab = MONTH_ABBR.findIndex((m) => m.toLowerCase() === lower);
  return ab;
}

let patternCache = null;

function englishMonthTokenPattern() {
  if (patternCache) return patternCache;
  const tokens = [...FULL_MONTHS, ...MONTH_ABBR].sort((a, b) => b.length - a.length);
  patternCache = new RegExp(`\\b(${tokens.map(escapeRegex).join("|")})\\b`, "gi");
  return patternCache;
}

/**
 * Replace English month names/abbreviations in free text with Bikram Sambat month names
 * (Nepali script), using mid-month conversion for each referenced Gregorian month.
 */
export function localizeEnglishMonthsToBs(text, adYear) {
  if (text == null || text === "") return text;
  const y = Number.isFinite(adYear) ? Math.floor(adYear) : new Date().getFullYear();
  return text.replace(englishMonthTokenPattern(), (match) => {
    const idx = monthIndexForEnglishToken(match);
    if (idx < 0) return match;
    return bsMonthNameNpForAdMidMonth(idx, y);
  });
}
