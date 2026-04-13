const DIGIT_MAP = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

/**
 * Convert Devanagari numerals and NPR label to a float (e.g. "रू ६५.००" → 65).
 */
export function parseNprAmount(raw) {
  if (!raw || typeof raw !== "string") return null;
  let s = raw.replace(/[०-९]/g, (ch) => DIGIT_MAP[ch] ?? ch);
  s = s.replace(/[रू,\s]/g, "").replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
