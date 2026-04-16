import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'premiumPricesDB.json');

const uniqueInsights = {
  "large-cardamom": {
    globalCompetitiveness: "Large cardamom is Nepal's highest net foreign exchange agricultural crop. The eastern Himalayan microclimate provides a built-in advantage without requiring heavy technological intervention. Vulnerable only to viral blights and over-reliance on single-country transit.",
    willBeConsumed: "Absolutely. Dried spices are highly liquid on the global commodities market. Demand in the Middle East, South Asia, and expanding US/EU ethnic sectors vastly outstrips supply. Every quality kilogram exported has a guaranteed buyer."
  },
  "yarsa-gumba-cordyceps": {
    globalCompetitiveness: "An unassailable regional monopoly shared with the Tibetan plateau. Synthetic laboratory analogs cannot replicate the perceived potency or cultural prestige of wild-harvested Himalayan fungus.",
    willBeConsumed: "Undeniable. Demand across the Traditional Chinese Medicine (TCM) demographic continuously pushes against a biologically shrinking and heavily regulated wild supply, enforcing extreme valuations."
  },
  "dried-ginger-sutho": {
    globalCompetitiveness: "Nepal is among the top global ginger producers. The organic, fibrous strains grown here are highly potent. The historic barrier to dominating markets has been inadequate local washing and dehydrating infrastructure.",
    willBeConsumed: "Extremely high. Ginger is deeply embedded across universal pharmaceutical, cosmetic, and culinary industries. Dehydrated ginger bypasses perishability limits entirely."
  },
  "orthodox-tea-ilam": {
    globalCompetitiveness: "Ilam estates sit at identical elevations to Darjeeling, yielding flavor profiles that rival or exceed Indian counterparts. Establishing distinct terroir branding allows it to break free from cheap white-label blending.",
    willBeConsumed: "Strongly. The specialty tea sector aggressively seeks single-origin, high-altitude organic teas. Direct-to-consumer pipelines globally will absorb premium orthodox production."
  },
  "timur-pepper": {
    globalCompetitiveness: "While related to Sichuan pepper, Timur possesses a distinct, sharp grapefruit-like citrus note. It commands premium positioning when marketed directly to high-end European gastronomy and perfumeries.",
    willBeConsumed: "Yes. It has successfully broken into French Michelin-starred culinary circuits. Though a niche botanical, its intensely loyal commercial demand guarantees continual off-take."
  },
  "garam-masala-blend": {
    globalCompetitiveness: "Highly contested. Nepalese blends compete fiercely against massive Indian FMCG conglomerates. Success relies entirely on positioning as small-batch, authentic, and hand-milled artisan exports.",
    willBeConsumed: "Consistent. Diaspora communities form a solid baseline, while Western adoption of sub-continental culinary arts guarantees steady retail velocity."
  },
  "yak-churpi-dog-chew": {
    globalCompetitiveness: "A brilliant repurposing of a traditional trans-Himalayan dairy block into the lucrative Western pet care industry. Nepal holds a massive first-mover advantage over synthetic competitors.",
    willBeConsumed: "Aggressively. Modern affluent pet owners consider natural, lactose-free, long-lasting Himalayan chews a premium necessity. It represents one of Nepal's fastest-growing physical exports."
  },
  "jumla-organic-apple": {
    globalCompetitiveness: "Grown at supreme altitudes, Jumla apples concentrate intense sugars and crispness, completely dominating South Asia's high-end organic niche over mass-produced waxy imports.",
    willBeConsumed: "Certainly, contingent on logistics. Implementing Controlled Atmosphere (CA) cold chains to transport them bruise-free allows elite grocers in major Asian hubs to sell them as luxury gift fruits."
  },
  "dalle-khursani-hot-chilli": {
    globalCompetitiveness: "Its uniquely explosive heat and distinct cherry-like flavor profile give it an edge over standard capsaicin variants. Highly competitive when exported pickled in brine or vinegar.",
    willBeConsumed: "High. The global hot sauce and fiery-foods industry expands annually. Dalle crosses over from ethnic nostalgia food into mainstream boutique hot sauces smoothly."
  },
  "himalayan-herbal-tea": {
    globalCompetitiveness: "Proprietary blends of Tulsi, lemongrass, and local botanicals leverage the global perception of the Himalayas as a pure, spiritual healing source—a massive organic marketing advantage.",
    willBeConsumed: "Yes. The caffeine-free wellness and functional beverage spaces in the West are expanding rapidly, securing long-term shelf space in holistic and organic health supermarkets."
  },
  "himalayan-wildflower-honey": {
    globalCompetitiveness: "Extreme topographical biodiversity creates a complex, medicinal flavor profile impossible to replicate in industrial flatland apiaries. Certified organic batches compete with elite global standards.",
    willBeConsumed: "Guaranteed. The worldwide market is starved for authentic, unadulterated, raw honey. High-end cosmetic brands and boutique grocers eagerly absorb all verifiable stock."
  },
  "cliff-mad-honey": {
    globalCompetitiveness: "A true geopolitical monopoly. Only specific cliff-dwelling bees feeding on high-altitude rhododendrons produce this grayanotoxin-laced export. Rarity dictates its extreme pricing.",
    willBeConsumed: "Highly niche but strictly consumed. Driven entirely by experimental, medicinal, and novelty markets. Demand universally exceeds the dangerous, limited harvesting mechanics."
  },
  "mustang-grape-wine": {
    globalCompetitiveness: "A supreme novelty in global viticulture. Marketing 'wines from the roof of the world' commands instant curiosity and high initial bottle valuations in export markets.",
    willBeConsumed: "Yes, as a luxury curiosity item. Sommeliers and high-altitude enthusiasts ensure early batches sell out instantly, though true scaling requires broad international terroir validation."
  },
  "ashwagandha": {
    globalCompetitiveness: "Himalayan-grown medicinal roots claim superior Ayurvedic potency. However, export logistics must strictly enforce organic certification to bypass harsh international pharmaceutical safety rejections.",
    willBeConsumed: "Massively. Ashwagandha has integrated into mainstream Western supplement aisles as a premier adaptogen for stress reduction, creating a highly liquid global demand pipeline."
  },
  "gundruk-fermented-greens": {
    globalCompetitiveness: "Currently heavily restricted to the Nepalese diaspora. To unlock global scale, it requires transitioning from cultural nostalgia into the mainstream 'probiotic superfood' narrative.",
    willBeConsumed: "Steadily. The diaspora consumes current supply pipelines fully, but breaking into the Western health-food market relies on strategic packaging and microbiological lab certifications."
  },
  "lemongrass-essential-oil": {
    globalCompetitiveness: "Nepal's mid-hills produce high-citral content lemongrass. The primary hurdle is achieving GC-MS lab testing standardization required by massive European and American cosmetic buyers.",
    willBeConsumed: "Absolutely. Industrial demand across natural perfumery, high-end soaps, and aromatherapy diffusers guarantees bulk wholesale purchasing of any certified-grade oil."
  },
  "cinnamon-bark-oil": {
    globalCompetitiveness: "Nepalese Cinnamomum tamala derivatives face steep competition from true Ceylon cinnamon but maintain a cost-effective, high-yield niche in industrial flavoring markets.",
    willBeConsumed: "Persistent. Used extensively in global dental care products, oral flavorings, and holistic antimicrobial therapies, ensuring constant underlying industrial demand."
  },
  "momo-masala-tarkari-masala": {
    globalCompetitiveness: "Cultural diffusion has seeded this product. As Momo dumplings penetrate Western fast-casual dining, the demand for authentic, localized seasoning blends outpaces standard generic curries.",
    willBeConsumed: "High growth. Western restaurants attempting fusion cuisine and diaspora retail grocers form an expanding footprint for pre-mixed artisanal spice packs."
  },
  "curry-powder-dal-masala": {
    globalCompetitiveness: "A highly saturated global market. Nepalese Dal Masala differentiates itself via unique inclusion of mountain spices over the heavier cardamom/clove focused coastal blends.",
    willBeConsumed: "Stable. A classic pantry staple worldwide. Profitability relies on premium packaging to escape the low-margin bulk spice commodity trap."
  },    
  "coriander-dhania-powder": {
    globalCompetitiveness: "A worldwide staple commodity. High domestic yields allow for aggressive pricing, but raw bulk exports often lose margin compared to packaged, retail-ready branded milling.",
    willBeConsumed: "Guaranteed. Coriander acts as a foundational base note for nearly all South Asian, Middle Eastern, and Latin American spice profiles. It is a mandatory culinary component."
  },
  "cumin-jeera-seeds-powder": {
    globalCompetitiveness: "While Indian cumin sets the global pricing floor, mountain-grown cumin provides intense volatile oil levels. Differentiating organic highland strains is key to escaping baseline commodity pricing.",
    willBeConsumed: "Absolute. Cumin's integration into global cuisine guarantees infinite liquidation potential on the commodities board, making it a perfectly safe export staple."
  },
  "dried-morel-mushroom": {
    globalCompetitiveness: "One of the most expensive and mysterious wild mushrooms globally. Nepal acts as a pristine, unpolluted sourcing origin for European gastronomy markets willing to pay exorbitant premiums.",
    willBeConsumed: "Instantaneous. Michelin-starred restaurants and elite gourmet grocers in France, Switzerland, and the US absorb dried morel harvests almost immediately upon market entry."
  },
  "kutki-picrorhiza": {
    globalCompetitiveness: "A severely endangered, high-altitude medicinal botanical. Its extreme scarcity gives Nepal incredible pricing leverage globally, but triggers intensive CITES and conservation export regulations.",
    willBeConsumed: "Entirely. Used extensively in modern clinical hepatology supplements and holistic liver treatments. Every legally harvested ounce is fiercely contested by international pharmaceutical buyers."
  },
  "fenugreek-methi-seeds": {
    globalCompetitiveness: "An incredibly resilient crop with global utility. While facing heavy volume competition from Egypt and India, organic Nepalese methi thrives as a trusted nutraceutical base layer.",
    willBeConsumed: "Extensive. Beyond culinary use, fenugreek extracts are experiencing explosive growth in Western sports nutrition APIs and holistic metabolic health supplements."
  },
  "rhododendron-products": {
    globalCompetitiveness: "A unique floral novelty. Transforming the national flower into high-end squashes, teas, and syrups positions Nepal exclusively in the global boutique, exotic-botanical beverage space.",
    willBeConsumed: "Moderate to High. Relying heavily on boutique luxury food segments and tourism-driven specialty imports. Successful retail requires heavy brand storytelling."
  },
  "fennel-saunf-seeds": {
    globalCompetitiveness: "Himalayan fennel possesses intensely high anethole levels, granting a sweeter, richer licorice profile than Mediterranean variants, capturing premium margins from specialized buyers.",
    willBeConsumed: "Stable. Heavily utilized in South Asian breath-freshening products and globally as a foundational digestive aid in organic tea blends."
  },
  "jatamasi-spikenard": {
    globalCompetitiveness: "An ancient, globally acclaimed aromatic root. Nepal controls the premier natural origin environment. Like Kutki, its value is derived entirely from its rare, wild-harvested high elevation status.",
    willBeConsumed: "Intense. Elite European perfumery houses and holistic aromatherapy circuits pay extreme premiums for authentic, unregulated Spikenard essential oil derivatives."
  },
  "chirayito-swertia-extract": {
    globalCompetitiveness: "Recognized as the bitterest medicinal plant in Ayurveda. Superior wild strains grown in traditional Nepalese soil easily out-value cultivated lowland synthetic bitters.",
    willBeConsumed: "Niche but resolute. Pharmaceutical demand for natural anti-fever and anti-malarial compounds guarantees a hard floor for bulk wholesale purchasing from laboratories."
  },
  "ajwain-carom-seeds-jwaano": {
    globalCompetitiveness: "Essential to postpartum and digestive traditions. Nepalese Jwaano competes strongly in the diaspora matrix but lacks aggressive marketing toward Western holistic wellness audiences.",
    willBeConsumed: "Consistent. While obscure to Western diets, the surging global interest in functional, gut-health foods provides a massive untapped runway for Ajwain expansion."
  },
  "apricot-apricot-oil": {
    globalCompetitiveness: "Mustang and Dolpo cold-pressed apricot kernel oil acts as a direct, superior competitor to Argan or Jojoba oil. Pristine mountain sourcing provides unmatched cosmetic marketing narratives.",
    willBeConsumed: "Extremely high. The Korean and Western organic skincare industries constantly hunt for novel, lightweight, non-comedogenic mountain oils to act as premium serum carrier bases."
  },
  "tejpat-bay-leaf-dried-oil": {
    globalCompetitiveness: "The distinct camphor notes of Nepalese Cinnamomum tamala vastly differentiate it from European Laurel bay leaves. It holds a permanent monopoly over authentic South Asian spice blends.",
    willBeConsumed: "Universal. Mandatory for authentic biryanis and specialized meat braises globally. Dried bay leaves travel impeccably, making them a virtually zero-risk export."
  },
  "propolis-tincture": {
    globalCompetitiveness: "Wild Himalayan bees harvest resin from unique alpine conifers, creating a propolis composition with extraordinarily localized, broad-spectrum antibiotic properties that flatland farms cannot match.",
    willBeConsumed: "Vigorous. The natural wellness sector's reliance on immune-support tinctures guarantees high retail velocity, especially in EU and Japanese organic pharmaceutical channels."
  },
  "mustard-seeds-cold-press-oil": {
    globalCompetitiveness: "Himalayan mustard possesses intense pungency desired universally. While generic cooking oil variants face massive commodity competition, premium small-batch cold-pressed lines dominate health segments.",
    willBeConsumed: "Steady. Widely consumed across the diaspora. Breaking into the broader Western market necessitates navigating specific FDA regulations surrounding erucic acid labeling."
  },
  "palmarosa-essential-oil": {
    globalCompetitiveness: "Nepalese Palmarosa provides a highly stable, geraniol-rich profile that mimics rosewood. It commands extreme value in the soap and fragrance industries aiming for floral notes without the cost of Rose Otto.",
    willBeConsumed: "Massively. Essential oil wholesalers worldwide continuously off-take Palmarosa as an indispensable, cost-effective industrial botanical foundational component."
  },
  "himalayan-walnut": {
    globalCompetitiveness: "Indigenously hard-shelled but bursting with high-fat, rich flavor profiles. They are marketed successfully as rare, wild-foraged superfoods contrasting with genetically homogenized Californian walnuts.",
    willBeConsumed: "High. The global luxury nut and trail-mix market eagerly accepts unhybridized, ancient-strain walnuts, provided shelling and decortication infrastructure meets sanitary export bounds."
  },
  "star-anise-phool-chakra": {
    globalCompetitiveness: "An essential architectural spice. While facing Chinese production dominance, distinct Nepalese organic certification streams secure specialized, high-margin buyers avoiding heavy agricultural pesticide belts.",
    willBeConsumed: "Solid. Crucial to global culinary phenomena like Vietnamese Pho bases, Chinese five-spice, and Western winter/holiday beverage infusions, guaranteeing permanent demand."
  },
  "dried-oyster-mushroom": {
    globalCompetitiveness: "Oyster mushrooms dry exceptionally well. Nepal's altitude and relative isolation provide virtually pest-free growth environments, drastically minimizing the need for fungicides.",
    willBeConsumed: "High. The global pivot towards plant-based diets utilizes rehydrated oyster mushrooms extensively as a high-protein, umami-rich meat substitute in modern restaurant chains."
  },
  "hill-black-pepper": {
    globalCompetitiveness: "Mountain-grown pepper variants mature slower, creating smaller but wildly concentrated peppercorns. This piperine density allows brands to charge exotic markups over standard Vietnamese bulk pepper.",
    willBeConsumed: "Absolute. Black pepper is the undisputed king of global spices. Every civilization across the planet consumes it daily, ensuring limitless market depth."
  },
  "lapsi-titaura-candy": {
    globalCompetitiveness: "An entirely exclusive Nepali endemic export. The complex sour-spicy-sweet profile of the Nepalese Hog Plum holds zero global equivalents, operating with a complete cultural monopoly.",
    willBeConsumed: "Intensely by the diaspora. To achieve mainstream crossover, production must pivot from traditional pulp sheets into precisely portioned, FDA-compliant gummy/chew sectors."
  },
  "sesame-seeds-til": {
    globalCompetitiveness: "Though competing against massive African bulk exports, the Nepalese black and golden mountain strains provide distinct aesthetic and nutritional profiles sought extensively by high-end Japanese and Korean importers.",
    willBeConsumed: "Voluminous. Pushed globally by the soaring popularity of Tahini, Asian sauces, and healthy bakery garnishes, keeping wholesale ledgers aggressively cleared."
  }
};

async function run() {
  try {
    const rawData = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(rawData);

    for (const [slug, item] of Object.entries(db)) {
      if (uniqueInsights[slug]) {
        db[slug].globalCompetitiveness = uniqueInsights[slug].globalCompetitiveness;
        db[slug].willBeConsumed = uniqueInsights[slug].willBeConsumed;
        console.log(`Updated insights for ${slug}`);
      } else {
        console.warn(`No tailored insight found for ${slug}`);
      }
    }

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('\nSuccessfully scrubbed all generic insights and applied tailored intelligence!');
  } catch(e) {
    console.error(e);
  }
}

run();
