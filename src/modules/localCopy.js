/**
 * Local (no-API-key) product copy writer.
 *
 * When no Gemini key is configured the admin still needs to produce usable
 * copy. This module drafts a title, tagline, badge, description, material and
 * sensation note from the chosen category/mood, the product title, and the
 * colour names sampled from the actual uploaded photo.
 */

export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function generateLocalProductCopy({
  lexicon,
  category = 'toys',
  mood = 'seductive',
  title = '',
  colorNames = []
} = {}) {
  const pack = lexicon && (lexicon[category] || lexicon.toys);
  if (!pack) return null;

  const descriptions = pack.descriptions || {};
  const safeMood = descriptions[mood]
    ? mood
    : (descriptions.seductive ? 'seductive' : Object.keys(descriptions)[0]);

  const uniqueColors = Array.from(new Set((Array.isArray(colorNames) ? colorNames : []).filter(Boolean)));
  const colorPhrase = uniqueColors.slice(0, 2).join(' and ');

  const baseTitle = String(title || '').trim() || pickRandom(pack.titles) || 'Signature Intimate Piece';
  const firstColor = colorPhrase ? colorPhrase.split(' and ')[0] : '';
  const titleHasColor = firstColor && new RegExp(firstColor, 'i').test(baseTitle);
  const finalTitle = colorPhrase && !titleHasColor ? `${colorPhrase} ${baseTitle}` : baseTitle;

  const taglineBase = pickRandom(pack.puns) || 'Engineered for discreet, unforgettable pleasure.';
  const tagline = taglineBase.split(/\s+/).slice(0, 14).join(' ');

  const badge = pickRandom(pack.badges) || 'NEW ARRIVAL';

  let desc = descriptions[safeMood] || '';
  if (colorPhrase) {
    desc = `${desc.trim()}\n\nPresented in a ${colorPhrase.toLowerCase()} finish, sampled directly from the uploaded product photo.`;
  }

  const specs = Array.isArray(pack.specs) ? pack.specs : [];
  const materialSpec = specs.find((spec) => /material|formula/i.test(spec.label || ''));
  const acousticSpec = specs.find((spec) => /acoustic|sensation|feel/i.test(spec.label || ''));

  return {
    title: finalTitle,
    tagline,
    badge,
    desc,
    material: materialSpec ? materialSpec.value : 'Body-Safe Luxury Materials',
    acoustics: acousticSpec
      ? acousticSpec.value
      : (category === 'toys' ? 'Whisper-Quiet, Discreet Sensation' : 'Soft Against Bare Skin')
  };
}
