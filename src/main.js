/**
 * ROUGE NOIR — Haute Intimité & Sensual Wellness
 * Core Interactive Experience Engine & PWA Controller
 */

// ================= 1. PWA & SERVICE WORKER SETUP =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('ServiceWorker registered with scope:', reg.scope))
      .catch((err) => console.log('ServiceWorker registration notice:', err));
  });
}

let deferredPrompt = null;
const pwaBanner = document.getElementById('pwa-install-banner');
const btnInstallPwa = document.getElementById('btn-install-pwa');
const btnDismissPwa = document.getElementById('btn-dismiss-pwa');
const btnDesktopInstall = document.getElementById('btn-desktop-install');
const pwaIosInstructions = document.getElementById('pwa-ios-instructions');

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Desktop Web: Show discreet navbar pill when browser supports PWA installation
function setupDesktopInstall() {
  if (btnDesktopInstall && deferredPrompt && !isStandalone) {
    btnDesktopInstall.removeAttribute('hidden');
    btnDesktopInstall.style.display = 'inline-flex';
  }
}

// Mobile Web: Show tailored mobile bottom sheet for eligible devices
function showMobilePwaPrompt() {
  if (isStandalone || !isMobile) return;
  if (pwaBanner && sessionStorage.getItem('pwa_mobile_dismissed') !== 'true') {
    pwaBanner.removeAttribute('hidden');
    pwaBanner.style.display = 'flex';
    if (isIos && pwaIosInstructions) {
      pwaIosInstructions.removeAttribute('hidden');
      pwaIosInstructions.style.display = 'flex';
    }
  }
}

function hideMobilePwaPrompt() {
  if (pwaBanner) {
    pwaBanner.setAttribute('hidden', '');
    pwaBanner.style.display = 'none';
  }
  sessionStorage.setItem('pwa_mobile_dismissed', 'true');
}

// Native PWA install event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (isMobile) {
    showMobilePwaPrompt();
  } else {
    setupDesktopInstall();
  }
});

// Mobile only: display after short browsing delay
if (isMobile && !isStandalone && sessionStorage.getItem('pwa_mobile_dismissed') !== 'true') {
  setTimeout(() => {
    showMobilePwaPrompt();
  }, 2500);
}

// Desktop navbar pill click
if (btnDesktopInstall) {
  btnDesktopInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Desktop PWA outcome:', outcome);
      deferredPrompt = null;
      btnDesktopInstall.style.display = 'none';
    }
  });
}

// Mobile banner install button click
if (btnInstallPwa) {
  btnInstallPwa.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Mobile PWA install outcome:', outcome);
      deferredPrompt = null;
      hideMobilePwaPrompt();
    } else if (isIos) {
      if (pwaIosInstructions) {
        pwaIosInstructions.removeAttribute('hidden');
        pwaIosInstructions.style.display = 'flex';
      }
    } else {
      alert('Tap your browser menu (⋮) and select "Add to Home screen".');
      hideMobilePwaPrompt();
    }
  });
}

if (btnDismissPwa) {
  btnDismissPwa.addEventListener('click', hideMobilePwaPrompt);
}

// General triggers (dropdown menu & footer)
document.querySelectorAll('.btn-install-trigger').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (isMobile) {
      if (pwaBanner) {
        pwaBanner.removeAttribute('hidden');
        pwaBanner.style.display = 'flex';
      }
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideMobilePwaPrompt();
      } else if (isIos && pwaIosInstructions) {
        pwaIosInstructions.removeAttribute('hidden');
        pwaIosInstructions.style.display = 'flex';
      }
    } else {
      // Desktop action
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (btnDesktopInstall) btnDesktopInstall.style.display = 'none';
      } else {
        alert('To install on desktop:\nLook for the "Install" or "App available" icon in your browser\'s address bar (top right).');
      }
    }
  });
});

// ================= 2. AGE VERIFICATION GATE =================
const ageGate = document.getElementById('age-gate');
const btnEnterGate = document.getElementById('btn-enter-gate');
const btnExitGate = document.getElementById('btn-exit-gate');
const resetAgeGate = document.getElementById('reset-age-gate');

const isAgeVerified = localStorage.getItem('thetoysvirago_age_verified') === 'true' || localStorage.getItem('rouge_age_verified') === 'true';

if (isAgeVerified) {
  document.documentElement.classList.add('age-gate-passed');
  if (ageGate) ageGate.style.display = 'none';
}

if (btnEnterGate) {
  btnEnterGate.addEventListener('click', () => {
    localStorage.setItem('thetoysvirago_age_verified', 'true');
    localStorage.setItem('rouge_age_verified', 'true');
    document.documentElement.classList.add('age-gate-passed');
    if (ageGate) {
      ageGate.classList.add('fade-out');
      setTimeout(() => {
        ageGate.style.display = 'none';
      }, 400);
    }
  });
}

if (btnExitGate) {
  btnExitGate.addEventListener('click', () => {
    window.location.replace('https://www.google.com');
  });
}

if (resetAgeGate) {
  resetAgeGate.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('thetoysvirago_age_verified');
    localStorage.removeItem('rouge_age_verified');
    document.documentElement.classList.remove('age-gate-passed');
    if (ageGate) {
      ageGate.classList.remove('fade-out');
      ageGate.style.display = 'flex';
    }
  });
}

// ================= 3. STEALTH SPREADSHEET SHIELD (BOSS KEY) =================
const stealthShield = document.getElementById('stealth-shield');
const appWrapper = document.getElementById('app-wrapper');
const btnExitStealth = document.getElementById('btn-exit-stealth');
const originalTitle = document.title;
const stealthTitle = "Q4_Enterprise_Logistics_Inventory_Audit_Consolidated.xlsx - Excel";

let isStealthActive = false;
if (stealthShield) {
  stealthShield.style.display = 'none';
}

function activateStealth() {
  isStealthActive = true;
  if (stealthShield) {
    stealthShield.removeAttribute('hidden');
    stealthShield.style.display = 'flex';
  }
  if (appWrapper) appWrapper.style.display = 'none';
  document.title = stealthTitle;
}

function deactivateStealth() {
  isStealthActive = false;
  if (stealthShield) {
    stealthShield.setAttribute('hidden', '');
    stealthShield.style.display = 'none';
  }
  if (appWrapper) appWrapper.style.display = 'block';
  document.title = originalTitle;
}

function toggleStealth() {
  if (isStealthActive) {
    deactivateStealth();
  } else {
    activateStealth();
  }
}

// Stealth Triggers
['stealth-btn-top', 'btn-stealth-nav', 'floating-stealth-btn', 'footer-stealth-trigger'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleStealth();
    });
  }
});

if (btnExitStealth) {
  btnExitStealth.addEventListener('click', deactivateStealth);
}

// Keyboard shortcuts (Escape key or Alt+S)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // If modal open, close modal first, else toggle stealth
    const openModals = document.querySelectorAll('.modal-overlay:not([hidden]), .drawer-overlay:not([hidden])');
    if (openModals.length > 0 && !isStealthActive) {
      openModals.forEach((m) => {
        m.setAttribute('hidden', '');
        m.style.display = 'none';
      });
    } else {
      toggleStealth();
    }
  } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    toggleStealth();
  }
});

// Mobile Double-Tap to Stealth
let lastTap = 0;
document.addEventListener('touchend', (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    // Check if the target is interactive (we don't want to trigger stealth if they're double-tapping a button)
    const isInteractive = e.target.closest('button, a, input, [role="button"], label, .color-dot, .size-pill');
    if (!isInteractive) {
      // Prevent default to stop zooming if needed, though touchend preventDefault might not stop it.
      e.preventDefault(); 
      toggleStealth();
    }
  }
  lastTap = currentTime;
});

// Nav Dropdown (Hamburger Menu)
const btnMobileMenu = document.getElementById('btn-mobile-menu');
const navDropdown = document.getElementById('nav-dropdown');
const navClosers = document.querySelectorAll('.nav-closer');

function collapseNavDropdown() {
  const navDrop = document.getElementById('nav-dropdown');
  if (navDrop) {
    navDrop.setAttribute('hidden', '');
    navDrop.hidden = true;
    navDrop.style.display = 'none';
  }
}

function expandNavDropdown() {
  const navDrop = document.getElementById('nav-dropdown');
  if (navDrop) {
    navDrop.removeAttribute('hidden');
    navDrop.hidden = false;
    navDrop.style.display = 'flex';
  }
}

if (btnMobileMenu && navDropdown) {
  btnMobileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = navDropdown.hidden || navDropdown.hasAttribute('hidden') || navDropdown.style.display === 'none';
    if (isClosed) {
      expandNavDropdown();
    } else {
      collapseNavDropdown();
    }
  });
}

if (navClosers) {
  navClosers.forEach(c => {
    c.addEventListener('click', () => {
      collapseNavDropdown();
    });
  });
}

// Close dropdown when clicking anywhere outside header
document.addEventListener('click', (e) => {
  const navDrop = document.getElementById('nav-dropdown');
  const btnMenu = document.getElementById('btn-mobile-menu');
  if (navDrop && !navDrop.hidden && navDrop.style.display !== 'none') {
    if (!navDrop.contains(e.target) && !btnMenu?.contains(e.target)) {
      collapseNavDropdown();
    }
  }
});



// ================= COLLECTION SHOWCASE SLIDER =================
const showcaseTrack = document.getElementById('showcase-slides-track');
const showcaseSlides = document.querySelectorAll('.showcase-slide');
const showcaseTabs = document.querySelectorAll('.showcase-tab');
const showcaseSegments = document.querySelectorAll('.showcase-segment');
const showcasePrev = document.getElementById('btn-showcase-prev');
const showcaseNext = document.getElementById('btn-showcase-next');
const showcaseCurrentIdx = document.getElementById('showcase-current-idx');
const showcaseWrap = document.getElementById('showcase-slider-wrap');

if (showcaseTrack && showcaseSlides.length > 0) {
  let currentSlide = 0;
  const totalSlides = showcaseSlides.length;
  let autoplayTimer = null;
  const slideDuration = 1600; // 1.6 seconds per slide (fast, vibrant rhythm)
  let isPaused = false;

  function updateSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Shift track
    showcaseTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Active slide class
    showcaseSlides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });

    // Update Tabs
    showcaseTabs.forEach((tab, i) => {
      const isActive = i === currentSlide;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update Counter
    if (showcaseCurrentIdx) {
      showcaseCurrentIdx.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    resetProgressBar();
  }

  function resetProgressBar() {
    showcaseSegments.forEach((seg, i) => {
      const fill = seg.querySelector('.segment-fill');
      if (!fill) return;

      if (i < currentSlide) {
        seg.classList.add('past');
        seg.classList.remove('active');
        fill.style.transition = 'none';
        fill.style.width = '100%';
      } else if (i === currentSlide) {
        seg.classList.remove('past');
        seg.classList.add('active');
        fill.style.transition = 'none';
        fill.style.width = '0%';
        void fill.offsetWidth; // Force reflow
        if (!isPaused) {
          fill.style.transition = `width ${slideDuration}ms linear`;
          fill.style.width = '100%';
        }
      } else {
        seg.classList.remove('past', 'active');
        fill.style.transition = 'none';
        fill.style.width = '0%';
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    isPaused = false;
    resetProgressBar();
    autoplayTimer = setTimeout(() => {
      updateSlide(currentSlide + 1);
      startAutoplay();
    }, slideDuration);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearTimeout(autoplayTimer);
    const activeSeg = showcaseSegments[currentSlide];
    if (activeSeg) {
      const fill = activeSeg.querySelector('.segment-fill');
      if (fill) {
        const computedWidth = window.getComputedStyle(fill).width;
        fill.style.transition = 'none';
        fill.style.width = computedWidth;
      }
    }
    isPaused = true;
  }

  // Next / Prev clicks
  if (showcaseNext) {
    showcaseNext.addEventListener('click', () => {
      updateSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  if (showcasePrev) {
    showcasePrev.addEventListener('click', () => {
      updateSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  // Tab clicks
  showcaseTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const slideIdx = parseInt(tab.dataset.slide, 10);
      updateSlide(slideIdx);
      startAutoplay();
    });
  });

  // Segment clicks
  showcaseSegments.forEach((seg) => {
    seg.addEventListener('click', () => {
      const slideIdx = parseInt(seg.dataset.slide, 10);
      updateSlide(slideIdx);
      startAutoplay();
    });
  });

  // Pause on hover
  if (showcaseWrap) {
    showcaseWrap.addEventListener('mouseenter', stopAutoplay);
    showcaseWrap.addEventListener('mouseleave', () => {
      startAutoplay();
    });

    // Touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    showcaseWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    showcaseWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          updateSlide(currentSlide + 1); // Swipe left -> next
        } else {
          updateSlide(currentSlide - 1); // Swipe right -> prev
        }
      }
      startAutoplay();
    }, { passive: true });
  }

  // Keyboard navigation when section is in viewport
  window.addEventListener('keydown', (e) => {
    const rect = showcaseWrap ? showcaseWrap.getBoundingClientRect() : null;
    if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowRight') {
        updateSlide(currentSlide + 1);
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        updateSlide(currentSlide - 1);
        startAutoplay();
      }
    }
  });

  // Initialize Showcase Slider
  updateSlide(0);
  startAutoplay();
}

// ================= 5. PRODUCT CATALOGUE & FILTERING =================
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

const searchInput = document.getElementById('product-search-input');
const searchClearBtn = document.getElementById('product-search-clear');
const searchNoResults = document.getElementById('search-no-results');
const searchCount = document.getElementById('search-count');
const btnResetSearch = document.getElementById('btn-reset-search');

const GENERAL_PRODUCT_TERMS = {
  'sculpted-dildo': 'dildo dildos dildoe contour shaft silicone suction base realistic cock sculpted toy sex toys rubber phallus penetration insertable',
  'rose-blossom': 'rose sucker clitoral suction air pulse mouth oral vibrator toy sex toys flower',
  'sceptre-wand': 'mini wand magic wand pocket vibrator deep rumble pocket massager vibe toy sex toys',
  'siren-app': 'siren flamingo app controlled wearable long distance vibrator remote bluetooth panty vibe toy sex toys',
  'lipstick-vibe': 'lipstick vibrator bullet vibe discreet stealth hidden pocket secret travel toy sex toys white',
  'midnight-silk-slip': 'lingerie silk slip dress nightdress nightie sleepwear chemise babydoll nightgown',
  'lace-noir-bodysuit': 'lingerie lace bodysuit teddy one piece undergarment atelier corset',
  'satin-kimono-robe': 'lingerie kimono robe silk nightgown loungewear wrap gown',
  'aura-elixir': 'lube lubricant serum oil damiana organic natural moisture wellness intimate',
  'velvet-glide-serum': 'lube lubricant water glide hybrid aloe moisture wellness zero stick',
  'sensory-warming-oil': 'lube warming oil massage oil edible elixir wellness ginger thermal',
  'velvet-restraint-kit': 'bdsm restraints handcuffs cuffs collar bondage fetish velvet padded',
  'sensory-blindfold-whip': 'bdsm blindfold mask feather tickler teaser sensory deprivation bondage fetish whip plume',
  'sensory-bundle-deluxe': 'bdsm bondage kit sensory suite bundle 5 piece cuffs restraints fetish collection'
};

function filterProducts() {
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  let visibleCount = 0;

  if (searchClearBtn) {
    searchClearBtn.style.display = query ? 'block' : 'none';
  }

  productCards.forEach((card) => {
    const cardCat = card.dataset.category || '';
    const cardId = card.dataset.id || '';
    const generalTerms = (GENERAL_PRODUCT_TERMS[cardId] || '').toLowerCase();
    const cardKeywords = (card.dataset.keywords || '').toLowerCase();
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const sku = (card.querySelector('.product-sku')?.textContent || '').toLowerCase();
    const line = (card.querySelector('.product-line')?.textContent || '').toLowerCase();
    const colors = Array.from(card.querySelectorAll('.color-dot')).map(d => (d.dataset.color || '').toLowerCase()).join(' ');

    const allSearchable = `${name} ${sku} ${line} ${cardKeywords} ${generalTerms} ${colors} ${cardCat}`;

    // If query is provided, check if it matches either the card's details or general product terms
    const matchesSearch = !query || allSearchable.includes(query);

    // When searching with a query, if the item matches the query we show it even if filtered,
    // otherwise respect category
    const matchesCat = (activeCategory === 'all' || cardCat === activeCategory || (query && matchesSearch));

    if (matchesSearch && matchesCat) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (searchNoResults) {
    if (visibleCount === 0) {
      searchNoResults.removeAttribute('hidden');
      searchNoResults.style.display = 'block';
      const noResultsQuery = document.getElementById('no-results-query');
      if (noResultsQuery) noResultsQuery.textContent = query || activeCategory;
    } else {
      searchNoResults.setAttribute('hidden', '');
      searchNoResults.style.display = 'none';
    }
  }

  if (searchCount) {
    searchCount.textContent = `Showing ${visibleCount} of ${productCards.length} products`;
  }
}

function applyProductFilter(category) {
  filterBtns.forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === category);
  });
  filterProducts();
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    applyProductFilter(btn.dataset.filter);
  });
});

if (searchInput) {
  searchInput.addEventListener('input', filterProducts);
}
if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterProducts();
    searchInput.focus();
  });
}
if (btnResetSearch) {
  btnResetSearch.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    applyProductFilter('all');
  });
}

// URL Query Parameter filter auto-activation
const urlParams = new URLSearchParams(window.location.search);
const initialFilter = urlParams.get('filter');
if (initialFilter && filterBtns.length > 0) {
  // Map aliases if needed (e.g., wellness -> lubes, accessories -> bdsm)
  let targetCategory = initialFilter;
  const matchBtn = Array.from(filterBtns).find(b => {
    const f = b.dataset.filter;
    return f === targetCategory ||
      (targetCategory === 'lubes' && (f === 'wellness' || f === 'lubes')) ||
      (targetCategory === 'wellness' && (f === 'wellness' || f === 'lubes')) ||
      (targetCategory === 'bdsm' && (f === 'accessories' || f === 'bdsm')) ||
      (targetCategory === 'accessories' && (f === 'accessories' || f === 'bdsm'));
  });

  if (matchBtn) {
    applyProductFilter(matchBtn.dataset.filter);
  }
}

// Interactive Finish / Color Dots
document.querySelectorAll('.color-selector, .color-row').forEach((selector) => {
  const dots = selector.querySelectorAll('.color-dot');
  const label = selector.querySelector('.selected-color-name, .color-name');

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      dots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (label && dot.dataset.color) {
        label.textContent = dot.dataset.color;
      }
    });
  });
});

// Interactive Size Pills on Product Cards
document.querySelectorAll('.product-card').forEach((card) => {
  const sizePills = card.querySelectorAll('.size-pill');
  const priceDisplay = card.querySelector('.product-price');
  const addBtn = card.querySelector('.btn-add-cart');
  const sizeLabel = card.querySelector('.color-name');

  sizePills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      sizePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const chosenSize = pill.dataset.size || pill.textContent.trim();

      // If size pill has a specific price (like dildo 6" vs 7")
      if (pill.dataset.price) {
        const newPrice = parseInt(pill.dataset.price, 10);
        const newPriceStr = pill.dataset.pricestr;
        if (priceDisplay && newPriceStr) {
          priceDisplay.textContent = newPriceStr;
        }
        if (addBtn) {
          addBtn.dataset.price = newPrice;
          const rawTitle = addBtn.dataset.title;
          const baseTitle = rawTitle.replace(/\s*\(\d+["']?\)/, '');
          addBtn.dataset.title = `${baseTitle} (${chosenSize})`;
        }
      } else {
        // Lingerie or bottle size
        if (addBtn) {
          addBtn.dataset.selectedSize = chosenSize;
        }
      }

      // Update card size text label if present and card has no color dots
      if (sizeLabel && !card.querySelector('.color-dot')) {
        sizeLabel.textContent = chosenSize.startsWith('Size') ? chosenSize : `Size: ${chosenSize}`;
      }
    });
  });
});

// ================= 6. PRODUCT QUICK VIEW MODAL =================
const quickviewModal = document.getElementById('quickview-modal');
if (quickviewModal) quickviewModal.style.display = 'none';
const btnCloseModal = document.getElementById('btn-close-modal');
const qvImg = document.getElementById('qv-img');
const qvVideo = document.getElementById('qv-video');
const qvThumbs = document.getElementById('qv-thumbs');
const qvBadge = document.getElementById('qv-badge');
const qvTitle = document.getElementById('qv-title');
const qvPrice = document.getElementById('qv-price');
const qvDesc = document.getElementById('qv-desc');
const qvMaterial = document.getElementById('qv-material');
const qvAcoustics = document.getElementById('qv-acoustics');
const qvBtnAdd = document.getElementById('qv-btn-add');
let currentQvProduct = null;

const PRODUCT_DATABASE = {
  'obsidian-arc': {
    id: 'obsidian-arc',
    title: 'The Obsidian Arc',
    badge: 'FLAGSHIP EDITION • DUAL MOTOR',
    price: 148000,
    priceStr: '₦148,000',
    img: '/assets/hero-device.jpg',
    desc: 'Precision engineered with dual harmonic vibration engines. Calibrated for 28Hz sub-bass waves that penetrate deeply without surface numbing. Velvet-touch liquid silicone body.',
    material: 'Double-Cured Medical Liquid Silicone & Ruby Chrome Alloy',
    acoustics: '< 28 dB (Sub-Whisper Level at Peak Power)',
    freq: 28,
    pattern: 'throb'
  },
  'rose-blossom': {
    id: 'rose-blossom',
    title: 'The Rose Sucker',
    badge: 'BESTSELLER • AIR-PULSE SUCTION',
    price: 25000,
    priceStr: '₦25,000',
    img: '/assets/product-rose.jpg',
    media: [
      { type: 'image', src: '/assets/product-rose.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/rose-sucker-colors.jpg', label: 'Colorways & USB' },
      { type: 'image', src: '/assets/rose-sucker-box.jpg', label: 'Collector Vault' },
      { type: 'image', src: '/assets/rose-sucker-glow.jpg', label: 'Night Glow Edition' },
      { type: 'video', src: '/assets/rose-sucker-demo.mp4', thumb: '/assets/product-rose.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Sculpted like an innocent blooming rose, engineered like an absolute powerhouse. Uses gentle aerodynamic air-wave pulses to stimulate without direct friction, taking you from a teasing flutter to an undeniable crescendo in minutes.',
    material: '100% Medical-Grade Liquid Silicone',
    acoustics: '< 30 dB (Whisper Silent)',
    freq: 72,
    pattern: 'surge'
  },
  'sceptre-wand': {
    id: 'sceptre-wand',
    title: 'The Mini Wand',
    badge: 'DEEP RUMBLE • POCKET MASSAGER',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/product-wand.jpg',
    media: [
      { type: 'image', src: '/assets/product-wand.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/mini-wand-colors.jpg', label: 'All 4 Colors' },
      { type: 'image', src: '/assets/mini-wand-hand.jpg', label: 'In-Hand Scale' },
      { type: 'video', src: '/assets/mini-wand-demo.mp4', thumb: '/assets/product-wand.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Don’t let the compact silhouette fool you. The Mini Wand packs full-sized, bone-deep vibrations into a palm-sized frame with a 360° flexible silicone head. Perfect for pinpoint clitoral stimulation, all-over tension relief, or slipping into an overnight bag.',
    material: 'Silky Medical-Grade Silicone & Textured Wave Grip',
    acoustics: '< 30 dB (Subtle & Discreet)',
    freq: 85,
    pattern: 'continuous'
  },
  'siren-app': {
    id: 'siren-app',
    title: 'Siren App-Controlled',
    badge: 'APP CONNECT • LONG DISTANCE',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/siren-app.jpg',
    media: [
      { type: 'image', src: '/assets/siren-app.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/siren-app-red.jpg', label: 'Red' },
      { type: 'image', src: '/assets/siren-app-white.jpg', label: 'White' },
      { type: 'video', src: '/assets/siren-app-demo.mp4', thumb: '/assets/siren-app.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Long distance? What distance? Discreet, whisper-quiet, and ergonomically curved to slip seamlessly into your panties. Hand full control over to your partner from across the room or across the globe via smartphone app—or surrender to customized rhythm playlists and music vibration modes.',
    material: 'Silky Medical-Grade Liquid Silicone & Flexible Ergonomic Tail',
    acoustics: '< 30 dB (Discreet in Public)',
    freq: 95,
    pattern: 'bluetooth'
  },
  'lipstick-vibe': {
    id: 'lipstick-vibe',
    title: 'The Lipstick Vibrator',
    badge: 'RECHARGEABLE • STEALTH LUXE',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lipstick-vibe.jpg',
    media: [
      { type: 'image', src: '/assets/lipstick-vibe.jpg', label: 'White' },
      { type: 'image', src: '/assets/lipstick-hand.jpg', label: 'White (In-Hand)' },
      { type: 'video', src: '/assets/lipstick-demo.mp4', thumb: '/assets/lipstick-vibe.jpg', label: 'Live Video Demo' }
    ],
    desc: 'The ultimate embarrassment-proof secret. Disguised in plain sight as a chic white and gold designer lipstick. Toss it into your handbag, cosmetic pouch, or desk drawer without fear—nobody will ever look twice. Features a velvet-soft angled silicone bullet, multiple whisper-quiet vibration speeds, and convenient USB recharging.',
    material: 'Medical-Grade Soft Silicone & Electroplated Gold Alloy',
    acoustics: '< 25 dB (Total Stealth & Discretion)',
    freq: 78,
    pattern: 'stealth'
  },
  'sculpted-dildo': {
    id: 'sculpted-dildo',
    title: 'The Contour Shaft',
    badge: 'DUAL SIZE • SUCTION BASE',
    price: 15000,
    priceStr: '₦15,000 (6") • ₦17,000 (7")',
    img: '/assets/dildo-trio.jpg',
    media: [
      { type: 'image', src: '/assets/dildo-trio.jpg', label: 'All 3 Colors' },
      { type: 'image', src: '/assets/dildo-tan.jpg', label: 'Tan' },
      { type: 'image', src: '/assets/dildo-bronze.jpg', label: 'Brown' },
      { type: 'image', src: '/assets/dildo-noir.jpg', label: 'Black' }
    ],
    desc: 'Anatomically sculpted with a lifelike contoured shaft, raised head, and heavy-duty hands-free suction base that mounts firmly to shower tiles, mirrors, and flat surfaces. Fully harness-ready and crafted from velvety, body-safe material. Choose between 6" (₦15,000) and 7" (₦17,000) in three rich skin tones.',
    material: 'Ultra-Pure Medical PVC & Body-Safe Silicone with Suction Base',
    acoustics: '100% Waterproof & Harness Compatible',
    freq: 0,
    pattern: 'manual'
  },
  'aura-elixir': {
    id: 'aura-elixir',
    title: 'Aura Intimate Elixir',
    badge: 'APOTHECARY • 100% ORGANIC',
    price: 52000,
    priceStr: '₦52,000',
    img: '/assets/product-serum.jpg',
    desc: 'Botanical hybrid nectar infused with wild Mexican damiana, calming ashwagandha, and multi-weight hyaluronic moisture. Silicone-safe, body-identical pH 3.9.',
    material: 'Frosted Obsidian Glass Flacon with Ruby Wax Seal',
    acoustics: '100% Natural Organic Botanicals',
    freq: 42,
    pattern: 'whisper'
  },
  'midnight-silk-slip': {
    id: 'midnight-silk-slip',
    title: 'Midnight Mulberry Silk Slip',
    badge: 'ATELIER • 100% SILK',
    price: 88000,
    priceStr: '₦88,000',
    img: '/assets/category-lingerie.jpg',
    desc: 'Crafted from 22-momme pure mulberry silk with fine French eyelash lace trim. Bias cut to drape liquid-like over your silhouette.',
    material: '100% Grade 6A Mulberry Silk & French Floral Lace',
    acoustics: 'Handcrafted Atelier Finish',
    freq: 0,
    pattern: 'silk'
  },
  'lace-noir-bodysuit': {
    id: 'lace-noir-bodysuit',
    title: 'Noir Floral Lace Bodysuit',
    badge: 'DELICATE • SHEER',
    price: 74000,
    priceStr: '₦74,000',
    img: '/assets/category-lingerie.jpg',
    desc: 'Architectural floral lace bodysuit with plunging neckline and gentle underwire support. Magnetic quick-release closure.',
    material: 'High-Tensile Sheer Lace & Velvet Trims',
    acoustics: 'Contoured Fit (XS - 3XL)',
    freq: 0,
    pattern: 'lace'
  },
  'satin-kimono-robe': {
    id: 'satin-kimono-robe',
    title: 'Obsidian Silk Kimono Robe',
    badge: 'LOUNGEWEAR • SIGNATURE',
    price: 96000,
    priceStr: '₦96,000',
    img: '/assets/category-lingerie.jpg',
    desc: 'Floor-length pure mulberry silk robe with wide kimono sleeves and velvet tie belt. The epitome of effortless post-pleasure luxury.',
    material: '100% Pure Mulberry Silk (19 Momme)',
    acoustics: 'Weightless Cloud Feel',
    freq: 0,
    pattern: 'silk'
  },
  'velvet-glide-serum': {
    id: 'velvet-glide-serum',
    title: 'Velvet Water-Hybrid Glide',
    badge: 'WATER-HYBRID • ZERO STICK',
    price: 38000,
    priceStr: '₦38,000',
    img: '/assets/product-serum.jpg',
    desc: 'Hybrid water and plant-cellulose formulation offering the endless cushion of silicone with the effortless rinse of pure water.',
    material: 'Organic Aloe & Plant Cellulose',
    acoustics: 'Condom & Toy Compatible',
    freq: 0,
    pattern: 'glide'
  },
  'sensory-warming-oil': {
    id: 'sensory-warming-oil',
    title: 'Sensory Botanical Warming Elixir',
    badge: 'THERMAL ACTIVATION • AROMA',
    price: 46000,
    priceStr: '₦46,000',
    img: '/assets/product-serum.jpg',
    desc: 'Gently warms upon breath and skin contact to heighten nerve ending sensitivity. Subtle natural vanilla and cedarwood aroma.',
    material: 'Cold-Pressed Jojoba & Warming Ginger Extract',
    acoustics: '100% Edible & Natural',
    freq: 0,
    pattern: 'warm'
  },
  'velvet-restraint-kit': {
    id: 'velvet-restraint-kit',
    title: 'Crimson Velvet Cuffs & Collar',
    badge: 'SENSORY • PADDED RESTRAINT',
    price: 68000,
    priceStr: '₦68,000',
    img: '/assets/category-bdsm.jpg',
    desc: 'Plush crimson velvet wrist cuffs and matching choker collar lined with memory-foam padding. Quick-release swivel clasps for ultimate peace of mind.',
    material: 'Italian Cotton Velvet & Heavy Plated Gold Hardware',
    acoustics: 'Safety Quick-Release Swivels',
    freq: 0,
    pattern: 'restraint'
  },
  'sensory-blindfold-whip': {
    id: 'sensory-blindfold-whip',
    title: 'Silk Blackout Mask & Feather Tickler',
    badge: 'DUAL SENSORY • EXPLORATION',
    price: 42000,
    priceStr: '₦42,000',
    img: '/assets/category-bdsm.jpg',
    desc: 'Double-padded 100% mulberry silk blackout blindfold paired with a cruelty-free goose-feather teaser. Heightens every single touch.',
    material: 'Pure Mulberry Silk & Natural Ostrich Plume',
    acoustics: 'Complete Blackout Sensory Deprivation',
    freq: 0,
    pattern: 'sensory'
  },
  'sensory-bundle-deluxe': {
    id: 'sensory-bundle-deluxe',
    title: 'The Sovereign Sensory Suite',
    badge: 'COLLECTOR EDITION • COMPLETE',
    price: 125000,
    priceStr: '₦125,000',
    img: '/assets/category-bdsm.jpg',
    desc: 'The complete 5-piece luxury kit: velvet cuffs, ankle ties, silk blindfold, feather teaser, and velvet travel pouch.',
    material: 'Plush Velvet, Silk, and Anodized Alloy Clasps',
    acoustics: 'Delivered in Discreet Storage Case',
    freq: 0,
    pattern: 'complete'
  }
};

document.querySelectorAll('.btn-quick-view').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodKey = btn.dataset.product;
    const prod = PRODUCT_DATABASE[prodKey];
    if (prod && quickviewModal) {
      currentQvProduct = prod;

      // Reset media display
      if (qvVideo) {
        qvVideo.pause();
        qvVideo.style.display = 'none';
      }
      if (qvImg) {
        qvImg.style.display = 'block';
        qvImg.src = prod.img;
      }

      // Populate media thumbnails
      if (qvThumbs) {
        qvThumbs.innerHTML = '';
        if (prod.media && prod.media.length > 1) {
          qvThumbs.removeAttribute('hidden');
          qvThumbs.style.display = 'flex';
          prod.media.forEach((item, idx) => {
            const thumbBtn = document.createElement('button');
            thumbBtn.className = `qv-thumb ${idx === 0 ? 'active' : ''}`;
            thumbBtn.type = 'button';
            thumbBtn.setAttribute('aria-label', item.label || `Media ${idx + 1}`);

            if (item.type === 'video') {
              thumbBtn.innerHTML = `
                <img src="${item.thumb || prod.img}" alt="${item.label}" />
                <span class="qv-thumb-video-icon">▶</span>
              `;
            } else {
              thumbBtn.innerHTML = `<img src="${item.src}" alt="${item.label}" />`;
            }

            thumbBtn.addEventListener('click', () => {
              qvThumbs.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
              thumbBtn.classList.add('active');

              if (item.type === 'video') {
                if (qvImg) qvImg.style.display = 'none';
                if (qvVideo) {
                  qvVideo.style.display = 'block';
                  qvVideo.muted = true;
                  qvVideo.setAttribute('muted', '');
                  qvVideo.setAttribute('playsinline', '');
                  const source = document.getElementById('qv-video-src');
                  if (source) {
                    source.src = item.src;
                  }
                  qvVideo.src = item.src;
                  qvVideo.load();
                  const p = qvVideo.play();
                  if (p !== undefined) {
                    p.catch(err => {
                      console.log('Video autoplay deferred, controls available:', err);
                    });
                  }
                }
              } else {
                if (qvVideo) {
                  qvVideo.pause();
                  qvVideo.style.display = 'none';
                }
                if (qvImg) {
                  qvImg.style.display = 'block';
                  qvImg.src = item.src;
                }
              }
            });

            qvThumbs.appendChild(thumbBtn);
          });
        } else {
          qvThumbs.setAttribute('hidden', '');
          qvThumbs.style.display = 'none';
        }
      }

      if (qvBadge) qvBadge.textContent = prod.badge;
      if (qvTitle) qvTitle.textContent = prod.title;
      if (qvPrice) qvPrice.textContent = prod.priceStr;
      if (qvDesc) qvDesc.textContent = prod.desc;
      if (qvMaterial) qvMaterial.textContent = prod.material;
      if (qvAcoustics) qvAcoustics.textContent = prod.acoustics;

      quickviewModal.removeAttribute('hidden');
      quickviewModal.style.display = 'flex';
    }
  });
});

function closeQuickviewModal() {
  if (qvVideo) {
    qvVideo.pause();
  }
  if (quickviewModal) {
    quickviewModal.setAttribute('hidden', '');
    quickviewModal.style.display = 'none';
  }
}

const qvBtnClose = document.getElementById('qv-btn-close');
if (btnCloseModal) {
  btnCloseModal.addEventListener('click', closeQuickviewModal);
}
if (qvBtnClose) {
  qvBtnClose.addEventListener('click', closeQuickviewModal);
}

document.querySelectorAll('#quickview-modal .btn-close-modal, #quickview-modal #qv-btn-close').forEach((btn) => {
  btn.addEventListener('click', closeQuickviewModal);
});

if (quickviewModal) {
  quickviewModal.addEventListener('click', (e) => {
    if (e.target === quickviewModal) {
      closeQuickviewModal();
    }
  });
}

if (qvBtnAdd) {
  qvBtnAdd.addEventListener('click', () => {
    if (currentQvProduct) {
      addToCart({
        id: currentQvProduct.id,
        title: currentQvProduct.title,
        price: currentQvProduct.price,
        img: currentQvProduct.img
      });
      quickviewModal.hidden = true;
    }
  });
}


// ================= 7. DISCREET CART & DRAWER SYSTEM =================
let cart = JSON.parse(localStorage.getItem('rouge_noir_cart') || '[]');
let discountPercent = 0;

const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
if (cartDrawerOverlay) cartDrawerOverlay.style.display = 'none';
const btnCartDropdown = document.getElementById('btn-cart-dropdown');
const btnCloseCart = document.getElementById('btn-close-cart');
const cartCounter = document.getElementById('cart-counter');
const drawerItemsList = document.getElementById('drawer-items');
const drawerItemsCount = document.getElementById('drawer-items-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDiscountRow = document.getElementById('cart-discount-row');
const cartDiscount = document.getElementById('cart-discount');
const cartTotal = document.getElementById('cart-total');
const cartTotalPeek = document.getElementById('cart-total-peek');
const meterFill = document.getElementById('meter-fill');
const shippingMeterText = document.getElementById('shipping-meter-text');

const promoInput = document.getElementById('promo-input');
const btnApplyPromo = document.getElementById('btn-apply-promo');
const promoFeedback = document.getElementById('promo-feedback');

const FREE_SHIPPING_THRESHOLD = 50000;

function saveCart() {
  localStorage.setItem('rouge_noir_cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      img: product.img,
      finish: product.finish || 'Obsidian Noir',
      qty: 1
    });
  }
  saveCart();
  showToast(`Added ${product.title} to discreet bag.`);
  openCartDrawer();
}

function updateItemQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    saveCart();
  }
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  showToast('Item removed from discreet bag.');
}

function openCartDrawer() {
  collapseNavDropdown();
  if (cartDrawerOverlay) {
    cartDrawerOverlay.removeAttribute('hidden');
    cartDrawerOverlay.style.display = 'flex';
  }
  const bagPill = document.getElementById('btn-header-bag');
  if (bagPill) bagPill.classList.add('active');
}

function closeCartDrawer() {
  if (cartDrawerOverlay) {
    cartDrawerOverlay.setAttribute('hidden', '');
    cartDrawerOverlay.style.display = 'none';
  }
  const bagPill = document.getElementById('btn-header-bag');
  if (bagPill) bagPill.classList.remove('active');
}

if (btnCartDropdown) btnCartDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
  collapseNavDropdown();
  openCartDrawer();
});
const btnHeaderBag = document.getElementById('btn-header-bag');
if (btnHeaderBag) btnHeaderBag.addEventListener('click', openCartDrawer);
if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
if (cartDrawerOverlay) {
  cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === cartDrawerOverlay) closeCartDrawer();
  });
}

// Collapsible Cart Details Toggle
const btnToggleCartDetails = document.getElementById('btn-toggle-cart-details');
const cartCollapsibleDetails = document.getElementById('cart-collapsible-details');

if (btnToggleCartDetails && cartCollapsibleDetails) {
  btnToggleCartDetails.addEventListener('click', () => {
    const isExpanded = btnToggleCartDetails.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      btnToggleCartDetails.setAttribute('aria-expanded', 'false');
      cartCollapsibleDetails.classList.remove('is-expanded');
      const hint = btnToggleCartDetails.querySelector('.collapse-toggle-hint');
      if (hint) hint.textContent = 'Tap to view';
    } else {
      btnToggleCartDetails.setAttribute('aria-expanded', 'true');
      cartCollapsibleDetails.classList.add('is-expanded');
      const hint = btnToggleCartDetails.querySelector('.collapse-toggle-hint');
      if (hint) hint.textContent = 'Tap to hide';
    }
  });
}

// Add to Cart from collection buttons
document.querySelectorAll('.btn-add-cart').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.id;
    let title = btn.dataset.title;
    const price = parseFloat(btn.dataset.price);
    const img = btn.dataset.img;

    const card = btn.closest('.product-card');
    const activeColor = card?.querySelector('.color-dot.active')?.dataset.color;
    const activeSize = card?.querySelector('.size-pill.active')?.dataset.size || card?.querySelector('.size-pill.active')?.textContent.trim();

    let finish = 'Standard';
    if (activeColor && activeSize) {
      finish = `${activeColor} · Size ${activeSize}`;
    } else if (activeSize) {
      finish = `Size ${activeSize}`;
    } else if (activeColor) {
      finish = activeColor;
    }

    addToCart({ id, title, price, img, finish });
  });
});

// Render Cart
function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cart-counter, #header-cart-counter, .cart-counter').forEach(el => {
    el.textContent = totalItems;
  });
  if (drawerItemsCount) drawerItemsCount.textContent = `(${totalItems} item${totalItems === 1 ? '' : 's'})`;

  if (!drawerItemsList) return;

  if (cart.length === 0) {
    drawerItemsList.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-bag-icon">🖤</div>
        <p class="empty-text">Your discreet bag is currently empty.</p>
        <a href="#collection" class="btn btn-ruby btn-sm" onclick="document.getElementById('cart-drawer-overlay').hidden = true;">Explore Collection</a>
      </div>
    `;
    if (meterFill) meterFill.style.width = '0%';
    if (shippingMeterText) shippingMeterText.textContent = `Add ₦${FREE_SHIPPING_THRESHOLD.toLocaleString()} for FREE Express Discreet Delivery`;
    if (cartSubtotal) cartSubtotal.textContent = '₦0';
    if (cartTotal) cartTotal.textContent = '₦0';
    if (cartTotalPeek) cartTotalPeek.textContent = '₦0';
    if (cartDiscountRow) cartDiscountRow.hidden = true;
    return;
  }

  // Populate Items
  drawerItemsList.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.title}</h4>
        <span style="font-size: 11px; color: var(--text-dim);">${item.finish}</span>
        <div class="cart-item-price">₦${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item-ctrls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.id}', 1)">+</button>
          </div>
          <button class="btn-remove-item" onclick="window.cartRemove('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  if (cartSubtotal) cartSubtotal.textContent = `₦${rawSubtotal.toLocaleString()}`;

  if (discountPercent > 0 && cartDiscountRow && cartDiscount) {
    cartDiscountRow.hidden = false;
    cartDiscount.textContent = `-₦${discountAmount.toLocaleString()}`;
  } else if (cartDiscountRow) {
    cartDiscountRow.hidden = true;
  }

  if (cartTotal) cartTotal.textContent = `₦${finalTotal.toLocaleString()}`;
  if (cartTotalPeek) cartTotalPeek.textContent = `₦${finalTotal.toLocaleString()}`;

  // Free shipping meter
  const progress = Math.min(100, (rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  if (meterFill) meterFill.style.width = `${progress}%`;

  if (shippingMeterText) {
    if (rawSubtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingMeterText.innerHTML = `✓ You have unlocked <strong>FREE Express Discreet Shipping</strong>`;
    } else {
      const remaining = (FREE_SHIPPING_THRESHOLD - rawSubtotal).toLocaleString();
      shippingMeterText.innerHTML = `Add <strong>₦${remaining}</strong> for FREE Express Discreet Delivery`;
    }
  }
}

// Global window helpers for inline onclick in cart HTML
window.cartUpdateQty = updateItemQty;
window.cartRemove = removeItem;

// Promo Code
if (btnApplyPromo && promoInput) {
  btnApplyPromo.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === 'VIRAGO15') {
      discountPercent = 15;
      if (promoFeedback) {
        promoFeedback.hidden = false;
        promoFeedback.textContent = '✓ 15% VIP discount applied.';
        promoFeedback.style.color = '#4ade80';
      }
      renderCart();
      showToast('15% VIP discount applied.');
    } else {
      if (promoFeedback) {
        promoFeedback.hidden = false;
        promoFeedback.textContent = 'Invalid promo code. Try VIRAGO15.';
        promoFeedback.style.color = '#c0112f';
      }
    }
  });
}


// ================= 8. SIMULATED CHECKOUT MODAL =================
const checkoutModal = document.getElementById('checkout-modal');
if (checkoutModal) checkoutModal.style.display = 'none';
const btnCheckout = document.getElementById('btn-checkout');
const btnCloseCheckout = document.getElementById('btn-close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutSuccess = document.getElementById('checkout-success');
const coSubtotal = document.getElementById('co-subtotal');
const coTotal = document.getElementById('co-total');
const btnDoneOrder = document.getElementById('btn-done-order');

if (btnCheckout) {
  btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your bag is currently empty.');
      return;
    }
    closeCartDrawer();
    const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = rawSubtotal * (discountPercent / 100);
    const finalTotal = Math.max(0, rawSubtotal - discountAmount);

    if (coSubtotal) coSubtotal.textContent = `₦${rawSubtotal.toLocaleString()}`;
    if (coTotal) coTotal.textContent = `₦${finalTotal.toLocaleString()}`;

    if (checkoutModal) {
      checkoutModal.removeAttribute('hidden');
      checkoutModal.style.display = 'flex';
      if (checkoutForm) checkoutForm.hidden = false;
      if (checkoutSuccess) checkoutSuccess.hidden = true;
    }
  });
}

if (btnCloseCheckout && checkoutModal) {
  btnCloseCheckout.addEventListener('click', () => {
    checkoutModal.setAttribute('hidden', '');
    checkoutModal.style.display = 'none';
  });
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.setAttribute('hidden', '');
      checkoutModal.style.display = 'none';
    }
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-order');
    if (btnSubmit) {
      btnSubmit.innerHTML = '<span>Encrypting &amp; Confirming...</span>';
      btnSubmit.disabled = true;
    }

    setTimeout(() => {
      if (checkoutForm) checkoutForm.hidden = true;
      if (checkoutSuccess) {
        checkoutSuccess.hidden = false;
        const refId = `RN-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const refEl = document.getElementById('order-ref');
        if (refEl) refEl.textContent = refId;
      }
      // Reset cart
      cart = [];
      discountPercent = 0;
      saveCart();
    }, 1200);
  });
}

if (btnDoneOrder && checkoutModal) {
  btnDoneOrder.addEventListener('click', () => {
    checkoutModal.hidden = true;
  });
}


// ================= 9. TOAST NOTIFICATION UTILITY =================
let toastTimeout = null;
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

function showToast(msg) {
  if (!toast || !toastMessage) return;
  toastMessage.textContent = msg;
  toast.hidden = false;

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

// Initial render
renderCart();
