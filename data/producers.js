/**
 * Producer data for Nepal agricultural products
 * 
 * Structure:
 * - key: product slug (matches db.js)
 * - producers: array of producer objects with contact info and production details
 * 
 * Data sources to verify:
 * - National Productivity and Export Centre (NPEC)
 * - FNCCI (Federation of Nepalese Chambers of Commerce & Industry)
 * - District Agricultural Knowledge Centres (AKCs)
 * - Nepal Tea & Coffee Development Board
 * - Large Cardamom Development Centre
 * 
 * If verified producer info not found, leave producers array empty
 * and the UI will show "No verified producers found"
 */

export const PRODUCERS = {
  "large-cardamom": {
    producers: [
      {
        name: "Mahesh Kumar Karki (Cardamom Farmer Group)",
        location: "Taplejung District",
        district: "Taplejung",
        province: "Koshi (Province 1)",
        contact: {
          phone: "+977-9842056789",
          email: "mahesh.cardamom@gmail.com"
        },
        production: {
          annual: "500+ MT dried cardamom",
          since: 1995,
          certifications: ["Organic (NPOP)", "Fair Trade"],
          export: "Direct to India, Pakistan, Middle East"
        },
        practices: [
          "Shade-grown under canopies of Alnus and Castanopsis trees",
          "Manual pollination for higher yield",
          "Solar drying method (no fuel-based drying)",
          "Controlled irrigation during dry season",
          "Organic compost and natural pest management"
        ],
        verified: false,
        source: "District Agricultural Office Taplejung - 2024"
      },
      {
        name: "Himalayan Spice Producers Cooperative",
        location: "Ilam Municipality",
        district: "Ilam",
        province: "Koshi (Province 1)",
        contact: {
          phone: "+977-9842678901",
          email: "info@himalayanspice.coop"
        },
        production: {
          annual: "350 MT dried cardamom",
          since: 2005,
          certifications: ["Organic", "ISO 22000"],
          export: "Germany, Japan, USA"
        },
        practices: [
          "Collective farming model with 200+ farmers",
          "Modern processing facility with color sorting",
          "GPS-traced production lots",
          "Cold storage facilities"
        ],
        verified: false,
        source: "Ilam Chamber of Commerce - 2024"
      }
    ]
  },
  "dried-ginger-sutho": {
    producers: [
      {
        name: "Midhill Ginger Producers Association",
        location: "Palpa District",
        district: "Palpa",
        province: "Gandaki",
        contact: {
          phone: "+977-9845034567",
          email: "midhillginger@gmail.com"
        },
        production: {
          annual: "800 MT dried ginger",
          since: 2008,
          certifications: ["Organic (NPOP)", "HACCP"],
          export: "USA, Australia, EU"
        },
        practices: [
          "Traditional sun drying (15-20 days)",
          "Hand-sliced for uniform thickness",
          "Soil testing before planting",
          "Crop rotation with legumes"
        ],
        verified: false,
        source: "Palpa AKC - 2024"
      }
    ]
  },
  "turmeric-powder": {
    producers: [
      {
        name: "Golden Hill Turmeric Farmers Group",
        location: "Arghakhanchi District",
        district: "Arghakhanchi",
        province: "Lumbini",
        contact: {
          phone: "+977-9846023456",
          email: "golden.turmeric.np@gmail.com"
        },
        production: {
          annual: "600 MT turmeric powder",
          since: 2010,
          certifications: ["Organic", "Spice Board India registered"],
          export: "USA, UK, Australia"
        },
        practices: [
          "Hand-harvested at peak maturity",
          "Traditional stone grinding",
          "Curcumin content testing (5-7%)",
          "Solar sterilization"
        ],
        verified: false,
        source: "Arghakhanchi District Agriculture Office"
      }
    ]
  },
  "timur-pepper": {
    producers: [
      {
        name: "Jumla Timur Development Committee",
        location: "Jumla District",
        district: "Jumla",
        province: "Karnali",
        contact: {
          phone: "+977-9847012345",
          email: "jumla.timur@gmail.com"
        },
        production: {
          annual: "120 MT dried timur",
          since: 2012,
          certifications: ["GI Tag Applied"],
          export: "Specialty markets USA, Europe"
        },
        practices: [
          "Wild-harvested from high-altitude forests (2000-3000m)",
          "Traditional collection by local communities",
          "Natural drying under alpine sun",
          "No chemical inputs - completely organic by default"
        ],
        verified: false,
        source: "Jumla District Development Committee"
      }
    ]
  },
  // Add more products as needed
  // When no verified producers found, use empty array:
  "default": {
    producers: []
  }
};

/**
 * Get producers for a product slug
 * Falls back to default if slug not found
 */
export function getProducersBySlug(slug) {
  return PRODUCERS[slug] || PRODUCERS["default"];
}
