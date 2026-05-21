/* theme.js — core interactions */

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
});

/**
 * Product Media Gallery
 */
function initGallery() {
  const thumbnails = document.querySelectorAll('.product-gallery__thumbnail');
  const mainImage = document.querySelector('.product-gallery__main-img');

  if (!thumbnails.length || !mainImage) return;

  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      // Remove active class from all thumbnails
      thumbnails.forEach(thumb => thumb.classList.remove('is-active'));
      
      // Add active class to clicked thumbnail
      thumbnail.classList.add('is-active');

      // Update main image source
      const newSrc = thumbnail.getAttribute('data-image-src');
      if (newSrc) {
        mainImage.setAttribute('src', newSrc);
      }
    });
  });
}

/**
 * Bundle Selector
 * Updates pricing display, updates discount badges, and manages selected state
 */
function initBundleSelector() {
  const bundleCards = document.querySelectorAll('.bundle-card');
  const mainPriceCurrent = document.querySelector('.price--current');
  const mainPriceCompare = document.querySelector('.price--compare');
  const mainPriceBadge = document.querySelector('.price__badge');
  const variantInput = document.querySelector('input[name="id"]'); // Standard Shopify form input

  if (!bundleCards.length) return;

  bundleCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selected class from all cards
      bundleCards.forEach(c => c.classList.remove('is-selected'));

      // Add selected class to clicked card
      card.classList.add('is-selected');

      // Check the radio input
      const radio = card.querySelector('.bundle-card__radio');
      if (radio) radio.checked = true;

      // Extract pricing data from card
      const currentPrice = card.getAttribute('data-price');
      const comparePrice = card.getAttribute('data-compare-price');
      const discountText = card.getAttribute('data-discount-badge');
      const variantId = card.getAttribute('data-variant-id');

      // Update main buy box price block
      if (mainPriceCurrent && currentPrice) {
        mainPriceCurrent.textContent = currentPrice;
      }
      if (mainPriceCompare && comparePrice) {
        mainPriceCompare.textContent = comparePrice;
      }
      if (mainPriceBadge && discountText) {
        mainPriceBadge.textContent = discountText;
        mainPriceBadge.style.display = 'inline-block';
      } else if (mainPriceBadge) {
        mainPriceBadge.style.display = 'none';
      }

      // Update Shopify form variant ID
      if (variantInput && variantId) {
        variantInput.value = variantId;
      }

      // Also update sticky ATC price
      const stickyPrice = document.querySelector('.sticky-atc__price');
      if (stickyPrice && currentPrice) {
        stickyPrice.textContent = currentPrice;
      }
    });
  });
}

/**
 * FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq__question');

  if (!faqQuestions.length) return;

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq__item');
      if (!item) return;

      const isOpen = item.classList.contains('is-open');

      // Close all accordion items (optional, but standard for accordion feel)
      document.querySelectorAll('.faq__item').forEach(i => {
        i.classList.remove('is-open');
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });
}

/**
 * Sticky Add to Cart (ATC) Bar
 * Shows sticky bar when the main ATC button is scrolled out of view
 */
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

/**
 * Cart line qty buttons + auto-submit
 */
function initCartQty() {
  const form = document.getElementById('cart-form');
  if (!form) return;

  form.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const input = form.querySelector(`.qty-input[data-key="${key}"]`);
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const next = btn.classList.contains('qty-btn--plus') ? current + 1 : Math.max(0, current - 1);
    input.value = next;
    submitCartChange(key, next);
  });

  form.addEventListener('change', (e) => {
    const input = e.target.closest('.qty-input');
    if (!input) return;
    const next = Math.max(0, parseInt(input.value, 10) || 0);
    submitCartChange(input.dataset.key, next);
  });
}

function submitCartChange(key, quantity) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ id: key, quantity }),
  })
    .then(r => r.json())
    .then(cart => {
      updateFreeShipBar(cart.total_price);
      updateCartCount(cart.item_count);
      if (quantity === 0) {
        const line = document.querySelector(`.cart-line[data-key="${key}"]`);
        if (line) line.remove();
      }
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
    })
    .catch(() => window.location.reload());
}

function updateFreeShipBar(totalCents) {
  const bar = document.querySelector('.free-ship');
  if (!bar) return;
  const threshold = parseInt(bar.dataset.threshold, 10);
  const pct = Math.min(100, (totalCents / threshold) * 100);
  const fill = bar.querySelector('.free-ship__bar-fill');
  if (fill) fill.style.width = `${pct}%`;
}

function updateCartCount(count) {
  const el = document.getElementById('cart-icon-bubble');
  if (el) el.textContent = count;
}

/**
 * Cart upsell — add product to cart inline
 */
function initCartUpsell() {
  const btn = document.querySelector('.cart-upsell__add');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const variantId = btn.dataset.addVariant;
    if (!variantId) return;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    })
      .then(r => r.json())
      .then(() => window.location.reload())
      .catch(() => {
        btn.disabled = false;
        btn.textContent = 'Try again';
      });
  });
}

/**
 * Email Popup — exit intent (desktop) + delay fallback (mobile)
 */
function initEmailPopup() {
  const popup = document.getElementById('email-popup');
  if (!popup) return;

  const cookieKey = 'tqh_popup_dismissed';
  if (getCookie(cookieKey)) return;

  const trigger = popup.dataset.trigger || 'exit';
  const delaySec = parseInt(popup.dataset.delay, 10) || 25;
  const cookieDays = parseInt(popup.dataset.cookieDays, 10) || 14;
  const isTouch = window.matchMedia('(hover: none)').matches;

  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    popup.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const dismiss = () => {
    popup.hidden = true;
    document.body.style.overflow = '';
    setCookie(cookieKey, '1', cookieDays);
  };

  popup.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', dismiss);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popup.hidden) dismiss();
  });

  const form = popup.querySelector('#email-popup-form');
  if (form) {
    form.addEventListener('submit', () => {
      setTimeout(dismiss, 600);
    });
  }

  if (trigger === 'exit' && !isTouch) {
    document.addEventListener('mouseout', (e) => {
      if (e.clientY <= 0 && !shown) show();
    });
    setTimeout(show, delaySec * 2 * 1000); // safety fallback
  } else if (trigger === 'scroll') {
    let triggered = false;
    window.addEventListener('scroll', () => {
      if (triggered) return;
      const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (pct > 0.5) { triggered = true; show(); }
    }, { passive: true });
  } else {
    setTimeout(show, delaySec * 1000);
  }

  if (isTouch && trigger === 'exit') {
    setTimeout(show, delaySec * 1000);
  }
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Collection — sort bar auto-submit
 */
function initCollectionSort() {
  const select = document.querySelector('[data-sort]');
  if (!select) return;
  select.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', select.value);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  });
}

/**
 * Collection — AJAX add to cart from product card
 * - Spinner during fetch
 * - "Added" state for 2s
 * - If product needs options, redirect to PDP instead
 */
function initCollectionAtc() {
  const buttons = document.querySelectorAll('[data-atc]');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      if (btn.dataset.needsOptions === 'true') {
        window.location.href = btn.dataset.productUrl;
        return;
      }

      const variantId = btn.dataset.variantId;
      const label = btn.querySelector('.atc-label');
      const originalText = label ? label.textContent : btn.textContent;

      if (!variantId || btn.classList.contains('is-loading') || btn.disabled) return;

      btn.classList.add('is-loading');
      if (label) label.textContent = 'Adding';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(() => fetch('/cart.js'))
        .then(r => r.json())
        .then(cart => {
          updateCartCount(cart.item_count);
          btn.classList.remove('is-loading');
          btn.classList.add('is-added');
          if (label) label.textContent = '✓ Added';

          setTimeout(() => {
            btn.classList.remove('is-added');
            if (label) label.textContent = originalText;
          }, 2000);

          window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
        })
        .catch(() => {
          btn.classList.remove('is-loading');
          if (label) label.textContent = 'Try again';
          setTimeout(() => { if (label) label.textContent = originalText; }, 2000);
        });
    });
  });
}

/**
 * Before/After comparison sliders
 * - Drag handle or click anywhere on the slider to move
 * - Pointer + touch supported
 */
function initBeforeAfter() {
  const sliders = document.querySelectorAll('[data-ba-slider]');
  if (!sliders.length) return;

  sliders.forEach(slider => {
    const after = slider.querySelector('[data-ba-after]');
    const handle = slider.querySelector('[data-ba-handle]');
    if (!after || !handle) return;

    let dragging = false;

    const move = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
    };

    const onDown = (e) => {
      dragging = true;
      e.preventDefault();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      move(x);
    };

    const onMove = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      move(x);
    };

    const onUp = () => { dragging = false; };

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });
    slider.addEventListener('mousedown', onDown);
    slider.addEventListener('touchstart', onDown, { passive: false });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  });
}
