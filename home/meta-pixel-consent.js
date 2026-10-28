/* ORA VFX — consent-gated Meta Pixel. PageView only; no conversion events. */
(function () {
  'use strict';

  var PIXEL_ID = '1100194509661942';
  var CONSENT_KEY = 'ora-vfx-meta-pixel-consent';
  var panel = null;
  var settingsButton = null;
  var pixelBootstrapped = false;
  var pageViewTrackedForCurrentConsent = false;
  var memoryChoice = null;

  function readChoice() {
    if (memoryChoice === 'granted' || memoryChoice === 'denied') return memoryChoice;
    try {
      var saved = window.localStorage.getItem(CONSENT_KEY);
      if (saved === 'granted' || saved === 'denied') {
        memoryChoice = saved;
        return saved;
      }
    } catch (error) {
      /* If storage is unavailable, do not assume consent. */
    }
    return null;
  }

  function saveChoice(choice) {
    memoryChoice = choice;
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch (error) {
      /* The current-page choice still applies if storage is unavailable. */
    }
  }

  function expireCookie(name, domain) {
    var domainPart = domain ? '; domain=' + domain : '';
    document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domainPart + '; SameSite=Lax';
  }

  function clearPixelCookies() {
    ['_fbp', '_fbc'].forEach(function (name) {
      expireCookie(name, null);
      var host = window.location.hostname;
      if (host) {
        expireCookie(name, host);
        expireCookie(name, '.' + host);
      }
      /* Also cover the production root domain and its www host if deployed there. */
      expireCookie(name, 'oravfx.com');
      expireCookie(name, '.oravfx.com');
      expireCookie(name, 'www.oravfx.com');
    });
  }

  function installPixelBootstrap() {
    if (typeof window.fbq === 'function') return;
    /* Keep Meta's official base-code queue/bootstrap, but run it only after opt-in. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  function initializePixel() {
    if (readChoice() !== 'granted') return;

    installPixelBootstrap();
    if (!pixelBootstrapped) {
      window.fbq('init', PIXEL_ID);
      pixelBootstrapped = true;
    }

    /* Re-grant consent when a visitor changes Reject -> Allow on the same page. */
    window.fbq('consent', 'grant');
    if (!pageViewTrackedForCurrentConsent) {
      window.fbq('track', 'PageView');
      pageViewTrackedForCurrentConsent = true;
    }
  }

  function revokePixel() {
    if (typeof window.fbq === 'function' && pixelBootstrapped) {
      window.fbq('consent', 'revoke');
    }
    pageViewTrackedForCurrentConsent = false;
    clearPixelCookies();
  }

  function closePanel() {
    if (panel) panel.hidden = true;
    if (settingsButton) settingsButton.hidden = false;
  }

  function openPanel() {
    if (!panel) createInterface();
    panel.hidden = false;
    if (settingsButton) settingsButton.hidden = true;
  }

  function choose(choice) {
    if (choice !== 'granted' && choice !== 'denied') return;
    saveChoice(choice);
    if (choice === 'granted') {
      initializePixel();
    } else {
      revokePixel();
    }
    closePanel();
  }

  function createInterface() {
    if (panel) return;

    panel = document.createElement('aside');
    panel.className = 'ora-meta-consent';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'ora-meta-consent-title');
    panel.setAttribute('aria-describedby', 'ora-meta-consent-description');
    panel.hidden = true;
    panel.innerHTML = '<div class="ora-meta-consent__copy"><p class="ora-meta-consent__eyebrow">PRIVACY CHOICES</p><h2 id="ora-meta-consent-title">Your privacy matters</h2><p id="ora-meta-consent-description">ORA VFX can use Meta Pixel to measure page views and advertising performance. Optional tracking stays off unless you allow it. If allowed, Meta may receive information about this visit. Read our <a href="privacy.html">Privacy Policy</a>.</p></div><div class="ora-meta-consent__actions"><button type="button" class="ora-meta-consent__button ora-meta-consent__button--secondary" data-consent-choice="denied">Reject optional tracking</button><button type="button" class="ora-meta-consent__button ora-meta-consent__button--primary" data-consent-choice="granted">Allow optional tracking</button></div>';

    panel.querySelectorAll('[data-consent-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        choose(button.getAttribute('data-consent-choice'));
      });
    });

    settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'ora-cookie-settings';
    settingsButton.textContent = 'Cookie preferences';
    settingsButton.setAttribute('aria-label', 'Open cookie preferences');
    settingsButton.addEventListener('click', openPanel);

    document.body.appendChild(panel);
    document.body.appendChild(settingsButton);
  }

  function init() {
    createInterface();
    var choice = readChoice();
    if (choice === 'granted') {
      initializePixel();
      panel.hidden = true;
      settingsButton.hidden = false;
    } else if (choice === 'denied') {
      panel.hidden = true;
      settingsButton.hidden = false;
    } else {
      /* No saved decision: show choices and do not initialize Meta Pixel. */
      panel.hidden = false;
      settingsButton.hidden = true;
    }
  }

  /* On return visits, load Pixel early only if opt-in is already stored. */
  if (readChoice() === 'granted') initializePixel();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
