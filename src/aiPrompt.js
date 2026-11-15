/**
 * Shared prompt used by both the admin client and the /api/generate-copy
 * serverless function so copy generation is always grounded in the ACTUAL
 * uploaded product photo.
 */
export function buildProductCopyPrompt(category = 'toys', mood = 'seductive', currentTitle = '') {
  return `You are the senior product copywriter for TheToysVirago, Nigeria's discreet luxury pleasure boutique.

Carefully study the ACTUAL product photo attached to this request. Before writing, silently identify exactly what is visible:
- product type and form
- exact colours and finishes
- materials and textures
- shape, size cues and any accessories/attachments
- buttons, controls, cords, straps, packaging or text/labels
- whether it is lingerie, a toy, lube, BDSM item or a game

Category hint: ${category}. Desired mood: ${mood}. Existing title (may be blank): ${currentTitle || 'None'}.

STRICT ACCURACY RULES:
- Every claim must be supported by what is visibly in the photo. Never invent features, materials, colours or specs you cannot see.
- If something is not visible, describe it generically without false specifics.
- Match the item's real type. Do not describe a vibrator as lingerie or vice versa.
- Tone: premium, discreet, sensual and tasteful. No explicit pornographic language, no medical or health claims.
- Write for a Nigerian luxury boutique audience.

Return ONLY valid JSON with exactly these keys:
{
  "title": "Specific 3-6 word product title reflecting the real item and its colour/type",
  "tagline": "One provocative hook line under 14 words, grounded in the item",
  "badge": "2-3 uppercase words (e.g. LUXE LINGERIE, AIR-PULSE, SILK SATIN)",
  "desc": "Two short paragraphs, 70-110 words total, describing what is actually shown and how it feels to use",
  "material": "Concrete visible material if identifiable, otherwise a safe generic material",
  "acoustics": "Sensation/feature note relevant to this item type (or tactile feel if not applicable)"
}`;
}

export const GEMINI_VISION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

export function parseGeminiJson(text = '') {
  const clean = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}
