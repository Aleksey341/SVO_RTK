/* ============================================================
   ПОДДЕРЖКА ГЕРОЕВ — main.js v2
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initAccordion();
  initTabs();
  initSmoothScroll();
  initScrollAnimation();
  initForms();
  initActiveNav();

  /* --- Улучшения v2 --- */
  initBreadcrumbs();        // 3. Хлебные крошки
  initStickyActionBar();    // 1. Sticky Action Bar
  initBackToTop();          // 11. Кнопка наверх
  initScrollProgress();     // 2. Прогресс на poryadok.html
  initCopyPhone();          // 6. Копировать номер
  initAbbreviationTooltips(); // 10. Тултипы аббревиатур
  initCounters();           // 13. Анимированные счётчики
  initAudienceFilter();     // 4. Виджет «Для кого?»
  initHeroFaq();            // 7. FAQ в hero
  initActualityBadges();    // 5. Бейдж актуальности
});

/* ----------------------------------------------------------
   Burger menu
   ---------------------------------------------------------- */
function initBurger() {
  const burger  = document.querySelector('.burger');
  const overlay = document.querySelector('.nav-overlay');
  if (!burger || !overlay) return;

  function toggleMenu(open) {
    burger.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => toggleMenu(!overlay.classList.contains('open')));

  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      toggleMenu(false);
      burger.focus();
    }
  });
}

/* ----------------------------------------------------------
   Accordion
   ---------------------------------------------------------- */
function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const body = trigger.closest('.accordion-item').querySelector('.accordion-body');
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        body.classList.remove('open');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        body.classList.add('open');
      }
    });
  });
}

/* ----------------------------------------------------------
   Tabs (keyboard-accessible)
   ---------------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('.tabs-container').forEach(container => {
    const buttons = Array.from(container.querySelectorAll('.tab-btn'));
    const panels  = Array.from(container.querySelectorAll('.tab-panel'));

    function activateTab(index) {
      buttons.forEach((btn, i) => {
        const active = i === index;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
        panel.hidden = i !== index;
      });
    }

    buttons.forEach((btn, i) => {
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => activateTab(i));
      btn.addEventListener('keydown', e => {
        const total = buttons.length;
        if (e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % total; activateTab(n); buttons[n].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); const n = (i - 1 + total) % total; activateTab(n); buttons[n].focus(); }
        if (e.key === 'Home')       { e.preventDefault(); activateTab(0); buttons[0].focus(); }
        if (e.key === 'End')        { e.preventDefault(); activateTab(total - 1); buttons[total - 1].focus(); }
      });
    });

    const tabList = container.querySelector('.tabs-header');
    if (tabList) tabList.setAttribute('role', 'tablist');
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      if (buttons[i]) panel.setAttribute('aria-labelledby', buttons[i].id || `tab-${i}`);
    });

    activateTab(0);
  });
}

/* ----------------------------------------------------------
   Smooth Scroll
   ---------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight ?? 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 16, behavior: 'smooth' });
    });
  });
}

/* ----------------------------------------------------------
   Scroll Animation (IntersectionObserver)
   ---------------------------------------------------------- */
function initScrollAnimation() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
}

/* ----------------------------------------------------------
   Form Validation + Loading State (9)
   ---------------------------------------------------------- */
function initForms() {
  document.querySelectorAll('.validated-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

      form.querySelectorAll('[required]').forEach(field => {
        const group = field.closest('.form-group');
        if (!group) return;
        const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
        if (empty) { group.classList.add('has-error'); field.classList.add('error'); valid = false; }
        else field.classList.remove('error');
      });

      form.querySelectorAll('input[type="email"]').forEach(field => {
        if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.closest('.form-group')?.classList.add('has-error');
          field.classList.add('error');
          const errEl = field.closest('.form-group')?.querySelector('.form-error');
          if (errEl) errEl.textContent = 'Введите корректный email';
          valid = false;
        }
      });

      if (!valid) { form.querySelector('.form-group.has-error [required]')?.focus(); return; }

      /* --- Спиннер (улучшение #9) --- */
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        const originalHTML = submitBtn.innerHTML;
        submitBtn.classList.add('btn-loading');
        submitBtn.innerHTML = submitBtn.textContent.trim() + '<span class="btn-spinner"></span>';
        setTimeout(() => {
          submitBtn.classList.remove('btn-loading');
          submitBtn.innerHTML = originalHTML;
          showFormSuccess(form);
        }, 1200);
      } else {
        showFormSuccess(form);
      }
    });

    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        field.closest('.form-group')?.classList.remove('has-error');
      });
    });
  });
}

function showFormSuccess(form) {
  const wrapper  = form.closest('.form-wrapper');
  const successEl = wrapper?.querySelector('.form-success');
  if (successEl) {
    form.style.display = 'none';
    successEl.classList.add('show');
  } else {
    const msg = document.createElement('div');
    msg.className = 'form-success show';
    msg.innerHTML = `<div class="form-success-icon"><i class="ph ph-check-circle" aria-hidden="true"></i></div><h3>Спасибо! Сообщение отправлено.</h3><p>Мы свяжемся с вами в ближайшее время.</p>`;
    form.replaceWith(msg);
  }
}

/* ----------------------------------------------------------
   Active Nav (12: золотое подчёркивание)
   ---------------------------------------------------------- */
function initActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .nav-overlay a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.split('/').pop().split('#')[0] === page || (page === '' && href.includes('index.html'))) {
      a.classList.add('active');
    }
  });
}

/* ----------------------------------------------------------
   3. Хлебные крошки
   ---------------------------------------------------------- */
function initBreadcrumbs() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') return;

  const map = {
    'trudoustrojstvo.html': 'Трудоустройство',
    'kariera.html':         'Карьера и обучение',
    'lgoty-kompanii.html':  'Льготы компании',
    'poryadok.html':        'Порядок получения',
    'garantii.html':        'Государственные гарантии',
    'novosti.html':         'Новости и ссылки',
    'kontakty.html':        'Контакты',
  };

  const title = map[page];
  if (!title) return;

  const header = document.querySelector('.site-header');
  if (!header) return;

  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  nav.setAttribute('aria-label', 'Путь по сайту');
  nav.innerHTML = `
    <div class="container">
      <ol class="breadcrumbs-list">
        <li><a href="index.html"><i class="ph ph-house-simple" aria-hidden="true"></i> Главная</a></li>
        <li><span>${title}</span></li>
      </ol>
    </div>`;

  /* Вставить после хедера, но до .nav-overlay */
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) overlay.insertAdjacentElement('afterend', nav);
  else header.insertAdjacentElement('afterend', nav);
}

/* ----------------------------------------------------------
   1. Sticky Action Bar (мобильный)
   ---------------------------------------------------------- */
function initStickyActionBar() {
  const bar = document.createElement('div');
  bar.className = 'sticky-action-bar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Быстрые действия');
  bar.innerHTML = `
    <div class="sticky-action-bar-inner">
      <a href="tel:88000000000">
        <span class="bar-icon"><i class="ph ph-phone" aria-hidden="true"></i></span>
        <span>Позвонить</span>
      </a>
      <a href="kontakty.html">
        <span class="bar-icon"><i class="ph ph-envelope-simple" aria-hidden="true"></i></span>
        <span>Написать</span>
      </a>
      <a href="garantii.html">
        <span class="bar-icon"><i class="ph ph-star" aria-hidden="true"></i></span>
        <span>Льготы</span>
      </a>
    </div>`;
  document.body.appendChild(bar);
  document.body.classList.add('has-sticky-bar');
}

/* ----------------------------------------------------------
   11. Кнопка «Наверх»
   ---------------------------------------------------------- */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Прокрутить наверх');
  btn.setAttribute('title', 'Наверх');
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ----------------------------------------------------------
   2. Прогресс-полоса (только poryadok.html)
   ---------------------------------------------------------- */
function initScrollProgress() {
  const steps = document.querySelectorAll('.timeline-v-step');
  if (!steps.length) return;

  const bar = document.createElement('div');
  bar.className = 'scroll-progress-bar';
  bar.innerHTML = '<div class="scroll-progress-fill" id="spfill"></div>';
  document.body.prepend(bar);

  const label = document.createElement('div');
  label.className = 'scroll-progress-label';
  label.id = 'splabel';
  document.body.prepend(label);

  const fill  = document.getElementById('spfill');
  const lbl   = document.getElementById('splabel');
  const total = steps.length;

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH > 0) fill.style.width = (window.scrollY / docH * 100) + '%';

    let current = 0;
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top < window.innerHeight * 0.55) current = i + 1;
    });

    if (current > 0 && window.scrollY > 150) {
      lbl.textContent = `Шаг ${current} из ${total}`;
      lbl.classList.add('visible');
    } else {
      lbl.classList.remove('visible');
    }
  }, { passive: true });
}

/* ----------------------------------------------------------
   6. Кнопка копирования номера телефона
   ---------------------------------------------------------- */
function initCopyPhone() {
  const selectors = ['.hotline-number', '.hotline-number-big', '.contact-card-value'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!/[0-9]/.test(el.textContent)) return;
      /* не дублировать */
      if (el.parentElement?.classList.contains('copy-phone-wrapper')) return;

      const wrapper = document.createElement('span');
      wrapper.className = 'copy-phone-wrapper';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);

      const btn = document.createElement('button');
      btn.className = 'copy-phone-btn';
      btn.innerHTML = '⎘';
      btn.setAttribute('title', 'Скопировать номер');
      btn.setAttribute('aria-label', 'Скопировать номер телефона');
      wrapper.appendChild(btn);

      btn.addEventListener('click', async () => {
        const num = el.textContent.replace(/[^\d+]/g, '');
        try { await navigator.clipboard.writeText(num); }
        catch {
          const ta = Object.assign(document.createElement('textarea'), { value: num });
          Object.assign(ta.style, { position: 'fixed', opacity: '0' });
          document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
        }
        btn.innerHTML = '✓';
        btn.classList.add('copied');
        btn.title = 'Скопировано!';
        setTimeout(() => { btn.innerHTML = '⎘'; btn.classList.remove('copied'); btn.title = 'Скопировать номер'; }, 2200);
      });
    });
  });
}

/* ----------------------------------------------------------
   10. Тултипы для аббревиатур
   ---------------------------------------------------------- */
function initAbbreviationTooltips() {
  const abbrs = {
    'СВО':   'Специальная военная операция',
    'МФЦ':   'Многофункциональный центр государственных услуг',
    'ДМС':   'Добровольное медицинское страхование',
    'СНИЛС': 'Страховой номер индивидуального лицевого счёта',
    'ОМС':   'Обязательное медицинское страхование',
    'ФНС':   'Федеральная налоговая служба',
    'МСЭ':   'Медико-социальная экспертиза',
    'ЕГРН':  'Единый государственный реестр недвижимости',
    'НДФЛ':  'Налог на доходы физических лиц',
    'СКУД':  'Система контроля и управления доступом',
    'HR':    'Отдел по работе с персоналом (Human Resources)',
    'CTA':   '',
  };

  const skipTags = new Set(['SCRIPT','STYLE','A','BUTTON','INPUT','TEXTAREA','SELECT','LABEL']);
  const main = document.getElementById('main') || document.body;

  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);

  nodes.forEach(node => {
    if (!node.nodeValue.trim()) return;
    const parent = node.parentElement;
    if (!parent || skipTags.has(parent.tagName)) return;
    if (parent.classList.contains('abbr-tooltip')) return;

    let html = node.nodeValue;
    let changed = false;

    Object.entries(abbrs).forEach(([abbr, full]) => {
      if (!full) return; // пропустить пустые
      const re = new RegExp(`\\b${abbr}\\b`, 'g');
      if (re.test(html)) {
        changed = true;
        html = html.replace(new RegExp(`\\b${abbr}\\b`, 'g'),
          `<span class="abbr-tooltip" data-abbr="${full}" tabindex="0" role="term">${abbr}</span>`);
      }
    });

    if (changed) {
      const span = document.createElement('span');
      span.innerHTML = html;
      parent.replaceChild(span, node);
    }
  });
}

/* ----------------------------------------------------------
   13. Анимированные счётчики
   ---------------------------------------------------------- */
function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const raw    = el.getAttribute('data-counter');
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const prefix = el.getAttribute('data-counter-prefix') || '';
      const end    = parseFloat(raw);

      if (isNaN(end)) {
        /* Спецзначение (24/7, ≤24ч) — просто мигание */
        el.style.transition = 'opacity 0.4s';
        el.style.opacity = '0';
        setTimeout(() => (el.style.opacity = '1'), 80);
        obs.unobserve(el); return;
      }

      const duration = 1500;
      const frameDur = 16;
      const frames   = Math.round(duration / frameDur);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / frames;
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const val = end * eased;
        el.textContent = prefix + (Number.isInteger(end) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (frame >= frames) {
          el.textContent = prefix + end + suffix;
          clearInterval(timer);
        }
      }, frameDur);

      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  els.forEach(el => obs.observe(el));
}

/* ----------------------------------------------------------
   4. Виджет «Для кого?»
   ---------------------------------------------------------- */
function initAudienceFilter() {
  const widget = document.getElementById('audience-filter');
  if (!widget) return;

  const recs = {
    participant: {
      label: '<i class="ph ph-sparkle" aria-hidden="true"></i> Рекомендуем для участника СВО:',
      links: [
        { href: 'garantii.html',       icon: '<i class="ph ph-star" aria-hidden="true"></i>',           text: 'Государственные гарантии' },
        { href: 'lgoty-kompanii.html', icon: '<i class="ph ph-shield" aria-hidden="true"></i>',         text: 'Льготы компании' },
        { href: 'poryadok.html',       icon: '<i class="ph ph-clipboard-text" aria-hidden="true"></i>', text: 'Как оформить льготы' },
      ],
    },
    family: {
      label: '<i class="ph ph-sparkle" aria-hidden="true"></i> Рекомендуем для семьи участника:',
      links: [
        { href: 'lgoty-kompanii.html', icon: '<i class="ph ph-users-three" aria-hidden="true"></i>', text: 'Льготы для семей' },
        { href: 'garantii.html',       icon: '<i class="ph ph-coins" aria-hidden="true"></i>',       text: 'Денежные выплаты' },
        { href: 'kontakty.html',       icon: '<i class="ph ph-phone" aria-hidden="true"></i>',       text: 'Получить помощь' },
      ],
    },
    employer: {
      label: '<i class="ph ph-sparkle" aria-hidden="true"></i> Рекомендуем для работодателя:',
      links: [
        { href: 'trudoustrojstvo.html', icon: '<i class="ph ph-briefcase" aria-hidden="true"></i>',     text: 'Трудоустройство ветеранов' },
        { href: 'lgoty-kompanii.html',  icon: '<i class="ph ph-shield" aria-hidden="true"></i>',        text: 'Корпоративные льготы' },
        { href: 'kariera.html',         icon: '<i class="ph ph-graduation-cap" aria-hidden="true"></i>', text: 'Программы обучения' },
      ],
    },
  };

  const result  = widget.querySelector('.audience-result');
  const buttons = widget.querySelectorAll('.audience-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const rec = recs[btn.dataset.audience];
      if (!rec) return;

      result.innerHTML = `
        <h4>${rec.label}</h4>
        <div class="audience-result-links">
          ${rec.links.map(l => `<a href="${l.href}">${l.icon} ${l.text}</a>`).join('')}
        </div>`;
      result.classList.add('show');
    });
  });
}

/* ----------------------------------------------------------
   7. FAQ в блоке hero
   ---------------------------------------------------------- */
function initHeroFaq() {
  document.querySelectorAll('.hero-faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item   = trigger.closest('.hero-faq-item');
      const body   = item.querySelector('.hero-faq-body');
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      /* Закрыть остальные */
      document.querySelectorAll('.hero-faq-trigger[aria-expanded="true"]').forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.closest('.hero-faq-item').querySelector('.hero-faq-body').classList.remove('open');
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      body.classList.toggle('open', !isOpen);
    });
  });
}

/* ----------------------------------------------------------
   5. Бейджи актуальности (garantii.html)
   ---------------------------------------------------------- */
function initActualityBadges() {
  const accordion = document.getElementById('garantii-accordion');
  if (!accordion) return;

  const now   = new Date();
  const month = now.toLocaleString('ru-RU', { month: 'long' });
  const year  = now.getFullYear();
  const text  = `✓ ${month} ${year}`;

  accordion.querySelectorAll('.accordion-trigger > span:first-child').forEach(span => {
    const badge = document.createElement('span');
    badge.className = 'actuality-badge';
    badge.textContent = text;
    span.appendChild(badge);
  });
}
