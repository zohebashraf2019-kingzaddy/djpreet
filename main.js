(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  const nav = $("#nav"), toggle = $("#navToggle"), links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", links).forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
  }));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });

  /* ---------- Ember particles ---------- */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = $("#embers"), ctx = cv.getContext("2d");
  let W, H, parts = [];
  const resize = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    const count = Math.min(90, Math.round(innerWidth / 14));
    parts = Array.from({ length: count }, () => spawn(true));
  };
  const spawn = (rand) => ({
    x: Math.random() * W, y: rand ? Math.random() * H : H + 10,
    r: Math.random() * 1.8 + 0.4, s: Math.random() * 0.5 + 0.15,
    a: Math.random() * 0.6 + 0.2, w: Math.random() * 2 * Math.PI,
    h: Math.random() < 0.7 ? "246,200,110" : "255,140,50"
  });
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.s * (document.body.classList.contains("is-playing") ? 2.2 : 1);
      p.w += 0.02; p.x += Math.sin(p.w) * 0.3;
      if (p.y < -10) Object.assign(p, spawn(false));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, 7);
      ctx.fillStyle = `rgba(${p.h},${p.a})`; ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${p.h},1)`; ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  if (!reduce) { resize(); addEventListener("resize", resize); tick(); }

  /* ---------- Videos ---------- */
  const vids = $$(".vid");
  const vio = new IntersectionObserver((ents) => ents.forEach((e) => {
    const v = $("video", e.target);
    if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.35 });
  vids.forEach((fig) => {
    vio.observe(fig);
    fig.addEventListener("click", () => {
      const v = $("video", fig), unmute = v.muted;
      vids.forEach((o) => { $("video", o).muted = true; o.classList.remove("is-unmuted"); });
      if (unmute) {
        v.muted = false; v.currentTime = 0; v.play().catch(() => {});
        fig.classList.add("is-unmuted");
        if (widget) widget.pause();
      }
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb);
  $$(".ph").forEach((b) => b.addEventListener("click", () => {
    lbImg.src = b.dataset.full; lbImg.alt = $("img", b).alt; lb.hidden = false;
  }));
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) lb.hidden = true; });
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

  /* ---------- SoundCloud + mini player ---------- */
  const mini = $("#mini"), miniTitle = $("#miniTitle"), miniProg = $("#miniProg");
  let widget = null, playing = false;
  const showMini = () => mini.classList.add("is-visible");
  const setPlaying = (p) => {
    playing = p; document.body.classList.toggle("is-playing", p);
    $("#miniToggle").setAttribute("aria-label", p ? "Pause" : "Play");
    if (p) {
      showMini();
      vids.forEach((o) => { $("video", o).muted = true; o.classList.remove("is-unmuted"); });
    }
  };
  const updateTitle = () => widget && widget.getCurrentSound((s) => { if (s && s.title) miniTitle.textContent = s.title; });

  if (window.SC && SC.Widget) {
    widget = SC.Widget($("#scWidget"));
    widget.bind(SC.Widget.Events.READY, () => {
      updateTitle();
      widget.bind(SC.Widget.Events.PLAY, () => { setPlaying(true); updateTitle(); });
      widget.bind(SC.Widget.Events.PAUSE, () => setPlaying(false));
      widget.bind(SC.Widget.Events.FINISH, () => setPlaying(false));
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => { miniProg.style.width = (e.relativePosition * 100).toFixed(1) + "%"; });
    });
  }
  const startMusic = () => {
    showMini();
    if (!widget) { window.open("https://soundcloud.com/djpreet775", "_blank", "noopener"); return; }
    widget.play();
    // Some mobile browsers require tapping inside the player itself
    setTimeout(() => { if (!playing) $("#mixes").scrollIntoView({ behavior: "smooth" }); }, 1400);
  };
  $("#heroPlay").addEventListener("click", startMusic);
  $("#mixPlay").addEventListener("click", startMusic);
  $("#miniToggle").addEventListener("click", () => { if (!widget) return startMusic(); playing ? widget.pause() : widget.play(); });
  $("#miniNext").addEventListener("click", () => widget && widget.next());
  $("#miniClose").addEventListener("click", () => { if (widget) widget.pause(); mini.classList.remove("is-visible"); });
  // Reveal the docked player once visitors reach the mixes section
  new IntersectionObserver((e) => { if (e[0].isIntersecting) showMini(); }, { threshold: 0.4 }).observe($("#mixes"));

  /* ---------- Calendar ---------- */
  const events = (window.DJ_EVENTS || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const byDate = {}; events.forEach((e) => (byDate[e.date] = byDate[e.date] || []).push(e));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let view = new Date(today.getFullYear(), today.getMonth(), 1);

  const renderCal = () => {
    $("#calTitle").textContent = view.toLocaleString("en-US", { month: "long", year: "numeric" });
    const grid = $("#calGrid"); grid.innerHTML = "";
    const first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < first; i++) grid.insertAdjacentHTML("beforeend", '<span class="day day--empty"></span>');
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d), key = iso(date), evs = byDate[key];
      const past = date < today, el = document.createElement("button");
      el.type = "button"; el.className = "day"; el.innerHTML = `<span>${d}</span>`;
      if (+date === +today) el.classList.add("day--today");
      if (past) el.classList.add("day--past");
      if (evs) {
        const show = evs.find((e) => e.type === "show");
        el.classList.add(show ? "day--show" : "day--booked");
        el.insertAdjacentHTML("beforeend", "<i></i>");
        el.title = show ? show.title : "Booked";
        if (show) el.addEventListener("click", () => {
          const li = document.getElementById("ev-" + key);
          if (li) { li.scrollIntoView({ behavior: "smooth", block: "center" }); li.animate([{ boxShadow: "0 0 0 2px #f6d78b" }, { boxShadow: "0 0 0 0 transparent" }], 1400); }
        });
        else el.disabled = true;
      } else if (!past) {
        el.classList.add("day--open");
        el.title = "Open, tap to request this date";
        el.addEventListener("click", () => { $("#fDate").value = key; $("#book").scrollIntoView({ behavior: "smooth" }); });
      } else el.disabled = true;
      grid.appendChild(el);
    }
  };
  $("#calPrev").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); renderCal(); });
  $("#calNext").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); renderCal(); });
  renderCal();

  const evHTML = (e) => {
    const d = parse(e.date), where = [e.venue, e.city].filter(Boolean).join(", ");
    return `<li class="ev" id="ev-${e.date}">
      <div class="ev__date"><b>${d.getDate()}</b><span>${MON[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</span></div>
      <div><strong>${e.title}</strong>${e.time ? `<small>${e.time}</small>` : ""}${where ? `<small>${where}</small>` : ""}${e.note ? `<small>${e.note}</small>` : ""}${e.link ? `<a href="${e.link}" target="_blank" rel="noopener">Details →</a>` : ""}</div>
    </li>`;
  };
  const shows = events.filter((e) => e.type === "show");
  const upcoming = shows.filter((e) => parse(e.date) >= today);
  const past = shows.filter((e) => parse(e.date) < today).reverse();
  $("#upcomingList").innerHTML = upcoming.length ? upcoming.map(evHTML).join("")
    : `<li class="ev ev--empty">New public dates are announced soon. Follow <a href="https://www.instagram.com/djpreet775/" target="_blank" rel="noopener" class="link-gold">@djpreet775</a> to hear first, or grab an open date for your own event.</li>`;
  $("#pastList").innerHTML = past.map(evHTML).join("") + (window.DJ_HIGHLIGHTS || []).map((h) => `
    <li class="ev"><div class="ev__date"><span>${h.label}</span></div><div><strong>${h.title}</strong>${h.venue ? `<small>${h.venue}</small>` : ""}${h.note ? `<small>${h.note}</small>` : ""}</div></li>`).join("");

  /* ---------- Quote builder ---------- */
  const qPkg = $("#qPkg"), qHours = $("#qHours"), qAdd = $$(".quote__addons input");
  let estimateText = "";
  const calc = () => {
    const base = +qPkg.value, hrs = +qHours.value;
    const adds = qAdd.filter((c) => c.checked);
    const total = base + hrs * 150 + adds.reduce((s, c) => s + +c.value, 0);
    $("#qHoursOut").textContent = hrs ? `+${hrs} hr (${money(hrs * 150)})` : "0";
    $("#qTotal").textContent = money(total);
    $("#qDeposit").textContent = money(total * 0.3);
    const pkgName = qPkg.options[qPkg.selectedIndex].text.split(":")[0];
    estimateText = `${pkgName}${hrs ? `, +${hrs} extra hr` : ""}${adds.length ? ", " + adds.map((c) => c.parentElement.textContent.trim()).join(", ") : ""}. Est. ${money(total)} (deposit ${money(total * 0.3)})`;
    return pkgName;
  };
  [qPkg, qHours, ...qAdd].forEach((el) => el.addEventListener("input", calc));
  calc();
  $("#qBook").addEventListener("click", () => {
    const name = calc();
    $("#fPkg").value = name.replace("&amp;", "&");
    $("#fEstimate").value = estimateText;
    const msg = $("#bookForm [name=message]");
    if (!msg.value.includes("Estimate:")) msg.value = (msg.value ? msg.value + "\n" : "") + "Estimate: " + estimateText;
  });

  /* ---------- Booking form ---------- */
  const form = $("#bookForm"), status = $("#fStatus"), submit = $("#fSubmit");
  $("#fDate").min = iso(today);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("is-invalid", bad); if (bad) ok = false;
    });
    if (!ok) { status.className = "form__status err"; status.textContent = "Please fill in the highlighted fields."; return; }
    const data = Object.fromEntries(new FormData(form));
    submit.disabled = true; submit.textContent = "Sending…"; status.textContent = "";
    try {
      const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Request failed");
      form.reset();
      status.className = "form__status ok";
      status.textContent = "Inquiry sent! DJ Preet will reach out to you shortly. 🎶";
    } catch (err) {
      status.className = "form__status err";
      status.innerHTML = 'Something went wrong sending your inquiry. Please DM <a href="https://www.instagram.com/djpreet775/" target="_blank" rel="noopener">@djpreet775</a> on Instagram.';
    } finally { submit.disabled = false; submit.textContent = "Send Booking Inquiry"; }
  });
})();
