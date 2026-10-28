/* Lightweight electric-energy effect for the single homepage ENTER CTA. */
(function () {
  'use strict';

  var button = document.querySelector('.electric-energy-button');
  if (!button || button.dataset.electricInitialized === 'true') return;
  button.dataset.electricInitialized = 'true';

  var svg = button.querySelector('.electric-energy__svg');
  var sparksLayer = button.querySelector('.electric-energy__sparks');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var timers = [];
  var sparkTimer = null;
  var burstTimer = null;
  var disposed = false;
  var lastTouchBurst = 0;
  var NS = 'http://www.w3.org/2000/svg';
  var EDGE_PAD = 17;
  var arcCount = 8;
  var branchCount = 7;

  if (!svg || !sparksLayer) return;

  function random(min, max) { return min + Math.random() * (max - min); }
  function choose(items) { return items[Math.floor(Math.random() * items.length)]; }
  function setTimer(fn, delay) {
    var id = window.setTimeout(function () {
      timers = timers.filter(function (timer) { return timer !== id; });
      if (!disposed) fn();
    }, delay);
    timers.push(id);
    return id;
  }

  function perimeterPoint(distance, width, height) {
    var perimeter = (width + height) * 2;
    var d = ((distance % perimeter) + perimeter) % perimeter;
    if (d < width) return { x: EDGE_PAD + d, y: EDGE_PAD, nx: 0, ny: -1, tx: 1, ty: 0 };
    d -= width;
    if (d < height) return { x: EDGE_PAD + width, y: EDGE_PAD + d, nx: 1, ny: 0, tx: 0, ty: 1 };
    d -= height;
    if (d < width) return { x: EDGE_PAD + width - d, y: EDGE_PAD + height, nx: 0, ny: 1, tx: -1, ty: 0 };
    d -= width;
    return { x: EDGE_PAD, y: EDGE_PAD + height - d, nx: -1, ny: 0, tx: 0, ty: -1 };
  }

  function pointString(point) {
    return point.x.toFixed(2) + ' ' + point.y.toFixed(2);
  }

  function makeArc(width, height, start, length, direction) {
    var points = [];
    var count = Math.max(5, Math.ceil(length / random(4.2, 7.4)));
    for (var i = 0; i <= count; i += 1) {
      var d = length * i / count;
      var p = perimeterPoint(start + d * direction, width, height);
      var spike = Math.random() < 0.26 ? random(3.2, 10.5) : random(-1.3, 3.8);
      var tangentJitter = random(-2.3, 2.3);
      points.push({
        x: p.x + p.nx * spike + p.tx * tangentJitter,
        y: p.y + p.ny * spike + p.ty * tangentJitter
      });
    }
    var dString = points.map(function (point, index) {
      return (index === 0 ? 'M ' : 'L ') + pointString(point);
    }).join(' ');
    return { d: dString, points: points, start: start, length: length, direction: direction };
  }

  function makeBranch(arc, width, height) {
    var parent = arc.points[Math.floor(random(1, Math.max(2, arc.points.length - 1)))];
    var direction = Math.random() < 0.5 ? -1 : 1;
    var outward = random(7, 17) * direction;
    var tangent = random(-8, 8);
    var mid = { x: parent.x + random(-3, 3), y: parent.y + random(-3, 3) };
    var end = { x: mid.x + random(-4, 4), y: mid.y + random(-4, 4) };
    // Push the branch mostly outward from the nearby side of the button.
    if (parent.y <= EDGE_PAD + 4) { mid.y -= Math.abs(outward); end.y = mid.y - random(2, 8); end.x += tangent; }
    else if (parent.y >= EDGE_PAD + height - 4) { mid.y += Math.abs(outward); end.y = mid.y + random(2, 8); end.x += tangent; }
    else if (parent.x <= EDGE_PAD + 4) { mid.x -= Math.abs(outward); end.x = mid.x - random(2, 8); end.y += tangent; }
    else { mid.x += Math.abs(outward); end.x = mid.x + random(2, 8); end.y += tangent; }
    return 'M ' + pointString(parent) + ' L ' + pointString(mid) + ' L ' + pointString(end);
  }

  function addSvgPath(className, d, opts) {
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('class', className);
    path.setAttribute('d', d);
    if (opts) {
      Object.keys(opts).forEach(function (key) { path.style.setProperty(key, opts[key]); });
    }
    svg.appendChild(path);
    return path;
  }

  function buildLightning() {
    if (disposed || !button.isConnected) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var rect = button.getBoundingClientRect();
    var width = Math.max(70, Math.round(rect.width));
    var height = Math.max(38, Math.round(rect.height));
    var fullWidth = width + EDGE_PAD * 2;
    var fullHeight = height + EDGE_PAD * 2;
    var perimeter = 2 * (width + height);
    svg.setAttribute('viewBox', '0 0 ' + fullWidth + ' ' + fullHeight);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width = fullWidth + 'px';
    svg.style.height = fullHeight + 'px';
    svg.style.left = -EDGE_PAD + 'px';
    svg.style.top = -EDGE_PAD + 'px';

    var arcs = [];
    for (var i = 0; i < arcCount; i += 1) {
      var start = random(0, perimeter);
      var arc = makeArc(width, height, start, random(perimeter * 0.07, perimeter * 0.2), Math.random() < 0.5 ? -1 : 1);
      arcs.push(arc);
      var style = {
        '--travel': random(0.72, 1.65).toFixed(2) + 's',
        '--flicker': random(0.6, 1.4).toFixed(2) + 's',
        '--dash': random(4, 13).toFixed(0) + ' ' + random(8, 21).toFixed(0),
        'animation-delay': random(-1.5, 0).toFixed(2) + 's'
      };
      addSvgPath('electric-energy__arc-glow', arc.d, style);
      addSvgPath('electric-energy__arc', arc.d, style);
    }
    for (var j = 0; j < branchCount; j += 1) {
      var parentArc = choose(arcs);
      addSvgPath('electric-energy__branch', makeBranch(parentArc, width, height), {
        '--travel': random(0.65, 1.35).toFixed(2) + 's',
        '--flicker': random(0.5, 1.2).toFixed(2) + 's',
        'animation-delay': random(-1.2, 0).toFixed(2) + 's'
      });
    }
  }

  function shootSpark(burst) {
    if (disposed || document.hidden || (reduceMotion && reduceMotion.matches) || !button.isConnected) return;
    var rect = button.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    var edge = Math.floor(Math.random() * 4);
    var x, y, dx, dy;
    if (edge === 0) { x = random(0, width); y = random(-1, 3); dx = random(-22, 22); dy = -random(9, 25); }
    else if (edge === 1) { x = random(width - 3, width + 1); y = random(0, height); dx = random(9, 26); dy = random(-20, 20); }
    else if (edge === 2) { x = random(0, width); y = random(height - 2, height + 2); dx = random(-22, 22); dy = random(9, 27); }
    else { x = random(-1, 3); y = random(0, height); dx = -random(9, 26); dy = random(-20, 20); }

    var spark = document.createElement('span');
    spark.className = 'electric-energy__spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.style.left = x.toFixed(1) + 'px';
    spark.style.top = y.toFixed(1) + 'px';
    spark.style.setProperty('--spark-dx', dx.toFixed(1) + 'px');
    spark.style.setProperty('--spark-dy', dy.toFixed(1) + 'px');
    spark.style.setProperty('--spark-size', random(1.5, burst ? 4 : 3.1).toFixed(1) + 'px');
    spark.style.setProperty('--spark-duration', random(burst ? 260 : 320, burst ? 620 : 600).toFixed(0) + 'ms');
    sparksLayer.appendChild(spark);
    spark.addEventListener('animationend', function () {
      if (spark.parentNode) spark.parentNode.removeChild(spark);
    }, { once: true });
  }

  function scheduleSpark() {
    if (disposed || document.hidden || (reduceMotion && reduceMotion.matches)) return;
    if (sparkTimer) window.clearTimeout(sparkTimer);
    sparkTimer = window.setTimeout(function () {
      sparkTimer = null;
      if (!disposed && !document.hidden && button.isConnected) {
        shootSpark(false);
        if (button.classList.contains('is-energized')) shootSpark(false);
      }
      scheduleSpark();
    }, button.classList.contains('is-energized') ? random(105, 230) : random(210, 510));
  }

  function burst() {
    if (disposed) return;
    button.classList.add('is-burst', 'is-energized');
    lastTouchBurst = Date.now();
    if (!(reduceMotion && reduceMotion.matches)) {
      for (var i = 0; i < 7; i += 1) setTimer(function () { shootSpark(true); }, i * 22);
    }
    if (burstTimer) window.clearTimeout(burstTimer);
    burstTimer = window.setTimeout(function () {
      button.classList.remove('is-burst');
      if (!button.matches(':hover') && document.activeElement !== button) button.classList.remove('is-energized');
      burstTimer = null;
    }, 460);
  }

  function onPointerEnter(event) {
    if (event.pointerType === 'mouse') button.classList.add('is-energized');
  }
  function onPointerLeave(event) {
    if (event.pointerType === 'mouse' && !button.classList.contains('is-burst') && document.activeElement !== button) {
      button.classList.remove('is-energized');
    }
  }
  function onPointerDown(event) {
    if (event.pointerType === 'touch') burst();
  }
  function onClick() {
    if (Date.now() - lastTouchBurst < 120) return;
    burst();
  }
  function onFocus() { button.classList.add('is-energized'); }
  function onBlur() {
    if (!button.matches(':hover') && !button.classList.contains('is-burst')) button.classList.remove('is-energized');
  }

  button.addEventListener('pointerenter', onPointerEnter, { passive: true });
  button.addEventListener('pointerleave', onPointerLeave, { passive: true });
  button.addEventListener('pointerdown', onPointerDown, { passive: true });
  button.addEventListener('click', onClick);
  button.addEventListener('focus', onFocus);
  button.addEventListener('blur', onBlur);
  window.addEventListener('resize', buildLightning, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (sparkTimer) window.clearTimeout(sparkTimer);
      sparkTimer = null;
    } else {
      scheduleSpark();
    }
  });
  window.addEventListener('pagehide', function () {
    disposed = true;
    timers.forEach(function (id) { window.clearTimeout(id); });
    timers = [];
    if (sparkTimer) window.clearTimeout(sparkTimer);
    if (burstTimer) window.clearTimeout(burstTimer);
  }, { once: true });

  buildLightning();
  if (!(reduceMotion && reduceMotion.matches)) scheduleSpark();
})();
