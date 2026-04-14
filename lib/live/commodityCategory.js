/**
 * Canonical commodity groups for market price UI (Kalimati + AMPIS).
 * Table order on AMPIS differs by market; classification is primarily name + catalog.
 */

export const CATEGORY_SORT_ORDER = [
  "vegetable",
  "fruit",
  "spice",
  "greens",
  "mushroom",
  "root",
  "pulse",
  "grain",
  "oilseed",
  "fish",
  "meat",
  "eggs",
  "dairy",
  "other",
];

/** Default English + Nepali labels; unknown ids fall back to title-cased id. */
export const CATEGORY_LABELS = {
  vegetable: { en: "Vegetables", np: "तरकारी" },
  fruit: { en: "Fruits", np: "फलफूल" },
  spice: { en: "Spice crops", np: "मसला बाली" },
  greens: { en: "Leafy greens", np: "सागपात" },
  mushroom: { en: "Mushrooms", np: "च्याउ खेती" },
  root: { en: "Root & tuber", np: "कन्दमुल बाली" },
  pulse: { en: "Pulses", np: "कोसे / दाल बाली" },
  grain: { en: "Grains & cereals", np: "अन्न बाली" },
  oilseed: { en: "Oilseeds", np: "तेल बाली" },
  fish: { en: "Fish", np: "माछा" },
  meat: { en: "Meat", np: "मासु" },
  eggs: { en: "Eggs", np: "अण्डा" },
  dairy: { en: "Dairy", np: "दुग्धजन्य" },
  other: { en: "Other", np: "अन्य" },
};

function norm(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

/**
 * Classify from Nepali commodity name only (works when HTML table grouping is wrong).
 */
export function inferCategoryFromNepali(nameNepali) {
  const n = norm(nameNepali);
  if (!n) return "other";

  const has = (fragments) => fragments.some((f) => n.includes(f));

  if (has(["दुध", "दूध", "दही", "घिउ", "पनीर", "खुवा"])) return "dairy";
  if (has(["माछा"])) return "fish";
  if (has(["अण्डा", "अंडा"])) return "eggs";
  if (
    has([
      "मासु",
      "कुखुराको",
      "खसीको",
      "राँगो",
      "भैंसीको मास",
      "बोईलर",
      "कट्टु",
      "भेडा",
      "बाख्रा",
    ])
  ) {
    return "meat";
  }
  if (has(["च्याउ"])) return "mushroom";

  if (
    has([
      "मुग",
      "मसुरो",
      "मुसुरो",
      "भटमास",
      "चना",
      "राजमा",
      "कबुली",
      "तुवार",
      "रहर",
      "गहत",
      "वेश",
      "दाल",
      "कोसे",
    ]) &&
    !has(["बोडी", "सिमी", "गोलभेंडा", "गोलभेडा", "टमाटर", "करेला", "भन्टा", "लौका"])
  ) {
    return "pulse";
  }

  if (
    has([
      "अदुवा",
      "लसुन",
      "खुर्सानी",
      "बेसार",
      "हलेदो",
      "धनिया",
      "जीरा",
      "तोरी",
      "खुर्सा",
      "टिमुर",
    ])
  ) {
    return "spice";
  }

  if (
    has([
      "स्याउ",
      "केरा",
      "आँप",
      "आंप",
      "सुन्तला",
      "अनार",
      "अंगुर",
      "नासपाती",
      "तरबुज",
      "मेवा",
      "भुइ",
      "कागती",
      "लिची",
      "किवी",
      "अवोकाडो",
      "ड्रैगन",
    ])
  ) {
    return "fruit";
  }

  if (has(["रायो", "पालुंग", "मेथी", "चमसुर", "तोरीको साग", "पाल्को", "सिस्नु", "गोल्फुली"])) {
    return "greens";
  }
  if (has(["साग"]) && !has(["तोरीको", "मेथी"])) return "greens";

  if (
    has([
      "आलु",
      "गाजर",
      "मूला",
      "चुकन्दर",
      "पिंडालु",
      "तरुल",
      "शकरखण्ड",
      "सखरखण्ड",
      "बकुल",
      "सुरन",
    ])
  ) {
    return "root";
  }

  if (has(["चामल", "मकै", "गहुँ", "जौ", "कोदो", "फापर", "चिउरा"])) return "grain";
  if (has(["तिल", "सुनफूल"])) return "oilseed";

  return "vegetable";
}

/**
 * Merge catalog row (from marketData.json) with Nepali-name inference.
 */
export function resolveCommodityCategory(nameNepali, catalogEntry) {
  const inferred = inferCategoryFromNepali(nameNepali);
  const cc = catalogEntry?.cat;

  if (["dairy", "fish", "meat", "eggs"].includes(inferred)) return inferred;
  if (inferred === "mushroom") return "mushroom";

  if (cc === "mushroom") return "mushroom";
  if (cc === "spice") {
    if (["fish", "meat", "dairy", "pulse", "fruit", "greens", "root"].includes(inferred)) return inferred;
    return "spice";
  }
  if (cc === "fruit") {
    if (["fish", "meat", "dairy", "mushroom", "pulse", "root", "greens"].includes(inferred)) return inferred;
    return "fruit";
  }
  if (cc === "vegetable") {
    if (
      ["fish", "meat", "dairy", "eggs", "mushroom", "pulse", "fruit", "greens", "root", "grain", "oilseed", "spice"].includes(
        inferred
      )
    )
      return inferred;
    return "vegetable";
  }
  if (cc === "other") {
    if (inferred !== "vegetable") return inferred;
    return "other";
  }

  return inferred;
}

function capitalizeWords(id) {
  return id
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Stable category key for filtering (lowercase, trimmed). */
export function normalizeCategoryId(cat) {
  if (cat == null) return "other";
  const s = String(cat).trim().toLowerCase();
  return s || "other";
}

/**
 * Tabs for the market UI: All first, then categories present in data (sorted), including unknown ids.
 */
export function buildCategoryTabs(items) {
  const list = Array.isArray(items) ? items : [];
  const counts = new Map();
  for (const it of list) {
    const id = normalizeCategoryId(it.cat);
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  const ids = [...counts.keys()];
  ids.sort((a, b) => {
    const ia = CATEGORY_SORT_ORDER.indexOf(a);
    const ib = CATEGORY_SORT_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const tabs = [
    {
      id: "all",
      labelEn: "All",
      labelNp: "सबै",
      count: list.length,
    },
    ...ids.map((id) => {
      const L = CATEGORY_LABELS[id];
      return {
        id,
        labelEn: L?.en || capitalizeWords(id),
        labelNp: L?.np || "—",
        count: counts.get(id),
      };
    }),
  ];

  return tabs;
}

export function formatTabLabel(tab) {
  const tid = normalizeCategoryId(tab.id);
  if (tid === "all") return `${tab.labelEn} — ${tab.labelNp}`;
  if (tab.labelNp && tab.labelNp !== "—") return `${tab.labelEn} — ${tab.labelNp}`;
  return tab.labelEn;
}
