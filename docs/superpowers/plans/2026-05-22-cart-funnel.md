# Cart Funnel UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace default Shopify cart redirect with a slide-in cart drawer, AJAX ATC with button animation, soft social proof badge, and sticky bar first-appearance pulse.

**Architecture:** JS intercepts `#product-form` submit → POSTs to `/cart/add.js` → on success opens a fixed-position drawer populated from `/cart.js` JSON. Drawer HTML lives in `layout/theme.liquid` (always in DOM). All styles added to `theme.css`. All JS added to `theme.js` following existing `initX()` function pattern.

**Tech Stack:** Shopify Liquid, vanilla JS (ES2020), CSS custom properties, Shopify Cart AJAX API (`/cart/add.js`, `/cart.js`, `/cart/change.js`)

---

## File Map

| File | What changes |
|------|-------------|
| `layout/theme.liquid` | Add cart drawer HTML + overlay div before `</body>` |
| `assets/theme.css` | ~180 lines appended: drawer, overlay, button states, social proof dot, pulse keyframes |
| `assets/theme.js` | Add `initCartDrawer`, `openCartDrawer`, `closeCartDrawer`, `refreshCartDrawer`, `formatMoney`, `initAtcIntercept`; modify `initStickyAtc`; register new inits in DOMContentLoaded block |
| `sections/hero-product.liquid` | Add social proof badge HTML after ATC button div |
| `templates/product.json` | Add `social_proof_count` setting to hero section |

---

## Task 1: Cart Drawer + Funnel CSS

**Files:**
- Modify: `assets/theme.css` (append to end of file)

- [ ] **Step 1: Append drawer CSS to theme.css**

Add the following block at the very end of `assets/theme.css`:

```css
/* ============================================================
   CART DRAWER
   ============================================================ */

.cart-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}
.cart-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  background: var(--color-bg);
  z-index: 201;
  transform: translateX(100%);
  transition: transform 300ms ease-out;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
}
.cart-drawer.is-open {
  transform: translateX(0);
}
.cart-drawer__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.cart-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-4) var(--sp-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.cart-drawer__title {
  font-size: var(--fs-base);
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.02em;
}
.cart-drawer__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--sp-1);
  color: var(--color-text);
  display: flex;
  align-items: center;
  line-height: 1;
}
.cart-drawer__close:hover {
  opacity: 0.6;
}
.cart-drawer__freeship {
  padding: var(--sp-3) var(--sp-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.cart-drawer__lines {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-5);
}
.cart-drawer__empty {
  text-align: center;
  padding: var(--sp-8) 0;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
.cart-drawer__footer {
  border-top: 1px solid var(--color-border);
  padding: var(--sp-4) var(--sp-5);
  flex-shrink: 0;
}
.cart-drawer__subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: var(--fs-base);
  margin-bottom: var(--sp-3);
}
.cart-drawer__checkout {
  display: block;
  width: 100%;
  text-align: center;
  text-decoration: none;
  letter-spacing: 0.06em;
}
.cart-drawer__continue {
  display: block;
  width: 100%;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  margin-top: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  padding: var(--sp-1) 0;
}
.cart-drawer__continue:hover {
  color: var(--color-text);
}

/* Cart line item inside drawer */
.cart-drawer__line {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
}
.cart-drawer__line + .cart-drawer__line {
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--color-border);
}
.cart-drawer__line-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm, 6px);
  flex-shrink: 0;
  background: var(--color-bg-alt);
}
.cart-drawer__line-body {
  flex: 1;
  min-width: 0;
}
.cart-drawer__line-title {
  font-size: var(--fs-sm);
  font-weight: 700;
  margin: 0 0 var(--sp-1);
  line-height: 1.3;
}
.cart-drawer__line-variant {
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--sp-2);
}
.cart-drawer__line-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}
.cart-drawer__line-price {
  font-size: var(--fs-sm);
  font-weight: 700;
}
.cart-drawer__line-qty {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}
.cart-drawer__line-qty .qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  background: none;
  cursor: pointer;
  border-radius: var(--radius-sm, 4px);
  font-size: var(--fs-base);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-drawer__line-qty .qty-input {
  width: 32px;
  text-align: center;
  border: none;
  background: none;
  font-weight: 700;
  font-size: var(--fs-sm);
}

@media (max-width: 480px) {
  .cart-drawer {
    width: 100vw;
  }
}

/* ============================================================
   ATC BUTTON STATES
   ============================================================ */

.btn--atc {
  transition: background-color 200ms ease, opacity 200ms ease, filter 200ms ease;
  min-width: 260px;
}
.btn--atc.is-loading {
  opacity: 0.7;
  pointer-events: none;
  cursor: not-allowed;
}
.btn--atc.is-success {
  filter: brightness(0.82);
}

/* ============================================================
   SOCIAL PROOF BADGE
   ============================================================ */

.social-proof-badge {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  margin-top: var(--sp-2);
}
.social-proof-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  flex-shrink: 0;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

/* ============================================================
   STICKY ATC FIRST-APPEARANCE PULSE
   ============================================================ */

@keyframes sticky-pulse {
  0%   { box-shadow: 0 0 0 0   rgba(180, 90, 60, 0.25); }
  50%  { box-shadow: 0 0 0 8px rgba(180, 90, 60, 0.25); }
  100% { box-shadow: 0 0 0 0   rgba(180, 90, 60, 0);    }
}
.sticky-atc.is-pulsing {
  animation: sticky-pulse 600ms ease-out forwards;
}
```

- [ ] **Step 2: Verify CSS loads without errors**

Open browser devtools → Console. No CSS parse errors. The drawer is not visible yet (no HTML exists).

- [ ] **Step 3: Commit**

```bash
git add assets/theme.css
git commit -m "feat: add cart drawer, ATC states, social proof, pulse CSS"
```

---

## Task 2: Cart Drawer HTML in theme.liquid

**Files:**
- Modify: `layout/theme.liquid`

- [ ] **Step 1: Add overlay + drawer HTML before `</body>`**

In `layout/theme.liquid`, replace the closing `</body>` tag with the following:

```liquid
    <!-- Cart Drawer -->
    <div id="cart-drawer-overlay" class="cart-drawer-overlay" aria-hidden="true"></div>

    <div id="cart-drawer" class="cart-drawer" aria-hidden="true" role="dialog" aria-label="Your bag">
      <div class="cart-drawer__inner">

        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">Your bag (<span id="cart-drawer-count">0</span>)</h2>
          <button class="cart-drawer__close" aria-label="Close bag" data-close-drawer>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16"/>
            </svg>
          </button>
        </div>

        <div class="free-ship cart-drawer__freeship" data-threshold="{{ 99 | times: 100 }}">
          <p class="free-ship__text" id="cart-drawer-ship-text">Add items to unlock free shipping.</p>
          <div class="free-ship__bar"><span class="free-ship__bar-fill" id="cart-drawer-ship-fill" style="width:0%"></span></div>
        </div>

        <div class="cart-drawer__lines" id="cart-drawer-lines">
          <p class="cart-drawer__empty">Your bag is empty.</p>
        </div>

        <div class="cart-drawer__footer">
          <div class="cart-drawer__subtotal">
            <span>Subtotal</span>
            <span id="cart-drawer-subtotal"></span>
          </div>
          <a href="/checkout" class="btn btn--primary cart-drawer__checkout">CHECKOUT — CLAIM YOUR OFFER</a>
          <button class="cart-drawer__continue" data-close-drawer>Continue shopping →</button>
        </div>

      </div>
    </div>

  </body>
</html>
```

The full `layout/theme.liquid` should now end with `</html>` and the drawer sits just before `</body>`.

- [ ] **Step 2: Verify drawer exists in DOM**

Reload the product page. Open devtools → Elements. Search for `cart-drawer`. Confirm the div exists in DOM but is off-screen (translateX(100%) from CSS Task 1).

- [ ] **Step 3: Commit**

```bash
git add layout/theme.liquid
git commit -m "feat: add cart drawer HTML to theme layout"
```

---

## Task 3: Cart Drawer Open / Close JS

**Files:**
- Modify: `assets/theme.js`

- [ ] **Step 1: Add `formatMoney`, `openCartDrawer`, `closeCartDrawer`, `initCartDrawer` functions**

In `assets/theme.js`, append these four functions after the last existing function (`initBeforeAfter`):

```javascript
/**
 * Money formatter — converts Shopify cents integer to display string
 * e.g. 10500 → "$105", 10550 → "$105.50"
 */
function formatMoney(cents) {
  const dollars = cents / 100;
  return '$' + (dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2));
}

/**
 * Cart Drawer — open
 */
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('is-open');
  overlay.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Cart Drawer — close
 */
function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('is-open');
  overlay.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Cart Drawer — wire up close triggers and drawer qty buttons
 */
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer || !overlay) return;

  overlay.addEventListener('click', closeCartDrawer);

  drawer.querySelectorAll('[data-close-drawer]').forEach(el => {
    el.addEventListener('click', closeCartDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCartDrawer();
  });

  // Qty buttons inside drawer (event delegation — buttons are added dynamically)
  drawer.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const input = drawer.querySelector(`.qty-input[data-key="${key}"]`);
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const next = btn.classList.contains('qty-btn--plus') ? current + 1 : Math.max(0, current - 1);
    input.value = next;
    submitCartChange(key, next);
  });
}
```

- [ ] **Step 2: Register `initCartDrawer` in DOMContentLoaded block**

At the top of `theme.js`, the `DOMContentLoaded` block currently reads:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initBundleSelector();
  initFaqAccordion();
  initStickyAtc();
  initCartQty();
  initCartUpsell();
  initEmailPopup();
  initCollectionSort();
  initCollectionAtc();
  initBeforeAfter();
```

Add `initCartDrawer();` as the first call in that block:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initGallery();
  initBundleSelector();
  initFaqAccordion();
  initStickyAtc();
  initCartQty();
  initCartUpsell();
  initEmailPopup();
  initCollectionSort();
  initCollectionAtc();
  initBeforeAfter();
```

- [ ] **Step 3: Verify open/close works in browser console**

Reload product page. In devtools console run:

```javascript
openCartDrawer();
```

Expected: drawer slides in from right, overlay fades in, body scroll locked.

```javascript
closeCartDrawer();
```

Expected: drawer slides out, overlay fades out, scroll restored.

Also press `Escape` while drawer is open — should close.

- [ ] **Step 4: Commit**

```bash
git add assets/theme.js
git commit -m "feat: add cart drawer open/close/init JS"
```

---

## Task 4: refreshCartDrawer — Populate Drawer from /cart.js

**Files:**
- Modify: `assets/theme.js`

- [ ] **Step 1: Add `refreshCartDrawer` function**

Append after `initCartDrawer` in `assets/theme.js`:

```javascript
/**
 * Cart Drawer — fetch /cart.js and update drawer DOM nodes
 */
function refreshCartDrawer() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      const countEl     = document.getElementById('cart-drawer-count');
      const subtotalEl  = document.getElementById('cart-drawer-subtotal');
      const linesEl     = document.getElementById('cart-drawer-lines');
      const shipTextEl  = document.getElementById('cart-drawer-ship-text');
      const shipFillEl  = document.getElementById('cart-drawer-ship-fill');
      const freeShipEl  = document.querySelector('.cart-drawer__freeship');

      if (countEl) countEl.textContent = cart.item_count;
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

      // Free shipping bar
      if (freeShipEl && shipTextEl && shipFillEl) {
        const threshold = parseInt(freeShipEl.dataset.threshold, 10);
        const remaining = Math.max(0, threshold - cart.total_price);
        const pct = Math.min(100, (cart.total_price / threshold) * 100);
        shipFillEl.style.width = `${pct}%`;
        shipTextEl.innerHTML = remaining > 0
          ? `<strong>${formatMoney(remaining)}</strong> away from free AU-wide shipping.`
          : `<strong>✓ Free shipping unlocked.</strong> Your bag ships from Sydney in 24 hrs.`;
      }

      // Global cart icon count (header bubble)
      updateCartCount(cart.item_count);

      // Render line items
      if (linesEl) {
        if (cart.item_count === 0) {
          linesEl.innerHTML = '<p class="cart-drawer__empty">Your bag is empty.</p>';
        } else {
          linesEl.innerHTML = cart.items.map(item => `
            <div class="cart-drawer__line">
              ${item.image
                ? `<img class="cart-drawer__line-img" src="${item.image}" alt="${item.product_title}" width="80" height="80" loading="lazy">`
                : '<div class="cart-drawer__line-img"></div>'
              }
              <div class="cart-drawer__line-body">
                <p class="cart-drawer__line-title">${item.product_title}</p>
                ${item.variant_title && item.variant_title !== 'Default Title'
                  ? `<p class="cart-drawer__line-variant">${item.variant_title}</p>`
                  : ''
                }
                <div class="cart-drawer__line-row">
                  <div class="cart-drawer__line-qty">
                    <button type="button" class="qty-btn qty-btn--minus" data-key="${item.key}" aria-label="Decrease quantity">−</button>
                    <input type="text" class="qty-input" value="${item.quantity}" data-key="${item.key}" readonly aria-label="Quantity">
                    <button type="button" class="qty-btn qty-btn--plus" data-key="${item.key}" aria-label="Increase quantity">+</button>
                  </div>
                  <span class="cart-drawer__line-price">${formatMoney(item.line_price)}</span>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    })
    .catch(err => console.error('[Cart drawer] refresh failed:', err));
}
```

- [ ] **Step 2: Verify in browser console**

Add a product to cart manually via the Shopify cart page first (or do it via console: `fetch('/cart/add.js', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: VARIANT_ID, quantity: 1})})`). Then run:

```javascript
refreshCartDrawer();
openCartDrawer();
```

Expected: drawer opens and shows the product image, title, variant, qty controls, subtotal, and free ship bar reflects the cart total.

- [ ] **Step 3: Commit**

```bash
git add assets/theme.js
git commit -m "feat: add refreshCartDrawer from /cart.js JSON"
```

---

## Task 5: ATC Form Intercept + Button Animation

**Files:**
- Modify: `assets/theme.js`

- [ ] **Step 1: Add `initAtcIntercept` function**

Append after `refreshCartDrawer` in `assets/theme.js`:

```javascript
/**
 * ATC Intercept — replaces native form submit with AJAX add-to-cart
 * Opens cart drawer on success with button loading/success/revert states
 */
function initAtcIntercept() {
  const form = document.getElementById('product-form');
  if (!form) return;

  const mainBtn = form.querySelector('.btn--atc');
  const originalLabel = mainBtn ? mainBtn.textContent.trim() : '';

  function setAtcState(state) {
    const stickyBtn = document.querySelector('.sticky-atc__btn');

    if (state === 'loading') {
      if (mainBtn) {
        mainBtn.textContent = '◌ Adding...';
        mainBtn.classList.add('is-loading');
      }
      if (stickyBtn) {
        stickyBtn.textContent = '◌ Adding...';
        stickyBtn.classList.add('is-loading');
      }
    } else if (state === 'success') {
      if (mainBtn) {
        mainBtn.textContent = '✓ Added to your ritual';
        mainBtn.classList.remove('is-loading');
        mainBtn.classList.add('is-success');
      }
      if (stickyBtn) {
        stickyBtn.textContent = '✓ Added';
        stickyBtn.classList.remove('is-loading');
        stickyBtn.classList.add('is-success');
      }
    } else {
      // revert
      if (mainBtn) {
        mainBtn.textContent = originalLabel;
        mainBtn.classList.remove('is-loading', 'is-success');
      }
      if (stickyBtn) {
        stickyBtn.textContent = stickyBtn.dataset.originalLabel || 'Claim Offer';
        stickyBtn.classList.remove('is-loading', 'is-success');
      }
    }
  }

  function showAtcError(msg) {
    setAtcState('default');
    let errEl = form.querySelector('.atc-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'atc-error';
      errEl.style.cssText = 'color:red;font-size:var(--fs-xs);margin-top:var(--sp-2);text-align:center;';
      const btn = form.querySelector('.btn--atc');
      if (btn) btn.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = msg;
    setTimeout(() => { if (errEl.parentNode) errEl.remove(); }, 4000);
  }

  // Store sticky button's original label before it ever changes
  const stickyBtn = document.querySelector('.sticky-atc__btn');
  if (stickyBtn && !stickyBtn.dataset.originalLabel) {
    stickyBtn.dataset.originalLabel = stickyBtn.textContent.trim();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setAtcState('loading');

    const formData = new FormData(form);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    })
      .then(r => {
        if (!r.ok) return r.json().then(err => Promise.reject(err));
        return r.json();
      })
      .then(() => {
        setAtcState('success');
        refreshCartDrawer();
        openCartDrawer();
        setTimeout(() => setAtcState('default'), 2000);
      })
      .catch(err => {
        const msg = (err && err.description) ? err.description : 'Something went wrong — please try again.';
        showAtcError(msg);
      });
  });
}
```

- [ ] **Step 2: Register `initAtcIntercept` in DOMContentLoaded block**

Add it after `initCartDrawer()`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initAtcIntercept();
  initGallery();
  // ... rest unchanged
```

- [ ] **Step 3: Verify full ATC flow in browser**

On the product page:
1. Select a bundle tier
2. Click the ATC button

Expected sequence:
- Button shows `◌ Adding...` immediately
- After ~300ms: button shows `✓ Added to your ritual` (deeper terracotta)
- Cart drawer slides in from right
- Drawer shows correct product, variant, price, free ship bar
- After 2 seconds: button reverts to original label
- Clicking overlay or ✕ closes the drawer

Repeat using the sticky ATC bar (scroll down until it appears, then click):
- Same states apply to sticky button
- Same drawer opens

- [ ] **Step 4: Commit**

```bash
git add assets/theme.js
git commit -m "feat: ATC form intercept, button states, open drawer on success"
```

---

## Task 6: Social Proof Badge

**Files:**
- Modify: `sections/hero-product.liquid`
- Modify: `templates/product.json`

- [ ] **Step 1: Add social proof badge HTML in hero-product.liquid**

In `sections/hero-product.liquid`, find this block (the ATC button wrapper):

```liquid
          <!-- Add to Cart CTA -->
          <div style="margin-top: var(--sp-4);">
            <button type="submit" name="add" class="btn btn--primary btn--atc">
              {{ section.settings.atc_button_text }}
            </button>
          </div>
        {%- endform -%}
```

Replace with:

```liquid
          <!-- Add to Cart CTA -->
          <div style="margin-top: var(--sp-4);">
            <button type="submit" name="add" class="btn btn--primary btn--atc">
              {{ section.settings.atc_button_text }}
            </button>
            {%- if section.settings.social_proof_count != blank -%}
              <div class="social-proof-badge">
                <span class="social-proof-badge__dot" aria-hidden="true"></span>
                <span>{{ section.settings.social_proof_count }} women started their ritual this week&nbsp;·&nbsp;Ships in 24 hrs</span>
              </div>
            {%- endif -%}
          </div>
        {%- endform -%}
```

- [ ] **Step 2: Add `social_proof_count` to hero-product schema**

In the same file (`sections/hero-product.liquid`), find the `{% schema %}` block. Inside `"settings"`, add the following entry after the `"atc_button_text"` setting:

```json
    {
      "type": "text",
      "id": "social_proof_count",
      "label": "Social proof count (e.g. 143)",
      "default": "143"
    },
```

- [ ] **Step 3: Add `social_proof_count` to product.json hero settings**

In `templates/product.json`, find the hero section's settings block:

```json
      "settings": {
        "fallback_title": "The Quiet Hour™ — LED Light Therapy Mask",
        "ribbon_text": "Designed for women in the phase",
```

Add `"social_proof_count": "143"` to that settings object:

```json
      "settings": {
        "fallback_title": "The Quiet Hour™ — LED Light Therapy Mask",
        "ribbon_text": "Designed for women in the phase",
        "social_proof_count": "143",
```

- [ ] **Step 4: Verify badge renders**

Reload the product page. Below the ATC button, before the payment icons row, you should see:

```
● 143 women started their ritual this week · Ships in 24 hrs
```

The dot pulses gently. Text is small and muted. No bold.

To change the number in future: Shopify Admin → Online Store → Themes → Customise → Product page → Hero Product section → "Social proof count" field.

- [ ] **Step 5: Commit**

```bash
git add sections/hero-product.liquid templates/product.json
git commit -m "feat: add social proof badge to buybox"
```

---

## Task 7: Sticky ATC Bar First-Appearance Pulse

**Files:**
- Modify: `assets/theme.js`

- [ ] **Step 1: Modify `initStickyAtc` to add pulse guard**

Find the existing `initStickyAtc` function in `assets/theme.js`. It currently reads:

```javascript
function initStickyAtc() {
  const stickyBar = document.querySelector('.sticky-atc');
  const mainAtcBtn = document.querySelector('.product-buybox .btn--primary');

  if (!stickyBar || !mainAtcBtn) return;

  // Use Intersection Observer for smooth, performance-optimized visibility toggling
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Main button is visible, hide sticky bar
        stickyBar.classList.remove('is-visible');
      } else {
        // Main button scrolled off screen, show sticky bar
        stickyBar.classList.add('is-visible');
      }
    });
  }, {
    root: null, // viewport
    threshold: 0, // trigger as soon as it leaves viewport
  });

  observer.observe(mainAtcBtn);

  // Sync sticky button action to submit main form or trigger main button click
  const stickyBtn = stickyBar.querySelector('.sticky-atc__btn');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mainAtcBtn.click();
    });
  }
}
```

Replace the entire function with:

```javascript
function initStickyAtc() {
  const stickyBar = document.querySelector('.sticky-atc');
  const mainAtcBtn = document.querySelector('.product-buybox .btn--primary');

  if (!stickyBar || !mainAtcBtn) return;

  let stickyPulsed = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stickyBar.classList.remove('is-visible');
      } else {
        stickyBar.classList.add('is-visible');
        if (!stickyPulsed) {
          stickyPulsed = true;
          stickyBar.classList.add('is-pulsing');
          stickyBar.addEventListener('animationend', () => {
            stickyBar.classList.remove('is-pulsing');
          }, { once: true });
        }
      }
    });
  }, {
    root: null,
    threshold: 0,
  });

  observer.observe(mainAtcBtn);

  const stickyBtn = stickyBar.querySelector('.sticky-atc__btn');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mainAtcBtn.click();
    });
  }
}
```

- [ ] **Step 2: Verify pulse fires once**

Reload the product page. Scroll down until the sticky bar appears. Expected: terracotta glow pulse fires once (600ms) then disappears. Scroll up, scroll down again — no second pulse.

- [ ] **Step 3: Commit**

```bash
git add assets/theme.js
git commit -m "feat: sticky ATC first-appearance pulse, fires once"
```

---

## Task 8: Final Integration Check + Push

- [ ] **Step 1: Full end-to-end test**

Run through this sequence on the product page:

| Action | Expected |
|--------|---------|
| Page load | Social proof badge visible below ATC button |
| Scroll down past ATC | Sticky bar appears with pulse glow (once only) |
| Select a bundle tier | Price updates in buy box |
| Click main ATC button | Loading state → success state → drawer slides in → button reverts after 2s |
| Click overlay | Drawer closes, scroll restored |
| Click ATC again | Drawer opens, quantity incremented, subtotal updated |
| Click `+` in drawer | Qty increases, subtotal/free ship bar updates |
| Click `−` in drawer | Qty decreases |
| Click "Continue shopping" | Drawer closes |
| Click "CHECKOUT" in drawer | Navigates to `/checkout` |
| Sticky bar click | Same drawer flow as main button |
| Press Escape while drawer open | Drawer closes |

- [ ] **Step 2: Check mobile (≤480px viewport)**

Drawer should be full width. All elements readable. Overlay covers page behind drawer.

- [ ] **Step 3: Push to GitHub (syncs to dev store)**

```bash
git push origin main
```

Wait ~30 seconds for GitHub → Shopify sync, then verify on live dev store URL.
