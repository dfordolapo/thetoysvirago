# TheToysVirago Permanent Rules & Guidelines

## Universal Button System
1. **Corner Radius**:
   - Every button throughout the entire site (including `.btn`, `.btn-add-cart`, checkout Place Order `#btn-submit-order`, Order Confirmed screen buttons `.co-success-btn`, `#btn-done-order`, `#btn-wa-confirm-order`, `.btn-quick-view`, `.btn-copy-acc`, `.addr-chip`) **MUST have a border-radius of exactly 8px** (`border-radius: 8px !important;`).
   - Do NOT use pill rounded buttons (`9999px`) for primary actions.

2. **Product Card Button Color & Contrast**:
   - **Black / Dark Product Cards**:
     - Background: `#ffffff` (White)
     - Text Color: `#0c0c0e` (Dark Black)
     - Border: `1px solid rgba(255, 255, 255, 0.2)`
     - Hover: `#f0f0f4`
   - **White / Light Product Cards** (e.g., Bestsellers):
     - Background: `#121214` (Deep Black)
     - Text Color: `#ffffff` (White)
     - Border: `1px solid #121214`
     - Hover: `#9f1239` (Ruby Accent)
   - **Unavailable / Out of Stock**:
     - Must be **Muted** (`opacity: 0.6 !important; cursor: not-allowed !important; pointer-events: none !important;`).
     - Dark cards: muted dark gray `rgba(120, 120, 130, 0.22)`.
     - Light cards: muted light gray `#e2e8f0` with `#94a3b8` text.

3. **Button Sizing**:
   - Desktop: `padding: 9px 14px; font-size: 12px; font-weight: 600; min-height: 38px;`
   - Mobile: `padding: 7px 10px; font-size: 11px; min-height: 34px;`

## Toast & Cart Feedback
- Cart feedback toast **must strictly remain on ONE line** (`white-space: nowrap !important;`).
- Standard text: **"Added to cart"** (never verbose strings).

## Homepage Product Grid Layout
- **Bestsellers Section**:
  - Web / Desktop: **3 products per row** (`grid-template-columns: repeat(3, minmax(0, 1fr))`).
  - Mobile (`<= 640px`): **2 products per row** (`grid-template-columns: repeat(2, minmax(0, 1fr))`).
- **Fresh Store Drops (`#new-arrivals-grid`)**:
  - Web / Desktop: 4 products per row (or 3 on tablet).
  - Mobile (`<= 580px`): **2 products per row**.
