const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update src/style.css: Add sticky close button rules for .qv-card .btn-close-modal
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const stickyCloseBtnCss = `
/* Sticky Close Button for Quick View Modal */
.qv-card .btn-close-modal {
  position: sticky !important;
  top: 12px !important;
  right: 12px !important;
  float: right !important;
  margin-top: -20px !important;
  margin-right: -20px !important;
  margin-bottom: -36px !important;
  z-index: 9999 !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: #0f172a !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 18px !important;
  line-height: 1 !important;
  padding: 0 !important;
  pointer-events: auto !important;
  transition: transform 0.2s ease, background 0.2s ease !important;
}
.qv-card .btn-close-modal:hover {
  background: #e11d48 !important;
  color: #ffffff !important;
  transform: scale(1.08) !important;
}

@media (max-width: 680px) {
  .qv-card .btn-close-modal {
    top: 8px !important;
    right: 8px !important;
    margin-top: -14px !important;
    margin-right: -12px !important;
    margin-bottom: -32px !important;
    width: 34px !important;
    height: 34px !important;
    font-size: 16px !important;
  }
}
`;

if (!styleCss.includes('/* Sticky Close Button for Quick View Modal */')) {
  // Insert right after .qv-card definition
  const qvCardTarget = '.qv-card {\n  max-width: 820px;';
  const qvCardTargetCRLF = '.qv-card {\r\n  max-width: 820px;';
  if (styleCss.includes(qvCardTargetCRLF)) {
    styleCss = styleCss.replace(qvCardTargetCRLF, stickyCloseBtnCss + '\r\n' + qvCardTargetCRLF);
  } else if (styleCss.includes(qvCardTarget)) {
    styleCss = styleCss.replace(qvCardTarget, stickyCloseBtnCss + '\n' + qvCardTarget);
  } else {
    styleCss += '\n' + stickyCloseBtnCss;
  }
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Added sticky close button CSS to src/style.css');
} else {
  console.log('ℹ Sticky close button CSS already present in src/style.css');
}

// 2. Update index.html and products.html: "Copy DM Link" -> "Copy Link"
function updateCopyLinkText(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (content.includes('Copy DM Link')) {
    content = content.replace(/Copy DM Link/g, 'Copy Link');
    changed = true;
  }
  if (content.includes('title="Copy DM Share Link"')) {
    content = content.replace(/title="Copy DM Share Link"/g, 'title="Copy Product Link"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated "Copy DM Link" to "Copy Link" in ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ "Copy Link" already up to date in ${path.basename(filePath)}`);
  }
}

updateCopyLinkText(path.join(rootDir, 'index.html'));
updateCopyLinkText(path.join(rootDir, 'products.html'));

// 3. Update src/main.js: Toast message for copy link
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');
if (mainJs.includes("showShareToast('DM link copied! Ready to share in DMs.');")) {
  mainJs = mainJs.replace(
    "showShareToast('DM link copied! Ready to share in DMs.');",
    "showShareToast('Link copied to clipboard!');"
  );
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Updated toast message in src/main.js');
} else {
  console.log('ℹ Toast message already updated in src/main.js');
}

// 4. Update admin.html:
// Add desktop and mobile styles for:
// - Header (.admin-card-head): Title line 1, Subtitle line 2, Button next
// - Product rows: Title on line 1, category on another line, sku on line 2 with category
const adminHtmlPath = path.join(rootDir, 'admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// Ensure desktop rules for .desktop-only-sku and .mobile-only-sku
if (!adminHtml.includes('.mobile-only-sku {')) {
  const desktopSkuRules = `
    .desktop-only-sku {
      display: block;
      font-size: 11px;
      color: #64748b;
    }
    .mobile-only-sku {
      display: none;
    }
  `;
  adminHtml = adminHtml.replace('.admin-prod-sku {', desktopSkuRules + '\n    .admin-prod-sku {');
  console.log('✓ Added SKU responsive classes to admin.html');
}

// Now replace mobile CSS block in admin.html for @media (max-width: 680px)
const oldMobileTableCssStart = '/* Mobile Inventory Alignment */';
const oldMobileTableCssEnd = '</style>';

const newMobileCss = `/* Mobile Inventory Alignment */
    @media (max-width: 680px) {
      .admin-card-head {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      .admin-card-head > div {
        width: 100% !important;
      }
      .admin-card-title {
        font-size: 20px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        line-height: 1.25 !important;
      }
      .admin-card-subtitle {
        font-size: 12px !important;
        color: var(--admin-text-muted) !important;
        margin-top: 4px !important;
        line-height: 1.35 !important;
        display: block !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      .admin-card-head .admin-btn,
      .admin-card-head #btn-switch-to-upload {
        width: 100% !important;
        justify-content: center !important;
        white-space: nowrap !important;
        margin-top: 4px !important;
      }

      .admin-inventory-search-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .admin-filter-pill-group {
        display: flex;
        overflow-x: auto;
        flex-wrap: nowrap !important;
        gap: 8px;
        padding-bottom: 6px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .admin-filter-pill-group::-webkit-scrollbar {
        display: none;
      }
      .admin-filter-pill {
        white-space: nowrap !important;
        flex-shrink: 0;
      }
      .admin-table-wrap {
        overflow-x: visible;
      }
      .admin-table, .admin-table tbody, .admin-table tr, .admin-table td {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
      .admin-table thead {
        display: none;
      }
      .admin-table tr {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        margin-bottom: 12px;
        padding: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr) auto;
        grid-gap: 6px 12px;
        align-items: center;
      }
      .admin-table td {
        padding: 0 !important;
        border-bottom: none !important;
        min-width: 0;
      }
      .admin-table td:nth-child(1) {
        grid-column: 1;
        grid-row: 1 / span 2;
        align-self: center;
      }
      .admin-prod-thumb {
        width: 56px;
        height: 56px;
        border-radius: 10px;
        object-fit: cover;
      }
      .admin-table td:nth-child(2) {
        grid-column: 2;
        grid-row: 1;
        min-width: 0;
      }
      .admin-prod-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .admin-prod-name {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: block !important;
        line-height: 1.3;
      }
      .desktop-only-sku {
        display: none !important;
      }
      .mobile-only-sku {
        display: inline-flex !important;
        font-size: 11px;
        color: #64748b;
      }
      .admin-table td:nth-child(4) {
        grid-column: 3;
        grid-row: 1;
        text-align: right;
        font-size: 14px;
        font-weight: 700;
        color: #0f172a !important;
        white-space: nowrap !important;
      }
      .admin-table td:nth-child(3) {
        grid-column: 2 / span 2;
        grid-row: 2;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .admin-table td:nth-child(5) {
        grid-column: 1 / span 2;
        grid-row: 3;
        padding-top: 10px !important;
        margin-top: 4px;
        border-top: 1px dashed #f1f5f9 !important;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .admin-table td:nth-child(5)::before {
        content: "Stock:";
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      .admin-table td:nth-child(6) {
        grid-column: 3;
        grid-row: 3;
        padding-top: 10px !important;
        margin-top: 4px;
        border-top: 1px dashed #f1f5f9 !important;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        white-space: nowrap !important;
      }
    }
  `;

const startIdx = adminHtml.indexOf(oldMobileTableCssStart);
const endIdx = adminHtml.indexOf(oldMobileTableCssEnd, startIdx);
if (startIdx !== -1 && endIdx !== -1) {
  adminHtml = adminHtml.substring(0, startIdx) + newMobileCss + adminHtml.substring(endIdx);
  fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');
  console.log('✓ Updated mobile admin CSS in admin.html');
} else {
  console.warn('⚠️ Could not locate mobile CSS block in admin.html');
}

// 5. Update src/admin.js: renderInventoryTable to include .desktop-only-sku and .mobile-only-sku
const adminJsPath = path.join(rootDir, 'src', 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');

const targetTrRender = `    tr.innerHTML = \`
      <td>
        <img src="\${prod.img || '/assets/logo.jpg'}" alt="\${prod.title}" class="admin-prod-thumb" onerror="this.src='/assets/logo.jpg'" />
      </td>
      <td>
        <div class="admin-prod-info">
          <span class="admin-prod-name">\${prod.title}</span>
          <span class="admin-prod-sku">\${prod.sku || prod.id} \${isCustom ? '• <strong style="color: #e11d48;">CUSTOM</strong>' : ''}</span>
        </div>
      </td>
      <td>
        <span class="admin-cat-badge cat-\${prod.category || 'toys'}">\${prod.category || 'toys'}</span>
      </td>
      <td style="font-weight: 600; color: #fff;">
        \${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}
      </td>`;

const replacementTrRender = `    tr.innerHTML = \`
      <td>
        <img src="\${prod.img || '/assets/logo.jpg'}" alt="\${prod.title}" class="admin-prod-thumb" onerror="this.src='/assets/logo.jpg'" />
      </td>
      <td>
        <div class="admin-prod-info">
          <span class="admin-prod-name" title="\${prod.title}">\${prod.title}</span>
          <span class="admin-prod-sku desktop-only-sku">\${prod.sku || prod.id} \${isCustom ? '• <strong style="color: #e11d48;">CUSTOM</strong>' : ''}</span>
        </div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span class="admin-cat-badge cat-\${prod.category || 'toys'}">\${prod.category || 'toys'}</span>
          <span class="admin-prod-sku mobile-only-sku">\${prod.sku || prod.id} \${isCustom ? '• <strong style="color: #e11d48;">CUSTOM</strong>' : ''}</span>
        </div>
      </td>
      <td style="font-weight: 700; color: #0f172a;" class="admin-prod-price-cell">
        \${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}
      </td>`;

// Standardize CRLF to LF for matching
const normAdminJs = adminJs.replace(/\r\n/g, '\n');
const normTarget = targetTrRender.replace(/\r\n/g, '\n');
const normReplacement = replacementTrRender.replace(/\r\n/g, '\n');

if (normAdminJs.includes(normTarget)) {
  const isCRLF = adminJs.includes('\r\n');
  const updatedNorm = normAdminJs.replace(normTarget, normReplacement);
  adminJs = isCRLF ? updatedNorm.replace(/\n/g, '\r\n') : updatedNorm;
  fs.writeFileSync(adminJsPath, adminJs, 'utf8');
  console.log('✓ Updated renderInventoryTable in src/admin.js');
} else {
  console.log('ℹ renderInventoryTable target pattern was not matched directly, checking if already updated...');
  if (adminJs.includes('desktop-only-sku')) {
    console.log('✓ Already updated in src/admin.js');
  } else {
    console.warn('⚠️ Could not match targetTrRender in src/admin.js');
  }
}

console.log('\nAll user request updates applied successfully!');
