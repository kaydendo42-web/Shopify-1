# 🎨 Shopify Custom Theme — Build Brief for Claude Code

> **Purpose:** This document is the build brief for a custom, high-converting Shopify theme. Use it as the source of truth when building Liquid templates, sections, snippets, CSS, and JS.
>
> **Inspired by analysis of:** Cookinate.com, multiple high-converting Elixir-style templates, and proven Shopify DTC patterns. We are NOT copying any specific theme's code or assets — we are implementing the *conversion principles* these stores use.

---

## TABLE OF CONTENTS
1. [Build Philosophy](#build-philosophy)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Global Design System](#global-design-system)
4. [Page-by-Page Structure](#page-by-page-structure)
5. [Product Page (The Money Page)](#product-page-the-money-page)
6. [Conversion Psychology Reference](#conversion-psychology-reference)
7. [Mobile Requirements](#mobile-requirements)
8. [Performance Budget](#performance-budget)
9. [Sections & Snippets Inventory](#sections--snippets-inventory)
10. [Build Order](#build-order)

---

## BUILD PHILOSOPHY

This theme is being built for **direct response e-commerce** — single-product or hero-product brands running paid traffic (Meta ads). Every design decision is in service of one goal: **convert cold traffic into a checkout**.

That means:
- Mobile-first, always. 70%+ of traffic will be mobile.
- Speed obsessed. Slow stores kill ROAS.
- Trust signals layered everywhere — visitor never has to look for proof.
- Clear hierarchy: visitor knows what to do next at every scroll point.
- No vanity features. If it doesn't move the needle on conversion, cut it.

This is the opposite of a "boutique aesthetic" theme. Pretty doesn't pay rent. Conversion does.

---

## TECH STACK & ARCHITECTURE

### Stack
- **Shopify Online Store 2.0** (sections everywhere, JSON templates)
- **Liquid** for templating
- **Vanilla JS** for interactivity (no jQuery, no heavy frameworks)
- **CSS custom properties** for theming
- **Web components** for reusable interactive bits (qty selector, accordion, etc)
- **No build step required** — assets loaded direct from `/assets`

### File Structure
```
theme/
├── assets/
│   ├── base.css              # design tokens + resets + utilities
│   ├── theme.css             # component styles
│   ├── theme.js              # core interactions
│   └── icons.svg             # sprite sheet
├── config/
│   ├── settings_schema.json  # theme editor settings
│   └── settings_data.json
├── layout/
│   └── theme.liquid          # base wrapper, header/footer slots
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   ├── announcement-bar.liquid
│   ├── hero-product.liquid
│   ├── product-info.liquid
│   ├── benefit-bullets.liquid
│   ├── bundle-selector.liquid
│   ├── trust-bar.liquid
│   ├── as-seen-in.liquid
│   ├── feature-grid.liquid
│   ├── comparison-table.liquid
│   ├── how-it-works.liquid
│   ├── testimonials-slider.liquid
│   ├── stats-block.liquid
│   ├── faq-accordion.liquid
│   ├── guarantee-block.liquid
│   └── image-with-text.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── star-rating.liquid
│   ├── price.liquid
│   ├── add-to-cart-button.liquid
│   ├── payment-badges.liquid
│   ├── trust-badge.liquid
│   ├── icon.liquid
│   └── meta-tags.liquid
├── templates/
│   ├── index.json
│   ├── product.json
│   ├── collection.json
│   ├── cart.json
│   ├── page.json
│   └── 404.json
└── locales/
    └── en.default.json
```

---

## GLOBAL DESIGN SYSTEM

### Design Tokens (CSS Custom Properties)

Defined once in `base.css` and overridable via theme settings.

```css
:root {
  /* COLORS — keep palette tight */
  --color-bg: #ffffff;
  --color-bg-alt: #f8f6f2;        /* warm off-white for section alternation */
  --color-text: #1a1a1a;
  --color-text-muted: #6b6b6b;
  --color-accent: #1a1a1a;        /* primary CTA — override per niche */
  --color-accent-contrast: #ffffff;
  --color-success: #2d8a4f;
  --color-discount: #c2410c;      /* sale/strikethrough red */
  --color-border: #e5e5e5;
  --color-trust: #fbbf24;         /* gold for stars */

  /* TYPOGRAPHY */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --fs-xs: 0.75rem;     /* 12px */
  --fs-sm: 0.875rem;    /* 14px */
  --fs-base: 1rem;      /* 16px */
  --fs-lg: 1.125rem;    /* 18px */
  --fs-xl: 1.5rem;      /* 24px */
  --fs-2xl: 2rem;       /* 32px */
  --fs-3xl: 2.5rem;     /* 40px */
  --lh-tight: 1.2;
  --lh-base: 1.5;

  /* SPACING (8pt scale) */
  --sp-1: 0.25rem;
  --sp-2: 0.5rem;
  --sp-3: 0.75rem;
  --sp-4: 1rem;
  --sp-6: 1.5rem;
  --sp-8: 2rem;
  --sp-12: 3rem;
  --sp-16: 4rem;
  --sp-24: 6rem;

  /* SECTION PADDING */
  --section-pad-y: clamp(2rem, 5vw, 4rem);
  --section-pad-x: clamp(1rem, 4vw, 1.5rem);

  /* CONTAINER */
  --container-max: 1280px;
  --container-narrow: 720px;

  /* BORDERS / RADIUS */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* SHADOWS */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);

  /* TRANSITIONS */
  --t-fast: 150ms ease;
  --t-base: 250ms ease;
}
```

### Typography Rules
- **Headings:** Tight line-height (1.1-1.2), bold weight (600-700), generous letter-spacing (-0.01em) for impact.
- **Body:** 16px minimum on mobile, 1.5 line-height, 65ch max-width for readability.
- **CTAs:** Bold, slightly larger (18px), all-caps optional, with letter-spacing.
- Never use more than 2 fonts. Pair a clean sans (body) with a bolder display (optional, for hero headlines).

### Color Use
- White space is a feature, not empty space.
- Alternate sections with `--color-bg-alt` (warm off-white) to create rhythm.
- Reserve `--color-accent` for one thing: CTAs. Don't dilute it.
- Discount/savings always use `--color-discount`.
- Stars and trust signals use `--color-trust`.

---

## PAGE-BY-PAGE STRUCTURE

### Homepage (`templates/index.json`)
Hero-product brand homepage. Push to product page as fast as possible.
1. Announcement bar (sale / urgency)
2. Header
3. Hero (full-bleed image/video + headline + CTA)
4. Benefit bullets (3-5 icons + short text)
5. "As seen in" press logos
6. Featured product card
7. How it works (3-step)
8. Testimonials slider
9. Comparison table (us vs alternatives)
10. FAQ
11. Footer

### Product Page (`templates/product.json`) — THE money page, see dedicated section below

### Cart (`templates/cart.json`)
1. Header
2. Line items with qty editor
3. Free shipping progress bar (e.g. "$15 away from free shipping")
4. Cross-sell / upsell strip (1-2 complementary products)
5. Trust badges row
6. Subtotal + checkout CTA
7. Money-back guarantee restatement
8. Footer

### Collection / 404 / Account
Standard layouts — keep simple, conversion focus is the product page.

---

## PRODUCT PAGE (THE MONEY PAGE)

This is where 90% of conversion happens. Below is the section-by-section blueprint with the *why* behind each.

### Section 1 — Announcement Bar (sticky top)
- One-liner with urgency: "🔥 FLASH SALE — UP TO 48% OFF"
- Optionally a countdown timer (use sparingly, must be honest)
- Dismissible? No. Keep it always visible.

### Section 2 — Header
- Logo left, minimal nav center, cart icon right
- Cart icon shows item count badge
- Sticky on scroll (slim down once scrolled past hero)
- Mobile: hamburger left, logo center, cart right

### Section 3 — Product Hero (above the fold)
Two-column on desktop, stacked on mobile.

**Left: Media Gallery**
- Main image (square, 1:1 minimum) with zoom on hover
- Thumbnail strip below (4-6 images + 1 video)
- Video plays inline on click
- Lazy-load all but first image
- Mobile: swipeable carousel

**Right: Buy Box**
- Trust badge ribbon: "🏆 2025's Most Loved [Category]"
- Star rating: ⭐⭐⭐⭐⭐ 4.8/5 based on **37,259 customers** (specific numbers > round numbers)
- Product title (H1, large, bold)
- Outcome statement subheadline: "Making [outcome] part of 147,000+ [audience members'] daily routine"
- Price block:
  - Original price strikethrough
  - Current price prominent
  - "SAVE 49%" badge in accent/discount colour
- 5 benefit bullets with green checkmarks ✓ (NOT generic features — outcomes)
- Variant selector (if applicable)
- **Bundle selector** (CRITICAL — drives AOV):
  - Buy 1 — full price
  - Buy 2 — 10% OFF — labelled "Most Popular"
  - Buy 3 — 15% OFF — labelled "Best Value"
  - Visual cards with images, clear pricing comparison
- Optional add-on (Shipping Protection / Warranty) with checkbox + price
- Add to Cart button (large, full-width, accent colour, contrast text)
- Below CTA: payment method badges (Visa, MC, Amex, PayPal, Apple Pay, Shop Pay, Google Pay)
- Order tracking visual: `🛒 Ordered → 📦 Shipped → 🚚 Out for Delivery → 🎁 Delivered`
- One featured testimonial inline (face photo + quote + name)

### Section 4 — Trust Bar
Horizontal scrolling row of pill badges:
- ✓ 30-Day Money-Back Guarantee
- ✓ Free Shipping over $X
- ✓ 24/7 Customer Support
- ✓ SSL Secure Checkout
- ✓ 2-Year Warranty

Should sit immediately under the hero buy box.

### Section 5 — "As Seen In"
- Grayscale press logos (Forbes, Allrecipes, Tastemade, etc — only use ones you actually have)
- Pull quote from each publication
- Borrowed authority is one of the strongest trust signals

### Section 6 — Big Lifestyle Hero Image + Outcome Headline
Full-bleed image of product in use. Overlay or below: a bold outcome headline.

Example: "Up to 12x Faster Than Traditional Methods"

### Section 7 — Feature Grid (5 features)
Icon + heading + 1-line description for each. Examples:
- One-Touch Operation
- High-Speed
- Built-In Filter
- Self-Cleaning
- Compact Design

Layout: 5-column desktop, 2-column mobile (last item full-width).

### Section 8 — Problem/Solution Image+Text
Side-by-side block. Heavy on outcome language.

Example pattern: "You don't need [expensive alternative], [tedious alternative], or [bulky alternative]. In fact, one of the most effective ways to [outcome] is [your product]."

### Section 9 — How It Works (3-step)
Three columns with image + step number + heading + 1-line description.
1. Choose your bundle
2. We ship in 1-3 days
3. Enjoy [outcome]

### Section 10 — Comparison Table
Two-column table: **Us vs Others / Knock-offs**.
- Row 1: Core feature → ✓ vs ✗
- Repeat for 5-6 features
- Visual: green checks vs red X's
- Brand logo top of "us" column

This is one of the highest-converting sections — it pre-handles "why not buy elsewhere".

### Section 11 — Stats Block
Three big numbers with context.
- **147,432+** units sold
- **94%** reported [outcome] within 4 weeks
- **3 of 4** customers reported immediate [benefit]
- Asterisk footnote: "Based on internal studies and customer feedback surveys."

### Section 12 — Testimonials Slider (UGC-style)
- Customer photos (real if possible — AI ok but disclose nothing)
- 5-star rating
- Headline ("Worth it!" / "Game changer!")
- Body quote
- Verified Customer badge
- Purchase date
- Optional: product card with price below review (turns reviews into mini-buyboxes)

### Section 13 — Sticky Add-to-Cart (mobile)
On product page mobile, after user scrolls past the hero, a sticky bottom bar appears:
- Thumbnail image
- Price
- Add to Cart button

This recovers users who scrolled deep and need a re-entry point.

### Section 14 — Guarantee Block
- Big heading: "Risk-Free 30-Day Money-Back Guarantee"
- Reassurance copy
- Badges: 100% Satisfaction / Fast Shipping / Easy Returns
- "Claim Now" button → scrolls back to buy box

### Section 15 — FAQ Accordion
6-10 questions. Use foundational docs research to pre-handle objections.

Standard questions:
- Does it actually work?
- How long does shipping take?
- What's the return policy?
- Is it safe to use?
- How do I clean / maintain it?
- What if I'm not satisfied?
- Where do you ship?
- Do you offer warranty?

### Section 16 — Footer
- Brand logo + tagline
- Quick links (Shipping, Returns, Privacy, Legal)
- Newsletter signup (single email field + button)
- Contact email displayed
- Payment methods row
- Copyright

---

## CONVERSION PSYCHOLOGY REFERENCE

Use this as the "why" guide when making design decisions.

| Pattern | Psychological Lever | Implementation |
|---|---|---|
| Specific numbers ("37,259 customers") | Specificity = credibility | Never round. Use weird, specific counts. |
| Strikethrough pricing | Anchoring | Always show original > current price |
| "Most Popular" / "Best Value" badges | Social proof + decision shortcut | On bundle middle/right options |
| Bundle pricing | Decoy effect + AOV lift | 3 tiers, middle one "most popular" |
| Limited time / Flash sale | Loss aversion + urgency | Honest — don't fake countdowns |
| As-seen-in logos | Borrowed authority | Real publications only |
| Comparison table | Pre-handle objections | Show clear superiority on what matters |
| Money-back guarantee | Reverse risk | Restate it 2-3 times on the page |
| Customer photos | Social proof | UGC style beats studio shots |
| Specific testimonial copy | Specificity = real | Detailed outcomes > generic praise |
| Sticky mobile ATC | Re-entry point | Appears after user scrolls past hero |
| Trust badges row | Reduce checkout anxiety | Visible at decision points |
| Live cart "X items left" | Scarcity | Only if honest about stock |
| Free shipping threshold | AOV lift | "$15 away from free shipping" bar |

---

## MOBILE REQUIREMENTS

70%+ of paid traffic will be mobile. Every section must be designed mobile-first.

### Non-negotiables
- **Minimum tap target: 44x44px**
- **Body text: 16px minimum** (never below — iOS will zoom)
- **Sticky ATC bar** on product page after scroll
- **Single-column layout** for product hero on screens <768px
- **Swipeable image gallery** with dots indicator
- **Accordion FAQs** (never expanded by default on mobile)
- **Horizontal scroll** for testimonials and trust badges
- **No hover-only interactions** — everything must work on tap
- **Test on real iPhone Safari and Android Chrome** — emulators lie

### Mobile-specific patterns
- Bundle selector cards stack full-width, not in a row
- Comparison table converts to side-by-side columns OR stacked accordion
- Press logos scroll horizontally
- "How it works" steps stack vertically

---

## PERFORMANCE BUDGET

Paid traffic doesn't tolerate slow pages. Targets:

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | 80+ |
| Largest Contentful Paint | <2.5s on 4G |
| First Input Delay | <100ms |
| Cumulative Layout Shift | <0.1 |
| Total page weight | <1.5MB |
| Number of requests | <50 |

### Performance rules
- **Hero image:** WebP, max 200KB, eager-loaded, explicit width/height to prevent CLS
- **All other images:** lazy-loaded, `loading="lazy"`, WebP preferred
- **No external fonts** unless absolutely necessary. System fonts > custom.
- **JS:** defer everything that isn't critical-path. No render-blocking scripts.
- **CSS:** inline critical CSS in `<head>`, defer the rest.
- **Apps:** every Shopify app adds weight. Audit ruthlessly.
- **Video:** never autoplay with sound. Lazy-load YouTube/Vimeo embeds (use facade pattern).
- **Use Shopify's built-in `image_url` filter** with `width:` param to serve responsive images.

---

## SECTIONS & SNIPPETS INVENTORY

Build these as reusable, theme-editor-friendly sections so the merchant can rearrange/edit without code.

### Sections (all must have schema settings)
1. `announcement-bar` — text, link, background color, dismissible toggle
2. `header` — logo upload, menu, sticky toggle
3. `hero-product` — heading, subheading, media (image/video), CTA text, CTA link
4. `product-info` — product page main buy-box wrapper
5. `bundle-selector` — bundle tiers with discount %, labels, images
6. `trust-bar` — repeater of badges (icon + text)
7. `as-seen-in` — repeater of logos + pull quotes
8. `feature-grid` — repeater of icon + heading + body
9. `comparison-table` — column headings + row repeater
10. `how-it-works` — step repeater (image + heading + body)
11. `testimonials-slider` — review repeater with photo, name, body, rating, product link
12. `stats-block` — repeater of big number + label + footnote
13. `faq-accordion` — Q/A repeater
14. `guarantee-block` — heading, body, badge repeater, CTA
15. `image-with-text` — flexible 2-column block
16. `footer` — links, newsletter, social, payment badges

### Snippets
- `star-rating` — accepts rating value, outputs SVG stars
- `price` — handles regular/sale, currency, savings %
- `add-to-cart-button` — primary CTA component
- `payment-badges` — row of payment method icons
- `trust-badge` — single badge with icon + text
- `icon` — pulls from sprite sheet
- `product-card` — used in collections and cross-sells
- `meta-tags` — SEO/OG tags

---

## BUILD ORDER

Don't try to build everything at once. Build in this sequence so the store is launchable ASAP and we can layer polish on top.

### Phase 1 — Skeleton (must-have to launch)
1. `theme.liquid` layout + header + footer
2. `base.css` design tokens + utilities
3. Product page: hero + buy box + bundle selector + ATC + trust bar
4. Cart page (basic)
5. Checkout (Shopify handles, but theme matches)

### Phase 2 — Conversion Layers
6. As-seen-in + press logos
7. Feature grid
8. Comparison table
9. How it works
10. Stats block
11. Testimonials slider
12. FAQ
13. Guarantee block
14. Mobile sticky ATC

### Phase 3 — Polish
15. Announcement bar with optional countdown
16. Cart upsells / cross-sells
17. Free shipping progress bar
18. Email capture popup (single trigger, exit intent)
19. Performance pass (Lighthouse, image audit)
20. A/B test variants

---

## REFERENCE STORES (FOR PRINCIPLES, NOT CODE)

Studied for conversion patterns:
- `cookinate.com` — real brand, polished execution, strong bundle selector, press logos, comparison table
- Multiple Shopify product page templates — confirms patterns above are industry-standard for DTC

We are not lifting code, assets, or specific copy from any of these. We are implementing the *category-standard patterns* every high-converting DTC store uses.

---

## COPY TONE GUIDELINES

When writing copy for any section:
- **Specific > vague.** "Crushes nuts in 90 seconds" beats "Fast blending".
- **Outcome > feature.** "Sleep through the night" beats "Memory foam".
- **You-language.** "You'll wake up refreshed" beats "Our pillow provides comfort".
- **One idea per sentence.** Short, punchy.
- **Numbers everywhere.** Specific counts, percentages, time savings.
- **Avoid superlatives without proof.** "The best" is empty. "Rated 4.8 by 37,259 customers" is real.

All product copy will be generated using the **Foundational Docs process** (see master plan MD) and pasted into theme editor — not hardcoded.

---

## DEFINITELY DO NOT


- ❌ Add carousels with autoplay (kills CLS and conversion)
- ❌ Add chat widgets that load JS before the main thread is free
- ❌ Use lightboxes for product images on mobile (kill UX)
- ❌ Hide the price below the fold
- ❌ Require account creation for checkout
- ❌ Use "Click here" / generic CTA text
- ❌ Bury the add-to-cart button
- ❌ Add fake countdown timers that reset on refresh
- ❌ Use stock product photos with white background only (lifestyle/UGC converts better)

---

## NEXT STEPS IN CLAUDE CODE

1. Initialise theme via Shopify CLI: `shopify theme init`
2. Implement Phase 1 skeleton (theme.liquid, header, footer, product page hero+buybox)
3. Connect to dev store, push theme, test on real product
4. Implement Phase 2 sections one at a time, testing each in the editor
5. Mobile audit (test on real device)
6. Performance audit (Lighthouse, fix issues)
7. Push to live store when product is selected

---

**END OF BUILD BRIEF** — drop this in your theme root as `THEME_BUILD_BRIEF.md` and reference it in every Claude Code session.
