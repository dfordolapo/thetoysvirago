/**
 * TheToysVirago — Admin & Product Vault Controller
 * Manages manual product uploading, AI copywriting, image analysis, and Supabase sync.
 */

import {
  supabase,
  isSupabaseConfigured,
  getSupabaseProducts,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  getSupabaseOrders,
  updateSupabaseOrderStatus,
  sendCustomerOrderConfirmationEmail,
  subscribeToSupabaseOrders
} from './supabase.js';

// ================= 1. DIRECT ACCESS (PASSWORD REMOVED) =================
// Admin session is directly unlocked for store management.

// ================= 2. DATA STORAGE & INITIAL SEEDING =================
const CUSTOM_STORAGE_KEY = 'thetoysvirago_custom_products';

const DEFAULT_LINGERIE_SEEDS = [];

function getCustomProducts() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    const cleaned = (Array.isArray(parsed) ? parsed : []).filter(p => p && p.id !== 'noir-chantilly-teddy' && p.id !== 'scarlet-silk-chemise');
    if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.error('Error reading custom products:', e);
    return [];
  }
}

function saveCustomProducts(products) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('LocalStorage quota notice, trimming extra media:', e);
    try {
      // Store compact fallback without heavy media arrays to prevent QuotaExceededError
      const compact = products.map(p => ({
        ...p,
        media: (p.media && p.media.length > 0) ? [p.media[0]] : []
      }));
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(compact));
    } catch (e2) {
      console.error('LocalStorage completely full:', e2);
    }
  }
}

// Current working product state
let currentCustomProducts = getCustomProducts();
let allInventoryProducts = [];
let currentVariants = [];
let currentSizes = ['S', 'M', 'L'];
let sampledColorPalette = [];
let currentMediaList = []; // [{ type: 'image' | 'video', src: string, label: string }]

// Category detection dictionaries
const CATEGORY_KEYWORDS = {
  lingerie: ['chemise', 'lingerie', 'teddy', 'lace', 'bra', 'panty', 'panties', 'corset', 'silk', 'babydoll', 'g-string', 'slip', 'robe', 'satin', 'underwear', 'bodysuit', 'bustier', 'negligee'],
  lubes: ['lube', 'lubricant', 'oil', 'gel', 'glide', 'wellness', 'serum', 'butter', 'warming', 'massage', 'botanical', 'fruitastic', 'kailin'],
  bdsm: ['bdsm', 'hogtie', 'cuff', 'whip', 'flogger', 'paddle', 'collar', 'restraint', 'mask', 'rope', 'blindfold', 'gag', 'spank', 'clamp', 'harness', 'leash', 'choker', 'bondage', 'vault'],
  games: ['game', 'cards', 'dice', 'roulette', 'truth', 'dare', 'couple', 'deck', 'naughty', 'wooden', 'blocks'],
  toys: ['vibe', 'vibrator', 'wand', 'dildo', 'rabbit', 'clit', 'suction', 'air', 'bullet', 'plug', 'anal', 'masturbat', 'stroker', 'kegel', 'toy', 'silicone', 'tentacle', 'sucker']
};

const SUGGESTED_PRICES = {
  toys: 35000,
  lingerie: 28000,
  lubes: 18000,
  bdsm: 22000,
  games: 15000
};

// ================= 3. MULTI-MEDIA UPLOAD & CANVAS VISUAL ANALYZER =================
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const prodImgUrlInput = document.getElementById('prod-img-url');
const btnAddMediaUrl = document.getElementById('btn-add-media-url');
const previewBox = document.getElementById('preview-box');
const previewImg = document.getElementById('preview-img');
const btnRemovePreview = document.getElementById('btn-remove-preview');
const paletteWrap = document.getElementById('palette-wrap');
const paletteSwatches = document.getElementById('palette-swatches');
const mediaGalleryWrap = document.getElementById('media-gallery-wrap');
const mediaGalleryGrid = document.getElementById('media-gallery-grid');
const mediaCountEl = document.getElementById('media-count');
const btnAddMoreMedia = document.getElementById('btn-add-more-media');

const supabaseFixBanner = document.getElementById('supabase-fix-banner');
const btnCopySupabaseFix = document.getElementById('btn-copy-supabase-fix');
const supabaseErrorModal = document.getElementById('supabase-error-modal');
const btnModalCopySql = document.getElementById('btn-modal-copy-sql');
const btnModalCloseSql = document.getElementById('btn-modal-close-sql');

const SUPABASE_FIX_SQL = `-- TheToysVirago: Enable instant product uploads & auto-create required columns
alter table public.products disable row level security;
alter table public.products add column if not exists media jsonb default '[]'::jsonb;
alter table public.products add column if not exists sizes text[] default '{}';`;

function copySupabaseSqlFix() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(SUPABASE_FIX_SQL).then(() => {
      showToast('✓ SQL Fix copied to clipboard! Paste in Supabase SQL editor.');
    }).catch(() => fallbackCopy(SUPABASE_FIX_SQL));
  } else {
    fallbackCopy(SUPABASE_FIX_SQL);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('✓ SQL Fix copied to clipboard!');
}

if (btnCopySupabaseFix) {
  btnCopySupabaseFix.addEventListener('click', copySupabaseSqlFix);
}
if (btnModalCopySql) {
  btnModalCopySql.addEventListener('click', () => {
    copySupabaseSqlFix();
    if (supabaseErrorModal) supabaseErrorModal.style.display = 'none';
  });
}
if (btnModalCloseSql) {
  btnModalCloseSql.addEventListener('click', () => {
    if (supabaseErrorModal) supabaseErrorModal.style.display = 'none';
  });
}

function openSupabaseFixModal(errDetail = '') {
  if (supabaseErrorModal) {
    supabaseErrorModal.style.display = 'flex';
  } else {
    alert(`Supabase Row-Level Security blocked this upload.\n\nTo fix, copy this SQL and run in your Supabase SQL Editor:\n\n${SUPABASE_FIX_SQL}`);
  }
}

if (dropzone && fileInput) {
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(Array.from(e.target.files));
    }
  });
}

if (btnAddMoreMedia && fileInput) {
  btnAddMoreMedia.addEventListener('click', () => fileInput.click());
}

if (btnAddMediaUrl && prodImgUrlInput) {
  btnAddMediaUrl.addEventListener('click', () => {
    const url = prodImgUrlInput.value.trim();
    if (!url) return;
    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
    currentMediaList.push({
      type: isVideo ? 'video' : 'image',
      src: url,
      label: `Media ${currentMediaList.length + 1}`
    });
    renderMediaGallery();
    displayPreviewImage(currentMediaList[0].src);
    prodImgUrlInput.value = '';
    showToast('Media added to product gallery.');
  });
}

if (btnRemovePreview) {
  btnRemovePreview.addEventListener('click', () => {
    if (currentMediaList.length > 0) {
      currentMediaList.shift();
      renderMediaGallery();
      if (currentMediaList.length > 0) {
        displayPreviewImage(currentMediaList[0].src);
      } else {
        if (previewImg) previewImg.src = '';
        if (previewBox) previewBox.style.display = 'none';
        if (paletteWrap) paletteWrap.style.display = 'none';
        sampledColorPalette = [];
      }
    }
  });
}

function handleMultipleFiles(files) {
  const validFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
  if (validFiles.length === 0) {
    showToast('Please upload valid image or video files.');
    return;
  }

  // Warn if any video file is over 2.5MB
  validFiles.forEach(f => {
    if (f.type.startsWith('video/') && f.size > 2.5 * 1024 * 1024) {
      showToast(`Notice: Video "${f.name}" is over 2.5MB. For optimal speed, use a compressed video.`);
    }
  });

  showToast(`Processing ${validFiles.length} media file(s)...`);

  // Auto-recognize product details from first file if title not manually set
  const firstImage = validFiles.find(f => f.type.startsWith('image/')) || validFiles[0];
  if (firstImage) {
    autoRecognizeProductFromFileName(firstImage.name);
  }

  validFiles.forEach((file) => {
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isVideo) {
        currentMediaList.push({
          type: 'video',
          src: dataUrl,
          label: file.name
        });
        renderMediaGallery();
      } else {
        compressImageFile(dataUrl, (compressedUrl, ctx, w, h) => {
          // If first image, extract canvas color palette
          if (currentMediaList.length === 0 || !currentMediaList.some(m => m.type === 'image')) {
            extractPaletteFromCanvas(ctx, w, h);
          }
          currentMediaList.push({
            type: 'image',
            src: compressedUrl,
            label: file.name
          });
          renderMediaGallery();
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderMediaGallery() {
  if (!mediaGalleryWrap || !mediaGalleryGrid) return;
  if (currentMediaList.length === 0) {
    mediaGalleryWrap.style.display = 'none';
    if (previewBox) previewBox.style.display = 'none';
    return;
  }

  mediaGalleryWrap.style.display = 'block';
  if (mediaCountEl) mediaCountEl.textContent = currentMediaList.length;

  mediaGalleryGrid.innerHTML = '';
  currentMediaList.forEach((media, idx) => {
    const isPrimary = idx === 0;
    const card = document.createElement('div');
    card.className = `admin-media-card ${isPrimary ? 'is-primary' : ''}`;
    card.title = isPrimary ? 'Primary Storefront Image' : 'Click to set as primary';

    card.innerHTML = `
      ${media.type === 'video'
        ? `<video src="${media.src}" class="admin-media-thumb" muted></video><span class="admin-media-badge-type">VIDEO</span>`
        : `<img src="${media.src}" alt="${media.label || 'Product media'}" class="admin-media-thumb" />`
      }
      ${isPrimary ? '<span class="admin-media-badge-primary">PRIMARY</span>' : ''}
      <button type="button" class="admin-media-del-btn" title="Remove media" data-idx="${idx}">&times;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.admin-media-del-btn')) return;
      if (idx !== 0) {
        const [selected] = currentMediaList.splice(idx, 1);
        currentMediaList.unshift(selected);
        renderMediaGallery();
        displayPreviewImage(selected.src);
      }
    });

    const delBtn = card.querySelector('.admin-media-del-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMediaList.splice(idx, 1);
        renderMediaGallery();
        if (currentMediaList.length > 0) {
          displayPreviewImage(currentMediaList[0].src);
        } else {
          if (previewBox) previewBox.style.display = 'none';
          if (paletteWrap) paletteWrap.style.display = 'none';
        }
      });
    }

    mediaGalleryGrid.appendChild(card);
  });

  if (currentMediaList[0]) {
    displayPreviewImage(currentMediaList[0].src);
  }
}

function autoRecognizeProductFromFileName(fileName) {
  if (!fileName) return;

  const rawBase = fileName.replace(/\.[^/.]+$/, '');
  const cleanTokens = rawBase
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b(img|image|photo|screenshot|dsc|pic|copy|\d+)\b/gi, '')
    .trim();

  let detectedCategory = null;
  const lowerBase = rawBase.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(w => lowerBase.includes(w))) {
      detectedCategory = cat;
      break;
    }
  }

  const categorySelect = document.getElementById('prod-category');
  if (detectedCategory && categorySelect) {
    categorySelect.value = detectedCategory;
  }
  const effectiveCat = categorySelect ? categorySelect.value : (detectedCategory || 'toys');

  const titleInput = document.getElementById('prod-title');
  let synthesizedTitle = '';
  if (cleanTokens.length >= 3) {
    synthesizedTitle = cleanTokens
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  } else {
    const catData = BOUDOIR_LEXICON[effectiveCat] || BOUDOIR_LEXICON.lingerie;
    synthesizedTitle = catData.titles[Math.floor(Math.random() * catData.titles.length)];
  }

  if (titleInput && (!titleInput.value.trim() || titleInput.value.startsWith('Untitled'))) {
    titleInput.value = synthesizedTitle;
  }

  const priceInput = document.getElementById('prod-price');
  if (priceInput && (!priceInput.value || Number(priceInput.value) === 0)) {
    priceInput.value = SUGGESTED_PRICES[effectiveCat] || 25000;
  }

  // Synthesize complete details automatically
  setTimeout(() => {
    autoGenerateProductDescription();
  }, 200);
}

function compressImageFile(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    const maxDim = 800; // Optimized from 1200 to keep base64 payloads under 50KB

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL('image/webp', 0.80);
    if (callback) callback(compressed, ctx, width, height);
  };
  img.src = dataUrl;
}

function displayPreviewImage(src) {
  if (!previewImg || !previewBox) return;
  previewImg.src = src;
  previewBox.style.display = 'flex';
}

function extractPaletteFromCanvas(ctx, width, height) {
  try {
    const samplePoints = [
      [width * 0.5, height * 0.5],
      [width * 0.3, height * 0.4],
      [width * 0.7, height * 0.4],
      [width * 0.5, height * 0.3],
      [width * 0.5, height * 0.7]
    ];

    const swatches = [];
    samplePoints.forEach(([x, y]) => {
      const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const hex = rgbToHex(p[0], p[1], p[2]);
      if (!swatches.includes(hex)) swatches.push(hex);
    });

    sampledColorPalette = swatches;

    if (paletteSwatches && paletteWrap) {
      paletteSwatches.innerHTML = '';
      swatches.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'admin-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = `Add ${hex} as variant`;
        swatch.addEventListener('click', () => {
          addColorVariant(getColorNameFromHex(hex), hex);
        });
        paletteSwatches.appendChild(swatch);
      });
      paletteWrap.style.display = 'flex';
    }
  } catch (err) {
    console.warn('Canvas palette extraction notice:', err);
  }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function getColorNameFromHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (r > 150 && g < 80 && b < 80) return 'Ruby';
  if (r > 180 && g < 100 && b > 140) return 'Plum';
  if (r < 60 && g < 60 && b < 60) return 'Black';
  if (r > 200 && g > 200 && b > 200) return 'White';
  if (r > 180 && g > 150 && b < 100) return 'Gold';
  if (r > 180 && g > 120 && b > 120) return 'Nude';
  if (g > 140 && r < 100) return 'Green';
  if (b > 140 && r < 100) return 'Blue';
  if (r > 160 && g < 120 && b > 160) return 'Purple';
  if (r > 180 && g < 140 && b < 140) return 'Red';
  return 'Rose';
}

// ================= 4. HAUTE BOUDOIR AI COPYWRITING ENGINE =================
const btnAutoGenerateAi = document.getElementById('btn-auto-generate-ai');
const aiMoodSelect = document.getElementById('ai-mood-select');
const aiStatusText = document.getElementById('ai-status');

const BOUDOIR_LEXICON = {
  lingerie: {
    titles: [
      'Zebra Set',
      'Heart Teddy',
      'Velvet Boudoir Plunge Bodysuit',
      'Aphrodite Sheer Eyelash Bralette',
      'Midnight Provocateur Corset Set',
      'Sovereign Satin High-Waist Robe'
    ],
    puns: [
      'Delicate floral lace with dangerous plunge decolletage.',
      'Liquid satin drape with seductive open-back ties.',
      'Whisper-thin mesh engineered for total bedroom surrender.',
      'Pure lace innocence on the outside. Zero composure on the inside.',
      'Scalloped floral trims celebrating every natural curve.'
    ],
    badges: ['LUXE LINGERIE', 'FRENCH LACE', 'LIMITED DROP', 'BESTSELLER', 'NEW ARRIVAL'],
    specs: [
      { label: 'Material', value: 'French Floral Lace & Sheer Stretch Mesh' },
      { label: 'Decolletage', value: 'Plunging Wire-Free Cups with Satin Ribbons' },
      { label: 'Care', value: 'Hand Wash Cold, Lay Flat to Dry' },
      { label: 'Discretion', value: 'Plain Brown Courier Bag with Zero Product Labels' }
    ],
    descriptions: {
      seductive: `Sculpted from delicate French floral lace with scalloped eyelash trims, this piece wraps the silhouette in provocative sheer elegance. Wire-free plunge cups and adjustable cross-back silk ribbon ties drape naturally over curves, offering an irresistible balance of soft comfort and undeniable boudoir heat.

Designed for high-voltage intimacy or sensual lounging, the breathable stretch mesh feels whisper-soft against bare skin while creating captivating lines from every angle.`,
      luxe: `An exquisite tribute to Parisian haute boudoir craftsmanship. Featuring intricate Chantilly-inspired floral lace woven through sheer whisper mesh, with gleaming rose-gold hardware and tailored silk satin straps.

The open back and high-leg scalloped cut lengthen the silhouette, transforming evening rituals into an unforgettable celebration of feminine sovereignty and allure.`,
      playful: `Pure temptation in a single slip. Drapes softly where you want it and leaves nothing to be second-guessed. Designed with quick-release silk side ribbons and ultra-flexible floral lace that moves seamlessly with your body.

Slip it on under an oversized blazer or wear it solo to set the rules for the night. Drama-free, stunning, and completely intoxicating.`,
      sensory: `Engineered with high-tensile four-way stretch floral mesh and double-lined scalloped lace cups for delicate support without restrictive underwires. Ultra-fine micro-yarn seams eliminate friction on bare skin.

Includes fully adjustable silk shoulder straps and a discreet cotton-lined gusset for effortless comfort through intimate evenings.`
    }
  },
  toys: {
    titles: [
      'Aura Rose Air-Pulse Sucker',
      'Velvet Empress Dual Rabbit',
      'Sovereign G-Spot Curved Wand',
      'C-Curve Wireless Panty Flutter',
      'Monarch Heated Thrusting Shaft'
    ],
    puns: [
      'Aerodynamic touchless pulses leading to an undeniable crescendo.',
      'Bone-deep vibrations disguised as pure boudoir art.',
      'Whisper-quiet rumbles engineered for stealth bedroom luxury.',
      'Hands-free ergonomic curve that hugs all the right places.'
    ],
    badges: ['AIR-PULSE', 'BESTSELLER', 'WATERPROOF', 'WHISPER QUIET', 'APP SYNC'],
    specs: [
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Acoustics', value: '< 30 dB (Whisper Silent in Sheets)' },
      { label: 'Waterproof', value: 'IPX7 100% Submersible Bath Safe' },
      { label: 'Battery', value: 'Magnetic USB Fast Rechargeable' }
    ],
    descriptions: {
      seductive: `Engineered to transcend ordinary pleasure. Harnesses aerodynamic pressure-wave air pulses that gently flutter and stimulate without direct friction, taking you from a teasing quiver to a full-body climax in moments.

Encased in ultra-velvety body-safe silicone with an ergonomic silhouette sculpted to fit perfectly in your palm. Submersible and whisper-quiet for unhurried private bliss.`,
      luxe: `The epitome of sensual technology. Crafted with dual independent motors that orchestrate deep, low-frequency rumbles alongside pinpoint clitoral airwaves.

Finished in velvety liquid silicone with satin rose-gold accents, this device delivers effortless authority and refined pleasure that honors your desires.`,
      playful: `Small enough to slip into a purse, powerful enough to make you completely lose your composure. Ten calibrated vibration and pulse modes let you customize your journey from playful flutter to breath-stealing power.`,
      sensory: `Dual sonic-core vibration architecture operating at 70 Hz for deep muscle penetration rather than surface buzz. Features ergonomic pinpoint contours, magnetic rapid charging, and IPX7 bath waterproof sealing.`
    }
  },
  lubes: {
    titles: [
      'Botanical Silk Glide Elixir',
      'Sensual Amber Warming Massage Oil',
      'Pure Velvet Water-Based Glide',
      'Wild Berry Intimate Kissing Nectar'
    ],
    puns: [
      'Ultra-slick botanical glide with effortless warm-water rinse.',
      'Melts tension into pure skin-to-skin erotic warmth.',
      'Zero stickiness, zero residue. Pure intimate harmony.'
    ],
    badges: ['BOTANICAL', 'pH BALANCED', 'WATER-BASED', 'WARMING ELIXIR'],
    specs: [
      { label: 'Formula', value: 'Pure Plant Extracts & Hyaluronic Acid' },
      { label: 'Safety', value: 'pH-Balanced, Paraben-Free, Toy Safe' },
      { label: 'Cleanup', value: '100% Water Soluble, Non-Staining' }
    ],
    descriptions: {
      seductive: `A sumptuous botanical intimate elixir designed to unlock seamless skin-to-skin glide. Warmed by your body's natural heat, it melts away all friction while heightening every touch into breathtaking sensitivity.`,
      luxe: `Infused with cold-pressed botanical seed oils and delicate floral aromatics, this velvety nectar transforms everyday touch into an opulent boudoir ritual.`,
      playful: `Deliciously slick, playfully warming, and completely non-sticky. Perfect for prolonged foreplay, massage, and intimate adventures.`,
      sensory: `Hypoallergenic, isotonic formulation designed to mirror natural intimate moisture. Completely condom and silicone toy compatible.`
    }
  },
  bdsm: {
    titles: [
      'Sovereign Padded Leather Cuffs',
      'Noir Boudoir Restraint Harness',
      'Braided Silk Shibari Bondage Rope',
      'Emerald Velvet Blindfold & Choker'
    ],
    puns: [
      'Plush suede lining for willing captives.',
      'Turns any mattress into an intimate altar of surrender.',
      'Seductive tension and sweet bedroom authority.'
    ],
    badges: ['BDSM VAULT', 'VEGAN LEATHER', 'PADDED CUFFS', 'COUPLES PLAY'],
    specs: [
      { label: 'Material', value: 'Buttery Vegan Nappa Leather & Plush Velvet' },
      { label: 'Hardware', value: 'Heavy-Duty Burnished Rose Gold Alloy' },
      { label: 'Adjustment', value: 'Universal Sizing with Quick-Release Clips' }
    ],
    descriptions: {
      seductive: `Surrender control with uncompromised comfort. Crafted from supple vegan nappa leather lined with plush microfiber velvet, these restraints hold securely without pinching or chafing tender wrists and ankles.`,
      luxe: `Command the room with effortless poise. Built with burnished hardware and double-stitched leather contours designed for immersive sensory deprivation and power exchange.`,
      playful: `A thrilling starter for couples looking to explore their wilder instincts. Quick-release swivel clips ensure safety while keeping the suspense delicious.`,
      sensory: `Padded with 6mm high-density foam wrapped in soft-touch leather. Features calibrated perimeter stitching and nickel-free heavy-duty metal hardware.`
    }
  },
  games: {
    titles: [
      'Boudoir Confessions Intimacy Deck',
      'After Dark: 52 Position Choreography',
      'Talk Flirt Dare Boudoir Card Vault'
    ],
    puns: [
      'Deep questions. Deeper physical dares.',
      'Break every bedroom inhibition with one draw of a card.',
      'A full year of seductive bedroom choreography.'
    ],
    badges: ['COUPLES VAULT', 'INTIMACY DECK', '52 CARDS', 'DATE NIGHT'],
    specs: [
      { label: 'Cards', value: '52 Premium Linen-Finish Gold Foil Cards' },
      { label: 'Levels', value: '3 Seductive Tiers: Talk, Flirt & Surrender' },
      { label: 'Storage', value: 'Discreet Hardcover Keepsake Magnetic Box' }
    ],
    descriptions: {
      seductive: `Melt away everyday tension and spark unforgettable intimacy. Featuring provocative questions, tantalizing foreplay challenges, and uninhibited physical dares designed to bring couples closer than ever.`,
      luxe: `Printed on weighted linen-finish cardstock with gold foil edges and packaged in an obsidian magnetic keepsake box. Perfect for romantic getaways and private anniversaries.`,
      playful: `Take turns drawing cards and watching inhibitions dissolve. No rules you can't bend, no awkwardness—just pure erotic connection.`,
      sensory: `Designed with progressive psychological and tactile milestones that gradually heighten anticipation from casual banter to full surrender.`
    }
  }
};

async function autoGenerateProductDescription() {
  const categorySelect = document.getElementById('prod-category');
  const titleInput = document.getElementById('prod-title');
  const descInput = document.getElementById('prod-desc');
  const taglineInput = document.getElementById('prod-tagline');
  const badgeInput = document.getElementById('prod-badge');
  const materialInput = document.getElementById('prod-material');
  const acousticsInput = document.getElementById('prod-acoustics');
  const moodSelect = document.getElementById('ai-mood-select');

  const category = categorySelect ? categorySelect.value : 'lingerie';
  const mood = moodSelect ? moodSelect.value : 'seductive';
  let currentTitle = titleInput ? titleInput.value.trim() : '';

  if (btnAutoGenerateAi) {
    btnAutoGenerateAi.disabled = true;
    btnAutoGenerateAi.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/></svg>
      Synthesizing Boudoir Copy...
    `;
  }
  if (aiStatusText) {
    aiStatusText.style.display = 'block';
    aiStatusText.textContent = 'Analyzing image colors, category, and tone...';
  }

  // Check if user has configured Google Gemini API Key in Settings
  const geminiApiKey = localStorage.getItem('thetoysvirago_gemini_key') || '';
  const currentImgSrc = (previewImg && previewImg.src) || (prodImgUrlInput ? prodImgUrlInput.value : '');

  let generatedResult = null;

  if (geminiApiKey && currentImgSrc.startsWith('data:image')) {
    try {
      if (aiStatusText) aiStatusText.textContent = 'Calling Gemini 1.5 Flash Vision AI...';
      generatedResult = await callGeminiVisionAI(geminiApiKey, currentImgSrc, category, mood, currentTitle);
    } catch (err) {
      console.warn('Gemini Vision AI error, falling back to Haute Boudoir Engine:', err);
    }
  }

  // Fallback to Built-in Haute Boudoir Engine
  if (!generatedResult) {
    await new Promise(r => setTimeout(r, 450)); // smooth natural cadence
    const catData = BOUDOIR_LEXICON[category] || BOUDOIR_LEXICON.lingerie;

    if (!currentTitle) {
      const titles = catData.titles;
      currentTitle = titles[Math.floor(Math.random() * titles.length)];
    }

    const puns = catData.puns;
    const badges = catData.badges;
    const descText = catData.descriptions[mood] || catData.descriptions.seductive;
    const pun = puns[Math.floor(Math.random() * puns.length)];
    const badge = badges[Math.floor(Math.random() * badges.length)];
    const specs = catData.specs;

    generatedResult = {
      title: currentTitle,
      tagline: pun,
      badge: badge,
      desc: descText,
      material: specs[0] ? specs[0].value : 'Medical-Grade Body-Safe Materials',
      acoustics: specs[1] ? specs[1].value : 'Whisper-Soft on Bare Skin'
    };
  }

  // Apply to form inputs with typing highlight
  if (titleInput && !titleInput.value.trim()) titleInput.value = generatedResult.title;
  if (taglineInput) taglineInput.value = generatedResult.tagline;
  if (badgeInput && !badgeInput.value.trim()) badgeInput.value = generatedResult.badge;
  if (descInput) descInput.value = generatedResult.desc;
  if (materialInput && !materialInput.value.trim()) materialInput.value = generatedResult.material;
  if (acousticsInput && !acousticsInput.value.trim()) acousticsInput.value = generatedResult.acoustics;

  // Auto-generate suggested color variant if sampled
  if (sampledColorPalette.length > 0 && currentVariants.length === 0) {
    sampledColorPalette.slice(0, 2).forEach(hex => {
      addColorVariant(getColorNameFromHex(hex), hex);
    });
  }

  updateWordCount();

  if (btnAutoGenerateAi) {
    btnAutoGenerateAi.disabled = false;
    btnAutoGenerateAi.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      Regenerate Copy
    `;
  }
  if (aiStatusText) {
    aiStatusText.textContent = `Description generated in ${mood} tone. Ready to publish.`;
  }
  showToast('AI Description applied to product form!');
}

async function callGeminiVisionAI(apiKey, base64Url, category, mood, currentTitle) {
  const parts = base64Url.split(',');
  const mimeType = parts[0].match(/:(.*?);/)[1] || 'image/jpeg';
  const data = parts[1];

  const prompt = `You are the master luxury boudoir copywriter for TheToysVirago (Rouge Noir), Nigeria's most discreet and sensual pleasure boutique.
Look at this product image. Category: ${category}. Desired Mood: ${mood}. User product title: ${currentTitle || 'None yet'}.
Return ONLY valid JSON matching this schema:
{
  "title": "Evocative 3-5 word product title",
  "tagline": "Provocative 1-line hook or pun (under 12 words)",
  "badge": "2-3 word uppercase luxury badge (e.g. LUXE LINGERIE, AIR-PULSE, SILK SATIN)",
  "desc": "Evocative, seductive, 2-paragraph description describing materials, sensations, and boudoir appeal. Avoid robotic words.",
  "material": "Sensual material spec",
  "acoustics": "Sensation/sound spec"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data } }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

if (btnAutoGenerateAi) {
  btnAutoGenerateAi.addEventListener('click', autoGenerateProductDescription);
}

// Word count watcher
const descInput = document.getElementById('prod-desc');
const charCountSpan = document.getElementById('char-count');
function updateWordCount() {
  if (!descInput || !charCountSpan) return;
  const words = descInput.value.trim() ? descInput.value.trim().split(/\s+/).length : 0;
  charCountSpan.textContent = `${words} words`;
}
if (descInput) descInput.addEventListener('input', updateWordCount);

// ================= 5. VARIANTS & SIZES MANAGEMENT =================
const btnAddVariant = document.getElementById('btn-add-variant');
const variantNameInput = document.getElementById('new-variant-name');
const variantColorInput = document.getElementById('new-variant-color');
const variantsList = document.getElementById('variants-list');

function renderVariants() {
  if (!variantsList) return;
  variantsList.innerHTML = '';
  currentVariants.forEach((v, idx) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `
      <span style="width: 10px; height: 10px; border-radius: 50%; background: ${v.color || '#e11d48'}; display: inline-block;"></span>
      ${v.name}
      <span class="tag-chip-del" data-idx="${idx}">&times;</span>
    `;
    chip.querySelector('.tag-chip-del').addEventListener('click', () => {
      currentVariants.splice(idx, 1);
      renderVariants();
    });
    variantsList.appendChild(chip);
  });
}

function addColorVariant(name, color) {
  if (!name) return;
  const singleWord = name.trim().split(/\s+/)[0];
  if (!singleWord) return;
  const capitalized = singleWord.charAt(0).toUpperCase() + singleWord.slice(1).toLowerCase();
  if (!currentVariants.some(v => v.name.toLowerCase() === capitalized.toLowerCase())) {
    currentVariants.push({ name: capitalized, color });
    renderVariants();
  }
}

if (btnAddVariant && variantNameInput) {
  btnAddVariant.addEventListener('click', () => {
    const name = variantNameInput.value.trim();
    const color = variantColorInput ? variantColorInput.value : '#e11d48';
    if (name) {
      addColorVariant(name, color);
      variantNameInput.value = '';
    }
  });
}

// Sizes
const btnAddSize = document.getElementById('btn-add-size');
const sizeNameInput = document.getElementById('new-size-name');
const sizesList = document.getElementById('sizes-list');

function renderSizes() {
  if (!sizesList) return;
  sizesList.innerHTML = '';
  currentSizes.forEach((s, idx) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `
      ${s}
      <span class="tag-chip-del" data-idx="${idx}">&times;</span>
    `;
    chip.querySelector('.tag-chip-del').addEventListener('click', () => {
      currentSizes.splice(idx, 1);
      renderSizes();
    });
    sizesList.appendChild(chip);
  });
}

if (btnAddSize && sizeNameInput) {
  btnAddSize.addEventListener('click', () => {
    const s = sizeNameInput.value.trim();
    if (s && !currentSizes.includes(s)) {
      currentSizes.push(s);
      renderSizes();
      sizeNameInput.value = '';
    }
  });
}
renderSizes();

// ================= 6. FORM SUBMISSION & SAVE PRODUCT =================
const productForm = document.getElementById('product-upload-form');
const btnResetForm = document.getElementById('btn-reset-form');
const btnSaveAndView = document.getElementById('btn-save-and-view');

function resetForm() {
  if (productForm) productForm.reset();
  const editingId = document.getElementById('editing-product-id');
  if (editingId) editingId.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
  if (paletteWrap) paletteWrap.style.display = 'none';
  currentMediaList = [];
  renderMediaGallery();
  currentVariants = [];
  currentSizes = ['S', 'M', 'L'];
  sampledColorPalette = [];
  renderVariants();
  renderSizes();
  updateWordCount();
  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) saveBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    Save Product to Catalog
  `;
  const editBanner = document.getElementById('editing-indicator-banner');
  if (editBanner) editBanner.style.display = 'none';
}

if (btnResetForm) {
  btnResetForm.addEventListener('click', resetForm);
}

if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveProduct(false);
  });
}

if (btnSaveAndView) {
  btnSaveAndView.addEventListener('click', async () => {
    await handleSaveProduct(true);
  });
}

async function handleSaveProduct(shouldRedirectToShop = false) {
  const editingIdInput = document.getElementById('editing-product-id');
  const titleInput = document.getElementById('prod-title');
  const catInput = document.getElementById('prod-category');
  const priceInput = document.getElementById('prod-price');
  const origPriceInput = document.getElementById('prod-original-price');
  const badgeInput = document.getElementById('prod-badge');
  const taglineInput = document.getElementById('prod-tagline');
  const descInput = document.getElementById('prod-desc');
  const materialInput = document.getElementById('prod-material');
  const acousticsInput = document.getElementById('prod-acoustics');
  const inStockInput = document.getElementById('prod-in-stock');

  const title = (titleInput ? titleInput.value : '').trim();
  const category = (catInput ? catInput.value : 'lingerie').trim();
  const price = parseFloat(priceInput ? priceInput.value : 0) || 0;
  const originalPrice = origPriceInput && origPriceInput.value ? parseFloat(origPriceInput.value) : null;
  const badge = (badgeInput ? badgeInput.value : '').trim() || (category === 'lingerie' ? 'LUXE LINGERIE' : 'NEW ARRIVAL');
  const tagline = (taglineInput ? taglineInput.value : '').trim();
  const desc = (descInput ? descInput.value : '').trim();
  const material = (materialInput ? materialInput.value : '').trim() || 'Medical-Grade Body-Safe Materials';
  const acoustics = (acousticsInput ? acousticsInput.value : '').trim() || 'Whisper-Soft on Bare Skin';
  const inStock = inStockInput ? inStockInput.checked : true;

  // Media & Image resolution
  const primaryMedia = currentMediaList[0];
  let imgSrc = (primaryMedia && primaryMedia.src) || (previewImg && previewImg.src && previewImg.src !== window.location.href ? previewImg.src : '');
  if (!imgSrc && prodImgUrlInput) imgSrc = prodImgUrlInput.value.trim();
  if (!imgSrc) {
    imgSrc = category === 'lingerie' ? '/assets/category-lingerie.webp' : '/assets/product-rose.webp';
  }

  const finalMedia = currentMediaList.length > 0
    ? [...currentMediaList]
    : [{ type: 'image', src: imgSrc, label: title }];

  if (!title || price <= 0 || !desc) {
    showToast('Please provide a product title, price, and description.');
    return;
  }

  const submitBtn = document.getElementById('btn-save-product');
  const viewBtn = document.getElementById('btn-save-and-view');
  if (submitBtn) submitBtn.disabled = true;
  if (viewBtn) viewBtn.disabled = true;

  try {
    // Generate unique slug id if new
    let id = editingIdInput ? editingIdInput.value.trim() : '';
    if (!id) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      id = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const sku = `${category.toUpperCase()} · ${String(currentCustomProducts.length + 1).padStart(2, '0')}`;

    const productData = {
      id,
      title,
      category,
      sku,
      badge,
      tagline,
      price,
      priceStr: `₦${price.toLocaleString()}`,
      originalPrice,
      img: imgSrc,
      desc,
      specs: [
        { label: 'Material', value: material },
        { label: 'Sensation', value: acoustics },
        { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
      ],
      variants: currentVariants.length > 0 ? currentVariants.map(v => ({
        name: v.name,
        price: price,
        priceStr: `₦${price.toLocaleString()}`,
        img: imgSrc,
        color: v.color
      })) : [],
      sizes: [...currentSizes],
      media: finalMedia,
      material,
      acoustics,
      inStock
    };

    // Upsert into local storage list
    const existingIdx = currentCustomProducts.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      currentCustomProducts[existingIdx] = productData;
    } else {
      currentCustomProducts.unshift(productData);
    }

    saveCustomProducts(currentCustomProducts);

    // Immediate live Supabase upload
    let liveUploaded = false;
    if (isSupabaseConfigured) {
      showToast('Uploading directly to Supabase cloud...');
      try {
        const res = await upsertSupabaseProduct(productData);
        if (res.success) {
          liveUploaded = true;
          showToast(`✓ "${title}" is now LIVE! <a href="/products.html?filter=${category}" target="_blank" rel="noopener">View on Shop &rarr;</a>`, true);
        } else {
          console.warn('[Supabase] Sync notice:', res.error);
          if (res.isRlsError || (res.error && (res.error.includes('row-level security') || res.error.includes('42501')))) {
            openSupabaseFixModal(res.error);
          } else {
            showToast(`Saved locally. Supabase: ${res.error || 'Check connection'}`);
          }
        }
      } catch (err) {
        console.error('[Supabase] Unexpected upload error:', err);
        showToast(`Saved locally. Supabase upload error.`);
      }
    } else {
      showToast(`Saved "${title}" to Catalog. <a href="/products.html?filter=${category}" target="_blank" rel="noopener">View on Shop &rarr;</a>`, true);
    }

    // Refresh UI tables and stats with live cloud products
    await refreshCatalogData();

    resetForm();
    switchTab('inventory-panel');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ================= 7. INVENTORY TABLE & MANAGEMENT =================
const inventoryTableBody = document.getElementById('inventory-table-body');
const inventorySearchInput = document.getElementById('inventory-search');
const inventoryCategoryPills = document.querySelectorAll('.admin-filter-pill');
const inventoryCategorySelect = document.getElementById('inventory-category-select');

let activeInventoryFilter = 'all';

function renderInventoryTable() {
  if (!inventoryTableBody) return;
  const searchVal = (inventorySearchInput ? inventorySearchInput.value : '').trim().toLowerCase();

  const filtered = allInventoryProducts.filter(p => {
    const matchesCat = activeInventoryFilter === 'all' || p.category === activeInventoryFilter;
    const matchesSearch = !searchVal ||
      p.title.toLowerCase().includes(searchVal) ||
      (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
      (p.category && p.category.toLowerCase().includes(searchVal));
    return matchesCat && matchesSearch;
  });

  inventoryTableBody.innerHTML = '';

  if (filtered.length === 0) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px; color: #64748b;">
          No products found matching "${searchVal}". Click "+ Add New Product" to create one.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(prod => {
    const tr = document.createElement('tr');
    const isCustom = currentCustomProducts.some(p => p.id === prod.id);

    tr.innerHTML = `
      <td>
        <img src="${prod.img || '/assets/logo.jpg'}" alt="${prod.title}" class="admin-prod-thumb" onerror="this.src='/assets/logo.jpg'" />
      </td>
      <td>
        <div class="admin-prod-info">
          <span class="admin-prod-name" title="${prod.title}">${prod.title}</span>
          <span class="admin-prod-sku desktop-only-sku">${prod.sku || prod.id} ${isCustom ? '• <strong style="color: #e11d48;">CUSTOM</strong>' : ''}</span>
        </div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span class="admin-cat-badge cat-${prod.category || 'toys'}">${prod.category || 'toys'}</span>
          <span class="admin-prod-sku mobile-only-sku">${prod.sku || prod.id} ${isCustom ? '• <strong style="color: #e11d48;">CUSTOM</strong>' : ''}</span>
        </div>
      </td>
      <td style="font-weight: 700; color: #0f172a;" class="admin-prod-price-cell">
        ${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}
      </td>
      <td>
        <label class="switch">
          <input type="checkbox" class="stock-toggle" data-id="${prod.id}" ${prod.inStock !== false ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <a href="/products.html?filter=${prod.category}" target="_blank" rel="noopener" class="admin-btn admin-btn-outline" style="padding: 6px 10px; font-size: 12px; text-decoration: none;" title="View on Live Shop">↗ Shop</a>
        <button class="admin-btn admin-btn-outline btn-edit-prod" data-id="${prod.id}" style="padding: 6px 12px; font-size: 12px;">Edit</button>
        ${isCustom ? `<button class="admin-btn admin-btn-outline btn-del-prod" data-id="${prod.id}" style="padding: 6px 10px; font-size: 12px; color: #f43f5e;" title="Delete product">&times;</button>` : ''}
      </td>
    `;

    // Wire Stock toggle
    const toggle = tr.querySelector('.stock-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        toggleProductStock(prod.id, toggle.checked);
      });
    }

    // Wire Edit button
    const editBtn = tr.querySelector('.btn-edit-prod');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        loadProductIntoForm(prod);
      });
    }

    // Wire Delete button
    const delBtn = tr.querySelector('.btn-del-prod');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        deleteCustomProductItem(prod.id);
      });
    }

    inventoryTableBody.appendChild(tr);
  });
}

function toggleProductStock(id, inStock) {
  const prod = allInventoryProducts.find(p => p.id === id);
  if (prod) {
    prod.inStock = inStock;
  }
  const customProd = currentCustomProducts.find(p => p.id === id);
  if (customProd) {
    customProd.inStock = inStock;
    saveCustomProducts(currentCustomProducts);
  }
  showToast(`Stock status updated for ${prod ? prod.title : id}.`);
  updateStats();
}

function loadProductIntoForm(prod) {
  const editingIdInput = document.getElementById('editing-product-id');
  const titleInput = document.getElementById('prod-title');
  const catInput = document.getElementById('prod-category');
  const priceInput = document.getElementById('prod-price');
  const origPriceInput = document.getElementById('prod-original-price');
  const badgeInput = document.getElementById('prod-badge');
  const taglineInput = document.getElementById('prod-tagline');
  const descInput = document.getElementById('prod-desc');
  const materialInput = document.getElementById('prod-material');
  const acousticsInput = document.getElementById('prod-acoustics');
  const inStockInput = document.getElementById('prod-in-stock');

  if (editingIdInput) editingIdInput.value = prod.id;
  if (titleInput) titleInput.value = prod.title || '';
  if (catInput) catInput.value = prod.category || 'lingerie';
  if (priceInput) priceInput.value = prod.price || 0;
  if (origPriceInput) origPriceInput.value = prod.originalPrice || '';
  if (badgeInput) badgeInput.value = prod.badge || '';
  if (taglineInput) taglineInput.value = prod.tagline || '';
  if (descInput) descInput.value = prod.desc || '';
  if (materialInput) materialInput.value = prod.material || '';
  if (acousticsInput) acousticsInput.value = prod.acoustics || '';
  if (inStockInput) inStockInput.checked = prod.inStock !== false;

  if (Array.isArray(prod.media) && prod.media.length > 0) {
    currentMediaList = [...prod.media];
  } else if (prod.img) {
    currentMediaList = [{ type: 'image', src: prod.img, label: prod.title || 'Product Image' }];
  } else {
    currentMediaList = [];
  }
  renderMediaGallery();

  if (currentMediaList.length > 0) {
    displayPreviewImage(currentMediaList[0].src);
    if (prodImgUrlInput) prodImgUrlInput.value = '';
  } else if (prod.img) {
    displayPreviewImage(prod.img);
    if (prodImgUrlInput) prodImgUrlInput.value = prod.img;
  }

  currentVariants = Array.isArray(prod.variants) ? [...prod.variants] : [];
  currentSizes = Array.isArray(prod.sizes) ? [...prod.sizes] : ['S', 'M', 'L'];
  renderVariants();
  renderSizes();
  updateWordCount();

  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) {
    saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Update Product in Catalog
    `;
  }

  // Show editing banner
  const editBanner = document.getElementById('editing-indicator-banner');
  const editLabel = document.getElementById('editing-product-label');
  if (editBanner && editLabel) {
    editLabel.textContent = `Editing: ${prod.title}`;
    editBanner.style.display = 'flex';
  }

  switchTab('upload-panel');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast(`Editing "${prod.title}". Make changes and click Update.`);
}

async function deleteCustomProductItem(id) {
  if (!confirm(`Are you sure you want to remove this product from your store?`)) return;

  currentCustomProducts = currentCustomProducts.filter(p => p.id !== id);
  saveCustomProducts(currentCustomProducts);

  if (isSupabaseConfigured) {
    try {
      await deleteSupabaseProduct(id);
    } catch (e) {
      console.warn('[Admin] Delete remote error:', e);
    }
  }

  await refreshCatalogData();
  showToast('Product removed from catalog.');
}

if (inventorySearchInput) {
  inventorySearchInput.addEventListener('input', renderInventoryTable);
}

if (inventoryCategorySelect) {
  inventoryCategorySelect.addEventListener('change', (e) => {
    activeInventoryFilter = e.target.value || 'all';
    inventoryCategoryPills.forEach(p => {
      if (p.dataset.cat === activeInventoryFilter) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    renderInventoryTable();
  });
}

inventoryCategoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    inventoryCategoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeInventoryFilter = pill.dataset.cat || 'all';
    if (inventoryCategorySelect) {
      inventoryCategorySelect.value = activeInventoryFilter;
    }
    renderInventoryTable();
  });
});

// ================= 8. CATALOG AGGREGATION & METRICS =================
async function refreshCatalogData() {
  currentCustomProducts = getCustomProducts();

  const mergedMap = new Map();
  // Add local custom products first
  currentCustomProducts.forEach(p => mergedMap.set(p.id, p));

  // Sync with Supabase cloud if connected
  if (isSupabaseConfigured) {
    try {
      const remote = await getSupabaseProducts();
      if (remote && Array.isArray(remote)) {
        remote.forEach(rp => {
          if (!mergedMap.has(rp.id)) {
            const mapped = {
              id: rp.id,
              title: rp.title,
              category: rp.category || 'toys',
              sku: rp.category ? `${rp.category.toUpperCase()} · ${rp.id.slice(0, 4)}` : 'VAULT · 01',
              badge: rp.badge || '',
              tagline: rp.tagline || '',
              price: Number(rp.price) || 0,
              priceStr: `₦${Number(rp.price).toLocaleString()}`,
              img: rp.image || '/assets/category-lingerie.webp',
              desc: rp.description || '',
              inStock: rp.in_stock !== false,
              variants: Array.isArray(rp.variants) ? rp.variants : [],
              sizes: Array.isArray(rp.sizes) ? rp.sizes : [],
              media: Array.isArray(rp.media) ? rp.media : []
            };
            mergedMap.set(rp.id, mapped);
          }
        });
      }
    } catch (e) {
      console.warn('[Admin] Cloud sync check:', e);
    }
  }

  // Load from static products list if present
  try {
    const res = await fetch('/new-products-data.json');
    if (res.ok) {
      const baseProds = await res.json();
      baseProds.forEach(bp => {
        if (!mergedMap.has(bp.id)) {
          mergedMap.set(bp.id, {
            id: bp.id,
            title: bp.title,
            category: bp.category || 'toys',
            sku: bp.sku || `TOYS · ${bp.id.slice(0, 4)}`,
            badge: bp.badge || '',
            tagline: bp.pun || bp.tagline || '',
            price: Number(bp.price) || 0,
            priceStr: bp.priceStr || `₦${Number(bp.price).toLocaleString()}`,
            img: bp.img || '/assets/product-rose.webp',
            desc: bp.desc || '',
            inStock: true
          });
        }
      });
    }
  } catch (err) {
    console.warn('[Admin] Could not load base catalog JSON:', err);
  }

  allInventoryProducts = Array.from(mergedMap.values());
  updateStats();
  renderInventoryTable();
  renderExportCode();
}

function updateStats() {
  const statTotal = document.getElementById('stat-total-products');
  const statCustom = document.getElementById('stat-custom-count');
  const tabCount = document.getElementById('tab-inventory-count');
  const invBadge = document.getElementById('inventory-count-badge');
  const exportCustomCount = document.getElementById('export-custom-count');

  const total = allInventoryProducts.length;
  const customCount = currentCustomProducts.length;

  if (statTotal) statTotal.textContent = total;
  if (statCustom) statCustom.textContent = customCount;
  if (tabCount) tabCount.textContent = total;
  if (invBadge) invBadge.textContent = total;
  if (exportCustomCount) exportCustomCount.textContent = customCount;
}

// ================= 9. EXPORT & SUPABASE DIRECT SYNC =================
const btnSyncSupabaseNow = document.getElementById('btn-sync-supabase-now');
const supabaseSyncLog = document.getElementById('supabase-sync-log');
const exportCodeBox = document.getElementById('export-code-box');
const btnCopySql = document.getElementById('btn-copy-sql');
const btnDownloadJson = document.getElementById('btn-download-json');

function renderExportCode() {
  if (!exportCodeBox) return;

  let sql = `-- TheToysVirago SQL Insert for ${currentCustomProducts.length} Custom Products\n`;
  sql += `INSERT INTO public.products (id, title, category, tagline, price, badge, image, description, specs, variants, in_stock)\nVALUES\n`;

  const values = currentCustomProducts.map(p => {
    const id = `'${p.id.replace(/'/g, "''")}'`;
    const title = `'${p.title.replace(/'/g, "''")}'`;
    const cat = `'${(p.category || 'toys').replace(/'/g, "''")}'`;
    const tag = `'${(p.tagline || '').replace(/'/g, "''")}'`;
    const price = Number(p.price) || 0;
    const badge = `'${(p.badge || '').replace(/'/g, "''")}'`;
    const img = `'${(p.img || '').replace(/'/g, "''")}'`;
    const desc = `'${(p.desc || '').replace(/'/g, "''")}'`;
    const specsArr = (p.specs || []).map(s => `'${(s.label + ': ' + s.value).replace(/'/g, "''")}'`).join(', ');
    const specs = `ARRAY[${specsArr}]::text[]`;
    const variants = `'${JSON.stringify(p.variants || []).replace(/'/g, "''")}'::jsonb`;
    const inStock = p.inStock !== false ? 'true' : 'false';

    return `  (${id}, ${title}, ${cat}, ${tag}, ${price}, ${badge}, ${img}, ${desc}, ${specs}, ${variants}, ${inStock})`;
  }).join(',\n');

  sql += values + `\nON CONFLICT (id) DO UPDATE SET\n  title = EXCLUDED.title,\n  price = EXCLUDED.price,\n  image = EXCLUDED.image,\n  description = EXCLUDED.description,\n  updated_at = now();`;

  exportCodeBox.value = sql;
}

if (btnCopySql) {
  btnCopySql.addEventListener('click', async () => {
    renderExportCode();
    if (exportCodeBox) {
      await navigator.clipboard.writeText(exportCodeBox.value);
      showToast('SQL script copied to clipboard!');
    }
  });
}

if (btnDownloadJson) {
  btnDownloadJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCustomProducts, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `thetoysvirago-catalog-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Catalog JSON downloaded.');
  });
}

if (btnSyncSupabaseNow) {
  btnSyncSupabaseNow.addEventListener('click', async () => {
    if (!isSupabaseConfigured) {
      if (supabaseSyncLog) {
        supabaseSyncLog.innerHTML = `<span style="color: #fb7185;">⚠ Supabase is not connected in .env yet. Products are safely stored in browser storage.</span>`;
      }
      showToast('Supabase not connected. Saved locally.');
      return;
    }

    if (supabaseSyncLog) supabaseSyncLog.textContent = 'Syncing custom products to Supabase cloud...';
    let successCount = 0;
    let failCount = 0;

    for (const prod of currentCustomProducts) {
      const res = await upsertSupabaseProduct(prod);
      if (res.success) successCount++;
      else failCount++;
    }

    if (supabaseSyncLog) {
      supabaseSyncLog.innerHTML = `<span style="color: #22c55e;">✓ Synced ${successCount} products to Supabase successfully. (${failCount} errors)</span>`;
    }
    showToast(`Synced ${successCount} products to Supabase!`);
  });
}

// ================= 10. SETTINGS MODAL & API KEY =================
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnCancelSettings = document.getElementById('btn-cancel-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingsModal = document.getElementById('settings-modal');
const geminiKeyInput = document.getElementById('gemini-api-key');
const supabaseServiceKeyInput = document.getElementById('supabase-service-key');

function openSettings() {
  if (geminiKeyInput) geminiKeyInput.value = localStorage.getItem('thetoysvirago_gemini_key') || '';
  if (supabaseServiceKeyInput) supabaseServiceKeyInput.value = localStorage.getItem('thetoysvirago_supabase_service_key') || '';
  const resendKeyInput = document.getElementById('resend-api-key');
  if (resendKeyInput) resendKeyInput.value = localStorage.getItem('ttv_resend_api_key') || '';
  if (settingsModal) settingsModal.style.display = 'flex';
}

function closeSettings() {
  if (settingsModal) settingsModal.style.display = 'none';
}

if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeSettings);

if (btnSaveSettings) {
  btnSaveSettings.addEventListener('click', () => {
    const key = geminiKeyInput ? geminiKeyInput.value.trim() : '';
    const serviceKey = supabaseServiceKeyInput ? supabaseServiceKeyInput.value.trim() : '';

    if (key) {
      localStorage.setItem('thetoysvirago_gemini_key', key);
    } else {
      localStorage.removeItem('thetoysvirago_gemini_key');
    }

    if (serviceKey) {
      localStorage.setItem('thetoysvirago_supabase_service_key', serviceKey);
    } else {
      localStorage.removeItem('thetoysvirago_supabase_service_key');
    }

const resendKeyInput = document.getElementById('resend-api-key');
    if (resendKeyInput) {
      const rKey = resendKeyInput.value.trim();
      if (rKey) localStorage.setItem('ttv_resend_api_key', rKey);
      else localStorage.removeItem('ttv_resend_api_key');
    }

    closeSettings();
    showToast('Settings & cloud keys saved.');
  });
}

// ================= 11. TABS SWITCHER =================
const tabBtns = document.querySelectorAll('.admin-tab-btn');
const panels = document.querySelectorAll('.admin-panel');
const btnSwitchToUpload = document.getElementById('btn-switch-to-upload');


  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetForm();
      switchTab('inventory-panel');
    });
  }

function switchTab(tabId) {
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  panels.forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

if (btnSwitchToUpload) {
  btnSwitchToUpload.addEventListener('click', () => {
    resetForm();
    switchTab('upload-panel');
  });
}

// ================= 12. TOAST HELPER =================
let toastTimeout = null;
function showToast(message, isHtml = false) {
  const toast = document.getElementById('admin-toast');
  const text = document.getElementById('toast-text');
  if (!toast || !text) return;

  if (isHtml) {
    text.innerHTML = message;
  } else {
    text.textContent = message;
  }
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, isHtml ? 6500 : 3400);
}

function initAdmin() {
  refreshCatalogData();

  const syncStatusText = document.getElementById('sync-status-text');
  if (syncStatusText) {
    if (isSupabaseConfigured) {
      syncStatusText.textContent = 'Supabase Cloud Connected';
    } else {
      syncStatusText.textContent = 'Local Browser Vault Mode';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}


// ================= 12. ORDERS MANAGEMENT CONTROLLER =================
let allOrders = [];
let currentOrderFilter = 'all';
let currentOrderSearch = '';

const ordersCardsContainer = document.getElementById('orders-cards-container');
const ordersLoadingState = document.getElementById('orders-loading-state');
const ordersEmptyState = document.getElementById('orders-empty-state');
const ordersSearchInput = document.getElementById('orders-search-input');
const btnRefreshOrders = document.getElementById('btn-refresh-orders');
const tabOrdersBadge = document.getElementById('tab-orders-badge');
const statOrdersAwaiting = document.getElementById('stat-orders-awaiting');
const statCardAwaiting = document.getElementById('stat-card-awaiting');

async function loadAndRenderOrders() {
  if (ordersLoadingState) ordersLoadingState.style.display = 'block';
  if (ordersEmptyState) ordersEmptyState.style.display = 'none';
  if (ordersCardsContainer) ordersCardsContainer.innerHTML = '';

  const res = await getSupabaseOrders();
  allOrders = res.data || [];

  updateOrdersStats();
  renderOrdersList();
}

function updateOrdersStats() {
  const awaitingCount = allOrders.filter(o => o.status === 'awaiting_confirmation' || o.status === 'pending_transfer').length;
  if (tabOrdersBadge) tabOrdersBadge.textContent = awaitingCount > 0 ? awaitingCount : allOrders.length;
  if (statOrdersAwaiting) statOrdersAwaiting.textContent = awaitingCount;
}

function renderOrdersList() {
  if (ordersLoadingState) ordersLoadingState.style.display = 'none';
  if (!ordersCardsContainer) return;

  const query = (currentOrderSearch || '').toLowerCase().trim();
  const filtered = allOrders.filter(o => {
    // Filter by tab
    if (currentOrderFilter === 'awaiting_confirmation') {
      if (o.status !== 'awaiting_confirmation' && o.status !== 'pending_transfer') return false;
    } else if (currentOrderFilter === 'confirmed') {
      if (o.status !== 'confirmed') return false;
    }

    // Filter by query
    if (query) {
      const ref = (o.reference || '').toLowerCase();
      const name = (o.customer_name || '').toLowerCase();
      const phone = (o.phone || '').toLowerCase();
      const addr = (o.address || '').toLowerCase();
      if (!ref.includes(query) && !name.includes(query) && !phone.includes(query) && !addr.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    if (ordersEmptyState) ordersEmptyState.style.display = 'block';
    ordersCardsContainer.innerHTML = '';
    return;
  }

  if (ordersEmptyState) ordersEmptyState.style.display = 'none';

  ordersCardsContainer.innerHTML = filtered.map(order => {
    const isConfirmed = order.status === 'confirmed';
    const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsListHtml = items.map(item => `
      <div class="admin-order-item-row">
        <span><strong>${item.qty || 1}x</strong> ${item.title || 'Product'} ${item.finish ? '<span style="color:#64748b; font-size: 11px;">(' + item.finish + ')</span>' : ''}</span>
        <span style="font-weight: 700; color: #0f172a;">₦${Number(item.price || 0).toLocaleString()}</span>
      </div>
    `).join('') || `<div>${order.items || 'Standard Order Items'}</div>`;

    return `
      <div class="admin-order-card" id="order-card-${order.reference}">
        <!-- Card Header (Order # & Customer Name on left, Badge on right) -->
        <div class="admin-order-card-header">
          <div class="admin-order-ref-group">
            <div class="admin-order-ref-title">
              <span>#${order.reference}</span>
            </div>
            <div class="admin-order-cust-title">${order.customer_name || 'Customer'}</div>
            <div class="admin-order-meta">Placed on: <strong>${dateStr}</strong></div>
          </div>
          <div>
            ${isConfirmed
              ? `<span class="confirmed-badge-pill">✓ Confirmed</span>`
              : `<span class="awaiting-badge-pill">⏳ Awaiting Confirmation</span>`}
          </div>
        </div>

        <!-- Card Body (Contact info & Address) -->
        <div class="admin-order-card-body">
          <div class="admin-order-info-grid">
            <div class="admin-order-info-item">
              <span class="admin-order-info-icon">📞</span>
              <span><strong>Phone:</strong> <a href="tel:${order.phone}" style="color: inherit; text-decoration: underline;">${order.phone || 'No phone'}</a></span>
            </div>
            ${order.customer_email ? `
              <div class="admin-order-info-item">
                <span class="admin-order-info-icon">✉️</span>
                <span><strong>Email:</strong> ${order.customer_email}</span>
              </div>
            ` : ''}
            <div class="admin-order-info-item" style="grid-column: 1 / -1;">
              <span class="admin-order-info-icon">📍</span>
              <span><strong>Delivery:</strong> ${order.address || 'Address provided at checkout'}</span>
            </div>
          </div>

          <!-- Items Box -->
          <div class="admin-order-items-box">
            <div class="admin-order-items-head">
              <span>Items in Order (${items.length || 1})</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              ${itemsListHtml}
            </div>
          </div>
        </div>

        <!-- Card Footer (Total on left, Action Button on right) -->
        <div class="admin-order-card-footer">
          <div class="admin-order-total-block">
            <span class="admin-order-total-label">Total Amount</span>
            <span class="admin-order-amount">₦${Number(order.total_amount || 0).toLocaleString()}</span>
          </div>
          <div class="admin-order-actions-group">
            ${!isConfirmed ? `
              <button type="button" class="btn-tick-confirmed" data-ref="${order.reference}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Tick as Confirmed</span>
              </button>
            ` : `
              <button type="button" class="admin-btn admin-btn-outline btn-resend-email" data-ref="${order.reference}">
                ✉️ Re-send Receipt
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire tick as confirmed buttons
  ordersCardsContainer.querySelectorAll('.btn-tick-confirmed').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;

      btn.disabled = true;
      btn.innerHTML = `<span>Updating &amp; Sending Email...</span>`;

      // 1. Update in Supabase
      await updateSupabaseOrderStatus(ref, 'confirmed');

      // 2. Trigger Customer Confirmation Email
      const emailRes = await sendCustomerOrderConfirmationEmail(order);

      // 3. Update order in memory
      order.status = 'confirmed';
      order.confirmed_at = new Date().toISOString();

      updateOrdersStats();
      renderOrdersList();

      if (emailRes && emailRes.success) {
        showToast(`Order ${ref} confirmed! Receipt sent to ${order.customer_email || 'customer'} via Resend.`);
      } else if (emailRes && emailRes.error) {
        showToast(`Order ${ref} confirmed in database (Resend note: ${typeof emailRes.error === 'string' ? emailRes.error : 'check API key'})`);
      } else {
        showToast(`Order ${ref} marked as confirmed!`);
      }
    });
  });

  // Wire re-send email buttons
  ordersCardsContainer.querySelectorAll('.btn-resend-email').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;
      const emailRes = await sendCustomerOrderConfirmationEmail(order);
      if (emailRes && emailRes.mailtoUrl) {
        window.open(emailRes.mailtoUrl, '_blank');
      }
      showToast(`Confirmation email prepared for order ${ref}.`);
    });
  });
}

// Search and filter listeners
if (ordersSearchInput) {
  ordersSearchInput.addEventListener('input', (e) => {
    currentOrderSearch = e.target.value;
    renderOrdersList();
  });
}

document.querySelectorAll('.order-filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.order-filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentOrderFilter = pill.dataset.filter;
    renderOrdersList();
  });
});

if (btnRefreshOrders) {
  btnRefreshOrders.addEventListener('click', () => {
    loadAndRenderOrders();
    showToast('Orders refreshed from database.');
  });
}

if (statCardAwaiting) {
  statCardAwaiting.addEventListener('click', () => {
    switchTab('orders-panel');
    const awaitingPill = document.querySelector('.order-filter-pill[data-filter="awaiting_confirmation"]');
    if (awaitingPill) awaitingPill.click();
  });
}

// Hook into switchTab to load orders when clicking orders-panel
const originalSwitchTab = switchTab;
switchTab = function(tabId) {
  originalSwitchTab(tabId);
  if (tabId === 'orders-panel') {
    loadAndRenderOrders();
  }
};

// ================= LIVE ORDER PUSH NOTIFICATIONS & SOUND CHIME =================
const btnTogglePush = document.getElementById('btn-toggle-push');
const pushStatusDot = document.getElementById('push-status-dot');
const pushBtnLabel = document.getElementById('push-btn-label');
const pushInfoBanner = document.getElementById('push-info-banner');
const btnDismissPushBanner = document.getElementById('btn-dismiss-push-banner');
const btnTestAlert = document.getElementById('btn-test-alert');

function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Two-tone pleasant notification chime (659.25Hz E5 -> 880Hz A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

function triggerOrderNotification(order) {
  playOrderChime();
  const ref = order.reference || 'TTV-Order';
  const name = order.customer_name || 'Customer';
  const amountStr = `₦${Number(order.total_amount || 0).toLocaleString()}`;
  const title = `🛍️ New Order: ${ref}`;
  const body = `${name} placed an order for ${amountStr}. Tap to review and confirm.`;

  if ('Notification' in window && Notification.permission === 'granted') {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/assets/logo.webp',
          badge: '/assets/logo.webp',
          vibrate: [200, 100, 200],
          data: '/admin.html'
        });
      }).catch(() => {
        try { new Notification(title, { body, icon: '/assets/logo.webp' }); } catch (e) {}
      });
    } else {
      try { new Notification(title, { body, icon: '/assets/logo.webp' }); } catch (e) {}
    }
  }

  showToast(`🔔 New Order Received: ${ref} (${amountStr})`);
}

function updatePushUI() {
  if (!('Notification' in window)) {
    if (pushBtnLabel) pushBtnLabel.textContent = 'Alerts Unavailable';
    return;
  }
  if (Notification.permission === 'granted') {
    if (pushStatusDot) pushStatusDot.style.background = '#22c55e';
    if (pushBtnLabel) pushBtnLabel.textContent = '🔔 Push Alerts Active';
    if (pushInfoBanner && !localStorage.getItem('ttv_dismiss_push_banner')) {
      pushInfoBanner.style.display = 'flex';
    }
  } else if (Notification.permission === 'denied') {
    if (pushStatusDot) pushStatusDot.style.background = '#ef4444';
    if (pushBtnLabel) pushBtnLabel.textContent = '🔕 Alerts Blocked in Browser';
    if (pushInfoBanner) pushInfoBanner.style.display = 'none';
  } else {
    if (pushStatusDot) pushStatusDot.style.background = '#94a3b8';
    if (pushBtnLabel) pushBtnLabel.textContent = '🔔 Enable Push Alerts';
    if (pushInfoBanner) pushInfoBanner.style.display = 'none';
  }
}

if (btnTogglePush) {
  btnTogglePush.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support Web Push notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      playOrderChime();
      showToast('Push notifications are already active!');
      return;
    }
    const permission = await Notification.requestPermission();
    updatePushUI();
    if (permission === 'granted') {
      playOrderChime();
      showToast('Push notifications enabled successfully!');
      triggerOrderNotification({
        reference: 'TTV-ALERT',
        customer_name: 'Store Manager',
        total_amount: 25000
      });
    }
  });
}

if (btnTestAlert) {
  btnTestAlert.addEventListener('click', () => {
    triggerOrderNotification({
      reference: 'TTV-TEST',
      customer_name: 'Store Manager (Test)',
      total_amount: 35000
    });
  });
}

if (btnDismissPushBanner) {
  btnDismissPushBanner.addEventListener('click', () => {
    if (pushInfoBanner) pushInfoBanner.style.display = 'none';
    localStorage.setItem('ttv_dismiss_push_banner', 'true');
  });
}

updatePushUI();

// ================= STORE OWNER ORDER ALERTS: REALTIME + ACTIVE BACKGROUND POLLING =================
let globalAudioCtx = null;
function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// Unlock audio on any first interaction (touch or click)
document.addEventListener('click', () => { getAudioContext(); }, { once: true });
document.addEventListener('touchstart', () => { getAudioContext(); }, { once: true });

// Function to handle new incoming order
function handleIncomingNewOrder(order) {
  if (!order || !order.reference) return;
  const existingIdx = allOrders.findIndex(o => o.reference === order.reference);
  if (existingIdx >= 0) return; // Already in store list

  // Prepend new order to list
  allOrders.unshift(order);
  updateOrdersStats();
  renderOrdersList();
  triggerOrderNotification(order);
}

// 1. Subscribe to Supabase Realtime Orders (instant websocket when available)
try {
  subscribeToSupabaseOrders((newOrder) => {
    console.log('[Realtime] Incoming order from Supabase:', newOrder);
    handleIncomingNewOrder(newOrder);
  });
} catch (e) {
  console.warn('Realtime subscription init:', e);
}

// 2. Active Background Polling (Checks every 8 seconds)
// Guarantees immediate notification even if Supabase Realtime publication is pending
async function pollForNewOrders() {
  try {
    const res = await getSupabaseOrders();
    if (res && res.success && Array.isArray(res.data)) {
      res.data.forEach(fetched => {
        const exists = allOrders.some(o => o.reference === fetched.reference);
        if (!exists) {
          console.log('[Poll] Discovered newly placed order:', fetched.reference);
          handleIncomingNewOrder(fetched);
        }
      });
    }
  } catch (err) {
    console.warn('[Poll] Orders poll check:', err);
  }
}

// Start polling
setInterval(pollForNewOrders, 8000);

// 2. Cross-tab local broadcast listener (instant alert when checkout occurs on same browser/device)
window.addEventListener('storage', (event) => {
  if (event.key === 'ttv_last_order_broadcast' && event.newValue) {
    try {
      const data = JSON.parse(event.newValue);
      if (data && data.order) {
        handleIncomingNewOrder(data.order);
      }
    } catch (e) {}
  }
});

// Initial background load of orders count
setTimeout(() => {
  loadAndRenderOrders();
}, 600);


// ================= BULLETPROOF BACKGROUND SCROLL LOCK (PRESERVES SCROLL POSITION) =================
let savedScrollY = 0;
let isScrollLocked = false;

function updateBodyScrollLock() {
  const modalOverlays = document.querySelectorAll(
    '.modal-overlay, .drawer-overlay, .admin-gate-overlay, .supabase-modal-overlay'
  );
  let isAnyModalOpen = false;
  modalOverlays.forEach((el) => {
    if (
      !el.hasAttribute('hidden') &&
      el.style.display !== 'none' &&
      window.getComputedStyle(el).display !== 'none'
    ) {
      isAnyModalOpen = true;
    }
  });

  if (isAnyModalOpen) {
    if (!isScrollLocked) {
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      isScrollLocked = true;
      document.body.classList.add('modal-open');
    }
  } else {
    if (isScrollLocked) {
      isScrollLocked = false;
      document.body.classList.remove('modal-open');
      window.scrollTo(0, savedScrollY);
    }
  }
}

// Global helper functions
window.lockBodyScroll = function() {
  if (!isScrollLocked) {
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    isScrollLocked = true;
    document.body.classList.add('modal-open');
  }
};

window.unlockBodyScroll = function() {
  updateBodyScrollLock();
};

const scrollLockObserver = new MutationObserver(() => {
  updateBodyScrollLock();
});

function initScrollLockObservers() {
  const targets = document.querySelectorAll(
    '.modal-overlay, .drawer-overlay, .admin-gate-overlay, .supabase-modal-overlay'
  );
  targets.forEach((target) => {
    scrollLockObserver.observe(target, {
      attributes: true,
      attributeFilter: ['style', 'hidden', 'class']
    });

    // Prevent background touch scrolling when touching backdrop
    target.addEventListener('touchmove', (e) => {
      if (e.target === target) {
        e.preventDefault();
      }
    }, { passive: false });
  });

  updateBodyScrollLock();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initScrollLockObservers);
} else {
  initScrollLockObservers();
}
