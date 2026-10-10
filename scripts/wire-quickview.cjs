const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../src/main.js');
let raw = fs.readFileSync(mainPath, 'utf8');

// Normalize line endings for replacement
const isCRLF = raw.includes('\r\n');
const lines = raw.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes("document.querySelectorAll('.btn-quick-view').forEach"));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes("if (quickviewModal) {") && lines[idx+1] && lines[idx+1].includes("quickviewModal.addEventListener('click'"));

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find line indices:', startIdx, endIdx);
  process.exit(1);
}

console.log(`Replacing lines ${startIdx+1} to ${endIdx}`);

const newCodeLines = [
`function showShareToast(message) {
  let toast = document.getElementById('ttv-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ttv-toast';
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(18,18,22,0.96);color:#fff;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:600;box-shadow:0 12px 36px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.15);z-index:999999;opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);pointer-events:none;display:flex;align-items:center;gap:8px;';
    document.body.appendChild(toast);
  }
  toast.innerHTML = \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> \${message}\`;
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
    card = document.querySelector(\`.product-card[data-product="\${prodKey}"]\`) ||
           document.querySelector(\`.btn-quick-view[data-product="\${prodKey}"]\`)?.closest('.product-card');
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
        thumbBtn.className = \`qv-thumb \${idx === 0 ? 'active' : ''}\`;
        thumbBtn.type = 'button';
        thumbBtn.setAttribute('aria-label', item.label || \`Media \${idx + 1}\`);

        if (item.type === 'video') {
          thumbBtn.innerHTML = \`
            <img src="\${item.thumb || prod.img}" alt="\${item.label}" />
            <span class="qv-thumb-video-icon">▶</span>
          \`;
        } else {
          thumbBtn.innerHTML = \`<img src="\${item.src}" alt="\${item.label}" />\`;
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
        row.innerHTML = \`<span>\${s.label}</span><span>\${s.value}</span>\`;
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
        vBtn.className = \`size-pill \${idx === selectedIdx ? 'active' : ''}\`;
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
    const shareUrl = \`\${origin}/products.html?product=\${encodeURIComponent(currentQvProduct.id)}\`;
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
        const card = document.querySelector(\`.product-card[data-product="\${deepProduct}"]\`) ||
                     document.querySelector(\`.btn-quick-view[data-product="\${deepProduct}"]\`)?.closest('.product-card');
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
`
];

const newline = isCRLF ? '\r\n' : '\n';
lines.splice(startIdx, endIdx - startIdx, ...newCodeLines);
fs.writeFileSync(mainPath, lines.join(newline), 'utf8');
console.log('Successfully updated main.js with refactored quickview and sharing features.');
