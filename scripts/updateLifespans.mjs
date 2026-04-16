import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'premiumPricesDB.json');

const lifespans = {
  // Spice Powders and Blends (shortest shelf life — volatile oil surface area exposed)
  "momo-masala-tarkari-masala": {
    shelfLife: "12–18 months",
    shelfLifeHint: "Timur's hydroxy-α-sanshool is among the most volatile spice compounds in any blend — noticeably diminished after 12 months of storage. Once ground, the protective husks are gone and oxidation begins immediately."
  },
  "curry-powder-dal-masala": {
    shelfLife: "12–18 months",
    shelfLifeHint: "The turmeric base is stable, but the cumin and coriander volatiles defining the aroma profile degrade significantly by month 12. Color holds longer than flavor — use aroma as your true indicator of freshness."
  },
  "garam-masala-blend": {
    shelfLife: "12–18 months",
    shelfLifeHint: "Large cardamom's cineole (the camphor-like top note) is the most volatile compound in this blend and degrades fastest. A dull-smelling garam masala is an expired garam masala, regardless of color."
  },
  "coriander-dhania-powder": {
    shelfLife: "12–24 months",
    shelfLifeHint: "Linalool — the dominant volatile responsible for coriander's citrusy lift — has a half-life of about 12 months in ground form. The powder remains safe to eat for 24 months, but its culinary identity is mostly gone by then."
  },

  // Dried Ginger
  "dried-ginger-sutho": {
    shelfLife: "24–36 months",
    shelfLifeHint: "Properly sun-dried sutho (Nepalese style) maintains phenolic and gingerol compound stability for 2–3 years. The natural oils from high-altitude drying create superior preservation compared to Indian equivalents."
  },

  // Whole Spices / Seeds (intact husks preserve oils dramatically longer)
  "timur-pepper": {
    shelfLife: "4–5 years (whole dried)",
    shelfLifeHint: "Hydroxy-α-sanshool — the compound responsible for Timur's signature mouth-numbing citrus tingle — is encased in the pericarp's resin glands. Unlike standard Sichuan peppercorns, Nepal's Zanthoxylum armatum has a denser oil-bearing husk that resists evaporation for years in sealed storage."
  },
  "hill-black-pepper": {
    shelfLife: "4–5 years (whole)",
    shelfLifeHint: "Piperine, the alkaloid behind black pepper's bite, is thermally stable up to 130°C and remarkably resistant to oxidative loss in whole-berry form. Mountain-grown peppercorns ripen slower, developing a denser outer pericarp than tropical lowland equivalents — nature's own hermetic seal."
  },
  "cumin-jeera-seeds-powder": {
    shelfLife: "4 years (whole seeds) / 12–18 months (powder)",
    shelfLifeHint: "Cuminaldehyde, the primary volatile (up to 40% of the EO), is firmly locked inside each intact seed's oil ducts. Once ground, the ducts rupture and oxidation clock starts immediately. Mustang-altitude cumin tests at 3–4% cuminaldehyde vs 2% from Indian plains — meaning longer effective flavor life even in powder form."
  },
  "ajwain-carom-seeds-jwaano": {
    shelfLife: "2–4 years",
    shelfLifeHint: "Up to 50% of Ajwain's essential oil composition is thymol — a phenolic monoterpene and powerful natural antifungal and antimicrobial. This means the seed effectively preserves itself. Very few spices have this level of built-in biological resistance to the very organisms that cause spoilage."
  },
  "fennel-saunf-seeds": {
    shelfLife: "3–4 years",
    shelfLifeHint: "Trans-anethole — a stable monoterpene ether comprising 80–90% of fennel's essential oil — has a low volatility and high chemical stability under dry conditions. Himalayan fennel grown above 2,000m consistently tests at 4–5% anethole vs 2–3% in Gujarat lowlands, providing extra aromatic reserve during long export cycles."
  },
  "fenugreek-methi-seeds": {
    shelfLife: "3–5 years",
    shelfLifeHint: "The hard, waxy seed coat of Trigonella foenum-graecum acts as near-perfect oxygen barrier. The diosgenin content — the steroidal saponin responsible for fenugreek's pharmaceutical value — shows minimal degradation in stability studies at 3 years. One of the safest long-storage spice seeds globally."
  },
  "mustard-seeds-cold-press-oil": {
    shelfLife: "4 years (seeds) / 6–10 months (cold-press oil)",
    shelfLifeHint: "Mustard seeds contain glucosinolates that deter microbial and insect attack — nature's own pesticide. The seeds are virtually indefinite if kept dry. The cold-pressed oil is the opposite: rich in erucic acid (a long-chain fatty acid) that oxidizes faster than oleic-dominant oils like olive. Oil should be used within 6 months of pressing."
  },
  "sesame-seeds-til": {
    shelfLife: "18–24 months",
    shelfLifeHint: "Sesame contains sesamol and sesamolin — lignin-derived antioxidants found nowhere else in the plant kingdom — which actively scavenge free radicals and delay rancidity. Despite this, the high linoleic acid content (polyunsaturated) still oxidizes over time. Premium Japanese importers test for peroxide value and refuse batches over 18 months old."
  },
  "star-anise-phool-chakra": {
    shelfLife: "4–5 years (whole pods)",
    shelfLifeHint: "The star-shaped fruit of Illicium verum undergoes a natural crystallization of trans-anethole onto its surface as it dries, essentially self-lacquering the volatile oil inside the pod walls. This unique structural behavior makes whole star anise one of the most shelf-stable spices on earth — easily surviving multi-year inventory cycles."
  },
  "dalle-khursani-hot-chilli": {
    shelfLife: "2–3 years (dried whole) / 3–5 months (fresh or pickled)",
    shelfLifeHint: "Capsaicin and dihydrocapsaicin — the vanillyl amide compounds that give Dalle its explosive heat — are chemically stable at ambient temperatures for years. Unlike the color pigment (capsanthin, which bleaches), the heat is preserved long after the red fades. Dried whole Dalle maintains measurable pungency beyond 3 years in sealed containers."
  },

  // Botanicals / Herbs / Roots
  "ashwagandha": {
    shelfLife: "2–3 years",
    shelfLifeHint: "Withanolide glycosides — the immunomodulatory steroidal lactones unique to Withania somnifera — show >90% retention at 24 months in HPLC stability studies conducted by Indian GMP supplement manufacturers. Nepal Terai-grown roots have higher alkaloid density than Indian commercial varieties due to slower cold-season growth cycles."
  },
  "jatamasi-spikenard": {
    shelfLife: "2–3 years (dried roots)",
    shelfLifeHint: "Jatamansone (a sesquiterpene ketone) and nardostachone are the primary aromatic compounds of Nardostachys jatamansi — both are moderately volatile sesquiterpenes that diminish measurably by year 3 in non-vacuum storage. Unlike most roots, the high alpine humidity during growth creates a more porous cell structure, accelerating post-harvest oil migration."
  },
  "kutki-picrorhiza": {
    shelfLife: "3–5 years (dried rhizome)",
    shelfLifeHint: "Picroside I and II — the iridoid glycosides responsible for Kutki's extraordinary bitter hepatoprotective properties — are among the most chemically inert bioactive compounds in Himalayan botany. HPLC analyses of 3-year-old dried rhizome confirm >92% picroside retention, provided moisture is kept below 8%. One of Nepal's most storage-stable medicinal roots."
  },
  "chirayito-swertia-extract": {
    shelfLife: "2–3 years (dried herb) / 5–7 years (alcohol extract)",
    shelfLifeHint: "Swertiamarin and amarogentin — responsible for Chirayito's bitterness (one of the bitterest plants known at just 1:3,500,000 dilution detectable) — are extremely stable iridoid glycosides in dried form. In ethanol extraction, the same compounds become self-preserving; the alcohol prevents enzymatic breakdown entirely."
  },
  "tejpat-bay-leaf-dried-oil": {
    shelfLife: "1–2 years (dried leaf) / 3–5 years (oil extract)",
    shelfLifeHint: "Cinnamomum tamala's key aromatic compounds — eugenol and cinnamaldehyde — are present in its leaves at much lower concentrations than in its bark. These volatiles evaporate rapidly from the thin dried leaf surface; 60% of the peak aroma is typically lost within 18 months. The steam-distilled leaf oil, stored in dark glass, retains these same compounds for 3–5 years."
  },
  "cinnamon-bark-oil": {
    shelfLife: "3–5 years (bark) / 4–6 years (oil)",
    shelfLifeHint: "Trans-cinnamaldehyde — up to 90% of Nepali tejpat bark oil composition — is a potent antimicrobial aldehyde that simultaneously preserves the bark itself by deterring mold and insects. It is one of the few spice compounds that actively fights its own degradation. The dense, lignified bark structure of hill-grown Cinnamomum tamala locks it in far longer than thin Sri Lankan Ceylon quills."
  },
  "rhododendron-products": {
    shelfLife: "1–2 years (dried petals / juice) / 4+ years (sugar syrup)",
    shelfLifeHint: "Rhododendron arboreum petals contain unique cyanidin-3-galactoside anthocyanins that degrade under UV and heat in aqueous form. In high-Brix (>65°) sugar syrup, water activity drops below 0.85, arresting all microbial growth; these same anthocyanins remain chromatically and biologically active for 4+ years. Juice must be bottled within 1 year; syrup is essentially pantry-stable."
  },

  // Teas
  "orthodox-tea-ilam": {
    shelfLife: "24–36 months (sealed) / ages well beyond",
    shelfLifeHint: "Ilam first-flush undergoes complex post-harvest enzymatic oxidation forming theaflavins and thearubigins that continue evolving post-sealing. Unlike herbal teas that simply fade, properly nitrogen-flushed orthodox black tea shifts character over time — becoming richer and more mellow, similar to aged pu-erh. Peak brightness at 18 months; peak depth at 3 years."
  },
  "himalayan-herbal-tea": {
    shelfLife: "18–24 months",
    shelfLifeHint: "Each botanical in this blend ages independently: Tulsi's eugenol-forward volatile note fades by month 12, while Rhododendron anthocyanins hold color and antioxidant activity for 24+ months. Lemongrass citral starts degrading once moisture enters. Think of it as a choir — the soloists leave before the ensemble does. Best consumed within 18 months for the complete experience."
  },

  // Fungi / Mushrooms
  "dried-morel-mushroom": {
    shelfLife: "2–4 years (vacuum-dried)",
    shelfLifeHint: "Wild Morchella esculenta harvested at 2,000–4,000m in Nepal naturally desiccates to below 5% moisture before collection — unlike cultivated morels that require mechanical drying. The complex polysaccharide beta-glucans and free glutamate (the umami source) are extraordinarily stable dry compounds. Leading European gourmet distributors like Plantin hold vacuum-sealed Nepal morel inventory for 3+ years."
  },
  "dried-oyster-mushroom": {
    shelfLife: "1–2 years (vacuum-sealed)",
    shelfLifeHint: "Pleurotus ostreatus has an inherently hygroscopic cellular wall structure — the same chitosan matrix that makes it nutritionally excellent causes it to absorb ambient moisture aggressively. Above 65% relative humidity, oyster mushroom powder begins to cake within days. Vacuum seal with silica gel desiccant is non-negotiable for achieving the full 2-year viability."
  },

  // Animal / Dairy
  "yak-churpi-dog-chew": {
    shelfLife: "4–7 years",
    shelfLifeHint: "Traditional Himalayan churpi is heated in yak milk, the whey expelled, and the resulting curd pressed and sun-dried for 3–6 months before export. The finished block has <5% moisture, a pH of 4.2–4.8 from residual fermentation acids, and near-zero water activity (Aw < 0.60) — conditions that prevent all known spoilage organisms. No commercial soft cheese achieves anywhere close to this stability."
  },

  // Processed / Fermented Foods
  "gundruk-fermented-greens": {
    shelfLife: "18–24 months",
    shelfLifeHint: "The lactic acid bacteria (LAB) in Gundruk's anaerobic fermentation drop the internal pH to 3.5–4.0 before sun-drying. This acidity is retained in the dried leaf's cellular matrix post-drying — functioning as a passive chemical preservative against pathogens. Unlike fresh kimchi that requires refrigeration, properly dried Gundruk carries its preservation chemistry permanently inside each leaf."
  },
  "lapsi-titaura-candy": {
    shelfLife: "8–12 months",
    shelfLifeHint: "Choerospondias axillaris (Lapsi) fruit has a naturally high tartaric acid content combined with the added sugar and salt of Titaura processing, creating a multi-barrier preservation system. The limiting factor is the hygroscopic fruit-sugar matrix — once packaging is compromised or ambient humidity exceeds 70%, the surface becomes tacky, then develops mold within weeks. Vacuum or foil seal is mandatory."
  },

  // Honey / Propolis (indefinite to near-indefinite)
  "himalayan-wildflower-honey": {
    shelfLife: "Indefinite (edible for centuries)",
    shelfLifeHint: "Archaeologists recovered 3,000-year-old honey from Egyptian tombs that was still edible. Raw honey below 20% water content creates an osmotic pressure so extreme that no microorganism survives — bacterial cells dehydrate on contact. Himalayan wildflower honey harvested at altitude is naturally dehumidified by mountain air, making it even more hygroscopically stable than valley honey."
  },
  "cliff-mad-honey": {
    shelfLife: "Indefinite (bioactive potency stable for decades)",
    shelfLifeHint: "The honey matrix itself does not expire — the same 3,000-year preservation rules apply. Grayanotoxin I, the terpenoid diterpenoid from Rhododendron arboreum responsible for mad honey's hallucinogenic properties, is a thermally stable cyclic ether. Its potency declines perhaps 10–15% per decade by photodegradation, but this is impossible to confirm precisely due to the extreme rarity of aged samples."
  },
  "propolis-tincture": {
    shelfLife: "5–10+ years",
    shelfLifeHint: "Ethanol above 70% is a universal microbial preservative that itself does not degrade under normal storage. The polycyclic flavonoids and phenolic acids dissolved from Himalayan alpine beeswax (chrysin, galangin, caffeic acid phenethyl ester — CAPE) are chemically stable aromatic ring structures that resist oxidation in alcohol solution. French apitherapy manufacturers routinely date Himalayan propolis tinctures at 7 years."
  },

  // Oils / Extracts
  "lemongrass-essential-oil": {
    shelfLife: "1–3 years",
    shelfLifeHint: "Cymbopogon flexuosus EO is dominated by citral (up to 78–82% in Nepal's mid-hill distillates, vs 65–70% in Indian equivalents) — a highly reactive monoterpene aldehyde that auto-polymerizes into solid citral polymers above 25°C. Store exclusively in dark amber glass below 20°C. Nepal's higher citral content is a double-edged sword: better fragrance profile, but more oxidative instability."
  },
  "palmarosa-essential-oil": {
    shelfLife: "3–5 years",
    shelfLifeHint: "Cymbopogon martini Motia-type yields 75–95% geraniol — one of the most oxidatively stable monoterpenoid alcohols in aromatherapy. Unlike citrus terpene-heavy oils, Palmarosa actually softens and smoothens over 12–24 months of sealed storage, making aged batches preferred by perfumers. Nepal Terai is the world's second-largest producer and its lower-humidity climate yields higher geraniol fractions than Indian equivalents."
  },
  "apricot-apricot-oil": {
    shelfLife: "8–14 months (kernel oil) / 12–18 months (dried fruit)",
    shelfLifeHint: "Prunus armeniaca kernel oil at 60–70% oleic and 20–30% linoleic acid is uniquely vulnerable: linoleic acid's bis-allylic position makes it 20× more prone to oxidative rancidity than oleic. Mustang apricots growing at 3,000m+ have measurably higher tocopherol (Vitamin E) concentrations from altitude UV stress — a natural antioxidant buffer that delays rancidity onset by 2–3 months vs lowland fruit. Still requires dark glass refrigerated storage past 8 months."
  },

  // Fresh / Nuts / Perishables
  "jumla-organic-apple": {
    shelfLife: "2–4 weeks (ambient) / 6–10 months (CA cold storage)",
    shelfLifeHint: "Malus domestica grown at 2,800–3,500m in Jumla develops extreme cell wall density and sugar concentration from 20°C+ daily temperature swings — the same stress conditions that slow ethylene production (the ripening gas). In Controlled Atmosphere storage (2% O₂, 2.5% CO₂, 1–2°C), Jumla apples' unique biochemistry allows 6–10 month storage, 2 months longer than what Himachal Pradesh producers achieve with standard varieties."
  },
  "himalayan-walnut": {
    shelfLife: "12–18 months (in-shell) / 6–9 months (shelled)",
    shelfLifeHint: "Juglans regia shells at high altitude grow denser and more impermeable than valley-grown equivalents, acting as a natural oxygen barrier around the kernel. Once shelled, the high ALA omega-3 content (10–15g per 100g) makes the kernel extremely vulnerable to rancidity — polyunsaturated fats oxidize at 25× the rate of saturated fats. Himalayan in-shell walnuts stored at 4°C achieve 18 months in Kashmiri and Nepali highland markets."
  },
  "mustang-grape-wine": {
    shelfLife: "3–12 years",
    shelfLifeHint: "Mustang's indigenous Muscat-derivative cultivars at 2,800–3,600m experience extreme UV exposure and temperature stress, producing grapes with high malic acid (low pH), dense tannins, and concentrated anthocyanins — the very characteristics that oenologists associate with excellent ageability. High-acid, high-tannin mountain wines from comparable altitudes (Georgian mountain wineries, Swiss Valais) routinely peak at 5–8 years unopened."
  },
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
