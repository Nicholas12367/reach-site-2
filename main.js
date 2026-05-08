/* ==========================================================================
   REACH SCREENS 2.0 — Premium Interactions
   Custom cursor, magnetic buttons, scroll reveals, counters,
   sticky-process, faq, tabs, contact form, hero word stagger.
   ========================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    splitHeroWords();
    initScrollProgress();
    initNav();
    initCursor();
    initMagnetic();
    initReveal();
    initCounters();
    initFaq();
    initTabs();
    initStickyProcess();
    initContactForm();
  }

  /* -------- Split hero h1 words for stagger animation -------- */
  function splitHeroWords() {
    document.querySelectorAll('[data-split]').forEach(el => {
      const lines = el.querySelectorAll('.line');
      const targets = lines.length ? lines : [el];
      let idx = 0;
      targets.forEach(line => {
        const words = line.textContent.trim().split(/\s+/);
        line.textContent = '';
        words.forEach(w => {
          const span = document.createElement('span');
          span.className = 'word';
          span.style.animationDelay = (0.18 + idx * 0.06) + 's';
          span.textContent = w + ' ';
          line.appendChild(span);
          idx++;
        });
      });
    });
  }

  /* -------- Scroll progress bar -------- */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      const pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* -------- Nav: scroll state, mobile toggle, active link -------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }

    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === here || (here === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* -------- Custom cursor (desktop, non-touch) -------- */
  function initCursor() {
    if (isTouch || prefersReduced) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    function lerp() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(lerp);
    }
    requestAnimationFrame(lerp);

    // Hover state on actionable elements
    const ctaSelector = 'a, button, [role="button"], .magnet, .gallery-card, .bento-card, .faq-q, .location-row';
    document.addEventListener('mouseover', e => {
      if (e.target.closest && e.target.closest(ctaSelector)) {
        document.body.classList.add('cursor-on-cta');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest && e.target.closest(ctaSelector)) {
        document.body.classList.remove('cursor-on-cta');
      }
    });
  }

  /* -------- Magnetic buttons -------- */
  function initMagnetic() {
    if (isTouch || prefersReduced) return;
    document.querySelectorAll('.magnet').forEach(el => {
      const strength = parseFloat(el.dataset.magnet) || 12;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* -------- Scroll reveal -------- */
  function initReveal() {
    const sels = ['.reveal', '.reveal-l', '.reveal-r', '.reveal-scale', '.stagger', '.process-step'];
    const els = document.querySelectorAll(sels.join(','));
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* -------- Counter animation -------- */
  function initCounters() {
    const nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1700;
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      function fmt(n) {
        if (target >= 1000) return Math.floor(n).toLocaleString();
        if (Number.isInteger(target)) return Math.floor(n).toString();
        const dec = (el.dataset.count.split('.')[1] || '').length || 1;
        return n.toFixed(dec);
      }
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const v = ease(t) * target;
        el.textContent = fmt(v) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target) + suffix;
      }
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(animate);
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    nodes.forEach(n => io.observe(n));
  }

  /* -------- FAQ accordion -------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if (!q || !a) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item.open').forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const oa = other.querySelector('.faq-a');
            if (oa) oa.style.maxHeight = '0px';
          }
        });
        if (isOpen) {
          item.classList.remove('open');
          a.style.maxHeight = '0px';
        } else {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  /* -------- Tabs (How It Works) -------- */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(group => {
      const btns = group.querySelectorAll('.tab-btn');
      const bg = group.querySelector('.tab-btn-bg');
      const panels = document.querySelectorAll('[data-tab-target]');

      function place(activeBtn) {
        if (!bg) return;
        const idx = Array.from(btns).indexOf(activeBtn);
        bg.style.transform = `translateX(${idx * 100}%)`;
        bg.style.width = (100 / btns.length) + '%';
      }

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          btns.forEach(b => b.classList.toggle('active', b === btn));
          panels.forEach(p => p.classList.toggle('active', p.dataset.tabTarget === target));
          place(btn);
          // Re-trigger reveals inside newly visible panel
          const activePanel = Array.from(panels).find(p => p.dataset.tabTarget === target);
          if (activePanel) {
            activePanel.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale, .stagger, .process-step')
              .forEach(el => el.classList.add('visible'));
          }
        });
      });

      const initial = group.querySelector('.tab-btn.active') || btns[0];
      if (initial) place(initial);
    });
  }

  /* -------- Sticky-scroll process: highlights step matching scroll position -------- */
  function initStickyProcess() {
    document.querySelectorAll('.sticky-process').forEach(root => {
      const steps = Array.from(root.querySelectorAll('.process-step'));
      const stuckArt = root.querySelector('[data-stuck-art]');
      if (!steps.length) return;
      const update = () => {
        const vh = window.innerHeight;
        let bestIdx = 0;
        let bestDist = Infinity;
        steps.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const dist = Math.abs(center - vh / 2);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        steps.forEach((s, i) => s.classList.toggle('active', i === bestIdx));
        if (stuckArt) {
          const imgs = stuckArt.querySelectorAll('img');
          imgs.forEach((img, i) => {
            img.style.opacity = (i === bestIdx) ? '1' : '0';
            img.style.position = 'absolute';
            img.style.inset = '0';
          });
        }
      };
      window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* -------- Contact form (mirrors v1 endpoint + locations picker) -------- */
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const inquiryHidden = form.querySelector('#inquiryType');
    const toggleBtns = form.querySelectorAll('.form-toggle-btn');
    const advertiseOnly = form.querySelectorAll('[data-advertise-only]');
    const hostOnly = form.querySelectorAll('[data-host-only]');
    const messageLabel = form.querySelector('[data-message-label]');
    const packageSelect = form.querySelector('#package');

    function applyMode(mode) {
      if (inquiryHidden) inquiryHidden.value = mode;
      toggleBtns.forEach(b => {
        const isActive = b.dataset.inquiry === mode;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
      advertiseOnly.forEach(el => { el.style.display = mode === 'advertise' ? '' : 'none'; });
      hostOnly.forEach(el => { el.style.display = mode === 'host' ? '' : 'none'; });
      if (messageLabel) {
        messageLabel.textContent = mode === 'host'
          ? 'Tell us about your space and customer foot traffic'
          : "What's your idea?";
      }
    }

    toggleBtns.forEach(btn => btn.addEventListener('click', () => applyMode(btn.dataset.inquiry)));

    const params = new URLSearchParams(location.search);
    const typeParam = (params.get('type') || '').toLowerCase();
    applyMode(typeParam === 'host' ? 'host' : 'advertise');

    // Locations picker
    const locToggle = form.querySelector('.form-locations-toggle');
    const locPanel = form.querySelector('.form-locations-panel');
    const locList = form.querySelector('.form-locations-list');
    const locSearch = form.querySelector('.form-locations-search');
    const locCounter = form.querySelector('.form-locations-counter');
    const locHidden = form.querySelector('#locations');

    if (locToggle && locPanel && locList && locHidden && Array.isArray(window.screenLocations)) {
      const selected = new Set();
      const initialLocs = (params.get('locations') || '').split(',').filter(Boolean);
      initialLocs.forEach(id => selected.add(String(id)));
      function updateCounter() {
        if (!locCounter) return;
        locCounter.textContent = selected.size > 0 ? `(${selected.size} selected)` : '(optional)';
      }
      function updateHidden() { locHidden.value = Array.from(selected).join(','); }
      function renderList(filter) {
        const f = (filter || '').toLowerCase().trim();
        const rows = window.screenLocations
          .filter(loc => !f || loc.name.toLowerCase().includes(f) || (loc.address || '').toLowerCase().includes(f))
          .map(loc => {
            const id = String(loc.id);
            const checked = selected.has(id) ? 'checked' : '';
            const screensBadge = (loc.screens && loc.screens > 1)
              ? `<span class="form-locations-row-screens">${loc.screens} screens</span>` : '';
            return `<label class="form-locations-row">
              <input type="checkbox" value="${id}" ${checked}>
              <span class="form-locations-row-body">
                <span class="form-locations-row-name">${escapeHtml(loc.name)}${screensBadge}</span>
                <span class="form-locations-row-addr">${escapeHtml(loc.address || '')}</span>
              </span>
            </label>`;
          }).join('');
        locList.innerHTML = rows || '<div class="form-locations-empty">No matches.</div>';
      }
      locToggle.addEventListener('click', () => {
        const expanded = locToggle.getAttribute('aria-expanded') === 'true';
        locToggle.setAttribute('aria-expanded', String(!expanded));
        if (expanded) locPanel.setAttribute('hidden', '');
        else { locPanel.removeAttribute('hidden'); if (locSearch) locSearch.focus(); }
      });
      locList.addEventListener('change', e => {
        const cb = e.target;
        if (!(cb instanceof HTMLInputElement) || cb.type !== 'checkbox') return;
        if (cb.checked) selected.add(cb.value);
        else selected.delete(cb.value);
        updateHidden();
        updateCounter();
      });
      if (locSearch) locSearch.addEventListener('input', () => renderList(locSearch.value));
      renderList('');
      updateHidden();
      updateCounter();
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>Sending…</span>'; }

      const payload = {
        _hp: form.querySelector('input[name="_hp"]')?.value || '',
        type: inquiryHidden?.value || 'advertise',
        name: form.querySelector('#name')?.value || '',
        business: form.querySelector('#business')?.value || '',
        email: form.querySelector('#email')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        package: packageSelect?.value || '',
        locations: form.querySelector('#locations')?.value || '',
        venue: form.querySelector('#venue')?.value || '',
        address: form.querySelector('#address')?.value || '',
        message: form.querySelector('#message')?.value || ''
      };

      const endpoint = form.dataset.endpoint || '/submit';
      let ok = false;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        ok = res.ok && data.ok === true;
      } catch (_) { ok = false; }

      if (ok) {
        form.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) success.classList.add('show');
      } else {
        if (btn) { btn.disabled = false; btn.innerHTML = orig; }
        const errBox = form.querySelector('[data-form-error]');
        if (errBox) {
          errBox.textContent = "Couldn't send your message. Please try again or email info@reachscreens.ca directly.";
          errBox.style.display = 'block';
        }
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
})();
