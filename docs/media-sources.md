# Media Sources — The Quiet Hour™

> **Status:** Active tracking
> **Last updated:** 2026-05-22
> **Purpose:** Provenance log for every photo / video shipped on the storefront. Required for AU Consumer Law s18 (no misleading conduct) + future legal review.

---

## Source categories

| Category | Provenance risk | Allowed use |
|----------|-----------------|-------------|
| **OEM product photos** (mask, accessories) | Low — supplier-provided, shared across resellers | Anywhere — gallery, sections, ads |
| **Brand-shot lifestyle** (commissioned / generated for us) | None | Anywhere |
| **AliExpress supplier listing media** | Low — supplier grants reseller use | Anywhere — gallery, sections, ads |
| **Competitor-pulled media** (lumio etc.) | Medium-High — must verify | Lifestyle only, never as "our customer" |
| **Customer-submitted UGC** | None once consent on file | Anywhere with consent doc |

---

## Asset register

### Hero / gallery photos

| File in `/assets` | Source | Use |
|-------------------|--------|-----|
| `mask-shot-1.png` to `mask-shot-6.{png,jpg}` | Pulled from lumioskin.shop CDN — OEM product, same Foreverlily supplier as SKU 1 | Product gallery, What's Included section, ads |
| `product-packshot.png` | Original brand pack | Hero fallback |
| `lifestyle-sofa.jpg`, `lifestyle-chaise.jpg`, `hero-mask-glow.jpg`, `hero-mask-side.jpg` | Brand-generated lifestyle | Hero, lifestyle sections |
| `woman-mirror-1.jpg` | Brand-generated lifestyle | Lifestyle sections |
| `ritual-step-1.jpeg`, `ritual-step-2.jpeg`, `ritual-step-3.jpeg` | Brand-generated (sourced via brand content folder 2026-05-22) | How-It-Works ritual section |

### Pending / staging (not committed)

| File | Location | Status |
|------|----------|--------|
| `cust-1.jpg`, `cust-3.jpg` | `_lumio-review/customers/` | Low resolution thumbs — likely unusable |
| `cust-2-STOCK.webp` | `_lumio-review/customers/` | **Shutterstock-style stock photo — do not use** |
| `cust-4-7-SCREENSHOT.png` | `_lumio-review/customers/` | Social media screenshots — provenance unclear, do not label as "our customer" |

### Pulled from AliExpress supplier listing

| File | Use | Status |
|------|-----|--------|
| _(pending — drop in `Red therapy Mask Content/aliexpress/`)_ | Lifestyle, demo videos | Awaiting user upload |

---

## Source URLs

### Mask product (SKU 1) — Foreverlily AliExpress listing
- **Listing:** `https://www.aliexpress.com/item/1005008351956812.html`
- **Variant for mask:** 7 Colors Light LED Facial Skin Care Mask — 400mAh, no box
- **Supplier:** Foreverlily
- **Reseller rights:** Implicit via AliExpress reseller programme

### Neck wrap (SKU 2) — same listing, different variant
- **Listing:** `https://www.aliexpress.com/item/1005008351956812.html`
- **Variant for neck:** "neck care" colour option
- **Use:** Combo add-on for The Quiet Hour Set bundle (and optional checkbox on 2× Mask Bundle)

### Competitor pulled (for adaptation)
- **lumioskin.shop product page:** `https://lumioskin.shop/products/amoure-beauty-led-glow-therapy-mask`
- **Used for:** OEM product photo sourcing only — same Foreverlily supplier, shared imagery
- **Not used:** Their copy, customer testimonials, illustrations, brand creative

---

## Do-not-use list

These were considered and rejected — log so we don't pull them again:

| Asset | Reason |
|-------|--------|
| `vertical-photo-asian-thai-woman-600nw-2622906163.webp` (lumio CDN) | Shutterstock stock photo — Lumio shouldn't have it either |
| Lumio "Screenshot_2026-05-18_at_X.XX.XX_PM.png" series | Social media captures of unknown people — cannot be labelled as our customers |

---

## Outstanding

- [ ] Add neck wrap photos to assets when listing variant images pulled
- [ ] Source 3+ clean lifestyle photos from AliExpress supplier listing (no stock, no screenshots)
- [ ] Add real customer UGC once first 50 customers ship — collect via post-purchase email with consent checkbox
