const fs = require('fs');
const path = require('path');

const refinedGrid = `
          <!-- 1. TOYS: Rose Sucker -->
          <article class="product-card" data-category="toys" data-id="rose-blossom" data-keywords="rose sucker suction air pulse vibrator oral clit clitoral vibe sex toy">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">BESTSELLER · 🎬 VIDEO</span>
              <img src="/assets/product-rose.webp" alt="The Rose Sucker" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="rose-blossom">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">FLORE · 01</span>
                <span class="product-price">₦25,000</span>
              </div>
              <h3 class="product-name">The Rose Sucker</h3>
              <p class="product-line">No hands needed. You're welcome.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#9f1239;" data-color="Red"></button>
                <button class="color-dot" style="background:#0c0c0e;" data-color="Black"></button>
                <button class="color-dot" style="background:#f472b6;" data-color="Pink"></button>
                <button class="color-dot" style="background:#7c3aed;" data-color="Purple"></button>
                <button class="color-dot" style="background:#facc15;" data-color="Yellow"></button>
                <button class="color-dot" style="background:#4ade80;" data-color="Green"></button>
                <span class="color-name">Red</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="rose-blossom" data-title="The Rose Sucker"
                data-price="25000" data-img="/assets/product-rose.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 2. TOYS: Pulsating Rose -->
          <article class="product-card" data-category="toys" data-id="pulsating-rose" data-keywords="pulsating rose sucker licker suction air pulse vibrator oral tongue clit clitoral vibe sex toy duo">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">NEW ARRIVAL · 🎬 VIDEO</span>
              <img src="/assets/rose-pair-duo.webp" alt="Pulsating Rose" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="pulsating-rose">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">ROSE · 02</span>
                <span class="product-price">₦35,000</span>
              </div>
              <h3 class="product-name">Pulsating Rose</h3>
              <p class="product-line">Lick or suck? Why ever choose?</p>
              <div class="color-row">
                <button class="size-pill active" data-size="Sucker" data-img="/assets/rose-sucker-variant.webp">Sucker</button>
                <button class="size-pill" data-size="Licker" data-img="/assets/rose-licker-variant.webp">Licker</button>
                <span class="color-name">Sucker</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="pulsating-rose" data-title="Pulsating Rose (Sucker)"
                data-price="35000" data-img="/assets/rose-sucker-variant.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 3. TOYS: The Mini Wand -->
          <article class="product-card" data-category="toys" data-id="sceptre-wand" data-keywords="mini wand magic wand massager pocket vibrator rumble vibe sex toy">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">POPULAR · 🎬 VIDEO</span>
              <img src="/assets/product-wand.webp" alt="The Mini Wand" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="sceptre-wand">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">WAND · 03</span>
                <span class="product-price">₦15,000</span>
              </div>
              <h3 class="product-name">The Mini Wand</h3>
              <p class="product-line">Small in size. Seismic in impact.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#0c0c0e;" data-color="Black" data-img="/assets/product-wand.webp"></button>
                <button class="color-dot" style="background:#ec4899;" data-color="Pink" data-img="/assets/mini-wand-colors.webp"></button>
                <button class="color-dot" style="background:#8b5cf6;" data-color="Purple" data-img="/assets/mini-wand-colors.webp"></button>
                <button class="color-dot" style="background:#22c55e;" data-color="Green" data-img="/assets/mini-wand-colors.webp"></button>
                <span class="color-name">Black</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="sceptre-wand" data-title="The Mini Wand"
                data-price="15000" data-img="/assets/product-wand.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 4. TOYS: The Siren -->
          <article class="product-card" data-category="toys" data-id="siren-app" data-keywords="the siren flamingo app controlled wearable long distance vibrator remote bluetooth vibe sex toy red white">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">APP CONNECT · 🎬 VIDEO</span>
              <img src="/assets/siren-app.webp" alt="The Siren" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="siren-app">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">APP · 04</span>
                <span class="product-price">₦27,000</span>
              </div>
              <h3 class="product-name">The Siren</h3>
              <p class="product-line">Close your eyes. Give him the wheel.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#9f1239;" data-color="Red" data-img="/assets/siren-app-red.webp"></button>
                <button class="color-dot" style="background:#ffffff;border:1px solid #cbd5e1;" data-color="White" data-img="/assets/siren-app-white.webp"></button>
                <span class="color-name">Red</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="siren-app" data-title="The Siren"
                data-price="27000" data-img="/assets/siren-app.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 5. TOYS: Lipstick Vibe -->
          <article class="product-card" data-category="toys" data-id="lipstick-vibe" data-keywords="lipstick vibe vibrator bullet discreet stealth hidden pocket secret travel sex toy">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">STEALTH LUXE · 🎬 VIDEO</span>
              <img src="/assets/lipstick-vibe.webp" alt="Lipstick Vibe" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="lipstick-vibe">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">STEALTH · 05</span>
                <span class="product-price">₦22,000</span>
              </div>
              <h3 class="product-name">Lipstick Vibe</h3>
              <p class="product-line">The best touch-up in your purse.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#ffffff;border:1px solid #cbd5e1;" data-color="White"></button>
                <span class="color-name">White</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="lipstick-vibe" data-title="Lipstick Vibe"
                data-price="22000" data-img="/assets/lipstick-vibe.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 6. TOYS: The Contour Shaft -->
          <article class="product-card" data-category="toys" data-id="sculpted-dildo" data-keywords="contour shaft dildo silicone suction base realistic sculpted toy sex toy">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">DUAL SIZE · 3 SHADES</span>
              <img src="/assets/dildo-trio.webp" alt="The Contour Shaft" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="sculpted-dildo">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">SCULPT · 06</span>
                <span class="product-price">₦15,000</span>
              </div>
              <h3 class="product-name">The Contour Shaft</h3>
              <p class="product-line">Stick it anywhere. Seriously, anywhere.</p>
              <div class="color-row" style="margin-bottom: 8px;">
                <button class="size-pill active" data-size="6&quot;" data-price="15000" data-pricestr="₦15,000">6&quot;</button>
                <button class="size-pill" data-size="7&quot;" data-price="17000" data-pricestr="₦17,000">7&quot;</button>
              </div>
              <div class="color-row">
                <button class="color-dot active" style="background:#f5c6aa;" data-color="Tan" data-img="/assets/dildo-tan.webp"></button>
                <button class="color-dot" style="background:#854d27;" data-color="Brown" data-img="/assets/dildo-bronze.webp"></button>
                <button class="color-dot" style="background:#1c1917;" data-color="Black" data-img="/assets/dildo-noir.webp"></button>
                <span class="color-name">Tan</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="sculpted-dildo" data-title="The Contour Shaft (6&quot; Tan)"
                data-price="15000" data-img="/assets/dildo-trio.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 7. TOYS: Kinetic Thrusting Shaft -->
          <article class="product-card" data-category="toys" data-id="thrusting-dildo" data-keywords="kinetic thrusting shaft remote controlled motorized reciprocating dildo suction sex toy">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">REMOTE · 🎬 VIDEOS</span>
              <img src="/assets/thrusting-dildo-duo.webp" alt="Kinetic Thrusting Shaft" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="thrusting-dildo">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">THRUST · 07</span>
                <span class="product-price">₦45,000</span>
              </div>
              <h3 class="product-name">Kinetic Thrusting Shaft</h3>
              <p class="product-line">Motorized rhythm. He had one job.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#1c1917;" data-color="Black" data-img="/assets/thrusting-dildo-black.webp"></button>
                <button class="color-dot" style="background:#5c3826;" data-color="Brown" data-img="/assets/thrusting-dildo-brown.webp"></button>
                <button class="color-dot" style="background:#f5c6aa;" data-color="Tan" data-img="/assets/thrusting-dildo-tan.webp"></button>
                <span class="color-name">Black</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="thrusting-dildo" data-title="Kinetic Thrusting Shaft"
                data-price="45000" data-img="/assets/thrusting-dildo-duo.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 8. TOYS: The Sucking Rabbit -->
          <article class="product-card" data-category="toys" data-id="sucking-rabbit" data-keywords="sucking rabbit vibrator rabbit vibe clitoral suction air pulse dual stimulation g spot">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">SUCTION · 🎬 VIDEO</span>
              <img src="/assets/sucking-rabbit.webp" alt="The Sucking Rabbit" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="sucking-rabbit">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">DUAL · 08</span>
                <span class="product-price">₦35,000</span>
              </div>
              <h3 class="product-name">The Sucking Rabbit</h3>
              <p class="product-line">Two sensations. Zero patience required.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#ec4899;" data-color="Pink" data-img="/assets/sucking-rabbit.webp"></button>
                <span class="color-name">Pink</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="sucking-rabbit" data-title="The Sucking Rabbit"
                data-price="35000" data-img="/assets/sucking-rabbit.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 9. TOYS: Contour Crystal Plugs -->
          <article class="product-card" data-category="toys" data-id="non-vibrating-plugs" data-keywords="contour crystal plugs anal butt plug jeweled silicone small medium large">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">JEWELED & SILICONE · 3 SIZES</span>
              <img src="/assets/plugs-vault-chest.webp" alt="Contour Crystal Plugs" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="non-vibrating-plugs">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">PLUG · 09</span>
                <span class="product-price">From ₦8,000</span>
              </div>
              <h3 class="product-name">Contour Crystal Plugs</h3>
              <p class="product-line">A little sparkle where it counts.</p>
              <div class="color-row" style="margin-bottom: 8px;">
                <button class="size-pill" data-size="Small" data-price="8000" data-pricestr="₦8,000" data-img="/assets/plug-size-small.webp">Small</button>
                <button class="size-pill" data-size="Medium" data-price="9000" data-pricestr="₦9,000" data-img="/assets/plug-size-medium.webp">Medium</button>
                <button class="size-pill" data-size="Large" data-price="10000" data-pricestr="₦10,000" data-img="/assets/plug-size-large.webp">Large</button>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="non-vibrating-plugs" data-title="Contour Crystal Plugs"
                data-price="8000" data-img="/assets/plugs-vault-chest.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 10. TOYS: Rabbit Cock Ring -->
          <article class="product-card" data-category="toys" data-id="rabbit-cock-ring" data-keywords="rabbit cock ring rechargeable vibrating ring penis stamina clitoral teaser">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">RECHARGEABLE · 🎬 VIDEO</span>
              <img src="/assets/rabbit-cock-ring.webp" alt="Rabbit Cock Ring" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="rabbit-cock-ring">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">COUPLES · 10</span>
                <span class="product-price">₦25,000</span>
              </div>
              <h3 class="product-name">Rabbit Cock Ring</h3>
              <p class="product-line">Keeps him hard. Keeps you buzzing.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#0c0c0e;" data-color="Black" data-img="/assets/rabbit-cock-ring.webp"></button>
                <span class="color-name">Black</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="rabbit-cock-ring" data-title="Rabbit Cock Ring"
                data-price="25000" data-img="/assets/rabbit-cock-ring.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 11. TOYS: Creature Cock Ring -->
          <article class="product-card" data-category="toys" data-id="creature-cock-ring" data-keywords="creature cock ring non vibrating silicone cock ring stamina delay penis ring">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">STAMINA LOCK · NON-VIBRATING</span>
              <img src="/assets/creature-cock-ring.webp" alt="Creature Cock Ring" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="creature-cock-ring">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">STAMINA · 11</span>
                <span class="product-price">₦15,000</span>
              </div>
              <h3 class="product-name">Creature Cock Ring</h3>
              <p class="product-line">Built for stamina. Stays till the finish.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#0c0c0e;" data-color="Black" data-img="/assets/creature-cock-ring.webp"></button>
                <span class="color-name">Black</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="creature-cock-ring" data-title="Creature Cock Ring"
                data-price="15000" data-img="/assets/creature-cock-ring.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 12. TOYS: Velvet Pocket Bullet -->
          <article class="product-card" data-category="toys" data-id="pocket-bullet" data-keywords="velvet pocket bullet mini vibe travel clitoral stimulation small fuchsia black pink purple chrome">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">POCKET POWER · 🎬 VIDEO</span>
              <img src="/assets/bullet-vibe-all-colors.webp" alt="Velvet Pocket Bullet" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="pocket-bullet">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">BULLET · 12</span>
                <span class="product-price">₦15,000</span>
              </div>
              <h3 class="product-name">Velvet Pocket Bullet</h3>
              <p class="product-line">Pocket-sized. Packs a heavyweight punch.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#ec4899;" data-color="Fuchsia"></button>
                <button class="color-dot" style="background:#0c0c0e;" data-color="Black" data-img="/assets/bullet-vibe-matte-trio.webp"></button>
                <button class="color-dot" style="background:#fbcfe8;border:1px solid #f472b6;" data-color="Blush" data-img="/assets/bullet-vibe-matte-trio.webp"></button>
                <button class="color-dot" style="background:#8b5cf6;" data-color="Purple" data-img="/assets/bullet-vibe-matte-trio.webp"></button>
                <button class="color-dot" style="background:linear-gradient(135deg, #e2e8f0, #94a3b8);border:1px solid #cbd5e1;" data-color="Chrome" data-img="/assets/bullet-vibe-all-colors.webp"></button>
                <span class="color-name">Fuchsia</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="pocket-bullet" data-title="Velvet Pocket Bullet"
                data-price="15000" data-img="/assets/bullet-vibe-all-colors.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 13. TOYS: Heart Bullet 6" -->
          <article class="product-card" data-category="toys" data-id="contour-bullet-6inch" data-keywords="heart bullet 6 inch vibrator heart crown bullet slim wand long vibe purple black fuchsia">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">6 INCHES · 🎬 VIDEO</span>
              <img src="/assets/bullet-6inch-in-hand.webp" alt="Heart Bullet 6&quot;" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="contour-bullet-6inch">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">BULLET · 13</span>
                <span class="product-price">₦18,000</span>
              </div>
              <h3 class="product-name">Heart Bullet 6&quot;</h3>
              <p class="product-line">Six inches of concentrated temptation.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#8b5cf6;" data-color="Purple" data-img="/assets/bullet-6inch-in-hand.webp"></button>
                <button class="color-dot" style="background:#0c0c0e;" data-color="Black" data-img="/assets/bullet-6inch-in-hand.webp"></button>
                <button class="color-dot" style="background:#ec4899;" data-color="Fuchsia" data-img="/assets/bullet-6inch-in-hand.webp"></button>
                <span class="color-name">Purple</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="contour-bullet-6inch" data-title="Heart Bullet 6&quot;"
                data-price="18000" data-img="/assets/bullet-6inch-in-hand.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 14. TOYS: Sleek Bullet 7" -->
          <article class="product-card" data-category="toys" data-id="sleek-bullet-7inch" data-keywords="sleek bullet 7 inch vibrator magnetic charger pin charger flat top slim wand metallic silver chrome gold">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">7 INCHES · 🎬 VIDEO</span>
              <img src="/assets/bullet-7inch-metallic-pair.webp" alt="Sleek Bullet 7&quot;" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="sleek-bullet-7inch">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">BULLET · 14</span>
                <span class="product-price">₦20,000</span>
              </div>
              <h3 class="product-name">Sleek Bullet 7&quot;</h3>
              <p class="product-line">Seven inches. Pure metallic ecstasy.</p>
              <div class="color-row" style="margin-bottom: 8px;">
                <button class="size-pill" data-size="Magnetic" data-price="20000" data-pricestr="₦20,000" data-img="/assets/bullet-7inch-magnetic-pin-pair.webp">Magnetic</button>
                <button class="size-pill" data-size="Pin" data-price="20000" data-pricestr="₦20,000" data-img="/assets/bullet-7inch-floral-display.webp">Pin</button>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="sleek-bullet-7inch" data-title="Sleek Bullet 7&quot;"
                data-price="20000" data-img="/assets/bullet-7inch-metallic-pair.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 15. TOYS: Rose Jump Egg -->
          <article class="product-card" data-category="toys" data-id="rose-jump-egg" data-keywords="rose jump egg app controlled egg vibrator wireless bluetooth remote panty vibe kegel clit stimulator pink">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">APP CONNECT · 🎬 VIDEO</span>
              <img src="/assets/rose-jump-egg-kit.webp" alt="Rose Jump Egg" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="rose-jump-egg">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">APP · 15</span>
                <span class="product-price">₦28,000</span>
              </div>
              <h3 class="product-name">Rose Jump Egg</h3>
              <p class="product-line">Public thrill. Private secret.</p>
              <div class="color-row">
                <button class="color-dot active" style="background:#ec4899;" data-color="Pink" data-img="/assets/rose-jump-egg-kit.webp"></button>
                <span class="color-name">Pink</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="rose-jump-egg" data-title="Rose Jump Egg"
                data-price="28000" data-img="/assets/rose-jump-egg-kit.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>

          <!-- 16. LUBES: African Brute Tonic -->
          <article class="product-card" data-category="lubes" data-id="african-brute" data-keywords="african brute tonic herbal tincture stamina endurance libido nafdac wellness liquid">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">STAMINA</span>
              <img src="/assets/african-brute.webp" alt="African Brute Tonic" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="african-brute">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">TONIC · 16</span>
                <span class="product-price">₦27,000</span>
              </div>
              <h3 class="product-name">African Brute Tonic</h3>
              <p class="product-line">Nature's ultimate bedroom cheat code.</p>
              <div class="color-row">
                <button class="size-pill active" data-size="500ml">500ml</button>
                <span class="color-name">500ml</span>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="african-brute" data-title="African Brute Tonic"
                data-price="27000" data-img="/assets/african-brute.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>
`;

const productsHtmlPath = path.join(__dirname, '..', 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const gridStart = productsHtml.indexOf('<div class="products-grid" id="products-grid">');
const endRegex = /\s*<\/div>\s*<\/div>\s*<\/section>\s*<!-- ===== THE BOUDOIR WHISPERS/;
const endMatch = productsHtml.match(endRegex);

if (gridStart !== -1 && endMatch) {
  const gridEnd = endMatch.index;
  productsHtml = productsHtml.substring(0, gridStart + '<div class="products-grid" id="products-grid">'.length)
    + '\n' + refinedGrid + '\n        </div>\n      </div>\n    </section>\n\n    <!-- ===== THE BOUDOIR WHISPERS'
    + productsHtml.substring(endMatch.index + endMatch[0].length);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('Successfully refined products-grid in products.html');
} else {
  console.error('Could not locate products-grid markers in products.html');
}
