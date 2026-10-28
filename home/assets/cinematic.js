/* Floating glass cubes — canvas, no libraries. Reacts to scroll + cursor. */
(() => {
  document.documentElement.classList.add("ora-vertical-progress");
  const c = document.createElement("canvas");
  c.id = "fx";
  document.body.prepend(c);
  const g = c.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W,
    H,
    dpr,
    mx = 0,
    my = 0,
    sy = 0,
    tsy = 0;
  const fit = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = c.width = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
  };
  fit();
  addEventListener("resize", fit);
  addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    },
    { passive: true },
  );
  addEventListener(
    "scroll",
    () => {
      tsy =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
    },
    { passive: true },
  );
  const N = innerWidth < 700 ? 7 : 14;
  const cubes = Array.from({ length: N }, (_, i) => ({
    t: i / N,
    s: 0.022 + Math.random() * 0.03,
    rx: Math.random() * 6,
    ry: Math.random() * 6,
    vx: (Math.random() - 0.5) * 0.01,
    vy: (Math.random() - 0.5) * 0.012,
    o: Math.random() * 6,
  }));
  const V = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];
  const F = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 1, 5, 4],
    [2, 3, 7, 6],
    [1, 2, 6, 5],
    [0, 3, 7, 4],
  ];
  const dust = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
  }));
  let time = 0;
  const draw = () => {
    time += 0.008;
    sy += (tsy - sy) * 0.06;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,.55)";
    dust.forEach((d) => {
      const y = (((d.y - sy * d.z * 0.6) % 1) + 1) % 1;
      g.globalAlpha = 0.15 + d.z * 0.4;
      g.fillRect(d.x * W, y * H, dpr * (0.6 + d.z), dpr * (0.6 + d.z));
    });
    const m = Math.min(W, H);
    cubes.forEach((q, i) => {
      // sinuous path drifting across the screen; scroll bends and rotates it
      const p = (q.t + time * 0.02 + sy * 0.6) % 1;
      const X = (p * 1.3 - 0.15) * W + mx * 40 * dpr;
      const Y =
        H *
          (0.5 +
            Math.sin(p * 7 + sy * 9 + q.o) * 0.28 +
            Math.sin(time + q.o) * 0.02) +
        my * 30 * dpr;
      const a = q.rx + time * (q.vx * 60) + sy * 8,
        b = q.ry + time * (q.vy * 60) + sy * 6 + mx;
      const ca = Math.cos(a),
        sa = Math.sin(a),
        cb = Math.cos(b),
        sb = Math.sin(b),
        r = q.s * m;
      const P = V.map(([x, y, z]) => {
        let y1 = y * ca - z * sa,
          z1 = y * sa + z * ca,
          x1 = x * cb + z1 * sb,
          z2 = -x * sb + z1 * cb;
        return [X + x1 * r, Y + y1 * r, z2];
      });
      const fade = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
      F.map((f) => ({ f, z: f.reduce((s, k) => s + P[k][2], 0) }))
        .sort((u, v) => u.z - v.z)
        .forEach(({ f }) => {
          g.beginPath();
          f.forEach((k, j) =>
            j ? g.lineTo(P[k][0], P[k][1]) : g.moveTo(P[k][0], P[k][1]),
          );
          g.closePath();
          g.globalAlpha = 0.045 * fade;
          g.fillStyle = i % 5 ? "#f8f8f8" : "#00e0f8";
          g.fill();
          g.globalAlpha = 0.38 * fade;
          g.strokeStyle =
            i % 5 ? "rgba(248,248,248,.9)" : "rgba(0,224,248,.95)";
          g.lineWidth = dpr;
          g.stroke();
        });
    });
    g.globalAlpha = 1;
    if (!still) requestAnimationFrame(draw);
  };
  draw();
})();
