/**
 * Shared prompt used by both the admin client and the /api/generate-copy
 * serverless function so copy generation is always grounded in the ACTUAL
 * uploaded product photo.
 */
export function buildProductCopyPrompt(category = 'toys', mood = 'seductive', currentTitle = '', details = {}) {
  const safeDetails = details && typeof details === 'object' ? details : {};
  const context = [
    safeDetails.tagline ? `Existing tagline: ${safeDetails.tagline}` : '',
    safeDetails.badge ? `Existing badge: ${safeDetails.badge}` : '',
    safeDetails.material ? `Existing material note: ${safeDetails.material}` : '',
    safeDetails.acoustics ? `Existing sensation note: ${safeDetails.acoustics}` : '',
    safeDetails.description ? `Existing description: ${safeDetails.description.slice(0, 500)}` : ''
  ].filter(Boolean).join('\n');

  return `You are the senior product copywriter for TheToysVirago, Nigeria's discreet luxury pleasure boutique.

STEP 1 - IDENTIFY & RESEARCH THE PRODUCT IN THE IMAGE:
Carefully study the ACTUAL product photo attached to this request and use search/product knowledge to identify and research the exact item before writing:
- exact product type, brand/model (if visible on packaging, label, or distinctive silhouette) and real-world specifications
- how it actually works (e.g. air-pulse suction, reciprocating thrusting, dual-motor vibration, app control, remote, heated core, water-based glide, restraint mechanics)
- materials, textures, controls, charging/power type, and included accessories/attachments
- whether it is lingerie, a toy, lube, BDSM item or a game

Category hint (may be default or outdated - detect the true collection from the photo): ${category}. Desired mood: ${mood}. Existing title (may be blank): ${currentTitle || 'None'}.
${context ? `Admin-entered context (use only if it matches the photo):\n${context}` : ''}

STRICT ACCURACY & NO-COLOR RULES:
- STRICTLY NO COLOURS IN COPY: NEVER mention any colour, shade, or hue (no red, black, white, pink, purple, blue, green, yellow, gold, silver, rose-gold, crimson, blush, tan, brown, nude, noir, scarlet, etc.) in title, tagline, badge, desc, material, or acoustics. Products come in multiple colour variants, so copy must stay 100% colour-agnostic.
- NO EM DASHES: Never use "—" anywhere. Use " - " or commas instead.
- Ground every claim in what is visibly in the photo, verified product research for that exact model/type, or matching admin context.
- Never invent unverified claims. Match the item's real type (do not describe a vibrator as lingerie or vice versa).
- Do not write generic catalogue boilerplate or reuse the same paragraph structure for different products.
- Start the description with the specific item and concrete functional/form details.
- Avoid clichés and filler including: "epitome", "transcend ordinary", "unleash", "unlock", "breathtaking", "irresistible", "undeniable", "intoxicating", "sensual technology", "boudoir heat", "celebration of feminine sovereignty".
- Tone: premium, discreet, sensual and tasteful. No explicit pornographic language, no medical or health claims.
- Write for a Nigerian luxury boutique audience.

Return ONLY valid JSON with exactly these keys (no markdown fences, no commentary):
{
  "category": "Exact collection slug from: lingerie | toys | lubes | bdsm | games",
  "title": "Specific 3-6 word product title naming the real item and its type/style (NEVER include any colour)",
  "tagline": "One short hook line under 14 words highlighting its key form or sensation (NEVER include any colour)",
  "badge": "2-3 uppercase words drawn from the item type or key feature (NEVER include any colour)",
  "desc": "Two short paragraphs, 70-110 words total. Paragraph 1: what the product is, its form, and key features based on the photo & research. Paragraph 2: how it is used or experienced. NEVER mention any colour.",
  "material": "Concrete material (e.g. Medical-Grade Liquid Silicone, Stretch Floral Lace) with NO colour words",
  "acoustics": "Sensation/feature note relevant to this item type (or tactile feel if not applicable)"
}`;
}

export const GEMINI_VISION_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash'
];

export function parseGeminiJson(text = '') {
  const clean = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
    }
    throw err;
  }
}
