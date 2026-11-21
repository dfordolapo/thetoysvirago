/**
 * Smart Color Resolver for TheToysVirago
 * Translates natural color names (e.g. "Rose Gold", "Noir Black", "Emerald", "Pink", "Burgundy")
 * to curated, luxury e-commerce hex color codes.
 */

export const COLOR_PALETTE = {
  // Blacks & Dark
  black: '#0c0c0e',
  noir: '#0c0c0e',
  'noir black': '#0c0c0e',
  'jet black': '#0a0a0c',
  'matte black': '#18181b',
  midnight: '#0f172a',
  'midnight black': '#0b0f19',
  onyx: '#111827',
  obsidian: '#171717',
  ebony: '#1a1a1a',
  charcoal: '#27272a',
  anthracite: '#27272a',
  graphite: '#334155',
  slate: '#475569',
  dark: '#18181b',

  // Whites & Light
  white: '#ffffff',
  'pearl white': '#f8fafc',
  pearl: '#f8fafc',
  ivory: '#fffdfa',
  alabaster: '#fdfbf7',
  cream: '#fefce8',
  'off white': '#f9fafb',
  'off-white': '#f9fafb',
  snow: '#ffffff',
  milk: '#fafaf9',
  bone: '#f5f5f4',

  // Pinks & Mauves
  pink: '#f472b6',
  'blush pink': '#f9a8d4',
  blush: '#f9a8d4',
  'baby pink': '#fbcfe8',
  'light pink': '#fbcfe8',
  'pastel pink': '#fce7f3',
  'hot pink': '#ec4899',
  fuchsia: '#d946ef',
  magenta: '#c026d3',
  neon: '#ec4899',
  rose: '#fb7185',
  'dusty rose': '#e11d48',
  'rose pink': '#f43f5e',
  mauve: '#c084fc',
  carnation: '#f472b6',

  // Reds, Rubies & Wines
  red: '#e11d48',
  ruby: '#be123c',
  'ruby red': '#be123c',
  'ruby wine': '#881337',
  crimson: '#dc2626',
  scarlet: '#ef4444',
  wine: '#722f37',
  burgundy: '#800020',
  bordeaux: '#651a2e',
  maroon: '#800000',
  oxblood: '#4a0e17',
  cherry: '#9f1239',
  merlot: '#58111a',

  // Purples & Violets
  purple: '#7c3aed',
  violet: '#8b5cf6',
  'royal purple': '#6d28d9',
  'deep purple': '#581c87',
  lavender: '#c084fc',
  'light purple': '#d8b4fe',
  lilac: '#c4b5fd',
  orchid: '#a855f7',
  plum: '#701a75',
  eggplant: '#4a044e',
  aubergine: '#4a044e',
  amethyst: '#9333ea',
  indigo: '#4f46e5',

  // Blues
  blue: '#2563eb',
  'royal blue': '#1d4ed8',
  'deep blue': '#1e40af',
  navy: '#1e3a8a',
  'navy blue': '#1e3a8a',
  'midnight blue': '#0f172a',
  cobalt: '#1d4ed8',
  ocean: '#0284c7',
  'sky blue': '#38bdf8',
  'baby blue': '#7dd3fc',
  'light blue': '#93c5fd',
  ice: '#a5f3fc',
  teal: '#0d9488',
  cyan: '#06b6d4',
  turquoise: '#14b8a6',
  aqua: '#06b6d4',
  aquamarine: '#2dd4bf',

  // Greens
  green: '#10b981',
  emerald: '#059669',
  'emerald green': '#059669',
  forest: '#15803d',
  'forest green': '#14532d',
  hunter: '#14532d',
  'hunter green': '#14532d',
  mint: '#6ee7b7',
  'mint green': '#6ee7b7',
  sage: '#84a98c',
  'sage green': '#84a98c',
  olive: '#65a30d',
  'olive green': '#4d7c0f',
  army: '#3f6212',
  'army green': '#3f6212',
  khaki: '#a3a375',
  lime: '#84cc16',
  jade: '#0f766e',
  seafoam: '#99f6e4',

  // Golds, Yellows & Metallics
  gold: '#d4af37',
  'rose gold': '#b76e79',
  rosegold: '#b76e79',
  'champagne gold': '#eedc82',
  champagne: '#f7e7ce',
  metallic: '#d4af37',
  yellow: '#facc15',
  lemon: '#fde047',
  sunshine: '#fde047',
  mustard: '#ca8a04',
  amber: '#d97706',
  bronze: '#cd7f32',
  brass: '#b5a642',
  copper: '#b87333',
  silver: '#cbd5e1',
  'metallic silver': '#94a3b8',
  chrome: '#e2e8f0',
  platinum: '#e5e7eb',
  grey: '#64748b',
  gray: '#64748b',
  'light grey': '#cbd5e1',
  'light gray': '#cbd5e1',
  'dark grey': '#334155',
  'dark gray': '#334155',
  ash: '#94a3b8',
  smoke: '#64748b',

  // Nudes, Skin tones & Browns
  nude: '#d4a373',
  'fair nude': '#f3d3be',
  'deep nude': '#b07d58',
  skin: '#d4a373',
  flesh: '#e8beac',
  tan: '#c68b59',
  beige: '#e6ccb2',
  sand: '#ddb892',
  camel: '#c19a6b',
  brown: '#5c3d2e',
  chocolate: '#3d2314',
  'dark brown': '#2b1810',
  mocha: '#4a2c1d',
  coffee: '#3b2219',
  espresso: '#26140d',
  chestnut: '#663b2a',
  caramel: '#a76d3d',
  toffee: '#8d5b2c',

  // Oranges, Corals & Peaches
  orange: '#f97316',
  coral: '#fb7185',
  peach: '#fdba74',
  apricot: '#fed7aa',
  tangerine: '#ea580c',
  terracotta: '#c2410c',
  rust: '#9a3412'
};

const SPECIFIC_KEYWORDS = [
  ['rose gold', '#b76e79'],
  ['rosegold', '#b76e79'],
  ['champagne gold', '#eedc82'],
  ['champagne', '#f7e7ce'],
  ['hot pink', '#ec4899'],
  ['baby pink', '#fbcfe8'],
  ['blush pink', '#f9a8d4'],
  ['dusty rose', '#e11d48'],
  ['rose pink', '#f43f5e'],
  ['midnight black', '#0b0f19'],
  ['jet black', '#0a0a0c'],
  ['matte black', '#18181b'],
  ['noir black', '#0c0c0e'],
  ['navy blue', '#1e3a8a'],
  ['midnight blue', '#0f172a'],
  ['royal blue', '#1d4ed8'],
  ['sky blue', '#38bdf8'],
  ['baby blue', '#7dd3fc'],
  ['emerald green', '#059669'],
  ['forest green', '#14532d'],
  ['hunter green', '#14532d'],
  ['sage green', '#84a98c'],
  ['mint green', '#6ee7b7'],
  ['olive green', '#4d7c0f'],
  ['army green', '#3f6212'],
  ['pearl white', '#f8fafc'],
  ['off white', '#f9fafb'],
  ['ruby wine', '#881337'],
  ['ruby red', '#be123c'],
  ['dark brown', '#2b1810'],
  ['fair nude', '#f3d3be'],
  ['deep nude', '#b07d58']
];

const BROAD_KEYWORDS = [
  ['black', '#0c0c0e'],
  ['noir', '#0c0c0e'],
  ['onyx', '#111827'],
  ['obsidian', '#171717'],
  ['ebony', '#1a1a1a'],
  ['white', '#ffffff'],
  ['pearl', '#f8fafc'],
  ['ivory', '#fffdfa'],
  ['cream', '#fefce8'],
  ['pink', '#f472b6'],
  ['blush', '#f9a8d4'],
  ['rose', '#fb7185'],
  ['magenta', '#c026d3'],
  ['fuchsia', '#d946ef'],
  ['purple', '#7c3aed'],
  ['violet', '#8b5cf6'],
  ['lavender', '#c084fc'],
  ['lilac', '#c4b5fd'],
  ['plum', '#701a75'],
  ['orchid', '#a855f7'],
  ['blue', '#2563eb'],
  ['navy', '#1e3a8a'],
  ['teal', '#0d9488'],
  ['cyan', '#06b6d4'],
  ['turquoise', '#14b8a6'],
  ['aqua', '#06b6d4'],
  ['green', '#10b981'],
  ['emerald', '#059669'],
  ['mint', '#6ee7b7'],
  ['sage', '#84a98c'],
  ['olive', '#65a30d'],
  ['gold', '#d4af37'],
  ['yellow', '#facc15'],
  ['lemon', '#fde047'],
  ['silver', '#cbd5e1'],
  ['chrome', '#e2e8f0'],
  ['grey', '#64748b'],
  ['gray', '#64748b'],
  ['nude', '#d4a373'],
  ['tan', '#c68b59'],
  ['beige', '#e6ccb2'],
  ['sand', '#ddb892'],
  ['skin', '#d4a373'],
  ['brown', '#5c3d2e'],
  ['chocolate', '#3d2314'],
  ['mocha', '#4a2c1d'],
  ['coffee', '#3b2219'],
  ['red', '#e11d48'],
  ['ruby', '#be123c'],
  ['crimson', '#dc2626'],
  ['scarlet', '#ef4444'],
  ['wine', '#722f37'],
  ['burgundy', '#800020'],
  ['maroon', '#800000'],
  ['cherry', '#9f1239'],
  ['orange', '#f97316'],
  ['coral', '#fb7185'],
  ['peach', '#fdba74'],
  ['bronze', '#cd7f32'],
  ['copper', '#b87333'],
  ['amber', '#d97706'],
  ['charcoal', '#27272a'],
  ['almond', '#ebd2be'],
  ['caramel', '#a76d3d'],
  ['flesh', '#e8beac']
];

/**
 * Resolves a color name or hex into a luxury hex code.
 * If input is the legacy #e11d48 bug and nameHint isn't red, it infers the real hue from the name.
 * Default fallback is deep luxury black #0c0c0e (never red).
 */
export function resolveColorHex(input = '', nameHint = '') {
  const rawInput = String(input || '').trim();
  const rawHint = String(nameHint || '').trim();

  // If already a valid hex, rgb, or hsl
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(rawInput)) {
    // If it is the legacy red bug (#e11d48 or #c0112f) and the name hint is clearly not red/ruby
    const isLegacyRed = rawInput.toLowerCase() === '#e11d48' || rawInput.toLowerCase() === '#c0112f';
    if (isLegacyRed && rawHint) {
      const hintLow = rawHint.toLowerCase();
      const isActuallyRed = /red|ruby|crimson|scarlet|wine|burgundy|maroon|cherry/i.test(hintLow);
      if (!isActuallyRed) {
        return resolveColorHex(rawHint);
      }
    }
    return rawInput;
  }
  if (/^(rgb|hsl)a?\(.+?\)$/i.test(rawInput)) {
    return rawInput;
  }

  // Use input or nameHint for resolution
  const text = (rawInput || rawHint).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '#0c0c0e';

  if (COLOR_PALETTE[text]) {
    return COLOR_PALETTE[text];
  }

  for (const [kw, hex] of SPECIFIC_KEYWORDS) {
    if (text.includes(kw)) return hex;
  }

  for (const [kw, hex] of BROAD_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(text) || text.includes(kw)) return hex;
  }

  return '#0c0c0e'; // Clean luxury black/ink fallback instead of red!
}

export function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false;
  if (hex === '#ffffff' || hex === '#fff') return true;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  }
  return false;
}

export function formatColorName(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function isRecognizedColorName(text = '') {
  const clean = String(text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return false;
  if (COLOR_PALETTE[clean]) return true;
  for (const [kw] of SPECIFIC_KEYWORDS) {
    if (clean.includes(kw)) return true;
  }
  for (const [kw] of BROAD_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(clean) || clean.includes(kw)) return true;
  }
  return false;
}

