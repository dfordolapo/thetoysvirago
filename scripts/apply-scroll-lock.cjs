const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. ADD SCROLL LOCK CSS TO src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const scrollLockCss = `
/* ── BULLETPROOF MODAL BACKGROUND SCROLL LOCK ── */
html.modal-open,
body.modal-open {
  overflow: hidden !important;
  height: 100% !important;
  touch-action: none;
  overscroll-behavior: contain !important;
}

.modal-overlay,
.drawer-overlay,
.admin-gate-overlay,
.supabase-modal-overlay {
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch;
}

.qv-card,
.co-card,
.confession-paper-card,
.cart-drawer,
.admin-gate-card,
.supabase-modal-card {
  touch-action: pan-y !important;
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch;
}
`;

if (!styleCss.includes('/* ── BULLETPROOF MODAL BACKGROUND SCROLL LOCK ── */')) {
  styleCss += '\n' + scrollLockCss;
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Added scroll lock CSS to src/style.css');
} else {
  console.log('ℹ Scroll lock CSS already present in src/style.css');
}

// 2. ADD SCROLL LOCK SCRIPT TO src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const scrollLockJs = `
// ================= BULLETPROOF BACKGROUND SCROLL LOCK =================
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
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  } else {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }
}

// Global helper functions
window.lockBodyScroll = function() {
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
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
`;

if (!mainJs.includes('// ================= BULLETPROOF BACKGROUND SCROLL LOCK =================')) {
  mainJs += '\n' + scrollLockJs;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Added scroll lock logic to src/main.js');
} else {
  console.log('ℹ Scroll lock logic already present in src/main.js');
}

// 3. ADD SCROLL LOCK SCRIPT TO src/admin.js (for admin modals)
const adminJsPath = path.join(rootDir, 'src', 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');

if (!adminJs.includes('// ================= BULLETPROOF BACKGROUND SCROLL LOCK =================')) {
  adminJs += '\n' + scrollLockJs;
  fs.writeFileSync(adminJsPath, adminJs, 'utf8');
  console.log('✓ Added scroll lock logic to src/admin.js');
} else {
  console.log('ℹ Scroll lock logic already present in src/admin.js');
}

console.log('\nAll background scroll lock updates applied successfully!');
