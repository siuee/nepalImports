import GROWING_GUIDES from "@/data/growingGuides.json";

export function getGrowingGuide(p) {
  const fromFile = GROWING_GUIDES[String(p.id)];
  if (fromFile) return fromFile;

  const isTerai = p.zone && (p.zone.includes("Terai") || p.zone.includes("60"));
  const isAlpine = p.zone && p.zone.includes("Alpine");

  return {
    districtTip: {
      default: `Best districts for ${p.name}: ${p.districts.slice(0, 3).join(", ")}. Contact your local DADO (District Agriculture Development Office) or NARC extension center for district-specific seed, training, and subsidy programs.`,
    },
    steps: [
      {
        title: "Site & Soil Preparation",
        emoji: "Map",
        desc: `Choose well-drained ${isTerai ? "alluvial Terai" : isAlpine ? "mountain loam" : "forest loam hill"} soil. Test pH (target: ${p.soilPH || "6.0-7.0"}). Add ${p.organicMatter || "8-10 tonnes/ha compost"} before planting. Contact NARC district office for free soil testing.`,
      },
      {
        title: "Obtain Quality Seed/Planting Material",
        emoji: "Seed",
        desc: `Get certified seeds or planting material from NARC or DADO. For ${p.name}: planting season is ${p.plantMonth || p.season}. Treat seeds or rhizomes before planting to prevent disease.`,
      },
      {
        title: "Planting & Spacing",
        emoji: "Plant",
        desc: `Plant during ${p.plantMonth || "the optimal season for your zone"}. Maintain appropriate spacing for air circulation and sunlight. ${p.irrigation || "Water regularly but avoid waterlogging"}. Mulch to conserve moisture.`,
      },
      {
        title: "Care & Pest Management",
        emoji: "Care",
        desc: `${p.organicMatter || "Apply organic compost regularly"}. Monitor for pests monthly. Use neem-based pesticides first. Contact your local Agricultural Knowledge Centre (AKC) for integrated pest management.`,
      },
      {
        title: "Harvest & Post-Harvest",
        emoji: "Harvest",
        desc: `Harvest at the right maturity: ${p.harvestMonth || p.season}. ${p.shelf !== 999 ? `Shelf life is about ${p.shelf} months when properly stored.` : "Long shelf life when properly dried."} Clean, grade, and pack carefully for the best market price.`,
      },
    ],
    videos: [
      {
        id: "dQw4w9WgXcQ",
        title: `${p.name} Cultivation Guide`,
        desc: `Search YouTube for Nepal-specific farming tutorials for ${p.name}.`,
      },
    ],
    warnings:
      "Always get advice from local DADO or NARC extension workers before investing. Conditions vary across Nepal's 77 districts.",
  };
}
