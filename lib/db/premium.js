import fs from 'fs/promises';
import path from 'path';

/**
 * Database Abstraction Layer for Premium Prices.
 * Currently uses local filesystem `data/premiumPricesDB.json` for portability,
 * but architected to be hot-swapped for Prisma/MongoDB.
 */

const DB_PATH = path.join(process.cwd(), 'data', 'premiumPricesDB.json');

// Memory cache to prevent excessive IO during batch updates
let cachedDb = null;

export async function getPremiumDb() {
  try {
    const rawData = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn("Database not found, returning empty object.");
      return {};
    }
    throw error;
  }
}

export async function getPremiumItem(slug) {
  const db = await getPremiumDb();
  return db[slug] || null;
}

export async function updatePremiumItem(slug, updates) {
  const db = await getPremiumDb();

  // Merge the new data fields while preserving structure like globalCompetitiveness and willBeConsumed
  db[slug] = {
    ...db[slug],
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  return db[slug];
}

export async function batchUpdatePremiumItems(updatesMap) {
  const db = await getPremiumDb();
  
  for (const [slug, updates] of Object.entries(updatesMap)) {
    db[slug] = {
      ...db[slug],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
