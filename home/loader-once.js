/* Show the cinematic intro loader only once per browser tab session. */
(function () {
  'use strict';

  var storageKey = 'oraVfxIntroLoaderShown';
  var hasShown = false;

  try {
    hasShown = window.sessionStorage.getItem(storageKey) === '1';
    if (!hasShown) {
      window.sessionStorage.setItem(storageKey, '1');
    }
  } catch (error) {
    // If storage is blocked, keep the normal intro behavior rather than
    // preventing the homepage from loading.
  }

  // Repeat visits can be suppressed synchronously. When storage is blocked,
  // the first visit still shows the intro, but BFCache restores are suppressed.
  if (hasShown) {
    document.documentElement.classList.add('ora-loader-skip');
  }

  function suppressLoader() {
    var loader = document.getElementById('oraLoader');
    if (!loader) return;

    loader.hidden = true;
    loader.setAttribute('aria-hidden', 'true');

    var video = loader.querySelector('video');
    if (video) {
      try {
        video.pause();
      } catch (error) {
        // The loader must remain suppressed even if the media element fails.
      }
      video.removeAttribute('autoplay');
      video.preload = 'none';
    }
  }

  if (hasShown) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', suppressLoader, { once: true });
    } else {
      suppressLoader();
    }
  }

  // Back/forward cache restores do not re-run head scripts. Suppress the intro
  // on restored pages even if sessionStorage was unavailable on first load.
  window.addEventListener('pageshow', function (event) {
    if (hasShown || event.persisted) {
      document.documentElement.classList.add('ora-loader-skip');
      suppressLoader();
    }
  });
})();
