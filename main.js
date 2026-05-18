// ─── INTRO SCREEN ────────────────────────────────────────────
(function initIntro() {
  const introScreen = document.getElementById('introScreen');
  const flashlight = document.getElementById('introFlashlight');
  const adventureBtn = document.getElementById('adventureBtn');
  const introContent = document.getElementById('introContent');
  const siteWrapper = document.getElementById('siteWrapper');
  const particlesWrap = document.getElementById('introParticles');

  if (!introScreen) return;

  // Flashlight follows cursor
  document.addEventListener('mousemove', (e) => {
    flashlight.style.background = `radial-gradient(
      circle 200px at ${e.clientX}px ${e.clientY}px,
      rgba(255,255,255,0.07) 0%,
      rgba(196,192,255,0.05) 20%,
      rgba(124,114,255,0.025) 45%,
      transparent 70%
    )`;
  }, { passive: true });

  // Ambient floating particles
  const COLORS = ['rgba(124,114,255,', 'rgba(78,205,196,', 'rgba(189,0,255,', 'rgba(255,255,255,'];
  function spawnParticle() {
    if (!particlesWrap) return;
    const p = document.createElement('div');
    p.className = 'intro-particle';
    const size = Math.random() * 5 + 1;
    const dur = Math.random() * 10 + 8;
    const delay = Math.random() * 5;
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    const opacity = (Math.random() * 0.25 + 0.05).toFixed(2);
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:-${size}px;
      background:${col}${opacity});
      animation-duration:${dur}s;
      animation-delay:${delay}s;
    `;
    particlesWrap.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000);
  }
  for (let i = 0; i < 30; i++) spawnParticle();
  const particleInterval = setInterval(spawnParticle, 500);

  // Entrance animation
  anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: '.intro-corner', opacity: [0, 0.25], scale: [0.8, 1], duration: 800, delay: anime.stagger(80) })
    .add({ targets: '.intro-tag-line1, .intro-tag-line2', opacity: [0, 1], translateY: [12, 0], duration: 600, delay: anime.stagger(100) }, '-=400')
    .add({ targets: '#introName', opacity: [0, 1], translateY: [30, 0], scale: [0.92, 1], duration: 900, easing: 'easeOutBack' }, '-=300')
    .add({ targets: '#introRole', opacity: [0, 1], translateY: [16, 0], duration: 600 }, '-=500')
    .add({
      targets: '#adventureBtn',
      opacity: [0, 1], translateY: [20, 0], scale: [0.9, 1],
      duration: 700, easing: 'easeOutBack',
      complete: () => {
        adventureBtn.classList.add('ready');
        introContent.style.pointerEvents = 'auto';
      },
    }, '-=300')
    .add({ targets: '#introHint', opacity: [0, 0.5], duration: 800 }, '-=100');

  // Button hover
  adventureBtn.addEventListener('mouseenter', () => {
    anime({ targets: adventureBtn, scale: [1, 1.04], duration: 300, easing: 'easeOutExpo' });
  });
  adventureBtn.addEventListener('mouseleave', () => {
    anime({ targets: adventureBtn, scale: [1.04, 1], duration: 400, easing: 'easeOutExpo' });
  });

  // Adventure click → loading screen + curtain wipe reveal
  adventureBtn.addEventListener('click', () => {
    adventureBtn.classList.remove('ready');
    clearInterval(particleInterval);

    const loadingEl = document.getElementById('introLoading');
    const loadingContent = document.getElementById('loadingContent');
    const monogram = document.getElementById('loadingMonogram');
    const barFill = document.getElementById('loaderBarFill');
    const barGlow = document.getElementById('loaderBarGlow');
    const statusEl = document.getElementById('loaderStatus');
    const percentEl = document.getElementById('loaderPercent');
    const curtainTop = document.getElementById('curtainTop');
    const curtainBot = document.getElementById('curtainBottom');

    const statusMessages = [
      'Initializing portfolio...',
      'Loading components...',
      'Compiling skills...',
      'Rendering projects...',
      'Polishing UI...',
      'Almost ready...',
      'Launching...',
    ];

    anime.timeline({ easing: 'easeInOutExpo' })
      // Fade out btn + intro text
      .add({ targets: adventureBtn, scale: [1, 1.12], opacity: [1, 0], duration: 280 })
      .add({
        targets: ['#introTagline', '#introName', '#introRole'],
        opacity: [1, 0], translateY: [0, -24], delay: anime.stagger(40), duration: 280,
        begin: () => { loadingEl.style.display = 'block'; },
      }, '-=150')
      .add({
        targets: '#introScreen', opacity: [1, 0], duration: 250, easing: 'easeInQuad',
        complete: () => { introScreen.style.display = 'none'; },
      }, '-=100')
      // Loading content appears
      .add({ targets: loadingContent, opacity: [0, 1], duration: 300, easing: 'easeOutExpo' }, '-=50')
      .add({ targets: monogram, opacity: [0, 1], scale: [0.7, 1], duration: 400, easing: 'easeOutBack' }, '-=200')
      // Progress bar fills
      .add({
        targets: {}, duration: 1400,
        begin: () => {
          const start = performance.now();
          const total = 1400;
          let msgIdx = 0;
          statusEl.textContent = statusMessages[0];
          const tick = (now) => {
            const pct = Math.min((now - start) / total, 1);
            const pct100 = Math.round(pct * 100);
            barFill.style.width = pct100 + '%';
            barGlow.style.left = Math.max(0, pct100 - 2) + '%';
            percentEl.textContent = pct100 + '%';
            const idx = Math.floor(pct * (statusMessages.length - 1));
            if (idx !== msgIdx) {
              msgIdx = idx;
              statusEl.style.opacity = '0';
              setTimeout(() => { statusEl.textContent = statusMessages[msgIdx]; statusEl.style.opacity = '1'; }, 80);
            }
            if (pct < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
      }, '+=50')
      // Monogram pulse on complete
      .add({ targets: monogram, scale: [1, 1.08, 1], duration: 300, easing: 'easeInOutSine' })
      // Loading content out
      .add({ targets: loadingContent, opacity: [1, 0], translateY: [0, -10], duration: 250, easing: 'easeInQuad' }, '+=100')
      // Curtain split-wipe reveal
      .add({
        targets: curtainTop, scaleY: [1, 0], duration: 600, easing: 'easeInOutExpo',
        begin: () => {
          siteWrapper.classList.add('visible');
          anime({ targets: '#siteWrapper', opacity: [0, 1], duration: 600, easing: 'easeOutExpo' });
          triggerHeroEntrance();
        },
      }, '+=50')
      .add({
        targets: curtainBot, scaleY: [1, 0], duration: 600, easing: 'easeInOutExpo',
        complete: () => { loadingEl.style.display = 'none'; document.body.style.overflow = ''; },
      }, '-=600');
  });

  document.body.style.overflow = 'hidden';
})();


// ─── HERO ENTRANCE ───────────────────────────────────────────
function triggerHeroEntrance() {
  if (!document.querySelector('.hero-left')) return;
  if (typeof window.initSiteFlashlight === 'function') window.initSiteFlashlight();
  anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: '.available-badge', opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 100 })
    .add({ targets: '.hero-hi', opacity: [0, 1], translateX: [-30, 0], duration: 500 }, '-=200')
    .add({ targets: '.hero-name', opacity: [0, 1], translateY: [40, 0], scale: [0.92, 1], duration: 700 }, '-=200')
    .add({ targets: '.hero-role', opacity: [0, 1], translateX: [-20, 0], duration: 500 }, '-=300')
    .add({ targets: '.hero-sub', opacity: [0, 1], translateY: [20, 0], duration: 500 }, '-=200')
    .add({ targets: '.hero-actions .btn', opacity: [0, 1], translateY: [16, 0], delay: anime.stagger(100), duration: 400 }, '-=200')
    .add({ targets: '.hero-stats .stat, .hero-stats .stat-divider', opacity: [0, 1], translateY: [12, 0], delay: anime.stagger(80), duration: 400 }, '-=200')
    .add({ targets: '.code-window', opacity: [0, 1], translateX: [50, 0], scale: [0.95, 1], duration: 800, easing: 'easeOutBack' }, '-=900');
}


// ─── MAIN SITE ───────────────────────────────────────────────
(function () {
  'use strict';

  // Site flashlight – smooth lerp vignette following cursor
  const siteFlashlight = document.getElementById('siteFlashlight');
  let flX = window.innerWidth / 2, flY = window.innerHeight / 2;
  let curX = flX, curY = flY;
  let flashlightActive = false, rafId = null;

  function lerpFlashlight() {
    curX += (flX - curX) * 0.08;
    curY += (flY - curY) * 0.08;
    siteFlashlight.style.background = `radial-gradient(
      circle 380px at ${curX}px ${curY}px,
      transparent 0%, transparent 35%,
      rgba(8,8,14,0.14) 60%, rgba(8,8,14,0.42) 100%
    )`;
    rafId = requestAnimationFrame(lerpFlashlight);
  }

  document.addEventListener('mousemove', (e) => { flX = e.clientX; flY = e.clientY; }, { passive: true });

  window.initSiteFlashlight = function () {
    if (flashlightActive) return;
    flashlightActive = true;
    siteFlashlight.classList.add('active');
    if (!rafId) lerpFlashlight();
  };

  // Navbar + scroll progress
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const scrollBar = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('show', scrolled);
    if (scrollBar) {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollBar.style.width = ((window.scrollY / h) * 100) + '%';
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile nav
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Active nav highlight based on scroll position
  const activeStyle = document.createElement('style');
  activeStyle.textContent = '.nav-links a.active-nav{color:var(--on-surface)!important}.nav-links a.active-nav::after{width:100%!important}';
  document.head.appendChild(activeStyle);

  const navItems = document.querySelectorAll('.nav-links a');
  const navTargets = ['about', 'skills', 'experience', 'projects', 'contact'];

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    let active = 'about';
    navTargets.forEach(id => {
      const el = document.getElementById(id);
      if (el && scrollY >= el.getBoundingClientRect().top + scrollY - vh * 0.4) active = id;
    });
    navItems.forEach(link => link.classList.toggle('active-nav', link.getAttribute('href') === `#${active}`));
  }
  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // Stats counter – animate once on first intersect
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      statsObserver.unobserve(entry.target);
      const stat1 = document.querySelector('.hero-stats .stat:nth-child(1) .stat-num');
      const stat2 = document.querySelector('.hero-stats .stat:nth-child(3) .stat-num');
      if (stat1) { const o = { v: 0 }; anime({ targets: o, v: 4, duration: 1200, easing: 'easeOutExpo', update() { stat1.textContent = Math.round(o.v) + '+'; } }); }
      if (stat2) { const o = { v: 0 }; anime({ targets: o, v: 20, duration: 1400, easing: 'easeOutExpo', update() { stat2.textContent = Math.round(o.v) + '+'; } }); }
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // Scroll-triggered animations
  const scrollAnim = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      scrollAnim.unobserve(entry.target);
      const el = entry.target;

      if (el.classList.contains('stack-group')) {
        const idx = Array.from(el.parentElement.children).indexOf(el);
        anime({ targets: el, opacity: [0, 1], translateY: [30, 0], scale: [0.97, 1], duration: 600, delay: idx * 120, easing: 'easeOutBack' });
        anime({ targets: el.querySelectorAll('.stack-badge'), opacity: [0, 1], translateY: [10, 0], scale: [0.9, 1], delay: anime.stagger(50, { start: idx * 120 + 200 }), duration: 350, easing: 'easeOutExpo' });
      } else if (el.classList.contains('project-card')) {
        const idx = Array.from(el.parentElement.children).indexOf(el);
        anime({ targets: el, opacity: [0, 1], translateY: [40, 0], scale: [0.96, 1], duration: 650, delay: idx * 100, easing: 'easeOutBack', complete: () => { el.style.transform = 'none'; } });
      } else if (el.hasAttribute('data-aos')) {
        const idx = Array.from(el.parentElement.children).indexOf(el);
        anime({ targets: el, opacity: [0, 1], translateY: [30, 0], duration: 700, delay: idx * 150, easing: 'easeOutExpo' });
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

  document.querySelectorAll('.stack-group, .project-card, [data-aos]').forEach(el => {
    el.style.opacity = '0';
    scrollAnim.observe(el);
  });

  // Section title letter stagger
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      titleObserver.unobserve(entry.target);
      entry.target.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
        const chars = node.textContent.split('').map(ch => {
          const sp = document.createElement('span');
          sp.textContent = ch;
          sp.style.cssText = 'display:inline-block;opacity:0;transform:translateY(20px)';
          return sp;
        });
        node.replaceWith(...chars);
        anime({ targets: chars, opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(30), duration: 400, easing: 'easeOutExpo' });
      });
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));

  // Typing effect on hero role
  const heroRole = document.querySelector('.hero-role');
  if (heroRole) {
    const words = ['Frontend Developer', 'UI Craftsman'];
    let wIdx = 0, cIdx = 0, deleting = false;
    function type() {
      const word = words[wIdx];
      heroRole.textContent = deleting ? word.substring(0, cIdx - 1) : word.substring(0, cIdx + 1);
      deleting ? cIdx-- : cIdx++;
      if (!deleting && cIdx === word.length) { deleting = true; return setTimeout(type, 1800); }
      if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; return setTimeout(type, 400); }
      setTimeout(type, deleting ? 55 : 85);
    }
    setTimeout(type, 2000);
  }

  // Floating code symbols parallax
  const floatCodes = document.querySelectorAll('.float-code');
  let ticking = false;
  window.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      floatCodes.forEach((el, i) => { el.style.transform = `translate(${dx * (i % 3 + 1) * 8}px, ${dy * (i % 3 + 1) * 8}px)`; });
      ticking = false;
    });
  }, { passive: true });

  // 3D card tilt on hover
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8;
      const ry = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
      card.style.zIndex = '10';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
      card.style.zIndex = '1';
    });
  });

  // Contact form
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      const btn = form.querySelector('button[type="submit"]');
      const originalBtnText = btn.textContent;
      const endpoint = 'https://formspree.io/f/mgodqzyb';

      btn.textContent = 'Sending...';
      btn.disabled = true;
      formSuccess.classList.remove('show');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: `Portfolio contact from ${name || 'Visitor'}`,
          }),
        });

        if (!response.ok) throw new Error('Form submission failed');

        form.reset();
        formSuccess.textContent = "Message sent! I'll get back to you soon.";
        formSuccess.classList.add('show');
        anime({ targets: formSuccess, opacity: [0, 1], translateY: [-8, 0], duration: 400, easing: 'easeOutExpo' });
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
      } catch (error) {
        formSuccess.textContent = 'Message could not be sent. Please email me directly.';
        formSuccess.classList.add('show');
      } finally {
        btn.textContent = originalBtnText;
        btn.disabled = false;
      }
    });
  }

  // Project screenshot lightbox
  const lightbox = document.getElementById('projectLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const shotTriggers = document.querySelectorAll('[data-lightbox-src]');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.alt = '';
    }
  }

  shotTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      const src = trigger.getAttribute('data-lightbox-src');
      const title = trigger.getAttribute('data-lightbox-title') || 'Project screenshot';
      lightboxImg.src = src;
      lightboxImg.alt = title;
      if (lightboxTitle) lightboxTitle.textContent = title;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('[data-lightbox-close]').forEach(btn => {
    btn.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
  });
})();
