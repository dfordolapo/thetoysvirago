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
const btnInstallPwa = document.getElementById('btn-install-pwa');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstallPwa) {
    btnInstallPwa.hidden = false;
  }
});

if (btnInstallPwa) {
  btnInstallPwa.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('User PWA install outcome:', outcome);
    deferredPrompt = null;
    btnInstallPwa.hidden = true;
  });
}

// ================= 2. AGE VERIFICATION GATE =================
const ageGate = document.getElementById('age-gate');
const btnEnterGate = document.getElementById('btn-enter-gate');
const btnExitGate = document.getElementById('btn-exit-gate');
const resetAgeGate = document.getElementById('reset-age-gate');

const isAgeVerified = localStorage.getItem('rouge_age_verified') === 'true';

if (isAgeVerified && ageGate) {
  ageGate.style.display = 'none';
}

if (btnEnterGate) {
  btnEnterGate.addEventListener('click', () => {
    localStorage.setItem('rouge_age_verified', 'true');
    ageGate.classList.add('fade-out');
    setTimeout(() => {
      ageGate.style.display = 'none';
    }, 500);
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
    localStorage.removeItem('rouge_age_verified');
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
      openModals.forEach((m) => m.hidden = true);
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

// Mobile Nav Dropdown
const btnMobileMenu = document.getElementById('btn-mobile-menu');
const navDropdown = document.getElementById('nav-dropdown');
const navClosers = document.querySelectorAll('.nav-closer');

if (btnMobileMenu && navDropdown) {
  btnMobileMenu.addEventListener('click', () => {
    navDropdown.hidden = !navDropdown.hidden;
  });
}

if (navClosers) {
  navClosers.forEach(c => {
    c.addEventListener('click', () => {
      if (navDropdown) navDropdown.hidden = true;
    });
  });
}



// ================= 5. PRODUCT CATALOGUE & FILTERING =================
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    productCards.forEach((card) => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Interactive Finish / Color Dots
document.querySelectorAll('.color-selector').forEach((selector) => {
  const dots = selector.querySelectorAll('.color-dot');
  const label = selector.querySelector('.selected-color-name');

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      dots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (label && dot.dataset.color) {
        label.textContent = dot.dataset.color;
      }
    });
  });
});


// ================= 6. PRODUCT QUICK VIEW MODAL =================
const quickviewModal = document.getElementById('quickview-modal');
if (quickviewModal) quickviewModal.style.display = 'none';
const btnCloseModal = document.getElementById('btn-close-modal');
const qvImg = document.getElementById('qv-img');
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
    price: 185.00,
    priceStr: '$185.00',
    img: '/assets/hero-device.jpg',
    desc: 'Precision engineered with dual harmonic vibration engines. Calibrated for 28Hz sub-bass waves that penetrate deeply without surface numbing. Velvet-touch liquid silicone body.',
    material: 'Double-Cured Medical Liquid Silicone & Ruby Chrome Alloy',
    acoustics: '< 28 dB (Sub-Whisper Level at Peak Power)',
    freq: 28,
    pattern: 'throb'
  },
  'rose-blossom': {
    id: 'rose-blossom',
    title: 'Velvet Rose Blossom',
    badge: 'SONIC AIR-WAVE • TOUCHLESS',
    price: 145.00,
    priceStr: '$145.00',
    img: '/assets/product-rose.jpg',
    desc: 'Gentle aerodynamic air pulsations create contactless pleasure waves mimicking sensual oral stimulation. Petal contours hug anatomy effortlessly with 8 sonic speeds.',
    material: '100% Japanese Medical-Grade Liquid Silicone',
    acoustics: '< 25 dB (Submersible Whisper)',
    freq: 68,
    pattern: 'surge'
  },
  'sceptre-wand': {
    id: 'sceptre-wand',
    title: 'The Sceptre Wand',
    badge: 'HIGH TORQUE • BRUSHLESS CORE',
    price: 195.00,
    priceStr: '$195.00',
    img: '/assets/product-wand.jpg',
    desc: 'Industrial-grade brushless core delivering heavy sub-rumble torque rather than sharp buzzy vibrations. Ideal for deep somatic release and transcendent full-body intimacy.',
    material: 'Ergonomic Weighted Alloy Core with Soft Velvet Silicone Cap',
    acoustics: '< 30 dB (Acoustically Dampened)',
    freq: 140,
    pattern: 'continuous'
  },
  'aura-elixir': {
    id: 'aura-elixir',
    title: 'Aura Intimate Elixir',
    badge: 'APOTHECARY • 100% ORGANIC',
    price: 65.00,
    priceStr: '$65.00',
    img: '/assets/product-serum.jpg',
    desc: 'Botanical hybrid nectar infused with wild Mexican damiana, calming ashwagandha, and multi-weight vegan hyaluronic moisture. Silicone-safe, body-identical pH 3.9.',
    material: 'Frosted Obsidian Glass Flacon with Ruby Wax Seal',
    acoustics: '100% Natural Organic Botanicals',
    freq: 42,
    pattern: 'whisper'
  }
};

document.querySelectorAll('.btn-quick-view').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodKey = btn.dataset.product;
    const prod = PRODUCT_DATABASE[prodKey];
    if (prod && quickviewModal) {
      currentQvProduct = prod;
      if (qvImg) qvImg.src = prod.img;
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

if (btnCloseModal && quickviewModal) {
  btnCloseModal.addEventListener('click', () => {
    quickviewModal.setAttribute('hidden', '');
    quickviewModal.style.display = 'none';
  });

  quickviewModal.addEventListener('click', (e) => {
    if (e.target === quickviewModal) {
      quickviewModal.setAttribute('hidden', '');
      quickviewModal.style.display = 'none';
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
  if (cartDrawerOverlay) {
    cartDrawerOverlay.removeAttribute('hidden');
    cartDrawerOverlay.style.display = 'flex';
  }
}

function closeCartDrawer() {
  if (cartDrawerOverlay) {
    cartDrawerOverlay.setAttribute('hidden', '');
    cartDrawerOverlay.style.display = 'none';
  }
}

if (btnCartDropdown) btnCartDropdown.addEventListener('click', () => {
  openCartDrawer();
  const navDrop = document.getElementById('nav-dropdown');
  if (navDrop) navDrop.hidden = true;
});
if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
if (cartDrawerOverlay) {
  cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === cartDrawerOverlay) closeCartDrawer();
  });
}

// Add to Cart from collection buttons
document.querySelectorAll('.btn-add-cart').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.id;
    const title = btn.dataset.title;
    const price = parseFloat(btn.dataset.price);
    const img = btn.dataset.img;

    // Grab selected finish from card
    const card = btn.closest('.product-card');
    const activeColor = card?.querySelector('.color-dot.active')?.dataset.color || 'Obsidian Noir';

    addToCart({ id, title, price, img, finish: activeColor });
  });
});

// Render Cart
function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCounter) cartCounter.textContent = totalItems;
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
