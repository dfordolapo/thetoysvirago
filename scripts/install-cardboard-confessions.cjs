const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. PURE BLACK BACKGROUND + REALISTIC CARDBOARD BOX CSS
const cardboardCss = `/* ── THE CARDBOARD CONFESSIONS BOX (Pure Black Background) ── */
.toybox-section {
  padding: 44px 0 50px;
  background: #000000 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.toybox-header {
  text-align: center;
  margin-bottom: 24px;
}
.toybox-header .sh2 {
  font-size: clamp(26px, 4vw, 36px);
  margin: 0;
  color: #ffffff;
}

/* Cardboard Box Stage */
.toybox-stage {
  max-width: 580px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  position: relative;
}

/* Realistic Kraft Cardboard Delivery Box */
.cardboard-box {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: #b58550;
  border: 2px solid #8e6333;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95),
              inset 0 2px 3px rgba(255, 255, 255, 0.25),
              inset 0 -4px 8px rgba(0, 0, 0, 0.35);
  padding: 12px 14px 18px;
  display: flex;
  flex-direction: column;
}

/* Cardboard Flaps (Open Box Top) */
.cardboard-top-flaps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.cardboard-flap {
  height: 16px;
  background: #a57540;
  border: 1px solid #7d5325;
  border-radius: 4px 4px 0 0;
  flex: 1;
  margin: 0 3px;
}
.cardboard-flap.left {
  transform: skewX(-8deg);
}
.cardboard-flap.right {
  transform: skewX(8deg);
}

/* Open Cardboard Interior Cavity with Toys Inside */
.cardboard-interior {
  position: relative;
  background: #3e2a16;
  border: 2px solid #2a1b0d;
  border-radius: 6px;
  padding: 14px 10px 10px;
  min-height: 220px;
  box-shadow: inset 0 12px 28px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: visible;
}

/* Toys Resting Inside the Box */
.toys-inside-tray {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  gap: 6px;
  z-index: 2;
  position: relative;
}
.toy-inside {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: transform 0.25s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7));
  cursor: pointer;
}
.toy-inside img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.toy-inside.active-in-box {
  transform: translateY(-8px) scale(1.15);
  border-color: #fb7185;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.7);
}

/* Cardboard Front Face Markings */
.cardboard-front {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
}
.cardboard-stamp {
  font-family: monospace;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: #241407;
  border: 2px solid #241407;
  padding: 2px 10px;
  border-radius: 3px;
  text-transform: uppercase;
}
.cardboard-tape {
  font-family: monospace;
  font-size: 10px;
  color: #4a3219;
  letter-spacing: 0.05em;
  font-weight: 700;
}

/* Pop-up Feedback Card from Inside Box */
.toybox-flyout-card {
  position: absolute;
  top: 10px;
  width: 90%;
  max-width: 360px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popupFromBox 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

@keyframes popupFromBox {
  0% {
    opacity: 0;
    transform: translateY(80px) scale(0.65);
  }
  65% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Floating Message Bubbles Around the Pop-up */
.toybox-bubble {
  position: absolute;
  z-index: 20;
  background: rgba(14, 15, 22, 0.94);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.7);
  border-radius: var(--r-pill);
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}
.toybox-bubble .bubble-tick {
  color: #10b981;
  font-size: 8px;
}
.toybox-bubble.bubble-top {
  top: -14px;
  right: -8px;
  animation: floatBubble1 3.5s ease-in-out infinite alternate;
}
.toybox-bubble.bubble-bottom {
  bottom: -12px;
  left: -8px;
  animation: floatBubble2 4s ease-in-out infinite alternate;
}

@keyframes floatBubble1 {
  0% { transform: translateY(0px) rotate(-1.5deg); }
  100% { transform: translateY(-7px) rotate(1.5deg); }
}
@keyframes floatBubble2 {
  0% { transform: translateY(0px) rotate(1.5deg); }
  100% { transform: translateY(-8px) rotate(-1deg); }
}

/* Screenshot Frame in Pop-up */
.flyout-screen-frame {
  width: 100%;
  height: 230px;
  background: #090a0f;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  position: relative;
}
.flyout-screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Fallback WhatsApp UI */
.flyout-fallback-ui {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0b0c10;
  color: #fff;
}
.flyout-ui-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #14151e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.flyout-ui-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.flyout-ui-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e11d48, #be123c);
  font-size: 9.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.flyout-ui-name {
  font-size: 11px;
  font-weight: 700;
  display: block;
}
.flyout-ui-status {
  font-size: 8.5px;
  color: #10b981;
}
.flyout-ui-secure {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.4);
}

.flyout-ui-messages {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  background: #0d0e14;
}
.f-msg {
  max-width: 88%;
  padding: 7px 10px;
  border-radius: 11px;
  font-size: 11.5px;
  line-height: 1.4;
  position: relative;
}
.f-msg.in {
  align-self: flex-start;
  background: #1e2029;
  color: #f1f2f6;
  border-bottom-left-radius: 2px;
}
.f-msg.out {
  align-self: flex-end;
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: #ffffff;
  border-bottom-right-radius: 2px;
}
.f-time {
  font-size: 8.5px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 6px;
}
.blue-tick {
  color: #38bdf8;
  font-weight: 700;
}

.flyout-ui-foot {
  padding: 6px 10px;
  background: #14151e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.45);
}

/* ── TOYS UNDERNEATH (SIDEWAYS SCROLL) ───────────── */
.toy-selector-section {
  max-width: 680px;
  margin: 22px auto 0;
}
.toy-selector-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 4px;
}
.toy-selector-scroll-wrap::-webkit-scrollbar {
  display: none;
}

.toy-selector-track {
  display: flex;
  gap: 12px;
  justify-content: center;
  min-width: max-content;
  padding: 0 4px;
}

.toy-tab-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 95px;
}
.toy-tab-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}
.toy-tab-card.active {
  background: rgba(225, 29, 72, 0.2);
  border-color: #fb7185;
  transform: translateY(-3px);
}

.toy-tab-img-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  overflow: hidden;
}
.toy-tab-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.toy-tab-name {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

/* ── CTA: "SHARE YOUR CONFESSION" ───────────────── */
.toybox-share-row {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
.btn-share-confession {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #be123c;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 12px 28px;
  border-radius: var(--r-pill);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-share-confession:hover {
  background: #e11d48;
  transform: translateY(-2px);
  border-color: #ffffff;
}

@media (max-width: 600px) {
  .toybox-section {
    padding: 32px 0 38px;
  }
  .cardboard-box {
    max-width: 340px;
    padding: 10px 12px 14px;
  }
  .cardboard-interior {
    min-height: 190px;
  }
  .toy-inside {
    width: 42px;
    height: 42px;
  }
  .toybox-flyout-card {
    max-width: 300px;
    top: 8px;
  }
  .flyout-screen-frame {
    height: 190px;
  }
  .toy-selector-track {
    justify-content: flex-start;
  }
  .toy-tab-card {
    min-width: 86px;
    padding: 6px 8px;
  }
  .toy-tab-img-wrap {
    width: 38px;
    height: 38px;
  }
  .btn-share-confession {
    font-size: 12.5px;
    padding: 10px 22px;
  }
}
`;

// 2. UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const oldToyBoxMarker = '/* ── THE CONFESSIONS TOY BOX';
const shareLinkMarker = '/* Share Link Button */';

const oldStart = styleCss.indexOf(oldToyBoxMarker);
const shareIdx = styleCss.indexOf(shareLinkMarker);

if (oldStart !== -1 && shareIdx !== -1) {
  styleCss = styleCss.slice(0, oldStart) + cardboardCss + '\n\n' + styleCss.slice(shareIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with Cardboard Box CSS');
} else {
  console.error('Could not find CSS markers:', { oldStart, shareIdx });
}

// 3. HTML FOR CARDBOARD CONFESSIONS BOX
const cardboardHtml = `    <!-- ===== THE CONFESSIONS CARDBOARD BOX ===== -->
    <section class="toybox-section" id="whispers">
      <div class="section-inner">
        <!-- Section Heading Only -->
        <div class="toybox-header">
          <h2 class="sh2">Confessions</h2>
        </div>

        <!-- The Interactive Cardboard Box Stage -->
        <div class="toybox-stage">

          <!-- Realistic Cardboard Delivery Box -->
          <div class="cardboard-box" id="toybox-chest">
            <!-- Open Box Flaps -->
            <div class="cardboard-top-flaps">
              <div class="cardboard-flap left"></div>
              <div class="cardboard-flap right"></div>
            </div>

            <!-- Open Box Interior with Toys Inside -->
            <div class="cardboard-interior">
              <div class="toys-inside-tray">
                <div class="toy-inside active-in-box" data-toy-ref="0" title="The Rose Sucker">
                  <img src="/assets/product-rose.webp" alt="Rose inside box" />
                </div>
                <div class="toy-inside" data-toy-ref="1" title="The Mini Wand">
                  <img src="/assets/product-wand.webp" alt="Wand inside box" />
                </div>
                <div class="toy-inside" data-toy-ref="2" title="Pocket Bullet">
                  <img src="/assets/bullet-vibe-all-colors.webp" alt="Bullet inside box" />
                </div>
                <div class="toy-inside" data-toy-ref="3" title="The Siren">
                  <img src="/assets/siren-app-red.webp" alt="Siren inside box" />
                </div>
                <div class="toy-inside" data-toy-ref="4" title="African Brute">
                  <img src="/assets/african-brute.webp" alt="Brute inside box" />
                </div>
              </div>
            </div>

            <!-- Cardboard Front Stamp -->
            <div class="cardboard-front">
              <span class="cardboard-stamp">CONFESSIONS</span>
              <span class="cardboard-tape">DISCREET · FRAGILE</span>
            </div>

            <!-- POP-UP FEEDBACK (Pops up from inside the box) -->
            <div class="toybox-flyout-card" id="toybox-flyout">
              <div class="toybox-bubble bubble-top" id="flyout-bubble-top">
                <span class="bubble-tick">●</span>
                <span id="flyout-bubble-top-text">"roommate thought it was skincare 📦"</span>
              </div>
              <div class="toybox-bubble bubble-bottom" id="flyout-bubble-bottom">
                <span class="bubble-tick">●</span>
                <span id="flyout-bubble-bottom-text">"cancel tomorrow... rose took me out in 3 mins 🌹"</span>
              </div>

              <!-- Chat Screenshot Frame -->
              <div class="flyout-screen-frame">
                <img src="/assets/chat-proof-1.webp" id="flyout-img" onerror="this.style.display='none'; document.getElementById('flyout-fallback-ui').style.display='flex';" class="flyout-screenshot-img" alt="Customer Chat Proof" />
                
                <div class="flyout-fallback-ui" id="flyout-fallback-ui">
                  <div class="flyout-ui-header">
                    <div class="flyout-ui-user">
                      <span class="flyout-ui-avatar">VIP</span>
                      <div>
                        <span class="flyout-ui-name" id="flyout-ui-client">[Discreet Client · Lekki]</span>
                        <span class="flyout-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="flyout-ui-secure">🔒 Disappearing</span>
                  </div>
                  <div class="flyout-ui-messages" id="flyout-ui-messages">
                    <div class="f-msg in" id="flyout-msg-1">
                      Babe my package just arrived in plain brown wrap... rider asked if it was skincare docs 😭
                      <span class="f-time">11:42 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="f-msg out" id="flyout-msg-2">
                      Zero branding always! Enjoy tonight 😉
                      <span class="f-time">11:43 PM</span>
                    </div>
                    <div class="f-msg in" id="flyout-msg-3">
                      UPDATE: cancel tomorrow. The Rose Sucker took me to another dimension in 3 mins.
                      <span class="f-time">01:15 AM <span class="blue-tick">✓✓</span></span>
                    </div>
                  </div>
                  <div class="flyout-ui-foot">
                    <span id="flyout-ui-tag">Featured: The Rose Sucker</span>
                    <span>100% Anonymous</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Toys Underneath (Sideways Scroll) -->
        <div class="toy-selector-section">
          <div class="toy-selector-scroll-wrap">
            <div class="toy-selector-track" id="toy-selector-track">
              <button type="button" class="toy-tab-card active" data-toy-idx="0">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-rose.webp" alt="The Rose Sucker" />
                </div>
                <span class="toy-tab-name">The Rose Sucker</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="1">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-wand.webp" alt="The Mini Wand" />
                </div>
                <span class="toy-tab-name">The Mini Wand</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="2">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/bullet-vibe-all-colors.webp" alt="Pocket Bullet" />
                </div>
                <span class="toy-tab-name">Pocket Bullet</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="3">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/siren-app-red.webp" alt="The Siren" />
                </div>
                <span class="toy-tab-name">The Siren</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="4">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/african-brute.webp" alt="African Brute" />
                </div>
                <span class="toy-tab-name">African Brute</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CTA: Share Your Confession -->
        <div class="toybox-share-row">
          <button type="button" class="btn-share-confession" id="btn-open-confession">
            Share your confession
          </button>
        </div>

      </div>
    </section>`;

// 4. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldHtmlStart = indexHtml.indexOf('<!-- ===== THE CONFESSIONS TOY BOX');
const discretionStart = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (oldHtmlStart !== -1 && discretionStart !== -1) {
  indexHtml = indexHtml.slice(0, oldHtmlStart) + cardboardHtml + '\n\n    ' + indexHtml.slice(discretionStart);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with Cardboard Box');
} else {
  console.error('Could not find markers in index.html', { oldHtmlStart, discretionStart });
}

// 5. UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodHtmlStart = productsHtml.indexOf('<!-- ===== THE CONFESSIONS TOY BOX');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodHtmlStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodHtmlStart) + cardboardHtml + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with Cardboard Box');
} else {
  console.error('Could not find markers in products.html', { prodHtmlStart, prodFooterStart });
}
