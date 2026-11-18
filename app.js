"use strict";

/* ==========================================================================
   Vuelta a mi mejor versión — lógica de la web
   Lee el Google Sheet vía Apps Script (JSONP), calcula tendencias y
   relaciones prudentes entre hábitos y composición, y permite añadir o
   editar mediciones.
   ========================================================================== */

/* ---------- Configuración ---------- */

const API_URL = String((window.WEIGHT_DASHBOARD_CONFIG && window.WEIGHT_DASHBOARD_CONFIG.sheetApiUrl) || "").trim();

// Orden exacto de columnas del Sheet.
const FIELDS = ["fecha", "peso", "imc", "musculo", "grasa", "visceral", "calorias", "caloriasQuemadas", "nutricion", "deporte", "emocional", "kmSemana"];

const STORE = { goal: "vmv-goal", theme: "vmv-theme", range: "vmv-range" };
const LEGACY = { goal: "camino-a-los-85-goal", theme: "camino-a-los-85-theme" };

const DAY = 86400000;
const STALE_DAYS = 10;

// dir: -1 bajar es mejora · 1 subir es mejora · 0 dato informativo
const META = {
  peso: { label: "Peso", unit: "kg", dec: 1, dir: -1 },
  imc: { label: "IMC", unit: "", dec: 1, dir: -1 },
  musculo: { label: "Músculo", unit: "%", dec: 1, dir: 1 },
  grasa: { label: "Grasa", unit: "%", dec: 1, dir: -1 },
  visceral: { label: "G. visceral", unit: "", dec: 0, dir: -1 },
  calorias: { label: "Calorías necesarias", unit: "kcal", dec: 0, dir: 0 },
  caloriasQuemadas: { label: "Cal. quemadas", unit: "kcal", dec: 0, dir: 0 },
  nutricion: { label: "Nutrición", unit: "", dec: 0, dir: 1, min: 6, max: 10 },
  deporte: { label: "Deporte", unit: "días", dec: 0, dir: 1, min: 4, max: 7 },
  emocional: { label: "Emocional", unit: "", dec: 0, dir: 1, min: 5, max: 10 },
  kmSemana: { label: "Km semana", unit: "km", dec: 1, dir: 0 },
  rate: { label: "Ritmo", unit: "kg/sem", dec: 1, dir: -1 }
};

const RANGES = [
  { key: "3m", label: "3 meses", months: 3 },
  { key: "6m", label: "6 meses", months: 6 },
  { key: "12m", label: "1 año", months: 12 },
  { key: "all", label: "Todo", months: null }
];

const QUOTES = [
  "Si lo hiciste una vez, lo harás otra vez.",
  "Cada semana cuenta, incluso cuando no es perfecta.",
  "La mejor versión no aparece: se construye.",
  "No estás empezando de cero, estás volviendo con experiencia.",
  "El dato no juzga, te orienta.",
  "La constancia gana cuando dejas de negociar con ella.",
  "Hazlo fácil, claro y repetible.",
  "Tu mejor registro no es un techo, es una referencia.",
  "La calma también entrena.",
  "No necesitas heroísmo, necesitas continuidad."
];

// Copia de respaldo del Sheet (se usa solo si no hay conexión).
// Columnas: fecha, peso, imc, musculo, grasa, visceral, calorias, caloriasQuemadas, nutricion, deporte, emocional, kmSemana
const SAMPLE_ROWS = [
  ["2024-12-15",93.8,29.1,35.2,24.5,11,1934,null,null,null,null,null],
  ["2024-12-17",92.8,28.8,36.3,24,11,1919,null,null,null,null,null],
  ["2024-12-20",90.4,28.1,35,26.5,11,1882,null,null,null,null,null],
  ["2025-01-06",94.6,29.4,36.1,24.5,12,1942,null,null,null,null,null],
  ["2025-01-11",94.1,29.2,35.8,24.9,12,1935,null,null,null,null,null],
  ["2025-02-12",93.1,28.9,36.1,23.5,11,1922,null,null,null,null,null],
  ["2025-03-05",94,29.2,35.4,25.6,12,1933,null,null,null,null,null],
  ["2025-03-25",94.4,29.3,36,24.6,12,1940,null,null,null,null,null],
  ["2025-03-28",93.1,28.9,35.9,24.9,11,1922,null,null,null,null,null],
  ["2025-04-02",91.5,28.4,36.4,24,11,1902,null,null,null,null,null],
  ["2025-04-09",92,28.6,35,26.5,11,1904,null,null,null,null,null],
  ["2025-05-01",88.3,27.4,35.1,26.2,10,1853,null,null,null,null,null],
  ["2025-07-18",87.6,27.2,36.2,24.3,10,1850,null,null,null,null,null],
  ["2025-08-02",88.6,27.5,36.4,24,10,1862,null,null,null,null,null],
  ["2025-08-10",89.6,27.8,37,22.8,10,1877,null,null,null,null,null],
  ["2025-08-16",89,27.6,36.5,23.7,10,1868,null,null,null,null,null],
  ["2025-09-01",92.4,28.7,35.9,24.8,11,1913,null,null,null,null,null],
  ["2025-09-20",93,28.9,36.1,24.5,11,1921,null,null,null,null,null],
  ["2025-09-26",92.1,28.6,36.6,23.6,11,1910,null,null,null,null,null],
  ["2025-10-13",93.4,29,37.2,22.4,11,1928,null,null,null,null,null],
  ["2025-10-25",92.2,28.6,36.4,23.9,11,1911,null,null,null,null,null],
  ["2025-10-29",91.3,28.3,36.7,23.4,11,1900,null,null,null,null,null],
  ["2025-11-20",91.9,28.1,36.6,23.5,11,1907,null,null,null,null,null],
  ["2025-12-05",91.7,28.5,36.6,23.5,11,1905,null,null,null,null,null],
  ["2025-12-27",93.4,29,35.7,25.2,12,1926,null,null,null,null,null],
  ["2026-01-14",93.2,28.9,36.6,23.6,11,1925,null,null,null,null,null],
  ["2026-01-19",92.9,28.8,36.7,23.4,11,1921,null,null,null,null,null],
  ["2026-02-02",90.3,28,35.7,25.1,11,1883,2533,7,4,7,58.1],
  ["2026-02-23",91.8,28.5,36.5,23.7,11,1906,2357,6,3,8,51.7],
  ["2026-04-03",91.7,28.5,35,26.5,11,1901,2265,8,5,9,44.6],
  ["2026-04-17",92.4,28.7,36.1,24.4,11,1913,2137,8,2,5,11.6],
  ["2026-05-11",94.5,29.3,36.1,25.3,12,1924,2280,4,1,7,50.8],
  ["2026-05-18",93.1,28.9,35.3,25.9,11,1921,2323,4,1,4,48.1],
  ["2026-05-25",91.6,28.4,35.9,24.9,11,1902,2754,6,5,7,60.2],
  ["2026-06-01",91.7,28.5,36.6,23.6,11,1905,2521,7,4,8,72.9],
  ["2026-06-08",90.6,28,35.8,24.9,11,1891,2512,7,4,7,65.2],
  ["2026-06-15",90.2,28,36.1,24.5,10,1883,2350,5,4,9,88],
  ["2026-06-22",90.3,28.1,36.6,23.6,10,1888,2554,6,5,7,65.8],
  ["2026-06-29",90.2,27.9,37.5,21.9,10,1887,2483,8,4,7,55.5],
  ["2026-07-06",90,27.9,36.4,23.9,10,1882,2584,8,4,8,62],
  ["2026-07-20",88.1,27.2,36.8,23.2,10,1857,2494,10,3,7,58],
  ["2026-07-31",87.9,27.3,37.9,21.3,10,1858,2638,8,4,8,70.2],
  ["2026-08-06",86.7,26.9,37.1,21.5,9,1834,2540,10,3,9,68],
  ["2026-08-09",85.4,26.8,37.8,21.4,9,1835,2450,9,2,8,75],
  ["2026-08-25",83.7,26,37.1,22.6,9,1797,2521,9,7,8,70],
  ["2026-08-31",83.8,26,37.8,21.4,8,1800,2400,8,4,8,65],
  ["2026-09-21",83.9,26,38,20.9,9,1802,2000,7,4,6,55]
];

/* ---------- Estado ---------- */

const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento */ } }
};

const state = {
  rows: [],
  goal: readGoal(),
  range: RANGES.some(r => r.key === store.get(STORE.range)) ? store.get(STORE.range) : "all",
  month: "",
  editing: null,
  source: "sheet",
  updatedAt: null
};

const charts = {};
const $ = id => document.getElementById(id);

function init() {
  $("motivationalQuote").textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  setupTheme();
  setupGoal();
  setupRange();
  setupForm();
  $("monthSelect").addEventListener("change", e => { state.month = e.target.value; renderMonth(); });
  if (window.Chart) setupChartDefaults();
  load();
}

/* ---------- Carga y escritura ---------- */

async function load() {
  setSync("Conectando con Google Sheets…");
  if (!API_URL) {
    useSample("No hay URL de Google Sheets configurada en config.js. Se muestran datos de respaldo.");
    return;
  }
  try {
    const payload = await apiRequest({}, 20000);
    const data = Array.isArray(payload) ? payload : payload && payload.data;
    if (!Array.isArray(data)) throw new Error("Respuesta sin datos");
    applyData(data, payload.updatedAt);
  } catch (error) {
    console.error(error);
    useSample("No se pudo conectar con Google Sheets. Se muestran los últimos datos guardados en la web.");
  }
}

function applyData(data, updatedAt) {
  state.rows = normalize(data);
  state.source = "sheet";
  state.updatedAt = updatedAt || new Date().toISOString();
  removeBanner();
  render();
}

function useSample(message) {
  state.rows = normalize(SAMPLE_ROWS.map(arr => Object.fromEntries(FIELDS.map((f, i) => [f, arr[i]]))));
  state.source = "sample";
  showBanner(message);
  render();
}

// Pide los datos sin enviar cookies de Google: con varias cuentas abiertas,
// Google redirige a /u/N/ y la Web App falla. Si fetch no funciona, usa JSONP.
async function apiRequest(params = {}, timeout = 20000) {
  try {
    return await fetchJson(API_URL, params, timeout);
  } catch (error) {
    console.warn("fetch sin cookies falló, se prueba JSONP", error);
    return jsonp(API_URL, params, timeout);
  }
}

async function fetchJson(url, params, timeout) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });
  query.set("_", String(Date.now()));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}${query.toString()}`, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function jsonp(url, params = {}, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const callback = `vmv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) query.set(key, value);
    });
    query.set("callback", callback);
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("Tiempo de espera agotado")); }, timeout);
    window[callback] = payload => { cleanup(); resolve(payload); };
    script.onerror = () => { cleanup(); reject(new Error("No se pudo cargar la respuesta")); };
    script.src = `${url}${url.includes("?") ? "&" : "?"}${query.toString()}`;
    document.body.appendChild(script);

    function cleanup() {
      clearTimeout(timer);
      window[callback] = () => {};
      script.remove();
    }
  });
}

function normalize(input) {
  const byDate = new Map();
  input.forEach(row => {
    const r = {
      fecha: toIso(first(row.fecha, row.Fecha, row.date)),
      peso: num(first(row.peso, row.Peso)),
      imc: num(first(row.imc, row.IMC)),
      musculo: num(first(row.musculo, row.Musculo, row["Músculo"])),
      grasa: num(first(row.grasa, row.Grasa)),
      visceral: num(first(row.visceral, row["G.Visceral"], row["G. visceral"], row["Grasa visceral"])),
      calorias: num(first(row.calorias, row.Calorias, row["Calorías"])),
      caloriasQuemadas: num(first(row.caloriasQuemadas, row["Calorias quemadas"], row["Cal. quemadas"])),
      nutricion: bounded(first(row.nutricion, row.Nutricion, row["Nutricion (0-10)"]), 0, 10),
      deporte: bounded(first(row.deporte, row.Deporte, row["Deporte (dias)"]), 0, 7),
      emocional: emotional(first(row.emocional, row.Emocional)),
      kmSemana: num(first(row.kmSemana, row["Km semana"], row["KM semana"]))
    };
    if (r.fecha && isNum(r.peso)) byDate.set(r.fecha, r);
  });
  const rows = [...byDate.values()].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  enrich(rows);
  return rows;
}

// Añade intervalo entre mediciones, ritmo en kg/semana y media móvil de 3 mediciones.
function enrich(rows) {
  rows.forEach((r, i) => {
    r.t = parseDate(r.fecha).getTime();
    r.prev = i ? rows[i - 1] : null;
    r.days = r.prev ? Math.round((r.t - r.prev.t) / DAY) : null;
    r.rate = r.prev && r.days > 0 ? ((r.peso - r.prev.peso) / r.days) * 7 : null;
    r.smooth = {};
  });
  ["peso", "grasa", "musculo", "visceral"].forEach(key => {
    const valid = rows.filter(r => isNum(r[key]));
    valid.forEach((r, i) => {
      r.smooth[key] = mean([valid[i - 1], r, valid[i + 1]].filter(Boolean).map(x => x[key]));
    });
  });
}

/* ---------- Render general ---------- */

function render() {
  const rows = state.rows;
  if (!rows.length) {
    $("heroWeight").textContent = "--";
    $("heroDate").textContent = "Aún no hay mediciones. Añade la primera.";
    setSync("Sin mediciones todavía.");
    return;
  }
  renderHero();
  renderKpis();
  renderCompare();
  renderCharts();
  renderReading();
  renderHabits();
  renderMonthOptions();
  renderMonth();
  renderRecords();
  renderHistory();
  renderSync();
}

/* ---------- Hero ---------- */

function renderHero() {
  const rows = state.rows;
  const last = rows.at(-1);
  const ago = daysAgo(last.fecha);
  const goal = state.goal;
  const diff = last.peso - goal;
  const peak = extreme(rows, "peso", "max");

  $("heroWeight").textContent = fmtNum(last.peso, 1);
  $("heroDate").innerHTML = `Medido el ${fmtDate(last.fecha)}${
    ago > STALE_DAYS ? ` <span class="stale">hace ${ago} días · toca medir</span>`
      : ago === 0 ? " · hoy" : ago === 1 ? " · ayer" : ` · hace ${ago} días`}`;

  $("goalInput").value = String(goal);
  $("goalDiff").innerHTML = Math.abs(diff) < 0.05
    ? `<span class="good">Justo en el objetivo</span>`
    : diff < 0
      ? `<span class="good">Objetivo cumplido · ${fmtNum(-diff, 1)} kg por debajo</span>`
      : `Faltan <b>${fmtNum(diff, 1)} kg</b>`;

  const span = peak.peso - goal;
  const pct = span > 0 ? clamp((peak.peso - last.peso) / span, 0, 1) : (diff <= 0 ? 1 : 0);
  $("goalFill").style.setProperty("--progress", `${(pct * 100).toFixed(1)}%`);
  $("goalTrack").setAttribute("aria-label", `${Math.round(pct * 100)} % del camino entre el pico y el objetivo`);
  $("goalFrom").textContent = `Pico ${fmtNum(peak.peso, 1)} kg · ${fmtMonthYear(peak.t)}`;
  $("goalTo").textContent = `Objetivo ${fmtNum(goal, 1)} kg`;

  const lost = peak.peso - last.peso;
  const pace = weightPace();
  let note;
  if (diff <= 0) {
    note = `${fmtNum(lost, 1)} kg menos que en tu pico. El peso ya está en zona objetivo: ahora toca consolidarlo y seguir mejorando la composición.`;
  } else if (pace && pace.rate < -0.05) {
    const weeks = diff / -pace.rate;
    const eta = new Date(last.t + weeks * 7 * DAY);
    note = weeks < 104
      ? `Al ritmo de las últimas ${pace.weeks} semanas (${fmtNum(pace.rate, 2).replace("-", "−")} kg/sem) llegarías hacia ${fmtMonthLong(eta)}.`
      : `Llevas ${fmtNum(lost, 1)} kg menos que en tu pico. El ritmo reciente es lento para estimar una fecha.`;
  } else {
    note = `Llevas ${fmtNum(lost, 1)} kg menos que en tu pico, pero en las últimas semanas el peso no baja de forma sostenida.`;
  }
  $("goalNote").textContent = note;
}

/* ---------- Franja de indicadores ---------- */

function renderKpis() {
  const rows = state.rows;
  const last = rows.at(-1);
  const keys = ["peso", "grasa", "musculo", "visceral", "imc", "calorias"];
  $("kpiStrip").innerHTML = keys.map(key => {
    const m = META[key];
    const prev = previousWith(last, key);
    const d = prev && isNum(last[key]) ? last[key] - prev[key] : null;
    return `
      <div class="kpi">
        <p class="kpi-label">${m.label}</p>
        <p class="kpi-value">${isNum(last[key]) ? fmtNum(last[key], m.dec) : "—"}${m.unit ? `<small>${m.unit}</small>` : ""}</p>
        <p class="kpi-delta ${tone(d, key)}">${prev ? fmtDelta(d, key) : "Primera medición"}</p>
        ${sparkline(key)}
      </div>`;
  }).join("");
  const prev = last.prev;
  $("stripFoot").textContent = prev
    ? `Cambios frente a la medición anterior (${fmtDate(prev.fecha)}). Las líneas muestran las últimas 12 mediciones.`
    : "";
}

function sparkline(key) {
  const values = state.rows.slice(-12).map(r => r[key]).filter(isNum);
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const W = 120;
  const H = 28;
  const pad = 3;
  const d = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = pad + (H - pad * 2) * (1 - (v - min) / span);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
  return `<svg class="kpi-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>`;
}

/* ---------- 01 Progreso acumulado ---------- */

function renderCompare() {
  const rows = state.rows;
  const firstRow = rows[0];
  const peak = extreme(rows, "peso", "max");
  const last = rows.at(-1);
  const refs = [firstRow, peak];
  const keys = ["peso", "grasa", "musculo", "visceral"];

  $("compareTable").innerHTML = `
    <thead>
      <tr>
        <th scope="col">Métrica</th>
        <th scope="col">Hoy</th>
        <th scope="col">Desde el primer registro<span class="ref-date">${fmtDate(firstRow.fecha)}</span></th>
        <th scope="col">Desde el peor pico<span class="ref-date">${fmtDate(peak.fecha)} · ${fmt(peak.peso, "peso")}</span></th>
      </tr>
    </thead>
    <tbody>
      ${keys.map(key => {
        const current = latestValue(key);
        return `
        <tr>
          <th scope="row">${META[key].label === "G. visceral" ? "Grasa visceral" : META[key].label}</th>
          <td class="now">${fmt(current, key)}</td>
          ${refs.map(ref => {
            const d = isNum(current) && isNum(ref[key]) ? current - ref[key] : null;
            return `<td><span class="chg ${tone(d, key)}">${fmtDelta(d, key)}</span><span class="from">desde ${fmt(ref[key], key)}</span></td>`;
          }).join("")}
        </tr>`;
      }).join("")}
    </tbody>`;
}

/* ---------- 02 Tendencia ---------- */

function setupRange() {
  const box = $("rangeControls");
  box.innerHTML = RANGES.map(r => `<button type="button" role="tab" data-range="${r.key}" aria-selected="${r.key === state.range}">${r.label}</button>`).join("");
  box.addEventListener("click", e => {
    const btn = e.target.closest("button[data-range]");
    if (!btn) return;
    state.range = btn.dataset.range;
    store.set(STORE.range, state.range);
    box.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b === btn)));
    if (state.rows.length) renderCharts();
  });
}

function rangeRows() {
  const rows = state.rows;
  const range = RANGES.find(r => r.key === state.range) || RANGES.at(-1);
  if (!range.months) return rows;
  const start = new Date(rows.at(-1).t);
  start.setMonth(start.getMonth() - range.months);
  const list = rows.filter(r => r.t >= start.getTime());
  return list.length >= 2 ? list : rows.slice(-2);
}

function renderCharts() {
  if (!window.Chart) { chartFallback(); return; }
  const list = rangeRows();
  const range = RANGES.find(r => r.key === state.range) || RANGES.at(-1);
  const scope = range.months ? `en ${range.label}` : "en todo el historial";

  bodyChart("chartPeso", "peso", list, { goal: state.goal, accent: true });
  bodyChart("chartGrasa", "grasa", list);
  bodyChart("chartMusculo", "musculo", list);
  bodyChart("chartVisceral", "visceral", list);

  [["capPeso", "peso"], ["capGrasa", "grasa"], ["capMusculo", "musculo"], ["capVisceral", "visceral"]].forEach(([id, key]) => {
    const pts = list.filter(r => isNum(r.smooth[key]));
    if (pts.length < 2) { $(id).textContent = ""; return; }
    const d = pts.at(-1).smooth[key] - pts[0].smooth[key];
    $(id).innerHTML = `<span class="${tone(d, key)}">${fmtDelta(d, key)}</span> <span class="muted">${scope}</span>`;
  });
}

function bodyChart(id, key, list, opts = {}) {
  const c = colors();
  const m = META[key];
  const raw = list.filter(r => isNum(r[key])).map(r => ({ x: r.t, y: r[key] }));
  const smooth = list.filter(r => isNum(r.smooth[key])).map(r => ({ x: r.t, y: r.smooth[key] }));
  if (!raw.length) { destroyChart(id); return; }
  const lineColor = opts.accent ? c.accent : c.ink;

  const ys = raw.map(p => p.y);
  if (isNum(opts.goal)) ys.push(opts.goal);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const pad = (yMax - yMin) * 0.14 || 1;
  yMin -= pad;
  yMax += pad;
  if (m.dec === 0) { yMin = Math.floor(yMin); yMax = Math.ceil(yMax); }

  const refs = isNum(opts.goal) ? [{ value: opts.goal, color: c.good, label: `Objetivo ${fmtNum(opts.goal, 1)} kg` }] : [];
  const xMin = raw[0].x;
  const xMax = raw.at(-1).x;
  const xPad = Math.max((xMax - xMin) * 0.02, DAY);
  const lastIndex = raw.length - 1;

  makeChart(id, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Tendencia",
          data: smooth,
          borderColor: lineColor,
          borderWidth: opts.accent ? 2.75 : 2.25,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0.35,
          order: 2
        },
        {
          label: "Lectura",
          data: raw,
          showLine: false,
          pointRadius: ctx => (ctx.dataIndex === lastIndex ? 4.5 : raw.length > 60 ? 2.2 : 3),
          pointHoverRadius: 5.5,
          pointBackgroundColor: ctx => (ctx.dataIndex === lastIndex ? lineColor : c.dot),
          pointBorderWidth: 0,
          order: 1
        }
      ]
    },
    options: {
      ...baseOptions(c),
      interaction: { mode: "nearest", axis: "x", intersect: false },
      scales: {
        x: timeAxis(c, xMin - xPad, xMax + xPad),
        y: {
          suggestedMin: yMin,
          suggestedMax: yMax,
          grid: { color: c.grid },
          border: { display: false },
          ticks: {
            color: c.axis,
            maxTicksLimit: 5,
            padding: 8,
            stepSize: m.dec === 0 ? 1 : undefined,
            callback: v => (m.dec === 0 && !Number.isInteger(v) ? "" : fmtNum(v, m.dec === 0 ? 0 : 1))
          }
        }
      },
      plugins: {
        legend: { display: false },
        refLines: { lines: refs },
        tooltip: {
          ...tooltipTheme(c),
          filter: item => item.datasetIndex === 1,
          callbacks: {
            title: items => fmtDate(isoFromT(items[0].parsed.x)),
            label: item => {
              const s = smooth.find(p => p.x === item.parsed.x);
              const lines = [`Lectura: ${fmt(item.parsed.y, key)}`];
              if (s) lines.push(`Tendencia: ${fmt(s.y, key)}`);
              return lines;
            }
          }
        }
      }
    }
  });
}

function timeAxis(c, min, max) {
  const spanDays = (max - min) / DAY;
  return {
    type: "linear",
    min,
    max,
    grid: { display: false },
    border: { color: c.grid },
    afterBuildTicks: axis => {
      const maxTicks = Math.max(2, Math.floor((axis.width || 600) / 72));
      axis.ticks = monthTicks(axis.min, axis.max, maxTicks).map(value => ({ value }));
    },
    ticks: {
      color: c.axis,
      maxRotation: 0,
      autoSkip: false,
      callback: v => fmtAxisMonth(v, spanDays)
    }
  };
}

function monthTicks(min, max, maxTicks) {
  const ticks = [];
  const d = new Date(min);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() < min) d.setMonth(d.getMonth() + 1);
  while (d.getTime() <= max) {
    ticks.push(d.getTime());
    d.setMonth(d.getMonth() + 1);
  }
  if (ticks.length <= maxTicks) return ticks;
  const step = Math.ceil(ticks.length / maxTicks);
  return ticks.filter((_, i) => i % step === 0);
}

/* ---------- 03 Lectura ---------- */

const CHANGE_THRESHOLD = { peso: 0.4, grasa: 0.4, musculo: 0.3, visceral: 0.5 };
const PHRASES = {
  peso: { up: "sube el peso", down: "baja el peso" },
  grasa: { up: "sube la grasa", down: "baja la grasa" },
  musculo: { up: "sube el músculo", down: "baja el músculo" },
  visceral: { up: "sube la grasa visceral", down: "baja la grasa visceral" }
};

function recentChanges() {
  return ["peso", "grasa", "musculo", "visceral"].map(key => {
    const valid = state.rows.filter(r => isNum(r[key]));
    if (valid.length < 4) return null;
    const n = valid.length >= 6 ? 3 : 2;
    const recent = valid.slice(-n);
    const before = valid.slice(-2 * n, -n);
    const d = mean(recent.map(r => r[key])) - mean(before.map(r => r[key]));
    const signed = d * META[key].dir;
    const status = signed > CHANGE_THRESHOLD[key] ? "improved" : signed < -CHANGE_THRESHOLD[key] ? "worsened" : "stable";
    return { key, d, n, status, recent };
  }).filter(Boolean);
}

function renderReading() {
  const rows = state.rows;
  const last = rows.at(-1);
  const changes = recentChanges();
  const improved = changes.filter(c => c.status === "improved");
  const worsened = changes.filter(c => c.status === "worsened");
  const stable = changes.filter(c => c.status === "stable");
  const n = changes[0] ? changes[0].n : 3;
  const habits = habitAnalysis();
  const topHabit = habits.list.find(h => h.verdict === "good");
  const findings = [];

  // 1. Qué mejora
  if (improved.length) {
    findings.push({
      tone: "good",
      tag: "Mejora",
      title: capitalize(joinList(improved.map(c => PHRASES[c.key][c.d < 0 ? "down" : "up"]))),
      text: `Media de las ${n} últimas mediciones (desde el ${fmtDate(improved[0].recent[0].fecha)}) frente a las ${n} anteriores: ${improved.map(c => `${labelOf(c.key).toLowerCase()} <b class="good">${fmtDelta(c.d, c.key)}</b>`).join(", ")}.`
    });
  } else {
    findings.push({
      tone: "flat",
      tag: "Mejora",
      title: "Ninguna métrica mejora con claridad",
      text: `Comparando las ${n} últimas mediciones con las ${n} anteriores, los cambios están dentro del margen de ruido de la báscula.`
    });
  }

  // 2. Qué se estanca o retrocede
  const lastWeights = rows.slice(-3).map(r => r.peso);
  const plateau = rows.length >= 4 && Math.max(...lastWeights) - Math.min(...lastWeights) <= 0.6;
  const fatDown = improved.find(c => c.key === "grasa");
  const muscleUp = improved.find(c => c.key === "musculo");
  const stableOthers = stable.filter(c => c.key !== "peso");
  if (worsened.length) {
    findings.push({
      tone: "bad",
      tag: "Retrocede",
      title: capitalize(joinList(worsened.map(c => PHRASES[c.key][c.d < 0 ? "down" : "up"]))),
      text: `${worsened.map(c => `${labelOf(c.key)} <b class="bad">${fmtDelta(c.d, c.key)}</b>`).join(", ")} en la media reciente.${
        plateau ? ` El peso lleva 3 mediciones entre ${fmtNum(Math.min(...lastWeights), 1)} y ${fmtNum(Math.max(...lastWeights), 1)} kg.` : ""}${
        stableOthers.length ? ` Sin cambios relevantes en ${joinList(stableOthers.map(c => labelOf(c.key).toLowerCase()))}.` : ""}`
    });
  } else if (plateau || stable.length) {
    let text = "";
    if (plateau) {
      text = `Las 3 últimas mediciones están entre ${fmtNum(Math.min(...lastWeights), 1)} y ${fmtNum(Math.max(...lastWeights), 1)} kg.`;
      if (fatDown || muscleUp) {
        text += ` Mientras, ${fatDown ? "la grasa baja" : ""}${fatDown && muscleUp ? " y " : ""}${muscleUp ? "el músculo sube" : ""}: es compatible con una recomposición, aunque la bioimpedancia tiene margen de error.`;
      }
    }
    if (stableOthers.length) text += `${text ? " " : ""}${capitalize(joinList(stableOthers.map(c => labelOf(c.key).toLowerCase())))}: sin cambios relevantes en la media reciente.`;
    findings.push({
      tone: "warn",
      tag: "Estancado",
      title: plateau
        ? (rows.at(-1).peso <= state.goal ? "El peso se ha estabilizado en zona objetivo" : "El peso se ha estabilizado")
        : `Se mantiene${stable.length > 1 ? "n" : ""} ${joinList(stable.map(c => labelOf(c.key).toLowerCase()))}`,
      text
    });
  } else {
    findings.push({ tone: "good", tag: "Estancado", title: "Nada se estanca ni retrocede", text: "Todas las métricas de composición avanzan en la buena dirección." });
  }

  // 3. Hábitos que acompañan
  if (topHabit) {
    const others = habits.list.filter(h => h !== topHabit && h.verdict === "good");
    const noise = habits.list.filter(h => h.verdict === "flat");
    findings.push({
      tone: "flat",
      tag: "Hábitos",
      title: `Tus mejores semanas coinciden con más ${topHabit.noun}`,
      text: `Con ${topHabit.noun} ${topHabit.splitLabel}, el peso cambió típicamente <b class="good">${fmtRate(topHabit.hi)}</b>; por debajo, ${fmtRate(topHabit.lo).toLowerCase()} (${topHabit.nHi} frente a ${topHabit.nLo} semanas).${
        others.length ? ` También acompaña: ${joinList(others.map(h => h.noun))}.` : ""}${
        noise.length ? ` ${capitalize(joinList(noise.map(h => h.noun)))}: sin diferencia clara.` : ""} Es una asociación, no una causa demostrada.`
    });
  } else {
    findings.push({
      tone: "flat",
      tag: "Hábitos",
      title: "Aún no hay un hábito que destaque",
      text: habits.sampleSize < 8
        ? `Solo hay ${habits.sampleSize} semanas comparables con hábitos registrados. Sigue anotándolos: con unas semanas más la lectura será fiable.`
        : "Con los datos actuales ningún hábito se separa claramente del ruido. Cada semana registrada añade claridad."
    });
  }

  // 4. Siguiente foco
  findings.push({ tone: "focus", tag: "Siguiente foco", title: "Lo razonable ahora", list: nextFocus(changes, habits, topHabit) });

  $("findings").innerHTML = findings.map(f => `
    <article class="finding" data-tone="${f.tone}">
      <p class="finding-tag">${f.tag}</p>
      <div>
        <h3>${f.title}</h3>
        ${f.text ? `<p>${f.text}</p>` : ""}
        ${f.list ? `<ol>${f.list.map(item => `<li>${item}</li>`).join("")}</ol>` : ""}
      </div>
    </article>`).join("");

  renderLastWeek(last);
}

function nextFocus(changes, habits, topHabit) {
  const rows = state.rows;
  const last = rows.at(-1);
  const ago = daysAgo(last.fecha);
  const items = [];
  const get = key => changes.find(c => c.key === key);

  if (ago > 14) {
    items.push(`<b>Vuelve a medir esta semana.</b> La última medición es de hace ${ago} días; sin datos recientes, la tendencia que ves aquí está desfasada.`);
  }

  if (last.peso <= state.goal) {
    const grasa = get("grasa");
    const lastFat = latestValue("grasa");
    if (grasa && grasa.status !== "worsened" && isNum(lastFat)) {
      const target = lastFat - Math.floor(lastFat) >= 0.3 ? Math.floor(lastFat) : Math.floor(lastFat) - 1;
      items.push(`<b>Define el siguiente objetivo.</b> Los ${fmtNum(state.goal, 1)} kg ya están cumplidos. Con la grasa en ${fmt(lastFat, "grasa")}, un objetivo de composición (grasa por debajo del ${target} %) encaja mejor que seguir bajando peso.`);
    } else {
      items.push(`<b>Consolida el peso.</b> Los ${fmtNum(state.goal, 1)} kg ya están cumplidos: el reto ahora es mantenerte en esa zona varias semanas seguidas.`);
    }
  } else {
    const pace = weightPace();
    const diff = last.peso - state.goal;
    if (!pace || pace.rate >= -0.05) {
      items.push(`<b>Reactiva la bajada.</b> Faltan ${fmtNum(diff, 1)} kg y el ritmo reciente es plano. Vuelve a lo que funcionó en tus mejores semanas.`);
    }
  }

  if (topHabit) {
    const latestRow = [...rows].reverse().find(r => isNum(r[topHabit.key]));
    if (latestRow && latestRow[topHabit.key] < topHabit.split) {
      items.push(`<b>Recupera ${topHabit.noun}.</b> Tu última semana marcó ${fmt(latestRow[topHabit.key], topHabit.key)}, por debajo del umbral (${fmt(topHabit.split, topHabit.key)}) que acompaña a tus mejores semanas.`);
    }
  }

  const ctx = [...rows].reverse().find(hasContext);
  if (ctx) {
    ["nutricion", "deporte", "emocional"].forEach(key => {
      const m = META[key];
      if (isNum(ctx[key]) && ctx[key] < m.min) {
        const advice = {
          nutricion: "Es la palanca más directa sobre el peso.",
          deporte: "Apunta al menos a 4 días, aunque sean sesiones cortas.",
          emocional: "Las semanas difíciles suelen arrastrar sueño y comida; bajar exigencia también es estrategia."
        }[key];
        const name = { nutricion: "la nutrición", deporte: "el deporte", emocional: "lo emocional" }[key];
        items.push(`<b>Cuida ${name}.</b> La última semana registró ${fmtNum(ctx[key], 0)}${key === "deporte" ? " días" : "/10"}, por debajo de ${m.min}. ${advice}`);
      }
    });
  }

  const muscle = get("musculo");
  if (muscle && muscle.status === "worsened") {
    items.push(`<b>Protege el músculo.</b> La media reciente baja ${fmtDelta(muscle.d, "musculo").replace("−", "")}: prioriza fuerza y proteína antes de apretar el déficit.`);
  }
  const weight = get("peso");
  if (weight && weight.status === "worsened" && last.peso > state.goal) {
    items.push(`<b>Revisa la nutrición de las próximas dos semanas.</b> La media reciente de peso sube ${fmtDelta(weight.d, "peso").replace("+", "")}.`);
  }

  if (!items.length) items.push("<b>Mantén lo que está funcionando.</b> No hay alertas: repite la rutina y sigue midiendo cada semana.");
  return items.slice(0, 3);
}

function renderLastWeek(last) {
  const rows = state.rows;
  const prev = last.prev;
  const ctx = [...rows].reverse().find(hasContext);
  const avgK = mean(rows.map(r => r.caloriasQuemadas).filter(isNum));
  const avgKm = mean(rows.map(r => r.kmSemana).filter(isNum));

  const comp = ["peso", "grasa", "musculo", "visceral"].map(key => {
    const p = previousWith(last, key);
    const d = p && isNum(last[key]) ? last[key] - p[key] : null;
    return `<li><span>${META[key].label}</span><b>${fmt(last[key], key)}<small class="${tone(d, key)}">${p ? fmtDelta(d, key) : ""}</small></b></li>`;
  }).join("");

  const pace = isNum(last.rate)
    ? `<li><span>Ritmo</span><b class="${tone(last.rate, "rate")}">${fmtRate(last.rate)}</b></li>`
    : "";

  let context = "";
  if (ctx) {
    const note = ctx !== last ? ` <span style="text-transform:none;letter-spacing:0">(${fmtDate(ctx.fecha)})</span>` : "";
    context = `
      <p class="lw-group">Contexto${note}</p>
      <ul class="lw-list">
        ${contextItem(ctx, "nutricion", "/10")}
        ${contextItem(ctx, "deporte", " días")}
        ${contextItem(ctx, "emocional", "/10")}
      </ul>
      <p class="lw-group">Actividad</p>
      <ul class="lw-list">
        <li><span>Cal. quemadas</span><b>${fmt(ctx.caloriasQuemadas, "caloriasQuemadas")}${isNum(avgK) ? `<small>media ${fmtNum(avgK, 0)}</small>` : ""}</b></li>
        <li><span>Kilómetros</span><b>${fmt(ctx.kmSemana, "kmSemana")}${isNum(avgKm) ? `<small>media ${fmtNum(avgKm, 0)}</small>` : ""}</b></li>
      </ul>`;
  }

  $("lastWeek").innerHTML = `
    <p class="kicker">Última medición</p>
    <h3>${fmtDate(last.fecha)}</h3>
    <p class="lw-sub">${prev ? `Frente al ${fmtDate(prev.fecha)} · ${last.days} ${last.days === 1 ? "día" : "días"}` : "Primera medición del historial"}</p>
    <p class="lw-group">Composición</p>
    <ul class="lw-list">${comp}${pace}</ul>
    ${context}`;
}

function contextItem(row, key, suffix) {
  const v = row[key];
  const cls = isNum(v) && v < META[key].min ? "bad" : "";
  return `<li><span>${META[key].label}</span><b class="${cls}">${isNum(v) ? `${fmtNum(v, 0)}${suffix}` : "—"}</b></li>`;
}

/* ---------- 04 Hábitos y actividad ---------- */

const HABIT_FACTORS = [
  { key: "caloriasQuemadas", label: "Calorías quemadas", noun: "calorías quemadas" },
  { key: "kmSemana", label: "Kilómetros", noun: "kilómetros" },
  { key: "nutricion", label: "Nutrición", noun: "nutrición" },
  { key: "deporte", label: "Días de deporte", noun: "días de deporte" },
  { key: "emocional", label: "Emocional", noun: "bienestar emocional" }
];

// Compara el ritmo de peso (mediana, kg/sem) entre las semanas con el hábito alto y bajo.
function habitAnalysis() {
  const sample = state.rows.filter(r => isNum(r.rate) && r.days >= 5 && r.days <= 28);
  const list = HABIT_FACTORS.map(f => {
    const pts = sample.filter(r => isNum(r[f.key])).map(r => ({ v: r[f.key], rate: r.rate }));
    const base = { ...f, n: pts.length };
    if (pts.length < 6) return { ...base, verdict: "few" };
    const values = [...new Set(pts.map(p => p.v))].sort((a, b) => a - b);
    const med = median(pts.map(p => p.v));
    let best = null;
    values.slice(1).forEach(t => {
      const nHi = pts.filter(p => p.v >= t).length;
      const score = Math.abs(nHi - (pts.length - nHi)) + Math.abs(t - med) / (Math.abs(med) || 1) * 0.01;
      if (!best || score < best.score) best = { t, score };
    });
    if (!best) return { ...base, verdict: "few" };
    const hi = pts.filter(p => p.v >= best.t).map(p => p.rate);
    const lo = pts.filter(p => p.v < best.t).map(p => p.rate);
    const mHi = median(hi);
    const mLo = median(lo);
    const diff = mHi - mLo;
    let verdict;
    if (Math.min(hi.length, lo.length) < 4) verdict = "few";
    else if (Math.abs(diff) < 0.25) verdict = "flat";
    else verdict = diff < 0 ? "good" : "inverse";
    return {
      ...base,
      split: best.t,
      splitLabel: `≥ ${fmt(best.t, f.key)}`,
      hi: mHi,
      lo: mLo,
      nHi: hi.length,
      nLo: lo.length,
      diff,
      verdict
    };
  });
  const order = { good: 0, inverse: 1, flat: 2, few: 3 };
  list.sort((a, b) => order[a.verdict] - order[b.verdict] || (a.diff || 0) - (b.diff || 0));
  return { list, sampleSize: sample.filter(hasContext).length };
}

function renderHabits() {
  const rows = state.rows;
  const start = rows.findIndex(r => HABIT_FACTORS.some(f => isNum(r[f.key])));
  const list = start < 0 ? [] : rows.slice(start);

  if (!list.length) {
    $("habitsLead").textContent = "Todavía no hay registros de nutrición, deporte, emocional ni actividad.";
  } else {
    $("habitsLead").textContent = `Desde el ${fmtDate(list[0].fecha)}, primera semana con datos de hábitos y actividad. Cada métrica va en su propia escala; la línea discontinua marca el mínimo razonable o tu mediana.`;
  }
  renderLanes(list);

  const habits = habitAnalysis();
  const top = habits.list.find(h => h.verdict === "good");
  $("habitCompareLead").innerHTML = top
    ? `En tus datos, las semanas con ${top.noun} ${top.splitLabel} coinciden con un ritmo típico de <b class="good">${fmtRate(top.hi)}</b>, frente a ${fmtRate(top.lo).toLowerCase()} en el resto. Es una asociación con ${top.nHi + top.nLo} semanas, no una causa demostrada.`
    : "Con los datos actuales ningún hábito se asocia claramente a mejores semanas. Sigue registrando: cada semana añade claridad.";

  const scale = 1.2;
  $("habitTable").innerHTML = `
    <thead>
      <tr>
        <th scope="col">Hábito</th>
        <th scope="col">Semanas altas</th>
        <th scope="col">Semanas bajas</th>
        <th scope="col">Diferencia de ritmo</th>
        <th scope="col">Lectura</th>
      </tr>
    </thead>
    <tbody>
      ${habits.list.map(h => {
        if (!isNum(h.diff)) {
          return `<tr><th scope="row" class="h-name">${h.label}<small>${h.n} semanas con dato</small></th><td colspan="3" class="h-n">Faltan semanas para comparar.</td><td><span class="verdict">Pocos datos</span></td></tr>`;
        }
        const w = Math.min(Math.abs(h.diff) / scale, 1) * 50;
        const color = h.verdict === "few" || h.verdict === "flat" ? "var(--neutral-bar)" : h.diff < 0 ? "var(--good)" : "var(--bad)";
        const left = h.diff < 0 ? 50 - w : 50;
        const verdict = {
          good: `<span class="verdict good">Acompaña a bajadas</span>`,
          inverse: `<span class="verdict">Relación inversa</span>`,
          flat: `<span class="verdict">Sin diferencia clara</span>`,
          few: `<span class="verdict">Pocos datos</span>`
        }[h.verdict];
        return `
          <tr>
            <th scope="row" class="h-name">${h.label}<small>alto: ${h.splitLabel}</small></th>
            <td><b class="${tone(h.hi, "rate")}">${fmtRate(h.hi)}</b><div class="h-n">${h.nHi} semanas</div></td>
            <td><b class="${tone(h.lo, "rate")}">${fmtRate(h.lo)}</b><div class="h-n">${h.nLo} semanas</div></td>
            <td>
              <div class="diverge" role="img" aria-label="Diferencia ${fmtRate(h.diff)}"><i style="left:${left}%;width:${w}%;background:${color}"></i></div>
              <div class="h-n">${fmtDelta(h.diff, "rate")}</div>
            </td>
            <td>${verdict}</td>
          </tr>`;
      }).join("")}
    </tbody>`;

  const used = state.rows.filter(r => isNum(r.rate) && r.days >= 5 && r.days <= 28 && hasContext(r)).length;
  $("habitFootnote").textContent = `Ritmo típico = mediana del cambio de peso en kg/semana entre mediciones consecutivas. Cada hábito se divide en dos grupos lo más parecidos posible en tamaño. Se usan ${used} intervalos de entre 5 y 28 días: los muy cortos reflejan sobre todo agua y digestión, y los muy largos no corresponden a una sola semana. Una asociación no demuestra causa.`;
}

function renderLanes(list) {
  if (!window.Chart) return;
  const c = colors();
  const labels = list.map(r => fmtShort(r.t));

  const thresholdColor = key => list.map(r => (isNum(r[key]) && r[key] < META[key].min ? c.bad : c.neutral));
  const outcomeColor = list.map(r => (!isNum(r.rate) ? c.neutral : r.rate < -0.2 ? c.good : r.rate > 0.2 ? c.bad : c.neutral));

  laneChart("laneNutricion", list, labels, "nutricion", { min: 0, max: 10, colors: thresholdColor("nutricion"), refs: [{ value: 6, color: c.bad, label: "6" }] });
  laneChart("laneDeporte", list, labels, "deporte", { min: 0, max: 7, colors: thresholdColor("deporte"), refs: [{ value: 4, color: c.bad, label: "4" }] });
  laneChart("laneEmocional", list, labels, "emocional", { min: 0, max: 10, colors: thresholdColor("emocional"), refs: [{ value: 5, color: c.bad, label: "5" }], showX: true });

  const kcal = list.map(r => r.caloriasQuemadas).filter(isNum);
  const km = list.map(r => r.kmSemana).filter(isNum);
  const kcalMed = median(kcal);
  const kmMed = median(km);
  laneChart("laneKcal", list, labels, "caloriasQuemadas", {
    type: "line",
    min: kcal.length ? Math.floor((Math.min(...kcal) - 150) / 100) * 100 : 0,
    max: kcal.length ? Math.ceil((Math.max(...kcal) + 150) / 100) * 100 : 3000,
    colors: outcomeColor,
    refs: isNum(kcalMed) ? [{ value: kcalMed, color: c.axis, label: `mediana ${fmtNum(kcalMed, 0)}` }] : []
  });
  laneChart("laneKm", list, labels, "kmSemana", {
    min: 0,
    max: km.length ? Math.ceil((Math.max(...km) * 1.1) / 10) * 10 : 10,
    colors: outcomeColor,
    refs: isNum(kmMed) ? [{ value: kmMed, color: c.axis, label: `mediana ${fmtNum(kmMed, 0)}` }] : []
  });
  const rates = list.map(r => r.rate).filter(isNum);
  const lim = Math.max(1, Math.ceil(Math.max(...rates.map(Math.abs), 0) * 2) / 2);
  laneChart("laneRate", list, labels, "rate", {
    min: -lim,
    max: lim,
    colors: outcomeColor,
    refs: [{ value: 0, color: c.axis, dash: [] }],
    showX: true
  });
}

function laneChart(id, list, labels, key, opts) {
  const c = colors();
  const isLine = opts.type === "line";
  const m = META[key];
  makeChart(id, {
    type: isLine ? "line" : "bar",
    data: {
      labels,
      datasets: [{
        data: list.map(r => (isNum(r[key]) ? r[key] : null)),
        backgroundColor: opts.colors,
        borderColor: isLine ? c.faint : opts.colors,
        borderWidth: isLine ? 1.5 : 0,
        pointBackgroundColor: opts.colors,
        pointBorderWidth: 0,
        pointRadius: isLine ? 4 : 0,
        pointHoverRadius: isLine ? 6 : 0,
        borderRadius: 2,
        maxBarThickness: 18,
        categoryPercentage: 0.72,
        spanGaps: true,
        tension: 0.25
      }]
    },
    options: {
      ...baseOptions(c),
      layout: { padding: { top: 6, right: 4 } },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          display: !!opts.showX,
          grid: { display: false },
          border: { color: c.grid },
          offset: true,
          ticks: { color: c.axis, maxRotation: 0, autoSkip: true, autoSkipPadding: 14 }
        },
        y: {
          min: opts.min,
          max: opts.max,
          afterFit: scale => { scale.width = 46; },
          grid: { color: c.grid, drawTicks: false },
          border: { display: false },
          ticks: {
            color: c.axis,
            padding: 6,
            maxTicksLimit: 3,
            includeBounds: key === "rate",
            callback: v => (key === "rate" ? fmtSigned(v, 1) : fmtNum(v, 0))
          }
        }
      },
      plugins: {
        legend: { display: false },
        refLines: { lines: opts.refs || [] },
        tooltip: {
          ...tooltipTheme(c),
          callbacks: {
            title: items => fmtDate(list[items[0].dataIndex].fecha),
            label: item => {
              const r = list[item.dataIndex];
              const value = key === "rate" ? fmtRate(r.rate) : fmt(r[key], key);
              const extra = key !== "rate" && isNum(r.rate) && (key === "caloriasQuemadas" || key === "kmSemana") ? ` · peso ${fmtRate(r.rate)}` : "";
              return `${m.label}: ${value}${extra}`;
            }
          }
        }
      }
    }
  });
}

/* ---------- 05 Mes a mes ---------- */

function monthGroups() {
  const map = new Map();
  state.rows.forEach(r => {
    const key = r.fecha.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return [...map.entries()].map(([key, rows]) => ({ key, rows, label: fmtMonthKey(key) }));
}

function renderMonthOptions() {
  const groups = monthGroups();
  if (!groups.some(g => g.key === state.month)) state.month = groups.at(-1).key;
  $("monthSelect").innerHTML = [...groups].reverse().map(g =>
    `<option value="${g.key}" ${g.key === state.month ? "selected" : ""}>${capitalize(g.label)} · ${g.rows.length} ${g.rows.length === 1 ? "medición" : "mediciones"}</option>`
  ).join("");
}

function renderMonth() {
  const groups = monthGroups();
  const idx = groups.findIndex(g => g.key === state.month);
  if (idx < 0) return;
  const g = groups[idx];
  const p = idx > 0 ? groups[idx - 1] : null;
  const avg = (key, rows) => mean(rows.map(r => r[key]).filter(isNum));
  const overall = key => mean(state.rows.map(r => r[key]).filter(isNum));

  const row = (key, opts = {}) => {
    const a = avg(key, g.rows);
    const b = p ? avg(key, p.rows) : null;
    const d = isNum(a) && isNum(b) ? a - b : null;
    const m = META[key];
    const dec = opts.dec !== undefined ? opts.dec : Math.max(1, m.dec);
    const low = isNum(m.min) && isNum(a) && a < m.min ? "bad" : "";
    const value = isNum(a) ? `${fmtNum(a, dec)}${m.unit ? ` ${m.unit}` : ""}` : "—";
    return `<tr><th scope="row">${opts.label || m.label}</th><td class="${low}">${value}</td><td class="${tone(d, key)}">${p ? fmtDeltaDec(d, key, dec) : "—"}</td></tr>`;
  };
  const hasCtx = g.rows.some(hasContext);
  const hasAct = g.rows.some(r => isNum(r.caloriasQuemadas) || isNum(r.kmSemana));

  const table = `
    <table class="month-table">
      <thead><tr><th scope="col">Media del mes</th><th scope="col">Valor</th><th scope="col">${p ? `vs ${p.label.split(" ")[0]}` : "vs anterior"}</th></tr></thead>
      <tbody>
        <tr class="group-row"><th colspan="3">Composición</th></tr>
        ${row("peso")}
        ${row("grasa")}
        ${row("musculo")}
        ${row("visceral", { label: "Grasa visceral", dec: 1 })}
        ${hasCtx ? `<tr class="group-row"><th colspan="3">Contexto</th></tr>${row("nutricion")}${row("deporte")}${row("emocional")}` : ""}
        ${hasAct ? `<tr class="group-row"><th colspan="3">Actividad</th></tr>${row("caloriasQuemadas", { dec: 0 })}${row("kmSemana")}` : ""}
      </tbody>
    </table>`;

  // Narrativa prudente
  const paragraphs = [];
  const dPeso = p ? avg("peso", g.rows) - avg("peso", p.rows) : null;
  const dGrasa = p && isNum(avg("grasa", g.rows)) && isNum(avg("grasa", p.rows)) ? avg("grasa", g.rows) - avg("grasa", p.rows) : null;
  const prevName = p ? p.label : "";
  if (!p) {
    paragraphs.push("Primer mes del historial: sirve como punto de referencia para todo lo que viene después.");
  } else if (dPeso <= -0.5) {
    paragraphs.push(`El peso medio baja ${fmtNum(-dPeso, 1)} kg respecto a ${prevName}${
      dGrasa !== null && dGrasa <= -0.3 ? " y la grasa media también cae." : dGrasa !== null && dGrasa >= 0.3 ? ", aunque la grasa media sube: parte de la bajada puede ser agua o músculo." : "."}`);
  } else if (dPeso >= 0.5) {
    paragraphs.push(`El peso medio sube ${fmtNum(dPeso, 1)} kg respecto a ${prevName}${
      dGrasa !== null && dGrasa >= 0.3 ? " y la grasa media lo acompaña." : dGrasa !== null && dGrasa <= -0.3 ? ", pero la grasa media baja: parte de la subida puede no ser grasa." : "."}`);
  } else {
    paragraphs.push(`Mes estable: el peso medio cambia ${fmtDelta(dPeso, "peso").toLowerCase()} respecto a ${prevName}${
      dGrasa !== null && dGrasa <= -0.3 ? ", con la grasa media bajando." : dGrasa !== null && dGrasa >= 0.3 ? ", con la grasa media subiendo." : "."}`);
  }

  if (hasCtx || hasAct) {
    const checks = [
      { key: "nutricion", name: "nutrición", tol: 0.5, dec: 1 },
      { key: "deporte", name: "deporte", tol: 0.5, dec: 1 },
      { key: "emocional", name: "emocional", tol: 0.5, dec: 1 },
      { key: "caloriasQuemadas", name: "calorías quemadas", tol: 75, dec: 0 },
      { key: "kmSemana", name: "kilómetros", tol: 5, dec: 0 }
    ];
    const above = [];
    const below = [];
    checks.forEach(ch => {
      const a = avg(ch.key, g.rows);
      const o = overall(ch.key);
      if (!isNum(a) || !isNum(o)) return;
      const txt = `${ch.name} (${fmtNum(a, ch.dec)} frente a ${fmtNum(o, ch.dec)})`;
      if (a - o >= ch.tol) above.push(txt);
      else if (o - a >= ch.tol) below.push(txt);
    });
    let s = "";
    if (above.length) s += `Por encima de tu media: ${joinList(above)}. `;
    if (below.length) s += `Por debajo: ${joinList(below)}. `;
    if (!above.length && !below.length) s += "Los hábitos de este mes estuvieron en línea con tu media. ";
    if (p && isNum(dPeso)) {
      if (dPeso <= -0.5 && above.length > below.length) s += "Coincide con un mes de hábitos mejores que tu media.";
      else if (dPeso >= 0.5 && below.length > above.length) s += "Coincide con hábitos por debajo de tu media.";
      else if (dPeso <= -0.5) s += "El peso bajó sin que los hábitos destacaran; puede influir lo hecho el mes anterior o el ruido de la báscula.";
      else if (dPeso >= 0.5) s += "Los hábitos no cayeron y aun así el peso medio subió; puede ser retención de líquidos o un efecto que tarda en verse.";
      else s += "Hábitos y peso se movieron poco: mes de mantenimiento.";
    }
    paragraphs.push(s.trim());
  } else {
    paragraphs.push("Este mes no hay registro de nutrición, deporte, emocional ni actividad, así que no se puede relacionar el cambio con los hábitos.");
  }

  const n = g.rows.length;
  const caution = n <= 2
    ? `${n === 1 ? "Solo hay una medición" : "Solo hay dos mediciones"} este mes: tómalo como orientación, no como tendencia. Relación observada, no causa demostrada.`
    : `Con ${n} mediciones la media es razonable, pero sigue siendo una relación observada, no una causa demostrada.`;

  const bars = hasCtx ? `
    <div class="bars">
      ${bar("Nutrición", avg("nutricion", g.rows), 10, 6)}
      ${bar("Deporte", avg("deporte", g.rows), 7, 4)}
      ${bar("Emocional", avg("emocional", g.rows), 10, 5)}
    </div>` : "";

  $("monthPanel").innerHTML = `
    <div>
      <h3 class="month-title">${g.label}</h3>
      <p class="month-meta">${n} ${n === 1 ? "medición" : "mediciones"}${p ? ` · comparado con ${p.label}` : ""}</p>
      ${table}
    </div>
    <div class="month-story">
      <h3>Lectura del mes</h3>
      ${paragraphs.map(t => `<p>${t}</p>`).join("")}
      ${bars}
      <p class="caution">${caution}</p>
    </div>`;
}

function bar(label, value, max, threshold) {
  if (!isNum(value)) return "";
  const low = value < threshold;
  return `
    <div class="bar-row">
      <span>${label}</span>
      <div class="bar" role="img" aria-label="${label} ${fmtNum(value, 1)} de ${max}"><i class="${low ? "bad" : ""}" style="width:${clamp(value / max, 0, 1) * 100}%"></i><em style="left:${(threshold / max) * 100}%"></em></div>
      <b class="${low ? "bad" : ""}">${fmtNum(value, 1)}</b>
    </div>`;
}

/* ---------- 06 Marcas ---------- */

function renderRecords() {
  const specs = [
    { key: "peso", best: "min", label: "Peso" },
    { key: "grasa", best: "min", label: "Grasa" },
    { key: "musculo", best: "max", label: "Músculo" },
    { key: "visceral", best: "min", label: "Grasa visceral" },
    { key: "imc", best: "min", label: "IMC" },
    { key: "caloriasQuemadas", best: "max", label: "Calorías quemadas" },
    { key: "kmSemana", best: "max", label: "Km semana" }
  ];
  const body = specs.map(s => {
    const valid = state.rows.filter(r => isNum(r[s.key]));
    if (!valid.length) return "";
    const best = extreme(valid, s.key, s.best);
    const worst = extreme(valid, s.key, s.best === "min" ? "max" : "min");
    const current = valid.at(-1);
    const gap = current[s.key] - best[s.key];
    const atBest = round(gap, META[s.key].dec) === 0;
    return `
      <tr>
        <th scope="row">${s.label}</th>
        <td><b class="good">${fmt(best[s.key], s.key)}</b><small>${fmtDate(best.fecha)}</small></td>
        <td><b class="${META[s.key].dir === 0 ? "" : "bad"}">${fmt(worst[s.key], s.key)}</b><small>${fmtDate(worst.fecha)}</small></td>
        <td><b>${fmt(current[s.key], s.key)}</b><small>${fmtDate(current.fecha)}</small></td>
        <td class="gap">${atBest ? `<span class="good">En tu mejor marca</span>` : `a ${fmtDelta(gap, s.key).replace(/^[+−]/, "")} de la mejor`}</td>
      </tr>`;
  }).join("");

  $("recordsTable").innerHTML = `
    <thead><tr><th scope="col">Métrica</th><th scope="col">Mejor</th><th scope="col">Peor</th><th scope="col">Último</th><th scope="col">Distancia</th></tr></thead>
    <tbody>${body}</tbody>`;
}

/* ---------- 07 Historial ---------- */

function renderHistory() {
  const rows = [...state.rows].reverse();
  const cell = (v, dec, cls = "") => (isNum(v) ? `<td class="${cls}">${fmtNum(v, dec)}</td>` : `<td><span class="empty">—</span></td>`);
  const low = (r, key) => (isNum(r[key]) && r[key] < META[key].min ? "low" : "");

  $("historyBody").innerHTML = rows.map(r => {
    const d = r.prev ? r.peso - r.prev.peso : null;
    const arrow = d === null || round(d, 1) === 0 ? "" : d < 0 ? `<span class="arrow good" aria-label="baja">▼</span>` : `<span class="arrow bad" aria-label="sube">▲</span>`;
    return `
      <tr>
        <td>${fmtDate(r.fecha)}</td>
        <td>${fmtNum(r.peso, 1)}${arrow || `<span class="arrow"></span>`}</td>
        ${cell(r.imc, 1)}
        ${cell(r.musculo, 1)}
        ${cell(r.grasa, 1)}
        ${cell(r.visceral, 0)}
        ${cell(r.calorias, 0)}
        ${cell(r.caloriasQuemadas, 0)}
        ${cell(r.nutricion, 0, low(r, "nutricion"))}
        ${cell(r.deporte, 0, low(r, "deporte"))}
        ${cell(r.emocional, 0, low(r, "emocional"))}
        ${cell(r.kmSemana, 1)}
        <td><button type="button" class="row-edit" data-fecha="${r.fecha}" aria-label="Editar medición del ${fmtDate(r.fecha)}">Editar</button></td>
      </tr>`;
  }).join("");
  $("historyLead").textContent = `${state.rows.length} mediciones, de la más reciente a la más antigua. Pulsa «Editar» para corregir una fila en Google Sheets. En rojo, valores por debajo del mínimo razonable.`;
}

/* ---------- Formulario ---------- */

function setupForm() {
  const dialog = $("entryDialog");
  const form = $("entryForm");

  $("addEntryBtn").addEventListener("click", () => openForm(null));
  $("entryClose").addEventListener("click", () => dialog.close());
  $("entryReset").addEventListener("click", () => openForm(null));
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  $("historyBody").addEventListener("click", e => {
    const btn = e.target.closest("button[data-fecha]");
    if (!btn) return;
    const row = state.rows.find(r => r.fecha === btn.dataset.fecha);
    if (row) openForm(row);
  });

  form.elements.fecha.addEventListener("change", () => {
    const fecha = form.elements.fecha.value;
    const status = $("entryStatus");
    status.className = "form-status";
    if (state.editing && fecha && fecha !== state.editing) {
      status.textContent = `Has cambiado la fecha: se creará una fila nueva el ${fmtDate(fecha)} y la del ${fmtDate(state.editing)} se mantendrá.`;
    } else if (!state.editing && state.rows.some(r => r.fecha === fecha)) {
      status.textContent = `Ya existe una medición el ${fmtDate(fecha)}: al guardar se actualizará esa fila.`;
    } else {
      status.textContent = "";
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = $("entryStatus");
    const submit = $("entrySubmit");
    const fecha = form.elements.fecha.value;
    const peso = num(form.elements.peso.value);
    form.elements.fecha.setAttribute("aria-invalid", String(!fecha));
    form.elements.peso.setAttribute("aria-invalid", String(!isNum(peso) || peso < 30 || peso > 250));
    if (!fecha || !isNum(peso) || peso < 30 || peso > 250) {
      status.className = "form-status err";
      status.textContent = "La fecha y un peso válido son obligatorios.";
      return;
    }
    if (!API_URL) {
      status.className = "form-status err";
      status.textContent = "No hay conexión configurada con Google Sheets (config.js).";
      return;
    }

    const params = { action: "upsert" };
    FIELDS.forEach(f => { params[f] = String(form.elements[f].value || "").trim(); });

    submit.disabled = true;
    status.className = "form-status";
    status.textContent = "Guardando en Google Sheets…";
    try {
      const payload = await apiRequest(params, 30000);
      if (!payload || payload.ok === false) throw new Error("El Apps Script no confirmó el guardado");
      if (Array.isArray(payload.data)) applyData(payload.data, payload.updatedAt);
      else await load();
      status.className = "form-status ok";
      status.textContent = state.editing ? "Cambios guardados en Google Sheets." : "Medición guardada en Google Sheets.";
      setTimeout(() => { if (dialog.open) dialog.close(); }, 1100);
    } catch (error) {
      console.error(error);
      status.className = "form-status err";
      status.textContent = "No se pudo guardar. Revisa la conexión o el despliegue del Apps Script.";
    } finally {
      submit.disabled = false;
    }
  });
}

function openForm(row) {
  const form = $("entryForm");
  const dialog = $("entryDialog");
  const last = state.rows.at(-1);
  state.editing = row ? row.fecha : null;

  form.reset();
  FIELDS.forEach(f => {
    const input = form.elements[f];
    input.removeAttribute("aria-invalid");
    input.value = row && row[f] !== null && row[f] !== undefined ? row[f] : "";
    input.placeholder = !row && last && f !== "fecha" && isNum(last[f]) ? fmtNum(last[f], META[f] ? META[f].dec : 1).replace(",", ".") : "";
  });
  if (!row) form.elements.fecha.value = todayIso();

  $("entryKicker").textContent = row ? "Editar" : "Nueva medición";
  $("entryTitle").textContent = row ? `Medición del ${fmtDate(row.fecha)}` : "Añadir medición semanal";
  $("entrySubmit").textContent = row ? "Guardar cambios" : "Guardar en Sheet";
  const status = $("entryStatus");
  status.className = "form-status";
  status.textContent = row
    ? "Al guardar se actualizará esta fila en Google Sheets."
    : last ? `Los valores en gris son los de tu última medición (${fmtDate(last.fecha)}), como referencia.` : "";

  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => form.elements.peso.focus());
}

/* ---------- Tema y objetivo ---------- */

function setupTheme() {
  const html = document.documentElement;
  if (!store.get(STORE.theme) && store.get(LEGACY.theme)) html.dataset.theme = store.get(LEGACY.theme) === "dark" ? "dark" : "light";
  const btn = $("themeToggle");
  const sync = () => btn.setAttribute("aria-label", html.dataset.theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  sync();
  btn.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    store.set(STORE.theme, html.dataset.theme);
    sync();
    if (state.rows.length) {
      renderCharts();
      renderHabits();
    }
  });
}

function readGoal() {
  const value = num(store.get(STORE.goal) || store.get(LEGACY.goal));
  return isNum(value) && value > 30 && value < 250 ? value : 85;
}

function setupGoal() {
  const input = $("goalInput");
  input.value = String(state.goal);
  input.addEventListener("change", () => {
    const value = num(input.value);
    if (!isNum(value) || value < 30 || value > 250) { input.value = String(state.goal); return; }
    state.goal = Math.round(value * 10) / 10;
    store.set(STORE.goal, String(state.goal));
    if (state.rows.length) {
      renderHero();
      renderCharts();
      renderReading();
    }
  });
}

/* ---------- Estado de sincronización ---------- */

function renderSync() {
  const n = state.rows.length;
  if (state.source === "sheet") {
    setSync(`Sincronizado con Google Sheets · ${n} mediciones · actualizado ${fmtDateTime(state.updatedAt)}`);
  } else {
    setSync(`<span class="warn">Sin conexión con Google Sheets</span> · datos de respaldo: ${n} mediciones hasta el ${fmtDate(state.rows.at(-1).fecha)}`);
  }
}

function setSync(html) {
  $("syncStatus").innerHTML = html;
}

function showBanner(message) {
  let el = document.querySelector(".banner");
  if (!el) {
    el = document.createElement("div");
    el.className = "banner";
    el.setAttribute("role", "status");
    document.querySelector(".masthead").after(el);
  }
  el.textContent = message;
}

function removeBanner() {
  const el = document.querySelector(".banner");
  if (el) el.remove();
}

/* ---------- Chart.js ---------- */

const refLinesPlugin = {
  id: "refLines",
  afterDatasetsDraw(chart, args, opts) {
    const lines = (opts && opts.lines) || [];
    if (!lines.length) return;
    const { ctx, chartArea, scales } = chart;
    const y = scales.y;
    lines.forEach(line => {
      const py = y.getPixelForValue(line.value);
      if (py < chartArea.top - 1 || py > chartArea.bottom + 1) return;
      ctx.save();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.25;
      ctx.setLineDash(line.dash || [5, 4]);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, py);
      ctx.lineTo(chartArea.right, py);
      ctx.stroke();
      if (line.label) {
        ctx.setLineDash([]);
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        ctx.fillStyle = line.color;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(line.label, chartArea.right - 2, py - 3);
      }
      ctx.restore();
    });
  }
};

function setupChartDefaults() {
  Chart.register(refLinesPlugin);
  Chart.defaults.font.family = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
  Chart.defaults.font.size = 11.5;
}

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    layout: { padding: { top: 4, right: 6 } }
  };
}

function tooltipTheme(c) {
  return {
    backgroundColor: c.raised,
    borderColor: c.line,
    borderWidth: 1,
    titleColor: c.text,
    bodyColor: c.text2,
    padding: 10,
    cornerRadius: 8,
    displayColors: false,
    caretSize: 5,
    titleFont: { weight: "600" }
  };
}

function colors() {
  const s = getComputedStyle(document.documentElement);
  const v = name => s.getPropertyValue(name).trim();
  return {
    ink: v("--chart-ink"),
    dot: v("--chart-dot"),
    grid: v("--chart-grid"),
    axis: v("--chart-axis"),
    accent: v("--accent"),
    good: v("--good"),
    bad: v("--bad"),
    neutral: v("--neutral-bar"),
    faint: v("--faint"),
    raised: v("--raised"),
    line: v("--line-strong"),
    text: v("--ink"),
    text2: v("--ink-2")
  };
}

function makeChart(id, config) {
  destroyChart(id);
  const canvas = $(id);
  if (canvas) charts[id] = new Chart(canvas, config);
}

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function chartFallback() {
  document.querySelectorAll(".chart-box, .lane-box").forEach(box => {
    if (!box.querySelector(".chart-fallback")) {
      box.insertAdjacentHTML("beforeend", `<p class="chart-fallback" style="color:var(--faint);font-size:13px">No se pudo cargar la librería de gráficas.</p>`);
    }
  });
}

/* ---------- Cálculos ---------- */

function weightPace() {
  const rows = state.rows;
  const lastT = rows.at(-1).t;
  for (const days of [56, 90]) {
    const pts = rows.filter(r => r.t >= lastT - days * DAY);
    if (pts.length >= 3) {
      const slope = regressionSlope(pts.map(r => [(r.t - lastT) / DAY, r.peso]));
      if (isNum(slope)) return { rate: slope * 7, weeks: Math.round(days / 7) };
    }
  }
  return null;
}

function regressionSlope(points) {
  const n = points.length;
  if (n < 2) return null;
  const mx = mean(points.map(p => p[0]));
  const my = mean(points.map(p => p[1]));
  let num_ = 0;
  let den = 0;
  points.forEach(([x, y]) => { num_ += (x - mx) * (y - my); den += (x - mx) ** 2; });
  return den ? num_ / den : null;
}

function previousWith(row, key) {
  let p = row.prev;
  while (p && !isNum(p[key])) p = p.prev;
  return p;
}

function latestValue(key) {
  const r = [...state.rows].reverse().find(x => isNum(x[key]));
  return r ? r[key] : null;
}

// Extremo de una métrica; en empates se queda con la fecha más reciente.
function extreme(rows, key, kind) {
  return rows.filter(r => isNum(r[key])).reduce((best, r) => {
    if (!best) return r;
    return kind === "min" ? (r[key] <= best[key] ? r : best) : (r[key] >= best[key] ? r : best);
  }, null);
}

function hasContext(r) {
  return isNum(r.nutricion) || isNum(r.deporte) || isNum(r.emocional);
}

function mean(values) {
  const v = values.filter(isNum);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function median(values) {
  const v = values.filter(isNum).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function round(v, dec) {
  const f = 10 ** dec;
  return Math.round(v * f) / f + 0;
}

function isNum(v) {
  return typeof v === "number" && Number.isFinite(v);
}

/* ---------- Formato ---------- */

function fmtNum(v, dec) {
  if (!isNum(Number(v))) return "—";
  return Number(v).toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace("-", "−");
}

function unitSuffix(m) {
  return m.unit ? ` ${m.unit}` : "";
}

function fmt(v, key) {
  const m = META[key];
  if (!isNum(v)) return "—";
  return `${fmtNum(v, m.dec)}${unitSuffix(m)}`;
}

function fmtDelta(v, key) {
  return fmtDeltaDec(v, key, META[key].dec);
}

function fmtDeltaDec(v, key, dec) {
  const m = META[key];
  if (!isNum(v)) return "—";
  const r = round(v, dec);
  if (r === 0) return "Sin cambio";
  return `${r > 0 ? "+" : "−"}${fmtNum(Math.abs(r), dec)}${unitSuffix(m)}`;
}

function fmtSigned(v, dec) {
  const r = round(v, dec);
  if (r === 0) return "0";
  return `${r > 0 ? "+" : "−"}${fmtNum(Math.abs(r), dec)}`;
}

function fmtRate(v) {
  if (!isNum(v)) return "—";
  const r = round(v, 1);
  if (r === 0) return "Sin cambio";
  return `${r > 0 ? "+" : "−"}${fmtNum(Math.abs(r), 1)} kg/sem`;
}

function tone(v, key) {
  const m = META[key];
  if (!isNum(v) || !m || m.dir === 0) return "flat";
  const r = round(v, m.dec);
  if (r === 0) return "flat";
  return r * m.dir > 0 ? "good" : "bad";
}

function labelOf(key) {
  return key === "visceral" ? "Grasa visceral" : META[key].label;
}

function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const dfDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" });
const dfShort = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
const dfMonth = new Intl.DateTimeFormat("es-ES", { month: "short" });
const dfMonthYear = new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit" });
const dfMonthLong = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const dfDateTime = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function clean(s) {
  return s.replace(/\./g, "").replace(/ de /g, " ");
}

function fmtDate(iso) {
  return clean(dfDate.format(parseDate(iso)));
}

function fmtShort(t) {
  return clean(dfShort.format(new Date(t)));
}

function fmtMonthYear(t) {
  return clean(dfMonthYear.format(new Date(t)));
}

function fmtMonthLong(d) {
  return clean(dfMonthLong.format(d));
}

function fmtMonthKey(key) {
  return fmtMonthLong(parseDate(`${key}-01`));
}

function fmtAxisMonth(t, spanDays) {
  const d = new Date(t);
  return spanDays > 300 || d.getMonth() === 0 ? clean(dfMonthYear.format(d)) : clean(dfMonth.format(d));
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : clean(dfDateTime.format(d)).replace(",", " ·");
}

function parseDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isoFromT(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayIso() {
  return isoFromT(Date.now());
}

function daysAgo(iso) {
  const today = parseDate(todayIso()).getTime();
  return Math.max(0, Math.round((today - parseDate(iso).getTime()) / DAY));
}

/* ---------- Parseo ---------- */

function first(...values) {
  return values.find(v => v !== "" && v !== null && v !== undefined);
}

function num(v) {
  if (v === "" || v === null || v === undefined) return null;
  const parsed = Number(String(v).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function bounded(v, min, max) {
  const parsed = num(v);
  return isNum(parsed) ? clamp(parsed, min, max) : null;
}

function emotional(v) {
  if (v === "" || v === null || v === undefined) return null;
  const parsed = num(v);
  if (isNum(parsed)) return clamp(parsed, 0, 10);
  const s = String(v).trim().toLowerCase();
  if (["bien", "bueno", "good"].includes(s)) return 8;
  if (["regular", "medio", "ok"].includes(s)) return 5;
  if (["mal", "malo", "bad"].includes(s)) return 2;
  return null;
}

function toIso(v) {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (typeof v === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) {
    const [d, m, y] = v.split("/").map(Number);
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const date = new Date(v);
  return Number.isNaN(date.getTime()) ? "" : isoFromT(date.getTime());
}

/* ---------- Arranque ---------- */

init();
