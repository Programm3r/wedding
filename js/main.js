/* ==========================================================================
   Save the Date — interactions
   ========================================================================== */
(function () {
  "use strict";

  const W = window.WEDDING || {};
  const PHOTOS = Array.isArray(window.GALLERY) ? window.GALLERY : [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const store = {
    get(key, storage = localStorage) { try { return storage.getItem(key); } catch { return null; } },
    set(key, value, storage = localStorage) { try { storage.setItem(key, value); } catch { /* storage unavailable */ } },
  };

  /* ---------- Fill text from config ---------- */
  function applyConfig() {
    const values = {
      partner1: W.partner1,
      partner2: W.partner2,
      coupleShort: `${W.partner1} & ${W.partner2}`,
      initials: W.initials,
      hashtag: W.hashtag,
      dateLong: W.dateLong,
      rsvpDeadline: W.rsvpDeadline,
      "venue.address": W.venue && W.venue.address,
    };
    $$("[data-config]").forEach((el) => {
      const v = values[el.dataset.config];
      if (v) el.textContent = v;
    });
    $$("[data-config-href]").forEach((el) => {
      const email = W[el.dataset.configHref];
      if (email) { el.href = `mailto:${email}`; el.textContent = email; }
    });
    document.title = `${W.partner1} & ${W.partner2} · Save the Date · 14 August 2027`;

    if (W.heroImage) {
      const bg = $("#heroBg");
      bg.style.backgroundImage = `url("${W.heroImage}")`;
      bg.classList.add("has-photo");
    }
    if (W.storyImage) {
      const img = new Image();
      img.src = W.storyImage;
      img.alt = `${W.partner1} and ${W.partner2}`;
      img.loading = "lazy";
      if (W.storyPosition) img.style.objectPosition = W.storyPosition;
      $("#storyPhoto").replaceChildren(img);
    }
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--dark").trim();
    if (themeColor) $('meta[name="theme-color"]').content = themeColor;
  }

  /* ---------- Envelope intro ---------- */
  function initIntro() {
    const intro = $("#intro");
    const envelope = $("#envelope");
    let closed = false;

    const finish = () => {
      if (closed) return;
      closed = true;
      intro.classList.add("is-done");
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-ready");
      store.set("std-intro-seen", "1", sessionStorage);
      setTimeout(() => intro.remove(), 1000);
    };

    if (reducedMotion || store.get("std-intro-seen", sessionStorage)) {
      intro.remove();
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-ready");
      return;
    }

    // Seal cracks → flap lifts → card glides out → envelope slips away → site appears
    envelope.addEventListener("click", () => {
      if (intro.classList.contains("is-opening")) return;
      intro.classList.add("is-opening");
      setTimeout(() => intro.classList.add("is-out"), 3700);
      setTimeout(finish, 5200);
    });
    $("#introSkip").addEventListener("click", finish);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") finish(); });
  }

  /* ---------- Falling leaves ---------- */
  function initLeaves() {
    if (reducedMotion) return;
    const box = $("#leaves");
    const colors = ["#6b7a3c", "#8a9a52", "#a4b07a", "#7b1e2f", "#ffffff"];
    const count = window.innerWidth < 600 ? 9 : 16;
    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.innerHTML = '<use href="#leaf" />';
      svg.setAttribute("viewBox", "0 0 40 80");
      const s = 8 + Math.random() * 12;
      svg.style.cssText = [
        `left:${Math.random() * 100}%`,
        `--s:${s}px`,
        `--c:${colors[Math.floor(Math.random() * colors.length)]}`,
        `--t:${14 + Math.random() * 14}s`,
        `--delay:${-Math.random() * 20}s`,
        `--x:${(Math.random() - 0.5) * 260}px`,
        `--rot:${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg`,
      ].join(";");
      box.appendChild(svg);
    }
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const target = new Date(W.date).getTime();
    const els = {};
    $$("[data-unit]").forEach((el) => (els[el.dataset.unit] = el));
    const pad = (n, l = 2) => String(n).padStart(l, "0");

    function render() {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      const next = { days: pad(d, 3), hours: pad(h), minutes: pad(m), seconds: pad(s) };
      Object.entries(next).forEach(([k, v]) => {
        const el = els[k];
        if (el && el.textContent !== v) {
          el.textContent = v;
          if (!reducedMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
        }
      });
      if (target - Date.now() <= 0) {
        $(".hero__sub").textContent = "are married!";
        return;
      }
      setTimeout(render, 1000 - (Date.now() % 1000));
    }
    render();
  }

  /* ---------- Add to calendar ---------- */
  function initCalendar() {
    const start = new Date(W.date);
    const end = new Date(W.endDate || start.getTime() + 8 * 36e5);
    const title = `Wedding of ${W.partner1} & ${W.partner2}`;
    const location = `${W.venue.name}, ${W.venue.address}`;
    const details = `We can't wait to celebrate with you at ${W.venue.name}! RSVP: ${window.location.href}`;
    const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    $("#calGoogle").href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}` +
      `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    $("#calOutlook").href =
      "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
      `&subject=${encodeURIComponent(title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}` +
      `&location=${encodeURIComponent(location)}&body=${encodeURIComponent(details)}`;

    $("#calIcs").addEventListener("click", () => {
      const esc = (t) => t.replace(/([,;\\])/g, "\\$1");
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Save the Date//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${stamp(start)}-wedding@save-the-date`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
        `SUMMARY:${esc(title)}`, `LOCATION:${esc(location)}`, `DESCRIPTION:${esc(details)}`,
        `GEO:${W.venue.lat};${W.venue.lng}`,
        "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:Wedding next week!", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "save-the-date.ics" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      closeMenu();
    });

    const toggle = $("#calToggle");
    const menu = $("#calMenu");
    function closeMenu() { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".cal")) closeMenu(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    $$("#navMenu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

    // Highlight the section in view
    const links = new Map($$("#navMenu a").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        const link = links.get(entry.target.id);
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  /* ---------- Scroll effects: nav state, progress, parallax, back-to-top ---------- */
  function initScroll() {
    const nav = $("#nav");
    const progress = $("#progress");
    const toTop = $("#toTop");
    const heroContent = $("#heroContent");
    const heroBg = $("#heroBg");
    const timeline = $("#timeline");
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;

      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > vh && y > lastY + 4 && !nav.classList.contains("is-open"));
      if (y < lastY - 4) nav.classList.remove("is-hidden");
      lastY = y;

      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      toTop.classList.toggle("is-visible", y > vh * 0.8);

      if (!reducedMotion && y < vh) {
        heroContent.style.transform = `translateY(${y * 0.25}px)`;
        heroContent.style.opacity = String(1 - y / (vh * 0.9));
        heroBg.style.transform = `translateY(${y * 0.4}px)`;
      }

      // Draw the timeline line as it scrolls into view
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      timeline.style.setProperty("--line-progress", p.toFixed(3));
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
    update();
  }

  /* ---------- Reveal on scroll + counters ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        $$("[data-count]", entry.target).forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    $$("[data-reveal]").forEach((el) => io.observe(el));
  }

  function countUp(el) {
    if (el.dataset.text) { el.textContent = el.dataset.text; return; }
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1600;
    const start = performance.now();
    (function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  /* ---------- Card tilt ---------- */
  function initTilt() {
    if (!finePointer || reducedMotion) return;
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Venue map & directions ---------- */
  function initVenue() {
    const { lat, lng, website } = W.venue;
    $("#map").src = `https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed`;
    $("#dirGoogle").href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    $("#dirWaze").href = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    $("#venueSite").href = website;
  }

  /* ---------- Gallery & lightbox ---------- */
  function initGallery() {
    const grid = $("#galleryGrid");

    if (!PHOTOS.length) {
      const ratios = ["4/5", "1/1", "3/4", "4/3", "4/5", "1/1"];
      grid.innerHTML = ratios.map((ar, i) => `
        <div class="gallery__item gallery__item--ph" style="--ar:${ar}" data-reveal>
          <div class="placeholder"><svg><use href="#branch" /></svg><span>Photo ${i + 1}</span></div>
        </div>`).join("");
      grid.insertAdjacentHTML("afterend",
        '<p class="gallery__note">Add your photos to <code>images/gallery/</code> and list them in <code>js/gallery.js</code>.</p>');
      $$(".gallery__item", grid).forEach((el, i) => el.style.setProperty("--d", `${(i % 3) * 0.1}s`));
      return;
    }

    PHOTOS.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__item";
      btn.dataset.caption = p.caption || "";
      btn.dataset.reveal = "";
      btn.style.setProperty("--d", `${(i % 3) * 0.1}s`);
      btn.setAttribute("aria-label", p.caption ? `View photo: ${p.caption}` : `View photo ${i + 1}`);
      const img = new Image();
      img.src = p.src;
      img.alt = p.caption || `${W.partner1} and ${W.partner2}`;
      img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(i));
      grid.appendChild(btn);
    });

    const lb = $("#lightbox");
    const img = $("#lbImg");
    const cap = $("#lbCaption");
    let index = 0;
    let lastFocus = null;

    function show(i) {
      index = (i + PHOTOS.length) % PHOTOS.length;
      const p = PHOTOS[index];
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
      img.src = p.src;
      img.alt = p.caption || "";
      cap.textContent = p.caption || "";
    }
    function openLightbox(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $("#lbClose").focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => show(index - 1));
    $("#lbNext").addEventListener("click", () => show(index + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    let startX = null;
    lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Shared photo album ---------- */
  function initPhotos() {
    const link = $("#albumLink");
    const pending = $("#albumPending");
    if (!link) return;
    if (W.photosUrl) { link.href = W.photosUrl; }
    else { link.hidden = true; pending.hidden = false; }
  }

  /* ---------- FAQ smooth accordion ---------- */
  function initFaq() {
    $$(".faq__item").forEach((item) => {
      const summary = $("summary", item);
      const body = $(".faq__body", item);
      summary.addEventListener("click", (e) => {
        if (reducedMotion || !body.animate) return;
        e.preventDefault();
        if (item.open) {
          const anim = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 350, easing: "ease" });
          anim.onfinish = () => { item.open = false; };
        } else {
          item.open = true;
          body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 400, easing: "cubic-bezier(.22,1,.36,1)" });
        }
      });
    });
  }

  /* ---------- RSVP ---------- */
  function initRsvp() {
    const form = $("#rsvpForm");
    const extra = $("#attendingFields");
    const count = $("#guestCount");
    const guestsInput = $("#guestsInput");
    const namesField = $("#guestNamesField");
    const submit = $("#rsvpSubmit");
    const status = $("#formStatus");
    const fields = form.elements;
    const max = Number(W.maxGuests) || 4;
    let guests = 1;

    const stepButtons = $$("[data-step]", form);
    function setGuests(n) {
      guests = Math.min(max, Math.max(1, n));
      count.textContent = guests;
      guestsInput.value = guests;
      namesField.hidden = guests < 2;
      stepButtons[0].disabled = guests <= 1;
      stepButtons[1].disabled = guests >= max;
    }
    stepButtons.forEach((b) => b.addEventListener("click", () => setGuests(guests + Number(b.dataset.step))));
    setGuests(1);

    // Show the extra questions only when accepting
    const collapse = (on) => { extra.classList.toggle("is-collapsed", on); extra.inert = on; };
    collapse(true);
    $$('input[name="attending"]', form).forEach((r) =>
      r.addEventListener("change", () => {
        collapse(r.value !== "yes" || !r.checked);
        $("#attendingGroup").classList.remove("is-invalid");
      })
    );

    // Clear errors as the guest types
    $$(".field input", form).forEach((input) =>
      input.addEventListener("input", () => input.closest(".field").classList.remove("is-invalid"))
    );

    function validate() {
      let ok = true;
      const flag = (el, bad) => {
        el.classList.remove("is-invalid");
        if (bad) { void el.offsetWidth; el.classList.add("is-invalid"); ok = false; }
      };
      flag($("#name").closest(".field"), !fields.name.value.trim());
      flag($("#email").closest(".field"), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()));
      flag($("#attendingGroup"), !form.querySelector('input[name="attending"]:checked'));
      return ok;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      if (!validate()) {
        const firstBad = $(".is-invalid", form);
        if (firstBad) firstBad.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
        return;
      }
      if (fields.website.value) return; // spam bot filled the honeypot

      const data = Object.fromEntries(new FormData(form));
      delete data.website;
      const attending = data.attending === "yes";
      if (!attending) {
        ["guests", "guestNames", "accommodation", "dietary", "song", "phone"].forEach((k) => delete data[k]);
      }
      data.submittedAt = new Date().toISOString();

      submit.classList.add("is-loading");
      $(".btn__text", submit).textContent = "Sending…";
      try {
        await sendRsvp(data);
        showThanks(data.name.split(" ")[0], attending);
      } catch (err) {
        console.error(err);
        status.textContent = "Sorry, something went wrong. Please try again, or email us directly.";
      } finally {
        submit.classList.remove("is-loading");
        $(".btn__text", submit).textContent = "Send RSVP";
      }
    });

    $("#rsvpAgain").addEventListener("click", () => {
      form.reset();
      setGuests(1);
      collapse(true);
      $("#thanks").hidden = true;
      form.hidden = false;
    });

    function showThanks(firstName, attending) {
      form.hidden = true;
      const thanks = $("#thanks");
      $("#thanksTitle").textContent = attending ? "Hooray!" : "Thank you";
      $("#thanksText").textContent = attending
        ? `Thank you, ${firstName}! We're so excited to celebrate with you under the Waterberg stars on 14 August 2027.`
        : `Thank you for letting us know, ${firstName}. You'll be missed — we'll raise a glass to you!`;
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      if (attending) confetti();
    }
  }

  async function sendRsvp(data) {
    if (W.rsvpEndpoint) {
      // Google Apps Script accepts a simple form post; no-cors means we can't read
      // the reply, so a network failure is the only error we can detect.
      await fetch(W.rsvpEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      return;
    }
    // Demo mode: keep responses in this browser so the form can be tried out.
    const saved = JSON.parse(store.get("std-rsvps") || "[]");
    saved.push(data);
    store.set("std-rsvps", JSON.stringify(saved));
    console.info("[RSVP demo mode] Set rsvpEndpoint in js/config.js to collect real responses.", data);
    await new Promise((r) => setTimeout(r, 900));
  }

  /* ---------- Confetti ---------- */
  function confetti() {
    if (reducedMotion) return;
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#1c2b4a", "#6b7a3c", "#a4b07a", "#7b1e2f", "#a8475a", "#ffffff"];
    const pieces = Array.from({ length: 180 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 6,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      leaf: Math.random() < 0.35,
    }));
    const start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const t = now - start;
      pieces.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 4000);
        ctx.fillStyle = p.c;
        if (p.leaf) { ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 1.4, 0, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * 0.6);
        ctx.restore();
      });
      if (t < 4000) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(start);
  }

  /* ---------- Boot ---------- */
  applyConfig();
  initIntro();
  initLeaves();
  initCountdown();
  initCalendar();
  initNav();
  initGallery();
  initReveal();
  initScroll();
  initTilt();
  initVenue();
  initFaq();
  initPhotos();
  initRsvp();
})();
