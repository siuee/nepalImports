/**
 * Primary Production Cron Orchestrator
 * This delegates updates to specific parser modules depending on the commodity profile.
 */
import { getPremiumDb, updatePremiumItem } from '../lib/db/premium.js';
import { fetchStructuralApi } from './scrapers/structural.mjs';
import { fetchDomData } from './scrapers/domScraper.mjs';
import { parseUnstructuredWithAI } from './scrapers/aiParser.mjs';

// Helper to chunk an array for rate limiting
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Pause between network batches
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processCommodity(slug) {
  let updates = {};

  try {
    // 1. Structural Fetching
    const structuralData = await fetchStructuralApi(slug);
    updates = { ...updates, ...structuralData };

    // 2. DOM Scrape Fetching
    const domData = await fetchDomData(slug);
    updates = { ...updates, ...domData };

    // 3. AI Unstructured Extraction
    const aiData = await parseUnstructuredWithAI(slug);
    updates = { ...updates, ...aiData };

    // 4. Upsert into Database (via our modular DB layer)
    await updatePremiumItem(slug, updates);
    console.log(`[SUCCESS] Refreshed market pipelines for ${slug}\n`);

  } catch (err) {
    console.error(`[ERROR] Pipeline failed for ${slug}:`, err.message);
  }
}

export async function runFullOrchestrator() {
  console.log("=== STARTING PRODUCTION SCRAPING PIPELINE ===");
  const startTime = Date.now();

  try {
    const db = await getPremiumDb();
    const allSlugs = Object.keys(db);

    // Batching to prevent getting IP banned by external APIs
    const batches = chunkArray(allSlugs, 5); // 5 items per batch

    for (let i = 0; i < batches.length; i++) {
        console.log(`\n--- Running Batch ${i + 1} / ${batches.length} ---`);
        const batch = batches[i];
        
        // Process promises simultaneously in a batch
        await Promise.all(batch.map(processCommodity));

        // Sleep to respect API rate limits
        if (i < batches.length - 1) {
            console.log(`Sleeping for 2s to respect provider rate limits...`);
            await delay(2000);
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n=== PRODUCTION RUN COMPLETE IN ${duration}s ===`);
    
  } catch (globalError) {
    console.error("Critical Orchestrator Failure:", globalError);
  }
}

// Automatically invoke if executed from CLI
if (process.argv[1] && process.argv[1].endsWith('orchestrator.js')) {
    runFullOrchestrator().catch(console.error);
}
