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

  /* ---------- Language ----------
     English is written in index.html. Add ?lang=af to the address for Afrikaans: each element
     marked data-i18n="key" (or data-i18n-label for its aria-label) takes its text from AF. */
  const lang = document.documentElement.lang === "af" ? "af" : "en";
  const AF = {
    invitation: "Uitnodiging",
    invited: "Jy is genooi",
    openInvitation: "Maak die uitnodiging oop",
    saveWeekend: "Hou die naweek oop",
    dates: "13 – 15 Augustus 2027",
    tapSeal: "Tik op die seël om oop te maak",
    gettingMarried: "gaan trou",
    fri: "Vr",
    sat: "Sa",
    sun: "So",
    friNote: "Die fees begin",
    satNote: "Ons sê ‘ja’",
    sunNote: "Tot weersiens",
    month: "Augustus 2027",
    days: "Dae",
    hours: "Ure",
    minutes: "Minute",
    seconds: "Sekondes",
    addCalendar: "Voeg by kalender",
    seeVenue: "Sien die trouplek",
    fullSite: "Alle besonderhede &amp; RSVP",
    scrollDown: "Rol af",
    weekendEyebrow: "Kom ons maak 'n naweek daarvan",
    weekendTitle: "Want een dag is net nie genoeg nie",
    weekendLead: "Dit sal vir ons 'n eer wees om die naweek saam met jou deur te bring terwyl ons ons troue vier. Eerder as net 'n troudag, wil ons 'n hele naweek saam met die mense wat ons die liefste het. Ons het ons gunstelingmense bymekaargemaak, 'n pragtige plekkie in die Waterberg gevind, en die hele lodge is net vir ons. Kom ontspan, kom tot rus, geniet die bosveld, en deel 'n paar wonderlike dae saam met ons.",
    friday: "Vrydag",
    saturday: "Saterdag",
    sunday: "Sondag",
    aug13: "13 Augustus",
    aug14: "14 Augustus",
    aug15: "15 Augustus",
    fridayText: "Kom in die middag aan, maak jou tuis en ontspan net. Wanneer die son sak, kuier ons om die vuur by 'n feestelike braai voor die troue, met goeie geselskap en baie gelag. Die perfekte begin van 'n wonderlike naweek.",
    saturdayText: "Die dag waarvan ons al so lank droom, met die mense wat ons die liefste het om ons. Ons sê ‘ja’ en vier die begin van ons lewe saam.",
    sundayText: "Voordat almal huis toe gaan, eet ons nog een laaste keer saam ontbyt, en lag ons oor die beste stories en oomblikke van die vorige aand.",
    note: "Die formele uitnodiging, met al die troubesonderhede, RSVP en verblyfreëlings volg nader aan die tyd.",
    noteSmall: "En jy hoef nie te bekommer nie — die lodge het genoeg kamers vir almal.",
    footerDate: "14 Augustus 2027",
    footerPlace: "Kuthaba Bush Lodge · Waterberg · Suid-Afrika",
    questions: "Enige vrae? E-pos ons by",
    orWhatsapp: "of kontak ons via WhatsApp",
    venueArea: "Waterberg, Limpopo · Suid-Afrika",
    married: "is getroud!",
    reminder: "Trounaweek oor 'n maand!",
  };
  const t = (key, english) => (lang === "af" && AF[key]) || english;

  function applyLanguage() {
    if (lang === "af") {
      $$("[data-i18n]").forEach((el) => { if (AF[el.dataset.i18n]) el.innerHTML = AF[el.dataset.i18n]; });
      $$("[data-i18n-label]").forEach((el) => { if (AF[el.dataset.i18nLabel]) el.setAttribute("aria-label", AF[el.dataset.i18nLabel]); });
    }
    document.documentElement.classList.add("is-translated"); // reveals the text (see css/landing.css)
  }

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
      "venue.area": W.venue && t("venueArea", W.venue.area),
    };
    $$("[data-config]").forEach((el) => {
      const v = values[el.dataset.config];
      if (v) el.textContent = v;
    });
    $$("[data-config-href]").forEach((el) => {
      const email = W[el.dataset.configHref];
      if (email) { el.href = `mailto:${email}`; el.textContent = email; }
    });
    document.title = `${W.partner1} & ${W.partner2} · ${t("saveWeekend", "Save the Weekend")} · ${t("dates", "13–15 August 2027").replace(/ – /, "–")}`;
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
        $(".hero__sub").textContent = t("married", "are married!");
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
    const title = lang === "af"
      ? `Trounaweek: ${W.partner1} & ${W.partner2}`
      : `Wedding weekend: ${W.partner1} & ${W.partner2}`;
    const place = `${W.venue.name}, ${W.venue.address}`;
    const details = lang === "af"
      ? `Hou die naweek oop! ${W.partner1} en ${W.partner2} trou op Saterdag 14 Augustus 2027 by ${W.venue.name}. Kom Vrydag aan, vertrek Sondag. Die formele uitnodiging en RSVP volg.`
      : `Save the weekend! ${W.partner1} and ${W.partner2} are getting married on Saturday 14 August 2027 at ${W.venue.name}. Arrive Friday, leave Sunday. Formal invitation and RSVP to follow.`;
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
        "BEGIN:VALARM", "TRIGGER:-P30D", "ACTION:DISPLAY", `DESCRIPTION:${t("reminder", "Wedding weekend in a month!")}`, "END:VALARM",
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
  /* ---------- Date tiles ----------
     Each flips from its photo to its date once on its own (CSS). After that, or if tapped
     before then, a tap flips it back and forth between the photo and the date. */
  function initTiles() {
    $$(".hero__day").forEach((tile) => {
      const flip = $(".hero__day-flip", tile);
      let flipping = false;
      const settle = (showDate) => {
        tile.classList.add("is-settled"); // swaps the one-off animation for tap-driven flips
        tile.classList.toggle("shows-date", showDate);
      };
      if (reducedMotion) settle(true); // the dates show from the start

      flip.addEventListener("animationstart", (e) => { if (e.animationName === "tileFlip") flipping = true; });
      flip.addEventListener("animationend", (e) => {
        if (e.animationName !== "tileFlip") return;
        flipping = false;
        settle(true);
      });

      const toggle = () => {
        if (flipping) return; // let its own flip finish first
        if (!tile.classList.contains("is-settled")) {
          settle(false); // still showing its photo: take over from the timer
          void flip.offsetWidth; // so the flip below animates from the photo
        }
        tile.classList.toggle("shows-date");
      };
      tile.setAttribute("role", "button");
      tile.tabIndex = 0;
      tile.addEventListener("click", toggle);
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

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

  applyLanguage();
  applyConfig();
  initIntro();
  initLeaves();
  initCountdown();
  initCalendar();
  initTiles();
  initReveal();
})();
