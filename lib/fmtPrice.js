export function fmtPrice(v, sym = "Rs.") {
  if (sym === "Rs.") {
    if (v >= 100000) return sym + (v / 100000).toFixed(1) + "L";
    if (v >= 1000) return sym + (v / 1000).toFixed(1) + "k";
    return sym + v;
  }
  if (v >= 1000) return sym + (v / 1000).toFixed(1) + "k";
  return sym + v;
}
