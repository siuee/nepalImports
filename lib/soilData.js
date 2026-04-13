/** Enrich product with soil / climate / AI fields (ported from original getSoilData). */

const DEFAULTS = {
  "Large Cardamom": {
    soilType: "Forest loam, humus-rich, well-drained",
    soilPH: "5.5–6.5 (acidic)",
    organicMatter:
      "High — 15+ tonnes/ha leaf mould and compost. Shade trees essential. Mulch with alder leaf.",
    irrigation: "Moderate — consistent moisture. Shade + humidity critical. No standing water.",
    climateType: "Subtropical to Temperate humid",
    tempRange: "10°C–22°C. Frost-sensitive. High humidity 70-90%.",
    rainfall: "2000-3000mm. Monsoon-fed. Shade canopy reduces direct rain impact.",
    plantMonth: "April–May (rhizome planting)",
    harvestMonth: "August–November",
    aiSuggestion:
      "Taplejung is Nepal's cardamom capital — farmers already know how to grow it. The gap is in VALUE ADDITION. Suggested to Ward Offices: Rs.25 Lakh investment → buy 1 large cardamom dryer (electric bhatti) + solar drying shed → dry and grade before selling to traders instead of wet → farmers get Rs.2,000/kg vs Rs.1,400/kg wet. Multiplied across 125,000 households = Rs.750 Crore additional income nationally with ZERO new farming.",
  },
  "Dried Ginger (Sutho)": {
    soilType: "Sandy loam to loam, well-drained, slightly acidic",
    soilPH: "5.5–6.5",
    organicMatter:
      "Heavy feeder — 20+ tonnes/ha FYM + compost. Top-dress with decomposed leaves monthly.",
    irrigation:
      "Regular — every 7-10 days. Requires consistent moisture but not waterlogging.",
    climateType: "Subtropical to Temperate",
    tempRange: "20°C–30°C growing. Below 15°C triggers dormancy.",
    rainfall: "1500-2000mm. Monsoon-fed. Irrigation needed post-monsoon.",
    plantMonth: "February–March",
    harvestMonth: "October–November (for drying)",
    aiSuggestion:
      "Palpa and Syangja farmers sell fresh ginger to traders at Rs.94/kg who dry it to Rs.300/kg sutho and export at Rs.300/kg. The value multiplication happens OFF-farm. Suggested: Rs.15 Lakh district investment → 3 shared solar ginger dryers + 1 slicer → farmers dry their own ginger → sell directly at Rs.280-300/kg instead of Rs.94/kg fresh. Income per farmer: 3x increase with same harvest.",
  },
  "Turmeric Powder": {
    soilType: "Loamy to clay loam, rich in organic matter, well-drained",
    soilPH: "5.5–7.0",
    organicMatter:
      "15-20 tonnes/ha FYM. Vermicompost 5 tonnes/ha improves curcumin content significantly.",
    irrigation: "Regular — every 10-14 days. Critical during rhizome formation (Jul-Sep).",
    climateType: "Tropical to Subtropical",
    tempRange: "20°C–35°C ideal. Cannot tolerate frost.",
    rainfall: "1200-1500mm. Monsoon-fed, irrigation post-monsoon.",
    plantMonth: "April–May",
    harvestMonth: "December–February",
    aiSuggestion:
      'Makwanpur Municipality example: If you import Rs.50 Lakh of turmeric powder from India annually, here is your action plan. Your soil pH 5.8-6.5 (loamy forest) = perfect turmeric. Step 1: Allocate Rs.15 Lakh agricultural budget. Step 2: Buy 1 industrial spice grinder + 1 polishing drum + solar dryer. Step 3: Distribute free rhizome seed to 50 farmers in 5 wards. Step 4: Harvest Year 1: 50 × 2 tonnes = 100 tonnes fresh = 20 tonnes dried turmeric. Step 5: Grind and brand as "Makwanpur Besar." Revenue: Rs.40 Lakh Year 1. Full self-sufficiency by Year 3.',
  },
  "Timur Pepper": {
    soilType: "Rocky to loamy mountain soil, well-drained",
    soilPH: "5.8–7.0",
    organicMatter:
      "Light feeder. Grows naturally in forest margins. Leaf mulch from surrounding trees sufficient.",
    irrigation:
      "Rainfall only. Zero irrigation required — grows on mountain slopes naturally.",
    climateType: "Subtropical to Temperate mountain",
    tempRange: "10°C–28°C. Tolerates mild frost.",
    rainfall: "800-1500mm. Grows on south-facing slopes.",
    plantMonth: "March–April (seedlings)",
    harvestMonth: "September–November",
    aiSuggestion:
      'Jajarkot Timur farmers sell whole dried berries to Kathmandu traders at Rs.600/kg. Specialty chefs in USA/Australia pay $45/kg for authenticated Nepalese Timur. The Jajarkot Ward Office could brand this. Suggested: Rs.8 Lakh → design district brand "Jajarkot Timur — Nepal\'s Himalayan Pepper" → export directly to 5 specialty spice importers in USA (contact via TEPC) → Revenue: Rs.15 Crore vs current Rs.3 Crore. Same harvest, 5x revenue.',
  },
  "Orthodox Tea": {
    soilType:
      "Deep acidic loam, well-drained, humus-rich — same geological formation as Darjeeling",
    soilPH: "4.5–5.5 (strongly acidic)",
    organicMatter:
      "Heavy — 20+ tonnes/ha decomposed leaf. Tea prefers naturally acidic forest soil. Never lime.",
    irrigation:
      "Consistent — 1200-2000mm rainfall plus supplemental irrigation in dry months.",
    climateType: "Subtropical humid to Temperate",
    tempRange: "13°C–29°C. Cool nights improve flavor compounds.",
    rainfall: "1500-2500mm. Fog and mist essential for first flush quality.",
    plantMonth: "February–March (cutting propagation)",
    harvestMonth: "March–May (first flush), Aug–Oct (second flush)",
    aiSuggestion:
      'Ilam tea farmers sell first flush leaves to factories at Rs.35/kg green leaf. Same tea sold by factories at Rs.800/kg processed, by specialty retailers in USA at $40/kg = Rs.5,400/kg. Ilam Tea Cooperative model: Rs.2 Crore → buy 1 small processing unit (withering, rolling, drying) → process directly → sell branded "Ilam First Flush" to USA specialty importers → Revenue per cooperative member: Rs.3 Lakh/yr vs Rs.50,000 currently.',
  },
  "Specialty Coffee": {
    soilType: "Well-drained volcanic loam to forest soil, high organic content",
    soilPH: "6.0–6.5",
    organicMatter: "15 tonnes/ha compost. Shade tree leaf litter highly beneficial.",
    irrigation:
      "2-3 irrigations Dec-Feb (dry season). Moisture critical during flowering.",
    climateType: 'Subtropical humid — "Coffee Belt" altitude 1000-1800m',
    tempRange: "18°C–25°C. Cool nights produce fruity acidity.",
    rainfall: "1200-1600mm. Dry winter (Nov-Feb) improves bean density.",
    plantMonth: "March–April (seedlings)",
    harvestMonth: "October–December",
    aiSuggestion:
      'Gulmi coffee farmers sell green bean at Rs.800/kg to intermediaries who export at Rs.2,400/kg to Japan. Gulmi Ward Offices could intercept this value. Suggested: Rs.30 Lakh → 1 coffee pulper + 1 grader + 1 roaster + packaging → Gulmi Coffee Cooperative → sell direct to Kathmandu specialty cafes + online export. "Himalayan Specialty Coffee" from Gulmi already has Japan buyers willing to pay Rs.4,000+/kg direct.',
  },
};

const NAME_TO_DEFAULT_KEY = {
  "Orthodox Tea (Ilam)": "Orthodox Tea",
};

export function getSoilData(p) {
  let out = { ...p };
  const defaultKey = NAME_TO_DEFAULT_KEY[out.name] || out.name;
  const d = DEFAULTS[defaultKey];
  if (d) {
    out = { ...out, ...d };
  } else if (!out.soilType) {
    const zone = out.zone || "";
    if (zone.includes("Alpine")) {
      out.soilType = "Mountain soil, rocky to sandy loam";
      out.soilPH = "5.5–6.5";
      out.organicMatter =
        "Minimal. Alpine soils naturally low in organic matter. Add compost 3 tonnes/ha.";
      out.irrigation = "Snowmelt-fed. Minimal irrigation needed.";
      out.climateType = "Alpine to Sub-Alpine";
      out.tempRange = "5°C–20°C growing season.";
      out.rainfall = "400-800mm snowmelt equivalent.";
      out.plantMonth = "May–June";
      out.harvestMonth = "August–September";
    } else if (zone.includes("Terai")) {
      out.soilType = "Alluvial loam, fertile, well-drained";
      out.soilPH = "6.0–7.5";
      out.organicMatter =
        "Good base fertility. Add 8 tonnes/ha compost. Terai soil naturally rich.";
      out.irrigation =
        "Moderate — 3-4 irrigations. Canal irrigation available in most Terai areas.";
      out.climateType = "Tropical to Subtropical";
      out.tempRange = "25°C–38°C summer, 8°C–20°C winter.";
      out.rainfall = "1200-2000mm monsoon-fed.";
      out.plantMonth = "October–November (Rabi) or June–July (Kharif)";
      out.harvestMonth = "February–March or October–November";
    } else {
      out.soilType = "Forest loam, well-drained hillside soil";
      out.soilPH = "5.5–6.5";
      out.organicMatter =
        "Add 10 tonnes/ha compost annually. Maintain shade canopy for humus build-up.";
      out.irrigation =
        "Moderate — monsoon-supplemented. 2-3 dry season irrigations.";
      out.climateType = "Subtropical to Temperate hill";
      out.tempRange = "12°C–28°C. Cool nights enhance product quality.";
      out.rainfall = "1000-2000mm monsoon-fed.";
      out.plantMonth = "March–May";
      out.harvestMonth = "October–December";
    }
    if (!out.aiSuggestion) {
      out.aiSuggestion =
        "This product has strong Nepal export potential. Consult your local Agricultural Knowledge Centre (AKC) or NARC district office for soil testing and production support. Contact TEPC for export market linkages.";
    }
  }
  return out;
}
