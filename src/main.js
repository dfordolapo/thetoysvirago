import { getSupabaseProducts, recordSupabaseConfession, getSupabaseConfessions } from './supabase.js';

/**
 * ROUGE NOIR - Haute Intimité & Sensual Wellness
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
  'pulsating-rose': 'pulsating rose sucker licker suction air pulse mouth oral tongue vibrator toy sex toys flower duo',
  'sceptre-wand': 'mini wand magic wand pocket vibrator deep rumble pocket massager vibe toy sex toys',
  'siren-app': 'siren flamingo app controlled wearable long distance vibrator remote bluetooth panty vibe toy sex toys red white',
  'lipstick-vibe': 'lipstick vibrator bullet vibe discreet stealth hidden pocket secret travel toy sex toys white',
  'thrusting-dildo': 'thrusting dildo dildos remote controlled wireless automatic motorized reciprocating shaft suction base sex toys vibe black tan brown chocolate bronze flesh',
  'sucking-rabbit': 'sucking rabbit vibrator rabbit vibe clitoral suction air pulse dual stimulation g spot toys sex toys pink fuchsia dual motor',
  'non-vibrating-plugs': 'non vibrating plugs anal plug butt plug jeweled silicone chrome metal contour small medium large toy sex toys flared base chest crystal',
  'rabbit-cock-ring': 'rabbit cock ring rechargeable vibrating ring penis ring stamina delay couples clitoral teaser sex toys black silicone',
  'creature-cock-ring': 'creature cock ring non vibrating stamina delay ring s-hande penis silicone toy sex toys',
  'pocket-bullet': 'bullet pocket vibe mini lipstick bullet vibrator pocket power 10 modes sex toys fuchsia black blush purple chrome',
  'contour-bullet-6inch': '6 inches bullet 6 inch bullet vibrator heart crown slim wand long vibe sex toys purple black fuchsia',
  'sleek-bullet-7inch': '7 inches bullet 7 inch bullet vibrator magnetic charger pin charger flat top slim wand long vibe sex toys metallic silver chrome gold',
  'rose-jump-egg': 'rose jump egg app controlled egg vibrator wireless bluetooth remote panty vibe kegel clit stimulator sex toys fuchsia pink',
  'african-brute': 'african brute herbal tincture tonic stamina endurance libido energy sex drive nafdac supplement wellness potion liquid oral aphrodisiac lube'
};

// ── CATALOG PAGINATION & TOUCH SWIPE LOGIC ──
let currentCatalogPage = 1;
const CATALOG_PAGE_SIZE = 6;
let currentMatchingCatalogCards = [];

function updateCatalogPage(page, smoothScroll = false) {
  const totalCards = currentMatchingCatalogCards.length;
  const totalPages = Math.ceil(totalCards / CATALOG_PAGE_SIZE) || 1;
  currentCatalogPage = Math.max(1, Math.min(page, totalPages));

  const startIdx = (currentCatalogPage - 1) * CATALOG_PAGE_SIZE;
  const endIdx = startIdx + CATALOG_PAGE_SIZE;

  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.classList.add('page-transitioning');
  }

  // Show only matching cards within the current page window
  currentMatchingCatalogCards.forEach((card, index) => {
    if (index >= startIdx && index < endIdx) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  setTimeout(() => {
    if (grid) grid.classList.remove('page-transitioning');
  }, 120);

  renderPaginationControls(totalPages, totalCards, startIdx, endIdx);

  if (smoothScroll && grid) {
    const rect = grid.getBoundingClientRect();
    if (rect.top < 0 || rect.top > 250) {
      const topOffset = window.pageYOffset + rect.top - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }
}

function renderPaginationControls(totalPages, totalCards, startIdx, endIdx) {
  const container = document.getElementById('products-pagination');
  const btnRow = document.getElementById('pagination-buttons-row');
  const infoEl = document.getElementById('pagination-info');
  if (!container || !btnRow) return;

  if (totalCards === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  const displayedEnd = Math.min(endIdx, totalCards);
  const displayedStart = totalCards > 0 ? startIdx + 1 : 0;
  if (infoEl) {
    infoEl.textContent = `Showing ${displayedStart}–${displayedEnd} of ${totalCards} products · Page ${currentCatalogPage} of ${totalPages}`;
  }

  if (totalPages <= 1) {
    btnRow.innerHTML = '';
    return;
  }

  let html = '';

  // Prev Button
  const prevDisabled = currentCatalogPage === 1 ? 'disabled' : '';
  html += `<button type="button" class="page-nav-btn" data-page="${currentCatalogPage - 1}" ${prevDisabled}>&larr; Prev</button>`;

  // Smart Page Numbers with Ellipses
  const pagesToShow = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentCatalogPage - 1 && i <= currentCatalogPage + 1)) {
      pagesToShow.push(i);
    }
  }

  let lastP = 0;
  pagesToShow.forEach(p => {
    if (lastP && p - lastP > 1) {
      html += `<span class="pagination-ellipsis">&hellip;</span>`;
    }
    const activeClass = p === currentCatalogPage ? 'active' : '';
    html += `<button type="button" class="page-num-btn ${activeClass}" data-page="${p}">${p}</button>`;
    lastP = p;
  });

  // Next Button
  const nextDisabled = currentCatalogPage === totalPages ? 'disabled' : '';
  html += `<button type="button" class="page-nav-btn" data-page="${currentCatalogPage + 1}" ${nextDisabled}>Next &rarr;</button>`;

  btnRow.innerHTML = html;

  // Bind pagination click events
  btnRow.querySelectorAll('button[data-page]').forEach(b => {
    b.addEventListener('click', () => {
      const p = Number(b.dataset.page);
      if (!isNaN(p) && p !== currentCatalogPage) {
        updateCatalogPage(p, true);
      }
    });
  });
}

function initCatalogTouchSwipe() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let startX = 0;
  let startY = 0;

  grid.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;

      // Deliberate horizontal swipe
      if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
        const totalCards = currentMatchingCatalogCards.length;
        const totalPages = Math.ceil(totalCards / CATALOG_PAGE_SIZE) || 1;
        if (diffX < 0 && currentCatalogPage < totalPages) {
          updateCatalogPage(currentCatalogPage + 1, true);
        } else if (diffX > 0 && currentCatalogPage > 1) {
          updateCatalogPage(currentCatalogPage - 1, true);
        }
      }
    }
  }, { passive: true });
}

function initAbujaCarousel() {
  const track = document.getElementById('abuja-carousel-track');
  const btnPrev = document.getElementById('btn-abuja-prev');
  const btnNext = document.getElementById('btn-abuja-next');
  if (!track) return;

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }
}

function filterProducts(resetPage = true) {
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const activeBtn = document.querySelector('.filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.dataset.filter : 'all';

  if (searchClearBtn) {
    searchClearBtn.style.display = query ? 'block' : 'none';
  }

  const catalogCards = document.querySelectorAll('#products-grid .product-card');
  const abujaCards = document.querySelectorAll('#abuja-carousel-track .product-card');

  currentMatchingCatalogCards = [];
  let visibleAbujaCount = 0;

  catalogCards.forEach((card) => {
    const cardCat = card.dataset.category || '';
    const cardId = card.dataset.id || '';
    const generalTerms = (GENERAL_PRODUCT_TERMS[cardId] || '').toLowerCase();
    const cardKeywords = (card.dataset.keywords || '').toLowerCase();
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const sku = (card.querySelector('.product-sku')?.textContent || '').toLowerCase();
    const line = (card.querySelector('.product-line')?.textContent || '').toLowerCase();
    const colors = Array.from(card.querySelectorAll('.color-dot')).map(d => (d.dataset.color || '').toLowerCase()).join(' ');

    const allSearchable = `${name} ${sku} ${line} ${cardKeywords} ${generalTerms} ${colors} ${cardCat}`;
    const matchesSearch = !query || allSearchable.includes(query);
    const matchesCat = (activeCategory === 'all' || !activeCategory || cardCat === activeCategory || (query && matchesSearch));

    if (matchesSearch && matchesCat) {
      currentMatchingCatalogCards.push(card);
    } else {
      card.style.display = 'none';
    }
  });

  // Filter cards in Abuja carousel track
  abujaCards.forEach((card) => {
    const cardCat = card.dataset.category || '';
    const cardId = card.dataset.id || '';
    const generalTerms = (GENERAL_PRODUCT_TERMS[cardId] || '').toLowerCase();
    const cardKeywords = (card.dataset.keywords || '').toLowerCase();
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const sku = (card.querySelector('.product-sku')?.textContent || '').toLowerCase();

    const allSearchable = `${name} ${sku} ${cardKeywords} ${generalTerms} ${cardCat}`;
    const matchesSearch = !query || allSearchable.includes(query);
    const matchesCat = (activeCategory === 'all' || !activeCategory || cardCat === activeCategory || (query && matchesSearch));

    if (matchesSearch && matchesCat) {
      card.style.display = 'flex';
      visibleAbujaCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const abujaSection = document.getElementById('abuja');
  if (abujaSection) {
    if (activeCategory !== 'all' && activeCategory && visibleAbujaCount === 0 && !query) {
      abujaSection.style.display = 'none';
    } else {
      abujaSection.style.display = 'block';
    }
  }

  const totalVisible = currentMatchingCatalogCards.length + visibleAbujaCount;

  if (searchNoResults) {
    if (totalVisible === 0) {
      searchNoResults.removeAttribute('hidden');
      searchNoResults.style.display = 'block';
      const noResultsTitle = document.getElementById('no-results-title');
      const noResultsDesc = document.getElementById('no-results-desc');
      const resetBtn = document.getElementById('btn-reset-search');

      if (query) {
        if (noResultsTitle) noResultsTitle.textContent = 'Nothing to buzz about yet.';
        if (noResultsDesc) noResultsDesc.innerHTML = `We couldn't find anything matching "<strong>${query}</strong>". Give it another tease with 'rose', 'bullet', 'dildo', 'lingerie', or 'lube'.`;
        if (resetBtn) resetBtn.textContent = 'Clear Search';
      } else {
        const catName = activeCategory === 'bdsm' ? 'BDSM' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
        if (noResultsTitle) noResultsTitle.textContent = 'Patience is a virtue (and a kink).';
        if (noResultsDesc) noResultsDesc.innerHTML = `We're stocking this vault right now. Our <strong>${catName}</strong> collection will drop shortly. In the meantime, explore our active collection.`;
        if (resetBtn) resetBtn.textContent = 'Browse All Products';
      }
    } else {
      searchNoResults.setAttribute('hidden', '');
      searchNoResults.style.display = 'none';
    }
  }

  if (searchCount) {
    const totalAllCards = catalogCards.length + abujaCards.length;
    searchCount.textContent = `Showing ${totalVisible} of ${totalAllCards} products`;
  }

  // Display page 1 of paginated matching catalog cards
  updateCatalogPage(resetPage ? 1 : currentCatalogPage, false);
}

function applyProductFilter(category) {
  const allBtns = document.querySelectorAll('.filter-btn');
  allBtns.forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === category);
  });
  filterProducts(true);
}

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isAlreadyActive = btn.classList.contains('active');
    if (isAlreadyActive) {
      btn.classList.remove('active');
      filterProducts(true);
    } else {
      applyProductFilter(btn.dataset.filter);
    }
  });
});

initCatalogTouchSwipe();
initAbujaCarousel();

if (searchInput) {
  searchInput.addEventListener('input', filterProducts);
}
if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterProducts();
  });
}
if (btnResetSearch) {
  btnResetSearch.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    filterProducts();
  });
}

// URL Query Parameter filter auto-activation
const urlParams = new URLSearchParams(window.location.search);
const initialFilter = urlParams.get('filter');
if (initialFilter) {
  let targetCategory = initialFilter;
  const matchBtn = Array.from(document.querySelectorAll('.filter-btn')).find(b => {
    const f = b.dataset.filter;
    return f === targetCategory ||
      (targetCategory === 'lingerie' && f === 'lingerie') ||
      (targetCategory === 'lubes' && (f === 'wellness' || f === 'lubes')) ||
      (targetCategory === 'wellness' && (f === 'wellness' || f === 'lubes')) ||
      (targetCategory === 'bdsm' && (f === 'accessories' || f === 'bdsm')) ||
      (targetCategory === 'accessories' && (f === 'accessories' || f === 'bdsm')) ||
      (targetCategory === 'games' && (f === 'games' || f === 'card-games')) ||
      (targetCategory === 'card-games' && (f === 'games' || f === 'card-games'));
  });

  if (matchBtn) {
    applyProductFilter(matchBtn.dataset.filter);
  } else {
    filterProducts(true);
  }
} else {
  filterProducts(true);
}

// Interactive Finish / Color Dots
document.querySelectorAll('.color-selector, .color-row').forEach((selector) => {
  const dots = selector.querySelectorAll('.color-dot');
  const label = selector.querySelector('.selected-color-name, .color-name');
  const card = selector.closest('.product-card');
  const cardImg = card?.querySelector('.product-img');
  const addBtn = card?.querySelector('.btn-add-cart');

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      dots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      const chosenColor = dot.dataset.color;
      

      // Update card preview image if color dot has an individual image
      if (dot.dataset.img && cardImg) {
        cardImg.src = dot.dataset.img;
        if (addBtn) {
          addBtn.dataset.img = dot.dataset.img;
        }
      }

      // Update addBtn dataset and title
      if (addBtn && chosenColor) {
        addBtn.dataset.selectedColor = chosenColor;
        const activeSizePill = card?.querySelector('.size-pill.active');
        const activeSize = activeSizePill?.dataset.size || activeSizePill?.textContent.trim();
        const baseTitle = (addBtn.dataset.baseTitle || addBtn.dataset.title || '').replace(/\s*\([^)]*\)$/, '').trim();
        if (!addBtn.dataset.baseTitle) addBtn.dataset.baseTitle = baseTitle;
        if (activeSize) {
          addBtn.dataset.title = `${baseTitle} (${activeSize} ${chosenColor})`;
        } else {
          addBtn.dataset.title = `${baseTitle} (${chosenColor})`;
        }
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
  const cardImg = card.querySelector('.product-img');

  sizePills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      sizePills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const chosenSize = pill.dataset.size || pill.textContent.trim();

      // If variant has a preview image
      if (pill.dataset.img) {
        if (cardImg) cardImg.src = pill.dataset.img;
        if (addBtn) addBtn.dataset.img = pill.dataset.img;
      }

      const baseTitle = (addBtn?.dataset.baseTitle || addBtn?.dataset.title || '').replace(/\s*\([^)]*\)$/, '').trim();
      if (addBtn && !addBtn.dataset.baseTitle) addBtn.dataset.baseTitle = baseTitle;
      const activeColor = card.querySelector('.color-dot.active')?.dataset.color;

      // If size pill has a specific price (like dildo 6" vs 7" or plugs S vs M vs L)
      if (pill.dataset.price) {
        const newPrice = parseInt(pill.dataset.price, 10);
        const newPriceStr = pill.dataset.pricestr;
        if (priceDisplay && newPriceStr) {
          priceDisplay.textContent = newPriceStr;
        }
        if (addBtn) {
          addBtn.dataset.price = newPrice;
          addBtn.dataset.selectedSize = chosenSize;
          if (activeColor) {
            addBtn.dataset.title = `${baseTitle} (${chosenSize} ${activeColor})`;
          } else {
            addBtn.dataset.title = `${baseTitle} (${chosenSize})`;
          }
        }
      } else {
        // Lingerie, variant, or bottle size
        if (addBtn) {
          addBtn.dataset.selectedSize = chosenSize;
          if (activeColor) {
            addBtn.dataset.title = `${baseTitle} (${chosenSize} ${activeColor})`;
          } else {
            addBtn.dataset.title = `${baseTitle} (${chosenSize})`;
          }
        }
      }

      // Update card size text label if present and card has no color dots
      if (sizeLabel && !card.querySelector('.color-dot')) {
        if (chosenSize === 'Sucker' || chosenSize === 'Licker') {
          sizeLabel.textContent = `Variant: ${chosenSize}`;
        } else {
          sizeLabel.textContent = chosenSize.startsWith('Size') ? chosenSize : `Size: ${chosenSize}`;
        }
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
const qvSpecs = document.getElementById('qv-specs');
const qvBtnAdd = document.getElementById('qv-btn-add');
let currentQvProduct = null;

const PRODUCT_DATABASE = {
  'boudoir-pasties': {
    id: 'boudoir-pasties',
    title: 'Boudoir Pasties',
    badge: 'SATIN & VELVET',
    sku: 'LINGERIE · 01',
    price: 4500,
    priceStr: '₦4,500',
    img: '/assets/lingerie-catalog/boudoir-pasties-hero.webp',
    desc: "Playful satin and velvet nipple pasties featuring flirty boudoir motifs and provocative script. Crafted with medical-grade hypoallergenic adhesive for secure, skin-safe wear and effortless peel-away removal.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/boudoir-pasties-media-1.webp",
            "label": "Pasties Collection"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/boudoir-pasties-media-2.webp",
            "label": "Detail View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/boudoir-pasties-media-3.webp",
            "label": "Alternate View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 4500,
                "priceStr": "₦4,500",
                "img": "/assets/lingerie-catalog/boudoir-pasties-hero.webp"
        }
]
  },

  'zebra-set': {
    id: 'zebra-set',
    title: 'Zebra Set',
    badge: '3-PIECE SET',
    sku: 'LINGERIE · 02',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/zebra-set-hero.webp',
    desc: "Untamed scarlet zebra-print lingerie ensemble featuring a structured underwire demi bra, matching strappy G-string, opera-length sheer mesh gloves, and coordinating thigh-high stockings for an unforgettable wild encounter.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/zebra-set-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/zebra-set-media-2.webp",
            "label": "Full Ensemble"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/zebra-set-media-3.webp",
            "label": "Detail Angle"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/zebra-set-hero.webp"
        },
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/zebra-set-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/zebra-set-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/zebra-set-hero.webp"
        }
]
  },

  'lilac-bodystocking': {
    id: 'lilac-bodystocking',
    title: 'Lilac Bodystocking',
    badge: 'SEAMLESS KNIT',
    sku: 'LINGERIE · 03',
    price: 12000,
    priceStr: '₦12,000',
    img: '/assets/lingerie-catalog/lilac-bodystocking-hero.webp',
    desc: "Ethereal lavender open-knit bodystocking with ribbed contour paneling, delicate long sleeves, and tantalizing peekaboo decolletage cutouts. Ultra-stretchy micro-mesh hugs every natural curve like liquid silk.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lilac-bodystocking-media-1.webp",
            "label": "Model Front"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lilac-bodystocking-media-2.webp",
            "label": "Model Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lilac-bodystocking-media-3.webp",
            "label": "Live Mannequin View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lilac-bodystocking-media-4.webp",
            "label": "Back Angle"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-08-14-17-47-48.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 12000,
                "priceStr": "₦12,000",
                "img": "/assets/lingerie-catalog/lilac-bodystocking-hero.webp"
        }
]
  },

  'cyan-coord': {
    id: 'cyan-coord',
    title: 'Cyan Co-ord',
    badge: '2-PIECE SET',
    sku: 'LINGERIE · 04',
    price: 12000,
    priceStr: '₦12,000',
    img: '/assets/lingerie-catalog/cyan-coord-hero.webp',
    desc: "Electric cyan two-piece knit set featuring a sparkling rhinestone-embellished long-sleeve crop top with flared bell cuffs and a matching low-rise mini skirt with seductive hip ladder cutouts.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/cyan-coord-media-1.webp",
            "label": "Model Front"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/cyan-coord-media-2.webp",
            "label": "Model Side View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/cyan-coord-media-3.webp",
            "label": "Studio Shot"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-08-14-17-50-40.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 12000,
                "priceStr": "₦12,000",
                "img": "/assets/lingerie-catalog/cyan-coord-hero.webp"
        }
]
  },

  'heart-teddy': {
    id: 'heart-teddy',
    title: 'Heart Teddy',
    badge: 'HEART CUTOUT',
    sku: 'LINGERIE · 05',
    price: 21000,
    priceStr: '₦21,000',
    img: '/assets/lingerie-catalog/heart-teddy-hero.webp',
    desc: "Romantic blush pink teddy featuring heart-shaped embroidered mesh cups, adjustable satin garter straps, and scalloped lace trim. Seductively contours your silhouette while framing your decolletage in sweet allure.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-teddy-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-teddy-media-2.webp",
            "label": "Model Back View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-teddy-media-3.webp",
            "label": "Live Mannequin View"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-08-19-16-44-48.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/heart-teddy-hero.webp"
        },
        {
                "name": "M",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/heart-teddy-hero.webp"
        },
        {
                "name": "L",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/heart-teddy-hero.webp"
        }
]
  },

  'noir-slip': {
    id: 'noir-slip',
    title: 'Noir Slip',
    badge: 'MAXI SHEER',
    sku: 'LINGERIE · 06',
    price: 23000,
    priceStr: '₦23,000',
    img: '/assets/lingerie-catalog/noir-slip-hero.webp',
    desc: "Dramatic midnight black sheer mesh maxi slip dress with intricate floral eyelash lace underwire cups, adjustable spaghetti straps, and a daring sheer cascade that billows with every sensual step.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/noir-slip-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/noir-slip-media-2.webp",
            "label": "Side Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/noir-slip-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/noir-slip-hero.webp"
        },
        {
                "name": "M",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/noir-slip-hero.webp"
        },
        {
                "name": "L",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/noir-slip-hero.webp"
        }
]
  },

  'scarlet-corset': {
    id: 'scarlet-corset',
    title: 'Scarlet Corset',
    badge: 'LACE-UP BACK',
    sku: 'LINGERIE · 07',
    price: 21000,
    priceStr: '₦21,000',
    img: '/assets/lingerie-catalog/scarlet-corset-hero.webp',
    desc: "Fiery scarlet backless teddy with a dramatic crisscross corset tie running the full length of the spine. Features a deep sweetheart neckline and high-cut thong back designed to accentuate waist curvature.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/scarlet-corset-media-1.webp",
            "label": "Lace-Up Back"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/scarlet-corset-media-2.webp",
            "label": "Front Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/scarlet-corset-media-3.webp",
            "label": "Side Profile"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/scarlet-corset-hero.webp"
        },
        {
                "name": "M",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/scarlet-corset-hero.webp"
        },
        {
                "name": "L",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/scarlet-corset-hero.webp"
        }
]
  },

  'heart-mini': {
    id: 'heart-mini',
    title: 'Heart Mini',
    badge: 'UNAVAILABLE',
    sku: 'LINGERIE · 08',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/heart-mini-hero.webp',
    desc: "Playful bubblegum pink fishnet mini dress with off-shoulder long sleeves and charming green-stemmed cherry and heart motifs across the neckline. Stretches seamlessly over curves for flirty boudoir lounging.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-mini-media-1.webp",
            "label": "Live Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-mini-media-2.webp",
            "label": "Side Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-mini-media-3.webp",
            "label": "Back Angle"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-08-19-17-22-40.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: false,
    variants: [
        {
                "name": "S",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/heart-mini-hero.webp"
        },
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/heart-mini-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/heart-mini-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/heart-mini-hero.webp"
        }
]
  },

  'royal-slip': {
    id: 'royal-slip',
    title: 'Royal Slip',
    badge: 'COBALT LACE',
    sku: 'LINGERIE · 09',
    price: 23000,
    priceStr: '₦23,000',
    img: '/assets/lingerie-catalog/royal-slip-hero.webp',
    desc: "Sultry cobalt royal blue sheer lace chemise featuring an open lace front, plunging triangle cups, built-in garter loops, and a matching G-string. The vibrant sapphire hue elevates every boudoir setting.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/royal-slip-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/royal-slip-media-2.webp",
            "label": "Model Back View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/royal-slip-media-3.webp",
            "label": "Live Mannequin View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "L",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/royal-slip-hero.webp"
        },
        {
                "name": "XL",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/royal-slip-hero.webp"
        }
]
  },

  'thigh-stockings': {
    id: 'thigh-stockings',
    title: 'Thigh Stockings',
    badge: 'STAY-UP SILICONE',
    sku: 'LINGERIE · 10',
    price: 6500,
    priceStr: '₦6,500',
    img: '/assets/lingerie-catalog/thigh-stockings-hero.webp',
    desc: "Classic ultra-sheer thigh-high stockings with wide satin comfort top bands lined with stay-up silicone ribbing. Available in both timeless noir black and bridal alabaster white for seamless pairing with any lingerie ensemble.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/thigh-stockings-media-1.webp",
            "label": "Black & White Pair"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/thigh-stockings-media-2.webp",
            "label": "Black Stocking"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/thigh-stockings-media-3.webp",
            "label": "White Stocking"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 6500,
                "priceStr": "₦6,500",
                "img": "/assets/lingerie-catalog/thigh-stockings-hero.webp"
        }
]
  },

  'ruby-corset': {
    id: 'ruby-corset',
    title: 'Ruby Corset',
    badge: 'SATIN BUSTIER',
    sku: 'LINGERIE · 11',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lingerie-catalog/ruby-corset-hero.webp',
    desc: "Luxe crimson satin and sheer illusion mesh corseted bodysuit with padded underwire cups, adjustable thigh garter straps, and a matching satin cheeky thong with delicate gold hardware accents.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-corset-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-corset-media-2.webp",
            "label": "Mirror Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-corset-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/ruby-corset-hero.webp"
        },
        {
                "name": "M",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/ruby-corset-hero.webp"
        },
        {
                "name": "L",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/ruby-corset-hero.webp"
        },
        {
                "name": "XL",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/ruby-corset-hero.webp"
        }
]
  },

  'white-bodystocking': {
    id: 'white-bodystocking',
    title: 'White Bodystocking',
    badge: 'DIAMOND CUTOUT',
    sku: 'LINGERIE · 12',
    price: 12000,
    priceStr: '₦12,000',
    img: '/assets/lingerie-catalog/white-bodystocking-hero.webp',
    desc: "Seductive pure white high-neck bodystocking woven with intricate diamond lattice cutouts and open fishnet thighs. Designed to flatter the hourglass silhouette with dramatic skin reveals from collarbone to hip.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/white-bodystocking-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/white-bodystocking-media-2.webp",
            "label": "Model Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/white-bodystocking-media-3.webp",
            "label": "Live Mannequin View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 12000,
                "priceStr": "₦12,000",
                "img": "/assets/lingerie-catalog/white-bodystocking-hero.webp"
        }
]
  },

  'schoolgirl-set': {
    id: 'schoolgirl-set',
    title: 'Schoolgirl Set',
    badge: 'UNAVAILABLE',
    sku: 'LINGERIE · 13',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/schoolgirl-set-hero.webp',
    desc: "Classic boudoir roleplay outfit featuring a pleated red tartan mini skirt, sheer white floral lace tie-front crop top, matching lace choker collar with red ribbon bow, and cheeky lace thong.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/schoolgirl-set-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/schoolgirl-set-media-2.webp",
            "label": "Back Angle"
      }
],
    inStock: false,
    variants: [
        {
                "name": "S",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/schoolgirl-set-hero.webp"
        },
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/schoolgirl-set-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/schoolgirl-set-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/schoolgirl-set-hero.webp"
        }
]
  },

  'floral-gown': {
    id: 'floral-gown',
    title: 'Floral Gown',
    badge: 'MAXI SLIT',
    sku: 'LINGERIE · 14',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/floral-gown-hero.webp',
    desc: "Whimsical powder blue floral sheer chiffon maxi gown featuring double hip-high front slits that flutter dramatically with every motion, delicate sweetheart bust, and adjustable shoulder ribbons.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "M · L · XL · XXL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/floral-gown-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/floral-gown-media-2.webp",
            "label": "Side Slit Detail"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/floral-gown-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/floral-gown-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/floral-gown-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/floral-gown-hero.webp"
        },
        {
                "name": "XXL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/floral-gown-hero.webp"
        }
]
  },

  'scarlet-gown': {
    id: 'scarlet-gown',
    title: 'Scarlet Gown',
    badge: 'BELTED SATIN',
    sku: 'LINGERIE · 15',
    price: 23000,
    priceStr: '₦23,000',
    img: '/assets/lingerie-catalog/scarlet-gown-hero.webp',
    desc: "Show-stopping scarlet red sheer mesh and liquid satin evening gown with structured underwire cups, gold buckled waist belt, and an ultra-daring thigh-high slit that commands pure adoration.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/scarlet-gown-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/scarlet-gown-media-2.webp",
            "label": "Slit Detail"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-09-14-10-30-10.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/scarlet-gown-hero.webp"
        },
        {
                "name": "M",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/scarlet-gown-hero.webp"
        },
        {
                "name": "L",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/scarlet-gown-hero.webp"
        },
        {
                "name": "XL",
                "price": 23000,
                "priceStr": "₦23,000",
                "img": "/assets/lingerie-catalog/scarlet-gown-hero.webp"
        }
]
  },

  'crochet-set': {
    id: 'crochet-set',
    title: 'Crochet Set',
    badge: '2-PIECE SET',
    sku: 'LINGERIE · 16',
    price: 12000,
    priceStr: '₦12,000',
    img: '/assets/lingerie-catalog/crochet-set-hero.webp',
    desc: "Sensual textured open-knit 2-piece loungewear set featuring a short-sleeve crop top and high-waisted seamless leggings. Available in fiery scarlet red and sleek noir black.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/crochet-set-media-1.webp",
            "label": "Red Colorway"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/crochet-set-media-2.webp",
            "label": "Seated Pose"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/crochet-set-media-3.webp",
            "label": "Black Colorway"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 12000,
                "priceStr": "₦12,000",
                "img": "/assets/lingerie-catalog/crochet-set-hero.webp"
        }
]
  },

  'feather-teddy': {
    id: 'feather-teddy',
    title: 'Feather Teddy',
    badge: 'PLUME ACCENT',
    sku: 'LINGERIE · 17',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lingerie-catalog/feather-teddy-hero.webp',
    desc: "Exquisite baby pink ribbed knit bodysuit trimmed with luxurious matching marabou feathers along the shoulder straps and delicate scalloped lace along the plunging bustline and leg openings.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/feather-teddy-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/feather-teddy-media-2.webp",
            "label": "Feather Detail"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/feather-teddy-media-3.webp",
            "label": "Back Angle"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/feather-teddy-hero.webp"
        },
        {
                "name": "M",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/feather-teddy-hero.webp"
        },
        {
                "name": "L",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/feather-teddy-hero.webp"
        }
]
  },

  'corset-babydoll': {
    id: 'corset-babydoll',
    title: 'Corset Babydoll',
    badge: 'UNAVAILABLE',
    sku: 'LINGERIE · 18',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/corset-babydoll-hero.webp',
    desc: "Sleek noir black boned corset mini babydoll dress featuring ruffled shoulder cap sleeves, front lace-up eyelets, and a flared pleated skater skirt that twirls provocatively.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/corset-babydoll-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/corset-babydoll-media-2.webp",
            "label": "Side Angle"
      }
],
    inStock: false,
    variants: [
        {
                "name": "S",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/corset-babydoll-hero.webp"
        },
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/corset-babydoll-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/corset-babydoll-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/corset-babydoll-hero.webp"
        }
]
  },

  'ombre-mini': {
    id: 'ombre-mini',
    title: 'Ombre Mini',
    badge: 'GRADIENT NET',
    sku: 'LINGERIE · 19',
    price: 11000,
    priceStr: '₦11,000',
    img: '/assets/lingerie-catalog/ombre-mini-hero.webp',
    desc: "Hypnotic scarlet-to-black ombre sheer fishnet mini dress with long sleeves, dramatic diamond-weave chest cutouts, and seamless stretch knit that clings sculpturally to every curve.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ombre-mini-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ombre-mini-media-2.webp",
            "label": "Side Profile"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ombre-mini-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 11000,
                "priceStr": "₦11,000",
                "img": "/assets/lingerie-catalog/ombre-mini-hero.webp"
        }
]
  },

  'pearl-mini': {
    id: 'pearl-mini',
    title: 'Pearl Mini',
    badge: 'RING CUTOUT',
    sku: 'LINGERIE · 20',
    price: 11000,
    priceStr: '₦11,000',
    img: '/assets/lingerie-catalog/pearl-mini-hero.webp',
    desc: "Midnight navy off-shoulder mini dress featuring shimmering silver O-ring and pearl cutout accents down the bust and sleeves, paired with textured animal print sheer mesh side paneling.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/pearl-mini-media-1.webp",
            "label": "Front Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/pearl-mini-media-2.webp",
            "label": "Seated Profile"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/pearl-mini-media-3.webp",
            "label": "Detail View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 11000,
                "priceStr": "₦11,000",
                "img": "/assets/lingerie-catalog/pearl-mini-hero.webp"
        }
]
  },

  'ruby-net': {
    id: 'ruby-net',
    title: 'Ruby Net',
    badge: 'SEAMLESS MINI',
    sku: 'LINGERIE · 21',
    price: 11000,
    priceStr: '₦11,000',
    img: '/assets/lingerie-catalog/ruby-net-hero.webp',
    desc: "Alluring deep ruby red seamless fishnet t-shirt mini dress with short sleeves and fine honeycomb mesh that flatters natural contours with an effortless second-skin feel.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-net-media-1.webp",
            "label": "Front Curve"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-net-media-2.webp",
            "label": "Side Profile"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ruby-net-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 11000,
                "priceStr": "₦11,000",
                "img": "/assets/lingerie-catalog/ruby-net-hero.webp"
        }
]
  },

  'blush-halter': {
    id: 'blush-halter',
    title: 'Blush Halter',
    badge: 'HALTER MINI',
    sku: 'LINGERIE · 22',
    price: 12000,
    priceStr: '₦12,000',
    img: '/assets/lingerie-catalog/blush-halter-hero.webp',
    desc: "Pastel blush pink halter neck fishnet mini dress with an alluring keyhole bust cutout, backless design, and intricate laser-distressed ladder ribbing along the hemline.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/blush-halter-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/blush-halter-media-2.webp",
            "label": "Backless View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 12000,
                "priceStr": "₦12,000",
                "img": "/assets/lingerie-catalog/blush-halter-hero.webp"
        }
]
  },

  'ribbon-teddy': {
    id: 'ribbon-teddy',
    title: 'Ribbon Teddy',
    badge: 'SATIN BOWS',
    sku: 'LINGERIE · 23',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/lingerie-catalog/ribbon-teddy-hero.webp',
    desc: "Vintage-inspired baby pink floral lace bodysuit adorned with charming satin ribbon bows along the plunging decolletage, delicate ruffle leg trims, and coordinating pink fishnet stockings.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ribbon-teddy-media-1.webp",
            "label": "Boudoir Bed View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/ribbon-teddy-media-2.webp",
            "label": "Stockings Detail"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-09-22-15-36-57.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 15000,
                "priceStr": "₦15,000",
                "img": "/assets/lingerie-catalog/ribbon-teddy-hero.webp"
        }
]
  },

  'heart-romper': {
    id: 'heart-romper',
    title: 'Heart Romper',
    badge: 'PASTEL CO-ORD',
    sku: 'LINGERIE · 24',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/lingerie-catalog/heart-romper-hero.webp',
    desc: "Sweet and sultry two-tone pastel yellow and lavender mesh halter romper featuring an open back, high-cut cheeky bottoms, and an adorable heart-accented choker neckline.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-romper-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-romper-media-2.webp",
            "label": "Back Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/heart-romper-media-3.webp",
            "label": "Live Mannequin View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 15000,
                "priceStr": "₦15,000",
                "img": "/assets/lingerie-catalog/heart-romper-hero.webp"
        }
]
  },

  'lattice-gown': {
    id: 'lattice-gown',
    title: 'Lattice Gown',
    badge: 'WINE LACE',
    sku: 'LINGERIE · 25',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lingerie-catalog/lattice-gown-hero.webp',
    desc: "Sumptuous rich wine red floral lace backless gown featuring intricate lattice crisscross strapping along the hips and thighs, an open rear silhouette, and built-in underwire support.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lattice-gown-media-1.webp",
            "label": "Back Lattice View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lattice-gown-media-2.webp",
            "label": "Front Angle"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-09-22-17-11-53.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/lattice-gown-hero.webp"
        },
        {
                "name": "M",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/lattice-gown-hero.webp"
        },
        {
                "name": "L",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/lattice-gown-hero.webp"
        },
        {
                "name": "XL",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/lattice-gown-hero.webp"
        }
]
  },

  'teal-mini': {
    id: 'teal-mini',
    title: 'Teal Mini',
    badge: 'AQUA NET',
    sku: 'LINGERIE · 26',
    price: 14000,
    priceStr: '₦14,000',
    img: '/assets/lingerie-catalog/teal-mini-hero.webp',
    desc: "Vibrant aqua teal open-work fishnet mini dress with long sleeves, delicate halter tie accent, and an organic webbed texture that frames your shape in striking island colors.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/teal-mini-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/teal-mini-media-2.webp",
            "label": "Mirror Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/teal-mini-media-3.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 14000,
                "priceStr": "₦14,000",
                "img": "/assets/lingerie-catalog/teal-mini-hero.webp"
        }
]
  },

  'maroon-babydoll': {
    id: 'maroon-babydoll',
    title: 'Maroon Babydoll',
    badge: 'RUFFLE CORSET',
    sku: 'LINGERIE · 27',
    price: 21000,
    priceStr: '₦21,000',
    img: '/assets/lingerie-catalog/maroon-babydoll-hero.webp',
    desc: "Deep maroon lace-up corset babydoll with underwire floral lace cups, playful chiffon ruffled mini hemline, lace-up front midsection, and integrated adjustable garter straps.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/maroon-babydoll-media-1.webp",
            "label": "Model Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/maroon-babydoll-media-2.webp",
            "label": "Model Back View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/maroon-babydoll-media-3.webp",
            "label": "Live Mannequin View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/maroon-babydoll-hero.webp"
        },
        {
                "name": "M",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/maroon-babydoll-hero.webp"
        },
        {
                "name": "L",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/maroon-babydoll-hero.webp"
        },
        {
                "name": "XL",
                "price": 21000,
                "priceStr": "₦21,000",
                "img": "/assets/lingerie-catalog/maroon-babydoll-hero.webp"
        }
]
  },

  'kiss-chemise': {
    id: 'kiss-chemise',
    title: 'Kiss Chemise',
    badge: 'EMBROIDERED LIPS',
    sku: 'LINGERIE · 28',
    price: 19000,
    priceStr: '₦19,000',
    img: '/assets/lingerie-catalog/kiss-chemise-hero.webp',
    desc: "Seductive black sheer mesh babydoll slip embroidered with vibrant red lipstick kiss motifs, satin red center ribbon bow, scalloped lace trim, and matching kiss-print G-string.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/kiss-chemise-media-1.webp",
            "label": "Model Seated"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/kiss-chemise-media-2.webp",
            "label": "Model Standing"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/kiss-chemise-media-3.webp",
            "label": "Live Mannequin View"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-09-25-12-48-11.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 19000,
                "priceStr": "₦19,000",
                "img": "/assets/lingerie-catalog/kiss-chemise-hero.webp"
        },
        {
                "name": "M",
                "price": 19000,
                "priceStr": "₦19,000",
                "img": "/assets/lingerie-catalog/kiss-chemise-hero.webp"
        },
        {
                "name": "L",
                "price": 19000,
                "priceStr": "₦19,000",
                "img": "/assets/lingerie-catalog/kiss-chemise-hero.webp"
        },
        {
                "name": "XL",
                "price": 19000,
                "priceStr": "₦19,000",
                "img": "/assets/lingerie-catalog/kiss-chemise-hero.webp"
        }
]
  },

  'floral-slip': {
    id: 'floral-slip',
    title: 'Floral Slip',
    badge: 'FLORAL LACE',
    sku: 'LINGERIE · 29',
    price: 18000,
    priceStr: '₦18,000',
    img: '/assets/lingerie-catalog/floral-corset-hero.webp',
    desc: "Alluring black sheer mesh slip dress featuring vibrant hot pink floral lace underwire demi cups, a delicate center accent, adjustable satin straps, and scalloped pink lace hem.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/floral-corset-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/floral-corset-media-2.webp",
            "label": "Side Angle"
      },
      {
            "type": "video",
            "src": "/assets/Lingerie/VIDEO-2026-09-26-18-07-23.mp4",
            "label": "Live Video Clip"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/floral-corset-hero.webp"
        },
        {
                "name": "M",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/floral-corset-hero.webp"
        },
        {
                "name": "L",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/floral-corset-hero.webp"
        },
        {
                "name": "XL",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/floral-corset-hero.webp"
        }
]
  },

  'nurse-set': {
    id: 'nurse-set',
    title: 'Nurse Set',
    badge: 'ROLEPLAY COSTUME',
    sku: 'LINGERIE · 30',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lingerie-catalog/nurse-set-hero.webp',
    desc: "Provocative white and red emergency nurse roleplay uniform dress featuring a zippered plunge front, corset waist lattice cutouts, matching nurse headpiece, and coordinating noir boudoir slip with neon lace trim.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/nurse-set-hero.webp",
            "label": "Nurse Uniform Set"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/neon-slip-media-1.webp",
            "label": "Boudoir Slip (Front View)"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/neon-slip-media-2.webp",
            "label": "Boudoir Slip (Side View)"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/nurse-set-hero.webp"
        },
        {
                "name": "M",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/nurse-set-hero.webp"
        },
        {
                "name": "L",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/nurse-set-hero.webp"
        },
        {
                "name": "XL",
                "price": 22000,
                "priceStr": "₦22,000",
                "img": "/assets/lingerie-catalog/nurse-set-hero.webp"
        }
]
  },

  'mermaid-set': {
    id: 'mermaid-set',
    title: 'Mermaid Set',
    badge: 'MAXI 2-PIECE',
    sku: 'LINGERIE · 31',
    price: 18000,
    priceStr: '₦18,000',
    img: '/assets/lingerie-catalog/mermaid-set-hero.webp',
    desc: "Breathtaking turquoise and lavender gradient knit 2-piece set featuring a high-neck halter crop top with keyhole cutout and a floor-sweeping sheer ombre mermaid skirt.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "One Size (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/mermaid-set-media-1.webp",
            "label": "Full Set"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/mermaid-set-media-2.webp",
            "label": "Crop Top Detail"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/mermaid-set-media-3.webp",
            "label": "Back Angle"
      }
],
    inStock: true,
    variants: [
        {
                "name": "One Size",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/mermaid-set-hero.webp"
        }
]
  },

  'noir-chemise': {
    id: 'noir-chemise',
    title: 'Noir Chemise',
    badge: 'FAN EMBROIDERY',
    sku: 'LINGERIE · 32',
    price: 17000,
    priceStr: '₦17,000',
    img: '/assets/lingerie-catalog/noir-chemise-hero.webp',
    desc: "Ultra-luxe noir black sheer mini chemise featuring architectural fan-embroidered sheer underwire cups, ruched side seams that sculpt the hips, and a delicate flirty ruffle hem.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/noir-chemise-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/noir-chemise-media-2.webp",
            "label": "Back Angle"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/noir-chemise-hero.webp"
        },
        {
                "name": "M",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/noir-chemise-hero.webp"
        },
        {
                "name": "L",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/noir-chemise-hero.webp"
        },
        {
                "name": "XL",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/noir-chemise-hero.webp"
        }
]
  },

  'lace-romper': {
    id: 'lace-romper',
    title: 'Lace Romper',
    badge: 'FLORAL PLAYSUIT',
    sku: 'LINGERIE · 33',
    price: 18000,
    priceStr: '₦18,000',
    img: '/assets/lingerie-catalog/lace-romper-hero.webp',
    desc: "Sultry noir black floral lace romper playsuit featuring a plunging V-neckline, supportive underbust band, strappy back details, and semi-sheer boy-short bottoms for effortless elegance.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lace-romper-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/lace-romper-media-2.webp",
            "label": "Back Angle"
      }
],
    inStock: true,
    variants: [
        {
                "name": "M",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/lace-romper-hero.webp"
        },
        {
                "name": "L",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/lace-romper-hero.webp"
        },
        {
                "name": "XL",
                "price": 18000,
                "priceStr": "₦18,000",
                "img": "/assets/lingerie-catalog/lace-romper-hero.webp"
        }
]
  },

  'cutout-mini': {
    id: 'cutout-mini',
    title: 'Cutout Mini',
    badge: 'UNAVAILABLE',
    sku: 'LINGERIE · 34',
    price: 0,
    priceStr: '₦',
    img: '/assets/lingerie-catalog/cutout-mini-hero.webp',
    desc: "Architectural sheer noir mesh mini dress featuring a daring circular underboob cutout, high choker neckline, central silver O-ring connector, and an ultra-short sheer skirt.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/cutout-mini-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/cutout-mini-media-2.webp",
            "label": "Back Angle"
      }
],
    inStock: false,
    variants: [
        {
                "name": "S",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/cutout-mini-hero.webp"
        },
        {
                "name": "M",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/cutout-mini-hero.webp"
        },
        {
                "name": "L",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/cutout-mini-hero.webp"
        },
        {
                "name": "XL",
                "price": 0,
                "priceStr": "₦",
                "img": "/assets/lingerie-catalog/cutout-mini-hero.webp"
        }
]
  },

  'leopard-bodysuit': {
    id: 'leopard-bodysuit',
    title: 'Leopard Bodysuit',
    badge: 'SLEEVE SET',
    sku: 'LINGERIE · 35',
    price: 17000,
    priceStr: '₦17,000',
    img: '/assets/lingerie-catalog/leopard-bodysuit-hero.webp',
    desc: "Exotic warm leopard and blue butterfly print sheer off-shoulder bodysuit featuring strappy hip cutouts with adjustable tie bows and separate matching flared long sleeves.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "S · M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/leopard-bodysuit-media-1.webp",
            "label": "Front View"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/leopard-bodysuit-media-2.webp",
            "label": "Back Angle"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/leopard-bodysuit-media-3.webp",
            "label": "Sleeve Detail"
      }
],
    inStock: true,
    variants: [
        {
                "name": "S",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/leopard-bodysuit-hero.webp"
        },
        {
                "name": "M",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/leopard-bodysuit-hero.webp"
        },
        {
                "name": "L",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/leopard-bodysuit-hero.webp"
        },
        {
                "name": "XL",
                "price": 17000,
                "priceStr": "₦17,000",
                "img": "/assets/lingerie-catalog/leopard-bodysuit-hero.webp"
        }
]
  },

  'chain-teddy': {
    id: 'chain-teddy',
    title: 'Chain Teddy',
    badge: 'CHAIN HARNESS',
    sku: 'LINGERIE · 36',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/lingerie-catalog/chain-teddy-hero.webp',
    desc: "Dominant and exquisite black floral lace teddy elevated with shimmering gold chain shoulder straps and draping bust chains, waist harness belt, and chain-linked thigh garter bands.",
    specs: [
      {
            "label": "Silhouette",
            "value": "Hourglass Contour & Boudoir Cut"
      },
      {
            "label": "Sizing",
            "value": "M · L · XL (Standard Boudoir Fit)"
      },
      {
            "label": "Care",
            "value": "Hand Wash Cold, Lay Flat to Dry"
      },
      {
            "label": "Packaging",
            "value": "100% Plain Discreet Courier Bag"
      }
],
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: [
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/chain-teddy-media-1.webp",
            "label": "Front Harness"
      },
      {
            "type": "image",
            "src": "/assets/lingerie-catalog/chain-teddy-media-2.webp",
            "label": "Back View"
      }
],
    inStock: true,
    variants: [
        {
                "name": "M",
                "price": 15000,
                "priceStr": "₦15,000",
                "img": "/assets/lingerie-catalog/chain-teddy-hero.webp"
        },
        {
                "name": "L",
                "price": 15000,
                "priceStr": "₦15,000",
                "img": "/assets/lingerie-catalog/chain-teddy-hero.webp"
        },
        {
                "name": "XL",
                "price": 15000,
                "priceStr": "₦15,000",
                "img": "/assets/lingerie-catalog/chain-teddy-hero.webp"
        }
]
  },

  // Alias for backward compatibility
  'floral-corset': null,

    'rose-blossom': {
    id: 'rose-blossom',
    title: 'The Rose Sucker',
    badge: 'BESTSELLER',
    price: 25000,
    priceStr: '₦25,000',
    img: '/assets/product-rose.jpg',
    variants: [
      { name: 'Red', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' },
      { name: 'Black', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' },
      { name: 'Pink', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' },
      { name: 'Purple', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' },
      { name: 'Yellow', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' },
      { name: 'Green', price: 25000, priceStr: '₦25,000', img: '/assets/product-rose.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/product-rose.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/rose-sucker-colors.webp', label: 'Colorways & USB' },
      { type: 'image', src: '/assets/rose-sucker-box.webp', label: 'Collector Vault' },
      { type: 'image', src: '/assets/rose-sucker-glow.webp', label: 'Night Glow Edition' },
      { type: 'video', src: '/assets/rose-sucker-demo.mp4', thumb: '/assets/product-rose.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Sculpted like an innocent blooming rose, engineered like an absolute powerhouse. Uses gentle aerodynamic air-wave pulses to stimulate without direct friction, taking you from a teasing flutter to an undeniable crescendo in minutes.',
    specs: [
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Whisper Silent)' },
      { label: 'Waterproof', value: 'IPX7 - Waterproof' },
      { label: 'Battery', value: 'Magnetic USB Rechargeable' }
    ],
    material: '100% Medical-Grade Liquid Silicone',
    acoustics: '< 30 dB (Whisper Silent)',
    freq: 72,
    pattern: 'surge'
  },
  'pulsating-rose': {
    id: 'pulsating-rose',
    title: 'Pulsating Rose',
    badge: 'NEW ARRIVAL',
    price: 35000,
    priceStr: '₦35,000',
    img: '/assets/rose-pair-duo.webp',
    variants: [
      { name: 'Sucker', price: 35000, priceStr: '₦35,000', img: '/assets/rose-sucker-variant.webp' },
      { name: 'Licker', price: 35000, priceStr: '₦35,000', img: '/assets/rose-licker-variant.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/rose-pair-duo.webp', label: 'Duo Models' },
      { type: 'image', src: '/assets/rose-pair-boxes.webp', label: 'Packaging & Variants' },
      { type: 'image', src: '/assets/rose-sucker-variant.webp', label: 'Sucker Variant' },
      { type: 'image', src: '/assets/rose-licker-variant.webp', label: 'Licker Variant' },
      { type: 'video', src: '/assets/rose-pulsating-demo.mp4', thumb: '/assets/rose-pair-duo.webp', label: 'Live Video Demo' }
    ],
    desc: 'Dual oral sensation options sculpted into a blooming rose silhouette. Choose the Sucker for airtight pulsing flutter waves, or the Licker for rhythmic tongue-stroking ecstasy.',
    specs: [
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Whisper Silent)' },
      { label: 'Waterproof', value: 'IPX7 - Waterproof' },
      { label: 'Battery', value: 'Magnetic USB Rechargeable' }
    ],
    material: '100% Medical-Grade Liquid Silicone',
    acoustics: '< 30 dB (Whisper Silent)',
    freq: 72,
    pattern: 'pulse & flutter'
  },
  'sceptre-wand': {
    id: 'sceptre-wand',
    title: 'The Mini Wand',
    badge: 'DEEP RUMBLE',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/product-wand.jpg',
    variants: [
      { name: 'Black', price: 15000, priceStr: '₦15,000', img: '/assets/product-wand.jpg' },
      { name: 'Pink', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.webp' },
      { name: 'Purple', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.webp' },
      { name: 'Green', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/product-wand.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/mini-wand-colors.webp', label: 'All 4 Colors' },
      { type: 'image', src: '/assets/mini-wand-hand.webp', label: 'In-Hand Scale' },
      { type: 'video', src: '/assets/mini-wand-demo.mp4', thumb: '/assets/product-wand.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Don’t let the compact silhouette fool you. The Mini Wand packs full-sized, bone-deep vibrations into a palm-sized frame with a 360° flexible silicone head. Perfect for pinpoint clitoral stimulation, all-over tension relief, or slipping into an overnight bag.',
    specs: [
      { label: 'Material', value: 'Silky Medical Silicone & Textured Grip' },
      { label: 'Sound Level', value: '< 30 dB (Subtle & Discreet)' },
      { label: 'Waterproof', value: 'Splashproof & Easy Clean' },
      { label: 'Battery', value: 'USB Fast Charging' }
    ],
    material: 'Silky Medical-Grade Silicone & Textured Wave Grip',
    acoustics: '< 30 dB (Subtle & Discreet)',
    freq: 85,
    pattern: 'continuous'
  },
  'siren-app': {
    id: 'siren-app',
    title: 'The Siren',
    badge: 'APP CONNECT',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/siren-app-red.webp',
    variants: [
      { name: 'Red', price: 27000, priceStr: '₦27,000', img: '/assets/siren-app-red.webp' },
      { name: 'White', price: 27000, priceStr: '₦27,000', img: '/assets/siren-app-white.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/siren-app.webp', label: 'Studio Cover' },
      { type: 'image', src: '/assets/siren-app-red.webp', label: 'Red' },
      { type: 'image', src: '/assets/siren-app-white.webp', label: 'White' },
      { type: 'video', src: '/assets/siren-app-demo.mp4', thumb: '/assets/siren-app.webp', label: 'Live Video Demo' }
    ],
    desc: 'Long distance? What distance? Discreet, whisper-quiet, and ergonomically curved to slip seamlessly into your panties. Hand full control over to your partner from across the room or across the globe via smartphone app-or surrender to customized rhythm playlists and music vibration modes.',
    specs: [
      { label: 'Material', value: 'Silky Medical Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Discreet in Public)' },
      { label: 'Waterproof', value: 'IPX7 - Waterproof' },
      { label: 'Connectivity', value: 'Bluetooth App Sync (iOS & Android)' },
      { label: 'Battery', value: 'Magnetic USB Rechargeable' }
    ],
    material: 'Silky Medical-Grade Liquid Silicone & Flexible Ergonomic Tail',
    acoustics: '< 30 dB (Discreet in Public)',
    freq: 95,
    pattern: 'bluetooth'
  },
  'lipstick-vibe': {
    id: 'lipstick-vibe',
    title: 'Lipstick Vibe',
    badge: 'RECHARGEABLE',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lipstick-hand.webp',
    media: [
      { type: 'image', src: '/assets/lipstick-vibe.webp', label: 'White' },
      { type: 'image', src: '/assets/lipstick-hand.webp', label: 'White (In-Hand)' },
      { type: 'video', src: '/assets/lipstick-demo.mp4', thumb: '/assets/lipstick-vibe.webp', label: 'Live Video Demo' }
    ],
    desc: 'The ultimate embarrassment-proof secret. Disguised in plain sight as a chic white and gold designer lipstick. Toss it into your handbag, cosmetic pouch, or desk drawer without fear-nobody will ever look twice. Features a velvet-soft angled silicone bullet, multiple whisper-quiet vibration speeds, and convenient USB recharging.',
    specs: [
      { label: 'Material', value: 'Medical-Grade Soft Silicone & Gold Alloy' },
      { label: 'Sound Level', value: '< 25 dB (Total Stealth)' },
      { label: 'Discretion', value: 'Authentic Lipstick Silhouette' },
      { label: 'Battery', value: 'Discreet USB Rechargeable' }
    ],
    material: 'Medical-Grade Soft Silicone & Electroplated Gold Alloy',
    acoustics: '< 25 dB (Total Stealth & Discretion)',
    freq: 78,
    pattern: 'stealth'
  },
  'sculpted-dildo': {
    id: 'sculpted-dildo',
    title: 'The Contour Shaft',
    badge: 'DUAL SIZE',
    price: 15000,
    priceStr: '₦15,000 (6") • ₦17,000 (7")',
    img: '/assets/dildo-trio.webp',
    variants: [
      { name: 'Tan', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-tan.webp' },
      { name: 'Brown', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-bronze.webp' },
      { name: 'Black', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-noir.webp' },
      { name: 'Tan', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-tan.webp' },
      { name: 'Brown', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-bronze.webp' },
      { name: 'Black', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-noir.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/dildo-trio.webp', label: 'All 3 Colors' },
      { type: 'image', src: '/assets/dildo-tan.webp', label: 'Tan' },
      { type: 'image', src: '/assets/dildo-bronze.webp', label: 'Brown' },
      { type: 'image', src: '/assets/dildo-noir.webp', label: 'Black' }
    ],
    desc: 'Anatomically sculpted with a lifelike contoured shaft, raised head, and heavy-duty hands-free suction base that mounts firmly to shower tiles, mirrors, and flat surfaces. Fully harness-ready and crafted from velvety, body-safe material. Choose between 6" (₦15,000) and 7" (₦17,000) in three rich skin tones.',
    specs: [
      { label: 'Material', value: 'Ultra-Pure Medical PVC & Body-Safe Silicone' },
      { label: 'Mounting', value: 'Heavy-Duty Hands-Free Suction Base' },
      { label: 'Waterproof', value: '100% Waterproof & Submersible' },
      { label: 'Compatibility', value: 'Harness Ready & Shower Compatible' }
    ],
    material: 'Ultra-Pure Medical PVC & Body-Safe Silicone with Suction Base',
    acoustics: '100% Waterproof & Harness Compatible',
    freq: 0,
    pattern: 'manual'
  },
  'thrusting-dildo': {
    id: 'thrusting-dildo',
    title: 'Kinetic Thrusting Shaft',
    badge: 'REMOTE CONTROLLED',
    price: 45000,
    priceStr: '₦45,000',
    img: '/assets/thrusting-dildo-duo.webp',
    variants: [
      { name: 'Black', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-black.webp' },
      { name: 'Brown', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-brown.webp' },
      { name: 'Tan', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-tan.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/thrusting-dildo-duo.webp', label: 'Dual Colors (In-Hand)' },
      { type: 'image', src: '/assets/thrusting-dildo-kit.webp', label: 'Complete Remote Kit' },
      { type: 'image', src: '/assets/thrusting-dildo-black.webp', label: 'Black Variant' },
      { type: 'image', src: '/assets/thrusting-dildo-brown.webp', label: 'Brown Variant' },
      { type: 'image', src: '/assets/thrusting-dildo-tan.webp', label: 'Tan Variant' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-1.mp4', thumb: '/assets/thrusting-dildo-duo.webp', label: 'Thrusting Action Demo 1' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-2.mp4', thumb: '/assets/thrusting-dildo-kit.webp', label: 'Remote Control Demo 2' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-3.mp4', thumb: '/assets/thrusting-dildo-brown.webp', label: 'Brown Thrusting Demo 3' }
    ],
    desc: 'Unstoppable motorized rhythm at the press of a button. Engineered with high-torque reciprocating thrusting mechanics and deep vibration rumbles, completely controlled hands-free via wireless ergonomic remote. Features a heavy-duty suction base that locks firmly onto flat surfaces or shower tiles.',
    specs: [
      { label: 'Material', value: 'Ultra-Pure Body-Safe Silicone & Suction Base' },
      { label: 'Action', value: 'Motorized Reciprocating Thrusting & Rumbles' },
      { label: 'Control', value: 'Wireless Ergonomic Remote Control (Included)' },
      { label: 'Mounting', value: 'Heavy-Duty Hands-Free Suction Lock Base' },
      { label: 'Waterproof', value: 'IPX7 Waterproof Shaft (Shower & Wash Safe)' },
      { label: 'Battery', value: 'USB Magnetic Rechargeable Shaft' }
    ],
    material: 'Ultra-Pure Body-Safe Silicone with Suction Base',
    acoustics: 'High-Torque Motorized Thrusting & Sub-Bass Rumble',
    freq: 60,
    pattern: 'thrust'
  },
  'sucking-rabbit': {
    id: 'sucking-rabbit',
    title: 'The Sucking Rabbit',
    badge: 'AIR-PULSE SUCTION',
    price: 35000,
    priceStr: '₦35,000',
    img: '/assets/sucking-rabbit.webp',
    media: [
      { type: 'image', src: '/assets/sucking-rabbit.webp', label: 'Studio Showcase' },
      { type: 'image', src: '/assets/sucking-rabbit-box.webp', label: 'Packaging Vault' },
      { type: 'video', src: '/assets/sucking-rabbit-demo.mp4', thumb: '/assets/sucking-rabbit.webp', label: 'Live Suction Demo' }
    ],
    desc: 'The legendary rabbit silhouette reimagined for absolute sensory overload. Combines fluttering air-pulse clitoral suction ears with a flexible, deeply ribbed shaft designed to reach and stimulate the G-spot. Independent dual motor controls let you tailor your vibration speed and suction intensity simultaneously.',
    specs: [
      { label: 'Material', value: 'Silky Medical-Grade Liquid Silicone & Pearlescent Handle' },
      { label: 'Dual Stimulation', value: 'Air-Wave Clitoral Suction + G-Spot Shaft Vibration' },
      { label: 'Sound Level', value: '< 35 dB (Discreet & Powerful)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof (Fully Submersible in Bath/Shower)' },
      { label: 'Battery', value: 'Magnetic USB Fast Rechargeable' }
    ],
    material: 'Silky Medical-Grade Liquid Silicone & Pearlescent Handle',
    acoustics: '< 35 dB (Discreet & Powerful)',
    freq: 80,
    pattern: 'dual'
  },
  'non-vibrating-plugs': {
    id: 'non-vibrating-plugs',
    title: 'Contour Crystal Plugs',
    badge: 'NON-VIBRATING',
    price: 8000,
    priceStr: '₦8,000 (S) • ₦9,000 (M) • ₦10,000 (L)',
    img: '/assets/plugs-vault-chest.webp',
    variants: [
      { name: 'Small', price: 8000, priceStr: '₦8,000', img: '/assets/plug-size-small.webp' },
      { name: 'Medium', price: 9000, priceStr: '₦9,000', img: '/assets/plug-size-medium.webp' },
      { name: 'Large', price: 10000, priceStr: '₦10,000', img: '/assets/plug-size-large.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/plugs-vault-chest.webp', label: 'Collector Vault Chest (All Plugs)' },
      { type: 'image', src: '/assets/plugs-lineup-all.webp', label: 'Full Lineup of All Sizes & Finishes' },
      { type: 'image', src: '/assets/plugs-jeweled-trio.webp', label: 'Faceted Jeweled Chrome Trio' },
      { type: 'image', src: '/assets/plugs-silicone-trio.webp', label: 'Velvet Silicone Trio (In-Hand)' },
      { type: 'image', src: '/assets/plugs-metal-glove.webp', label: 'Chrome Metal Trio (In-Hand)' },
      { type: 'image', src: '/assets/plug-size-small.webp', label: 'Small Size (₦8,000)' },
      { type: 'image', src: '/assets/plug-size-medium.webp', label: 'Medium Size (₦9,000)' },
      { type: 'image', src: '/assets/plug-size-large.webp', label: 'Large Size (₦10,000)' }
    ],
    desc: 'Anatomically tapered for seamless insertion and effortless all-day wear. Crafted in premium non-porous body-safe materials with a slim ergonomic neck and wide flared anchor base for complete safety and confidence. Available in Small (₦8,000), Medium (₦9,000), and Large (₦10,000).',
    specs: [
      { label: 'Finishes', value: 'Velvet Silicone & Mirror Chrome with Faceted Gems' },
      { label: 'Safety', value: 'Slim Flexible Neck with Flared Anchor Base' },
      { label: 'Calibrated Sizing', value: 'Small (₦8k) • Medium (₦9k) • Large (₦10k)' },
      { label: 'Waterproof', value: '100% Waterproof & Submersible (Temperature Play Ready)' },
      { label: 'Hygiene', value: 'Non-Porous, Hypoallergenic & Easy to Clean' }
    ],
    material: 'Body-Safe Liquid Silicone & Solid Chrome Alloy',
    acoustics: '100% Waterproof & Temperature Play Compatible',
    freq: 0,
    pattern: 'manual'
  },
  'rabbit-cock-ring': {
    id: 'rabbit-cock-ring',
    title: 'Rabbit Cock Ring',
    badge: 'RECHARGEABLE',
    price: 25000,
    priceStr: '₦25,000',
    img: '/assets/rabbit-cock-ring.webp',
    media: [
      { type: 'image', src: '/assets/rabbit-cock-ring.webp', label: 'Studio Showcase' },
      { type: 'image', src: '/assets/rabbit-cock-ring-gold.webp', label: 'In-Hand Scale & Charger' },
      { type: 'video', src: '/assets/rabbit-cock-ring-demo.mp4', thumb: '/assets/rabbit-cock-ring.webp', label: 'Live Vibration Demo' }
    ],
    desc: 'Engineered for shared ecstasy and extended stamina. Crafted from ultra-stretchy, silky liquid silicone with an ergonomic dual-loop design that gently restricts blood flow for firmer, longer-lasting erections while simultaneously thrilling her clitoris with powerful buzzing rabbit ears.',
    specs: [
      { label: 'Material', value: '100% Ultra-Elastic Medical Liquid Silicone' },
      { label: 'Couples Function', value: 'Erection Support + Clitoral Flutter Teaser' },
      { label: 'Sound Level', value: '< 30 dB (Whisper Quiet Power)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof (Shower & Bath Safe)' },
      { label: 'Battery', value: 'Magnetic USB Fast Rechargeable' }
    ],
    material: '100% Ultra-Elastic Medical Liquid Silicone',
    acoustics: '< 30 dB (Whisper Quiet Power)',
    freq: 75,
    pattern: 'couples'
  },
  'creature-cock-ring': {
    id: 'creature-cock-ring',
    title: 'Creature Cock Ring',
    badge: 'STAMINA LOCK',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/creature-cock-ring.webp',
    media: [
      { type: 'image', src: '/assets/creature-cock-ring.webp', label: 'Packaging Vault & Dimensions Card' },
      { type: 'image', src: '/assets/creature-cock-ring-fitted.webp', label: 'Shaft-Fitted Ergonomic Contour' },
      { type: 'image', src: '/assets/creature-cock-ring-hand.webp', label: 'Textured Spine & Grip (In-Hand)' }
    ],
    desc: 'Engineered by S-HANDE for unmatched stamina control and extended endurance. Crafted from velvety, medical-grade liquid silicone with an ergonomic contoured spine and dual-retention loops. Locks firm blood flow, prolongs hardness, separates testicles comfortably, and provides an effortless hands-free grip without vibration distraction.',
    specs: [
      { label: 'Brand & Model', value: 'S-HANDE Creature Ergonomic Cock Ring' },
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Length', value: '142 mm (5.59 inches)' },
      { label: 'Dual Loops', value: '34 mm Base Ring & 47 mm Retention Loop' },
      { label: 'Function', value: 'Non-Vibrating Stamina Lock & Delay' },
      { label: 'Waterproof', value: '100% Waterproof & Submersible' }
    ],
    material: 'Ultra-Pure Medical Liquid Silicone & Ergonomic Contoured Spine',
    acoustics: '100% Silent (Non-Vibrating Ergonomic Design)',
    freq: 0,
    pattern: 'manual'
  },
  'pocket-bullet': {
    id: 'pocket-bullet',
    title: 'Velvet Pocket Bullet',
    badge: 'POCKET POWER',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/bullet-vibe-all-colors.webp',
    variants: [
      { name: 'Fuchsia', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-all-colors.webp' },
      { name: 'Black', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.webp' },
      { name: 'Blush', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.webp' },
      { name: 'Purple', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.webp' },
      { name: 'Chrome', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-all-colors.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-vibe-all-colors.webp', label: 'All 5 Colors In-Hand' },
      { type: 'image', src: '/assets/bullet-vibe-matte-trio.webp', label: 'Velvet Matte Colorways' },
      { type: 'image', src: '/assets/bullet-vibe-size-scale.webp', label: 'Scale Comparison & Hand Grip' },
      { type: 'video', src: '/assets/bullet-vibe-demo.mp4', thumb: '/assets/bullet-vibe-all-colors.webp', label: 'Live Vibration Demo' }
    ],
    desc: 'Pure concentrated power in a sleek, lipstick-sized silhouette. Engineered with a whisper-quiet high-torque micro motor and 10 dynamic pulse patterns. Features a velvety soft-touch silicone body (or mirror chrome) with single-button intuitive control. Travel-friendly, 100% waterproof, and completely discreet.',
    specs: [
      { label: 'Vibration Modes', value: '10 Multi-Speed Rhythms & Pulses' },
      { label: 'Finishes', value: '5 Colorways (Fuchsia, Black, Blush, Purple, Chrome)' },
      { label: 'Sound Level', value: '< 35 dB (Sub-Whisper Travel Friendly)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof (Bath & Shower Safe)' },
      { label: 'Portability', value: 'Compact Pocket & Purse Scale' }
    ],
    material: 'Body-Safe Velvet Liquid Silicone & Mirror-Plated Chrome',
    acoustics: '< 35 dB (Discreet Travel Power)',
    freq: 65,
    pattern: 'pulse'
  },
  'contour-bullet-6inch': {
    id: 'contour-bullet-6inch',
    title: 'Heart Bullet 6"',
    badge: '6 INCHES',
    price: 18000,
    priceStr: '₦18,000',
    img: '/assets/bullet-6inch-in-hand.webp',
    variants: [
      { name: 'Purple', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.webp' },
      { name: 'Black', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.webp' },
      { name: 'Fuchsia', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-6inch-in-hand.webp', label: 'All 3 Colors In-Hand' },
      { type: 'image', src: '/assets/bullet-6inch-kit.webp', label: 'Complete Kit & USB Charger' },
      { type: 'video', src: '/assets/bullet-6inch-demo.mp4', thumb: '/assets/bullet-6inch-in-hand.webp', label: 'Live Vibration Rhythm Demo' }
    ],
    desc: 'Extended 6-inch slender reach capped with a brilliant chrome crown and tactile heart button. Features 10 escalating vibration rumbles and flutter rhythms engineered for pinpoint clitoral and full-body pleasure. USB rechargeable with whisper-silent motor and liquid silicone finish.',
    specs: [
      { label: 'Length', value: '6.0 inches (152 mm) Slender Silhouette' },
      { label: 'Control', value: 'One-Touch Tactile Heart Button & Chrome Crown' },
      { label: 'Vibration Modes', value: '10 Multi-Speed Rhythms & Escalating Pulses' },
      { label: 'Sound Level', value: '< 35 dB (Discreet Whisper Power)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof (Bath & Shower Safe)' },
      { label: 'Battery', value: 'USB Magnetic Fast Rechargeable' }
    ],
    material: 'Ultra-Pure Velvet Liquid Silicone & Mirror Chrome Alloy',
    acoustics: '< 35 dB (Discreet Whisper Power)',
    freq: 70,
    pattern: 'pulse'
  },
  'sleek-bullet-7inch': {
    id: 'sleek-bullet-7inch',
    title: 'Sleek Bullet 7"',
    badge: '7 INCHES',
    price: 20000,
    priceStr: '₦20,000',
    img: '/assets/bullet-7inch-metallic-pair.webp',
    variants: [
      { name: 'Magnetic', price: 20000, priceStr: '₦20,000', img: '/assets/bullet-7inch-magnetic-pin-pair.webp' },
      { name: 'Pin', price: 20000, priceStr: '₦20,000', img: '/assets/bullet-7inch-floral-display.webp' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-7inch-metallic-pair.webp', label: 'Dual Metallic Showcase' },
      { type: 'image', src: '/assets/bullet-7inch-magnetic-pin-pair.webp', label: 'Magnetic (Flat Top) vs Pin Charger' },
      { type: 'image', src: '/assets/bullet-7inch-floral-display.webp', label: 'Floral Scale Showcase' },
      { type: 'video', src: '/assets/bullet-7inch-demo.mp4', thumb: '/assets/bullet-7inch-metallic-pair.webp', label: 'Live Rhythm & Power Demo' },
      { type: 'video', src: '/assets/bullet-7inch-action.mp4', thumb: '/assets/bullet-7inch-magnetic-pin-pair.webp', label: 'Action & Speed Demo' }
    ],
    desc: 'Extended 7-inch luxury metallic silhouette delivering high-velocity deep rumbling vibrations. Available in a seamless flat-top magnetic rechargeable edition and a classic fast-charging pin edition. Fully waterproof, whisper quiet, and ergonomically balanced for pinpoint sensations.',
    specs: [
      { label: 'Length', value: '7.0 inches (178 mm) Extended Shaft' },
      { label: 'Charging Variants', value: 'Magnetic Contact (Flat Top) / Fast DC Pin' },
      { label: 'Vibration Modes', value: '10 Multi-Frequency Rumbles & Waves' },
      { label: 'Sound Level', value: '< 35 dB (Discreet Luxury Power)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof (Bath & Shower Safe)' },
      { label: 'Battery', value: 'USB Fast Rechargeable' }
    ],
    material: 'Body-Safe Velvet Liquid Silicone & Mirror Plated Alloy',
    acoustics: '< 35 dB (Discreet Luxury Power)',
    freq: 75,
    pattern: 'pulse'
  },
  'rose-jump-egg': {
    id: 'rose-jump-egg',
    title: 'Rose Jump Egg',
    badge: 'APP CONNECT',
    price: 28000,
    priceStr: '₦28,000',
    img: '/assets/rose-jump-egg-kit.webp',
    media: [
      { type: 'image', src: '/assets/rose-jump-egg-kit.webp', label: 'Egg, Packaging & USB Cable' },
      { type: 'image', src: '/assets/rose-jump-egg-manual.webp', label: 'Instruction Manual & Complete Kit' },
      { type: 'video', src: '/assets/rose-jump-egg-demo.mp4', thumb: '/assets/rose-jump-egg-kit.webp', label: 'Live Vibration Rhythm & App Demo' }
    ],
    desc: 'Discreet, ultra-powerful egg vibrator with an ergonomic retrieval tail and external teaser tip. Seamlessly syncs with your smartphone for intimate long-distance partner control, customized vibration playlists, sound-activated pulsing, and explosive pinpoint pleasure whether at home or out in public.',
    specs: [
      { label: 'Control', value: 'Smartphone App (iOS & Android) + Manual Base Control' },
      { label: 'Long Distance', value: 'Global Partner Control via Internet Sync' },
      { label: 'Design', value: 'Ergonomic Jump Egg with External Teaser Tail' },
      { label: 'Sound Level', value: '< 30 dB (Discreet In-Public Wear)' },
      { label: 'Waterproof', value: 'IPX7 Waterproof & Easy Clean' },
      { label: 'Battery', value: 'USB Fast Rechargeable (Pin Cable Included)' }
    ],
    material: 'Body-Safe Velvety Medical Liquid Silicone',
    acoustics: '< 30 dB (Discreet in Public)',
    freq: 90,
    pattern: 'bluetooth'
  },
  'african-brute': {
    id: 'african-brute',
    title: 'African Brute Tonic',
    badge: 'STAMINA',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/african-brute.webp',
    media: [
      { type: 'image', src: '/assets/african-brute.webp', label: 'Bottle Front' },
      { type: 'image', src: '/assets/african-brute-back.webp', label: 'Directions & NAFDAC Label' }
    ],
    desc: 'An authentic African botanical elixir scientifically crafted with 8 potent natural aphrodisiac extracts including Corynanthe Yohimbe, Muira Puama, and Cola Acuminata. Formulated to enhance stamina, maximize blood flow to sensitive zones, revitalize libido, and intensify climax sensations.',
    specs: [
      { label: 'Volume', value: '500ml Oral Liquid Tonic' },
      { label: 'Certification', value: 'NAFDAC Reg No. A7-5237L' },
      { label: 'Active Formula', value: '8 Traditional African Botanical Extracts' },
      { label: 'Directions', value: '5 Tablespoons (40ml) 30-40 mins before intimacy' }
    ],
    material: '100% Traditional African Botanical Extracts (NAFDAC Reg No. A7-5237L)',
    acoustics: 'Oral Liquid Tonic (500ml) • Rapid Absorption',
    freq: 0,
    pattern: 'herbal'
  },
  'emerald-snakeskin-bdsm-trunk': {
    "id": "emerald-snakeskin-bdsm-trunk",
    "title": "Emerald Bondage Trunk",
    "badge": "10-PIECE VAULT",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8501.webp",
    "desc": "An opulent collector trunk crafted in embossed emerald snakeskin leather with satin crimson lining. Includes heavy-gauge faux-leather wrist cuffs, ankle restraints, connector straps, studded collar with leash, silicone ball gag, and a braided multi-tail flogger with polished gold-tone hardware.",
    "specs": [
        {
            "label": "Ensemble",
            "value": "Collector Chest + 8 Deluxe Restraints"
        },
        {
            "label": "Finish",
            "value": "Emerald Snakeskin Leather & Ruby Velvet"
        },
        {
            "label": "Hardware",
            "value": "Heavy Duty Reinforced Gold-Tone Alloy"
        },
        {
            "label": "Comfort",
            "value": "Plush Padded Neoprene Inner Lining"
        }
    ],
    "material": "Embossed Vegan Leather, Gold Hardware & Soft Neoprene Lining",
    "acoustics": "Sensory Deprivation & Bondage Suite",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8501.webp",
            "label": "Emerald Bondage Trunk"
        }
    ]
},
  'leather-bondage-chest': {
    "id": "leather-bondage-chest",
    "title": "Noir Boudoir Chest",
    "badge": "LUXURY BDSM VAULT",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8618.webp",
    "desc": "Encased in a lockable high-gloss black crocodile-embossed vanity trunk with crimson velvet interior. Features a seductive cat-eye masquerade mask with red piping, padded heart impact paddle, adjustable wrist & ankle cuffs, leash, and gag.",
    "specs": [
        {
            "label": "Includes",
            "value": "Cat Mask, Heart Paddle, Cuffs, Collar & Leash"
        },
        {
            "label": "Trunk Case",
            "value": "Black Crocodile Embossed Lockable Trunk"
        },
        {
            "label": "Accent",
            "value": "High-Contrast Red Edge-Stitching"
        },
        {
            "label": "Safety",
            "value": "Quick-Release Swivel Alloy Clasps"
        }
    ],
    "material": "Crocodile Vegan Leather & Red Velvet Padding",
    "acoustics": "Domination & Sensual Discipline",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8618.webp",
            "label": "Noir Boudoir Chest"
        }
    ]
},
  'love-is-a-gamble-kit': {
    "id": "love-is-a-gamble-kit",
    "title": "Gamble Intimacy Kit",
    "badge": "COUPLES STARTER",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1284.webp",
    "desc": "A playful boudoir starter set combining plush pink fur handcuffs, a delicate tickler feather, soft satin blindfold, and glow-in-the-dark Kama Sutra intimacy dice. Surrender anticipation to the roll of the dice.",
    "specs": [
        {
            "label": "Contents",
            "value": "Fur Cuffs, Satin Blindfold, Tickler, Glow Dice"
        },
        {
            "label": "Cuff Finish",
            "value": "Ultra-Soft Faux Fur with Safety Release Keys"
        },
        {
            "label": "Sensory",
            "value": "Sensory Deprivation & Feather Tease"
        }
    ],
    "material": "Faux Fur, Satin Silk, Natural Feather & Acrylic Dice",
    "acoustics": "Whisper Soft Sensory Play",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1284.webp",
            "label": "Gamble Intimacy Kit"
        }
    ]
},
  'fluffy-bunny-tail-plugs': {
    "id": "fluffy-bunny-tail-plugs",
    "title": "Bunny Tail Plug",
    "badge": "FAUX FUR TAIL",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0283.webp",
    "desc": "An ultra-soft plush faux-fur pom-pom bunny tail mounted to an ergonomically tapered plug. Available in silky liquid silicone stems and mirror-polished stainless steel stems capped with sparkling base jewels.",
    "specs": [
        {
            "label": "Tail Material",
            "value": "Hypoallergenic Ultra-Soft Faux Fur Pom-Pom"
        },
        {
            "label": "Shaft Material",
            "value": "Medical Silicone / Mirror Stainless Steel"
        },
        {
            "label": "Base",
            "value": "Ergonomic Flared Anchor with Embedded Crystal"
        }
    ],
    "material": "Plush Faux Fur & Medical Liquid Silicone / Stainless Steel",
    "acoustics": "Cosplay & Sensual Submission",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Scarlet",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_0283.webp"
        },
        {
            "name": "Noir",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_0284.webp"
        },
        {
            "name": "Violet",
            "price": 20000,
            "priceStr": "₦20,000",
            "img": "/assets/IMG_0286.webp"
        },
        {
            "name": "Blush",
            "price": 20000,
            "priceStr": "₦20,000",
            "img": "/assets/IMG_0288.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0283.webp",
            "label": "Bunny Tail Plug"
        }
    ]
},
  'shibari-bondage-rope': {
    "id": "shibari-bondage-rope",
    "title": "Braided Shibari Rope",
    "badge": "JAPANESE SHIBARI",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5209.webp",
    "desc": "Authentic 10-meter Japanese-style twisted Shibari rope crafted from silky, skin-gentle braided cotton fibers. Zero friction burn, effortless knot tying, and high tensile strength for decorative suspension and sensual body ties.",
    "specs": [
        {
            "label": "Length",
            "value": "10 Meters (32.8 Feet)"
        },
        {
            "label": "Diameter",
            "value": "8mm Skin-Safe Twisted Weave"
        },
        {
            "label": "Texture",
            "value": "Silky Soft Fibers, Zero Rug Burn"
        }
    ],
    "material": "100% Skin-Gentle Braided Cotton Weave",
    "acoustics": "Silent Shibari Bondage Art",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Crimson",
            "price": 15000,
            "priceStr": "₦15,000",
            "img": "/assets/IMG_5209.webp"
        },
        {
            "name": "Midnight",
            "price": 15000,
            "priceStr": "₦15,000",
            "img": "/assets/IMG_5210.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5209.webp",
            "label": "Braided Shibari Rope"
        }
    ]
},
  'luxury-leather-cuffs': {
    "id": "luxury-leather-cuffs",
    "title": "Sovereign Leather Cuffs",
    "badge": "LEATHER RESTRAINTS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7072.webp",
    "desc": "Handcrafted black vegan leather wrist restraints lined with plush fleece to protect delicate skin. Interconnected by a detachable, polished gold link chain and dual swivel snap-hooks.",
    "specs": [
        {
            "label": "Lining",
            "value": "Ultra-Soft Fleece Padding"
        },
        {
            "label": "Hardware",
            "value": "High-Tensile Polished Gold-Tone Steel"
        },
        {
            "label": "Adjustability",
            "value": "Universal Buckle Fit (Wrists & Ankles)"
        }
    ],
    "material": "Heavy Vegan Leather & Polished Gold Alloy",
    "acoustics": "Restraint & Sweet Surrender",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7072.webp",
            "label": "Sovereign Leather Cuffs"
        }
    ]
},
  'hogtie-set': {
    "id": "hogtie-set",
    "title": "Hogtie Set",
    "badge": "BDSM RESTRAINT",
    "price": 10000,
    "priceStr": "₦10,000",
    "img": "/assets/category-bdsm.webp",
    "desc": "A classic hogtie restraint set engineered for delicious immobility and surrender. Features durable reinforced straps with secure quick-connect swivel clips to anchor wrists and ankles in sensual submission. Only available in noir black.",
    "specs": [
        {
            "label": "Color",
            "value": "Noir Black"
        },
        {
            "label": "Hardware",
            "value": "Reinforced Metal Swivel Clasps"
        },
        {
            "label": "Fit",
            "value": "Fully Adjustable Wrist & Ankle Straps"
        },
        {
            "label": "Comfort",
            "value": "Smooth Skin-Safe Padded Straps"
        }
    ],
    "material": "Durable Reinforced Leatherette & Heavy-Duty Hardware",
    "acoustics": "Complete Surrender & Bondage Play",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Black",
            "price": 10000,
            "priceStr": "₦10,000",
            "img": "/assets/category-bdsm.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/category-bdsm.webp",
            "label": "Hogtie Set"
        }
    ]
},
  'restraint-bed-harness': {
    "id": "restraint-bed-harness",
    "title": "Boudoir Bed Harness",
    "badge": "SPREAD-EAGLE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1496.webp",
    "desc": "Discreet under-mattress bed restraint harness designed to transform any standard bed into an inescapable pleasure zone. Fully adjustable nylon straps slip silently beneath your mattress, leaving 4 plush cuffs accessible at each corner.",
    "specs": [
        {
            "label": "Compatibility",
            "value": "Universal Fits Twin, Queen, and King Beds"
        },
        {
            "label": "Straps",
            "value": "Heavy Duty Military Grade Woven Nylon"
        },
        {
            "label": "Cuffs",
            "value": "4 Padded Neoprene Limb Cuffs Included"
        }
    ],
    "material": "High-Tensile Woven Nylon & Soft Neoprene Limb Cuffs",
    "acoustics": "Under-Mattress Stealth Restraint",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1496.webp",
            "label": "Boudoir Bed Harness"
        }
    ]
},
  'strap-on-harness-briefs': {
    "id": "strap-on-harness-briefs",
    "title": "Leather Harness Briefs",
    "badge": "O-RING BRIEFS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_3561.webp",
    "desc": "Ergonomic faux-leather strap-on underwear briefs engineered with a rigid front O-ring plate for maximum thrusting stability. Features elasticized waist adjusters and side buckle cinches for an immovable, non-slip fit.",
    "specs": [
        {
            "label": "Design",
            "value": "Form-Fitting Low Rise Strap-On Briefs"
        },
        {
            "label": "O-Ring Size",
            "value": "1.75 inch (45mm) Heavy-Duty Metal Ring"
        },
        {
            "label": "Fit",
            "value": "Multi-Adjustable Elastic Side Straps"
        }
    ],
    "material": "Textured Faux Leather & Flexible Stretch Elastic",
    "acoustics": "Rigid Thrusting Stability",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3561.webp",
            "label": "Leather Harness Briefs"
        }
    ]
},
  'strap-on-vegan-harness': {
    "id": "strap-on-vegan-harness",
    "title": "Vegan Strap-On Harness",
    "badge": "UNIVERSAL HARNESS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_9851.webp",
    "desc": "Heavy-duty pebbled faux-leather strap-on harness featuring snap-on interchangeable O-rings (3 sizes included) to accommodate slim, medium, or girthy dildos. Wide elastic waistband keeps the base firmly anchored.",
    "specs": [
        {
            "label": "Rings Included",
            "value": "3 Sizes (Chrome Alloy & High-Elastic Rubber)"
        },
        {
            "label": "Waistband",
            "value": "Wide Comfort Stretch Elastic (Waist 26\"-48\")"
        },
        {
            "label": "Base Plate",
            "value": "Triple-Riveted Leather Shield"
        }
    ],
    "material": "Pebbled Vegan Leather, Chrome Rivets & Elastic",
    "acoustics": "Universal Dildo Harness Platform",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_9851.webp",
            "label": "Vegan Strap-On Harness"
        }
    ]
},
  'silicone-bone-gag': {
    "id": "silicone-bone-gag",
    "title": "Silicone Bone Gag",
    "badge": "BREATHABLE RESTRAINT",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_9989.webp",
    "desc": "Novelty dog bone silhouette crafted from seamless, medical-grade velvety silicone mounted to an adjustable vegan leather strap with red top-stitching and secure chrome roller buckle.",
    "specs": [
        {
            "label": "Mouthpiece",
            "value": "Ergonomic Contoured Silicone Dog Bone"
        },
        {
            "label": "Strap",
            "value": "Adjustable Vegan Leather with Metal Buckle"
        },
        {
            "label": "Safety",
            "value": "Zero Chemical Odor, Hypoallergenic & Easy Wash"
        }
    ],
    "material": "100% Medical Grade Liquid Silicone & Vegan Leather",
    "acoustics": "Sensory Speech Restriction",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Crimson",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_9989.webp"
        },
        {
            "name": "Black",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_9989.webp"
        },
        {
            "name": "Pastel",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_9989.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_9989.webp",
            "label": "Silicone Bone Gag"
        }
    ]
},
  'hemp-bondage-harness': {
    "id": "hemp-bondage-harness",
    "title": "Hemp Shibari Harness",
    "badge": "NATURAL FIBER",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_6900.webp",
    "desc": "Twisted natural hemp cuffs equipped with modern quick-slide tension locks. Wrap around wrists, ankles, or thighs in seconds without requiring complex knots, then lock or release with a single push.",
    "specs": [
        {
            "label": "Mechanism",
            "value": "Push-Button Spring Loaded Quick Sliders"
        },
        {
            "label": "Rope Fiber",
            "value": "Natural Braided Hemp Fibers"
        },
        {
            "label": "Usage",
            "value": "Thigh Spreaders, Wrist Cuffs & Ankle Binds"
        }
    ],
    "material": "Natural Hemp Cord & Heavy-Duty ABS Tension Sliders",
    "acoustics": "Instant Quick-Lock Bondage",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_6900.webp",
            "label": "Hemp Shibari Harness"
        }
    ]
},
  'twist-nipple-suckers': {
    "id": "twist-nipple-suckers",
    "title": "Twist Vacuum Suckers",
    "badge": "CALIBRATED VACUUM",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2193.webp",
    "desc": "Dual cylinder suction pumps engineered with a smooth twist-action screw piston. Simply position the soft silicone rim over nipples or clitoris and twist the dial clockwise to dial in calibrated vacuum pressure.",
    "sizes": ["Small", "Large"],
    "specs": [
        {
            "label": "Operation",
            "value": "Twist-Piston Calibrated Vacuum"
        },
        {
            "label": "Rim",
            "value": "Skin-Gentle Airtight Silicone Beveled Rim"
        },
        {
            "label": "Benefits",
            "value": "Heightened Sensitivity & Engorgement"
        }
    ],
    "material": "Medical Polystyrene & Soft Silicone Seal",
    "acoustics": "Silent Mechanical Vacuum Control",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2193.webp",
            "label": "Twist Vacuum Suckers"
        }
    ]
},
  'crystal-glass-plugs': {
    "id": "crystal-glass-plugs",
    "title": "Crystal Glass Plugs",
    "badge": "BOROSILICATE GLASS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_6238.webp",
    "desc": "Handcrafted from pure medical borosilicate glass, suspended with ethereal internal champagne micro-bubbles. Non-porous, perfectly smooth, and ideal for sensory temperature play—soak in warm water for radiant heat or chill in ice.",
    "specs": [
        {
            "label": "Material",
            "value": "100% Medical Grade Borosilicate Glass"
        },
        {
            "label": "Sensation",
            "value": "Temperature Responsive (Heat / Ice Safe)"
        },
        {
            "label": "Safety",
            "value": "Broad Flared Base for Complete Security"
        }
    ],
    "material": "Pure Borosilicate Crystal Glass",
    "acoustics": "Smooth Glass Sensations",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Small",
            "price": 20000,
            "priceStr": "₦20,000",
            "img": "/assets/IMG_6238.webp"
        },
        {
            "name": "Medium",
            "price": 24000,
            "priceStr": "₦24,000",
            "img": "/assets/IMG_6238.webp"
        },
        {
            "name": "Large",
            "price": 28000,
            "priceStr": "₦28,000",
            "img": "/assets/IMG_6238.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_6238.webp",
            "label": "Crystal Glass Plugs"
        }
    ]
},
  'fantasy-tentacle-dildo': {
    "id": "fantasy-tentacle-dildo",
    "title": "Kraken Tentacle Shaft",
    "badge": "TEXTURED SUCTION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5969.webp",
    "desc": "An otherworldly dual-tone octopus tentacle dildo sculpted with escalating raised suction pods along a flexible tapered tip. Features a heavy-duty suction cup base that mounts firmly to any smooth surface.",
    "specs": [
        {
            "label": "Design",
            "value": "Dual-Tone Red & Black Kraken Tentacle"
        },
        {
            "label": "Texture",
            "value": "Graduating Suction Rings & Ridges"
        },
        {
            "label": "Base",
            "value": "Heavy Duty Hands-Free Vacuum Suction Cup"
        }
    ],
    "material": "100% Ultra-Pure Medical Silicone",
    "acoustics": "Deep Texture Fantasy Penetration",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5969.webp",
            "label": "Kraken Tentacle Shaft"
        }
    ]
},
  'naughty-wooden-blocks': {
    "id": "naughty-wooden-blocks",
    "title": "Naughty Stacking Blocks",
    "badge": "TUMBLING TOWER",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8178.webp",
    "desc": "A steamy twist on classic block stacking. Each natural pine wood block is laser-engraved with seductive foreplay commands, dares, and sensual challenges. Pull a block without toppling the tower—or perform whatever sweet punishment is revealed.",
    "specs": [
        {
            "label": "Blocks",
            "value": "48 Solid Engraved Hardwood Blocks"
        },
        {
            "label": "Prompts",
            "value": "Foreplay, Massages, Positions & Dares"
        },
        {
            "label": "Players",
            "value": "Couples & Intimate Groups"
        }
    ],
    "material": "100% Eco-Friendly Laser-Engraved Hardwood",
    "acoustics": "Interactive Couple Game",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8178.webp",
            "label": "Naughty Stacking Blocks"
        }
    ]
},
  'couples-card-vault': {
    "id": "couples-card-vault",
    "title": "Boudoir Card Vault",
    "badge": "TALK FLIRT DARE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8097.webp",
    "desc": "The ultimate intimacy icebreaker and foreplay catalyst. Features 3 distinct progressive decks: Talk (deep sensual questions), Flirt (teasing micro-touches & flirtations), and Dare (spicy bedroom commands and explicit physical challenges).",
    "specs": [
        {
            "label": "Levels",
            "value": "Level 1: Talk • Level 2: Flirt • Level 3: Dare"
        },
        {
            "label": "Cards",
            "value": "150 Premium Linen Finish Playing Cards"
        },
        {
            "label": "Ideal For",
            "value": "Date Nights, Anniversaries & Passion Restarts"
        }
    ],
    "material": "Linen-Finish 350gsm Coated Playing Cards",
    "acoustics": "Intimate Conversation & Foreplay",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8097.webp",
            "label": "Boudoir Card Vault"
        }
    ]
},
  'sexual-position-cards': {
    "id": "sexual-position-cards",
    "title": "52 Position Cards",
    "badge": "WEEKLY INSPIRATION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5106.webp",
    "desc": "52 exquisitely illustrated Kama Sutra position cards designed to inspire passion and expand your bedroom repertoire. Includes difficulty ratings, muscle target guides, and secret stimulation tips for every single week of the year.",
    "specs": [
        {
            "label": "Deck Size",
            "value": "52 Illustrated Position Cards + Rules"
        },
        {
            "label": "Details",
            "value": "Pleasure Ratings & Stimulation Tips"
        },
        {
            "label": "Finish",
            "value": "Gloss Laminated Splash-Resistant Cardstock"
        }
    ],
    "material": "Heavyweight Gloss Coated Playing Cards",
    "acoustics": "Bedroom Inspiration",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5106.webp",
            "label": "52 Position Cards"
        }
    ]
},
  'kailin-water-lube': {
    "id": "kailin-water-lube",
    "title": "Kailin Pure Lube",
    "badge": "ABUJA EXCLUSIVE",
    "price": 10000,
    "priceStr": "₦10,000",
    "inStock": false,
    "img": "/assets/IMG_3632.webp",
    "desc": "Crystal-clear, non-sticky water-based personal lubricant formulated for long-lasting glide and effortless cleanup. 100% condom and silicone-toy compatible, pH-balanced, hypoallergenic, and never leaves a tacky residue.",
    "specs": [
        {
            "label": "Volume",
            "value": "200ml (6.76 fl oz) Dispenser Bottle"
        },
        {
            "label": "Formula",
            "value": "Pure Water-Soluble, pH-Balanced, Glycerin Safe"
        },
        {
            "label": "Safety",
            "value": "Condom & 100% Silicone Toy Compatible"
        }
    ],
    "material": "Aqua, Hydroxyethylcellulose, Vegetable Glycerin, pH Buffer",
    "acoustics": "Effortless Glide & Clean Rinse",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3632.webp",
            "label": "Kailin Pure Lube"
        }
    ]
},
  'kailin-fruitastic-lube': {
    "id": "kailin-fruitastic-lube",
    "title": "Fruitastic Lube Set",
    "badge": "DUO FLAVORS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5001.webp",
    "desc": "Edible, sugar-free flavored personal lubricant in a 5-tube box set (5x 30ml tubes). Delicious natural taste designed for oral foreplay, gentle warming sensations, and sweet intimate discovery without stickiness.",
    "specs": [
        {
            "label": "Flavors",
            "value": "Ripe Strawberry & Sun-Ripened Lemon"
        },
        {
            "label": "Formula",
            "value": "100% Sugar-Free, Non-Staining, Edible"
        },
        {
            "label": "Package",
            "value": "Set of 5 Individual 30ml Travel Tubes"
        }
    ],
    "material": "Purified Water, Natural Fruit Essence, Food-Grade Base",
    "acoustics": "Oral Foreplay & Flavorful Intimacy",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Strawberry",
            "price": 15000,
            "priceStr": "₦15,000",
            "img": "/assets/IMG_5001.webp"
        },
        {
            "name": "Lemon",
            "price": 15000,
            "priceStr": "₦15,000",
            "img": "/assets/IMG_5001.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5001.webp",
            "label": "Fruitastic Lube Set"
        }
    ]
},
  'fragrant-massage-oil': {
    "id": "fragrant-massage-oil",
    "title": "Sensual Massage Oil",
    "badge": "BOTANICAL 500ML",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_6120.webp",
    "desc": "A luxurious 500ml botanical body massage oil that warms upon contact to melt away muscle tension while unlocking skin-to-skin erotic glide. Infused with floral aromatics to awaken sensual arousal.",
    "specs": [
        {
            "label": "Volume",
            "value": "500ml (16.9 fl oz) Convenient Pump Bottle"
        },
        {
            "label": "Botanicals",
            "value": "Natural Sweet Almond, Jojoba & Jasmine Extracts"
        },
        {
            "label": "Absorption",
            "value": "Silky Glide, Deep Hydration, Zero Greasy Residue"
        }
    ],
    "material": "Cold-Pressed Botanical Seed Oils & Jasmine Fragrance",
    "acoustics": "Full Body Skin-to-Skin Sensations",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_6120.webp",
            "label": "Sensual Massage Oil"
        }
    ]
},
  'boss-man-tonic': {
    "id": "boss-man-tonic",
    "title": "Boss Man Elixir",
    "badge": "GINSENG & HONEY",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8709.webp",
    "desc": "Potent traditional botanical elixir combining wild red Panax Ginseng with pure raw honey and root aphrodisiacs. Formulated to enhance male physical vitality, strengthen erection firmness, and supercharge bedroom endurance.",
    "specs": [
        {
            "label": "Volume",
            "value": "125ml Concentrated Oral Tonic"
        },
        {
            "label": "Certification",
            "value": "NAFDAC Reg No. A7-4830L"
        },
        {
            "label": "Key Actives",
            "value": "Red Ginseng Extract, Pure Honey, Herbal Extracts"
        },
        {
            "label": "Dosage",
            "value": "Drink 2 tablespoons 30 mins before intimacy"
        }
    ],
    "material": "Wild Ginseng Extract, Natural Honey & Traditional African Herbs",
    "acoustics": "Peak Endurance & Libido Tonic",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8709.webp",
            "label": "Boss Man Elixir"
        }
    ]
},
  'rhino-choco-vip': {
    "id": "rhino-choco-vip",
    "title": "Rhino VIP Chocolate",
    "badge": "STAMINA CHOCOLATE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7934.webp",
    "desc": "Rich gourmet dark chocolate infused with natural stamina herbs including Maca Root, Tongkat Ali, and Epimedium. Formulated for quick absorption, enhancing blood circulation, firm erections, and intense staying power.",
    "specs": [
        {
            "label": "Form",
            "value": "Gourmet Herbal Dark Chocolate Bar"
        },
        {
            "label": "Active Herbal Blend",
            "value": "Maca, Tongkat Ali, Horny Goat Weed"
        },
        {
            "label": "Onset",
            "value": "Take 30–45 minutes prior to action"
        }
    ],
    "material": "Natural Cocoa, Maca Root Extract & Herbal Stamina Compounds",
    "acoustics": "Sensual Foreplay Treat",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7934.webp",
            "label": "Rhino VIP Chocolate"
        }
    ]
},
  'hygiene-anal-douche': {
    "id": "hygiene-anal-douche",
    "title": "Silicone Douche Bulb",
    "badge": "MEDICAL HYGIENE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_3538.webp",
    "desc": "An essential hygiene companion for confident, clean backdoor intimacy. Features an ergonomic squeezable silicone bulb and a smooth, rounded nozzle with multi-directional spray holes for gentle and thorough cleansing.",
    "specs": [
        {
            "label": "Capacity",
            "value": "225ml Squeeze Bulb"
        },
        {
            "label": "Nozzle",
            "value": "Smooth Rounded Multi-Hole Silicone Tip"
        },
        {
            "label": "Safety",
            "value": "BPA-Free, Phthalate-Free Medical Grade Silicone"
        }
    ],
    "material": "100% Medical Grade Silicone & Detachable Stem",
    "acoustics": "Hygiene & Confidence",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3538.webp",
            "label": "Silicone Douche Bulb"
        }
    ]
},
  'stealth-brush-vibe': {
    "id": "stealth-brush-vibe",
    "title": "Velvet Brush Vibe",
    "badge": "STEALTH DISGUISE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0360.webp",
    "desc": "Disguised seamlessly as an elegant high-end cosmetic powder brush. The top bristles remove to reveal an integrated direct USB charging plug, while the silky soft-touch body packs 10 intense vibration modes controlled by an embossed heart button.",
    "specs": [
        {
            "label": "Discretion",
            "value": "Authentic Makeup Powder Brush Silhouette"
        },
        {
            "label": "Vibration Modes",
            "value": "10 Whisper-Quiet Escalating Frequencies"
        },
        {
            "label": "Charging",
            "value": "Integrated Direct USB Plug (No Cables Needed)"
        },
        {
            "label": "Sound Level",
            "value": "< 30 dB (Complete Privacy)"
        }
    ],
    "material": "Silky Soft-Touch Silicone, Rose-Gold Alloy & Synthetic Bristles",
    "acoustics": "< 30 dB (Stealth In Plain Sight)",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Emerald",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_0360.webp"
        },
        {
            "name": "Noir",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_0364.webp"
        },
        {
            "name": "Bronze",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_0364.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0360.webp",
            "label": "Velvet Brush Vibe"
        }
    ]
},
  'satisfyer-pro-suction': {
    "id": "satisfyer-pro-suction",
    "title": "Satisfyer Pro 2",
    "badge": "AIR-PULSE SUCTION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4334.webp",
    "desc": "The world-renowned touchless clitoral air-wave stimulator in radiant rose gold. Delivers contactless aerodynamic pressure waves that stimulate the deeper clitoral nerves for fast, overwhelming climaxes without numbing or overstimulation.",
    "specs": [
        {
            "label": "Technology",
            "value": "Patented Air-Pulse Wave Technology"
        },
        {
            "label": "Intensity Levels",
            "value": "11 Air-Pressure Wave Settings"
        },
        {
            "label": "Waterproof",
            "value": "IPX7 Submersible (Bath & Shower Safe)"
        },
        {
            "label": "Battery",
            "value": "Magnetic USB Fast Rechargeable"
        }
    ],
    "material": "Body-Safe Matte Silicone & Rose Gold Metal Alloy",
    "acoustics": "< 35 dB (Subtle & Quiet)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4334.webp",
            "label": "Satisfyer Pro 2"
        }
    ]
},
  'empress-magic-wand': {
    "id": "empress-magic-wand",
    "title": "Empress Magic Wand",
    "badge": "HEAVY-DUTY RUMBLE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_6459.webp",
    "desc": "A full-sized luxury magic wand massager delivering deep, bone-rattling low-frequency rumbles. Features a 3-button digital controller (`+`, power, `-`), 360° flexible silicone neck, and weighted motor that conquers tension and induces full-body orgasms.",
    "specs": [
        {
            "label": "Motor Power",
            "value": "High-Torque Deep-Rumble Heavy Motor"
        },
        {
            "label": "Controls",
            "value": "3-Button Intuitive Speed & Rhythm Switcher"
        },
        {
            "label": "Head Design",
            "value": "Flexible 360° Cushioned Silicone Head"
        },
        {
            "label": "Battery",
            "value": "Rechargeable High-Capacity Lithium-Ion"
        }
    ],
    "material": "Silky Medical Silicone & Rose Gold Mirror Trim",
    "acoustics": "Deep Sub-Bass Low-Frequency Rumble",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Matte",
            "price": 35000,
            "priceStr": "₦35,000",
            "img": "/assets/IMG_6459.webp"
        },
        {
            "name": "Fuchsia",
            "price": 35000,
            "priceStr": "₦35,000",
            "img": "/assets/IMG_6459.webp"
        },
        {
            "name": "Purple",
            "price": 35000,
            "priceStr": "₦35,000",
            "img": "/assets/IMG_6459.webp"
        },
        {
            "name": "Chrome",
            "price": 35000,
            "priceStr": "₦35,000",
            "img": "/assets/IMG_6459.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_6459.webp",
            "label": "Empress Magic Wand"
        }
    ]
},
  'cherry-blossom-wand': {
    "id": "cherry-blossom-wand",
    "title": "Sakura Petal Wand",
    "badge": "FLEXIBLE HEAD",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4705.webp",
    "desc": "An enchanting cordless wand massager crowned with delicate silicone blossom petals at the base. Combines a cushioned flexible neck with 10 pulsing rhythms for pinpoint clitoral bliss and decadent relaxation.",
    "specs": [
        {
            "label": "Aesthetics",
            "value": "Sakura Petal Crown & Pearlescent Stem"
        },
        {
            "label": "Patterns",
            "value": "10 Vibration Speeds & Pulsing Waves"
        },
        {
            "label": "Charging",
            "value": "USB DC Pin Fast Rechargeable"
        }
    ],
    "material": "Hypoallergenic Velvet Silicone & Pearlescent Polymer",
    "acoustics": "< 32 dB (Whisper Silent)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4705.webp",
            "label": "Sakura Petal Wand"
        }
    ]
},
  'chrome-pocket-wand': {
    "id": "chrome-pocket-wand",
    "title": "Luxe Pocket Wand",
    "badge": "MIRROR CHROME",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4697.webp",
    "desc": "A sleek, mirror-plated pocket wand featuring an infinite-glide speed slider and a soft ribbed silicone head. Delivers instant, pinpoint clitoral vibrations in an ultra-portable silhouette.",
    "specs": [
        {
            "label": "Control",
            "value": "Smooth Variable Speed Slider Dial"
        },
        {
            "label": "Head",
            "value": "Ribbed Flexible Silicone Nodding Neck"
        },
        {
            "label": "Portability",
            "value": "Compact Travel & Handbag Scale"
        }
    ],
    "material": "High-Gloss Chrome Plated Alloy & Soft Silicone",
    "acoustics": "< 35 dB (Discreet Travel Wand)",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Gold",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_4697.webp"
        },
        {
            "name": "Violet",
            "price": 18000,
            "priceStr": "₦18,000",
            "img": "/assets/IMG_4697.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4697.webp",
            "label": "Luxe Pocket Wand"
        }
    ]
},
  'tulip-dual-stem-vibe': {
    "id": "tulip-dual-stem-vibe",
    "title": "Tulip Blossom Vibe",
    "badge": "DUAL-END STIM",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_6732.webp",
    "desc": "A flexible dual-ended pleasure masterpiece sculpted with an airtight tulip suction mouth on one end and a curved, ribbed G-spot wand on the other. Bend and contour to simultaneously stimulate clitoris and G-spot.",
    "specs": [
        {
            "label": "Dual Function",
            "value": "Aerodynamic Tulip Sucker + Ribbed Wand"
        },
        {
            "label": "Stem",
            "value": "360° Fully Flexible Silicone Connecting Neck"
        },
        {
            "label": "Motors",
            "value": "Independent Dual Power Motors"
        }
    ],
    "material": "100% Medical Grade Liquid Silicone & Rose Gold Accents",
    "acoustics": "< 30 dB (Whisper Silent)",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Blush",
            "price": 32000,
            "priceStr": "₦32,000",
            "img": "/assets/IMG_6732.webp"
        },
        {
            "name": "Rose",
            "price": 32000,
            "priceStr": "₦32,000",
            "img": "/assets/IMG_6732.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_6732.webp",
            "label": "Tulip Blossom Vibe"
        }
    ]
},
  'dual-rose-stem-vibe': {
    "id": "dual-rose-stem-vibe",
    "title": "Rose Bloom Wand",
    "badge": "FLEXIBLE G-SPOT",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7115.webp",
    "desc": "The best of both worlds in one continuous silicone body: the beloved blooming rose air-pulse sucker on one tip, paired with an insertable curved G-spot shaft on the opposite end.",
    "specs": [
        {
            "label": "Combination",
            "value": "Air-Wave Clitoral Suction + G-Spot Shaft"
        },
        {
            "label": "Flexibility",
            "value": "Flexible Memory Silicone Stem"
        },
        {
            "label": "Charging",
            "value": "Magnetic USB Fast Charging"
        }
    ],
    "material": "Silky Medical Silicone & Chrome Trim",
    "acoustics": "< 30 dB (Subtle Power)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7115.webp",
            "label": "Rose Bloom Wand"
        }
    ]
},
  'foxshow-kegel-egg': {
    "id": "foxshow-kegel-egg",
    "title": "Fox Smart Egg",
    "badge": "APP-CONTROLLED",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8112.webp",
    "desc": "Housed in an exquisite jewelry clamshell charging box with rose-gold trim. The ergonomic C-shaped wearable egg slips discreetly inside for pelvic floor toning and orgasmic thrills, connected globally via smartphone app.",
    "specs": [
        {
            "label": "Smart App",
            "value": "Global Partner Control + Music Sync"
        },
        {
            "label": "Case",
            "value": "Magnetic Wireless Clamshell Charging Pod"
        },
        {
            "label": "Sound Level",
            "value": "< 28 dB (Virtually Undetectable in Public)"
        }
    ],
    "material": "Velvety Medical Silicone & Pearl Chrome Shell",
    "acoustics": "< 28 dB (Ultra Silent Stealth)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8112.webp",
            "label": "Fox Smart Egg"
        }
    ]
},
  'wearable-panty-vibe': {
    "id": "wearable-panty-vibe",
    "title": "Fly Panty Vibe",
    "badge": "WIRELESS REMOTE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_3791.webp",
    "desc": "Ultra-thin, ergonomic butterfly wings designed to rest comfortably against the vulva inside any panty. Sync with the wireless remote or smartphone app for heart-racing secret stimulation at the dinner table, movies, or wherever you dare.",
    "specs": [
        {
            "label": "Form Factor",
            "value": "Concealed Curved Wearable Butterfly Wings"
        },
        {
            "label": "Connectivity",
            "value": "Bluetooth Smartphone App + Ergonomic Remote"
        },
        {
            "label": "Waterproof",
            "value": "IPX7 Waterproof & Submersible"
        }
    ],
    "material": "Liquid Silicone & Whisper Silent High-Torque Motor",
    "acoustics": "< 25 dB (Total Public Discretion)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3791.webp",
            "label": "Fly Panty Vibe"
        }
    ]
},
  'c-shape-sucking-vibe': {
    "id": "c-shape-sucking-vibe",
    "title": "C-Shape Panty Vibe",
    "badge": "HANDS-FREE SUCTION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7047.webp",
    "desc": "An advanced anatomical C-curve vibrator that inserts effortlessly for deep G-spot sensations while its external arm locks over the clitoris with targeted suction waves. Hands-free and wearable under lingerie.",
    "specs": [
        {
            "label": "Sensations",
            "value": "Targeted Suction Mouth + Insertable Shaft"
        },
        {
            "label": "Included",
            "value": "Velvet Travel Pouch & USB Fast Pin Cord"
        },
        {
            "label": "Waterproof",
            "value": "100% Waterproof"
        }
    ],
    "material": "100% Medical Grade Velvet Liquid Silicone",
    "acoustics": "< 30 dB (Discreet Wearable)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7047.webp",
            "label": "C-Shape Panty Vibe"
        }
    ]
},
  'palm-sphere-sucker': {
    "id": "palm-sphere-sucker",
    "title": "Palm Sphere Sucker",
    "badge": "ERGONOMIC PALM",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7509.webp",
    "desc": "Compact spherical ergonomic air-pulse sucker that fits naturally into the palm of your hand. Delivers pulsing suction flutter waves with whisper-quiet discretion in vibrant citrus yellow.",
    "specs": [
        {
            "label": "Design",
            "value": "Ergonomic Palm-Grip Round Silhouette"
        },
        {
            "label": "Modes",
            "value": "10 Pulse Frequencies"
        },
        {
            "label": "Charging",
            "value": "Magnetic USB Fast Rechargeable"
        }
    ],
    "material": "Silky Soft Liquid Silicone",
    "acoustics": "< 30 dB (Whisper Silent)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7509.webp",
            "label": "Palm Sphere Sucker"
        }
    ]
},
  'winged-rabbit-sucker': {
    "id": "winged-rabbit-sucker",
    "title": "Winged Empress Rabbit",
    "badge": "AIR-PULSE RABBIT",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0530.webp",
    "desc": "Bold crimson silicone rabbit vibrator featuring contoured butterfly suction wings that envelop the clitoris in airtight air-wave pulses, paired with an insertable ribbed shaft for blended internal orgasms.",
    "specs": [
        {
            "label": "Dual Stim",
            "value": "Air-Wave Suction Wings + G-Spot Internal Ribs"
        },
        {
            "label": "Modes",
            "value": "Independent Dual Motor Controls (10x10 Modes)"
        },
        {
            "label": "Finish",
            "value": "Liquid Silicone & Rose Gold Metal Trim"
        }
    ],
    "material": "Medical Grade Liquid Silicone",
    "acoustics": "< 35 dB (Discreet & Powerful)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0530.webp",
            "label": "Winged Empress Rabbit"
        }
    ]
},
  'triple-threat-remote-rabbit': {
    "id": "triple-threat-remote-rabbit",
    "title": "Heated Remote Rabbit",
    "badge": "THERMAL WARMING",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8684.webp",
    "desc": "The ultimate climax machine. Features 3 simultaneous stimulation zones: clitoral suction ears, an anatomical curved G-spot shaft, and a beaded flexible anal teaser tail, complete with intelligent body-safe warming and wireless remote.",
    "specs": [
        {
            "label": "Triple Zones",
            "value": "G-Spot Shaft + Clitoral Suction + Beaded Anal Tail"
        },
        {
            "label": "Warming",
            "value": "Intelligent 42°C Body-Temperature Thermal Heating"
        },
        {
            "label": "Remote",
            "value": "Ergonomic Wireless Remote Control Included"
        }
    ],
    "material": "100% Medical Grade Velvet Silicone",
    "acoustics": "< 35 dB (Whisper Powerful)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8684.webp",
            "label": "Heated Remote Rabbit"
        }
    ]
},
  'crystal-beaded-rabbit': {
    "id": "crystal-beaded-rabbit",
    "title": "Crystal Beaded Rabbit",
    "badge": "ROTATING BEADS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0474.webp",
    "desc": "Crafted from crystal-clear hypoallergenic jelly-silicone with internally rotating beads that mimic the rhythmic circling of a lover’s fingers, paired with buzzing rabbit ears for intense clitoral thrills.",
    "specs": [
        {
            "label": "Action",
            "value": "Motorized Bi-Directional 360° Rotating Beads"
        },
        {
            "label": "Clitoral Stim",
            "value": "High-Frequency Rabbit Ears"
        },
        {
            "label": "Handle",
            "value": "Ergonomic Chrome Grip with Tactile Controls"
        }
    ],
    "material": "Crystal Jelly Silicone & Chrome Alloy Handle",
    "acoustics": "< 38 dB (Rumbling Sensation)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0474.webp",
            "label": "Crystal Beaded Rabbit"
        }
    ]
},
  'dual-rabbit-tongue-vibe': {
    "id": "dual-rabbit-tongue-vibe",
    "title": "Licking Rabbit Vibe",
    "badge": "FLICKERING TONGUE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4494.webp",
    "desc": "An exquisite royal purple silicone masterpiece featuring dual parallel insertable shafts for blended internal fullness, paired with a motorized silicone flicking tongue that laps rhythmically against the clitoris.",
    "specs": [
        {
            "label": "Dual Shafts",
            "value": "Parallel Contoured Penetrating Stems"
        },
        {
            "label": "Clit Teaser",
            "value": "Motorized Rhythmic Licking Tongue"
        },
        {
            "label": "Finish",
            "value": "Velvety Soft Liquid Silicone & Gold Rings"
        }
    ],
    "material": "Medical Liquid Silicone & Gold Alloy Trim",
    "acoustics": "< 35 dB (Subtle Power)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4494.webp",
            "label": "Licking Rabbit Vibe"
        }
    ]
},
  'jump-o-curved-vibe': {
    "id": "jump-o-curved-vibe",
    "title": "Jump-O G-Spot Vibe",
    "badge": "CURVED SILICONE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5414.webp",
    "desc": "A gracefully curved G-spot dildo vibrator molded from velvety deep-purple silicone, anchored by an ergonomic gold retrieval O-ring handle for effortless grip and thrusting leverage.",
    "specs": [
        {
            "label": "Ergonomics",
            "value": "Curved Anatomical Head & Gold O-Ring Handle"
        },
        {
            "label": "Functions",
            "value": "10 Escalating Multi-Speed Rhythms"
        },
        {
            "label": "Waterproof",
            "value": "100% Submersible & Shower Friendly"
        }
    ],
    "material": "Silky Medical Silicone & Mirror Gold ABS Ring",
    "acoustics": "< 32 dB (Discreet Luxury)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5414.webp",
            "label": "Jump-O G-Spot Vibe"
        }
    ]
},
  'curved-gspot-bullet': {
    "id": "curved-gspot-bullet",
    "title": "Curved G-Spot Bullet",
    "badge": "RETRIEVAL TAIL",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5141.webp",
    "desc": "Anatomically curved bullet vibrator featuring an angled head designed to hit the G-spot directly, balanced by an ergonomic retrieval tail that allows precise positioning and safe wear.",
    "specs": [
        {
            "label": "Tip",
            "value": "Angled G-Spot Anatomical Pressure Head"
        },
        {
            "label": "Tail",
            "value": "Hooked Tail for Retrieval & Clitoral Flutter"
        },
        {
            "label": "Charging",
            "value": "USB DC Fast Rechargeable"
        }
    ],
    "material": "Velvet-Smooth Liquid Silicone",
    "acoustics": "< 30 dB (Whisper Silent)",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Noir",
            "price": 16000,
            "priceStr": "₦16,000",
            "img": "/assets/IMG_5141.webp"
        },
        {
            "name": "Fuchsia",
            "price": 16000,
            "priceStr": "₦16,000",
            "img": "/assets/IMG_5141.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5141.webp",
            "label": "Curved G-Spot Bullet"
        }
    ]
},
  'two-fingers-thrusting-vibe': {
    "id": "two-fingers-thrusting-vibe",
    "title": "Peace Thrusting Vibe",
    "badge": "MOTORIZED THRUST",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1662.webp",
    "desc": "Engineered with dual reciprocating silicone fingers that thrust in and out in rapid rhythmic sequence, recreating the sensation of skilled foreplay fingers with motorized power.",
    "specs": [
        {
            "label": "Action",
            "value": "High-Torque Motorized Reciprocating Thrusting"
        },
        {
            "label": "Fingers",
            "value": "Dual Flexible Anatomical Silicone Tips"
        },
        {
            "label": "Rechargeable",
            "value": "Magnetic USB Rapid Charge"
        }
    ],
    "material": "100% Medical Grade Silicone",
    "acoustics": "< 38 dB (Motorized Thrust)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1662.webp",
            "label": "Peace Thrusting Vibe"
        }
    ]
},
  'sweet-hammer-vibe': {
    "id": "sweet-hammer-vibe",
    "title": "Sweet Hammer Wand",
    "badge": "NOVELTY WAND",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2706.webp",
    "desc": "A playful hammer-inspired wand vibrator featuring a broad silicone mallet head that delivers wide-area rumble pulses across the vulva, clitoris, and external erogenous zones.",
    "specs": [
        {
            "label": "Silhouette",
            "value": "Novelty Mallet Head for Broad Surface Contact"
        },
        {
            "label": "Vibrations",
            "value": "10 Deep Rumbling Frequencies"
        },
        {
            "label": "Waterproof",
            "value": "IPX7 Waterproof"
        }
    ],
    "material": "Velvet Liquid Silicone & Gold Plated Accent",
    "acoustics": "< 32 dB (Deep Rumble)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2706.webp",
            "label": "Sweet Hammer Wand"
        }
    ]
},
  'finger-vibe-ring': {
    "id": "finger-vibe-ring",
    "title": "Sensual Ring Vibe",
    "badge": "FINGER WEARABLE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5568.webp",
    "desc": "An elastic silicone ring that slips onto any finger, transforming your hand into a precision vibrating instrument for sensual massage, nipple play, and clitoral teasing.",
    "specs": [
        {
            "label": "Wearability",
            "value": "Elastic Flexible Ring Fits All Finger Sizes"
        },
        {
            "label": "Tip",
            "value": "Textured Nodule Teaser Tip"
        },
        {
            "label": "Battery",
            "value": "Micro USB Rechargeable"
        }
    ],
    "material": "Silky Stretch Silicone",
    "acoustics": "< 25 dB (Ultra Quiet)",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Purple",
            "price": 14000,
            "priceStr": "₦14,000",
            "img": "/assets/IMG_5568.webp"
        },
        {
            "name": "Blush",
            "price": 14000,
            "priceStr": "₦14,000",
            "img": "/assets/IMG_5568.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5568.webp",
            "label": "Sensual Ring Vibe"
        }
    ]
},
  'interchangeable-vault-4in1': {
    "id": "interchangeable-vault-4in1",
    "title": "4-in-1 Luxury Vault",
    "badge": "INTERCHANGEABLE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2442.webp",
    "desc": "A complete boudoir modular vault containing a rechargeable power handle and 4 twist-lock interchangeable pleasure attachments: air-pulse suction cup, G-spot wand, rabbit head, and pinpoint bullet.",
    "specs": [
        {
            "label": "Attachments",
            "value": "Suction Head, G-Spot Shaft, Rabbit Dual, Bullet"
        },
        {
            "label": "Mechanism",
            "value": "Quick Twist-Lock Watertight Seal"
        },
        {
            "label": "Battery",
            "value": "High-Capacity USB Rechargeable Core"
        }
    ],
    "material": "Medical Silicone & Satin Rose Gold Alloy",
    "acoustics": "< 30 dB (Multi-Head System)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2442.webp",
            "label": "4-in-1 Luxury Vault"
        }
    ]
},
  'strap-on-dildo-kit': {
    "id": "strap-on-dildo-kit",
    "title": "Vibrating Harness Kit",
    "badge": "COMPLETE SUITE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0094.webp",
    "desc": "All-inclusive strap-on pleasure kit featuring an adjustable multi-strap harness, realistic vibrating silicone dildo with suction cup base, and an internal bullet vibe that stimulates the wearer during play.",
    "specs": [
        {
            "label": "Includes",
            "value": "Adjustable Harness, Vibrating Dildo & Wearer Bullet"
        },
        {
            "label": "Shaft",
            "value": "6.5-inch Lifelike Veined Shaft with Suction Base"
        },
        {
            "label": "Vibration",
            "value": "Multi-Speed Bullet Insert Included"
        }
    ],
    "material": "Body-Safe Silicone, Vegan Leather & Woven Nylon",
    "acoustics": "Shared Couples Thrill",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0094.webp",
            "label": "Vibrating Harness Kit"
        }
    ]
},
  'escapade-expert-dildo': {
    "id": "escapade-expert-dildo",
    "title": "Escapade 6\" Dong",
    "badge": "REALISTIC TEXTURE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8315.webp",
    "desc": "Authentic Aphrodisia ESCAPADE 6-inch lifelike silicone dong. Features an anatomically sculpted head, detailed raised veins, firm suction cup base for hands-free play, and internal USB rechargeable vibrations.",
    "specs": [
        {
            "label": "Brand & Model",
            "value": "Aphrodisia ESCAPADE The Expert 6\""
        },
        {
            "label": "Length & Girth",
            "value": "6.0 inches (152mm) Anatomical Scale"
        },
        {
            "label": "Base",
            "value": "Suction Base (Mounts to Flat Surfaces)"
        },
        {
            "label": "Waterproof",
            "value": "100% Submersible Waterproof"
        }
    ],
    "material": "Ultra-Pure Medical Silicone & Suction Base",
    "acoustics": "< 35 dB (Deep Shaft Rumble)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8315.webp",
            "label": "Escapade 6\" Dong"
        }
    ]
},
  'expansion-remote-dildo': {
    "id": "expansion-remote-dildo",
    "title": "Wireless Remote Shaft",
    "badge": "REMOTE SUCTION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_3675.webp",
    "desc": "Lifelike dark ebony silicone dildo with dual-density core, heavy-duty suction cup base, and wireless remote control allowing hands-free operation from across the room.",
    "specs": [
        {
            "label": "Length",
            "value": "7.5 inches Anatomical Silhouette"
        },
        {
            "label": "Control",
            "value": "Wireless Ergonomic Remote Control"
        },
        {
            "label": "Base",
            "value": "Heavy Duty Suction Mount Base"
        }
    ],
    "material": "Dual-Density Medical Grade Silicone",
    "acoustics": "< 32 dB (Remote Controlled)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3675.webp",
            "label": "Wireless Remote Shaft"
        }
    ]
},
  'veined-suction-dildo': {
    "id": "veined-suction-dildo",
    "title": "Veined Suction Shaft",
    "badge": "HANDS-FREE BASE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1280.webp",
    "desc": "Lifelike non-vibrating silicone dildo crafted with a soft outer skin and firm inner spine for natural flex. Features an airtight suction cup base that mounts firmly to mirrors, tiles, and harness plates.",
    "specs": [
        {
            "label": "Feel",
            "value": "Dual-Density Soft Skin with Firm Core"
        },
        {
            "label": "Mounting",
            "value": "Hands-Free Suction Base & Harness Compatible"
        },
        {
            "label": "Length",
            "value": "7.0 inches (178mm)"
        }
    ],
    "material": "100% Non-Porous Medical Liquid Silicone",
    "acoustics": "Silent Pure Penetration",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Ebony",
            "price": 20000,
            "priceStr": "₦20,000",
            "img": "/assets/IMG_1280.webp"
        },
        {
            "name": "Chocolate",
            "price": 20000,
            "priceStr": "₦20,000",
            "img": "/assets/IMG_1281.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1280.webp",
            "label": "Veined Suction Shaft"
        }
    ]
},
  'spiral-swirl-dildo': {
    "id": "spiral-swirl-dildo",
    "title": "Spiral Swirl Shaft",
    "badge": "SPIRAL RIBS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_3943.webp",
    "desc": "Sculpted with continuous raised corkscrew spiral ridges designed to stimulate internal ridges with every thrust. Anchored by a heavy suction base for hands-free bathroom or wall-mounted play.",
    "specs": [
        {
            "label": "Texture",
            "value": "Continuous 360° Corkscrew Spiral Ridges"
        },
        {
            "label": "Base",
            "value": "Wide Vacuum Suction Base"
        },
        {
            "label": "Length",
            "value": "7.2 inches (183mm)"
        }
    ],
    "material": "Velvety Hypoallergenic Medical Silicone",
    "acoustics": "Silent Spiral Thrill",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Tan",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_3943.webp"
        },
        {
            "name": "Crystal",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_3943.webp"
        },
        {
            "name": "Midnight",
            "price": 22000,
            "priceStr": "₦22,000",
            "img": "/assets/IMG_3943.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_3943.webp",
            "label": "Spiral Swirl Shaft"
        }
    ]
},
  'dual-prong-dildo': {
    "id": "dual-prong-dildo",
    "title": "Double Trouble Shaft",
    "badge": "V-DILDO DUO",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2516.webp",
    "desc": "Anatomically designed V-fork dual dildo engineered for simultaneous vaginal and anal fullness. Flexible shafts bend to match individual contours, anchored by a broad suction base.",
    "specs": [
        {
            "label": "Configuration",
            "value": "Dual Flexible Shafts (Vaginal + Anal)"
        },
        {
            "label": "Flexibility",
            "value": "Semi-Rigid Flexible Silicone Core"
        },
        {
            "label": "Base",
            "value": "Suction Cup Base for Hands-Free Play"
        }
    ],
    "material": "Silky Pure Medical Silicone",
    "acoustics": "Dual Penetration Fulfilment",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2516.webp",
            "label": "Double Trouble Shaft"
        }
    ]
},
  'crystal-dual-dildo': {
    "id": "crystal-dual-dildo",
    "title": "Crystal Jelly Shaft",
    "badge": "DUAL PRONG JELLY",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8928.webp",
    "desc": "Clear glass-effect translucent jelly dildo with two side-by-side shafts for deep double stimulation. Perfectly non-porous, waterproof, and compatible with all water-based lubricants.",
    "specs": [
        {
            "label": "Design",
            "value": "Translucent Glass-Look Double Shaft"
        },
        {
            "label": "Base",
            "value": "Wide Clear Suction Lock"
        },
        {
            "label": "Hygiene",
            "value": "100% Non-Porous & Bath Safe"
        }
    ],
    "material": "Crystal Clear Hypoallergenic Jelly PVC",
    "acoustics": "Sublime Internal Fullness",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8928.webp",
            "label": "Crystal Jelly Shaft"
        }
    ]
},
  'neon-pink-remote-dildo': {
    "id": "neon-pink-remote-dildo",
    "title": "Neon Remote Shaft",
    "badge": "WIRED CONTROLLER",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2768.webp",
    "desc": "Vibrant translucent neon pink silicone dildo with realistic anatomical contours and a tethered remote control for effortless speed and vibration pattern changes during play.",
    "specs": [
        {
            "label": "Control",
            "value": "Tethered Push-Button Hand Controller"
        },
        {
            "label": "Base",
            "value": "Heavy Duty Suction Base"
        },
        {
            "label": "Color",
            "value": "Translucent Hot Pink Dual Density"
        }
    ],
    "material": "Silky Soft Silicone & Suction Lock",
    "acoustics": "< 35 dB (Discreet Power)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2768.webp",
            "label": "Neon Remote Shaft"
        }
    ]
},
  'dual-rabbit-suction-dildo': {
    "id": "dual-rabbit-suction-dildo",
    "title": "Dual-Action Rabbit Shaft",
    "badge": "RABBIT SUCTION",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_8745.webp",
    "desc": "Realistic veined shaft featuring an integrated clitoral nudge arm that rests against the clitoris with every thrust. Equipped with a heavy-duty suction base for hands-free shower and wall mounting.",
    "specs": [
        {
            "label": "Design",
            "value": "Veined Penetrating Shaft + Clitoral Nudge Arm"
        },
        {
            "label": "Base",
            "value": "Airtight Vacuum Suction Cup"
        },
        {
            "label": "Compatibility",
            "value": "Harness Ready & Shower Tile Mounting"
        }
    ],
    "material": "Dual-Layer Medical Silicone",
    "acoustics": "Silent Simultaneous Sensation",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Tan",
            "price": 30000,
            "priceStr": "₦30,000",
            "img": "/assets/IMG_8745.webp"
        },
        {
            "name": "Ebony",
            "price": 30000,
            "priceStr": "₦30,000",
            "img": "/assets/IMG_8745.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_8745.webp",
            "label": "Dual-Action Rabbit Shaft"
        }
    ]
},
  'martha-pussy-pump': {
    "id": "martha-pussy-pump",
    "title": "Automatic Vacuum Pump",
    "badge": "RECHARGEABLE PUMP",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1091.webp",
    "desc": "Rechargeable automatic intimate pump featuring an anatomical transparent chamber with a soft silicone seal. Creates gentle, pulsing vacuum pressure to enhance blood flow, swell sensitive tissues, and heighten sensitivity.",
    "specs": [
        {
            "label": "Motor",
            "value": "Automatic Electric Micro-Vacuum Motor"
        },
        {
            "label": "Safety",
            "value": "Instant One-Touch Pressure Relief Valve"
        },
        {
            "label": "Chamber",
            "value": "Clear Measurement Scale & Cushioned Rim"
        }
    ],
    "material": "Surgical Acrylic & Soft Body-Safe Silicone",
    "acoustics": "< 30 dB (Quiet Motor)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1091.webp",
            "label": "Automatic Vacuum Pump"
        }
    ]
},
  'motorized-dual-cock-ring': {
    "id": "motorized-dual-cock-ring",
    "title": "Motorized Cock Ring",
    "badge": "DUAL-LOOP BUZZ",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4149.webp",
    "desc": "Dual-ring ergonomic silicone cock and testicle band with an integrated vibrating bullet teaser. Locks firm erections, delays climax, and thrills your partner’s clitoris during penetration.",
    "specs": [
        {
            "label": "Design",
            "value": "Dual Shaft & Testicle Retention Loops"
        },
        {
            "label": "Motor",
            "value": "Rechargeable Multi-Speed Vibration Core"
        },
        {
            "label": "Elasticity",
            "value": "Ultra-Stretchy 100% Medical Liquid Silicone"
        }
    ],
    "material": "Silky Stretch Medical Silicone",
    "acoustics": "< 32 dB (Whisper Quiet)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4149.webp",
            "label": "Motorized Cock Ring"
        }
    ]
},
  'textured-penis-sleeves': {
    "id": "textured-penis-sleeves",
    "title": "Ribbed Extension Sleeves",
    "badge": "3-PACK SLEEVES",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1208.webp",
    "desc": "Ultra-elastic textured extension sleeves engineered with deep interior ribs and raised external nodules to add extra girth, increase endurance, and heighten sensations for both partners.",
    "specs": [
        {
            "label": "Texture",
            "value": "Deep External Nodules & Internal Ribs"
        },
        {
            "label": "Stretch",
            "value": "High-Elasticity Stretches to Fit All Sizes"
        },
        {
            "label": "Reusable",
            "value": "Easy Wash, Reusable & Condom Safe"
        }
    ],
    "material": "100% Hypoallergenic TPR Silicone",
    "acoustics": "Intense Girth Sensation",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1208.webp",
            "label": "Ribbed Extension Sleeves"
        }
    ]
},
  'cyclone-stroker': {
    "id": "cyclone-stroker",
    "title": "Cyclone 360 Stroker",
    "badge": "360 ROTATING",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_2385.webp",
    "desc": "State-of-the-art automatic male masturbator with 360° motorized multi-directional rotation. Houses a super-soft, beaded ribbed chamber that mimics lifelike oral sensations, complete with hands-free suction control.",
    "specs": [
        {
            "label": "Mechanism",
            "value": "360° Motorized Rotating Beaded Chamber"
        },
        {
            "label": "Speeds",
            "value": "10 Rotational Rhythms & Speeds"
        },
        {
            "label": "Hygiene",
            "value": "Detachable Inner Sleeve for Fast Cleaning"
        }
    ],
    "material": "Medical TPE Inner Core & ABS Ergonomic Casing",
    "acoustics": "< 45 dB (High-Torque Quiet Motor)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_2385.webp",
            "label": "Cyclone 360 Stroker"
        }
    ]
},
  'champion-suction-stroker': {
    "id": "champion-suction-stroker",
    "title": "Champion Cup Stroker",
    "badge": "SUCTION STAND",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_5375.webp",
    "desc": "Futuristic vibrating masturbator cup mounted on a heavy-duty articulating ball-joint suction stand. Locks to desks, chairs, or floors for completely hands-free pleasure, with multi-speed vibration waves.",
    "specs": [
        {
            "label": "Mounting",
            "value": "Hands-Free 360° Articulating Suction Base"
        },
        {
            "label": "Vibration",
            "value": "10 Powerful Rhythmic Pulses"
        },
        {
            "label": "Chamber",
            "value": "Realistic Textured Lip & Inner Tunnel"
        }
    ],
    "material": "Lifelike TPE Sleeve & Heavy Duty Suction Mount",
    "acoustics": "< 40 dB (Hands-Free Pleasure)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_5375.webp",
            "label": "Champion Cup Stroker"
        }
    ]
},
  'beer-cup-stroker': {
    "id": "beer-cup-stroker",
    "title": "Stealth Can Stroker",
    "badge": "DISGUISE CAN",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_0702.webp",
    "desc": "Disguised in plain sight as a realistic beer drink can. The twist-off lid reveals an ultra-soft, lifelike dual-orifice textured silicone inner sleeve with airtight vacuum suction.",
    "specs": [
        {
            "label": "Discretion",
            "value": "Authentic Beverage Can Exterior Design"
        },
        {
            "label": "Inner Sleeve",
            "value": "Ultra-Soft Textured Ribbed TPE"
        },
        {
            "label": "Suction",
            "value": "Air-Release Vacuum Valve on Bottom"
        }
    ],
    "material": "Lifelike TPE Sleeve & Food-Grade Aluminum Shell",
    "acoustics": "Silent Stealth Masturbation",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_0702.webp",
            "label": "Stealth Can Stroker"
        }
    ]
},
  'dual-ended-pocket-stroker': {
    "id": "dual-ended-pocket-stroker",
    "title": "Dual Pocket Stroker",
    "badge": "ORAL & VAGINAL",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_1906.webp",
    "desc": "Pocket-sized dual-channel masturbator with realistic soft lips and teeth on one end, and an anatomical textured vagina on the opposite end. High-elastic TPE hugs firmly with natural body warmth.",
    "specs": [
        {
            "label": "Dual Entry",
            "value": "Realistic Mouth Entry + Textured Vaginal Tunnel"
        },
        {
            "label": "Feel",
            "value": "Super-Elastic Soft TPE with Natural Suction"
        },
        {
            "label": "Portability",
            "value": "Pocket Scale Travel Friendly"
        }
    ],
    "material": "100% Ultra-Soft Hypoallergenic TPE",
    "acoustics": "Silent Natural Sensation",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_1906.webp",
            "label": "Dual Pocket Stroker"
        }
    ]
},
  'stamina-lip-stroker': {
    "id": "stamina-lip-stroker",
    "title": "Stamina Lips Stroker",
    "badge": "VIBRATING LIPS",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_4289.webp",
    "desc": "Ergonomic handheld stroker cup capped with realistic sculpted oral lips. Houses an internal USB vibrating bullet that sends tingling waves straight down the shaft during use.",
    "specs": [
        {
            "label": "Features",
            "value": "Sculpted Oral Lips + Vibrating Bullet Motor"
        },
        {
            "label": "Vibration",
            "value": "Multi-Pattern Rechargeable Bullet"
        },
        {
            "label": "Grip",
            "value": "Contoured Non-Slip Casing"
        }
    ],
    "material": "Silky TPE Sleeve & Protective Hard Case",
    "acoustics": "< 35 dB (Subtle Power)",
    "freq": 70,
    "pattern": "luxe",
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_4289.webp",
            "label": "Stamina Lips Stroker"
        }
    ]
},
  'full-torso-doll': {
    "id": "full-torso-doll",
    "title": "Aphrodite Torso Doll",
    "badge": "DUAL CHANNEL TPE",
    "price": 0,
    "priceStr": "",
    "img": "/assets/IMG_7267.webp",
    "desc": "A heavy, life-sized dual-channel torso sex doll crafted from medical-grade TPE. Features anatomically detailed breasts, sculpted waist, voluptuous hips, and two deeply ribbed canals (vaginal & anal) with airtight suction and lifelike warmth.",
    "specs": [
        {
            "label": "Scale",
            "value": "Life-Sized Realistic Female Torso (approx. 7–9kg)"
        },
        {
            "label": "Canals",
            "value": "Dual Channel (Vaginal & Anal Textured Tunnels)"
        },
        {
            "label": "Material",
            "value": "Medical-Grade Hyper-Realistic Soft TPE"
        }
    ],
    "material": "Hyper-Realistic Medical Grade TPE",
    "acoustics": "Sensual Realistic Full Body Touch",
    "freq": 70,
    "pattern": "luxe",
    "variants": [
        {
            "name": "Almond",
            "price": 150000,
            "priceStr": "₦150,000",
            "img": "/assets/IMG_7267.webp"
        },
        {
            "name": "Caramel",
            "price": 150000,
            "priceStr": "₦150,000",
            "img": "/assets/IMG_7321.webp"
        }
    ],
    "media": [
        {
            "type": "image",
            "src": "/assets/IMG_7267.webp",
            "label": "Aphrodite Torso Doll"
        }
    ]
},
};

function showShareToast(message) {
  let toast = document.getElementById('ttv-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ttv-toast';
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(18,18,22,0.96);color:#fff;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:0 12px 36px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.15);z-index:999999;opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);pointer-events:none;display:flex;align-items:center;gap:8px;';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${message}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3200);
}

function openQuickviewForProduct(prodKey, card = null) {
  const prod = PRODUCT_DATABASE[prodKey];
  if (!prod || !quickviewModal) return;

  currentQvProduct = Object.assign({}, prod);
  if (!card) {
    card = document.querySelector(`.product-card[data-product="${prodKey}"]`) ||
           document.querySelector(`.btn-quick-view[data-product="${prodKey}"]`)?.closest('.product-card');
  }
  currentQvProduct.sourceCard = card;

  // Reset media display
  if (qvVideo) {
    qvVideo.pause();
    qvVideo.style.display = 'none';
  }
  if (qvImg) {
    qvImg.style.display = 'block';
    qvImg.src = prod.img;
  }

  // Check card's currently selected variant
  const cardActiveColor = card?.querySelector('.color-dot.active')?.dataset.color;
  const cardActiveSizePill = card?.querySelector('.size-pill.active');
  const cardActiveSize = cardActiveSizePill?.dataset.size || cardActiveSizePill?.textContent.trim();
  currentQvProduct.cardActiveColor = cardActiveColor;
  currentQvProduct.cardActiveSize = cardActiveSize;

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
              if (source) source.src = item.src;
              qvVideo.src = item.src;
              qvVideo.load();
              const p = qvVideo.play();
              if (p !== undefined) {
                p.catch(err => console.log('Video autoplay deferred:', err));
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
  if (qvPrice) { qvPrice.textContent = prod.priceStr || ''; qvPrice.style.display = prod.priceStr ? 'block' : 'none'; }
  if (qvDesc) qvDesc.textContent = prod.desc;
  if (qvMaterial) qvMaterial.textContent = prod.material || '';
  if (qvAcoustics) qvAcoustics.textContent = prod.acoustics || '';

  // Populate Category-Specific Specs
  if (qvSpecs) {
    qvSpecs.innerHTML = '';
    if (Array.isArray(prod.specs)) {
      prod.specs.forEach((s) => {
        const row = document.createElement('div');
        row.className = 'spec-row';
        row.innerHTML = `<span>${s.label}</span><span>${s.value}</span>`;
        qvSpecs.appendChild(row);
      });
    }
  }

  // Populate Variants if available
  const qvVariantsWrap = document.getElementById('qv-variants-wrap');
  const qvVariants = document.getElementById('qv-variants');
  if (qvVariantsWrap && qvVariants) {
    qvVariants.innerHTML = '';

    let variantsList = prod.variants;
    if (!variantsList || variantsList.length === 0) {
      const cardPills = card ? Array.from(card.querySelectorAll('.size-pill')) : [];
      const cardDots = card ? Array.from(card.querySelectorAll('.color-dot')) : [];
      if (cardPills.length > 0) {
        variantsList = cardPills.map(p => ({
          name: (p.dataset.size || p.textContent).trim(),
          price: p.dataset.price ? parseInt(p.dataset.price, 10) : prod.price,
          priceStr: p.dataset.pricestr || prod.priceStr,
          img: p.dataset.img || prod.img
        }));
      } else if (cardDots.length > 0) {
        variantsList = cardDots.map(d => ({
          name: d.dataset.color || '',
          price: prod.price,
          priceStr: prod.priceStr,
          img: d.dataset.img || prod.img
        }));
      }
    }

    if (variantsList && variantsList.length > 0) {
      qvVariantsWrap.style.display = 'block';

      let selectedIdx = -1;
      if (cardActiveSize) {
        selectedIdx = variantsList.findIndex(v => v.name.toLowerCase().includes(cardActiveSize.toLowerCase()));
      }
      if (selectedIdx === -1 && cardActiveColor) {
        selectedIdx = variantsList.findIndex(v => v.name.toLowerCase().includes(cardActiveColor.toLowerCase()));
      }
      if (selectedIdx === -1 && prod.id !== 'sleek-bullet-7inch') {
        selectedIdx = 0;
      }

      if (selectedIdx >= 0) {
        const def = variantsList[selectedIdx];
        currentQvProduct.selectedVariant = def.name;
        currentQvProduct.selectedPrice = def.price;
        currentQvProduct.selectedImg = def.img;
        if (qvPrice) qvPrice.textContent = def.priceStr;
      } else {
        delete currentQvProduct.selectedVariant;
        delete currentQvProduct.selectedPrice;
        delete currentQvProduct.selectedImg;
      }

      variantsList.forEach((v, idx) => {
        const vBtn = document.createElement('button');
        vBtn.className = `size-pill ${idx === selectedIdx ? 'active' : ''}`;
        vBtn.type = 'button';
        vBtn.textContent = v.name;
        vBtn.dataset.price = v.price;
        vBtn.dataset.pricestr = v.priceStr;
        if (v.img) vBtn.dataset.img = v.img;

        vBtn.addEventListener('click', () => {
          qvVariants.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
          vBtn.classList.add('active');

          currentQvProduct.selectedVariant = v.name;
          currentQvProduct.selectedPrice = v.price;
          currentQvProduct.selectedImg = v.img;

          if (qvPrice) qvPrice.textContent = v.priceStr;

          if (v.img && qvImg) {
            if (qvVideo) qvVideo.style.display = 'none';
            qvImg.style.display = 'block';
            qvImg.src = v.img;

            if (qvThumbs) {
              qvThumbs.querySelectorAll('.qv-thumb').forEach(t => {
                const tImg = t.querySelector('img');
                if (tImg && tImg.getAttribute('src') === v.img) {
                  qvThumbs.querySelectorAll('.qv-thumb').forEach(tb => tb.classList.remove('active'));
                  t.classList.add('active');
                }
              });
            }
          }

          // Sync back to card
          if (currentQvProduct.sourceCard) {
            const sCard = currentQvProduct.sourceCard;
            const vLow = v.name.toLowerCase();

            const matchPill = Array.from(sCard.querySelectorAll('.size-pill')).find(p => {
              const pTxt = (p.dataset.size || p.textContent).trim().toLowerCase();
              return pTxt === vLow || vLow.includes(pTxt);
            });
            if (matchPill) matchPill.click();

            const matchDot = Array.from(sCard.querySelectorAll('.color-dot')).find(d => {
              const dColor = (d.dataset.color || '').toLowerCase();
              return dColor && (dColor === vLow || vLow.includes(dColor));
            });
            if (matchDot) matchDot.click();
          }
        });

        qvVariants.appendChild(vBtn);
      });
    } else {
      qvVariantsWrap.style.display = 'none';
      delete currentQvProduct.selectedVariant;
      delete currentQvProduct.selectedPrice;
      delete currentQvProduct.selectedImg;
    }
  }

  // Update browser URL query parameter seamlessly
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('product', prodKey);
    history.replaceState({ product: prodKey }, '', url.toString());
  } catch (e) {}

  quickviewModal.removeAttribute('hidden');
  quickviewModal.style.display = 'flex';
}

document.querySelectorAll('.btn-quick-view').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodKey = btn.dataset.product;
    const card = btn.closest('.product-card');
    openQuickviewForProduct(prodKey, card);
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
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('product') || url.searchParams.has('p')) {
      url.searchParams.delete('product');
      url.searchParams.delete('p');
      history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  } catch (e) {}
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

// DM Share link button
const btnQvShare = document.getElementById('qv-btn-share');
if (btnQvShare) {
  btnQvShare.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!currentQvProduct) return;
    const origin = window.location.origin || 'https://thetoysvirago.shop';
    const shareUrl = `${origin}/products.html?product=${encodeURIComponent(currentQvProduct.id)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const temp = document.createElement('input');
        temp.value = shareUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showShareToast('Link copied to clipboard!');
    } catch (err) {
      window.prompt('Copy product link:', shareUrl);
    }
  });
}

// Deep link auto open on page load
if (typeof window !== 'undefined') {
  const handleDeepLink = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deepProduct = urlParams.get('product') || urlParams.get('p');
    if (deepProduct && PRODUCT_DATABASE[deepProduct]) {
      setTimeout(() => {
        const card = document.querySelector(`.product-card[data-product="${deepProduct}"]`) ||
                     document.querySelector(`.btn-quick-view[data-product="${deepProduct}"]`)?.closest('.product-card');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        openQuickviewForProduct(deepProduct, card);
      }, 350);
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', handleDeepLink);
  } else {
    handleDeepLink();
  }
}

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
      const variantName = currentQvProduct.selectedVariant;
      const price = currentQvProduct.selectedPrice !== undefined ? currentQvProduct.selectedPrice : currentQvProduct.price;
      const img = currentQvProduct.selectedImg || currentQvProduct.img;
      const baseTitle = currentQvProduct.title.replace(/\s*\([^)]*\)$/, '').trim();

      let finish = variantName || 'Standard';
      if (finish === 'Sucker' || finish === 'Licker') {
        finish = `${finish} Variant`;
      } else if (['S', 'M', 'L', 'XL', 'XXL'].includes(finish)) {
        finish = `Size ${finish}`;
      }

      const title = (finish && finish !== 'Standard')
        ? `${baseTitle} (${finish})`
        : baseTitle;

      const cartKey = `${currentQvProduct.id}__${finish.replace(/\s+/g, '_')}`;

      addToCart({
        id: currentQvProduct.id,
        cartId: cartKey,
        title: title,
        price: price,
        img: img,
        finish: finish
      });
      closeQuickviewModal();
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
const drawerFooter = document.getElementById('drawer-footer');
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
  const finish = product.finish || 'Standard';
  const cartKey = product.cartId || `${product.id}__${finish.replace(/\s+/g, '_')}`;
  const existing = cart.find((item) => (item.cartId || item.id) === cartKey);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: cartKey,
      cartId: cartKey,
      baseId: product.id,
      title: product.title,
      price: product.price,
      img: product.img,
      finish: finish,
      qty: 1
    });
  }
  saveCart();
  showToast(`Added ${product.title} to discreet bag.`);
  openCartDrawer();
}

function updateItemQty(id, delta) {
  const item = cart.find((i) => (i.cartId || i.id) === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => (i.cartId || i.id) !== id);
    }
    saveCart();
  }
}

function removeItem(id) {
  cart = cart.filter((i) => (i.cartId || i.id) !== id);
  saveCart();
  showToast('Item removed from discreet bag.');
}

function openCartDrawer() {
  document.body.classList.add('cart-open');
  const mainHeader = document.getElementById('main-header');
  if (mainHeader) mainHeader.classList.add('nav-collapsed');
  collapseNavDropdown();
  if (cartDrawerOverlay) {
    cartDrawerOverlay.removeAttribute('hidden');
    cartDrawerOverlay.style.display = 'flex';
  }
  const bagPill = document.getElementById('btn-header-bag');
  if (bagPill) bagPill.classList.add('active');
}

function closeCartDrawer() {
  document.body.classList.remove('cart-open');
  const mainHeader = document.getElementById('main-header');
  if (mainHeader) mainHeader.classList.remove('nav-collapsed');
  if (cartDrawerOverlay) {
    cartDrawerOverlay.setAttribute('hidden', '');
    cartDrawerOverlay.style.display = 'none';
  }
  const bagPill = document.getElementById('btn-header-bag');
  if (bagPill) bagPill.classList.remove('active');
}

window.closeCartDrawer = closeCartDrawer;

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
      setTimeout(() => {
        if (drawerFooter) {
          drawerFooter.scrollTo({ top: drawerFooter.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  });
}

function getCardVariantInfo(card, btn) {
  const id = btn.dataset.id;
  const rawBaseTitle = (btn.dataset.baseTitle || btn.dataset.title || '').replace(/\s*\([^)]*\)$/, '').trim();
  const defaultPrice = parseFloat(btn.dataset.price) || 0;
  const defaultImg = btn.dataset.img || '';

  const activeColorDot = card?.querySelector('.color-dot.active');
  const activeSizePill = card?.querySelector('.size-pill.active');
  const activeColor = activeColorDot?.dataset.color;
  const activeSize = activeSizePill?.dataset.size || activeSizePill?.textContent.trim();

  let finish = '';
  if (activeColor && activeSize) {
    finish = `${activeSize} ${activeColor}`;
  } else if (activeSize) {
    finish = activeSize;
  } else if (activeColor) {
    finish = activeColor;
  }

  // Determine exact price from active pill if available, otherwise from button dataset
  let price = defaultPrice;
  if (activeSizePill?.dataset.price) {
    price = parseFloat(activeSizePill.dataset.price);
  } else if (btn.dataset.price) {
    price = parseFloat(btn.dataset.price);
  }

  // Determine exact image from active pill or dot if available
  let img = defaultImg;
  if (activeSizePill?.dataset.img) {
    img = activeSizePill.dataset.img;
  } else if (activeColorDot?.dataset.img) {
    img = activeColorDot.dataset.img;
  } else if (btn.dataset.img) {
    img = btn.dataset.img;
  }

  const title = finish ? `${rawBaseTitle} (${finish})` : rawBaseTitle;
  const cartKey = finish ? `${id}__${finish.replace(/\s+/g, '_')}` : id;

  return { id, cartId: cartKey, title, price, img, finish };
}

// Add to Cart from collection buttons
document.querySelectorAll('.btn-add-cart').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.product-card');
    const itemData = getCardVariantInfo(card, btn);
    addToCart(itemData);
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
    if (drawerFooter) drawerFooter.style.display = 'none';
    drawerItemsList.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-glow-orbit">
          <div class="empty-icon-halo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12C5.2 15 5.2 21 7 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />
              <path d="M10 9C7.8 13 7.8 23 10 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />
              <path d="M26 9C28.2 13 28.2 23 26 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />
              <path d="M29 12C30.8 15 30.8 21 29 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />
              <path d="M18 4.5C15.5 4.5 13.5 6.8 13.5 10V23C13.5 26.5 15.5 29.5 18 29.5C20.5 29.5 22.5 26.5 22.5 23V10C22.5 6.8 20.5 4.5 18 4.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <path d="M14.5 11C16.5 9.5 19.5 9.5 21.5 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />
              <circle cx="18" cy="19.5" r="1.8" fill="currentColor" />
              <line x1="15.5" y1="25.5" x2="20.5" y2="25.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        <h3 class="empty-state-title">Nothing to buzz about.</h3>
        <p class="empty-state-sub">Let's give your bag some good vibrations.</p>

        <a href="/products.html" class="btn btn-black btn-lg empty-shop-cta" onclick="window.closeCartDrawer();">
          <span>Find Your Buzz &rarr;</span>
        </a>
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

  if (drawerFooter) drawerFooter.style.display = 'block';

  // Populate Items
  drawerItemsList.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.title}</h4>
        <div class="cart-item-price">₦${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item-ctrls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.cartId || item.id}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="window.cartUpdateQty('${item.cartId || item.id}', 1)">+</button>
          </div>
          <button class="btn-remove-item" onclick="window.cartRemove('${item.cartId || item.id}')">Remove</button>
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


// ================= 10. CONFESSIONS SLIDESHOW LOGIC =================

// Default community whispers with distinct verified locations and jewel-toned dots
const DEFAULT_COMMUNITY_CONFESSIONS = [
  { text: "the battery life is insane... literally lasted the entire weekend", author: "Client · Maitama", dot: "gold", time: "34m ago" },
  { text: "my partner begged me to bring it to the bedroom tonight", author: "Client · Wuse II", dot: "rose", time: "3h ago" },
  { text: "the suction mode feels like witchcraft, no joke", author: "Client · Ikoyi", dot: "ruby", time: "4h ago" },
  { text: "first time ordering, customer care was so respectful & private", author: "Verified Buyer · Abuja", dot: "gold", time: "5h ago" },
  { text: "i gasped out loud the moment the pulse rhythm shifted", author: "Anonymous · 7h ago", dot: "emerald", time: "7h ago" },

  { text: "softest medical silicone i have ever touched. pure luxury", author: "Client · Port Harcourt", dot: "violet", time: "8h ago" },
  { text: "bought as a secret gift for myself, zero regrets at all", author: "Client · Ikeja GRA", dot: "rose", time: "10h ago" },
  { text: "the warm-up feature took it to an entirely different planet", author: "Client · Asokoro", dot: "ruby", time: "14h ago" },
  { text: "sent to my office in plain wrap. absolute discretion", author: "Client · Marina", dot: "gold", time: "18h ago" },
  { text: "never reaching for anything basic ever again", author: "Anonymous · 1d ago", dot: "emerald", time: "1d ago" },

  { text: "whisper quiet but powerful enough to make me see stars", author: "Client · Garki", dot: "violet", time: "1d ago" },
  { text: "15 minutes in and i had to hold back the scream", author: "Client · Banana Island", dot: "rose", time: "2d ago" }
];

const CONFESSIONS_STORAGE_KEY = 'thetoysvirago_community_confessions_v2';
const REMOVED_CONFESSIONS_TEXTS = [
  "three rounds back to back, my legs were actually shaking",
  "so quiet my flatmate had zero clue in the next room",
  "arrived discreet in an unbranded matte box. 10/10 privacy"
];
let confessionsCurrentSlide = 0;
let confessionsAutoTimer = null;

function escapeConfHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStoredConfessions() {
  try {
    // Clear old storage key if present
    localStorage.removeItem('thetoysvirago_community_confessions');
    const raw = localStorage.getItem(CONFESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any removed confessions
        const filtered = parsed.filter(c => !REMOVED_CONFESSIONS_TEXTS.includes(c.text));
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (e) {
    console.warn('Confessions localStorage read error:', e);
  }
  // Initialize default verified community confessions
  try {
    localStorage.setItem(CONFESSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_COMMUNITY_CONFESSIONS));
  } catch (e) {}
  return [...DEFAULT_COMMUNITY_CONFESSIONS];
}

function saveConfession(text, isAnonymous = true, name = '', location = '') {
  const list = getStoredConfessions();
  const dots = ['ruby', 'gold', 'emerald', 'violet', 'rose'];
  const locations = ['Lekki', 'Maitama', 'Victoria Island', 'Wuse II', 'Ikoyi', 'Abuja', 'Ikeja GRA', 'Asokoro'];
  const fallbackLoc = locations[Math.floor(Math.random() * locations.length)];
  const randomDot = dots[Math.floor(Math.random() * dots.length)];

  const cleanLoc = (location || '').trim();
  const cleanName = (name || '').trim();

  let authorTag = 'Anonymous';
  if (isAnonymous) {
    authorTag = cleanLoc ? `Anonymous · ${cleanLoc}` : 'Anonymous · Just now';
  } else {
    if (cleanName && cleanLoc) {
      authorTag = `${cleanName} · ${cleanLoc}`;
    } else if (cleanName) {
      authorTag = cleanName;
    } else if (cleanLoc) {
      authorTag = `Client · ${cleanLoc}`;
    } else {
      authorTag = `Client · ${fallbackLoc}`;
    }
  }

  const newEntry = {
    id: Date.now(),
    text: text,
    author: authorTag,
    dot: randomDot,
    time: 'Just now',
    date: new Date().toISOString()
  };

  list.unshift(newEntry);
  try {
    localStorage.setItem(CONFESSIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Confessions localStorage save error:', e);
  }

  // Sync confession remotely to Supabase database
  recordSupabaseConfession({
    text: text,
    author: authorTag,
    name: cleanName || null,
    location: cleanLoc || null,
    dot: randomDot,
    is_anonymous: isAnonymous,
    is_approved: true
  }).catch(err => {
    console.warn('[Supabase] Confession remote recording notice:', err);
  });

  confessionsCurrentSlide = 0;
  renderDynamicConfessionsSlides(true);
  return newEntry;
}

function renderDynamicConfessionsSlides(highlightFirst = false) {
  const tracks = document.querySelectorAll('#confessions-slides-track');
  const feed = document.getElementById('confessions-phone-feed');
  const confessions = getStoredConfessions();
  const CHUNK_SIZE = 5;
  const totalSlides = Math.max(1, Math.ceil(confessions.length / CHUNK_SIZE));

  if (confessionsCurrentSlide >= totalSlides) {
    confessionsCurrentSlide = 0;
  }

  // 1. Render Floating Pills Slides on all tracks (index and products)
  tracks.forEach(track => {
    track.innerHTML = '';

    for (let s = 0; s < totalSlides; s++) {
      const slideChunk = confessions.slice(s * CHUNK_SIZE, (s + 1) * CHUNK_SIZE);
      const slideEl = document.createElement('div');
      slideEl.className = `confession-slide ${s === confessionsCurrentSlide ? 'active' : ''}`;
      slideEl.setAttribute('data-slide-index', s);

      slideChunk.forEach((c, idx) => {
        const pillNum = idx + 1;
        const pillEl = document.createElement('div');
        const isNewHighlight = highlightFirst && s === 0 && idx === 0;
        pillEl.className = `confession-pill pill-pos-${pillNum} ${isNewHighlight ? 'is-new' : ''}`;
        
        const dotColor = c.dot || 'ruby';
        const authorText = c.author || 'Anonymous';
        
        pillEl.innerHTML = `
          <div class="pill-header">
            <span class="pill-dot dot-${dotColor}"></span>
            <span class="pill-author">[${escapeConfHtml(authorText)}]</span>
          </div>
          <div class="pill-text">"${escapeConfHtml(c.text)}"</div>
        `;
        slideEl.appendChild(pillEl);
      });

      track.appendChild(slideEl);
    }
  });

  // 2. Render Pagination Dots and Status Tags
  const dotsContainers = document.querySelectorAll('#confessions-dots-track');
  dotsContainers.forEach(container => {
    container.innerHTML = '';
    for (let s = 0; s < totalSlides; s++) {
      const dotBtn = document.createElement('button');
      dotBtn.type = 'button';
      dotBtn.className = `confession-dot-btn ${s === confessionsCurrentSlide ? 'active' : ''}`;
      dotBtn.setAttribute('aria-label', `Go to confessions slide ${s + 1}`);
      dotBtn.addEventListener('click', () => {
        goToConfessionsSlide(s);
        resetConfessionsAutoTimer();
      });
      container.appendChild(dotBtn);
    }
  });
}

function goToConfessionsSlide(targetIndex) {
  const confessions = getStoredConfessions();
  const CHUNK_SIZE = 5;
  const totalSlides = Math.max(1, Math.ceil(confessions.length / CHUNK_SIZE));

  confessionsCurrentSlide = (targetIndex + totalSlides) % totalSlides;

  // Toggle active class on all slide elements
  document.querySelectorAll('.confession-slide').forEach(slide => {
    const sIdx = parseInt(slide.getAttribute('data-slide-index'), 10);
    if (sIdx === confessionsCurrentSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // Update dots
  document.querySelectorAll('.confession-dot-btn').forEach((btn, idx) => {
    if (idx === confessionsCurrentSlide) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function nextConfessionsSlide() {
  goToConfessionsSlide(confessionsCurrentSlide + 1);
}

function prevConfessionsSlide() {
  goToConfessionsSlide(confessionsCurrentSlide - 1);
}

function resetConfessionsAutoTimer() {
  if (confessionsAutoTimer) clearInterval(confessionsAutoTimer);
  confessionsAutoTimer = setInterval(nextConfessionsSlide, 2400);
}

function initConfessionsSlideshow() {
  const modal = document.getElementById('confession-modal');
  const btnOpen = document.getElementById('btn-open-confession');
  const btnPhoneQuick = document.getElementById('btn-phone-quick-confess');
  const btnPhoneQuickProd = document.getElementById('btn-phone-quick-confess-prod');
  const btnClose = document.getElementById('btn-close-confession');
  const form = document.getElementById('confession-form');

  // Initial render of dynamic slides
  renderDynamicConfessionsSlides();
  resetConfessionsAutoTimer();

  // Asynchronously load any remote approved confessions from Supabase
  getSupabaseConfessions().then(remoteList => {
    if (remoteList && remoteList.length > 0) {
      const stored = getStoredConfessions();
      const existingTexts = new Set(stored.map(c => c.text));
      let updated = false;

      remoteList.forEach(rc => {
        if (rc.text && !existingTexts.has(rc.text)) {
          stored.push({
            id: rc.id || Date.now(),
            text: rc.text,
            author: rc.author || 'Anonymous',
            dot: rc.dot || 'ruby',
            time: 'Recent'
          });
          existingTexts.add(rc.text);
          updated = true;
        }
      });

      if (updated) {
        try {
          localStorage.setItem(CONFESSIONS_STORAGE_KEY, JSON.stringify(stored));
        } catch (e) {}
        renderDynamicConfessionsSlides();
      }
    }
  }).catch(() => {});


  // Navigation Buttons (Next / Prev)
  document.querySelectorAll('#btn-confession-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      nextConfessionsSlide();
      resetConfessionsAutoTimer();
    });
  });

  document.querySelectorAll('#btn-confession-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      prevConfessionsSlide();
      resetConfessionsAutoTimer();
    });
  });

  // Pause on hover / touch
  document.querySelectorAll('#cardboard-box-wrap, #confessions-slider-wrap').forEach(wrapper => {
    wrapper.addEventListener('mouseenter', () => {
      if (confessionsAutoTimer) clearInterval(confessionsAutoTimer);
    });
    wrapper.addEventListener('mouseleave', () => {
      resetConfessionsAutoTimer();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      if (confessionsAutoTimer) clearInterval(confessionsAutoTimer);
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          nextConfessionsSlide();
        } else {
          prevConfessionsSlide();
        }
      }
      resetConfessionsAutoTimer();
    }, { passive: true });
  });

  // Modal open triggers
  function openConfessionModal() {
    if (modal) {
      modal.removeAttribute('hidden');
      modal.style.display = 'flex';
    }
  }

  function closeConfessionModal() {
    if (modal) {
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
    }
  }

  if (btnOpen) btnOpen.addEventListener('click', openConfessionModal);
  if (btnPhoneQuick) btnPhoneQuick.addEventListener('click', openConfessionModal);
  if (btnPhoneQuickProd) btnPhoneQuickProd.addEventListener('click', openConfessionModal);
  if (btnClose) btnClose.addEventListener('click', closeConfessionModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeConfessionModal();
    });
  }

  // Handle confession submission: Saves, prepends to Slide 0 & displays on phone + pills
  if (form) {
    const textInput = document.getElementById('conf-text');
    const countEl = document.getElementById('conf-char-count');
    if (textInput && countEl) {
      textInput.addEventListener('input', () => {
        countEl.textContent = `${textInput.value.length}/500`;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textInput ? textInput.value.trim() : '';
      const isAnonInput = document.getElementById('conf-anon');
      const isAnon = isAnonInput ? isAnonInput.checked : true;
      const nameInput = document.getElementById('conf-name');
      const name = nameInput ? nameInput.value.trim() : '';
      const locInput = document.getElementById('conf-location');
      const location = locInput ? locInput.value.trim() : '';

      if (text) {
        saveConfession(text, isAnon, name, location);
      }

      closeConfessionModal();
      form.reset();
      if (isAnonInput) isAnonInput.checked = true;
      if (countEl) countEl.textContent = '0/500';

      if (typeof showToast === 'function') {
        showToast('Confession pinned! It is now live in the community whispers.');
      }
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initConfessionsSlideshow);
} else {
  initConfessionsSlideshow();
}


// ================= 8. DYNAMIC CUSTOM PRODUCTS & LINGERIE CATALOG LOADER =================
function createStoreProductCard(prod, idx) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.category = prod.category || 'lingerie';
  card.dataset.id = prod.id;
  card.dataset.keywords = `${prod.title} ${prod.category} ${prod.badge || ''} lingerie lace sensual boudoir`;

  const variantDotsHtml = (prod.variants && prod.variants.length > 0)
    ? `<div class="color-row">
        ${prod.variants.map((v, i) => `<span class="color-dot ${i === 0 ? 'active' : ''}" data-color="${v.name}" data-img="${v.img || prod.img}" title="${v.name}" style="background: ${v.color || (v.name.toLowerCase().includes('red') || v.name.toLowerCase().includes('ruby') ? '#e11d48' : '#111')};"></span>`).join('')}
        <span class="color-name">${prod.variants[0]?.name || ''}</span>
      </div>`
    : '';

  const sizePillsHtml = (prod.sizes && prod.sizes.length > 0)
    ? `<div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
        ${prod.sizes.map((s, i) => `<button type="button" class="size-pill ${i === 0 ? 'active' : ''}" data-size="${s}">${s}</button>`).join('')}
      </div>`
    : '';

  card.innerHTML = `
    <div class="product-img-wrap">
      <span class="product-badge ruby-badge">${prod.badge || 'NEW ARRIVAL'}</span>
      <img src="${prod.img}" alt="${prod.title}" class="product-img" loading="lazy" decoding="async" />
      <div class="product-overlay">
        <button class="btn-quick-view" data-product="${prod.id}">Quick Look</button>
      </div>
    </div>
    <div class="product-body">
      <div class="product-top">
        <span class="product-sku">${prod.sku || (prod.category.toUpperCase() + ' · ' + String(idx + 1).padStart(2, '0'))}</span>
        <span class="product-price">${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}</span>
      </div>
      <h3 class="product-name">${prod.title}</h3>
      <p class="product-line">${prod.tagline || prod.desc || ''}</p>
      ${variantDotsHtml}
      ${sizePillsHtml}
      <button class="btn btn-black btn-block btn-add-cart"
        data-id="${prod.id}"
        data-title="${prod.title}"
        data-price="${prod.price}"
        data-pricestr="${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}"
        data-img="${prod.img}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Add to Bag
      </button>
    </div>
  `;

  // Wire quickview button
  const qvBtn = card.querySelector('.btn-quick-view');
  if (qvBtn) {
    qvBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickviewForProduct(prod.id, card);
    });
  }

  // Wire add to bag button
  const addBtn = card.querySelector('.btn-add-cart');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemData = getCardVariantInfo(card, addBtn);
      addToCart(itemData);
    });
  }

  // Wire variant dots
  card.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const colorName = card.querySelector('.color-name');
      if (colorName) colorName.textContent = dot.dataset.color;
      if (dot.dataset.img) {
        const cImg = card.querySelector('.product-img');
        if (cImg) cImg.src = dot.dataset.img;
        if (addBtn) addBtn.dataset.img = dot.dataset.img;
      }
      if (addBtn) {
        addBtn.dataset.title = `${prod.title} (${dot.dataset.color})`;
      }
    });
  });

  // Wire size pills
  card.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  return card;
}

export async function initCustomCatalogProducts() {
  const grid = document.getElementById('products-grid');
  const arrivalsGrid = document.getElementById('new-arrivals-grid');

  // Purge any obsolete placeholder cards from the DOM
  document.querySelectorAll('.product-card[data-id="noir-chantilly-teddy"], .product-card[data-id="scarlet-silk-chemise"]').forEach(el => el.remove());

  let customProds = [];
  try {
    const stored = localStorage.getItem('thetoysvirago_custom_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        customProds = parsed.filter(p => p && p.id !== 'noir-chantilly-teddy' && p.id !== 'scarlet-silk-chemise');
        if (customProds.length !== parsed.length) {
          localStorage.setItem('thetoysvirago_custom_products', JSON.stringify(customProds));
        }
      }
    }
  } catch (e) {
    console.warn('[Catalog] Error reading custom products:', e);
  }

  if (!customProds) { customProds = []; }

  // Check Supabase for remote products
  try {
    const remoteProds = await getSupabaseProducts();
    if (remoteProds && Array.isArray(remoteProds) && remoteProds.length > 0) {
      remoteProds.forEach(rp => {
        const existingIdx = customProds.findIndex(p => p.id === rp.id);
        const mapped = {
          id: rp.id,
          title: rp.title,
          category: rp.category || 'toys',
          sku: rp.category ? `${rp.category.toUpperCase()} · ${rp.id.slice(0, 4)}` : 'VAULT · 01',
          badge: rp.badge || 'STORE DROP',
          tagline: rp.tagline || '',
          price: Number(rp.price) || 0,
          priceStr: `₦${Number(rp.price).toLocaleString()}`,
          originalPrice: rp.original_price ? Number(rp.original_price) : null,
          img: rp.image || '/assets/category-lingerie.webp',
          desc: rp.description || '',
          specs: Array.isArray(rp.specs) ? rp.specs.map(s => {
            const parts = s.split(':');
            return { label: parts[0] ? parts[0].trim() : 'Feature', value: parts[1] ? parts[1].trim() : s };
          }) : [],
          variants: Array.isArray(rp.variants) ? rp.variants : [],
          sizes: Array.isArray(rp.sizes) ? rp.sizes : (rp.category === 'lingerie' ? ['S', 'M', 'L'] : []),
          media: Array.isArray(rp.media) && rp.media.length > 0 ? rp.media : [{ type: 'image', src: rp.image || '/assets/category-lingerie.webp', label: rp.title }],
          material: 'Body-Safe Luxury Materials',
          acoustics: 'Discreet Sensation',
          inStock: rp.in_stock !== false
        };
        if (existingIdx >= 0) {
          customProds[existingIdx] = mapped;
        } else {
          customProds.push(mapped);
        }
      });
    }
  } catch(e) {
    console.info('[Supabase] Live sync notice:', e.message);
  }

  // Register all products in PRODUCT_DATABASE and GENERAL_PRODUCT_TERMS
  customProds.forEach((prod) => {
    PRODUCT_DATABASE[prod.id] = {
      id: prod.id,
      title: prod.title,
      badge: prod.badge || 'LUXE BOUDOIR',
      price: Number(prod.price) || 0,
      priceStr: prod.priceStr || `₦${Number(prod.price).toLocaleString()}`,
      img: prod.img || '/assets/category-lingerie.webp',
      desc: prod.desc || prod.tagline || '',
      specs: prod.specs || [],
      variants: prod.variants || [],
      sizes: prod.sizes || [],
      material: prod.material || 'Luxe Body-Safe Materials',
      acoustics: prod.acoustics || 'Sensual Touch',
      freq: 0,
      pattern: prod.category || 'lingerie',
      media: (prod.media && Array.isArray(prod.media) && prod.media.length > 0)
        ? prod.media
        : [{ type: 'image', src: prod.img, label: prod.title }]
    };

    GENERAL_PRODUCT_TERMS[prod.id] = `${prod.title} ${prod.category} ${prod.tagline || ''} ${prod.desc || ''} lingerie underwear boudoir lace bra panties corset`;
  });

  // Inject cards into main products grid on products.html
  if (grid) {
    customProds.forEach((prod, idx) => {
      if (!grid.querySelector(`.product-card[data-id="${prod.id}"]`)) {
        const card = createStoreProductCard(prod, idx);
        grid.prepend(card);
      }
    });

    if (typeof filterProducts === 'function') {
      filterProducts();
    }
  }

  // Inject cards into New Arrivals grid on index.html
  if (arrivalsGrid) {
    arrivalsGrid.innerHTML = '';
    const itemsToShow = customProds.slice(0, 8);
    itemsToShow.forEach((prod, idx) => {
      const card = createStoreProductCard(prod, idx);
      arrivalsGrid.appendChild(card);
    });
    const arrivalsSection = document.getElementById('new-arrivals-section');
    if (arrivalsSection) {
      arrivalsSection.style.display = itemsToShow.length > 0 ? 'block' : 'none';
    }
  }
}

// Expose refresh helper to window
if (typeof window !== 'undefined') {
  window.refreshProductsCatalog = initCustomCatalogProducts;
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initCustomCatalogProducts);
  } else {
    initCustomCatalogProducts();
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
