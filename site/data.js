/* ==========================================================================
   HibroAura — central content & configuration (frontend phase)
   --------------------------------------------------------------------------
   Everything the interface displays lives here so it can later be replaced
   by Supabase queries without touching the UI code.

   RULES
   • Items with `demo: true` are PLACEHOLDERS for visual review only.
     Replace them with real brand data, then remove the flag.
   • Nothing here is stored or secured — this is public, static content.
   • Never put secret keys in this file.
   ========================================================================== */

window.HA_DATA = {
  /* ---------- Site configuration ---------- */
  config: {
    brandName: "HibroAura",
    tagline: "Herbal hair care & skincare",
    currency: "₹",
    /* WhatsApp number in international format, digits only (e.g. "919876543210").
       Orders submitted on the site open a pre-filled WhatsApp message to this number. */
    whatsappNumber: "918790067693",
    /* Optional: path to the real logo file (e.g. "assets/logo.png").
       When empty, a clean text wordmark is used. */
    logo: "assets/logo-h.png",   /* if the file is missing, a text wordmark is shown instead */
    adminHref: "admin.html",
    maxQuantity: 20,
    showDemoBadges: true
  },

  /* ---------- Announcement bar (genuine, non-promotional) ---------- */
  announcements: [
    "HibroAura — herbal hair care & skincare",
    "Order via WhatsApp and our team will contact you to confirm",
    "Skincare & haircare, made with intention"
  ],

  /* ---------- Offer pop-up (opens once per visit) ----------
     Placeholder text only — no real discount is claimed. Set enabled:false to hide,
     or replace title/text/code with a genuine offer and remove demo:true.        */
  offerPopup: {
    enabled: false, demo: true,
    label: "Special offer",
    title: "Your offer headline",
    text: "Genuine offer details will appear here once supplied.",
    code: "",
    ctaLabel: "Shop Now", ctaHref: "products.html",
    delayMs: 1800
  },

  /* ---------- Categories ---------- */
  categories: [
    { id: "all", label: "All Products" },
    { id: "skin", label: "Skin Care" },
    { id: "hair", label: "Hair Care" }
  ],

  /* ---------- Products (DEMO) ----------
     images: [ main image, hover image ] — put your files in the images/ folder and change the filenames here.
     If a file is missing, the built-in placeholder artwork is shown instead (so the site never looks broken).
     Only one image? Use a single entry:  images: ["images/product-1.png"]                                   */
  products: [
    {
      id: "demo-hair-1", demo: true, featured: true, category: "hair",
      name: "Demo Hair Product One", art: ["pump", "#E9EEE5"],
      images: ["images/product-1.png", "images/product-1-hover.png"],
      description: "Placeholder description for a haircare product.",
      size: "000 ml", price: 0,
      keywords: ["hair", "oil", "scalp"],
      ingredients: null, usage: null
    },
    {
      id: "demo-hair-2", demo: true, category: "hair",
      name: "Demo Hair Product Two", art: ["jar", "#F6E7EB"],
      images: ["images/product-2.png", "images/product-2-hover.png"],
      description: "Placeholder description for a haircare product.",
      size: "000 g", price: 0,
      keywords: ["hair", "mask", "conditioner"],
      ingredients: null, usage: null
    },
    {
      id: "demo-hair-3", demo: true, category: "hair",
      name: "Demo Hair Product Three", art: ["dropper", "#E9EEE5"],
      images: ["images/product-3.png", "images/product-3-hover.png"],
      description: "Placeholder description for a haircare product.",
      size: "000 ml", price: 0,
      keywords: ["hair", "serum"],
      ingredients: null, usage: null
    },
    {
      id: "demo-skin-1", demo: true, featured: true, category: "skin",
      name: "Demo Skin Product One", art: ["dropper", "#F6E7EB"],
      images: ["images/product-4.png", "images/product-4-hover.png"],
      description: "Placeholder description for a skincare product.",
      size: "000 ml", price: 0,
      keywords: ["skin", "face", "serum"],
      ingredients: null, usage: null
    },
    {
      id: "demo-skin-2", demo: true, category: "skin",
      name: "Demo Skin Product Two", art: ["jar", "#E9EEE5"],
      images: ["images/product-5.png", "images/product-5-hover.png"],
      description: "Placeholder description for a skincare product.",
      size: "000 g", price: 0,
      keywords: ["skin", "cream", "moisturiser"],
      ingredients: null, usage: null
    },
    {
      id: "demo-skin-3", demo: true, category: "skin",
      name: "Demo Skin Product Three", art: ["tube", "#F6E7EB"],
      images: ["images/product-6.png", "images/product-6-hover.png"],
      description: "Placeholder description for a skincare product.",
      size: "000 ml", price: 0,
      keywords: ["skin", "cleanser", "face wash"],
      ingredients: null, usage: null
    }
  ],

  /* ---------- Offers ----------
     EMPTY by design: the section stays hidden until genuine offers exist.
     Entry shape: { productId, description, offerPrice, validUntil }          */
  offers: [],

  /* ---------- Ingredients (placeholders — never invent real ones) ----------
     image: the picture inside each round frame — change the filename (files go in images/). Missing file → built-in leaf artwork. */
  ingredients: [
    { demo: true, icon: "leaf", image: "images/ingredient-1.png", name: "Ingredient name", description: "A short, accurate description will appear here once supplied." },
    { demo: true, icon: "sprout", image: "images/ingredient-2.png", name: "Ingredient name", description: "A short, accurate description will appear here once supplied." },
    { demo: true, icon: "flower-2", image: "images/ingredient-3.png", name: "Ingredient name", description: "A short, accurate description will appear here once supplied." },
    { demo: true, icon: "droplets", image: "images/ingredient-4.png", name: "Ingredient name", description: "A short, accurate description will appear here once supplied." }
  ],

  /* ---------- Before & After (authorised images only) ----------
     before/after: image URLs. Empty → a labelled placeholder is shown.         */
  beforeAfter: [
    /* To use real photos: drop the files into the images/ folder, then set the filenames below
       and delete `demo: true`. Use the SAME shape/size for before & after (portrait ~4:4.6 works best).
       Add or remove entries freely — the section adapts to 1, 2, 3 … sets. */
    { demo: true, before: "assets/skin-before-after.jpg", after: "images/after-1.png", alt: "Hair care result", caption: "Authorised before & after images will appear here." },
    { demo: true, before: "assets/hair-before-after.jpg", after: "images/after-2.png", alt: "Skin care result", caption: "Authorised before & after images will appear here." }
  ],

  /* ---------- Testimonials ----------
     Placeholders only. Each real entry: { name, rating (1-5), text, verified:true/false, image:"assets/reviews/name.jpg" (optional result photo), product:"" (optional) }
     Add as many as you like — the wall scrolls automatically. Delete `demo: true` on real ones. */
  testimonials: [
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false, image: "assets/reviews/review-1.jpg" },
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false },
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false, image: "assets/reviews/review-2.jpg" },
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false },
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false, image: "assets/reviews/review-3.jpg" },
    { demo: true, name: "Customer name", rating: 0, text: "Genuine customer reviews will appear here once they have been collected.", verified: false }
  ],

  /* ---------- FAQ ---------- */
  faqs: [
    {
      q: "How do I place an order?",
      a: "Choose a product, pick a quantity and press Order Now. Your order details open in WhatsApp as a ready-to-send message. Review it and send it — we'll then contact you to confirm your order."
    },
    {
      q: "Which products are available?",
      a: "HibroAura offers skincare and haircare. Browse the full range on the Products page.",
    },
    { demo: true, q: "How long does delivery take?", a: "Delivery information will be added once confirmed by HibroAura." },
    { demo: true, q: "What is the returns policy?", a: "Returns information will be added once confirmed by HibroAura." },
    { demo: true, q: "Which payment methods are accepted?", a: "Payment information will be added once confirmed by HibroAura." }
  ],

  /* ---------- Brand content ---------- */
  brand: {
    heroEyebrow: "HIBROAURA",
    heroHeadline: "Botanical care for skin & hair.",
    heroWords: ["skin & hair.", "healthy hair.", "glowing skin.", "every day.", "you."],   /* the word after "Botanical care for" — changes every 2 seconds (keep each under ~14 characters) */
    owner: "",   /* e.g. "Priya Sharma" — shown in the footer as "Founded by …" once filled in */
    heroText: "Herbal hair care and skincare, made with intention.",
    about: {
      label: "ABOUT HIBROAURA",
      headline: "Care, rooted in nature.",
      intro: "HibroAura is a skincare and haircare brand inspired by herbal traditions.",
      story: "Our full brand story and mission will appear here once confirmed.",
      demoNote: "Placeholder copy — final brand messaging to be confirmed.",
      values: [
        { icon: "heart-handshake", title: "Our Values", text: "A short statement of what HibroAura stands for will appear here." },
        { icon: "sprout", title: "Our Approach", text: "A short description of how products are made and chosen will appear here." },
        { icon: "eye", title: "Our Vision", text: "A short statement of where the brand is heading will appear here." }
      ],
      closing: "Care, with intention."
    }
  },

  /* ---------- Contact & social (empty = hidden; never invent) ----------
     Fill in real destinations. Examples:
       whatsapp: "https://wa.me/919876543210", email: "mailto:hello@example.com"   */
  contact: { whatsapp: "", email: "", phone: "", address: "" },   /* WhatsApp link is built from config.whatsappNumber; add email to show the email icon */
  social: { instagram: "https://www.instagram.com/hibro_aura_1625", facebook: "", youtube: "https://youtube.com/@hibroauraofficial" },
  legal: { privacy: "", terms: "" }
};

/* ==========================================================================
   Placeholder illustrations (inline SVG data-URIs)
   Used only because no product photography exists yet. Replace product
   `images` with real photos and these are never shown.
   ========================================================================== */
window.HA_ART = (function () {
  const INK = "#292725", GREEN = "#526447", BURG = "#9B4962";
  const enc = (s) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  const GLASS = { sage: ["#eef3e9", "#bccdb1", "#8fa384"], blush: ["#fdeff2", "#e6bfca", "#c68fa1"] };

  const defs = (g) => `<defs>
    <linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="${g[2]}"/><stop offset=".16" stop-color="${g[1]}"/><stop offset=".4" stop-color="${g[0]}"/><stop offset=".8" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></linearGradient>
    <linearGradient id="cap" x1="0" x2="1"><stop offset="0" stop-color="#1b1918"/><stop offset=".3" stop-color="#58534f"/><stop offset=".6" stop-color="#2c2a28"/><stop offset="1" stop-color="#161413"/></linearGradient>
    <linearGradient id="gcap" x1="0" x2="1"><stop offset="0" stop-color="#394830"/><stop offset=".3" stop-color="#809474"/><stop offset=".65" stop-color="#526447"/><stop offset="1" stop-color="#303b29"/></linearGradient>
    <linearGradient id="bcap" x1="0" x2="1"><stop offset="0" stop-color="#6a2b3d"/><stop offset=".3" stop-color="#c46f8a"/><stop offset=".65" stop-color="#9B4962"/><stop offset="1" stop-color="#5a2335"/></linearGradient>
    <linearGradient id="box" x1="0" x2="1"><stop offset="0" stop-color="#e9e3df"/><stop offset=".25" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#ddd6d1"/></linearGradient>
    <filter id="sh" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="7"/></filter></defs>`;

  const shadow = (cx, rx) => `<ellipse cx="${cx}" cy="341" rx="${rx}" ry="8" fill="${INK}" opacity=".3" filter="url(#sh)"/>`;
  const shine = (x, y, h, w) => `<rect x="${x}" y="${y}" width="${w || 9}" height="${h}" rx="4.5" fill="#fff" opacity=".55"/>`;
  const lbl = (x, y, w, h) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#fff" opacity=".96"/>
    <path d="M${x + w / 2} ${y + h * .2} c-10 7 -12 18 -3 27 c10 -3 15 -16 3 -27z" fill="${GREEN}" opacity=".9"/>
    <path d="M${x + w / 2} ${y + h * .2 + 4} v18" stroke="#fff" stroke-width="1" opacity=".7"/>
    <text x="${x + w / 2}" y="${y + h * .72}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="10" font-weight="600" letter-spacing="1.8" fill="${INK}">HIBROAURA</text>
    <rect x="${x + w / 2 - 16}" y="${y + h * .8}" width="32" height="1.5" fill="${BURG}"/>`;

  const kinds = {
    pump: () => `${shadow(150, 82)}
      <rect x="92" y="142" width="116" height="194" rx="30" fill="url(#gl)"/>${shine(104, 160, 150)}${shine(193, 164, 140, 4).replace('.55', '.2')}
      <rect x="136" y="122" width="28" height="26" fill="url(#gcap)"/><rect x="127" y="112" width="46" height="15" rx="4" fill="url(#gcap)"/>
      <rect x="143" y="88" width="14" height="26" fill="url(#cap)"/><rect x="119" y="64" width="62" height="26" rx="9" fill="url(#cap)"/><rect x="172" y="71" width="34" height="11" rx="5.5" fill="url(#cap)"/>
      ${lbl(106, 196, 88, 112)}`,
    dropper: () => `${shadow(150, 74)}
      <path d="M100 190 q0 -28 30 -32 h40 q30 4 30 32 v126 a22 22 0 0 1 -22 22 h-56 a22 22 0 0 1 -22 -22z" fill="url(#gl)"/>${shine(111, 190, 130)}
      <rect x="132" y="140" width="36" height="22" fill="url(#gcap)"/><rect x="125" y="126" width="50" height="18" rx="4" fill="url(#gcap)"/>
      <rect x="136" y="52" width="28" height="82" rx="14" fill="url(#bcap)"/><rect x="143" y="62" width="5" height="48" rx="2.5" fill="#fff" opacity=".35"/>
      ${lbl(112, 210, 76, 100)}`,
    jar: () => `${shadow(150, 88)}
      <rect x="76" y="192" width="148" height="140" rx="28" fill="url(#gl)"/>${shine(88, 212, 100)}
      <rect x="70" y="144" width="160" height="58" rx="14" fill="url(#gcap)"/>
      <rect x="80" y="150" width="140" height="6" rx="3" fill="#fff" opacity=".22"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${90 + i * 30}" y="162" width="2" height="34" fill="#fff" opacity=".1"/>`).join("")}
      ${lbl(98, 216, 104, 88)}`,
    tube: () => `${shadow(150, 62)}
      <path d="M102 82 h96 l-5 236 q0 10 -10 10 h-66 q-10 0 -10 -10z" fill="url(#gl)"/>${shine(113, 104, 190)}
      <rect x="100" y="58" width="100" height="26" rx="4" fill="url(#gl)"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${106 + i * 11.5}" y="62" width="1.6" height="18" fill="${INK}" opacity=".12"/>`).join("")}
      <rect x="110" y="322" width="80" height="26" rx="8" fill="url(#cap)"/>
      ${lbl(112, 160, 76, 100)}`
  };

  const carton = (c) => `
    <ellipse cx="248" cy="341" rx="44" ry="6" fill="${INK}" opacity=".25" filter="url(#sh)"/>
    <rect x="208" y="214" width="80" height="126" rx="5" fill="url(#box)" stroke="#e3dcd8"/>
    <rect x="208" y="214" width="80" height="26" rx="5" fill="${c}"/>
    <path d="M248 262 c-10 7 -12 19 -3 28 c10 -3 15 -16 3 -28z" fill="${GREEN}" opacity=".9"/>
    <text x="248" y="312" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="600" letter-spacing="1.6" fill="${INK}">HIBROAURA</text>
    <rect x="232" y="318" width="32" height="1.5" fill="${BURG}"/>`;

  function svg(kind, tone, variant) {
    const g = GLASS[tone === "#F6E7EB" ? "blush" : "sage"];
    const two = variant === 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360">${defs(g)}
      <g transform="${two ? "translate(-40,0)" : ""}">${kinds[kind]()}</g>${two ? carton(tone === "#F6E7EB" ? "#F6E7EB" : "#E9EEE5") : ""}</svg>`;
  }
  const uri = (kind, tone, variant) => enc(svg(kind, tone, variant || 1));

  /* Botanical sprig (line + leaves) */
  function sprigInner(color, n, tr) {
    let s = `<g transform="${tr || ""}"><path d="M100 350 C92 250 110 150 100 24" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < n; i++) {
      const y = 322 - i * (270 / n), side = i % 2 ? 1 : -1, sc = 1.15 - (i / n) * .6, op = .95 - (i / n) * .35;
      s += `<g transform="translate(${100 + (i % 2 ? 1 : -1)} ${y}) scale(${side * sc} ${sc}) rotate(-32)" opacity="${op.toFixed(2)}"><path d="M0 0 C16 -16 46 -16 66 0 C46 16 16 16 0 0Z" fill="${color}"/><path d="M4 0 H60" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/></g>`;
    }
    return s + `<ellipse cx="100" cy="20" rx="7" ry="14" fill="${color}"/></g>`;
  }
  const sprig = (color, n) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 360">${sprigInner(color || GREEN, n || 7)}</svg>`);

  function botanical() {
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 600">
      <circle cx="350" cy="190" r="120" fill="#F6E7EB"/>
      ${sprigInner("#6d8460", 8, "translate(160 120) scale(1.35) rotate(-14 100 350)")}
      ${sprigInner(GREEN, 9, "translate(150 60) scale(1.6)")}
      ${sprigInner("#9fb293", 7, "translate(260 150) scale(1.3) rotate(16 100 350)")}
      <circle cx="350" cy="190" r="6" fill="${BURG}"/></svg>`);
  }

  function waves(color) {
    let p = "";
    for (let i = 0; i < 16; i++) p += `<path d="M-20 ${20 + i * 26} q40 -22 80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="${color}" stroke-opacity="${(.12 + (i % 3) * .06).toFixed(2)}" stroke-width="1.6"/>`;
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">${p}</svg>`);
  }

  return { uri, botanical, sprig, waves };
})();

/* Resolve final image list for every product (real URLs win over placeholders). */
window.HA_DATA.products.forEach(function (p) {
  // Built-in placeholder artwork — shown only if an image file listed in `images` is missing.
  p.fallbackImages = [window.HA_ART.uri(p.art[0], p.art[1], 1), window.HA_ART.uri(p.art[0], p.art[1], 2)];
  if (!p.images || !p.images.length) p.images = p.fallbackImages.slice();
  p.tone = p.art ? p.art[1] : "#E9EEE5";
});