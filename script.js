(() => {
  "use strict";

  const loopVideo = document.querySelector("#loop-video");
  const media = document.querySelector(".hero-media");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const LOOP_SRC = "assets/video/orb-loop.mp4";

  // Rotate real ORA VFX service phrases in the large hero headline, matching the
  // reference's oversized two-line typography without changing the hero layout.
  const phraseRotator = document.querySelector("[data-phrase-rotator]");
  if (phraseRotator && !reducedMotion.matches) {
    const phrases = Array.from(phraseRotator.querySelectorAll(".rotator-phrase"));
    let activeIndex = Math.max(0, phrases.findIndex((phrase) => phrase.classList.contains("is-active")));
    let rotationTimer = 0;

    const rotatePhrase = () => {
      if (document.hidden || phrases.length < 2) return;
      const current = phrases[activeIndex];
      const nextIndex = (activeIndex + 1) % phrases.length;
      const next = phrases[nextIndex];
      current.classList.remove("is-active", "is-initial");
      current.classList.add("is-exiting");
      next.classList.remove("is-exiting", "is-initial");
      next.classList.add("is-active");
      window.setTimeout(() => current.classList.remove("is-exiting"), 620);
      activeIndex = nextIndex;
    };

    const startRotation = () => {
      if (!rotationTimer && !document.hidden) rotationTimer = window.setInterval(rotatePhrase, 3300);
    };
    const stopRotation = () => {
      if (rotationTimer) window.clearInterval(rotationTimer);
      rotationTimer = 0;
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });
    startRotation();
  }

  const thunderButton = document.querySelector(".work-button");
  if (thunderButton) {
    const canvas = thunderButton.querySelector(".thunder-canvas");
    const context = canvas && canvas.getContext("2d", { alpha: true });
    if (canvas && context) {
      let width = 1;
      let height = 1;
      let pixelRatio = 1;
      let animationFrame = 0;
      let lastFrame = 0;
      let lastBolt = 0;
      let bolts = [];
      let sparks = [];
      let flashUntil = 0;

      const random = (min, max) => min + Math.random() * (max - min);
      const pointOnEdge = (margin = 5) => {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) return { x: random(margin, width - margin), y: margin };
        if (edge === 1) return { x: width - margin, y: random(margin, height - margin) };
        if (edge === 2) return { x: random(margin, width - margin), y: height - margin };
        return { x: margin, y: random(margin, height - margin) };
      };

      const jaggedPath = (start, end, segments, spread) => {
        const points = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / length;
        const ny = dx / length;
        for (let i = 0; i <= segments; i += 1) {
          const t = i / segments;
          const envelope = Math.sin(Math.PI * t);
          const offset = i === 0 || i === segments ? 0 : random(-spread, spread) * envelope;
          points.push({ x: start.x + dx * t + nx * offset, y: start.y + dy * t + ny * offset });
        }
        return points;
      };

      const makeBolt = (now, burst = false) => {
        let start;
        let end;
        if (burst) {
          start = { x: width * random(.38, .62), y: height * random(.32, .68) };
          end = pointOnEdge(3);
        } else {
          start = pointOnEdge(4);
          end = pointOnEdge(4);
          let attempts = 0;
          while (Math.hypot(end.x - start.x, end.y - start.y) < width * .24 && attempts < 5) {
            end = pointOnEdge(4);
            attempts += 1;
          }
        }
        const points = jaggedPath(start, end, Math.round(random(8, 15)), Math.min(11, height * random(.12, .3)));
        const branches = [];
        const branchCount = burst ? Math.round(random(3, 5)) : Math.round(random(1, 3));
        for (let i = 0; i < branchCount; i += 1) {
          const fromIndex = Math.round(random(2, points.length - 3));
          const origin = points[fromIndex];
          const direction = Math.random() > .5 ? 1 : -1;
          const finish = {
            x: Math.max(2, Math.min(width - 2, origin.x + direction * random(12, width * (burst ? .24 : .16)))),
            y: Math.max(2, Math.min(height - 2, origin.y + random(-height * .6, height * .6)))
          };
          branches.push({ points: jaggedPath(origin, finish, Math.round(random(4, 7)), Math.min(7, height * .14)), delay: random(.14, .47) });
        }
        return { points, branches, born: now, life: burst ? random(180, 300) : random(150, 310), power: burst ? 1.25 : random(.68, 1.12) };
      };

      const drawPartialPath = (points, progress) => {
        if (points.length < 2 || progress <= 0) return;
        const lengths = [];
        let total = 0;
        for (let i = 1; i < points.length; i += 1) {
          const length = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
          lengths.push(length);
          total += length;
        }
        let remaining = total * Math.min(1, progress);
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i += 1) {
          const segment = lengths[i - 1];
          if (remaining >= segment) {
            context.lineTo(points[i].x, points[i].y);
            remaining -= segment;
          } else {
            const ratio = segment ? remaining / segment : 0;
            context.lineTo(
              points[i - 1].x + (points[i].x - points[i - 1].x) * ratio,
              points[i - 1].y + (points[i].y - points[i - 1].y) * ratio
            );
            break;
          }
        }
        context.stroke();
      };

      const strokeBolt = (points, alpha, widthPx) => {
        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = `rgba(0, 196, 255, ${Math.max(0, alpha) * .75})`;
        context.lineWidth = widthPx * 3.2;
        context.shadowColor = "#00cfff";
        context.shadowBlur = 10 + widthPx * 3;
        drawPartialPath(points, 1);
        context.strokeStyle = `rgba(28, 228, 255, ${Math.max(0, alpha)})`;
        context.lineWidth = widthPx;
        context.shadowColor = "#27edff";
        context.shadowBlur = 7;
        drawPartialPath(points, 1);
        context.strokeStyle = `rgba(238, 255, 255, ${Math.max(0, alpha) * .92})`;
        context.lineWidth = Math.max(.55, widthPx * .36);
        context.shadowColor = "#ffffff";
        context.shadowBlur = 5;
        drawPartialPath(points, 1);
        context.restore();
      };

      const drawMovingCurrent = (now, surge) => {
        context.save();
        context.globalCompositeOperation = "lighter";
        for (let i = 0; i < 3; i += 1) {
          const phase = now * (.0014 + i * .00025) + i * 2.3;
          const y = height * (.22 + i * .27) + Math.sin(phase) * height * .1;
          context.beginPath();
          context.moveTo(-2, y);
          context.bezierCurveTo(width * .2, y + Math.sin(phase + 1) * height * .2, width * .58, y + Math.cos(phase) * height * .22, width + 2, y + Math.sin(phase + 2) * height * .16);
          context.strokeStyle = `rgba(0, 222, 255, ${.1 + .07 * (1 + Math.sin(phase)) + surge * .09})`;
          context.lineWidth = i === 1 ? 1.1 : .65;
          context.shadowColor = "#00cfff";
          context.shadowBlur = 6 + surge * 7;
          context.stroke();
        }
        context.restore();
      };

      const initializeSparks = () => {
        sparks = Array.from({ length: Math.max(15, Math.min(30, Math.round(width / 10))) }, () => ({
          x: random(2, width - 2), y: random(2, height - 2),
          radius: random(.35, 1.15), speed: random(7, 38), phase: random(0, Math.PI * 2)
        }));
      };

      const drawSparks = (now, delta, surge) => {
        context.save();
        context.globalCompositeOperation = "lighter";
        for (const spark of sparks) {
          spark.x += spark.speed * delta / 1000;
          spark.y += Math.sin(now * .002 + spark.phase) * delta * .006;
          if (spark.x > width - 1) { spark.x = 1; spark.y = random(2, height - 2); }
          const flicker = .2 + (Math.sin(now * .009 + spark.phase) + 1) * .24 + surge * .25;
          context.beginPath();
          context.arc(spark.x, spark.y, spark.radius + surge * .35, 0, Math.PI * 2);
          context.fillStyle = `rgba(157, 250, 255, ${Math.min(.95, flicker)})`;
          context.shadowColor = "#00eaff";
          context.shadowBlur = 5 + surge * 5;
          context.fill();
        }
        context.restore();
      };

      const resize = () => {
        const rect = thunderButton.getBoundingClientRect();
        width = Math.max(1, rect.width + 8);
        height = Math.max(1, rect.height + 8);
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        initializeSparks();
      };

      const renderFrame = (now, staticOnly = false) => {
        const delta = lastFrame ? Math.min(42, now - lastFrame) : 16;
        lastFrame = now;
        const hover = thunderButton.matches(":hover, :focus-visible, :active");
        const burstActive = thunderButton.classList.contains("is-burst");
        const surge = hover || burstActive ? 1 : 0;
        context.clearRect(0, 0, width, height);

        const glowX = ((now * .00019) % 1) * (width * 1.2) - width * .1;
        const energy = context.createRadialGradient(glowX, height * .5, 0, glowX, height * .5, width * .68);
        energy.addColorStop(0, `rgba(0, 222, 255, ${.2 + surge * .2})`);
        energy.addColorStop(.42, `rgba(0, 137, 176, ${.095 + surge * .1})`);
        energy.addColorStop(1, "rgba(0, 20, 34, 0)");
        context.fillStyle = energy;
        context.fillRect(0, 0, width, height);

        // A soft, travelling plasma sheet gives the entire button interior a live current.
        context.save();
        context.globalCompositeOperation = "lighter";
        const waveX = ((now * .105) % (width + 100)) - 50;
        const wave = context.createLinearGradient(waveX - 48, 0, waveX + 48, 0);
        wave.addColorStop(0, "rgba(0, 225, 255, 0)");
        wave.addColorStop(.35, `rgba(0, 207, 255, ${.095 + surge * .12})`);
        wave.addColorStop(.5, `rgba(183, 255, 255, ${.13 + surge * .12})`);
        wave.addColorStop(.64, `rgba(0, 211, 255, ${.1 + surge * .12})`);
        wave.addColorStop(1, "rgba(0, 225, 255, 0)");
        context.fillStyle = wave;
        context.fillRect(0, 0, width, height);
        const reverseX = width - ((now * .065) % (width + 70));
        const reverseWave = context.createLinearGradient(reverseX - 35, 0, reverseX + 35, 0);
        reverseWave.addColorStop(0, "rgba(0, 225, 255, 0)");
        reverseWave.addColorStop(.5, `rgba(0, 167, 220, ${.065 + surge * .09})`);
        reverseWave.addColorStop(1, "rgba(0, 225, 255, 0)");
        context.fillStyle = reverseWave;
        context.fillRect(0, 0, width, height);
        context.restore();
        drawMovingCurrent(now, surge);

        context.save();
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = `rgba(68, 241, 255, ${.35 + surge * .35})`;
        context.lineWidth = 1;
        context.shadowColor = "#00eaff";
        context.shadowBlur = 7 + surge * 6;
        context.setLineDash([11, 9]);
        context.lineDashOffset = -(now * .035) % 20;
        context.strokeRect(4.5, 4.5, Math.max(1, width - 9), Math.max(1, height - 9));
        context.setLineDash([]);
        context.restore();

        if (staticOnly) {
          const staticBolts = Array.from({ length: 6 }, () => makeBolt(now, false));
          for (const bolt of staticBolts) {
            strokeBolt(bolt.points, .58, 1.1);
            for (const branch of bolt.branches) strokeBolt(branch.points, .37, .8);
          }
          drawSparks(now, 0, 0);
          return;
        }

        const interval = surge ? random(55, 105) : random(90, 175);
        if (now - lastBolt > interval) {
          bolts.push(makeBolt(now, burstActive));
          if (surge && Math.random() > .42) bolts.push(makeBolt(now, true));
          if (Math.random() > (surge ? .28 : .65)) flashUntil = now + random(35, 75);
          lastBolt = now;
        }
        if (now < flashUntil) thunderButton.classList.add("is-flashing");
        else thunderButton.classList.remove("is-flashing");
        bolts = bolts.filter((bolt) => now - bolt.born < bolt.life);
        for (const bolt of bolts) {
          const elapsed = now - bolt.born;
          const progress = Math.min(1, elapsed / bolt.life);
          const fadeIn = Math.min(1, elapsed / 20);
          const fadeOut = Math.min(1, (bolt.life - elapsed) / 60);
          const alpha = Math.max(0, fadeIn * fadeOut * bolt.power);
          strokeBolt(bolt.points.slice(0, Math.max(2, Math.ceil(bolt.points.length * Math.min(1, progress * 1.75)))), alpha, 1.05 + surge * .4);
          for (const branch of bolt.branches) {
            const branchProgress = Math.max(0, (progress - branch.delay) / Math.max(.1, 1 - branch.delay));
            if (branchProgress > 0) {
              const visiblePoints = branch.points.slice(0, Math.max(2, Math.ceil(branch.points.length * Math.min(1, branchProgress * 1.7))));
              strokeBolt(visiblePoints, alpha * .72, .72 + surge * .25);
            }
          }
        }
        drawSparks(now, delta, surge);
      };

      resize();
      if (reducedMotion.matches) {
        renderFrame(performance.now(), true);
      } else {
        const animate = (now) => {
          if (now - lastFrame >= 1000 / 42) renderFrame(now, false);
          animationFrame = window.requestAnimationFrame(animate);
        };
        renderFrame(performance.now(), false);
        animationFrame = window.requestAnimationFrame(animate);
      }

      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
          resize();
          if (reducedMotion.matches) renderFrame(performance.now(), true);
        });
        observer.observe(thunderButton);
      } else {
        window.addEventListener("resize", () => {
          resize();
          if (reducedMotion.matches) renderFrame(performance.now(), true);
        }, { passive: true });
      }

      // Follow the user's preference if it changes while the page is open.
      const handleMotionPreference = () => {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastFrame = 0;
        resize();
        if (reducedMotion.matches) {
          renderFrame(performance.now(), true);
        } else {
          const animate = (now) => {
            if (now - lastFrame >= 1000 / 42) renderFrame(now, false);
            animationFrame = window.requestAnimationFrame(animate);
          };
          renderFrame(performance.now(), false);
          animationFrame = window.requestAnimationFrame(animate);
        }
      };
      if (typeof reducedMotion.addEventListener === "function") reducedMotion.addEventListener("change", handleMotionPreference);

      thunderButton.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || thunderButton.target === "_blank") return;
        if (reducedMotion.matches) return;
        event.preventDefault();
        thunderButton.classList.remove("is-burst");
        void thunderButton.offsetWidth;
        thunderButton.classList.add("is-burst");
        window.setTimeout(() => window.location.assign(thunderButton.href), 115);
      });
    }
  }

  // Use the supplied, cyclically crossfaded orb clip as a single infinite loop.
  // The still CGI remains underneath it until playback succeeds, and remains visible
  // when autoplay is blocked or the visitor prefers reduced motion.
  if (!loopVideo || !media) return;

  const activateVideo = () => loopVideo.classList.add("is-playing");
  const keepStillFallback = () => {
    loopVideo.pause();
    loopVideo.classList.remove("is-playing");
  };
  let loopSourceAssigned = false;

  const startLoopVideo = () => {
    if (reducedMotion.matches) {
      keepStillFallback();
      return;
    }
    if (!loopSourceAssigned) {
      loopVideo.src = LOOP_SRC;
      loopVideo.loop = true;
      loopVideo.muted = true;
      loopVideo.playsInline = true;
      loopVideo.load();
      loopSourceAssigned = true;
    }
    const playPromise = loopVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => loopVideo.classList.remove("is-playing"));
    }
  };

  loopVideo.addEventListener("playing", activateVideo);
  loopVideo.addEventListener("error", () => loopVideo.classList.remove("is-playing"));
  startLoopVideo();

  const handleVideoMotionPreference = () => {
    if (reducedMotion.matches) keepStillFallback();
    else startLoopVideo();
  };
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleVideoMotionPreference);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(handleVideoMotionPreference);
  }
})();
