export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

const PRODUCT_TYPE_RULES = {
  toys: [
    [/rose|sucker|air.?pulse/, 'rose-shaped suction toy'],
    [/rabbit/, 'dual rabbit vibrator'],
    [/wand/, 'curved wand'],
    [/thrust|shaft/, 'thrusting massager'],
    [/flutter|panty|wearable/, 'wearable flutter vibrator'],
    [/plug|bead/, 'plug'],
    [/vibrat|bullet|massager/, 'vibrator'],
    [/dildo/, 'dildo']
  ],
  lingerie: [
    [/teddy|bodysuit/, 'teddy bodysuit'],
    [/bralette|bra\b/, 'bralette'],
    [/corset/, 'corset set'],
    [/robe/, 'robe'],
    [/thong|panty|brief/, 'matching lingerie set'],
    [/lingerie|set/, 'lingerie set']
  ],
  lubes: [
    [/warming|massage|oil/, 'warming massage oil'],
    [/water|glide|jelly/, 'water-based glide'],
    [/nectar|kissing|flavour/, 'intimate nectar'],
    [/lube|lubricant/, 'intimate lubricant']
  ],
  bdsm: [
    [/cuff/, 'padded cuffs'],
    [/rope|shibari/, 'bondage rope'],
    [/harness/, 'restraint harness'],
    [/blindfold|choker|mask/, 'blindfold and choker set'],
    [/restrain|strap/, 'restraint piece']
  ],
  games: [
    [/deck|card/, 'intimacy card deck'],
    [/position|choreography/, 'position card set'],
    [/dare|truth|game/, 'couples game']
  ]
};

const FALLBACK_TYPES = {
  toys: 'massager',
  lingerie: 'lingerie piece',
  lubes: 'intimate lubricant',
  bdsm: 'restraint piece',
  games: 'couples game'
};

const HANDLING_LINES = {
  'rose-shaped suction toy': 'Hold the opening flat against the body and change the angle slowly; the compact shape suits one-handed control.',
  'dual rabbit vibrator': 'Use the curved shaft for internal pressure while the external arm stays close, then build from a low setting.',
  'curved wand': 'Trace the curved tip over broad areas first, then hold it steady where the shape naturally rests.',
  'thrusting massager': 'Let the shaft do the movement while you guide the angle, starting on the lowest setting before increasing.',
  'wearable flutter vibrator': 'Position the curved body securely and use the controls only once it is seated comfortably.',
  plug: 'Use plenty of compatible lubricant, insert slowly, and stop if there is any discomfort.',
  dildo: 'Warm the material in your hand, add lubricant, and explore with slow pressure before deeper movement.',
  vibrator: 'Start with the broadest side against the skin, then use the tip for focused pressure once you find a comfortable angle.',
  massager: 'Start with gentle contact and adjust the angle slowly; let the shape guide where the pressure lands.',
  'teddy bodysuit': 'Adjust the straps first so the cut sits cleanly, then let the opening or high leg do the rest.',
  bralette: 'Fasten the band loosely at first, then tighten until the cups sit without gaping.',
  'corset set': 'Close the panels gradually and finish with the ribbons once the lines sit smoothly.',
  robe: 'Leave it open for a slow reveal or belt it at the waist for a cleaner line.',
  'matching lingerie set': 'Fit the top first, then adjust the bottoms so the two pieces sit level.',
  'lingerie set': 'Adjust the straps and closures before wear so the fabric falls into place without pulling.',
  'lingerie piece': 'Adjust the straps and closures before wear so the fabric falls into place without pulling.',
  'warming massage oil': 'Warm a small amount between your palms, then massage slowly into skin before adding more.',
  'water-based glide': 'Apply a small amount as needed; it works best when topped up rather than layered on at once.',
  'intimate nectar': 'Use sparingly for kissed skin and reapply when you want more slip.',
  'intimate lubricant': 'Start with a small amount and add more as needed.',
  'padded cuffs': 'Fasten loosely at first, leave room for circulation, and keep the quick-release within reach.',
  'bondage rope': 'Use slow, even tension and check skin between wraps; keep safety shears nearby.',
  'restraint harness': 'Adjust each strap before adding tension so pressure stays on the body, not the joints.',
  'blindfold and choker set': 'Fit it before restraints so you can check comfort, then remove it first when finishing.',
  'restraint piece': 'Set the fit before adding tension and check comfort often.',
  'intimacy card deck': 'Draw one card at a time and let the prompt set the pace instead of planning the whole night.',
  'position card set': 'Pick a card, reset the room around it, and move on whenever the mood shifts.',
  'couples game': 'Take turns and let each prompt set the next move.'
};

const MOOD_LINES = {
  seductive: ['Keep the pace slow and let the details do the talking.', 'Use it when you want the room to feel quieter and closer.'],
  luxe: ['The finish reads considered rather than flashy.', 'It feels deliberate, polished and easy to keep close.'],
  playful: ['It leaves room for a laugh before things get serious.', 'Keep it within reach for spur-of-the-moment plans.'],
  sensory: ['Notice the first point of contact before changing position.', 'Focus on texture, weight and temperature before adding more.']
};

const AFTERCARE_LINES = {
  toys: 'Clean it according to the material note before storing it away from heat.',
  lingerie: 'Rinse gently and dry flat so the shape holds.',
  lubes: 'Close the bottle after use and keep it away from heat.',
  bdsm: 'Check skin and hardware after use, then store the pieces separately.',
  games: 'Keep the deck in its box so the cards stay clean and ready.'
};

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function capFirst(value) {
  const text = compact(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function unique(values) {
  return Array.from(new Set(values.map(compact).filter(Boolean)));
}

function detectProductType(title, category) {
  const text = compact(title).toLowerCase();
  const rules = PRODUCT_TYPE_RULES[category] || PRODUCT_TYPE_RULES.toys;
  const match = rules.find(([pattern]) => pattern.test(text));
  return match ? match[1] : (FALLBACK_TYPES[category] || FALLBACK_TYPES.toys);
}

function detectFinishes(title) {
  const text = ` ${compact(title).toLowerCase()} `;
  const finishes = ['rose gold', 'gold', 'satin', 'velvet', 'lace', 'mesh', 'leather', 'silicone', 'floral', 'sheer', 'pearl', 'crystal', 'transparent', 'black', 'red'];
  return finishes.filter((finish) => text.includes(` ${finish} `) || text.includes(` ${finish}-`) || text.includes(`-${finish} `));
}

function subjectFromTitle(title, productType) {
  const cleaned = compact(title).replace(/^(the|a|an)\s+/i, '');
  const withoutLaunchWords = cleaned.replace(/^(signature|premium|luxury|new|limited)\s+/i, '');
  return compact(withoutLaunchWords) || capFirst(productType);
}

export function generateLocalProductCopy({
  lexicon,
  category = 'toys',
  mood = 'seductive',
  title = '',
  colorNames = [],
  details = {}
} = {}) {
  const pack = lexicon && (lexicon[category] || lexicon.toys);
  if (!pack) return null;

  const suppliedDetails = details && typeof details === 'object' ? details : {};
  const colors = unique(Array.isArray(colorNames) ? colorNames : []);
  const colorPhrase = colors.slice(0, 2).join(' and ').toLowerCase();
  const productType = detectProductType(title, category);
  const subject = subjectFromTitle(title, productType);
  const finishes = detectFinishes(title);
  const finishPhrase = finishes.slice(0, 2).join(' and ');
  const suppliedMaterial = compact(suppliedDetails.material);
  const suppliedSensation = compact(suppliedDetails.acoustics);
  const suppliedTagline = compact(suppliedDetails.tagline);
  const suppliedBadge = compact(suppliedDetails.badge);

  const visualBits = [];
  if (colorPhrase) visualBits.push(`a ${colorPhrase} finish`);
  if (finishPhrase) visualBits.push(`${finishPhrase} detailing`);
  if (!visualBits.length) visualBits.push('a clean, considered silhouette');

  const opening = `The ${subject} is built around ${visualBits.join(' with ')}.`;
  const handling = HANDLING_LINES[productType] || HANDLING_LINES[FALLBACK_TYPES[category] || 'massager'];
  const moodLine = pickRandom(MOOD_LINES[mood] || MOOD_LINES.seductive);
  const aftercare = AFTERCARE_LINES[category] || AFTERCARE_LINES.toys;
  const desc = `${opening} ${handling}\n\n${moodLine} ${aftercare}`;

  const shortType = productType.replace(/^rose-shaped\s+/, '');
  const taglineCandidates = [
    colorPhrase && shortType ? `${capFirst(colorPhrase)} ${shortType}.` : '',
    finishPhrase && shortType ? `${capFirst(finishPhrase)} ${shortType}.` : '',
    suppliedTagline
  ].filter(Boolean);
  const tagline = pickRandom(taglineCandidates) || pickRandom(pack.puns) || 'Made for private, unhurried moments.';

  const badgeSource = suppliedBadge || productType;
  const badge = compact(badgeSource).toUpperCase().split(/\s+/).slice(0, 3).join(' ');

  const specList = Array.isArray(pack.specs) ? pack.specs : [];
  const materialSpec = specList.find((spec) => /material|formula/i.test(spec.label || ''));
  const acousticSpec = specList.find((spec) => /acoustic|sensation|feel/i.test(spec.label || ''));

  const finalTitle = compact(title) || (colorPhrase ? `${capFirst(colorPhrase)} ${capFirst(productType)}` : pickRandom(pack.titles) || capFirst(productType));

  return {
    title: finalTitle,
    tagline,
    badge,
    desc,
    material: suppliedMaterial || (materialSpec ? materialSpec.value : 'Body-Safe Luxury Materials'),
    acoustics: suppliedSensation || (acousticSpec ? acousticSpec.value : 'Chosen for comfort and control')
  };
}
