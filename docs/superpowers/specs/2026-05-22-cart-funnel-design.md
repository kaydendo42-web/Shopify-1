# Cart Funnel UX — Design Spec
**Date:** 2026-05-22
**Status:** Approved for implementation

---

## Overview

Replace the default Shopify ATC → cart page redirect with a conversion-optimised funnel that keeps the user on the product page, confirms their action with animation, and drives them to checkout via a slide-in cart drawer. Add soft social proof near the ATC button. Enhance the existing sticky ATC bar with a first-appearance pulse.

Scope: single product (The Quiet Hour Mask, 3 bundle variants). No upsell component at this stage.

---

## 1. Cart Drawer

### Behaviour
- ATC button click → AJAX POST to `/cart/add.js` (intercepts native form submit)
- On success → open cart drawer (slide in from right)
- Semi-transparent dark overlay covers the page behind the drawer
- Click overlay → close drawer; click ✕ button → close drawer
- Body scroll locked (`overflow: hidden` on `<body>`) while drawer is open
- Re-clicking ATC when drawer already has item → re-opens drawer, increments quantity, does not duplicate

### Structure
```
┌─────────────────────────────────┐
│ Your bag (2)          [✕ close] │
├─────────────────────────────────┤
│ ████████░░░ $55 to free ship    │
├─────────────────────────────────┤
│ [img]  The Quiet Hour Mask      │
│        1× Mask   [−][1][+]      │
│                        $105.00  │
├─────────────────────────────────┤
│ Subtotal              $105.00   │
│ [ CHECKOUT — CLAIM YOUR OFFER ] │
│      Continue shopping →        │
└─────────────────────────────────┘
```

### Layout & Visual
- Width: 380px on desktop, 100vw on mobile (≤480px)
- Slides in from right: `transform: translateX(100%)` → `translateX(0)`, 300ms `ease-out`
- Background: `var(--color-bg)` (warm cream)
- Overlay: `rgba(0,0,0,0.45)`, 200ms fade
- Checkout CTA: full-width, terracotta (`--color-primary`), same style as main ATC button
- "Continue shopping" link: small, centered, muted — closes drawer on click
- Free shipping bar: reuses existing `.free-ship` CSS already in `theme.css`. Threshold set as `data-threshold="{{ 99 | times: 100 }}"` (i.e. 9900 cents = AU$99) on the drawer's free-ship div in `layout/theme.liquid`. To change the threshold, update the literal `99` in that one place.
- Cart line items: product image (80×80), title, variant name, price, qty `[−][n][+]` controls
- Qty controls wire to existing `submitCartChange()` in `theme.js`

### DOM Location
Cart drawer HTML lives in `layout/theme.liquid` (always in DOM, hidden by default). After each add/qty update, JS calls `/cart.js` (JSON) and updates three specific DOM nodes: item count in the drawer header, subtotal amount, and free ship bar fill width. Full line-item re-render is not needed — this store sells a single product, so there is always exactly one cart line.

---

## 2. ATC Button Animation

### States
| State | Label | Style |
|-------|-------|-------|
| Default | `START YOUR RITUAL — SAVE 25%` | Terracotta, full opacity |
| Loading | `◌ Adding...` | 70% opacity, disabled, no pointer events |
| Success | `✓ Added to your ritual` | Slightly deeper terracotta, 2 seconds |
| Revert | Back to default | 200ms fade |

- Applies to both the main buybox button and the sticky ATC bar button
- Button width does not change between states (prevents layout shift) — fixed min-width
- 200ms `ease` CSS transition on `background-color` and `opacity`

### Implementation
- JS intercepts `#product-form` submit event
- `fetch('/cart/add.js', { method: 'POST', body: formData })`
- On pending: set loading state
- On resolve: set success state → open drawer → after 2000ms revert button
- On reject: revert button + show inline error ("Something went wrong — try again")

---

## 3. Social Proof Badge

### Display
Sits between the ATC button and the payment icons row in the buybox:

```
● 143 women started their ritual this week  ·  Ships in 24 hrs
```

### Behaviour
- Static display — no live data
- Count configurable via section setting `"social_proof_count"` (text field, default `"143"`)
- Ships copy is hardcoded ("Ships in 24 hrs") — update manually if fulfilment changes

### Visual
- Pulsing dot: 8px circle, `#4caf50` (soft green), single CSS `pulse` keyframe animation (scale 1→1.3→1, 2s infinite)
- Text: `var(--fs-xs)`, `var(--color-text-muted)`, not bold
- Separator `·` between the two items

---

## 4. Sticky ATC Bar — First-Appearance Pulse

### Behaviour
- Current: bar appears silently via `is-visible` class toggle
- Enhancement: first time `is-visible` is added, append class `is-pulsing` for one animation cycle
- After animation completes (~600ms), remove `is-pulsing`
- Subsequent show/hide cycles: no pulse (guard flag `stickyPulsed = true`)

### Visual
- CSS: `box-shadow` pulse from `0` → `0 0 0 8px rgba(180, 90, 60, 0.25)` → `0` (terracotta approximation — avoids needing an `--color-primary-rgb` token)
- Duration: 600ms, `ease-out`, fires once

---

## 5. Files Changed

| File | Change |
|------|--------|
| `layout/theme.liquid` | Add cart drawer HTML + overlay div |
| `sections/hero-product.liquid` | Intercept form submit; add social proof badge markup |
| `assets/theme.js` | `initCartDrawer()`, `openCartDrawer()`, `closeCartDrawer()`, `refreshCartDrawer()`, ATC intercept logic, sticky pulse guard |
| `assets/theme.css` | Drawer styles, overlay, slide animation, button state transitions, pulse keyframes, social proof dot |

No new files required. No changes to `templates/`, `config/`, or `snippets/`.

---

## 6. Out of Scope (this sprint)

- Upsell block inside drawer (no second product yet)
- Live inventory counter ("Only 6 left")
- Countdown timer
- Post-purchase upsell modal
- Cart drawer on collection page ATC buttons (already handled by `initCollectionAtc` — separate wiring pass later)
