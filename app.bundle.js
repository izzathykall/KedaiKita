(() => {
  // viewport-fit.js
  (() => {
    "use strict";
    const app = document.getElementById("gameApp");
    if (!app) return;
    const root = document.documentElement;
    const body = document.body;
    const visual = window.visualViewport;
    const MAX_WIDTH = 1800;
    const MIN_SCALE = 0.75;
    const EPSILON = 3e-3;
    let pending = 0, active = false;
    let lastBodyClass = body.className;
    app.classList.add("game-viewport-fit");
    function screen() {
      const width = Math.max(1, root.clientWidth || window.innerWidth);
      const layoutH = Math.max(1, root.clientHeight || window.innerHeight);
      const visH = visual?.height || layoutH;
      const height = visual && visual.scale === 1 && visH < layoutH - 2 ? Math.max(1, Math.min(layoutH, visH + Math.max(0, visual.offsetTop || 0))) : layoutH;
      return { width, height, layoutH };
    }
    function apply(zoom, height) {
      const s = Math.max(MIN_SCALE, Math.min(1, zoom));
      app.style.setProperty("--game-zoom", String(Math.round(s * 1e4) / 1e4));
      app.style.setProperty("--game-layout-height", Math.max(1, Math.floor((height - 0.5) / s)) + "px");
      app.style.setProperty("--game-max-width", Math.round(MAX_WIDTH / s) + "px");
      return s;
    }
    function visible(el) {
      return el && getComputedStyle(el).display !== "none";
    }
    function measure() {
      const origin = app.getBoundingClientRect().top;
      const gameStyle = getComputedStyle(app);
      const bottomPad = parseFloat(gameStyle.paddingBottom) || 0;
      let bottom = Math.max(app.scrollHeight, app.clientHeight);
      let right = Math.max(app.scrollWidth, app.clientWidth);
      const children = [
        ".topbar",
        ".utility-bar",
        ".operations-bar",
        ".mobile-tabs",
        ".game-grid",
        ".work-area",
        ".store-scene",
        ".belt-section",
        ".stations",
        ".shift-footer",
        ".pos-panel",
        ".pos-foot"
      ];
      for (const selector of children) {
        const el = app.querySelector(selector);
        if (!visible(el)) continue;
        const rect2 = el.getBoundingClientRect();
        const localBottom = rect2.bottom - origin;
        bottom = Math.max(bottom, localBottom + bottomPad);
        if ([".game-grid", ".work-area", ".pos-panel", ".stations"].includes(selector)) {
          const localRight = rect2.right - app.getBoundingClientRect().left;
          right = Math.max(right, localRight);
        }
      }
      return { width: right, height: bottom };
    }
    function fit() {
      pending = 0;
      if (active) return;
      if (document.activeElement?.matches('input,textarea,[contenteditable="true"]')) return;
      const viewport = screen();
      if (visual && visual.height < viewport.layoutH * 0.64 && document.activeElement?.isContentEditable) return;
      active = true;
      const paymentView = body.classList.contains("view-payment") && viewport.width <= 760;
      try {
        if (paymentView) body.classList.remove("view-payment");
        app.removeAttribute("data-fit-overflow");
        app.classList.remove("game-tight");
        apply(1, viewport.height);
        let natural = measure();
        if (Math.min(viewport.height / natural.height, viewport.width / natural.width) < 0.9) {
          app.classList.add("game-tight");
          natural = measure();
        }
        const heightFactor = (viewport.height - 1) / Math.max(1, natural.height);
        const widthFactor = (viewport.width - 1) / Math.max(1, natural.width);
        let zoom = Math.min(1, heightFactor, widthFactor);
        if (!Number.isFinite(zoom)) zoom = 1;
        zoom = apply(zoom, viewport.height);
        const bottomMargin = 1;
        for (let i = 0; i < 2; i++) {
          let over = 0;
          const appRect = app.getBoundingClientRect();
          const selectors = [".shift-footer", ".pos-foot", ".stations", ".game-grid"];
          for (const selector of selectors) {
            const el = app.querySelector(selector);
            if (!visible(el)) continue;
            over = Math.max(over, el.getBoundingClientRect().bottom - (viewport.height - bottomMargin));
          }
          over = Math.max(over, appRect.bottom - viewport.height);
          if (over <= 1) break;
          const corrected = Math.max(MIN_SCALE, zoom * ((viewport.height - bottomMargin) / (viewport.height + over)));
          if (zoom - corrected < EPSILON) break;
          zoom = apply(corrected, viewport.height);
        }
        const overflow = app.scrollHeight > app.clientHeight + 2 || app.scrollWidth > app.clientWidth + 2;
        app.dataset.fitOverflow = String(overflow && zoom <= MIN_SCALE + EPSILON);
      } finally {
        if (paymentView) body.classList.add("view-payment");
        active = false;
      }
    }
    function schedule() {
      if (active) return;
      if (!pending) pending = requestAnimationFrame(fit);
    }
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
    window.addEventListener("pageshow", schedule);
    document.addEventListener("fullscreenchange", schedule);
    visual?.addEventListener("resize", schedule, { passive: true });
    visual?.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("focusout", () => setTimeout(schedule, 180), { passive: true });
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        if (!active) schedule();
      });
      for (const selector of [
        ".topbar",
        ".utility-bar",
        ".operations-bar",
        ".mobile-tabs",
        ".stations",
        ".shift-footer",
        ".pos-top"
      ]) {
        const el = app.querySelector(selector);
        if (el) observer.observe(el);
      }
    }
    const watcher = new MutationObserver((records) => {
      if (active) return;
      const changed = records.some((r) => {
        if (r.target !== body) return true;
        if (body.className === lastBodyClass) return false;
        lastBodyClass = body.className;
        return true;
      });
      if (changed) schedule();
    });
    watcher.observe(app, { childList: true, subtree: false });
    watcher.observe(body, { attributes: true, attributeFilter: ["class"] });
    if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {
    });
    window.addEventListener("load", schedule, { once: true });
    schedule();
    setTimeout(schedule, 300);
    setTimeout(schedule, 1e3);
  })();

  // mobile-ui.js
  (() => {
    const bar = document.getElementById("storeMenu");
    const toggle = document.getElementById("storeMenuToggle");
    const label = document.getElementById("storeMenuText");
    if (!bar || !toggle) return;
    const mobile = window.matchMedia("(max-width:760px)");
    const setOpen = (open) => {
      const show = !!open && mobile.matches;
      bar.classList.toggle("mobile-menu-collapsed", !show);
      bar.classList.toggle("mobile-menu-expanded", show);
      toggle.setAttribute("aria-expanded", String(show));
      label.textContent = show ? "Tutup" : "Lagi";
    };
    setOpen(false);
    toggle.addEventListener("click", () => setOpen(!bar.classList.contains("mobile-menu-expanded")));
    bar.addEventListener("click", (event) => {
      if (event.target.closest("button") && !event.target.closest("#storeMenuToggle") && mobile.matches) setOpen(false);
    });
    document.addEventListener("pointerdown", (event) => {
      if (!bar.contains(event.target) && bar.classList.contains("mobile-menu-expanded")) setOpen(false);
    }, { passive: true });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && bar.classList.contains("mobile-menu-expanded")) {
        setOpen(false);
        toggle.focus();
      }
    });
    mobile.addEventListener?.("change", () => setOpen(false));
  })();

  // product-migration.mjs
  var ids = { dogfood: "fishfood", treatsdog: "birdseed", petpad: "catbed", pettoy: "cattoy" };
  var names = { "Makanan anjing": "Makanan ikan", "Snek anjing": "Biji makanan burung", "Alas latihan haiwan": "Alas tidur kucing", "Syampu haiwan": "Syampu kucing", "Mainan haiwan": "Bola benang kucing" };
  function migrateProducts(value) {
    if (!value || typeof value !== "object") return value;
    for (const key of Object.keys(value)) {
      const item = value[key];
      if (ids[key]) {
        const next = ids[key];
        if (value[next] === void 0) value[next] = item;
        delete value[key];
      } else if (typeof item === "string") {
        if ((key === "id" || key === "productId") && ids[item]) value[key] = ids[item];
        else if (key === "name" && names[item]) value[key] = names[item];
      }
      if (item && typeof item === "object") migrateProducts(item);
    }
    return value;
  }

  // dialogue.mjs
  var lines = {
    welcome: ["Hai, boleh tolong kira barang saya?", "Saya singgah beli barang keperluan.", "Ini barang saya ya. Terima kasih.", "Boleh bantu saya di kaunter?", "Saya dah pilih barang. Boleh kira sekarang?", "Hai! Saya nak bayar barang ini."],
    cash: ["Saya bayar tunai ya.", "Ini duit saya. Tolong semak bakinya ya.", "Saya guna wang tunai untuk belian ini.", "Boleh terima tunai? Saya dah sediakan duit."],
    card: ["Saya guna kad debit ya.", "Kad saya dah sedia. Boleh teruskan bayaran.", "Saya nak bayar dengan kad ini.", "Tolong proses melalui kad debit saya."],
    qr: ["Saya dah buka kod QR pada telefon.", "Boleh imbas QR pada skrin saya?", "Saya bayar dengan e-wallet ya.", "Telefon saya dah sedia untuk diimbas."],
    coupon: ["Saya ada kupon 10%. Tolong gunakan sebelum bayar ya.", "Boleh tolak kupon 10% saya dahulu?", "Jangan lupa kupon 10% saya ya.", "Saya nak gunakan kupon 10% untuk belian ini."],
    kasihCoupon: ["Saya guna KitaKasih dan ada kupon 10%. Tolong guna kupon dahulu ya.", "Boleh tolak kupon 10% dahulu, kemudian bayar dengan KitaKasih?", "Saya nak guna KitaKasih. Jangan lupa kupon 10% saya juga ya.", "Kupon 10% ini untuk belian saya. Selebihnya saya guna KitaKasih ya."],
    kasih: ["Saya nak bayar dengan KitaKasih. Ini kad saya.", "Boleh semak baki KitaKasih saya dahulu?", "Saya guna KitaKasih untuk barang yang layak ya.", "Tolong gunakan KitaKasih. Baki belian saya bayar sendiri."],
    kasihApplied: ["Terima kasih guna kupon tadi. Sekarang saya bayar dengan KitaKasih.", "Kupon dah ditolak ya? Boleh teruskan dengan kad KitaKasih saya.", "Baik, selepas diskaun saya guna KitaKasih ya."],
    couponApplied: ["Terima kasih, kupon saya dah digunakan.", "Diskaun dah masuk. Boleh teruskan bayaran ya.", "Baik, jumlah selepas kupon itu betul."],
    change: ["Saya tunggu baki ya. Terima kasih.", "Boleh semak baki sebelum serahkan?", "Kira perlahan pun tak mengapa, asalkan tepat.", "Terima kasih. Bakinya sekali ya."],
    lost: ["Saya perlu pergi dulu. Nanti saya datang semula.", "Maaf, saya tak dapat tunggu lebih lama.", "Saya ada urusan lain. Belian ini saya tangguhkan dulu."],
    thanks: ["Terima kasih! Ini sedikit tip untuk awak.", "Layanan baik. Saya beri sedikit tip ya.", "Ini tip untuk awak. Terima kasih bantu saya."],
    thanksNoTip: ["Terima kasih, jumpa lagi!", "Dah selesai ya? Terima kasih.", "Terima kasih kerana bantu uruskan belian saya.", "Baik, saya bawa barang dulu. Jumpa lagi!", "Semoga urusan kedai dipermudahkan. Terima kasih."]
  };
  function say(c, key) {
    const pool = lines[key] || lines.welcome;
    let seed = Number(c.dialogueSeed) || 0;
    for (const ch of key) seed = seed * 31 + ch.charCodeAt(0) >>> 0;
    return pool[seed % pool.length];
  }
  function customerSpeech(c, phase2 = "scan", tip = 0) {
    if (!c) return "";
    if (c.kind === "kitafood") return `Hai, saya rider KitaFood. Saya ambil pesanan ${c.orderId} ya.`;
    if (c.kind === "return") return c.returnReason || "Saya bawa barang dan resit untuk semakan pemulangan.";
    if (phase2 === "success") return say(c, tip > 0 ? "thanks" : "thanksNoTip");
    if (phase2 === "lost") return say(c, "lost");
    if (phase2 === "change") return say(c, "change");
    if (c.hasCoupon && !c.couponApplied) return say(c, c.kasih ? "kasihCoupon" : "coupon");
    if (c.kasih) {
      if (c.method !== "kasih") return `Baki selepas KitaKasih saya bayar dengan ${{ cash: "tunai", card: "kad debit", qr: "QR e-wallet" }[c.method] || "kaedah lain"} ya.`;
      return say(c, c.couponApplied ? "kasihApplied" : "kasih");
    }
    if (phase2 === "offer" || c.items?.every((i) => i.scanned)) return say(c, c.method);
    if (c.couponApplied) return say(c, "couponApplied");
    return say(c, "welcome");
  }

  // kitakasih.mjs
  var KASIH_PRODUCTS = /* @__PURE__ */ new Set(["milk", "bread", "eggs", "rice", "noodles", "cookies", "soap", "coffee", "water", "curry", "detergent", "oil", "sugar", "flour", "soy", "sardine", "tea", "malt", "salt", "condensed", "tissue", "toothpaste", "shampoo", "dishsoap"]);
  var kasihEligible = (item) => KASIH_PRODUCTS.has(item.id);
  function kasihAccount(store, person, rng = Math.random) {
    store.kitaKasih ??= { accounts: {}, receipts: [] };
    store.kitaKasih.accounts ??= {};
    store.kitaKasih.receipts ??= [];
    const key = person.id;
    return store.kitaKasih.accounts[key] ??= { balance: 1e3 + Math.min(18, Math.max(0, Math.floor(rng() * 19))) * 500, card: "KK-" + String(Object.keys(store.kitaKasih.accounts).length + 1).padStart(5, "0") };
  }
  function kasihQuote(customer2) {
    const price = (i) => i.weighted ? Math.round(i.price * i.grams / 1e3) : i.price;
    const gross = customer2.items.reduce((s, i) => s + price(i), 0);
    const total = Math.max(0, gross - (customer2.discount || 0));
    const eligibleGross = customer2.items.filter(kasihEligible).reduce((s, i) => s + price(i), 0);
    const eligible = gross ? Math.floor(total * eligibleGross / gross) : 0;
    const balance = Math.max(0, Math.floor(customer2.kasih?.balanceBefore || 0));
    const aid = Math.min(balance, eligible);
    return { total, eligible, ineligible: total - eligible, aid, remaining: total - aid, balanceAfter: balance - aid };
  }
  function kasihContribution(c) {
    return c?.kasih?.reserved ? kasihQuote(c).aid : 0;
  }
  function commitKasih(store, c) {
    if (!c.kasih) return true;
    const k = c.kasih;
    if (k.committed) return false;
    const account = kasihAccount(store, c.person), q = kasihQuote(c);
    if (!k.verified || !k.reserved || account.balance !== k.balanceBefore) return false;
    account.balance = q.balanceAfter;
    k.committed = true;
    k.balanceAfter = q.balanceAfter;
    k.aid = q.aid;
    store.kitaKasih.receipts.unshift({ id: k.id, name: c.person.name, card: account.card, aid: q.aid, balance: q.balanceAfter, total: q.total, extra: q.remaining, method: c.method, day: store.day });
    store.kitaKasih.receipts = store.kitaKasih.receipts.slice(0, 20);
    return true;
  }

  // delivery-clock.mjs
  function remainingMs(order, now = Date.now()) {
    if (!order) return 0;
    if (Number.isFinite(order.pausedRemainingMs)) return Math.max(0, order.pausedRemainingMs);
    if (Number.isFinite(order.deadlineAt)) return Math.max(0, order.deadlineAt - now);
    return Math.max(0, ((Number(order.timeLimit) || 30) - (Number(order.elapsedSeconds) || 0)) * 1e3);
  }
  var remainingSeconds = (order, now = Date.now()) => Math.ceil(remainingMs(order, now) / 1e3);
  function setClockPaused(order, paused2, now = Date.now()) {
    const wasPaused = Number.isFinite(order.pausedRemainingMs);
    if (paused2 === wasPaused) return false;
    if (paused2) order.pausedRemainingMs = remainingMs(order, now);
    else {
      order.deadlineAt = now + Math.max(0, order.pausedRemainingMs);
      delete order.pausedRemainingMs;
    }
    return true;
  }

  // payment-state.mjs
  function resetDigitalAttempt(customer2) {
    if (!customer2 || customer2.paid || !["card", "qr"].includes(customer2.method)) return false;
    customer2.cardStage = "ready";
    customer2.cardContactReady = false;
    customer2.cardPose = null;
    customer2.pinInput = "";
    customer2.qrScanned = false;
    customer2.qrArmed = false;
    return true;
  }
  function recoverInterruptedPayment(customer2) {
    if (!["contact", "processing"].includes(customer2?.cardStage)) return false;
    return resetDigitalAttempt(customer2);
  }

  // design.mjs
  var selectedTabs = /* @__PURE__ */ new Map();
  function tabbed(root, groups, after, initial = 0) {
    const key = root.closest("dialog")?.dataset.kind || "menu";
    initial = key === "settings" ? 0 : Math.min(selectedTabs.get(key) || initial, groups.length - 1);
    const nav = document.createElement("div");
    nav.className = "studio-tabs";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Bahagian menu");
    after.after(nav);
    const panels = groups.map(([name, nodes], i) => {
      const panel = document.createElement("section");
      panel.className = "studio-tab-panel";
      panel.id = "studio-panel-" + i;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "studio-tab-" + i);
      panel.tabIndex = 0;
      nodes.forEach((n) => panel.append(n));
      nav.after(panel);
      const button = document.createElement("button");
      button.type = "button";
      button.id = "studio-tab-" + i;
      button.textContent = name;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel.id);
      nav.append(button);
      button.onclick = () => activate(i);
      button.onkeydown = (e) => {
        let next = i;
        if (e.key === "ArrowRight") next = (i + 1) % groups.length;
        else if (e.key === "ArrowLeft") next = (i + groups.length - 1) % groups.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = groups.length - 1;
        else return;
        e.preventDefault();
        activate(next);
        nav.children[next].focus();
      };
      return panel;
    });
    function activate(index) {
      selectedTabs.set(key, index);
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
        nav.children[i].setAttribute("aria-selected", String(i === index));
        nav.children[i].tabIndex = i === index ? 0 : -1;
      });
    }
    activate(initial);
  }
  function enhanceManagement(kind, root, icon2) {
    const supported = ["missions", "inventory", "catalogue", "delivery", "shop", "settings", "developer"].includes(kind);
    fitCategorySelects(root);
    root.classList.toggle("studio-management", supported);
    if (!supported) return;
    const pad = root.querySelector(".modal-pad");
    if (!pad) return;
    if (kind === "developer") {
      const head = pad.querySelector(".modal-heading"), footer = pad.querySelector(".dev-panel-footer");
      const buckets = [[], [], [], [], []];
      let section = 1;
      [...pad.children].forEach((el) => {
        if (el === head || el === footer) return;
        if (el.tagName === "H3") section = el.textContent.includes("segera") ? 0 : el.textContent.includes("inventori") ? 2 : el.textContent.includes("Audit") ? 3 : 4;
        buckets[section].push(el);
      });
      tabbed(pad, [["Senario ujian", buckets[0]], ["Kewangan", buckets[1]], ["Stok & peralatan", buckets[2]], ["Penyegerakan", buckets[3]], ["Hari & data", buckets[4]]], head);
      const h = pad.querySelector(".dev-scenario-grid");
      if (h) {
        const hint = document.createElement("p");
        hint.className = "studio-description";
        hint.textContent = "Pilih senario untuk menguji satu aliran permainan. Progres ujian disimpan berasingan.";
        h.before(hint);
      }
    }
    if (kind === "shop") {
      const head = pad.querySelector(".shop-wallet"), parts = [[], []];
      let section = 0;
      let started = false;
      [...pad.children].forEach((el) => {
        if (el === head) {
          started = true;
          return;
        }
        if (!started) return;
        if (el.matches(".payment-upgrade-section") || el.textContent.includes("Peralatan kedai & bonus") || el.matches(".payment-upgrades")) section = 1;
        if (el.matches("h3") && !el.textContent.includes("Buka kelas")) section = 1;
        parts[section].push(el);
      });
      tabbed(pad, [["Kategori produk", parts[0]], ["Peralatan & pembayaran", parts[1]]], head);
    }
    if (kind === "settings") {
      const head = pad.querySelector(".modal-heading"), back = pad.querySelector("#backSettings"), parts = [[], [], []];
      let section = 0;
      [...pad.children].forEach((el) => {
        if (el === head || el === back) return;
        if (el.matches(".setting-row") && el.textContent.includes("Animasi")) section = 1;
        if (el.matches(".game-reset-compact")) section = 2;
        parts[section].push(el);
      });
      tabbed(pad, [["Audio", parts[0]], ["Paparan", parts[1]], ["Progres", parts[2]]], head);
    }
    const heading = pad.querySelector(".modal-heading,.kf-head");
    if (heading) {
      const badge = document.createElement("span");
      badge.className = "studio-heading-icon";
      badge.innerHTML = icon2({ missions: "flag", inventory: "basket", catalogue: "book", shop: "shop", settings: "settings", developer: "settings" }[kind] || "delivery");
      if (kind !== "delivery") heading.prepend(badge);
    }
  }
  var productArea = document.getElementById("products");
  if (productArea) {
    let frame = 0;
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        productArea.querySelectorAll(".product-name").forEach((el) => {
          el.style.removeProperty("font-size");
          const style = getComputedStyle(el), available = Math.max(16, el.clientWidth - 4);
          let size = parseFloat(style.fontSize);
          function lines2() {
            ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
            let count = 1, line = "";
            for (const word of el.textContent.trim().split(/\s+/)) {
              if (ctx.measureText(word).width > available) return 3;
              const next = line ? line + " " + word : word;
              if (ctx.measureText(next).width > available) {
                count++;
                line = word;
              } else line = next;
            }
            return count;
          }
          while (size > 5 && lines2() > 2) size -= 0.25;
          el.style.setProperty("font-size", size + "px", "important");
        });
      });
    };
    new ResizeObserver(fit).observe(productArea);
    new MutationObserver(fit).observe(productArea, { childList: true, subtree: true });
  }
  var categoryObserver;
  function fitCategorySelects(root) {
    categoryObserver?.disconnect();
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    const fit = (select) => {
      if (!select.clientWidth || !ctx) return;
      const cs = getComputedStyle(select), label = select.selectedOptions[0]?.textContent || "";
      const available = select.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 26;
      let size = 16;
      ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const width = ctx.measureText(label).width;
      size = Math.min(size, Math.max(7, Math.floor(size * available / Math.max(1, width) * 10) / 10));
      select.style.setProperty("font-size", size + "px", "important");
    };
    categoryObserver = new ResizeObserver((entries) => entries.forEach(({ target }) => fit(target)));
    root.querySelectorAll("select").forEach((select) => {
      categoryObserver.observe(select);
      select.addEventListener("change", () => fit(select));
      requestAnimationFrame(() => fit(select));
    });
  }

  // engine.mjs
  var PRODUCTS = [
    { id: "milk", name: "Susu segar", price: 680, color: "#dceefa" },
    { id: "bread", name: "Roti putih", price: 320, color: "#f8e6c8" },
    { id: "eggs", name: "Telur 6 biji", price: 510, color: "#f3e6d6" },
    { id: "rice", name: "Beras 1 kg", price: 450, color: "#e8eee3" },
    { id: "noodles", name: "Mi segera", price: 480, color: "#ffe5c9" },
    { id: "juice", name: "Jus oren", price: 290, color: "#f7edb4" },
    { id: "cookies", name: "Biskut coklat", price: 590, color: "#f4dfce" },
    { id: "soap", name: "Sabun mandi", price: 340, color: "#e9dcf7" },
    { id: "coffee", name: "Kopi tempatan", price: 720, color: "#e9d7cb" },
    { id: "water", name: "Air mineral", price: 150, color: "#d5eef3" },
    { id: "apple", name: "Epal merah", price: 890, weighted: true, color: "#f7ddd5" },
    { id: "banana", name: "Pisang berangan", price: 650, weighted: true, color: "#fff0b6" },
    { id: "carrot", name: "Lobak merah", price: 490, weighted: true, color: "#ffe0c7" },
    { id: "tomato", name: "Tomato", price: 590, weighted: true, color: "#fbdad2" },
    { id: "grapes", name: "Anggur", price: 1390, weighted: true, color: "#e8ddf5" },
    { id: "fish", name: "Ikan kembung", price: 1690, weighted: true, color: "#d9e9f3" },
    { id: "curry", name: "Serbuk kari", price: 240, color: "#f4e0be" },
    { id: "snack", name: "Snek cincin", price: 180, color: "#e3e9c5" },
    { id: "butter", name: "Mentega", price: 890, color: "#f4e8bc" },
    { id: "detergent", name: "Pencuci pakaian", price: 1290, color: "#dfe8cc" },
    { id: "icecream", name: "Aiskrim strawberi", price: 350, color: "#f4dfe0" },
    { id: "chicken", name: "Ayam segar", price: 1190, weighted: true, color: "#eedfcf" },
    { id: "cucumber", name: "Timun", price: 390, weighted: true, color: "#d8e8ce" },
    { id: "nasi", name: "Nasi lemak", price: 250, color: "#e6e6cb" },
    { "id": "serimuka", "name": "Kuih seri muka", "price": 250, "category": "kuih", "color": "#e7eacb" },
    { "id": "onde", "name": "Onde-onde", "price": 240, "category": "kuih", "color": "#e7eacb" },
    { "id": "karipap", "name": "Karipap kentang", "price": 180, "category": "kuih", "color": "#e7eacb" },
    { "id": "lapis", "name": "Kuih lapis", "price": 220, "category": "kuih", "color": "#e7eacb" },
    { "id": "ketayap", "name": "Kuih ketayap", "price": 200, "category": "kuih", "color": "#e7eacb" },
    { "id": "talam", "name": "Kuih talam", "price": 220, "category": "kuih", "color": "#e7eacb" },
    { "id": "apam", "name": "Apam balik", "price": 350, "category": "kuih", "color": "#e7eacb" },
    { "id": "putu", "name": "Putu piring", "price": 250, "category": "kuih", "color": "#e7eacb" },
    { "id": "akok", "name": "Kuih akok", "price": 180, "category": "kuih", "color": "#e7eacb" },
    { "id": "bingka", "name": "Bingka ubi", "price": 280, "category": "kuih", "color": "#e7eacb" },
    { "id": "angku", "name": "Kuih ang ku", "price": 230, "category": "kuih", "color": "#e7eacb" },
    { "id": "bahulu", "name": "Bahulu 6 biji", "price": 450, "category": "kuih", "color": "#e7eacb" },
    { "id": "rendang", "name": "Rendang ayam", "price": 850, "category": "meals", "color": "#eadfcb" },
    { "id": "roti", "name": "Roti canai", "price": 180, "category": "meals", "color": "#eadfcb" },
    { "id": "satay", "name": "Satay 5 cucuk", "price": 650, "category": "meals", "color": "#eadfcb" },
    { "id": "laksa", "name": "Laksa utara", "price": 650, "category": "meals", "color": "#eadfcb" },
    { "id": "mee", "name": "Mi goreng", "price": 550, "category": "meals", "color": "#eadfcb" },
    { "id": "lemang", "name": "Lemang", "price": 1200, "category": "meals", "color": "#eadfcb" },
    { "id": "rojak", "name": "Rojak buah", "price": 600, "category": "meals", "color": "#eadfcb" },
    { "id": "oil", "name": "Minyak masak 1 kg", "price": 690, "category": "essentials", "color": "#e6e7d9" },
    { "id": "sugar", "name": "Gula 1 kg", "price": 285, "category": "essentials", "color": "#e6e7d9" },
    { "id": "flour", "name": "Tepung gandum", "price": 310, "category": "essentials", "color": "#e6e7d9" },
    { "id": "soy", "name": "Kicap manis", "price": 480, "category": "essentials", "color": "#e6e7d9" },
    { "id": "sardine", "name": "Sardin tin", "price": 650, "category": "essentials", "color": "#e6e7d9" },
    { "id": "tea", "name": "Teh tempatan", "price": 590, "category": "essentials", "color": "#e6e7d9" },
    { "id": "malt", "name": "Minuman malt", "price": 1390, "category": "essentials", "color": "#e6e7d9" },
    { "id": "salt", "name": "Garam halus", "price": 120, "category": "essentials", "color": "#e6e7d9" },
    { "id": "condensed", "name": "Susu pekat", "price": 390, "category": "essentials", "color": "#e6e7d9" },
    { "id": "tissue", "name": "Tisu muka", "price": 450, "category": "household", "color": "#dce6e9" },
    { "id": "toothpaste", "name": "Ubat gigi", "price": 690, "category": "household", "color": "#dce6e9" },
    { "id": "shampoo", "name": "Syampu", "price": 1290, "category": "household", "color": "#dce6e9" },
    { "id": "dishsoap", "name": "Cecair pencuci pinggan", "price": 590, "category": "household", "color": "#dce6e9" },
    { "id": "ricecooker", "name": "Periuk nasi", "price": 8900, "category": "electrical", "color": "#dce2e9" },
    { "id": "kettle", "name": "Cerek elektrik", "price": 5900, "category": "electrical", "color": "#dce2e9" },
    { "id": "fan", "name": "Kipas meja", "price": 7900, "category": "electrical", "color": "#dce2e9" },
    { "id": "iron", "name": "Seterika", "price": 6900, "category": "electrical", "color": "#dce2e9" },
    { "id": "blender", "name": "Pengisar", "price": 9900, "category": "electrical", "color": "#dce2e9" },
    { "id": "toaster", "name": "Pembakar roti", "price": 7500, "category": "electrical", "color": "#dce2e9" },
    { "id": "dryer", "name": "Pengering rambut", "price": 6500, "category": "electrical", "color": "#dce2e9" },
    { "id": "led", "name": "Lampu LED", "price": 1290, "category": "electrical", "color": "#dce2e9" },
    { "id": "croissant", "name": "Croissant mentega", "price": 450, "category": "bakery", "color": "#efd8b8" },
    { "id": "muffin", "name": "Mufin coklat", "price": 380, "category": "bakery", "color": "#efd8b8" },
    { "id": "oats", "name": "Oat segera", "price": 890, "category": "bakery", "color": "#efd8b8" },
    { "id": "jam", "name": "Jem strawberi", "price": 650, "category": "bakery", "color": "#efd8b8" },
    { "id": "nuggets", "name": "Nuget ayam", "price": 1290, "category": "frozen", "color": "#cce5ee" },
    { "id": "sausage", "name": "Sosej ayam", "price": 790, "category": "frozen", "color": "#cce5ee" },
    { "id": "dumpling", "name": "Dumpling sayur", "price": 1090, "category": "frozen", "color": "#cce5ee" },
    { "id": "frozenroti", "name": "Roti paratha beku", "price": 850, "category": "frozen", "color": "#cce5ee" },
    { "id": "diapers", "name": "Lampin bayi", "price": 2490, "category": "baby", "color": "#f0dce5" },
    { "id": "babywipes", "name": "Tisu basah bayi", "price": 590, "category": "baby", "color": "#f0dce5" },
    { "id": "babybottle", "name": "Botol susu bayi", "price": 1590, "category": "baby", "color": "#f0dce5" },
    { "id": "babyporridge", "name": "Bubur bayi", "price": 1290, "category": "baby", "color": "#f0dce5" },
    { "id": "catfood", "name": "Makanan kucing", "price": 790, "category": "pets", "color": "#e3dec8" },
    { "id": "fishfood", "name": "Makanan ikan", "price": 990, "category": "pets", "color": "#e3dec8" },
    { "id": "catlitter", "name": "Pasir kucing", "price": 1890, "category": "pets", "color": "#e3dec8" },
    { "id": "petshampoo", "name": "Syampu kucing", "price": 1290, "category": "pets", "color": "#e3dec8" },
    { "id": "notebook", "name": "Buku nota", "price": 450, "category": "stationery", "color": "#e1dcf1" },
    { "id": "pencils", "name": "Pensel 6 batang", "price": 350, "category": "stationery", "color": "#e1dcf1" },
    { "id": "crayons", "name": "Krayon warna", "price": 690, "category": "stationery", "color": "#e1dcf1" },
    { "id": "glue", "name": "Gam sekolah", "price": 250, "category": "stationery", "color": "#e1dcf1" },
    { "id": "soil", "name": "Tanah tanaman", "price": 590, "category": "garden", "color": "#d8e4c7" },
    { "id": "seeds", "name": "Benih cili", "price": 290, "category": "garden", "color": "#d8e4c7" },
    { "id": "plantpot", "name": "Pasu bunga", "price": 750, "category": "garden", "color": "#d8e4c7" },
    { "id": "fertilizer", "name": "Baja organik", "price": 1290, "category": "garden", "color": "#d8e4c7" },
    { "id": "plaster", "name": "Plaster luka", "price": 390, "category": "health", "color": "#d6e9e3" },
    { "id": "mask", "name": "Pelitup muka", "price": 590, "category": "health", "color": "#d6e9e3" },
    { "id": "sanitizer", "name": "Pensanitasi tangan", "price": 650, "category": "health", "color": "#d6e9e3" },
    { "id": "thermometer", "name": "Termometer digital", "price": 1890, "category": "health", "color": "#d6e9e3" },
    { "id": "pineapple", "name": "Nanas madu", "price": 850, "category": "fresh", "color": "#dbe9ce", "weighted": true },
    { "id": "papaya", "name": "Betik masak", "price": 620, "category": "fresh", "color": "#dbe9ce", "weighted": true },
    { "id": "mango", "name": "Mangga harum manis", "price": 1590, "category": "fresh", "color": "#dbe9ce", "weighted": true },
    { "id": "spinach", "name": "Bayam segar", "price": 690, "category": "fresh", "color": "#dbe9ce", "weighted": true },
    { "id": "yogurt", "name": "Yogurt asli", "price": 390, "category": "snacks", "color": "#eedfba" },
    { "id": "chips", "name": "Kerepek kentang", "price": 490, "category": "snacks", "color": "#eedfba" },
    { "id": "chocolate", "name": "Coklat susu", "price": 450, "category": "snacks", "color": "#eedfba" },
    { "id": "cracker", "name": "Keropok ikan", "price": 320, "category": "snacks", "color": "#eedfba" },
    { "id": "cheese", "name": "Keju keping", "price": 990, "category": "snacks", "color": "#eedfba" },
    { "id": "popcorn", "name": "Bertih jagung", "price": 380, "category": "snacks", "color": "#eedfba" },
    { "id": "bihun", "name": "Bihun goreng", "price": 490, "category": "meals", "color": "#eadfcb" },
    { "id": "nasiayam", "name": "Nasi ayam", "price": 750, "category": "meals", "color": "#eadfcb" },
    { "id": "nasilemakayam", "name": "Nasi lemak ayam", "price": 890, "category": "meals", "color": "#eadfcb" },
    { "id": "bleach", "name": "Peluntur pakaian", "price": 590, "category": "household", "color": "#dce6e9" },
    { "id": "dishsponge", "name": "Span pinggan", "price": 290, "category": "household", "color": "#dce6e9" },
    { "id": "floorcleaner", "name": "Pencuci lantai", "price": 790, "category": "household", "color": "#dce6e9" },
    { "id": "trashbags", "name": "Beg sampah", "price": 620, "category": "household", "color": "#dce6e9" },
    { "id": "softener", "name": "Pelembut fabrik", "price": 980, "category": "household", "color": "#dce6e9" },
    { "id": "brush", "name": "Berus tandas", "price": 450, "category": "household", "color": "#dce6e9" },
    { "id": "extension", "name": "Sambungan soket 3 pin", "price": 2290, "category": "electrical", "color": "#dce2e9" },
    { "id": "deskclock", "name": "Jam digital", "price": 3500, "category": "electrical", "color": "#dce2e9" },
    { "id": "bulbsmart", "name": "Mentol pintar", "price": 2590, "category": "electrical", "color": "#dce2e9" },
    { "id": "bagel", "name": "Bagel bijan", "price": 490, "category": "bakery", "color": "#efd8b8" },
    { "id": "buns", "name": "Roti bun krim", "price": 350, "category": "bakery", "color": "#efd8b8" },
    { "id": "donut", "name": "Donat gula", "price": 280, "category": "bakery", "color": "#efd8b8" },
    { "id": "waffle", "name": "Wafel coklat", "price": 490, "category": "bakery", "color": "#efd8b8" },
    { "id": "pancake", "name": "Pankek 6 keping", "price": 690, "category": "bakery", "color": "#efd8b8" },
    { "id": "cereal", "name": "Bijirin jagung", "price": 1090, "category": "bakery", "color": "#efd8b8" },
    { "id": "tart", "name": "Tart telur", "price": 320, "category": "bakery", "color": "#efd8b8" },
    { "id": "fries", "name": "Kentang goreng beku", "price": 890, "category": "frozen", "color": "#cce5ee" },
    { "id": "fishball", "name": "Bebola ikan", "price": 760, "category": "frozen", "color": "#cce5ee" },
    { "id": "springroll", "name": "Popia sejuk beku", "price": 690, "category": "frozen", "color": "#cce5ee" },
    { "id": "pizza", "name": "Piza mini beku", "price": 1290, "category": "frozen", "color": "#cce5ee" },
    { "id": "burgerpatty", "name": "Daging burger beku", "price": 1590, "category": "frozen", "color": "#cce5ee" },
    { "id": "meatballs", "name": "Bebola daging", "price": 1190, "category": "frozen", "color": "#cce5ee" },
    { "id": "frozenveggies", "name": "Sayur campur beku", "price": 790, "category": "frozen", "color": "#cce5ee" },
    { "id": "babyshampoo", "name": "Syampu bayi", "price": 1090, "category": "baby", "color": "#f0dce5" },
    { "id": "babylotion", "name": "Losyen bayi", "price": 1490, "category": "baby", "color": "#f0dce5" },
    { "id": "babysoap", "name": "Mandian bayi", "price": 890, "category": "baby", "color": "#f0dce5" },
    { "id": "pacifier", "name": "Puting bayi", "price": 690, "category": "baby", "color": "#f0dce5" },
    { "id": "bib", "name": "Bib makan bayi", "price": 790, "category": "baby", "color": "#f0dce5" },
    { "id": "babycereal", "name": "Bijirin bayi", "price": 1190, "category": "baby", "color": "#f0dce5" },
    { "id": "treatscat", "name": "Snek kucing", "price": 690, "category": "pets", "color": "#e3dec8" },
    { "id": "birdseed", "name": "Biji makanan burung", "price": 650, "category": "pets", "color": "#e3dec8" },
    { "id": "cattoy", "name": "Bola benang kucing", "price": 990, "category": "pets", "color": "#e3dec8" },
    { "id": "petbowl", "name": "Mangkuk makanan haiwan", "price": 1250, "category": "pets", "color": "#e3dec8" },
    { "id": "petbrush", "name": "Berus bulu haiwan", "price": 790, "category": "pets", "color": "#e3dec8" },
    { "id": "catbed", "name": "Alas tidur kucing", "price": 1690, "category": "pets", "color": "#e3dec8" },
    { "id": "eraser", "name": "Pemadam getah", "price": 120, "category": "stationery", "color": "#e1dcf1" },
    { "id": "ruler", "name": "Pembaris 30 cm", "price": 250, "category": "stationery", "color": "#e1dcf1" },
    { "id": "highlighter", "name": "Pen penanda", "price": 480, "category": "stationery", "color": "#e1dcf1" },
    { "id": "markers", "name": "Pen marker warna", "price": 750, "category": "stationery", "color": "#e1dcf1" },
    { "id": "tape", "name": "Pita pelekat", "price": 390, "category": "stationery", "color": "#e1dcf1" },
    { "id": "folder", "name": "Fail dokumen", "price": 450, "category": "stationery", "color": "#e1dcf1" },
    { "id": "scissors", "name": "Gunting sekolah", "price": 690, "category": "stationery", "color": "#e1dcf1" },
    { "id": "wateringcan", "name": "Penyiram tanaman", "price": 1590, "category": "garden", "color": "#d8e4c7" },
    { "id": "glovesgarden", "name": "Sarung tangan kebun", "price": 890, "category": "garden", "color": "#d8e4c7" },
    { "id": "pruner", "name": "Gunting pokok", "price": 1390, "category": "garden", "color": "#d8e4c7" },
    { "id": "mulch", "name": "Sungkupan tanaman", "price": 690, "category": "garden", "color": "#d8e4c7" },
    { "id": "herbseeds", "name": "Benih daun sup", "price": 250, "category": "garden", "color": "#d8e4c7" },
    { "id": "sprayer", "name": "Penyembur tanaman", "price": 1090, "category": "garden", "color": "#d8e4c7" },
    { "id": "bandage", "name": "Pembalut luka", "price": 690, "category": "health", "color": "#d6e9e3" },
    { "id": "cotton", "name": "Kapas muka", "price": 390, "category": "health", "color": "#d6e9e3" },
    { "id": "firstaid", "name": "Set pertolongan cemas", "price": 2990, "category": "health", "color": "#d6e9e3" },
    { "id": "wetwipes", "name": "Tisu basah antibakteria", "price": 590, "category": "health", "color": "#d6e9e3" },
    { "id": "toothbrush", "name": "Berus gigi lembut", "price": 450, "category": "health", "color": "#d6e9e3" },
    { "id": "dentalfloss", "name": "Flos gigi", "price": 690, "category": "health", "color": "#d6e9e3" },
    { "id": "icepack", "name": "Pek ais gel", "price": 890, "category": "health", "color": "#d6e9e3" },
    { "id": "tehbotol", "name": "Teh ais botol", "price": 320, "category": "beverages", "color": "#d6ebed" },
    { "id": "airkelapa", "name": "Air kelapa kotak", "price": 450, "category": "beverages", "color": "#d6ebed" },
    { "id": "susucrunch", "name": "Susu coklat kotak", "price": 380, "category": "beverages", "color": "#d6ebed" },
    { "id": "isotonik", "name": "Minuman isotonik", "price": 350, "category": "beverages", "color": "#d6ebed" },
    { "id": "kopitin", "name": "Kopi susu tin", "price": 390, "category": "beverages", "color": "#d6ebed" },
    { "id": "lemonade", "name": "Air lemon berkarbonat", "price": 290, "category": "beverages", "color": "#d6ebed" },
    { "id": "airgas", "name": "Air berkarbonat", "price": 250, "category": "beverages", "color": "#d6ebed" },
    { "id": "jusepal", "name": "Jus epal kotak", "price": 390, "category": "beverages", "color": "#d6ebed" },
    { "id": "soya", "name": "Air soya", "price": 300, "category": "beverages", "color": "#d6ebed" },
    { "id": "sirap", "name": "Kordial ros", "price": 890, "category": "beverages", "color": "#d6ebed" },
    { "id": "greentea", "name": "Teh hijau botol", "price": 420, "category": "beverages", "color": "#d6ebed" },
    { "id": "minumanyogurt", "name": "Minuman yogurt", "price": 450, "category": "beverages", "color": "#d6ebed" },
    { "id": "chilisauce", "name": "Sos cili", "price": 450, "category": "pantry", "color": "#ede1c5" },
    { "id": "tomatosauce", "name": "Sos tomato", "price": 420, "category": "pantry", "color": "#ede1c5" },
    { "id": "pepper", "name": "Lada hitam serbuk", "price": 690, "category": "pantry", "color": "#ede1c5" },
    { "id": "vinegar", "name": "Cuka makan", "price": 290, "category": "pantry", "color": "#ede1c5" },
    { "id": "cornflour", "name": "Tepung jagung", "price": 350, "category": "pantry", "color": "#ede1c5" },
    { "id": "vermicelli", "name": "Bihun beras", "price": 490, "category": "pantry", "color": "#ede1c5" },
    { "id": "chickenstock", "name": "Kiub pati ayam", "price": 390, "category": "pantry", "color": "#ede1c5" },
    { "id": "coconutmilk", "name": "Santan kotak", "price": 380, "category": "pantry", "color": "#ede1c5" },
    { "id": "honeypot", "name": "Madu asli botol", "price": 1590, "category": "pantry", "color": "#ede1c5" },
    { "id": "peanutbutter", "name": "Mentega kacang", "price": 1090, "category": "pantry", "color": "#ede1c5" },
    { "id": "beans", "name": "Kacang panggang tin", "price": 520, "category": "pantry", "color": "#ede1c5" },
    { "id": "bodywash", "name": "Gel mandian", "price": 1090, "category": "personal", "color": "#e3ddeb" },
    { "id": "deodorant", "name": "Deodoran roll-on", "price": 890, "category": "personal", "color": "#e3ddeb" },
    { "id": "facewash", "name": "Pencuci muka", "price": 1390, "category": "personal", "color": "#e3ddeb" },
    { "id": "sunscreen", "name": "Krim pelindung matahari", "price": 2590, "category": "personal", "color": "#e3ddeb" },
    { "id": "conditioner", "name": "Perapi rambut", "price": 1290, "category": "personal", "color": "#e3ddeb" },
    { "id": "razor", "name": "Pencukur pakai buang", "price": 650, "category": "personal", "color": "#e3ddeb" },
    { "id": "comb", "name": "Sikat rambut", "price": 390, "category": "personal", "color": "#e3ddeb" },
    { "id": "handcream", "name": "Krim tangan", "price": 990, "category": "personal", "color": "#e3ddeb" },
    { "id": "lipbalm", "name": "Pelembap bibir", "price": 650, "category": "personal", "color": "#e3ddeb" },
    { "id": "facialtissue", "name": "Tisu muka poket", "price": 250, "category": "personal", "color": "#e3ddeb" },
    { "id": "mouthwash", "name": "Pencuci mulut", "price": 1390, "category": "personal", "color": "#e3ddeb" },
    { "id": "batteryaa", "name": "Bateri AA 4 biji", "price": 990, "category": "hardware", "color": "#dfe3e3" },
    { "id": "torch", "name": "Lampu suluh LED", "price": 1890, "category": "hardware", "color": "#dfe3e3" },
    { "id": "measuringtape", "name": "Pita pengukur 5m", "price": 1190, "category": "hardware", "color": "#dfe3e3" },
    { "id": "screwdriver", "name": "Pemutar skru set", "price": 1990, "category": "hardware", "color": "#dfe3e3" },
    { "id": "padlock", "name": "Mangga kecil", "price": 1590, "category": "hardware", "color": "#dfe3e3" },
    { "id": "rope", "name": "Tali nilon 5m", "price": 690, "category": "hardware", "color": "#dfe3e3" },
    { "id": "gloveswork", "name": "Sarung tangan kerja", "price": 1090, "category": "hardware", "color": "#dfe3e3" },
    { "id": "ducttape", "name": "Pita pelekat kuat", "price": 890, "category": "hardware", "color": "#dfe3e3" },
    { "id": "hookset", "name": "Set cangkuk dinding", "price": 690, "category": "hardware", "color": "#dfe3e3" },
    { "id": "pliers", "name": "Playar serbaguna", "price": 2590, "category": "hardware", "color": "#dfe3e3" },
    { "id": "usbcable", "name": "Kabel USB-C", "price": 1890, "category": "accessories", "color": "#d7e1f5" },
    { "id": "lightningcable", "name": "Kabel Lightning", "price": 2290, "category": "accessories", "color": "#d7e1f5" },
    { "id": "wallcharger", "name": "Pengecas dinding", "price": 2990, "category": "accessories", "color": "#d7e1f5" },
    { "id": "earphones", "name": "Fon telinga berwayar", "price": 1990, "category": "accessories", "color": "#d7e1f5" },
    { "id": "powerbank", "name": "Powerbank 10000mAh", "price": 8900, "category": "accessories", "color": "#d7e1f5" },
    { "id": "screenwipe", "name": "Kit lap skrin", "price": 790, "category": "accessories", "color": "#d7e1f5" },
    { "id": "phoneholder", "name": "Pemegang telefon", "price": 1690, "category": "accessories", "color": "#d7e1f5" },
    { "id": "mouse", "name": "Tetikus tanpa wayar", "price": 3990, "category": "accessories", "color": "#d7e1f5" },
    { "id": "keyboard", "name": "Papan kekunci mini", "price": 5990, "category": "accessories", "color": "#d7e1f5" },
    { "id": "memorycard", "name": "Kad memori 32GB", "price": 2990, "category": "accessories", "color": "#d7e1f5" },
    { "id": "socks", "name": "Stoking kapas", "price": 890, "category": "clothing", "color": "#ebdccb" },
    { "id": "tshirt", "name": "Baju-T polos", "price": 1990, "category": "clothing", "color": "#ebdccb" },
    { "id": "tote", "name": "Beg tote kain", "price": 1290, "category": "clothing", "color": "#ebdccb" },
    { "id": "cap", "name": "Topi kasual", "price": 1890, "category": "clothing", "color": "#ebdccb" },
    { "id": "towel", "name": "Tuala mandi", "price": 2490, "category": "clothing", "color": "#ebdccb" },
    { "id": "handtowel", "name": "Tuala tangan", "price": 990, "category": "clothing", "color": "#ebdccb" },
    { "id": "umbrella", "name": "Payung lipat", "price": 1990, "category": "clothing", "color": "#ebdccb" },
    { "id": "raincoat", "name": "Baju hujan", "price": 2490, "category": "clothing", "color": "#ebdccb" },
    { "id": "apron", "name": "Apron dapur", "price": 1590, "category": "clothing", "color": "#ebdccb" },
    { "id": "slippers", "name": "Selipar rumah", "price": 1690, "category": "clothing", "color": "#ebdccb" }
  ].map((p) => ({ ...p, category: p.category || (p.weighted ? "fresh" : ["soap", "detergent"].includes(p.id) ? "household" : ["juice", "cookies", "snack", "butter", "icecream"].includes(p.id) ? "snacks" : p.id === "nasi" ? "meals" : "essentials") }));
  var PEOPLE = [
    {
      "id": "person-1",
      "name": "Aina",
      "role": "Guru sekolah",
      "community": "Melayu",
      "skin": "#d69d77",
      "hair": "#40302b",
      "shirt": "#dc9979",
      "line": "Singgah beli barang untuk rumah.",
      "scarf": true,
      "scarfColor": "#79738e"
    },
    {
      "id": "person-2",
      "name": "Amir",
      "role": "Juruteknik",
      "community": "Melayu",
      "skin": "#b78561",
      "hair": "#292d31",
      "shirt": "#6a9e95",
      "line": "Hari ini nak masak untuk keluarga.",
      "hairStyle": "short"
    },
    {
      "id": "person-3",
      "name": "Mei Ling",
      "role": "Arkitek",
      "community": "Cina",
      "skin": "#e1b595",
      "hair": "#312d32",
      "shirt": "#a39ac8",
      "line": "Hai! Cantik kedai hari ini.",
      "hairStyle": "bob"
    },
    {
      "id": "person-4",
      "name": "Pak Din",
      "role": "Pesara aktif",
      "community": "Melayu",
      "skin": "#bd8964",
      "hair": "#d9d6cf",
      "shirt": "#9eaf7c",
      "line": "Saya cari barang untuk hujung minggu.",
      "glasses": true,
      "hat": "songkok",
      "moustache": true
    },
    {
      "id": "person-5",
      "name": "Kavitha",
      "role": "Chef keluarga",
      "community": "India",
      "skin": "#a86e50",
      "hair": "#30282d",
      "shirt": "#d9869a",
      "line": "Terima kasih, semua barang ada di sini.",
      "hairStyle": "long",
      "earrings": true
    },
    {
      "id": "person-6",
      "name": "Farid",
      "role": "Pelajar kolej",
      "community": "Melayu",
      "skin": "#d4a27c",
      "hair": "#2d3037",
      "shirt": "#739dc2",
      "line": "Barang sedikit sahaja hari ini.",
      "glasses": true,
      "hairStyle": "spiky"
    },
    {
      "id": "person-7",
      "name": "Wei Jian",
      "role": "Pereka grafik",
      "community": "Cina",
      "skin": "#d9ad87",
      "hair": "#323037",
      "shirt": "#849eab",
      "line": "Singgah beli barang untuk rumah.",
      "glasses": true,
      "hairStyle": "spiky"
    },
    {
      "id": "person-8",
      "name": "Siti Hawa",
      "role": "Pemilik kedai bunga",
      "community": "Melayu",
      "skin": "#c79773",
      "hair": "#382c2a",
      "shirt": "#ba8f96",
      "line": "Hari ini nak masak untuk keluarga.",
      "scarf": true,
      "scarfColor": "#b78d79"
    },
    {
      "id": "person-9",
      "name": "Arjun",
      "role": "Jurutera",
      "community": "India",
      "skin": "#9d6c50",
      "hair": "#29282b",
      "shirt": "#688f9c",
      "line": "Hai! Cantik kedai hari ini.",
      "beard": true
    },
    {
      "id": "person-10",
      "name": "Ling Hui",
      "role": "Ahli farmasi",
      "community": "Cina",
      "skin": "#ebc3a2",
      "hair": "#3c3130",
      "shirt": "#9ba8c1",
      "line": "Saya cari barang untuk hujung minggu.",
      "hairStyle": "long",
      "glasses": true
    },
    {
      "id": "person-11",
      "name": "Dayang",
      "role": "Usahawan Sarawak",
      "community": "Melanau",
      "skin": "#c49c79",
      "hair": "#342b27",
      "shirt": "#8eaaa0",
      "line": "Terima kasih, semua barang ada di sini.",
      "scarf": true,
      "scarfColor": "#668d91"
    },
    {
      "id": "person-12",
      "name": "Jelian",
      "role": "Pemandu pelancong",
      "community": "Iban",
      "skin": "#c39a74",
      "hair": "#342d28",
      "shirt": "#ba9679",
      "line": "Barang sedikit sahaja hari ini.",
      "hairStyle": "bob",
      "earrings": true
    },
    {
      "id": "person-13",
      "name": "Marcus",
      "role": "Jurufoto Sabah",
      "community": "Kadazan-Dusun",
      "skin": "#c89871",
      "hair": "#272d2d",
      "shirt": "#7e9c8e",
      "line": "Singgah beli barang untuk rumah.",
      "hairStyle": "spiky"
    },
    {
      "id": "person-14",
      "name": "Roslyn",
      "role": "Jururawat",
      "community": "Bidayuh",
      "skin": "#d6ad86",
      "hair": "#3b302c",
      "shirt": "#b092a8",
      "line": "Hari ini nak masak untuk keluarga.",
      "hairStyle": "long"
    },
    {
      "id": "person-15",
      "name": "Dinesh",
      "role": "Pembangun perisian",
      "community": "India",
      "skin": "#a27252",
      "hair": "#292c32",
      "shirt": "#7895ac",
      "line": "Hai! Cantik kedai hari ini.",
      "glasses": true,
      "beard": true
    },
    {
      "id": "person-16",
      "name": "Auntie Tan",
      "role": "Peminat berkebun",
      "community": "Cina",
      "skin": "#e3bd9a",
      "hair": "#928d87",
      "shirt": "#bf9692",
      "line": "Saya cari barang untuk hujung minggu.",
      "hairStyle": "bob",
      "glasses": true
    },
    {
      "id": "person-17",
      "name": "Nadia",
      "role": "Peniaga kuih",
      "community": "Melayu",
      "skin": "#b98d6a",
      "hair": "#3f302a",
      "shirt": "#7ba3a0",
      "line": "Terima kasih, semua barang ada di sini.",
      "scarf": true,
      "scarfColor": "#8c9c74"
    },
    {
      "id": "person-18",
      "name": "Harjit",
      "role": "Pemilik bengkel",
      "community": "Punjabi",
      "skin": "#b48361",
      "hair": "#282c2e",
      "shirt": "#a39073",
      "line": "Barang sedikit sahaja hari ini.",
      "hat": "turban",
      "hatColor": "#6a839b",
      "beard": true
    },
    {
      "id": "person-19",
      "name": "Priya",
      "role": "Pelajar seni",
      "community": "India",
      "skin": "#b6815f",
      "hair": "#332b2b",
      "shirt": "#be9a79",
      "line": "Singgah beli barang untuk rumah.",
      "hairStyle": "long",
      "earrings": true
    },
    {
      "id": "person-20",
      "name": "Uncle Lim",
      "role": "Peminat berbasikal",
      "community": "Cina",
      "skin": "#ccaa86",
      "hair": "#aaa397",
      "shirt": "#8caa98",
      "line": "Hari ini nak masak untuk keluarga.",
      "glasses": true,
      "moustache": true
    },
    {
      "id": "person-21",
      "name": "Alang",
      "role": "Pemandu van",
      "community": "Orang Asli",
      "skin": "#b58b63",
      "hair": "#2c2c2a",
      "shirt": "#b0906d",
      "line": "Hai! Cantik kedai hari ini.",
      "hairStyle": "short"
    },
    {
      "id": "person-22",
      "name": "Maria",
      "role": "Pengusaha kafe",
      "community": "Serani",
      "skin": "#d1a080",
      "hair": "#695047",
      "shirt": "#a88696",
      "line": "Saya cari barang untuk hujung minggu.",
      "hairStyle": "bob",
      "earrings": true
    },
    {
      "id": "person-23",
      "name": "Azlan",
      "role": "Anggota bomba",
      "community": "Melayu",
      "skin": "#b8875e",
      "hair": "#302c2c",
      "shirt": "#9a8c72",
      "line": "Terima kasih, semua barang ada di sini.",
      "moustache": true
    },
    {
      "id": "person-24",
      "name": "Christina",
      "role": "Pensyarah",
      "community": "Kadazan-Dusun",
      "skin": "#dfb48b",
      "hair": "#332c2c",
      "shirt": "#8298b0",
      "line": "Barang sedikit sahaja hari ini.",
      "hairStyle": "long",
      "glasses": true
    },
    {
      "id": "person-25",
      "name": "Ravi",
      "role": "Pemandu bas",
      "community": "India",
      "skin": "#8f6247",
      "hair": "#3b3230",
      "shirt": "#89a58e",
      "line": "Singgah beli barang untuk rumah.",
      "moustache": true
    },
    {
      "id": "person-26",
      "name": "Nurul",
      "role": "Pelajar universiti",
      "community": "Melayu",
      "skin": "#d6a681",
      "hair": "#3a302c",
      "shirt": "#b09bb3",
      "line": "Hari ini nak masak untuk keluarga.",
      "scarf": true,
      "scarfColor": "#8b87a6",
      "glasses": true
    },
    {
      "id": "person-27",
      "name": "Jason",
      "role": "Penyunting video",
      "community": "Cina",
      "skin": "#e0b594",
      "hair": "#342b29",
      "shirt": "#8b9eaf",
      "line": "Hai! Cantik kedai hari ini.",
      "hairStyle": "spiky"
    },
    {
      "id": "person-28",
      "name": "Lina",
      "role": "Pemilik bakeri",
      "community": "Iban",
      "skin": "#cb9c76",
      "hair": "#352c28",
      "shirt": "#a99b7d",
      "line": "Saya cari barang untuk hujung minggu.",
      "hairStyle": "bob"
    },
    {
      "id": "person-29",
      "name": "Suresh",
      "role": "Pegawai perpustakaan",
      "community": "India",
      "skin": "#a87857",
      "hair": "#35302f",
      "shirt": "#9b9e81",
      "line": "Terima kasih, semua barang ada di sini.",
      "glasses": true
    },
    {
      "id": "person-30",
      "name": "Hafiz",
      "role": "Peniaga pasar",
      "community": "Melayu",
      "skin": "#c3916b",
      "hair": "#2b2b29",
      "shirt": "#729a96",
      "line": "Barang sedikit sahaja hari ini.",
      "hat": "songkok"
    },
    {
      "id": "person-31",
      "name": "Jasmine",
      "role": "Pelajar muzik",
      "community": "Cina",
      "skin": "#e6bd9f",
      "hair": "#40342f",
      "shirt": "#c49794",
      "line": "Singgah beli barang untuk rumah.",
      "hairStyle": "long"
    },
    {
      "id": "person-32",
      "name": "Anne",
      "role": "Pekerja sosial",
      "community": "Bidayuh",
      "skin": "#d3a781",
      "hair": "#3d312a",
      "shirt": "#91a17a",
      "line": "Hari ini nak masak untuk keluarga.",
      "hairStyle": "bob",
      "glasses": true
    },
    {
      "id": "person-33",
      "name": "Baljit",
      "role": "Jurulatih sukan",
      "community": "Punjabi",
      "skin": "#a97652",
      "hair": "#282a2c",
      "shirt": "#9d9ab4",
      "line": "Hai! Cantik kedai hari ini.",
      "hat": "turban",
      "hatColor": "#b09972",
      "beard": true
    },
    {
      "id": "person-34",
      "name": "Mariam",
      "role": "Tukang jahit",
      "community": "Melayu",
      "skin": "#c69774",
      "hair": "#6d645c",
      "shirt": "#a4aa83",
      "line": "Saya cari barang untuk hujung minggu.",
      "scarf": true,
      "scarfColor": "#9c807f"
    },
    {
      "id": "person-35",
      "name": "Evelyn",
      "role": "Pakar hortikultur",
      "community": "Cina",
      "skin": "#dfb191",
      "hair": "#4b3730",
      "shirt": "#9ba787",
      "line": "Terima kasih, semua barang ada di sini.",
      "hairStyle": "bob",
      "earrings": true
    },
    {
      "id": "person-36",
      "name": "Daniel",
      "role": "Guru muzik",
      "community": "Serani",
      "skin": "#bd9274",
      "hair": "#604b3c",
      "shirt": "#8e9dab",
      "line": "Barang sedikit sahaja hari ini.",
      "hairStyle": "short",
      "glasses": true
    },
    { "id": "person-izzat", "name": "Izzat", "role": "Jurutera Profesional", "community": "Jiran", "skin": "#bc8b6b", "hair": "#2d2927", "shirt": "#649a90", "line": "Singgah beli beberapa barang.", "hairStyle": "short" },
    { "id": "person-sakinah", "name": "Sakinah", "role": "Pengarah Program", "community": "Jiran", "skin": "#ce9d7e", "hair": "#302b2b", "shirt": "#b78c9c", "line": "Saya mahu beli barang dapur.", "scarf": true, "scarfColor": "#94768e" },
    { "id": "person-wawa", "name": "Wawa", "role": "Pengurus Perniagaan", "scarf": true, "scarfColor": "#476e65", "community": "Jiran", "skin": "#cd9b7a", "hair": "#322e30", "shirt": "#88a5a1", "line": "Saya singgah sebelum balik.", "hairStyle": "long" }
  ];
  var CATEGORIES = [
    {
      "id": "essentials",
      "name": "Keperluan harian",
      "cost": 0,
      "art": "milk",
      "description": "Barang asas untuk mula berniaga."
    },
    {
      "id": "fresh",
      "name": "Hasil segar",
      "cost": 2700,
      "art": "apple",
      "description": "Buah, sayur, ayam dan ikan untuk ditimbang."
    },
    {
      "id": "snacks",
      "name": "Snek & tenusu",
      "cost": 3600,
      "art": "icecream",
      "description": "Snek, jus, biskut, mentega dan aiskrim."
    },
    {
      "id": "kuih",
      "name": "Kuih tradisional",
      "cost": 4500,
      "art": "serimuka",
      "description": "12 jenis kuih kegemaran rakyat Malaysia."
    },
    {
      "id": "meals",
      "name": "Hidangan tempatan",
      "cost": 7200,
      "art": "nasi",
      "description": "Nasi lemak, satay, laksa, rendang dan banyak lagi."
    },
    {
      "id": "household",
      "name": "Penjagaan rumah",
      "cost": 8100,
      "art": "detergent",
      "description": "Barangan penjagaan diri dan kebersihan rumah."
    },
    {
      "id": "electrical",
      "name": "Peralatan elektrik",
      "cost": 18e3,
      "art": "ricecooker",
      "description": "8 peralatan elektrik, termasuk periuk nasi dan kipas."
    },
    { "id": "bakery", "name": "Bakeri & sarapan", "cost": 5800, "art": "croissant", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "frozen", "name": "Makanan sejuk beku", "cost": 9e3, "art": "nuggets", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "baby", "name": "Keperluan bayi", "cost": 9900, "art": "diapers", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "pets", "name": "Haiwan peliharaan", "cost": 8100, "art": "catfood", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "stationery", "name": "Alat tulis", "cost": 4500, "art": "notebook", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "garden", "name": "Taman & kebun", "cost": 7200, "art": "soil", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "health", "name": "Penjagaan kesihatan", "cost": 8100, "art": "plaster", "description": "4 pilihan baharu untuk rak kedai anda." },
    { "id": "beverages", "name": "Minuman & jus", "cost": 5200, "art": "water", "description": "12 jenis minuman sejuk dan panas untuk pelanggan." },
    { "id": "pantry", "name": "Bahan masakan", "cost": 6100, "art": "rice", "description": "Sos, perasa, tepung dan bahan dapur." },
    { "id": "personal", "name": "Penjagaan diri", "cost": 8900, "art": "soap", "description": "Mandian, rambut, kulit dan penjagaan harian." },
    { "id": "hardware", "name": "Perkakasan rumah", "cost": 11500, "art": "kettle", "description": "Alatan DIY, bateri dan perkakasan harian." },
    { "id": "accessories", "name": "Aksesori digital", "cost": 16500, "art": "led", "description": "Pengecas, kabel dan aksesori peranti." },
    { "id": "clothing", "name": "Pakaian & tekstil", "cost": 9800, "art": "tissue", "description": "Pakaian ringkas, tuala dan aksesori." }
  ];
  var UPGRADES = [
    { id: "card", name: "Terminal kad", icon: "card", cost: 3500, max: 5, type: "payment", desc: "Tahap 1 membuka kad; tahap lanjut mengurangkan kehausan dan risiko kerosakan." },
    { id: "qr", name: "Scanner QR", icon: "qr", cost: 2500, max: 5, type: "payment", desc: "Tahap 1 membuka QR; tahap lanjut mempercepat pengesahan bayaran." },
    { id: "rushBoost", name: "Pengganda Rush Hour", icon: "spark", cost: 1e5, max: 5, desc: "Untung Rush Hour bermula \xD72; setiap tahap +0.3 sehingga \xD73.5. Kos upgrade tinggi." },
    { id: "storage", name: "Kapasiti stor", icon: "basket", cost: 2600, max: 5, desc: "Tambah had stok 5 unit/kg setiap naik taraf. Bermula dengan 20." },
    { id: "conveyor", name: "Motor conveyor", icon: "arrow", cost: 1500, max: 5, desc: "Barang maju dan tali sawat bergerak lebih pantas." },
    { id: "scale", name: "Penimbang pantas", icon: "scale", cost: 1800, max: 5, desc: "Bacaan berat stabil lebih cepat." },
    { id: "scanner", name: "Scanner pantas", icon: "scan", cost: 2e3, max: 5, desc: "Scan barang lebih pantas." },
    { id: "riderPatience", name: "Kesabaran KitaFood", icon: "delivery", cost: 2e3, max: 5, desc: "Rider menunggu +5 saat setiap tahap. 30 \u2192 55 saat." },
    { id: "comfort", name: "Pendingin hawa", icon: "snow", cost: 2500, max: 5, desc: "Pelanggan biasa lebih sabar (+5 saat setiap tahap)." },
    { id: "tips", name: "Kaunter premium", icon: "spark", cost: 3e3, max: 5, desc: "Tip pelanggan bertambah 25%." }
  ];
  var DENOMS = [1e4, 5e3, 2e3, 1e3, 500, 100, 50, 20, 10, 5];
  function money(cents) {
    return "RM " + (cents / 100).toFixed(2);
  }
  function itemPrice(item) {
    return item.weighted ? Math.round(item.price * item.grams / 1e3) : item.price;
  }
  function basketTotal(items) {
    return items.reduce((s, i) => s + itemPrice(i), 0);
  }
  function netTotal(customer2) {
    return Math.max(0, customer2.total - (customer2.discount || 0));
  }
  function amountDue(customer2) {
    const total = Math.max(0, netTotal(customer2) - kasihContribution(customer2));
    return customer2.method === "cash" && customer2.kind !== "return" ? Math.round(total / 5) * 5 : total;
  }
  function tenderFor(total) {
    return [500, 1e3, 2e3, 5e3, 1e4, 2e4].find((v) => v >= total) || Math.ceil(total / 1e4) * 1e4;
  }
  function changeParts(cents) {
    const parts = [];
    for (const value of DENOMS) {
      const count = Math.floor(cents / value);
      if (count) parts.push({ value, count });
      cents %= value;
    }
    return { parts, remainder: cents };
  }
  var RUSH_DURATION_SECONDS = 30;
  var RUSH_PATIENCE_SECONDS = 10;
  function rushHourActive(day, session2) {
    return Number(day) >= 1 && !!session2 && !!session2.rushStarted && !session2.rushCompleted && Number(session2.rushSecondsRemaining) > 0;
  }
  function rushHourMultiplier(upgrades = {}) {
    const level = Math.max(0, Math.min(5, Math.floor(Number(upgrades?.rushBoost) || 0)));
    return 2 + level * 0.3;
  }
  function rushHourProfitBonus(marginCents, upgrades = {}, active = false) {
    return active ? Math.round(Math.max(0, marginCents) * (rushHourMultiplier(upgrades) - 1)) : 0;
  }
  function shouldStartRushHour(session2, day) {
    return !!session2 && Number(day) >= 2 && Number(day) % 2 === 0 && !session2.rushStarted && !session2.rushCompleted && (normalCustomerCount(session2) >= Math.min(5, Math.max(1, Math.ceil(dayTarget(day) * 0.55))) || Number(session2.clockMinutes) >= 900);
  }
  function startRushHour(session2, day) {
    if (!shouldStartRushHour(session2, day)) return false;
    session2.rushStarted = true;
    session2.rushCompleted = false;
    session2.rushSecondsRemaining = RUSH_DURATION_SECONDS;
    session2.rushDurationSeconds = RUSH_DURATION_SECONDS;
    session2.rushDurationVersion = 68;
    return true;
  }
  function tickRushHour(session2, seconds) {
    if (!session2?.rushStarted || session2.rushCompleted || !Number.isFinite(seconds) || seconds <= 0) return false;
    session2.rushSecondsRemaining = Math.max(0, (session2.rushSecondsRemaining || 0) - seconds);
    if (session2.rushSecondsRemaining < 1e-3) session2.rushSecondsRemaining = 0;
    if (session2.rushSecondsRemaining > 0) return false;
    session2.rushCompleted = true;
    return true;
  }
  function dayTarget(day) {
    return Math.min(20, 4 + Math.max(1, Math.floor(Number(day) || 1)));
  }
  function createProgress() {
    return { version: 1, day: 1, wallet: 0, lifetime: 0, served: 0, bestCombo: 0, upgrades: { scanner: 0, scale: 0, conveyor: 0, comfort: 0, riderPatience: 0, tips: 0, storage: 0, card: 0, qr: 0, rushBoost: 0 }, history: [], unlocked: ["essentials"], settings: { motion: true, theme: "mint", volume: 0.6, music: true, musicVolume: 0.2, musicTrack: "random" } };
  }
  function restoreProgress(raw) {
    try {
      const p = JSON.parse(raw);
      if (p?.version !== 1 || !Number.isInteger(p.day) || p.day < 1 || !Number.isFinite(p.wallet)) return createProgress();
      return { ...createProgress(), ...p, upgrades: { ...createProgress().upgrades, ...p.upgrades }, history: Array.isArray(p.history) ? p.history.slice(-20) : [], settings: { ...createProgress().settings, ...p.settings }, unlocked: Array.isArray(p.unlocked) ? [.../* @__PURE__ */ new Set(["essentials", ...p.unlocked.filter((id) => CATEGORIES.some((c) => c.id === id))])] : ["essentials"] };
    } catch {
      return createProgress();
    }
  }
  function randomManualCode(rng = Math.random) {
    return String(1e3 + Math.floor(rng() * 9e3));
  }
  function availableProducts(unlocked = ["essentials"]) {
    return PRODUCTS.filter((p) => unlocked.includes(p.category));
  }
  function choosePerson(seen = [], rng = Math.random, forcedPersonId = null) {
    if (forcedPersonId) {
      const candidate = PEOPLE.find((p) => p.id === forcedPersonId);
      if (candidate && !seen.includes(candidate.id) && !seen.includes(candidate.name)) return candidate;
    }
    const available = PEOPLE.filter((p) => !seen.includes(p.id) && !seen.includes(p.name));
    return available.length ? available[Math.floor(rng() * available.length)] : null;
  }
  function makeCustomer(day, index, rng = Math.random, options = {}) {
    const person = choosePerson(options.seen || [], rng, options.forcedPersonId);
    if (!person) return null;
    const pool = availableProducts(options.unlocked || ["essentials"]);
    const remaining = options.stock ? { ...options.stock } : null;
    const count = Math.min(9, 3 + Math.floor(day / 2) + Math.floor(rng() * 3));
    const items = [];
    for (let i = 0; i < count; i++) {
      const choices = remaining ? pool.filter((p2) => (remaining[p2.id] || 0) >= (p2.weighted ? 100 : 1)) : pool;
      if (!choices.length) break;
      const p = choices[Math.floor(rng() * choices.length)], grams = p.weighted ? Math.min((2 + Math.floor(rng() * 15)) * 50, Math.floor((remaining?.[p.id] ?? 99999) / 50) * 50) : 1e3;
      items.push({ ...p, uid: day + "-" + index + "-" + i, grams, scanned: false });
      if (remaining) remaining[p.id] -= p.weighted ? grams : 1;
    }
    const allowed = options.paymentMethods || ["cash"];
    const methods = ["cash", "card", "qr", "cash"].filter((m) => m === "cash" || allowed.includes(m));
    const method = index === 0 ? "cash" : methods[Math.floor(rng() * methods.length)];
    const kind = index % 4 === 2 ? "vip" : index % 4 === 3 ? "express" : "regular";
    const challenges = options.challenges !== false;
    const scannerLevel = Math.max(0, Math.min(5, Number(options.upgrades?.scanner) || 0));
    const barcodeChance = Math.max(0.045, 0.21 - scannerLevel * 0.035);
    if (challenges && day >= 4 && rng() < barcodeChance) {
      const packed = items.filter((i) => !i.weighted);
      if (packed.length) {
        const damaged = packed[Math.floor(rng() * packed.length)];
        damaged.damaged = true;
        damaged.manualCode = randomManualCode(rng);
      }
    }
    const cardLevel = Math.max(1, Math.min(5, Number(options.upgrades?.card) || 1));
    const declineChance = Math.max(0.04, 0.17 - (cardLevel - 1) * 0.03);
    const fail = challenges && method === "card" && day >= 11 && rng() < declineChance;
    const declineRoll = rng();
    const cardDeclineReason = fail ? declineRoll < 0.45 ? "insufficient" : declineRoll < 0.75 ? "technical" : "expired" : null;
    return { person, items, method, willTip: rng() < 0.4, dialogueSeed: Math.floor(rng() * 1e4), cardFailure: false, cardDeclineReason, cardDeclineHandled: false, total: basketTotal(items), tender: tenderFor(basketTotal(items)), patience: 20, patienceRulesVersion: 65, elapsed: 0, kind, hasCoupon: index % 3 === 1, couponApplied: false, discount: 0, requiresPin: method === "card" && rng() < 0.5, cardPin: String(1e3 + Math.floor(rng() * 9e3)), cardStage: "ready", pinInput: "" };
  }
  function unlockCategory(progress2, id) {
    const c = CATEGORIES.find((c2) => c2.id === id);
    progress2.unlocked ??= ["essentials"];
    if (!c || progress2.unlocked.includes(id) || progress2.wallet < c.cost) return false;
    ensureOperations(progress2);
    progress2.wallet -= c.cost;
    progress2.unlocked.push(id);
    for (const item of PRODUCTS.filter((p) => p.category === id)) {
      progress2.inventory[item.id] = 20 * (item.weighted ? 1e3 : 1);
    }
    return true;
  }
  function normalCustomerCount(session2) {
    return Math.max(0, (session2?.served || 0) + (session2?.lost || 0) - (session2?.rushServed || 0) - (session2?.rushLost || 0));
  }
  function dayFinished(session2, day) {
    return normalCustomerCount(session2) >= dayTarget(day) && (!session2.rushStarted || session2.rushCompleted);
  }
  function tipFor(customer2, combo2, upgrades) {
    if (customer2.willTip === false) return 0;
    const fraction = Math.max(0, 1 - customer2.elapsed / customer2.patience);
    return Math.round((60 + fraction * 170 + Math.min(combo2, 10) * 20) * (1 + (upgrades.tips || 0) * 0.25) * (customer2.kind === "vip" ? 1.5 : 1) / 5) * 5;
  }
  function buyUpgrade(progress2, id) {
    const u = UPGRADES.find((u2) => u2.id === id);
    if (!u) return false;
    const level = progress2.upgrades[id] || 0, cost = u.cost * (level + 1);
    if (level >= u.max || progress2.wallet < cost) return false;
    progress2.wallet -= cost;
    progress2.upgrades[id] = level + 1;
    return true;
  }
  function applyCoupon(customer2) {
    if (!customer2.hasCoupon || customer2.couponApplied || !customer2.items.every((p) => p.scanned)) return false;
    customer2.discount = Math.round(customer2.total * 0.1);
    customer2.couponApplied = true;
    return true;
  }
  function dailyMissions(session2) {
    return [
      { id: "fresh", title: "Pakar hasil segar", description: "Timbang 3 barang segar", value: session2?.weighed || 0, target: 3, reward: 200 },
      { id: "perfect", title: "Baki tepat, hati gembira", description: "Selesaikan 3 bayaran tunai tanpa silap", value: session2?.perfectCash || 0, target: 3, reward: 300 },
      { id: "combo", title: "Rentak cashier", description: "Capai combo 3 pelanggan", value: session2?.bestCombo || 0, target: 3, reward: 400 }
    ];
  }
  function claimMission(progress2, session2, id) {
    if (!session2 || session2.mode === "practice") return false;
    const m = dailyMissions(session2).find((m2) => m2.id === id);
    session2.claimedMissions ??= [];
    if (!m || m.value < m.target || session2.claimedMissions.includes(id)) return false;
    session2.claimedMissions.push(id);
    progress2.wallet += m.reward;
    progress2.lifetime += m.reward;
    return true;
  }
  function calculateExpression(expression) {
    let compact = expression.replaceAll("\xD7", "*").replaceAll("\xF7", "/").replaceAll("\u2212", "-").replace(/\s/g, "");
    if (compact.startsWith("-")) compact = "0" + compact;
    if (!/^\d*\.?\d+(?:[+*/-]\d*\.?\d+)*$/.test(compact)) throw new Error("Lengkapkan kiraan dahulu.");
    const tokens = compact.match(/\d*\.?\d+|[+*/-]/g), parts = [Number(tokens[0])];
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i], n = Number(tokens[i + 1]);
      if (op === "*" || op === "/") {
        if (op === "/" && n === 0) throw new Error("Tidak boleh bahagi dengan sifar.");
        const prev = parts.pop();
        parts.push(op === "*" ? prev * n : prev / n);
      } else parts.push(op, n);
    }
    let value = parts[0];
    for (let i = 1; i < parts.length; i += 2) value += parts[i] === "+" ? parts[i + 1] : -parts[i + 1];
    if (!Number.isFinite(value) || Math.abs(value) > 1e12) throw new Error("Nilai terlalu besar.");
    return Math.round(value * 1e8) / 1e8;
  }
  function effectiveRushMachineUpgrades(upgrades = {}, active = false) {
    return active ? { ...upgrades, scanner: 5, scale: 5, conveyor: 5 } : upgrades;
  }
  function machineTimings(upgrades = {}) {
    const level = (id, max) => Math.max(0, Math.min(max, Math.floor(Number(upgrades[id]) || 0)));
    const conveyor = level("conveyor", 5);
    return { beltMs: [1700, 1200, 800, 500, 390, 310][conveyor], slideMs: [580, 410, 270, 170, 130, 100][conveyor], scanMs: [450, 320, 230, 180, 140, 110][level("scanner", 5)], weighMs: [1e3, 750, 570, 430, 330, 260][level("scale", 5)] };
  }
  function availablePaymentMethods(upgrades = {}, practice = false) {
    return ["cash", ...practice || upgrades.card >= 1 ? ["card"] : [], ...practice || upgrades.qr >= 1 ? ["qr"] : []];
  }
  var STOCK_TARGET = 8;
  var PAPER_PACK = 20;
  var PAPER_COST = 200;
  function stockUnits(p) {
    return p.weighted ? p.grams : 1;
  }
  function stockCapacity(progress2) {
    const lvl = Math.max(0, Math.min(5, Math.floor(Number(progress2?.upgrades?.storage) || 0)));
    return 20 + 5 * lvl;
  }
  function stockTarget(p, progress2 = null) {
    const amount = progress2 ? stockCapacity(progress2) : STOCK_TARGET;
    return p.weighted ? amount * 1e3 : amount;
  }
  function wholesaleRate(product, day = 1) {
    const code = String(product.id || "").split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0) >>> 0, 2166136261);
    const date = Math.max(1, Math.floor(Number(day) || 1));
    const seed = Math.imul((code ^ Math.imul(date, 2654435761)) >>> 0, 1664525) >>> 0;
    const fluctuation = (seed + 1013904223 >>> 0) % 19 - 9;
    return (82 + fluctuation) / 100;
  }
  function wholesaleChange(product, day = 1) {
    const today = wholesaleRate(product, day), yesterday = wholesaleRate(product, Math.max(1, day - 1));
    return Math.round((today - yesterday) / yesterday * 100);
  }
  function stockCost(p, quantity, day = 1) {
    return Math.max(1, Math.round(p.price * wholesaleRate(p, day) * quantity / (p.weighted ? 1e3 : 1)));
  }
  function ensureOperations(p) {
    const fresh = !p.inventory || typeof p.inventory !== "object";
    p.inventory = fresh ? {} : p.inventory;
    for (const item of PRODUCTS) {
      const old = p.inventory[item.id];
      p.inventory[item.id] = old === void 0 && p.unlocked.includes(item.category) ? stockTarget(item, p) : Math.max(0, Math.floor(Number(old) || 0));
    }
    p.paper = Number.isInteger(p.paper) ? Math.max(0, p.paper) : 12;
    p.cardHealth = Number.isFinite(p.cardHealth) ? Math.max(0, Math.min(100, p.cardHealth)) : 100;
    p.cardBroken = !!p.cardBroken || p.cardHealth === 0;
    p.supplierDebt = Math.max(0, Math.round(Number(p.supplierDebt) || 0));
    p.sales = Array.isArray(p.sales) ? p.sales.slice(-120) : [];
    p.saleSequence = Math.max(0, Math.floor(p.saleSequence || 0));
    return fresh;
  }
  var MAX_STOCK_PURCHASE = 20;
  var LOW_STOCK_UNITS = 5;
  function stockQuote(p, id = null, units = null) {
    ensureOperations(p);
    const manual = units !== null;
    if (manual && (!id || !Number.isInteger(units) || units < 1 || units > MAX_STOCK_PURCHASE)) return { lines: [], total: 0, manual: true };
    const lines2 = availableProducts(p.unlocked).filter((x) => !id || x.id === id).map((x) => {
      const available = Math.max(0, stockTarget(x, p) - p.inventory[x.id]);
      const requested = manual ? units * (x.weighted ? 1e3 : 1) : Math.min(available, MAX_STOCK_PURCHASE * (x.weighted ? 1e3 : 1));
      const quantity = manual ? requested <= available ? requested : 0 : requested;
      return { id: x.id, name: x.name, weighted: !!x.weighted, quantity, cost: quantity ? stockCost(x, quantity, p.day) : 0 };
    }).filter((x) => x.quantity > 0);
    return { lines: lines2, total: lines2.reduce((sum, x) => sum + x.cost, 0), manual };
  }
  function payStoreCost(p, cost, credit = false) {
    if (!Number.isInteger(cost) || cost < 0 || !credit && p.wallet < cost) return false;
    const paid = Math.min(Math.max(0, p.wallet), cost);
    p.wallet -= paid;
    p.supplierDebt += cost - paid;
    return true;
  }
  function buyStock(p, quote, credit = false) {
    ensureOperations(p);
    if (!quote || !Array.isArray(quote.lines) || !quote.lines.length || !Number.isInteger(quote.total) || quote.total <= 0) return false;
    const expected = quote.manual ? quote.lines.length === 1 ? stockQuote(p, quote.lines[0].id, quote.lines[0].quantity / (quote.lines[0].weighted ? 1e3 : 1)) : null : stockQuote(p);
    if (!expected || expected.lines.length !== quote.lines.length || expected.total !== quote.total) return false;
    if (!quote.lines.every((line) => expected.lines.some((x) => x.id === line.id && x.weighted === line.weighted && x.quantity === line.quantity && x.cost === line.cost))) return false;
    if (!payStoreCost(p, expected.total, credit)) return false;
    for (const line of expected.lines) p.inventory[line.id] += line.quantity;
    return true;
  }
  function stockForBasket(p, items) {
    const needed = {};
    for (const x of items) needed[x.id] = (needed[x.id] || 0) + stockUnits(x);
    return Object.entries(needed).every(([id, n]) => (p.inventory[id] || 0) >= n);
  }
  function takeStock(p, items) {
    if (!stockForBasket(p, items)) return false;
    for (const x of items) p.inventory[x.id] -= stockUnits(x);
    return true;
  }
  function receiveStoreCash(p, cents) {
    const repayment = Math.min(p.supplierDebt || 0, Math.max(0, Math.floor(cents * 0.3)));
    p.supplierDebt -= repayment;
    p.wallet += cents - repayment;
    return repayment;
  }
  function ensureShift(s) {
    if (!s) return;
    s.stars = Number.isInteger(s.stars) ? Math.max(0, Math.min(3, s.stars)) : 3;
    s.clockMinutes = Number.isFinite(s.clockMinutes) ? s.clockMinutes : 480;
    s.overpaid = Math.max(0, s.overpaid || 0);
    s.expenses = s.expenses || 0;
    s.refunds = s.refunds || 0;
    s.returnCount = s.returnCount || 0;
    s.waitSeconds = Math.max(0, s.waitSeconds || 0);
    s.rushStarted = !!s.rushStarted;
    s.rushCompleted = !!s.rushCompleted;
    if (s.rushStarted && !s.rushCompleted && s.rushDurationVersion !== 68) {
      const elapsed = Math.max(0, (Number(s.rushDurationSeconds) || 60) - (Number(s.rushSecondsRemaining) || 0));
      s.rushSecondsRemaining = Math.max(0, RUSH_DURATION_SECONDS - elapsed);
      if (s.rushSecondsRemaining === 0) {
        s.rushReportPending = true;
        s.rushReportShown = false;
      }
    }
    s.rushDurationSeconds = RUSH_DURATION_SECONDS;
    s.rushDurationVersion = 68;
    s.rushSecondsRemaining = s.rushCompleted ? 0 : Math.max(0, Math.min(RUSH_DURATION_SECONDS, Number(s.rushSecondsRemaining) || 0));
    if (s.rushStarted && s.rushSecondsRemaining <= 0) s.rushCompleted = true;
    s.rushBonus = Math.max(0, Math.floor(Number(s.rushBonus) || 0));
    s.rushSales = Math.max(0, Math.floor(Number(s.rushSales) || 0));
    s.rushServed = Math.max(0, Math.floor(Number(s.rushServed) || 0));
    s.rushLost = Math.max(0, Math.floor(Number(s.rushLost) || 0));
    s.rushRevenue = Math.max(0, Math.floor(Number(s.rushRevenue) || 0));
    s.rushEarned = Math.round(Number(s.rushEarned) || 0);
    s.rushReportPending = !!s.rushReportPending;
    s.rushReportShown = !!s.rushReportShown;
  }
  function loseStar(s, reason) {
    ensureShift(s);
    const before = s.stars;
    s.stars = Math.max(0, s.stars - 1);
    s.lastStarReason = reason;
    return before - s.stars;
  }
  function settleShift(p, s, career = true) {
    ensureShift(s);
    if (s.settled) return 0;
    s.settled = true;
    const loss = s.overpaid;
    s.earned -= loss;
    if (career) {
      const paid = Math.min(Math.max(0, p.wallet), loss);
      p.wallet -= paid;
      p.supplierDebt += loss - paid;
      p.lifetime -= loss;
    }
    return loss;
  }
  function arrivalWait(minutes, rng = Math.random) {
    return minutes < 1020 ? 0 : minutes < 1140 ? 3 + Math.floor(rng() * 3) : 6 + Math.floor(rng() * 4);
  }
  function clockText(minutes) {
    const n = Math.min(1320, Math.floor(minutes));
    return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
  }
  var CUSTOMER_LINES = {
    welcome: ["Singgah beli barang dapur sebelum balik.", "Hari ini nak masak untuk keluarga.", "Boleh asingkan barang yang berat ya? Terima kasih!", "Saya suka singgah kedai kejiranan macam ni.", "Nak beli bekalan untuk hujung minggu.", "Hujan tadi, nasib baik kedai masih buka.", "Ada tetamu datang malam ini. Kena tambah barang.", "Baru balik kerja, singgah sekejap beli barang.", "Anak-anak kirim barang untuk sarapan esok.", "Beli sikit dahulu, nanti saya singgah lagi.", "Hai! Semoga perniagaan hari ini lancar.", "Nak lengkapkan barang yang tak cukup di rumah."],
    cash: ["Saya bayar tunai ya. Tolong semak bakinya.", "Ini duitnya. Boleh pulangkan baki saya?", "Saya ada wang kertas, harap ada baki ya."],
    card: ["Saya guna kad debit. Kad saya sudah sedia.", "Boleh bayar kad? Kad saya di sini.", "Saya nak guna kad untuk pembelian ini."],
    qr: ["Saya dah buka QR pada telefon.", "Boleh imbas kod e-wallet saya?", "Telefon dah sedia, saya bayar QR ya."],
    change: ["Terima kasih. Saya tunggu baki.", "Semak dulu, tak mengapa.", "Boleh beri baki yang tepat ya."],
    thanks: ["Terima kasih, layanan awak baik!", "Ini sedikit tip untuk awak. Jumpa lagi!", "Semoga kedai makin maju. Terima kasih!"],
    thanksNoTip: ["Terima kasih, jumpa lagi!", "Terima kasih atas layanan hari ini.", "Semoga kedai makin maju. Jumpa lagi!"],
    returns: ["Saya tersalah beli barang ini. Masih berbungkus, ini resitnya.", "Barang ini belum dibuka. Boleh bantu pulangkan?", "Keluarga saya terbeli dua. Saya bawa resit untuk pulangkan satu."]
  };
  function customerLine(c, key) {
    const lines2 = CUSTOMER_LINES[key] || CUSTOMER_LINES.welcome;
    return (key === "returns" && c.returnReason ? c.returnReason : lines2[(c.dialogueSeed || 0) % lines2.length]).replaceAll(",", "");
  }
  function cardRepairCost(store) {
    const health = Math.max(0, Math.min(100, store.cardHealth ?? 100));
    return health === 100 && !store.cardBroken ? 0 : 200 + 10 * (100 - (store.cardBroken ? 0 : health));
  }
  function returnPolicy(product) {
    if (!product || product.weighted || ["fresh", "meals", "kuih"].includes(product.category)) return null;
    if (product.category === "electrical") return { days: 7, reason: "Barang ini tidak berfungsi apabila saya cuba hidupkan.", condition: "Kerosakan fungsi disahkan", restock: false };
    if (product.id === "bread" || product.category === "bakery") return { days: 2, reason: "Tarikh luput pada bungkusan sudah lepas semasa saya membelinya.", condition: "Luput ketika dijual \xB7 asingkan daripada stok", restock: false };
    if (["essentials", "snacks", "frozen", "baby", "health"].includes(product.category)) return { days: 3, reason: "Pengedap bungkusan ini sudah rosak semasa saya membelinya.", condition: "Pengedap rosak \xB7 tidak selamat dijual semula", restock: false };
    return { days: 3, reason: "Saya tersalah beli jenis ini. Barang masih belum dibuka.", condition: "Berbungkus dan belum digunakan", restock: true };
  }
  function returnMatches(record, claim, item, day) {
    const rule = returnPolicy(item);
    return !!(record && claim && rule && !record.returned && record.paid > 0 && day >= record.day && day - record.day <= rule.days && claim.receipt === record.receipt && claim.day === record.day && claim.productId === record.productId && claim.quantity === 1 && claim.paid === record.paid && item.id === record.productId);
  }

  // delivery.mjs
  function createDelivery({ getProgress, getSession, getMode, save: save2, notify, money: money2, products, categories = [], productArt: productArt2, icon: icon2, openModal: openModal2, closeModal: closeModal2, receiveCash, onFinish = () => {
  }, isClockPaused = () => false }) {
    const safe = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const people = [
      { name: "Amir", skin: "#cf9570", hair: "#322d2a", shirt: "#27785d", scarf: false },
      { name: "Sofia", skin: "#ddad89", hair: "#3a3030", shirt: "#27785d", scarf: true, scarfColor: "#32645d" },
      { name: "Hafiz", skin: "#bd835f", hair: "#272827", shirt: "#27785d", scarf: false },
      { name: "Nadia", skin: "#cf987c", hair: "#44352f", shirt: "#27785d", scarf: true, scarfColor: "#337768" },
      { name: "Faris", skin: "#d09d78", hair: "#292d2f", shirt: "#27785d", scarf: false }
    ];
    const pmap = new Map(products.map((x) => [x.id, x]));
    const foodCategories = /* @__PURE__ */ new Set(["essentials", "snacks", "meals", "bakery", "frozen", "beverages", "pantry", "kuih"]);
    const statsDefault = () => ({ completed: 0, cancelled: 0, revenue: 0, bonus: 0, late: 0, starsTotal: 0 });
    let clearSearchOnFocus = false;
    let activeId = null, stage = "list", search = "", filter = "all", lastPicked = null, clockHandle = null, lastSavedAt = 0, resultPending = null;
    const RIDER_TIME_LIMIT = 30, URGENT_TIME_LIMIT = 10;
    const timeLimit = () => RIDER_TIME_LIMIT + 5 * Math.max(0, Math.min(5, Number(getProgress().upgrades?.riderPatience) || 0));
    const pending = (d) => d.orders.filter((o) => ["new", "packing", "ready"].includes(o.status) && Array.isArray(o.items));
    const picked = (o) => o.items.filter((x) => x.packed).length;
    const ready = (o) => !!o.items.length && o.items.every((x) => x.packed);
    const due = remainingSeconds;
    const clockText2 = (o) => `${Math.floor(due(o) / 60)}:${String(due(o) % 60).padStart(2, "0")}`;
    const total = (o) => o.items.reduce((n, x) => n + (Number(x.price) || pmap.get(x.id)?.price || 0), 0);
    const unlocked = () => getMode() === "career" && getProgress().day >= 3;
    function ensure() {
      const p = getProgress();
      if (!p.delivery || typeof p.delivery !== "object") p.delivery = { orders: [], nextId: 1, stats: statsDefault(), upgrades: { rack: 0 } };
      const d = p.delivery;
      if (!Array.isArray(d.orders)) d.orders = [];
      d.nextId = Math.max(1, Math.floor(Number(d.nextId) || 1));
      d.stats = { ...statsDefault(), ...d.stats || {} };
      if (!d.upgrades) d.upgrades = { rack: 0 };
      for (const o of d.orders) {
        if (!Array.isArray(o.items)) o.items = [];
        if (o.items.length && ready(o) && ["new", "packing"].includes(o.status)) o.status = "ready";
        o.platform = "KitaFood";
        o.timeLimit ??= timeLimit(o.day || p.day);
        o.elapsedSeconds = Number(o.elapsedSeconds) || 0;
        if (["new", "packing", "ready"].includes(o.status)) {
          if (!Number.isFinite(o.deadlineAt)) o.deadlineAt = Date.now() + Math.max(0, o.timeLimit - o.elapsedSeconds) * 1e3;
          o.elapsedSeconds = Math.max(0, o.timeLimit - remainingMs(o) / 1e3);
        }
      }
      syncClock();
      updateIndicator(d);
      if (pending(d).length) startClock();
      else stopClock();
      return d;
    }
    function updateIndicator(d) {
      const b = document.getElementById("deliveryBtn");
      if (!b) return;
      const orders = pending(d), n = orders.length;
      b.dataset.pending = String(n);
      b.classList.toggle("delivery-alert", n > 0);
      b.querySelector(".kf-nav-timer")?.remove();
      b.title = n ? `KitaFood \xB7 ${n} pesanan aktif` : "KitaFood";
      b.setAttribute("aria-label", n ? `KitaFood, ${n} pesanan aktif` : "KitaFood");
    }
    function personFor(order) {
      const normalized = people.find((x) => x.name === order?.rider) || people[0];
      return { ...normalized, id: "rider-kita-food", role: "KitaFood \xB7 Rakan Penghantar" };
    }
    function newOrder() {
      if (!unlocked()) return null;
      const p = getProgress(), d = ensure();
      if (pending(d).length) return pending(d)[0];
      const pool = products.filter((x) => foodCategories.has(x.category) && p.unlocked.includes(x.category) && !x.weighted && (Number(p.inventory?.[x.id]) || 0) > 0);
      if (pool.length < 2) return null;
      const count = Math.min(pool.length, Math.min(6, 2 + Math.floor((p.day - 1) / 3))), items = [];
      const candidates = pool.slice();
      while (items.length < count && candidates.length) {
        const i = Math.floor(Math.random() * candidates.length), x = candidates.splice(i, 1)[0];
        items.push({ id: x.id, name: x.name, price: x.price, packed: false });
      }
      const id = d.nextId++, rider = people[id % people.length].name;
      const order = { id: `KF-${String(id).padStart(4, "0")}`, platform: "KitaFood", rider, code: String(1e3 + Math.floor(Math.random() * 9e3)), items, status: "new", day: p.day, timeLimit: timeLimit(p.day), arrivalQuota: normalCustomerCount(getSession()), elapsedSeconds: 0, wrongPicks: 0 };
      order.deadlineAt = Date.now() + order.timeLimit * 1e3;
      d.orders.push(order);
      startClock();
      activeId = order.id;
      stage = "list";
      search = "";
      filter = "all";
      clearSearchOnFocus = false;
      save2();
      updateIndicator(d);
      return order;
    }
    function maybeArrive(index) {
      if (!unlocked() || !getSession()) return null;
      const s = getSession(), existing = pending(ensure());
      if (existing.length) return existing[0];
      const today = ensure().orders.filter((o) => o.day === getProgress().day);
      const target = dayTarget(getProgress().day), limit = target <= 8 ? 1 : target <= 14 ? 2 : 3;
      const quota = normalCustomerCount(s);
      if (today.length && s.kitaFoodLastQuota === void 0) s.kitaFoodLastQuota = today[today.length - 1].arrivalQuota ?? quota;
      const slot = Math.max(2, Math.floor(target * (today.length + 1) / (limit + 1)));
      if (today.length >= limit || quota >= target || quota < slot || s.rushSecondsRemaining > 0) return null;
      if (s.kitaFoodLastQuota !== void 0 && quota - s.kitaFoodLastQuota < 3) return null;
      const order = newOrder();
      if (order) {
        s.kitaFoodLastSpawn = index;
        s.kitaFoodLastQuota = quota;
        save2();
      }
      return order;
    }
    function syncClock() {
      const orders = getProgress()?.delivery?.orders;
      if (!Array.isArray(orders)) return false;
      let changed = false;
      const now = Date.now(), paused2 = isClockPaused();
      for (const o of orders) {
        if (["new", "packing", "ready"].includes(o.status)) {
          if (setClockPaused(o, paused2, now)) changed = true;
          o.elapsedSeconds = Math.max(0, (Number(o.timeLimit) || 30) - remainingMs(o, now) / 1e3);
        }
      }
      return changed;
    }
    function stopClock() {
      if (clockHandle !== null) {
        clearInterval(clockHandle);
        clockHandle = null;
      }
    }
    function reset() {
      clearSearchOnFocus = false;
      stopClock();
      activeId = null;
      resultPending = null;
      stage = "list";
      lastPicked = null;
      search = "";
      filter = "all";
      lastSavedAt = 0;
    }
    function validAction(o) {
      const d = ensure();
      if (!pending(d).includes(o) || isClockPaused()) return false;
      if (due(o) <= 0) {
        expireOrder(o.id);
        return false;
      }
      return true;
    }
    function tickClock() {
      const changed = syncClock(), d = ensure();
      if (!isClockPaused()) {
        const expired = pending(d).find((o2) => due(o2) <= 0);
        if (expired) {
          expireOrder(expired.id);
          return;
        }
      }
      const o = pending(d).find((x) => x.id === activeId), e = document.getElementById("kfTimer");
      if (e && o) {
        e.textContent = clockText2(o);
        e.closest(".kf-timer")?.classList.toggle("urgent", due(o) <= URGENT_TIME_LIMIT);
      }
      if (pending(d).length && (changed || Date.now() - lastSavedAt >= 5e3)) {
        lastSavedAt = Date.now();
        save2();
      }
    }
    function startClock() {
      if (clockHandle === null) clockHandle = setInterval(tickClock, 250);
    }
    function shelfHTML(o) {
      const p = getProgress(), term = search.toLocaleLowerCase("ms");
      const list = products.filter((x) => foodCategories.has(x.category) && p.unlocked.includes(x.category) && !x.weighted && (filter === "all" || x.category === filter) && (!term || x.name.toLocaleLowerCase("ms").includes(term)));
      if (!list.length) return '<div class="kf-no-products">Tiada produk sepadan. Cuba carian lain.</div>';
      return list.map((x) => {
        const packed = o.items.some((y) => y.id === x.id && y.packed), stock = p.inventory?.[x.id] || 0;
        return `<button type="button" class="kf-shelf-product ${packed ? "picked" : ""}" data-kf-pick="${safe(x.id)}" ${stock <= 0 ? "disabled" : ""} aria-label="Ambil ${safe(x.name)}"><span class="kf-product-art">${productArt2(x.id)}</span><strong>${safe(x.name)}</strong><small>${money2(x.price)}</small><span class="kf-stock">${stock <= 0 ? "HABIS" : `STOK ${stock}`}</span>${packed ? `<span class="kf-product-check">${icon2("check")}</span>` : ""}</button>`;
      }).join("");
    }
    function orderRows(o) {
      return o.items.map((x, i) => `<div class="kf-order-row ${x.packed ? "done" : ""}"><span class="kf-item-number">${x.packed ? icon2("check") : String(i + 1).padStart(2, "0")}</span><div><b>${safe(x.name)}</b><small>1 unit \xB7 ${money2(x.price)}</small></div><span class="kf-row-status">${x.packed ? "Dalam beg" : "Belum ambil"}</span></div>`).join("");
    }
    function ticket(o) {
      return `<section class="kf-ticket"><div class="kf-section-heading"><div><small>SENARAI BARANGAN</small><h3>Pesanan ${safe(o.id)}</h3></div><b>${picked(o)}/${o.items.length}</b></div><div class="kf-order-rows">${orderRows(o)}</div><div class="kf-ticket-total"><span>DIBAYAR DALAM APLIKASI</span><strong>${money2(total(o))}</strong></div></section>`;
    }
    function riderHeader(o) {
      return `<div class="kf-rider"><div class="kf-rider-badge">${icon2("delivery")}</div><div class="kf-rider-info"><small>RIDER KITAFOOD DI KAUNTER</small><h3>${safe(o.rider)} <span>\xB7 ${safe(o.id)}</span></h3><p>\u201CHai! Saya datang ambil pesanan pelanggan.\u201D</p></div><div class="kf-timer ${due(o) <= URGENT_TIME_LIMIT ? "urgent" : ""}"><small>MASA BAKI</small><strong id="kfTimer">${Math.floor(due(o) / 60)}:${String(due(o) % 60).padStart(2, "0")}</strong></div></div>`;
    }
    function render2(id = activeId, { preserve = false } = {}) {
      const d = ensure(), p = getProgress(), o = pending(d).find((x) => x.id === id) || pending(d)[0] || null;
      activeId = o?.id || null;
      const dialog = document.getElementById("modal"), oldScroll = preserve ? dialog.scrollTop : 0, oldShelf = preserve ? document.getElementById("kfShelf")?.scrollTop || 0 : 0;
      const s = d.stats;
      const head = `<header class="kf-head"><div class="kf-logo">${icon2("delivery")}</div><div><small>KEDAI KITA \xB7 PENGHANTARAN TEMPATAN</small><h2>Kita<em>Food</em></h2><p>Pesanan pelanggan, disiapkan di kaunter.</p></div><button id="kfClose" class="icon-btn" aria-label="Tutup KitaFood">${icon2("close")}</button></header>`;
      const stats = `<div class="kf-stats"><div><small>DIHANTAR</small><strong>${s.completed || 0}</strong></div><div><small>JUALAN KITAFOOD</small><strong>${money2(s.revenue || 0)}</strong></div><div><small>GANJARAN PANTAS</small><strong>${money2(s.bonus || 0)}</strong></div></div>`;
      const content = !o ? `<div class="kf-welcome"><div class="kf-welcome-graphic">${icon2("delivery")}</div><h3>${unlocked() ? "Kaunter KitaFood sedia!" : "KitaFood dibuka pada Hari 3"}</h3>${unlocked() ? "" : "<p>Teruskan Mod Kerjaya sehingga Hari 3 untuk menerima pesanan penghantaran.</p>"}<div class="kf-mini-steps"><span>Rider tiba</span><span>Cari barang</span><span>Sahkan kod</span></div></div>` : `${riderHeader(o)}<nav class="kf-steps" aria-label="Proses pesanan"><span class="done">1. Semak</span><span class="${stage === "pick" || stage === "verify" ? "done" : ""}">2. Cari barang</span><span class="${stage === "verify" ? "done" : ""}">3. Serah</span></nav>
   ${stage === "list" ? `<div class="kf-intro-stage">${ticket(o)}<aside class="kf-tip-card"><div class="kf-tip-symbol">${icon2("basket")}</div><h3>Cari sendiri barang pesanan</h3><p>Lihat senarai di sebelah. Pilih barang yang betul pada rak kedai dan masukkan ke beg sebelum menyerahkannya kepada rider.</p><div class="kf-tip-note">Bayaran pelanggan sudah diterima melalui KitaFood. Tiada perlu kutip tunai.</div><button class="primary-btn kf-big-button" id="kfStart">Mula Cari Barang ${icon2("arrow")}</button></aside></div>` : stage === "pick" ? `<div class="kf-pick-layout">${ticket(o)}<section class="kf-shop"><div class="kf-section-heading"><div><small>RAK PRODUK KEDAI KITA</small><h3>Pilih barang yang diminta</h3></div><span class="kf-scan-label">${icon2("scan")} IMBAS</span></div><div class="kf-filter"><input id="kfSearch" type="search" placeholder="Cari nama produk..." aria-label="Cari barang" autocomplete="off"><select id="kfCategory" aria-label="Kategori barang"><option value="all">Semua kategori</option>${categories.filter((c) => p.unlocked.includes(c.id) && foodCategories.has(c.id)).map((c) => `<option value="${safe(c.id)}">${safe(c.name)}</option>`).join("")}</select></div><div class="kf-shelf" id="kfShelf">${shelfHTML(o)}</div></section></div><div class="kf-bag"><div class="kf-bag-head">${icon2("basket")} <div><small>BEG PESANAN</small><strong>${picked(o)} daripada ${o.items.length} barang</strong></div><div class="kf-progress"><i style="width:${Math.round(100 * picked(o) / o.items.length)}%"></i></div></div><div class="kf-packed">${picked(o) ? o.items.filter((x) => x.packed).map((x) => `<div class="kf-packed-product">${productArt2(x.id)}<span>${safe(x.name)}</span><button data-kf-remove="${safe(x.id)}" type="button">Keluarkan</button></div>`).join("") : "<p>Beg masih kosong. Tekan barang yang betul di rak untuk mengisi beg.</p>"}</div><button class="primary-btn kf-big-button" id="kfDone" ${ready(o) ? "" : "disabled"}>${ready(o) ? "Barang Sudah Siap" : "Lengkapkan Semua Barang"} ${icon2("check")}</button></div>` : `<div class="kf-verify-stage"><div class="kf-sealed"><span class="kf-seal-art">${icon2("basket")}<i>${icon2("check")}</i></span><h3>Semua barang telah dibungkus!</h3><p>Beg pesanan <b>${safe(o.id)}</b> telah dimeterai. Pastikan kod pengambilan sepadan sebelum serahkan kepada rider.</p><div class="kf-review-list">${o.items.map((x) => `<span class="kf-review-product">${productArt2(x.id)}<b>${safe(x.name)}</b>${icon2("check")}</span>`).join("")}</div><button class="kf-back" id="kfEdit">${icon2("undo")} Semak semula beg</button></div><div class="kf-phone"><small>KOD PENGAMBILAN PADA TELEFON RIDER</small><strong>${safe(o.code)}</strong><span>KITAFOOD \xB7 ${safe(o.rider)}</span><label for="kfCode">Masukkan kod 4 digit rider</label><input id="kfCode" maxlength="4" inputmode="none" readonly placeholder="\u2212 \u2212 \u2212 \u2212" autocomplete="off" aria-describedby="kfCodeError"><div class="kf-keypad" role="group" aria-label="Pad nombor kod rider">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map((key) => `<button type="button" data-kf-key="${key}" aria-label="${key === "clear" ? "Kosongkan kod" : key === "back" ? "Padam digit terakhir" : key}">${key === "clear" ? "Padam semua" : key === "back" ? icon2("undo") : key}</button>`).join("")}</div><p id="kfCodeError" class="kf-code-error" role="status" aria-live="polite"></p><button class="primary-btn kf-big-button" id="kfHandoff">Sahkan & Serah Kepada Rider ${icon2("check")}</button></div></div>`}
   <div class="kf-cancel-line"><button id="kfCancel" class="kf-cancel">Batalkan pesanan</button><div id="kfConfirmCancel" class="kf-cancel-confirm" hidden><p>Batalkan pesanan ${safe(o.id)}? Stok tidak akan ditolak.</p><button type="button" id="kfKeep">Kembali</button><button type="button" id="kfCancelYes">Ya, batalkan</button></div></div>`;
      openModal2("delivery", `<div class="modal-pad kf-ui kf-state-${o ? stage : "empty"}">${head}${stats}${content}<footer class="kf-footer">KITAFOOD \xB7 Hanya stok pesanan yang berjaya diserahkan akan ditolak.</footer></div>`);
      document.getElementById("kfClose").onclick = () => closeModal2();
      if (!o) return;
      if (stage === "list") document.getElementById("kfStart").onclick = () => {
        stage = "pick";
        render2(o.id);
      };
      if (stage === "pick") {
        const inp = document.getElementById("kfSearch"), sel = document.getElementById("kfCategory");
        inp.value = search;
        sel.value = filter;
        inp.onfocus = () => {
          if (clearSearchOnFocus) {
            search = "";
            inp.value = "";
            clearSearchOnFocus = false;
            refreshShelf(o);
          }
        };
        inp.oninput = () => {
          clearSearchOnFocus = false;
          search = inp.value;
          refreshShelf(o);
        };
        sel.onchange = () => {
          filter = sel.value;
          refreshShelf(o);
        };
        document.getElementById("kfShelf").onclick = (e) => {
          const btn = e.target.closest("[data-kf-pick]");
          if (btn) pick(o, btn.dataset.kfPick);
        };
        document.querySelectorAll("[data-kf-remove]").forEach((b) => b.onclick = () => removePick(o, b.dataset.kfRemove));
        document.getElementById("kfDone").onclick = () => {
          if (!validAction(o)) return;
          if (!ready(o)) {
            notify("Masih ada barang yang belum diambil.", true);
            return;
          }
          o.sealed = true;
          stage = "verify";
          save2();
          render2(o.id);
        };
      }
      if (stage === "verify") {
        document.getElementById("kfEdit").onclick = () => {
          if (!validAction(o)) return;
          o.sealed = false;
          stage = "pick";
          save2();
          render2(o.id);
        };
        document.getElementById("kfHandoff").onclick = () => handoff(o);
        const input = document.getElementById("kfCode");
        const enterKey = (key) => {
          input.value = key === "clear" ? "" : key === "back" ? input.value.slice(0, -1) : (input.value + key).slice(0, 4);
          input.removeAttribute("aria-invalid");
          document.getElementById("kfCodeError").textContent = "";
        };
        document.querySelectorAll("[data-kf-key]").forEach((b) => b.onclick = () => enterKey(b.dataset.kfKey));
        document.querySelector(".kf-verify-stage").onkeydown = (e) => {
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            enterKey(e.key);
          } else if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            enterKey(e.key === "Delete" ? "clear" : "back");
          } else if (e.key === "Enter" && e.target === input) {
            e.preventDefault();
            handoff(o);
          }
        };
      }
      document.getElementById("kfCancel").onclick = () => {
        document.getElementById("kfConfirmCancel").hidden = false;
      };
      document.getElementById("kfKeep").onclick = () => {
        document.getElementById("kfConfirmCancel").hidden = true;
      };
      document.getElementById("kfCancelYes").onclick = () => finish(o, false);
      if (preserve) {
        dialog.scrollTop = oldScroll;
        if (document.getElementById("kfShelf")) document.getElementById("kfShelf").scrollTop = oldShelf;
      }
      startClock(o);
    }
    function refreshShelf(o) {
      const e = document.getElementById("kfShelf");
      if (e) e.innerHTML = shelfHTML(o);
    }
    function pick(o, id) {
      if (!validAction(o) || stage !== "pick") return;
      const x = o.items.find((y) => y.id === id && !y.packed), p = pmap.get(id);
      if (!x) {
        if (!o.items.some((y) => y.id === id)) o.wrongPicks = (o.wrongPicks || 0) + 1;
        notify((p?.name || "Barang") + " tidak diperlukan atau sudah dimasukkan ke beg.", true);
        return;
      }
      if ((getProgress().inventory?.[id] || 0) < 1) {
        notify("Stok " + safe(x.name) + " tidak cukup.", true);
        return;
      }
      x.packed = true;
      o.status = ready(o) ? "ready" : "packing";
      lastPicked = id;
      clearSearchOnFocus = !!search;
      save2();
      render2(o.id, { preserve: true });
      if (ready(o)) notify("Bagus! Semua barang lengkap. Tekan Barang Sudah Siap.");
    }
    function removePick(o, id) {
      if (!validAction(o)) return;
      const x = o.items.find((y) => y.id === id && y.packed);
      if (!x) return;
      x.packed = false;
      o.status = picked(o) ? "packing" : "new";
      o.sealed = false;
      save2();
      render2(o.id, { preserve: true });
    }
    function handoff(o) {
      if (!validAction(o)) return;
      if (!ready(o) || !o.sealed) {
        notify("Sediakan semua barang dahulu.", true);
        return;
      }
      const code = document.getElementById("kfCode")?.value.trim();
      if (code !== String(o.code)) {
        notify("Kod rider tidak sepadan. Semak semula.", true);
        document.getElementById("kfCodeError").textContent = "Kod tidak sepadan. Cuba semula.";
        document.getElementById("kfCode").setAttribute("aria-invalid", "true");
        document.getElementById("kfCode")?.focus();
        return;
      }
      const p = getProgress(), counts = {};
      for (const x of o.items) counts[x.id] = (counts[x.id] || 0) + 1;
      if (Object.entries(counts).some(([id, n]) => (p.inventory?.[id] || 0) < n)) {
        notify("Stok tidak mencukupi untuk serahan. Semak Inventori.", true);
        return;
      }
      for (const [id, n] of Object.entries(counts)) p.inventory[id] -= n;
      const amount = total(o), bonus = Math.round(amount * 0.1), earn = Math.round(amount * 0.25) + bonus;
      receiveCash(p, earn);
      p.lifetime = (p.lifetime || 0) + amount;
      const d = ensure(), s = d.stats;
      o.status = "completed";
      o.completedDay = p.day;
      o.rating = o.wrongPicks ? 4 : 5;
      o.bonus = bonus;
      o.earned = earn;
      s.completed++;
      s.revenue += amount;
      s.bonus += bonus;
      s.starsTotal = (s.starsTotal || 0) + o.rating;
      const session2 = getSession();
      if (session2) {
        session2.served = (session2.served || 0) + 1;
        session2.deliveryCompleted = (session2.deliveryCompleted || 0) + 1;
        session2.deliveryRevenue = (session2.deliveryRevenue || 0) + amount;
        session2.deliveryBonus = (session2.deliveryBonus || 0) + bonus;
        session2.totalSales = (session2.totalSales || 0) + amount;
        session2.earned = (session2.earned || 0) + earn;
      }
      archive(d);
      save2();
      updateIndicator(d);
      showResult(o, true);
    }
    function finish(o, success, reason = "cancelled") {
      if (success) return handoff(o);
      if (!pending(ensure()).includes(o)) return;
      o.status = "cancelled";
      o.cancelReason = reason;
      const stats = ensure().stats;
      stats.cancelled++;
      if (reason === "timeout") stats.late++;
      archive(ensure());
      save2();
      updateIndicator(ensure());
      showResult(o, false);
    }
    function archive(d) {
      const done = d.orders.filter((x) => ["completed", "cancelled"].includes(x.status));
      if (done.length > 50) {
        const old = new Set(done.slice(0, done.length - 50));
        d.orders = d.orders.filter((x) => !old.has(x));
      }
    }
    function showResult(o, success) {
      resultPending = { o, success };
      const owner = getProgress();
      stopClock();
      activeId = null;
      stage = "list";
      lastPicked = null;
      search = "";
      filter = "all";
      const stars = success ? "\u2605".repeat(o.rating) + "\u2606".repeat(5 - o.rating) : "\u2014";
      openModal2("delivery", `<div class="modal-pad kf-ui kf-result"><section class="kf-result-story"><div class="kf-result-emblem">${icon2(success ? "check" : "close")}</div><small>KITAFOOD \xB7 ${safe(o.id)}</small><h2>${success ? "Pesanan berjaya diserahkan!" : o.cancelReason === "timeout" ? "Masa rider tamat" : "Pesanan dibatalkan"}</h2><p>${success ? `Terima kasih! Rider ${safe(o.rider)} sudah mengambil beg dan bersedia membuat penghantaran.` : "Rider telah dimaklumkan. Stok kekal dan tiada bayaran direkodkan."}</p></section><section class="kf-result-summary">${success ? `<div class="kf-result-stars">${stars} <small>Penilaian perkhidmatan</small></div><div class="kf-result-table"><div>Nilai pesanan <b>${money2(total(o))}</b></div><div>Untung kedai <b>${money2(o.earned - o.bonus)}</b></div><div>Bonus pantas <b>${money2(o.bonus)}</b></div><div class="total">Jumlah diterima <b>${money2(o.earned)}</b></div></div>` : '<div class="kf-cancel-summary">Tiada stok ditolak.<br>Kaunter sedia untuk pelanggan seterusnya.</div>'}</section><button id="kfNext" class="primary-btn kf-big-button">${success ? "Rider Beredar \xB7 Pelanggan Seterusnya" : "Teruskan Layan Pelanggan"} ${icon2("arrow")}</button></div>`);
      document.getElementById("kfNext").onclick = () => {
        if (getProgress() !== owner || resultPending?.o !== o) return;
        resultPending = null;
        closeModal2();
        onFinish(o, success);
      };
    }
    function expireOrder(id) {
      const orders = pending(ensure()), o = id ? orders.find((x) => x.id === id) : orders[0];
      if (!o) return;
      finish(o, false, "timeout");
    }
    function open(id) {
      if (resultPending) {
        showResult(resultPending.o, resultPending.success);
        return;
      }
      const doneOrder = ensure().orders.find((x) => x.id === id && ["completed", "cancelled"].includes(x.status));
      if (id && doneOrder) {
        showResult(doneOrder, doneOrder.status === "completed");
        return;
      }
      const o = pending(ensure()).find((x) => x.id === id) || pending(ensure())[0] || null;
      if (o && o.id !== activeId) {
        stage = o.sealed ? "verify" : picked(o) ? "pick" : "list";
        search = "";
        filter = "all";
      }
      render2(o?.id || null);
    }
    function resumeOrder(id) {
      activeId = null;
      open(id);
    }
    function extendPatience(seconds = 5) {
      const now = Date.now();
      for (const o of pending(ensure())) {
        if (remainingMs(o, now) <= 0) continue;
        o.timeLimit += seconds;
        if (Number.isFinite(o.pausedRemainingMs)) o.pausedRemainingMs += seconds * 1e3;
        else o.deadlineAt += seconds * 1e3;
      }
      syncClock();
      save2();
    }
    return { extendPatience, open, ensure, maybeArrive, personFor, resumeOrder, stopClock, reset, syncClock, expireOrder, spawnTestOrder: newOrder };
  }

  // product-details.mjs
  var path = (d, fill, stroke = "", w = 2) => `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"` : ""}/>`;
  var rect = (x, y, w, h, c, r = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
  var ellipse = (x, y, rx, ry, c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
  var text = (s, x = 50, y = 59, width = 32, size = 7, c = "#36564a") => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${Math.min(size, width / Math.max(1, s.length * 0.65)).toFixed(2)}" fill="${c}">${s}</text>`;
  var plate = ellipse(50, 70, 41, 17, "#bccfc5") + ellipse(50, 66, 37, 15, "#fbf6e8");
  var leaf = path("M47 27Q59 5 77 15Q69 30 47 27", "#709664");
  var shine = path("M33 34V64", "none", "#ffffff66", 4);
  var grain = (c = "#e6c98d") => [0, 1, 2, 3, 4, 5].map((i) => ellipse(35 + i % 3 * 15, 45 + Math.floor(i / 3) * 13, 6, 4, c)).join("");
  function tag(a, b = "", w = 36, y = 51) {
    return rect(50 - w / 2 - 3, y - 9, w + 6, b ? 25 : 17, "#fcf7e6", 3) + text(a, 50, y + 1, w, 7) + (b ? text(b, 50, y + 10, w, 5, "#71836b") : "");
  }
  function bag(a, c = "#9fbca7", motif = "", b = "") {
    return path("M23 16H77L73 27L77 83H23L27 27Z", c) + path("M24 17H76M24 80H76", "none", "#ffffff55", 4) + rect(29, 30, 42, 43, "#faf4e3") + text(a, 50, 41, 36, 7) + motif + (b ? text(b, 50, 72, 35, 4.7) : "") + shine;
  }
  function bottle(a, c = "#94bcb4", cap = "#4b796f", extra = "") {
    return path("M39 19H61V29L70 40V80Q50 88 30 80V40L39 29Z", c) + rect(38, 11, 24, 12, cap, 3) + tag(a, "KEDAI KITA", 29, 52) + shine + extra;
  }
  function tube(a, c = "#bcb0ce") {
    return path("M29 18H71L64 75H36Z", c) + rect(36, 75, 28, 9, "#637e72", 2) + path("M31 21H69", "none", "#ffffff88", 3) + tag(a, "PENJAGAAN", 24, 48);
  }
  function jar(a, c, shape = "") {
    return rect(28, 28, 44, 54, c, 8) + rect(27, 20, 46, 12, "#779684", 3) + tag(a, "", 32, 55) + shape + shine;
  }
  function tin(a, c) {
    return rect(29, 21, 42, 61, c, 5) + ellipse(50, 21, 21, 5, "#d9e0d7") + ellipse(50, 21, 10, 2, "#a6bab0") + tag(a, "", 32, 53) + shine;
  }
  function glove(c) {
    return path("M32 79L22 49Q21 42 27 44L34 53L30 25Q30 17 36 22L41 45V17Q43 10 47 18L50 43L53 18Q58 12 60 21L58 47L65 29Q71 24 71 34L66 65L60 82Z", c) + rect(30, 76, 33, 10, "#527967", 2);
  }
  function scissors(c = "#839ab3") {
    return path("M32 75L66 16M68 75L34 16", "none", "#b3c5c0", 7) + ellipse(31, 75, 12, 10, c) + ellipse(69, 75, 12, 10, c) + ellipse(31, 75, 6, 5, "#f7f4e8") + ellipse(69, 75, 6, 5, "#f7f4e8") + ellipse(50, 47, 4, 4, "#697d79");
  }
  function roll(c = "#b8bcb3") {
    return ellipse(50, 48, 31, 25, c) + rect(19, 47, 62, 16, c, 0) + ellipse(50, 62, 31, 22, c) + ellipse(50, 46, 16, 12, "#f9f2df") + ellipse(50, 46, 11, 8, "#71887d");
  }
  function frozen(a, food) {
    return rect(16, 17, 68, 65, "#a5cbd2", 7) + rect(21, 26, 58, 49, "#dfedf0", 4) + text(a, 50, 38, 50, 7) + food + path("M24 20H76M24 80H76", "none", "#6c9eaf", 2);
  }
  function detailedProductArt(id) {
    const fruits = {
      pineapple: path("M35 36L24 7L45 27L49 4L59 29L78 13L67 39", "#71965b") + ellipse(50, 60, 25, 29, "#dcb65b") + path("M31 42L67 79M27 56L56 86M41 34L74 66M67 41L32 79M73 54L45 87M56 34L27 65", "none", "#b99443", 2),
      papaya: ellipse(50, 51, 26, 38, "#dcb358") + ellipse(51, 51, 20, 32, "#ef9961") + ellipse(51, 51, 10, 23, "#ffd38c") + Array.from({ length: 13 }, (_, i) => ellipse(47 + i % 3 * 4, 34 + Math.floor(i / 3) * 8, 2, 3, "#5c5140")).join(""),
      mango: path("M39 23Q65 9 78 40Q83 65 59 82Q35 97 24 69Q13 42 39 23", "#e8ba58") + leaf + path("M32 42Q26 61 39 73", "none", "#fbe5a2", 5),
      spinach: [-23, 0, 23].map((v, i) => `<g transform="rotate(${v} 50 80)">${path("M50 85V31", "none", "#91ac62", 4) + ellipse(50, 37, 14, 25, i % 2 ? "#7d9f62" : "#5d8f63") + path("M50 65V23M50 48L40 39M50 39L60 29", "none", "#adc487", 2)}</g>`).join("")
    };
    if (fruits[id]) return fruits[id];
    const exact = {
      yogurt: ellipse(50, 26, 26, 7, "#c6b3d0") + path("M24 27H76L67 81H33Z", "#e9e6e0") + tag("YOGURT", "ASLI", 32, 53),
      chocolate: rect(25, 15, 50, 68, "#9b6e57", 3) + [0, 1, 2, 3, 4, 5].map((i) => rect(30 + i % 2 * 21, 21 + Math.floor(i / 2) * 18, 18, 15, "#624638", 2)).join("") + path("M24 56L49 66L76 56V85H24Z", "#d8b9a1") + text("COKLAT", 50, 78, 40, 7),
      cheese: rect(20, 26, 60, 54, "#b9d2c2") + rect(26, 33, 48, 40, "#f1cf6d") + ellipse(36, 44, 4, 4, "#d5af4e") + ellipse(64, 60, 5, 5, "#d5af4e") + tag("KEJU", "KEPING", 30, 54),
      popcorn: path("M26 43H74L68 85H32Z", "#f2d1b3") + [0, 1, 2].map((i) => path(`M${34 + i * 13} 46L${37 + i * 11} 81`, "none", "#c77963", 6)).join("") + [[31, 41], [44, 36], [56, 38], [69, 41], [50, 25]].map(([x, y]) => ellipse(x, y, 11, 10, "#f7e6b9")).join(""),
      dishsponge: rect(20, 31, 61, 44, "#ddbf5a", 9) + rect(20, 31, 61, 13, "#608977", 6) + path("M28 57H32M46 62H50M66 54H70", "none", "#b8993e", 3),
      trashbags: roll("#4f6860") + path("M76 45L89 81H67L63 57", "#8b9f8c"),
      brush: rect(45, 13, 9, 51, "#9db4a7", 4) + ellipse(50, 67, 18, 21, "#d8dfd0") + path("M36 57V76M44 51V82M53 49V85M62 55V78", "none", "#90a99b", 3),
      extension: rect(13, 34, 74, 34, "#dbe1d7", 7) + [29, 50, 71].map((x) => ellipse(x, 51, 9, 11, "#b6c4b9") + path(`M${x} 44V47M${x - 4} 53V56M${x + 4} 53V56`, "none", "#4a655b", 2)).join("") + path("M13 50Q1 49 6 25H17", "none", "#78958a", 3),
      deskclock: rect(13, 27, 74, 50, "#5c7e73", 9) + rect(19, 34, 62, 33, "#d8e5ce", 4) + text("08:00", 50, 57, 52, 16) + rect(22, 77, 9, 5, "#405f53", 2) + rect(69, 77, 9, 5, "#405f53", 2),
      bulbsmart: ellipse(50, 37, 25, 26, "#f2deb1") + path("M31 51L38 68H62L69 51", "#ead5a7") + rect(38, 67, 24, 16, "#9aafab", 2) + path("M39 72H61M39 78H61", "none", "#6b8780", 2) + path("M40 30Q50 20 60 30M45 36Q50 31 55 36", "none", "#9abbb4", 3),
      bagel: ellipse(50, 51, 34, 27, "#c68f53") + ellipse(50, 47, 31, 24, "#dfb77e") + ellipse(50, 47, 11, 9, "#fbf7e9") + path("M29 38L32 40M61 32L64 35M34 58L36 62M70 51L73 54M48 28V31", "none", "#f6e3b6", 2),
      buns: plate + ellipse(35, 53, 20, 17, "#dfb274") + ellipse(65, 53, 20, 17, "#e9c183") + path("M28 41L36 61M58 41L66 61", "none", "#fcdf9f", 4),
      donut: ellipse(50, 53, 33, 28, "#c98f56") + ellipse(50, 48, 32, 25, "#ead3ac") + ellipse(50, 48, 11, 9, "#f9f5e8") + path("M27 40H30M63 34H66M39 66H42M69 54H72", "none", "#fff9eb", 2),
      waffle: rect(20, 25, 60, 55, "#cf9a54", 8) + [0, 1, 2].map((i) => [0, 1, 2].map((j) => rect(27 + i * 17, 32 + j * 14, 11, 9, "#a9743e", 2)).join("")).join("") + path("M25 31L72 70M38 26L77 52", "none", "#604633", 4),
      pancake: plate + [0, 1, 2].map((i) => ellipse(50, 63 - i * 9, 30, 10, i % 2 ? "#c5975b" : "#e2ba7a")).join("") + rect(42, 34, 17, 11, "#f4d578", 2) + path("M34 43Q37 61 45 52T62 47", "none", "#ae7950", 5),
      tart: plate + path("M23 51L30 72H69L78 51", "#c89453") + ellipse(50, 50, 28, 18, "#d8ad6d") + ellipse(50, 48, 22, 13, "#f3d77b"),
      pacifier: ellipse(50, 50, 29, 18, "#c9b2c6") + path("M41 49V28Q50 13 59 28V49", "#e7d6b8") + ellipse(50, 68, 15, 14, "#b694b7") + ellipse(50, 68, 10, 9, "#f9f6e8"),
      bib: path("M29 16H41Q50 43 59 16H71V55Q79 86 50 86Q21 86 29 55Z", "#e3b7b9") + path("M31 62Q50 72 69 62V76H31Z", "#f0d2c4") + ellipse(50, 50, 8, 8, "#f8e1ae"),
      cattoy: ellipse(46, 49, 27, 27, "#c7a0ad") + path("M23 37Q51 35 62 69M28 29Q57 27 70 54M20 49Q40 49 51 75M26 66Q42 35 58 25M38 74Q54 42 69 40M69 59Q86 59 82 76Q78 85 68 82", "none", "#f2d7de", 3),
      petbowl: ellipse(50, 42, 32, 12, "#9fbbb1") + path("M18 42H82L89 73Q50 87 11 73Z", "#a8c2ba") + ellipse(50, 42, 25, 8, "#536b5d") + ellipse(50, 70, 7, 6, "#eff0dc"),
      petbrush: rect(45, 54, 10, 33, "#aa9270", 4) + rect(25, 18, 50, 43, "#c9ae88", 12) + [0, 1, 2, 3].map((i) => path(`M32 ${28 + i * 8}H68`, "none", "#7b7667", 3)).join(""),
      catbed: ellipse(50, 60, 37, 23, "#b89778") + ellipse(50, 55, 32, 20, "#e5cba7") + ellipse(50, 56, 24, 13, "#cba98c") + path("M32 47Q34 31 44 42Q53 35 60 44L68 50", "none", "#f3dfbf", 5),
      eraser: path("M21 38L40 23H78V63L59 78H21Z", "#d7a7ac") + path("M21 38H59L78 23V63L59 78V38", "#c28c94") + rect(33, 38, 26, 40, "#e9dfce", 0) + text("KITA", 46, 60, 22, 6),
      ruler: `<g transform="rotate(-32 50 50)">${rect(11, 39, 78, 23, "#dfbd78", 2) + Array.from({ length: 14 }, (_, i) => path(`M${16 + i * 5} 40V${i % 2 ? 46 : 51}`, "none", "#8e774e", 1)).join("") + text("30 cm", 51, 58, 31, 5)}</g>`,
      folder: rect(14, 31, 72, 50, "#c4af7f", 4) + path("M14 31V22H42L49 31", "#c4af7f") + path("M18 40H89L80 82H14Z", "#e5cd94") + tag("DOKUMEN", "", 40, 61),
      scissors: scissors(),
      pruner: scissors("#738f70"),
      wateringcan: rect(20, 38, 43, 40, "#8baaaa", 8) + path("M60 52L85 31L91 36L63 71", "#8baaaa") + path("M22 49Q-2 40 13 28Q23 23 28 38", "none", "#648a85", 6) + ellipse(88, 32, 7, 4, "#507c75"),
      sprayer: bottle("TANAMAN", "#bad3b0", "#6f927c", path("M40 12V5H73L78 15H58V23", "none", "#658c76", 5)),
      bandage: roll("#dcc8a6") + path("M23 61Q18 80 54 86H81V73H49Z", "#e6d9bc"),
      cotton: rect(23, 19, 54, 65, "#b4d2cd", 7) + rect(28, 25, 44, 54, "#e7efdf", 4) + [0, 1, 2].map((i) => ellipse(50, 38 + i * 14, 17, 8, "#fffdf1")).join(""),
      firstaid: rect(16, 29, 68, 52, "#ebebe0", 7) + path("M35 29V18H65V29", "none", "#829d91", 6) + path("M44 41H56V51H66V63H56V73H44V63H34V51H44Z", "#ad695b"),
      toothbrush: rect(45, 30, 10, 56, "#8dafb7", 5) + rect(42, 13, 16, 26, "#c1d8d4", 5) + path("M43 19H57M43 25H57M43 31H57", "none", "#fff9e9", 2),
      dentalfloss: rect(25, 28, 50, 53, "#a9c7bd", 12) + path("M30 35Q50 23 70 35", "none", "#759e90", 3) + tag("FLOS", "GIGI", 31, 56),
      icepack: rect(19, 23, 62, 58, "#bddbe3", 8) + path("M50 34V67M35 42L65 59M35 59L65 42", "none", "#f6fbf5", 3),
      razor: rect(45, 34, 10, 52, "#80a7a2", 5) + rect(26, 16, 48, 19, "#6d8586", 5) + path("M32 21H68M32 27H68", "none", "#e3e9e1", 2),
      comb: rect(23, 17, 12, 67, "#b7a1b9", 5) + Array.from({ length: 11 }, (_, i) => rect(31, 20 + i * 5, 39, 3, "#b7a1b9", 1)).join(""),
      deodorant: rect(34, 28, 32, 56, "#b5cbb9", 10) + ellipse(50, 28, 16, 17, "#dfdbd5") + tag("ROLL-ON", "", 23, 58),
      lipbalm: rect(39, 38, 22, 45, "#b89bad", 3) + rect(41, 19, 18, 24, "#e6b5a5", 7) + rect(67, 37, 18, 45, "#cdb3c2", 4),
      batteryaa: [0, 1, 2, 3].map((i) => rect(13 + i * 19, 23, 16, 58, "#7c9290", 3) + rect(13 + i * 19, 23, 16, 18, "#ceb075", 3) + rect(18 + i * 19, 19, 6, 5, "#cbd4cb", 1) + text("AA", 21 + i * 19, 60, 11, 6)).join(""),
      torch: path("M32 18H68L63 42H58V84H42V42H37Z", "#4f6e67") + ellipse(50, 19, 18, 7, "#d9c993") + rect(46, 49, 8, 12, "#b8cbba", 2),
      measuringtape: rect(20, 29, 55, 48, "#d1ad63", 15) + ellipse(48, 51, 16, 16, "#6e8177") + text("5 m", 48, 55, 22, 10, "#fff6dd") + path("M73 65H88V59", "none", "#9cae9e", 7),
      screwdriver: [-20, 20].map((x) => `<g transform="translate(${x} 0)">${path("M50 12V52", "none", "#a6b5ae", 6) + rect(39, 49, 22, 35, "#ba8b62", 7) + path("M45 57V77M55 57V77", "none", "#efd6a6", 2)}</g>`).join(""),
      padlock: path("M31 42V27Q50 0 69 27V42", "none", "#93a8a0", 8) + rect(23, 37, 54, 44, "#d0ac65", 6) + ellipse(50, 55, 5, 5, "#7c704d") + path("M50 58V68", "none", "#7c704d", 4),
      rope: Array.from({ length: 5 }, (_, i) => `<ellipse cx="50" cy="${31 + i * 9}" rx="29" ry="14" fill="none" stroke="#c6ad80" stroke-width="6"/>`).join("") + path("M78 65Q94 88 68 85", "none", "#c6ad80", 6),
      hookset: [25, 50, 75].map((x) => rect(x - 9, 23, 18, 22, "#dce3d7", 4) + path(`M${x} 37V61Q${x + 12} 75 ${x + 12} 56`, "none", "#8ea39b", 4)).join(""),
      pliers: path("M32 18L39 42L61 82M68 18L61 42L39 82", "none", "#96a9a5", 8) + path("M44 58L33 82M56 58L67 82", "none", "#bd8765", 10) + ellipse(50, 46, 5, 5, "#627d71"),
      usbcable: path("M28 33V62Q28 90 51 80Q76 70 58 53Q42 42 58 30H72", "none", "#789a9b", 5) + rect(19, 14, 18, 22, "#a5bebe", 4) + rect(22, 10, 12, 6, "#bbc7c0", 1) + rect(69, 21, 17, 17, "#a5bebe", 4) + rect(85, 25, 5, 9, "#bbc7c0", 1),
      wallcharger: rect(29, 32, 42, 44, "#d7dfd3", 9) + path("M39 32V17M61 32V17", "none", "#9bb0a2", 5) + rect(40, 61, 20, 6, "#527766", 2),
      earphones: path("M32 29V58Q32 71 49 68Q67 71 67 58V29M50 69V87", "none", "#729796", 3) + rect(24, 15, 16, 21, "#a8c6c5", 8) + rect(59, 15, 16, 21, "#a8c6c5", 8) + rect(34, 27, 7, 15, "#a8c6c5", 3) + rect(59, 27, 7, 15, "#a8c6c5", 3),
      powerbank: rect(27, 16, 46, 70, "#90acac", 8) + rect(33, 23, 34, 49, "#b9ceca", 5) + path("M52 34L43 48H52L47 61L60 43H51Z", "#edf2db") + text("10000 mAh", 50, 79, 34, 5),
      phoneholder: rect(29, 15, 42, 54, "#607c75", 7) + rect(34, 21, 32, 38, "#bdd8cd", 3) + path("M46 69V79H26V85H75V79H55V69", "#9bb8ab"),
      mouse: path("M24 45Q24 14 50 14Q76 14 76 45V65Q76 87 50 87Q24 87 24 65Z", "#aac3bf") + path("M50 17V47M26 47H74", "none", "#759992", 2) + rect(46, 26, 8, 14, "#4e7a70", 4),
      keyboard: rect(7, 27, 86, 50, "#a8bdb7", 6) + Array.from({ length: 30 }, (_, i) => rect(13 + i % 10 * 7.5, 34 + Math.floor(i / 10) * 10, 5.5, 7, "#e3e9da", 1)).join("") + rect(31, 65, 38, 6, "#e3e9da", 1),
      memorycard: path("M29 15H63L73 27V85H29Z", "#627c78") + rect(36, 23, 27, 14, "#d0b16d", 1) + tag("32 GB", "", 29, 62),
      socks: [-13, 16].map((x) => `<g transform="translate(${x} 0)">${path("M41 18H65V60L46 80Q27 86 26 73L41 52Z", "#b1bba8") + path("M42 25H63M42 32H63", "none", "#ece8d9", 3)}</g>`).join(""),
      tshirt: path("M17 29L38 16Q50 30 62 16L83 29L73 50L63 44V83H37V44L27 50Z", "#9daf9c") + path("M40 18Q50 30 60 18", "none", "#d7dfcb", 4),
      tote: path("M32 35V22Q50 5 68 22V35", "none", "#927e5f", 5) + path("M20 33H80L74 84H26Z", "#dfcda8") + text("kita.", 50, 62, 40, 14),
      cap: path("M21 57Q19 17 55 20Q82 20 80 57Z", "#92aaa2") + path("M21 57Q39 42 80 57L94 68Q68 83 21 66Z", "#668d7e") + path("M53 24V51", "none", "#d4e0cb", 2),
      towel: rect(21, 22, 58, 59, "#b6c3b2", 7) + path("M25 68H75M25 73H75", "none", "#eef0dd", 3) + path("M29 79V86M39 79V86M49 79V86M59 79V86M69 79V86", "none", "#91a18b", 2),
      umbrella: path("M50 16Q17 16 10 51Q23 42 36 52Q50 43 64 52Q78 42 90 51Q83 16 50 16Z", "#9bb6a4") + path("M50 15V79Q50 93 63 81M50 18Q34 29 36 49M50 18Q66 29 64 49", "none", "#567d68", 3),
      raincoat: path("M36 27Q35 7 50 7Q65 7 64 27L83 37L75 60L66 52L72 85H28L34 52L25 60L17 37Z", "#d6b570") + path("M50 28V83M35 62H43M57 62H65", "none", "#ad8a50", 2) + ellipse(50, 20, 7, 9, "#eae1bc"),
      apron: path("M38 25V14H62V25L66 46L77 84H23L34 46Z", "#c4b18b") + path("M42 24V19H58V24", "none", "#f0e5cb", 4) + rect(38, 55, 24, 19, "#8d9d7f", 2),
      slippers: [-20, 20].map((x) => `<g transform="translate(${x} 0) rotate(10 50 50)">${ellipse(50, 50, 16, 35, "#8eaba0") + path("M36 41L50 32L64 41M50 32V57", "none", "#d1dcca", 5)}</g>`).join("")
    };
    const aliases = { lightningcable: "usbcable", glovesgarden: "gloveswork", ducttape: "tape", handtowel: "towel", wetwipes: "facialtissue" };
    if (id === "lightningcable") return exact.usbcable.replace(rect(85, 25, 5, 9, "#bbc7c0", 1), rect(85, 26, 7, 7, "#d8cda8", 1) + path("M87 27V32M90 27V32", "none", "#987d50", 0.7));
    if (exact[id]) return exact[id];
    if (aliases[id] && exact[aliases[id]]) return exact[aliases[id]];
    if (["gloveswork", "glovesgarden"].includes(id)) return glove(id === "gloveswork" ? "#b8a98c" : "#9bb6a0");
    if (["tape", "ducttape"].includes(id)) return roll(id === "tape" ? "#e6d6b1" : "#8f9d98");
    if (["highlighter", "markers"].includes(id)) return ["#dab774", "#a1b5cc", "#a3ba8b"].map((c, i) => rect(19 + i * 24, 30, 17, 51, c, 3) + rect(19 + i * 24, 14, 17, 25, c, 3) + path(`M${21 + i * 24} 37H${34 + i * 24}`, "none", "#f2f0db", 3)).join("");
    if (["facialtissue", "wetwipes", "screenwipe"].includes(id)) return rect(17, 34, 67, 43, "#b3c9bf", 7) + path("M35 37L31 15L47 20L61 14L67 36Z", "#fcf9ec") + tag(id === "screenwipe" ? "LAP SKRIN" : id === "wetwipes" ? "TISU BASAH" : "TISU MUKA", "", 43, 59);
    const food = { chips: ["KENTANG", "#d1ac64", grain()], cracker: ["KEROPOK", "#adbfa2", grain("#e9d8ab")], cereal: ["BIJIRIN", "#d6bc7f", grain()], babycereal: ["BIJIRIN BAYI", "#dfb9b7", grain()], treatscat: ["SNEK KUCING", "#c4ab81", grain("#a08b62")], birdseed: ["BIJI BURUNG", "#b7a17d", grain("#a08b62")], cornflour: ["TEPUNG JAGUNG", "#dacd9a", grain("#f5edcf")], vermicelli: ["BIHUN BERAS", "#b9cbb8", path("M33 50Q40 42 47 54T66 54M33 59Q42 50 50 61T66 60", "none", "#e2d4af", 3)], chickenstock: ["PATI AYAM", "#dbbc72", rect(33, 48, 15, 14, "#b39454") + rect(51, 52, 16, 14, "#bf9d5a")], mulch: ["SUNGKUPAN", "#b6a07e", grain("#8b7254")], herbseeds: ["DAUN SUP", "#a9c29b", leaf] };
    if (food[id]) return bag(...food[id]);
    const liquids = { bleach: ["PELUNTUR", "#e0e3d1"], floorcleaner: ["LANTAI", "#b5c8ad"], softener: ["PELEMBUT", "#c9b6ce"], babyshampoo: ["SYAMPU BAYI", "#dbc9ad"], babylotion: ["LOSYEN BAYI", "#d8c4ce"], babysoap: ["MANDIAN BAYI", "#b7ced2"], bodywash: ["MANDIAN", "#c5b5ce"], conditioner: ["PERAPI", "#bed1af"], mouthwash: ["MULUT", "#a1c6c8"], tehbotol: ["TEH AIS", "#bc9b6d"], isotonik: ["ISOTONIK", "#bcd5d8"], sirap: ["KORDIAL ROS", "#c78d8c"], greentea: ["TEH HIJAU", "#b2c499"], minumanyogurt: ["YOGURT", "#e5dec7"], chilisauce: ["SOS CILI", "#bc745f"], tomatosauce: ["SOS TOMATO", "#c9836b"], vinegar: ["CUKA", "#d3d9b9"] };
    if (liquids[id]) return bottle(...liquids[id]);
    const tubes = { facewash: "PENCUCI MUKA", sunscreen: "PELINDUNG UV", handcream: "KRIM TANGAN" };
    if (tubes[id]) return tube(tubes[id]);
    if (id === "honeypot") return jar("MADU", "#d7af5c", path("M38 67L50 61L62 67L50 74Z", "#bb9043"));
    if (id === "peanutbutter") return jar("MENTEGA KACANG", "#c6a17a");
    if (id === "pepper") return jar("LADA HITAM", "#b5a18d");
    const cans = { kopitin: ["KOPI SUSU", "#bc9c7c"], lemonade: ["LEMON", "#d5ca77"], airgas: ["SODA", "#abc5c9"], beans: ["KACANG", "#c58b72"] };
    if (cans[id]) return tin(...cans[id]);
    const cartons = { airkelapa: ["AIR KELAPA", "#a9bd98"], susucrunch: ["SUSU COKLAT", "#b0937b"], jusepal: ["JUS EPAL", "#aebd81"], soya: ["SOYA", "#dbcd9d"], coconutmilk: ["SANTAN", "#b9cbb5"] };
    if (cartons[id]) {
      const [a, c] = cartons[id];
      return path("M27 29L39 14H72V83H27Z", c) + path("M39 14L49 29H27M49 29H72", "none", "#f3eddb", 2) + tag(a, "", 35, 53) + shine;
    }
    const foods = { fries: ["KENTANG", [0, 1, 2, 3, 4].map((i) => rect(29 + i * 9, 46 + i % 2 * 5, 6, 23, "#d6b461", 2)).join("")], fishball: ["BEBOLA IKAN", grain("#f3ead6")], meatballs: ["BEBOLA DAGING", grain("#a18161")], springroll: ["POPIA", [0, 1, 2].map((i) => rect(29 + i * 15, 46, 11, 25, "#dfba7f", 5)).join("")], pizza: ["PIZA MINI", ellipse(50, 59, 22, 13, "#d5b36d") + ellipse(50, 58, 18, 10, "#c78363") + grain("#e9c77b")], burgerpatty: ["DAGING BURGER", ellipse(50, 60, 23, 11, "#93715c") + path("M33 55L61 65M39 51L69 61", "none", "#644e40", 2)], frozenveggies: ["SAYUR CAMPUR", grain("#92b17a") + rect(32, 59, 7, 7, "#dda465") + rect(61, 49, 7, 7, "#dda465")] };
    if (foods[id]) return frozen(...foods[id]);
    if (["bihun", "nasiayam", "nasilemakayam"].includes(id)) {
      let rice = ellipse(43, 53, 24, 20, "#f5e6bd") + path("M27 53Q35 46 43 53T60 53M29 60Q37 51 45 60T59 58", "none", id === "bihun" ? "#c29b63" : "#dfcf9c", 2);
      return plate + rice + path("M62 47Q83 40 84 62L73 72L58 62Z", "#bc8a5d") + ellipse(72, 43, 9, 5, "#9bb17e") + (id === "nasilemakayam" ? ellipse(28, 68, 10, 5, "#b66751") : "");
    }
    return "";
  }

  // art.mjs
  var PRODUCT_ART_CACHE = /* @__PURE__ */ new Map();
  var CATALOG_LOOKUP = new Map(PRODUCTS.map((p) => [p.id, p]));
  function productArt(id, extra = "") {
    const cacheKey = id + "|" + extra;
    if (PRODUCT_ART_CACHE.has(cacheKey)) return PRODUCT_ART_CACHE.get(cacheKey);
    const label = (a, b) => `<text x="50" y="51" text-anchor="middle" fill="#244c40" font-family="sans-serif" font-weight="800" font-size="${Math.min(10, 38 / (a.length * 0.68)).toFixed(2)}">${a}</text><text x="50" y="62" text-anchor="middle" fill="#577362" font-family="sans-serif" font-size="${Math.min(5, 38 / (b.length * 0.62)).toFixed(2)}">${b}</text>`;
    const packet = (color, a, b, art2 = "") => `<path d="M25 17h50l-3 14 4 52H24l4-52Z" fill="${color}"/><path d="M25 17h50v7H25zm0 59h50v7H25z" fill="#fff" opacity=".3"/><path d="M28 29h44v42H28Z" fill="#fff7df"/><path d="M68 25h5v51h-5" fill="#000" opacity=".07"/>${label(a, b)}${art2}`;
    const bottle2 = (c, a) => `<path d="M38 12h24v14l8 12v44q-20 7-40 0V38l8-12Z" fill="${c}"/><rect x="37" y="9" width="26" height="10" rx="3" fill="#75a1a2"/><path d="M35 41h30v28H35Z" fill="#fff9e9"/><g transform="translate(12 0) scale(.76 1)">${label(a, "KEDAI KITA")}</g><path d="M36 29v48" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
    const art = {
      milk: `<path d="m29 28 10-15h25l10 15v55H29Z" fill="#f7fbef"/><path d="m39 13 10 15H29m20 0h25L64 13" fill="#9ac7cc"/><path d="M29 37h45v35H29Z" fill="#b9d9d8"/><path d="M67 29h7v54h-7" fill="#d2e8dd"/>${label("SUSU", "SEGAR SETIAP HARI")}<path d="M45 64q7-13 14 0" fill="#fff7db"/>`,
      bread: `<path d="M22 39q-5-19 14-21 14-12 29 0 19 0 16 21l-7 38H28Z" fill="#d69c5f"/><path d="M27 39q-4-15 11-15 12-9 25 0 15 0 13 15l-7 31H33Z" fill="#f5d79b"/><path d="M35 25v42m15-47v48m15-43v42" stroke="#dbac70" stroke-width="2"/><path d="M23 43h55l-4 36H28Z" fill="#e9eee0" opacity=".6"/><rect x="31" y="48" width="40" height="20" rx="3" fill="#f8f2dd"/>${label("ROTI", "BAKERI KITA")}`,
      eggs: `<path d="m15 55 10-19h55l10 19-6 24H21Z" fill="#b8ab8e"/><path d="M19 56h67v11H19Z" fill="#d5ccb4"/>${[31, 50, 69].map((x, i) => `<ellipse cx="${x}" cy="47" rx="10" ry="16" fill="${i === 1 ? "#eed7b4" : "#faf0d8"}"/><path d="M${x - 5} 42q0-6 4-8" stroke="#fff" stroke-width="2" fill="none"/>`).join("")}<path d="M22 64h60v15H22Z" fill="#90a77c"/><text x="52" y="74" text-anchor="middle" fill="#fff7e1" font-size="6" font-family="sans-serif">TELUR 6 BIJI</text>`,
      rice: packet("#bbc8a0", "BERAS", "WANGI PILIHAN", `<path d="m34 72 8-7m-3 10 8-7m-1 7 8-7m0 7 8-7" stroke="#d7b879" stroke-width="3"/>`),
      noodles: packet("#d68b6e", "MI SEGERA", "RASA KARI", `<path d="M33 65h34q-2 12-17 12T33 65" fill="#d4a24e"/><path d="M37 65q5-7 10 0t10 0t9 0" stroke="#f8dd8d" stroke-width="3" fill="none"/>`),
      juice: `<path d="M31 25h39v58H31Z" fill="#efae61"/><path d="m31 25 9-10h30v10" fill="#f9d294"/><path d="m59 28 7-20h13" stroke="#f7fbec" stroke-width="4" fill="none"/><circle cx="50" cy="54" r="15" fill="#fff0bf"/><circle cx="50" cy="54" r="12" fill="#e9913f"/><path d="M50 42v24m-12-12h24m-20-8 16 16m0-16L42 62" stroke="#ffe9b1" stroke-width="1.5"/><text x="50" y="77" text-anchor="middle" font-size="6" fill="#a95d29" font-family="sans-serif">100% OREN</text>`,
      cookies: packet("#9f765e", "BISKUT", "COKLAT CHIP", `<circle cx="50" cy="69" r="10" fill="#d3a46c"/><path d="m45 64 2 2m7 2 2 2m-9 3 2 2m6-12 2 2" stroke="#775243" stroke-width="3"/>`),
      soap: `<path d="M21 39q0-11 12-11h40q10 0 10 10v26q0 10-12 10H31q-10 0-10-10Z" fill="#b1a9d3"/><rect x="26" y="30" width="51" height="35" rx="12" fill="#d4c8e5"/><path d="M34 38h26" stroke="#f0e5f5" stroke-width="4" stroke-linecap="round"/><text x="51" y="55" text-anchor="middle" font-size="10" fill="#9385ae" font-family="sans-serif">KITA</text><g class="art-bubbles" fill="#e5dff0" stroke="#bdb7cf"><circle cx="24" cy="24" r="7"/><circle cx="76" cy="20" r="5"/><circle cx="86" cy="33" r="4"/></g>`,
      coffee: packet("#725744", "KOPI", "KAMPUNG KITA", `<path d="M39 66h19v8q-9 8-19 0Zm19 1h5v6h-5" fill="#a57c50"/><path class="art-steam" d="M45 61q-4-4 0-8m8 8q-4-4 0-8" stroke="#9e8266" fill="none"/>`),
      water: bottle2("#c2e1e7", "AIR"),
      apple: `<path d="M51 30q-20-14-30 7-10 30 15 44 10 5 15-1 9 6 18-1 23-17 13-43-10-16-31-6" fill="#cf6458"/><path d="M50 31q1-14 8-21" stroke="#776148" stroke-width="5" fill="none"/><path d="M53 24q6-20 24-10-3 17-24 10" fill="#7ba36b"/><path d="M32 40q-6 8-3 19" stroke="#f1aaa0" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M67 37q16 29-6 42" fill="#b14f4b" opacity=".25"/>`,
      banana: `<path d="M25 23q-2 42 48 42l5-10q8 8 2 18-48 28-63-30Z" fill="#e6bb50"/><path d="M34 19q-3 36 41 33l4-8q7 8 1 17-40 22-54-23Z" fill="#f4d36e"/><path d="M42 18q0 28 31 27l6-9q5 6 2 13-28 22-45-17Z" fill="#ffe397"/><path d="m25 23 17-5-2-8-15 5m53 40 6 3m-5-14 5 3" stroke="#8c8551" stroke-width="4"/>`,
      carrot: `<path d="M42 31q10-13 24-2l7 15-44 42Z" fill="#e79952"/><path d="m44 38 15 6m-20 8 10 5m-15 8 7 3" stroke="#c7793f" stroke-width="2.5"/><path d="M56 30q-21-13-12-23 13 4 16 20-1-22 12-22 7 12-9 25 12-14 22-7-1 13-22 13" fill="#80a36b"/>`,
      tomato: `<path d="M49 29q-26-7-31 22-1 30 32 32 33 0 33-30-3-27-34-24" fill="#df7960"/><path d="m49 35-19-10 17 1 4-13 5 14 19-4-14 12 10 7-19-3-14 7Z" fill="#73965e"/><path d="M31 44q-7 8-3 18" stroke="#f7b393" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      grapes: `<path d="M50 30V16q-4-5-11-3" stroke="#7c7952" stroke-width="4" fill="none"/><path d="M51 22q17-20 30-4-12 20-30 4" fill="#8ba575"/>${[[35, 36], [53, 35], [69, 40], [28, 51], [47, 52], [64, 58], [40, 67], [53, 72], [48, 85]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="11" fill="${i % 2 ? "#9e8caf" : "#b5a1c3"}" stroke="#8b7a9c" stroke-width="1.5"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#d1c5dc" opacity=".7"/>`).join("")}`,
      fish: `<path d="M69 49 91 29v41L69 55Q34 86 13 52q21-32 56-3Z" fill="#91b9be"/><path d="M20 57q22 19 49-4-23 8-49 4" fill="#c5dad1"/><path d="m40 32 14-9 7 14m-22 28 15 11 4-13" fill="#6c949e"/><circle cx="27" cy="47" r="5" fill="#f8f2db"/><circle cx="27" cy="47" r="2.5" fill="#36515a"/><path d="M37 40q8 12 0 23m10-20 6 7-6 7m13-13 5 6-5 6" stroke="#6f99a0" fill="none" stroke-width="2"/>`,
      curry: packet("#dda65b", "KARI", "REMPAH ASLI"),
      snack: packet("#b9ce82", "RANGUP", "SNEK CINCIN", `<g fill="none" stroke="#e6b55c" stroke-width="4"><circle cx="39" cy="70" r="5"/><circle cx="53" cy="69" r="5"/><circle cx="64" cy="72" r="5"/></g>`),
      butter: `<path d="m20 39 15-12h48v39L68 80H20Z" fill="#ebc872"/><path d="m20 39 48 0 15-12H35Z" fill="#f7e4ad"/><path d="M68 39h15v27L68 80Z" fill="#ceae61"/>${label("MENTEGA", "LEMBUT &amp; BERKRIM")}`,
      detergent: bottle2("#b7ca9b", "CUCI"),
      icecream: `<path d="m33 48 20 42 19-42" fill="#d8ae77"/><path d="m38 54 25 20m-22-6 20-14" stroke="#b88a5b" stroke-width="2"/><path d="M27 48q-5-14 8-18-5-16 10-19 17-4 21 10 14 3 11 17 8 11-6 16-16-9-23 0-12-6-21-6" fill="#e1adad"/><path d="M35 34q8-3 14 1m8-13 4 4m-2 13 6-2" stroke="#f4cfbf" stroke-width="4" stroke-linecap="round"/>`,
      chicken: `<path d="M36 23q-25 11-15 36 10 18 32 7l14 9 13-14-15-14q7-34-29-24" fill="#dfab8e"/><path d="m69 67 12 11q-1 10 8 8 7-1 6-8 7-8-1-11-6-3-10 3l-9-10" fill="#f1e9cf"/><path d="M32 32q-12 6-8 19" stroke="#f1ccb2" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      cucumber: `<g transform="rotate(35 50 50)"><rect x="32" y="12" width="34" height="77" rx="17" fill="#78a47c"/><path d="M42 21v58m9-60v62m8-56v49" stroke="#a9c999" stroke-width="3" stroke-linecap="round"/><path d="M36 30h3m19 10h3M35 61h3m19 8h3" stroke="#517c61" stroke-width="3"/></g>`,
      nasi: `<path d="m14 75 36-60 37 60-38 13Z" fill="#81a177"/><path d="M50 15 49 88 14 75Z" fill="#6c8c69"/><path d="m24 61 45-13M21 69l53-14M33 47l30-11" stroke="#a0b387" opacity=".5"/><path d="M21 65h59v13H21Z" fill="#dbceaa"/><text x="50" y="74" text-anchor="middle" font-size="6" fill="#55705c" font-family="sans-serif">NASI LEMAK</text>`
    };
    const result = `<svg class="product-art ${extra}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="art-shadow" cx="50" cy="89" rx="30" ry="5" fill="#233f35" opacity=".1"/><g class="art-object">${detailedProductArt(id) || art[id] || expandedProductArt(id) || localProductArt(id) || catalogProductArt(id) || packet("#bdc9a0", "KITA", "PILIHAN KELUARGA")}</g></svg>`;
    PRODUCT_ART_CACHE.set(cacheKey, result);
    return result;
  }
  var PRODUCT_IMAGE_CACHE = /* @__PURE__ */ new Map();
  function productImage(id) {
    if (PRODUCT_IMAGE_CACHE.has(id)) return PRODUCT_IMAGE_CACHE.get(id);
    const svg = productArt(id).replace("<svg ", '<svg width="100" height="100" ');
    const name = CATALOG_LOOKUP.get(id)?.name || "Produk";
    const alt = name.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const result = `<img class="stock-product-image" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" alt="${alt}" width="100" height="126" loading="eager" decoding="sync" draggable="false">`;
    PRODUCT_IMAGE_CACHE.set(id, result);
    return result;
  }
  function localProductArt(id) {
    const leaf2 = '<path d="M10 72 26 38 89 52 75 87Z" fill="#8baa75"/><path d="m22 76 56-21m-50 8 39 9" stroke="#c2cf9d" stroke-width="2" opacity=".5"/>';
    const plate2 = '<ellipse cx="50" cy="70" rx="42" ry="18" fill="#d6e1d8"/><ellipse cx="50" cy="66" rx="37" ry="15" fill="#f9f3df"/>';
    const cube = (top, middle, bottom) => `<path d="m24 32 22-11 32 12-22 12Z" fill="${top}"/><path d="m24 32 32 13v18L24 50Z" fill="${middle}"/><path d="m56 45 22-12v18L56 63Z" fill="${middle}"/><path d="m24 50 32 13v16L24 65Z" fill="${bottom}"/><path d="m56 63 22-12v15L56 79Z" fill="${bottom}"/>`;
    const packets = { sugar: ["GULA", "#ddd7be"], flour: ["TEPUNG", "#d6c9b1"], tea: ["TEH", "#a9bda1"], malt: ["MALT", "#8da98a"], salt: ["GARAM", "#bbd0d5"] };
    if (packets[id]) {
      const [label, c] = packets[id];
      return `<path d="m26 17 48 0-4 17 5 49H24l5-49Z" fill="${c}"/><path d="M30 30h40v42H30Z" fill="#fbf6e2"/><path d="M26 17h48v7H26m-2 52h51v7H24" fill="#fff" opacity=".3"/><text x="50" y="50" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="800" fill="#57725c">${label}</text><text x="50" y="61" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#8b9d83">PILIHAN KITA \xB7 1 KG</text>`;
    }
    const basic = {
      oil: '<path d="M35 23h32l6 14v44H27V37Z" fill="#e3c16c"/><rect x="35" y="14" width="32" height="12" rx="3" fill="#c39148"/><path d="M32 44h35v28H32Z" fill="#f8eed0"/><path d="M51 48q-13 16 0 19 13-3 0-19" fill="#d6ae55"/><path d="M33 31v8" stroke="#f7e6a9" stroke-width="4"/>',
      soy: '<path d="M41 10h20v17l9 13v42H30V40l11-13Z" fill="#695a45"/><rect x="40" y="8" width="22" height="12" rx="3" fill="#b57558"/><rect x="32" y="43" width="36" height="29" rx="3" fill="#e7d4a7"/><text x="50" y="60" text-anchor="middle" fill="#66533c" font-size="9" font-family="sans-serif" font-weight="700">KICAP</text>',
      sardine: '<rect x="24" y="24" width="53" height="58" rx="5" fill="#d38d6d"/><ellipse cx="50" cy="24" rx="26" ry="7" fill="#c8d0c1"/><ellipse cx="50" cy="23" rx="21" ry="4" fill="#edf0df"/><path d="M28 43h45v26H28Z" fill="#f3e9cd"/><path d="M36 56q12-15 24 0-12 14-24 0Zm24 0 8-8v16Z" fill="#8ca5a0"/><circle cx="41" cy="54" r="1.5" fill="#47625d"/>',
      condensed: '<rect x="26" y="24" width="50" height="58" rx="5" fill="#87aaa2"/><ellipse cx="51" cy="24" rx="25" ry="6" fill="#d4d9c8"/><rect x="30" y="39" width="42" height="29" rx="3" fill="#f9f3dc"/><text x="51" y="50" text-anchor="middle" font-size="8" fill="#66857b" font-family="sans-serif">SUSU</text><text x="51" y="61" text-anchor="middle" font-size="8" fill="#66857b" font-family="sans-serif">PEKAT</text>',
      tissue: '<path d="m17 47 16-12h51v34L69 82H17Z" fill="#abc4c7"/><path d="m17 47 52 0 15-12H33Z" fill="#d4e0da"/><path d="M69 47h15v22L69 82Z" fill="#8faeb4"/><ellipse cx="50" cy="42" rx="16" ry="4" fill="#7e9a9d"/><path d="m39 42-4-24 15 5 11-8 8 24-11 4Z" fill="#fff9e9"/><text x="42" y="67" text-anchor="middle" font-size="9" fill="#f9f5df" font-family="sans-serif">TISU</text>',
      toothpaste: '<path d="M29 17h44l-8 56H37Z" fill="#e5ece4"/><path d="M30 27h41l-3 31H35Z" fill="#82abb0"/><rect x="37" y="73" width="28" height="12" rx="3" fill="#739da4"/><path d="m41 36 10 11 11-11" stroke="#fff9df" stroke-width="4" fill="none"/><path d="M31 17h40" stroke="#9bb4b4" stroke-width="4"/>',
      shampoo: '<path d="M35 24q15-10 30 0l6 57H29Z" fill="#b4a6c8"/><rect x="37" y="12" width="26" height="12" rx="4" fill="#8a7da4"/><path d="M35 42h30v27H35Z" fill="#f8f1de"/><path d="M46 48q14 3 9 14-14-1-9-14" fill="#a8bb8a"/>',
      dishsoap: '<path d="M36 24h28l10 14v43H26V38Z" fill="#b3c999"/><rect x="37" y="15" width="26" height="10" rx="2" fill="#78a179"/><path d="M41 15V9h28" stroke="#78a179" stroke-width="5" fill="none"/><rect x="31" y="44" width="38" height="26" rx="3" fill="#f8f3df"/><circle cx="50" cy="57" r="9" fill="#dbc87e"/><path d="M50 49v16m-8-8h16" stroke="#f5ecc7" stroke-width="1.5"/>'
    };
    if (basic[id]) return basic[id];
    const kuih = {
      serimuka: leaf2 + cube("#90ae6e", "#7c9d64", "#eae1b9"),
      onde: leaf2 + [[32, 49], [56, 46], [48, 65]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#8cac67"/><path d="m${x - 8} ${y - 6} 3 1m3-5 2 2m5 4 3-1m-10 8 3 1m5-2 2 2" stroke="#f4efd7" stroke-width="2.5" stroke-linecap="round"/>`).join(""),
      karipap: plate2 + '<path d="M21 57q12-40 52-25-7 40-52 25" fill="#d6a264"/><path d="M21 57q32 17 52-25" stroke="#b98149" stroke-width="4" stroke-dasharray="3 4" fill="none"/><path d="m36 42 16 2m-13 7 13 1" stroke="#e8bd7e" stroke-width="3"/>',
      lapis: leaf2 + '<path d="m24 29 26-11 30 13-26 11Z" fill="#d88c98"/><path d="M24 29 54 42v39L24 67Z" fill="#f6dbcb"/><path d="m54 42 26-11v37L54 81Z" fill="#e7bbc0"/><path d="m24 37 30 14 26-12m-56 8 30 14 26-12m-56 8 30 14 26-12" stroke="#cb8491" stroke-width="5" fill="none"/>',
      ketayap: leaf2 + '<g transform="rotate(-18 50 50)"><rect x="20" y="32" width="62" height="20" rx="10" fill="#86a67b"/><ellipse cx="75" cy="42" rx="7" ry="8" fill="#b6c598"/><ellipse cx="76" cy="42" rx="4" ry="5" fill="#9c7850"/><rect x="22" y="53" width="62" height="20" rx="10" fill="#a1b88a"/><ellipse cx="77" cy="63" rx="7" ry="8" fill="#c3cfa4"/><ellipse cx="78" cy="63" rx="4" ry="5" fill="#9c7850"/><path d="M30 38h31m-29 21h31" stroke="#b8c99f" stroke-width="3"/></g>',
      talam: leaf2 + cube("#f5edda", "#ece1c5", "#88a473"),
      apam: plate2 + '<path d="M16 54q36-53 68-4-25 28-68 4" fill="#daa65f"/><path d="M18 54q33 26 65-4" stroke="#a87943" stroke-width="6" fill="none"/><path d="m31 46 5 1m7-12 4 2m12 6 4 2m4 8 5-1m-29 4 3 1" stroke="#ecc98b" stroke-width="3" stroke-linecap="round"/>',
      putu: leaf2 + '<ellipse cx="49" cy="61" rx="29" ry="15" fill="#e6dfca"/><path d="M20 60q1-25 30-25 28 0 28 25" fill="#faf5e7"/><ellipse cx="50" cy="39" rx="12" ry="5" fill="#f1eada"/><path d="m34 49 3 1m8-5 3 1m11 5 3 0m-15 7 3 0" stroke="#e5dccc" stroke-width="2"/>',
      akok: plate2 + [[36, 49], [62, 59]].map(([x, y]) => `<path d="m${x - 17} ${y}q-5-12 9-13 7-14 15-1 16-1 13 12 6 13-8 15-8 12-16 0-16 1-13-13" fill="#b5824f"/><ellipse cx="${x + 2}" cy="${y}" rx="12" ry="9" fill="#d9b47b"/>`).join(""),
      bingka: leaf2 + cube("#b4834d", "#d6b66d", "#d6b66d"),
      angku: leaf2 + '<ellipse cx="50" cy="56" rx="29" ry="21" fill="#c76856"/><ellipse cx="50" cy="49" rx="27" ry="21" fill="#d98470"/><ellipse cx="50" cy="48" rx="20" ry="15" fill="none" stroke="#b75e50" stroke-width="2"/><path d="m35 40 29 15m-21-22 21 11m-29 8 20 11m-16-28-6 19m17-20-8 27m18-23-7 22" stroke="#be6655" stroke-width="1.5"/>',
      bahulu: plate2 + [[30, 49], [50, 37], [71, 50], [48, 65]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-12 0q-4-8 4-10 4-8 10-3 9-3 11 5 7 5 1 11 1 9-8 10-7 5-12-2-9 0-6-11" fill="#d4a25c"/><ellipse cy="1" rx="7" ry="10" fill="#ebc582"/><path d="M0-6v14" stroke="#c59652" stroke-width="2"/></g>`).join("")
    };
    if (kuih[id]) return kuih[id];
    const meals = {
      rendang: plate2 + '<path d="M19 58q1-14 13-18 1-18 19-15 19-6 25 13 14 3 8 18-15 19-65 2" fill="#a37e58"/><path d="m30 46 13-11 13 10m-7 12 10-14 15 5m-44 7 13 7" stroke="#806448" stroke-width="4" fill="none"/><path d="m28 35 17-6m15 6 14-2" stroke="#91a270" stroke-width="3"/>',
      roti: plate2 + '<path d="m21 44 34-18 28 22-10 23-40 1Z" fill="#e5c68e"/><path d="m30 47 27-10 15 12-8 13-28-1Z" fill="#f2d9a9"/><path d="m38 40 4 3m12 9 7 3m-28 7 9 2m26-17 5 2" stroke="#bf925a" stroke-width="3"/>',
      satay: plate2 + [0, 1, 2, 3, 4].map((i) => `<g transform="translate(${15 + i * 14} 0) rotate(-12 10 50)"><path d="M7 18v62" stroke="#b9a477" stroke-width="2"/><rect x="1" y="25" width="12" height="11" rx="3" fill="#b88954"/><rect x="1" y="39" width="12" height="12" rx="3" fill="#c99b60"/><rect x="1" y="54" width="12" height="11" rx="3" fill="#ac7b4c"/></g>`).join(""),
      laksa: '<ellipse cx="50" cy="55" rx="37" ry="20" fill="#f5ecd5"/><path d="M14 55q3 31 36 32 33-2 36-32" fill="#b4cac5"/><ellipse cx="50" cy="53" rx="31" ry="15" fill="#b9a27b"/><path d="M28 52q8-15 16 0t15 0t15 0M32 59q8-15 16 0t16 0" stroke="#eadcc0" fill="none" stroke-width="3"/><path d="m35 43 8-5m17 11 10-5m-20 18 7-5" stroke="#789c70" stroke-width="3"/><path class="art-steam" d="M42 28q-5-7 0-13m14 14q-5-8 0-14" stroke="#c4c9b9" stroke-width="2" fill="none"/>',
      mee: plate2 + '<path d="M22 55q4-28 28-24 25-2 30 26" fill="#b4834e"/><path d="M27 51q8-14 15 0t15 0t16 0M25 59q8-14 16 0t16 0t16 0M34 42q8-12 16 0t16 0" fill="none" stroke="#d6a25d" stroke-width="4"/><path d="m33 34 8 3m19 20 9-3m-30 12 8-4" stroke="#89a066" stroke-width="3"/><ellipse cx="65" cy="40" rx="8" ry="7" fill="#f3e8c7"/>',
      lemang: leaf2 + '<g transform="rotate(18 50 50)"><rect x="22" y="17" width="25" height="61" rx="8" fill="#8ca27a"/><ellipse cx="34" cy="19" rx="12" ry="7" fill="#c5d0a4"/><ellipse cx="34" cy="19" rx="8" ry="5" fill="#f4ebd3"/><rect x="51" y="31" width="25" height="50" rx="8" fill="#78916a"/><ellipse cx="63" cy="33" rx="12" ry="7" fill="#b7c696"/><ellipse cx="63" cy="33" rx="8" ry="5" fill="#f4ebd3"/><path d="M24 48h21m8 13h21" stroke="#647e58" stroke-width="3"/></g>',
      rojak: plate2 + [[27, 49, "#e5c98b"], [47, 39, "#c0ce9d"], [64, 49, "#e8b975"], [42, 59, "#c1cda0"], [61, 65, "#d8b47a"]].map(([x, y, c]) => `<rect x="${x - 8}" y="${y - 8}" width="18" height="17" rx="3" fill="${c}" transform="rotate(15 ${x} ${y})"/>`).join("") + '<path d="m25 44 48 17m-40-8 22-12m-23 24 35-11" stroke="#9f7852" stroke-width="3" fill="none"/>'
    };
    if (meals[id]) return meals[id];
    const electric = {
      ricecooker: '<ellipse cx="50" cy="43" rx="33" ry="11" fill="#a6bcbc"/><path d="M17 43h66v32q-32 15-66 0Z" fill="#d5e1da"/><ellipse cx="50" cy="42" rx="33" ry="10" fill="#e7eee3"/><path d="M41 35v-8h18v8" stroke="#789795" stroke-width="6" fill="none"/><rect x="39" y="57" width="22" height="18" rx="4" fill="#819e9b"/><rect x="44" y="61" width="12" height="5" rx="2" fill="#bcd4b0"/><path d="M17 47H9v16h8m66-16h8v16h-8" stroke="#789795" stroke-width="5" fill="none"/><path d="M27 83v4m46-4v4" stroke="#6b8886" stroke-width="5"/>',
      kettle: '<path d="M34 27h30l13 45q-1 12-28 12-24-1-24-12Z" fill="#b9cad0"/><ellipse cx="49" cy="28" rx="15" ry="5" fill="#d6e3e0"/><path d="M43 22h13" stroke="#6e8997" stroke-width="5" stroke-linecap="round"/><path d="M67 35q25-5 20 22-2 14-14 13" fill="none" stroke="#708b97" stroke-width="7"/><path d="m31 47-18-8 10 24 6 3" fill="#a1b8c0"/><path d="M40 42v25" stroke="#e8efdf" stroke-width="5" stroke-linecap="round"/><path d="M27 84h49" stroke="#6b8792" stroke-width="5"/>',
      fan: '<path d="M48 63v21m-16 3h35" stroke="#719b9d" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="38" r="29" fill="#d9e5df" stroke="#81a4a4" stroke-width="4"/><g class="fan-rotor"><path d="M50 38q-22-25-4-23 17-4 12 14m-8 9q31-6 23 10-3 17-16 5m-7-15q-7 33-18 18-15-7 3-17" fill="#9abdb6"/></g><circle cx="50" cy="38" r="6" fill="#5f9294"/><circle cx="50" cy="38" r="23" stroke="#f8f5e7" stroke-width="1.5" fill="none"/>',
      iron: '<path d="m16 70 17-35h30l22 36Z" fill="#c9d8d5"/><path d="M32 38q7-20 30-7l10 14-12 7-12-15-10 10Z" fill="#8ca9ae"/><path d="M18 70h65l4 9H14Z" fill="#6c8c97"/><path d="M21 65h51" stroke="#f7f3e1" stroke-width="4"/><path d="M72 44q14 1 10-21t12-9" stroke="#647d85" fill="none" stroke-width="2.5"/><circle cx="59" cy="56" r="4" fill="#c38e69"/>',
      blender: '<path d="M29 19h42l-5 41H35Z" fill="#c4dad7" fill-opacity=".8" stroke="#90b2b4" stroke-width="2"/><path d="M34 45h33l-2 15H36Z" fill="#dfb18c"/><path d="M72 27h12v20H69" stroke="#7da2a5" stroke-width="4" fill="none"/><path d="M27 17h47" stroke="#71999e" stroke-width="5" stroke-linecap="round"/><path d="M36 61h28l10 23H25Z" fill="#7d9fa2"/><rect x="43" y="69" width="13" height="9" rx="3" fill="#c5d6b7"/><path d="M41 24v15" stroke="#eef4e3" stroke-width="4" stroke-linecap="round"/>',
      toaster: '<path d="M18 43q0-8 10-8h45q10 0 10 10v35H18Z" fill="#bdcfd0"/><path d="M21 79h59" stroke="#718e98" stroke-width="5"/><path d="M31 36V20q0-10 11-7 10-6 17 1 12-2 12 9v13" fill="#d8af77"/><path d="M36 33V23q0-8 9-5 8-3 13 2 8-1 8 6v7" fill="#f0d7a0"/><path d="M78 45v18" stroke="#73949c" stroke-width="3"/><rect x="74" y="49" width="10" height="5" rx="2" fill="#66868f"/><circle cx="60" cy="66" r="5" fill="#849fa4"/><path d="M26 44h43" stroke="#eaf0e4" stroke-width="4"/>',
      dryer: '<path d="M29 35q9-20 32-12l22 11v21l-26 6-16-8Z" fill="#bbadca"/><path d="m44 54 16 5-5 27H40Z" fill="#958aaa"/><path d="M81 34h10v22H81Z" fill="#766f8d"/><circle cx="42" cy="39" r="15" fill="#9f94b4"/><circle cx="42" cy="39" r="10" fill="#cfc6d9"/><path d="M35 36h14m-14 5h14m-7-10v15" stroke="#9c92b0" stroke-width="1.5"/><path d="M47 86q0 7 16 5" stroke="#746d88" stroke-width="2" fill="none"/>',
      led: '<path d="M33 53q-21-35 17-41 38 6 18 41l-7 11H40Z" fill="#efe7bc"/><path d="M40 64h21v16H40Z" fill="#a7b8b4"/><path d="M42 81h17l-5 7h-8Z" fill="#6f918f"/><path d="M39 68h23m-23 6h23" stroke="#738f8c" stroke-width="2"/><path d="M43 59V42l7 6 8-6v17" stroke="#d5b575" stroke-width="2" fill="none"/><path class="bulb-rays" d="M50 3v5M20 14l5 5m50-5-5 5M12 39h7m62 0h7" stroke="#d8c58a" stroke-width="3" stroke-linecap="round"/>'
    };
    return electric[id] || "";
  }
  function moneyArt(value) {
    if (value < 100) {
      const gold = value >= 20, c = gold ? "#ccb779" : "#b9c3c5", edge = gold ? "#a99053" : "#8e9ea4";
      return `<svg class="money-art coin-art" viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="37" r="30" fill="${edge}"/><circle cx="35" cy="34" r="29" fill="${c}" stroke="${edge}" stroke-width="2"/><circle cx="35" cy="34" r="24" fill="none" stroke="#fff6d4" stroke-opacity=".5" stroke-width="1"/><circle cx="35" cy="34" r="27" fill="none" stroke="${edge}" stroke-width="1.5" stroke-dasharray="1 3"/><text x="35" y="39" text-anchor="middle" font-family="serif" font-weight="700" font-size="26" fill="${edge}">${value}</text><text x="35" y="51" text-anchor="middle" font-family="sans-serif" font-size="7" fill="${edge}">SEN</text><path d="M21 18q14-8 28 0" fill="none" stroke="#fff8dc" stroke-opacity=".6" stroke-width="3"/></svg>`;
    }
    const palettes = { 100: ["#b3d4e3", "#6e9ab8"], 500: ["#b8d6b2", "#6d9a70"], 1e3: ["#e2b9b2", "#b77c79"], 2e3: ["#edc794", "#c49459"], 5e3: ["#abd0c1", "#6e9d8a"], 1e4: ["#cbbce0", "#9380ac"] };
    const [paper, ink] = palettes[value] || palettes[1e4], n = value / 100;
    return `<svg class="money-art banknote-art" viewBox="0 0 180 90" aria-hidden="true"><rect x="2" y="3" width="176" height="84" rx="6" fill="${ink}"/><rect x="3" y="2" width="174" height="82" rx="6" fill="${paper}" stroke="${ink}"/><rect x="8" y="7" width="164" height="72" rx="3" fill="none" stroke="${ink}" stroke-width=".7"/><path d="M59 3h10v80H59Z" fill="${ink}" opacity=".15"/><g fill="none" stroke="${ink}" opacity=".3" stroke-width=".7">${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="43" cy="43" rx="${19 + i * 3}" ry="${11 + i * 3}"/><ellipse cx="133" cy="43" rx="${16 + i * 3}" ry="${9 + i * 3}"/>`).join("")}<path d="M8 21q40-25 82 0t82 0M8 65q40-25 82 0t82 0"/></g><path d="M82 60V32l10-10 10 10v28m-5-27h-10m-2 9h14m-14 10h14" fill="none" stroke="${ink}" stroke-width="2" opacity=".4"/><text x="13" y="20" font-family="serif" font-weight="700" font-size="17" fill="${ink}">${n}</text><text x="164" y="67" text-anchor="end" font-family="serif" font-weight="700" font-size="32" fill="${ink}">${n}</text><text x="93" y="17" text-anchor="middle" font-family="sans-serif" font-size="6" letter-spacing="1" fill="${ink}">RINGGIT MALAYSIA</text><text x="91" y="74" text-anchor="middle" font-family="sans-serif" font-size="5" letter-spacing="1" fill="${ink}">WANG PERMAINAN \xB7 KEDAI KITA</text><g transform="translate(39 46)" fill="${ink}" opacity=".7">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="6" ry="11" cy="-7" transform="rotate(${a})"/>`).join("")}<circle r="4" fill="${paper}"/></g></svg>`;
  }
  function expandedProductArt(id) {
    const ellipse2 = (x, y, rx, ry, color) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/>`;
    const label = (title, sub = "KITA") => `<text x="50" y="64" text-anchor="middle" font-family="sans-serif" font-size="6" font-weight="800" fill="#334f48">${title.replaceAll("&", "&amp;")}</text><text x="50" y="73" text-anchor="middle" font-family="sans-serif" font-size="4" fill="#67786d">${sub.replaceAll("&", "&amp;")}</text>`;
    const bag2 = (color, title, sub, detail = "") => `<path d="M23 17h54l-3 12 6 55H20l6-55Z" fill="${color}" stroke="#395952" stroke-width=".8"/><path d="M23 17h54v6H23m0 55h54v6H23" fill="#fff" opacity=".4"/><path d="M26 53h48v24H26Z" fill="#fff8e7"/>${label(title, sub)}${detail}<path d="M71 28l4 44" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`;
    const bottle2 = (color, title, detail = "") => `<path d="M39 23h22v9q13 6 13 18v32q-24 7-48 0V50q0-12 13-18Z" fill="${color}" stroke="#718e83" stroke-width="1"/><rect x="37" y="12" width="26" height="14" rx="4" fill="#486e65"/><rect x="31" y="48" width="38" height="28" rx="5" fill="#fff8e7"/>${label(title)}${detail}<path d="M32 39v35" stroke="#fff" opacity=".5" stroke-width="4" stroke-linecap="round"/>`;
    const tray = (food) => `<rect x="13" y="25" width="74" height="59" rx="10" fill="#dbe2dc" stroke="#98ada6"/><rect x="18" y="30" width="64" height="48" rx="8" fill="#a7bdb3"/>${food}<path d="M18 29h64M18 80h64" stroke="#fff" opacity=".7" stroke-width="2"/>`;
    const foodDots = (color) => [[29, 42], [48, 39], [68, 42], [31, 62], [52, 60], [70, 63]].map(([x, y], i) => `<rect x="${x - 9}" y="${y - 6}" width="18" height="13" rx="5" fill="${color}" stroke="#ab773d" stroke-width="1" transform="rotate(${i % 2 ? 16 : -14} ${x} ${y})"/>`).join("");
    const leaf2 = `<path d="M49 45q-19-2-17-18 18 0 17 18 0-20 18-22 3 18-18 22" fill="#619569"/><path d="M49 46v13" stroke="#426f50" stroke-width="3"/>`;
    const art = {
      croissant: `<ellipse cx="50" cy="78" rx="40" ry="9" fill="#e7dcc4"/><path d="M14 61q7-18 22-15 12-22 29-5 17-4 22 17l-11 15-13-8q-13 9-25-1l-15 7Z" fill="#cb8b46" stroke="#ab6b32" stroke-width="1.5"/><path d="m30 46 9 18 9-24 11 25 9-24 8 28" fill="#efbd73" stroke="#b87739" stroke-width="1.5"/><path d="m19 57 9 5m14-12 2 8m14-9 3 9m12-7 6 8" stroke="#f7d798" stroke-width="3" stroke-linecap="round"/>`,
      muffin: `<path d="m24 48 9 35h36l9-35Z" fill="#b89173"/><path d="m30 53 8 27m6-27 3 28m9-28-2 28m15-27-8 27" stroke="#f5d8b2" stroke-width="3"/><path d="M23 51q-12-19 5-25 3-18 23-13 19-4 22 13 16 7 5 25Z" fill="#805b45"/><path d="M28 37q1-15 15-15" stroke="#ab8060" stroke-width="5" stroke-linecap="round"/><g fill="#4b352d"><rect x="44" y="29" width="7" height="6" rx="1" transform="rotate(20 47 32)"/><rect x="60" y="37" width="7" height="7" rx="1"/><rect x="31" y="43" width="6" height="5" rx="1"/></g>`,
      oats: bag2("#c6a174", "OAT", "BIJIRIN PENUH", `<ellipse cx="50" cy="38" rx="19" ry="11" fill="#f3e5c4"/>${[35, 42, 49, 56, 63].map((x, i) => ellipse2(x, 36 + i % 2 * 5, 4, 2, "#c9a679")).join("")}`),
      jam: `<path d="M30 25h40l6 14v42q-26 8-52 0V39Z" fill="#ae565d"/><rect x="27" y="16" width="46" height="13" rx="4" fill="#d8ad86"/><path d="M31 20h38" stroke="#fbdbc0" stroke-width="2"/><rect x="29" y="43" width="42" height="30" rx="4" fill="#fff0d7"/><path d="M39 54q11-12 22 0-5 18-11 16-7 0-11-16" fill="#d77879"/><path d="m42 49 8-6 8 6" stroke="#729461" stroke-width="3" fill="none"/><path d="M31 32v7" stroke="#e5a6a0" stroke-width="4"/>`,
      nuggets: tray(foodDots("#dfad64")),
      sausage: tray([0, 1, 2, 3].map((i) => `<rect x="22" y="${34 + i * 11}" width="56" height="10" rx="5" fill="${i % 2 ? "#bd7971" : "#d89c8b"}"/><path d="M29 ${37 + i * 11}h37" stroke="#eac1a5" stroke-width="1.5"/>`).join("")),
      dumpling: tray([[32, 44], [62, 44], [46, 66]].map(([x, y]) => `<path d="M${x - 13} ${y + 5}q1-24 26 0-13 14-26 0" fill="#f3e7cb" stroke="#c6b48a" stroke-width="1.5"/><path d="m${x - 7} ${y - 3} 3 7m4-10v10m5-7-2 8" stroke="#c6b48a" stroke-width="1.3"/>`).join("")),
      frozenroti: `<rect x="14" y="17" width="72" height="68" rx="8" fill="#bed7e0"/><rect x="19" y="24" width="62" height="52" rx="5" fill="#f4f4e5"/>${[58, 52, 46].map((y) => ellipse2(50, y, 27, 15, "#d7b579") + `<ellipse cx="50" cy="${y - 2}" rx="24" ry="12" fill="#eed39b" stroke="#bb9057" stroke-width=".8"/>`).join("")}<path d="m35 41 4 2m13-7 3 2m7 10 5 1m-30 6 4 1" stroke="#ba8b4f" stroke-width="2"/><text x="50" y="81" text-anchor="middle" font-size="6" fill="#426a7a">PARATHA</text>`,
      diapers: `<rect x="15" y="23" width="70" height="61" rx="9" fill="#d4c5e7"/><path d="M17 29h66v17H17" fill="#a899c6"/><path d="M30 49h40l-4 29H35Z" fill="#fff9e6"/><path d="M30 49q20 13 40 0m-36 9 10 18m22-18-10 18" fill="none" stroke="#bbd6c5" stroke-width="4"/><text x="50" y="39" text-anchor="middle" fill="#fffbea" font-size="9" font-family="sans-serif">BABY SOFT</text>`,
      babywipes: `<path d="m13 42 14-13h51l10 13-4 36H16Z" fill="#b8dcd7"/><rect x="32" y="32" width="36" height="17" rx="7" fill="#f5f3e6" stroke="#80b2aa"/><path d="M39 37h22v7H39Z" fill="#7eaaa3"/><path d="m40 40-5-23 14 5 12-8 7 23Z" fill="#fff9ee"/>${label("BABY WIPES", "LEMBUT TANPA PEWANGI")}`,
      babybottle: `<path d="M32 38h36v40q-18 13-36 0Z" fill="#e1eae0" stroke="#99b7b1" stroke-width="2"/><path d="M35 56h30v19q-15 9-30 0Z" fill="#f7ead0"/><rect x="29" y="29" width="42" height="13" rx="4" fill="#b4a4d4"/><path d="M39 28V17q0-8 10-8t11 8v11Z" fill="#e3c5a6"/><path d="M58 48h6m-6 8h6m-6 8h6m-6 8h6" stroke="#769f9e" stroke-width="2"/><path d="M38 45v29" stroke="#fff" stroke-width="3"/>`,
      babyporridge: bag2("#edc08c", "BUBUR BAYI", "BERAS & SAYUR", `<path d="M31 36h38q-3 17-19 17T31 36" fill="#9dbbb6"/><ellipse cx="50" cy="36" rx="19" ry="5" fill="#f5e3b2"/><path d="m40 33 4 3m10-3 4 3" stroke="#a4b078" stroke-width="3"/>`),
      catfood: bag2("#d3b488", "MAKANAN KUCING", "IKAN PILIHAN", `<path d="m32 38 2-17 12 9h9l12-9 2 17q-18 22-37 0" fill="#eee2bf"/><circle cx="43" cy="38" r="2" fill="#514b3f"/><circle cx="58" cy="38" r="2" fill="#514b3f"/><path d="m48 44 3 3 3-3" fill="#b97d73"/>`),
      fishfood: bag2("#9fc5c9", "MAKANAN IKAN", "PELET AKUARIUM", `<ellipse cx="49" cy="39" rx="18" ry="11" fill="#e9b96c"/><path d="m65 39 13-11v22Z" fill="#d58d54"/><circle cx="39" cy="36" r="2" fill="#29433f"/><path d="m47 28 9-6 3 10" fill="#c58f55"/>`),
      catlitter: bag2("#a8c2d1", "PASIR KUCING", "SERAP & BERSIH", `<path d="M29 35h43l-6 16H35Z" fill="#759295"/><ellipse cx="50" cy="35" rx="21" ry="6" fill="#e7d8ad"/>${[34, 43, 52, 62].map((x) => ellipse2(x, 35, 2, 1, "#bca777")).join("")}`),
      petshampoo: bottle2("#c7b3da", "PET CARE", `<circle cx="50" cy="44" r="6" fill="#7b6b95"/><circle cx="41" cy="35" r="3" fill="#7b6b95"/><circle cx="50" cy="32" r="3" fill="#7b6b95"/><circle cx="59" cy="35" r="3" fill="#7b6b95"/>`),
      notebook: `<rect x="22" y="13" width="56" height="74" rx="5" fill="#527d91"/><path d="M29 14h44v68H29Z" fill="#b5d4d9"/><path d="M33 18h37v64H33Z" fill="#f7efdb"/><rect x="41" y="29" width="24" height="17" rx="2" fill="#d5e2d2"/><path d="M45 35h16m-16 5h12M41 58h23m-23 6h23m-23 6h15" stroke="#a1b2a3" stroke-width="1.5"/>${[25, 36, 47, 58, 69, 80].map((y) => `<path d="M18 ${y}h11" stroke="#6e8079" stroke-width="3" stroke-linecap="round"/>`).join("")}`,
      pencils: [0, 1, 2].map((i) => `<g transform="rotate(${i * 8 - 8} 50 50)"><path d="M${24 + i * 19} 22h10v51l-5 14-5-14Z" fill="${["#d5ac56", "#83a9a0", "#bf8c8a"][i]}"/><path d="M${24 + i * 19} 73h10l-5 14Z" fill="#ead1a6"/><path d="m${27 + i * 19} 81 2 6 2-6" fill="#45514b"/><rect x="${24 + i * 19}" y="14" width="10" height="10" rx="2" fill="#d6a2a1"/><path d="M${27 + i * 19} 28v40" stroke="#fff" opacity=".5" stroke-width="2"/></g>`).join(""),
      crayons: `${["#c97166", "#d7ad55", "#83aa77", "#699bae", "#a389bd"].map((c, i) => `<path d="m${19 + i * 13} 25 5-12 5 12v46h-10Z" fill="${c}"/><rect x="${19 + i * 13}" y="38" width="10" height="22" fill="#fff" opacity=".25"/>`).join("")}<path d="M16 57h69v29H16Z" fill="#e6c77e"/><path d="M20 61h61v20H20Z" fill="#f6e6b6"/><text x="50" y="74" text-anchor="middle" font-size="9" fill="#927448">WARNA</text>`,
      glue: `<path d="M31 33h38v48q-19 9-38 0Z" fill="#eeeadd" stroke="#c3c9b5"/><path d="M36 32V23h28v9" fill="#db9f6c"/><path d="M44 24V10h12v14" fill="#e6ac7b"/><rect x="35" y="47" width="30" height="24" rx="3" fill="#a9cdd0"/>${label("GAM", "SEKOLAH")}`,
      soil: bag2("#bba98c", "TANAH SUBUR", "CAMPURAN ORGANIK", leaf2),
      seeds: `<rect x="25" y="17" width="50" height="68" rx="2" fill="#e8deba" stroke="#a6ae8a"/><path d="M25 17h50v16H25Z" fill="#729968"/><text x="50" y="27" text-anchor="middle" font-size="7" fill="#fff7e1">BENIH CILI</text><path d="M52 41q16 5 6 22-5 9-24 9 18-9 15-19Z" fill="#c77562"/><path d="M52 44q-2-12 10-13" stroke="#5b8a58" stroke-width="3" fill="none"/><path d="M35 79h30" stroke="#9aab85" stroke-width="2"/>`,
      plantpot: `${leaf2}<path d="M27 51h46l-7 32H34Z" fill="#c48c70"/><ellipse cx="50" cy="51" rx="25" ry="7" fill="#dca584"/><ellipse cx="50" cy="50" rx="20" ry="4" fill="#78614a"/><path d="M49 46v7" stroke="#426f50" stroke-width="3"/><path d="M37 61l3 15" stroke="#eac1a2" stroke-width="4" stroke-linecap="round"/>`,
      fertilizer: bag2("#9bba8b", "BAJA ORGANIK", "TUMBUH SUBUR", `<path d="M50 22v26m-1-8-12-9m14 4 12-11m-13 24 13-9" stroke="#4c7652" stroke-width="3"/><ellipse cx="37" cy="29" rx="5" ry="3" fill="#e3df9c"/><ellipse cx="63" cy="24" rx="5" ry="3" fill="#e3df9c"/>`),
      plaster: `<rect x="15" y="32" width="65" height="48" rx="4" fill="#e9dfc2" stroke="#a3ae97"/><path d="M15 32h65v14H15Z" fill="#73a8a1"/><text x="47" y="42" text-anchor="middle" font-size="7" fill="#fff9e7">PLASTER LUKA</text><g transform="rotate(-30 59 51)"><rect x="31" y="44" width="58" height="18" rx="9" fill="#d8b38c" stroke="#be966e"/><rect x="51" y="47" width="18" height="12" rx="2" fill="#ebcdaa"/><path d="M37 49v7m7-7v7m32-7v7m6-7v7" stroke="#b78e66" stroke-width="1.5"/></g>`,
      mask: `<path d="M25 34Q6 23 8 49q0 25 17 18m50-33q20-11 17 16 0 24-17 17" fill="none" stroke="#a9c6c4" stroke-width="3"/><path d="M23 29q27 9 54 0v40q-27 13-54 0Z" fill="#acd1d9" stroke="#79a6b4" stroke-width="1.5"/><path d="M28 42h44m-44 9h44m-44 9h44" stroke="#d8edf0" stroke-width="3"/><path d="M30 34h40" stroke="#719ca8" stroke-width="2"/>`,
      sanitizer: bottle2("#bddee0", "BERSIH", `<path d="M43 13V8h26v5" stroke="#486e65" stroke-width="5" fill="none"/><path d="M47 48h6v6h6v6h-6v6h-6v-6h-6v-6h6Z" fill="#7faea5"/>`),
      thermometer: `<g transform="rotate(35 50 50)"><rect x="37" y="12" width="26" height="61" rx="11" fill="#c7ddd9" stroke="#6e9f9e" stroke-width="1.5"/><rect x="42" y="27" width="16" height="22" rx="3" fill="#617c74"/><text x="50" y="40" text-anchor="middle" font-size="8" fill="#d9efc6">36.5</text><circle cx="50" cy="58" r="5" fill="#77a2ae"/><path d="M45 73h10v14q-5 6-10 0Z" fill="#c1cac3"/></g>`
    };
    if (art[id]) return art[id];
    const appliances = ["ricecooker", "kettle", "fan", "iron", "blender", "toaster", "dryer", "led"];
    if (appliances.includes(id)) {
      const base = localProductArt(id);
      const details = { ricecooker: '<path d="M23 52v18" stroke="#fff" stroke-width="4" opacity=".6"/><circle cx="44" cy="71" r="1.5" fill="#dc8569"/><circle cx="56" cy="71" r="1.5" fill="#86c382"/><path d="M28 47h44" stroke="#7f9c96" stroke-width="1"/>', kettle: '<path d="M48 43h9m-9 8h9m-9 8h9" stroke="#78989c" stroke-width="1.5"/><rect x="64" y="73" width="6" height="4" rx="2" fill="#d4936f"/>', fan: '<g stroke="#567d7c" opacity=".6" fill="none">' + [12, 18, 25].map((r) => `<circle cx="50" cy="38" r="${r}" stroke-width=".7"/>`).join("") + '<path d="M50 9v58M21 38h58M30 18l40 40M30 58l40-40" stroke-width=".6"/></g>', iron: '<path d="M23 74h55" stroke="#d3e2dc" stroke-width="2"/><path d="M29 69h3m5 0h3m5 0h3" stroke="#546d74" stroke-width="1.5"/>', blender: '<path d="M56 28h8m-8 8h7m-7 8h6M44 54l12 3m-10 2 8-6" stroke="#739697" stroke-width="1.3"/><path d="M37 81h25" stroke="#527c80" stroke-width="3"/>', toaster: '<path d="M24 75h28m-28-5h28m-28-5h28" stroke="#829da3" stroke-width="1"/><circle cx="60" cy="66" r="2" fill="#d9c391"/>', dryer: '<path d="M53 67h7" stroke="#e9d8df" stroke-width="3"/><path d="M85 36v17m3-17v17" stroke="#bfb4cf" stroke-width="1"/>', led: '<path d="M34 33q0-11 12-14" stroke="#fffae0" stroke-width="5" fill="none" stroke-linecap="round"/>' };
      return `<g>${base}${details[id]}</g>`;
    }
    return "";
  }
  function catalogProductArt(id) {
    const p = CATALOG_LOOKUP.get(id);
    if (!p) return "";
    const esc = (s) => String(s).replace(/[&<>"']/g, (c2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c2]);
    const words = p.name.split(/\s+/);
    let a = "", b = "";
    for (const word of words) {
      if ((a + " " + word).trim().length <= 14) a = (a + " " + word).trim();
      else b = (b + " " + word).trim();
    }
    if (!b && a.length > 13) {
      b = a.slice(13);
      a = a.slice(0, 13);
    }
    a = esc(a.slice(0, 18).toUpperCase());
    b = esc(b.slice(0, 20).toUpperCase());
    const palettes = { fresh: ["#90b68c", "#d7e3af"], beverages: ["#66b4c1", "#bbd9dc"], pantry: ["#d1ab6d", "#ede2ba"], personal: ["#b8a0cf", "#e9d6ee"], hardware: ["#869d9d", "#d3dfda"], accessories: ["#839fc8", "#d6e3ee"], clothing: ["#bfa98f", "#e9dbcb"], baby: ["#dfabb8", "#f4e1e7"], frozen: ["#86c1d6", "#d5ecf1"], health: ["#8fbcb0", "#d9eae5"], electrical: ["#9ba8c1", "#dce3f0"], bakery: ["#d9ac75", "#f6e6cc"], garden: ["#86ad85", "#d7e4c6"], pets: ["#c8ad78", "#e9debf"], stationery: ["#aa9bcf", "#e7e2f5"], meals: ["#c4a276", "#eadac4"], snacks: ["#d0b873", "#f2e7c1"], household: ["#86b0ad", "#dcebe6"] };
    const [c, d] = palettes[p.category] || ["#a8bd9f", "#e7e8d7"];
    const badgeMap = { fresh: "SEGAR", beverages: "MINUM", pantry: "DAPUR", personal: "DIRI", hardware: "RUMAH", accessories: "DIGI", clothing: "PAKAI", baby: "BAYI", frozen: "BEKU", health: "SIHAT", electrical: "ELEK", bakery: "ROTI", garden: "HIJAU", pets: "PET", stationery: "ALAT", meals: "SIAP", snacks: "SNEK", household: "BERSIH" };
    const tag2 = badgeMap[p.category] || "KITA";
    const label = `<rect x="28" y="40" width="44" height="32" rx="4" fill="#fff9ea" stroke="#dcdac5" stroke-width=".65"/><rect x="32" y="43" width="36" height="9" rx="3" fill="#275a50"/><text x="50" y="49.5" text-anchor="middle" font-family="sans-serif" font-size="5.1" font-weight="bold" fill="#fffbe9">${tag2}</text><text x="50" y="60.5" text-anchor="middle" font-family="sans-serif" font-size="6.7" font-weight="800" fill="#335449" textLength="${Math.min(35, Math.max(12, a.length * 4))}" lengthAdjust="spacingAndGlyphs">${a}</text><text x="50" y="68.5" text-anchor="middle" font-family="sans-serif" font-size="4.5" fill="#698177" textLength="${Math.min(34, Math.max(7, b.length * 3))}" lengthAdjust="spacingAndGlyphs">${b}</text>`;
    const shine2 = `<path d="M29 32Q31 24 43 23" stroke="#fff" stroke-width="3" opacity=".48" fill="none" stroke-linecap="round"/>`;
    const shadow = `<ellipse cx="50" cy="86" rx="24" ry="4" fill="#183e37" opacity=".1"/>`;
    const flatLabel = `<rect x="23" y="66" width="54" height="15" rx="7" fill="#fff8e9"/><text x="50" y="75.5" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#335449" font-weight="bold" textLength="${Math.min(47, Math.max(12, a.length * 4))}" lengthAdjust="spacingAndGlyphs">${a}</text>`;
    const box = `<path d="M22 25h55l-4 55H26Z" fill="${c}" stroke="#456b60" stroke-opacity=".15"/><path d="M22 25h55v8H22Z" fill="${d}"/><path d="M27 32h5v46h-5" fill="#fff" opacity=".24"/><g transform="translate(10 0) scale(.8 1)">${label}</g>${shadow}`;
    if (p.weighted || p.category === "fresh") return `<path d="M26 47q-5-20 15-27 16-8 29 6 15 11 6 33-4 18-24 21-17 2-25-14Z" fill="${c}"/><path d="M51 27q-1-17 11-21m-9 21q10-17 26-10-8 18-26 10Z" fill="${d}" stroke="#649575" stroke-width="2"/><path d="M33 57q-5-18 9-24" fill="none" stroke="#fff" opacity=".55" stroke-width="5" stroke-linecap="round"/>${flatLabel}${shadow}`;
    if (p.category === "beverages") {
      if (/tin|kopi susu|berkarbonat/i.test(p.name)) return `<rect x="31" y="20" width="38" height="62" rx="9" fill="${c}"/><ellipse cx="50" cy="20" rx="19" ry="5" fill="#d9e5df" stroke="#789a97"/><ellipse cx="50" cy="81" rx="19" ry="4" fill="#719da1"/><path d="M32 35h36v40H32Z" fill="${d}"/>${label}<path d="M39 17h22" stroke="#fbfbeb" stroke-width="2" opacity=".6"/>${shadow}`;
      if (/kotak|jus epal|air kelapa|susu coklat|soya/i.test(p.name)) return `<path d="M30 26 40 14h36v67H30Z" fill="${c}"/><path d="M40 14v14H30m10 0h36" fill="none" stroke="${d}" stroke-width="3"/><path d="M61 25 71 9" stroke="#eaf6ea" stroke-width="4" stroke-linecap="round"/><g transform="translate(10 0) scale(.8 1)">${label}</g>${shadow}`;
      return `<path d="M42 14h16v12l9 12v43q-17 8-34 0V38l9-12Z" fill="${c}"/><rect x="40" y="11" width="20" height="11" rx="3" fill="${d}"/><path d="M35 37h30v35H35Z" fill="${d}"/><g transform="translate(12 0) scale(.76 1)">${label}</g>${shine2}${shadow}`;
    }
    if (p.category === "personal" || p.category === "health" || p.category === "household") {
      if (/krim|pelindung|losyen|pelembap|pencuci muka|ubat gigi|sun|gel|face/i.test(p.name)) return `<path d="M30 17h40l-6 58H36Z" fill="${c}"/><rect x="36" y="75" width="28" height="10" rx="3" fill="#648d88"/><path d="M34 27h32v42H34Z" fill="${d}"/><g transform="translate(12 0) scale(.76 1)">${label}</g>${shine2}${shadow}`;
      return `<path d="M38 17h24v10l10 13v41q-22 8-44 0V40l10-13Z" fill="${c}"/><rect x="37" y="12" width="26" height="10" rx="4" fill="${d}"/><path d="M32 40h36v34H32Z" fill="${d}"/><g transform="translate(12 0) scale(.76 1)">${label}</g>${shine2}${shadow}`;
    }
    if (p.category === "hardware") return `<path d="M32 30v-9q18-14 36 0v9" stroke="#527a78" stroke-width="5" fill="none"/><rect x="16" y="29" width="68" height="49" rx="8" fill="${c}" stroke="#678783" stroke-width="1"/><rect x="16" y="29" width="68" height="15" rx="5" fill="${d}"/><path d="M20 46h60" stroke="#607b7a"/><rect x="45" y="38" width="10" height="12" rx="2" fill="#fff8de"/><rect x="26" y="54" width="48" height="19" rx="4" fill="#fff8e8"/><text x="50" y="65" text-anchor="middle" font-size="7" fill="#365b52" font-weight="bold" font-family="sans-serif" textLength="43" lengthAdjust="spacingAndGlyphs">${a}</text>${shadow}`;
    if (p.category === "accessories") return `<path d="M21 24h58v57H21Z" fill="${d}" stroke="#6a89a6"/><path d="M21 24h58v9H21Z" fill="${c}"/><rect x="33" y="34" width="34" height="29" rx="5" fill="#547a9c"/><rect x="36" y="37" width="28" height="20" rx="2" fill="#d6e9e5"/><path d="M39 43h20m-20 5h14" stroke="#92bbb6" stroke-width="2"/><rect x="25" y="64" width="50" height="14" rx="2" fill="#fff9e9"/><text x="50" y="73" text-anchor="middle" font-size="7" fill="#375566" font-family="sans-serif" font-weight="bold" textLength="45" lengthAdjust="spacingAndGlyphs">${a}</text>${shadow}`;
    if (p.category === "clothing") {
      if (/baju|apron|hujan/i.test(p.name)) return `<path d="m19 28 21-13q10 15 20 0l21 13-9 23-11-6v35H39V45l-11 6Z" fill="${c}"/><path d="m40 15q10 9 20 0" fill="none" stroke="${d}" stroke-width="5"/><path d="M44 49h12" stroke="#fff" stroke-width="3" opacity=".7"/>${flatLabel}${shadow}`;
      return `<path d="M14 47 42 29h43v30L57 78H14Z" fill="${c}"/><path d="m14 47 43 4 28-22H42Z" fill="${d}"/><path d="M18 58h39m-39 8h39" stroke="#fff" stroke-width="3" opacity=".45"/>${flatLabel}${shadow}`;
    }
    if (p.category === "pantry" && /sos|cuka|madu|kacang/i.test(p.name)) return `<path d="M37 17h26v11l8 12v41q-21 8-42 0V40l8-12Z" fill="${c}"/><rect x="37" y="12" width="26" height="10" rx="4" fill="${d}"/><path d="M32 40h36v35H32Z" fill="${d}"/><g transform="translate(10 0) scale(.8 1)">${label}</g>${shadow}`;
    if (p.category === "bakery" && /donat|bagel|roti|mufin|croissant/i.test(p.name)) return `<path d="M20 43q0-22 30-24 30 2 30 24l-8 34H28Z" fill="${c}"/><path d="M25 43q25-20 50 0" stroke="#fff" stroke-width="4" opacity=".5" fill="none"/>${flatLabel}${shadow}`;
    if (p.category === "frozen") return `<rect x="17" y="18" width="66" height="65" rx="7" fill="${c}"/><rect x="23" y="26" width="54" height="49" rx="4" fill="${d}"/><path d="m19 22 5-6m52 6 5-6" stroke="#fff" stroke-width="3"/><g stroke="#ecf7f7" stroke-width="2"><path d="M74 21v13m-6-7h12m-10-4 8 8m-8 0 8-8"/></g><g transform="translate(10 0) scale(.8 1)">${label}</g>${shadow}`;
    if (p.category === "stationery") return `<path d="M23 16h54v69H23Z" fill="${c}"/><path d="M29 18h47v65H29Z" fill="${d}"/><path d="M39 24h31m-31 6h31" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M24 34h-8m8 15h-8m8 15h-8" stroke="#6e8a93" stroke-width="3" stroke-linecap="round"/><g transform="translate(10 0) scale(.8 1)">${label}</g>${shadow}`;
    return box;
  }

  // sync-policy.mjs
  function chooseSave(local, remote) {
    if (!remote?.progress) return local?.progress ? "local" : "empty";
    if (!local?.progress || !local._cloudPending) return "remote";
    if (local._clientStamp && local._clientStamp === remote._clientStamp) return "remote";
    if (typeof local._cloudBaseStamp === "string" && local._cloudBaseStamp === remote._clientStamp) return "local";
    return "conflict";
  }
  function withTimeout(promise, duration, step) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error(`Masa menunggu terlalu lama (${step}).`);
          error.code = "KEDAI_TIMEOUT";
          reject(error);
        }, duration);
      })
    ]).finally(() => clearTimeout(timer));
  }

  // cloud.mjs
  var FIREBASE_VERSION = "13.0.0";
  var GUEST_KEY = "kedai-kita-v1";
  var ACCOUNT_KEY = (uid) => `kedai-kita-user-${uid}-v1`;
  var byId = (id) => document.getElementById(id);
  var trim = (value) => String(value ?? "").trim();
  var configValid = (config) => !!(config?.apiKey && config?.projectId && config?.appId && /^https:\/\//.test(config?.databaseURL || "") && !Object.values(config).some((v) => String(v).includes("PASTE_")));
  var clone = (data) => JSON.parse(JSON.stringify(data));
  var BOOT_TIMEOUT_MS = 15e3;
  var DATA_TIMEOUT_MS = 18e3;
  var errorMalay = (error) => {
    const codes = {
      "auth/email-already-in-use": "E-mel ini sudah didaftarkan. Sila log masuk.",
      "auth/invalid-email": "Alamat e-mel tidak sah.",
      "auth/invalid-credential": "E-mel atau kata laluan tidak tepat.",
      "auth/wrong-password": "Kata laluan tidak tepat.",
      "auth/user-not-found": "Akaun tidak dijumpai.",
      "auth/weak-password": "Kata laluan terlalu pendek. Gunakan sekurang-kurangnya 6 aksara.",
      "auth/too-many-requests": "Terlalu banyak percubaan. Cuba lagi kemudian.",
      "auth/network-request-failed": "Tiada sambungan rangkaian. Periksa internet.",
      "auth/operation-not-allowed": "Sistem daftar masuk belum diaktifkan. Hubungi pengendali permainan.",
      "auth/unauthorized-domain": "Log masuk belum dibenarkan untuk laman ini. Hubungi pengendali permainan.",
      "PERMISSION_DENIED": "Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.",
      "permission-denied": "Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.",
      "database/permission-denied": "Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.",
      "database/permission_denied": "Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.",
      "unavailable": "Simpanan dalam talian tidak dapat dihubungi. Cuba lagi apabila talian pulih.",
      "database/unavailable": "Pangkalan data tidak dapat dihubungi. Semak sambungan.",
      "database/network-error": "Masalah rangkaian semasa membaca simpanan.",
      "database/offline": "Sambungan pangkalan data terputus. Sambung internet dahulu.",
      "KEDAI_TIMEOUT": "Sambungan mengambil masa terlalu lama. Cuba sambung semula apabila internet stabil."
    };
    return codes[error?.code] || "Terdapat masalah dengan akaun atau sambungan. Cuba lagi sebentar.";
  };
  var errorCode = (error) => String(error?.code || error?.name || "UNKNOWN").replace(/[^a-zA-Z0-9/_:-]/g, "").slice(0, 80);
  var errorDetails = (error, stage) => {
    const details = [errorCode(error), String(stage || "sambungan")];
    const reason = String(error?.message || "").replace(/[\r\n<>]/g, " ").trim();
    if (reason) details.push(reason.slice(0, 135));
    return details.join(" \xB7 ");
  };
  var diagnostic = (stage, err) => {
    try {
      console.error("[KedaiKita Cloud]", stage, err);
    } catch {
    }
  };
  var readLocal = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  var writeLocal = (key, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  };
  var isMeaningful = (data) => !!(data && (data?.progress?.day > 1 || data?.progress?.served > 0 || data?.progress?.wallet > 0 || data?.session || data?.practiceRun?.session));
  function createCloudSync({ capture, hydrate, pauseForAccount, report, onDeveloperChanged = () => {
  } }) {
    const overlay = byId("accountOverlay");
    const ui = {
      title: byId("accountTitle"),
      hint: byId("accountHint"),
      message: byId("accountMessage"),
      form: byId("accountForm"),
      email: byId("accountEmail"),
      password: byId("accountPassword"),
      submit: byId("accountSubmit"),
      login: byId("accountLoginTab"),
      register: byId("accountRegisterTab"),
      reset: byId("accountReset"),
      guest: byId("accountGuest"),
      close: byId("accountClose"),
      logout: byId("accountLogout"),
      current: byId("accountCurrent"),
      import: byId("accountImport"),
      fresh: byId("accountFresh"),
      retry: byId("accountRetry"),
      authFields: byId("accountAuthFields"),
      choice: byId("accountChoice"),
      overview: byId("accountOverview"),
      controls: byId("accountControls")
    };
    let api = null, auth = null, db = null, user = null, ready = false;
    let guestMode = false, busy2 = false, mode2 = "login", currentKey = GUEST_KEY;
    let timer = null, queued = null, writing = false, writesPending = null, epoch = 0;
    let syncError = null, configEnabled = false, started = false;
    let activeSessionToken = null, watchSessionStop = null, newCredentialLogin = false;
    let kickedForOtherDevice = false, kickingOut = false;
    let developerSandbox = false, baseStamp = null, localSaveFailed = false;
    const DEV_KEY = (uid) => `kedai-kita-dev-sandbox-${uid}-v1`;
    const authorizedDeveloper = (uid) => !!uid && Array.isArray(window.KEDAI_DEVELOPER_UIDS) && window.KEDAI_DEVELOPER_UIDS.some((x) => typeof x === "string" && x.trim().length > 12 && x.trim() === uid);
    let bootWatchdog = null, bootSettled = false, bootStalled = false;
    const sessionPath = (uid) => api.ref(db, `activeSessions/${uid}`);
    const browserSessionKey = (uid) => `kk-active-session-${uid}`;
    const makeSessionToken = () => {
      if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
      const bytes = new Uint8Array(32);
      globalThis.crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    };
    const detachSessionWatch = () => {
      if (watchSessionStop) {
        watchSessionStop();
        watchSessionStop = null;
      }
    };
    const clearSessionLocal = (uid) => {
      try {
        sessionStorage.removeItem(browserSessionKey(uid));
      } catch {
      }
    };
    const saveSessionLocal = (uid, token) => {
      try {
        sessionStorage.setItem(browserSessionKey(uid), token);
      } catch {
      }
    };
    const getSessionLocal = (uid) => {
      try {
        return sessionStorage.getItem(browserSessionKey(uid));
      } catch {
        return null;
      }
    };
    const setStatus = (value) => {
      report(value);
      const el = byId("accountSyncLabel");
      if (el) el.textContent = value;
    };
    const message = (value = "", isError = false) => {
      ui.message.textContent = value;
      ui.message.classList.toggle("error", isError);
    };
    const show = () => {
      if (overlay.open) overlay.close();
      overlay.showModal();
      document.body.classList.add("account-locked");
    };
    const hide = () => {
      if (overlay.open) overlay.close();
      overlay.classList.remove("account-compact");
      document.body.classList.remove("account-locked");
    };
    const showRegion = (region) => {
      overlay.dataset.region = region;
      ui.authFields.hidden = region !== "auth";
      ui.overview.hidden = region !== "overview";
      ui.choice.hidden = region !== "choice";
      ui.controls.hidden = region === "loading";
      ui.guest.hidden = region === "overview" || region === "choice" || region === "error" && !!user;
      ui.close.hidden = region !== "overview";
      ui.logout.hidden = region !== "overview" && region !== "error";
      ui.retry.hidden = region !== "error";
    };
    const showLogin = (hint = "Log masuk untuk simpan dan sambung permainan pada peranti lain.") => {
      show();
      showRegion("auth");
      ui.title.textContent = "Selamat kembali!";
      ui.hint.textContent = hint;
      ui.guest.hidden = false;
      message("");
      setMode("login");
    };
    const showLoading = (hint) => {
      show();
      showRegion("loading");
      ui.title.textContent = "Menyediakan kedai anda";
      ui.hint.textContent = hint;
      message("");
    };
    function showStartupError(step, err) {
      if (bootStalled) return;
      diagnostic(step, err);
      bootStalled = true;
      bootSettled = true;
      clearTimeout(bootWatchdog);
      bootWatchdog = null;
      ready = false;
      syncError = err;
      show();
      showRegion("error");
      ui.title.textContent = "Sambungan akaun terganggu";
      ui.hint.textContent = "Permainan tidak akan menimpa progres akaun ketika sambungan bermasalah.";
      message(`${errorMalay(err)} (Butiran: ${errorDetails(err, step)})`, true);
      ui.retry.onclick = () => window.location.reload();
      ui.retry.textContent = "Cuba semula";
      ui.guest.hidden = false;
      ui.guest.disabled = false;
      ui.guest.textContent = "Main sebagai tetamu (offline)";
      ui.guest.onclick = () => {
        guestMode = true;
        user = null;
        ready = true;
        currentKey = GUEST_KEY;
        hydrate(readLocal(GUEST_KEY));
        hide();
        setStatus("Disimpan pada peranti \xB7 mod tetamu");
      };
      ui.logout.hidden = true;
    }
    const showOverview = () => {
      show();
      showRegion("overview");
      ui.title.textContent = "Akaun Kedai Kita";
      ui.hint.textContent = "Progres kerjaya disimpan mengikut akaun ini.";
      ui.current.textContent = user?.email || "Akaun pemain";
      message(syncError ? errorMalay(syncError) : "Data akaun anda telah dimuatkan.");
      const approved = byId("developerAccessEnabled");
      if (approved) approved.hidden = !developerSandbox;
    };
    const setMode = (selected) => {
      mode2 = selected;
      ui.title.textContent = selected === "register" ? "Mulakan cerita kedai anda" : "Selamat kembali!";
      ui.login.classList.toggle("active", selected === "login");
      ui.register.classList.toggle("active", selected === "register");
      ui.submit.textContent = selected === "register" ? "Daftar akaun" : "Log masuk";
      ui.password.autocomplete = selected === "register" ? "new-password" : "current-password";
      ui.reset.hidden = selected === "register";
    };
    const setBusy = (flag) => {
      busy2 = flag;
      for (const e of [ui.submit, ui.login, ui.register, ui.reset, ui.guest, ui.logout, ui.import, ui.fresh, ui.retry]) e.disabled = flag;
      ui.submit.textContent = flag ? "Sila tunggu\u2026" : mode2 === "register" ? "Daftar akaun" : "Log masuk";
    };
    const localAccount = (uid) => readLocal(ACCOUNT_KEY(uid));
    const snapshotRef = (uid) => api.ref(db, `users/${uid}/games/kedai-kita`);
    const developerSnapshotRef = (uid) => api.ref(db, `users/${uid}/games/kedai-kita/developerSandbox`);
    const legacyDeveloperSnapshotRef = (uid) => api.ref(db, `users/${uid}/games/developerSandbox`);
    const currentSnapshotRef = (uid) => snapshotRef(uid);
    const cloudPayload = (value, token) => developerSandbox ? { developerSandbox: { version: 1, state: value, sessionToken: token, updatedAt: api.serverTimestamp() }, sessionToken: token, updatedAt: api.serverTimestamp() } : { version: 1, state: value, sessionToken: token, updatedAt: api.serverTimestamp() };
    async function sessionReplaced(uid) {
      if (kickingOut || !user || user.uid !== uid) return;
      kickingOut = true;
      kickedForOtherDevice = true;
      ready = false;
      queued = null;
      syncError = null;
      clearTimeout(timer);
      timer = null;
      detachSessionWatch();
      activeSessionToken = null;
      clearSessionLocal(uid);
      setStatus("Sesi akaun tamat");
      try {
        await api.signOut(auth);
      } catch {
      }
      showLogin("Akaun ini telah log masuk pada peranti lain.");
      ui.guest.hidden = true;
      message("Sesi pada peranti ini telah ditamatkan. Masukkan e-mel dan kata laluan semula untuk log masuk.", true);
      kickingOut = false;
    }
    async function claimSession(uid, replaceExisting) {
      detachSessionWatch();
      activeSessionToken = null;
      let token;
      if (replaceExisting) {
        token = makeSessionToken();
        await withTimeout(api.set(sessionPath(uid), { token, startedAt: api.serverTimestamp() }), DATA_TIMEOUT_MS, "menulis sesi aktif");
        const confirm = await withTimeout(api.get(sessionPath(uid)), DATA_TIMEOUT_MS, "mengesahkan sesi aktif");
        if (confirm.val()?.token !== token) {
          await sessionReplaced(uid);
          return false;
        }
        saveSessionLocal(uid, token);
      } else {
        token = getSessionLocal(uid);
        if (!token) {
          await sessionReplaced(uid);
          return false;
        }
        const result = await withTimeout(api.get(sessionPath(uid)), DATA_TIMEOUT_MS, "membaca sesi aktif");
        if (!result.exists() || result.val()?.token !== token) {
          await sessionReplaced(uid);
          return false;
        }
      }
      activeSessionToken = token;
      watchSessionStop = api.onValue(sessionPath(uid), (snapshot) => {
        if (user?.uid === uid && activeSessionToken === token && snapshot.val()?.token !== token) {
          sessionReplaced(uid);
        }
      }, (err) => {
        if (user?.uid === uid) setStatus("Sesi tidak dapat disemak \xB7 semak sambungan");
      });
      return true;
    }
    async function releaseSession(uid, token) {
      if (!token) return;
      try {
        await withTimeout(api.runTransaction(sessionPath(uid), (current) => current?.token === token ? null : void 0, { applyLocally: false }), DATA_TIMEOUT_MS, "menutup sesi");
      } catch {
      }
    }
    const setIdentity = (next) => {
      user = next;
      ready = false;
      baseStamp = null;
      localSaveFailed = false;
      developerSandbox = authorizedDeveloper(next?.uid);
      currentKey = next ? developerSandbox ? DEV_KEY(next.uid) : ACCOUNT_KEY(next.uid) : GUEST_KEY;
      const e = byId("accountBtnText");
      if (e) e.textContent = developerSandbox ? "Dev \u2713" : next ? "Akaun \u2713" : "Akaun";
      onDeveloperChanged(developerSandbox);
    };
    const stage = (state) => {
      queued = clone(state);
      delete queued._cloudPending;
      setStatus("Menyimpan progres\u2026");
      if (!timer) timer = setTimeout(() => flush().catch(() => {
      }), 3e3);
    };
    window.addEventListener("online", () => {
      if (queued && !writing && ready && user && activeSessionToken) {
        syncError = null;
        flush().catch(() => {
        });
      }
    });
    async function flush() {
      try {
        return await withTimeout(drainSaves(), DATA_TIMEOUT_MS, "menyimpan progres");
      } catch (err) {
        if (err?.code === "KEDAI_TIMEOUT") setStatus(localSaveFailed ? "Simpanan belum berjaya \xB7 jangan tutup permainan" : "Menunggu internet \xB7 progres disimpan pada peranti");
        throw err;
      }
    }
    async function drainSaves() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (writing) {
        if (writesPending) await writesPending;
        return queued ? drainSaves() : true;
      }
      if (!ready || !user || !queued || !api || !activeSessionToken) return !queued;
      const uid = user.uid, value = queued, key = currentKey, sessionToken = activeSessionToken, writeEpoch = epoch;
      queued = null;
      writing = true;
      try {
        if (!activeSessionToken) {
          throw new Error("Sesi akaun tidak aktif");
        }
        writesPending = api.update(currentSnapshotRef(uid), cloudPayload(value, sessionToken));
        await writesPending;
        if (user?.uid === uid && epoch === writeEpoch && activeSessionToken === sessionToken) {
          baseStamp = value._clientStamp || null;
          if (queued) queued._cloudBaseStamp = baseStamp;
          const local = readLocal(key);
          if (local) {
            local._cloudBaseStamp = baseStamp;
            if (local._clientStamp === value._clientStamp) local._cloudPending = false;
            localSaveFailed = !writeLocal(key, local);
          }
          syncError = null;
          setStatus(queued ? "Menyimpan progres\u2026" : "\u2713 Progres disimpan");
        }
      } catch (err) {
        if (user?.uid === uid && epoch === writeEpoch && activeSessionToken === sessionToken) {
          syncError = err;
          queued = queued || value;
          setStatus(localSaveFailed ? "Simpanan belum berjaya \xB7 jangan tutup permainan" : "Simpanan belum disegerakkan \xB7 progres selamat di peranti");
          diagnostic("menyimpan progres", err);
        }
        throw err;
      } finally {
        writing = false;
        writesPending = null;
        if (queued && ready && user && activeSessionToken && !syncError) timer = setTimeout(() => {
          flush().catch(() => {
          });
        }, 3e3);
      }
      return queued && ready && user && activeSessionToken ? drainSaves() : !queued;
    }
    async function resetProgress(state) {
      if (!ready) throw new Error("Simpanan akaun belum sedia. Cuba lagi sebentar.");
      const fresh = clone(state);
      if (user) {
        fresh._clientStamp = makeSessionToken();
        fresh._cloudBaseStamp = baseStamp;
        if (!api || !activeSessionToken) throw new Error("Sesi akaun telah tamat. Log masuk semula.");
        if (writesPending) {
          try {
            await withTimeout(writesPending, DATA_TIMEOUT_MS, "menunggu simpanan terdahulu");
          } catch (err) {
            if (writing) throw err;
          }
        }
        if (writing) {
          await withTimeout(new Promise((resolve) => {
            const check = () => writing ? setTimeout(check, 40) : resolve();
            check();
          }), DATA_TIMEOUT_MS, "menyelesaikan simpanan terdahulu");
        }
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        const pendingBefore = queued;
        queued = null;
        try {
          const uid = user.uid, token = activeSessionToken;
          await withTimeout(api.update(currentSnapshotRef(uid), cloudPayload(fresh, token)), DATA_TIMEOUT_MS, "reset progres akaun");
          if (user?.uid !== uid || activeSessionToken !== token) throw new Error("Sesi akaun telah berubah semasa reset.");
          baseStamp = fresh._clientStamp;
          localSaveFailed = !writeLocal(currentKey, fresh);
          syncError = null;
          setStatus(developerSandbox ? "\u{1F9EA} Data ujian direset dan disimpan dalam Firebase" : "\u2713 Progres direset dan disimpan");
        } catch (err) {
          queued = pendingBefore;
          throw err;
        }
      } else {
        if (!writeLocal(currentKey, fresh)) throw new Error("Tidak dapat menyimpan reset pada peranti ini.");
        queued = null;
        syncError = null;
        setStatus("\u2713 Progres tetamu direset");
      }
      return true;
    }
    function queueSave(state) {
      if (!ready) return;
      const data = clone(state);
      if (user) {
        data._cloudPending = true;
        data._clientStamp = makeSessionToken();
        data._cloudBaseStamp = baseStamp;
      }
      localSaveFailed = !writeLocal(currentKey, data);
      if (user && activeSessionToken) stage(data);
      else if (!user) setStatus(localSaveFailed ? "Simpanan peranti gagal \xB7 jangan tutup permainan" : "Disimpan pada peranti \xB7 mod tetamu");
      if (localSaveFailed && user) setStatus("Simpanan peranti gagal \xB7 menunggu simpanan awan");
    }
    async function finishAccount(state) {
      try {
        hydrate(state);
      } catch (error) {
        error.cloudStage = "memaparkan progres permainan";
        throw error;
      }
      ready = true;
      localSaveFailed = !writeLocal(currentKey, state || capture());
      setStatus("\u2713 Progres akaun dimuatkan");
      hide();
    }
    async function loadAccountSave(remote, local, token) {
      baseStamp = remote?._clientStamp || null;
      const choice = chooseSave(local, remote);
      if (choice === "conflict") {
        show();
        showRegion("choice");
        ui.title.textContent = "Pilih progres untuk disambung";
        const summary = (s) => `Hari ${Number(s.progress.day) || 1} \xB7 RM ${((Number(s.progress.wallet) || 0) / 100).toFixed(2)}`;
        ui.hint.textContent = "Ada dua simpanan berbeza. Pilih dengan teliti; pilihan anda akan digunakan untuk akaun ini.";
        ui.choice.querySelector(".account-choice-label").textContent = "Simpanan peranti dan awan tidak sepadan";
        ui.import.textContent = "Guna peranti \xB7 " + summary(local);
        ui.fresh.textContent = "Guna awan \xB7 " + summary(remote);
        const choose = async (useLocal) => {
          if (busy2 || token !== epoch || !user) return;
          setBusy(true);
          try {
            if (!writeLocal(currentKey + "-conflict-backup", { local, remote, savedAt: Date.now() }))
              throw new Error("Tidak dapat menyimpan salinan pemulihan. Kosongkan ruang peranti dan cuba lagi.");
            await finishAccount(useLocal ? local : remote);
            if (useLocal) queueSave(capture());
          } catch (err) {
            message(errorDetails(err, "memilih simpanan"), true);
          } finally {
            setBusy(false);
          }
        };
        ui.import.onclick = () => choose(true);
        ui.fresh.onclick = () => choose(false);
        return true;
      }
      if (choice === "empty") return false;
      await finishAccount(choice === "local" ? local : remote);
      if (choice === "local") queueSave(capture());
      return true;
    }
    async function onSignedIn(next, token, retryNewSession = false) {
      setIdentity(next);
      guestMode = false;
      showLoading("Menyemak sesi dan progres akaun\u2026");
      let loadStep = "membuka sesi akaun";
      try {
        const valid = await claimSession(next.uid, newCredentialLogin || retryNewSession);
        newCredentialLogin = false;
        if (!valid || token !== epoch || user?.uid !== next.uid) return;
        loadStep = developerSandbox ? "membaca sandbox Developer" : "membaca progres permainan";
        const result = await withTimeout(api.get(currentSnapshotRef(next.uid)), DATA_TIMEOUT_MS, "membaca progres");
        if (token !== epoch || user?.uid !== next.uid) return;
        if (developerSandbox) {
          let remote2 = result.exists() ? result.val()?.developerSandbox?.state : null;
          if (!remote2) {
            try {
              const oldDev = await withTimeout(api.get(legacyDeveloperSnapshotRef(next.uid)), DATA_TIMEOUT_MS, "migrasi sandbox lama");
              remote2 = oldDev.val()?.state || null;
            } catch (err) {
              diagnostic("sandbox lama tidak dapat dibaca", err);
            }
          }
          if (token !== epoch || user?.uid !== next.uid) return;
          const local = readLocal(DEV_KEY(next.uid));
          if (!await loadAccountSave(remote2, local, token)) {
            await finishAccount(null);
            queueSave(capture());
          }
          return;
        }
        const remote = result.exists() ? result.val()?.state : null;
        const saved = localAccount(next.uid);
        if (await loadAccountSave(remote, saved, token)) return;
        const old = readLocal(GUEST_KEY);
        if (isMeaningful(old)) {
          ui.choice.querySelector(".account-choice-label").textContent = "Progres lama ditemui pada peranti ini";
          ui.import.textContent = "Import progres lama ke akaun";
          ui.fresh.textContent = "Mula permainan baharu";
          show();
          showRegion("choice");
          ui.title.textContent = "Pilih simpanan pertama";
          ui.hint.textContent = "Ada progres lama pada peranti ini. Pilih untuk pindahkan ke akaun, atau mula baharu.";
          message("Data lama kekal pada peranti sehingga anda pilih untuk mengimportnya.");
          ui.import.onclick = () => {
            if (!user || busy2) return;
            finishAccount(old).then(() => queueSave(capture()));
          };
          ui.fresh.onclick = () => {
            if (!user || busy2) return;
            finishAccount(null).then(() => queueSave(capture()));
          };
          return;
        }
        await finishAccount(null);
        queueSave(capture());
      } catch (err) {
        if (token !== epoch) return;
        newCredentialLogin = false;
        syncError = err;
        setStatus("Simpanan tidak dapat diakses");
        show();
        showRegion("error");
        ui.title.textContent = "Tidak dapat muat simpanan";
        ui.hint.textContent = "Progres anda tidak dipadam. Semak ralat di bawah atau cuba sambung semula.";
        loadStep = err?.cloudStage || loadStep;
        diagnostic(loadStep, err);
        message(`${errorMalay(err)} (Butiran: ${errorDetails(err, loadStep)})`, true);
        ui.retry.onclick = () => {
          if (!user) {
            showLogin("Sila log masuk semula.");
            return;
          }
          syncError = null;
          const needsNewSession = !getSessionLocal(user.uid);
          onSignedIn(user, epoch, needsNewSession);
        };
      }
    }
    async function onAuthChange(next) {
      const token = ++epoch;
      queued = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (next) {
        await onSignedIn(next, token);
        return;
      }
      detachSessionWatch();
      activeSessionToken = null;
      const wasSignedIn = !!user;
      setIdentity(null);
      syncError = null;
      ready = true;
      if (wasSignedIn) {
        try {
          hydrate(readLocal(GUEST_KEY));
        } catch (err) {
          diagnostic("memulihkan mod tetamu", err);
          ready = false;
          showStartupError("memulihkan simpanan tempatan", err);
          return;
        }
      }
      setStatus("Disimpan pada peranti \xB7 mod tetamu");
      if (kickedForOtherDevice) {
        showLogin("Akaun ini telah digunakan pada peranti lain.");
        ui.guest.hidden = true;
        message("Sesi lama tamat. Masukkan e-mel dan kata laluan semula untuk log masuk.", true);
      } else if (guestMode) hide();
      else showLogin();
    }
    function openAccount() {
      overlay.classList.add("account-compact");
      pauseForAccount();
      if (user && ready) showOverview();
      else if (configEnabled) showLogin();
      else {
        showLogin("Sistem akaun belum tersedia. Sila cuba kemudian.");
        ui.submit.disabled = true;
        ui.register.disabled = true;
        ui.login.disabled = true;
        ui.reset.disabled = true;
      }
    }
    async function logOut() {
      if (!auth || !user) return;
      setBusy(true);
      message("Menyimpan progres sebelum log keluar\u2026");
      try {
        queueSave(capture());
        if (!activeSessionToken) throw new Error("Sesi Firebase tidak aktif.");
        if (queued || writing) await withTimeout(flush(), DATA_TIMEOUT_MS, "menyimpan sebelum log keluar");
        if (queued || syncError) throw new Error("Progres belum disimpan dalam Firebase.");
      } catch (err) {
        setBusy(false);
        message("Log keluar dibatalkan. Progres belum berjaya disimpan ke Firebase. Semak internet / Database Rules dan cuba lagi. " + errorDetails(err, "simpan"), true);
        setStatus("\u26A0 Progres belum disegerakkan \xB7 jangan log keluar");
        return;
      }
      ready = false;
      guestMode = false;
      const uid = user.uid, token = activeSessionToken;
      try {
        await withTimeout(api.signOut(auth), DATA_TIMEOUT_MS, "log keluar");
        clearSessionLocal(uid);
        releaseSession(uid, token);
      } catch (err) {
        if (user?.uid === uid) {
          ready = true;
          showOverview();
          message(errorMalay(err), true);
        }
      } finally {
        setBusy(false);
      }
    }
    function initControls() {
      ui.login.onclick = () => {
        setMode("login");
        message("");
      };
      ui.register.onclick = () => {
        setMode("register");
        message("");
      };
      ui.close.onclick = hide;
      const compactClose = byId("accountCompactClose");
      if (compactClose) compactClose.onclick = () => {
        if (ready) hide();
      };
      overlay.addEventListener("cancel", (e) => {
        if (overlay.classList.contains("account-compact") && ready) {
          e.preventDefault();
          hide();
        } else e.preventDefault();
      });
      ui.guest.onclick = () => {
        if (user) return;
        guestMode = true;
        ready = true;
        hide();
        setStatus("Disimpan pada peranti \xB7 mod tetamu");
      };
      ui.logout.onclick = logOut;
      const copyDevUid = byId("copyDeveloperUid");
      if (copyDevUid) copyDevUid.onclick = async () => {
        const uid = user?.uid, field = byId("developerUid");
        if (!uid || !field) return;
        let copied = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(uid);
            copied = true;
          }
        } catch {
        }
        if (!copied) {
          try {
            field.focus();
            field.select();
            copied = document.execCommand("copy");
          } catch {
          }
        }
        copyDevUid.textContent = copied ? "\u2713 UID disalin" : "Pilih UID dan salin";
        if (!copied) field.select();
      };
      ui.form.onsubmit = async (e) => {
        e.preventDefault();
        if (!auth || busy2) return;
        const email = trim(ui.email.value), password = ui.password.value;
        if (!email || password.length < 6) {
          message("Masukkan e-mel sah dan kata laluan sekurang-kurangnya 6 aksara.", true);
          return;
        }
        setBusy(true);
        message("Sedang " + (mode2 === "register" ? "mendaftar" : "log masuk") + "\u2026");
        try {
          kickedForOtherDevice = false;
          newCredentialLogin = true;
          if (mode2 === "register") await api.createUserWithEmailAndPassword(auth, email, password);
          else await api.signInWithEmailAndPassword(auth, email, password);
          ui.password.value = "";
          message("Berjaya. Menyediakan data permainan\u2026");
        } catch (err) {
          newCredentialLogin = false;
          message(errorMalay(err), true);
        } finally {
          setBusy(false);
        }
      };
      ui.reset.onclick = async () => {
        const email = trim(ui.email.value);
        if (!email) {
          message("Isi e-mel anda dahulu untuk tetapkan semula kata laluan.", true);
          return;
        }
        setBusy(true);
        try {
          await api.sendPasswordResetEmail(auth, email);
          message("Jika e-mel ini didaftarkan, arahan set semula kata laluan akan dihantar.");
        } catch (err) {
          message(errorMalay(err), true);
        } finally {
          setBusy(false);
        }
      };
      byId("accountBtn").onclick = openAccount;
    }
    async function start() {
      if (started) return;
      started = true;
      initControls();
      window.addEventListener("online", () => {
        if (!user || !ready) return;
        const pending = readLocal(currentKey);
        if (pending?._cloudPending) {
          syncError = null;
          stage(pending);
        }
      });
      showLoading("Menyemak sambungan akaun\u2026");
      const config = window.KEDAI_FIREBASE_CONFIG;
      configEnabled = configValid(config);
      if (!configEnabled) {
        ready = true;
        setStatus("Akaun belum tersedia \xB7 mod tetamu");
        showStartupError("konfigurasi", Object.assign(new Error("Konfigurasi akaun belum tersedia."), { code: "KEDAI_CONFIG" }));
        return;
      }
      bootWatchdog = setTimeout(() => {
        if (bootSettled) return;
        showStartupError("memulakan akaun", Object.assign(new Error("Auth initialization timeout"), { code: "KEDAI_TIMEOUT" }));
      }, BOOT_TIMEOUT_MS);
      try {
        const path2 = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
        const [appModule, authModule, databaseModule] = await withTimeout(Promise.all([
          import(path2 + "firebase-app.js"),
          import(path2 + "firebase-auth.js"),
          import(path2 + "firebase-database.js")
        ]), BOOT_TIMEOUT_MS, "memuatkan komponen akaun");
        if (bootStalled) return;
        const app = appModule.initializeApp(config);
        api = { ...authModule, ...databaseModule };
        try {
          auth = authModule.getAuth(app);
        } catch (authErr) {
          diagnostic("getAuth", authErr);
          auth = authModule.initializeAuth(app, { persistence: authModule.browserLocalPersistence });
        }
        db = databaseModule.getDatabase(app);
        if (bootStalled) return;
        authModule.onAuthStateChanged(auth, (next) => {
          if (bootStalled) return;
          bootSettled = true;
          clearTimeout(bootWatchdog);
          bootWatchdog = null;
          onAuthChange(next).catch((err) => {
            if (!bootStalled) {
              syncError = err;
              showStartupError("memproses log masuk", err);
            }
          });
        }, (err) => showStartupError("membaca status log masuk", err));
      } catch (err) {
        if (!bootStalled) showStartupError("memulakan sistem akaun", err);
      }
    }
    async function verifyFirebase() {
      if (!user || !ready || !activeSessionToken) throw new Error("Log masuk akaun Firebase dahulu.");
      if (queued || writing) await withTimeout(flush(), DATA_TIMEOUT_MS, "menyegerakkan data ujian");
      if (queued || writing || syncError) throw new Error("Masih ada data belum berjaya disimpan dalam Firebase.");
      const result = await withTimeout(api.get(snapshotRef(user.uid)), DATA_TIMEOUT_MS, "mengesahkan simpanan Firebase");
      const saved = developerSandbox ? result.val()?.developerSandbox?.state : result.val()?.state;
      if (!saved?.progress) throw new Error("Firebase tidak memulangkan data progres.");
      const local = readLocal(currentKey);
      if (local?._clientStamp && saved._clientStamp !== local._clientStamp) throw new Error("Versi Firebase belum sama dengan versi semasa.");
      return { day: saved.progress.day, wallet: saved.progress.wallet, items: Object.keys(saved.progress.inventory || {}).length, categories: saved.progress.unlocked?.length || 0, upgrades: Object.keys(saved.progress.upgrades || {}).length, delivery: saved.progress.delivery?.orders?.length || 0, developer: developerSandbox };
    }
    return { start, queueSave, flush, resetProgress, verifyFirebase, openAccount, getStorageKey: () => currentKey, getUser: () => user, isDeveloper: () => developerSandbox, isSavedLocally: () => ready && !localSaveFailed, isSavedRemotely: () => !!user && ready && !queued && !writing && !syncError && !!activeSessionToken };
  }

  // app.mjs
  var $ = (id) => document.getElementById(id);
  var ICONS = { basket: "M3 9h18l-2 11H5L3 9ZM8 9l4-7 4 7M8 13v3m4-3v3m4-3v3", sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5", shop: "M3 10V5h18v5M4 10v11h16V10M2 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M9 21v-7h6v7", volume: "M11 4 6 8H2v8h4l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14", mute: "M11 4 6 8H2v8h4l5 4V4Zm5 5 6 6m0-6-6 6", expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5", pause: "M8 4v16m8-16v16", scan: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M6 12h12M7 9v6m3-6v6m4-6v6m3-6v6", scale: "M6 7h12l3 14H3L6 7Zm3 0V5a3 3 0 0 1 6 0v2m-3 4v5m-2-2h4", arrow: "M4 12h16m-6-6 6 6-6 6", heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z", flag: "M5 21V3m0 0c5-3 9 3 14 0v10c-5 3-9-3-14 0", receipt: "M5 3h14v19l-3-2-4 2-4-2-3 2V3Zm3 5h8m-8 4h8m-8 4h5", lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4", card: "M2 5h20v14H2V5Zm0 5h20M6 15h4", qr: "M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h3v3h3v3h-6v-6Zm6-3v3M12 3v3m0 6v3M3 12h6m3 6v3", cash: "M2 5h20v14H2V5Zm10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 8h1m12 8h1", check: "M5 12l4 4L19 6", close: "M6 6l12 12M6 18 18 6", play: "m8 4 12 8-12 8V4Z", snow: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M4 14l4 1-1 4m13-9-4-1 1-4", delivery: "M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 19h7l2-5-2-5h-4l-3 5H5l-2 5h2m5-5h5m-5-5h4M5 7h4m-6 3h6", spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z", undo: "M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14", reset: "M4 8a9 9 0 1 1-1 8M4 3v5h5", help: "M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" };
  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ICONS.spark}"/></svg>`;
  }
  function icons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((el) => el.innerHTML = icon(el.dataset.icon));
  }
  function avatar(p, variant = 0) {
    const scarf = p.scarf, glasses = p.glasses;
    return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"><ellipse cx="101" cy="231" rx="77" ry="8" fill="#36614c" opacity=".12"/><path d="M24 239v-41q4-43 53-48h46q48 4 52 48v41" fill="${p.shirt}"/><path d="M34 205q3-26 16-35M166 206q-3-25-16-35" stroke="#173f37" opacity=".1" stroke-width="3" fill="none"/><path d="M79 138v25q21 22 42 0v-25" fill="${p.skin}"/><path d="M79 144q21 19 42 0v12q-22 17-42 0" fill="#000" opacity=".06"/>${scarf ? `<path d="M40 158Q26 76 50 46q19-29 50-28 51 0 62 46 13 43-4 94l-21 42-35-30-36 28Z" fill="${p.scarfColor || "#7b6d79"}"/><path d="M45 100q-7 43 18 62l39 8 32-18 20-55-54-47Z" fill="${p.scarfColor || "#92828e"}"/>` : p.hat === "songkok" ? "" : `<path d="M54 104Q35 39 80 28q50-23 68 24 9 16 0 53Z" fill="${p.hair}"/>`}${scarf ? "" : `<ellipse cx="56" cy="106" rx="9" ry="13" fill="${p.skin}"/><ellipse cx="145" cy="106" rx="9" ry="13" fill="${p.skin}"/>`}<path d="M57 78q0-34 43-34 44 0 44 34v38q-4 39-43 43-39-4-44-43Z" fill="${p.skin}"/>${scarf ? `<path d="M54 84q4-44 46-44 43 0 47 43-21-4-47-32-12 23-46 33" fill="${p.scarfColor || "#7b6d79"}"/><path d="M55 98q-4-43 24-56-10 37-24 56m90 0q4-43-23-56 9 37 23 56" fill="${p.scarfColor || "#7b6d79"}"/><path d="m53 131 48 39 45-36-13 42-31 21-35-18Z" fill="${p.scarfColor || "#7b6d79"}"/><path d="m73 159 29 17 27-17" stroke="#a89ba6" fill="none" stroke-width="2"/>` : p.hat === "songkok" ? "" : `<path d="M55 82q-10-38 27-46 30-19 57 7 12 9 7 39-11-8-17-30-23 27-74 30" fill="${p.hair}"/><path d="M69 49q23 3 42-8" stroke="#fff" stroke-opacity=".1" stroke-width="5" fill="none"/>`}<path class="customer-brows" d="m72 94 14-2m28 0 14 2" stroke="${p.hair}" stroke-width="3" stroke-linecap="round"/><path class="customer-angry-brows" d="m72 90 15 7m27 0 14-7" stroke="${p.hair}" stroke-width="3.8" stroke-linecap="round"/><g class="eye"><ellipse cx="80" cy="106" rx="3" ry="4" fill="#313738"/><ellipse cx="121" cy="106" rx="3" ry="4" fill="#313738"/><circle cx="81" cy="105" r=".8" fill="white"/><circle cx="122" cy="105" r=".8" fill="white"/></g><path d="m99 108-3 12h7" stroke="#875737" opacity=".35" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="71" cy="121" rx="8" ry="4" fill="#d88372" opacity=".3"/><ellipse cx="131" cy="121" rx="8" ry="4" fill="#d88372" opacity=".3"/><path class="customer-mouth" d="M89 132q12 11 24-1" fill="none" stroke="#9d6250" stroke-width="2.5" stroke-linecap="round"/><path class="customer-angry-mouth" d="M89 139q12-10 24 0" fill="none" stroke="#9d6250" stroke-width="3" stroke-linecap="round"/>${glasses ? '<g fill="none" stroke="#494c48" stroke-width="2.5"><rect x="65" y="97" width="29" height="20" rx="7"/><rect x="108" y="97" width="29" height="20" rx="7"/><path d="M94 104q7-4 14 0M65 102l-9-2m81 2 8-2"/></g>' : ""}${!scarf ? `<path d="m79 160 21 17 22-17-8 31-14-14-14 14Z" fill="#fff" opacity=".35"/><path d="M100 178v61" stroke="#173f37" opacity=".12" stroke-width="2"/><circle cx="106" cy="202" r="2" fill="#fff" opacity=".45"/>` : ""}<g class="customer-hands"><path d="M35 223q15-16 28-6l22 7 27-3 5 12-38 7-26-5Z" fill="${p.skin}"/><path d="m165 223-23-9-29 9-7 13 33 4 26-5" fill="${p.skin}"/><path d="M32 215h20v24H29m122-24h19l2 24h-21" fill="${p.shirt}"/></g><rect x="124" y="188" width="25" height="13" rx="3" fill="#fff" opacity=".4"/><path d="M129 193h14m-14 4h9" stroke="#173f37" opacity=".15" stroke-width="2"/><g class="customer-anger" fill="none" stroke="#ba5946" stroke-width="2.5" stroke-linecap="round"><path d="M133 87v5h5m-10-5v5h-5m10 10v-5h5"/></g>${avatarDetails(p)}${p.id === "rider-kita-food" ? `<g class="kita-food-uniform"><rect x="113" y="184" width="42" height="25" rx="5" fill="#f2f9e8" stroke="#a0cdb3" stroke-width="2"/><text x="134" y="194" text-anchor="middle" font-size="8" font-weight="900" font-family="sans-serif" fill="#217753">KITA</text><text x="134" y="203" text-anchor="middle" font-size="8" font-weight="900" font-family="sans-serif" fill="#217753">FOOD</text></g>` : ""}${p.id === "person-izzat" ? `<g><path d="M42 185l31-23 20 26-22 24Z" fill="#273e4e"/><path d="M127 167l28 20-9 27-25-23Z" fill="#273e4e"/><path d="M92 174l8 14 8-14-8-9Z" fill="#d0a05a"/><rect x="129" y="187" width="21" height="13" rx="2" fill="#e9f0ec" stroke="#587f83"/><path d="M133 192h13m-13 4h9" stroke="#5a8987" stroke-width="1.5"/></g>` : p.id === "person-sakinah" ? `<g><path d="M29 205q5-33 30-38l23 30-8 42H24Z" fill="#343d4d"/><path d="M171 205q-5-33-30-38l-23 30 8 42h50Z" fill="#343d4d"/><path d="M84 179l17 14 17-14-17 28Z" fill="#f8f2e9"/><path d="M99 199v25" stroke="#aa8666" stroke-width="2"/><rect x="129" y="187" width="23" height="12" rx="2" fill="#dfbc6e"/><rect x="133" y="190" width="15" height="2" rx="1" fill="#fff2ce"/></g>` : p.id === "person-wawa" ? `<g><path d="M31 195q10-28 44-32l25 30 25-30q34 4 44 32l4 44H27Z" fill="#304e49"/><path d="M80 166l20 28 20-28-20 42Z" fill="#f7eee0"/><path d="M98 197l-5 20 7 11 7-11-5-20Z" fill="#bfa16c"/><rect x="129" y="187" width="23" height="13" rx="2" fill="#f2eee4"/><path d="M133 192h15m-15 4h10" stroke="#49746b" stroke-width="1.5"/></g>` : ""}</svg>`;
  }
  var bankCardDrag = null;
  var previewTheme = null;
  var scaleBuffer = null;
  var scalePromise = null;
  var scaleSource = null;
  var drawerSource = null;
  var practiceStore = null;
  var resultTimer = null;
  var explicitPause = false;
  var paymentMinimized = false;
  var musicUnlocked = false;
  var musicLevel = 0;
  var musicTarget = -1;
  var musicFade = null;
  var musicFramePending = false;
  var MUSIC_TRACKS = Object.freeze([
    { file: "./music-2-tomato-farm.mp3", name: "Music 1" },
    { file: "./music-3-taiyaki.mp3", name: "Music 2" },
    { file: "./music-4-2am.mp3", name: "Music 3" }
  ]);
  var musicIndex = -1;
  var musicLoadedChoice = null;
  var musicStartToken = 0;
  var calculatorPosition = null;
  var calculatorDrag = null;
  var musicStarting = false;
  var musicGain = null;
  var musicSource = null;
  var chaChingBuffer = null;
  var chaChingPromise = null;
  var chaChingSource = null;
  var chaChingSequence = 0;
  var chaChingFallbackNodes = [];
  var renderedBasket = null;
  var renderedSceneCustomer = void 0;
  var selectedCodeItem = null;
  var calculatorInput = "";
  var calculatorResult = "";
  var advancePending = false;
  var STORAGE = "kedai-kita-v1";
  var APP_BUILD = window.__KEDAI_ACTIVE_VERSION__ || "2026-10-27-v68-rush-identity";
  var UPDATE_CHECK_URL = "./version.json";
  var storageOK = true;
  var progress = createProgress();
  var session = null;
  var phase = "scan";
  var customer = null;
  var mode = "career";
  var combo = 0;
  var busy = false;
  var paused = true;
  var modalKind = "intro";
  var cashPicked = [];
  var lastTip = 0;
  var lastEarned = 0;
  var toastTimer;
  var audioCtx;
  var scannerBuffer = null;
  var scannerBufferPromise = null;
  var scannerSource = null;
  var sound = true;
  var drag = null;
  var scanToken = 0;
  var updatePrompt = null;
  var updateCheckTimer = null;
  var cloud = null;
  var delivery = null;
  var careerSessionCache = null;
  var practiceRunCache = null;
  var kitaFoodArrivalTimer = null;
  function showKitaFoodAfterArrival(orderId, delayMs = 2e3) {
    clearTimeout(kitaFoodArrivalTimer);
    kitaFoodArrivalTimer = setTimeout(() => {
      if (customer?.kind === "kitafood" && customer.orderId === orderId && phase === "delivery" && !paused && !document.getElementById("modal").open) delivery?.resumeOrder(orderId);
    }, delayMs);
  }
  function kitaFoodOrderState(orderId) {
    const orders = progress?.delivery?.orders;
    if (!Array.isArray(orders) || !orderId) return null;
    return orders.find((o) => o && o.id === orderId) || null;
  }
  var kitaFoodSecondsRemaining = remainingSeconds;
  try {
    const raw = migrateProducts(JSON.parse(localStorage.getItem(STORAGE) || "null"));
    if (raw) {
      progress = restoreProgress(JSON.stringify(raw.progress));
      sound = raw.sound !== false;
      practiceRunCache = raw.practiceRun?.session?.mode === "practice" ? raw.practiceRun : null;
      careerSessionCache = raw.session || null;
      if ((raw.session?.customer?.items?.length || ["waiting", "supply", "delivery"].includes(raw.session?.phase)) && raw.session.day === progress.day && raw.session.mode === "career") {
        session = raw.session;
        customer = session.customer;
        phase = ["scan", "offer", "change", "success", "lost", "end", "waiting", "supply", "delivery"].includes(session.phase) ? session.phase : "scan";
        combo = session.combo || 0;
        cashPicked = Array.isArray(session.cashPicked) ? session.cashPicked : [];
        lastTip = session.lastTip || 0;
        lastEarned = session.lastEarned || 0;
      }
    }
  } catch {
    storageOK = false;
  }
  var freshOperations = ensureOperations(progress);
  ensureShift(session);
  ensureStyle();
  if (session && !session.dayStart) session.dayStart = JSON.parse(JSON.stringify(progress));
  if (customer && !Array.isArray(customer.items)) {
    customer = null;
    phase = "waiting";
    if (session) {
      session.customer = null;
      session.phase = "waiting";
      session.waitSeconds = 0;
    }
  }
  if (freshOperations && customer && !customer.paid) {
    const need = {};
    for (const p of customer.items) need[p.id] = (need[p.id] || 0) + stockUnits(p);
    for (const [id, n] of Object.entries(need)) progress.inventory[id] = Math.max(progress.inventory[id], n);
  }
  function captureGame() {
    delivery?.syncClock();
    if (session) {
      session.customer = customer;
      session.phase = phase;
      session.combo = combo;
      session.cashPicked = cashPicked;
      session.lastTip = lastTip;
      session.lastEarned = lastEarned;
    }
    if (mode === "practice") {
      practiceRunCache = session ? { session: JSON.parse(JSON.stringify(session)), store: practiceStore ? JSON.parse(JSON.stringify(practiceStore)) : null } : null;
      return { progress, session: careerSessionCache, practiceRun: practiceRunCache, sound };
    }
    careerSessionCache = session;
    return { progress, session, practiceRun: practiceRunCache, sound };
  }
  function hydrateGame(data) {
    migrateProducts(data);
    delivery?.reset();
    clearTimeout(kitaFoodArrivalTimer);
    stopChaChing();
    scanToken++;
    busy = false;
    advancePending = false;
    practiceStore = null;
    paymentMinimized = false;
    ++musicStartToken;
    musicStarting = false;
    musicFade = null;
    musicTarget = -1;
    musicLoadedChoice = null;
    musicIndex = -1;
    musicUnlocked = false;
    const previousPlayer = $("backgroundMusic");
    if (previousPlayer) {
      previousPlayer.pause();
      writeMusicLevel(0);
    }
    mode = "career";
    progress = restoreProgress(JSON.stringify(data?.progress || createProgress()));
    practiceRunCache = data?.practiceRun?.session?.mode === "practice" ? data.practiceRun : null;
    careerSessionCache = data?.session || null;
    sound = data?.sound !== false;
    session = null;
    customer = null;
    phase = "scan";
    combo = 0;
    cashPicked = [];
    lastTip = 0;
    lastEarned = 0;
    renderedBasket = null;
    renderedSceneCustomer = void 0;
    const saved = data?.session;
    if (saved?.day === progress.day && saved?.mode === "career" && (saved.customer?.items?.length || ["waiting", "supply", "end", "delivery"].includes(saved.phase))) {
      session = saved;
      customer = saved.customer || null;
      phase = ["scan", "offer", "change", "success", "lost", "end", "waiting", "supply", "delivery"].includes(saved.phase) ? saved.phase : "scan";
      combo = saved.combo || 0;
      cashPicked = Array.isArray(saved.cashPicked) ? saved.cashPicked : [];
      lastTip = saved.lastTip || 0;
      lastEarned = saved.lastEarned || 0;
    }
    ensureOperations(progress);
    ensureShift(session);
    ensureStyle();
    if (session && !session.dayStart) session.dayStart = JSON.parse(JSON.stringify(progress));
    if (customer && !Array.isArray(customer.items)) {
      customer = null;
      phase = "waiting";
      if (session) {
        session.customer = null;
        session.phase = "waiting";
        session.waitSeconds = 0;
      }
    }
    if (customer && !customer.paid) {
      const needed = {};
      for (const item of customer.items) needed[item.id] = (needed[item.id] || 0) + stockUnits(item);
      for (const [id, units] of Object.entries(needed)) progress.inventory[id] = Math.max(progress.inventory[id] || 0, units);
    }
    initIllustrations();
    render();
    modalKind = null;
    showIntro();
  }
  function save() {
    try {
      const data = captureGame();
      if (cloud) cloud.queueSave(data);
      else localStorage.setItem(STORAGE, JSON.stringify(data));
      if (!cloud) $("saveStatus").textContent = "Disimpan pada peranti ini";
    } catch {
      storageOK = false;
      $("saveStatus").textContent = "Simpanan tidak tersedia";
    }
  }
  function beep(type = "scan") {
    if (!sound) return;
    if (type === "scan") {
      playScannerSound();
      return;
    }
    prepareScannerAudio();
    try {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const notes = type === "success" ? [523, 659, 784] : type === "error" ? [196, 155] : type === "coin" ? [880] : type === "start" ? [392, 523] : [1100];
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        const start = audioCtx.currentTime + i * 0.11;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.19 * effectVolume(type), start + 0.01);
        g.gain.exponentialRampToValueAtTime(1e-3, start + 0.12);
        o.start(start);
        o.stop(start + 0.13);
      });
    } catch {
    }
  }
  function toast(msg, error = false) {
    $("toast").textContent = msg;
    $("toast").className = "toast show" + (error ? " error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
    if (error) beep("error");
  }
  function applyRushPatience(c) {
    if (!c || c.paid || c.rushOriginalPatience !== void 0) return;
    c.rushOriginalPatience = c.patience;
    c.patience = c.elapsed + RUSH_PATIENCE_SECONDS;
  }
  function restoreRushPatience() {
    if (customer?.rushOriginalPatience === void 0) return;
    customer.patience = Math.max(customer.elapsed + 5, customer.rushOriginalPatience);
    delete customer.rushOriginalPatience;
  }
  function beginDailyRush() {
    if (mode !== "career" || modalKind === "rush-start" || !shouldStartRushHour(session, progress.day)) return false;
    if (customer?.kind === "return" && !["success", "lost"].includes(phase)) return false;
    openModal("rush-start", `<div class="modal-pad rush-event-modal"><div class="rush-event-symbol">\u26A1</div><div class="modal-kicker">CABARAN KHAS \xB7 HARI ${progress.day}</div><h2>Rush Hour akan bermula!</h2><p>Dalam 30 saat, pelanggan cuma sabar selama <b>10 saat</b>. Scanner, penimbang dan conveyor menjadi tahap MAX. Untung barang \xD7${rushHourMultiplier(progress.upgrades).toFixed(1)}, stok dan resit tanpa had.</p><div class="rush-event-stats"><span><b>30s</b><small>Tempoh</small></span><span><b>10s</b><small>Kesabaran</small></span><span><b>\xD7${rushHourMultiplier(progress.upgrades).toFixed(1)}</b><small>Untung</small></span></div><p class="rush-event-hint">Pelanggan Rush Hour tidak dikira dalam sasaran harian.</p><button class="primary-btn rush-event-primary" id="rushEventStart">\u26A1 Mula Rush Hour</button></div>`);
    $("rushEventStart").onclick = () => {
      if (!startRushHour(session, progress.day)) {
        closeModal();
        return;
      }
      if (customer && !customer.paid && customer.kind !== "return") {
        applyRushPatience(customer);
        customer.rushUnlimited = true;
        customer.rushCustomer = true;
      }
      applyMachineSpeeds();
      render();
      save();
      closeModal();
      beep("start");
      if (["success", "lost"].includes(phase)) advance();
      else if (phase === "waiting") {
        session.waitSeconds = 0;
        newCustomer();
      }
    };
    return true;
  }
  function finishRushNow() {
    if (customer?.rushCustomer && !customer.paid && ["scan", "offer", "change"].includes(phase)) {
      scanToken++;
      busy = false;
      advancePending = false;
      cancelDrag();
      cancelBankCardDrag();
      stopScannerSound();
      stopScaleSound();
      stopDrawerSound();
      session.rushUnfinished = (session.rushUnfinished || 0) + 1;
      customer = null;
      phase = "waiting";
      session.waitSeconds = 0;
      session.index++;
      cashPicked = [];
      renderedBasket = null;
      renderedSceneCustomer = void 0;
      resetStations();
    }
    restoreRushPatience();
    applyMachineSpeeds();
    render();
    syncBackgroundMusic();
    save();
    showRushEnd();
  }
  function showRushEnd() {
    if (!session?.rushReportPending || session.rushReportShown) return false;
    const count = session.rushServed || 0, lost = session.rushLost || 0;
    openModal("rush-end", `<div class="modal-pad rush-event-modal"><div class="rush-event-symbol">\u2726</div><div class="modal-kicker">CABARAN SELESAI</div><h2>Rush Hour tamat!</h2><p>Hebat! Berikut ialah hasil jualan pelanggan semasa Rush Hour hari ini.</p><div class="rush-end-earnings"><small>UNTUNG BERSIH + TIP RUSH HOUR</small><strong>${money(session.rushEarned || 0)}</strong></div><div class="rush-event-stats"><span><b>${count}</b><small>Pelanggan dilayan</small></span><span><b>${money(session.rushRevenue || 0)}</b><small>Jumlah jualan</small></span><span><b>+${money(session.rushBonus || 0)}</b><small>Bonus pengganda</small></span></div>${session.rushUnfinished ? `<p class="rush-event-hint">${session.rushUnfinished} transaksi belum selesai dibatalkan. Tiada stok atau bayaran ditolak.</p>` : ""}${lost ? `<p class="rush-event-hint">${lost} pelanggan Rush Hour tidak sempat dilayan.</p>` : ""}<p class="rush-event-hint">Pelanggan Rush Hour tidak menambah sasaran harian. Sambung pelanggan biasa untuk tamat syif.</p><button class="primary-btn rush-event-primary" id="rushEventContinue">Teruskan bermain ${icon("arrow")}</button></div>`);
    $("rushEventContinue").onclick = () => {
      session.rushReportPending = false;
      session.rushReportShown = true;
      save();
      closeModal();
      if (["success", "lost"].includes(phase)) advance();
      else if (["waiting", "supply"].includes(phase) && dayFinished(session, progress.day)) showSummary();
    };
    return true;
  }
  var SHIFT_OPEN_MINUTES = 8 * 60;
  var SHIFT_LAST_CUSTOMER_MINUTES = 21 * 60 + 45;
  var SHIFT_CLOSE_MINUTES = 22 * 60;
  var SHIFT_SECONDS_PER_CUSTOMER = 38;
  function shiftSlotMinutes() {
    return (SHIFT_LAST_CUSTOMER_MINUTES - SHIFT_OPEN_MINUTES) / Math.max(1, dayTarget(progress.day));
  }
  function shiftQuotaCount() {
    return Math.min(dayTarget(progress.day), normalCustomerCount(session));
  }
  function syncShiftClockToCustomerCount() {
    if (!session || mode !== "career" || phase === "end") return;
    const milestone = SHIFT_OPEN_MINUTES + shiftQuotaCount() * shiftSlotMinutes();
    session.clockMinutes = Math.min(SHIFT_CLOSE_MINUTES - 1, Math.max(Number(session.clockMinutes) || SHIFT_OPEN_MINUTES, milestone));
    renderOperations();
  }
  function tickShiftClock(dt) {
    if (!session || mode === "practice") return;
    if (mode !== "career") {
      session.clockMinutes = Math.min(SHIFT_CLOSE_MINUTES, (session.clockMinutes || SHIFT_OPEN_MINUTES) + dt * 0.35);
      return;
    }
    const completed = shiftQuotaCount(), slot = shiftSlotMinutes();
    const ceiling = completed >= dayTarget(progress.day) ? SHIFT_CLOSE_MINUTES - 1 : Math.min(SHIFT_CLOSE_MINUTES - 1, SHIFT_OPEN_MINUTES + (completed + 1) * slot - 4);
    const current = Math.max(SHIFT_OPEN_MINUTES, Number(session.clockMinutes) || SHIFT_OPEN_MINUTES);
    session.clockMinutes = Math.min(SHIFT_CLOSE_MINUTES - 1, Math.max(current, Math.min(ceiling, current + dt * slot / SHIFT_SECONDS_PER_CUSTOMER)));
  }
  function newSession(selectedMode = "career") {
    if (selectedMode === "practice" && mode === "career") {
      const current = captureGame();
      careerSessionCache = current.session ? JSON.parse(JSON.stringify(current.session)) : null;
    }
    mode = selectedMode;
    if (mode === "practice") practiceStore = null;
    session = { dayStart: JSON.parse(JSON.stringify(progress)), day: progress.day, mode, served: 0, lost: 0, totalSales: 0, tips: 0, earned: 0, mistakes: 0, index: 0, bestCombo: 0, weighed: 0, scans: 0, perfectCash: 0, claimedMissions: [], seenPeople: [], rushStarted: false, rushCompleted: false, rushSecondsRemaining: 0, rushBonus: 0, rushSales: 0, rushServed: 0, rushLost: 0, rushRevenue: 0, rushEarned: 0, rushReportPending: false, rushReportShown: false };
    ensureShift(session);
    combo = 0;
    initIllustrations();
    newCustomer();
  }
  function newCustomer() {
    ensureShift(session);
    if (mode === "career" && delivery) {
      const arriving = delivery.maybeArrive(session.index);
      if (arriving) {
        advancePending = false;
        paymentMinimized = false;
        scanToken++;
        busy = false;
        cashPicked = [];
        customer = { kind: "kitafood", person: delivery.personFor(arriving), orderId: arriving.id, items: [], elapsed: 0, patience: Math.max(1, Number(arriving.timeLimit) || 30), timedOut: false };
        phase = "delivery";
        renderedBasket = null;
        renderedSceneCustomer = void 0;
        $("customerArt").className = "customer arrive";
        setMobileView("counter");
        resetStations();
        render();
        save();
        const riderOrderId = arriving.id;
        const arrivingRider = customer;
        setTimeout(() => {
          if (customer === arrivingRider) {
            $("customerArt").classList.remove("arrive");
            requestAnimationFrame(positionCustomerDialogue);
          }
        }, 680);
        showKitaFoodAfterArrival(riderOrderId, 2100);
        return;
      }
    }
    if (mode !== "practice" && !readyForCustomer()) {
      enterSupplyWait();
      return;
    }
    advancePending = false;
    paymentMinimized = false;
    scanToken++;
    busy = false;
    cashPicked = [];
    phase = "scan";
    session.seenPeople ??= [];
    const featuredNames = ["person-izzat", "person-sakinah", "person-wawa"];
    const alreadyFeatured = session.seenPeople.some((id) => featuredNames.includes(id));
    const featuredId = mode === "career" && !alreadyFeatured ? featuredNames[(progress.day - 1) % featuredNames.length] : null;
    const rush = mode === "career" && rushHourActive(progress.day, session);
    const selected = makeCustomer(mode === "practice" ? Math.max(2, progress.day) : progress.day, session.index, Math.random, { seen: session.seenPeople, forcedPersonId: featuredId, paymentMethods: availablePaymentMethods(progress.upgrades, mode === "practice"), upgrades: effectiveRushMachineUpgrades(progress.upgrades, rush), challenges: mode === "career", unlocked: mode === "practice" ? CATEGORIES.map((c) => c.id) : progress.unlocked, stock: mode === "practice" || rush ? null : progress.inventory });
    if (!selected) {
      session.practiceDay = (session.practiceDay || 1) + 1;
      session.seenPeople = [];
      toast("Syif latihan baharu bermula.");
      newCustomer();
      return;
    }
    customer = selected;
    if (rush) {
      customer.rushUnlimited = true;
      customer.rushCustomer = true;
    }
    applyMachineSpeeds();
    prepareReturnCustomer();
    prepareKasihCustomer(rush);
    session.seenPeople.push(customer.person.id);
    customer.patience += (progress.upgrades.comfort || 0) * 5;
    if (rush) applyRushPatience(customer);
    $("customerArt").className = "customer arrive";
    const incomingCustomer = customer;
    setTimeout(() => {
      if (customer === incomingCustomer) {
        $("customerArt").classList.remove("arrive");
        requestAnimationFrame(positionCustomerDialogue);
      }
    }, 650);
    setMobileView("counter");
    resetStations();
    render();
    save();
  }
  function rushMachinesActive() {
    return mode === "career" && !!session && (rushHourActive(progress.day, session) || rushUnlimited());
  }
  function gameplayMachineUpgrades() {
    return effectiveRushMachineUpgrades(progress.upgrades, rushMachinesActive());
  }
  function syncSceneAtmosphere() {
    document.body.classList.remove("store-golden-hour", "store-evening", "store-night");
    document.body.classList.toggle("rush-machine-max", rushMachinesActive());
    document.body.classList.toggle("store-rush-active", mode === "career" && rushHourActive(progress.day, session));
  }
  function resetStations() {
    $("scaleItem").innerHTML = "";
    $("scaleItem").dataset.uid = "";
    setScaleReading(null);
    $("scaleState").textContent = "SEDIA";
    $("scaleZone").classList.remove("stable");
    $("weightProgress").style.width = "0";
    $("scaleCaption").textContent = "Sedia untuk ditimbang";
    $("scaleZone").classList.remove("weighing", "highlight");
    $("scannerZone").classList.remove("scanning", "highlight");
    $("scannerStatus").textContent = "Sedia untuk scan";
  }
  function saleTotal(c) {
    return amountDue(c) + kasihContribution(c);
  }
  function render() {
    refreshCalculatorPresets();
    renderHeader();
    renderScene();
    renderProducts();
    renderReceipt();
    renderPayment();
    icons();
    renderPatience();
    renderActivity();
  }
  function renderHeader() {
    delivery?.ensure();
    renderOperations();
    renderPaymentAvailability();
    $("dayLabel").textContent = mode === "practice" ? "Latihan" : "Hari " + String(progress.day).padStart(2, "0");
    $("walletLabel").textContent = money(progress.wallet);
    $("comboLabel").innerHTML = "\xD7" + combo + " <span>\u2726</span>";
    $("missionText").textContent = mode === "practice" ? "Belajar ikut rentak sendiri" : dayTarget(progress.day) + " pelanggan hari ini";
    $("servedLabel").textContent = mode === "practice" ? String(session?.served || 0) + " siap" : normalCustomerCount(session) + " / " + dayTarget(progress.day);
    $("missionProgress").style.width = (mode === "practice" ? 0 : Math.min(100, normalCustomerCount(session) / dayTarget(progress.day) * 100)) + "%";
    $("soundBtn").innerHTML = icon(sound ? "volume" : "mute");
    $("soundBtn").classList.toggle("off", !sound);
    $("soundBtn").setAttribute("aria-label", sound ? "Matikan bunyi" : "Hidupkan bunyi");
    $("shopBtn").disabled = mode === "practice";
    $("missionBtn").classList.toggle("reward-ready", !!session && dailyMissions(session).some((m) => m.value >= m.target && !(session.claimedMissions || []).includes(m.id)));
    applySettings();
    syncBackgroundMusic();
  }
  function renderScene() {
    document.body.classList.toggle("waiting-customer", !!session && !customer);
    if (session && !customer) {
      document.body.classList.remove("kita-food-at-counter");
      $("customerArt").style.visibility = "hidden";
      $("customerName").textContent = "Kaunter sedia";
      if ($("customerOccupation")) $("customerOccupation").hidden = true;
      $("customerRole").textContent = phase === "supply" ? "Bekalan perlu ditambah" : "Waktu lewat \xB7 pelanggan makin kurang";
      $("speech").textContent = phase === "supply" ? "Tambah bekalan untuk sambung berniaga." : "Menunggu pelanggan tiba\u2026";
      return;
    }
    $("customerArt").style.visibility = "";
    const person = customer?.person || PEOPLE[0];
    if (renderedSceneCustomer !== customer) {
      $("customerArt").innerHTML = avatar(person);
      renderedSceneCustomer = customer;
    }
    if (!customer) return;
    $("customerName").textContent = person.name;
    $("customerRole").textContent = "";
    const occupation = $("customerOccupation");
    if (occupation) {
      occupation.textContent = person.role || "";
      occupation.hidden = !person.role;
    }
    $("customerBadge").textContent = person.name.charAt(0);
    $("customerBadge").style.background = person.shirt + "44";
    $("customerArt").classList.toggle("happy", phase === "success");
    $("customerArt").classList.toggle("disappointed", phase === "lost");
    $("customerInfo").classList.toggle("vip", customer.kind === "vip");
    document.body.classList.toggle("kita-food-at-counter", customer.kind === "kitafood");
    $("customerVipBadge").hidden = customer.kind !== "vip";
    $("customerVipTip").hidden = customer.kind !== "vip";
    $("speech").textContent = customerSpeech(customer, phase, lastTip);
    requestAnimationFrame(positionCustomerDialogue);
  }
  function renderProducts() {
    const items = customer?.items || (session ? [] : PRODUCTS.filter((p) => p.category === "essentials").slice(0, 5).map((p, i) => ({ ...p, uid: String(i), grams: 1e3 })));
    for (const p of items) if (p.damaged && !/^\d{4}$/.test(p.manualCode || "")) p.manualCode = randomManualCode();
    const scanned = items.filter((i) => i.scanned).length;
    $("itemCount").textContent = scanned + " / " + items.length;
    $("bagCount").textContent = scanned + " barang";
    $("mobileCount").textContent = scanned;
    $("products").style.setProperty("--slots", 5);
    $("products").classList.remove("many");
    if (renderedBasket !== items) {
      $("products").innerHTML = items.map(productHTML).join("");
      renderedBasket = items;
      $("products").querySelectorAll(".product").forEach((el) => {
        el.addEventListener("pointerdown", onItemDown);
        el.addEventListener("click", (e) => {
          if (e.detail === 0) processItem(el.dataset.uid);
        });
      });
    }
    let slot = 0;
    for (const p of items) {
      const el = $("product-" + p.uid);
      if (!el) continue;
      if (!p.scanned) {
        el.style.setProperty("--slot", slot);
        el.dataset.slot = String(slot++);
        el.tabIndex = window.innerWidth <= 760 || slot <= 5 ? 0 : -1;
      }
      el.classList.toggle("scanned", !!p.scanned);
      el.classList.toggle("damaged", !!p.damaged && !p.repaired && !!p.barcodeFailTriggered);
      el.classList.remove("busy");
      el.disabled = !!p.scanned;
      el.setAttribute("aria-label", p.name + ", " + (p.scanned ? "sudah dalam beg" : p.damaged && !p.repaired && p.barcodeFailTriggered ? "kod manual " + p.manualCode : p.weighted ? "tekan untuk timbang" : "tekan untuk scan"));
    }
    $("beltHint").textContent = !customer && session ? "Menunggu pelanggan \xB7 tiada barang di conveyor" : scanned === items.length ? "Semua siap. Teruskan bayaran!" : slot > 5 ? slot + " barang menunggu \xB7 bergerak ke depan automatik" : "Scan barang \xB7 conveyor bergerak automatik";
    $("undoScanBtn").disabled = !customer || phase !== "scan" || busy || !scanned;
  }
  function productHTML(p, i) {
    return `<button id="product-${p.uid}" class="product ${p.scanned ? "scanned" : ""}" data-uid="${p.uid}" style="--product-bg:${p.color};--item-index:${i};--slot:${i}" aria-label="${p.name}" ${p.scanned ? "disabled" : ""}><span class="product-illustration">${productArt(p.id)}</span><span class="product-name">${p.name}</span>${kasihEligible(p) ? '<span class="kasih-tag">KitaKasih</span>' : ""}<span class="product-price">${money(p.price)}${p.weighted ? "/kg" : ""}</span><span class="mini-barcode" aria-hidden="true"></span>${p.weighted ? '<span class="weight-tag">' + icon("scale") + "</span>" : ""}<span class="damaged-tag"><small>KOD MANUAL</small>${p.manualCode || ""}</span></button>`;
  }
  function renderReceipt() {
    if (customer?.kind === "kitafood") {
      $("roundingRow")?.remove();
      $("discountRow")?.remove();
      $("receiptList").innerHTML = '<div class="receipt-empty"><b>KitaFood</b><small>Pembayaran sudah dibuat dalam aplikasi. Sediakan beg pesanan rider.</small></div>';
      $("receiptQuantity").textContent = "(Pesanan rider)";
      $("subtotal").textContent = money(0);
      $("total").textContent = money(0);
      $("receiptSub").textContent = "Pesanan prabayar KitaFood";
      return;
    }
    if (customer?.kind === "return") {
      renderReturnReceipt();
      return;
    }
    if (!customer) {
      $("receiptList").innerHTML = '<div class="receipt-empty">Menunggu pelanggan</div>';
      $("subtotal").textContent = money(0);
      $("total").textContent = money(0);
      $("receiptQuantity").textContent = "(0 barang)";
      $("receiptSub").textContent = "Kaunter sedia untuk pelanggan seterusnya.";
      return;
    }
    const items = customer.items.filter((i) => i.scanned), subtotal = basketTotal(items), all = items.length === customer.items.length, rounding = all && customer.method === "cash" ? saleTotal(customer) - netTotal(customer) : 0;
    const old = $("roundingRow");
    old?.remove();
    $("discountRow")?.remove();
    $("receiptList").innerHTML = items.length ? items.map((i) => `<div class="receipt-row"><span class="row-emoji">${productArt(i.id)}</span><span class="row-info"><b>${i.name}</b>${customer.kasih ? '<small class="kasih-label">' + (kasihEligible(i) ? "Layak KitaKasih" : "Bayaran sendiri") + "</small>" : ""}<small>${i.weighted ? (i.grams / 1e3).toFixed(3) + " kg \xD7 " + money(i.price) + "/kg" : "1 unit \xD7 " + money(i.price)}</small></span><strong>${money(itemPrice(i))}</strong></div>`).join("") : `<div class="receipt-empty">${icon("basket")}<b>Barang belum discan</b><small>Tekan barang di conveyor untuk mula.</small></div>`;
    $("receiptQuantity").textContent = "(" + items.length + " barang)";
    $("subtotal").textContent = money(subtotal);
    if (rounding) {
      const row = document.createElement("div");
      row.id = "roundingRow";
      row.innerHTML = "<span>Pembundaran tunai</span><b>" + (rounding > 0 ? "+" : "\u2212") + money(Math.abs(rounding)) + "</b>";
      row.style.marginTop = "7px";
      $("subtotal").parentElement.after(row);
    }
    if (all && customer.discount) {
      const row = document.createElement("div");
      row.id = "discountRow";
      row.className = "discount-row";
      row.innerHTML = "<span>Kupon 10%</span><b>\u2212" + money(customer.discount) + "</b>";
      $("subtotal").parentElement.after(row);
    }
    const amount = (subtotal - (all ? customer.discount || 0 : 0) + rounding) / 100;
    $("total").innerHTML = "RM " + Math.floor(amount) + "<span>." + amount.toFixed(2).split(".")[1] + "</span>";
    $("receiptNo").textContent = "#" + String(progress.served + session.index + 1).padStart(4, "0");
    $("receiptSub").textContent = items.length === customer.items.length ? "Semua barang sudah direkodkan." : "";
    if (customer.kasih && all) {
      const q = kasihQuote(customer);
      $("receiptSub").textContent = "KitaKasih " + money(q.aid) + " \xB7 Tambahan " + money(customer.kasih.reserved ? amountDue(customer) : q.remaining) + " \xB7 Baki bantuan " + money(q.balanceAfter);
    }
    $("receiptList").scrollTop = $("receiptList").scrollHeight;
  }
  function renderPayment() {
    if (customer) $("paymentArea").dataset.waitKey = "";
    syncPaymentSurface();
    if (session && !customer) {
      renderWaiting();
      return;
    }
    if (customer?.kind === "return") {
      renderReturnPayment();
      return;
    }
    if (customer?.kind === "kitafood") {
      const area2 = $("paymentArea");
      area2.innerHTML = `<div class="kf-counter-payment"><div class="kf-counter-badge"><span>${icon("delivery")}</span><b>KitaFood \xB7 ${customer.orderId}</b></div><p>Sediakan bungkusan sebelum bar kesabaran rider habis. Buka senarai barang untuk meneruskan.</p><button id="kfReopen" class="primary-btn">Lihat Pesanan Rider ${icon("arrow")}</button></div>`;
      $("kfReopen").onclick = () => delivery.resumeOrder(customer.orderId);
      return;
    }
    const area = $("paymentArea"), transaction = customer, trayScroll = $("changeTray")?.scrollLeft || 0;
    if (!customer) {
      area.innerHTML = `<button class="primary-btn" disabled>Mula syif untuk bermain ${icon("arrow")}</button><p class="payment-hint">Kedai kecil. Pengalaman besar.</p>`;
      return;
    }
    const all = customer.items.every((i) => i.scanned), method = customer.method, methodName = { cash: "Tunai", card: "Kad debit", qr: "QR e-wallet", kasih: "KitaKasih" }[method];
    if (phase === "scan") {
      area.innerHTML = `${customer.hasCoupon ? `<button class="coupon-btn ${customer.couponApplied ? "applied" : ""}" id="couponBtn" ${!all || customer.couponApplied ? "disabled" : ""}>${icon("ticket")}<span><b>${customer.couponApplied ? "Kupon berjaya digunakan" : "Kupon pelanggan \xB7 10% OFF"}</b><small>${customer.couponApplied ? "Jimat " + money(customer.discount) : all ? "Tekan untuk gunakan pada resit ini" : "Scan semua barang untuk aktifkan"}</small></span>${customer.couponApplied ? "\u2713" : "+"}</button>` : ""}<div class="method-preview">${icon(method)} Pelanggan bayar dengan ${methodName.toLowerCase()}</div><button class="primary-btn" id="checkoutBtn" ${all ? "" : "disabled"}>Teruskan bayaran ${icon("arrow")}</button><p class="payment-hint">${all ? "Semak jumlah, kemudian terima bayaran." : "Scan atau timbang semua barang dahulu."}</p>`;
      if ($("couponBtn")) $("couponBtn").onclick = () => {
        if (applyCoupon(customer)) {
          beep("coin");
          renderReceipt();
          renderPayment();
          renderScene();
          save();
          toast("Kupon digunakan. Pelanggan jimat " + money(customer.discount));
        }
      };
      $("checkoutBtn").onclick = () => {
        if (!all || busy || !ensurePaper()) return;
        phase = "offer";
        paymentMinimized = false;
        renderPayment();
        renderScene();
        save();
        beep("coin");
      };
      return;
    }
    if (phase === "offer" && method === "kasih") {
      renderKasih();
      return;
    }
    if (phase === "offer" && method === "cash") {
      area.innerHTML = `<div class="cash-offer"><span>${icon("cash")}</span><div><small>Pelanggan hulur</small><b>${money(customer.tender)}</b></div></div><div class="offered-cash">${cashArtStack(customer.tender)}</div><button class="primary-btn" id="acceptCash">Terima duit ${icon("check")}</button><p class="payment-hint">${customer.total !== amountDue(customer) ? "Bayaran tunai dibundarkan kepada 5 sen terdekat." : "Terima bayaran, kemudian sediakan baki."}</p>`;
      $("acceptCash").onclick = () => {
        if (paused || busy || transaction !== customer || phase !== "offer") return;
        phase = "change";
        cashPicked = [];
        renderPayment();
        renderScene();
        save();
        playDrawerSound();
      };
      return;
    }
    if (phase === "change") {
      const due = customer.tender - amountDue(customer), picked = cashPicked.reduce((a, b) => a + b, 0);
      area.innerHTML = `<div class="change-banner ${picked === due ? "exact" : ""}"><div><small>Baki perlu dipulangkan</small><b>${money(due)}</b></div><div><small>Anda pilih</small><b class="change-picked">${money(picked)}</b></div></div><div class="drawer-tools"><span class="muted">Pilih duit & syiling</span><button class="text-btn" id="undoCash">${icon("undo")} Undur</button><button class="text-btn" id="resetCash">${icon("reset")} Kosongkan</button></div><div class="drawer">${DENOMS.map((d) => `<button class="denom ${d < 100 ? "coin" : ""}" data-note="${d}" aria-label="Tambah ${money(d)}">${moneyArt(d)}<b class="drawer-value">${d >= 100 ? money(d) : d + " SEN"}</b><small class="drawer-pick">Tekan untuk ambil</small>${cashPicked.includes(d) ? '<span class="qty">' + cashPicked.filter((n) => n === d).length + "</span>" : ""}</button>`).join("")}</div><div class="cash-tray-label"><span>${cashPicked.length ? cashPicked.length + " keping \xB7 tekan untuk pulangkan" : "Dulang baki kosong"}</span><small>Leret kiri / kanan</small></div><div class="cash-tray" id="changeTray" tabindex="0" role="region" aria-label="Duit baki dipilih, leret kiri atau kanan untuk melihat semua">${cashPicked.map((v, i) => `<button class="tray-money ${v < 100 ? "tray-coin" : ""}" data-return-cash="${i}" aria-label="Masukkan semula ${money(v)} ke laci" title="Tekan untuk pulangkan ke laci">${moneyArt(v)}<small>\u2212 ${money(v)}</small></button>`).join("")}</div><button class="primary-btn" id="giveChange">${due === 0 ? "Sahkan bayaran tepat" : "Serahkan baki"} ${icon("check")}</button>`;
      $("changeTray").scrollLeft = trayScroll;
      area.querySelectorAll("[data-return-cash]").forEach((b) => b.onclick = () => returnCash(+b.dataset.returnCash, transaction, b));
      area.querySelectorAll("[data-note]").forEach((b) => b.onclick = () => {
        if (paused || busy || transaction !== customer || phase !== "change") return;
        cashPicked.push(+b.dataset.note);
        beep("coin");
        renderPayment();
        scrollChangeTrayEnd();
        save();
      });
      $("undoCash").onclick = () => {
        cashPicked.pop();
        renderPayment();
        save();
      };
      $("resetCash").onclick = () => {
        cashPicked = [];
        renderPayment();
        save();
      };
      $("giveChange").onclick = () => {
        if (paused || busy || transaction !== customer || phase !== "change") return;
        if (picked < due) {
          session.mistakes++;
          customer.cashMistakes = (customer.cashMistakes || 0) + 1;
          combo = 0;
          toast(picked > due ? "Baki terlebih " + money(picked - due) + ". Semak semula." : "Baki kurang " + money(due - picked) + ". Cuba lagi.", true);
          $("paymentArea").classList.add("shake");
          setTimeout(() => $("paymentArea").classList.remove("shake"), 350);
          renderHeader();
          save();
          return;
        }
        transaction.overpaid = Math.max(0, picked - due);
        completePayment(transaction);
      };
      return;
    }
    if (phase === "offer") {
      if (method === "card" && operatingStore().cardBroken) {
        renderCardRepair();
        return;
      }
      renderDigital();
      return;
    }
    if (phase === "success" || phase === "lost") {
      area.innerHTML = "";
      return;
    }
    if (phase === "end") area.innerHTML = `<button class="primary-btn" id="reportBtn">Lihat laporan hari ini ${icon("arrow")}</button>`;
    if ($("reportBtn")) $("reportBtn").onclick = showSummary;
  }
  function qrArt() {
    return `<svg class="qr-art" viewBox="0 0 70 70" aria-hidden="true"><rect width="70" height="70" fill="white"/><g fill="#173f37"><path fill-rule="evenodd" d="M2 2h22v22H2Zm4 4v14h14V6Zm40-4h22v22H46Zm4 4v14h14V6ZM2 46h22v22H2Zm4 4v14h14V50Z"/><path d="M9 9h8v8H9Zm44 0h8v8h-8ZM9 53h8v8H9ZM28 2h6v6h-6Zm8 8h5v14h-5Zm-8 8h5v11h-5ZM2 29h10v5H2Zm16 0h6v11h-6Zm10 6h13v7H28Zm18-8h6v12h-6Zm12 4h10v6H58ZM2 38h10v5H2Zm26 9h6v21h-6Zm12 0h11v6H40Zm0 11h6v10h-6Zm12-14h6v12h-6Zm10 0h6v7h-6Zm-11 18h17v6H51Zm11-7h6v7h-6Z"/></g></svg>`;
  }
  function formatRemainingTime(seconds) {
    const time = Math.max(0, Math.ceil(Number(seconds) || 0));
    return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
  }
  function renderPatience() {
    if (!customer) return;
    let fraction = 1, label = "0:00", angry = false;
    const isRider = customer.kind === "kitafood";
    if (mode === "practice") {
      label = "\u221E";
      $("customerArt").setAttribute("aria-label", "Pelanggan latihan tanpa had masa");
    } else if (isRider) {
      const order = kitaFoodOrderState(customer.orderId);
      const remaining = order ? kitaFoodSecondsRemaining(order) : Math.max(0, Math.ceil((customer.patience || 30) - (customer.elapsed || 0)));
      const total = Math.max(1, Number(order?.timeLimit) || customer.patience || 30);
      fraction = Math.max(0, Math.min(1, remaining / total));
      label = formatRemainingTime(remaining);
      angry = remaining <= 10 && phase !== "success" && !customer.timedOut;
      $("customerArt").setAttribute("aria-label", angry ? "Rider semakin marah, masa hampir habis" : "Rider sedang menunggu pesanan");
    } else {
      const total = Math.max(1, Number(customer.patience) || 1);
      const elapsed = Math.max(0, Number(customer.elapsed) || 0);
      fraction = Math.max(0, 1 - elapsed / total);
      label = formatRemainingTime(total - elapsed);
      angry = fraction < 0.25 && phase !== "success";
      $("customerArt").setAttribute("aria-label", angry ? "Pelanggan marah, kesabaran hampir habis" : "Pelanggan sedang menunggu");
    }
    $("patienceBar").style.width = fraction * 100 + "%";
    $("patienceBar").style.background = fraction < 0.25 ? "#cc8d62" : fraction < 0.5 ? "#c5b270" : "#75a283";
    $("customerArt").classList.toggle("impatient", angry);
    $("patienceText").textContent = label;
    $("patienceText").setAttribute("aria-label", mode === "practice" ? "Tiada had masa" : `Masa berbaki ${label}`);
  }
  function onItemDown(e) {
    if (e.button !== 0 || paused || busy || phase !== "scan") return;
    const el = e.currentTarget, p = customer.items.find((i) => i.uid === el.dataset.uid);
    if (!p || p.scanned) return;
    drag = { p, el, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
    el.addEventListener("pointermove", onItemMove);
    el.addEventListener("pointerup", onItemUp, { once: true });
    el.addEventListener("pointercancel", cancelDrag, { once: true });
    e.preventDefault();
  }
  function onItemMove(e) {
    if (!drag) return;
    const d = drag;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 7) {
      d.moved = true;
      d.ghost = document.createElement("div");
      d.ghost.className = "drag-ghost";
      d.ghost.innerHTML = productArt(d.p.id);
      document.body.append(d.ghost);
      d.el.style.opacity = ".25";
    }
    if (d.ghost) {
      d.ghost.style.left = e.clientX + "px";
      d.ghost.style.top = e.clientY + "px";
      for (const id of ["scannerZone", "scaleZone"]) $(id).classList.toggle("highlight", inside(e, $(id).getBoundingClientRect()));
    }
  }
  function inside(e, r) {
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  function cancelDrag() {
    if (!drag) return;
    drag.ghost?.remove();
    drag.el.style.opacity = "";
    drag.el.removeEventListener("pointermove", onItemMove);
    $("scannerZone").classList.remove("highlight");
    $("scaleZone").classList.remove("highlight");
    drag = null;
  }
  function onItemUp(e) {
    if (!drag) return;
    const d = drag;
    let target = null;
    if (d.moved) {
      if (inside(e, $("scannerZone").getBoundingClientRect())) target = "scanner";
      if (inside(e, $("scaleZone").getBoundingClientRect())) target = "scale";
    }
    cancelDrag();
    if (!d.moved || target) processItem(d.p.uid, target);
  }
  async function processItem(uid, target = null, manual = false) {
    if (paused || busy || phase !== "scan" || !ensurePaper()) return;
    const p = customer.items.find((i) => i.uid === uid);
    if (!p || p.scanned) return;
    const correct = p.weighted ? "scale" : "scanner";
    if (target && target !== correct) {
      toast(p.weighted ? "Barang ini perlu ditimbang. Seret ke penimbang." : "Ada barcode! Seret barang ini ke scanner.", true);
      return;
    }
    if (p.damaged && !p.repaired && !manual) {
      busy = true;
      const attempt = scanToken;
      $("scannerZone").classList.add("scanning");
      $("scannerStatus").textContent = "Membaca barcode\u2026";
      const ok = await delayActive(Math.min(500, machineTimings(gameplayMachineUpgrades()).scanMs + 200), attempt);
      if (!ok) return;
      busy = false;
      $("scannerZone").classList.remove("scanning");
      p.barcodeFailTriggered = true;
      $("scannerStatus").textContent = "\u2715 Barcode tidak dapat dibaca";
      renderProducts();
      beep("error");
      save();
      toast("Barcode rosak! Masukkan kod manual untuk scan.");
      showCodePad(uid);
      return;
    }
    busy = true;
    const token = scanToken;
    const el = $("products").querySelector(`[data-uid="${uid}"]`);
    el?.classList.add("busy");
    fly(p.id, el, $(correct === "scale" ? "scaleZone" : "scannerZone"));
    if (p.weighted) {
      prepareScaleSound();
      $("scaleZone").classList.remove("stable");
      $("scaleZone").classList.add("weighing");
      setScaleReading(p, 0);
      $("scaleItem").innerHTML = productArt(p.id);
      $("scaleItem").dataset.uid = p.uid;
      $("scaleState").textContent = "MENIMBANG";
      $("scaleCaption").textContent = "Menstabilkan bacaan berat\u2026";
      const valid = await delayActive(machineTimings(gameplayMachineUpgrades()).weighMs, token, (frac) => {
        setScaleReading(p, Math.max(0, frac < 0.95 ? frac + Math.sin(frac * 42) * 0.05 : 1));
        $("weightProgress").style.width = frac * 100 + "%";
      });
      if (!valid) return;
      $("scaleZone").classList.remove("weighing");
      setScaleReading(p);
      $("scaleZone").classList.add("stable");
      $("scaleState").textContent = "STABIL";
      $("scaleCaption").textContent = money(itemPrice(p)) + " \xB7 Masuk resit secara automatik";
      playScaleSound();
    } else {
      $("scannerZone").classList.add("scanning");
      $("scannerStatus").textContent = "Membaca barcode\u2026";
      const valid = await delayActive(machineTimings(gameplayMachineUpgrades()).scanMs, token);
      if (!valid) return;
      $("scannerZone").classList.remove("scanning");
      $("scannerStatus").textContent = "\u2713 " + p.name + " \xB7 " + money(itemPrice(p));
      beep("scan");
    }
    p.scanned = true;
    p.scanOrder = (customer.scanSequence || 0) + 1;
    customer.scanSequence = p.scanOrder;
    session.scans = (session.scans || 0) + 1;
    if (p.weighted) session.weighed = (session.weighed || 0) + 1;
    busy = false;
    fly(p.id, $(p.weighted ? "scaleZone" : "scannerZone"), $("bagZone"));
    if (p.weighted) setTimeout(() => {
      if (token === scanToken && $("scaleItem").dataset.uid === p.uid) {
        $("scaleItem").innerHTML = "";
        $("scaleItem").dataset.uid = "";
      }
    }, 420);
    renderProducts();
    renderActivity();
    renderHeader();
    renderReceipt();
    renderPayment();
    const bag2 = document.querySelector(".bag-zone");
    bag2.classList.remove("pop");
    void bag2.offsetWidth;
    bag2.classList.add("pop");
    if (customer.items.every((i) => i.scanned)) {
      $("speech").textContent = customerSpeech(customer, phase, lastTip);
      requestAnimationFrame(positionCustomerDialogue);
      toast(customer.kind === "return" ? "Barang siap discan. Bandingkan resit pemulangan." : "Semua barang siap. Masa untuk bayaran!");
      setMobileView("payment");
    }
    save();
  }
  function delayActive(ms, token, onProgress) {
    return new Promise((resolve) => {
      let elapsed = 0, last = performance.now();
      function tick(now) {
        const delta = Math.min(100, now - last);
        last = now;
        if (token !== scanToken) {
          resolve(false);
          return;
        }
        if (!paused && !document.hidden) {
          elapsed += delta;
          onProgress?.(Math.min(1, elapsed / ms));
        }
        if (elapsed >= ms) {
          resolve(true);
          return;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  function fly(productId, from, to) {
    if (!from) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), el = document.createElement("div");
    el.className = "fly-item";
    el.innerHTML = productArt(productId);
    el.style.left = a.left + a.width / 2 - 23 + "px";
    el.style.top = a.top + a.height / 2 - 23 + "px";
    $("fxLayer").append(el);
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.75)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 420);
  }
  function completePayment(transaction = customer) {
    if (!transaction || transaction !== customer || transaction.paid || !["scan", "offer", "change"].includes(phase) || !transaction.items.every((i) => i.scanned)) return;
    if (!ensurePaper()) {
      busy = false;
      resetDigitalAttempt(transaction);
      renderPayment();
      save();
      return;
    }
    if (mode !== "practice" && !rushUnlimited(transaction) && !stockForBasket(progress, transaction.items)) {
      busy = false;
      resetDigitalAttempt(transaction);
      renderPayment();
      save();
      showInventory();
      toast("Stok tidak cukup. Tambah bekalan dan cuba bayaran semula.", true);
      return;
    }
    if (transaction.kasih && !commitKasih(operatingStore(), transaction)) {
      busy = false;
      toast("Semak semula kad KitaKasih sebelum bayar.", true);
      transaction.kasih.verified = false;
      transaction.kasih.reserved = false;
      transaction.method = "kasih";
      phase = "offer";
      render();
      save();
      return;
    }
    if (transaction.kasih) {
      const r = operatingStore().kitaKasih.receipts[0];
      r.extra = amountDue(transaction);
      r.total = saleTotal(transaction);
    }
    ensureShift(session);
    const missedCoupon = transaction.hasCoupon && !transaction.couponApplied, reason = missedCoupon ? "Kupon diminta tetapi tidak digunakan." : "";
    const starLost = missedCoupon ? loseStar(session, reason) : 0;
    transaction.paid = true;
    busy = false;
    phase = "success";
    combo++;
    session.bestCombo = Math.max(session.bestCombo, combo);
    lastTip = missedCoupon ? 0 : tipFor(customer, combo, progress.upgrades);
    const cost = transaction.items.reduce((n, p) => n + stockCost(p, stockUnits(p), progress.day), 0);
    const itemMargin = saleTotal(transaction) - cost;
    const rushBonus = mode === "career" ? rushHourProfitBonus(itemMargin, progress.upgrades, rushUnlimited(transaction) || rushHourActive(progress.day, session)) : 0;
    transaction.rushBonus = rushBonus;
    lastEarned = itemMargin + lastTip + rushBonus;
    session.rushBonus = (session.rushBonus || 0) + rushBonus;
    if (rushBonus) session.rushSales = (session.rushSales || 0) + 1;
    session.served++;
    if (transaction.rushCustomer) {
      session.rushServed = (session.rushServed || 0) + 1;
      session.rushRevenue = (session.rushRevenue || 0) + saleTotal(transaction);
      session.rushEarned = (session.rushEarned || 0) + lastEarned;
    }
    if (transaction.method === "cash" && !transaction.cashMistakes && !transaction.overpaid) session.perfectCash = (session.perfectCash || 0) + 1;
    session.totalSales += saleTotal(transaction);
    session.tips += lastTip;
    session.earned += lastEarned;
    session.overpaid += transaction.overpaid || 0;
    if (mode === "career") {
      if (!rushUnlimited(transaction)) {
        takeStock(progress, transaction.items);
        progress.paper--;
      }
      receiveStoreCash(progress, saleTotal(transaction) + lastTip);
      progress.wallet += rushBonus;
      progress.lifetime += lastEarned;
      progress.bestCombo = Math.max(progress.bestCombo, combo);
      recordSale(transaction);
      if (transaction.method === "card") {
        progress.cardHealth = Math.max(0, progress.cardHealth - Math.max(4, 24 - 4 * Math.max(1, progress.upgrades.card || 1)));
        progress.cardBroken = progress.cardHealth === 0;
      }
    }
    render();
    save();
    if (transaction.method === "cash") playChaChing();
    else beep("success");
    floatingTip(lastTip);
    if (combo % 3 === 0) confetti(24);
    showTransactionResult(lastTip, starLost, reason, transaction.overpaid || 0);
    advance();
  }
  function handleKitaFoodTimeout() {
    if (phase !== "delivery" || customer?.kind !== "kitafood" || customer?.timedOut) return;
    customer.timedOut = true;
    renderPatience();
    toast("Masa rider tamat. Pesanan KitaFood dibatalkan.", true);
    delivery?.expireOrder?.(customer.orderId);
  }
  function advance() {
    if (advancePending || !["success", "lost"].includes(phase)) return;
    syncShiftClockToCustomerCount();
    if (mode === "career" && session.stars === 0) {
      showStarRecovery();
      return;
    }
    if (mode === "career") {
      if (session.rushReportPending && showRushEnd()) return;
      if (beginDailyRush()) return;
      if (dayFinished(session, progress.day)) {
        phase = "end";
        save();
        renderPayment();
        showShiftClosing();
        return;
      }
    }
    advancePending = true;
    session.index++;
    const wait = mode === "practice" || rushHourActive(progress.day, session) ? 0 : arrivalWait(session.clockMinutes);
    if (wait) {
      session.waitSeconds = wait;
      customer = null;
      phase = "waiting";
      advancePending = false;
      resetStations();
      render();
      save();
    } else newCustomer();
  }
  function loseCustomer() {
    if (!["scan", "offer", "change"].includes(phase)) return;
    scanToken++;
    busy = false;
    cancelDrag();
    phase = "lost";
    session.lost++;
    if (customer?.rushCustomer) session.rushLost = (session.rushLost || 0) + 1;
    const starLost = loseStar(session, "Pelanggan menunggu terlalu lama.");
    showTransactionResult(0, starLost, "Pelanggan menunggu terlalu lama.");
    combo = 0;
    resetStations();
    render();
    save();
    toast("Pelanggan hilang sabar. Cuba lagi!", true);
    advance();
  }
  function floatingTip(amount) {
    if (!amount) return;
    const r = $("walletLabel").getBoundingClientRect(), el = document.createElement("div");
    el.className = "floating-tip";
    el.textContent = "+" + money(amount);
    el.style.left = r.left + "px";
    el.style.top = r.bottom + 18 + "px";
    $("fxLayer").append(el);
    setTimeout(() => el.remove(), 1850);
  }
  function confetti(count = 45) {
    for (let i = 0; i < count; i++) {
      const e = document.createElement("i");
      e.className = "confetti";
      e.style.left = Math.random() * 100 + "vw";
      e.style.background = ["#a2bd85", "#edaf72", "#e1cc91", "#709988"][i % 4];
      e.style.setProperty("--drift", (Math.random() - 0.5) * 250 + "px");
      e.style.animationDelay = Math.random() * 0.5 + "s";
      $("fxLayer").append(e);
      setTimeout(() => e.remove(), 3e3);
    }
  }
  function openModal(kind, html) {
    if (modalKind === "stars-empty" && kind !== "stars-empty") return;
    $("modal").dataset.kind = kind;
    document.body.classList.toggle("style-preview", kind === "style-preview");
    document.body.classList.toggle("intro-screen", kind === "intro");
    if (kind !== "style-preview") {
      previewTheme = null;
      applySettings();
    }
    cancelCalculatorDrag();
    cancelDrag();
    cancelBankCardDrag();
    paused = true;
    document.body.classList.add("paused");
    modalKind = kind;
    if (kind === "pause") {
      explicitPause = true;
      stopScaleSound();
    }
    ;
    delivery?.syncClock();
    syncBackgroundMusic();
    $("modalContent").innerHTML = html;
    icons($("modalContent"));
    enhanceManagement(kind, $("modalContent"), icon);
    if (!$("modal").open) $("modal").showModal();
  }
  function closeModal() {
    if (modalKind === "style-preview") {
      showStyles(previewTheme);
      return;
    }
    if (["intro", "summary", "stars-empty"].includes(modalKind)) return;
    previewTheme = null;
    applySettings();
    if (phase === "end") {
      showSummary();
      return;
    }
    $("modal").close();
    paused = false;
    explicitPause = false;
    document.body.classList.remove("paused", "intro-screen");
    modalKind = null;
    delivery?.syncClock();
    syncBackgroundMusic();
  }
  function startPlay(selected) {
    explicitPause = false;
    musicUnlocked = true;
    paymentMinimized = false;
    beep("start");
    prepareChaChing();
    prepareScaleSound();
    if (selected === "resume" && session) {
      mode = "career";
      normalizeSession();
      if (phase === "end") {
        showSummary();
        return;
      }
      render();
      setMobileView(["offer", "change", "success", "lost"].includes(phase) ? "payment" : "counter");
    } else if (selected === "practice" && practiceRunCache?.session?.mode === "practice") {
      mode = "practice";
      session = JSON.parse(JSON.stringify(practiceRunCache.session));
      practiceStore = practiceRunCache.store ? JSON.parse(JSON.stringify(practiceRunCache.store)) : null;
      customer = session.customer || null;
      phase = session.phase || "scan";
      combo = session.combo || 0;
      cashPicked = Array.isArray(session.cashPicked) ? session.cashPicked : [];
      lastTip = session.lastTip || 0;
      lastEarned = session.lastEarned || 0;
      ensureShift(session);
      if (practiceStore) ensureOperations(practiceStore);
      scanToken++;
      busy = false;
      recoverInterruptedPayment(customer);
      renderedBasket = null;
      renderedSceneCustomer = void 0;
      initIllustrations();
      resetStations();
      render();
      setMobileView("counter");
    } else newSession(selected || "career");
    $("modal").close();
    paused = false;
    document.body.classList.remove("paused", "intro-screen");
    modalKind = null;
    if (customer?.paymentChanged) {
      toast("Tunai sahaja buat masa ini. Buka kad dan QR melalui Upgrade.");
      delete customer.paymentChanged;
      save();
    }
    if (!storageOK) toast("Simpanan automatik tidak tersedia dalam pelayar ini.");
    if (mode === "career" && session.stars === 0) showStarRecovery();
    else if (["success", "lost"].includes(phase)) advance();
    else if (phase === "delivery" && customer?.kind === "kitafood") showKitaFoodAfterArrival(customer.orderId, 1800);
    save();
    syncBackgroundMusic();
  }
  function showIntro() {
    explicitPause = true;
    closeCalculator();
    let selected = "career";
    openModal("intro", `<div class="modal-pad"><div class="intro-layout"><div><div class="modal-kicker"><span class="live-dot"></span> SELAMAT DATANG KE KEDAI KITA</div><h1>Kedai kecil.<br><em>Seronok besar.</em></h1><p>Jadi cashier paling mesra di taman. Scan barang, kira baki dan buat pelanggan tersenyum.</p><div class="intro-features"><span>${icon("scan")} Scan & timbang</span><span>${icon("cash")} Ringgit Malaysia</span><span>${icon("shop")} Naik taraf kedai</span></div></div><div class="intro-art">${avatar(PEOPLE[0])}<div class="intro-counter"><span>${icon("basket")}</span><b>kita.</b></div><div class="intro-sticker">DIBUKA<br>DENGAN<br>SENYUMAN</div></div></div><div class="mode-options"><button class="mode-choice active" id="careerMode"><b>\u2726 Mod kerjaya</b><small>Cabaran harian, combo & naik taraf</small></button><button class="mode-choice" id="practiceMode"><b>Mod santai</b><small>Latihan tanpa masa dan tanpa tekanan</small></button></div><div class="intro-bottom"><button class="primary-btn" id="startBtn">${session ? "Sambung syif \xB7 Hari " + progress.day : "Buka kedai \xB7 Hari " + progress.day} ${icon("arrow")}</button><small>Tekan atau seret barang.<br>Mesra telefon, tablet & komputer.</small></div>${session ? '<p class="muted" style="margin-bottom:0">Kemajuan syif anda sudah disimpan.</p>' : ""}</div>`);
    $("careerMode").onclick = () => {
      selected = "career";
      $("careerMode").classList.add("active");
      $("practiceMode").classList.remove("active");
      $("startBtn").innerHTML = (session ? "Sambung syif \xB7 Hari " : "Buka kedai \xB7 Hari ") + progress.day + " " + icon("arrow");
    };
    $("practiceMode").onclick = () => {
      selected = "practice";
      $("practiceMode").classList.add("active");
      $("careerMode").classList.remove("active");
      $("startBtn").innerHTML = (practiceRunCache ? "Sambung latihan santai " : "Mula latihan santai ") + icon("arrow");
    };
    $("startBtn").onclick = () => startPlay(selected === "career" && session ? "resume" : selected);
  }
  function showPause() {
    if (modalKind === "intro" || modalKind === "summary") return;
    openModal("pause", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">REHAT SEKEJAP</div><h2>Kaunter dijeda.</h2></div><button class="icon-btn" id="closeModal" aria-label="Tutup">${icon("close")}</button></div><p>Pelanggan boleh tunggu. Masa berhenti semasa anda berehat.</p><div class="help-grid"><div class="help-card"><span>${icon("scan")}</span><b>1. Scan barang</b><p>Tekan barang untuk scan automatik, atau seret barang berbungkus ke scanner.</p></div><div class="help-card"><span>${icon("scale")}</span><b>2. Timbang hasil segar</b><p>Tekan atau seret buah, sayur dan ikan ke penimbang. Kelajuan timbang mengikut upgrade penimbang.</p></div><div class="help-card"><span>${icon("cash")}</span><b>3. Terima bayaran</b><p>Ambil duit, kemudian pilih wang kertas dan syiling untuk pulangkan baki tepat.</p></div><div class="help-card"><span>${icon("shop")}</span><b>4. Besarkan kedai</b><p>Urus stok, resit dan peralatan. Jualan menambah duit kedai; stok dibeli pada harga borong. Selesaikan misi harian untuk bonus RM5.</p></div></div><div class="pause-actions"><button class="primary-btn" id="resumeBtn">Sambung bermain ${icon("play")}</button><button class="secondary-btn" id="homeBtn">Menu utama</button></div></div>`);
    $("closeModal").onclick = closeModal;
    $("resumeBtn").onclick = closeModal;
    $("homeBtn").onclick = () => {
      if (mode === "career") save();
      else {
        save();
        restoreCareer();
      }
      showIntro();
    };
  }
  function restoreCareer() {
    practiceStore = null;
    scanToken++;
    busy = false;
    advancePending = false;
    mode = "career";
    try {
      const raw = migrateProducts(JSON.parse(localStorage.getItem(cloud?.getStorageKey() || STORAGE) || "null"));
      session = raw?.session || null;
      if (session) {
        customer = session.customer;
        phase = session.phase;
        combo = session.combo || 0;
        cashPicked = session.cashPicked || [];
        lastTip = session.lastTip || 0;
        lastEarned = session.lastEarned || 0;
      } else {
        customer = null;
        phase = "scan";
        combo = 0;
      }
    } catch {
      session = null;
      customer = null;
    }
    normalizeSession();
    initIllustrations();
    render();
  }
  function showShop(returnTo = "game") {
    if (mode === "practice") {
      toast("Semua kategori dibuka untuk latihan. Upgrade tersedia dalam kerjaya.");
      return;
    }
    const destination = returnTo === "summary" || modalKind === "summary" ? "summary" : "game";
    openModal("shop", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KEMBANGKAN PASAR MINI ANDA</div><h2>Naik Taraf & Kategori</h2></div><button class="icon-btn" id="closeShop" aria-label="Tutup">${icon("close")}</button></div><div class="shop-wallet"><small>Duit kedai anda</small><b>${money(progress.wallet)}</b></div><h3 class="shop-section-title">Buka kelas barangan</h3><div class="category-shop">${CATEGORIES.map((c) => {
      const owned = progress.unlocked.includes(c.id), count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `<div class="category-card ${owned ? "owned" : ""}"><div class="category-art">${productArt(c.art)}<span>${count} barang</span></div><div><h3>${c.name}</h3><p>Kelas ini mengandungi ${count} jenis barangan. ${owned ? "Semua barangan sudah tersedia." : "Buka kelas untuk menjual barangan ini."}</p></div><button data-category="${c.id}" class="secondary-btn" ${owned || progress.wallet < c.cost ? "disabled" : ""}>${owned ? "\u2713 Dibuka" : money(c.cost)}</button><button type="button" class="secondary-btn category-preview-open" data-preview-category="${c.id}" aria-label="Lihat senarai barangan ${c.name}">${icon("book")} Lihat senarai barangan (${count})</button></div>`;
    }).join("")}</div>${paymentUpgradeCards()}<h3 class="shop-section-title">Peralatan kedai & bonus Rush Hour</h3>${UPGRADES.filter((u) => u.type !== "payment").map((u) => {
      const level = progress.upgrades[u.id] || 0, cost = u.cost * (level + 1), maxed = level >= u.max;
      return `<div class="upgrade-row"><span class="upgrade-icon">${icon(u.icon)}</span><div class="upgrade-info"><b>${u.name}</b><span class="level-dots">${"\u25CF".repeat(level) + "\u25CB".repeat(u.max - level)}</span><small>${u.desc}${machineUpgradeInfo(u.id, level, u.max)}</small></div><button class="primary-btn" data-upgrade="${u.id}" ${maxed || progress.wallet < cost ? "disabled" : ""}>${maxed ? "Maksimum" : money(cost)}</button></div>`;
    }).join("")}</div>`);
    const back = () => destination === "summary" ? showSummary() : closeModal();
    $("closeShop").onclick = back;
    $("modalContent").querySelectorAll("[data-preview-category]").forEach((b) => b.onclick = () => showCategoryProducts(b.dataset.previewCategory));
    $("modalContent").querySelectorAll("[data-upgrade]").forEach((b) => b.onclick = () => {
      {
        const previous = progress.upgrades[b.dataset.upgrade] || 0;
        if (buyUpgrade(progress, b.dataset.upgrade)) {
          if (b.dataset.upgrade === "comfort" && customer && customer.kind !== "kitafood" && !customer.rushCustomer && customer.rushOriginalPatience === void 0) customer.patience += 5;
          if (b.dataset.upgrade === "riderPatience") {
            delivery?.extendPatience(5);
            if (customer?.kind === "kitafood") customer.patience = kitaFoodOrderState(customer.orderId)?.timeLimit || customer.patience;
          }
          save();
          if (cloud?.getUser?.()) cloud.flush().catch(() => toast("Upgrade BELUM disimpan dalam Firebase. Jangan log keluar dahulu.", true));
          renderHeader();
          beep("success");
          showShop(destination);
          if (["card", "qr"].includes(b.dataset.upgrade)) toast(previous === 0 ? "Bayaran " + (b.dataset.upgrade === "card" ? "kad" : "QR") + " dibuka untuk pelanggan seterusnya!" : "Peralatan pembayaran dinaik taraf ke tahap " + (previous + 1));
          else if (b.dataset.upgrade === "storage") toast("Kapasiti stor kini " + stockCapacity(progress) + " unit / kg setiap produk.");
        }
      }
    });
    $("modalContent").querySelectorAll("[data-category]").forEach((b) => b.onclick = () => {
      if (unlockCategory(progress, b.dataset.category)) {
        save();
        if (cloud?.getUser?.()) cloud.flush().catch(() => toast("Kategori BELUM disimpan dalam Firebase. Jangan log keluar dahulu.", true));
        renderHeader();
        initIllustrations();
        showShop(destination);
        beep("success");
        confetti(18);
        toast("Kategori " + CATEGORIES.find((c) => c.id === b.dataset.category).name + " dibuka!");
      }
    });
  }
  function showCategoryProducts(categoryId) {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (!category || modalKind !== "shop") return;
    const products = PRODUCTS.filter((p) => p.category === category.id);
    let dialog = document.getElementById("categoryProductDialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "categoryProductDialog";
      dialog.setAttribute("aria-labelledby", "categoryProductTitle");
      document.body.appendChild(dialog);
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    }
    if (dialog.open) dialog.close();
    dialog.innerHTML = `<div class="category-product-sheet"><header class="category-product-heading"><div><div class="modal-kicker">KATALOG KEDAI \xB7 ${products.length} BARANG</div><h2 id="categoryProductTitle">${category.name}</h2><p>Senarai barangan dan harga jualan untuk kategori ini.</p></div><button type="button" class="icon-btn" id="closeCategoryProducts" aria-label="Tutup senarai barangan">${icon("close")}</button></header><div class="category-product-grid">${products.map((p) => `<article class="category-product-tile"><div class="category-product-image">${productArt(p.id)}</div><div class="category-product-description"><b>${p.name}</b><span>${money(p.price)}${p.weighted ? "/kg" : ""}</span></div></article>`).join("")}</div><footer class="category-product-footer"><span>${progress.unlocked.includes(category.id) ? "Kategori telah dibuka" : "Kategori belum dibuka"}</span><button type="button" class="secondary-btn" id="categoryProductsBack">Kembali ke Naik Taraf</button></footer></div>`;
    icons(dialog);
    dialog.querySelector("#closeCategoryProducts").onclick = () => dialog.close();
    dialog.querySelector("#categoryProductsBack").onclick = () => dialog.close();
    dialog.showModal();
  }
  function showShiftClosing() {
    if (!session) return;
    if (mode === "career") {
      session.clockMinutes = SHIFT_CLOSE_MINUTES;
      renderOperations();
    }
    showSummary();
  }
  function showSummary() {
    closeCalculator();
    ensureShift(session);
    settleShift(progress, session, mode === "career");
    phase = "end";
    save();
    const stars = session.stars, target = dayTarget(progress.day), served = session.served || 0, targetServed = normalCustomerCount(session), perfectBonus = targetServed >= target && session.stars === 3 ? "RM 5.00 \xB7 Hari seterusnya" : "Belum layak";
    openModal("summary", `<div class="modal-pad shift-report"><header class="shift-report-head"><div><div class="modal-kicker">KEDAI KITA \xB7 LAPORAN HARIAN</div><h2>Laporan penutupan syif</h2><p>Hari ${String(progress.day).padStart(2, "0")} \xB7 Syif selesai</p></div><div class="shift-report-badge"><div class="stars">${"\u2605".repeat(stars) + "\u2606".repeat(3 - stars)}</div><small>${stars === 3 ? "Prestasi cemerlang" : stars === 2 ? "Prestasi baik" : "Perlu penambahbaikan"}</small></div></header><section class="shift-report-banner"><div><strong>${stars === 3 ? "Syabas! Prestasi syif sangat cemerlang." : stars === 2 ? "Kerja yang baik! Syif hari ini berjalan lancar." : "Syif selesai. Semak ruang yang boleh diperbaiki."}</strong><span>${served} pelanggan dilayan \xB7 Sasaran ${targetServed}/${target} pelanggan \xB7 ${session.rushServed || 0} Rush Hour berjaya</span></div><div class="shift-report-day"><small>STATUS SYIF</small><b>${stars === 3 ? "Cemerlang" : stars === 2 ? "Baik" : "Perlu fokus"}</b></div></section><section class="shift-kpi-grid"><article class="shift-kpi-card"><small>Jumlah jualan</small><strong>${money(session.totalSales || 0)}</strong><span>Nilai jualan sepanjang syif</span></article><article class="shift-kpi-card"><small>Untung bersih + tip</small><strong>${money(session.earned || 0)}</strong><span>Selepas kos semasa direkodkan</span></article><article class="shift-kpi-card"><small>Jumlah tip</small><strong>${money(session.tips || 0)}</strong><span>Ganjaran daripada pelanggan</span></article><article class="shift-kpi-card"><small>Combo terbaik</small><strong>\xD7${session.bestCombo || 0}</strong><span>Rentetan pelanggan berjaya</span></article></section><section class="shift-report-grid"><article class="shift-report-card"><div class="shift-card-head"><h3>Ringkasan kewangan</h3><small>Aliran wang syif hari ini</small></div><div class="shift-report-rows"><div><span>Hasil Rush Hour</span><b>${money(session.rushEarned || 0)}</b></div><div><span>Bonus Rush Hour</span><b>${money(session.rushBonus || 0)}</b></div><div><span>Bayaran balik pelanggan</span><b>${money(session.refunds || 0)}</b></div><div><span>Kos resit & pembaikan</span><b>${money(session.expenses || 0)}</b></div><div><span>Hutang pembekal</span><b>${money(progress.supplierDebt || 0)}</b></div></div></article><article class="shift-report-card"><div class="shift-card-head"><h3>Prestasi operasi</h3><small>Mutu layanan dan operasi kaunter</small></div><div class="shift-report-rows"><div><span>Pelanggan terlepas</span><b>${session.lost || 0}</b></div><div><span>Kesilapan baki</span><b>${session.mistakes || 0}</b></div><div><span>Jumlah pemulangan</span><b>${session.returnCount || 0}</b></div><div><span>Pesanan KitaFood siap</span><b>${session.deliveryCompleted || 0}</b></div><div><span>Bonus syif sempurna</span><b>${perfectBonus}</b></div></div></article></section><section class="shift-report-tools"><button class="secondary-btn" id="summaryInventory">Inventori & bekalan esok</button><button class="summary-missions secondary-btn" id="summaryMissions">Semak ganjaran misi</button></section><div class="summary-actions shift-report-actions"><button class="secondary-btn" id="summaryShop">${icon("shop")} Naik taraf</button><button class="primary-btn" id="nextDay">Teruskan ke Hari ${progress.day + 1} ${icon("arrow")}</button></div></div>`);
    $("summaryInventory").onclick = () => showInventory("summary");
    $("summaryMissions").onclick = () => showMissions("summary");
    $("summaryShop").onclick = () => showShop("summary");
    $("nextDay").onclick = () => {
      const bonus = normalCustomerCount(session) >= dayTarget(progress.day) && session.stars === 3 ? 500 : 0;
      progress.wallet += bonus;
      progress.lifetime += bonus;
      progress.served += session.served;
      progress.history.push({ day: progress.day, served: session.served, earned: session.earned + bonus, stars });
      progress.history = progress.history.slice(-20);
      progress.day++;
      explicitPause = false;
      newSession("career");
      $("modal").close();
      paused = false;
      modalKind = null;
      document.body.classList.remove("paused", "intro-screen");
      save();
      beep("start");
      syncBackgroundMusic();
      toast((bonus ? "Bonus RM5 diterima. " : "") + "Selamat datang ke hari " + progress.day + "!");
    };
    confetti(35);
  }
  function setMobileView(view) {
    const pay = view === "payment";
    document.body.classList.toggle("view-payment", pay);
    $("counterTab").classList.toggle("active", !pay);
    $("paymentTab").classList.toggle("active", pay);
    $("counterTab").setAttribute("aria-selected", String(!pay));
    $("paymentTab").setAttribute("aria-selected", String(pay));
  }
  Object.assign(ICONS, { user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8", moon: "M20 15.5A8.7 8.7 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z", calculator: "M5 2h14v20H5V2Zm3 3h8v4H8V5Zm0 8h1m3 0h1m3 0h1m-9 4h1m3 0h1m3 0h1", ticket: "M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 0v12", clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v6l4 2", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2", book: "M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16" });
  var developerMode = false;
  function developerAccessChanged(enabled) {
    developerMode = !!enabled;
    const button = $("developerPanelBtn");
    if (button) {
      button.hidden = !developerMode;
      button.classList.remove("dev-setup-locked");
      button.innerHTML = icon("settings") + "<span>Developer</span>";
      button.setAttribute("aria-label", "Buka panel ujian Developer");
    }
    document.body.classList.toggle("developer-mode", developerMode);
    if (developerMode) toast("Mod Developer aktif \xB7 semua ujian disimpan secara berasingan");
  }
  function assertDeveloper() {
    return developerMode && cloud?.isDeveloper?.() === true;
  }
  function prepareDeveloperProfile(day = 7) {
    const preservedSettings = { ...progress.settings }, preservedWallet = progress.wallet;
    progress = createProgress();
    progress.settings = preservedSettings;
    progress.day = Math.max(1, Math.min(60, Math.floor(Number(day) || 1)));
    progress.wallet = Math.max(0, Math.round(Number(preservedWallet) || 0));
    progress.unlocked = CATEGORIES.map((c) => c.id);
    progress.upgrades.card = 1;
    progress.upgrades.qr = 1;
    ensureOperations(progress);
    for (const item of PRODUCTS) progress.inventory[item.id] = stockTarget(item, progress);
    progress.paper = 120;
    progress.cardBroken = false;
    progress.cardHealth = 100;
    ensureStyle();
    applyMachineSpeeds();
  }
  function runDeveloperScenario(key, requestedDay = 7) {
    if (!assertDeveloper()) return;
    const day = key === "barcode" ? 4 : key === "rush" ? 8 : key === "decline" ? 11 : key === "pin" ? 6 : key === "refundValid" || key === "refundInvalid" ? 4 : key === "vip" ? 8 : key === "qr" ? 8 : key === "cash" ? 1 : key === "kitafood" || key === "kitafoodLate" ? 7 : key === "rushEnd" ? 8 : requestedDay;
    prepareDeveloperProfile(day);
    if (key === "full") {
      for (const u of UPGRADES) progress.upgrades[u.id] = u.max;
      for (const item of PRODUCTS) progress.inventory[item.id] = stockTarget(item, progress);
    }
    newSession("career");
    if (key === "rushEnd") {
      session.rushStarted = true;
      session.rushCompleted = true;
      session.rushSecondsRemaining = 0;
      session.rushServed = 4;
      session.rushRevenue = 9800;
      session.rushEarned = 2300;
      session.rushBonus = 1150;
      session.rushReportPending = true;
      session.rushReportShown = false;
    }
    if (key === "rush") {
      session.index = 1;
      session.clockMinutes = 750;
      session.seenPeople = [];
      session.rushStarted = true;
      session.rushCompleted = false;
      session.rushSecondsRemaining = RUSH_DURATION_SECONDS;
      session.rushReportPending = false;
      session.rushReportShown = false;
      newCustomer();
    }
    if (key === "barcode") {
      const item = customer.items.find((i) => !i.weighted);
      if (item) {
        item.damaged = true;
        item.manualCode = randomManualCode();
        item.repaired = false;
        item.barcodeFailTriggered = false;
      }
    }
    if (["decline", "pin"].includes(key)) {
      customer.method = "card";
      customer.requiresPin = key === "pin";
      customer.cardStage = "ready";
      customer.cardContactReady = false;
      customer.cardDeclineReason = key === "decline" ? "insufficient" : null;
      customer.cardDeclineHandled = false;
    }
    if (key === "qr") {
      customer.method = "qr";
      customer.requiresPin = false;
      customer.cardStage = "ready";
      customer.qrArmed = false;
      customer.qrScanned = false;
    }
    if (key === "vip") customer.kind = "vip";
    if (key === "noPaper") progress.paper = 0;
    if (key === "terminalBroken") {
      progress.cardBroken = true;
      progress.cardHealth = 0;
    }
    if (key === "lowStock") {
      for (const p of PRODUCTS) if (progress.unlocked.includes(p.category)) progress.inventory[p.id] = p.weighted ? 1e3 : 1;
    }
    if (key === "outOfStock") {
      for (const p of PRODUCTS) if (progress.unlocked.includes(p.category)) progress.inventory[p.id] = 0;
    }
    if (key === "refundValid" || key === "refundInvalid") {
      const item = PRODUCTS.find((x) => x.id === "tissue") || PRODUCTS.find((x) => !!returnPolicy(x));
      const sale = { id: "dev-sale", receipt: "KK-00001", day: progress.day - 1, productId: item.id, grams: 1e3, paid: item.price, cost: Math.max(1, Math.floor(item.price * 0.6)), returned: false };
      progress.sales = [sale];
      session.index = 2;
      customer.returnId = sale.id;
      customer.kind = "return";
      customer.returnClaim = { receipt: sale.receipt, day: sale.day, productId: sale.productId, quantity: 1, paid: sale.paid };
      customer.returnReason = returnPolicy(item)?.reason || "Saya mahu pulangkan barang.";
      customer.returnCondition = returnPolicy(item)?.condition || "Masih berbungkus";
      if (key === "refundInvalid") customer.returnClaim.receipt = "KK-99999";
      customer.items = [{ ...item, grams: 1e3, uid: "dev-return", scanned: false }];
      customer.total = sale.paid;
      customer.method = "cash";
      customer.tender = 0;
      customer.discount = 0;
      customer.hasCoupon = false;
      customer.requiresPin = false;
      customer.cardFailure = false;
    }
    customer.elapsed = 0;
    customer.paid = false;
    phase = "scan";
    busy = false;
    advancePending = false;
    paymentMinimized = false;
    if (["kitafood", "kitafoodLate"].includes(key)) {
      const o = delivery?.spawnTestOrder();
      if (o) {
        if (key === "kitafoodLate") {
          o.elapsedSeconds = o.timeLimit;
          o.deadlineAt = Date.now();
        }
        customer = { kind: "kitafood", person: delivery.personFor(o), orderId: o.id, items: [], elapsed: 0, patience: Math.max(1, Number(o.timeLimit) || 30), timedOut: false };
        phase = "delivery";
      }
    }
    scanToken++;
    renderedBasket = null;
    renderedSceneCustomer = void 0;
    resetStations();
    render();
    save();
    if ($("modal").open) $("modal").close();
    paused = false;
    explicitPause = false;
    modalKind = null;
    document.body.classList.remove("paused");
    setMobileView("counter");
    syncBackgroundMusic();
    if (phase === "delivery" && customer?.kind === "kitafood") showKitaFoodAfterArrival(customer.orderId, 1800);
    else if (key === "rushEnd") showRushEnd();
    const labels = { rush: "Rush Hour", barcode: "Barcode tidak dibaca", decline: "Kad ditolak", pin: "PIN kad", cash: "Bayaran tunai", qr: "Bayaran QR", vip: "Pelanggan VIP", refundValid: "Refund sah", refundInvalid: "Refund tidak sah", full: "Semua upgrade", kitafood: "KitaFood", kitafoodLate: "KitaFood lewat", lowStock: "Stok hampir habis", outOfStock: "Stok kosong", noPaper: "Resit habis", terminalBroken: "Terminal rosak", rushEnd: "Rush Hour tamat" };
    toast("Ujian: " + (labels[key] || "Hari " + day) + " \xB7 data sandbox sahaja");
  }
  function showDeveloperPanel() {
    if (!assertDeveloper()) return;
    openModal("developer", `<div class="modal-pad dev-panel"><div class="modal-heading"><div><div class="modal-kicker">DEVELOPER \xB7 SANDBOX</div><h2>Pusat Developer</h2></div><button id="closeDeveloperPanel" class="icon-btn" aria-label="Tutup">${icon("close")}</button></div><section class="dev-wallet" aria-label="Ubah duit Developer"><div class="dev-wallet-top"><span>DUIT KEDAI</span><strong id="devWalletBalance">${money(progress.wallet)}</strong></div><label for="devWalletAmount">Jumlah yang hendak diubah (RM)</label><div class="dev-wallet-form"><input id="devWalletAmount" type="number" min="0.01" max="1000000" step="0.01" inputmode="decimal" placeholder="Contoh: 500.00"><button type="button" id="devAddMoney" class="primary-btn">+ Tambah</button><button type="button" id="devSubtractMoney" class="secondary-btn">\u2212 Tolak</button></div><small id="devWalletHint">Nilai yang sama dipaparkan pada Duit Kedai di bahagian atas dan disimpan ke Firebase.</small></section>
 <section class="dev-money-reset" aria-label="Reset duit kedai sahaja"><div><b>Reset duit kedai</b><small>Set duit kepada RM0.00 tanpa mengubah hari, inventori, upgrade atau senario ujian.</small></div><button type="button" class="secondary-btn" id="devResetMoney">Reset duit</button></section>
 <h3>Ujian segera</h3><div class="dev-scenario-grid">
 <button data-dev-scenario="cash"><span class="dev-scenario-art">${icon("cash")}</span> <b>Bayar tunai</b><small>Kira baki sendiri</small></button>
 <button data-dev-scenario="pin"><span class="dev-scenario-art">${icon("card")}</span> <b>Kad + PIN</b><small>Masukkan PIN</small></button>
 <button data-dev-scenario="decline"><span class="dev-scenario-art">${icon("close")}</span> <b>Kad ditolak</b><small>Baki tidak cukup</small></button>
 <button data-dev-scenario="qr"><span class="dev-scenario-art">${icon("qr")}</span> <b>Imbas QR</b><small>Bayaran e-wallet</small></button>
 <button data-dev-scenario="barcode"><span class="dev-scenario-art">${icon("scan")}</span> <b>Barcode rosak</b><small>Masukkan kod manual</small></button>
 <button data-dev-scenario="rush"><span class="dev-scenario-art">${icon("spark")}</span> <b>Rush Hour</b><small>30s \xB7 10s sabar \xB7 mesin tahap 5</small></button>
 <button data-dev-scenario="refundValid"><span class="dev-scenario-art">${icon("undo")}</span> <b>Refund sah</b><small>Resit sepadan</small></button>
 <button data-dev-scenario="refundInvalid"><span class="dev-scenario-art">${icon("help")}</span> <b>Refund salah</b><small>Resit tidak sepadan</small></button>
 <button data-dev-scenario="vip"><span class="dev-scenario-art">${icon("user")}</span> <b>Pelanggan VIP</b><small>Cabaran tip</small></button>
 <button data-dev-scenario="full"><span class="dev-scenario-art">${icon("settings")}</span> <b>Semua upgrade</b><small>Inventori & peralatan penuh</small></button>
 <button data-dev-scenario="kitafood"><span class="dev-scenario-art">${icon("delivery")}</span> <b>KitaFood</b><small>Rider tiba di kaunter</small></button>
 <button data-dev-scenario="kitafoodLate"><span class="dev-scenario-art">${icon("clock")}</span> <b>Pesanan lewat</b><small>Uji tanpa bonus</small></button>
 <button data-dev-scenario="lowStock"><span class="dev-scenario-art">${icon("basket")}</span> <b>Stok rendah</b><small>Tinggal 1 unit / 1 kg</small></button>
 <button data-dev-scenario="outOfStock"><span class="dev-scenario-art">${icon("close")}</span> <b>Stok kosong</b><small>Uji inventori habis</small></button>
 <button data-dev-scenario="noPaper"><span class="dev-scenario-art">${icon("receipt")}</span> <b>Resit habis</b><small>Uji kertas kosong</small></button>
 <button data-dev-scenario="terminalBroken"><span class="dev-scenario-art">${icon("settings")}</span> <b>Terminal rosak</b><small>Uji pembaikan kad</small></button>
 <button data-dev-scenario="rushEnd"><span class="dev-scenario-art">${icon("flag")}</span> <b>Rush Hour tamat</b><small>Uji laporan khas</small></button>
 </div>
 <h3>Kawalan inventori & tahap kedai</h3>
 <div class="dev-controls-grid">
  <button class="secondary-btn" id="devUnlockAll">Buka semua 20 kategori</button>
  <button class="secondary-btn" id="devLockCategories">Kunci kategori tambahan</button>
  <button class="secondary-btn" id="devMaxUpgrades">Maksimumkan upgrade</button>
  <button class="secondary-btn" id="devResetUpgrades">Reset semua upgrade</button>
  <button class="secondary-btn" id="devRefillAll">Penuhkan semua stok</button>
  <button class="secondary-btn" id="devRepairAll">Baiki terminal & tambah resit</button>
 </div>
 <div class="dev-stock-tool"><label for="devStockProduct">Uji stok mengikut produk</label><select id="devStockProduct" aria-label="Pilih produk untuk ubah stok">${CATEGORIES.map((c) => `<optgroup label="${c.name}">${PRODUCTS.filter((p) => p.category === c.id).map((p) => `<option value="${p.id}">${p.name}${p.weighted ? " (kg)" : ""}</option>`).join("")}</optgroup>`).join("")}</select><div class="dev-stock-row"><input id="devStockAmount" type="number" min="0" max="1000" step="1" value="5" inputmode="numeric" aria-label="Jumlah stok (unit atau kg)"><button type="button" class="primary-btn" id="devSetStock">Tetapkan stok</button></div><small>Untuk hasil segar, nilai stok dikira dalam kilogram. Tindakan mengubah sandbox sahaja.</small></div>
 <h3>Audit Firebase</h3><div class="dev-audit"><p>Semak simpanan sebenar melalui bacaan semula Realtime Database. Data ujian tidak akan bercampur dengan progres kerjaya.</p><button id="devVerifyFirebase" class="primary-btn">Simpan & semak Firebase</button><div id="devAuditResult" role="status" aria-live="polite">Belum diuji pada sesi ini.</div></div>
 <h3>Ujian hari permainan</h3><div class="dev-day-input"><label for="developerDay">Hari (1\u201360)</label><input id="developerDay" type="number" min="1" max="60" value="${progress.day}"><button id="devRunDay" class="primary-btn">Buka hari</button></div><section class="dev-data-reset" aria-label="Reset keseluruhan data ujian"><div><b>Reset semua data ujian</b><small>Padam progres ujian sahaja termasuk hari, inventori, upgrade dan duit kedai. Akaun Firebase kekal.</small></div><button type="button" class="secondary-btn" id="devClearSandbox">Reset data ujian</button></section><p id="devResetError" class="dev-reset-error" role="alert" aria-live="polite"></p></div>`);
    $("closeDeveloperPanel").onclick = closeModal;
    async function storeDeveloperWallet(next, action) {
      if (!assertDeveloper()) return;
      if (!Number.isSafeInteger(next) || next < 0 || next > 1e9) {
        toast("Jumlah duit tidak sah.", true);
        return;
      }
      const controls = [$("devAddMoney"), $("devSubtractMoney"), $("devResetMoney"), $("devClearSandbox")];
      controls.forEach((x) => x.disabled = true);
      const hint = $("devWalletHint");
      hint.textContent = "Menyimpan " + action + " ke Firebase\u2026";
      const snapshot = captureGame();
      const fresh = { ...snapshot, progress: { ...snapshot.progress, wallet: next } };
      try {
        await cloud.resetProgress(fresh);
        progress.wallet = next;
        renderHeader();
        $("devWalletBalance").textContent = money(progress.wallet);
        hint.textContent = "\u2713 " + action + " disimpan. Duit Kedai sama dengan paparan utama.";
        $("devWalletAmount").value = "";
        toast(action + " \xB7 " + money(next));
      } catch (error) {
        hint.textContent = "\u26A0 Simpanan gagal. Duit kedai tidak diubah. " + String(error?.message || "Cuba semula.");
        toast("Tidak dapat menyimpan duit kedai. Cuba semula.", true);
      } finally {
        controls.forEach((x) => x.disabled = false);
      }
    }
    for (const [buttonId, sign] of [["devAddMoney", 1], ["devSubtractMoney", -1]]) {
      $(buttonId).onclick = async () => {
        if (!assertDeveloper()) return;
        const raw = $("devWalletAmount").value.trim();
        if (!/^(?:\d{1,7})(?:\.\d{1,2})?$/.test(raw)) {
          toast("Masukkan amaun RM0.01 hingga RM1,000,000.00 (maksimum dua perpuluhan).", true);
          return;
        }
        const cents = Math.round(Number(raw) * 100);
        if (cents < 1 || cents > 1e8) {
          toast("Amaun mestilah RM0.01 hingga RM1,000,000.00.", true);
          return;
        }
        const next = progress.wallet + sign * cents;
        if (next < 0) {
          toast("Duit kedai tidak mencukupi untuk ditolak.", true);
          return;
        }
        await storeDeveloperWallet(next, sign > 0 ? "Tambah duit" : "Tolak duit");
      };
    }
    $("devResetMoney").onclick = async () => {
      if (!assertDeveloper()) return;
      await storeDeveloperWallet(0, "Reset duit kedai");
    };
    $("modalContent").querySelectorAll("[data-dev-scenario]").forEach((btn) => btn.onclick = () => runDeveloperScenario(btn.dataset.devScenario));
    $("devRunDay").onclick = () => runDeveloperScenario("day", Number($("developerDay").value));
    function developerEdit(change, description) {
      if (!assertDeveloper()) return;
      change();
      ensureOperations(progress);
      render();
      save();
      toast(description + " \xB7 menyimpan sandbox Firebase");
    }
    $("devUnlockAll").onclick = () => developerEdit(() => {
      progress.unlocked = CATEGORIES.map((c) => c.id);
      for (const p of PRODUCTS) if (!progress.inventory[p.id]) progress.inventory[p.id] = stockTarget(p, progress);
    }, "Semua kategori dibuka");
    $("devLockCategories").onclick = () => developerEdit(() => {
      progress.unlocked = ["essentials"];
    }, "Kategori tambahan dikunci");
    $("devMaxUpgrades").onclick = () => developerEdit(() => {
      for (const u of UPGRADES) progress.upgrades[u.id] = u.max;
    }, "Upgrade dimaksimumkan");
    $("devResetUpgrades").onclick = () => developerEdit(() => {
      for (const u of UPGRADES) progress.upgrades[u.id] = 0;
    }, "Upgrade direset");
    $("devRefillAll").onclick = () => developerEdit(() => {
      for (const p of PRODUCTS) progress.inventory[p.id] = stockTarget(p, progress);
    }, "Semua stok penuh");
    $("devRepairAll").onclick = () => developerEdit(() => {
      progress.paper = 120;
      progress.cardHealth = 100;
      progress.cardBroken = false;
    }, "Bekalan dan terminal dipulihkan");
    $("devSetStock").onclick = () => {
      const id = $("devStockProduct").value, p = PRODUCTS.find((p2) => p2.id === id), raw = $("devStockAmount").value;
      if (!p || !/^\d{1,4}$/.test(raw) || Number(raw) > 1e3) {
        toast("Masukkan kuantiti sah antara 0\u20131000.", true);
        return;
      }
      developerEdit(() => {
        progress.inventory[p.id] = Number(raw) * (p.weighted ? 1e3 : 1);
      }, p.name + " \xB7 " + raw + (p.weighted ? " kg" : " unit"));
    };
    $("devVerifyFirebase").onclick = async () => {
      const button = $("devVerifyFirebase"), out = $("devAuditResult");
      button.disabled = true;
      out.textContent = "Menyimpan kemudian membaca data dari Firebase\u2026";
      try {
        save();
        await cloud.flush();
        const result = await cloud.verifyFirebase();
        out.textContent = `\u2713 Disahkan Firebase \xB7 Hari ${result.day} \xB7 Duit ${money(result.wallet)} \xB7 ${result.items} rekod inventori \xB7 ${result.categories} kategori dibuka \xB7 ${result.upgrades} jenis upgrade \xB7 ${result.delivery} pesanan KitaFood \xB7 ${result.developer ? "Sandbox ujian" : "Kerjaya"}`;
        toast("Bacaan semula Firebase berjaya.");
      } catch (err) {
        out.textContent = "\u26A0 Pengesahan gagal: " + String(err?.message || "Tidak dapat mencapai Firebase.");
        toast("Simpanan Firebase belum dapat disahkan.", true);
      } finally {
        button.disabled = false;
      }
    };
    $("devClearSandbox").onclick = async () => {
      if (!assertDeveloper()) return;
      const controls = [$("devAddMoney"), $("devSubtractMoney"), $("devResetMoney"), $("devClearSandbox")];
      controls.forEach((x) => x.disabled = true);
      const error = $("devResetError");
      if (error) error.textContent = "";
      const fresh = { progress: createProgress(), session: null, sound };
      try {
        await cloud.resetProgress(fresh);
        scanToken++;
        clearTimeout(resultTimer);
        stopScannerSound();
        stopScaleSound();
        stopDrawerSound();
        stopChaChing();
        explicitPause = true;
        hydrateGame(fresh);
        render();
        save();
        toast("Data ujian disahkan reset dalam Firebase. Buka kedai untuk Hari 1.");
      } catch (error2) {
        if ($("devResetError")) $("devResetError").textContent = "Reset data ujian gagal. " + String(error2?.message || "Cuba semula.");
        toast("Reset data ujian gagal.", true);
      } finally {
        controls.forEach((x) => {
          if (x) x.disabled = false;
        });
      }
    };
  }
  developerAccessChanged(false);
  cloud = createCloudSync({
    capture: captureGame,
    hydrate: hydrateGame,
    pauseForAccount: () => {
      if (!paused && modalKind !== "intro") showPause();
    },
    report: (label) => {
      if ($("saveStatus")) $("saveStatus").textContent = label;
    },
    onDeveloperChanged: developerAccessChanged
  });
  delivery = createDelivery({ getProgress: () => progress, getSession: () => session, getMode: () => mode, save, notify: toast, money, products: PRODUCTS, categories: CATEGORIES, productArt, icon, openModal, closeModal, receiveCash: receiveStoreCash, isClockPaused: () => mode !== "career" || !session || phase !== "delivery" || document.hidden || $("accountOverlay").open || explicitPause || paused && modalKind !== "delivery", onFinish: (order, completed) => {
    if (customer?.kind === "kitafood" && customer.orderId === order.id) {
      syncShiftClockToCustomerCount();
      scanToken++;
      customer = null;
      phase = "waiting";
      renderedSceneCustomer = void 0;
      renderedBasket = null;
      session.index++;
      session.waitSeconds = 0;
      save();
      if (mode === "career" && session.rushReportPending && showRushEnd()) return;
      if (mode === "career" && beginDailyRush()) return;
      if (mode === "career" && dayFinished(session, progress.day)) {
        phase = "end";
        save();
        render();
        showShiftClosing();
      } else newCustomer();
      toast(completed ? "Pesanan KitaFood selesai. Pelanggan seterusnya tiba!" : "Rider beredar. Sambung layan pelanggan.");
    } else {
      renderHeader();
    }
  } });
  initIllustrations();
  icons();
  renderHeader();
  renderScene();
  renderProducts();
  renderPayment();
  showIntro();
  $("developerPanelBtn").onclick = () => {
    if (assertDeveloper()) showDeveloperPanel();
  };
  $("deliveryBtn").onclick = () => delivery.open(customer?.kind === "kitafood" ? customer.orderId : void 0);
  $("inventoryBtn").onclick = () => showInventory();
  $("calcBtn").onclick = showCalculator;
  $("missionBtn").onclick = showMissions;
  $("catalogueBtn").onclick = () => showCodePad();
  $("settingsBtn").onclick = showSettings;
  $("bagZone").onclick = showBag;
  $("nightBtn").onclick = toggleDark;
  $("undoScanBtn").onclick = undoScan;
  $("counterTab").onclick = () => setMobileView("counter");
  $("paymentTab").onclick = () => setMobileView("payment");
  $("soundBtn").onclick = () => {
    sound = !sound;
    if (!sound) {
      stopScannerSound();
      stopChaChing();
      stopScaleSound();
      stopDrawerSound();
    }
    renderHeader();
    save();
  };
  $("pauseBtn").onclick = () => {
    if ($("modal").open) {
      if (!["intro", "summary", "rush-start", "rush-end"].includes(modalKind)) closeModal();
    } else showPause();
  };
  $("shopBtn").onclick = () => {
    if (modalKind === "intro") return;
    showShop();
  };
  $("fullBtn").onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast("Ajukan peranti secara melintang untuk ruang lebih luas.");
    } catch {
      toast("Skrin penuh tidak disokong di pelayar ini.");
    }
  };
  $("scannerZone").onclick = () => {
    if (paused) return;
    toast("Tekan barang berbungkus atau seret ke scanner.");
  };
  $("scaleZone").onclick = () => {
    if (paused) return;
    toast("Tekan hasil segar atau seret ke penimbang.");
  };
  $("modal").addEventListener("cancel", (e) => {
    e.preventDefault();
    if (!["intro", "summary", "rush-start", "rush-end"].includes(modalKind)) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    const categoryDialog = document.getElementById("categoryProductDialog");
    if (categoryDialog?.open && (e.key === "Escape" || e.key.toLowerCase() === "p")) {
      e.preventDefault();
      if (e.key === "Escape") categoryDialog.close();
      return;
    }
    const editing = e.target?.matches?.('input, textarea, select, [contenteditable="true"]');
    if (editing && e.key !== "Escape") return;
    if (handleCalculatorKey(e) || handlePaymentOverlayKey(e)) return;
    if (e.key === "Escape" || e.key.toLowerCase() === "p") {
      if (e.key.toLowerCase() === "p" && $("modal").open && modalKind !== "pause") {
        e.preventDefault();
        return;
      }
      if ($("modal").open) {
        if (!["intro", "summary", "rush-start", "rush-end"].includes(modalKind)) {
          e.preventDefault();
          closeModal();
        }
      } else {
        e.preventDefault();
        showPause();
      }
      return;
    }
    if (!paused && phase === "offer" && customer?.cardStage === "pin" && (/^\d$/.test(e.key) || ["Backspace", "Enter"].includes(e.key))) {
      e.preventDefault();
      pressPin(e.key === "Backspace" ? "\u232B" : e.key === "Enter" ? "OK" : e.key);
      return;
    }
    if (!paused && !editing && /^[1-9]$/.test(e.key) && customer) {
      const p = (Array.isArray(customer.items) ? customer.items : []).filter((p2) => !p2.scanned)[+e.key - 1];
      if (p) processItem(p.uid);
    }
  });
  document.addEventListener("visibilitychange", () => {
    delivery?.syncClock();
    if (document.hidden) {
      save();
      cloud?.flush?.().catch(() => {
      });
      if (!paused) showPause();
    }
    syncBackgroundMusic();
  });
  window.addEventListener("pagehide", () => {
    if (!paused) showPause();
    save();
    cloud?.flush?.().catch(() => {
    });
    musicUnlocked = false;
    musicFade = null;
    musicTarget = 0;
    writeMusicLevel(0);
    $("backgroundMusic").pause();
    stopScannerSound();
    stopChaChing();
    stopScaleSound();
    stopDrawerSound();
  });
  window.addEventListener("pageshow", () => {
    if (session && modalKind !== "intro") {
      musicUnlocked = true;
      syncBackgroundMusic();
    }
  });
  var lastTick = performance.now();
  var sinceSave = 0;
  function loop(now) {
    const dt = Math.min((now - lastTick) / 1e3, 0.1);
    lastTick = now;
    if (!paused && !document.hidden && session && phase !== "end") {
      if (mode !== "practice") {
        tickShiftClock(dt);
        renderOperations();
        sinceSave += dt;
        if (sinceSave > 5) {
          save();
          sinceSave = 0;
        }
      }
      if (mode === "career" && session.rushReportPending && !session.rushReportShown) {
        finishRushNow();
        requestAnimationFrame(loop);
        return;
      }
      if (mode === "career" && tickRushHour(session, dt)) {
        session.rushReportPending = true;
        finishRushNow();
        requestAnimationFrame(loop);
        return;
      }
      if (mode === "career" && phase !== "delivery" && !session.rushStarted && beginDailyRush()) {
        requestAnimationFrame(loop);
        return;
      }
      if (phase === "waiting") {
        session.waitSeconds = Math.max(0, session.waitSeconds - dt);
        renderWaiting();
        if (session.waitSeconds <= 0) newCustomer();
      } else if (phase === "supply" && readyForCustomer()) newCustomer();
      else if (customer && mode !== "practice" && phase === "scan") {
        customer.elapsed += dt;
        renderPatience();
        if (customer.elapsed >= customer.patience) loseCustomer();
      } else if (customer && mode !== "practice" && phase === "delivery") {
        renderPatience();
        if (kitaFoodSecondsRemaining(kitaFoodOrderState(customer.orderId)) <= 0) handleKitaFoodTimeout();
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function initIllustrations() {
    const pool = availableProducts(mode === "practice" ? CATEGORIES.map((c) => c.id) : progress.unlocked);
    const shelves = ["shelfLeft", "shelfRight"].map((id, n) => [id, Array.from({ length: 12 }, (_, i) => pool[(i + n * 12) % pool.length].id)]);
    for (const [id, items] of shelves) $(id).innerHTML = [0, 1, 2].map((row) => "<div>" + items.slice(row * 4, row * 4 + 4).map((p) => productArt(p)).join("") + "</div>").join("");
  }
  function applySettings() {
    applyMachineSpeeds();
    const settings = progress.settings || { motion: true, theme: "mint" };
    document.body.classList.toggle("reduced-motion", settings.motion === false);
    document.body.setAttribute("data-theme", previewTheme || (settings.dark ? "dark" : settings.theme || "mint"));
    $("nightBtn").setAttribute("aria-pressed", String(!!settings.dark));
    $("nightLabel").textContent = settings.dark ? "Cerah" : "Gelap";
  }
  function renderActivity() {
    const status = $("activityStatus");
    if (!status) return;
    if (!customer) {
      status.textContent = phase === "supply" ? "Tambah bekalan kedai" : "Menunggu pelanggan";
      status.classList.remove("vip");
      return;
    }
    const left = (customer.items || []).filter((p) => !p.scanned).length;
    status.textContent = phase === "success" ? "Transaksi selesai \xB7 combo \xD7" + combo : customer.kind === "vip" ? "VIP di kaunter \xB7 tip \xD71.5" : customer.kind === "express" ? "Pelanggan ekspres \xB7 servis pantas" : left ? left + " barang lagi \xB7 " + (session?.scans || 0) + " scan hari ini" : "Semua barang sudah dibungkus";
    status.classList.toggle("vip", customer.kind === "vip");
  }
  function undoScan() {
    if (!customer || busy || phase !== "scan") return;
    const p = customer.items.filter((i) => i.scanned).sort((a, b) => (b.scanOrder || 0) - (a.scanOrder || 0))[0];
    if (!p) return;
    if (p.weighted) resetStations();
    p.scanned = false;
    customer.discount = 0;
    customer.couponApplied = false;
    session.scans = Math.max(0, (session.scans || 0) - 1);
    if (p.weighted) session.weighed = Math.max(0, (session.weighed || 0) - 1);
    renderProducts();
    renderReceipt();
    renderPayment();
    renderHeader();
    renderActivity();
    setMobileView("counter");
    save();
    toast("Scan " + p.name + " dibatalkan. Barang kembali tersedia.");
  }
  function showBag() {
    if (!customer || modalKind === "intro") return;
    const packed = customer.items.filter((i) => i.scanned);
    openModal("bag", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">SEMAK SEBELUM PELANGGAN BALIK</div><h2>Dalam beg belian.</h2></div><button class="icon-btn" id="closeBag" aria-label="Tutup">${icon("close")}</button></div><p>${packed.length} daripada ${customer.items.length} barang sudah dibungkus.</p><div class="bag-grid">${packed.length ? packed.map((p) => `<div>${productArt(p.id)}<b>${p.name}</b><small>${p.weighted ? (p.grams / 1e3).toFixed(3) + " kg" : "1 unit"} \xB7 ${money(itemPrice(p))}</small></div>`).join("") : '<p class="muted">Beg masih kosong. Scan barang untuk memasukkannya ke sini.</p>'}</div><button class="primary-btn" id="backBag">Kembali ke kaunter ${icon("arrow")}</button></div>`);
    $("closeBag").onclick = closeModal;
    $("backBag").onclick = closeModal;
  }
  function showMissions(returnTo = "game") {
    const destination = returnTo === "summary" || modalKind === "summary" ? "summary" : "game";
    if (!session || modalKind === "intro") return;
    openModal("missions", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">CABARAN HARI ${progress.day}</div><h2>Misi & Pencapaian</h2></div><button class="icon-btn" id="closeMissions" aria-label="Tutup">${icon("close")}</button></div><p>${mode === "practice" ? "Latihan santai: ganjaran wang hanya dalam kerjaya." : "Lengkapkan misi dan tuntut ganjaran sebelum hari seterusnya."}</p><div class="mission-cards">${dailyMissions(session).map((m) => {
      const claimed = (session.claimedMissions || []).includes(m.id), ready = m.value >= m.target;
      return `<div class="mission-card ${ready ? "ready" : ""}"><span class="mission-symbol">${icon(m.id === "fresh" ? "scale" : m.id === "perfect" ? "cash" : "spark")}</span><div><h3>${m.title}</h3><p>${m.description}</p><div class="mission-track"><i style="width:${Math.min(100, m.value / m.target * 100)}%"></i></div><small>${Math.min(m.value, m.target)} / ${m.target}</small></div><button class="secondary-btn" data-mission="${m.id}" ${claimed || !ready || mode === "practice" ? "disabled" : ""}>${claimed ? "Dituntut" : money(m.reward)}</button></div>`;
    }).join("")}</div><div class="career-stats"><span><small>DUIT TERKUMPUL</small><b>${money(progress.lifetime)}</b></span><span><small>COMBO TERBAIK</small><b>\xD7${progress.bestCombo}</b></span><span><small>HARI BERMAIN</small><b>${progress.day}</b></span></div><button class="primary-btn" id="backMissions">Sambung syif ${icon("play")}</button></div>`);
    const back = () => destination === "summary" ? showSummary() : closeModal();
    $("closeMissions").onclick = back;
    $("backMissions").onclick = back;
    $("modalContent").querySelectorAll("[data-mission]").forEach((b) => b.onclick = () => {
      if (claimMission(progress, session, b.dataset.mission)) {
        save();
        renderHeader();
        beep("success");
        showMissions(destination);
        toast("Ganjaran misi masuk ke duit kedai!");
      }
    });
  }
  function showCalculator() {
    if (!session || modalKind === "intro" || modalKind === "summary") return;
    const panel = $("floatingCalculator");
    panel.hidden = false;
    panel.innerHTML = `<div class="floating-calc-header"><div id="calcDragHandle" role="button" tabindex="0" aria-label="Seret kalkulator. Gunakan kekunci anak panah untuk mengalihkannya.">${icon("calculator")}<b>Kalkulator</b><span>\u283F</span></div><button id="closeCalculator" class="icon-btn" aria-label="Tutup kalkulator">${icon("close")}</button></div><div class="floating-calc-body"><div class="calc-screen"><small id="calcExpression">${calculatorInput || "PEMBANTU JURUWANG"}</small><strong id="calcDisplay">${calculatorResult || calculatorInput || "0"}</strong></div><div class="calc-presets"><button id="calcTotal">Jumlah</button><button id="calcTender">Diterima</button><button id="calcChange">Baki</button></div><div class="calc-keys">${["C", "\u232B", "\xF7", "\xD7", "7", "8", "9", "\u2212", "4", "5", "6", "+", "1", "2", "3", "=", "0", ".", "00"].map((k) => `<button data-calc="${k}" class="${k === "=" ? "equals" : ""}">${k}</button>`).join("")}</div></div>`;
    $("closeCalculator").onclick = closeCalculator;
    panel.querySelectorAll("[data-calc]").forEach((b) => b.onclick = () => pressCalculator(b.dataset.calc));
    function preset(expression, result = "") {
      calculatorInput = expression;
      calculatorResult = result;
      updateCalculatorDisplay();
    }
    $("calcTotal").onclick = () => {
      if (customer) preset((amountDue(customer) / 100).toFixed(2));
    };
    $("calcTender").onclick = () => {
      if (customer?.method === "cash" && customer.kind !== "return") preset((customer.tender / 100).toFixed(2));
    };
    $("calcChange").onclick = () => {
      if (customer?.method === "cash" && customer.kind !== "return") preset((customer.tender / 100).toFixed(2) + "\u2212" + (amountDue(customer) / 100).toFixed(2), String((customer.tender - amountDue(customer)) / 100));
    };
    refreshCalculatorPresets();
    updateCalculatorDisplay();
    if (!calculatorPosition) calculatorPosition = preferredCalculatorPosition(panel);
    positionCalculator(calculatorPosition.x, calculatorPosition.y);
    const handle = $("calcDragHandle");
    handle.onpointerdown = (e) => {
      if (e.button > 0) return;
      const r = panel.getBoundingClientRect();
      calculatorDrag = { pointer: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top, moved: false };
      handle.setPointerCapture(e.pointerId);
      panel.classList.add("dragging");
      e.preventDefault();
    };
    handle.onpointermove = (e) => {
      const d = calculatorDrag;
      if (!d || d.pointer !== e.pointerId) return;
      d.moved ||= Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4;
      positionCalculator(d.left + e.clientX - d.x, d.top + e.clientY - d.y);
    };
    handle.onpointerup = (e) => {
      if (calculatorDrag?.pointer === e.pointerId) e.preventDefault();
      cancelCalculatorDrag();
    };
    handle.onpointercancel = cancelCalculatorDrag;
    handle.onclick = (e) => {
      if (calculatorDrag?.moved) e.preventDefault();
    };
    handle.onkeydown = (e) => {
      const step = e.shiftKey ? 30 : 10, moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) {
        e.preventDefault();
        const [x, y] = moves[e.key];
        positionCalculator(calculatorPosition.x + x, calculatorPosition.y + y);
      }
    };
  }
  function isCompactPhoneLayout() {
    return Math.min(window.innerWidth || 0, window.innerHeight || 0) < 520 || window.innerWidth <= 760;
  }
  function preferredCalculatorPosition(panel = $("floatingCalculator")) {
    const w = window.innerWidth || 390, h = window.innerHeight || 844;
    if (isCompactPhoneLayout()) return { x: 8, y: Math.max(8, h - (panel?.getBoundingClientRect().height || 320) - 8) };
    return { x: 18, y: Math.max(12, h - (panel?.getBoundingClientRect().height || 320) - 20) };
  }
  function closeCalculator() {
    const panel = $("floatingCalculator");
    if (!panel) return;
    panel.hidden = true;
    cancelCalculatorDrag();
  }
  function cancelCalculatorDrag() {
    calculatorDrag = null;
    $("floatingCalculator")?.classList.remove("dragging");
  }
  function positionCalculator(x, y) {
    const panel = $("floatingCalculator");
    if (panel.hidden) return;
    const r = panel.getBoundingClientRect(), w = window.innerWidth || 1024, h = window.innerHeight || 768;
    const margin = isCompactPhoneLayout() ? 8 : 12;
    calculatorPosition = { x: isCompactPhoneLayout() ? margin : Math.max(margin, Math.min(Math.max(margin, w - r.width - margin), x)), y: Math.max(margin, Math.min(Math.max(margin, h - r.height - margin), y)) };
    if (panel.style.left !== "0px") panel.style.left = "0px";
    if (panel.style.top !== "0px") panel.style.top = "0px";
    panel.style.transform = `translate3d(${calculatorPosition.x}px,${calculatorPosition.y}px,0)`;
    panel.style.setProperty("--calc-x", calculatorPosition.x + "px");
    panel.style.setProperty("--calc-y", calculatorPosition.y + "px");
  }
  function refreshCalculatorPresets() {
    if ($("floatingCalculator")?.hidden || !$("calcTender")) return;
    const cash = customer?.method === "cash" && customer.kind !== "return";
    $("calcTotal").disabled = !customer;
    $("calcTender").disabled = !cash;
    $("calcChange").disabled = !cash;
  }
  function updateCalculatorDisplay() {
    if (!$("calcDisplay")) return;
    $("calcExpression").textContent = calculatorResult ? calculatorInput + " =" : "Kalkulator cashier";
    $("calcDisplay").textContent = calculatorResult || calculatorInput || "0";
  }
  function pressCalculator(k) {
    if (k === "C") {
      calculatorInput = "";
      calculatorResult = "";
    } else if (k === "\u232B") {
      calculatorInput = calculatorInput.slice(0, -1);
      calculatorResult = "";
    } else if (k === "=") {
      try {
        calculatorResult = String(calculateExpression(calculatorInput));
      } catch (e) {
        toast(e.message, true);
      }
    } else {
      if (calculatorResult) {
        calculatorInput = /[÷×−+]/.test(k) ? calculatorResult : "";
        calculatorResult = "";
      }
      if (calculatorInput.length + k.length <= 32) calculatorInput += k;
    }
    updateCalculatorDisplay();
  }
  function handleCalculatorKey(e) {
    const panel = $("floatingCalculator");
    if (!panel || panel.hidden || $("modal").open) return false;
    if (e.key === "Escape") {
      e.preventDefault();
      closeCalculator();
      return true;
    }
    if (!e.target?.closest?.("#floatingCalculator")) return false;
    const mapped = { "*": "\xD7", "/": "\xF7", "-": "\u2212", "Enter": "=", "Backspace": "\u232B", "Delete": "C" };
    if (/^\d$/.test(e.key) || [".", "+", "*", "/", "-", "Enter", "Backspace", "Delete"].includes(e.key)) {
      if (e.key === "Enter" && e.target.tagName === "BUTTON") return false;
      e.preventDefault();
      pressCalculator(mapped[e.key] || e.key);
      playTapSound();
      return true;
    }
    return false;
  }
  function productCode(p) {
    return /^\d{4}$/.test(p.manualCode || "") ? p.manualCode : p.manualCode = randomManualCode();
  }
  function showCodePad(uid = null) {
    if (!session || modalKind === "intro") return;
    if (!customer) {
      showCatalogue();
      return;
    }
    const selected = customer.items.find((p) => p.uid === uid && !p.scanned);
    selectedCodeItem = selected?.uid || null;
    if (!selected) {
      showCatalogue();
      return;
    }
    const code = productCode(selected);
    if (selected.damaged && !selected.repaired) {
      $("scannerStatus").textContent = "Barcode rosak \xB7 masukkan kod pada label";
    }
    openModal("codes", `<div class="modal-pad manual-code-modal"><div class="modal-heading"><div><div class="modal-kicker">LABEL BARCODE ROSAK</div><h2>Masukkan kod pada barang.</h2></div><button class="icon-btn" id="closeCodes" aria-label="Tutup">${icon("close")}</button></div><div class="manual-item">${productArt(selected.id)}<div><b>${selected.name}</b><small>Salin kod rawak pada label gantian ini.</small><div class="broken-barcode" aria-label="Barcode koyak dan tidak boleh dibaca"><i></i><b>BARCODE ROSAK</b></div><strong class="random-code-label">${code}</strong></div></div><form id="manualForm" class="manual-entry"><input id="manualCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="4 digit pada label" aria-label="Kod rawak pada barang" autocomplete="off"><button class="primary-btn" type="submit">Scan kod ${icon("scan")}</button></form><p id="codeError" class="code-error" aria-live="polite"></p><div class="manual-keypad">${["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "\u232B"].map((k) => `<button type="button" data-manual-key="${k}">${k}</button>`).join("")}</div><p class="muted">Kod ini khas untuk barang ini sahaja. Barang lain akan menerima kod berbeza.</p></div>`);
    $("closeCodes").onclick = closeModal;
    $("modalContent").querySelectorAll("[data-manual-key]").forEach((b) => b.onclick = () => {
      const input = $("manualCode"), k = b.dataset.manualKey;
      if (k === "C") input.value = "";
      else if (k === "\u232B") input.value = input.value.slice(0, -1);
      else if (input.value.length < 4) input.value += k;
    });
    $("manualForm").onsubmit = (e) => {
      e.preventDefault();
      if ($("manualCode").value.trim() !== code) {
        $("codeError").textContent = "Kod tidak sepadan dengan label. Cuba semula.";
        beep("error");
        return;
      }
      selected.repaired = true;
      closeModal();
      processItem(selected.uid, null, true);
    };
  }
  function showSettings() {
    if (!session || modalKind === "intro") return;
    const settings = progress.settings || { motion: true, theme: "mint" };
    openModal("settings", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KEDAI IKUT GAYA ANDA</div><h2>Tetapan Permainan</h2></div><button class="icon-btn" id="closeSettings" aria-label="Tutup">${icon("close")}</button></div><div class="setting-row"><div><b>Semua bunyi</b><small>Aktifkan atau senyapkan audio game.</small></div><button class="toggle ${sound ? "on" : ""}" id="toggleSound" aria-label="Efek bunyi" aria-pressed="${sound}"><i></i></button></div><div class="sound-settings"><label for="soundVolume">Volume efek bunyi <b id="volumeLabel">${Math.round(audioVolume() * 100)}%</b></label><input id="soundVolume" type="range" min="0" max="100" step="5" value="${Math.round(audioVolume() * 100)}" aria-label="Kekuatan bunyi"></div>${effectSettingsHTML()}${musicSettingsHTML()}<div class="setting-row"><div><b>Animasi penuh</b><small>Gerakan produk, pelanggan dan konfeti.</small></div><button class="toggle ${settings.motion !== false ? "on" : ""}" id="toggleMotion" aria-label="Animasi penuh" aria-pressed="${settings.motion !== false}"><i></i></button></div><div class="theme-heading">Warna kedai</div><button class="secondary-btn" id="openStyles">Preview & beli warna kedai</button><p class="muted">Mod santai tidak mengubah progres kerjaya.</p><section class="game-reset-compact" aria-label="Pengurusan progres"><div><strong>Reset progres</strong><small>Mulakan semula dari Hari 1. Akaun log masuk kekal.</small></div><button type="button" class="secondary-btn" id="openResetGame">Reset</button></section></div>`);
    bindEffectSettings();
    bindMusicSettings();
    $("closeSettings").onclick = closeModal;
    $("soundVolume").oninput = () => {
      progress.settings.volume = Number($("soundVolume").value) / 100;
      $("volumeLabel").textContent = Math.round(audioVolume() * 100) + "%";
      refreshEffectLevels();
      save();
    };
    $("toggleSound").onclick = () => {
      sound = !sound;
      if (!sound) {
        stopScannerSound();
        stopChaChing();
        stopScaleSound();
        stopDrawerSound();
      }
      save();
      renderHeader();
      showSettings();
    };
    $("toggleMotion").onclick = () => {
      progress.settings ??= { theme: "mint", motion: true };
      progress.settings.motion = progress.settings.motion === false;
      applySettings();
      save();
      showSettings();
    };
    $("openStyles").onclick = () => showStyles();
    $("openResetGame").onclick = showResetGameConfirm;
  }
  function openSafeResetFlow({ title, description, onCancel, onExecute }) {
    const first = 2 + Math.floor(Math.random() * 8), second = 2 + Math.floor(Math.random() * 8);
    openModal("reset-challenge", `<div class="modal-pad reset-security"><div class="modal-heading"><div><div class="modal-kicker">PENGESAHAN 1 DARIPADA 2</div><h2>Semak sebelum reset.</h2></div><button class="icon-btn" id="cancelResetX" aria-label="Batal">${icon("close")}</button></div><p class="muted">Untuk meneruskan <b>${title}</b>, jawab soalan ringkas ini dahulu. Tiada data akan dipadam pada langkah ini.</p><form id="resetMathForm" class="reset-math-form"><label for="resetMathAnswer">Berapakah ${first} \xD7 ${second}?</label><input id="resetMathAnswer" type="number" inputmode="numeric" min="0" max="100" step="1" required placeholder="Masukkan jawapan" autocomplete="off"><p class="reset-error" id="resetMathError" role="alert" aria-live="polite"></p><div class="reset-actions"><button type="button" class="secondary-btn" id="cancelResetGame">Batal</button><button type="submit" class="primary-btn">Semak jawapan ${icon("arrow")}</button></div></form></div>`);
    const cancel = () => onCancel();
    $("cancelResetX").onclick = cancel;
    $("cancelResetGame").onclick = cancel;
    $("resetMathForm").onsubmit = (event) => {
      event.preventDefault();
      if (Number($("resetMathAnswer").value) !== first * second || !$("resetMathAnswer").value.trim()) {
        $("resetMathError").textContent = "Jawapan tidak tepat. Cuba sekali lagi.";
        beep("error");
        return;
      }
      $("modalContent").innerHTML = `<div class="modal-pad reset-security"><div class="modal-heading"><div><div class="modal-kicker">PENGESAHAN 2 DARIPADA 2</div><h2>Setuju untuk reset?</h2></div><button class="icon-btn" id="cancelResetX" aria-label="Batal">${icon("close")}</button></div><div class="reset-warning"><span class="reset-warning-symbol">${icon("help")}</span><div><b>${title}</b><p>${description}</p></div></div><label class="reset-confirm-label"><input type="checkbox" id="resetConfirmCheck"><span>Saya faham perubahan ini kekal dan saya bersetuju untuk meneruskannya.</span></label><p class="reset-error" id="resetError" role="alert" aria-live="polite"></p><div class="reset-actions"><button class="secondary-btn" id="cancelResetGame">Batal</button><button class="primary-btn reset-danger" id="confirmResetGame" disabled>Ya, saya setuju</button></div></div>`;
      $("cancelResetX").onclick = cancel;
      $("cancelResetGame").onclick = cancel;
      const btn = $("confirmResetGame");
      $("resetConfirmCheck").onchange = () => btn.disabled = !$("resetConfirmCheck").checked;
      btn.onclick = async () => {
        if (btn.disabled || !$("resetConfirmCheck").checked) return;
        btn.disabled = true;
        $("cancelResetGame").disabled = true;
        $("cancelResetX").disabled = true;
        btn.textContent = "Sedang menyimpan\u2026";
        try {
          await onExecute();
        } catch (error) {
          $("resetError").textContent = "Reset tidak berjaya. Data asal dikekalkan. " + String(error?.message || "Semak sambungan Firebase dan cuba lagi.");
          btn.textContent = "Cuba reset semula";
          btn.disabled = false;
          $("cancelResetGame").disabled = false;
          $("cancelResetX").disabled = false;
        }
      };
    };
  }
  function showResetGameConfirm() {
    if (modalKind !== "settings") return;
    openSafeResetFlow({
      title: "Reset progres permainan",
      description: "Hari, duit kedai, inventori, kelas, upgrade, statistik dan syif akan kembali ke tetapan asal. Akaun Firebase kekal. Tindakan ini tidak boleh dibatalkan.",
      onCancel: showSettings,
      onExecute: async () => {
        const fresh = { progress: createProgress(), session: null, sound };
        if (cloud) await cloud.resetProgress(fresh);
        else localStorage.setItem(STORAGE, JSON.stringify(fresh));
        scanToken++;
        clearTimeout(resultTimer);
        advancePending = false;
        explicitPause = true;
        closeCalculator();
        stopScannerSound();
        stopScaleSound();
        stopDrawerSound();
        stopChaChing();
        hideUpdatePrompt();
        hydrateGame(fresh);
        toast("Progres berjaya direset. Selamat datang ke Hari 1!");
      }
    });
  }
  function normalizeSession() {
    if (!session) return;
    ensureOperations(progress);
    ensureShift(session);
    if (!customer) return;
    if (customer.kind === "kitafood") {
      session.seenPeople ??= [];
      return;
    }
    if (mode === "career" && ["scan", "offer", "change"].includes(phase) && !customer.rushCustomer && customer.rushOriginalPatience === void 0 && customer.patienceRulesVersion !== 65) {
      const oldTotal = Math.max(1, Number(customer.patience) || 20);
      const progressRatio = Math.max(0, Math.min(1, (Number(customer.elapsed) || 0) / oldTotal));
      customer.patience = 20 + Math.max(0, Math.min(5, Number(progress.upgrades?.comfort) || 0)) * 5 + (customer.kasih ? 15 : 0);
      customer.elapsed = Math.min(customer.patience - 1, Math.round(progressRatio * customer.patience));
      customer.patienceRulesVersion = 65;
    }
    if (!Array.isArray(customer.items)) {
      customer = null;
      phase = "waiting";
      session.customer = null;
      session.phase = "waiting";
      session.waitSeconds = 0;
      return;
    }
    ensureReturnClaim();
    customer.willTip ??= (customer.dialogueSeed || 0) % 10 < 4;
    session.seenPeople ??= [];
    customer.person = PEOPLE.find((p) => p.id === customer.person.id || p.name === customer.person.name) || customer.person;
    const id = customer.person.id || customer.person.name;
    if (!session.seenPeople.includes(id)) session.seenPeople.push(id);
    customer.cardPin ??= String(1e3 + Math.floor(Math.random() * 9e3));
    customer.requiresPin ??= customer.method === "card" && Math.random() < 0.5;
    if (mode !== "practice" && customer.method !== "kasih" && !availablePaymentMethods(progress.upgrades).includes(customer.method) && !["success", "end"].includes(phase)) {
      customer.method = "cash";
      customer.tender = tenderFor(amountDue(customer));
      customer.requiresPin = false;
      customer.paymentChanged = true;
      phase = customer.items.every((i) => i.scanned) ? "offer" : "scan";
    }
    customer.cardContactReady = false;
    if (customer.cardStage !== "pin") customer.cardPose = null;
    customer.qrScanned = false;
    customer.qrArmed = false;
    customer.cardStage = ["pin", "ready", "declined"].includes(customer.cardStage) ? customer.cardStage : "ready";
    customer.pinInput ??= "";
    customer.items.forEach((p) => {
      if (p.damaged && !/^\d{4}$/.test(p.manualCode || "")) p.manualCode = randomManualCode();
    });
  }
  function toggleDark() {
    progress.settings ??= { motion: true, theme: "mint" };
    progress.settings.dark = !progress.settings.dark;
    applySettings();
    save();
  }
  function avatarDetails(p) {
    return `<g class="avatar-details">${p.hairStyle === "long" && !p.scarf && p.hat !== "songkok" ? `<path d="M53 70Q34 141 53 177l17-19-12-55m86-33q18 70 0 107l-15-19 12-55" fill="${p.hair}"/>` : ""}${p.hairStyle === "curly" && p.hat !== "songkok" ? `<g fill="${p.hair}">${[55, 70, 85, 100, 115, 130, 145].map((x, i) => `<circle cx="${x}" cy="${44 + Math.abs(i - 3) * 5}" r="13"/>`).join("")}</g>` : ""}${p.hairStyle === "bun" && p.hat !== "songkok" ? `<circle cx="101" cy="25" r="19" fill="${p.hair}"/>` : ""}${p.hat === "songkok" ? '<path d="M57 81V43q43-10 86 0v38q-43-8-86 0" fill="#203430" stroke="#172a27" stroke-width="2"/><path d="M60 51q40-6 80 0" stroke="#52605a" stroke-width="2" fill="none"/><path d="M59 79q41-8 82 0" stroke="#122a26" stroke-width="3" fill="none"/>' : p.hat === "turban" ? `<path d="M50 71Q35 17 100 15q65 2 50 56l-50-28Z" fill="${p.hatColor || "#766887"}"/><path d="m50 55 49-25 51 25M55 40l45 14 45-14" fill="none" stroke="#fff" opacity=".28" stroke-width="3"/>` : ""}${p.beard ? `<path d="M58 120q12 28 32 14h21q22 14 32-14-4 43-43 47-39-4-42-47" fill="${p.hair}" opacity=".8"/>` : ""}${p.moustache ? `<path d="M100 128q-9-4-20 8 12 3 20-3 9 6 21 3-12-12-21-8" fill="${p.hair}"/>` : ""}${p.earrings && !p.scarf ? '<g stroke="#e5bb5e" stroke-width="3" fill="none"><circle cx="55" cy="121" r="5"/><circle cx="146" cy="121" r="5"/></g>' : ""}</g>`;
  }
  function showCatalogue() {
    openModal("catalogue", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">${PRODUCTS.length} PRODUK \xB7 ${CATEGORIES.length} KATEGORI</div><h2>Katalog Produk</h2></div><button class="icon-btn" id="closeCatalogue" aria-label="Tutup">${icon("close")}</button></div><div class="catalogue-toolbar"><label>Nama produk<input id="catalogueSearch" type="search" placeholder="Cari produk\u2026"></label><label>Kategori<select id="catalogueCategory"><option value="all">Semua kategori</option>${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label></div><p id="catalogueCount" class="catalogue-count" role="status"></p><div class="catalogue-grid" id="catalogueItems"></div></div>`);
    function fill() {
      const id = $("catalogueCategory").value, q = $("catalogueSearch").value.trim().toLocaleLowerCase("ms");
      const list = PRODUCTS.filter((p) => (id === "all" || p.category === id) && p.name.toLocaleLowerCase("ms").includes(q));
      $("catalogueCount").textContent = list.length + " produk ditemui";
      $("catalogueItems").innerHTML = list.length ? list.map((p) => {
        const unlocked = mode === "practice" || progress.unlocked.includes(p.category);
        return `<div class="catalogue-item ${unlocked ? "" : "locked"}">${productArt(p.id)}<b>${p.name}</b>${kasihEligible(p) ? '<small class="kasih-label">Layak KitaKasih</small>' : ""}<small>${money(p.price)}${p.weighted ? "/kg" : ""}</small><span class="catalogue-lock">${icon(unlocked ? "check" : "lock")} ${unlocked ? "Tersedia" : "Kategori terkunci"}</span></div>`;
      }).join("") : '<p class="catalogue-empty">Tiada produk sepadan. Cuba nama atau kategori lain.</p>';
    }
    $("closeCatalogue").onclick = closeModal;
    $("catalogueSearch").oninput = fill;
    $("catalogueCategory").onchange = fill;
    fill();
  }
  function cashArtStack(amount) {
    return changeParts(amount).parts.flatMap((p) => Array.from({ length: p.count }, () => p.value)).slice(0, 8).map((v, i) => `<span style="--note-index:${i}">${moneyArt(v)}</span>`).join("");
  }
  function renderDigital() {
    if (customer.method === "card") {
      renderCardTerminal();
      return;
    }
    const stage = customer.cardStage || "ready", working = stage === "processing";
    $("paymentArea").innerHTML = `<div id="payDevice" class="payment-scene qr-scene kk-qr-stage stage-${stage}"><div class="kk-qr-phone"><div class="kk-phone-island" aria-hidden="true"></div><div class="kk-phone-status"><span>9:41</span><span>\u25B0 \u25B0</span></div><div class="kk-wallet-brand"><span>K</span><div><small>KITA PAY</small><b>${customer.person.name}</b></div></div><small class="kk-amount-label">JUMLAH BAYARAN</small><strong class="kk-amount">${money(amountDue(customer))}</strong><button class="kk-qr-code" id="qrTarget" aria-label="Imbas kod QR pada telefon" ${working ? "disabled" : ""}>${qrArt()}<i></i></button><span class="kk-wallet-status">${working ? "Mengesahkan bayaran\u2026" : "Imbas kod untuk bayar"}</span><div class="kk-home-indicator"></div></div>${working ? "" : `<button type="button" class="kk-qr-reader" id="qrScanner" aria-label="Seret scanner ke kod QR atau tekan untuk mengambilnya"><svg viewBox="0 0 132 192" aria-hidden="true"><defs><linearGradient id="kkShell" x2=".8" y2="1"><stop stop-color="#718b83"/><stop offset=".4" stop-color="#31564c"/><stop offset="1" stop-color="#142f2b"/></linearGradient><linearGradient id="kkGrip" x2="1"><stop stop-color="#193b33"/><stop offset=".5" stop-color="#496b5d"/><stop offset="1" stop-color="#203e35"/></linearGradient><radialGradient id="kkGlass"><stop stop-color="#326965"/><stop offset="1" stop-color="#102c30"/></radialGradient></defs><g transform="rotate(-13 66 96)"><path d="M46 83h39l4 80q0 11-10 12H57q-9-1-10-12Z" fill="url(#kkGrip)" stroke="#153b32" stroke-width="3"/><path d="M49 106h37m-36 11h37m-36 11h37m-36 11h37m-36 11h37m-36 11h36" stroke="#142f29" stroke-width="5"/><rect x="14" y="13" width="105" height="86" rx="18" fill="url(#kkShell)" stroke="#183b34" stroke-width="3"/><path d="M26 20h78q8 0 8 8v53" fill="none" stroke="#9dbba8" stroke-opacity=".55" stroke-width="3"/><rect x="24" y="25" width="84" height="51" rx="12" fill="url(#kkGlass)" stroke="#83a395" stroke-width="2"/><path d="M35 35h10m-10 0v10m61-10H86m10 0v10M35 65h10m-10 0V55m61 10H86m10 0V55" fill="none" stroke="#9cdcc1" stroke-width="2"/><path d="M53 39h9v9h-9Zm16 0h9v9h-9ZM53 55h9v9h-9Zm16-2h4v4h5v7h-9Z" fill="none" stroke="#b6eed9" stroke-width="2"/><circle class="kk-reader-led" cx="105" cy="20" r="4" fill="#83f3b6"/><text x="67" y="89" text-anchor="middle" font-size="8" font-weight="700" letter-spacing="1" fill="#e1f1e5">IMBAS QR</text></g></svg><span>AMBIL & IMBAS</span></button>`}</div><p class="payment-hint kk-qr-hint">${working ? "Kod dibaca. Scanner disimpan secara automatik." : "Seret scanner ke kod QR, atau tekan scanner kemudian tekan kod QR."}</p>`;
    if (!working) bindQrScanner();
  }
  var CARD_DECLINE_MESSAGES = {
    insufficient: "Baki kad tidak mencukupi. Minta pelanggan menggunakan kad lain atau wang tunai.",
    technical: "Rangkaian bank terganggu. Cuba sentuh kad sekali lagi atau gunakan tunai.",
    expired: "Kad pelanggan telah tamat tempoh. Gunakan kad lain atau wang tunai."
  };
  function declineCardIfNeeded(transaction) {
    if (!transaction || transaction !== customer || transaction.method !== "card") return false;
    const reason = transaction.cardDeclineReason || (transaction.cardFailure ? "technical" : null);
    if (!reason || transaction.cardDeclineHandled) return false;
    transaction.cardDeclineHandled = true;
    transaction.cardFailure = false;
    transaction.cardDeclineReason = reason;
    transaction.cardStage = "declined";
    transaction.cardContactReady = false;
    transaction.cardPose = null;
    transaction.pinInput = "";
    busy = false;
    renderPayment();
    save();
    beep("error");
    return true;
  }
  function resolveCardDecline(action) {
    if (paused || busy || phase !== "offer" || customer?.method !== "card" || customer.cardStage !== "declined") return;
    if (action === "cash") {
      customer.method = "cash";
      customer.cardDeclineReason = null;
      customer.cardStage = "ready";
      customer.cardContactReady = false;
      customer.cardPose = null;
      customer.pinInput = "";
      customer.tender = tenderFor(amountDue(customer));
      toast("Pelanggan memilih tunai. Terima duit dan pulangkan baki.");
    } else if (action === "other-card") {
      customer.cardDeclineReason = null;
      customer.cardStage = "ready";
      customer.cardContactReady = false;
      customer.cardPose = null;
      customer.pinInput = "";
      customer.cardPin = String(1e3 + Math.floor(Math.random() * 9e3));
      customer.cardExpiry = "12/28";
      const all = ["theme-green", "theme-gold", "theme-pink", "theme-black"];
      customer.cardTheme = all[(all.indexOf(customer.cardTheme) + 1 + all.length) % all.length];
      toast("Kad baharu diberikan. Sentuh kad pada terminal semula.");
    } else return;
    renderPayment();
    renderReceipt();
    renderScene();
    save();
  }
  async function startDigital(confirmed = false) {
    if (paused || busy || phase !== "offer" || ["pin", "declined"].includes(customer.cardStage) || customer.method === "qr" && !customer.qrScanned || !ensurePaper()) return;
    const card = customer.method === "card", store = operatingStore();
    if (card && (!confirmed || !customer.cardContactReady)) return;
    if (card && store.cardBroken) {
      renderPayment();
      beep("error");
      return;
    }
    busy = true;
    const token = scanToken, transaction = customer;
    customer.cardStage = card ? "contact" : "processing";
    renderPayment();
    save();
    const qrLevel = Math.max(1, Math.min(5, Number(progress.upgrades.qr) || 1));
    if (!await delayActive(card ? 520 : Math.max(580, 1400 - (qrLevel - 1) * 205), token)) return;
    busy = false;
    beep("scan");
    if (card && customer.requiresPin) {
      customer.cardStage = "pin";
      customer.pinInput = "";
      renderPayment();
      save();
      return;
    }
    if (card && declineCardIfNeeded(transaction)) return;
    completePayment(transaction);
  }
  function renderCardTerminal() {
    const stage = customer.cardStage || "ready", pin = stage === "pin", declined = stage === "declined", working = ["contact", "processing"].includes(stage);
    const action = "Sentuh kad pada terminal";
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "\u232B", "0", "OK"];
    const themes = ["theme-green", "theme-gold", "theme-pink", "theme-black"];
    customer.cardTheme ??= themes[Math.floor(Math.random() * themes.length)];
    const holder = (customer.person?.name || "Pelanggan").toUpperCase();
    const helper = declined ? "Transaksi tidak berjaya. Lihat arahan di bawah." : pin ? "Masukkan 4 digit PIN dan tekan OK" : working ? "Sila tunggu pengesahan terminal" : customer.requiresPin ? "Sentuh kad pada terminal. Kemudian masukkan PIN" : "Sentuh kad pada terminal";
    $("paymentArea").innerHTML = `<div id="payDevice" class="payment-scene modern-card-scene stage-${stage}"><div class="terminal-v2"><div class="terminal-v2-top"></div><div class="contact-reader" id="cardReaderTarget"><span class="reader-icon" aria-hidden="true"></span><small>SENTUH KAD PADA TERMINAL</small></div><div class="terminal-v2-screen-frame"><div class="terminal-v2-screen"><small>${declined ? "BAYARAN DITOLAK" : pin ? "MASUKKAN PIN" : working ? "SEDANG MEMPROSES" : "TERMINAL SEDIA"}</small><b>${declined ? "DECLINED" : pin ? "\u25CF".repeat(customer.pinInput.length) || "_ _ _ _" : money(amountDue(customer))}</b><span>${helper}</span></div></div><div class="terminal-v2-keys">${keys.map((k) => `<button type="button" data-terminal-pin="${k}" class="${k === "OK" ? "pin-ok" : k === "\u232B" ? "pin-clear" : ""}" ${pin ? "" : "disabled"} aria-label="${k === "\u232B" ? "Padam" : k === "OK" ? "Sahkan PIN" : k}">${k}</button>`).join("")}</div></div><button class="payment-bankcard ${customer.cardTheme}" id="swipeCard" ${working || pin || declined ? "disabled" : ""} aria-label="${action}"><span class="bank-name">KITA BANK</span><span class="card-motif" aria-hidden="true"></span><i class="card-chip"></i><span class="card-wave" aria-hidden="true">))))</span><b class="card-number">4826 2026 1234 5678</b><em class="card-expiry">${customer.cardExpiry || (customer.cardDeclineReason === "expired" ? "09/26" : "12/26")}</em><small class="card-holder">${holder}</small><strong class="card-brand">mc</strong></button><span class="terminal-action-label">${declined ? "Pilih kaedah bayaran seterusnya" : pin ? "Masukkan 4 digit PIN pada terminal" : working ? "Kad sedang dibaca\u2026" : "Sentuh kad pada terminal"}</span></div>${pin ? `<div class="card-pin-guide"><small>PIN pelanggan</small><strong>${customer.cardPin}</strong><span id="pinError" class="code-error">${customer.pinError || ""}</span></div>` : declined ? `<div class="card-decline-panel"><b>Transaksi kad tidak berjaya</b><p>${CARD_DECLINE_MESSAGES[customer.cardDeclineReason] || "Pilih kaedah bayaran lain."}</p><div class="card-decline-actions"><button type="button" class="secondary-btn" data-card-recovery="other-card">${customer.cardDeclineReason === "technical" ? "Cuba semula" : "Guna kad lain"}</button><button type="button" class="secondary-btn" data-card-recovery="cash">Bayar tunai</button></div></div>` : `<div class="card-drag-instruction">${customer.requiresPin ? "Sentuh kad pada terminal. Selepas itu masukkan PIN pelanggan." : "Sentuh kad pada terminal untuk lengkapkan pembayaran."}</div>`}`;
    if (declined) {
      $("paymentArea").querySelectorAll("[data-card-recovery]").forEach((b) => b.onclick = () => resolveCardDecline(b.dataset.cardRecovery));
      return;
    }
    if (pin) {
      setCardPose();
      $("paymentArea").querySelectorAll("[data-terminal-pin]").forEach((b) => b.onclick = () => pressPin(b.dataset.terminalPin));
      return;
    }
    if (working) setCardPose();
    else bindBankCardDrag();
  }
  function pressPin(key) {
    if (paused || busy || phase !== "offer" || customer.cardStage !== "pin") return;
    customer.pinError = "";
    if (key === "\u232B") customer.pinInput = customer.pinInput.slice(0, -1);
    else if (key === "OK") {
      if (customer.pinInput !== customer.cardPin) {
        customer.pinError = "PIN tidak tepat. Semak nombor yang pelanggan beri.";
        customer.pinInput = "";
        beep("error");
        renderPayment();
        save();
        return;
      }
      busy = true;
      customer.cardStage = "processing";
      const token = scanToken, transaction = customer;
      renderPayment();
      save();
      beep("scan");
      delayActive(900, token).then((valid) => {
        if (valid) {
          busy = false;
          if (declineCardIfNeeded(transaction)) return;
          completePayment(transaction);
        }
      });
      return;
    } else if (/^\d$/.test(key) && customer.pinInput.length < 4) customer.pinInput += key;
    renderPayment();
    save();
  }
  function applyMachineSpeeds() {
    const speed = machineTimings(gameplayMachineUpgrades());
    document.body.style.setProperty("--scan-duration", speed.scanMs + "ms");
    document.body.style.setProperty("--belt-duration", speed.beltMs + "ms");
    document.body.style.setProperty("--item-slide-duration", speed.slideMs + "ms");
    $("scannerZone").setAttribute("title", "Scanner \xB7 " + speed.scanMs / 1e3 + " saat");
    $("scaleZone").setAttribute("title", "Penimbang \xB7 " + speed.weighMs / 1e3 + " saat");
  }
  function machineUpgradeInfo(id, level, max) {
    if (id === "comfort") return `<span class="machine-speed">Kesabaran biasa: ${20 + 5 * level}s \u2192 ${20 + 5 * Math.min(max, level + 1)}s</span>`;
    if (id === "riderPatience") return `<span class="machine-speed">Masa rider: ${30 + 5 * level}s \u2192 ${30 + 5 * Math.min(max, level + 1)}s</span>`;
    if (id === "rushBoost") return `<span class="machine-speed">Bonus Rush Hour: \xD7${rushHourMultiplier(progress.upgrades).toFixed(1)} \u2192 \xD7${rushHourMultiplier({ ...progress.upgrades, rushBoost: Math.min(max, level + 1) }).toFixed(1)} \xB7 ${level >= max ? "Maksimum" : "Tambah +0.3 setiap tahap"}</span>`;
    if (id === "storage") return `<span class="machine-speed">Had stok: ${stockCapacity(progress)} \u2192 ${level < max ? stockCapacity({ upgrades: { storage: level + 1 } }) : stockCapacity(progress)} unit/kg</span>`;
    if (!["scanner", "scale", "conveyor"].includes(id)) return "";
    const current = machineTimings(progress.upgrades), next = machineTimings({ ...progress.upgrades, [id]: Math.min(max, level + 1) });
    const key = { scanner: "scanMs", scale: "weighMs", conveyor: "slideMs" }[id];
    return `<span class="machine-speed">${id === "conveyor" ? "Gerakan barang" : "Masa proses"}: ${(current[key] / 1e3).toFixed(2)}s${level < max ? " \u2192 " + (next[key] / 1e3).toFixed(2) + "s" : " \xB7 Maksimum"}</span>`;
  }
  function returnCash(index, transaction, button) {
    if (paused || busy || phase !== "change" || transaction !== customer || !Number.isInteger(index) || index < 0 || index >= cashPicked.length) return;
    const value = cashPicked[index], from = button.getBoundingClientRect();
    cashPicked.splice(index, 1);
    renderPayment();
    save();
    beep("coin");
    const target = $("paymentArea").querySelector(`[data-note="${value}"]`);
    if (!target) return;
    const to = target.getBoundingClientRect(), el = document.createElement("div");
    el.className = "return-cash-fx";
    el.innerHTML = moneyArt(value);
    el.style.left = from.left + "px";
    el.style.top = from.top + "px";
    $("fxLayer").append(el);
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.transform = `translate(${to.left - from.left}px,${to.top - from.top}px) scale(.7)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 350);
  }
  function armQrScanner() {
    if (paused || busy || phase !== "offer" || customer.method !== "qr" || customer.cardStage === "processing") return;
    customer.qrArmed = true;
    $("payDevice").classList.add("qr-armed");
    $("qrTarget").setAttribute("aria-label", "Scanner sedia. Tekan untuk imbas QR");
  }
  function scanQrTarget() {
    if (paused || busy || phase !== "offer" || customer.method !== "qr" || !customer.qrArmed) return;
    customer.qrScanned = true;
    startDigital();
  }
  function bindQrScanner() {
    const scanner = $("qrScanner"), target = $("qrTarget"), transaction = customer;
    let dragState = null, suppressClick = false;
    const allowed = () => transaction === customer && !paused && !busy && phase === "offer" && customer.method === "qr";
    const reset = () => {
      dragState = null;
      scanner.style.removeProperty("--qr-dx");
      scanner.style.removeProperty("--qr-dy");
      scanner.classList.remove("dragging");
      target.classList.remove("qr-target-hit");
    };
    target.onclick = () => {
      if (!allowed()) return;
      if (!customer.qrArmed) {
        toast("Ambil scanner dahulu, kemudian tekan kod QR.");
        return;
      }
      scanQrTarget();
    };
    scanner.onclick = () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (allowed()) armQrScanner();
    };
    scanner.onpointerdown = (e) => {
      if (!allowed() || e.button > 0) return;
      const rect2 = scanner.getBoundingClientRect();
      dragState = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, scale: rect2.width / scanner.offsetWidth || 1 };
      suppressClick = false;
      scanner.setPointerCapture(e.pointerId);
      scanner.classList.add("dragging");
      armQrScanner();
      e.preventDefault();
    };
    scanner.onpointermove = (e) => {
      const d = dragState;
      if (!d || e.pointerId !== d.id) return;
      if (!allowed()) {
        reset();
        return;
      }
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.moved ||= Math.hypot(dx, dy) > 6;
      scanner.style.setProperty("--qr-dx", dx / d.scale + "px");
      scanner.style.setProperty("--qr-dy", dy / d.scale + "px");
      target.classList.toggle("qr-target-hit", inside(e, target.getBoundingClientRect()));
    };
    scanner.onpointerup = (e) => {
      const d = dragState;
      if (!d || e.pointerId !== d.id) return;
      const hit = inside(e, target.getBoundingClientRect()), valid = allowed();
      suppressClick = d.moved;
      reset();
      if (valid && d.moved && hit) scanQrTarget();
      else if (valid && d.moved) toast("Halakan scanner tepat pada kod QR.");
    };
    scanner.onpointercancel = reset;
    scanner.onlostpointercapture = () => {
      if (dragState) reset();
    };
  }
  function setScaleReading(product, fraction = 1) {
    const grams = product ? Math.max(0, Math.round(product.grams * fraction)) : 0;
    $("weightDisplay").textContent = (grams / 1e3).toFixed(3);
  }
  function renderPaymentAvailability() {
    const enabled = availablePaymentMethods(progress.upgrades, mode === "practice");
    $("paymentAvailability").innerHTML = ["cash", "card", "qr"].map((id) => `<button class="payment-chip ${enabled.includes(id) ? "enabled" : "locked"}" data-payment-upgrade="${id}" ${id === "cash" || enabled.includes(id) ? "disabled" : ""} aria-label="${{ cash: "Tunai", card: "Kad", qr: "QR" }[id]} ${enabled.includes(id) ? "tersedia" : "terkunci, buka melalui upgrade"}">${icon(id)}<span>${{ cash: "Tunai", card: "Kad", qr: "QR" }[id]}</span>${enabled.includes(id) ? "<i></i>" : icon("lock")}</button>`).join("");
    $("paymentAvailability").querySelectorAll("[data-payment-upgrade]").forEach((b) => b.onclick = () => {
      if (session && modalKind !== "intro") showShop();
    });
  }
  function paymentUpgradeCards() {
    return `<h3 class="shop-section-title">Terminal pembayaran</h3><p class="muted">Tahap 1 membuka kaedah bayaran. Empat tahap seterusnya meningkatkan ketahanan terminal atau kelajuan QR.</p><div class="payment-upgrade-grid">${UPGRADES.filter((u) => u.type === "payment").map((u) => {
      const level = progress.upgrades[u.id] || 0, owned = level >= 1, maxed = level >= u.max, cost = u.cost * (level + 1);
      return `<div class="payment-upgrade-card ${owned ? "owned" : ""}"><span class="payment-upgrade-art">${icon(u.icon)}<i>${icon(owned ? "check" : "lock")}</i></span><h3>${u.name}</h3><span class="payment-level">Tahap ${level} / ${u.max}</span><p>${u.desc}</p><button class="primary-btn" data-upgrade="${u.id}" ${maxed || progress.wallet < cost ? "disabled" : ""}>${maxed ? "\u2713 Maksimum" : owned ? "Upgrade \xB7 " + money(cost) : "Buka \xB7 " + money(cost)}</button><small>${maxed ? "Semua 5 tahap lengkap" : owned ? "Pembayaran aktif \xB7 upgrade pilihan" : progress.wallet < cost ? "Perlu lagi " + money(cost - progress.wallet) : "Sedia dibuka"}</small></div>`;
    }).join("")}</div>`;
  }
  function audioVolume() {
    const n = Number(progress.settings?.volume ?? 0.6);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.6;
  }
  function prepareScannerAudio() {
    try {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {
      });
      if (!scannerBufferPromise && typeof fetch === "function") scannerBufferPromise = fetch("./scanner-beep.wav").then((r) => {
        if (!r.ok) throw new Error("Audio unavailable");
        return r.arrayBuffer();
      }).then((bytes) => audioCtx.decodeAudioData(bytes)).then((buffer) => {
        scannerBuffer = buffer;
        return buffer;
      }).catch(() => {
        scannerBufferPromise = null;
        return null;
      });
    } catch {
    }
  }
  function stopScannerSound() {
    try {
      scannerSource?.node.stop();
    } catch {
    }
    scannerSource = null;
    try {
      $("scannerSound").pause();
      $("scannerSound").currentTime = 0;
    } catch {
    }
  }
  function playScannerSound() {
    if (!sound || effectVolume("scanner") === 0) return;
    prepareScannerAudio();
    stopScannerSound();
    if (scannerBuffer && audioCtx) {
      try {
        const node = audioCtx.createBufferSource(), gain = audioCtx.createGain();
        node.buffer = scannerBuffer;
        gain.gain.value = effectVolume("scanner");
        node.connect(gain);
        gain.connect(audioCtx.destination);
        scannerSource = { node, gain };
        node.onended = () => {
          node.disconnect();
          gain.disconnect();
          if (scannerSource?.node === node) scannerSource = null;
        };
        node.start();
        return;
      } catch {
      }
    }
    try {
      const clip = $("scannerSound");
      clip.volume = effectVolume("scanner");
      clip.currentTime = 0;
      const playing = clip.play();
      playing?.catch(() => {
      });
    } catch {
    }
  }
  function scrollChangeTrayEnd() {
    const tray = $("changeTray");
    if (tray) tray.scrollLeft = tray.scrollWidth;
  }
  function musicChoice() {
    const choice = String(progress.settings?.musicTrack ?? "random");
    return choice === "4" ? "3" : ["1", "2", "3", "random"].includes(choice) ? choice : "random";
  }
  function randomMusicIndex(previous = -1) {
    const others = MUSIC_TRACKS.map((_, i) => i).filter((i) => i !== previous);
    return others[Math.floor(Math.random() * others.length)];
  }
  function refreshMusicLabel() {
    const label = $("musicNowPlaying");
    if (label) label.textContent = "Sedang dimainkan: " + MUSIC_TRACKS[Math.max(0, musicIndex)].name;
  }
  function switchMusicTrack(index, autoplay = false) {
    const player = $("backgroundMusic");
    if (!player || index < 0 || index >= MUSIC_TRACKS.length) return;
    const same = musicIndex === index && player.getAttribute("src") === MUSIC_TRACKS[index].file;
    musicIndex = index;
    player.loop = musicChoice() !== "random";
    if (!same) {
      ++musicStartToken;
      musicStarting = false;
      musicFade = null;
      musicTarget = -1;
      player.pause();
      writeMusicLevel(0);
      player.src = MUSIC_TRACKS[index].file;
      player.load();
    }
    refreshMusicLabel();
    if (autoplay) syncBackgroundMusic();
  }
  function ensureMusicTrack() {
    const choice = musicChoice();
    if (musicLoadedChoice !== choice) {
      musicLoadedChoice = choice;
      switchMusicTrack(choice === "random" ? randomMusicIndex(musicIndex) : Number(choice) - 1);
    } else if (musicIndex < 0) switchMusicTrack(choice === "random" ? randomMusicIndex() : Number(choice) - 1);
    const player = $("backgroundMusic");
    if (player) player.loop = choice !== "random";
  }
  function nextRandomTrack() {
    if (musicChoice() !== "random") return;
    switchMusicTrack(randomMusicIndex(musicIndex), true);
  }
  $("backgroundMusic")?.addEventListener("ended", () => {
    if (musicChoice() === "random") nextRandomTrack();
  });
  function musicVolume() {
    const n = Number(progress.settings?.musicVolume ?? 0.2);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.2;
  }
  function musicWanted() {
    return musicUnlocked && !!session && sound && progress.settings?.music !== false && musicVolume() > 0 && !explicitPause;
  }
  function writeMusicLevel(level) {
    musicLevel = Math.max(0, Math.min(1, level));
    const track = $("backgroundMusic");
    try {
      if (musicGain) {
        musicGain.gain.value = musicLevel;
        track.volume = 1;
      } else track.volume = musicLevel;
    } catch {
    }
  }
  function fadeMusicTo(target) {
    if (musicTarget === target) return;
    musicTarget = target;
    musicFade = { from: musicLevel, to: target, start: performance.now(), duration: target > musicLevel ? 850 : 650 };
    if (!musicFramePending) {
      musicFramePending = true;
      requestAnimationFrame(tickMusicFade);
    }
  }
  function tickMusicFade(now) {
    musicFramePending = false;
    const fade = musicFade;
    if (!fade) return;
    const p = Math.min(1, Math.max(0, (now - fade.start) / fade.duration)), smooth = p * p * (3 - 2 * p);
    writeMusicLevel(fade.from + (fade.to - fade.from) * smooth);
    if (p < 1) {
      musicFramePending = true;
      requestAnimationFrame(tickMusicFade);
    } else {
      musicFade = null;
      if (fade.to === 0 && !musicWanted()) try {
        $("backgroundMusic").pause();
      } catch {
      }
    }
  }
  function syncBackgroundMusic() {
    const track = $("backgroundMusic");
    if (!track) return;
    ensureMusicTrack();
    const rate = mode === "career" && rushHourActive(progress.day, session) ? 1.18 : 1;
    if (track.playbackRate !== rate) track.playbackRate = rate;
    if ("preservesPitch" in track) track.preservesPitch = true;
    if (!musicWanted()) {
      fadeMusicTo(0);
      return;
    }
    prepareScannerAudio();
    try {
      if (audioCtx && !musicSource) {
        const gain = audioCtx.createGain();
        gain.gain.value = musicLevel;
        const source = audioCtx.createMediaElementSource(track);
        source.connect(gain);
        gain.connect(audioCtx.destination);
        musicSource = source;
        musicGain = gain;
      }
      writeMusicLevel(musicLevel);
    } catch {
    }
    if (!track.paused) {
      fadeMusicTo(musicVolume());
      return;
    }
    if (musicStarting) return;
    const token = ++musicStartToken;
    try {
      musicStarting = true;
      writeMusicLevel(0);
      const result = track.play();
      Promise.resolve(result).then(() => {
        if (token !== musicStartToken) return;
        musicStarting = false;
        if (musicWanted()) {
          musicTarget = -1;
          fadeMusicTo(musicVolume());
        } else {
          musicFade = null;
          musicTarget = 0;
          writeMusicLevel(0);
          track.pause();
        }
      }).catch(() => {
        if (token === musicStartToken) musicStarting = false;
      });
    } catch {
      if (token === musicStartToken) musicStarting = false;
    }
  }
  function prepareChaChing() {
    prepareScannerAudio();
    if (!audioCtx || chaChingPromise || typeof fetch !== "function") return;
    chaChingPromise = fetch("./cha-ching.wav").then((r) => {
      if (!r.ok) throw new Error("Audio unavailable");
      return r.arrayBuffer();
    }).then((b) => audioCtx.decodeAudioData(b)).then((b) => {
      chaChingBuffer = b;
      return b;
    }).catch(() => {
      chaChingPromise = null;
      return null;
    });
  }
  function stopChaChing() {
    ++chaChingSequence;
    try {
      chaChingSource?.node.stop();
    } catch {
    }
    chaChingSource = null;
    for (const node of chaChingFallbackNodes) {
      try {
        node.stop();
      } catch {
      }
    }
    chaChingFallbackNodes = [];
    try {
      $("chaChingSound").pause();
      $("chaChingSound").currentTime = 0;
    } catch {
    }
  }
  async function playChaChing() {
    if (!sound || effectVolume("chaching") === 0) return;
    stopChaChing();
    prepareChaChing();
    const token = chaChingSequence, level = effectVolume("chaching");
    const current = () => token === chaChingSequence && sound && effectVolume("chaching") > 0;
    const playBuffer = () => {
      if (!current() || !chaChingBuffer || audioCtx?.state !== "running") return false;
      try {
        const node = audioCtx.createBufferSource(), gain = audioCtx.createGain();
        node.buffer = chaChingBuffer;
        gain.gain.value = level;
        node.connect(gain);
        gain.connect(audioCtx.destination);
        chaChingSource = { node, gain };
        node.onended = () => {
          node.disconnect();
          gain.disconnect();
          if (chaChingSource?.node === node) chaChingSource = null;
        };
        node.start(0);
        return true;
      } catch {
        return false;
      }
    };
    try {
      if (audioCtx?.state === "suspended") audioCtx.resume().catch(() => {
      });
      if (playBuffer()) return;
      const clip = $("chaChingSound");
      if (clip) {
        clip.volume = level;
        try {
          await clip.play();
          return;
        } catch {
        }
      }
      if (!current()) return;
      if (playBuffer()) return;
      if (audioCtx?.state !== "running") return;
      const now = audioCtx.currentTime;
      [1046.5, 1568, 2093].forEach((freq, i) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), t = now + i * 0.095;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(level * 0.22, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.26);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        chaChingFallbackNodes.push(osc);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
          chaChingFallbackNodes = chaChingFallbackNodes.filter((n) => n !== osc);
        };
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {
    }
  }
  function playTapSound() {
    if (!sound || effectVolume("tap") === 0) return;
    prepareScannerAudio();
    if (!audioCtx) return;
    try {
      const node = audioCtx.createOscillator(), gain = audioCtx.createGain(), t = audioCtx.currentTime;
      node.type = "triangle";
      node.frequency.setValueAtTime(750, t);
      node.frequency.exponentialRampToValueAtTime(330, t + 0.035);
      gain.gain.setValueAtTime(0.15 * effectVolume("tap"), t);
      gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.04);
      node.connect(gain);
      gain.connect(audioCtx.destination);
      node.start(t);
      node.stop(t + 0.045);
      node.onended = () => {
        node.disconnect();
        gain.disconnect();
      };
    } catch {
    }
  }
  function musicSettingsHTML() {
    return `<div class="setting-row"><div><b>Muzik latar</b><small>3 pilihan lagu \xB7 main ikut pilihan atau secara rawak.</small></div><button class="toggle ${progress.settings.music !== false ? "on" : ""}" id="toggleMusic" aria-label="Muzik latar" aria-pressed="${progress.settings.music !== false}"><i></i></button></div><div class="sound-settings music-settings"><label for="musicVolume">Volume muzik <b id="musicVolumeLabel">${Math.round(musicVolume() * 100)}%</b></label><input id="musicVolume" type="range" min="0" max="100" step="5" value="${Math.round(musicVolume() * 100)}" aria-label="Volume muzik latar"><div class="music-track-picker"><label for="musicTrack">Pilih lagu latar</label><select id="musicTrack" aria-label="Pilihan muzik latar">${MUSIC_TRACKS.map((track, i) => `<option value="${i + 1}" ${musicChoice() === String(i + 1) ? "selected" : ""}>${track.name}</option>`).join("")}<option value="random" ${musicChoice() === "random" ? "selected" : ""}>Random</option></select><div class="music-track-info"><span id="musicNowPlaying" aria-live="polite">Sedang dimainkan: ${MUSIC_TRACKS[Math.max(0, musicIndex)].name}</span></div></div><span>Muzik terus bermain dalam Tetapan. Tekan Jeda untuk berhenti.</span></div>`;
  }
  function bindMusicSettings() {
    $("toggleMusic").onclick = () => {
      progress.settings.music = progress.settings.music === false;
      syncBackgroundMusic();
      save();
      showSettings();
    };
    $("musicVolume").oninput = () => {
      progress.settings.musicVolume = Number($("musicVolume").value) / 100;
      $("musicVolumeLabel").textContent = Math.round(musicVolume() * 100) + "%";
      syncBackgroundMusic();
      save();
    };
    $("musicTrack").onchange = () => {
      progress.settings.musicTrack = $("musicTrack").value;
      musicUnlocked = true;
      syncBackgroundMusic();
      save();
      refreshMusicLabel();
      cloud?.flush?.().catch(() => {
      });
    };
    refreshMusicLabel();
  }
  window.addEventListener("resize", () => {
    if (calculatorPosition) positionCalculator(calculatorPosition.x, calculatorPosition.y);
  });
  window.visualViewport?.addEventListener("resize", () => {
    if (calculatorPosition) positionCalculator(calculatorPosition.x, calculatorPosition.y);
  });
  document.addEventListener("click", (e) => {
    const button = e.target?.closest?.("button");
    if (button && !button.disabled) playTapSound();
  }, true);
  document.addEventListener("pointerdown", (e) => {
    if (e.target?.closest?.("#giveChange,#acceptCash")) {
      prepareChaChing();
      try {
        if (audioCtx?.state === "suspended") audioCtx.resume().catch(() => {
        });
      } catch {
      }
    }
  }, { capture: true, passive: true });
  function syncPaymentSurface() {
    const overlay = $("paymentOverlay"), area = $("paymentArea"), active = !!customer && ["offer", "change"].includes(phase), visible = active && !paymentMinimized;
    const opening = visible && overlay.hidden;
    const mount = $(active ? "paymentMount" : "paymentHome");
    if (area.parentElement !== mount) mount.append(area);
    overlay.hidden = !visible;
    $("resumePayment").hidden = !active;
    $("gameApp").inert = visible;
    document.body.classList.toggle("payment-open", visible);
    if (active) {
      overlay.dataset.method = customer.method;
      overlay.dataset.kind = customer.kind;
      overlay.dataset.phase = phase;
      $("paymentTitle").textContent = customer.kind === "return" ? "Pemulangan barang" : customer.method === "kasih" ? "Pembayaran KitaKasih" : customer.method === "cash" ? phase === "change" ? "Laci baki tunai" : "Terima bayaran tunai" : customer.method === "card" ? "Pembayaran kad" : "Pembayaran QR";
      $("paymentCustomer").textContent = customer.person.name + (customer.kasih && customer.method !== "kasih" ? " \xB7 Tambahan selepas KitaKasih " : " \xB7 Jumlah ") + money(amountDue(customer)) + (customer.method === "cash" ? customer.kind === "return" ? " \xB7 Bayaran balik" : " \xB7 Diterima " + money(customer.tender) : "");
      $("paymentInstructions").textContent = customer.method === "kasih" ? "Semak kad bantuan, kemudian pilih bayaran tambahan jika perlu." : customer.kind === "return" ? "Bandingkan data resit dengan rekod sistem. Terima hanya pemulangan yang sah." : customer.method === "cash" ? "Pilih dari laci \xB7 tekan duit dalam dulang untuk masukkan semula" : customer.method === "card" ? "Sentuh kad pada terminal. Jika diminta, masukkan PIN pada mesin" : "Ambil scanner dan imbas kod pada telefon pelanggan";
    }
    if (opening) $("paymentTitle").focus?.({ preventScroll: true });
    $("resumePayment").onclick = () => {
      paymentMinimized = false;
      syncPaymentSurface();
    };
    $("minimizePayment").onclick = () => {
      cancelBankCardDrag();
      paymentMinimized = true;
      syncPaymentSurface();
      $("resumePayment").focus?.();
    };
    $("paymentCalculator").onclick = showCalculator;
    $("paymentSettings").onclick = showSettings;
    $("paymentPause").onclick = showPause;
  }
  function handlePaymentOverlayKey(e) {
    if ($("paymentOverlay").hidden || $("modal").open) return false;
    if (e.key === "Escape") {
      e.preventDefault();
      $("minimizePayment").onclick();
      return true;
    }
    if (e.key !== "Tab") return false;
    const roots = [$("paymentOverlay"), ...$("floatingCalculator").hidden ? [] : [$("floatingCalculator")]];
    const buttons = roots.flatMap((root) => [...root.querySelectorAll('button:not(:disabled), [tabindex="0"], input:not(:disabled)')]).filter((el) => el.getClientRects().length);
    if (!buttons.length) return false;
    const index = buttons.indexOf(document.activeElement), next = e.shiftKey ? index <= 0 ? buttons.length - 1 : index - 1 : (index + 1) % buttons.length;
    e.preventDefault();
    buttons[next].focus();
    return true;
  }
  function operatingStore() {
    if (mode !== "practice") return progress;
    if (!practiceStore) {
      practiceStore = createProgress();
      practiceStore.wallet = 1e6;
      practiceStore.unlocked = CATEGORIES.map((c) => c.id);
      ensureOperations(practiceStore);
      practiceStore.paper = 999;
    }
    return practiceStore;
  }
  function rushUnlimited(c = customer) {
    return mode === "career" && !!c?.rushUnlimited;
  }
  function readyForCustomer() {
    return mode === "career" && rushHourActive(progress.day, session) || progress.paper > 0 && availableProducts(progress.unlocked).some((p) => progress.inventory[p.id] >= (p.weighted ? 100 : 1));
  }
  function enterSupplyWait() {
    customer = null;
    phase = "supply";
    busy = false;
    advancePending = false;
    session.waitSeconds = 0;
    resetStations();
    render();
    save();
  }
  function ensurePaper() {
    if (mode === "practice" || rushUnlimited() || mode === "career" && rushHourActive(progress.day, session) || progress.paper > 0) return true;
    showInventory();
    toast("Kertas resit habis. Beli satu pek sebelum melayan pelanggan.", true);
    return false;
  }
  function renderOperations() {
    syncSceneAtmosphere();
    const s = operatingStore(), rush = mode === "career" && !!session && rushHourActive(progress.day, session);
    $("storeClock").textContent = clockText(session?.clockMinutes || 480);
    const banner = $("rushHourBanner");
    if (banner) {
      banner.hidden = !rush;
      if (rush) {
        $("rushClock").textContent = String(Math.ceil(session.rushSecondsRemaining)).padStart(2, "0") + "s";
        $("rushMultiplier").textContent = "\xD7" + rushHourMultiplier(progress.upgrades).toFixed(1);
        $("rushBar").style.width = (session.rushSecondsRemaining / RUSH_DURATION_SECONDS * 100).toFixed(2) + "%";
      }
    }
    $("storeClock").classList.toggle("rush-active", rush);
    const stars = session?.stars ?? 3;
    $("storeStars").textContent = "\u2605".repeat(stars) + "\u2606".repeat(3 - stars);
    $("storeStars").setAttribute("aria-label", stars + " daripada 3 bintang servis");
    $("supplyStatus").textContent = (rush || rushUnlimited() ? "\u26A1 Stok & resit \u221E" : "Resit " + s.paper) + " \xB7 Kad " + (s.cardBroken ? "ROSAK" : s.cardHealth + "%");
  }
  function renderWaiting() {
    const area = $("paymentArea"), key = phase + (progress.paper === 0 ? "paper" : "stock");
    if (area.dataset.waitKey !== key) {
      area.dataset.waitKey = key;
      area.innerHTML = `<div class="waiting-counter">${icon(phase === "supply" ? "basket" : "clock")}<h3>${phase === "supply" ? progress.paper === 0 ? "Kertas resit habis" : "Stok kedai habis" : "Kaunter lapang seketika"}</h3><p>${phase === "supply" ? "Tambah bekalan sebelum pelanggan seterusnya boleh dilayan." : "Dah lewat. Pelanggan datang lebih perlahan."}</p><button class="secondary-btn" id="waitingInventory">Buka inventori</button></div>`;
      $("waitingInventory").onclick = () => showInventory();
    }
  }
  function inventorySelectedFilter() {
    return $("inventoryStateFilter")?.value || "all";
  }
  function inventoryStateFor(product, store) {
    const amount = store.inventory[product.id] || 0, unit = product.weighted ? 1e3 : 1;
    return amount <= 0 ? "empty" : amount < LOW_STOCK_UNITS * unit ? "low" : "good";
  }
  function bindInventoryControls() {
    const content = $("modalContent");
    content.querySelectorAll("[data-restock]").forEach((b) => b.onclick = () => {
      const input = content.querySelector(`[data-stock-qty="${b.dataset.restock}"]`), amount = Number(input?.value);
      if (!Number.isInteger(amount) || amount < 1 || amount > MAX_STOCK_PURCHASE) {
        toast("Pilih kuantiti 1\u201320 sahaja.", true);
        return;
      }
      if (!stockQuote(operatingStore(), b.dataset.restock, amount).lines.length) {
        toast("Stok sudah mencapai had stor. Naik taraf kapasiti stor dahulu.", true);
        return;
      }
      confirmSupply("stock", b.dataset.restock, inventoryDestination, amount);
    });
    content.querySelectorAll("[data-stock-qty]").forEach((input) => {
      const card = input.closest(".stock-card"), minus = card.querySelector("[data-stock-minus]"), plus = card.querySelector("[data-stock-plus]"), buy = card.querySelector("[data-restock]");
      const update = () => {
        const amount = Number(input.value), product = PRODUCTS.find((p) => p.id === input.dataset.stockQty);
        const unit = product.weighted ? 1e3 : 1, space = Math.max(0, stockCapacity(operatingStore()) - Math.floor((operatingStore().inventory[product.id] || 0) / unit));
        const limit = Math.min(MAX_STOCK_PURCHASE, space), valid = Number.isInteger(amount) && amount >= 1 && amount <= limit;
        minus.disabled = !valid || amount <= 1;
        plus.disabled = !valid || amount >= limit;
        buy.disabled = mode === "practice" || !valid;
        const qty = amount * (product.weighted ? 1e3 : 1);
        buy.textContent = valid ? "Beli " + amount + (product.weighted ? " kg" : " unit") + " \xB7 " + money(stockCost(product, qty, operatingStore().day)) : space <= 0 ? "Stok sudah penuh" : "Had baki " + limit + " " + (product.weighted ? "kg" : "unit");
      };
      minus.onclick = () => {
        input.value = Math.max(1, Number(input.value || 1) - 1);
        update();
      };
      plus.onclick = () => {
        input.value = Math.min(MAX_STOCK_PURCHASE, Math.max(0, stockCapacity(operatingStore()) - Math.floor((operatingStore().inventory[input.dataset.stockQty] || 0) / (PRODUCTS.find((p) => p.id === input.dataset.stockQty).weighted ? 1e3 : 1))), Number(input.value || 0) + 1);
        update();
      };
      input.oninput = update;
      input.onchange = () => {
        const item = PRODUCTS.find((p) => p.id === input.dataset.stockQty), u = item.weighted ? 1e3 : 1, room = Math.max(0, stockCapacity(operatingStore()) - Math.floor((operatingStore().inventory[item.id] || 0) / u));
        input.value = String(Math.max(1, Math.min(MAX_STOCK_PURCHASE, room, Math.trunc(Number(input.value) || 1))));
        update();
      };
      update();
    });
  }
  var inventoryDestination = "game";
  function showInventory(returnTo = "game") {
    if (!session || modalKind === "intro") return;
    const store = operatingStore(), quote = stockQuote(store);
    inventoryDestination = returnTo === "summary" || modalKind === "summary" ? "summary" : "game";
    const destination = inventoryDestination;
    const back = () => {
      if (destination === "summary") {
        showSummary();
        return;
      }
      closeModal();
      if (phase === "supply" && readyForCustomer()) newCustomer();
    };
    openModal("inventory", `<div class="modal-pad inventory-panel"><div class="modal-heading"><div><div class="modal-kicker">STOK & PENYELENGGARAAN</div><h2>Inventori & Bekalan</h2></div><button class="icon-btn" id="closeInventory" aria-label="Tutup">${icon("close")}</button></div><div class="inventory-money"><span>Duit kedai <b id="inventoryWallet">${money(store.wallet)}</b></span><span>Hutang pembekal <b id="inventoryDebt">${money(store.supplierDebt)}</b></span></div><button class="primary-btn" id="restockAll" ${!quote.lines.length || mode === "practice" ? "disabled" : ""}>Tambah semua stok \xB7 ${money(quote.total)}</button><p class="inventory-credit">Jika duit tidak cukup, anda boleh sahkan pembelian secara hutang. 30% kutipan jualan seterusnya digunakan untuk membayarnya.</p><div class="supply-cards"><div><b>Kertas resit</b><strong id="inventoryPaper">${store.paper} helai</strong><small>Satu helai bagi setiap jualan atau pulangan.</small><button class="secondary-btn" id="buyPaper">Beli ${PAPER_PACK} helai \xB7 ${money(PAPER_COST)}</button></div><div><b>Terminal kad</b><strong id="inventoryTerminal">${store.cardBroken ? "Rosak" : store.cardHealth + "% keadaan"}</strong><small>Rosak selepas haus atau gangguan rawak. Bayaran kad disekat sehingga dibaiki.</small><button class="secondary-btn" id="repairTerminal" ${!cardRepairCost(store) ? "disabled" : ""}>Baiki \xB7 ${money(cardRepairCost(store))}</button></div></div><div class="inventory-toolbar"><input id="inventorySearch" type="search" placeholder="Cari nama barang\u2026" aria-label="Cari inventori"><label for="inventoryStateFilter">Tapis stok</label><select id="inventoryStateFilter" aria-label="Tapis stok mengikut tahap"><option value="all">Semua stok</option><option value="empty">Stok habis (0)</option><option value="low">Stok rendah (1\u20134)</option><option value="good">Stok mencukupi (5+)</option></select><button class="secondary-btn" id="foldStock">Lipat semua</button></div><div class="inventory-list" id="inventoryGroups">${inventoryGroupsHTML(store)}</div></div><div class="inventory-confirm-layer" id="inventoryConfirmLayer" hidden></div>`);
    $("inventorySearch").oninput = filterInventory;
    $("inventoryStateFilter").onchange = filterInventory;
    $("foldStock").onclick = () => {
      $("modalContent").querySelectorAll("[data-stock-category]").forEach((el) => el.open = false);
    };
    $("closeInventory").onclick = back;
    $("restockAll").onclick = () => confirmSupply("stock", null, destination);
    $("buyPaper").onclick = () => confirmSupply("paper", null, destination);
    $("repairTerminal").onclick = () => confirmSupply("repair", null, destination);
    bindInventoryControls();
  }
  function refreshInventoryInPlace() {
    const store = operatingStore(), list = $("inventoryGroups");
    if (!list) return;
    const scrollTop = list.scrollTop, modalScroll = $("modal").scrollTop, contentScroll = $("modalContent").scrollTop, filter = $("inventoryStateFilter").value, search = $("inventorySearch").value;
    const openCategories = new Set([...list.querySelectorAll("[data-stock-category][open]")].map((x) => x.dataset.stockCategory));
    list.innerHTML = inventoryGroupsHTML(store);
    list.querySelectorAll("[data-stock-category]").forEach((group) => group.open = openCategories.has(group.dataset.stockCategory));
    $("inventoryStateFilter").value = filter;
    $("inventorySearch").value = search;
    $("inventoryWallet").textContent = money(store.wallet);
    $("inventoryDebt").textContent = money(store.supplierDebt);
    $("inventoryPaper").textContent = store.paper + " helai";
    $("inventoryTerminal").textContent = store.cardBroken ? "Rosak" : store.cardHealth + "% keadaan";
    const quote = stockQuote(store), restock = $("restockAll");
    restock.textContent = "Tambah semua stok \xB7 " + money(quote.total);
    restock.disabled = !quote.lines.length || mode === "practice";
    const repair = $("repairTerminal");
    repair.disabled = !cardRepairCost(store);
    repair.textContent = "Baiki \xB7 " + money(cardRepairCost(store));
    bindInventoryControls();
    filterInventory();
    list.scrollTop = scrollTop;
    $("modal").scrollTop = modalScroll;
    $("modalContent").scrollTop = contentScroll;
    requestAnimationFrame(() => {
      if ($("inventoryGroups") === list) {
        list.scrollTop = scrollTop;
        $("modal").scrollTop = modalScroll;
        $("modalContent").scrollTop = contentScroll;
      }
    });
  }
  function confirmSupply(type, id = null, destination = "game", units = null) {
    const store = operatingStore(), quote = type === "stock" ? stockQuote(store, id, units) : null, cost = quote ? quote.total : type === "paper" ? PAPER_COST : cardRepairCost(store);
    if (!cost || type === "repair" && !cardRepairCost(store)) return;
    const credit = store.wallet < cost, shortfall = Math.max(0, cost - store.wallet);
    const description = type === "stock" ? quote.lines.map((x) => `${x.name}: +${x.weighted ? (x.quantity / 1e3).toFixed(2) + " kg" : x.quantity + " unit"}`).join("<br>") : type === "paper" ? `${PAPER_PACK} helai kertas resit` : "Pembaikan terminal kad sehingga 100%";
    const confirmHTML = `<div class="inventory-confirm-box" role="alertdialog" aria-labelledby="inventoryConfirmHeading" aria-modal="true"><div class="modal-kicker">SEMAK SEBELUM MEMBELI</div><h2 id="inventoryConfirmHeading">Sahkan ${type === "stock" ? "tambah stok" : type === "paper" ? "kertas resit" : "pembaikan"}?</h2><div class="supply-confirm-lines">${description}</div><div class="supply-confirm-total"><span>Jumlah kos</span><strong>${money(cost)}</strong></div><p>${credit ? "Duit tidak cukup. " + money(store.wallet) + " dibayar sekarang dan " + money(shortfall) + " ditambah kepada hutang pembekal." : "Kos ini akan ditolak daripada duit kedai."}</p><button class="primary-btn" id="confirmSupply">${credit ? "Sahkan pembelian + hutang" : "Sahkan pembelian"} \xB7 ${money(cost)}</button><button class="secondary-btn" id="cancelSupply">Batal</button></div>`;
    const layer = $("inventoryConfirmLayer");
    if (layer && modalKind === "inventory") {
      layer.innerHTML = confirmHTML;
      layer.hidden = false;
    } else {
      openModal("supply-confirm", `<div class="modal-pad supply-confirm">${confirmHTML}</div>`);
    }
    const cancel = () => {
      if (layer && modalKind === "inventory") {
        layer.hidden = true;
        layer.innerHTML = "";
      } else showInventory(destination);
    };
    $("cancelSupply").onclick = cancel;
    let confirmed = false;
    $("confirmSupply").onclick = () => {
      if (confirmed) return;
      const ok = type === "stock" ? buyStock(store, quote, credit) : payStoreCost(store, cost, credit);
      if (!ok) {
        toast("Inventori berubah. Semak semula jumlah pembelian.", true);
        cancel();
        return;
      }
      confirmed = true;
      if (type === "paper") store.paper += PAPER_PACK;
      if (type === "repair") {
        store.cardBroken = false;
        store.cardHealth = 100;
        if (customer) customer.cardFailure = false;
      }
      if (type !== "stock") {
        session.expenses += cost;
        session.earned -= cost;
        if (mode === "career") progress.lifetime -= cost;
      }
      save();
      renderHeader();
      renderPayment();
      if (layer && modalKind === "inventory") {
        layer.hidden = true;
        layer.innerHTML = "";
        refreshInventoryInPlace();
      } else showInventory(destination);
      beep("success");
      toast(type === "repair" ? "Terminal kad siap dibaiki." : type === "paper" ? "Kertas resit ditambah." : "Stok kedai ditambah.");
    };
  }
  function renderCardRepair() {
    $("paymentArea").innerHTML = `<div class="machine-fault">${icon("card")}<h3>Terminal kad rosak</h3><p>Kad belum dicaj. Bayar kos pembaikan untuk guna terminal semula.</p><strong>${money(cardRepairCost(operatingStore()))}</strong><button class="primary-btn" id="repairCardNow">Baiki terminal</button><button class="secondary-btn" id="cardToCash">Minta pelanggan bayar tunai</button></div>`;
    $("repairCardNow").onclick = () => confirmSupply("repair");
    $("cardToCash").onclick = () => {
      if (paused || busy) return;
      customer.method = "cash";
      customer.requiresPin = false;
      customer.cardStage = "ready";
      customer.tender = tenderFor(amountDue(customer));
      render();
      save();
      toast("Pelanggan bersetuju bayar tunai. Terminal masih perlu dibaiki.");
    };
  }
  function recordSale(transaction) {
    const seq = ++progress.saleSequence, total = saleTotal(transaction);
    let allocated = 0;
    transaction.items.forEach((p, i) => {
      const paid = i === transaction.items.length - 1 ? total - allocated : Math.floor(total * itemPrice(p) / Math.max(1, transaction.total));
      allocated += paid;
      progress.sales.push({ id: progress.day + "-" + seq + "-" + i, receipt: "KK-" + String(seq).padStart(5, "0"), day: progress.day, productId: p.id, grams: p.grams, paid, cost: stockCost(p, stockUnits(p), progress.day), kasih: !!transaction.kasih, returned: false });
    });
    progress.sales = progress.sales.slice(-120);
  }
  function prepareReturnCustomer() {
    if (mode === "practice" || mode === "career" && rushHourActive(progress.day, session) || progress.day < 2 || session.index < 2 || (session.index + progress.day) % 4 !== 0) return;
    const record = [...progress.sales].reverse().find((x) => {
      const rule2 = returnPolicy(PRODUCTS.find((p) => p.id === x.productId));
      return rule2 && !x.kasih && !x.returned && x.paid > 0 && progress.day - x.day <= rule2.days;
    });
    if (!record) return;
    const product = PRODUCTS.find((p) => p.id === record.productId), rule = returnPolicy(product);
    customer.kind = "return";
    customer.returnId = record.id;
    customer.returnReason = rule.reason;
    customer.returnCondition = rule.condition;
    customer.returnClaim = { receipt: record.receipt, day: record.day, productId: record.productId, quantity: 1, paid: record.paid };
    if (Math.random() < 0.35) {
      const field = ["receipt", "paid", "day", "productId"][Math.floor(Math.random() * 4)];
      if (field === "receipt") customer.returnClaim.receipt = "KK-" + String(9e4 + session.index);
      else if (field === "paid") customer.returnClaim.paid += 200;
      else if (field === "day") customer.returnClaim.day = Math.max(1, record.day + 1);
      else customer.returnClaim.productId = PRODUCTS.find((p) => p.id !== product.id && p.category === product.category)?.id || "milk";
    }
    customer.items = [{ ...product, grams: record.grams, uid: "return-" + progress.day + "-" + session.index, scanned: false }];
    customer.total = record.paid;
    customer.method = "cash";
    customer.tender = 0;
    customer.hasCoupon = false;
    customer.discount = 0;
    customer.requiresPin = false;
    customer.cardFailure = false;
  }
  function ensureReturnClaim() {
    if (customer?.kind !== "return") return;
    const record = operatingStore().sales.find((x) => x.id === customer.returnId), rule = returnPolicy(customer.items[0]);
    customer.returnClaim ??= record ? { receipt: record.receipt, day: record.day, productId: record.productId, quantity: 1, paid: record.paid } : null;
    customer.returnReason ??= rule?.reason || "Saya ingin memulangkan barang ini.";
    customer.returnCondition ??= rule?.condition || "Kategori tidak layak dipulangkan";
  }
  function renderReturnPayment() {
    ensureReturnClaim();
    const area = $("paymentArea"), record = operatingStore().sales.find((x) => x.id === customer.returnId), all = customer.items.every((i) => i.scanned), rule = returnPolicy(customer.items[0]);
    if (phase === "scan") {
      area.innerHTML = `<div class="return-label">${icon("undo")} Pelanggan memulangkan barang</div><p class="payment-hint">Scan barang kemudian bandingkan resit pelanggan dengan rekod kedai.</p><button class="primary-btn" id="checkoutBtn" ${!all ? "disabled" : ""}>Semak pemulangan ${icon("arrow")}</button>`;
      $("checkoutBtn").onclick = () => {
        if (paused || !all || !ensurePaper()) return;
        phase = "offer";
        paymentMinimized = false;
        renderPayment();
        save();
      };
      return;
    }
    if (phase !== "offer") {
      area.innerHTML = "";
      return;
    }
    const receipt = customer.returnClaim, fields = [["No. resit", receipt?.receipt, record?.receipt], ["Hari pembelian", receipt ? "Hari " + receipt.day : "\u2014", record ? "Hari " + record.day : "\u2014"], ["Nama barang", PRODUCTS.find((p) => p.id === receipt?.productId)?.name, PRODUCTS.find((p) => p.id === record?.productId)?.name], ["Kuantiti", receipt?.quantity + " unit", record ? "1 unit" : "\u2014"], ["Amaun dibayar", receipt ? money(receipt.paid) : "\u2014", record ? money(record.paid) : "\u2014"]];
    area.innerHTML = `<div class="return-review"><div class="return-case"><div class="return-product">${productArt(customer.items[0].id)}<div><small>BARANG DI KAUNTER</small><h3>${customer.items[0].name}</h3><p>${customer.returnReason}</p><b>${customer.returnCondition}</b></div></div><div class="return-policy"><b>Polisi kedai</b><p>${rule ? "Pemulangan dalam " + rule.days + " hari selepas pembelian. Resit mesti sepadan." : "Kategori ini tidak layak dipulangkan."}</p><small>Hari semasa: ${progress.day} \xB7 ${record?.returned ? "Rekod sudah dipulangkan" : "Rekod belum dipulangkan"}</small></div></div><div class="receipt-compare"><div class="compare-heading"><span>MAKLUMAT</span><b>RESIT PELANGGAN</b><b>REKOD SISTEM</b></div>${fields.map(([label, claim, system]) => `<div class="compare-row"><span>${label}</span><strong>${claim || "Tidak ditemui"}</strong><strong>${system || "Tidak ditemui"}</strong></div>`).join("")}</div><div class="return-decision"><p id="returnError" class="code-error">Bandingkan maklumat dan pilih Lulus atau Tolak.</p><div><button class="primary-btn" id="approveReturn">Lulus pemulangan \xB7 ${money(receipt?.paid || 0)}</button><button class="secondary-btn danger-btn" id="rejectReturn">Tolak pemulangan</button></div></div></div>`;
    $("approveReturn").onclick = completeReturn;
    $("rejectReturn").onclick = rejectReturn;
  }
  var RETURN_DECISION_PENALTY = 500;
  function applyReturnDecisionPenalty(store) {
    if (customer.returnPenalty) return 0;
    customer.returnPenalty = true;
    payStoreCost(store, RETURN_DECISION_PENALTY, true);
    session.expenses += RETURN_DECISION_PENALTY;
    session.earned -= RETURN_DECISION_PENALTY;
    if (mode === "career") progress.lifetime -= RETURN_DECISION_PENALTY;
    return RETURN_DECISION_PENALTY;
  }
  function finishReturnDecision(payout = 0) {
    customer.paid = true;
    lastTip = 0;
    lastEarned = -payout;
    session.served++;
    if (customer.rushCustomer) {
      session.rushServed = (session.rushServed || 0) + 1;
      session.rushEarned = (session.rushEarned || 0) - payout;
    }
    session.clockMinutes = Math.min(1320, session.clockMinutes + 90);
    phase = "success";
    busy = false;
    render();
    showTransactionResult(0, 0, "Urusan pemulangan selesai.");
    save();
    advance();
  }
  function rejectReturn() {
    if (paused || busy || customer?.kind !== "return" || customer.paid || phase !== "offer" || !ensurePaper()) return;
    const store = operatingStore(), record = store.sales.find((x) => x.id === customer.returnId);
    const valid = returnMatches(record, customer.returnClaim, customer.items[0], progress.day);
    const penalty = valid ? applyReturnDecisionPenalty(store) : 0;
    finishReturnDecision(penalty);
  }
  function completeReturn() {
    if (paused || busy || customer?.kind !== "return" || customer.paid || phase !== "offer" || !ensurePaper()) return;
    const store = operatingStore(), record = store.sales.find((x) => x.id === customer.returnId), item = customer.items[0];
    const valid = returnMatches(record, customer.returnClaim, item, progress.day);
    const refund = valid ? record.paid : Math.max(0, Math.round(Number(customer.returnClaim?.paid) || 0));
    const penalty = valid ? 0 : applyReturnDecisionPenalty(store);
    payStoreCost(store, refund, true);
    if (valid) {
      const restock = returnPolicy(item).restock;
      record.returned = true;
      if (restock) store.inventory[record.productId] += 1;
    }
    if (!rushUnlimited(customer)) store.paper--;
    session.returnCount++;
    session.refunds += refund;
    const restockCost = valid && returnPolicy(item).restock ? record.cost : 0;
    const loss = refund - restockCost;
    session.earned -= loss;
    if (mode === "career") progress.lifetime -= loss;
    finishReturnDecision(loss + penalty);
  }
  document.addEventListener("pointerdown", () => {
    const result = $("transactionResult");
    if (result && !result.hidden) {
      clearTimeout(resultTimer);
      result.hidden = true;
    }
  }, true);
  function showTransactionResult(tip, starLost = 0, reason = "", overpaid = 0) {
    const el = $("transactionResult");
    clearTimeout(resultTimer);
    el.hidden = false;
    el.innerHTML = `<div class="result-check">${icon("check")}</div><small>${phase === "lost" ? "PELANGGAN TELAH PERGI" : customer?.kind === "return" ? phase === "offer" ? "SEMAKAN PEMULANGAN" : "URUSAN PULANGAN SELESAI" : "PAYMENT APPROVED"}</small><strong>${tip > 0 ? "Tip +" + money(tip) : starLost ? "Servis perlu diperbaiki" : "Terima kasih!"}</strong>${starLost ? `<div class="result-stars">${"\u2605".repeat(session.stars) + "\u2606".repeat(3 - session.stars)}</div>` : ""}<p>${starLost ? "\u2212" + starLost + " bintang \xB7 " : ""}${reason || customerLine(customer || {}, tip > 0 ? "thanks" : "thanksNoTip")}</p>${customer?.kasih?.committed ? `<p>KitaKasih ${money(customer.kasih.aid)} \xB7 Baki bantuan ${money(customer.kasih.balanceAfter)}<br>Kad dipulangkan kepada pelanggan.</p>` : ""}${overpaid ? `<span>Baki terlebih ${money(overpaid)} \xB7 ditolak pada akhir hari</span>` : ""}${customer?.rushBonus > 0 ? `<span class="result-rush-bonus">\u26A1 Bonus Rush Hour +${money(customer.rushBonus)} \xB7 \xD7${rushHourMultiplier(progress.upgrades).toFixed(1)} untung</span>` : ""}`;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    resultTimer = setTimeout(() => {
      el.hidden = true;
    }, 1450);
  }
  function ensureStyle() {
    const s = progress.settings;
    progress.ownedThemes ??= ["mint"];
    if (s.theme === "dark") {
      s.dark = true;
      s.theme = "mint";
    }
    if (["mint", "peach", "blue"].includes(s.theme) && !progress.ownedThemes.includes(s.theme)) progress.ownedThemes.push(s.theme);
    if (!progress.ownedThemes.includes(s.theme)) s.theme = "mint";
  }
  function styleChoices() {
    return [
      ["mint", "Kebun mint", 0, "#c9e6d3"],
      ["peach", "Senja pic", 1800, "#f1ceb6"],
      ["blue", "Langit biru", 1800, "#bfdde9"],
      ["lavender", "Lavender lembut", 2200, "#dcd1ed"],
      ["rose", "Mawar manis", 2200, "#efd0da"],
      ["honey", "Madu keemasan", 2500, "#f0dda4"],
      ["terracotta", "Tanah senja", 2500, "#dfb5a0"],
      ["ocean", "Laut turquoise", 2800, "#a9dcd8"]
    ];
  }
  function showStyles(selected = null) {
    const id = selected || progress.settings.theme, choice = styleChoices().find((x) => x[0] === id) || styleChoices()[0], owned = progress.ownedThemes.includes(id);
    previewTheme = null;
    applySettings();
    openModal("styles", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KOLEKSI WARNA KEDAI</div><h2>Warna untuk kedai anda.</h2></div><button class="icon-btn" id="closeStyles" aria-label="Tutup">${icon("close")}</button></div><p>Pilih warna kemudian lihat pada kedai sebenar sebelum membeli.</p><div class="theme-options">${styleChoices().map(([key, name, cost, color]) => `<button class="theme-option ${id === key ? "selected" : ""}" data-preview-theme="${key}"><span class="theme-swatch" style="background:${color}"></span><b>${name}</b><small>${progress.ownedThemes.includes(key) ? "Dimiliki" : money(cost)}</small></button>`).join("")}</div><div class="style-purchase"><span><b>${choice[1]}</b><small>Duit kedai ${money(progress.wallet)}</small></span>${!owned ? '<button class="secondary-btn" id="previewStyle">Preview kedai sebenar</button>' : ""}<button class="primary-btn" id="buyStyle" ${!owned && (mode === "practice" || progress.wallet < choice[2]) ? "disabled" : ""}>${owned ? "Gunakan warna" : "Beli \xB7 " + money(choice[2])}</button></div><button class="text-btn" id="cancelStyle">Kembali ke tetapan</button></div>`);
    $("closeStyles").onclick = () => showSettings();
    $("cancelStyle").onclick = () => showSettings();
    $("modalContent").querySelectorAll("[data-preview-theme]").forEach((b) => b.onclick = () => showStyles(b.dataset.previewTheme));
    if ($("previewStyle")) $("previewStyle").onclick = () => previewStoreStyle(id);
    $("buyStyle").onclick = () => purchaseStyle(id);
  }
  function purchaseStyle(id) {
    const choice = styleChoices().find((c) => c[0] === id);
    if (!choice) return;
    if (!progress.ownedThemes.includes(id)) {
      if (mode === "practice" || progress.wallet < choice[2]) return;
      progress.wallet -= choice[2];
      progress.ownedThemes.push(id);
    }
    progress.settings.theme = id;
    previewTheme = null;
    document.body.classList.remove("style-preview");
    applySettings();
    save();
    showStyles(id);
    toast("Warna " + choice[1] + " digunakan.");
  }
  function previewStoreStyle(id) {
    const choice = styleChoices().find((c) => c[0] === id);
    if (!choice || progress.ownedThemes.includes(id)) return;
    previewTheme = id;
    applySettings();
    setMobileView("counter");
    openModal("style-preview", `<div class="live-style-toolbar"><button class="icon-btn" id="exitStylePreview" aria-label="Keluar preview">${icon("close")}</button><div><small>PREVIEW PERCUMA \xB7 KEDAI SEBENAR</small><strong>${choice[1]}</strong><span>Kemajuan dijeda \xB7 warna belum dibeli</span></div><button class="primary-btn" id="buyPreviewStyle" ${mode === "practice" || progress.wallet < choice[2] ? "disabled" : ""}>Beli & gunakan \xB7 ${money(choice[2])}</button></div>`);
    $("exitStylePreview").onclick = () => showStyles(id);
    $("buyPreviewStyle").onclick = () => purchaseStyle(id);
  }
  function showStarRecovery() {
    if (mode !== "career" || session.stars > 0) return;
    const ledger = progress.starRecovery?.day === progress.day ? progress.starRecovery : { day: progress.day, count: 0, spent: 0 };
    progress.starRecovery = ledger;
    const cost = 1500 * (ledger.count + 1), canBuy = ledger.count < 3 && progress.wallet >= cost;
    clearTimeout(resultTimer);
    $("transactionResult").hidden = true;
    save();
    openModal("stars-empty", `<div class="modal-pad star-recovery"><div class="modal-kicker">BINTANG SERVIS HABIS</div><h2>Masa untuk mula semula.</h2><div class="empty-stars">\u2606 \u2606 \u2606</div><p>Pilih untuk ulang hari ${progress.day}, atau pulihkan 3 bintang menggunakan duit kedai.</p><div class="supply-confirm-total"><span>Pemulihan hari ini</span><strong>${ledger.count} / 3</strong></div><button class="primary-btn" id="restoreStars" ${canBuy ? "" : "disabled"}>${ledger.count >= 3 ? "Had 3 pemulihan telah digunakan" : "Pulihkan 3 bintang \xB7 " + money(cost)}</button>${!canBuy && ledger.count < 3 ? "<p>Duit kedai tidak mencukupi. Anda masih boleh ulang hari.</p>" : ""}<button class="secondary-btn" id="restartDay">Ulang hari ${progress.day}</button><small>Ulang hari memulihkan simpanan awal hari. Bilangan dan kos pemulihan bintang tidak direset.</small></div>`);
    $("restoreStars").onclick = () => {
      if (session.stars !== 0 || ledger.count >= 3 || progress.wallet < cost) return;
      progress.wallet -= cost;
      ledger.count++;
      ledger.spent += cost;
      session.stars = 3;
      session.expenses += cost;
      session.earned -= cost;
      progress.lifetime -= cost;
      modalKind = null;
      $("modal").close();
      paused = false;
      document.body.classList.remove("paused");
      render();
      save();
      if (["success", "lost"].includes(phase)) advance();
    };
    $("restartDay").onclick = () => {
      const snapshot = session.dayStart;
      if (!snapshot) return;
      const currentSettings = { ...progress.settings }, rescues = { ...ledger };
      const priorSpent = snapshot.starRecovery?.day === progress.day ? snapshot.starRecovery.spent : 0;
      const retainedUpgrades = { ...progress.upgrades };
      const retainedCategories = [...progress.unlocked];
      const retainedWallet = progress.wallet;
      progress = JSON.parse(JSON.stringify(snapshot));
      progress.settings = currentSettings;
      progress.upgrades = { ...progress.upgrades, ...retainedUpgrades };
      progress.unlocked = retainedCategories;
      progress.wallet = retainedWallet;
      progress.starRecovery = rescues;
      ensureOperations(progress);
      payStoreCost(progress, Math.max(0, rescues.spent - priorSpent), true);
      ensureStyle();
      modalKind = null;
      $("modal").close();
      paused = false;
      advancePending = false;
      document.body.classList.remove("paused", "intro-screen");
      newSession("career");
      save();
    };
  }
  function prepareScaleSound() {
    prepareScannerAudio();
    if (!audioCtx || scalePromise || typeof fetch !== "function") return;
    scalePromise = fetch("./digital-scale.wav").then((r) => r.arrayBuffer()).then((b) => audioCtx.decodeAudioData(b)).then((b) => scaleBuffer = b).catch(() => {
      scalePromise = null;
    });
  }
  function playScaleSound() {
    if (!sound || !effectVolume("scale")) return;
    prepareScaleSound();
    stopScaleSound();
    if (scaleBuffer && audioCtx) {
      try {
        const node = audioCtx.createBufferSource(), gain = audioCtx.createGain();
        node.buffer = scaleBuffer;
        gain.gain.value = effectVolume("scale");
        node.connect(gain);
        gain.connect(audioCtx.destination);
        scaleSource = { node, gain };
        node.onended = () => {
          node.disconnect();
          gain.disconnect();
          if (scaleSource?.node === node) scaleSource = null;
        };
        node.start();
        return;
      } catch {
      }
    }
    try {
      const clip = $("scaleSound");
      clip.currentTime = 0;
      clip.volume = effectVolume("scale");
      clip.play()?.catch(() => {
      });
    } catch {
    }
  }
  function stopScaleSound() {
    try {
      scaleSource?.node.stop();
    } catch {
    }
    scaleSource = null;
    try {
      $("scaleSound").pause();
      $("scaleSound").currentTime = 0;
    } catch {
    }
  }
  function playDrawerSound() {
    if (!sound || effectVolume("drawer") === 0) return;
    try {
      const clip = $("drawerSound");
      if (!clip) return;
      clip.pause();
      clip.currentTime = 0;
      clip.volume = effectVolume("drawer");
      const result = clip.play();
      result?.catch(() => {
      });
    } catch {
    }
  }
  function stopDrawerSound() {
    try {
      const clip = $("drawerSound");
      if (clip) {
        clip.pause();
        clip.currentTime = 0;
      }
    } catch {
    }
  }
  function effectChoices() {
    return [["scanner", "Scanner barcode"], ["scale", "Penimbang digital"], ["drawer", "Buka laci baki tunai"], ["chaching", "Cha-ching / bayaran"], ["tap", "Sentuhan butang"], ["coin", "Wang & syiling"], ["success", "Bayaran digital berjaya"], ["error", "Amaran / ralat"], ["start", "Mula syif"]];
  }
  function effectLevel(id) {
    const v = Number(progress.settings.effects?.[id] ?? 1);
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
  }
  function effectVolume(id) {
    return audioVolume() * effectLevel(id);
  }
  function refreshEffectLevels() {
    for (const [key, source, audio] of [["scanner", scannerSource, "scannerSound"], ["scale", scaleSource, "scaleSound"], ["drawer", drawerSource, "drawerSound"], ["chaching", chaChingSource, "chaChingSound"]]) {
      if (source?.gain) source.gain.gain.value = effectVolume(key);
      try {
        $(audio).volume = effectVolume(key);
      } catch {
      }
    }
  }
  function previewEffect(id) {
    if (id === "scale") playScaleSound();
    else if (id === "drawer") playDrawerSound();
    else if (id === "chaching") playChaChing();
    else if (id === "scanner") playScannerSound();
    else if (id === "tap") playTapSound();
    else beep(id);
  }
  function effectSettingsHTML() {
    return `<details class="effect-mixer"><summary>Volume setiap bunyi</summary><p>Volume utama \xD7 volume bunyi. 0% untuk senyapkan satu bunyi sahaja.</p><div>${effectChoices().map(([id, label]) => `<div class="effect-channel"><label for="effect-${id}">${label} <b id="effect-label-${id}">${Math.round(effectLevel(id) * 100)}%</b></label><input type="range" min="0" max="100" step="5" id="effect-${id}" data-effect="${id}" value="${Math.round(effectLevel(id) * 100)}"><button class="secondary-btn" data-preview-effect="${id}" aria-label="Cuba bunyi ${label}">${icon("play")}</button></div>`).join("")}</div></details>`;
  }
  function bindEffectSettings() {
    $("modalContent").querySelectorAll("[data-effect]").forEach((el) => el.oninput = () => {
      progress.settings.effects ??= {};
      progress.settings.effects[el.dataset.effect] = Number(el.value) / 100;
      $("effect-label-" + el.dataset.effect).textContent = el.value + "%";
      refreshEffectLevels();
      save();
    });
    $("modalContent").querySelectorAll("[data-preview-effect]").forEach((el) => el.onclick = () => previewEffect(el.dataset.previewEffect));
  }
  function inventoryGroupsHTML(store) {
    const all = PRODUCTS.filter((p) => store.unlocked.includes(p.category));
    return CATEGORIES.filter((c) => store.unlocked.includes(c.id)).map((c) => {
      const list = all.filter((p) => p.category === c.id), low = list.filter((p) => inventoryStateFor(p, store) !== "good").length;
      return `<details class="stock-category" data-stock-category="${c.id}" open><summary><span>${c.name}</span><small>${list.length} barang${low ? " \xB7 " + low + " memerlukan stok" : ""}</small></summary><div class="stock-grid">${list.map((p) => {
        const count = store.inventory[p.id] || 0, weighted = !!p.weighted, multiplier = weighted ? 1e3 : 1;
        const state = inventoryStateFor(p, store), lowStock = state !== "good";
        const unitLabel = weighted ? "kg" : "unit", units = 1;
        const remaining = Math.max(0, stockCapacity(store) - Math.floor(count / multiplier));
        const delta = wholesaleChange(p, store.day);
        const trendLabel = store.day <= 1 ? "Harga hari ini" : delta > 0 ? "\u25B2 Naik " + delta + "%" : delta < 0 ? "\u25BC Turun " + Math.abs(delta) + "%" : "Harga stabil";
        const badge = state === "empty" ? '<small class="stock-level empty">Stok habis</small>' : state === "low" ? '<small class="stock-level low">Stok rendah</small>' : '<small class="stock-level good">Stok mencukupi</small>';
        return `<article class="stock-card ${lowStock ? "low-stock" : ""}" data-stock-name="${p.name.toLowerCase()}" data-state="${state}">${productImage(p.id)}<div><b>${p.name}</b><span>${weighted ? (count / 1e3).toFixed(2) + " kg" : count + " unit"} ${badge}</span><small>Jual ${money(p.price)}${weighted ? "/kg" : ""} \xB7 Borong ${money(stockCost(p, multiplier, store.day))}/${unitLabel}</small><small class="wholesale-trend ${delta > 0 ? "up" : delta < 0 ? "down" : "stable"}">${trendLabel}</small></div><meter min="0" max="${stockCapacity(store)}" value="${Math.min(stockCapacity(store), count / multiplier)}" aria-label="Stok ${p.name}"></meter><div class="stock-buy-picker"><span>Kuantiti beli (${unitLabel}) \xB7 Baki ${remaining}</span><div class="stock-qty-controls"><button type="button" data-stock-minus="${p.id}" aria-label="Kurangkan kuantiti ${p.name}">\u2212</button><input data-stock-qty="${p.id}" inputmode="numeric" type="number" min="1" max="${MAX_STOCK_PURCHASE}" step="1" value="1" aria-label="Kuantiti untuk ${p.name}"><button type="button" data-stock-plus="${p.id}" aria-label="Tambah kuantiti ${p.name}">+</button></div></div><button type="button" class="secondary-btn stock-buy-action" data-restock="${p.id}" ${mode === "practice" || remaining === 0 ? "disabled" : ""}>Beli 1 ${unitLabel} \xB7 ${money(stockCost(p, multiplier, store.day))}</button></article>`;
      }).join("")}</div></details>`;
    }).join("");
  }
  function filterInventory() {
    const term = $("inventorySearch").value.toLowerCase().trim(), state = inventorySelectedFilter();
    const cards = $("modalContent").querySelectorAll("[data-stock-name]");
    cards.forEach((el) => el.hidden = !el.dataset.stockName.includes(term) || state !== "all" && el.dataset.state !== state);
    $("modalContent").querySelectorAll("[data-stock-category]").forEach((group) => {
      group.hidden = ![...group.querySelectorAll("[data-stock-name]")].some((el) => !el.hidden);
      if (term || state !== "all") group.open = true;
    });
  }
  function renderReturnReceipt() {
    ensureReturnClaim();
    const item = customer.items[0], claim = customer.returnClaim, total = item.scanned ? claim?.paid || 0 : 0;
    $("roundingRow")?.remove();
    $("discountRow")?.remove();
    $("receiptQuantity").textContent = "(" + Number(!!item.scanned) + " barang)";
    $("receiptNo").textContent = claim?.receipt || "PULANGAN";
    $("receiptSub").textContent = "Amaun dituntut \xB7 belum disahkan";
    $("subtotal").textContent = money(total);
    $("total").textContent = money(total);
    $("receiptList").innerHTML = item.scanned ? `<div class="receipt-row"><span class="row-emoji">${productArt(item.id)}</span><span class="row-info"><b>${item.name}</b><small>Pemulangan \xB7 1 unit</small></span><strong>${money(total)}</strong></div>` : `<div class="receipt-empty">${icon("undo")}<b>Barang pemulangan belum discan</b><small>Tekan barang di conveyor untuk semak.</small></div>`;
  }
  function cardGeometry() {
    const card = $("swipeCard"), scene = $("payDevice"), target = $("cardReaderTarget");
    if (!card || !scene || !target) return null;
    const plain = (el) => {
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
    };
    return { c: plain(card), t: plain(target), r: plain(scene) };
  }
  function cardDropAccepted(c, t) {
    const centerX = c.left + c.width / 2, centerY = c.top + c.height / 2, targetX = t.left + t.width / 2, targetY = t.top + t.height / 2;
    return Math.abs(centerX - targetX) <= Math.max(42, t.width * 0.56) && Math.abs(centerY - targetY) <= Math.max(30, t.height * 0.7);
  }
  function setCardPose(realign = false) {
    const el = $("swipeCard");
    if (!el) return;
    if (realign) {
      customer.cardPose = null;
      el.style.setProperty("--card-x", "0px");
      el.style.setProperty("--card-y", "0px");
    }
    let pose = customer.cardPose;
    if (!pose && customer.cardStage !== "ready") {
      const g = cardGeometry();
      if (g) {
        const { c, t } = g;
        pose = { x: t.left + t.width / 2 - c.left - c.width * 0.5, y: t.top + t.height / 2 - c.top - c.height / 2 };
        customer.cardPose = pose;
      }
    }
    if (pose) {
      el.style.setProperty("--card-x", pose.x + "px");
      el.style.setProperty("--card-y", pose.y + "px");
    }
  }
  function cancelBankCardDrag() {
    if (!bankCardDrag) return;
    bankCardDrag = null;
    const el = $("swipeCard");
    if (el) {
      el.classList.remove("dragging");
      el.style.setProperty("--card-x", "0px");
      el.style.setProperty("--card-y", "0px");
    }
    if ($("payDevice")) $("payDevice").classList.remove("card-in-range");
  }
  function bindBankCardDrag() {
    const el = $("swipeCard"), scene = $("payDevice"), transaction = customer;
    let keyPose = { x: 0, y: 0 };
    const allowed = () => transaction === customer && !paused && !busy && phase === "offer" && customer.cardStage === "ready";
    const reset = () => {
      cancelBankCardDrag();
      el.classList.remove("dragging");
      el.classList.add("returning");
      el.style.setProperty("--card-x", "0px");
      el.style.setProperty("--card-y", "0px");
      keyPose = { x: 0, y: 0 };
      scene.classList.remove("card-in-range");
      setTimeout(() => el.classList.remove("returning"), 200);
    };
    const move = (dx, dy, base) => {
      const r = base.r, c = base.c;
      dx = Math.max(r.left + 5 - c.left, Math.min(r.right - 5 - c.right, dx));
      dy = Math.max(r.top + 5 - c.top, Math.min(r.bottom - 25 - c.bottom, dy));
      el.style.setProperty("--card-x", dx + "px");
      el.style.setProperty("--card-y", dy + "px");
      const translated = { ...c, left: c.left + dx, top: c.top + dy };
      const valid = cardDropAccepted(translated, base.t);
      scene.classList.toggle("card-in-range", valid);
      return { x: dx, y: dy, valid };
    };
    const finish = (pose) => {
      el.classList.remove("dragging");
      bankCardDrag = null;
      if (!allowed() || !pose?.valid) {
        reset();
        return;
      }
      const g = cardGeometry();
      if (g) {
        customer.cardPose = { x: g.t.left + g.t.width * 0.5 - g.c.left - g.c.width * 0.5, y: g.t.top + g.t.height * 0.5 - g.c.top - g.c.height * 0.5 };
      } else customer.cardPose = { x: pose.x, y: pose.y };
      customer.cardContactReady = true;
      startDigital(true);
    };
    el.onpointerdown = (e) => {
      if (!allowed() || e.button > 0 || bankCardDrag) return;
      const base = cardGeometry();
      if (!base) return;
      base.c.left -= keyPose.x;
      base.c.right -= keyPose.x;
      base.c.top -= keyPose.y;
      base.c.bottom -= keyPose.y;
      el.classList.remove("returning");
      bankCardDrag = { pointer: e.pointerId, x: e.clientX - keyPose.x, y: e.clientY - keyPose.y, base, pose: { x: 0, y: 0, valid: false }, moved: false };
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("dragging");
      e.preventDefault?.();
    };
    el.onpointermove = (e) => {
      const d = bankCardDrag;
      if (!d || e.pointerId !== d.pointer) return;
      if (!allowed()) {
        reset();
        return;
      }
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.moved ||= Math.hypot(dx, dy) > 8;
      d.pose = move(dx, dy, d.base);
    };
    el.onpointerup = (e) => {
      const d = bankCardDrag;
      if (!d || e.pointerId !== d.pointer) return;
      if (d.moved) {
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        d.pose = move(dx, dy, d.base);
      }
      finish(d.moved ? d.pose : null);
    };
    el.onpointercancel = reset;
    el.onlostpointercapture = () => {
      if (bankCardDrag) reset();
    };
    el.onclick = () => {
    };
    el.onkeydown = (e) => {
      if (!allowed()) return;
      const shifts = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      if (e.key === "Escape") {
        e.preventDefault();
        reset();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish(keyPose);
        return;
      }
      if (!shifts[e.key]) return;
      e.preventDefault();
      const base = cardGeometry();
      base.c.left -= keyPose.x;
      base.c.right -= keyPose.x;
      base.c.top -= keyPose.y;
      base.c.bottom -= keyPose.y;
      keyPose = move(keyPose.x + shifts[e.key][0], keyPose.y + shifts[e.key][1], base);
    };
  }
  function positionCustomerDialogue() {
    const scene = document.querySelector(".store-scene"), art = $("customerArt"), bubble = $("speech"), info = $("customerInfo");
    if (!scene || !art || !bubble || !info || !customer) return;
    const sceneBox = scene.getBoundingClientRect();
    if (!sceneBox.width || !sceneBox.height) return;
    const compact = sceneBox.width < 520, veryNarrow = sceneBox.width < 390;
    art.style.left = compact ? "34%" : "";
    const center = art.offsetLeft, half = art.offsetWidth / 2;
    const charLeft = center - half, charRight = center + half;
    const gap = compact ? 12 : 22, edge = compact ? 9 : 15;
    const rightRoom = sceneBox.width - charRight - gap - edge, leftRoom = charLeft - gap - edge;
    const onRight = rightRoom >= 112 || rightRoom >= leftRoom;
    const free = Math.max(1, onRight ? rightRoom : leftRoom);
    const width = Math.max(1, Math.min(compact ? veryNarrow ? 148 : 185 : 240, free));
    const left = onRight ? charRight + gap : charLeft - gap - width;
    bubble.classList.toggle("speech-left", !onRight);
    bubble.style.left = Math.round(Math.max(edge, left)) + "px";
    bubble.style.right = "auto";
    bubble.style.width = Math.floor(width) + "px";
    bubble.style.maxWidth = Math.floor(width) + "px";
    bubble.style.minWidth = "0";
    bubble.style.bottom = "auto";
    bubble.style.transform = "none";
    const infoTop = info.getBoundingClientRect().top - sceneBox.top;
    const safeSpace = Math.max(32, infoTop - 26);
    bubble.style.maxHeight = safeSpace + "px";
    const height = bubble.getBoundingClientRect().height;
    const target = art.offsetTop + Math.round(art.offsetHeight * 0.14);
    bubble.style.top = Math.round(Math.max(10, Math.min(target, infoTop - height - 12))) + "px";
  }
  window.addEventListener("resize", () => {
    cancelBankCardDrag();
    if (customer?.method === "card" && ["pin", "processing", "contact"].includes(customer.cardStage)) setCardPose(true);
    if (!$("floatingCalculator")?.hidden && calculatorPosition) positionCalculator(calculatorPosition.x, calculatorPosition.y);
    requestAnimationFrame(positionCustomerDialogue);
  });
  window.visualViewport?.addEventListener("resize", () => {
    if (!$("floatingCalculator")?.hidden && calculatorPosition) positionCalculator(calculatorPosition.x, calculatorPosition.y);
  });
  document.addEventListener("fullscreenchange", () => requestAnimationFrame(positionCustomerDialogue));
  if (typeof ResizeObserver !== "undefined") {
    const sceneObserver = new ResizeObserver(() => requestAnimationFrame(positionCustomerDialogue));
    const scene = document.querySelector(".store-scene");
    if (scene) sceneObserver.observe(scene);
    sceneObserver.observe($("speech"));
  }
  function ensureUpdatePrompt() {
    if (updatePrompt) return updatePrompt;
    updatePrompt = document.createElement("button");
    updatePrompt.type = "button";
    updatePrompt.className = "update-prompt";
    updatePrompt.hidden = true;
    updatePrompt.setAttribute("aria-live", "polite");
    updatePrompt.innerHTML = `<span>${icon("spark")}</span><span class="update-prompt-copy"><b>Versi baharu tersedia</b><small>Tekan untuk kemas kini sekarang</small></span>`;
    updatePrompt.onclick = applyRemoteUpdate;
    document.body.append(updatePrompt);
    return updatePrompt;
  }
  function showUpdatePrompt(version = "baru") {
    if (updatingNow) return;
    const el = ensureUpdatePrompt();
    el.hidden = false;
    el.disabled = false;
    el.dataset.version = version;
  }
  function hideUpdatePrompt() {
    if (updatePrompt) updatePrompt.hidden = true;
  }
  var updatingNow = false;
  async function applyRemoteUpdate() {
    if (updatingNow) return;
    const button = ensureUpdatePrompt(), targetVersion = button.dataset.version;
    updatingNow = true;
    button.disabled = true;
    button.querySelector(".update-prompt-copy").innerHTML = "<b>Sedang mengemas kini...</b><small>Sila tunggu sebentar</small>";
    try {
      save();
      if (cloud?.getUser?.()) {
        await cloud.flush();
        if (!cloud.isSavedRemotely()) throw new Error("Progres belum selesai disimpan");
      } else if (cloud && !cloud.isSavedLocally()) {
        throw new Error("Simpanan peranti belum berjaya");
      }
      const url = new URL(location.href);
      url.searchParams.set("release", targetVersion || String(Date.now()));
      url.searchParams.set("refresh", String(Date.now()));
      location.replace(url.href);
    } catch {
      updatingNow = false;
      button.disabled = false;
      button.querySelector(".update-prompt-copy").innerHTML = "<b>Kemas kini ditangguhkan</b><small>Semak internet dan simpanan, kemudian tekan untuk cuba semula</small>";
      button.hidden = false;
    }
  }
  async function checkForRemoteUpdate() {
    try {
      const response = await fetch(`${UPDATE_CHECK_URL}?check=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data?.version === "string" && /^[a-zA-Z0-9._-]{1,100}$/.test(data.version)) {
        if (data.version !== APP_BUILD) showUpdatePrompt(data.version);
        else hideUpdatePrompt();
      }
    } catch {
    }
  }
  function startUpdateChecker() {
    checkForRemoteUpdate();
    clearInterval(updateCheckTimer);
    updateCheckTimer = setInterval(checkForRemoteUpdate, 6e4);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkForRemoteUpdate();
    });
  }
  function setupMobileControls() {
    const nav = $("gameTools"), topbar = document.querySelector(".topbar"), slot = $("mobileControlsSlot"), toggle = $("mobileControlsToggle");
    if (!nav || !topbar || !slot || !toggle) return;
    const media = window.matchMedia("(max-width:760px)");
    const update = () => {
      if (media.matches) {
        if (nav.parentElement !== slot) slot.append(nav);
        nav.hidden = !nav.classList.contains("mobile-expanded");
        toggle.setAttribute("aria-expanded", String(!nav.hidden));
        toggle.querySelector(".mobile-chevron").textContent = nav.hidden ? "\u25BE" : "\u25B4";
      } else {
        if (nav.parentElement !== topbar) topbar.append(nav);
        nav.hidden = false;
        nav.classList.remove("mobile-expanded");
        toggle.setAttribute("aria-expanded", "false");
      }
    };
    toggle.onclick = () => {
      const expanded = !nav.classList.contains("mobile-expanded");
      nav.classList.toggle("mobile-expanded", expanded);
      nav.hidden = !expanded;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.querySelector(".mobile-chevron").textContent = expanded ? "\u25B4" : "\u25BE";
    };
    nav.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      if (!media.matches || !nav.classList.contains("mobile-expanded")) return;
      nav.classList.remove("mobile-expanded");
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".mobile-chevron").textContent = "\u25BE";
    }));
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);
    update();
  }
  setupMobileControls();
  cloud.start();
  startUpdateChecker();
  function prepareKasihCustomer(rush) {
    if (rush || customer.kind === "return" || customer.kind === "kitafood") return;
    if (mode === "practice" ? session.index % 3 !== 0 : session.index % 4 !== 1) return;
    const account = kasihAccount(operatingStore(), customer.person);
    customer.kasih = { id: progress.day + "-" + session.index + "-" + customer.person.id, card: account.card, balanceBefore: account.balance, verified: false, reserved: false, committed: false };
    customer.method = "kasih";
    customer.requiresPin = false;
    customer.cardDeclineReason = null;
    customer.patience += 15;
  }
  function renderKasih() {
    const c = customer, k = c.kasih, q = kasihQuote(c), area = $("paymentArea");
    const active = () => customer === c && !paused && !busy && phase === "offer" && c.method === "kasih" && !c.paid;
    area.innerHTML = `<section class="kasih-panel kasih-pro"><header><div><span class="kasih-pill">KitaKasih</span><small>Terminal bantuan kedai</small></div><span class="kasih-connection"><i></i> ${k.verified ? "Kad disahkan" : "Sedia"}</span></header><div class="kasih-pro-grid"><div class="kasih-pro-hardware"><button class="kasih-reader pro-reader" id="kasihReader" aria-label="Baca kad KitaKasih"><span class="pro-reader-brand">KITA \xB7 SMART TERMINAL</span><span class="pro-reader-screen"><small>${k.verified ? "BAKI BANTUAN" : "PENGESAHAN KAD"}</small><b>${k.verified ? money(k.balanceBefore) : "Sila baca kad"}</b><span>${k.verified ? c.person.name : "Tekan kad atau seret ke pembaca"}</span><i>${icon(k.verified ? "check" : "card")} ${k.verified ? "Kad aktif" : "Menunggu kad"}</i></span><span class="pro-reader-slot"><i></i></span><span class="pro-reader-contact">${icon("scan")} PEMBACA KAD</span></button><button class="kasih-card pro-aid-card ${k.verified ? "verified" : ""}" id="kasihCard" aria-label="Semak kad KitaKasih pelanggan"><span class="aid-id-heading">KAD KOMUNITI<span>KEDAI KITA \xB7 KitaKasih</span></span><span class="aid-id-pattern" aria-hidden="true"></span><span class="aid-id-photo">${avatar(c.person)}</span><span class="aid-id-chip" aria-hidden="true"></span><span class="aid-id-data"><small>NAMA PEMEGANG</small><strong>${c.person.name}</strong><small>ID PELANGGAN</small><b>${k.card}</b><em>AHLI KOMUNITI \xB7 AKTIF</em></span><span class="aid-id-footer">KAD REKAAN \xB7 UNTUK PERMAINAN SAHAJA</span></button><span class="kasih-device-caption">${k.verified ? "Kad pelanggan telah disahkan" : "Tekan kad atau seret ke pembaca"}</span></div><div class="kasih-pro-receipt"><div class="kasih-review-title"><span>SEMAKAN BELIAN</span><b>${money(netTotal(c))}</b></div>${c.hasCoupon ? `<div class="kasih-coupon ${c.couponApplied ? "applied" : ""}"><span>${icon("receipt")}<b>${c.couponApplied ? "Kupon 10% digunakan" : "Pelanggan minta kupon 10%"}</b></span>${c.couponApplied ? `<strong>\u2212${money(c.discount)}</strong>` : '<button id="kasihCoupon" class="secondary-btn">Gunakan kupon</button>'}</div>` : ""}<div class="kasih-breakdown"><div><span>Barang layak${c.couponApplied ? " selepas kupon" : ""}</span><b>${money(q.eligible)}</b></div><div><span>Barang tidak layak</span><b>${money(q.ineligible)}</b></div><div class="kasih-funded"><span>Daripada KitaKasih</span><b>${k.verified ? money(q.aid) : "\u2014"}</b></div><div><span>Baki bantuan selepas bayaran</span><b>${k.verified ? money(q.balanceAfter) : "\u2014"}</b></div><div class="kasih-extra"><span>Bayaran tambahan</span><b>${k.verified ? money(q.remaining) : "\u2014"}</b></div></div><p class="kasih-note" role="status">${!k.verified ? "Sahkan kad untuk semak bantuan dan bayaran tambahan." : q.remaining ? "Pilih kaedah untuk baki belian. Bantuan belum dipotong." : "Bantuan mencukupi. Sahkan untuk lengkapkan pembelian."}</p>${k.verified ? q.remaining ? `<div class="kasih-actions">${availablePaymentMethods(progress.upgrades, mode === "practice").map((m) => `<button class="secondary-btn" data-kasih-method="${m}">${icon(m)} ${{ cash: "Tunai", card: "Kad debit", qr: "QR" }[m]}</button>`).join("")}</div><small class="kasih-rounding-note">Tambahan tunai dibundarkan kepada 5 sen.</small>` : '<button id="kasihConfirm" class="primary-btn">Sahkan bayaran & pulangkan kad</button>' : '<div class="kasih-awaiting">' + icon("lock") + " Menunggu pengesahan kad</div>"}<button id="kasihCancel" class="text-btn">Bayar sendiri tanpa bantuan</button></div></div><footer class="kasih-pro-footer"><span>${icon("lock")} Kad rekaan \xB7 Simulasi dalam permainan</span><b>KITA PAY</b></footer></section>`;
    const verify = () => {
      if (!active()) return;
      const a = kasihAccount(operatingStore(), c.person);
      k.balanceBefore = a.balance;
      k.verified = true;
      beep("coin");
      renderKasih();
      renderReceipt();
      save();
    };
    $("kasihReader").onclick = verify;
    const card = $("kasihCard");
    let start = null, suppressClick = false;
    card.onclick = () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      verify();
    };
    const resetCard = () => {
      start = null;
      card.style.transform = "";
      card.style.zIndex = "";
    };
    card.onpointerdown = (e) => {
      if (!active() || e.button > 0) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId, scale: card.getBoundingClientRect().width / card.offsetWidth || 1, moved: false };
      suppressClick = false;
      card.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    card.onpointermove = (e) => {
      if (!start || start.id !== e.pointerId) return;
      start.moved ||= Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6;
      card.style.transform = `translate(${(e.clientX - start.x) / start.scale}px,${(e.clientY - start.y) / start.scale}px)`;
      card.style.zIndex = "3";
    };
    card.onpointerup = (e) => {
      if (!start || start.id !== e.pointerId) return;
      const hit = inside(e, $("kasihReader").getBoundingClientRect()), moved = start.moved;
      resetCard();
      suppressClick = moved;
      if (moved && hit) verify();
    };
    card.onpointercancel = resetCard;
    card.onlostpointercapture = () => {
      if (start) resetCard();
    };
    if ($("kasihCoupon")) $("kasihCoupon").onclick = () => {
      if (!active() || k.reserved) return;
      if (applyCoupon(c)) {
        renderReceipt();
        renderScene();
        renderKasih();
        syncPaymentSurface();
        save();
        beep("coin");
      }
    };
    area.querySelectorAll("[data-kasih-method]").forEach((b) => b.onclick = () => {
      if (!active() || !k.verified) return;
      k.reserved = true;
      c.method = b.dataset.kasihMethod;
      c.tender = tenderFor(amountDue(c));
      resetDigitalAttempt(c);
      cashPicked = [];
      render();
      save();
    });
    if ($("kasihConfirm")) $("kasihConfirm").onclick = () => {
      if (!active() || !k.verified) return;
      k.reserved = true;
      completePayment(c);
    };
    if ($("kasihCancel")) $("kasihCancel").onclick = () => {
      if (!active()) return;
      delete c.kasih;
      c.method = "cash";
      c.tender = tenderFor(amountDue(c));
      render();
      save();
      toast("Bantuan tidak dipotong. Pelanggan bayar tunai.");
    };
  }
  function showKasihHistory() {
    const store = operatingStore(), receipts = store.kitaKasih?.receipts || [];
    openModal("kasih-history", `<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">SIMULASI BANTUAN DALAM PERMAINAN</div><h2>Resit KitaKasih</h2></div><button class="icon-btn" id="closeKasihHistory" aria-label="Tutup">${icon("close")}</button></div><p>Rekod 20 transaksi terkini. Baki kad rekaan disimpan mengikut pelanggan. Baki awal pelanggan baharu rawak RM10\u2013RM100, tanpa tambah nilai automatik. Baki sedia ada dikekalkan.</p><div class="kasih-history">${receipts.length ? receipts.map((r) => `<article><b>${r.name} \xB7 ${r.card}</b><small>Hari ${r.day} \xB7 ${r.id}</small><div><span>Jumlah belian</span><b>${money(r.total)}</b></div><div><span>KitaKasih</span><b>${money(r.aid)}</b></div><div><span>Tambahan (${{ cash: "tunai", card: "kad", qr: "QR", kasih: "tiada" }[r.method] || r.method})</span><b>${money(r.extra)}</b></div><div><span>Baki bantuan</span><b>${money(r.balance)}</b></div></article>`).join("") : "<p>Belum ada transaksi. Pelanggan KitaKasih pertama muncul sebagai pelanggan kedua syif biasa. Dalam latihan, pelanggan pertama menggunakan KitaKasih.</p>"}</div></div>`);
    $("closeKasihHistory").onclick = closeModal;
  }
  var kasihHistoryButton = document.createElement("button");
  kasihHistoryButton.type = "button";
  kasihHistoryButton.className = "text-btn kasih-history-button";
  kasihHistoryButton.textContent = "Resit KitaKasih";
  kasihHistoryButton.onclick = showKasihHistory;
  $("receiptSub").parentElement.append(kasihHistoryButton);

  // entry.mjs
  window.__KEDAI_GAME_READY__ = true;
})();
