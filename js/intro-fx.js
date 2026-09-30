/* ==========================================================================
   A quiet flourish for the envelope intro: as the card glides out, a few fine
   gold motes lift off the envelope, drift upwards and fade. Loaded after
   landing.js / main.js, so if the intro has already been removed (seen
   before, or reduced motion) this does nothing.
   ========================================================================== */
(function () {
  "use strict";

  const intro = document.getElementById("intro");
  const canvas = document.getElementById("introFx");
  const envelope = document.getElementById("envelope");
  if (!intro || !canvas || !envelope || !document.body.contains(intro)) return;

  const ctx = canvas.getContext("2d");
  const rand = (a, b) => a + Math.random() * (b - a);
  const golds = ["201, 164, 92", "176, 138, 69", "224, 196, 131"];

  let w = 0, h = 0;
  let motes = [];
  let last = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = intro.clientWidth;
    h = intro.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Motes are released a few at a time, so they read as drifting dust, not a burst
  function release() {
    const box = envelope.getBoundingClientRect();
    const count = w < 600 ? 26 : 44;
    for (let i = 0; i < count; i++) {
      motes.push({
        x: box.left + box.width * rand(0.12, 0.88),
        y: box.top + box.height * rand(0.05, 0.45),
        vx: rand(-10, 10),
        vy: rand(-62, -18),
        r: Math.random() < 0.15 ? rand(1.8, 2.8) : rand(0.6, 1.6),
        life: -rand(0, 1.5), // staggered start
        ttl: rand(2.4, 4),
        phase: rand(0, Math.PI * 2),
        color: golds[Math.floor(Math.random() * golds.length)],
      });
    }
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!document.body.contains(intro)) return; // intro finished and removed
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, w, h);
    motes = motes.filter((m) => m.life < m.ttl);
    for (const m of motes) {
      m.life += dt;
      if (m.life < 0) continue;
      m.vy *= 1 - 0.35 * dt; // they slow as they rise
      m.x += (m.vx + Math.sin(m.life * 1.4 + m.phase) * 9) * dt;
      m.y += m.vy * dt;
      const alpha = Math.sin((m.life / m.ttl) * Math.PI) * 0.85;
      ctx.fillStyle = `rgba(${m.color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (motes.length) requestAnimationFrame(frame);
  }

  envelope.addEventListener("click", () => setTimeout(release, 1750), { once: true });
  window.addEventListener("resize", resize);
  resize();
})();
