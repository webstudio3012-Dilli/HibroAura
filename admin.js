/* HibroAura admin. Talks to Supabase with the owner's login session; every write is also
   enforced server-side by Row Level Security, so this UI is a convenience, not the security boundary. */
(function () {
  "use strict";
  const cfg = window.HA_SUPABASE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const root = $("#admin-root"), EMAIL_DOMAIN = "@hibroaura.app";
  const NAV = [["dashboard", "Dashboard"], ["media", "Site images"], ["products", "Products"], ["testimonials", "Testimonials"], ["offer", "Offer popup"], ["settings", "Settings"]];
  let sb, S = {}, view = "dashboard", ft;

  function flash(msg, err) { const f = $("#flash"); f.textContent = msg; f.className = err ? "err" : ""; f.style.display = "block"; clearTimeout(ft); ft = setTimeout(() => { f.style.display = "none"; }, 4200); }
  function el(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }   // template keeps <tr>/<td> intact
  const field = (id, label, control, cls) => el('<div class="afield ' + (cls || "") + '"><label for="' + id + '">' + esc(label) + "</label>" + control + "</div>");
  const httpsOk = (u) => !u || /^https:\/\/[^\s]+$/i.test(u);

  if (!cfg.url || /YOUR_/.test(cfg.url) || !window.supabase) {
    root.innerHTML = '<div class="login"><div class="login__card"><h1>Setup needed</h1><p>Add your Supabase URL and anon key to <code>supabase-config.js</code>, then reload. See README.md.</p></div></div>'; return;
  }
  sb = window.supabase.createClient(cfg.url, cfg.anonKey);

  /* ---------- Auth ---------- */
  async function isOwner(uid) { const r = await sb.from("admins").select("user_id").eq("user_id", uid).maybeSingle(); return !!(r.data && !r.error); }
  function loginView(msg) {
    root.innerHTML = '<div class="login"><form class="login__card" id="lf" novalidate><h1>Owner login</h1><p class="muted">HibroAura admin — authorised access only.</p>' +
      '<div class="afield"><label for="u">Username</label><input id="u" autocomplete="username" required></div>' +
      '<div class="afield"><label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required></div>' +
      '<p class="login__err" id="le" role="alert">' + esc(msg || "") + '</p><button class="btn btn--block" type="submit">Sign in</button><a href="index.html" style="text-align:center;font-size:.85rem">← Back to website</a></form></div>';
    $("#lf").onsubmit = async (e) => {
      e.preventDefault();
      const u = $("#u").value.trim(), p = $("#p").value, err = $("#le"), btn = $("#lf button");
      if (!u || !p) { err.textContent = "Enter your username and password."; return; }
      btn.disabled = true; err.textContent = "";
      const r = await sb.auth.signInWithPassword({ email: u.includes("@") ? u : u.toLowerCase() + EMAIL_DOMAIN, password: p });
      if (r.error || !r.data.user) { err.textContent = "Incorrect username or password."; btn.disabled = false; return; }
      if (!(await isOwner(r.data.user.id))) { await sb.auth.signOut(); err.textContent = "This account is not authorised for admin access."; btn.disabled = false; return; }
      boot();
    };
  }
  async function boot() {
    const { data } = await sb.auth.getSession();
    if (!data.session || !(await isOwner(data.session.user.id))) { loginView(); return; }
    await loadSettings(); shell();
  }
  async function loadSettings() { const r = await sb.from("site_settings").select("key,value"); if (r.error) { flash("Could not load settings: " + r.error.message, 1); return; } S = {}; r.data.forEach((x) => { S[x.key] = x.value; }); }
  async function saveSetting(key, value) { const r = await sb.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" }); if (r.error) throw r.error; S[key] = value; }

  /* ---------- Shell ---------- */
  function shell() {
    root.innerHTML = '<div class="shell"><header class="topbar"><b id="tb-title">HibroAura admin</b><button type="button" id="menu" aria-expanded="false" aria-controls="nav">Menu</button></header><nav class="side" id="nav" aria-label="Admin"><div class="side__brand">HibroAura admin</div>' +
      NAV.map((n) => '<button type="button" data-v="' + n[0] + '">' + n[1] + "</button>").join("") +
      '<button type="button" onclick="location.href=\'index.html\'">View website ↗</button><button type="button" class="side__out" id="out">Log out</button></nav><main class="main" id="view"></main></div>';
    root.querySelectorAll("[data-v]").forEach((b) => { b.onclick = () => go(b.dataset.v); });
    const nav = $("#nav"), menu = $("#menu");
    const closeMenu = () => { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.textContent = "Menu"; };
    menu.onclick = () => { const o = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(o)); menu.textContent = o ? "Close" : "Menu"; };
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    root.querySelectorAll("[data-v]").forEach((b) => b.addEventListener("click", closeMenu));
    $("#out").onclick = async () => { await sb.auth.signOut(); loginView(); };
    go(view);
  }
  async function go(v) {
    view = v; root.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-current", String(b.dataset.v === v)));
    const tt = $("#tb-title"); if (tt) tt.textContent = (NAV.find((n) => n[0] === v) || [])[1] || "HibroAura admin"; window.scrollTo(0, 0);
    const m = $("#view"); m.innerHTML = '<p class="muted">Loading…</p>';
    try { await ({ dashboard, media, products, testimonials, offer, settings })[v](m); labelTables(m); } catch (e) { console.error(e); m.innerHTML = '<p class="login__err">Something went wrong: ' + esc(e.message || e) + "</p>"; }
  }

  // Phones show each table row as a card; this copies the column headings onto cells as labels
  function labelTables(scope) {
    scope.querySelectorAll("table").forEach((t) => {
      const h = [...t.querySelectorAll("tr")].find((r) => r.querySelector("th")); if (!h) return;
      h.classList.add("th"); const L = [...h.children].map((x) => x.textContent.trim());
      t.querySelectorAll("tr:not(.th)").forEach((r) => [...r.children].forEach((c, i) => { if (c.tagName === "TD" && !c.hasAttribute("colspan") && L[i]) c.setAttribute("data-label", L[i]); }));
    });
  }

  /* ---------- Reusable pieces ---------- */
  const OK = ["image/jpeg", "image/png", "image/webp"], EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  function checkFile(f) { if (!OK.includes(f.type)) return "Only JPG, PNG or WebP images are allowed."; if (f.size > 3 * 1024 * 1024) return "Image must be 3 MB or smaller."; return ""; }
  async function upload(f, folder) {
    const path = folder + "/" + crypto.randomUUID() + "." + EXT[f.type];
    const r = await sb.storage.from("site-media").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
    if (r.error) throw r.error; return sb.storage.from("site-media").getPublicUrl(path).data.publicUrl;
  }
  // Image picker: preview → (on Save) upload → returns public URL, or null to restore the built-in default
  function imgField(label, url, folder, hint) {
    const w = el('<div class="imgf"><div class="imgf__prev"></div><div class="imgf__ctl"><strong>' + esc(label) + "</strong>" + (hint ? "<small>" + esc(hint) + "</small>" : "") + '<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="' + esc(label) + '"><button type="button">Remove / restore default</button></div></div>');
    const prev = $(".imgf__prev", w), inp = $("input", w); let file = null, cleared = false;
    const show = (u) => { prev.innerHTML = u ? '<img src="' + esc(u) + '" alt="">' : "<span>Default image</span>"; };
    show(url);
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; const e = checkFile(f); if (e) { flash(e, 1); inp.value = ""; return; } file = f; cleared = false; show(URL.createObjectURL(f)); };
    $("button", w).onclick = () => { file = null; cleared = true; inp.value = ""; show(""); };
    return { el: w, get: async () => (file ? upload(file, folder) : cleared ? null : url || null) };
  }
  function card(title, desc, parts, save, btnText) {
    const c = el('<section class="acard"><h3>' + esc(title) + "</h3>" + (desc ? '<p class="muted">' + esc(desc) + "</p>" : "") + '<div class="acard__body"></div><div class="acard__foot"><button class="btn" type="button">' + (btnText || "Save changes") + "</button></div></section>");
    parts.forEach((p) => $(".acard__body", c).appendChild(p.el || p));
    const b = $(".btn", c);
    b.onclick = async () => { b.disabled = true; b.textContent = "Saving…"; try { await save(); flash("Saved ✓"); } catch (e) { console.error(e); flash("Could not save: " + (e.message || e), 1); } b.disabled = false; b.textContent = btnText || "Save changes"; };
    return c;
  }
  const head = (m, t) => { m.innerHTML = "<h1>" + esc(t) + "</h1>"; };

  /* ---------- Dashboard ---------- */
  async function dashboard(m) {
    const count = async (t, f) => { let q = sb.from(t).select("id", { count: "exact", head: true }); if (f) q = f(q); const r = await q; return r.error ? "–" : r.count; };
    const [np, nt, npend, ne, enq, prod] = await Promise.all([count("products"), count("testimonials", (q) => q.eq("status", "approved")), count("testimonials", (q) => q.eq("status", "pending")), count("enquiries"),
    sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(8), sb.from("products").select("name,updated_at").order("updated_at", { ascending: false }).limit(5)]);
    head(m, "Dashboard");
    const pend = Number(npend) > 0;
    m.insertAdjacentHTML("beforeend", '<div class="stats">' + [[np, "Products", "products"], [nt, "Approved testimonials", "testimonials"], [npend, "Pending approvals", "testimonials", pend], [ne, "Customer enquiries", ""]].map((s) => '<button type="button" class="stat' + (s[3] ? " stat--alert" : "") + '"' + (s[2] ? ' data-go="' + s[2] + '"' : " disabled") + "><b>" + s[0] + "</b><span>" + s[1] + "</span>" + (s[3] ? "<em>Review now →</em>" : "") + "</button>").join("") + "</div>" +
      '<section class="acard"><h3>Recent customer enquiries</h3><p class="muted">Logged when a customer opens the WhatsApp order message. These are not confirmed orders — confirm each one with the customer.</p><div class="scroll"><table class="tbl"><tr><th>When</th><th>Customer</th><th>Phone</th><th>Product</th><th>Qty</th><th>Total</th></tr>' +
      ((enq.data || []).map((e) => "<tr><td>" + new Date(e.created_at).toLocaleString("en-IN") + "</td><td>" + esc(e.customer_name) + "</td><td>" + esc(e.phone) + "</td><td>" + esc(e.product_name) + "</td><td>" + esc(e.quantity) + "</td><td>" + (e.total ? "₹" + esc(e.total) : "–") + "</td></tr>").join("") || '<tr><td colspan="6">No enquiries yet.</td></tr>') + '</table></div></section>' +
      '<section class="acard"><h3>Recent product updates</h3><div class="scroll"><table class="tbl">' + ((prod.data || []).map((p) => "<tr><td>" + esc(p.name) + "</td><td>" + new Date(p.updated_at).toLocaleString("en-IN") + "</td></tr>").join("") || "<tr><td>No products yet.</td></tr>") + "</table></div></section>");
    m.querySelectorAll("[data-go]").forEach((b) => { b.onclick = () => go(b.dataset.go); });
  }

  /* ---------- Site images (logo, hero, featured, ingredients, before/after) ---------- */
  async function media(m) {
    head(m, "Site images");
    const logo = imgField("Website logo", S.logo, "logo", "Shown in the header and footer.");
    const hero = imgField("Hero image", S.hero_image, "hero", "Keep a portrait ratio (about 4:5) to match the hero frame.");
    m.append(card("Logo", "Upload, replace or remove the logo.", [logo], async () => saveSetting("logo", await logo.get())));
    m.append(card("Hero section image", "Replaces the main image in the hero.", [hero], async () => saveSetting("hero_image", await hero.get())));
    const fi = S.featured_images || {}, f = { hh: imgField("Hair product — main", (fi.hair || [])[0], "featured"), hv: imgField("Hair product — hover", (fi.hair || [])[1], "featured"), sh: imgField("Skin product — main", (fi.skin || [])[0], "featured"), sv: imgField("Skin product — hover", (fi.skin || [])[1], "featured") };
    m.append(card("Discover Your Essentials", "Images for the two featured cards. Remove to restore the product's own image.", Object.values(f), async () => saveSetting("featured_images", { hair: [await f.hh.get(), await f.hv.get()], skin: [await f.sh.get(), await f.sv.get()] })));
    const ing = [0, 1, 2, 3].map((i) => imgField("Ingredient " + (i + 1), (S.ingredient_images || [])[i], "ingredients"));
    m.append(card("Ingredients We Use", "Round images in the ingredients section.", ing, async () => { const out = []; for (const g of ing) out.push(await g.get()); await saveSetting("ingredient_images", out); }));
    m.append(baCard());
  }
  function baCard() {
    const c = el('<section class="acard"><h3>Before &amp; After</h3><p class="muted">Genuine, authorised images only. Use the same shape for both. Deleting all pairs restores the built-in placeholders.</p><div class="ba-list"></div><div class="acard__foot"><button class="btn btn--outline" type="button" data-add>Add pair</button><button class="btn" type="button" data-save>Save changes</button></div></section>');
    const list = $(".ba-list", c), rows = [];
    function add(p) {
      p = p || {}; const row = el('<div class="ba-row"></div>'), b = imgField("Before", p.before, "before-after"), a = imgField("After", p.after, "before-after"), cap = el('<input maxlength="120" placeholder="Caption (optional)" aria-label="Caption">'), del = el('<button class="mini danger" type="button">Delete pair</button>');
      cap.value = p.caption || ""; const ent = { b, a, cap, gone: false };
      del.onclick = () => { if (confirm("Delete this before/after pair?")) { ent.gone = true; row.remove(); } };
      row.append(b.el, a.el, cap, del); list.append(row); rows.push(ent);
    }
    (S.before_after || []).forEach(add);
    $("[data-add]", c).onclick = () => add();
    const save = $("[data-save]", c);
    save.onclick = async () => {
      save.disabled = true;
      try {
        const out = [];
        for (const r of rows.filter((x) => !x.gone)) { const before = await r.b.get(), after = await r.a.get(); if (!before || !after) throw new Error("Each pair needs both a Before and an After image."); out.push({ before, after, caption: r.cap.value.trim() }); }
        await saveSetting("before_after", out); flash("Saved ✓");
      } catch (e) { flash("Could not save: " + (e.message || e), 1); }
      save.disabled = false;
    };
    return c;
  }

  /* ---------- Products ---------- */
  async function products(m, editing) {
    head(m, "Products");
    const r = await sb.from("products").select("*").order("sort_order").order("created_at"); if (r.error) throw r.error;
    const add = el('<button class="btn" type="button" style="margin-bottom:18px">+ Add product</button>'); m.append(add);
    const formHost = el("<div></div>"); m.append(formHost);
    add.onclick = () => productForm(formHost, null, () => go("products"));
    const t = el('<section class="acard"><div class="scroll"><table class="tbl"><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></table></div></section>');
    r.data.forEach((p) => {
      const tr = el('<tr><td><img src="' + esc(p.image_url || "") + '" alt="" onerror="this.style.visibility=\'hidden\'"></td><td>' + esc(p.name) + "</td><td>" + esc(p.category) + "</td><td>" + (p.sale_price ? "<s>₹" + esc(p.price) + "</s> ₹" + esc(p.sale_price) : "₹" + esc(p.price)) + "</td><td>" + (p.available ? "Available" : "Hidden") + (p.featured ? " · Featured" : "") + '</td><td class="acts"><button class="mini" data-e>Edit</button><button class="mini danger" data-d>Delete</button></td></tr>');
      $("[data-e]", tr).onclick = () => { productForm(formHost, p, () => go("products")); formHost.scrollIntoView({ behavior: "smooth" }); };
      $("[data-d]", tr).onclick = async () => { if (!confirm('Delete "' + p.name + '"? This removes it from the website.')) return; const d = await sb.from("products").delete().eq("id", p.id); if (d.error) flash(d.error.message, 1); else { flash("Product deleted"); go("products"); } };
      $("table", t).append(tr);
    });
    if (!r.data.length) $("table", t).insertAdjacentHTML("beforeend", '<tr><td colspan="6">No products yet — the website is showing its demo products. Add your first product above.</td></tr>');
    m.append(t);
  }
  function productForm(host, p, done) {
    host.innerHTML = ""; p = p || {};
    const main = imgField("Product image", p.image_url, "products"), hov = imgField("Hover image (optional)", p.hover_image_url, "products");
    const body = [
      field("pf-name", "Product name", '<input id="pf-name" maxlength="120" value="' + esc(p.name) + '">'),
      field("pf-cat", "Category", '<select id="pf-cat"><option value="hair"' + (p.category === "hair" ? " selected" : "") + '>Hair Care</option><option value="skin"' + (p.category === "skin" ? " selected" : "") + ">Skin Care</option></select>"),
      el('<div class="grid2"></div>'), main, hov,
      field("pf-desc", "Description", '<textarea id="pf-desc" rows="3" maxlength="2000">' + esc(p.description) + "</textarea>"),
      field("pf-ben", "Benefits", '<textarea id="pf-ben" rows="2" maxlength="2000">' + esc(p.benefits) + "</textarea>"),
      field("pf-ing", "Ingredients", '<textarea id="pf-ing" rows="2" maxlength="2000">' + esc(p.ingredients) + "</textarea>"),
      el('<div class="grid2"></div>'), field("pf-av", "Available for ordering", '<input id="pf-av" type="checkbox"' + (p.available === false ? "" : " checked") + ">", "chk"), field("pf-ft", "Featured (shown in “Discover Your Essentials”, one per category)", '<input id="pf-ft" type="checkbox"' + (p.featured ? " checked" : "") + ">", "chk")];
    body[2].append(field("pf-price", "Price (₹)", '<input id="pf-price" type="number" min="0" step="0.01" value="' + esc(p.price == null ? "" : p.price) + '">'), field("pf-sale", "Discounted price (₹, optional)", '<input id="pf-sale" type="number" min="0" step="0.01" value="' + esc(p.sale_price == null ? "" : p.sale_price) + '">'));
    body[8].append(field("pf-size", "Size (e.g. 100 ml)", '<input id="pf-size" maxlength="40" value="' + esc(p.size) + '">'), field("pf-ord", "Display order (lower shows first)", '<input id="pf-ord" type="number" step="1" value="' + esc(p.sort_order || 0) + '">'));
    const c = card(p.id ? "Edit product" : "New product", "", body, async () => {
      const v = (id) => $("#" + id, c).value.trim(), name = v("pf-name"), price = Number(v("pf-price") || 0), sale = v("pf-sale") === "" ? null : Number(v("pf-sale"));
      if (name.length < 2) throw new Error("Enter a product name."); if (!(price >= 0)) throw new Error("Enter a valid price.");
      if (sale !== null && (!(sale >= 0) || (price && sale >= price))) throw new Error("Discounted price must be lower than the price.");
      const row = { name, category: v("pf-cat"), description: v("pf-desc"), benefits: v("pf-ben"), ingredients: v("pf-ing"), size: v("pf-size"), price, sale_price: sale, available: $("#pf-av", c).checked, featured: $("#pf-ft", c).checked, sort_order: parseInt(v("pf-ord") || "0", 10) || 0, image_url: await main.get(), hover_image_url: await hov.get(), updated_at: new Date().toISOString() };
      if (row.featured) { const u = await sb.from("products").update({ featured: false }).eq("category", row.category).neq("id", p.id || "00000000-0000-0000-0000-000000000000"); if (u.error) throw u.error; }
      const r = p.id ? await sb.from("products").update(row).eq("id", p.id) : await sb.from("products").insert(row);
      if (r.error) throw r.error; done();
    }, p.id ? "Save product" : "Add product");
    host.append(c);
  }

  /* ---------- Testimonials ---------- */
  async function testimonials(m) {
    head(m, "Testimonials");
    const r = await sb.from("testimonials").select("*").order("created_at", { ascending: false }); if (r.error) throw r.error;
    const sec = el('<section class="acard"><p class="muted">Only <b>Approved</b> testimonials appear on the website.</p><div class="scroll"><table class="tbl"><tr><th>Date</th><th>Customer</th><th>Result</th><th>Review</th><th>Rating</th><th>Status</th><th></th></tr></table></div></section>');
    const setStatus = async (id, status) => { const u = await sb.from("testimonials").update({ status }).eq("id", id); if (u.error) flash(u.error.message, 1); else { flash("Updated ✓"); go("testimonials"); } };
    r.data.forEach((t) => {
      const tr = el("<tr><td>" + new Date(t.created_at).toLocaleDateString("en-IN") + "</td><td>" + esc(t.name) + "</td><td>" + esc(t.result || "–") + "</td><td>" + esc(t.text) + "</td><td>" + (t.rating ? "★".repeat(t.rating) : "–") + '</td><td><span class="pill-s ' + esc(t.status) + '">' + esc(t.status) + '</span></td><td class="acts"></td></tr>');
      const acts = $(".acts", tr), b = (txt, cls, fn) => { const x = el('<button class="mini ' + cls + '" type="button">' + txt + "</button>"); x.onclick = fn; acts.append(x); };
      if (t.status !== "approved") b("Approve", "", () => setStatus(t.id, "approved"));
      if (t.status !== "rejected") b(t.status === "approved" ? "Unpublish" : "Reject", "danger", () => setStatus(t.id, "rejected"));
      b("Delete", "danger", async () => { if (!confirm("Permanently delete this testimonial?")) return; const d = await sb.from("testimonials").delete().eq("id", t.id); if (d.error) flash(d.error.message, 1); else go("testimonials"); });
      $("table", sec).append(tr);
    });
    if (!r.data.length) $("table", sec).insertAdjacentHTML("beforeend", '<tr><td colspan="7">No testimonials submitted yet.</td></tr>');
    m.append(sec);
  }

  /* ---------- Offer popup ---------- */
  async function offer(m) {
    head(m, "Offer popup"); const o = S.offer || {}, img = imgField("Offer image (optional)", o.image, "offer", "Shown at the top of the popup.");
    const parts = [field("o-on", "Show the offer popup on the website", '<input id="o-on" type="checkbox"' + (o.enabled ? " checked" : "") + ">", "chk"),
    field("o-label", "Small label", '<input id="o-label" maxlength="30" value="' + esc(o.label || "Special offer") + '">'), field("o-title", "Title", '<input id="o-title" maxlength="80" value="' + esc(o.title) + '">'),
    field("o-text", "Description", '<textarea id="o-text" rows="3" maxlength="240">' + esc(o.text) + "</textarea>"), field("o-code", "Coupon code (optional)", '<input id="o-code" maxlength="30" value="' + esc(o.code) + '">'),
    field("o-cta", "Button text", '<input id="o-cta" maxlength="30" value="' + esc(o.ctaLabel || "Shop Now") + '">'), field("o-href", "Button link (e.g. products.html or https://…)", '<input id="o-href" maxlength="300" value="' + esc(o.ctaHref || "products.html") + '">'),
    field("o-freq", "How often to show it", '<select id="o-freq"><option value="session">Once per visit</option><option value="daily">Once per day</option><option value="always">Every page load</option></select>'), img];
    const c = card("Offer popup", "The popup shows the latest saved offer, only while enabled.", parts, async () => {
      const v = (id) => $("#" + id, c).value.trim(), on = $("#o-on", c).checked, href = v("o-href");
      if (on && v("o-title").length < 2) throw new Error("Enter an offer title before enabling the popup.");
      if (!(/^(https?:\/\/|mailto:|tel:)/i.test(href) || /^[\w.\/#?=&%-]+$/.test(href))) throw new Error("The button link isn't valid.");
      await saveSetting("offer", { enabled: on, label: v("o-label"), title: v("o-title"), text: v("o-text"), code: v("o-code"), ctaLabel: v("o-cta"), ctaHref: href, frequency: v("o-freq"), delayMs: 1800, image: await img.get() });
    }); $("#o-freq", c).value = o.frequency || "session"; m.append(c);
  }

  /* ---------- Website settings ---------- */
  async function settings(m) {
    head(m, "Website settings"); const an = S.announcement || {};
    const parts = [field("s-wa", "Owner WhatsApp number (country code + number, digits only)", '<input id="s-wa" inputmode="numeric" maxlength="15" value="' + esc(S.whatsapp) + '" placeholder="918790067693">'),
    field("s-mail", "Contact email", '<input id="s-mail" type="email" maxlength="120" value="' + esc(S.email) + '">'), field("s-ig", "Instagram link", '<input id="s-ig" type="url" maxlength="200" value="' + esc(S.instagram) + '" placeholder="https://www.instagram.com/…">'),
    field("s-fb", "Facebook link", '<input id="s-fb" type="url" maxlength="200" value="' + esc(S.facebook) + '" placeholder="https://www.facebook.com/…">'),
    field("s-an", "Announcement bar text", '<input id="s-an" maxlength="160" value="' + esc(an.text) + '">'), field("s-anv", "Show the announcement bar", '<input id="s-anv" type="checkbox"' + (an.visible === false ? "" : " checked") + ">", "chk")];
    const c = card("Contact, social & announcement", "Logo and offer popup have their own sections.", parts, async () => {
      const v = (id) => $("#" + id, c).value.trim(), wa = v("s-wa").replace(/\D/g, "");
      if (wa && (wa.length < 11 || wa.length > 15)) throw new Error("WhatsApp number must include the country code, e.g. 918790067693.");
      if (!httpsOk(v("s-ig")) || !httpsOk(v("s-fb"))) throw new Error("Social links must start with https://");
      if (v("s-mail") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("s-mail"))) throw new Error("Enter a valid email address.");
      await saveSetting("whatsapp", wa); await saveSetting("email", v("s-mail")); await saveSetting("instagram", v("s-ig")); await saveSetting("facebook", v("s-fb"));
      await saveSetting("announcement", { text: v("s-an"), visible: $("#s-anv", c).checked });
    }); m.append(c);
  }

  boot();
})();