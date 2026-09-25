/* ==========================================================================
   Landing page — envelope intro, countdown, add-to-calendar.
   Settings come from js/config.js, the same file the full site uses.
   ========================================================================== */
(function () {
  "use strict";

  const W = window.WEDDING || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* storage unavailable */ } },
  };

  /* ---------- Fill text from config ---------- */
  function applyConfig() {
    const values = {
      partner1: W.partner1,
      partner2: W.partner2,
      coupleShort: `${W.partner1} & ${W.partner2}`,
      initials: W.initials,
      hashtag: W.hashtag,
      dateLine: W.dateLine,
      "venue.name": W.venue && W.venue.name,
      "venue.area": W.venue && W.venue.area,
    };
    $$("[data-config]").forEach((el) => {
      const v = values[el.dataset.config];
      if (v) el.textContent = v;
    });
    $$("[data-config-href]").forEach((el) => {
      const email = W[el.dataset.configHref];
      if (email) { el.href = `mailto:${email}`; el.textContent = email; }
    });
    document.title = `${W.partner1} & ${W.partner2} · Save the Weekend · 13–15 August 2027`;
    $("#venueSite").href = W.venue.website;

    // The link through to the full site appears only once siteLive is true
    const full = $("#fullSite");
    if (full && W.siteLive) full.hidden = false;

    if (W.heroImage) {
      const bg = $("#heroBg");
      bg.style.backgroundImage = `url("${W.heroImage}")`;
      bg.classList.add("has-photo");
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
      store.set("std-intro-seen", "1");
      setTimeout(() => intro.remove(), 1200);
    };

    if (reducedMotion || store.get("std-intro-seen")) {
      intro.remove();
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-ready");
      return;
    }

    // Seal cracks → flap lifts → card glides out → envelope slips away → page appears
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
      svg.style.cssText = [
        `left:${Math.random() * 100}%`,
        `--s:${8 + Math.random() * 12}px`,
        `--c:${colors[Math.floor(Math.random() * colors.length)]}`,
        `--t:${14 + Math.random() * 14}s`,
        `--delay:${-Math.random() * 20}s`,
        `--x:${(Math.random() - 0.5) * 260}px`,
        `--rot:${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg`,
      ].join(";");
      box.appendChild(svg);
    }
  }

  /* ---------- Countdown to the ceremony ---------- */
  function initCountdown() {
    const target = new Date(W.weddingDay).getTime();
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

  /* ---------- Add the whole weekend to a calendar ---------- */
  function initCalendar() {
    const start = new Date(W.weekendStart);
    const end = new Date(W.weekendEnd);
    const title = `Wedding weekend: ${W.partner1} & ${W.partner2}`;
    const place = `${W.venue.name}, ${W.venue.address}`;
    const details = `Save the weekend! ${W.partner1} and ${W.partner2} are getting married on Saturday 14 August 2027 at ${W.venue.name}. Arrive Friday, leave Sunday. Formal invitation and RSVP to follow.`;
    const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    $("#calGoogle").href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}` +
      `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(place)}`;
    $("#calOutlook").href =
      "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
      `&subject=${encodeURIComponent(title)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}` +
      `&location=${encodeURIComponent(place)}&body=${encodeURIComponent(details)}`;

    $("#calIcs").addEventListener("click", () => {
      const esc = (t) => t.replace(/([,;\\])/g, "\\$1");
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Save the Date//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${stamp(start)}-wedding@save-the-date`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
        `SUMMARY:${esc(title)}`, `LOCATION:${esc(place)}`, `DESCRIPTION:${esc(details)}`,
        `GEO:${W.venue.lat};${W.venue.lng}`,
        "BEGIN:VALARM", "TRIGGER:-P30D", "ACTION:DISPLAY", "DESCRIPTION:Wedding weekend in a month!", "END:VALARM",
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

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    $$("[data-reveal]").forEach((el) => io.observe(el));
  }

  applyConfig();
  initIntro();
  initLeaves();
  initCountdown();
  initCalendar();
  initReveal();
})();
