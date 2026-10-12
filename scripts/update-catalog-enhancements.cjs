const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../src/main.js');
let content = fs.readFileSync(mainJsPath, 'utf8');

// Ensure CRLF or LF compatibility
const eol = content.includes('\r\n') ? '\r\n' : '\n';

// 1. Replace the old filterProducts & filter button handlers
const oldFilterStart = 'function filterProducts() {';
const oldFilterEnd = '// Interactive Finish / Color Dots';

const startIdx = content.indexOf(oldFilterStart);
const endIdx = content.indexOf(oldFilterEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate filter markers:', { startIdx, endIdx });
  process.exit(1);
}

const newFilterSection = `function filterProducts() {
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const activeBtn = document.querySelector('.filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.dataset.filter : 'all';
  let visibleCount = 0;

  if (searchClearBtn) {
    searchClearBtn.style.display = query ? 'block' : 'none';
  }

  const currentCards = document.querySelectorAll('.product-card');
  currentCards.forEach((card) => {
    const cardCat = card.dataset.category || '';
    const cardId = card.dataset.id || '';
    const generalTerms = (GENERAL_PRODUCT_TERMS[cardId] || '').toLowerCase();
    const cardKeywords = (card.dataset.keywords || '').toLowerCase();
    const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const sku = (card.querySelector('.product-sku')?.textContent || '').toLowerCase();
    const line = (card.querySelector('.product-line')?.textContent || '').toLowerCase();
    const colors = Array.from(card.querySelectorAll('.color-dot')).map(d => (d.dataset.color || '').toLowerCase()).join(' ');

    const allSearchable = \`\${name} \${sku} \${line} \${cardKeywords} \${generalTerms} \${colors} \${cardCat}\`;

    // If query is provided, check if it matches either the card's details or general product terms
    const matchesSearch = !query || allSearchable.includes(query);

    // When searching with a query, if the item matches the query we show it even if filtered,
    // otherwise respect category (if 'all' or no button active, show all)
    const matchesCat = (activeCategory === 'all' || !activeCategory || cardCat === activeCategory || (query && matchesSearch));

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
        if (noResultsDesc) noResultsDesc.innerHTML = \`We couldn't find anything matching "<strong>\${query}</strong>". Give it another tease with 'rose', 'bullet', 'dildo', 'lingerie', or 'lube'.\`;
        if (resetBtn) resetBtn.textContent = 'Clear Search';
      } else {
        const catName = activeCategory === 'bdsm' ? 'BDSM' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
        if (noResultsTitle) noResultsTitle.textContent = 'Patience is a virtue (and a kink).';
        if (noResultsDesc) noResultsDesc.innerHTML = \`We're stocking this vault right now. Our <strong>\${catName}</strong> collection will drop shortly. In the meantime, explore our active collection.\`;
        if (resetBtn) resetBtn.textContent = 'Browse All Products';
      }
    } else {
      searchNoResults.setAttribute('hidden', '');
      searchNoResults.style.display = 'none';
    }
  }

  if (searchCount) {
    searchCount.textContent = \`Showing \${visibleCount} of \${currentCards.length} products\`;
  }
}

function applyProductFilter(category) {
  const allBtns = document.querySelectorAll('.filter-btn');
  allBtns.forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === category);
  });
  filterProducts();
}

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isAlreadyActive = btn.classList.contains('active');
    if (isAlreadyActive) {
      btn.classList.remove('active');
      filterProducts();
    } else {
      applyProductFilter(btn.dataset.filter);
    }
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
  }
}

`;

content = content.slice(0, startIdx) + newFilterSection + content.slice(endIdx);

// 2. Add initCustomCatalogProducts at the end of the file
const customProductsModule = `

// ================= 8. DYNAMIC CUSTOM PRODUCTS & LINGERIE CATALOG LOADER =================
export async function initCustomCatalogProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let customProds = [];
  try {
    const stored = localStorage.getItem('thetoysvirago_custom_products');
    if (stored) {
      customProds = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Catalog] Error reading custom products:', e);
  }

  // Pre-seed sample curated lingerie items if none exist yet
  if (!customProds || customProds.length === 0) {
    customProds = [
      {
        id: 'noir-chantilly-teddy',
        title: 'Noir Chantilly Lace Teddy',
        category: 'lingerie',
        sku: 'LINGERIE · 01',
        badge: 'LUXE LINGERIE',
        tagline: 'Delicate floral lace with dangerous plunge decolletage.',
        price: 35000,
        priceStr: '₦35,000',
        originalPrice: 42000,
        img: '/assets/category-lingerie.webp',
        desc: 'Crafted from delicate French floral lace with scalloped eyelash trims, plunging wire-free decolletage, and adjustable silk ribbon cross-back ties. Drapes sensually against the skin while celebrating natural feminine curves.',
        specs: [
          { label: 'Material', value: 'French Floral Lace & Sheer Stretch Mesh' },
          { label: 'Fit & Feel', value: 'Plunging V-Neck with Ribbon Ties' },
          { label: 'Care', value: 'Hand Wash Cold, Lay Flat to Dry' },
          { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
        ],
        variants: [
          { name: 'Noir Black', price: 35000, priceStr: '₦35,000', img: '/assets/category-lingerie.webp', color: '#111111' },
          { name: 'Ruby Wine', price: 35000, priceStr: '₦35,000', img: '/assets/category-lingerie.webp', color: '#e11d48' }
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        media: [
          { type: 'image', src: '/assets/category-lingerie.webp', label: 'Noir Chantilly Lace Teddy' }
        ],
        material: 'French Floral Lace & Sheer Stretch Mesh',
        acoustics: 'Whisper-Soft on Bare Skin',
        inStock: true
      },
      {
        id: 'scarlet-silk-chemise',
        title: 'Scarlet Silk Ribbon Chemise',
        category: 'lingerie',
        sku: 'LINGERIE · 02',
        badge: 'NEW ARRIVAL',
        tagline: 'Liquid satin drape with seductive sheer side slits.',
        price: 38000,
        priceStr: '₦38,000',
        originalPrice: 45000,
        img: '/assets/lifestyle-sheets.webp',
        desc: 'Pure liquid satin chemise featuring delicate eyelash lace trim along the cups and thigh-high side slits. Designed for unforgettable boudoir evenings with adjustable double shoulder straps and an open-back silhouette.',
        specs: [
          { label: 'Material', value: 'Pure Mulberry Satin Silk & Scalloped Lace' },
          { label: 'Silhouette', value: 'Bias-Cut Slip with Open Low Back' },
          { label: 'Care', value: 'Delicate Silk Wash or Dry Clean' },
          { label: 'Packaging', value: 'Plain Discreet Courier Bag' }
        ],
        variants: [
          { name: 'Scarlet Red', price: 38000, priceStr: '₦38,000', img: '/assets/lifestyle-sheets.webp', color: '#e11d48' },
          { name: 'Midnight Noir', price: 38000, priceStr: '₦38,000', img: '/assets/lifestyle-sheets.webp', color: '#111111' }
        ],
        sizes: ['S', 'M', 'L'],
        media: [
          { type: 'image', src: '/assets/lifestyle-sheets.webp', label: 'Scarlet Silk Ribbon Chemise' }
        ],
        material: 'Pure Mulberry Satin Silk & Scalloped Lace',
        acoustics: 'Sensuous Liquid Satin Glide',
        inStock: true
      }
    ];
    try {
      localStorage.setItem('thetoysvirago_custom_products', JSON.stringify(customProds));
    } catch(e) {}
  }

  // Also check Supabase for remote products
  try {
    const remoteProds = await getSupabaseProducts();
    if (remoteProds && Array.isArray(remoteProds) && remoteProds.length > 0) {
      remoteProds.forEach(rp => {
        const existingIdx = customProds.findIndex(p => p.id === rp.id);
        const mapped = {
          id: rp.id,
          title: rp.title,
          category: rp.category || 'toys',
          sku: rp.category ? \`\${rp.category.toUpperCase()} · \${rp.id.slice(0, 4)}\` : 'VAULT · 01',
          badge: rp.badge || 'STORE DROP',
          tagline: rp.tagline || '',
          price: Number(rp.price) || 0,
          priceStr: \`₦\${Number(rp.price).toLocaleString()}\`,
          originalPrice: rp.original_price ? Number(rp.original_price) : null,
          img: rp.image || '/assets/category-lingerie.webp',
          desc: rp.description || '',
          specs: Array.isArray(rp.specs) ? rp.specs.map(s => {
            const parts = s.split(':');
            return { label: parts[0] ? parts[0].trim() : 'Feature', value: parts[1] ? parts[1].trim() : s };
          }) : [],
          variants: Array.isArray(rp.variants) ? rp.variants : [],
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

  // Inject cards and register in PRODUCT_DATABASE
  customProds.forEach((prod, idx) => {
    PRODUCT_DATABASE[prod.id] = {
      id: prod.id,
      title: prod.title,
      badge: prod.badge || 'LUXE BOUDOIR',
      price: Number(prod.price) || 0,
      priceStr: prod.priceStr || \`₦\${Number(prod.price).toLocaleString()}\`,
      img: prod.img || '/assets/category-lingerie.webp',
      desc: prod.desc || prod.tagline || '',
      specs: prod.specs || [],
      variants: prod.variants || [],
      material: prod.material || 'Luxe Body-Safe Materials',
      acoustics: prod.acoustics || 'Sensual Touch',
      freq: 0,
      pattern: prod.category || 'lingerie',
      media: prod.media && prod.media.length > 0 ? prod.media : [{ type: 'image', src: prod.img, label: prod.title }]
    };

    GENERAL_PRODUCT_TERMS[prod.id] = \`\${prod.title} \${prod.category} \${prod.tagline || ''} \${prod.desc || ''} lingerie underwear boudoir lace bra panties corset\`;

    // Only inject if card doesn't already exist in DOM
    if (!document.querySelector(\`.product-card[data-id="\${prod.id}"]\`)) {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.category = prod.category || 'lingerie';
      card.dataset.id = prod.id;
      card.dataset.keywords = \`\${prod.title} \${prod.category} \${prod.badge || ''} lingerie lace sensual boudoir\`;

      const variantDotsHtml = (prod.variants && prod.variants.length > 0)
        ? \`<div class="color-row">
            \${prod.variants.map((v, i) => \`<span class="color-dot \${i === 0 ? 'active' : ''}" data-color="\${v.name}" data-img="\${v.img || prod.img}" title="\${v.name}" style="background: \${v.color || (v.name.toLowerCase().includes('red') || v.name.toLowerCase().includes('ruby') ? '#e11d48' : '#111')};"></span>\`).join('')}
            <span class="color-name">\${prod.variants[0]?.name || ''}</span>
          </div>\`
        : '';

      const sizePillsHtml = (prod.sizes && prod.sizes.length > 0)
        ? \`<div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
            \${prod.sizes.map((s, i) => \`<button type="button" class="size-pill \${i === 0 ? 'active' : ''}" data-size="\${s}">\${s}</button>\`).join('')}
          </div>\`
        : '';

      card.innerHTML = \`
        <div class="product-img-wrap">
          <span class="product-badge ruby-badge">\${prod.badge || 'NEW ARRIVAL'}</span>
          <img src="\${prod.img}" alt="\${prod.title}" class="product-img" loading="lazy" decoding="async" />
          <div class="product-overlay">
            <button class="btn-quick-view" data-product="\${prod.id}">Quick Look</button>
          </div>
        </div>
        <div class="product-body">
          <div class="product-top">
            <span class="product-sku">\${prod.sku || (prod.category.toUpperCase() + ' · ' + String(idx + 1).padStart(2, '0'))}</span>
            <span class="product-price">\${prod.priceStr || ('₦' + Number(prod.price).toLocaleString())}</span>
          </div>
          <h3 class="product-name">\${prod.title}</h3>
          <p class="product-line">\${prod.tagline || prod.desc || ''}</p>
          \${variantDotsHtml}
          \${sizePillsHtml}
          <div class="product-card-bottom">
            <button class="btn btn-black btn-add-cart"
              data-id="\${prod.id}"
              data-title="\${prod.title}"
              data-price="\${prod.price}"
              data-img="\${prod.img}">
              Add to Bag
            </button>
          </div>
        </div>
      \`;

      // Prepend so new products appear at the beginning of the grid
      grid.prepend(card);

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
            addBtn.dataset.title = \`\${prod.title} (\${dot.dataset.color})\`;
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
    }
  });

  // Re-run filterProducts to reflect any active filters or update count
  filterProducts();
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
`;

if (!content.includes('initCustomCatalogProducts')) {
  content += customProductsModule;
}

fs.writeFileSync(mainJsPath, content, 'utf8');
console.log('Successfully updated src/main.js with dynamic catalog loader and enhanced filters!');
