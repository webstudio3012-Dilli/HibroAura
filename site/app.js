/* ==========================================================================
   HibroAura — shared behaviour. Reads everything from window.HA_DATA.
   Modules: icons, layout (announce/nav/footer), cards, modal, order, search,
   filters, faq, reveal.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.HA_DATA;
  const C = D.config;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Icons (Lucide-style outline, inline) ---------------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6.4C9.5 13.9 12 13 12 13"/>',
    sprout: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    "flower-2": '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12M12 21a5 5 0 0 0 5-5M12 18a4 4 0 0 1-4-4"/>',
    droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
    "heart-handshake": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "badge-check": '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z"/><path d="m9 12 2 2 4-4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2zM17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    whatsapp: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M9.2 8.6c-.2.9.1 2 1.3 3.3 1.2 1.3 2.4 1.9 3.4 1.8.6-.1 1-.6 1.1-1.1l-1.5-.8-.7.6c-.7-.3-1.5-1-1.9-1.9l.6-.7-.8-1.5c-.5.1-.9.2-1 .3z"/>',
    youtube: '<path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/>'
  };
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }
  // Replace <i data-icon="name"> placeholders in static markup.
  function hydrateIcons(root) {
    $$("i[data-icon]", root || document).forEach((el) => {
      const wrap = document.createElement("span");
      wrap.innerHTML = icon(el.dataset.icon, el.className);
      el.replaceWith(wrap.firstChild);
    });
  }

  /* ---------------- Helpers ---------------- */
  const productById = (id) => D.products.find((p) => p.id === id);
  const catLabel = (id) => (D.categories.find((c) => c.id === id) || {}).label || id;
  const catShort = (id) => (id === "skin" ? "Skin Care" : id === "hair" ? "Hair Care" : id);
  const money = (n) => C.currency + Number(n).toLocaleString("en-IN");
  const effPrice = (p) => (p.salePrice && p.price && p.salePrice < p.price ? p.salePrice : p.price);
  const priceHTML = (p, offerPrice) => {
    offerPrice = offerPrice || (p.salePrice && p.price && p.salePrice < p.price ? p.salePrice : 0);
    if (!p.price && !offerPrice) return '<span class="tbd">Price TBC</span>';
    if (offerPrice && p.price && offerPrice < p.price) return "<s>" + money(p.price) + "</s>" + money(offerPrice);
    return money(offerPrice || p.price);
  };
  const priceText = (p) => (effPrice(p) ? money(effPrice(p)) : "Price TBC");

  /* ---------------- Layout: announcement bar, nav, footer ---------------- */
  const page = document.body.dataset.page || "home";
  const LINKS = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "products", label: "Products", href: "products.html" },
    { id: "offers", label: "Offers", href: "index.html#offers" },
    { id: "testimonials", label: "Testimonials", href: "index.html#testimonials" }
  ];
  const hasOffers = D.offers && D.offers.length > 0;

  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const brand = C.logo
      ? '<img src="' + esc(C.logo) + '" alt="HibroAura — herbal hair care" width="76" height="52">'
      : '<span class="brand__word">HibroAura</span>';
    const links = LINKS.map((l) => {
      const current = l.id === page ? ' aria-current="page"' : "";
      return '<a class="nav__link" href="' + l.href + '"' + current + ">" + l.label + "</a>";
    }).join("");
    // Continuous ticker: the message group is rendered twice so the loop is seamless.
    const msgs = (D.announcements || []).map((t) => '<span class="announce__item">' + esc(t) + '</span><span class="announce__sep">' + icon("leaf") + "</span>").join("");
    const ann = msgs ? '<div class="announce__track"><div class="announce__group">' + msgs + msgs + '</div><div class="announce__group" aria-hidden="true">' + msgs + msgs + "</div></div>" : "";
    host.innerHTML =
      (ann ? '<div class="announce" role="region" aria-label="Announcements">' + ann + "</div>" : "") +
      '<header class="nav"><div class="container nav__inner">' +
      '<a class="brand" href="index.html" aria-label="HibroAura home">' + brand + "</a>" +
      '<nav id="primary-nav" class="nav__links" aria-label="Primary">' + links + "</nav>" +
      '<div class="nav__actions">' +
      '<button class="icon-btn" id="search-open" type="button" aria-label="Search products" aria-haspopup="dialog">' + icon("search") + "</button>" +
      '<a class="icon-btn" href="' + esc(C.adminHref || "admin.html") + '" aria-label="Admin login" title="Admin"' + (page === "admin" ? ' aria-current="page"' : "") + ">" + icon("user") + "</a>" +
      '<button class="icon-btn nav__toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">' + icon("menu") + "</button>" +
      "</div></div></header>";

    logoFallback(host);
    // Compact header once the page is scrolled
    const navEl = $(".nav", host);
    const onScroll = () => navEl.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // Mobile menu
    const toggle = $("#nav-toggle"), nav = $("#primary-nav");
    const setMenu = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = icon(open ? "x" : "menu");
    };
    toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });
    window.matchMedia("(min-width: 861px)").addEventListener("change", () => setMenu(false));

    // Hide Offers link target gracefully when there are no genuine offers
    if (!hasOffers) {
      const o = $$(".nav__link", host).find((a) => a.textContent === "Offers");
      if (o) o.style.display = "none";
    }
  }

  function logoFallback(root) {
    $$(".brand img", root).forEach((img) => img.addEventListener("error", () => {
      const s = document.createElement("span"); s.className = "brand__word"; s.textContent = "HibroAura"; img.replaceWith(s);
    }, { once: true }));
  }

  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    const ct = D.contact || {}, so = D.social || {}, lg = D.legal || {}, br = D.brand || {};
    const num = String(C.whatsappNumber || "").replace(/\D/g, "");
    const waHref = num ? "https://wa.me/" + num + "?text=" + encodeURIComponent("Hello HibroAura, I have a question.") : (ct.whatsapp || "");
    const mail = ct.email ? (/^mailto:/i.test(ct.email) ? ct.email : "mailto:" + ct.email) : "";
    const icons = [
      waHref && { k: "whatsapp", label: "WhatsApp", href: waHref, ext: true },
      mail && { k: "mail", label: "Email", href: mail },
      so.instagram && { k: "instagram", label: "Instagram", href: so.instagram, ext: true },
      so.facebook && { k: "facebook", label: "Facebook", href: so.facebook, ext: true },
      so.youtube && { k: "youtube", label: "YouTube", href: so.youtube, ext: true }
    ].filter(Boolean);
    const social = icons.map((c) => '<a class="ft__icon ft__icon--' + c.k + '" href="' + esc(c.href) + '"' + (c.ext ? ' target="_blank" rel="noopener"' : "") + ' aria-label="' + c.label + '" title="' + c.label + '">' + icon(c.k) + "</a>").join("");
    const legal = [lg.privacy ? '<a href="' + esc(lg.privacy) + '">Privacy Policy</a>' : "", lg.terms ? '<a href="' + esc(lg.terms) + '">Terms</a>' : ""].filter(Boolean).join(" · ");
    const logo = C.logo ? '<img src="' + esc(C.logo) + '" alt="HibroAura — herbal hair care" width="93" height="64">' : '<span class="brand__word">HibroAura</span>';
    const nav = LINKS.filter((l) => l.id !== "offers" || hasOffers).map((l) => '<li><a href="' + l.href + '">' + l.label + "</a></li>").join("");
    host.innerHTML =
      '<footer class="footer ft"><img class="ft__deco" src="' + window.HA_ART.sprig("#6d8460", 9) + '" alt="" aria-hidden="true"><div class="container">' +
      '<div class="ft__grid">' +
      '<div class="ft__col ft__left"><a class="brand" href="index.html" aria-label="HibroAura home">' + logo + "</a>" +
      '<p class="ft__desc">Herbal hair care and skincare, made with intention.</p>' +
      (br.owner ? '<p class="ft__owner">Founded by ' + esc(br.owner) + "</p>" : "") + "</div>" +
      '<nav class="ft__col ft__nav" aria-label="Footer"><h4 class="ft__title">Explore</h4><ul>' + nav + "</ul></nav>" +
      '<div class="ft__col ft__right"><h4 class="ft__title">Get in touch</h4><p class="ft__note">Questions or orders? Message us.</p><div class="ft__social">' + (social || '<span class="footer__muted">Links coming soon</span>') + "</div></div>" +
      '</div><div class="ft__bottom"><p>© ' + new Date().getFullYear() + " HibroAura. All rights reserved.</p>" + (legal ? '<p class="ft__legal">' + legal + "</p>" : "") + "</div></div></footer>";
    logoFallback(host);
  }

  /* ---------------- Product cards ---------------- */
  function cardHTML(p, opts) {
    opts = opts || {};
    const large = opts.large ? " card--large" : "";
    const imgs = p.images.slice(0, 2).map((src, i) => '<img src="' + esc(src) + '" data-fb="' + p.fallbackImages[i] + '" data-pi="' + i + '" alt="' + (i === 0 ? esc(p.name) : esc(p.name) + " — alternate view") + '" loading="lazy" width="300" height="360">').join("");
    const price = priceHTML(p, opts.offerPrice);
    return (
      '<article class="card' + large + ' reveal" style="--i:' + (opts.i || 0) + '" data-id="' + esc(p.id) + '" data-cat="' + esc(p.category) + '">' +
      '<div class="card__media" style="--tone:' + p.tone + '" data-open="' + esc(p.id) + '">' + imgs + '<span class="card__badge">' + catShort(p.category) + "</span>" + (p.demo && C.showDemoBadges ? '<span class="demo-tag">Demo</span>' : "") + '<span class="card__chip">Quick view</span></div>' +
      '<div class="card__body" data-open="' + esc(p.id) + '" role="button" tabindex="0" aria-label="View details for ' + esc(p.name) + '">' +
      '<h3 class="card__name">' + esc(p.name) + "</h3>" +
      '<p class="card__desc">' + esc(opts.offerText || p.description) + "</p>" +
      '<div class="card__meta"><span class="card__size">' + esc(p.size) + '</span><span class="card__price">' + price + "</span></div>" +
      (opts.validUntil ? '<p class="card__valid">Valid until ' + esc(opts.validUntil) + "</p>" : "") +
      "</div>" +
      '<div class="card__foot"><button class="btn btn--block" type="button" data-order="' + esc(p.id) + '">Order Now</button></div>' +
      "</article>"
    );
  }

  /* ---------------- Order flow (customer form → WhatsApp message to the owner) ---------------- */
  const waDigits = () => String(C.whatsappNumber || "").replace(/\D/g, "");
  const tidy = (s) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  const tidyLines = (s) => String(s == null ? "" : s).split(/\r?\n/).map(tidy).filter(Boolean).join(", ");
  function cleanPhone(v) {
    let d = String(v || "").replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return d;
  }
  const PHONE_RE = /^[6-9]\d{9}$/;
  const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]{1,59}$/u;
  function validQty(v) {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= C.maxQuantity ? n : null;
  }
  function buildOrderURL(o) {
    const number = waDigits();
    if (!number) return null;
    const p = o.product;
    const lines = ["*New order — HibroAura*", "", "Name: " + o.name, "Mobile: +91 " + o.phone, "Address: " + o.address, "", "Product: " + p.name, "Size: " + p.size, "Quantity: " + o.qty];
    if (effPrice(p)) { lines.push("Price (each): " + money(effPrice(p))); lines.push("Total: " + money(effPrice(p) * o.qty)); }
    lines.push("", "Please call me to confirm this order. Thank you!");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
  }
  let toastEl, toastTimer;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.setAttribute("role", "status");
      toastEl.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:#292725;color:#fff;padding:14px 20px;border-radius:12px;font-size:.88rem;max-width:min(92vw,460px);z-index:400;opacity:0;transition:opacity .3s,transform .3s;text-align:center";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    requestAnimationFrame(() => { toastEl.style.opacity = 1; toastEl.style.transform = "translateX(-50%)"; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.style.opacity = 0; toastEl.style.transform = "translateX(-50%) translateY(20px)"; }, 4500);
  }

  /* ---------------- Overlay manager (scroll lock, focus return, Escape) ---------------- */
  const stack = [];
  let lastFocus = null;
  function openOverlay(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false;
    // next frame so the transition runs
    requestAnimationFrame(() => el.classList.add("is-open"));
    document.body.classList.add("is-locked");
    stack.push(el);
    setTimeout(() => focusEl && focusEl.focus(), 60);
  }
  function closeOverlay(el) {
    el.classList.remove("is-open");
    const i = stack.indexOf(el); if (i > -1) stack.splice(i, 1);
    if (!stack.length) document.body.classList.remove("is-locked");
    setTimeout(() => { if (!el.classList.contains("is-open")) el.hidden = true; }, reduceMotion ? 0 : 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", (e) => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === "Escape") { closeOverlay(top); return; }
    if (e.key === "Tab") { // keep focus inside the open dialog
      const f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]', top).filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Product modal: details view + order form + confirmation ---------------- */
  let modal, modalProduct;
  const M = (id) => $("#" + id, modal);
  const fieldHTML = (id, label, control) => '<div class="field"><label class="field-label" for="' + id + '">' + label + "</label>" + control + '<span class="field-err" id="' + id + '-err" role="alert"></span></div>';

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "overlay modal-wrap"; modal.hidden = true;
    const options = D.products.map((p) => '<option value="' + esc(p.id) + '">' + esc(p.name) + (p.size ? " — " + esc(p.size) : "") + "</option>").join("");
    modal.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-label="Product details and order form">' +
      '<button class="icon-btn modal__close" type="button" data-close aria-label="Close">' + icon("x") + "</button>" +
      '<div class="modal__media" id="qv-media"></div>' +
      '<div class="modal__body">' +

      /* View 1 — details */
      '<div class="mview" id="view-details">' +
      '<span class="card__cat" id="qv-cat"></span><h2 id="qv-name"></h2>' +
      '<div class="modal__price" id="qv-price"></div><div class="modal__size" id="qv-size"></div>' +
      '<p class="modal__desc" id="qv-desc"></p>' +
      '<div class="modal__sec" id="qv-ing"><h4>Ingredients</h4><p></p></div>' +
      '<div class="modal__sec" id="qv-use"><h4>Benefits</h4><p></p></div>' +
      '<button class="btn btn--block" type="button" id="qv-go-order">Order Now</button>' +
      "</div>" +

      /* View 2 — order form */
      '<form class="mview oform" id="view-order" novalidate hidden>' +
      '<button class="oform__back" type="button" id="of-back">' + icon("arrow-left") + " Back to details</button>" +
      "<h2>Place your order</h2>" +
      '<p class="oform__sub">Fill in your details. WhatsApp will open with your order ready to send, and our team will call you to confirm.</p>' +
      fieldHTML("of-name", "Full name", '<input id="of-name" name="name" type="text" autocomplete="name" maxlength="60" placeholder="Your full name" required aria-describedby="of-name-err">') +
      fieldHTML("of-phone", "Mobile number", '<input id="of-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="16" placeholder="10-digit mobile number" required aria-describedby="of-phone-err">') +
      fieldHTML("of-address", "Delivery address", '<textarea id="of-address" name="address" rows="3" maxlength="300" autocomplete="street-address" placeholder="House no., street, area, city, PIN code" required aria-describedby="of-address-err"></textarea>') +
      fieldHTML("of-product", "Product", '<select id="of-product" name="product" aria-describedby="of-product-err">' + options + "</select>") +
      fieldHTML("of-qty", "Quantity",
        '<div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">' + icon("minus") + "</button>" +
        '<input id="of-qty" name="qty" type="number" inputmode="numeric" min="1" max="' + C.maxQuantity + '" value="1" aria-describedby="of-qty-err">' +
        '<button type="button" data-q="1" aria-label="Increase quantity">' + icon("plus") + "</button></div>") +
      '<p class="oform__total" id="of-total" aria-live="polite"></p>' +
      '<button class="btn btn--block" type="submit" id="of-submit">' + icon("whatsapp") + " Send order on WhatsApp</button>" +
      '<p class="order-msg" id="of-msg" role="status"></p>' +
      "</form>" +

      /* View 3 — confirmation */
      '<div class="mview odone" id="view-done" hidden>' +
      '<span class="odone__tick">' + icon("check") + "</span>" +
      "<h2>One last step</h2>" +
      '<p class="odone__text">WhatsApp should have opened with your order. <strong>Press Send there</strong> so it reaches us. We will call you on <strong id="od-phone"></strong> to confirm.</p>' +
      '<a class="btn btn--block" id="od-again" href="#" target="_blank" rel="noopener">' + icon("whatsapp") + " Open WhatsApp again</a>" +
      '<button class="btn btn--block btn--outline" type="button" data-close>Done</button>' +
      "</div>" +
      "</div></div>";
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close]")) { closeOverlay(modal); return; }
      if (e.target.closest("#qv-go-order")) { showView("order"); return; }
      if (e.target.closest("#of-back")) { showView("details"); return; }
      const q = e.target.closest("[data-q]");
      if (q) {
        const qi = M("of-qty");
        qi.value = Math.min(C.maxQuantity, Math.max(1, (validQty(qi.value) || 1) + Number(q.dataset.q)));
        setErr("of-qty", ""); updateTotal();
      }
    });
    M("of-product").addEventListener("change", (e) => { modalProduct = productById(e.target.value) || modalProduct; paintMedia(); updateTotal(); });
    M("of-qty").addEventListener("input", () => { setErr("of-qty", ""); updateTotal(); });
    M("of-qty").addEventListener("blur", () => { if (validQty(M("of-qty").value) === null) { M("of-qty").value = 1; updateTotal(); } });
    ["of-name", "of-phone", "of-address"].forEach((id) => M(id).addEventListener("input", () => setErr(id, "")));
    M("view-order").addEventListener("submit", onSubmitOrder);
  }

  function setErr(id, msg) {
    const el = M(id), er = M(id + "-err");
    if (er) er.textContent = msg || "";
    if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    if (id !== "of-msg" && M("of-msg")) M("of-msg").textContent = "";
  }
  function paintMedia() {
    const p = modalProduct;
    M("qv-media").style.setProperty("--tone", p.tone);
    M("qv-media").innerHTML = '<img src="' + esc(p.images[0]) + '" data-fb="' + p.fallbackImages[0] + '" alt="' + esc(p.name) + '">' + (p.demo && C.showDemoBadges ? '<span class="demo-tag">Demo content</span>' : "");
  }
  function updateTotal() {
    const q = validQty(M("of-qty").value), p = modalProduct;
    M("of-total").textContent = !p ? "" : effPrice(p) && q ? "Estimated total: " + money(effPrice(p) * q) : "Final price will be confirmed by our team on the call.";
  }
  function showView(name) {
    ["details", "order", "done"].forEach((v) => { M("view-" + v).hidden = v !== name; });
    modal.querySelector(".modal").classList.toggle("is-order", name !== "details");
    modal.querySelector(".modal").scrollTop = 0;
    const focusEl = name === "order" ? M("of-name") : name === "done" ? M("od-again") : M("qv-go-order");
    setTimeout(() => focusEl && focusEl.focus({ preventScroll: true }), 40);
  }
  function openModal(id, view) {
    const p = productById(id); if (!p) return;
    if (!modal) buildModal();
    modalProduct = p;
    paintMedia();
    M("qv-cat").textContent = catShort(p.category);
    M("qv-name").textContent = p.name;
    M("qv-price").innerHTML = priceHTML(p);
    M("qv-size").textContent = p.size;
    M("qv-desc").textContent = p.description;
    const fill = (fid, val) => { const s = M(fid); s.hidden = !val; if (val) $("p", s).textContent = Array.isArray(val) ? val.join(", ") : val; };
    fill("qv-ing", p.ingredients); fill("qv-use", p.usage);
    M("of-product").value = p.id;
    M("of-qty").value = 1;
    ["of-name", "of-phone", "of-address", "of-qty"].forEach((f) => setErr(f, ""));
    M("of-msg").textContent = "";
    updateTotal();
    openOverlay(modal, null);
    showView(view === "order" ? "order" : "details");
  }

  function onSubmitOrder(e) {
    e.preventDefault();
    const name = tidy(M("of-name").value);
    const phone = cleanPhone(M("of-phone").value);
    const address = tidyLines(M("of-address").value);
    const qty = validQty(M("of-qty").value);
    const product = productById(M("of-product").value);
    let first = null;
    const fail = (id, msg) => { setErr(id, msg); if (!first) first = id; };
    if (!NAME_RE.test(name)) fail("of-name", "Please enter your full name (letters only, at least 2 characters).");
    if (!PHONE_RE.test(phone)) fail("of-phone", "Enter a valid 10-digit mobile number.");
    if (address.length < 10) fail("of-address", "Please enter your full address with PIN code.");
    if (address.length > 300) fail("of-address", "Address is too long (max 300 characters).");
    if (qty === null) fail("of-qty", "Choose a quantity between 1 and " + C.maxQuantity + ".");
    if (!product) fail("of-product", "Please choose a product.");
    if (first) { M(first).focus(); return; }
    const url = buildOrderURL({ name, phone, address, qty, product });
    if (!url) { M("of-msg").textContent = "Ordering isn't switched on yet — the WhatsApp number hasn't been configured."; return; }
    const btn = M("of-submit"); btn.disabled = true; setTimeout(() => { btn.disabled = false; }, 2500); // guard against double taps
    window.open(url, "_blank", "noopener");
    if (window.HA_LIVE) window.HA_LIVE.logEnquiry({ name, phone, address, qty, product: product.name, total: effPrice(product) ? effPrice(product) * qty : null });
    M("od-phone").textContent = "+91 " + phone;
    M("od-again").href = url;
    ["of-name", "of-phone", "of-address"].forEach((f) => { M(f).value = ""; });
    M("of-qty").value = 1; updateTotal();
    showView("done");
  }

  /* ---------------- Search ---------------- */
  let searchEl, searchInput, searchList, results = [], active = -1;
  function buildSearch() {
    searchEl = document.createElement("div");
    searchEl.className = "overlay search-ov modal-wrap"; searchEl.hidden = true;
    searchEl.innerHTML =
      '<div class="search" role="dialog" aria-modal="true" aria-label="Search products">' +
      '<div class="search__bar">' + icon("search") +
      '<label class="sr-only" for="search-input">Search products</label>' +
      '<input id="search-input" type="search" placeholder="Search products, e.g. hair or skin" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="search-list">' +
      '<button class="icon-btn" type="button" data-close aria-label="Close search">' + icon("x") + "</button></div>" +
      '<div class="search__list" id="search-list" role="listbox" aria-label="Search results"></div></div>';
    document.body.appendChild(searchEl);
    searchInput = $("#search-input", searchEl); searchList = $("#search-list", searchEl);
    searchEl.addEventListener("click", (e) => {
      if (e.target === searchEl || e.target.closest("[data-close]")) { closeOverlay(searchEl); return; }
      const it = e.target.closest("[data-id]"); if (it) pick(it.dataset.id);
    });
    searchInput.addEventListener("input", () => runSearch(searchInput.value));
    searchInput.addEventListener("keydown", (e) => {
      if (!results.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % results.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((active - 1 + results.length) % results.length); }
      else if (e.key === "Enter") { e.preventDefault(); pick(results[Math.max(active, 0)].id); }
    });
  }
  function pick(id) {
    closeOverlay(searchEl);
    setTimeout(() => openModal(id, "details"), reduceMotion ? 0 : 200);
  }
  function setActive(i) {
    active = i;
    $$(".search__item", searchList).forEach((el, n) => { el.classList.toggle("is-active", n === i); el.setAttribute("aria-selected", n === i); if (n === i) el.scrollIntoView({ block: "nearest" }); });
    if (results[i]) searchInput.setAttribute("aria-activedescendant", "sr-" + results[i].id);
  }
  // true when two words are within one edit (insert / delete / substitute) — forgives small typos
  const withinOneEdit = (a, b) => {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  };
  function scoreProduct(p, q, terms) {
    const name = p.name.toLowerCase();
    const nameWords = name.split(/[^a-z0-9]+/).filter(Boolean);
    const kws = (p.keywords || []).map((k) => String(k).toLowerCase());
    const kwWords = kws.concat(kws.join(" ").split(/\s+/)).filter(Boolean);
    const cats = [p.category, catShort(p.category)].map((c) => String(c).toLowerCase());
    const desc = String(p.description || "").toLowerCase();
    let total = 0;
    if (name === q) total += 100; else if (name.startsWith(q)) total += 60; else if (name.includes(q)) total += 35;
    for (const t of terms) {
      let sc = 0;
      if (nameWords.includes(t)) sc = 12;
      else if (nameWords.some((w) => w.startsWith(t))) sc = 9;
      else if (kwWords.includes(t)) sc = 8;
      else if (kwWords.some((k) => k.startsWith(t))) sc = 6;
      else if (cats.some((c) => c.includes(t))) sc = 5;
      else if (name.includes(t)) sc = 4;
      else if (t.length >= 4 && nameWords.concat(kwWords).some((w) => withinOneEdit(t, w))) sc = 3;
      else if (desc.includes(t)) sc = 1;
      if (!sc) return 0;            // every word typed must match something
      total += sc;
    }
    return total;
  }
  function runSearch(q) {
    q = q.trim().toLowerCase().replace(/\s+/g, " ");
    if (!q) { results = []; active = -1; searchList.innerHTML = '<p class="search__hint">Start typing to search our products.</p>'; return; }
    const terms = q.split(" ");
    results = D.products
      .map((p, i) => ({ p, i, s: scoreProduct(p, q, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .slice(0, 8)
      .map((r) => r.p);
    searchList.innerHTML = results.length
      ? results.map((p, n) => '<button class="search__item" type="button" role="option" id="sr-' + esc(p.id) + '" data-id="' + esc(p.id) + '">' +
          '<span class="search__thumb" style="background:' + p.tone + '"><img src="' + esc(p.images[0]) + '" data-fb="' + p.fallbackImages[0] + '" alt=""></span>' +
          '<span><span class="search__name">' + esc(p.name) + "</span>" + (n === 0 ? '<span class="search__best">Best match</span>' : "") + '<br><span class="search__meta">' + catShort(p.category) + " · " + esc(p.size) + "</span></span>" +
          '<span class="search__price">' + priceText(p) + "</span></button>").join("")
      : '<p class="search__hint">No products found for “' + esc(q) + '”. Try “hair”, “skin” or a product name.</p>';
    if (results.length) setActive(0); else active = -1;   // top result is pre-selected so Enter opens the best match
  }
  function openSearch() {
    if (!searchEl) buildSearch();
    searchInput.value = ""; runSearch("");
    openOverlay(searchEl, searchInput);
  }

  /* ---------------- FAQ accordion ---------------- */
  function renderFAQ() {
    const host = $("#faq-list"); if (!host) return;
    host.innerHTML = D.faqs.map((f, i) =>
      '<div class="faq__item reveal" style="--i:' + i + '"><h3><button class="faq__q" type="button" aria-expanded="false" aria-controls="faq-a' + i + '" id="faq-q' + i + '"><span>' + esc(f.q) + (f.demo ? '<span class="demo-note">(placeholder)</span>' : "") + '</span><span class="faq__sign" aria-hidden="true"></span></button></h3>' +
      '<div class="faq__a" id="faq-a' + i + '" role="region" aria-labelledby="faq-q' + i + '"><div><p>' + esc(f.a) + "</p></div></div></div>").join("");
    host.addEventListener("click", (e) => {
      const b = e.target.closest(".faq__q"); if (!b) return;
      const item = b.closest(".faq__item"), open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
    });
    // Arrow-key / Home / End navigation between questions
    host.addEventListener("keydown", (e) => {
      const qs = $$(".faq__q", host), i = qs.indexOf(document.activeElement);
      if (i < 0) return;
      const map = { ArrowDown: (i + 1) % qs.length, ArrowUp: (i - 1 + qs.length) % qs.length, Home: 0, End: qs.length - 1 };
      if (e.key in map) { e.preventDefault(); qs[map[e.key]].focus(); }
    });
  }

  /* ---------------- Page sections ---------------- */
  function renderHome() {
    const feat = $("#featured-grid");
    if (feat) {
      // Exactly two featured: one hair, one skin
      const hair = D.products.find((p) => p.featured && p.category === "hair") || D.products.find((p) => p.category === "hair");
      const skin = D.products.find((p) => p.featured && p.category === "skin") || D.products.find((p) => p.category === "skin");
      feat.innerHTML = [hair, skin].filter(Boolean).map((p, i) => cardHTML(p, { large: true, i })).join("");
    }
    initHeroRotator();
    const hero = $("#hero-products");
    if (hero) {
      // Decorative hero composition built from the placeholder renders (swap for real photography later)
      const A = window.HA_ART;
      const demoComposition = () =>
        '<img class="hero__sprig hero__sprig--l" src="' + A.sprig("#6d8460", 8) + '" alt="">' +
        '<img class="hero__sprig hero__sprig--r" src="' + A.sprig("#9B4962", 6) + '" alt="">' +
        '<div class="hero__row">' +
        '<img class="hero__p hero__p--a" src="' + A.uri("jar", "#F6E7EB", 1) + '" alt="Skincare jar" width="300" height="360">' +
        '<img class="hero__p hero__p--b" src="' + A.uri("pump", "#E9EEE5", 1) + '" alt="Haircare pump bottle" width="300" height="360">' +
        '<img class="hero__p hero__p--c" src="' + A.uri("dropper", "#F6E7EB", 1) + '" alt="Skincare dropper bottle" width="300" height="360">' +
        "</div>";
      const arch = hero.closest(".hero__arch"), tag = $(".hero__media > .demo-tag");
      const photo = $(".hero__photo", hero);
      // Your hero image (index.html) found → show it; file missing → the original demo artwork, exactly as before
      const usePhoto = () => { arch.classList.add("has-photo"); if (tag) tag.hidden = true; };
      const useDemo = () => { arch.classList.remove("has-photo"); if (tag) tag.hidden = false; hero.innerHTML = demoComposition(); };
      if (!photo) useDemo();
      else if (photo.complete) (photo.naturalWidth > 0 ? usePhoto : useDemo)();
      else { photo.addEventListener("load", usePhoto, { once: true }); photo.addEventListener("error", useDemo, { once: true }); }
    }
    const ing = $("#ingredients-grid");
    if (ing) {
      ing.classList.add("ing-grid");
      ing.innerHTML = D.ingredients.map((g, i) => '<article class="ing reveal" style="--i:' + i + '"><span class="ing__badge">' + icon(g.icon || "leaf") + '</span><span class="ing__art"><img src="' + esc(g.image || "") + '" data-fb="' + window.HA_ART.sprig(["#526447", "#9B4962", "#6d8460", "#526447"][i % 4], 5 + (i % 3)) + '" alt="Ingredient ' + (i + 1) + '"></span><h3>' + esc(g.name) + "</h3><p>" + esc(g.description) + "</p></article>").join("");
      const sec = $("#ingredients");
      if (sec && !$(".ing-deco", sec)) {
        sec.insertAdjacentHTML("afterbegin", '<img class="ing-deco ing-deco--l" src="' + window.HA_ART.sprig("#6d8460", 9) + '" alt="" aria-hidden="true"><img class="ing-deco ing-deco--r" src="' + window.HA_ART.sprig("#9B4962", 7) + '" alt="" aria-hidden="true">');
      }
      initIngredientFx();
    }
    const ba = $("#ba-grid");
    if (ba) {
      const ph = (side) => '<div class="ba__ph ba__ph--' + side + '" style="background-image:url(' + window.HA_ART.waves(side === "before" ? "#526447" : "#9B4962") + ')">' + icon("image") + "<span>Placeholder image</span></div>";
      const layer = (side, src, alt) => '<div class="ba-slider__layer ba-slider__' + side + '">' +
        (src ? '<img src="' + esc(src) + '" alt="' + esc(alt) + '" data-ba="' + side + '" loading="lazy" draggable="false">' : ph(side)) + "</div>";
      ba.dataset.n = String(D.beforeAfter.length);
      ba.innerHTML = D.beforeAfter.map((b, i) => {
        const what = b.alt || ("Example " + (i + 1));
        return '<figure class="ba-slider reveal" style="--i:' + i + ';--pos:50%;margin:0"><div class="ba-slider__frame">' +
          layer("after", b.after, what + " — after") + layer("before", b.before, what + " — before") +
          '<span class="ba__label ba__label--l">BEFORE</span><span class="ba__label ba__label--r">AFTER</span>' +
          '<span class="ba-slider__handle" aria-hidden="true"><span>' + icon("arrow-right").replace("<svg", '<svg style="transform:scaleX(-1)"') + icon("arrow-right") + "</span></span>" +
          '<input class="ba-slider__range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after, example ' + (i + 1) + '">' +
          '</div><figcaption class="ba__cap">' + esc(b.caption || "") + (b.demo ? ' <span class="demo-note">(placeholder)</span>' : "") + "</figcaption></figure>";
      }).join("");
      // If an image file is missing or fails to load, fall back to the labelled placeholder instead of a broken icon
      ba.addEventListener("error", (e) => {
        const img = e.target;
        if (!img || img.tagName !== "IMG" || !img.dataset.ba) return;
        img.parentElement.innerHTML = ph(img.dataset.ba);
      }, true);
      ba.addEventListener("input", (e) => {
        const r = e.target.closest(".ba-slider__range"); if (!r) return;
        r.closest(".ba-slider").style.setProperty("--pos", r.value + "%");
      });
    }
    const off = $("#offers");
    if (off) {
      if (!hasOffers) off.remove();
      else $("#offers-grid").innerHTML = D.offers.map((o, i) => {
        const p = productById(o.productId); if (!p) return "";
        return cardHTML(p, { i, offerPrice: o.offerPrice, offerText: o.description, validUntil: o.validUntil });
      }).join("");
    }
    const rev = $("#reviews-grid");
    if (rev) initReviewWall(rev);
  }

  /* ---------------- Testimonials: auto-scrolling wall (photo + comment cards) ---------------- */
  function initReviewWall(wall) {
    wall.className = "wall";
    const list = D.testimonials || [];
    const real = list.filter((t) => t.rating > 0 && !t.demo);
    if (real.length && !$(".rev-summary")) {
      const avg = real.reduce((a, t) => a + t.rating, 0) / real.length;
      wall.insertAdjacentHTML("beforebegin", '<p class="rev-summary reveal"><span class="stars">' + icon("star").replace("<svg", '<svg fill="currentColor"') + "</span><strong>" + avg.toFixed(1) + "</strong> average from " + real.length + (real.length === 1 ? " review" : " reviews") + "</p>");
    }
    if (!$(".wall__toggle")) {
      wall.insertAdjacentHTML("afterend", '<div class="wall__ctl"><button class="wall__toggle" type="button" aria-pressed="false">Pause scrolling</button></div>');
      $(".wall__toggle").addEventListener("click", (e) => {
        const on = wall.classList.toggle("is-paused");
        e.currentTarget.setAttribute("aria-pressed", String(on));
        e.currentTarget.textContent = on ? "Play scrolling" : "Pause scrolling";
      });
    }
    // Result photos that fail to load: placeholder art for demo entries, otherwise just drop the photo
    wall.addEventListener("error", (e) => {
      const img = e.target;
      if (!img || img.tagName !== "IMG" || !img.dataset.shot) return;
      const fig = img.parentElement;
      if (img.dataset.shot === "demo") fig.innerHTML = '<span class="review__ph" style="background-image:url(' + window.HA_ART.waves("#9B4962") + ')">' + icon("image") + "<span>Result photo</span></span>";
      else fig.remove();
    }, true);

    const card = (t, i, dup) => {
      const stars = t.rating ? Array.from({ length: 5 }, (_, n) => icon("star", n < t.rating ? "" : "off").replace("<svg", '<svg fill="' + (n < t.rating ? "currentColor" : "none") + '"')).join("") : "";
      const initial = esc((String(t.name || "?").trim()[0] || "?").toUpperCase());
      return '<article class="review' + (i % 3 === 2 ? " review--tint" : "") + '">' +
        (t.image ? '<figure class="review__shot"><img src="' + esc(t.image) + '" alt="' + (dup ? "" : esc((t.name || "Customer") + "'s result")) + '" data-shot="' + (t.demo ? "demo" : "real") + '" loading="lazy" draggable="false"></figure>' : "") +
        (t.rating ? '<div class="stars" role="img" aria-label="' + t.rating + ' out of 5 stars">' + stars + "</div>" : "") +
        '<p class="review__text">' + esc(t.text) + "</p>" +
        '<div class="review__foot"><span class="review__avatar" aria-hidden="true">' + initial + '</span><span class="review__who"><strong>' + esc(t.name) + "</strong>" +
        (t.product ? '<span class="review__prod">' + esc(t.product) + "</span>" : "") +
        (t.verified ? '<span class="review__verified">' + icon("badge-check") + "Verified purchase</span>" : "") + (t.demo ? '<span class="demo-note">(placeholder)</span>' : "") + "</span></div></article>";
    };

    let colCount = 0;
    const wanted = () => (window.innerWidth > 960 ? 3 : window.innerWidth > 640 ? 2 : 1);
    function build() {
      colCount = wanted();
      const cols = Array.from({ length: colCount }, () => []);
      list.forEach((t, i) => cols[i % colCount].push({ t, i }));
      wall.innerHTML = cols.map((items, c) => '<div class="wall__col" data-dir="' + (c % 2 ? "down" : "up") + '"><div class="wall__track">' + items.map((x) => card(x.t, x.i, false)).join("") + "</div></div>").join("");
      // Repeat each column's cards until one run is taller than the window, then double it for a seamless loop
      $$(".wall__col", wall).forEach((col, c) => {
        const track = $(".wall__track", col), items = cols[c];
        if (!items.length) return;
        const colH = col.clientHeight || 600, one = track.scrollHeight || 1;
        const k = Math.max(1, Math.ceil(colH / one) + (one < colH ? 1 : 0));
        const run = Array.from({ length: k }, () => items.map((x) => card(x.t, x.i, false)).join("")).join("");
        const dup = Array.from({ length: k }, () => items.map((x) => card(x.t, x.i, true)).join("")).join("");
        track.innerHTML = run + '<div class="wall__dup" aria-hidden="true">' + dup + "</div>";
        const half = track.scrollHeight / 2;
        col.style.setProperty("--dur", Math.max(22, half / 34 * (1 + c * 0.22)).toFixed(1) + "s");
      });
    }
    build();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (wanted() !== colCount) build(); }, 200); });
  }

  /* ---------------- Hero: rotating word after "Botanical care for" ---------------- */
  function initHeroRotator() {
    const rot = $("#hero-rot"); if (!rot || reduceMotion) return;
    const word = $(".rot__word", rot), words = ((D.brand && D.brand.heroWords) || []).filter(Boolean);
    if (!word || words.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      word.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        word.textContent = words[i];
        word.classList.remove("is-out"); word.classList.add("is-pre");
        void word.offsetWidth;                 // restart from below, then slide in
        word.classList.remove("is-pre");
      }, 380);
    }, 2000);
  }

  function renderAbout() {
    const v = $("#values-grid");
    if (v) v.innerHTML = D.brand.about.values.map((x, i) => '<div class="value reveal" style="--i:' + i + '"><span class="ing__icon">' + icon(x.icon) + "</span><h3>" + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div>").join("");
    const m = $("#about-art"); if (m) m.src = window.HA_ART.botanical();
  }

  function renderProductsPage() {
    const grid = $("#products-grid"); if (!grid) return;
    grid.innerHTML = D.products.map((p, i) => cardHTML(p, { i: i % 3 })).join("");
    const f = $("#filters");
    f.innerHTML = D.categories.map((c) => '<button class="pill" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === "all") + '">' + esc(c.label) + "</button>").join("");
    const apply = (cat) => {
      $$(".pill", f).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === cat)));
      let n = 0;
      $$(".card", grid).forEach((c) => {
        const show = cat === "all" || c.dataset.cat === cat;
        c.classList.toggle("is-hidden", !show);
        c.classList.remove("is-in");
        if (show) { void c.offsetWidth; c.classList.add("is-visible"); c.classList.add("is-in"); n++; }
      });
      $("#products-empty").hidden = n > 0;
      $("#products-count").textContent = n + (n === 1 ? " product shown" : " products shown");
      if (history.replaceState) history.replaceState(null, "", cat === "all" ? location.pathname : "#" + cat);
    };
    f.addEventListener("click", (e) => { const b = e.target.closest(".pill"); if (b) apply(b.dataset.cat); });
    const hash = location.hash.slice(1);
    if (D.categories.some((c) => c.id === hash && c.id !== "all")) apply(hash);
  }

  /* ---------------- Ingredients: scroll-linked motion + 3D tilt ---------------- */
  function initIngredientFx() {
    const sec = $("#ingredients"), grid = $("#ingredients-grid");
    if (!sec || !grid || reduceMotion) return;
    let ticking = false;
    const update = () => {            // --sp = how far the section has travelled through the viewport (0 → 1)
      ticking = false;
      const r = sec.getBoundingClientRect(), vh = window.innerHeight || 800;
      sec.style.setProperty("--sp", Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {   // tilt only for mouse / trackpad
      grid.addEventListener("pointermove", (e) => {
        const card = e.target.closest(".ing"); if (!card) return;
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty("--ry", (x * 16).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg");
        card.style.setProperty("--gx", (x * 100 + 50).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100 + 50).toFixed(1) + "%");
        card.classList.add("is-tilting");
      });
      grid.addEventListener("pointerout", (e) => {
        const card = e.target.closest(".ing");
        if (!card || card.contains(e.relatedTarget)) return;
        card.classList.remove("is-tilting");
        ["--rx", "--ry", "--gx", "--gy"].forEach((v) => card.style.removeProperty(v));
      });
    }
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    const els = $$(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach((e) => e.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- Global delegated events (no inline handlers) ---------------- */
  document.addEventListener("click", (e) => {
    const ord = e.target.closest("[data-order]");
    if (ord) { e.stopPropagation(); openModal(ord.dataset.order, "order"); return; }   // Order Now → order form
    const open = e.target.closest("[data-open]");
    if (open) { openModal(open.dataset.open, "details"); return; }
    if (e.target.closest("#search-open")) openSearch();
  });
  document.addEventListener("keydown", (e) => {
    const open = e.target.closest && e.target.closest('[data-open][role="button"]');
    if (open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(open.dataset.open, "details"); }
  });

  /* ---------------- Offer pop-up (shown once per browser session) ---------------- */
  function initOfferPopup() {
    const o = D.offerPopup;
    if (!o || !o.enabled) return;
    const freq = o.frequency || "session", KEY = "ha_offer_seen";
    const store = () => (freq === "daily" ? localStorage : sessionStorage);
    try {
      const v = freq === "always" ? null : store().getItem(KEY);
      if (v && (freq !== "daily" || Date.now() - Number(v) < 864e5)) return;
    } catch (e) { /* storage unavailable: still show */ }
    const link = String(o.ctaHref || "");
    const href = /^(https?:\/\/|mailto:|tel:)/i.test(link) || /^[\w.\/#?=&%-]+$/.test(link) ? link : "products.html";   // blocks javascript: links
    const el = document.createElement("div");
    el.className = "overlay modal-wrap"; el.hidden = true;
    el.innerHTML =
      '<div class="offer" role="dialog" aria-modal="true" aria-labelledby="offer-title">' +
      '<button class="icon-btn offer__close" type="button" data-close aria-label="Close offer">' + icon("x") + "</button>" +
      (o.image ? '<img class="offer__img" src="' + esc(o.image) + '" alt="" width="440" height="240">' : '<img class="offer__sprig offer__sprig--l" src="' + window.HA_ART.sprig("#6d8460", 7) + '" alt=""><img class="offer__sprig offer__sprig--r" src="' + window.HA_ART.sprig("#9B4962", 6) + '" alt="">') +
      '<div class="offer__body">' +
      '<span class="offer__label">' + esc(o.label || "Special offer") + "</span>" +
      '<h2 id="offer-title">' + esc(o.title) + "</h2>" +
      "<p>" + esc(o.text) + "</p>" +
      (o.code ? '<div class="offer__code"><span>Use code</span><strong>' + esc(o.code) + "</strong></div>" : "") +
      '<a class="btn btn--block" href="' + esc(href) + '">' + esc(o.ctaLabel || "Shop Now") + "</a>" +
      '<button class="offer__skip" type="button" data-close>No thanks</button>' +
      (o.demo ? '<span class="demo-note">Demo offer — replace in data.js</span>' : "") +
      "</div></div>";
    document.body.appendChild(el);
    el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-close]")) closeOverlay(el); });
    const show = () => {
      if (stack.length) { setTimeout(show, 4000); return; }   // another dialog is open: retry shortly instead of skipping
      openOverlay(el, $(".offer__close", el));
      try { store().setItem(KEY, String(Date.now())); } catch (e) { /* ignore */ }
    };
    setTimeout(show, o.delayMs || 1800);
  }

  /* ---------------- Floating WhatsApp button ---------------- */
  function initWhatsAppFab() {
    const b = document.createElement("button");
    b.className = "wa-fab"; b.type = "button"; b.setAttribute("aria-label", "Chat with HibroAura on WhatsApp");
    b.innerHTML = icon("message-circle");
    b.addEventListener("click", () => {
      const n = String(C.whatsappNumber || "").replace(/\D/g, "");
      if (!n) { toast("WhatsApp isn't set up yet. Add the number to config.whatsappNumber in data.js."); return; }
      window.open("https://wa.me/" + n + "?text=" + encodeURIComponent("Hello HibroAura, I have a question."), "_blank", "noopener");
    });
    document.body.appendChild(b);
  }

  /* ---------------- Init ---------------- */
  /* Any <img data-fb="…"> whose file is missing swaps to its built-in placeholder artwork */
  function imgFallback(img) {
    if (!img || img.tagName !== "IMG" || !img.dataset.fb) return;
    if (img.dataset.pi === "1" && !img.dataset.dup) {          // missing hover image → reuse the main image (no visible swap)
      const first = img.parentElement && img.parentElement.querySelector('img[data-pi="0"]');
      if (first && first.dataset.fb) { img.dataset.dup = "1"; img.src = first.getAttribute("src"); return; }
    }
    const fb = img.dataset.fb; img.removeAttribute("data-fb"); img.src = fb;
  }
  document.addEventListener("error", (e) => imgFallback(e.target), true);

  function init() {
    renderHeader(); renderFooter();
    renderHome(); renderAbout(); renderProductsPage(); renderFAQ();
    hydrateIcons();
    initReveal();
    initWhatsAppFab();
    initOfferPopup();
    $$("img[data-fb]").forEach((img) => { if (img.complete && img.naturalWidth === 0) imgFallback(img); });   // images that failed before this ran
  }
  const ready = window.HA_READY || Promise.resolve();
  const start = () => ready.then(init, init);   // wait for live content (falls back to defaults on error)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();