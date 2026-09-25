/* ==========================================================================
   Night sky behind the envelope intro: a Milky Way of twinkling stars, the odd
   shooting star, fireflies over the bush, and a burst of gold when the
   envelope opens. Loaded after landing.js / main.js, so if the intro has
   already been removed (seen before, or reduced motion) this does nothing.
   ========================================================================== */
(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const starCanvas = document.getElementById("skyStars");
  const fxCanvas = document.getElementById("skyFx");
  if (!intro || !starCanvas || !fxCanvas || !document.body.contains(intro)) return;

  const envelope = document.getElementById("envelope");
  const sctx = starCanvas.getContext("2d");
  const fctx = fxCanvas.getContext("2d");
  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  let w = 0, h = 0, dpr = 1;
  let haze = null;
  let stars = [], flies = [], sparks = [], meteors = [];
  let nextMeteor = performance.now() + rand(2500, 5000);

  // A soft round glow, pre-rendered once and stamped for fireflies and sparks
  const glow = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 246, 214, 1)");
    grad.addColorStop(0.18, "rgba(255, 214, 130, .85)");
    grad.addColorStop(0.45, "rgba(232, 170, 80, .22)");
    grad.addColorStop(1, "rgba(232, 170, 80, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  })();

  // The Milky Way runs corner to corner, lower left to upper right
  const bandPoint = (t) => ({ x: -0.1 * w + t * 1.2 * w, y: 0.78 * h - t * 0.72 * h });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = intro.clientWidth;
    h = intro.clientHeight;
    [starCanvas, fxCanvas].forEach((c) => {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    buildHaze();
    buildStars();
    buildFlies();
  }

  // As seen from southern Africa: the galactic core, a warm bulge, sits
  // high in the band, split by the dark Great Rift.
  const CORE = 0.22;

  function blob(g, x, y, r, color) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function buildHaze() {
    haze = document.createElement("canvas");
    haze.width = Math.round(w * dpr);
    haze.height = Math.round(h * dpr);
    const g = haze.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const span = Math.hypot(w, h);
    for (let i = 0; i < 90; i++) {
      const p = bandPoint(Math.random());
      const r = span * rand(0.05, 0.13);
      const warm = Math.random() < 0.3;
      blob(g, p.x + gauss() * r * 0.4, p.y + gauss() * r * 0.4, r,
        warm ? "rgba(255, 200, 190, .05)" : "rgba(190, 200, 255, .06)");
    }
    // The core: a soft, warm swell of light, brightest at its heart
    for (let i = 0; i < 40; i++) {
      const p = bandPoint(CORE + gauss() * 0.07);
      const r = span * rand(0.04, 0.1);
      blob(g, p.x + gauss() * r * 0.3, p.y + gauss() * r * 0.3, r,
        Math.random() < 0.6 ? "rgba(255, 214, 170, .06)" : "rgba(255, 190, 175, .045)");
    }
    const c = bandPoint(CORE);
    blob(g, c.x, c.y, span * 0.07, "rgba(255, 228, 190, .07)");

    // Dust: scattered patches, then the Great Rift running down the band's
    // spine and through the core
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 26; i++) {
      const p = bandPoint(rand(0.15, 0.85));
      const r = span * rand(0.02, 0.05);
      blob(g, p.x + gauss() * r, p.y + gauss() * r * 0.6, r, "rgba(0, 0, 0, .5)");
    }
    for (let i = 0; i < 70; i++) {
      const t = rand(0.3, 0.85);
      const p = bandPoint(t);
      const r = span * rand(0.008, 0.022);
      const wobble = Math.sin(t * 19) * span * 0.008; // the rift meanders
      blob(g, p.x + wobble, p.y + wobble + gauss() * r * 0.4, r, "rgba(0, 0, 0, .45)");
    }
  }

  function buildStars() {
    const count = Math.max(160, Math.min(700, Math.round((w * h) / 2200)));
    const span = Math.hypot(w, h);
    stars = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      const roll = Math.random();
      if (roll < 0.12) { // crowded around the core
        const p = bandPoint(CORE + gauss() * 0.06);
        x = p.x + gauss() * span * 0.035;
        y = p.y + gauss() * span * 0.035;
      } else if (roll < 0.55) {
        const p = bandPoint(Math.random());
        x = p.x + gauss() * span * 0.06;
        y = p.y + gauss() * span * 0.06;
      } else {
        x = Math.random() * w;
        y = Math.random() * h * 0.9;
      }
      const big = Math.random() < 0.06;
      stars.push({
        x, y,
        r: big ? rand(1.1, 1.9) : rand(0.3, 1),
        a: rand(0.35, 1),
        speed: rand(0.6, 2.6),
        phase: rand(0, Math.PI * 2),
        tint: Math.random() < 0.12 ? "255, 222, 190" : Math.random() < 0.2 ? "200, 215, 255" : "255, 255, 255",
      });
    }
  }

  function buildFlies() {
    const count = w < 600 ? 14 : 26;
    flies = [];
    for (let i = 0; i < count; i++) {
      flies.push({
        x: Math.random() * w,
        y: h * rand(0.62, 0.97),
        vx: rand(-8, 8), vy: rand(-4, 4),
        size: rand(6, 14),
        phase: rand(0, Math.PI * 2),
        blink: rand(0.4, 1.1),
      });
    }
  }

  // Gold dust and a few merlot petals thrown up out of the envelope
  function burst() {
    const box = envelope.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height * 0.3;
    const count = w < 600 ? 110 : 190;
    for (let i = 0; i < count; i++) {
      const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const speed = rand(140, 520) * (w < 600 ? 0.7 : 1);
      const petal = Math.random() < 0.18;
      sparks.push({
        x: cx + rand(-box.width * 0.3, box.width * 0.3),
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        ttl: rand(2.2, 4.2),
        size: petal ? rand(5, 9) : rand(3, 9),
        petal,
        spin: rand(-6, 6),
        rot: rand(0, Math.PI * 2),
        color: ["#7a2334", "#9b2e40", "#b5465a"][Math.floor(Math.random() * 3)],
      });
    }
  }

  function drawStars(t) {
    sctx.clearRect(0, 0, w, h);
    sctx.drawImage(haze, 0, 0, w, h);
    for (const s of stars) {
      const alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
      sctx.fillStyle = `rgba(${s.tint}, ${alpha})`;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
      if (s.r > 1.2) { // brightest stars get a faint cross of light
        sctx.strokeStyle = `rgba(${s.tint}, ${alpha * 0.35})`;
        sctx.lineWidth = 0.6;
        const l = s.r * 5;
        sctx.beginPath();
        sctx.moveTo(s.x - l, s.y); sctx.lineTo(s.x + l, s.y);
        sctx.moveTo(s.x, s.y - l); sctx.lineTo(s.x, s.y + l);
        sctx.stroke();
      }
    }
    for (const m of meteors) {
      const k = m.life / m.ttl;
      const alpha = Math.sin(k * Math.PI);
      const tail = 150;
      const grad = sctx.createLinearGradient(m.x, m.y, m.x - m.dx * tail, m.y - m.dy * tail);
      grad.addColorStop(0, `rgba(255, 250, 235, ${alpha})`);
      grad.addColorStop(1, "rgba(255, 250, 235, 0)");
      sctx.strokeStyle = grad;
      sctx.lineWidth = 1.6;
      sctx.beginPath();
      sctx.moveTo(m.x, m.y);
      sctx.lineTo(m.x - m.dx * tail, m.y - m.dy * tail);
      sctx.stroke();
    }
  }

  function drawFx(t, dt) {
    fctx.clearRect(0, 0, w, h);
    fctx.globalCompositeOperation = "lighter";
    for (const f of flies) {
      f.vx += rand(-20, 20) * dt;
      f.vy += rand(-14, 14) * dt;
      f.vx = Math.max(-18, Math.min(18, f.vx));
      f.vy = Math.max(-10, Math.min(10, f.vy));
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < -20) f.x = w + 20;
      if (f.x > w + 20) f.x = -20;
      if (f.y < h * 0.55 || f.y > h) f.vy *= -1;
      const on = Math.max(0, Math.sin(t * f.blink + f.phase));
      fctx.globalAlpha = on * on * 0.9;
      fctx.drawImage(glow, f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
    }
    fctx.globalAlpha = 1;
    fctx.globalCompositeOperation = "source-over";

    sparks = sparks.filter((p) => p.life < p.ttl);
    for (const p of sparks) {
      p.life += dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy = p.vy * (1 - 1.6 * dt) + 70 * dt; // drag, then drift down
      p.x += p.vx * dt + Math.sin(p.life * 3 + p.rot) * 0.3;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      const fade = 1 - p.life / p.ttl;
      if (p.petal) {
        fctx.save();
        fctx.translate(p.x, p.y);
        fctx.rotate(p.rot);
        fctx.scale(1, Math.abs(Math.cos(p.rot * 0.7)) * 0.6 + 0.2); // tumbling
        fctx.globalAlpha = fade * 0.9;
        fctx.fillStyle = p.color;
        fctx.beginPath();
        fctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        fctx.fill();
        fctx.restore();
      } else {
        const twinkle = 0.6 + 0.4 * Math.sin(p.life * 18 + p.rot);
        fctx.globalCompositeOperation = "lighter";
        fctx.globalAlpha = fade * twinkle;
        fctx.drawImage(glow, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        fctx.globalCompositeOperation = "source-over";
      }
    }
    fctx.globalAlpha = 1;
  }

  let last = performance.now();
  function frame(now) {
    if (!document.body.contains(intro)) return; // intro finished and removed
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    if (now > nextMeteor) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const angle = rand(0.35, 0.6);
      meteors.push({ x: rand(0.2, 0.8) * w, y: rand(0.02, 0.3) * h, dx: dir * Math.cos(angle), dy: Math.sin(angle), speed: rand(700, 1100), life: 0, ttl: rand(0.6, 1) });
      nextMeteor = now + rand(4000, 9000);
    }
    meteors = meteors.filter((m) => m.life < m.ttl);
    for (const m of meteors) {
      m.life += dt;
      m.x += m.dx * m.speed * dt;
      m.y += m.dy * m.speed * dt;
    }

    drawStars(t);
    drawFx(t, dt);
    requestAnimationFrame(frame);
  }

  // Gentle parallax: the scene and envelope lean with the pointer
  intro.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    intro.style.setProperty("--px", ((e.clientX / w) * 2 - 1).toFixed(3));
    intro.style.setProperty("--py", ((e.clientY / h) * 2 - 1).toFixed(3));
  });

  if (envelope) {
    envelope.addEventListener("click", () => setTimeout(burst, 1750), { once: true });
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
