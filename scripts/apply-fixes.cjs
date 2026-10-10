const fs = require('fs');
const path = require('path');

// 1. UPDATE src/style.css with Whispers Section and Share Button styles
const stylePath = path.join(__dirname, '..', 'src', 'style.css');
let styleCss = fs.readFileSync(stylePath, 'utf8');

const whispersCss = `
/* ── THE BOUDOIR WHISPERS: VERIFIED CUSTOMER REVIEWS GRID ── */
.whispers-section {
  padding: 80px 0 100px;
  background: #0d0d10;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.whispers-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 52px;
}
.whispers-tag {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}
.whispers-header .sh2 {
  font-size: 38px;
  margin-bottom: 12px;
}
.whispers-sub {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ink-4);
}
.whispers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.whisper-card {
  display: flex;
  flex-direction: column;
}
.whisper-bubble {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px 20px 20px 4px;
  padding: 22px 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  position: relative;
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.whisper-card:hover .whisper-bubble {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.2);
}
.whisper-rating {
  color: #facc15;
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}
.whisper-quote {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 16px;
  font-style: normal;
}
.whisper-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
}
.whisper-verified-badge {
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.25);
  padding: 2px 8px;
  border-radius: var(--r-pill);
  font-weight: 700;
}
.whisper-location {
  color: var(--ink-4);
}
.whisper-author-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding-left: 6px;
}
.whisper-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ruby), #e11d48);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(159, 18, 57, 0.35);
}
.whisper-author-info {
  display: flex;
  flex-direction: column;
}
.whisper-author-name {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}
.whisper-order-time {
  font-size: 11px;
  color: var(--ink-4);
}
.whisper-product-chip {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--r-pill);
  padding: 4px 12px 4px 4px;
  text-decoration: none;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.whisper-product-chip:hover {
  background: var(--ruby);
  border-color: var(--ruby);
  color: #ffffff;
}
.whisper-product-chip .chip-img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  background: #000000;
}

/* Share Link Button */
.btn-share-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  font-weight: 600;
}
.btn-share-link:hover {
  border-color: var(--ruby);
  color: var(--ruby);
}

@media (max-width: 900px) {
  .whispers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}
@media (max-width: 600px) {
  .whispers-header .sh2 { font-size: 28px; }
  .whispers-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
`;

if (!styleCss.includes('whispers-section')) {
  styleCss += '\n' + whispersCss;
  fs.writeFileSync(stylePath, styleCss, 'utf8');
  console.log('Appended Whispers CSS to style.css');
}

// 2. The Boudoir Whispers HTML Block
const whispersHtml = `
    <!-- ===== THE BOUDOIR WHISPERS: VERIFIED CUSTOMER REVIEWS ===== -->
    <section class="whispers-section" id="whispers">
      <div class="section-inner">
        <div class="whispers-header">
          <span class="whispers-tag ruby-txt">Boudoir Whispers</span>
          <h2 class="sh2" style="color: #fff;">Real Confessions. Discreet Orders.</h2>
          <p class="whispers-sub">Unfiltered reviews from real bedrooms across Nigeria. Delivered in 100% plain, unmarked packaging.</p>
        </div>

        <div class="whispers-grid">
          <!-- 1. Rose Sucker -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"Ordered at 11am in Lekki, got it by 3:30pm in an unmarked plain courier bag. My partner and I haven't slept properly in 4 days. Absolutely out of this world."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">Lekki, Lagos</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">CO</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Chidinma O.</span>
                <span class="whisper-order-time">3 days ago</span>
              </div>
              <a href="/products.html?product=rose-blossom" class="whisper-product-chip" title="View The Rose Sucker">
                <img src="/assets/product-rose.webp" alt="The Rose Sucker" class="chip-img" />
                <span>The Rose Sucker</span>
              </a>
            </div>
          </article>

          <!-- 2. The Siren -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"The Siren app control is pure madness. He was controlling the vibration patterns from his hotel room in London while I was at dinner in VI. The thrill is unbelievable."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">Victoria Island, Lagos</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">TA</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Titi A.</span>
                <span class="whisper-order-time">1 week ago</span>
              </div>
              <a href="/products.html?product=siren-app" class="whisper-product-chip" title="View The Siren">
                <img src="/assets/siren-app.webp" alt="The Siren" class="chip-img" />
                <span>The Siren</span>
              </a>
            </div>
          </article>

          <!-- 3. The Mini Wand -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"Small? Don't let the size fool you at all! The rumble is so deep you will literally shake. Best impulse purchase I've made this year. Whisper silent too."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">Maitama, Abuja</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">BK</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Blessing K.</span>
                <span class="whisper-order-time">5 days ago</span>
              </div>
              <a href="/products.html?product=sceptre-wand" class="whisper-product-chip" title="View The Mini Wand">
                <img src="/assets/product-wand.webp" alt="The Mini Wand" class="chip-img" />
                <span>The Mini Wand</span>
              </a>
            </div>
          </article>

          <!-- 4. Contour Crystal Plugs -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"The velvet finish feels super luxurious and the crystal base sparkles so nicely. Completely body-safe with zero chemical odor. Worth every single kobo."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">Ikeja, Lagos</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">ZM</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Zainab M.</span>
                <span class="whisper-order-time">2 weeks ago</span>
              </div>
              <a href="/products.html?product=non-vibrating-plugs" class="whisper-product-chip" title="View Contour Crystal Plugs">
                <img src="/assets/plugs-vault-chest.webp" alt="Contour Crystal Plugs" class="chip-img" />
                <span>Crystal Plugs</span>
              </a>
            </div>
          </article>

          <!-- 5. Kinetic Thrusting Shaft -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"The suction cup base mounts to the shower tile like superglue. The thrusting rhythm is relentless and hands-free. Finally a Nigerian brand doing luxury intimacy right."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">GRA, Port Harcourt</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">AD</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Amara D.</span>
                <span class="whisper-order-time">4 days ago</span>
              </div>
              <a href="/products.html?product=thrusting-dildo" class="whisper-product-chip" title="View Kinetic Thrusting Shaft">
                <img src="/assets/thrusting-dildo-duo.webp" alt="Kinetic Thrusting Shaft" class="chip-img" />
                <span>Thrusting Shaft</span>
              </a>
            </div>
          </article>

          <!-- 6. African Brute Tonic -->
          <article class="whisper-card">
            <div class="whisper-bubble">
              <div class="whisper-rating">★★★★★</div>
              <p class="whisper-quote">"Took 40ml 30 minutes before action as instructed. The stamina was on a whole other planet. My girl literally asked what happened to me. 100% repurchasing."</p>
              <div class="whisper-badge-row">
                <span class="whisper-verified-badge">✓ Verified Order</span>
                <span class="whisper-location">Yaba, Lagos</span>
              </div>
            </div>
            <div class="whisper-author-row">
              <div class="whisper-avatar">FB</div>
              <div class="whisper-author-info">
                <span class="whisper-author-name">Femi B.</span>
                <span class="whisper-order-time">1 week ago</span>
              </div>
              <a href="/products.html?product=african-brute" class="whisper-product-chip" title="View African Brute Tonic">
                <img src="/assets/african-brute.webp" alt="African Brute Tonic" class="chip-img" />
                <span>African Brute</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
`;

// Insert into index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
if (!indexHtml.includes('whispers-section')) {
  indexHtml = indexHtml.replace('    <!-- ===== FEEDBACK MARQUEE ===== -->', whispersHtml + '\n    <!-- ===== FEEDBACK MARQUEE ===== -->');
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Inserted Whispers into index.html');
}

// Insert into products.html
const productsPath = path.join(__dirname, '..', 'products.html');
let productsHtml = fs.readFileSync(productsPath, 'utf8');
if (!productsHtml.includes('whispers-section')) {
  productsHtml = productsHtml.replace('    <!-- ===== FEEDBACK MARQUEE ===== -->', whispersHtml + '\n    <!-- ===== FEEDBACK MARQUEE ===== -->');
}

// 3. Add Copy DM Link button into Quick Look modal in both files
const shareBtnHtml = `
              <button type="button" id="qv-btn-share" class="btn btn-outline btn-lg btn-share-link" title="Copy DM Share Link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Copy DM Link
              </button>`;

if (!productsHtml.includes('id="qv-btn-share"')) {
  productsHtml = productsHtml.replace('<button id="qv-btn-add" class="btn btn-black btn-lg">Add to Bag</button>', '<button id="qv-btn-add" class="btn btn-black btn-lg">Add to Bag</button>\n' + shareBtnHtml);
}
indexHtml = fs.readFileSync(indexPath, 'utf8');
if (!indexHtml.includes('id="qv-btn-share"')) {
  indexHtml = indexHtml.replace('<button id="qv-btn-add" class="btn btn-black btn-lg">Add to Bag</button>', '<button id="qv-btn-add" class="btn btn-black btn-lg">Add to Bag</button>\n' + shareBtnHtml);
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
}

fs.writeFileSync(productsPath, productsHtml, 'utf8');
console.log('Updated Quick Look modal share button in index.html & products.html');
