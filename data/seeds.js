/**
 * Seed price and cultivation guidance data for Nepal
 * 
 * Prices should be verified from:
 * - National Seed Company (कृषि बीउ उद्यम)
 * - State Seed Laboratories
 * - Agricultural Knowledge Centres (AKCs)
 * - District Agriculture Offices
 * 
 * Note: Most seed prices in Nepal are controlled by government subsidies
 * and vary by season/district. Prices shown are approximate retail rates.
 */

export const SEEDS = {
  "large-cardamom": {
    seeds: [
      {
        name: "Cardamom Seedlings (Suckers)",
        type: "Vegetative propagation (suckers)",
        priceNPR: null, // No data - propagated by division
        priceSource: null,
        unit: "per sucker",
        availability: "Available from existing farms",
        guidance: "Not grown from seeds. Propagated through division of mature clumps (suckers). Select 2-year-old suckers with 3-5 tillers. Plant in March-April or July-August. spacing: 2m x 2m. First harvest in 3 years."
      }
    ]
  },
  "dried-ginger-sutho": {
    seeds: [
      {
        name: "Ginger Seed Rhizomes (Local Variety)",
        type: "Rhizome cutting",
        priceNPR: 180,
        priceSource: "Ministry of Agriculture - 2024 Price List",
        unit: "per kg",
        availability: "Available nationwide",
        guidance: "Use 40-50g rhizome pieces with at least one bud. Treat with Trichoderma before planting. Plant in March-April (Baisakh) at 25-30cm spacing. Depth: 5-7cm. Requires frequent irrigation. Harvest in 8-10 months."
      },
      {
        name: "Ginger Seed Rhizomes (Improved Variety - Bhaise)",
        type: "Rhizome cutting (improved)",
        priceNPR: 250,
        priceSource: "National Seed Company - 2024",
        unit: "per kg",
        availability: "Limited, order from AKC",
        guidance: "Higher yield variety (25-30 MT/ha vs 15-20 MT/ha). Same planting method as local. Requires better drainage. Recommended for commercial cultivation."
      }
    ]
  },
  "turmeric-powder": {
    seeds: [
      {
        name: "Turmeric Seed Rhizomes (Lal Kesari)",
        type: "Rhizome cutting",
        priceNPR: 150,
        priceSource: "Ministry of Agriculture - 2024",
        unit: "per kg",
        availability: "Available in Terai districts",
        guidance: "Use 20-30g rhizome pieces with 1-2 buds. Plant in June-July (Asar) at 20cm x 15cm spacing. Depth: 5cm. Requires heavy organic matter. Harvest in 8-9 months when leaves turn yellow."
      },
      {
        name: "Turmeric Seed Rhizomes (Improved - Pokhareli)",
        type: "Rhizome cutting (improved)",
        priceNPR: 200,
        priceSource: "NARC - 2024",
        unit: "per kg",
        availability: "Available from NARC, Pokhara",
        guidance: "Higher curcumin content (4.5-5.5%). Recommended for mid-hills. Same planting method. Good storage quality."
      }
    ]
  },
  "timur-pepper": {
    seeds: [
      {
        name: "Timur Seedlings",
        type: "Wild seedling transplantation",
        priceNPR: null, // Not commercially sold - wild harvested
        priceSource: null,
        unit: "per seedling",
        availability: "Collect from wild or forest nursery",
        guidance: "Not commercially cultivated. Collected from wild forests in Jumla, Jajarkot, Dolpa at elevations 2000-3000m. Transplant 1-year-old seedlings in monsoon. Requires high altitude (cold) conditions."
      }
    ]
  },
  "dalle-khursani-hot-chilli": {
    seeds: [
      {
        name: "Dalle Khursani Seeds (Local)",
        type: "Open-pollinated seeds",
        priceNPR: 800,
        priceSource: "Local seed shops - 2024",
        unit: "per 100g",
        availability: "Available in Kathmandu, Pokhara, major cities",
        guidance: "Start in nursery 6-8 weeks before transplanting. Sow in February-March for summer crop, July-August for winter. Transplant at 4-5 leaf stage. Spacing: 60cm x 45cm. Harvest in 90-120 days."
      },
      {
        name: "Dalle Khursani Seeds (Improved - Jwala)",
        type: "Improved variety",
        priceNPR: 1200,
        priceSource: "NARC Horticulture Division",
        unit: "per 100g",
        availability: "Available from NARC, Kaski",
        guidance: "Higher pungency (SHU 80,000-100,000). More uniform fruits. Same cultivation method. Recommended for commercial production."
      }
    ]
  },
  "tejpat-bay-leaf-dried-oil": {
    seeds: [
      {
        name: "Bay Leaf Seedlings",
        type: "Vegetative propagation",
        priceNPR: null,
        priceSource: null,
        unit: "per seedling",
        availability: "Available from forest nurseries",
        guidance: "Grown from cuttings (more reliable than seeds). Take 20-25cm semi-hardwood cuttings in monsoon. Root in sand beds. Transplant after 6-8 months. First leaf harvest in 3-4 years. Leaves harvested twice a year."
      }
    ]
  },
  "hill-black-pepper": {
    seeds: [
      {
        name: "Black Pepper Cuttings (Lambey)",
        type: "Vegetative (vine cuttings)",
        priceNPR: 50,
        priceSource: "Local nurseries - 2024",
        unit: "per cutting",
        availability: "Available in hilly districts",
        guidance: "Use 2-3 node cuttings from mature vines. Root in polythene bags. Plant after monsoon starts. Requires support trees (Gliricidia, Dadak). First harvest in 3 years. Pick when berries turn red."
      }
    ]
  },
  "coffee-raw-bean": {
    seeds: [
      {
        name: "Coffee Seeds (Arabica - Catimor)",
        type: "Seed",
        priceNPR: 600,
        priceSource: "National Tea & Coffee Development Board",
        unit: "per kg",
        availability: "Available from NTCDB certified nurseries",
        guidance: "Sow in nursery beds at 2cm depth. Transplant at 6-8 months old. Shade required (40-60% shade). Elevation: 800-1500m for Arabica. Spacing: 2m x 2m. First harvest in 3 years. Organic recommended for premium prices."
      },
      {
        name: "Coffee Seeds (Robusta)",
        type: "Seed",
        priceNPR: 400,
        priceSource: "Local nurseries",
        unit: "per kg",
        availability: "Available in Terai and lower hills",
        guidance: "Lower altitude (below 800m). Less shade required. Higher yield but lower quality. Spacing: 3m x 3m. First harvest in 2-3 years. Used mostly for instant coffee."
      }
    ]
  },
  // Default fallback for products without seed data
  "default": {
    seeds: []
  }
};

/**
 * Get seed data for a product slug
 */
export function getSeedsBySlug(slug) {
  return SEEDS[slug] || SEEDS["default"];
}
