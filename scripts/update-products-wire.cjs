const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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

// UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodWhispersStart = productsHtml.indexOf('<!-- ===== THE BOUDOIR WHISPERS');
const prodFooterIdx = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodWhispersStart !== -1 && prodFooterIdx !== -1) {
  productsHtml = productsHtml.slice(0, prodWhispersStart) + wireHtml + '\n\n    ' + productsHtml.slice(prodFooterIdx);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with Midnight Wire');
} else {
  console.error('Could not find markers in products.html', { prodWhispersStart, prodFooterIdx });
}
