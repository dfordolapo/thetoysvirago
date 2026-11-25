/**
 * TheToysVirago - Admin & Product Vault Controller
 * Manages manual product uploading, AI copywriting, image analysis, and Supabase sync.
 */

import {
  supabase,
  isSupabaseConfigured,
  getSupabaseProducts,
  getSupabaseProductById,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  getSupabaseOrders,
  updateSupabaseOrderStatus,
  sendCustomerOrderConfirmationEmail,
  sendCustomerOrderDispatchedEmail,
  sendCustomerOrderDeliveredEmail,
  subscribeToSupabaseOrders,
  getSupabaseArticles,
  upsertSupabaseArticle,
  deleteSupabaseArticle
} from './supabase.js';
import { BLOG_ARTICLES } from './data/articles.js';
import { buildProductCopyPrompt, GEMINI_VISION_MODELS, parseGeminiJson } from './aiPrompt.js';
import { resolveColorHex, isLightColor, formatColorName, isRecognizedColorName } from './modules/colorResolver.js';
import { generateLocalProductCopy } from './modules/localCopy.js';

let serverGeminiConfigured = false;

// ================= 1. AUTHENTICATION & SECURITY GATE =================
const ADMIN_PIN_KEY = 'thetoysvirago_admin_pin';
const ADMIN_AUTH_KEY = 'thetoysvirago_admin_unlocked';
const ADMIN_PASSKEY_KEY = 'thetoysvirago_admin_passkey_id';
const ADMIN_PASSKEY_CHALLENGE_KEY = 'thetoysvirago_admin_passkey_challenge';
const DEFAULT_PIN = 'virago2026';

function bufferToBase64url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function passkeyAvailable() {
  return Boolean(window.PublicKeyCredential && window.isSecureContext && navigator.credentials && navigator.credentials.create);
}

function getAdminPasskeyId() {
  return localStorage.getItem(ADMIN_PASSKEY_KEY);
}

function updatePasskeyUi() {
  const btn = document.getElementById('btn-admin-passkey');
  const label = document.getElementById('admin-passkey-label');
  const hint = document.getElementById('admin-passkey-hint');
  if (!btn) return;

  if (!passkeyAvailable()) {
    btn.style.display = 'none';
    if (hint) hint.textContent = 'Face ID needs HTTPS (or localhost) and a supported browser.';
    return;
  }

  const enrolled = Boolean(getAdminPasskeyId());
  if (label) label.textContent = enrolled ? 'Unlock with Face ID' : 'Enable Face ID';
  if (hint) {
    hint.textContent = enrolled
      ? 'Uses your device biometrics. Your PIN still works as a backup.'
      : 'One-time setup on this device using Face ID, Touch ID, or Windows Hello.';
  }
}

function unlockAdmin(message) {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  checkAdminAuth();
  showToast(message);
}

async function registerAdminPasskey() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  sessionStorage.setItem(ADMIN_PASSKEY_CHALLENGE_KEY, bufferToBase64url(challenge));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'TheToysVirago Admin' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: 'admin@thetoysvirago.local',
        displayName: 'Vault Admin'
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    }
  });

  if (!credential) throw new Error('No passkey was created.');
  localStorage.setItem(ADMIN_PASSKEY_KEY, bufferToBase64url(credential.rawId));
  sessionStorage.removeItem(ADMIN_PASSKEY_CHALLENGE_KEY);
  updatePasskeyUi();
  unlockAdmin('Face ID is set. Vault unlocked.');
}

async function unlockAdminWithPasskey() {
  const storedId = getAdminPasskeyId();
  if (!storedId) {
    await registerAdminPasskey();
    return;
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const expectedChallenge = bufferToBase64url(challenge);
  sessionStorage.setItem(ADMIN_PASSKEY_CHALLENGE_KEY, expectedChallenge);

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ type: 'public-key', id: base64urlToBuffer(storedId) }],
      userVerification: 'required',
      timeout: 60000
    }
  });

  if (!assertion) throw new Error('Biometric verification was cancelled.');

  const clientData = JSON.parse(new TextDecoder().decode(assertion.response.clientDataJSON));
  if (clientData.challenge !== expectedChallenge || bufferToBase64url(assertion.rawId) !== storedId) {
    throw new Error('Biometric verification did not match.');
  }

  sessionStorage.removeItem(ADMIN_PASSKEY_CHALLENGE_KEY);
  unlockAdmin('Vault unlocked with biometrics.');
}

const btnAdminPasskey = document.getElementById('btn-admin-passkey');
if (btnAdminPasskey) {
  btnAdminPasskey.addEventListener('click', async () => {
    btnAdminPasskey.disabled = true;
    try {
      await unlockAdminWithPasskey();
    } catch (error) {
      console.warn('[Admin] Passkey unlock failed:', error);
      showToast(error && error.message ? error.message : 'Face ID unlock failed. Use your PIN instead.');
    } finally {
      btnAdminPasskey.disabled = false;
    }
  });
}
updatePasskeyUi();

const btnResetPasskey = document.getElementById('btn-reset-passkey');
if (btnResetPasskey) {
  btnResetPasskey.addEventListener('click', () => {
    localStorage.removeItem(ADMIN_PASSKEY_KEY);
    sessionStorage.removeItem(ADMIN_PASSKEY_CHALLENGE_KEY);
    updatePasskeyUi();
    showToast('Face ID removed. You can enable it again from the unlock screen.');
  });
}

function getStoredPin() {
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_PIN;
}

function checkAdminAuth() {
  const isUnlocked = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  const gateModal = document.getElementById('admin-gate-modal');
  const mainContent = document.getElementById('admin-main-content');

  if (!isUnlocked) {
    if (gateModal) gateModal.style.display = 'flex';
    if (mainContent) mainContent.style.filter = 'blur(12px)';
  } else {
    if (gateModal) gateModal.style.display = 'none';
    if (mainContent) mainContent.style.filter = 'none';
  }
}

const gateForm = document.getElementById('admin-gate-form');
if (gateForm) {
  gateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pinInput = document.getElementById('admin-passcode-input');
    const enteredPin = (pinInput ? pinInput.value : '').trim();
    const actualPin = getStoredPin();

    if (enteredPin === actualPin) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      checkAdminAuth();
      showToast('Vault unlocked. Welcome to Admin.');
    } else {
      showToast('Invalid passcode. Access denied.');
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  });
}

const btnLockAdmin = document.getElementById('btn-lock-admin');
if (btnLockAdmin) {
  btnLockAdmin.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    checkAdminAuth();
    showToast('Admin session locked.');
  });
}

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
    const cleaned = (Array.isArray(parsed) ? parsed : []).filter(p => p && p.id !== 'noir-chantilly-teddy' && p.id !== 'scarlet-silk-chemise' && p.id !== 'crystal-glass-plugs' && p.id !== 'crystal-dual-dildo');
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
let currentSizes = [];
let sampledColorPalette = [];
let currentMediaList = []; // [{ type: 'image' | 'video', src: string, label: string }]
let autoCopyPending = false;

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

          // Once the very first real photo is ready, generate photo-grounded copy.
          const imageCount = currentMediaList.filter(item => item.type === 'image').length;
          if (imageCount === 1) {
            const descField = document.getElementById('prod-desc');
            if (autoCopyPending && (!descField || !descField.value.trim())) {
              autoCopyPending = false;
              setTimeout(() => autoGenerateProductDescription(), 300);
            }
          }
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
    titleInput.dataset.autofilled = 'true';
  }

  const priceInput = document.getElementById('prod-price');
  if (priceInput && (!priceInput.value || Number(priceInput.value) === 0)) {
    priceInput.value = SUGGESTED_PRICES[effectiveCat] || 25000;
  }

  // Wait until the actual photo has been compressed and added to the gallery
  // before asking the vision model to describe it.
  autoCopyPending = true;
}

function compressImageFile(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    const maxDim = 800; // Constrain resolution to 800px max dimension

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
    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Compress to efficient WebP at 75% quality for ultra-crisp display under 50KB
    const compressed = canvas.toDataURL('image/webp', 0.75);
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
      playful: `Take turns drawing cards and watching inhibitions dissolve. No rules you can't bend, no awkwardness - just pure erotic connection.`,
      sensory: `Designed with progressive psychological and tactile milestones that gradually heighten anticipation from casual banter to full surrender.`
    }
  }
};

function getPrimaryProductImageSrc() {
  const mediaImage = (currentMediaList || []).find((item) => item && item.type === 'image' && item.src);
  if (mediaImage && mediaImage.src) return mediaImage.src;

  const previewSrc = previewImg && previewImg.src;
  if (previewSrc && previewSrc.startsWith('data:image')) return previewSrc;

  const urlValue = prodImgUrlInput ? prodImgUrlInput.value.trim() : '';
  return urlValue || '';
}

async function imageSourceToInlineData(src) {
  if (src.startsWith('data:')) {
    const commaIndex = src.indexOf(',');
    const meta = commaIndex === -1 ? '' : src.slice(0, commaIndex);
    const data = commaIndex === -1 ? '' : src.slice(commaIndex + 1);
    const mimeMatch = meta.match(/^data:([^;]+)/);
    return { mimeType: mimeMatch ? mimeMatch[1] : 'image/webp', data };
  }

  const response = await fetch(src);
  if (!response.ok) throw new Error(`Could not load the product image (HTTP ${response.status})`);
  const blob = await response.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + chunkSize));
  }
  return { mimeType: blob.type || 'image/jpeg', data: btoa(binary) };
}

function restoreAiButton() {
  if (!btnAutoGenerateAi) return;
  btnAutoGenerateAi.disabled = false;
  btnAutoGenerateAi.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    Regenerate Copy
  `;
}

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
  const currentTitle = titleInput ? titleInput.value.trim() : '';
  const currentDetails = {
    tagline: taglineInput ? taglineInput.value.trim() : '',
    badge: badgeInput ? badgeInput.value.trim() : '',
    material: materialInput ? materialInput.value.trim() : '',
    acoustics: acousticsInput ? acousticsInput.value.trim() : '',
    description: descInput ? descInput.value.trim() : ''
  };

  const currentImgSrc = getPrimaryProductImageSrc();
  if (!currentImgSrc) {
    if (aiStatusText) {
      aiStatusText.style.display = 'block';
      aiStatusText.textContent = 'Upload the actual product photo first - the AI writes from what it can see.';
    }
    showToast('Upload a product photo first so the AI can analyse the real item.');
    return;
  }

  if (btnAutoGenerateAi) {
    btnAutoGenerateAi.disabled = true;
    btnAutoGenerateAi.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/></svg>
      Analysing Your Photo...
    `;
  }
  if (aiStatusText) {
    aiStatusText.style.display = 'block';
    aiStatusText.textContent = 'Reading the actual uploaded product photo...';
  }

  let generatedResult = null;
  let failureMessage = '';

  try {
    let inlineImage = null;
    try {
      inlineImage = await imageSourceToInlineData(currentImgSrc);
    } catch (imageErr) {
      console.warn('Could not load the product photo for analysis:', imageErr);
    }

    let geminiApiKey = localStorage.getItem('thetoysvirago_gemini_key') || '';
    if (!geminiApiKey) {
      const quickKeyInput = document.getElementById('ai-quick-gemini-key');
      if (quickKeyInput && quickKeyInput.value.trim()) {
        geminiApiKey = quickKeyInput.value.trim();
        localStorage.setItem('thetoysvirago_gemini_key', geminiApiKey);
        updateAiVisionKeyUI();
      }
    }

    if (geminiApiKey && inlineImage) {
      if (aiStatusText) aiStatusText.textContent = 'Analysing your photo...';
      generatedResult = await callGeminiVisionAI(geminiApiKey, inlineImage, category, mood, currentTitle, currentDetails);
    } else if (inlineImage) {
      if (aiStatusText) aiStatusText.textContent = 'Analysing your photo with the secure copy service...';
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          imageBase64: inlineImage.data,
          mimeType: inlineImage.mimeType,
          category,
          mood,
          title: currentTitle,
          details: currentDetails
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Copy service failed (HTTP ${response.status})`);
      }
      generatedResult = payload;
    }
  } catch (err) {
    failureMessage = err && err.message ? err.message : 'The AI copy service is unavailable.';
    console.warn('Image-grounded copy generation failed, drafting locally instead:', err);
  }

  // No Gemini key (or the service is unavailable): still draft copy locally from
  // the product photo colours and details so the button always works.
  let usedLocalWriter = false;
  if (!generatedResult || !generatedResult.desc) {
    const colorNames = (sampledColorPalette || []).map(getColorNameFromHex).filter(Boolean);
    generatedResult = generateLocalProductCopy({
      lexicon: BOUDOIR_LEXICON,
      category,
      mood,
      title: currentTitle,
      colorNames,
      details: currentDetails
    });
    usedLocalWriter = Boolean(generatedResult && generatedResult.desc);
  }

  if (!generatedResult || !generatedResult.desc) {
    restoreAiButton();
    if (aiStatusText) {
      aiStatusText.style.display = 'block';
      aiStatusText.textContent = failureMessage
        ? `Copy not generated: ${failureMessage}`
        : 'Copy could not be generated. Please try again.';
    }
    showToast(failureMessage || 'Copy could not be generated. Please try again.');
    return;
  }

  const canApplyTitle = titleInput && (!titleInput.value.trim() || titleInput.dataset.autofilled === 'true');
  if (canApplyTitle) {
    titleInput.value = generatedResult.title || titleInput.value;
    titleInput.dataset.autofilled = 'true';
  }
  if (taglineInput && generatedResult.tagline) taglineInput.value = generatedResult.tagline;
  if (badgeInput && generatedResult.badge) badgeInput.value = generatedResult.badge;
  if (descInput) descInput.value = generatedResult.desc;
  if (materialInput && generatedResult.material) materialInput.value = generatedResult.material;
  if (acousticsInput && generatedResult.acoustics) acousticsInput.value = generatedResult.acoustics;

  // Auto-generate suggested color variant if sampled
  if (sampledColorPalette.length > 0 && currentVariants.length === 0) {
    sampledColorPalette.slice(0, 2).forEach(hex => {
      addColorVariant(getColorNameFromHex(hex), hex);
    });
  }

  updateWordCount();
  restoreAiButton();
  if (aiStatusText) {
    aiStatusText.style.display = 'block';
    aiStatusText.textContent = usedLocalWriter
      ? '⚠️ Offline template used. Check the Gemini server key and redeploy.'
      : `✨ Copy written from the uploaded photo in ${mood} tone.`;
  }
  showToast(usedLocalWriter ? 'Offline template copy applied.' : 'Photo-accurate copy applied to the product form!');
}

async function callGeminiVisionAI(apiKey, inlineImage, category, mood, currentTitle, details = {}) {
  const prompt = buildProductCopyPrompt(category, mood, currentTitle, details);
  let lastError = '';

  for (const model of GEMINI_VISION_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: inlineImage.mimeType, data: inlineImage.data } }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }

      const json = await response.json();
      const text = (json.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text || '')
        .join('');
      return parseGeminiJson(text);
    } catch (err) {
      lastError = `${model}: ${err.message}`;
    }
  }

  throw new Error(lastError || 'Gemini could not analyse the photo.');
}

if (btnAutoGenerateAi) {
  btnAutoGenerateAi.addEventListener('click', autoGenerateProductDescription);
}

// A manually typed title should never be overwritten by the AI.
const productTitleField = document.getElementById('prod-title');
if (productTitleField) {
  productTitleField.addEventListener('input', () => {
    delete productTitleField.dataset.autofilled;
  });
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
const variantPriceInput = document.getElementById('new-variant-price');
const variantColorInput = document.getElementById('new-variant-color');
const variantColorPreview = document.getElementById('variant-color-preview');
const variantsList = document.getElementById('variants-list');

export function parseVariantToken(token, fallbackPrice) {
  let raw = String(token || '').trim();
  if (!raw) return null;

  let parsedPrice = null;

  // Match patterns like:
  // "Thrusting 45,000" or "Thrusting - 45000" or "Thrusting: ₦45,000" or "Ordinary 40k" or "Ordinary (40,000)"
  const priceRegex = /(?:[:\-·|\u2013\u2014]|\s+)\s*(?:₦|NGN\s*)?([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7}|\d+k)\s*\)?$/i;
  const match = raw.match(priceRegex);

  if (match) {
    const priceStr = match[1].toLowerCase().trim();
    let num = 0;
    if (priceStr.endsWith('k')) {
      num = parseFloat(priceStr.replace('k', '')) * 1000;
    } else {
      num = parseFloat(priceStr.replace(/,/g, ''));
    }
    if (!isNaN(num) && num > 0) {
      parsedPrice = num;
      // Strip matched price portion from name
      raw = raw.substring(0, match.index).replace(/[\(:\u2013\u2014\-·|]\s*$/, '').trim();
    }
  }

  // If no price extracted from token, use fallbackPrice if valid
  if (parsedPrice === null && fallbackPrice != null && !isNaN(Number(fallbackPrice)) && Number(fallbackPrice) > 0) {
    parsedPrice = Number(fallbackPrice);
  }

  const cleanName = formatColorName(raw);
  if (!cleanName) return null;

  return {
    name: cleanName,
    price: parsedPrice
  };
}

function renderVariants() {
  if (!variantsList) return;
  variantsList.innerHTML = '';
  currentVariants.forEach((v, idx) => {
    const hex = resolveColorHex(v.color, v.name);
    v.color = hex;
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    const borderStyle = isLightColor(hex) ? 'border: 1px solid #cbd5e1;' : 'border: 1px solid rgba(0,0,0,0.15);';
    const isColor = isRecognizedColorName(v.name);
    const priceDisplay = (!isColor && v.hasCustomPrice && v.price && !isNaN(v.price) && v.price > 0) ? ` <span style="font-size: 11px; opacity: 0.85; font-weight: 600;">· ₦${Number(v.price).toLocaleString()}</span>` : '';
    chip.innerHTML = `
      <span style="width: 12px; height: 12px; border-radius: 50%; background: ${hex}; display: inline-block; ${borderStyle} box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></span>
      <strong>${v.name}</strong>${priceDisplay}
      <span class="tag-chip-del" data-idx="${idx}" title="Remove variant">&times;</span>
    `;
    chip.querySelector('.tag-chip-del').addEventListener('click', () => {
      currentVariants.splice(idx, 1);
      renderVariants();
    });
    variantsList.appendChild(chip);
  });
}

function updateVariantColorPreview() {
  const text = variantNameInput ? variantNameInput.value.trim() : '';
  const firstToken = text ? text.split(/[,;/]+/)[0].trim() : '';
  const parsed = parseVariantToken(firstToken);
  const cleanName = parsed ? parsed.name : firstToken;
  const hex = resolveColorHex(cleanName || '#0c0c0e');
  if (variantColorPreview) {
    variantColorPreview.style.backgroundColor = hex;
    variantColorPreview.style.borderColor = isLightColor(hex) ? '#94a3b8' : 'rgba(0,0,0,0.2)';
  }
  if (variantColorInput && (!variantColorInput.dataset.manualOverride || !text)) {
    variantColorInput.value = hex;
  }
}

function addColorVariant(rawName, explicitColor, explicitPrice) {
  if (!rawName) return;
  const tokens = String(rawName).split(/[,;/]+/).map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) return;

  tokens.forEach(token => {
    const parsed = parseVariantToken(token, explicitPrice);
    if (!parsed || !parsed.name) return;

    const cleanName = parsed.name;
    const resolvedHex = resolveColorHex(explicitColor, cleanName);
    const existingIdx = currentVariants.findIndex(v => v.name.toLowerCase() === cleanName.toLowerCase());
    
    const variantObj = {
      name: cleanName,
      color: resolvedHex
    };
    const isCol = isRecognizedColorName(cleanName);
    if (!isCol && parsed.price != null && !isNaN(parsed.price) && parsed.price > 0) {
      variantObj.price = parsed.price;
      variantObj.priceStr = `₦${parsed.price.toLocaleString()}`;
      variantObj.hasCustomPrice = true;
    } else {
      variantObj.hasCustomPrice = false;
    }

    if (existingIdx >= 0) {
      currentVariants[existingIdx] = {
        ...currentVariants[existingIdx],
        ...variantObj
      };
    } else {
      currentVariants.push(variantObj);
    }
  });
  renderVariants();
}

function triggerAddVariant() {
  if (!variantNameInput) return;
  const name = variantNameInput.value.trim();
  if (!name) return;
  const explicitPrice = variantPriceInput && variantPriceInput.value ? parseFloat(variantPriceInput.value) : null;
  const manual = variantColorInput && variantColorInput.dataset.manualOverride === 'true' ? variantColorInput.value : '';
  addColorVariant(name, manual, explicitPrice);
  variantNameInput.value = '';
  if (variantPriceInput) variantPriceInput.value = '';
  if (variantColorInput) delete variantColorInput.dataset.manualOverride;
  updateVariantColorPreview();
}

if (variantNameInput) {
  variantNameInput.addEventListener('input', updateVariantColorPreview);
  variantNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerAddVariant();
    }
  });
}

if (variantPriceInput) {
  variantPriceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerAddVariant();
    }
  });
}

if (variantColorInput) {
  variantColorInput.addEventListener('input', () => {
    variantColorInput.dataset.manualOverride = 'true';
    if (variantColorPreview) {
      variantColorPreview.style.backgroundColor = variantColorInput.value;
    }
  });
}

if (btnAddVariant) {
  btnAddVariant.addEventListener('click', triggerAddVariant);
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

const prodIsAbujaInput = document.getElementById('prod-is-abuja');
if (prodIsAbujaInput) {
  prodIsAbujaInput.addEventListener('change', () => {
    const badgeInput = document.getElementById('prod-badge');
    if (badgeInput) {
      if (prodIsAbujaInput.checked && (!badgeInput.value || badgeInput.value === 'NEW ARRIVAL')) {
        badgeInput.value = 'ABUJA EXCLUSIVE';
      } else if (!prodIsAbujaInput.checked && badgeInput.value === 'ABUJA EXCLUSIVE') {
        badgeInput.value = '';
      }
    }
  });
}

function resetForm() {
  if (productForm) productForm.reset();
  const editingId = document.getElementById('editing-product-id');
  if (editingId) editingId.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
  if (paletteWrap) paletteWrap.style.display = 'none';
  if (prodIsAbujaInput) prodIsAbujaInput.checked = false;
  currentMediaList = [];
  renderMediaGallery();
  currentVariants = [];
  currentSizes = [];
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

    const isAbuja = Boolean(prodIsAbujaInput && prodIsAbujaInput.checked);
    const region = isAbuja ? 'abuja' : 'all';
    let finalBadge = badge;
    if (isAbuja && !finalBadge) {
      finalBadge = 'ABUJA EXCLUSIVE';
    }

    // If variants exist and have specific prices, ensure base price reflects the lowest variant price
    const variantPrices = currentVariants
      .filter(v => v.hasCustomPrice && typeof v.price === 'number' && !isNaN(v.price) && v.price > 0)
      .map(v => v.price);
    const effectivePrice = (price === 0 && variantPrices.length > 0) ? Math.min(...variantPrices) : price;
    const hasDiffVariantPrices = variantPrices.length > 1 && new Set(variantPrices).size > 1;
    const effectivePriceStr = hasDiffVariantPrices ? `From ₦${effectivePrice.toLocaleString()}` : `₦${effectivePrice.toLocaleString()}`;

    const productData = {
      id,
      title,
      category,
      sku,
      badge: finalBadge,
      tagline,
      region,
      isAbuja,
      price: effectivePrice,
      priceStr: effectivePriceStr,
      originalPrice,
      img: imgSrc,
      desc,
      specs: [
        { label: 'Material', value: material },
        { label: 'Sensation', value: acoustics },
        { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
      ],
      variants: currentVariants.length > 0 ? currentVariants.map(v => {
        const isColor = isRecognizedColorName(v.name);
        const hasCustom = !isColor && Boolean(v.hasCustomPrice && typeof v.price === 'number' && !isNaN(v.price) && v.price > 0);
        const vPrice = hasCustom ? v.price : effectivePrice;
        return {
          name: formatColorName(v.name),
          price: isColor ? effectivePrice : vPrice,
          priceStr: hasCustom ? (v.priceStr || `₦${vPrice.toLocaleString()}`) : '',
          hasCustomPrice: hasCustom,
          img: v.img || imgSrc,
          color: resolveColorHex(v.color, v.name)
        };
      }) : [],
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
          showToast(`✓ "${title}" is now LIVE! <a href="/products/${encodeURIComponent(id)}" target="_blank" rel="noopener">View Product &rarr;</a>`, true);
        } else {
          console.warn('[Supabase] Sync notice:', res.error);
          showToast(`Saved locally. Supabase: ${res.error || 'Check connection'}`);
        }
      } catch (err) {
        console.error('[Supabase] Unexpected upload error:', err);
        showToast(`Saved locally. Supabase upload error.`);
      }
    } else {
      showToast(`Saved "${title}" to Catalog. <a href="/products/${encodeURIComponent(id)}" target="_blank" rel="noopener">View Product &rarr;</a>`, true);
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
    const isAbuja = Boolean(p.region === 'abuja' || p.isAbuja === true || p.is_abuja === true || /abuja/i.test(p.badge || '') || /abuja/i.test(p.tagline || ''));
    const matchesCat = activeInventoryFilter === 'all'
      || (activeInventoryFilter === 'abuja' ? isAbuja : p.category === activeInventoryFilter);
    const matchesSearch = !searchVal ||
      p.title.toLowerCase().includes(searchVal) ||
      (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
      (p.category && p.category.toLowerCase().includes(searchVal)) ||
      (isAbuja && 'abuja'.includes(searchVal));
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
    const isAbujaProd = Boolean(prod.region === 'abuja' || prod.isAbuja === true || prod.is_abuja === true || /abuja/i.test(prod.badge || ''));

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
          ${isAbujaProd ? '<span class="admin-cat-badge" style="background: #881337; color: #fff; font-weight: 700;">📍 ABUJA</span>' : ''}
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
        <a href="/products/${encodeURIComponent(prod.id)}" target="_blank" rel="noopener" class="admin-btn admin-btn-outline" style="padding: 6px 10px; font-size: 12px; text-decoration: none;" title="View on Live Shop">↗ Shop</a>
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

async function loadProductIntoForm(prod) {
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

  // If remote product had media omitted in lightweight summary, fetch full item on demand
  let activeMedia = Array.isArray(prod.media) && prod.media.length > 0 ? prod.media : null;
  if (!activeMedia && isSupabaseConfigured && prod.id) {
    try {
      const fullProd = await getSupabaseProductById(prod.id);
      if (fullProd && Array.isArray(fullProd.media) && fullProd.media.length > 0) {
        activeMedia = fullProd.media;
      }
    } catch (e) {}
  }

  if (activeMedia && activeMedia.length > 0) {
    currentMediaList = [...activeMedia];
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

  if (prodIsAbujaInput) {
    prodIsAbujaInput.checked = Boolean(prod.region === 'abuja' || prod.isAbuja === true || /abuja/i.test(prod.badge || '') || /abuja/i.test(prod.tagline || ''));
  }

  currentVariants = Array.isArray(prod.variants)
    ? prod.variants.map(v => {
        const hasCustom = Boolean(v.hasCustomPrice || (v.price && prod.price && Number(v.price) > 0 && Number(v.price) !== Number(prod.price)));
        const vPrice = hasCustom ? Number(v.price) : null;
        return {
          ...v,
          name: formatColorName(v.name || ''),
          price: vPrice,
          priceStr: hasCustom ? (v.priceStr || `₦${Number(v.price).toLocaleString()}`) : '',
          hasCustomPrice: hasCustom,
          color: resolveColorHex(v.color, v.name)
        };
      })
    : [];
  currentSizes = Array.isArray(prod.sizes) ? [...prod.sizes] : (prod.category === 'lingerie' ? ['S', 'M', 'L'] : []);
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
  // Add local custom products first for instant rendering
  currentCustomProducts.forEach(p => mergedMap.set(p.id, p));

  // Render immediately if we already have local custom products
  if (mergedMap.size > 0 && !allInventoryProducts.length) {
    allInventoryProducts = Array.from(mergedMap.values());
    updateStats();
    renderInventoryTable();
  }

  // Sync with Supabase cloud if connected (LIGHTWEIGHT QUERY - skips heavy media payloads)
  if (isSupabaseConfigured) {
    try {
      const summaryColumns = 'id, title, category, badge, tagline, price, original_price, image, description, in_stock, variants, sizes, region, is_abuja, updated_at';
      const legacySummaryColumns = 'id, title, category, badge, tagline, price, original_price, image, description, in_stock, variants, sizes, updated_at';
      let remote = await getSupabaseProducts(summaryColumns);
      if (!Array.isArray(remote)) remote = await getSupabaseProducts(legacySummaryColumns);
      if (remote && Array.isArray(remote)) {
        remote.forEach(rp => {
          const mapped = {
            id: rp.id,
            title: rp.title,
            category: rp.category || 'toys',
            sku: rp.category ? `${rp.category.toUpperCase()} · ${rp.id.slice(0, 4)}` : 'VAULT · 01',
            badge: rp.badge || '',
            tagline: rp.tagline || '',
            region: rp.region || (rp.is_abuja ? 'abuja' : 'all'),
            isAbuja: rp.is_abuja === true || rp.region === 'abuja' || /abuja/i.test(rp.badge || ''),
            price: Number(rp.price) || 0,
            priceStr: `₦${Number(rp.price).toLocaleString()}`,
            img: rp.image || '/assets/category-lingerie.webp',
            desc: rp.description || '',
            inStock: rp.in_stock !== false,
            variants: Array.isArray(rp.variants) ? rp.variants : [],
            sizes: Array.isArray(rp.sizes) ? rp.sizes : [],
            media: []
          };
          mergedMap.set(rp.id, mapped);
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
      baseProds.filter(bp => bp.id !== 'crystal-glass-plugs' && bp.id !== 'crystal-dual-dildo').forEach(bp => {
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
const customPinInput = document.getElementById('admin-custom-pin');

function openSettings() {
  if (geminiKeyInput) geminiKeyInput.value = localStorage.getItem('thetoysvirago_gemini_key') || '';
  if (supabaseServiceKeyInput) supabaseServiceKeyInput.value = localStorage.getItem('thetoysvirago_supabase_service_key') || '';
  if (customPinInput) customPinInput.value = getStoredPin();
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
    const pin = customPinInput ? customPinInput.value.trim() : '';

    if (key) {
      localStorage.setItem('thetoysvirago_gemini_key', key);
    } else {
      localStorage.removeItem('thetoysvirago_gemini_key');
    }
    updateAiVisionKeyUI();

    if (serviceKey) {
      localStorage.setItem('thetoysvirago_supabase_service_key', serviceKey);
    } else {
      localStorage.removeItem('thetoysvirago_supabase_service_key');
    }

    if (pin) {
      localStorage.setItem(ADMIN_PIN_KEY, pin);
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
  checkAdminAuth();
  refreshCatalogData();
  initArticlesStudio();
  updateAiVisionKeyUI();
  checkServerGeminiKey();

  const syncStatusText = document.getElementById('sync-status-text');
  if (syncStatusText) {
    if (isSupabaseConfigured) {
      syncStatusText.textContent = 'Supabase Cloud Connected';
    } else {
      syncStatusText.textContent = 'Local Browser Vault Mode';
    }
  }
}


// ================= GEMINI VISION KEY UI CONTROLLER =================
async function checkServerGeminiKey() {
  try {
    const response = await fetch('/api/gemini-status', { cache: 'no-store' });
    if (response.ok) {
      const payload = await response.json().catch(() => ({}));
      serverGeminiConfigured = payload.configured === true;
    }
  } catch (_) {
    serverGeminiConfigured = false;
  }
  updateAiVisionKeyUI();
}

function updateAiVisionKeyUI() {
  const localKey = localStorage.getItem('thetoysvirago_gemini_key') || '';
  const visionActive = Boolean(localKey) || serverGeminiConfigured;
  const keyNeededBox = document.getElementById('ai-vision-key-needed');
  const quickKeyInput = document.getElementById('ai-quick-gemini-key');
  const settingsKeyInput = document.getElementById('gemini-api-key');
  const settingsGroup = document.getElementById('gemini-key-setting-group');
  const serverKeyNote = document.getElementById('gemini-server-key-note');

  if (visionActive) {
    if (keyNeededBox) keyNeededBox.style.display = 'none';
    if (quickKeyInput) quickKeyInput.value = localKey;
    if (settingsKeyInput) settingsKeyInput.value = localKey;
    if (settingsGroup) settingsGroup.style.display = serverGeminiConfigured && !localKey ? 'none' : 'block';
    if (serverKeyNote) serverKeyNote.style.display = serverGeminiConfigured && !localKey ? 'block' : 'none';
  } else {
    if (keyNeededBox) keyNeededBox.style.display = 'block';
    if (quickKeyInput) quickKeyInput.value = '';
    if (settingsKeyInput) settingsKeyInput.value = '';
    if (settingsGroup) settingsGroup.style.display = 'block';
    if (serverKeyNote) serverKeyNote.style.display = 'none';
  }
}

const btnSaveQuickGeminiKey = document.getElementById('btn-save-quick-gemini-key');
if (btnSaveQuickGeminiKey) {
  btnSaveQuickGeminiKey.addEventListener('click', () => {
    const quickInput = document.getElementById('ai-quick-gemini-key');
    const val = quickInput ? quickInput.value.trim() : '';
    if (val) {
      localStorage.setItem('thetoysvirago_gemini_key', val);
      updateAiVisionKeyUI();
      showToast('Gemini API Key saved.');
    } else {
      localStorage.removeItem('thetoysvirago_gemini_key');
      updateAiVisionKeyUI();
      showToast('Gemini API Key removed.');
    }
  });
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
  const awaitingCount = allOrders.filter(o => o.status === 'awaiting_confirmation' || o.status === 'pending_transfer' || o.status === 'pending' || !o.status).length;
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
      if (o.status !== 'awaiting_confirmation' && o.status !== 'pending_transfer' && o.status !== 'pending' && o.status) return false;
    } else if (currentOrderFilter === 'confirmed') {
      if (o.status !== 'confirmed') return false;
    } else if (currentOrderFilter === 'dispatched') {
      if (o.status !== 'dispatched') return false;
    } else if (currentOrderFilter === 'delivered') {
      if (o.status !== 'delivered') return false;
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
    const status = order.status || 'awaiting_confirmation';
    const isAwaiting = status === 'awaiting_confirmation' || status === 'pending_transfer' || status === 'pending';
    const isConfirmed = status === 'confirmed';
    const isDispatched = status === 'dispatched';
    const isDelivered = status === 'delivered';

    let badgeHtml = '';
    if (isDelivered) {
      badgeHtml = `<span class="delivered-badge-pill">🎁 Delivered &bull; Confession Prompt Sent</span>`;
    } else if (isDispatched) {
      badgeHtml = `<span class="dispatched-badge-pill">🚚 Dispatched &bull; In Transit</span>`;
    } else if (isConfirmed) {
      badgeHtml = `<span class="confirmed-badge-pill">✓ Payment Confirmed</span>`;
    } else {
      badgeHtml = `<span class="awaiting-badge-pill">⏳ Awaiting Confirmation</span>`;
    }

    const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsListHtml = items.map(item => `
      <div class="admin-order-item-row">
        <span><strong>${item.qty || 1}x</strong> ${item.title || 'Product'} ${item.finish ? '<span style="color:#64748b; font-size: 11px;">(' + item.finish + ')</span>' : ''}</span>
        <span style="font-weight: 700; color: #0f172a;">₦${Number(item.price || 0).toLocaleString()}</span>
      </div>
    `).join('') || `<div>${order.items || 'Standard Order Items'}</div>`;

    // Action buttons based on order status lifecycle
    let actionsHtml = '';
    if (isAwaiting) {
      actionsHtml = `
        <button type="button" class="btn-tick-confirmed" data-ref="${order.reference}" style="border-radius: 8px !important;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Confirm &amp; Send Receipt</span>
        </button>
      `;
    } else if (isConfirmed) {
      actionsHtml = `
        <button type="button" class="admin-btn btn-tick-dispatched" data-ref="${order.reference}" style="background: #0284c7; color: #ffffff; border: 1px solid #0284c7; padding: 8px 14px; border-radius: 8px !important; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
          <span>🚚 Mark Dispatched</span>
        </button>
        <button type="button" class="admin-btn admin-btn-outline btn-resend-confirmed" data-ref="${order.reference}" style="padding: 7px 10px; font-size: 11px; border-radius: 8px !important;">
          ✉️ Resend Receipt
        </button>
      `;
    } else if (isDispatched) {
      actionsHtml = `
        <button type="button" class="admin-btn btn-tick-delivered" data-ref="${order.reference}" style="background: #9f1239; color: #ffffff; border: 1px solid #9f1239; padding: 8px 14px; border-radius: 8px !important; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
          <span>🎁 Mark Delivered</span>
        </button>
        <button type="button" class="admin-btn admin-btn-outline btn-resend-dispatched" data-ref="${order.reference}" style="padding: 7px 10px; font-size: 11px; border-radius: 8px !important;">
          ✉️ Resend Dispatch
        </button>
      `;
    } else if (isDelivered) {
      actionsHtml = `
        <button type="button" class="admin-btn admin-btn-outline btn-resend-delivered" data-ref="${order.reference}" style="padding: 7px 12px; font-size: 11.5px; border-radius: 8px !important;">
          ✉️ Resend Review Prompt
        </button>
      `;
    }

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
            ${badgeHtml}
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
            <span class="admin-order-amount">₦${Number(order.total_amount || (items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0) + (order.delivery_fee || 0)) || order.amount || 0).toLocaleString()}</span>
          </div>
          <div class="admin-order-actions-group">
            ${actionsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 1. Wire tick as confirmed buttons (Stage 1 -> Stage 2)
  ordersCardsContainer.querySelectorAll('.btn-tick-confirmed').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;

      btn.disabled = true;
      btn.innerHTML = `<span>Updating &amp; Sending Receipt...</span>`;

      await updateSupabaseOrderStatus(ref, 'confirmed');
      const emailRes = await sendCustomerOrderConfirmationEmail(order);

      order.status = 'confirmed';
      order.confirmed_at = new Date().toISOString();

      updateOrdersStats();
      renderOrdersList();

      if (emailRes && emailRes.success) {
        showToast(`Order ${ref} confirmed! Official receipt sent to ${order.customer_email || 'customer'}.`);
      } else {
        const errMsg = emailRes?.error?.message || emailRes?.error || 'Email dispatch failed';
        showToast(`Order ${ref} confirmed, but email notice: ${errMsg}`);
      }
    });
  });

  // 2. Wire mark as dispatched buttons (Stage 2 -> Stage 3)
  ordersCardsContainer.querySelectorAll('.btn-tick-dispatched').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;

      btn.disabled = true;
      btn.innerHTML = `<span>Dispatching &amp; Notifying...</span>`;

      await updateSupabaseOrderStatus(ref, 'dispatched');
      const emailRes = await sendCustomerOrderDispatchedEmail(order);

      order.status = 'dispatched';
      order.dispatched_at = new Date().toISOString();

      renderOrdersList();

      if (emailRes && emailRes.success) {
        showToast(`Order ${ref} dispatched! Tracking notification sent to ${order.customer_email || 'customer'}.`);
      } else {
        showToast(`Order ${ref} marked as dispatched!`);
      }
    });
  });

  // 3. Wire mark as delivered buttons (Stage 3 -> Stage 4 with Review & Confessions prompt)
  ordersCardsContainer.querySelectorAll('.btn-tick-delivered').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;

      btn.disabled = true;
      btn.innerHTML = `<span>Marking Delivered &amp; Sending Review Prompt...</span>`;

      await updateSupabaseOrderStatus(ref, 'delivered');
      const emailRes = await sendCustomerOrderDeliveredEmail(order);

      order.status = 'delivered';
      order.delivered_at = new Date().toISOString();

      renderOrdersList();

      if (emailRes && emailRes.success) {
        showToast(`Order ${ref} delivered! Review & Confessions prompt sent to ${order.customer_email || 'customer'}.`);
      } else {
        showToast(`Order ${ref} marked as delivered!`);
      }
    });
  });

  // 4. Wire re-send confirmation receipt buttons
  ordersCardsContainer.querySelectorAll('.btn-resend-confirmed').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;
      btn.disabled = true;
      showToast(`Resending confirmation receipt for order ${ref}...`);
      await sendCustomerOrderConfirmationEmail(order);
      btn.disabled = false;
      showToast(`Receipt resent to ${order.customer_email || 'customer'}.`);
    });
  });

  // 5. Wire re-send dispatched notification buttons
  ordersCardsContainer.querySelectorAll('.btn-resend-dispatched').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;
      btn.disabled = true;
      showToast(`Resending dispatch email for order ${ref}...`);
      await sendCustomerOrderDispatchedEmail(order);
      btn.disabled = false;
      showToast(`Dispatch email resent to ${order.customer_email || 'customer'}.`);
    });
  });

  // 6. Wire re-send delivered review prompt buttons
  ordersCardsContainer.querySelectorAll('.btn-resend-delivered').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ref = btn.dataset.ref;
      const order = allOrders.find(o => o.reference === ref);
      if (!order) return;
      btn.disabled = true;
      showToast(`Resending review prompt for order ${ref}...`);
      await sendCustomerOrderDeliveredEmail(order);
      btn.disabled = false;
      showToast(`Review & Confessions prompt resent to ${order.customer_email || 'customer'}.`);
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

const statCardArticles = document.getElementById('stat-card-articles');
if (statCardArticles) {
  statCardArticles.addEventListener('click', () => {
    switchTab('articles-panel');
  });
}

// Hook into switchTab to load orders or articles when clicking panels
const originalSwitchTab = switchTab;
switchTab = function(tabId) {
  originalSwitchTab(tabId);
  if (tabId === 'orders-panel') {
    loadAndRenderOrders();
  } else if (tabId === 'articles-panel') {
    if (typeof loadAndSyncArticles === 'function') {
      loadAndSyncArticles();
    }
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


// ================= 13. THE PLEASURE JOURNAL ARTICLES STUDIO =================
const CUSTOM_ARTICLES_KEY = 'thetoysvirago_custom_articles';

function getCustomArticles() {
  try {
    const raw = localStorage.getItem(CUSTOM_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading custom articles:', e);
    return [];
  }
}

function saveCustomArticles(articles) {
  try {
    localStorage.setItem(CUSTOM_ARTICLES_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('LocalStorage quota issue for articles:', e);
  }
}

function slugifyArticleTitle(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getArticleCatClass(cat) {
  const c = (cat || '').toLowerCase().trim();
  if (c.includes('couple')) return 'cat-couples';
  if (c.includes('confession')) return 'cat-confessions';
  if (c.includes('first') || c.includes('beginner')) return 'cat-first-timers';
  if (c.includes('well') || c.includes('lube')) return 'cat-wellness';
  if (c.includes('discreet') || c.includes('discretion')) return 'cat-discretion';
  return 'cat-guides';
}

let allArticles = [];
let currentCustomArticles = getCustomArticles();
let activeArticlesFilter = 'all';
let userManuallyEditedSlug = false;

function updateArticlesBadges() {
  const count = allArticles.length;
  const tabBadge = document.getElementById('tab-articles-count');
  if (tabBadge) tabBadge.textContent = String(count);
  const statBadge = document.getElementById('stat-articles-count');
  if (statBadge) statBadge.textContent = String(count);
  const invBadge = document.getElementById('articles-count-badge');
  if (invBadge) invBadge.textContent = String(count);
}

async function loadAndSyncArticles() {
  currentCustomArticles = getCustomArticles();
  const customSlugs = new Set(currentCustomArticles.map(a => a.slug));
  allArticles = [
    ...currentCustomArticles.map(a => ({ ...a, isCustom: true })),
    ...BLOG_ARTICLES.filter(a => !customSlugs.has(a.slug)).map(a => ({ ...a, isCustom: false }))
  ];
  updateArticlesBadges();
  renderArticlesTable();

  if (isSupabaseConfigured) {
    try {
      const cloudData = await getSupabaseArticles();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        const formatted = cloudData.map(row => ({
          slug: row.slug,
          title: row.title,
          category: row.category || 'Guides',
          readTime: row.read_time || row.readTime || '5 min read',
          date: row.date || '',
          author: row.author || 'Real stories',
          heroImg: row.hero_img || row.heroImg || '/assets/hero-collection.webp',
          imgAlt: row.img_alt || row.imgAlt || row.title,
          excerpt: row.excerpt || '',
          content: row.content || '',
          seoTitle: row.seo_title || row.seoTitle || row.title,
          metaDesc: row.meta_desc || row.metaDesc || row.excerpt,
          searchPhrase: row.search_phrase || row.searchPhrase || '',
          relatedProducts: Array.isArray(row.related_products) ? row.related_products : (row.relatedProducts || []),
          published: row.published !== false,
          isCustom: true
        }));

        const cloudSlugs = new Set(formatted.map(a => a.slug));
        const mergedCustom = [
          ...formatted,
          ...currentCustomArticles.filter(a => !cloudSlugs.has(a.slug))
        ];
        saveCustomArticles(mergedCustom);
        currentCustomArticles = mergedCustom;

        const mergedCustomSlugs = new Set(mergedCustom.map(a => a.slug));
        allArticles = [
          ...mergedCustom.map(a => ({ ...a, isCustom: true })),
          ...BLOG_ARTICLES.filter(a => !mergedCustomSlugs.has(a.slug)).map(a => ({ ...a, isCustom: false }))
        ];
        updateArticlesBadges();
        renderArticlesTable();
      }
    } catch (err) {
      console.warn('[Admin Articles] Cloud sync note:', err);
    }
  }
}

function renderArticlesTable() {
  const tbody = document.getElementById('articles-table-body');
  if (!tbody) return;
  const searchInput = document.getElementById('articles-search-input');
  const searchVal = (searchInput ? searchInput.value : '').trim().toLowerCase();

  const filtered = allArticles.filter(art => {
    const matchesCat = activeArticlesFilter === 'all'
      ? true
      : activeArticlesFilter === 'custom'
        ? art.isCustom === true
        : (art.category && art.category.toLowerCase().trim() === activeArticlesFilter.toLowerCase().trim());

    const matchesSearch = !searchVal ||
      (art.title && art.title.toLowerCase().includes(searchVal)) ||
      (art.slug && art.slug.toLowerCase().includes(searchVal)) ||
      (art.category && art.category.toLowerCase().includes(searchVal)) ||
      (art.author && art.author.toLowerCase().includes(searchVal)) ||
      (art.excerpt && art.excerpt.toLowerCase().includes(searchVal));

    return matchesCat && matchesSearch;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px; color: #64748b;">
          No articles found matching "${escapeHtml(searchVal)}". Click "+ Write New Article" to draft one.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(art => {
    const tr = document.createElement('tr');
    tr.className = 'article-table-row';
    tr.innerHTML = `
      <td class="art-cell-hero">
        <img src="${art.heroImg || '/assets/hero-collection.webp'}" alt="${escapeHtml(art.title)}" class="admin-prod-thumb" style="width: 54px; height: 38px; object-fit: cover; border-radius: 6px;" onerror="this.src='/assets/hero-collection.webp';" />
      </td>
      <td class="art-cell-info">
        <div class="admin-prod-info">
          <a href="/blog/${encodeURIComponent(art.slug)}" target="_blank" class="admin-prod-name" style="text-decoration: none; color: #0f172a; font-weight: 700;" title="Read on blog">${escapeHtml(art.title)}</a>
          <span class="admin-prod-sku">/blog/${escapeHtml(art.slug)}</span>
          <span style="font-size: 11px; color: #64748b;">${escapeHtml(art.author || 'The Pleasure Journal')}</span>
        </div>
      </td>
      <td class="art-cell-cat">
        <span class="admin-cat-badge ${getArticleCatClass(art.category)}">${escapeHtml(art.category || 'Guides')}</span>
      </td>
      <td class="art-cell-meta">
        <div style="font-weight: 600; font-size: 12px; color: #1e293b;">${escapeHtml(art.date || 'Recent')}</div>
        <div style="font-size: 11px; color: #64748b;">${escapeHtml(art.readTime || '5 min read')}</div>
      </td>
      <td class="art-cell-source">
        ${art.isCustom
          ? '<span class="admin-status-pill" style="padding: 3px 8px; font-size: 11px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 8px !important;">☁️ Custom / Cloud</span>'
          : '<span class="admin-status-pill" style="padding: 3px 8px; font-size: 11px; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px !important;">Built-in</span>'
        }
      </td>
      <td class="art-cell-actions" style="text-align: right;">
        <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center; flex-wrap: nowrap;">
          <button type="button" class="admin-btn admin-btn-outline btn-edit-article" data-slug="${escapeHtml(art.slug)}" style="padding: 5px 10px; font-size: 11.5px; border-radius: 8px !important;" title="Edit this story">✏️ Edit</button>
          <a href="/blog/${encodeURIComponent(art.slug)}" target="_blank" class="admin-btn admin-btn-outline" style="padding: 5px 10px; font-size: 11.5px; border-radius: 8px !important;" title="View story on blog">↗ View</a>
          ${art.isCustom ? `<button type="button" class="admin-btn admin-btn-outline btn-delete-article" data-slug="${escapeHtml(art.slug)}" style="padding: 5px 8px; font-size: 11.5px; color: #e11d48; border-color: #fecdd3; border-radius: 8px !important;" title="Delete story">🗑</button>` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function resetArticleForm() {
  const form = document.getElementById('article-editor-form');
  if (form) form.reset();
  const editSlug = document.getElementById('editing-article-slug');
  if (editSlug) editSlug.value = '';
  const banner = document.getElementById('article-editing-banner');
  if (banner) banner.style.display = 'none';
  const pubBtnText = document.getElementById('btn-publish-article-text');
  if (pubBtnText) pubBtnText.textContent = 'Publish to Journal';
  const mainTitle = document.getElementById('article-editor-main-title');
  if (mainTitle) mainTitle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" style="vertical-align: -3px; margin-right: 6px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Write &amp; Publish Article`;

  const authorInput = document.getElementById('article-author-input');
  if (authorInput) authorInput.value = 'Real stories';
  const dateInput = document.getElementById('article-date-input');
  if (dateInput) dateInput.value = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const readInput = document.getElementById('article-readtime-input');
  if (readInput) readInput.value = '1 min read';
  const previewImg = document.getElementById('article-preview-img');
  if (previewImg) previewImg.src = '/assets/hero-collection.webp';
  const heroUrl = document.getElementById('article-hero-url');
  if (heroUrl) heroUrl.value = '';
  const altInput = document.getElementById('article-img-alt');
  if (altInput) altInput.value = '';
  const wordsEl = document.getElementById('article-content-words');
  if (wordsEl) wordsEl.textContent = '0 words';
  const timeEstEl = document.getElementById('article-content-time-est');
  if (timeEstEl) timeEstEl.textContent = '~1 min read';
  const excerptCount = document.getElementById('article-excerpt-counter');
  if (excerptCount) excerptCount.textContent = '0 words';

  userManuallyEditedSlug = false;
}

function calculateReadTimeFromContent(htmlContent) {
  const rawText = (htmlContent || '').replace(/<[^>]*>/g, ' ').trim();
  const words = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function updateContentMetrics() {
  const contentInput = document.getElementById('article-content-input');
  if (!contentInput) return;
  const rawText = contentInput.value.replace(/<[^>]*>/g, ' ').trim();
  const words = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const wordsEl = document.getElementById('article-content-words');
  if (wordsEl) wordsEl.textContent = `${words} words`;
  const timeStr = calculateReadTimeFromContent(contentInput.value);
  const timeEstEl = document.getElementById('article-content-time-est');
  if (timeEstEl) timeEstEl.textContent = `~${timeStr}`;

  const readInput = document.getElementById('article-readtime-input');
  if (readInput) readInput.value = timeStr;
}

function insertSnippetIntoContent(before, after = '') {
  const textarea = document.getElementById('article-content-input');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentVal = textarea.value;
  const selected = currentVal.substring(start, end);
  const replacement = before + (selected || '') + after;
  textarea.value = currentVal.substring(0, start) + replacement + currentVal.substring(end);
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + (selected || '').length;
  updateContentMetrics();
}

function autoWrapParagraphs() {
  const textarea = document.getElementById('article-content-input');
  if (!textarea || !textarea.value.trim()) return;
  const raw = textarea.value;
  const blocks = raw.split(/\n\s*\n/);
  const wrapped = blocks.map(b => {
    const trimmed = b.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<p') || trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<div')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  }).filter(Boolean).join('\n\n');
  textarea.value = wrapped;
  updateContentMetrics();
  showToast('Paragraphs auto-formatted with <p> tags.');
}

function initArticlesStudio() {
  // Initial load
  loadAndSyncArticles();

  // Hero File Upload
  const heroFileInput = document.getElementById('article-hero-file');
  const heroUrlInput = document.getElementById('article-hero-url');
  const previewImg = document.getElementById('article-preview-img');

  if (heroFileInput) {
    heroFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target.result;
        if (heroUrlInput) heroUrlInput.value = dataUrl;
        if (previewImg) previewImg.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  if (heroUrlInput) {
    heroUrlInput.addEventListener('input', () => {
      const val = heroUrlInput.value.trim();
      if (previewImg) previewImg.src = val || '/assets/hero-collection.webp';
    });
  }

  // Title input auto-slug
  const titleInput = document.getElementById('article-title-input');
  const slugInput = document.getElementById('article-slug-input');
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      const editSlug = document.getElementById('editing-article-slug')?.value;
      if (!editSlug && !userManuallyEditedSlug && slugInput) {
        slugInput.value = slugifyArticleTitle(titleInput.value);
      }
    });
  }
  if (slugInput) {
    slugInput.addEventListener('input', () => {
      userManuallyEditedSlug = true;
    });
  }

  // Excerpt word counter
  const excerptInput = document.getElementById('article-excerpt-input');
  if (excerptInput) {
    excerptInput.addEventListener('input', () => {
      const words = excerptInput.value.trim() ? excerptInput.value.trim().split(/\s+/).filter(Boolean).length : 0;
      const counter = document.getElementById('article-excerpt-counter');
      if (counter) counter.textContent = `${words} words`;
    });
  }

  // Content live metrics
  const contentInput = document.getElementById('article-content-input');
  if (contentInput) {
    contentInput.addEventListener('input', updateContentMetrics);
  }

  // Formatting Toolbar buttons
  document.querySelectorAll('.btn-art-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'lead') {
        insertSnippetIntoContent('<p class="article-lead">', '</p>');
      } else if (action === 'h3') {
        insertSnippetIntoContent('<h3>', '</h3>');
      } else if (action === 'qa') {
        insertSnippetIntoContent('<p><strong>The Pleasure Journal:</strong> Question here?</p>\n<p><strong>Speaker:</strong> Answer here.</p>\n');
      } else if (action === 'quote') {
        insertSnippetIntoContent('<blockquote class="article-quote">\n  &ldquo;', '&rdquo;\n</blockquote>');
      } else if (action === 'callout') {
        insertSnippetIntoContent('<div class="article-callout">\n  <span class="callout-badge">INSIGHT</span>\n  <p>', '</p>\n</div>');
      } else if (action === 'bold') {
        insertSnippetIntoContent('<strong>', '</strong>');
      } else if (action === 'italic') {
        insertSnippetIntoContent('<em>', '</em>');
      }
    });
  });

  // ================= PRODUCT LINK MODAL WORKFLOW =================
  let savedSelectionStart = 0;
  let savedSelectionEnd = 0;

  function populateProductLinkDropdown(filterQuery = '') {
    const select = document.getElementById('link-product-select');
    if (!select) return;
    const q = (filterQuery || '').trim().toLowerCase();

    const seenIds = new Set();
    const productList = [
      {
        id: 'rose-blossom',
        title: 'The Rose Sucker',
        priceStr: '₦25,000',
        url: '/products/rose-blossom.html'
      }
    ];
    seenIds.add('rose-blossom');

    if (Array.isArray(allInventoryProducts) && allInventoryProducts.length > 0) {
      allInventoryProducts.forEach(p => {
        if (!p || !p.id || seenIds.has(p.id)) return;
        seenIds.add(p.id);
        productList.push({
          id: p.id,
          title: p.title || p.id,
          priceStr: p.priceStr || (p.price ? '₦' + Number(p.price).toLocaleString() : ''),
          url: `/products/${encodeURIComponent(p.id)}.html`
        });
      });
    }

    const filtered = q
      ? productList.filter(p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      : productList;

    const countEl = document.getElementById('link-product-count');
    if (countEl) countEl.textContent = `${filtered.length} products`;

    if (filtered.length === 0) {
      select.innerHTML = '<option value="" disabled selected>No matching products found</option>';
      return;
    }

    select.innerHTML = filtered.map(p => `
      <option value="${escapeHtml(p.id)}" data-url="${escapeHtml(p.url)}" data-title="${escapeHtml(p.title)}">
        ${p.id === 'rose-blossom' ? '🌹 ' : ''}${escapeHtml(p.title)} ${p.priceStr ? '· ' + escapeHtml(p.priceStr) : ''}
      </option>
    `).join('');

    if (select.options.length > 0 && !select.options[0].disabled) {
      select.selectedIndex = 0;
      const cur = select.options[0];
      const urlInput = document.getElementById('link-product-url');
      if (urlInput) urlInput.value = cur.getAttribute('data-url') || '';
    }
  }

  function closeProductLinkModal() {
    const modal = document.getElementById('product-link-modal');
    if (modal) modal.style.display = 'none';
    if (typeof window.unlockBodyScroll === 'function') window.unlockBodyScroll();
  }

  const btnOpenProductModal = document.getElementById('btn-open-link-product-modal');
  if (btnOpenProductModal) {
    btnOpenProductModal.addEventListener('click', () => {
      const textarea = document.getElementById('article-content-input');
      savedSelectionStart = textarea ? textarea.selectionStart : 0;
      savedSelectionEnd = textarea ? textarea.selectionEnd : 0;

      const selectedText = (textarea && savedSelectionEnd > savedSelectionStart)
        ? textarea.value.substring(savedSelectionStart, savedSelectionEnd).trim()
        : '';

      const anchorInput = document.getElementById('link-product-anchor-text');
      if (anchorInput) {
        anchorInput.value = selectedText || 'Suction Rose';
      }

      const searchInput = document.getElementById('link-product-search');
      if (searchInput) searchInput.value = '';

      populateProductLinkDropdown();

      // If user highlighted text like "rose" or a specific product name, select it by default
      const select = document.getElementById('link-product-select');
      if (select && selectedText) {
        const lower = selectedText.toLowerCase();
        for (let i = 0; i < select.options.length; i++) {
          const opt = select.options[i];
          const optTitle = (opt.getAttribute('data-title') || '').toLowerCase();
          const optId = (opt.value || '').toLowerCase();
          if (optTitle.includes(lower) || lower.includes(optTitle) || optId.includes(lower)) {
            select.selectedIndex = i;
            const urlInput = document.getElementById('link-product-url');
            if (urlInput) urlInput.value = opt.getAttribute('data-url') || '';
            break;
          }
        }
      }

      const modal = document.getElementById('product-link-modal');
      if (modal) modal.style.display = 'flex';
      if (typeof window.lockBodyScroll === 'function') window.lockBodyScroll();

      if (anchorInput) {
        anchorInput.focus();
        anchorInput.select();
      }
    });
  }

  const linkSearch = document.getElementById('link-product-search');
  if (linkSearch) {
    linkSearch.addEventListener('input', () => {
      populateProductLinkDropdown(linkSearch.value);
    });
  }

  const linkSelect = document.getElementById('link-product-select');
  if (linkSelect) {
    linkSelect.addEventListener('change', () => {
      const sel = linkSelect.options[linkSelect.selectedIndex];
      if (!sel || sel.disabled) return;
      const url = sel.getAttribute('data-url');
      const title = sel.getAttribute('data-title');
      const urlInput = document.getElementById('link-product-url');
      if (urlInput && url) urlInput.value = url;

      const anchorInput = document.getElementById('link-product-anchor-text');
      if (anchorInput && !anchorInput.value.trim() && title) {
        anchorInput.value = title;
      }
    });
  }

  const btnApplyLink = document.getElementById('btn-apply-product-link');
  if (btnApplyLink) {
    btnApplyLink.addEventListener('click', () => {
      const anchorText = (document.getElementById('link-product-anchor-text')?.value || '').trim() || 'Product';
      const productUrl = (document.getElementById('link-product-url')?.value || '/products/rose-blossom.html').trim();
      const select = document.getElementById('link-product-select');
      const sel = select?.options[select.selectedIndex];
      const productTitle = sel?.getAttribute('data-title') || anchorText;

      const linkHtml = `<a href="${productUrl}" class="article-product-link" title="${escapeHtml(productTitle)}">${anchorText}<svg class="link-arrow-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`;

      const textarea = document.getElementById('article-content-input');
      if (textarea) {
        const curVal = textarea.value;
        const before = curVal.substring(0, savedSelectionStart);
        const after = curVal.substring(savedSelectionEnd);
        textarea.value = before + linkHtml + after;
        textarea.focus();
        textarea.selectionStart = before.length + linkHtml.length;
        textarea.selectionEnd = before.length + linkHtml.length;
        updateContentMetrics();
      }

      closeProductLinkModal();
      showToast(`✓ Linked "${anchorText}" to product.`);
    });
  }

  const btnCloseProductModal = document.getElementById('btn-close-product-link-modal');
  if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeProductLinkModal);

  const btnCancelProductModal = document.getElementById('btn-cancel-product-link');
  if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeProductLinkModal);

  const productLinkModal = document.getElementById('product-link-modal');
  if (productLinkModal) {
    productLinkModal.addEventListener('click', (e) => {
      if (e.target === productLinkModal) closeProductLinkModal();
    });
  }

  const btnFormatP = document.getElementById('btn-format-paragraphs');
  if (btnFormatP) {
    btnFormatP.addEventListener('click', autoWrapParagraphs);
  }

  // Accordion Toggles
  const headerToggle = document.getElementById('article-editor-header-toggle');
  if (headerToggle) {
    headerToggle.addEventListener('click', (e) => {
      if (e.target.closest('#btn-reset-article-form')) return;
      const form = document.getElementById('article-editor-form');
      const icon = document.getElementById('article-editor-toggle-icon');
      if (!form) return;
      const isHidden = form.style.display === 'none';
      form.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.textContent = isHidden ? '▲' : '▼';
    });
  }

  const seoToggle = document.getElementById('article-seo-toggle');
  if (seoToggle) {
    seoToggle.addEventListener('click', () => {
      const fields = document.getElementById('article-seo-fields');
      const icon = document.getElementById('article-seo-toggle-icon');
      if (!fields) return;
      const isHidden = fields.style.display === 'none';
      fields.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.textContent = isHidden ? '▲' : '▼';
    });
  }

  const btnShowWrite = document.getElementById('btn-show-write-article');
  if (btnShowWrite) {
    btnShowWrite.addEventListener('click', () => {
      resetArticleForm();
      const form = document.getElementById('article-editor-form');
      if (form) form.style.display = 'block';
      const icon = document.getElementById('article-editor-toggle-icon');
      if (icon) icon.textContent = '▲';
      const card = document.getElementById('article-editor-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const tInput = document.getElementById('article-title-input');
      if (tInput) tInput.focus();
    });
  }

  const btnReset = document.getElementById('btn-reset-article-form');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      resetArticleForm();
      showToast('Story form reset.');
    });
  }

  const btnCancel = document.getElementById('btn-cancel-article-edit');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      resetArticleForm();
      showToast('Editing cancelled.');
    });
  }

  const btnRefresh = document.getElementById('btn-refresh-articles');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      await loadAndSyncArticles();
      showToast('✓ Articles refreshed from Supabase.');
    });
  }

  // Filter Pills & Search
  const filterPills = document.querySelectorAll('.article-filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeArticlesFilter = pill.getAttribute('data-filter') || 'all';
      renderArticlesTable();
    });
  });

  const searchInput = document.getElementById('articles-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderArticlesTable();
    });
  }

  // Form Submit
  const articleForm = document.getElementById('article-editor-form');
  if (articleForm) {
    articleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('article-title-input')?.value || '').trim();
      const rawSlug = (document.getElementById('article-slug-input')?.value || '').trim();
      const slug = slugifyArticleTitle(rawSlug || title);
      const category = document.getElementById('article-category-input')?.value || 'Guides';
      const author = (document.getElementById('article-author-input')?.value || 'Real stories').trim();
      const date = (document.getElementById('article-date-input')?.value || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).trim();
      const heroImg = (document.getElementById('article-hero-url')?.value || '/assets/hero-collection.webp').trim();
      const imgAlt = (document.getElementById('article-img-alt')?.value || title).trim();
      const excerpt = (document.getElementById('article-excerpt-input')?.value || '').trim();
      const content = (document.getElementById('article-content-input')?.value || '').trim();
      const readTime = calculateReadTimeFromContent(content);
      const seoTitle = (document.getElementById('article-seo-title')?.value || `${title} · The Pleasure Journal | TheToysVirago`).trim();
      const metaDesc = (document.getElementById('article-meta-desc')?.value || excerpt).trim();
      const searchPhrase = (document.getElementById('article-search-phrase')?.value || '').trim();
      const relatedProductsRaw = (document.getElementById('article-related-products')?.value || '').trim();
      const relatedProducts = relatedProductsRaw ? relatedProductsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      if (!slug || !title || !content || !excerpt) {
        showToast('Please fill in Title, Slug, Excerpt and Article Content.');
        return;
      }

      const editingSlug = document.getElementById('editing-article-slug')?.value;
      const isEditing = Boolean(editingSlug);

      const articleObj = {
        slug,
        title,
        category,
        author,
        date,
        readTime,
        heroImg,
        imgAlt,
        excerpt,
        content,
        seoTitle,
        metaDesc,
        searchPhrase,
        relatedProducts,
        published: true,
        isCustom: true,
        updated_at: new Date().toISOString()
      };

      currentCustomArticles = getCustomArticles();
      const existingIdx = currentCustomArticles.findIndex(a => a.slug === (isEditing ? editingSlug : slug));
      if (existingIdx >= 0) {
        currentCustomArticles[existingIdx] = articleObj;
      } else {
        currentCustomArticles.unshift(articleObj);
      }
      saveCustomArticles(currentCustomArticles);

      let cloudResult = null;
      if (isSupabaseConfigured) {
        try {
          cloudResult = await upsertSupabaseArticle(articleObj);
        } catch (err) {
          console.warn('[Admin] Cloud article upload error:', err);
        }
      }

      await loadAndSyncArticles();
      resetArticleForm();

      if (cloudResult && cloudResult.success) {
        showToast('✓ Story published & synced to Supabase Cloud!');
      } else if (isSupabaseConfigured && cloudResult && !cloudResult.success) {
        showToast(`✓ Story saved locally. (Cloud sync notice: ${cloudResult.error || 'pending'})`);
      } else {
        showToast('✓ Story published to The Pleasure Journal!');
      }

      const invCard = document.getElementById('articles-table-body');
      if (invCard) {
        invCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Row actions delegation: Edit & Delete
  const tbody = document.getElementById('articles-table-body');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      // Edit
      const editBtn = e.target.closest('.btn-edit-article');
      if (editBtn) {
        const slug = editBtn.getAttribute('data-slug');
        const art = allArticles.find(a => a.slug === slug);
        if (!art) return;

        const editSlug = document.getElementById('editing-article-slug');
        if (editSlug) editSlug.value = art.slug;

        const titleInput = document.getElementById('article-title-input');
        if (titleInput) titleInput.value = art.title || '';
        const slugInput = document.getElementById('article-slug-input');
        if (slugInput) slugInput.value = art.slug || '';
        const catInput = document.getElementById('article-category-input');
        if (catInput) catInput.value = art.category || 'Guides';
        const authorInput = document.getElementById('article-author-input');
        if (authorInput) authorInput.value = art.author || 'Real stories';
        const dateInput = document.getElementById('article-date-input');
        if (dateInput) dateInput.value = art.date || '';
        const readInput = document.getElementById('article-readtime-input');
        if (readInput) readInput.value = calculateReadTimeFromContent(art.content || '');
        const heroUrlInput = document.getElementById('article-hero-url');
        if (heroUrlInput) heroUrlInput.value = art.heroImg || '';
        const previewImg = document.getElementById('article-preview-img');
        if (previewImg) previewImg.src = art.heroImg || '/assets/hero-collection.webp';
        const altInput = document.getElementById('article-img-alt');
        if (altInput) altInput.value = art.imgAlt || '';
        const excerptInput = document.getElementById('article-excerpt-input');
        if (excerptInput) {
          excerptInput.value = art.excerpt || '';
          const words = art.excerpt ? art.excerpt.split(/\s+/).filter(Boolean).length : 0;
          const counter = document.getElementById('article-excerpt-counter');
          if (counter) counter.textContent = `${words} words`;
        }
        const contentInput = document.getElementById('article-content-input');
        if (contentInput) {
          contentInput.value = art.content || '';
          updateContentMetrics();
        }
        const seoTitleInput = document.getElementById('article-seo-title');
        if (seoTitleInput) seoTitleInput.value = art.seoTitle || '';
        const metaDescInput = document.getElementById('article-meta-desc');
        if (metaDescInput) metaDescInput.value = art.metaDesc || '';
        const searchPhraseInput = document.getElementById('article-search-phrase');
        if (searchPhraseInput) searchPhraseInput.value = art.searchPhrase || '';
        const relInput = document.getElementById('article-related-products');
        if (relInput) {
          relInput.value = Array.isArray(art.relatedProducts) ? art.relatedProducts.join(', ') : (art.relatedProducts || '');
        }

        const banner = document.getElementById('article-editing-banner');
        if (banner) banner.style.display = 'flex';
        const editTitle = document.getElementById('article-editing-title');
        if (editTitle) editTitle.textContent = `Editing: "${art.title}"`;
        const pubBtnText = document.getElementById('btn-publish-article-text');
        if (pubBtnText) pubBtnText.textContent = 'Update Published Story';

        const form = document.getElementById('article-editor-form');
        if (form) form.style.display = 'block';
        const icon = document.getElementById('article-editor-toggle-icon');
        if (icon) icon.textContent = '▲';

        const card = document.getElementById('article-editor-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });

        userManuallyEditedSlug = true;
        return;
      }

      // Delete
      const deleteBtn = e.target.closest('.btn-delete-article');
      if (deleteBtn) {
        const slug = deleteBtn.getAttribute('data-slug');
        const art = allArticles.find(a => a.slug === slug);
        if (!art) return;

        const confirmed = window.confirm(`Are you sure you want to delete this story: "${art.title}"?`);
        if (!confirmed) return;

        currentCustomArticles = getCustomArticles().filter(a => a.slug !== slug);
        saveCustomArticles(currentCustomArticles);

        if (isSupabaseConfigured) {
          try {
            await deleteSupabaseArticle(slug);
          } catch (err) {
            console.warn('[Admin] Cloud article delete notice:', err);
          }
        }

        await loadAndSyncArticles();
        showToast('✓ Article deleted from Journal.');
      }
    });
  }

  // Copy SQL script
  const btnCopySql = document.getElementById('btn-copy-articles-sql');
  if (btnCopySql) {
    btnCopySql.addEventListener('click', () => {
      const sql = `-- TheToysVirago Articles Table Setup
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  category text default 'Guides',
  read_time text default '5 min read',
  date text,
  author text default 'Real stories',
  hero_img text,
  img_alt text,
  excerpt text,
  content text,
  seo_title text,
  meta_desc text,
  search_phrase text,
  related_products jsonb default '[]'::jsonb,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.articles enable row level security;
create policy "Allow public read of published articles" on public.articles for select using (true);
create policy "Allow all modifications with anon key" on public.articles for all using (true) with check (true);
`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql).then(() => {
          showToast('✓ Articles SQL table script copied to clipboard!');
        }).catch(() => {
          window.prompt('Copy Supabase SQL:', sql);
        });
      } else {
        window.prompt('Copy Supabase SQL:', sql);
      }
    });
  }
}


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
