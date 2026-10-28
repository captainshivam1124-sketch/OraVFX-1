/* Apply the saved theme before stylesheets paint to avoid a wrong-theme flash. */
(function () {
  'use strict';
  var storageKey = 'ora-vfx-theme';
  var theme = 'dark';

  try {
    var savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;
  } catch (error) {
    /* Storage may be disabled; the original dark theme remains the default. */
  }

  document.documentElement.setAttribute('data-theme', theme);
})();
