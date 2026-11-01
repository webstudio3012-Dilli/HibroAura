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
        sb.from("testimonials").select("*").eq("status", "approved").order("created_at", { ascending: false })
      ]);
      if (s.error) throw s.error; if (p.error) throw p.error; if (t.error) throw t.error;
      const S = {}; s.data.forEach((r) => { S[r.key] = r.value; });

      // Products (database is the source of truth once at least one product exists)
      if (p.data.length) {
        D.products.splice(0, D.products.length, ...p.data.map((r) => {
          const img = https(r.image_url);
          const o = {
            id: r.id, category: r.category, name: r.name, description: r.description || "", size: r.size || "",
            price: Number(r.price) || 0, salePrice: Number(r.sale_price) || 0, featured: !!r.featured,
            keywords: r.name.toLowerCase().split(/\W+/).filter(Boolean).concat([r.category, r.category === "hair" ? "hair care" : "skin care"]),
            ingredients: r.ingredients || null, usage: r.benefits || null, art: art(r.category)
          };
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
      if (t.data.length) D.testimonials = t.data.map((r) => ({ name: r.name, text: r.text, rating: r.rating || 0, result: r.result || "", verified: false }));
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

  /* Share-your-experience form (saved as Pending; shown on the site only after the owner approves it) */
  document.addEventListener("DOMContentLoaded", function () {
    const host = document.querySelector("#testimonials .container"); if (!host) return;
    const stars = [5, 4, 3, 2, 1].map((n) =>
      '<input type="radio" name="rv-rating" id="rv-r' + n + '" value="' + n + '">' +
      '<label for="rv-r' + n + '" title="' + n + (n > 1 ? " stars" : " star") + '"><span aria-hidden="true">★</span><span class="sr-only">' + n + " out of 5</span></label>").join("");
    host.insertAdjacentHTML("beforeend",
      '<form class="rvform" id="rev-form" novalidate aria-labelledby="rv-title">' +
      '<div class="rvform__head"><h3 id="rv-title">Share your experience</h3><p>Tell us how HibroAura worked for you. Reviews appear after our team approves them.</p></div>' +
      '<div class="rvform__row">' +
      '<div class="field"><label class="field-label" for="rv-name">Your name</label><input id="rv-name" maxlength="60" autocomplete="name" required></div>' +
      '<fieldset class="rv-rate" id="rv-rate"><legend class="field-label">Your rating</legend><div class="rv-stars">' + stars + "</div></fieldset></div>" +
      '<div class="field"><label class="field-label" for="rv-result">Result you noticed <span class="rvform__opt">(optional)</span></label><input id="rv-result" maxlength="80" placeholder="e.g. Less hair fall in 4 weeks"></div>' +
      '<div class="field"><label class="field-label" for="rv-text">Your experience</label><textarea id="rv-text" rows="4" maxlength="600" placeholder="A few lines about the product and what you liked…" required></textarea><span class="rvform__count" id="rv-count">0 / 600</span></div>' +
      '<input class="rv-hp" id="rv-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="btn btn--block" type="submit">Submit review</button><p class="rvform__msg" id="rv-msg" role="status"></p></form>');
    const f = document.getElementById("rev-form"), msg = document.getElementById("rv-msg"), txt = f.querySelector("#rv-text");
    const say = (t, kind) => { msg.textContent = t; msg.className = "rvform__msg" + (kind ? " is-" + kind : ""); };
    const bad = (el, t) => { el.setAttribute("aria-invalid", "true"); say(t, "err"); el.focus && el.focus(); };
    txt.addEventListener("input", () => { f.querySelector("#rv-count").textContent = txt.value.length + " / 600"; });
    f.addEventListener("input", (e) => { if (e.target.removeAttribute) e.target.removeAttribute("aria-invalid"); if (msg.classList.contains("is-err")) say(""); });
    f.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = f.querySelector("#rv-name").value.trim(), text = txt.value.trim(), result = f.querySelector("#rv-result").value.trim();
      const chosen = f.querySelector('input[name="rv-rating"]:checked');
      f.querySelectorAll("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid"));
      if (name.length < 2) return bad(f.querySelector("#rv-name"), "Please enter your name.");
      if (!chosen) return bad(f.querySelector("#rv-r5"), "Please choose a star rating.");
      if (text.length < 10) return bad(txt, "Please share at least a few words about your experience (10+ characters).");
      if (f.querySelector("#rv-hp").value) { f.reset(); say("Thank you! Your review was received and will appear once approved.", "ok"); return; }   // spam trap
      const btn = f.querySelector("button[type=submit]"); btn.disabled = true; say("Sending…");
      const r = await sb.from("testimonials").insert({ name, text, rating: Number(chosen.value), result: result || null, status: "pending" });
      btn.disabled = false;
      if (r.error) { say("Sorry, your review could not be sent. Please try again later.", "err"); console.error(r.error); return; }
      f.reset(); f.querySelector("#rv-count").textContent = "0 / 600";
      say("Thank you! Your review was received and will appear once approved.", "ok");
    });
  });
})();