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
    badge: 'NEW • SUCKER & LICKER',
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
    badge: 'DEEP RUMBLE • POCKET MASSAGER',
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
    badge: 'APP CONNECT • LONG DISTANCE',
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
    badge: 'RECHARGEABLE • STEALTH LUXE',
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
    badge: 'DUAL SIZE • SUCTION BASE',
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
    badge: 'REMOTE CONTROLLED • MOTORIZED THRUST',
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
    badge: 'AIR-PULSE SUCTION • DUAL STIM',
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
    badge: 'NON-VIBRATING • 3 SIZES',
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
    badge: 'RECHARGEABLE • DUAL STAMINA',
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
    badge: 'STAMINA LOCK • NON-VIBRATING',
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
    badge: 'POCKET POWER • 10 MODES',
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
    badge: '6 INCHES • 🎬 VIDEO',
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
    badge: '7 INCHES • 🎬 VIDEO',
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
    badge: 'APP CONNECT • 🎬 VIDEO',
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
    "badge": "WATER-BASED 200ML",
    "price": 0,
    "priceStr": "",
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
      showShareToast('DM link copied! Ready to share in DMs.');
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
function initConfessionsSlideshow() {
  const track = document.getElementById('confessions-slides-track');
  const slides = document.querySelectorAll('.confession-slide');
  const toyTabs = document.querySelectorAll('.toy-tab-card');
  const btnPrev = document.getElementById('btn-confession-prev');
  const btnNext = document.getElementById('btn-confession-next');
  const sliderWrap = document.getElementById('confessions-slider-wrap');
  const stage = document.querySelector('.toybox-stage');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  let loopTimer = null;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Shift track like collections slideshow
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Active slide class triggers staggered pop-out animations for pills
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });

    // Update active toy tab underneath
    toyTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === currentSlide);
    });
  }

  // Automatic looping interval (every 3.6s)
  function startLoop() {
    stopLoop();
    loopTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 3600);
  }

  function stopLoop() {
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  toyTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      goToSlide(i);
      startLoop();
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      startLoop();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      startLoop();
    });
  }

  // Pause loop on hover for desktop readability, resume on leave
  if (stage) {
    stage.addEventListener('mouseenter', stopLoop);
    stage.addEventListener('mouseleave', startLoop);
  }

  // Touch Swipe Support
  if (sliderWrap) {
    let touchStartX = 0;
    let touchEndX = 0;
    sliderWrap.addEventListener('touchstart', (e) => {
      stopLoop();
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToSlide(currentSlide - 1);
        } else {
          goToSlide(currentSlide + 1);
        }
      }
      startLoop();
    }, { passive: true });
  }

  // Modal open
  const modal = document.getElementById('confession-modal');
  const btnOpen = document.getElementById('btn-open-confession');
  const btnClose = document.getElementById('btn-close-confession');
  const form = document.getElementById('confession-form');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      stopLoop();
      modal.removeAttribute('hidden');
      modal.style.display = 'flex';
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
      startLoop();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
        startLoop();
      }
    });
  }

  if (form && modal) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
      form.reset();
      startLoop();
      if (typeof showToast === 'function') {
        showToast('Confession placed inside the vault with zero trace. Thank you.');
      }
    });
  }

  goToSlide(0);
  startLoop();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initConfessionsSlideshow);
} else {
  initConfessionsSlideshow();
}
