import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'premiumPricesDB.json');

const lifespans = {
  // Spices (Powders and Blends)
  "momo-masala-tarkari-masala": { shelfLife: "12–24 months", shelfLifeHint: "Ground spice blends lose volatile oils faster than whole spices." },
  "curry-powder-dal-masala": { shelfLife: "12–24 months", shelfLifeHint: "Keep in airtight containers away from heat to preserve flavor profile." },
  "garam-masala-blend": { shelfLife: "12–24 months", shelfLifeHint: "Ground blend. Aroma degrades significantly after 12 months." },
  "coriander-dhania-powder": { shelfLife: "12–24 months", shelfLifeHint: "Powdered spices degrade faster. Best within 12 months for culinary potency." },
  
  // Whole Spices/Seeds
  "timur-pepper": { shelfLife: "3–4 years (whole)", shelfLifeHint: "Whole peppercorns retain essential oils incredibly well if stored dry and intact." },
  "hill-black-pepper": { shelfLife: "3–4 years (whole)", shelfLifeHint: "Whole peppercorns retain viability for years in dry, ambient conditions." },
  "cumin-jeera-seeds-powder": { shelfLife: "3–4 years (seeds) / 1 year (powder)", shelfLifeHint: "Whole seeds store excellently. Powder oxidizes and loses aroma quickly." },
  "ajwain-carom-seeds-jwaano": { shelfLife: "2–3 years", shelfLifeHint: "Whole seeds are highly robust against moisture and spoilage." },
  "fennel-saunf-seeds": { shelfLife: "2–3 years", shelfLifeHint: "Whole seeds store excellently. Aromatic qualities peak in the first 18 months." },
  "fenugreek-methi-seeds": { shelfLife: "3–4 years", shelfLifeHint: "Extremely stable whole seed. Requires strict dry storage." },
  "mustard-seeds-cold-press-oil": { shelfLife: "3–4 years (seeds) / 6-12 months (oil)", shelfLifeHint: "Cold-press oils can go rancid within a year; seeds last indefinitely if dry." },
  "sesame-seeds-til": { shelfLife: "1–2 years", shelfLifeHint: "High oil content means seeds can go rancid. Refrigeration extends life." },
  "star-anise-phool-chakra": { shelfLife: "3–4 years (whole)", shelfLifeHint: "Whole pods preserve flavor securely. Easily survives extended ocean transit." },
  "dalle-khursani-hot-chilli": { shelfLife: "1-2 years (dried) / 2 months (fresh/pickled)", shelfLifeHint: "Commercially exported mostly in brine/vinegar or fully dried." },

  // Botanicals/Herbs/Roots
  "ashwagandha": { shelfLife: "2–3 years", shelfLifeHint: "Dried root powder is stable but loses active withanolides gradually over years." },
  "jatamasi-spikenard": { shelfLife: "2–3 years", shelfLifeHint: "Dried rhizomes keep well, but essential oil content diminishes in non-hermetic storage." },
  "kutki-picrorhiza": { shelfLife: "2–3 years", shelfLifeHint: "Tightly sealed dry storage required to maintain medicinal alkaloid potency." },
  "chirayito-swertia-extract": { shelfLife: "2–3 years (dried) / 3-5 years (extract)", shelfLifeHint: "Liquid extracts in dark glass vastly outlive standard dried herbs." },
  "tejpat-bay-leaf-dried-oil": { shelfLife: "1–3 years", shelfLifeHint: "Dried leaves lose aromatic oils within 1-2 years. Oil extracts last 3+ years." },
  "cinnamon-bark-oil": { shelfLife: "3-4 years (bark) / 3-5 years (oil)", shelfLifeHint: "Bark and essential oil are highly stable and naturally antimicrobial." },
  "rhododendron-products": { shelfLife: "1-2 years (dried/juice) / 3+ years (syrup)", shelfLifeHint: "Preserved heavily with sugar or fully dried for international transit." },

  // Teas
  "orthodox-tea-ilam": { shelfLife: "18–24 months", shelfLifeHint: "Hermetic sealing and nitrogen flushing prevent oxidation during sea freight." },
  "himalayan-herbal-tea": { shelfLife: "18–24 months", shelfLifeHint: "Dried herbal blends keep well natively, but moisture absorption ruins them." },

  // Fungi/Mushrooms
  "dried-morel-mushroom": { shelfLife: "2–3 years", shelfLifeHint: "Must be completely dehydrated. Vacuum sealing ensures flawless shelf life." },
  "dried-oyster-mushroom": { shelfLife: "1–2 years", shelfLifeHint: "High absorbency requires silica gel packs or vacuum packaging during export." },

  // Animal/Dairy Products
  "yak-churpi-dog-chew": { shelfLife: "3–5 years", shelfLifeHint: "Extremely hard, low-moisture fermented dairy block. Effectively indefinite if kept completely dry." },

  // Processed/Fermented Foods
  "gundruk-fermented-greens": { shelfLife: "1–2 years", shelfLifeHint: "Sun-dried fermented leaves. Highly resilient to spoilage unless exposed to ambient moisture." },
  "lapsi-titaura-candy": { shelfLife: "6–12 months", shelfLifeHint: "Sugar and salt act as natural preservatives, but it hardens or spoils after a year." },

  // Honey/Propolis (Indefinite)
  "himalayan-wildflower-honey": { shelfLife: "Indefinite", shelfLifeHint: "Natural honey does not spoil. It may crystallize, which is easily reversible with gentle heat." },
  "cliff-mad-honey": { shelfLife: "Indefinite", shelfLifeHint: "Does not spoil, but the psychoactive grayanotoxin potency may slowly diminish over decades." },
  "propolis-tincture": { shelfLife: "3–5+ years", shelfLifeHint: "Alcohol-based propolis extracts are incredibly stable and antimicrobial." },

  // Oils / Extracts
  "lemongrass-essential-oil": { shelfLife: "2–3 years", shelfLifeHint: "Must be stored in dark glass containers away from heat to prevent oxidation." },
  "palmarosa-essential-oil": { shelfLife: "3–4 years", shelfLifeHint: "Highly stable essential oil. Dark amber bottles required for export." },
  "apricot-apricot-oil": { shelfLife: "6–12 months (oil) / 1 yr (dried)", shelfLifeHint: "Apricot kernel oil goes rancid faster than other oils. Refrigeration recommended." },

  // Fresh/Nuts/Perishables
  "jumla-organic-apple": { shelfLife: "2–4 weeks (ambient) / 4–8 months (Cold Storage)", shelfLifeHint: "Apples require strict cold-chain logistics (CA storage) for international export." },
  "himalayan-walnut": { shelfLife: "6–12 months", shelfLifeHint: "High oil content means unshelled walnuts can go rancid. Cold storage extends life to 12+ months." },
  "mustang-grape-wine": { shelfLife: "3–10+ years", shelfLifeHint: "Unopened wine continues to age and stabilize. Requires temperature-controlled palleting." },
};

async function main() {
  const rawData = await fs.readFile(DB_PATH, 'utf8');
  const db = JSON.parse(rawData);

  for (const [slug, data] of Object.entries(db)) {
    if (lifespans[slug]) {
      db[slug].shelfLife = lifespans[slug].shelfLife;
      db[slug].shelfLifeHint = lifespans[slug].shelfLifeHint;
      console.log(`Updated ${slug} lifespan`);
    } else {
        // Leave alone if not found in list (e.g. large cardamom and yarsa gumba which were done properly)
        console.log(`Skipped ${slug} (Not in lifespan map)`);
    }
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log('Successfully updated product lifespans.');
}

main().catch(console.error);
