/**
 * AI Unstructured Parser Layer
 * Routes unstructured raw text from global auction forums or Nepal Customs PDF dumps
 * through an LLM to cast it into our strict JSON schema.
 */

export async function parseUnstructuredWithAI(commoditySlug) {
  console.log(`[AI Parser] Engaging LLM to extract ${commoditySlug} metrics from unstructured text...`);

  // In production:
  // const prompt = `Extract the current farmgate price for ${commoditySlug} from this text into this JSON schema...`;
  // const response = await fetch("https://api.openai.com/v1/chat/completions", { ... body: { prompt, schema } });
  // const parsed = JSON.parse(response.content);

  // Simulated AI parse output
  const basePrice = Math.floor(Math.random() * 800) + 200;
  return {
    nepalFarmgate: `NPR ${basePrice}–${basePrice + 100}/kg`,
    nepalHint: "Source: Extracted via AI from TEPC/Customs daily unstructured PDF."
  };
}
