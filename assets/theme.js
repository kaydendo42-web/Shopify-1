/* theme.js — core interactions */

function fireAddToCart(variantId, price, name) {
  if (typeof fbq !== 'function') return;
  fbq('track', 'AddToCart', {
    content_ids: [String(variantId)],
    content_type: 'product',
    value: price ? (price / 100).toFixed(2) : '0.00',
    currency: 'AUD',
    content_name: name || ''
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initAtcIntercept();
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
  initUgcVideos();
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
        mainImage.src = newSrc;
        const newSrcset = thumbnail.getAttribute('data-image-srcset');
        if (newSrcset) {
          mainImage.srcset = newSrcset;
          mainImage.sizes = thumbnail.getAttribute('data-image-sizes') || '100vw';
        } else {
          mainImage.removeAttribute('srcset');
        }
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
    const next = btn.classList.contains('qty-btn--plus')
      ? Math.min(10, current + 1)
      : Math.max(0, current - 1);
    if (next === current) return;
    input.value = next;
    submitCartChange(key, next);
  });

  form.addEventListener('change', (e) => {
    const input = e.target.closest('.qty-input');
    if (!input) return;
    const next = Math.min(10, Math.max(0, parseInt(input.value, 10) || 0));
    input.value = next;
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

          fireAddToCart(variantId, null, btn.closest('[data-product-title]') ? btn.closest('[data-product-title]').dataset.productTitle : '');
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

  // Re-render drawer whenever cart changes (qty +/-, remove, upsell add)
  window.addEventListener('cart:updated', refreshCartDrawer);

  // Fire InitiateCheckout pixel when checkout link clicked
  const checkoutBtn = document.querySelector('.cart-drawer__checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (typeof fbq === 'function') fbq('track', 'InitiateCheckout');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCartDrawer();
  });

  // Delegated handlers — buttons are added dynamically
  drawer.addEventListener('click', (e) => {
    // Close (dynamically-rendered empty-state button)
    if (e.target.closest('[data-close-drawer]')) {
      closeCartDrawer();
      return;
    }
    // Remove line
    const removeBtn = e.target.closest('.qty-btn--remove');
    if (removeBtn) {
      submitCartChange(removeBtn.dataset.key, 0);
      return;
    }
    // Qty +/-
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const input = drawer.querySelector(`.qty-input[data-key="${key}"]`);
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const next = btn.classList.contains('qty-btn--plus')
      ? Math.min(10, current + 1)
      : Math.max(0, current - 1);
    if (next === current) return;
    input.value = next;
    submitCartChange(key, next);
  });
}

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

      // Compute total savings across cart for footer display
      let totalSavings = 0;
      cart.items.forEach(it => {
        if (it.original_line_price && it.original_line_price > it.line_price) {
          totalSavings += (it.original_line_price - it.line_price);
        }
      });
      const savingsEl = document.getElementById('cart-drawer-savings');
      if (savingsEl) {
        if (totalSavings > 0) {
          savingsEl.hidden = false;
          savingsEl.querySelector('[data-savings-amount]').textContent = formatMoney(totalSavings);
        } else {
          savingsEl.hidden = true;
        }
      }

      // Rewrite checkout link with auto-discount code if configured
      const checkoutLink = document.querySelector('.cart-drawer__checkout');
      if (checkoutLink && window.__autoDiscountCode) {
        checkoutLink.setAttribute('href', `/discount/${encodeURIComponent(window.__autoDiscountCode)}?redirect=/checkout`);
      }

      // Render line items
      if (linesEl) {
        if (cart.item_count === 0) {
          linesEl.innerHTML = `
            <div class="cart-drawer__empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
                <path d="M3 6h18l-2 13H5L3 6z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/>
              </svg>
              <p>Your bag is quiet.</p>
              <button class="cart-drawer__empty-btn" data-close-drawer>Start your ritual →</button>
            </div>`;
        } else {
          linesEl.innerHTML = cart.items.map(item => {
            const hasCompare = item.original_line_price && item.original_line_price > item.line_price;
            const saved = hasCompare ? item.original_line_price - item.line_price : 0;
            const mapped = (window.__bundleImageMap && window.__bundleImageMap[item.variant_id]) || null;
            const imgSrc = mapped || item.image;
            return `
            <div class="cart-drawer__line">
              ${imgSrc
                ? `<img class="cart-drawer__line-img" src="${imgSrc}" alt="${item.product_title}" width="88" height="88" loading="lazy">`
                : '<div class="cart-drawer__line-img"></div>'
              }
              <div class="cart-drawer__line-body">
                <div class="cart-drawer__line-top">
                  <p class="cart-drawer__line-title">${item.product_title}</p>
                  <button type="button" class="cart-drawer__line-remove qty-btn--remove" data-key="${item.key}" aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                  </button>
                </div>
                ${item.variant_title && item.variant_title !== 'Default Title'
                  ? `<p class="cart-drawer__line-variant">${item.variant_title}</p>`
                  : ''
                }
                ${hasCompare ? `<span class="cart-drawer__line-savings">You save ${formatMoney(saved)}</span>` : ''}
                <div class="cart-drawer__line-row">
                  <div class="cart-drawer__line-qty">
                    <button type="button" class="qty-btn qty-btn--minus" data-key="${item.key}" aria-label="Decrease quantity">−</button>
                    <input type="text" class="qty-input" value="${item.quantity}" data-key="${item.key}" readonly aria-label="Quantity">
                    <button type="button" class="qty-btn qty-btn--plus" data-key="${item.key}" aria-label="Increase quantity">+</button>
                  </div>
                  <div class="cart-drawer__line-prices">
                    ${hasCompare ? `<span class="cart-drawer__line-price-compare">${formatMoney(item.original_line_price)}</span>` : ''}
                    <span class="cart-drawer__line-price">${formatMoney(item.line_price)}</span>
                  </div>
                </div>
              </div>
            </div>`;
          }).join('');
        }
      }
    })
    .catch(err => console.error('[Cart drawer] refresh failed:', err));
}

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
      .then(item => {
        setAtcState('success');
        fireAddToCart(item.variant_id, item.price, item.product_title);
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

/**
 * UGC Videos — autoplay on viewport, click play/pause, click unmute
 */
function initUgcVideos() {
  const cards = document.querySelectorAll('.ugc-card');
  if (!cards.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('[data-ugc-video]');
      if (!video) return;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  cards.forEach(card => {
    const video = card.querySelector('[data-ugc-video]');
    const playBtn = card.querySelector('.ugc-card__play');
    const muteBtn = card.querySelector('[data-ugc-mute]');
    if (!video) return;

    io.observe(card);

    const syncPlayUi = () => {
      if (!playBtn) return;
      playBtn.classList.toggle('is-playing', !video.paused);
    };
    video.addEventListener('play', syncPlayUi);
    video.addEventListener('pause', syncPlayUi);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (video.paused) video.play(); else video.pause();
      });
    }
    video.addEventListener('click', () => {
      if (video.paused) video.play(); else video.pause();
    });

    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.style.background = video.muted
          ? 'rgba(42, 32, 28, 0.55)'
          : 'rgba(139, 74, 58, 0.85)';
      });
    }
  });
}
