(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro loader: never trap the user if video metadata/playback is delayed.
  const loader = $('.ora-loader');
  const loaderVideo = $('.loader-video');
  let loaderClosed = false;
  const closeLoader = () => {
    if (loaderClosed || !loader) return;
    loaderClosed = true;
    loader.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
  };
  if (loader) {
    loaderVideo?.addEventListener('ended', closeLoader, { once: true });
    loaderVideo?.addEventListener('error', closeLoader, { once: true });
    window.setTimeout(closeLoader, 4200);
  }

  // Mobile navigation.
  const menu = $('.menu');
  const navlinks = $('.navlinks');
  menu?.addEventListener('click', () => {
    const open = navlinks?.classList.toggle('open') ?? false;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('.navlinks a').forEach(link => link.addEventListener('click', () => {
    navlinks?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open menu');
  }));

  // Portfolio filter.
  const filterButtons = $$('.filters button');
  const works = $$('.work');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      works.forEach(card => {
        const visible = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('is-hidden', !visible);
        if (visible && !reducedMotion) {
          card.animate([
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      });
    });
  });

  // Before / after blend slider. The finished image stays underneath while the original fades out.
  const compare = $('#compare');
  const range = $('#compareRange');
  const beforePane = $('#beforePane');
  const handle = $('#compareHandle');
  const updateCompare = value => {
    const pct = Math.max(0, Math.min(100, Number(value)));
    if (beforePane) {
      beforePane.style.width = '100%';
      beforePane.style.opacity = String(1 - pct / 100);
    }
    if (handle) handle.style.left = `${pct}%`;
    if (range) range.setAttribute('aria-valuetext', `${pct} percent`);
  };
  range?.addEventListener('input', event => updateCompare(event.target.value));
  updateCompare(range?.value || 50);
  compare?.addEventListener('keydown', event => {
    if (!range) return;
    if (event.key === 'ArrowLeft') { range.stepDown(); updateCompare(range.value); }
    if (event.key === 'ArrowRight') { range.stepUp(); updateCompare(range.value); }
  });

  // Enquiry form: sends the lead directly to WhatsApp.
  const form = $('#enquiry');
  const whatsappNumber = '918298760308';
  const buildWhatsAppUrl = data => {
    const message = [
      'Hello ORA VFX, I would like to discuss a project.',
      '',
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone / WhatsApp: ${data.phone}`,
      `Service: ${data.service}`,
      `Budget: ${data.budget}`,
      `Deadline: ${data.deadline}`
    ].join('\n');
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = $('button[type=submit]', form);
    const success = $('.form-success', form);
    const error = $('.form-error', form);
    const data = Object.fromEntries(new FormData(form).entries());
    const whatsappUrl = buildWhatsAppUrl(data);

    if (success) success.hidden = true;
    if (error) { error.hidden = true; error.textContent = ''; }
    if (submit) { submit.disabled = true; submit.dataset.originalText = submit.textContent; submit.textContent = 'Opening WhatsApp…'; }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (success) {
      success.textContent = 'Your enquiry is ready in WhatsApp. Please tap Send to submit it.';
      success.hidden = false;
    }
    form.reset();

    if (submit) {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText || 'Send Enquiry ↗';
    }
  });

  // Reveal sections/cards only when they enter the viewport.
  const revealItems = $$('.reveal, .highlight-grid article, .service-card, .audience-grid article, .why-list article, .process-grid article, .team-grid article, .price-grid article, .faq-list details');
  revealItems.forEach((item, index) => { if (!item.classList.contains('reveal')) item.classList.add('reveal'); item.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`; });
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Lazy-start portfolio videos and pause them when they leave the viewport.
  const mediaObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 }) : null;
  $$('video[data-autoplay]').forEach(video => mediaObserver?.observe(video));

  // Lightweight cinematic motion: native browser APIs only; no animation library dependency.
  const progress = $('.scroll-progress');
  const heroVideo = $('.hero-video');
  let ticking = false;
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${pct})`;
    if (!reducedMotion && heroVideo && window.scrollY < window.innerHeight * 1.2) {
      heroVideo.style.transform = `scale(1.04) translate3d(0, ${window.scrollY * 0.035}px, 0)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  updateScrollUI();


})();
