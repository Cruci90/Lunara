/* Lunara — seguimiento del sueño del bebé (inspirado en apps tipo Napper).
   App estática: estado persistido en localStorage. Sin dependencias. */

(() => {
  "use strict";

  const STORAGE_KEY = "lunara_state_v1";

  // ---------- Ventanas de sueño orientativas por edad (semanas) ----------
  // min/max: ventana de vigilia en minutos; naps: nº de siestas típico;
  // napAvg: duración media de siesta en minutos.
  const WAKE_WINDOWS = [
    { maxWeeks: 4,   min: 40,  max: 60,  naps: 5, napAvg: 60,  label: "0-1 mes" },
    { maxWeeks: 8,   min: 45,  max: 75,  naps: 5, napAvg: 60,  label: "1-2 meses" },
    { maxWeeks: 13,  min: 60,  max: 90,  naps: 4, napAvg: 70,  label: "2-3 meses" },
    { maxWeeks: 17,  min: 75,  max: 105, naps: 4, napAvg: 70,  label: "3-4 meses" },
    { maxWeeks: 26,  min: 90,  max: 150, naps: 3, napAvg: 75,  label: "4-6 meses" },
    { maxWeeks: 35,  min: 120, max: 180, naps: 3, napAvg: 75,  label: "6-8 meses" },
    { maxWeeks: 43,  min: 150, max: 210, naps: 2, napAvg: 80,  label: "8-10 meses" },
    { maxWeeks: 52,  min: 180, max: 240, naps: 2, napAvg: 80,  label: "10-12 meses" },
    { maxWeeks: 78,  min: 240, max: 300, naps: 1, napAvg: 110, label: "12-18 meses" },
    { maxWeeks: 999, min: 300, max: 360, naps: 1, napAvg: 110, label: "18+ meses" },
  ];

  // ---------- Estado ----------
  const defaultState = () => ({
    baby: null, // { name, birth, wakeTime, bedTime }
    sessions: [], // { id, start, end, type: 'nap'|'night' }
    activeSleep: null, // { start } mientras duerme
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* estado corrupto: empezar de cero */ }
    return defaultState();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Utilidades ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");

  const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const fmtDur = (mins) => {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60), m = mins % 60;
    return h ? `${h} h ${pad(m)} min` : `${m} min`;
  };
  const fmtTimer = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  };
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toLocalInput = (d) =>
    `${dayKey(d)}T${fmtTime(d)}`;

  function ageWeeks() {
    const birth = new Date(state.baby.birth + "T00:00:00");
    return Math.max(0, Math.floor((Date.now() - birth) / (7 * 24 * 3600e3)));
  }

  function ageLabel() {
    const w = ageWeeks();
    if (w < 9) return `${w} semana${w === 1 ? "" : "s"}`;
    const months = Math.floor(w / 4.345);
    return `${months} mes${months === 1 ? "" : "es"}`;
  }

  function ageWindow() {
    const w = ageWeeks();
    return WAKE_WINDOWS.find((r) => w < r.maxWeeks) || WAKE_WINDOWS[WAKE_WINDOWS.length - 1];
  }

  // ---------- Predicción personalizada a partir del historial ----------
  const HISTORY_DAYS = 21;
  const MIN_GAP_SAMPLES = 4;
  const MIN_NAP_SAMPLES = 3;
  const MIN_DAY_SAMPLES = 3;

  function percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }
  const median = (values) => percentile(values, 0.5);

  function recentSessions(days) {
    const cutoff = Date.now() - days * 24 * 3600e3;
    return [...state.sessions]
      .filter((s) => new Date(s.start).getTime() >= cutoff)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  // Ventana de vigilia real: tiempo entre el fin de una siesta/noche y el inicio
  // de la siguiente sesión, solo cuando ambas caen en el mismo día.
  function personalizedWakeWindow() {
    const sessions = recentSessions(HISTORY_DAYS);
    const gaps = [];
    for (let i = 1; i < sessions.length; i++) {
      const prevEnd = new Date(sessions[i - 1].end);
      const currStart = new Date(sessions[i].start);
      if (dayKey(prevEnd) !== dayKey(currStart)) continue;
      const gap = (currStart - prevEnd) / 60000;
      if (gap >= 15 && gap <= 400) gaps.push(gap);
    }
    if (gaps.length < MIN_GAP_SAMPLES) return null;
    return { min: Math.round(percentile(gaps, 0.25)), max: Math.round(percentile(gaps, 0.75)) };
  }

  function personalizedNapAvg() {
    const durations = recentSessions(HISTORY_DAYS)
      .filter((s) => s.type === "nap")
      .map((s) => (new Date(s.end) - new Date(s.start)) / 60000)
      .filter((m) => m >= 10 && m <= 240);
    if (durations.length < MIN_NAP_SAMPLES) return null;
    return Math.round(median(durations));
  }

  function personalizedNapsCount() {
    const byDay = new Map();
    for (const s of recentSessions(14)) {
      const k = dayKey(new Date(s.start));
      byDay.set(k, (byDay.get(k) || 0) + (s.type === "nap" ? 1 : 0));
    }
    const counts = Array.from(byDay.values());
    if (counts.length < MIN_DAY_SAMPLES) return null;
    return Math.max(1, Math.round(median(counts)));
  }

  function windowsForAge() {
    const base = ageWindow();
    const win = personalizedWakeWindow();
    const napAvg = personalizedNapAvg();
    const naps = personalizedNapsCount();
    return {
      ...base,
      min: win ? win.min : base.min,
      max: win ? win.max : base.max,
      napAvg: napAvg || base.napAvg,
      naps: naps || base.naps,
      personalized: Boolean(win || napAvg || naps),
    };
  }

  function timeAt(dateBase, hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(dateBase);
    d.setHours(h, m, 0, 0);
    return d;
  }

  // ---------- Sesiones ----------
  function sortedSessions() {
    return [...state.sessions].sort((a, b) => new Date(b.start) - new Date(a.start));
  }

  function sessionsOverlappingDay(day) {
    // Devuelve [sesión, minutosDentroDelDía] para todas las que tocan ese día.
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const out = [];
    for (const s of state.sessions) {
      const a = new Date(s.start), b = new Date(s.end);
      const from = Math.max(a, start), to = Math.min(b, end);
      if (to > from) out.push([s, (to - from) / 60000]);
    }
    return out;
  }

  function lastWakeTime() {
    // Fin de la última sesión terminada; si no hay, hora habitual de despertar de hoy.
    const done = sortedSessions().filter((s) => s.end);
    if (done.length) {
      const lastEnd = new Date(done[0].end);
      if (lastEnd <= new Date()) return lastEnd;
    }
    return timeAt(new Date(), state.baby.wakeTime);
  }

  function suggestType(start) {
    const h = start.getHours();
    return h >= 18 || h < 6 ? "night" : "nap";
  }

  // ---------- Cielo estrellado ----------
  function buildSky() {
    const sky = $("#sky");
    for (let i = 0; i < 90; i++) {
      const st = document.createElement("div");
      st.className = "star";
      const size = Math.random() * 2.2 + 0.6;
      st.style.width = st.style.height = size + "px";
      st.style.left = Math.random() * 100 + "%";
      st.style.top = Math.random() * 100 + "%";
      st.style.setProperty("--tw", (Math.random() * 3 + 2).toFixed(1) + "s");
      st.style.animationDelay = (Math.random() * 4).toFixed(1) + "s";
      sky.appendChild(st);
    }
  }

  // ---------- Render: cabecera ----------
  function renderHeader() {
    $("#baby-name").textContent = state.baby.name;
    $("#baby-age").textContent = `${ageLabel()} · ${windowsForAge().label}`;
  }

  // ---------- Render: tarjeta de sueño + predicción ----------
  function renderSleepCard() {
    const btn = $("#sleep-toggle");
    const status = $("#status-label");
    const timer = $("#big-timer");
    const pred = $("#prediction");
    const now = new Date();

    if (state.activeSleep) {
      const secs = Math.floor((now - new Date(state.activeSleep.start)) / 1000);
      status.textContent = `${state.baby.name} está durmiendo 💤`;
      timer.textContent = fmtTimer(secs);
      btn.textContent = "Despertar ☀️";
      btn.classList.add("sleeping");
      pred.textContent = `Desde las ${fmtTime(new Date(state.activeSleep.start))}`;
    } else {
      const wake = lastWakeTime();
      const awakeSecs = Math.floor((now - wake) / 1000);
      status.textContent = `${state.baby.name} está despierto/a`;
      timer.textContent = awakeSecs >= 0 ? fmtTimer(awakeSecs) : "—";
      btn.textContent = "Empezar sueño 🌙";
      btn.classList.remove("sleeping");

      const win = windowsForAge();
      const from = new Date(wake.getTime() + win.min * 60000);
      const to = new Date(wake.getTime() + win.max * 60000);
      const tag = win.personalized ? " · según su historial" : " · estimación por edad";
      if (now < from) {
        pred.textContent = `😴 Ventana de sueño: ${fmtTime(from)} – ${fmtTime(to)}${tag}`;
      } else if (now <= to) {
        pred.textContent = `✨ ¡Es buen momento para dormir! (hasta ${fmtTime(to)})${tag}`;
      } else {
        pred.textContent = `⚠️ Ventana superada (${fmtTime(from)} – ${fmtTime(to)}): puede estar muy cansado/a${tag}`;
      }
    }
  }

  // ---------- Render: plan del día ----------
  function renderSchedule() {
    const el = $("#schedule");
    const win = windowsForAge();
    const now = new Date();
    const items = [];

    let t = timeAt(new Date(), state.baby.wakeTime);
    items.push({ icon: "☀️", time: fmtTime(t), label: "Despertar", at: new Date(t) });

    for (let i = 1; i <= win.naps; i++) {
      const start = new Date(t.getTime() + ((win.min + win.max) / 2) * 60000);
      const end = new Date(start.getTime() + win.napAvg * 60000);
      items.push({
        icon: "😴",
        time: `${fmtTime(start)} – ${fmtTime(end)}`,
        label: `Siesta ${i}`,
        at: start,
        until: end,
        nap: true,
      });
      t = end;
    }

    const bed = timeAt(new Date(), state.baby.bedTime || "20:00");
    items.push({ icon: "🌙", time: fmtTime(bed), label: "A dormir (noche)", at: bed });

    el.innerHTML = items
      .map((it, idx) => {
        const past = (it.until || it.at) < now;
        const current = it.at <= now && now <= (it.until || it.at);
        const clickable = it.nap;
        return `<div class="sched-item ${past ? "past" : ""} ${current ? "current" : ""} ${clickable ? "sched-clickable" : ""}"
          ${clickable ? `data-idx="${idx}" data-start="${it.at.toISOString()}" data-end="${it.until.toISOString()}"` : ""}>
          <div class="sched-icon">${it.icon}</div>
          <div class="sched-time">${it.time}</div>
          <div>${it.label}</div>
          ${clickable ? `<div class="sched-edit muted">✏️</div>` : ""}
        </div>`;
      })
      .join("");

    $$(".sched-clickable").forEach((item) =>
      item.addEventListener("click", () => {
        const predStart = new Date(item.dataset.start);
        const predEnd = new Date(item.dataset.end);
        const existing = sessionsOverlappingDay(predStart)
          .map(([s]) => s)
          .find((s) => s.type === "nap" && new Date(s.start) < predEnd && new Date(s.end) > predStart);
        if (existing) openModal(existing.id);
        else openModal(null, { start: predStart, end: predEnd, type: "nap" });
      })
    );
  }

  // ---------- Render: resumen de hoy ----------
  function renderTodaySummary() {
    const today = new Date();
    const list = sessionsOverlappingDay(today);
    let nap = 0, night = 0, napsCount = 0;
    for (const [s, mins] of list) {
      if (s.type === "nap") { nap += mins; napsCount++; } else night += mins;
    }
    if (state.activeSleep) {
      const mins = (Date.now() - new Date(state.activeSleep.start)) / 60000;
      const t = suggestType(new Date(state.activeSleep.start));
      if (t === "nap") nap += mins; else night += mins;
    }
    $("#today-summary").innerHTML = `
      <div><div class="num">${fmtDur(nap + night)}</div><div class="lbl">Total</div></div>
      <div><div class="num">${napsCount}</div><div class="lbl">Siestas</div></div>
      <div><div class="num">${fmtDur(night)}</div><div class="lbl">Noche</div></div>`;
  }

  // ---------- Render: registro ----------
  function renderLog() {
    const el = $("#log-list");
    const sessions = sortedSessions();
    if (!sessions.length) {
      el.innerHTML = `<div class="empty-msg">Aún no hay sueño registrado.<br/>Usa el botón del temporizador o «+ Añadir».</div>`;
      return;
    }
    const groups = new Map();
    for (const s of sessions) {
      const k = dayKey(new Date(s.start));
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(s);
    }
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const todayK = dayKey(new Date());
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yestK = dayKey(yest);

    el.innerHTML = Array.from(groups.entries())
      .map(([k, list]) => {
        const d = new Date(k + "T12:00:00");
        let title;
        if (k === todayK) title = "Hoy";
        else if (k === yestK) title = "Ayer";
        else title = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
        const total = list.reduce((acc, s) => acc + (new Date(s.end) - new Date(s.start)) / 60000, 0);
        const rows = list
          .map((s) => {
            const a = new Date(s.start), b = new Date(s.end);
            const mins = (b - a) / 60000;
            return `<div class="log-item" data-id="${s.id}">
              <div class="log-icon">${s.type === "night" ? "🌙" : "😴"}</div>
              <div class="log-main">
                <div class="log-times">${fmtTime(a)} – ${fmtTime(b)}</div>
                <div class="log-dur">${s.type === "night" ? "Noche" : "Siesta"} · ${fmtDur(mins)}</div>
              </div>
              <div class="muted">✏️</div>
            </div>`;
          })
          .join("");
        return `<div class="log-day">
          <div class="log-day-title">${title} · ${fmtDur(total)}</div>${rows}
        </div>`;
      })
      .join("");

    $$(".log-item").forEach((item) =>
      item.addEventListener("click", () => openModal(item.dataset.id))
    );
  }

  // ---------- Render: estadísticas ----------
  function renderStats() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const dayNames = ["D", "L", "M", "X", "J", "V", "S"];
    const data = days.map((d) => {
      let nap = 0, night = 0;
      for (const [s, mins] of sessionsOverlappingDay(d)) {
        if (s.type === "nap") nap += mins; else night += mins;
      }
      return { d, nap, night, total: nap + night };
    });
    const maxTotal = Math.max(60, ...data.map((x) => x.total));

    $("#chart").innerHTML = data
      .map((x) => {
        const napH = Math.round((x.nap / maxTotal) * 120);
        const nightH = Math.round((x.night / maxTotal) * 120);
        return `<div class="chart-col">
          <div class="chart-val">${x.total ? (x.total / 60).toFixed(1) : ""}</div>
          <div class="chart-bars">
            <div class="bar-night" style="height:${nightH}px"></div>
            <div class="bar-nap" style="height:${napH}px"></div>
          </div>
          <div class="chart-label">${dayNames[x.d.getDay()]}</div>
        </div>`;
      })
      .join("");

    const withData = data.filter((x) => x.total > 0);
    const avgTotal = withData.length ? withData.reduce((a, x) => a + x.total, 0) / withData.length : 0;
    const avgNight = withData.length ? withData.reduce((a, x) => a + x.night, 0) / withData.length : 0;
    const napsLast7 = days.reduce(
      (acc, d) => acc + sessionsOverlappingDay(d).filter(([s]) => s.type === "nap").length, 0);
    const longest = state.sessions.reduce(
      (acc, s) => Math.max(acc, (new Date(s.end) - new Date(s.start)) / 60000), 0);

    $("#stats-cards").innerHTML = `
      <div class="stat-card"><div class="num">${fmtDur(avgTotal)}</div><div class="lbl">Media diaria (7 d)</div></div>
      <div class="stat-card"><div class="num">${fmtDur(avgNight)}</div><div class="lbl">Media nocturna</div></div>
      <div class="stat-card"><div class="num">${napsLast7}</div><div class="lbl">Siestas (7 d)</div></div>
      <div class="stat-card"><div class="num">${fmtDur(longest)}</div><div class="lbl">Tramo más largo</div></div>`;
  }

  // ---------- Render: perfil ----------
  function renderProfile() {
    $("#prof-name").value = state.baby.name;
    $("#prof-birth").value = state.baby.birth;
    $("#prof-wake").value = state.baby.wakeTime;
    $("#prof-bed").value = state.baby.bedTime || "20:00";
    const w = windowsForAge();
    const source = w.personalized
      ? "calculado a partir de tu historial de los últimos días"
      : `estimación orientativa para ${w.label}`;
    $("#prof-windows").textContent =
      `Ventana de vigilia ${fmtDur(w.min)} – ${fmtDur(w.max)}, ` +
      `${w.naps} siesta${w.naps === 1 ? "" : "s"} al día aprox. (${source}, edad: ${ageLabel()})`;
  }

  // ---------- Sonidos (Web Audio) ----------
  const sound = { ctx: null, node: null, gain: null, current: null, timerId: null, offAt: null };

  function makeNoiseBuffer(ctx, type) {
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const out = buffer.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < len; i++) out[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        out[i] = last * 3.5;
      }
    }
    return buffer;
  }

  function startSound(type) {
    stopSound(false);
    sound.ctx = sound.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = sound.ctx;
    if (ctx.state === "suspended") ctx.resume();

    sound.gain = ctx.createGain();
    sound.gain.gain.value = ($("#volume").value / 100) * 0.6;
    sound.gain.connect(ctx.destination);

    if (type === "heartbeat") {
      // Latido: oscilador grave con pulsos lub-dub mediante LFO de ganancia.
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 55;
      const beatGain = ctx.createGain();
      beatGain.gain.value = 0;
      osc.connect(beatGain).connect(sound.gain);
      osc.start();
      const period = 60 / 65; // ~65 ppm
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < 600; i++) {
        const t = t0 + i * period;
        beatGain.gain.setValueAtTime(0, t);
        beatGain.gain.linearRampToValueAtTime(1, t + 0.05);
        beatGain.gain.linearRampToValueAtTime(0, t + 0.18);
        beatGain.gain.setValueAtTime(0, t + 0.25);
        beatGain.gain.linearRampToValueAtTime(0.7, t + 0.3);
        beatGain.gain.linearRampToValueAtTime(0, t + 0.42);
      }
      sound.node = osc;
    } else {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, type);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = type === "brown" ? 500 : 4000;
      src.connect(filter).connect(sound.gain);
      src.start();
      sound.node = src;
    }

    sound.current = type;
    const mins = Number($("#sound-timer").value);
    if (mins > 0) {
      sound.offAt = Date.now() + mins * 60000;
      sound.timerId = setTimeout(() => stopSound(true), mins * 60000);
    } else {
      sound.offAt = null;
    }
    renderSoundUI();
  }

  function stopSound(updateUI = true) {
    if (sound.node) { try { sound.node.stop(); } catch (e) {} sound.node = null; }
    if (sound.gain) { sound.gain.disconnect(); sound.gain = null; }
    if (sound.timerId) { clearTimeout(sound.timerId); sound.timerId = null; }
    sound.current = null;
    sound.offAt = null;
    if (updateUI) renderSoundUI();
  }

  function renderSoundUI() {
    $$(".sound-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.sound === sound.current));
    const st = $("#sound-status");
    if (!sound.current) st.textContent = "Sin sonido";
    else if (sound.offAt) st.textContent = `Reproduciendo · se apaga a las ${fmtTime(new Date(sound.offAt))}`;
    else st.textContent = "Reproduciendo";
  }

  // ---------- Modal de sesión ----------
  let editingId = null;

  function openModal(id = null, prefill = null) {
    editingId = id;
    const form = $("#session-form");
    form.reset();
    $("#sess-delete").classList.toggle("hidden", !id);
    $("#modal-title").textContent = id ? "Editar sueño" : "Añadir sueño";
    if (id) {
      const s = state.sessions.find((x) => x.id === id);
      $("#sess-start").value = toLocalInput(new Date(s.start));
      $("#sess-end").value = toLocalInput(new Date(s.end));
      $("#sess-type").value = s.type;
    } else if (prefill) {
      $("#sess-start").value = toLocalInput(prefill.start);
      $("#sess-end").value = toLocalInput(prefill.end);
      $("#sess-type").value = prefill.type;
    } else {
      const now = new Date();
      const ago = new Date(now.getTime() - 60 * 60000);
      $("#sess-start").value = toLocalInput(ago);
      $("#sess-end").value = toLocalInput(now);
      $("#sess-type").value = suggestType(ago);
    }
    $("#modal").classList.remove("hidden");
  }

  function closeModal() {
    $("#modal").classList.add("hidden");
    editingId = null;
  }

  // ---------- Vistas ----------
  function showView(name) {
    $$(".view").forEach((v) => v.classList.add("hidden"));
    $(`#view-${name}`).classList.remove("hidden");
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
    renderAll();
  }

  function renderAll() {
    if (!state.baby) return;
    renderHeader();
    renderSleepCard();
    renderSchedule();
    renderTodaySummary();
    renderLog();
    renderStats();
    renderProfile();
  }

  // ---------- Eventos ----------
  function bindEvents() {
    // Onboarding
    $("#onb-form").addEventListener("submit", (e) => {
      e.preventDefault();
      state.baby = {
        name: $("#onb-name").value.trim(),
        birth: $("#onb-birth").value,
        wakeTime: $("#onb-wake").value,
        bedTime: "20:00",
      };
      save();
      $("#onboarding").classList.add("hidden");
      $("#main").classList.remove("hidden");
      renderAll();
    });

    // Botón dormir/despertar
    $("#sleep-toggle").addEventListener("click", () => {
      if (state.activeSleep) {
        const start = new Date(state.activeSleep.start);
        const end = new Date();
        if (end - start >= 60000) {
          state.sessions.push({
            id: crypto.randomUUID(),
            start: start.toISOString(),
            end: end.toISOString(),
            type: suggestType(start),
          });
        }
        state.activeSleep = null;
      } else {
        state.activeSleep = { start: new Date().toISOString() };
      }
      save();
      renderAll();
    });

    // Tabs
    $$(".tab").forEach((t) =>
      t.addEventListener("click", () => showView(t.dataset.view)));

    // Registro
    $("#add-session").addEventListener("click", () => openModal());
    $("#sess-cancel").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", (e) => {
      if (e.target.id === "modal") closeModal();
    });
    $("#session-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const start = new Date($("#sess-start").value);
      const end = new Date($("#sess-end").value);
      if (!(end > start)) { alert("El fin debe ser posterior al inicio."); return; }
      const data = {
        start: start.toISOString(),
        end: end.toISOString(),
        type: $("#sess-type").value,
      };
      if (editingId) {
        Object.assign(state.sessions.find((s) => s.id === editingId), data);
      } else {
        state.sessions.push({ id: crypto.randomUUID(), ...data });
      }
      save();
      closeModal();
      renderAll();
    });
    $("#sess-delete").addEventListener("click", () => {
      if (!confirm("¿Eliminar este registro?")) return;
      state.sessions = state.sessions.filter((s) => s.id !== editingId);
      save();
      closeModal();
      renderAll();
    });

    // Sonidos
    $$(".sound-btn").forEach((b) =>
      b.addEventListener("click", () => {
        if (sound.current === b.dataset.sound) stopSound();
        else startSound(b.dataset.sound);
      }));
    $("#volume").addEventListener("input", () => {
      if (sound.gain) sound.gain.gain.value = ($("#volume").value / 100) * 0.6;
    });

    // Perfil
    $("#profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      state.baby = {
        name: $("#prof-name").value.trim(),
        birth: $("#prof-birth").value,
        wakeTime: $("#prof-wake").value,
        bedTime: $("#prof-bed").value,
      };
      save();
      renderAll();
      alert("Perfil guardado ✨");
    });
    $("#export-data").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "lunara-datos.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $("#reset-data").addEventListener("click", () => {
      if (!confirm("Esto borrará el perfil y todos los registros. ¿Continuar?")) return;
      stopSound();
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      location.reload();
    });
  }

  // ---------- Reloj y refresco ----------
  function tick() {
    $("#clock").textContent = fmtTime(new Date());
    if (state.baby) {
      renderSleepCard();
      renderTodaySummary();
    }
  }

  // ---------- Init ----------
  function init() {
    buildSky();
    bindEvents();
    if (state.baby) {
      $("#main").classList.remove("hidden");
      renderAll();
    } else {
      $("#onboarding").classList.remove("hidden");
      const d = new Date();
      d.setMonth(d.getMonth() - 4);
      $("#onb-birth").value = dayKey(d);
    }
    tick();
    setInterval(tick, 1000);
    setInterval(() => state.baby && renderSchedule(), 60000);
  }

  init();
})();
