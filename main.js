/* ═══════════════════════════════════════════════════════════════
   DR. ARUN KUMAR — Shared UI Interactions
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── NAV: Replace brand with institute logo on all pages ───── */
  const brandEl = document.querySelector('.brand');
  if (brandEl) {
    const logoSpan = brandEl.querySelector('.logo');
    if (logoSpan) {
      const img = logoSpan.querySelector('img');
      if (img) img.alt = 'Advanced Institute of Hormonal and Sexual Health logo';
    }
    const textSpan = brandEl.querySelector('span:not(.logo)');
    if (textSpan) {
      textSpan.className = 'brand-text';
      textSpan.innerHTML = '<strong class="brand-name-top">Advanced Institute of</strong><small class="brand-name-sub">Hormonal &amp; Sexual Health</small>';
    }
  }

  /* ── NAV: Inject hamburger ─────────────────────────────────── */
  const navWrap = document.querySelector('.nav-wrap');
  const mainNav = document.querySelector('.main-nav');

  if (navWrap && mainNav) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'main-nav');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    mainNav.id = 'main-nav';

    /* Insert toggle between brand and nav */
    navWrap.appendChild(toggle);

    function openNav() {
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
    }
    function closeNav() {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    }
    function toggleNav() {
      document.body.classList.contains('nav-open') ? closeNav() : openNav();
    }

    toggle.addEventListener('click', toggleNav);

    /* Close on nav link tap */
    mainNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeNav)
    );

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!navWrap.contains(e.target)) closeNav();
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ── NAV: Scroll-aware shrink + shadow ─────────────────────── */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    function handleScroll() {
      topbar.classList.toggle('scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ── SCROLL ANIMATIONS ─────────────────────────────────────── */
  const ANIM_SELECTOR = [
    '.service',
    '.blog-card',
    '.feature',
    '.panel',
    '.stat',
    '.trust',
    '.media-card',
    '.keyword-box',
    '.article h2',
  ].join(',');

  if ('IntersectionObserver' in window) {
    const animObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            animObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(ANIM_SELECTOR).forEach(function (el) {
      /* Skip elements already visible at page load (above fold) */
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add('anim-fade', 'in-view');
      } else {
        el.classList.add('anim-fade');
        animObs.observe(el);
      }
    });
  } else {
    /* Fallback: show everything immediately */
    document.querySelectorAll(ANIM_SELECTOR).forEach(function (el) {
      el.classList.add('anim-fade', 'in-view');
    });
  }

  /* ── COUNTER ANIMATION ─────────────────────────────────────── */
  function animateCount(el) {
    const raw = el.getAttribute('data-count') || el.textContent;
    const hasPlus = raw.includes('+');
    const hasComma = raw.includes(',');
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (!num || isNaN(num)) return;

    const duration = 1600;
    const startTime = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeOutCubic(elapsed / duration);
      const current = Math.round(progress * num);
      el.textContent = (hasComma ? current.toLocaleString() : current) + (hasPlus ? '+' : '');
      if (elapsed < duration) requestAnimationFrame(step);
    }

    /* Store original suffix after digit */
    el.setAttribute('data-count', raw);
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    /* Target stat strong elements that contain numbers */
    document.querySelectorAll('.stat strong').forEach(function (el) {
      if (/\d/.test(el.textContent)) counterObs.observe(el);
    });
  }

  /* ── SMOOTH SCROLL for # anchors ──────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── HERO: Staggered text reveal on load ───────────────────── */
  const heroContent = document.querySelector('.hero-grid > div, .hero-grid > :first-child');
  if (heroContent) {
    const heroEls = heroContent.querySelectorAll('.eyebrow, h1, .lead, .actions, .trust-row');
    heroEls.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.transitionDelay = (i * 0.1) + 's';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /* ── TICKER: Pause on hover ────────────────────────────────── */
  document.querySelectorAll('.ticker-track').forEach(function (track) {
    track.addEventListener('mouseenter', function () {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', function () {
      track.style.animationPlayState = 'running';
    });
  });

  /* ── TOUCH: add cursor-pointer to cards ────────────────────── */
  document.querySelectorAll('.service, .blog-card, .trust, .stat').forEach(function (el) {
    el.style.cursor = 'default';
  });

})();

/* Google Ads: clinic WhatsApp contact clicks, without patient form data. */
(function () {
  'use strict';

  var TAG_ID = 'AW-622603961';
  var CONTACT_EVENT = 'AW-622603961/WpCCCMrn0IsdELnd8KgC';
  var host = window.location.hostname.toLowerCase();
  if (host !== 'drarunkumar.in' && host !== 'www.drarunkumar.in') return;
  if (window.__drArunContactTrackingInstalled) return;
  window.__drArunContactTrackingInstalled = true;

  // Keep ad attribution identifiers, but never forward arbitrary query strings.
  var page = new URL(window.location.href);
  var measurementPage = new URL(page.origin + page.pathname);
  ['gclid', 'gbraid', 'wbraid'].forEach(function (key) {
    var value = page.searchParams.get(key);
    if (value) measurementPage.searchParams.set(key, value);
  });
  var measurementReferrer = '';
  if (document.referrer) {
    try {
      var referrer = new URL(document.referrer);
      measurementReferrer = referrer.origin + referrer.pathname;
    } catch (_) {}
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  // Disable remarketing before initializing the Google tag.
  window.gtag('set', 'allow_ad_personalization_signals', false);
  window.gtag('js', new Date());
  window.gtag('config', TAG_ID, {
    send_page_view: false,
    allow_ad_personalization_signals: false,
    page_location: measurementPage.href,
    page_referrer: measurementReferrer,
    page_title: 'Dr Arun Kumar | Clinic contact'
  });

  if (!document.querySelector('script[src^="https://www.googletagmanager.com/gtag/js"]')) {
    var loader = document.createElement('script');
    loader.async = true;
    loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG_ID;
    document.head.appendChild(loader);
  }

  // Called only after the existing assessment/appointment validation succeeds.
  // Takes no form fields, questionnaire answers, or WhatsApp message text.
  window.trackArunWhatsAppContact = function () {
    try {
      window.gtag('event', 'conversion', {
        send_to: CONTACT_EVENT,
        value: 0,
        currency: 'INR',
        allow_ad_personalization_signals: false,
        page_location: measurementPage.href,
        page_referrer: measurementReferrer,
        page_title: 'Dr Arun Kumar | Clinic contact'
      });
    } catch (_) {
      // A blocked or failed measurement tag must never prevent contacting the clinic.
    }
  };

  document.addEventListener('click', function (event) {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    var link = event.target.closest('a[href]');
    if (!link) return;
    var destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch (_) {
      return;
    }
    if (destination.protocol !== 'https:' ||
        destination.hostname !== 'wa.me' ||
        destination.pathname !== '/919927005959') return;

    window.trackArunWhatsAppContact();
    // Preserve the original link navigation and new-tab behavior.
  }, true);
})();
