const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS FOR SEAMLESS EASING BLEND TRANSITIONS
const blendCss = `
/* ── ULTRA-SMOOTH EASING SECTION TRANSITIONS (NO SHARP LINES) ── */
.section-blend {
  width: 100%;
  display: block;
  margin-top: -1px;
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

/* Hero (White) -> Collection (Dark Ink) */
.blend-hero-collection {
  height: 180px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #fafafc 8.1%,
    #f1f1f5 15.5%,
    #dfdfe5 22.5%,
    #c4c4ce 29%,
    #a1a1b0 35.3%,
    #7a7a8d 41.2%,
    #535366 47.1%,
    #333344 53.5%,
    #1d1d29 61.2%,
    #13131c 71.5%,
    #0c0c13 83.4%,
    #0a0a10 100%
  );
}

/* Collection (Dark Ink) -> Confessions (Pure Black) */
.blend-collection-confessions {
  height: 140px;
  background: linear-gradient(
    180deg,
    #0a0a10 0%,
    #08080d 12%,
    #06060a 26%,
    #040407 42%,
    #030305 60%,
    #020203 78%,
    #010101 90%,
    #000000 100%
  );
}

/* Confessions (Pure Black) -> Discretion (Pure White) */
.blend-confessions-discretion {
  height: 220px;
  background: linear-gradient(
    180deg,
    #000000 0%,
    #030305 8%,
    #0b0b10 17%,
    #181822 27%,
    #2c2c3a 38%,
    #4a4a5b 49%,
    #707083 60%,
    #9c9cb0 71%,
    #c7c7d6 82%,
    #e7e7ee 91%,
    #f8f8fa 96%,
    #ffffff 100%
  );
}

/* Discretion (Pure White) -> FAQ (Dark Ink) */
.blend-discretion-faq {
  height: 180px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #fafafc 8.1%,
    #f1f1f5 15.5%,
    #dfdfe5 22.5%,
    #c4c4ce 29%,
    #a1a1b0 35.3%,
    #7a7a8d 41.2%,
    #535366 47.1%,
    #333344 53.5%,
    #1d1d29 61.2%,
    #13131c 71.5%,
    #0c0c13 83.4%,
    #0a0a10 100%
  );
}

/* FAQ (Dark Ink) -> Footer (Off-White) */
.blend-faq-footer {
  height: 180px;
  background: linear-gradient(
    180deg,
    #0a0a10 0%,
    #0d0d15 9%,
    #161622 19%,
    #242433 30%,
    #3b3b4d 42%,
    #5d5d71 54%,
    #86869a 66%,
    #b2b2c1 78%,
    #dadbe4 88%,
    #f1f1f5 95%,
    #fafafa 100%
  );
}

/* Products Page: White Collection -> Confessions Black */
.blend-white-to-black {
  height: 180px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #fafafc 8%,
    #e8e8ed 17%,
    #c9c9d5 27%,
    #9f9fb0 38%,
    #727284 49%,
    #484858 60%,
    #282835 71%,
    #14141c 82%,
    #08080c 91%,
    #000000 100%
  );
}

/* Products Page: Confessions Black -> Footer Off-white */
.blend-black-to-off {
  height: 180px;
  background: linear-gradient(
    180deg,
    #000000 0%,
    #050508 8%,
    #0f0f16 17%,
    #20202c 27%,
    #393949 38%,
    #5a5a6c 49%,
    #828295 60%,
    #aeaec0 71%,
    #d6d6e2 82%,
    #ececf2 91%,
    #fafafa 100%
  );
}

@media (max-width: 600px) {
  .section-blend {
    height: 120px !important;
  }
}
`;

// UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

// Clean up old pseudo-elements on .collection, .discretion-strip, .faq-section
styleCss = styleCss.replace(
  /\.collection:not\(\.collection-page-white\)::before[\s\S]*?\.collection \.section-inner\s*\{\s*position:\s*relative;\s*z-index:\s*2;\s*\}/g,
  ''
);

styleCss = styleCss.replace(
  /\.discretion-strip::before[\s\S]*?\.discretion-strip::after[\s\S]*?z-index:\s*1;\s*\}/g,
  ''
);

styleCss = styleCss.replace(
  /\.faq-section::after[\s\S]*?z-index:\s*1;\s*\}/g,
  ''
);

// Ensure sections have no borders and clean paddings
styleCss = styleCss.replace(
  /\.collection\s*\{\s*padding:\s*80px 0;\s*background:\s*var\(--ink\);\s*color:\s*var\(--white\);\s*scroll-margin-top:\s*48px;\s*position:\s*relative;\s*\}/g,
  '.collection { padding: 60px 0; background: var(--ink); color: var(--white); scroll-margin-top: 48px; border: none; }'
);

styleCss = styleCss.replace(
  /\.discretion-strip\s*\{\s*background:\s*var\(--white\);\s*padding:\s*95px 0 90px;\s*color:\s*var\(--ink\);\s*border-top:\s*none;\s*border-bottom:\s*none;\s*position:\s*relative;\s*\}/g,
  '.discretion-strip { background: var(--white); padding: 60px 0; color: var(--ink); border: none; }'
);

styleCss = styleCss.replace(
  /\.faq-section\s*\{\s*padding:\s*90px 0;\s*background:\s*var\(--ink\);\s*color:\s*var\(--white\);\s*position:\s*relative;\s*\}/g,
  '.faq-section { padding: 60px 0; background: var(--ink); color: var(--white); border: none; }'
);

// Append the blend CSS if not present
if (!styleCss.includes('.blend-hero-collection')) {
  styleCss += '\n\n' + blendCss;
}

fs.writeFileSync(styleCssPath, styleCss, 'utf8');
console.log('✓ Successfully updated src/style.css with seamless easing transitions');

// UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Remove border-top line inside collection (line 400)
indexHtml = indexHtml.replace(
  'border-top: 1px solid rgba(255,255,255,0.08);',
  ''
);

// 2. Remove any previously inserted .section-blend
indexHtml = indexHtml.replace(/<div class="section-blend[^"]*"><\/div>\s*/g, '');

// 3. Insert seamless blend dividers between sections:
// Between Hero and Collection
indexHtml = indexHtml.replace(
  '<!-- ===== COLLECTION SHOWCASE SLIDESHOW ===== -->',
  '<div class="section-blend blend-hero-collection" aria-hidden="true"></div>\n\n    <!-- ===== COLLECTION SHOWCASE SLIDESHOW ===== -->'
);

// Between Collection and Confessions
indexHtml = indexHtml.replace(
  '<!-- ===== THE CONFESSIONS CARDBOARD BOX SLIDESHOW ===== -->',
  '<div class="section-blend blend-collection-confessions" aria-hidden="true"></div>\n\n    <!-- ===== THE CONFESSIONS CARDBOARD BOX SLIDESHOW ===== -->'
);

// Between Confessions and Discretion
indexHtml = indexHtml.replace(
  '<!-- ===== DISCRETION ===== -->',
  '<div class="section-blend blend-confessions-discretion" aria-hidden="true"></div>\n\n    <!-- ===== DISCRETION ===== -->'
);

// Between Discretion and FAQ
indexHtml = indexHtml.replace(
  '<!-- ===== FAQ ===== -->',
  '<div class="section-blend blend-discretion-faq" aria-hidden="true"></div>\n\n    <!-- ===== FAQ ===== -->'
);

// Between FAQ and Footer
indexHtml = indexHtml.replace(
  '<!-- ===== FOOTER ===== -->',
  '<div class="section-blend blend-faq-footer" aria-hidden="true"></div>\n\n    <!-- ===== FOOTER ===== -->'
);

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✓ Successfully updated index.html with seamless blend dividers');

// UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

productsHtml = productsHtml.replace(/<div class="section-blend[^"]*"><\/div>\s*/g, '');

// Between Collection (white) and Confessions (black)
productsHtml = productsHtml.replace(
  '<!-- ===== THE CONFESSIONS CARDBOARD BOX SLIDESHOW ===== -->',
  '<div class="section-blend blend-white-to-black" aria-hidden="true"></div>\n\n    <!-- ===== THE CONFESSIONS CARDBOARD BOX SLIDESHOW ===== -->'
);

// Between Confessions (black) and Footer (off-white)
productsHtml = productsHtml.replace(
  '<!-- ===== FOOTER ===== -->',
  '<div class="section-blend blend-black-to-off" aria-hidden="true"></div>\n\n    <!-- ===== FOOTER ===== -->'
);

fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('✓ Successfully updated products.html with seamless blend dividers');
