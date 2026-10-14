const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// =========================================================================
// 1. UPDATE products.html: Remove prices from pills/badges and update Unavailable buttons
// =========================================================================
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// Replace badge pills with prices
productsHtml = productsHtml.replace(
  '10-PIECE · W/CASE ₦55K',
  '10-PIECE · WITH CASE'
);
productsHtml = productsHtml.replace(
  'LUXURY VAULT · W/CASE ₦55K',
  'LUXURY VAULT · WITH CASE'
);
productsHtml = productsHtml.replace(
  'REMOTE ₦25K · APP ₦35K',
  'REMOTE · APP CONTROL'
);
productsHtml = productsHtml.replace(
  'NON-VIB ₦18K · VIB ₦25K',
  'NON-VIBRATING · VIBRATING'
);

// Update all Unavailable buttons to have .btn-add-cart and .btn-unavailable
const oldBtnRegex = /<button class="btn btn-black btn-block" disabled style="opacity:0\.45;cursor:not-allowed;">Unavailable<\/button>/g;
const newBtnHtml = '<button class="btn btn-black btn-block btn-add-cart btn-unavailable" disabled>Unavailable</button>';

const matchCount = (productsHtml.match(oldBtnRegex) || []).length;
productsHtml = productsHtml.replace(oldBtnRegex, newBtnHtml);
fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log(`✓ Updated products.html: removed prices from badges and updated ${matchCount} Unavailable buttons.`);


// =========================================================================
// 2. UPDATE src/style.css: Style .btn-unavailable to match .btn-add-cart shape & size and Abuja color
// =========================================================================
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const unavailableButtonCss = `
/* ── UNAVAILABLE BUTTON STYLING (Matches .btn-add-cart shape & size) ── */
.btn-unavailable,
button.btn-unavailable[disabled],
.product-card .btn-unavailable,
.product-card button[disabled] {
  border-radius: 8px !important;
  padding: 9px 14px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  line-height: 1 !important;
  min-height: 38px !important;
  margin-top: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

#products-grid .btn-unavailable,
#products-grid .product-card button[disabled] {
  background: #18181b !important;
  color: rgba(255, 255, 255, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  opacity: 1 !important;
}

.abuja-carousel-track .btn-unavailable,
.abuja-carousel-track .product-card button[disabled],
.abuja-carousel-track .product-card .btn-black[disabled] {
  background: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.55) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  opacity: 1 !important;
}

@media (max-width: 580px) {
  .btn-unavailable,
  button.btn-unavailable[disabled],
  .product-card .btn-unavailable,
  .product-card button[disabled],
  #products-grid .btn-unavailable,
  .abuja-carousel-track .btn-unavailable {
    padding: 7px 10px !important;
    font-size: 11px !important;
    min-height: 34px !important;
  }
}
`;

if (!styleCss.includes('/* ── UNAVAILABLE BUTTON STYLING')) {
  styleCss += '\n' + unavailableButtonCss;
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Added .btn-unavailable styles to src/style.css');
} else {
  console.log('ℹ .btn-unavailable styles already present in src/style.css');
}


// =========================================================================
// 3. UPDATE admin.html: Add Edit Mode Banner and Mobile Edit Layout Styling
// =========================================================================
const adminHtmlPath = path.join(rootDir, 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// Insert edit banner CSS into admin.html
const editBannerCss = `
    /* Edit Mode Indicator Banner */
    .admin-edit-mode-banner {
      background: #fff1f2;
      border: 1.5px solid #fecdd3;
      border-radius: 12px;
      padding: 12px 18px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      animation: fadeIn 0.25s ease;
    }
    .edit-banner-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }
    .edit-mode-pill {
      background: #e11d48;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .edit-mode-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
`;

if (!adminHtml.includes('.admin-edit-mode-banner {')) {
  adminHtml = adminHtml.replace('.admin-grid-layout {', editBannerCss + '\n    .admin-grid-layout {');
  console.log('✓ Added edit banner CSS to admin.html');
}

// Ensure mobile responsive styles for edit view in admin.html
const mobileEditViewCss = `
      /* Studio & Edit View Mobile Alignment */
      .admin-card {
        padding: 18px 16px !important;
        border-radius: 14px !important;
      }
      .admin-grid-layout {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
      }
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
      }
      .admin-preview-box {
        max-width: 240px !important;
        margin: 14px auto 0 !important;
      }
      .admin-media-gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)) !important;
        gap: 8px !important;
      }
      .ai-generator-box {
        padding: 16px !important;
        margin-bottom: 16px !important;
      }
      .ai-gen-head {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 8px !important;
      }
      .ai-mood-select {
        width: 100% !important;
      }
      .ai-btn-generate {
        width: 100% !important;
        justify-content: center !important;
      }
`;

if (!adminHtml.includes('/* Studio & Edit View Mobile Alignment */')) {
  adminHtml = adminHtml.replace(
    '/* Mobile Inventory Alignment */\n    @media (max-width: 680px) {',
    '/* Mobile Inventory Alignment */\n    @media (max-width: 680px) {\n' + mobileEditViewCss
  );
  console.log('✓ Added mobile studio & edit view CSS to admin.html');
}

// Add the HTML for the editing indicator banner inside #upload-panel
const uploadFormStart = '<form id="product-upload-form">';
const editBannerHtml = `<!-- Editing Mode Notification Banner -->
      <div id="editing-indicator-banner" class="admin-edit-mode-banner" style="display: none;">
        <div class="edit-banner-left">
          <span class="edit-mode-pill">EDIT MODE</span>
          <span id="editing-product-label" class="edit-mode-title">Editing Product</span>
        </div>
        <button type="button" id="btn-cancel-edit" class="admin-btn admin-btn-outline" style="padding: 5px 12px; font-size: 11px; white-space: nowrap;">✕ Cancel Edit</button>
      </div>

      <form id="product-upload-form">`;

if (!adminHtml.includes('id="editing-indicator-banner"')) {
  adminHtml = adminHtml.replace(uploadFormStart, editBannerHtml);
  console.log('✓ Added #editing-indicator-banner HTML to admin.html');
}

fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');


// =========================================================================
// 4. UPDATE src/admin.js: Smooth scroll, concise save button text, and banner toggling
// =========================================================================
const adminJsPath = path.join(rootDir, 'src', 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');

// Update loadProductIntoForm saveBtn innerHTML and scroll to top
const oldSaveBtnLoad = `  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) {
    saveBtn.innerHTML = \`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Update "\${prod.title}" in Catalog
    \`;
  }

  switchTab('upload-panel');`;

const newSaveBtnLoad = `  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) {
    saveBtn.innerHTML = \`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Update Product in Catalog
    \`;
  }

  // Show editing banner
  const editBanner = document.getElementById('editing-indicator-banner');
  const editLabel = document.getElementById('editing-product-label');
  if (editBanner && editLabel) {
    editLabel.textContent = \`Editing: \${prod.title}\`;
    editBanner.style.display = 'flex';
  }

  switchTab('upload-panel');
  window.scrollTo({ top: 0, behavior: 'smooth' });`;

// Update resetForm to hide edit banner and reset button
const oldResetFormSaveBtn = `  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) saveBtn.innerHTML = \`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    Save Product to Catalog
  \`;`;

const newResetFormSaveBtn = `  const saveBtn = document.getElementById('btn-save-product');
  if (saveBtn) saveBtn.innerHTML = \`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    Save Product to Catalog
  \`;
  const editBanner = document.getElementById('editing-indicator-banner');
  if (editBanner) editBanner.style.display = 'none';`;

// Standardize CRLF to LF for matching
let normAdminJs = adminJs.replace(/\r\n/g, '\n');
const normOldLoad = oldSaveBtnLoad.replace(/\r\n/g, '\n');
const normNewLoad = newSaveBtnLoad.replace(/\r\n/g, '\n');
const normOldReset = oldResetFormSaveBtn.replace(/\r\n/g, '\n');
const normNewReset = newResetFormSaveBtn.replace(/\r\n/g, '\n');

if (normAdminJs.includes(normOldLoad)) {
  normAdminJs = normAdminJs.replace(normOldLoad, normNewLoad);
  console.log('✓ Updated loadProductIntoForm in src/admin.js');
}

if (normAdminJs.includes(normOldReset)) {
  normAdminJs = normAdminJs.replace(normOldReset, normNewReset);
  console.log('✓ Updated resetForm in src/admin.js');
}

// Wire Cancel Edit button
if (!normAdminJs.includes("btn-cancel-edit")) {
  const cancelEditWire = `
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetForm();
      switchTab('inventory-panel');
    });
  }
`;
  normAdminJs = normAdminJs.replace('function switchTab(tabId) {', cancelEditWire + '\nfunction switchTab(tabId) {');
  console.log('✓ Wired btn-cancel-edit in src/admin.js');
}

const isCRLF = adminJs.includes('\r\n');
adminJs = isCRLF ? normAdminJs.replace(/\n/g, '\r\n') : normAdminJs;
fs.writeFileSync(adminJsPath, adminJs, 'utf8');

console.log('\nAll updates applied successfully!');
