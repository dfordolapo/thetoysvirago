const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS FOR THE CONFESSIONS TOY BOX
const toyBoxCss = `/* ── THE CONFESSIONS TOY BOX (Velvet Chest & Fly-Out Receipts) ── */
.toybox-section {
  padding: 46px 0 52px;
  background: radial-gradient(ellipse at 50% 12%, rgba(225, 29, 72, 0.12) 0%, rgba(12, 12, 18, 0.96) 65%, #08080c 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.toybox-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 24px;
}
.toybox-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #fb7185;
  background: rgba(225, 29, 72, 0.1);
  border: 1px solid rgba(225, 29, 72, 0.25);
  padding: 4px 13px;
  border-radius: var(--r-pill);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.toybox-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: 0 0 10px #e11d48;
  animation: pulseDot 2s infinite;
}
.toybox-header .sh2 {
  font-size: clamp(26px, 4vw, 36px);
  margin: 0 0 6px;
  color: #ffffff;
}
.toybox-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

/* ── THE 3D TOY BOX STAGE ───────────────────────── */
.toybox-stage {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  position: relative;
  perspective: 1200px;
}

/* Luxury Toy Box Chest Container */
.toybox-chest {
  position: relative;
  width: 100%;
  max-width: 580px;
  background: linear-gradient(180deg, #181922 0%, #111219 100%);
  border: 2px solid rgba(255, 255, 255, 0.14);
  border-radius: 26px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8),
              0 0 40px rgba(159, 18, 57, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
}

/* Chest Lid Rim with Engraved Gold Plate */
.toybox-lid-rim {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.toybox-gold-plate {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #d4af37 0%, #aa771c 50%, #f3e5ab 100%);
  padding: 4px 18px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6);
  border: 1px solid #7a5210;
}
.plate-rivet {
  font-size: 8px;
  color: #553909;
}
.plate-title {
  font-family: var(--serif);
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #2a1b02;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}
.toybox-latch {
  font-size: 14px;
  color: #fbbf24;
  opacity: 0.8;
}

/* Quilted Deep Ruby Velvet Interior of the Chest */
.toybox-interior {
  width: 100%;
  position: relative;
  background: radial-gradient(ellipse at 50% 40%, #4c0519 0%, #1e020a 70%, #0d0105 100%);
  border: 1.5px solid rgba(225, 29, 72, 0.35);
  border-radius: 18px;
  padding: 16px 14px;
  box-shadow: inset 0 12px 28px rgba(0, 0, 0, 0.8),
              0 0 20px rgba(225, 29, 72, 0.2);
  margin-top: 6px;
  min-height: 250px;
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
  gap: 8px;
  z-index: 2;
  position: relative;
}
.toy-inside {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 16px rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));
}
.toy-inside img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.toy-inside.active-in-box {
  transform: translateY(-8px) scale(1.15);
  border-color: #fb7185;
  box-shadow: 0 10px 24px rgba(225, 29, 72, 0.4);
}

/* ── THE FLY-OUT FEEDBACK DISPLAY ──────────────── */
.toybox-flyout-card {
  position: absolute;
  top: 48px;
  width: 90%;
  max-width: 380px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: flyOutOfBox 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

@keyframes flyOutOfBox {
  0% {
    opacity: 0;
    transform: translateY(70px) scale(0.65) rotate(-3deg);
  }
  65% {
    opacity: 1;
    transform: translateY(-10px) scale(1.03) rotate(0.8deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

/* Floating Message Bubbles Around the Flyout */
.toybox-bubble {
  position: absolute;
  z-index: 20;
  background: rgba(14, 15, 22, 0.92);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.65), 0 0 16px rgba(225, 29, 72, 0.25);
  border-radius: var(--r-pill);
  padding: 6px 13px;
  font-size: 11.5px;
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
  font-size: 9px;
}
.toybox-bubble.bubble-top {
  top: -16px;
  right: -10px;
  animation: floatBubble1 3.5s ease-in-out infinite alternate;
}
.toybox-bubble.bubble-bottom {
  bottom: -14px;
  left: -10px;
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

/* Screenshot Frame in Flyout */
.flyout-screen-frame {
  width: 100%;
  height: 240px;
  background: #090a0f;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(225, 29, 72, 0.35);
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

/* ── SIDEWAYS SCROLLING TOY SELECTOR UNDER BOX ─── */
.toy-selector-section {
  max-width: 820px;
  margin: 32px auto 0;
}
.toy-selector-header {
  text-align: center;
  margin-bottom: 10px;
}
.toy-selector-hint {
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.06em;
}

.toy-selector-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 4px 4px 10px;
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
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 105px;
}
.toy-tab-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}
.toy-tab-card.active {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.2), rgba(159, 18, 57, 0.1));
  border-color: #fb7185;
  box-shadow: 0 4px 18px rgba(225, 29, 72, 0.3);
  transform: translateY(-4px);
}

.toy-tab-img-wrap {
  width: 48px;
  height: 48px;
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
.toy-tab-badge {
  font-size: 9px;
  font-family: monospace;
  color: #fb7185;
  font-weight: 800;
}

/* ── "SHARE YOUR CONFESSION" BUTTON ────────────── */
.toybox-share-row {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.btn-share-confession {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: linear-gradient(135deg, #be123c 0%, #881337 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 12px 28px;
  border-radius: var(--r-pill);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(190, 18, 60, 0.35);
  transition: all 0.25s ease;
}
.btn-share-confession:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(225, 29, 72, 0.5);
  border-color: #ffffff;
}
.confession-sparkle {
  font-size: 14px;
}
.confession-arrow {
  transition: transform 0.2s ease;
}
.btn-share-confession:hover .confession-arrow {
  transform: translateX(3px);
}
.share-confession-sub {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

@media (max-width: 600px) {
  .toybox-section {
    padding: 34px 0 40px;
  }
  .toybox-chest {
    padding: 12px 14px 18px;
    border-radius: 20px;
  }
  .toybox-interior {
    min-height: 220px;
  }
  .toybox-flyout-card {
    top: 36px;
    width: 95%;
  }
  .flyout-screen-frame {
    height: 210px;
  }
  .toys-inside-tray {
    gap: 4px;
  }
  .toy-inside {
    width: 44px;
    height: 44px;
  }
  .toybox-bubble {
    font-size: 10px;
    padding: 4px 9px;
  }
  .toy-selector-track {
    justify-content: flex-start;
  }
  .toy-tab-card {
    min-width: 92px;
    padding: 8px 10px;
  }
  .toy-tab-img-wrap {
    width: 40px;
    height: 40px;
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

const oldChatProofsMarker = '/* ── AVANT-GARDE 3D CHAT DECK';
const shareLinkMarker = '/* Share Link Button */';

const oldStart = styleCss.indexOf(oldChatProofsMarker);
const shareIdx = styleCss.indexOf(shareLinkMarker);

if (oldStart !== -1 && shareIdx !== -1) {
  styleCss = styleCss.slice(0, oldStart) + toyBoxCss + '\n\n' + styleCss.slice(shareIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with Confessions Toy Box CSS');
} else {
  console.error('Could not find CSS markers:', { oldStart, shareIdx });
}

// 3. HTML FOR THE CONFESSIONS TOY BOX
const toyBoxHtml = `    <!-- ===== THE CONFESSIONS TOY BOX ===== -->
    <section class="toybox-section" id="whispers">
      <div class="section-inner">
        <!-- Section Header -->
        <div class="toybox-header">
          <span class="toybox-tag">
            <span class="toybox-dot"></span>
            Verified Customer Receipts
          </span>
          <h2 class="sh2">The Confessions Box.</h2>
          <p class="toybox-sub">Select any toy below to unlock its unfiltered customer confessions directly from the box.</p>
        </div>

        <!-- The Interactive Toy Box Stage -->
        <div class="toybox-stage">

          <!-- 3D Luxury Velvet-Lined Toy Box / Chest -->
          <div class="toybox-chest" id="toybox-chest">
            <!-- Box Lid / Rim with Gold Plate -->
            <div class="toybox-lid-rim">
              <div class="toybox-gold-plate">
                <span class="plate-rivet">●</span>
                <span class="plate-title">CONFESSIONS</span>
                <span class="plate-rivet">●</span>
              </div>
              <div class="toybox-latch">🔒</div>
            </div>

            <!-- Inside the Chest: Ruby Quilted Velvet Interior with Resting Toys -->
            <div class="toybox-interior">
              <div class="toys-inside-tray">
                <div class="toy-inside active-in-box" data-toy-ref="0" title="The Rose Sucker">
                  <img src="/assets/product-rose.webp" alt="Rose inside toy box" />
                </div>
                <div class="toy-inside" data-toy-ref="1" title="The Mini Wand">
                  <img src="/assets/product-wand.webp" alt="Wand inside toy box" />
                </div>
                <div class="toy-inside" data-toy-ref="2" title="Pocket Bullet">
                  <img src="/assets/bullet-vibe-all-colors.webp" alt="Bullet inside toy box" />
                </div>
                <div class="toy-inside" data-toy-ref="3" title="The Siren">
                  <img src="/assets/siren-app-red.webp" alt="Siren inside toy box" />
                </div>
                <div class="toy-inside" data-toy-ref="4" title="African Brute">
                  <img src="/assets/african-brute.webp" alt="Brute tonic inside toy box" />
                </div>
              </div>
            </div>

            <!-- THE FLY-OUT FEEDBACK DISPLAY (Flies out from the box) -->
            <div class="toybox-flyout-card" id="toybox-flyout">
              <!-- Floating Message Bubbles around the flying feedback -->
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
                <!-- User Uploaded Screenshot -->
                <img src="/assets/chat-proof-1.webp" id="flyout-img" onerror="this.style.display='none'; document.getElementById('flyout-fallback-ui').style.display='flex';" class="flyout-screenshot-img" alt="Customer Chat Proof" />
                
                <!-- Fallback Dark WhatsApp UI -->
                <div class="flyout-fallback-ui" id="flyout-fallback-ui">
                  <div class="flyout-ui-header">
                    <div class="flyout-ui-user">
                      <span class="flyout-ui-avatar">VIP</span>
                      <div>
                        <span class="flyout-ui-name" id="flyout-ui-client">[Discreet Client · Lekki]</span>
                        <span class="flyout-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="flyout-ui-secure">🔒 Disappearing On</span>
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

        <!-- The Sideways Scrolling Toys Bar Under the Box -->
        <div class="toy-selector-section">
          <div class="toy-selector-header">
            <span class="toy-selector-hint">&larr; Scroll toys sideways &amp; tap to unbox confessions &rarr;</span>
          </div>

          <div class="toy-selector-scroll-wrap">
            <div class="toy-selector-track" id="toy-selector-track">
              <!-- Toy 0: The Rose Sucker -->
              <button type="button" class="toy-tab-card active" data-toy-idx="0">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-rose.webp" alt="The Rose Sucker" />
                </div>
                <span class="toy-tab-name">The Rose Sucker</span>
                <span class="toy-tab-badge">Unbox &uarr;</span>
              </button>

              <!-- Toy 1: The Mini Wand -->
              <button type="button" class="toy-tab-card" data-toy-idx="1">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-wand.webp" alt="The Mini Wand" />
                </div>
                <span class="toy-tab-name">The Mini Wand</span>
                <span class="toy-tab-badge">Unbox &uarr;</span>
              </button>

              <!-- Toy 2: Velvet Pocket Bullet -->
              <button type="button" class="toy-tab-card" data-toy-idx="2">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/bullet-vibe-all-colors.webp" alt="Velvet Pocket Bullet" />
                </div>
                <span class="toy-tab-name">Pocket Bullet</span>
                <span class="toy-tab-badge">Unbox &uarr;</span>
              </button>

              <!-- Toy 3: The Siren App Vibe -->
              <button type="button" class="toy-tab-card" data-toy-idx="3">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/siren-app-red.webp" alt="The Siren" />
                </div>
                <span class="toy-tab-name">The Siren</span>
                <span class="toy-tab-badge">Unbox &uarr;</span>
              </button>

              <!-- Toy 4: African Brute Tonic -->
              <button type="button" class="toy-tab-card" data-toy-idx="4">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/african-brute.webp" alt="African Brute Tonic" />
                </div>
                <span class="toy-tab-name">African Brute</span>
                <span class="toy-tab-badge">Unbox &uarr;</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Action: "Share Your Confession" -->
        <div class="toybox-share-row">
          <button type="button" class="btn-share-confession" id="btn-open-confession">
            <span class="confession-sparkle">✨</span>
            <span>Share your confession</span>
            <span class="confession-arrow">&rarr;</span>
          </button>
          <p class="share-confession-sub">100% anonymous · Zero names recorded · Encrypted</p>
        </div>

      </div>
    </section>`;

// 4. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldHtmlStart = indexHtml.indexOf('<!-- ===== CRAZY 3D CHAT DECK');
const discretionStart = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (oldHtmlStart !== -1 && discretionStart !== -1) {
  indexHtml = indexHtml.slice(0, oldHtmlStart) + toyBoxHtml + '\n\n    ' + indexHtml.slice(discretionStart);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with The Confessions Toy Box');
} else {
  console.error('Could not find markers in index.html', { oldHtmlStart, discretionStart });
}

// 5. UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodHtmlStart = productsHtml.indexOf('<!-- ===== CRAZY 3D CHAT DECK');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodHtmlStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodHtmlStart) + toyBoxHtml + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with The Confessions Toy Box');
} else {
  console.error('Could not find markers in products.html', { prodHtmlStart, prodFooterStart });
}

// 6. JAVASCRIPT FOR THE TOY BOX INTERACTION & FLY-OUT
const toyBoxJs = `// ================= 10. THE CONFESSIONS TOY BOX FLY-OUT LOGIC =================
const TOYBOX_CONFESSIONS = [
  {
    toyName: "The Rose Sucker",
    client: "[Discreet Client · Lekki]",
    bubbleTop: '"roommate thought it was skincare 📦"',
    bubbleBottom: '"cancel tomorrow... rose took me out in 3 mins 🌹"',
    msg1: "Babe my package just arrived in plain brown wrap... rider asked if it was skincare docs 😭",
    msg2: "Zero branding always! Enjoy tonight 😉",
    msg3: "UPDATE: cancel tomorrow. The Rose Sucker took me to another dimension in 3 mins.",
    img: "/assets/chat-proof-1.webp"
  },
  {
    toyName: "The Mini Wand",
    client: "[Discreet Client · Abuja]",
    bubbleTop: '"my knees literally gave out 🫠"',
    bubbleBottom: '"you people are dangerous ⚡"',
    msg1: "I thought Twitter people were hyping The Mini Wand for nothing...",
    msg2: "Medical-grade motor hits different 🌹",
    msg3: "Standing in my bathroom and my knees gave way. You people are very dangerous!",
    img: "/assets/chat-proof-2.webp"
  },
  {
    toyName: "Pocket Bullet",
    client: "[Discreet Client · Yaba]",
    bubbleTop: '"landlady handed it to me 😂"',
    bubbleBottom: '"10/10 plain packaging 🔒"',
    msg1: "My strict landlady took the parcel from rider downstairs.",
    msg2: "Discretion is our #1 priority always!",
    msg3: "She said 'Sister your serum has arrived'. I almost laughed out loud. 10/10 packaging!",
    img: "/assets/chat-proof-3.webp"
  },
  {
    toyName: "The Siren",
    client: "[Discreet Client · VI]",
    bubbleTop: '"controlled from London Heathrow 🥵"',
    bubbleBottom: '"at dinner in VI... insane device 🖤"',
    msg1: "He had app control of The Siren from Heathrow lounge while I was having dinner in VI.",
    msg2: "Global app sync is unmatched! 😉",
    msg3: "Had to grip my bag with white knuckles so I wouldn't make a sound. Insane device.",
    img: "/assets/chat-proof-4.webp"
  },
  {
    toyName: "African Brute",
    client: "[Discreet Client · Port Harcourt]",
    bubbleTop: '"cancelled Sunday morning plans 🔥"',
    bubbleBottom: '"three rounds back to back ⚡"',
    msg1: "He took two spoons of African Brute Tonic and used the Rabbit Ring.",
    msg2: "Natural herbal stamina never fails! 🔥",
    msg3: "We literally had to cancel Sunday morning plans. Three rounds back to back. In shock.",
    img: "/assets/chat-proof-5.webp"
  }
];

function initToyBoxConfessions() {
  const toyTabs = document.querySelectorAll('.toy-tab-card');
  const toysInBox = document.querySelectorAll('.toy-inside');
  const flyout = document.getElementById('toybox-flyout');
  const bubbleTopText = document.getElementById('flyout-bubble-top-text');
  const bubbleBottomText = document.getElementById('flyout-bubble-bottom-text');
  const flyoutImg = document.getElementById('flyout-img');
  const fallbackUi = document.getElementById('flyout-fallback-ui');
  const clientName = document.getElementById('flyout-ui-client');
  const msg1 = document.getElementById('flyout-msg-1');
  const msg2 = document.getElementById('flyout-msg-2');
  const msg3 = document.getElementById('flyout-msg-3');
  const uiTag = document.getElementById('flyout-ui-tag');

  if (!flyout || !toyTabs.length) return;

  function selectToy(idx) {
    if (idx < 0 || idx >= TOYBOX_CONFESSIONS.length) return;
    const data = TOYBOX_CONFESSIONS[idx];

    // Highlight bottom sideways tabs
    toyTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });

    // Highlight toy inside the box
    toysInBox.forEach((toy, i) => {
      toy.classList.toggle('active-in-box', i === idx);
    });

    // Trigger flyout animation from box
    flyout.style.animation = 'none';
    flyout.offsetHeight; // force reflow
    flyout.style.animation = 'flyOutOfBox 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    // Update floating bubbles
    if (bubbleTopText) bubbleTopText.textContent = data.bubbleTop;
    if (bubbleBottomText) bubbleBottomText.textContent = data.bubbleBottom;

    // Update screenshot or fallback chat UI
    if (flyoutImg) {
      flyoutImg.src = data.img;
      flyoutImg.style.display = 'block';
      if (fallbackUi) fallbackUi.style.display = 'none';
    }

    if (clientName) clientName.textContent = data.client;
    if (msg1) msg1.innerHTML = \`\${data.msg1} <span class="f-time">11:42 PM <span class="blue-tick">✓✓</span></span>\`;
    if (msg2) msg2.innerHTML = \`\${data.msg2} <span class="f-time">11:43 PM</span>\`;
    if (msg3) msg3.innerHTML = \`\${data.msg3} <span class="f-time">01:15 AM <span class="blue-tick">✓✓</span></span>\`;
    if (uiTag) uiTag.textContent = \`Featured: \${data.toyName}\`;
  }

  toyTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      selectToy(idx);
    });
  });

  toysInBox.forEach((toy, idx) => {
    toy.addEventListener('click', () => {
      selectToy(idx);
    });
  });

  // Modal open
  const modal = document.getElementById('confession-modal');
  const btnOpen = document.getElementById('btn-open-confession');
  const btnClose = document.getElementById('btn-close-confession');
  const form = document.getElementById('confession-form');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.removeAttribute('hidden');
      modal.style.display = 'flex';
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
      }
    });
  }

  if (form && modal) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
      form.reset();
      if (typeof showToast === 'function') {
        showToast('Confession placed inside the vault with zero trace. Thank you.');
      }
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initToyBoxConfessions);
} else {
  initToyBoxConfessions();
}
`;

// UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const oldCrazyJsStart = mainJs.indexOf('// ================= 10. CRAZY 3D CHAT DECK CONTROLS');
if (oldCrazyJsStart !== -1) {
  mainJs = mainJs.slice(0, oldCrazyJsStart) + toyBoxJs;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with initToyBoxConfessions()');
} else {
  console.error('Could not find // ================= 10. CRAZY 3D CHAT DECK CONTROLS in main.js');
}
