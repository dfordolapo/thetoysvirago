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

Carefully study the ACTUAL product photo attached to this request. Before writing, silently identify exactly what is visible:
- product type and form (for example: rose sucker, rabbit vibrator, curved wand, lace teddy, satin robe, restraint cuff, glide bottle)
- exact colours and finishes
- materials and textures
- shape, size cues and any accessories/attachments
- buttons, controls, cords, straps, packaging or text/labels
- whether it is lingerie, a toy, lube, BDSM item or a game

Category hint: ${category}. Desired mood: ${mood}. Existing title (may be blank): ${currentTitle || 'None'}.
${context ? `Admin-entered context (use only if it matches the photo):\n${context}` : ''}

STRICT ACCURACY RULES:
- Every claim must be supported by what is visibly in the photo or by an admin-entered field that clearly matches it.
- Never invent features, materials, colours, modes, waterproofing, battery details or specs you cannot see.
- If something is not visible, describe it plainly as "appears to be" or leave it out.
- Match the item's real type. Do not describe a vibrator as lingerie or vice versa.
- Do not write generic catalogue boilerplate. Do not reuse the same paragraph structure for different products.
- Start the description with the specific item and at least two concrete visual details from this photo.
- Avoid clichés and filler including: "epitome", "transcend ordinary", "unleash", "unlock", "breathtaking", "irresistible", "undeniable", "intoxicating", "sensual technology", "boudoir heat", "celebration of feminine sovereignty".
- Tone: premium, discreet, sensual and tasteful. No explicit pornographic language, no medical or health claims.
- Write for a Nigerian luxury boutique audience.

Return ONLY valid JSON with exactly these keys:
{
  "title": "Specific 3-6 word product title naming the real item and its visible colour/type",
  "tagline": "One short hook line under 14 words that mentions a visible detail, not a generic promise",
  "badge": "2-3 uppercase words drawn from the item type or visible finish",
  "desc": "Two short paragraphs, 70-110 words total. Paragraph 1: what is actually visible. Paragraph 2: how the form is likely handled or worn, with no invented specs.",
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
