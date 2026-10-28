(function () {
  'use strict';

  var STORAGE_KEY = 'ora-vfx-theme';
  var THEME_COLORS = { dark: '#02080e', light: '#f2f6f8' };
  var SUN_ICON = '<svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
  var MOON_ICON = '<svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.6 8.6 0 1 0 20.5 14.1Z"/></svg>';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateTheme(theme, persist) {
    var normalizedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', normalizedTheme);

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, normalizedTheme);
      } catch (error) {
        /* Theme switching still works for this page when storage is unavailable. */
      }
    }

    var toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      var nextTheme = normalizedTheme === 'dark' ? 'light' : 'dark';
      var label = 'Switch to ' + nextTheme + ' mode';
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
      toggle.setAttribute('aria-pressed', String(normalizedTheme === 'light'));
    }

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute('content', THEME_COLORS[normalizedTheme]);
  }

  function createToggle() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.setAttribute('data-theme-control', 'true');
    button.setAttribute('aria-label', 'Switch to light mode');
    button.setAttribute('title', 'Switch to light mode');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="theme-toggle__track" aria-hidden="true">' + SUN_ICON + MOON_ICON + '</span><span class="theme-toggle__text">Theme</span>';
    button.addEventListener('click', function () {
      updateTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
    return button;
  }

  function mountToggle() {
    if (document.querySelector('.theme-toggle')) {
      updateTheme(currentTheme(), false);
      return;
    }

    var button = createToggle();
    var nav = document.querySelector('.nav');
    var quoteButton = nav && nav.querySelector('.navcta');

    if (quoteButton && quoteButton.parentNode) {
      quoteButton.parentNode.insertBefore(button, quoteButton);
    } else if (nav) {
      nav.appendChild(button);
    } else {
      /* Legal pages have no main navbar, so keep the same control available. */
      button.classList.add('theme-toggle--floating');
      document.body.appendChild(button);
    }

    updateTheme(currentTheme(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggle, { once: true });
  } else {
    mountToggle();
  }
})();
