/* HibroAura — loads live content from Supabase and overlays it on window.HA_DATA before app.js renders.
   If Supabase is not configured or unreachable, the built-in defaults in data.js are shown (and the error is logged). */
(function () {
  "use strict";
  const cfg = window.HA_SUPABASE || {}, D = window.HA_DATA;
  const configured = cfg.url && cfg.anonKey && !/YOUR_/.test(cfg.url) && window.supabase;
  if (!configured) { window.HA_READY = Promise.resolve(); return; }
  const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
  const https = (u) => (/^https:\/\//i.test(u || "") ? u : "");
  const art = (c) => (c === "hair" ? ["pump", "#E9EEE5"] : ["jar", "#F6E7EB"]);
  const heroImg = document.querySelector(".hero__photo");

  window.HA_READY = (async function () {
    try {
      const [s, p, t] = await Promise.all([
        sb.from("site_settings").select("key,value"),
        sb.from("products").select("*").eq("available", true).order("sort_order").order("created_at"),
        sb.from("testimonials").select("name,text,rating").eq("status", "approved").order("created_at", { ascending: false })
      ]);
      if (s.error) throw s.error; if (p.error) throw p.error; if (t.error) throw t.error;
      const S = {}; s.data.forEach((r) => { S[r.key] = r.value; });

      // Products (database is the source of truth once at least one product exists)
      if (p.data.length) {
        D.products.splice(0, D.products.length, ...p.data.map((r) => {
          const img = https(r.image_url);
          const o = { id: r.id, category: r.category, name: r.name, description: r.description || "", size: r.size || "",
            price: Number(r.price) || 0, salePrice: Number(r.sale_price) || 0, featured: !!r.featured,
            keywords: r.name.toLowerCase().split(/\W+/).filter(Boolean).concat([r.category, r.category === "hair" ? "hair care" : "skin care"]),
            ingredients: r.ingredients || null, usage: r.benefits || null, art: art(r.category) };
          o.fallbackImages = [D_ART(o.art, 1), D_ART(o.art, 2)];
          o.images = img ? [img, https(r.hover_image_url) || img] : o.fallbackImages.slice();
          o.tone = o.art[1];
          return o;
        }));
      }
      function D_ART(a, v) { return window.HA_ART.uri(a[0], a[1], v); }

      // "Discover Your Essentials" image overrides (the featured hair + skin product)
      const fi = S.featured_images || {};
      ["hair", "skin"].forEach((c) => {
        const pr = D.products.find((x) => x.featured && x.category === c) || D.products.find((x) => x.category === c);
        const im = fi[c] || [];
        if (pr && https(im[0])) pr.images = [im[0], https(im[1]) || im[0]];
      });

      // Branding & contact
      if (https(S.logo)) D.config.logo = S.logo;
      if (https(S.hero_image) && heroImg) heroImg.src = S.hero_image;
      if (S.whatsapp) D.config.whatsappNumber = String(S.whatsapp);
      if (S.email) D.contact.email = S.email;
      if (https(S.instagram)) D.social.instagram = S.instagram;
      if (https(S.facebook)) D.social.facebook = S.facebook;
      if (S.announcement) D.announcements = S.announcement.visible && S.announcement.text ? [S.announcement.text] : [];
      if (S.offer) D.offerPopup = Object.assign({}, S.offer, { demo: false });

      // Images for sections
      (S.ingredient_images || []).forEach((u, i) => { if (https(u) && D.ingredients[i]) D.ingredients[i].image = u; });
      if (Array.isArray(S.before_after) && S.before_after.length)
        D.beforeAfter = S.before_after.filter((b) => https(b.before) && https(b.after)).map((b) => ({ before: b.before, after: b.after, alt: b.caption || "Result", caption: b.caption || "" }));

      // Only approved testimonials are ever returned by the database
      if (t.data.length) D.testimonials = t.data.map((r) => ({ name: r.name, text: r.text, rating: r.rating || 0, verified: false }));
    } catch (err) {
      console.error("HibroAura: live content failed to load — showing built-in defaults.", err);
    }
  })();

  window.HA_LIVE = {
    // Best-effort log of an order attempt (NOT a confirmed order — the customer still has to send the WhatsApp message)
    logEnquiry: function (e) {
      sb.from("enquiries").insert({ customer_name: e.name, phone: e.phone, product_name: e.product, quantity: e.qty, total: e.total, address: e.address })
        .then((r) => { if (r.error) console.warn("Enquiry not saved:", r.error.message); });
    }
  };

  /* Testimonial submission form (saved as Pending; shown only after the owner approves) */
  document.addEventListener("DOMContentLoaded", function () {
    const host = document.querySelector("#testimonials .container"); if (!host) return;
    host.insertAdjacentHTML("beforeend",
      '<form class="oform" id="rev-form" novalidate style="max-width:560px;margin:48px auto 0">' +
      '<h3 style="margin:0 0 6px">Share your experience</h3><p class="oform__sub">Reviews appear on the site after our team approves them.</p>' +
      '<div class="field"><label class="field-label" for="rv-name">Your name</label><input id="rv-name" maxlength="60" required></div>' +
      '<div class="field"><label class="field-label" for="rv-rating">Rating</label><select id="rv-rating"><option value="5">★★★★★ (5)</option><option value="4">★★★★ (4)</option><option value="3">★★★ (3)</option><option value="2">★★ (2)</option><option value="1">★ (1)</option></select></div>' +
      '<div class="field"><label class="field-label" for="rv-text">Your review</label><textarea id="rv-text" rows="4" maxlength="600" required></textarea></div>' +
      '<button class="btn btn--block" type="submit">Submit review</button><p class="order-msg" id="rv-msg" role="status"></p></form>');
    const f = document.getElementById("rev-form"), msg = document.getElementById("rv-msg");
    f.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = f.querySelector("#rv-name").value.trim(), text = f.querySelector("#rv-text").value.trim();
      if (name.length < 2 || text.length < 10) { msg.textContent = "Please enter your name and a review of at least 10 characters."; return; }
      const btn = f.querySelector("button"); btn.disabled = true; msg.textContent = "Sending…";
      const r = await sb.from("testimonials").insert({ name, text, rating: Number(f.querySelector("#rv-rating").value), status: "pending" });
      btn.disabled = false;
      if (r.error) { msg.textContent = "Sorry, your review could not be sent. Please try again later."; console.error(r.error); return; }
      f.reset(); msg.textContent = "Thank you! Your review was received and will appear once approved.";
    });
  });
})();
