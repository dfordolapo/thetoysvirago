const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const wireCss = `/* ── THE MIDNIGHT WIRE: ENCRYPTED FREQUENCY CONSOLE ──────── */
.wire-section {
  padding: 48px 0 52px;
  background: radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.08) 0%, #09090d 75%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}
.wire-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.wire-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fb7185;
  background: rgba(225, 29, 72, 0.1);
  border: 1px solid rgba(225, 29, 72, 0.25);
  padding: 5px 13px;
  border-radius: var(--r-pill);
  text-transform: uppercase;
}
.wire-status-pill .pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: 0 0 10px #e11d48;
  animation: pulseDot 2s infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
.wire-header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}
.wire-badge-secure {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
}

/* Ambient Midnight Stream (Moving Ticker Tape) */
.wire-stream-wrap {
  height: 38px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--r-pill);
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 18px;
  position: relative;
}
.wire-stream-track {
  display: flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
  animation: wireScroll 34s linear infinite;
  will-change: transform;
}
.wire-stream-track:hover {
  animation-play-state: paused;
}
@keyframes wireScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.wire-snippet {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.wire-snippet strong {
  color: #fb7185;
  font-family: monospace;
  font-size: 11px;
}
.wire-dot {
  color: rgba(225, 29, 72, 0.6);
  font-size: 8px;
}

/* Central Frequency Deck */
.wire-deck {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  background: rgba(18, 18, 24, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 18px;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* Frequency Channel Selector (Left Strip) */
.wire-channels {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wire-chan-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
}
.wire-chan-btn .chan-index {
  font-family: monospace;
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
}
.wire-chan-btn .chan-coord {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 auto 0 8px;
  letter-spacing: 0.02em;
}
.wire-chan-btn .chan-freq {
  font-family: monospace;
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.35);
}
.wire-chan-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}
.wire-chan-btn.active {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.22), rgba(159, 18, 57, 0.1));
  border-color: rgba(225, 29, 72, 0.55);
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.25);
}
.wire-chan-btn.active .chan-index {
  color: #fb7185;
}
.wire-chan-btn.active .chan-coord {
  color: #ffffff;
}
.wire-chan-btn.active .chan-freq {
  color: #fb7185;
  font-weight: 700;
}

/* Active Screen Cockpit (Right Pane) */
.wire-screen {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(10, 10, 14, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 20px 22px;
  position: relative;
  min-height: 220px;
}
.wire-screen-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}
.wire-signal-tag {
  font-family: monospace;
  font-size: 10px;
  font-weight: 800;
  color: #fb7185;
  letter-spacing: 0.1em;
  background: rgba(225, 29, 72, 0.12);
  padding: 3px 8px;
  border-radius: 4px;
}
.wire-intercept {
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.04em;
  margin-left: 8px;
}
.wire-waveform-strip {
  display: flex;
  align-items: center;
  gap: 2.5px;
  height: 16px;
}
.wire-waveform-strip .bar {
  width: 2.5px;
  background: rgba(225, 29, 72, 0.6);
  border-radius: 2px;
  height: 8px;
  animation: wavePulse 0.9s ease-in-out infinite alternate;
}
.wire-waveform-strip .bar:nth-child(2n) { height: 14px; animation-delay: 0.15s; }
.wire-waveform-strip .bar:nth-child(3n) { height: 11px; animation-delay: 0.3s; }
.wire-waveform-strip .bar:nth-child(4n) { height: 16px; animation-delay: 0.45s; }
.wire-waveform-strip .bar:nth-child(5n) { height: 6px; animation-delay: 0.2s; }

.wire-redacted-badge {
  font-family: monospace;
  font-size: 9.5px;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.3);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

/* Quote Text & Redacted Tape Effect */
.wire-message-box {
  margin: 16px 0;
}
.wire-quote {
  font-size: clamp(15px, 2vw, 17.5px);
  line-height: 1.6;
  color: #f3f3f6;
  font-weight: 400;
  font-family: var(--sans);
  margin: 0;
}
.redact-tape {
  display: inline-block;
  background: #000000;
  color: #000000;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 700;
  user-select: none;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.8);
  position: relative;
}
.redact-tape:hover,
.redact-tape.revealed {
  background: rgba(225, 29, 72, 0.18);
  color: #fb7185;
  border-color: rgba(225, 29, 72, 0.5);
  box-shadow: 0 0 12px rgba(225, 29, 72, 0.35);
  text-shadow: 0 0 6px rgba(225, 29, 72, 0.3);
}

/* Cockpit Footer Controls */
.wire-screen-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 14px;
  gap: 12px;
  flex-wrap: wrap;
}
.wire-product-micro {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.wire-prod-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.wire-prod-details {
  display: flex;
  flex-direction: column;
}
.wire-prod-label {
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  font-family: monospace;
}
.wire-prod-name {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.2s;
}
.wire-prod-name:hover {
  color: #fb7185;
}

.wire-reactions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wire-react-pill {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--r-pill);
  padding: 4px 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.wire-react-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
  transform: translateY(-1px);
}
.wire-react-pill.reacted {
  background: rgba(225, 29, 72, 0.2);
  border-color: rgba(225, 29, 72, 0.5);
  color: #fb7185;
  transform: scale(1.08);
}

.wire-nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.wire-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.wire-nav-btn:hover {
  background: var(--ruby);
  border-color: var(--ruby);
  transform: scale(1.06);
}
.wire-page-counter {
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 42px;
  text-align: center;
}

/* Footer Action */
.wire-foot-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.btn-whisper-transmit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  padding: 8px 18px;
  border-radius: var(--r-pill);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-whisper-transmit:hover {
  background: rgba(225, 29, 72, 0.15);
  border-color: rgba(225, 29, 72, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
}
.transmit-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: 0 0 8px #e11d48;
  animation: pulseDot 2s infinite;
}
.transmit-tag {
  color: #fb7185;
  font-family: monospace;
  font-size: 10px;
  font-weight: 700;
}

@media (max-width: 860px) {
  .wire-deck {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .wire-channels {
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
  }
  .wire-channels::-webkit-scrollbar {
    display: none;
  }
  .wire-chan-btn {
    flex-shrink: 0;
    min-width: 145px;
  }
}
@media (max-width: 580px) {
  .wire-section {
    padding: 36px 0 42px;
  }
  .wire-deck {
    padding: 12px;
    border-radius: 16px;
  }
  .wire-screen {
    padding: 14px;
    min-height: auto;
  }
  .wire-screen-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .wire-quote {
    font-size: 14px;
    line-height: 1.5;
  }
  .wire-screen-foot {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .wire-nav-controls {
    justify-content: center;
    margin-left: 0;
  }
  .btn-whisper-transmit {
    width: 100%;
    justify-content: center;
    font-size: 11px;
    padding: 10px;
  }
}
`;

// Locate the start of the whispers CSS
const whispersIdx = styleCss.indexOf('/* ── THE BOUDOIR WHISPERS');
if (whispersIdx !== -1) {
  // Find where .btn-share-link begins
  const shareLinkIdx = styleCss.indexOf('/* Share Link Button */', whispersIdx);
  if (shareLinkIdx !== -1) {
    const afterShareLink = styleCss.slice(shareLinkIdx);
    styleCss = styleCss.slice(0, whispersIdx) + wireCss + '\n\n' + afterShareLink;
    fs.writeFileSync(styleCssPath, styleCss, 'utf8');
    console.log('✓ Successfully updated src/style.css with .wire-section styles');
  } else {
    console.error('Could not find /* Share Link Button */');
  }
} else {
  console.error('Could not find /* ── THE BOUDOIR WHISPERS');
}

// 2. HTML CONTENT FOR MIDNIGHT WIRE
const wireHtml = `    <!-- ===== THE MIDNIGHT WIRE: ENCRYPTED TRANSMISSIONS ===== -->
    <section class="wire-section" id="whispers">
      <div class="section-inner">
        <!-- Compact Status HUD -->
        <div class="wire-header">
          <div class="wire-status-pill">
            <span class="pulse-dot"></span>
            <span>ENCRYPTED TRANSMISSIONS // ZERO IDENTITY LOG</span>
          </div>
          <div class="wire-header-meta">
            <span class="wire-clock" id="wire-live-clock">02:14:08 AM WAT</span>
            <span class="wire-badge-secure">256-BIT DISCREET</span>
          </div>
        </div>

        <!-- Ambient Midnight Stream (Moving Ticker Tape) -->
        <div class="wire-stream-wrap" aria-label="Incoming anonymous transmissions">
          <div class="wire-stream-track">
            <span class="wire-snippet"><strong>[02:14 AM · LAGOS]</strong> "Roommate took the package from rider thinking it was a laptop charger. Zero suspicion." 🤫</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[11:39 PM · ABUJA]</strong> "Cancel whatever was planned for tomorrow. The Rose Sucker took me out in under three minutes." ⚡</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[01:05 AM · PH]</strong> "Plain unmarked bubble wrap. My gatekeeper asked zero questions." 📦</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[02:50 AM · VI]</strong> "App-controlled from London while at a restaurant in VI. White knuckles all night." 🥵</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[03:22 AM · IKEJA]</strong> "Motor is genuinely silent. Housemates were in the parlor and heard nothing." 🔒</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[04:11 AM · IBADAN]</strong> "Two spoons of African Brute and Sunday morning was completely cancelled." 🔥</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[02:14 AM · LAGOS]</strong> "Roommate took the package from rider thinking it was a laptop charger. Zero suspicion." 🤫</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[11:39 PM · ABUJA]</strong> "Cancel whatever was planned for tomorrow. The Rose Sucker took me out in under three minutes." ⚡</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[01:05 AM · PH]</strong> "Plain unmarked bubble wrap. My gatekeeper asked zero questions." 📦</span>
            <span class="wire-dot">◆</span>
            <span class="wire-snippet"><strong>[02:50 AM · VI]</strong> "App-controlled from London while at a restaurant in VI. White knuckles all night." 🥵</span>
          </div>
        </div>

        <!-- Central Frequency Deck -->
        <div class="wire-deck">
          
          <!-- Channels Strip (Left / Top) -->
          <div class="wire-channels" role="tablist" aria-label="Frequency signals">
            <button class="wire-chan-btn active" data-wire="0" type="button" role="tab" aria-selected="true">
              <span class="chan-index">01</span>
              <span class="chan-coord">LEKKI · 01:15 AM</span>
              <span class="chan-freq">104.2 MHz</span>
            </button>
            <button class="wire-chan-btn" data-wire="1" type="button" role="tab" aria-selected="false">
              <span class="chan-index">02</span>
              <span class="chan-coord">ABUJA · 11:42 PM</span>
              <span class="chan-freq">98.6 MHz</span>
            </button>
            <button class="wire-chan-btn" data-wire="2" type="button" role="tab" aria-selected="false">
              <span class="chan-index">03</span>
              <span class="chan-coord">YABA · 02:20 AM</span>
              <span class="chan-freq">101.4 MHz</span>
            </button>
            <button class="wire-chan-btn" data-wire="3" type="button" role="tab" aria-selected="false">
              <span class="chan-index">04</span>
              <span class="chan-coord">VI · 08:24 PM</span>
              <span class="chan-freq">107.9 MHz</span>
            </button>
            <button class="wire-chan-btn" data-wire="4" type="button" role="tab" aria-selected="false">
              <span class="chan-index">05</span>
              <span class="chan-coord">PH · 03:05 AM</span>
              <span class="chan-freq">95.1 MHz</span>
            </button>
          </div>

          <!-- Active Transmission Screen Cockpit -->
          <div class="wire-screen" id="wire-screen">
            
            <!-- HUD Meta Line -->
            <div class="wire-screen-meta">
              <div class="wire-meta-left">
                <span class="wire-signal-tag" id="wire-sig-tag">TRANSMISSION // SIG-01</span>
                <span class="wire-intercept" id="wire-sig-origin">INTERCEPT: LEKKI PHASE 1 · 01:15 AM</span>
              </div>
              <div class="wire-waveform-strip" id="wire-waveform">
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
              </div>
              <span class="wire-redacted-badge">IDENTITY: ERASED</span>
            </div>

            <!-- The Big Editorial Text with Interactive Redacted Words -->
            <div class="wire-message-box">
              <blockquote class="wire-quote" id="wire-quote-body">
                "Dispatch rider literally asked if the parcel was skincare documents. Cancel whatever was planned for tomorrow — the Rose Sucker took me to another dimension in <span class="redact-tape" title="Tap to reveal">under 3 minutes</span>. Best purchase of 2026."
              </blockquote>
            </div>

            <!-- Cockpit Action Footer -->
            <div class="wire-screen-foot">
              <div class="wire-product-micro" id="wire-product-link">
                <img src="/assets/product-rose.webp" alt="The Rose Sucker" class="wire-prod-thumb" id="wire-prod-img" />
                <div class="wire-prod-details">
                  <span class="wire-prod-label">VERIFIED DEVICE</span>
                  <a href="/products.html?product=rose-blossom" class="wire-prod-name" id="wire-prod-name">The Rose Sucker &rarr;</a>
                </div>
              </div>

              <div class="wire-reactions">
                <button class="wire-react-pill" data-wire-react="fire" type="button" aria-label="React Fire">
                  <span>🔥</span> <span class="react-num" id="wire-react-fire">482</span>
                </button>
                <button class="wire-react-pill" data-wire-react="hush" type="button" aria-label="React Hush">
                  <span>🤫</span> <span class="react-num" id="wire-react-hush">291</span>
                </button>
                <button class="wire-react-pill" data-wire-react="mind" type="button" aria-label="React Mind">
                  <span>🤯</span> <span class="react-num" id="wire-react-mind">174</span>
                </button>
              </div>

              <!-- Navigation Controls -->
              <div class="wire-nav-controls">
                <button class="wire-nav-btn" id="btn-wire-prev" type="button" aria-label="Previous transmission">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span class="wire-page-counter" id="wire-page-counter">01 / 05</span>
                <button class="wire-nav-btn" id="btn-wire-next" type="button" aria-label="Next transmission">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- Sleek Bottom Anonymous Whisper Trigger -->
        <div class="wire-foot-actions">
          <button type="button" class="btn-whisper-transmit" id="btn-open-confession">
            <span class="transmit-dot"></span>
            <span>Transmit an Anonymous Whisper to the Vault</span>
            <span class="transmit-tag">Zero Identity Recorded &rarr;</span>
          </button>
        </div>

      </div>
    </section>

    <!-- ===== ANONYMOUS CONFESSION MODAL (100% NAMELESS) ===== -->
    <div id="confession-modal" class="modal-overlay" hidden style="display: none;">
      <div class="modal-card co-card" style="max-width: 460px;">
        <button type="button" class="btn-close-modal" id="btn-close-confession" aria-label="Close modal">&times;</button>
        <div class="co-head">
          <span class="wire-signal-tag" style="margin-bottom: 8px;">● SECURE UPLOAD</span>
          <h3 class="sh2" style="font-size: 24px; color: #fff;">Transmit to the Vault</h3>
          <p style="font-size: 13px; color: rgba(255,255,255,0.65);">Share your unfiltered experience. 100% anonymous &amp; encrypted. Zero names recorded.</p>
        </div>
        <form id="confession-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="co-label" for="conf-city">City / District (Optional)</label>
            <input type="text" id="conf-city" class="input-field" placeholder="e.g. Lekki, Maitama, Yaba, Port Harcourt" />
          </div>
          <div>
            <label class="co-label" for="conf-item">Which Item Changed Your Life?</label>
            <select id="conf-item" class="input-field" style="background: #141418; color: #fff;">
              <option value="The Rose Sucker">The Rose Sucker</option>
              <option value="The Mini Wand">The Mini Wand</option>
              <option value="The Siren">The Siren</option>
              <option value="Lipstick Vibe">Lipstick Vibe</option>
              <option value="Velvet Pocket Bullet">Velvet Pocket Bullet</option>
              <option value="African Brute Tonic">African Brute Tonic</option>
              <option value="Discreet Packaging">Discreet Plain Packaging</option>
            </select>
          </div>
          <div>
            <label class="co-label" for="conf-text">Your Unfiltered Experience</label>
            <textarea id="conf-text" class="input-field" rows="3" placeholder="Tell us what happened when it arrived..." required style="resize: vertical;"></textarea>
          </div>
          <button type="submit" class="btn btn-ruby btn-block" style="margin-top: 6px;">
            Transmit Signal (100% Nameless) &rarr;
          </button>
        </form>
      </div>
    </div>`;

// 3. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Find whispers section and modal in index.html, up to feedback-marquee
const whispersStartIdx = indexHtml.indexOf('<!-- ===== THE BOUDOIR WHISPERS');
const discretionIdx = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (whispersStartIdx !== -1 && discretionIdx !== -1) {
  indexHtml = indexHtml.slice(0, whispersStartIdx) + wireHtml + '\n\n' + indexHtml.slice(discretionIdx);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with Midnight Wire');
} else {
  console.error('Could not find whispers in index.html');
}

// 4. UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodWhispersStart = productsHtml.indexOf('<!-- ===== THE BOUDOIR WHISPERS');
const prodDiscretionIdx = productsHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (prodWhispersStart !== -1 && prodDiscretionIdx !== -1) {
  productsHtml = productsHtml.slice(0, prodWhispersStart) + wireHtml + '\n\n' + productsHtml.slice(prodDiscretionIdx);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with Midnight Wire');
} else {
  console.error('Could not find whispers in products.html');
}

// 5. UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const wireJs = `// ================= 10. THE MIDNIGHT WIRE INTERACTIVE CONSOLE =================
const WIRE_TRANSMISSIONS = [
  {
    id: "SIG-01",
    coord: "LEKKI PHASE 1 · 01:15 AM",
    freq: "104.2 MHz",
    quote: 'Dispatch rider literally asked if the parcel was skincare documents. Cancel whatever was planned for tomorrow — the Rose Sucker took me to another dimension in <span class="redact-tape" title="Tap to reveal">under 3 minutes</span>. Best purchase of 2026.',
    productName: "The Rose Sucker →",
    productUrl: "/products.html?product=rose-blossom",
    productImg: "/assets/product-rose.webp",
    reactions: { fire: 482, hush: 291, mind: 174 }
  },
  {
    id: "SIG-02",
    coord: "MAITAMA, ABUJA · 11:42 PM",
    freq: "98.6 MHz",
    quote: 'I thought people were exaggerating on Twitter about The Mini Wand... my <span class="redact-tape" title="Tap to reveal">knees literally gave out</span> while standing in my bathroom. You people are dangerous!',
    productName: "The Mini Wand →",
    productUrl: "/products.html?product=sceptre-wand",
    productImg: "/assets/product-wand.webp",
    reactions: { fire: 394, hush: 218, mind: 341 }
  },
  {
    id: "SIG-03",
    coord: "YABA, LAGOS · 02:20 AM",
    freq: "101.4 MHz",
    quote: 'My strict Nigerian landlady took the parcel from the rider downstairs and handed it to me saying \\'Sister your skincare package has arrived\\'. I had to bite my tongue so hard not to laugh. <span class="redact-tape" title="Tap to reveal">1000/10 stealth packaging</span>.',
    productName: "Pocket Bullet →",
    productUrl: "/products.html?product=pocket-bullet",
    productImg: "/assets/bullet-vibe-all-colors.webp",
    reactions: { fire: 529, hush: 412, mind: 195 }
  },
  {
    id: "SIG-04",
    coord: "VICTORIA ISLAND · 08:24 PM",
    freq: "107.9 MHz",
    quote: 'He had app control of The Siren from his Heathrow lounge while I was having dinner at a restaurant in VI. I had to grip my handbag with white knuckles so I wouldn\\'t make <span class="redact-tape" title="Tap to reveal">a single sound</span>.',
    productName: "The Siren →",
    productUrl: "/products.html?product=siren-app",
    productImg: "/assets/siren-app-red.webp",
    reactions: { fire: 612, hush: 345, mind: 288 }
  },
  {
    id: "SIG-05",
    coord: "PORT HARCOURT · 03:05 AM",
    freq: "95.1 MHz",
    quote: 'Two tablespoons of African Brute Tonic and the Rabbit Ring. We literally had to cancel Sunday morning church plans. <span class="redact-tape" title="Tap to reveal">Three rounds back to back</span>. Both of us are still recovering.',
    productName: "African Brute →",
    productUrl: "/products.html?product=african-brute",
    productImg: "/assets/african-brute.webp",
    reactions: { fire: 578, hush: 380, mind: 246 }
  }
];

function initMidnightWire() {
  const chanBtns = document.querySelectorAll('.wire-chan-btn');
  const sigTag = document.getElementById('wire-sig-tag');
  const sigOrigin = document.getElementById('wire-sig-origin');
  const quoteBody = document.getElementById('wire-quote-body');
  const prodImg = document.getElementById('wire-prod-img');
  const prodName = document.getElementById('wire-prod-name');
  const reactFire = document.getElementById('wire-react-fire');
  const reactHush = document.getElementById('wire-react-hush');
  const reactMind = document.getElementById('wire-react-mind');
  const counterEl = document.getElementById('wire-page-counter');
  const prevBtn = document.getElementById('btn-wire-prev');
  const nextBtn = document.getElementById('btn-wire-next');
  const liveClockEl = document.getElementById('wire-live-clock');

  if (!quoteBody) return;

  let currentIdx = 0;

  // Live WAT Clock
  function updateLiveClock() {
    if (!liveClockEl) return;
    const now = new Date();
    // West Africa Time (UTC+1)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const watTime = new Date(utc + (3600000 * 1));
    const h = String(watTime.getHours()).padStart(2, '0');
    const m = String(watTime.getMinutes()).padStart(2, '0');
    const s = String(watTime.getSeconds()).padStart(2, '0');
    const ampm = watTime.getHours() >= 12 ? 'PM' : 'AM';
    liveClockEl.textContent = \`\${h}:\${m}:\${s} \${ampm} WAT\`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  function attachRedactListeners() {
    const tapes = quoteBody.querySelectorAll('.redact-tape');
    tapes.forEach(tape => {
      tape.addEventListener('click', () => {
        tape.classList.toggle('revealed');
      });
    });
  }

  function renderTransmission(idx) {
    if (idx < 0) idx = WIRE_TRANSMISSIONS.length - 1;
    if (idx >= WIRE_TRANSMISSIONS.length) idx = 0;
    currentIdx = idx;

    const data = WIRE_TRANSMISSIONS[idx];

    // Buttons active state
    chanBtns.forEach((btn, i) => {
      const isActive = i === idx;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (sigTag) sigTag.textContent = \`TRANSMISSION // \${data.id}\`;
    if (sigOrigin) sigOrigin.textContent = \`INTERCEPT: \${data.coord}\`;
    if (quoteBody) {
      quoteBody.innerHTML = \`"\${data.quote}"\`;
      attachRedactListeners();
    }

    if (prodImg) {
      prodImg.src = data.productImg;
      prodImg.alt = data.productName.replace(' →', '');
    }
    if (prodName) {
      prodName.textContent = data.productName;
      prodName.href = data.productUrl;
    }

    // Reaction counts
    const savedFire = localStorage.getItem(\`ttv_wire_react_\${data.id}_fire\`);
    const savedHush = localStorage.getItem(\`ttv_wire_react_\${data.id}_hush\`);
    const savedMind = localStorage.getItem(\`ttv_wire_react_\${data.id}_mind\`);

    if (reactFire) reactFire.textContent = savedFire ? parseInt(savedFire, 10) : data.reactions.fire;
    if (reactHush) reactHush.textContent = savedHush ? parseInt(savedHush, 10) : data.reactions.hush;
    if (reactMind) reactMind.textContent = savedMind ? parseInt(savedMind, 10) : data.reactions.mind;

    // React buttons active state
    document.querySelectorAll('.wire-react-pill').forEach(pill => {
      const type = pill.dataset.wireReact;
      const reacted = localStorage.getItem(\`ttv_wire_did_react_\${data.id}_\${type}\`) === 'true';
      pill.classList.toggle('reacted', reacted);
    });

    if (counterEl) {
      counterEl.textContent = \`\${String(idx + 1).padStart(2, '0')} / \${String(WIRE_TRANSMISSIONS.length).padStart(2, '0')}\`;
    }
  }

  chanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIdx = parseInt(btn.dataset.wire, 10);
      renderTransmission(targetIdx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      renderTransmission(currentIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      renderTransmission(currentIdx + 1);
    });
  }

  // Interactive Reaction Pills
  const reactPills = document.querySelectorAll('.wire-react-pill');
  reactPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const type = pill.dataset.wireReact;
      const data = WIRE_TRANSMISSIONS[currentIdx];
      const countEl = pill.querySelector('.react-num');
      let count = parseInt(countEl.textContent, 10) || 0;
      const storageKey = \`ttv_wire_did_react_\${data.id}_\${type}\`;
      const isReacted = pill.classList.contains('reacted');

      if (!isReacted) {
        count++;
        pill.classList.add('reacted');
        localStorage.setItem(storageKey, 'true');
      } else {
        count--;
        pill.classList.remove('reacted');
        localStorage.removeItem(storageKey);
      }
      countEl.textContent = count;
      localStorage.setItem(\`ttv_wire_react_\${data.id}_\${type}\`, String(count));
    });
  });

  // Modal Handling
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
        showToast('Signal transmitted with zero identity trace. Thank you.');
      }
    });
  }

  // Initial render
  renderTransmission(0);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initMidnightWire);
} else {
  initMidnightWire();
}
`;

const confessionsFeedStart = mainJs.indexOf('// ================= 10. INTERACTIVE CONFESSIONS FEED LOGIC');
if (confessionsFeedStart !== -1) {
  mainJs = mainJs.slice(0, confessionsFeedStart) + wireJs;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with initMidnightWire()');
} else {
  console.error('Could not find // ================= 10. INTERACTIVE CONFESSIONS FEED LOGIC');
}
