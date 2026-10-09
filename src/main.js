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
      const noResultsTitle = document.getElementById('no-results-title');
      const noResultsDesc = document.getElementById('no-results-desc');
      const resetBtn = document.getElementById('btn-reset-search');

      if (query) {
        if (noResultsTitle) noResultsTitle.textContent = 'Nothing to buzz about yet.';
        if (noResultsDesc) noResultsDesc.innerHTML = `We couldn't find anything matching "<strong>${query}</strong>". Give it another tease with 'rose', 'bullet', 'dildo', or 'tonic'.`;
        if (resetBtn) resetBtn.textContent = 'Clear Search';
      } else {
        const catName = activeCategory === 'bdsm' ? 'BDSM' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
        if (noResultsTitle) noResultsTitle.textContent = 'Patience is a virtue (and a kink).';
        if (noResultsDesc) noResultsDesc.innerHTML = `We're stocking this vault right now. Our <strong>${catName}</strong> collection will drop shortly. In the meantime, explore our active toys and lubes.`;
        if (resetBtn) resetBtn.textContent = 'Browse All Products';
      }
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
      (targetCategory === 'accessories' && (f === 'accessories' || f === 'bdsm')) ||
      (targetCategory === 'games' && (f === 'games' || f === 'card-games')) ||
      (targetCategory === 'card-games' && (f === 'games' || f === 'card-games'));
  });

  if (matchBtn) {
    applyProductFilter(matchBtn.dataset.filter);
  }
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
      if (label && chosenColor) {
        label.textContent = chosenColor;
      }

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
  'rose-blossom': {
    id: 'rose-blossom',
    title: 'The Rose Sucker',
    badge: 'BESTSELLER • AIR-PULSE SUCTION',
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
      { type: 'image', src: '/assets/rose-sucker-colors.jpg', label: 'Colorways & USB' },
      { type: 'image', src: '/assets/rose-sucker-box.jpg', label: 'Collector Vault' },
      { type: 'image', src: '/assets/rose-sucker-glow.jpg', label: 'Night Glow Edition' },
      { type: 'video', src: '/assets/rose-sucker-demo.mp4', thumb: '/assets/product-rose.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Sculpted like an innocent blooming rose, engineered like an absolute powerhouse. Uses gentle aerodynamic air-wave pulses to stimulate without direct friction, taking you from a teasing flutter to an undeniable crescendo in minutes.',
    specs: [
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Whisper Silent)' },
      { label: 'Waterproof', value: 'IPX7 — Waterproof' },
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
    badge: 'NEW • SUCKER & LICKER',
    price: 35000,
    priceStr: '₦35,000',
    img: '/assets/rose-pair-duo.jpg',
    variants: [
      { name: 'Sucker', price: 35000, priceStr: '₦35,000', img: '/assets/rose-sucker-variant.jpg' },
      { name: 'Licker', price: 35000, priceStr: '₦35,000', img: '/assets/rose-licker-variant.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/rose-pair-duo.jpg', label: 'Duo Models' },
      { type: 'image', src: '/assets/rose-pair-boxes.jpg', label: 'Packaging & Variants' },
      { type: 'image', src: '/assets/rose-sucker-variant.jpg', label: 'Sucker Variant' },
      { type: 'image', src: '/assets/rose-licker-variant.jpg', label: 'Licker Variant' },
      { type: 'video', src: '/assets/rose-pulsating-demo.mp4', thumb: '/assets/rose-pair-duo.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Dual oral sensation options sculpted into a blooming rose silhouette. Choose the Sucker for airtight pulsing flutter waves, or the Licker for rhythmic tongue-stroking ecstasy.',
    specs: [
      { label: 'Material', value: '100% Medical-Grade Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Whisper Silent)' },
      { label: 'Waterproof', value: 'IPX7 — Waterproof' },
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
    badge: 'DEEP RUMBLE • POCKET MASSAGER',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/product-wand.jpg',
    variants: [
      { name: 'Black', price: 15000, priceStr: '₦15,000', img: '/assets/product-wand.jpg' },
      { name: 'Pink', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.jpg' },
      { name: 'Purple', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.jpg' },
      { name: 'Green', price: 15000, priceStr: '₦15,000', img: '/assets/mini-wand-colors.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/product-wand.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/mini-wand-colors.jpg', label: 'All 4 Colors' },
      { type: 'image', src: '/assets/mini-wand-hand.jpg', label: 'In-Hand Scale' },
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
    title: 'Siren App-Controlled',
    badge: 'APP CONNECT • LONG DISTANCE',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/siren-app.jpg',
    variants: [
      { name: 'Red', price: 27000, priceStr: '₦27,000', img: '/assets/siren-app-red.jpg' },
      { name: 'White', price: 27000, priceStr: '₦27,000', img: '/assets/siren-app-white.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/siren-app.jpg', label: 'Studio Cover' },
      { type: 'image', src: '/assets/siren-app-red.jpg', label: 'Red' },
      { type: 'image', src: '/assets/siren-app-white.jpg', label: 'White' },
      { type: 'video', src: '/assets/siren-app-demo.mp4', thumb: '/assets/siren-app.jpg', label: 'Live Video Demo' }
    ],
    desc: 'Long distance? What distance? Discreet, whisper-quiet, and ergonomically curved to slip seamlessly into your panties. Hand full control over to your partner from across the room or across the globe via smartphone app—or surrender to customized rhythm playlists and music vibration modes.',
    specs: [
      { label: 'Material', value: 'Silky Medical Liquid Silicone' },
      { label: 'Sound Level', value: '< 30 dB (Discreet in Public)' },
      { label: 'Waterproof', value: 'IPX7 — Waterproof' },
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
    badge: 'DUAL SIZE • SUCTION BASE',
    price: 15000,
    priceStr: '₦15,000 (6") • ₦17,000 (7")',
    img: '/assets/dildo-trio.jpg',
    variants: [
      { name: '6" Tan', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-tan.jpg' },
      { name: '6" Brown', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-bronze.jpg' },
      { name: '6" Black', price: 15000, priceStr: '₦15,000', img: '/assets/dildo-noir.jpg' },
      { name: '7" Tan', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-tan.jpg' },
      { name: '7" Brown', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-bronze.jpg' },
      { name: '7" Black', price: 17000, priceStr: '₦17,000', img: '/assets/dildo-noir.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/dildo-trio.jpg', label: 'All 3 Colors' },
      { type: 'image', src: '/assets/dildo-tan.jpg', label: 'Tan' },
      { type: 'image', src: '/assets/dildo-bronze.jpg', label: 'Brown' },
      { type: 'image', src: '/assets/dildo-noir.jpg', label: 'Black' }
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
    title: 'Remote Thrusting Shaft',
    badge: 'REMOTE CONTROLLED • MOTORIZED THRUST',
    price: 45000,
    priceStr: '₦45,000',
    img: '/assets/thrusting-dildo-duo.jpg',
    variants: [
      { name: 'Black', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-black.jpg' },
      { name: 'Brown', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-brown.jpg' },
      { name: 'Tan', price: 45000, priceStr: '₦45,000', img: '/assets/thrusting-dildo-tan.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/thrusting-dildo-duo.jpg', label: 'Dual Colors (In-Hand)' },
      { type: 'image', src: '/assets/thrusting-dildo-kit.jpg', label: 'Complete Remote Kit' },
      { type: 'image', src: '/assets/thrusting-dildo-black.jpg', label: 'Black Variant' },
      { type: 'image', src: '/assets/thrusting-dildo-brown.jpg', label: 'Brown Variant' },
      { type: 'image', src: '/assets/thrusting-dildo-tan.jpg', label: 'Tan Variant' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-1.mp4', thumb: '/assets/thrusting-dildo-duo.jpg', label: 'Thrusting Action Demo 1' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-2.mp4', thumb: '/assets/thrusting-dildo-kit.jpg', label: 'Remote Control Demo 2' },
      { type: 'video', src: '/assets/thrusting-dildo-demo-3.mp4', thumb: '/assets/thrusting-dildo-brown.jpg', label: 'Brown Thrusting Demo 3' }
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
    badge: 'AIR-PULSE SUCTION • DUAL STIM',
    price: 35000,
    priceStr: '₦35,000',
    img: '/assets/sucking-rabbit.jpg',
    media: [
      { type: 'image', src: '/assets/sucking-rabbit.jpg', label: 'Studio Showcase' },
      { type: 'image', src: '/assets/sucking-rabbit-box.jpg', label: 'Packaging Vault' },
      { type: 'video', src: '/assets/sucking-rabbit-demo.mp4', thumb: '/assets/sucking-rabbit.jpg', label: 'Live Suction Demo' }
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
    title: 'Sculpted Contour Plugs',
    badge: 'NON-VIBRATING • 3 SIZES',
    price: 8000,
    priceStr: '₦8,000 (S) • ₦9,000 (M) • ₦10,000 (L)',
    img: '/assets/plugs-vault-chest.jpg',
    variants: [
      { name: 'Small', price: 8000, priceStr: '₦8,000', img: '/assets/plug-size-small.jpg' },
      { name: 'Medium', price: 9000, priceStr: '₦9,000', img: '/assets/plug-size-medium.jpg' },
      { name: 'Large', price: 10000, priceStr: '₦10,000', img: '/assets/plug-size-large.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/plugs-vault-chest.jpg', label: 'Collector Vault Chest (All Plugs)' },
      { type: 'image', src: '/assets/plugs-lineup-all.jpg', label: 'Full Lineup of All Sizes & Finishes' },
      { type: 'image', src: '/assets/plugs-jeweled-trio.jpg', label: 'Faceted Jeweled Chrome Trio' },
      { type: 'image', src: '/assets/plugs-silicone-trio.jpg', label: 'Velvet Silicone Trio (In-Hand)' },
      { type: 'image', src: '/assets/plugs-metal-glove.jpg', label: 'Chrome Metal Trio (In-Hand)' },
      { type: 'image', src: '/assets/plug-size-small.jpg', label: 'Small Size (₦8,000)' },
      { type: 'image', src: '/assets/plug-size-medium.jpg', label: 'Medium Size (₦9,000)' },
      { type: 'image', src: '/assets/plug-size-large.jpg', label: 'Large Size (₦10,000)' }
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
    title: 'The Rabbit Cock Ring',
    badge: 'RECHARGEABLE • DUAL STAMINA',
    price: 25000,
    priceStr: '₦25,000',
    img: '/assets/rabbit-cock-ring.jpg',
    media: [
      { type: 'image', src: '/assets/rabbit-cock-ring.jpg', label: 'Studio Showcase' },
      { type: 'image', src: '/assets/rabbit-cock-ring-gold.jpg', label: 'In-Hand Scale & Charger' },
      { type: 'video', src: '/assets/rabbit-cock-ring-demo.mp4', thumb: '/assets/rabbit-cock-ring.jpg', label: 'Live Vibration Demo' }
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
    title: 'Creature Ergonomic Cock Ring',
    badge: 'STAMINA LOCK • NON-VIBRATING',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/creature-cock-ring.jpg',
    media: [
      { type: 'image', src: '/assets/creature-cock-ring.jpg', label: 'Packaging Vault & Dimensions Card' },
      { type: 'image', src: '/assets/creature-cock-ring-fitted.jpg', label: 'Shaft-Fitted Ergonomic Contour' },
      { type: 'image', src: '/assets/creature-cock-ring-hand.jpg', label: 'Textured Spine & Grip (In-Hand)' }
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
    badge: 'POCKET POWER • 10 MODES',
    price: 15000,
    priceStr: '₦15,000',
    img: '/assets/bullet-vibe-all-colors.jpg',
    variants: [
      { name: 'Fuchsia', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-all-colors.jpg' },
      { name: 'Black', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.jpg' },
      { name: 'Blush Pink', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.jpg' },
      { name: 'Purple', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-matte-trio.jpg' },
      { name: 'Chrome', price: 15000, priceStr: '₦15,000', img: '/assets/bullet-vibe-all-colors.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-vibe-all-colors.jpg', label: 'All 5 Colors In-Hand' },
      { type: 'image', src: '/assets/bullet-vibe-matte-trio.jpg', label: 'Velvet Matte Colorways' },
      { type: 'image', src: '/assets/bullet-vibe-size-scale.jpg', label: 'Scale Comparison & Hand Grip' },
      { type: 'video', src: '/assets/bullet-vibe-demo.mp4', thumb: '/assets/bullet-vibe-all-colors.jpg', label: 'Live Vibration Demo' }
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
    title: 'The 6" Heart Bullet',
    badge: '6 INCHES • 🎬 VIDEO',
    price: 18000,
    priceStr: '₦18,000',
    img: '/assets/bullet-6inch-in-hand.jpg',
    variants: [
      { name: 'Purple', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.jpg' },
      { name: 'Black', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.jpg' },
      { name: 'Fuchsia', price: 18000, priceStr: '₦18,000', img: '/assets/bullet-6inch-in-hand.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-6inch-in-hand.jpg', label: 'All 3 Colors In-Hand' },
      { type: 'image', src: '/assets/bullet-6inch-kit.jpg', label: 'Complete Kit & USB Charger' },
      { type: 'video', src: '/assets/bullet-6inch-demo.mp4', thumb: '/assets/bullet-6inch-in-hand.jpg', label: 'Live Vibration Rhythm Demo' }
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
    title: 'The 7" Sleek Bullet',
    badge: '7 INCHES • 🎬 VIDEO',
    price: 20000,
    priceStr: '₦20,000',
    img: '/assets/bullet-7inch-metallic-pair.jpg',
    variants: [
      { name: 'Magnetic Charger', price: 20000, priceStr: '₦20,000', img: '/assets/bullet-7inch-magnetic-pin-pair.jpg' },
      { name: 'Pin Charger', price: 20000, priceStr: '₦20,000', img: '/assets/bullet-7inch-floral-display.jpg' }
    ],
    media: [
      { type: 'image', src: '/assets/bullet-7inch-metallic-pair.jpg', label: 'Dual Metallic Showcase' },
      { type: 'image', src: '/assets/bullet-7inch-magnetic-pin-pair.jpg', label: 'Magnetic (Flat Top) vs Pin Charger' },
      { type: 'image', src: '/assets/bullet-7inch-floral-display.jpg', label: 'Floral Scale Showcase' },
      { type: 'video', src: '/assets/bullet-7inch-demo.mp4', thumb: '/assets/bullet-7inch-metallic-pair.jpg', label: 'Live Rhythm & Power Demo' },
      { type: 'video', src: '/assets/bullet-7inch-action.mp4', thumb: '/assets/bullet-7inch-magnetic-pin-pair.jpg', label: 'Action & Speed Demo' }
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
    title: 'Rose Jump Egg: App-Controlled Egg',
    badge: 'APP CONNECT • 🎬 VIDEO',
    price: 28000,
    priceStr: '₦28,000',
    img: '/assets/rose-jump-egg-kit.jpg',
    media: [
      { type: 'image', src: '/assets/rose-jump-egg-kit.jpg', label: 'Egg, Packaging & USB Cable' },
      { type: 'image', src: '/assets/rose-jump-egg-manual.jpg', label: 'Instruction Manual & Complete Kit' },
      { type: 'video', src: '/assets/rose-jump-egg-demo.mp4', thumb: '/assets/rose-jump-egg-kit.jpg', label: 'Live Vibration Rhythm & App Demo' }
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
    title: 'African Brute Herbal Tincture',
    badge: 'STAMINA',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/african-brute.jpg',
    media: [
      { type: 'image', src: '/assets/african-brute.jpg', label: 'Bottle Front' },
      { type: 'image', src: '/assets/african-brute-back.jpg', label: 'Directions & NAFDAC Label' }
    ],
    desc: 'An authentic African botanical elixir scientifically crafted with 8 potent natural aphrodisiac extracts including Corynanthe Yohimbe, Muira Puama, and Cola Acuminata. Formulated to enhance stamina, maximize blood flow to sensitive zones, revitalize libido, and intensify climax sensations.',
    specs: [
      { label: 'Volume', value: '500ml Oral Liquid Tonic' },
      { label: 'Certification', value: 'NAFDAC Reg No. A7-5237L' },
      { label: 'Active Formula', value: '8 Traditional African Botanical Extracts' },
      { label: 'Directions', value: '5 Tablespoons (40ml) 30–40 mins before intimacy' }
    ],
    material: '100% Traditional African Botanical Extracts (NAFDAC Reg No. A7-5237L)',
    acoustics: 'Oral Liquid Tonic (500ml) • Rapid Absorption',
    freq: 0,
    pattern: 'herbal'
  },
};

document.querySelectorAll('.btn-quick-view').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodKey = btn.dataset.product;
    const prod = PRODUCT_DATABASE[prodKey];
    if (prod && quickviewModal) {
      currentQvProduct = Object.assign({}, prod);
      const card = btn.closest('.product-card');
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
      const cardVariantName = (cardActiveColor && cardActiveSize) ? `${cardActiveSize} ${cardActiveColor}` : (cardActiveSize || cardActiveColor);
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
      if (qvPrice) qvPrice.textContent = prod.priceStr;
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
              name: d.dataset.color || 'Standard',
              price: prod.price,
              priceStr: prod.priceStr,
              img: d.dataset.img || prod.img
            }));
          }
        }

        if (variantsList && variantsList.length > 0) {
          qvVariantsWrap.style.display = 'block';

          let initialIdx = 0;
          if (cardActiveColor && cardActiveSize) {
            const cColorLow = cardActiveColor.toLowerCase();
            const cSizeLow = cardActiveSize.toLowerCase().replace(/["\s]/g, '');
            const matchIdx = variantsList.findIndex(v => {
              const vn = v.name.toLowerCase().replace(/["\s]/g, '');
              return vn.includes(cColorLow) && vn.includes(cSizeLow);
            });
            if (matchIdx !== -1) initialIdx = matchIdx;
          } else if (cardActiveColor) {
            const cColorLow = cardActiveColor.toLowerCase();
            const matchIdx = variantsList.findIndex(v => v.name.toLowerCase() === cColorLow || v.name.toLowerCase().includes(cColorLow));
            if (matchIdx !== -1) initialIdx = matchIdx;
          } else if (cardActiveSize) {
            const cSizeLow = cardActiveSize.toLowerCase();
            const matchIdx = variantsList.findIndex(v => {
              const vn = v.name.toLowerCase();
              return vn === cSizeLow || vn.includes(cSizeLow) || cSizeLow.includes(vn);
            });
            if (matchIdx !== -1) initialIdx = matchIdx;
          } else if (cardVariantName) {
            const matchIdx = variantsList.findIndex(v => {
              const vn = v.name.toLowerCase();
              const cn = cardVariantName.toLowerCase();
              return vn === cn || vn.includes(cn) || cn.includes(vn);
            });
            if (matchIdx !== -1) initialIdx = matchIdx;
          }

          const activeV = variantsList[initialIdx];
          currentQvProduct.selectedVariant = activeV.name;
          currentQvProduct.selectedPrice = activeV.price !== undefined ? activeV.price : prod.price;
          currentQvProduct.selectedImg = activeV.img || prod.img;

          if (activeV.priceStr && qvPrice) {
            qvPrice.textContent = activeV.priceStr;
          } else if (activeV.price && qvPrice) {
            qvPrice.textContent = `₦${activeV.price.toLocaleString()}`;
          }
          if (activeV.img && qvImg) {
            qvImg.src = activeV.img;
          }

          const hasDifferentPrices = variantsList.some(v => (v.price !== undefined ? v.price : prod.price) !== (variantsList[0].price !== undefined ? variantsList[0].price : prod.price));

          variantsList.forEach((v, idx) => {
            const vBtn = document.createElement('button');
            vBtn.className = `size-pill ${idx === initialIdx ? 'active' : ''}`;
            vBtn.type = 'button';
            vBtn.textContent = (hasDifferentPrices && v.priceStr) ? `${v.name} (${v.priceStr})` : v.name;
            vBtn.dataset.variant = v.name;

            vBtn.addEventListener('click', () => {
              qvVariants.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
              vBtn.classList.add('active');

              currentQvProduct.selectedVariant = v.name;
              currentQvProduct.selectedPrice = v.price !== undefined ? v.price : prod.price;
              currentQvProduct.selectedImg = v.img || prod.img;

              if (qvPrice) {
                if (v.priceStr) {
                  qvPrice.textContent = v.priceStr;
                } else if (v.price) {
                  qvPrice.textContent = `₦${v.price.toLocaleString()}`;
                }
              }

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

                // If card has size pills, match pill
                const matchPill = Array.from(sCard.querySelectorAll('.size-pill')).find(p => {
                  const pTxt = (p.dataset.size || p.textContent).trim().toLowerCase();
                  return pTxt === vLow || vLow.includes(pTxt);
                });
                if (matchPill) matchPill.click();

                // If card has color dots, match dot
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
    }
  });
}

function getCardVariantInfo(card, btn) {
  const id = btn.dataset.id;
  const rawBaseTitle = (btn.dataset.baseTitle || btn.dataset.title || '').replace(/\s*\([^)]*\)$/, '').trim();
  const defaultPrice = parseFloat(btn.dataset.price) || 0;
  const defaultImg = btn.dataset.img || '';

  const activeColorDot = card?.querySelector('.color-dot.active');
  let activeSizePill = card?.querySelector('.size-pill.active');
  if (!activeSizePill && card?.querySelector('.size-pill')) {
    const firstPill = card.querySelector('.size-pill');
    if (firstPill) {
      firstPill.click();
      activeSizePill = firstPill;
    }
  }
  const activeColor = activeColorDot?.dataset.color;
  const activeSize = activeSizePill?.dataset.size || activeSizePill?.textContent.trim();

  let finish = 'Standard';
  if (activeColor && activeSize) {
    finish = `${activeSize} ${activeColor}`;
  } else if (activeSize) {
    if (activeSize === 'Sucker' || activeSize === 'Licker') {
      finish = `${activeSize} Variant`;
    } else if (['S', 'M', 'L', 'XL', 'XXL'].includes(activeSize)) {
      finish = `Size ${activeSize}`;
    } else {
      finish = activeSize;
    }
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

  const title = (finish && finish !== 'Standard') ? `${rawBaseTitle} (${finish})` : rawBaseTitle;
  const cartKey = `${id}__${finish.replace(/\s+/g, '_')}`;

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
        ${item.finish && item.finish !== 'Standard' ? `
          <div class="cart-item-variant-pill">
            <span class="variant-pill-dot"></span>
            <span>${item.finish}</span>
          </div>
        ` : ''}
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
