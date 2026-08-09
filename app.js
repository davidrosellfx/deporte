const SAMPLE_DATA = [
  { fecha: "2024-12-15", peso: 93.8, imc: 29.1, musculo: 35.2, grasa: 24.5, visceral: 11, calorias: 1934 },
  { fecha: "2024-12-17", peso: 92.8, imc: 28.8, musculo: 36.3, grasa: 24.0, visceral: 11, calorias: 1919 },
  { fecha: "2024-12-20", peso: 90.4, imc: 28.1, musculo: 35.0, grasa: 26.5, visceral: 11, calorias: 1882 },
  { fecha: "2025-01-06", peso: 94.6, imc: 29.4, musculo: 36.1, grasa: 24.5, visceral: 12, calorias: 1942 },
  { fecha: "2025-01-11", peso: 94.1, imc: 29.2, musculo: 35.8, grasa: 24.9, visceral: 12, calorias: 1935 },
  { fecha: "2025-02-12", peso: 93.1, imc: 28.9, musculo: 36.1, grasa: 23.5, visceral: 11, calorias: 1922 },
  { fecha: "2025-03-05", peso: 94.0, imc: 29.2, musculo: 35.4, grasa: 25.6, visceral: 12, calorias: 1933 },
  { fecha: "2025-03-25", peso: 94.4, imc: 29.3, musculo: 36.0, grasa: 24.6, visceral: 12, calorias: 1940 },
  { fecha: "2025-03-28", peso: 93.1, imc: 28.9, musculo: 35.9, grasa: 24.9, visceral: 11, calorias: 1922 },
  { fecha: "2025-04-02", peso: 91.5, imc: 28.4, musculo: 36.4, grasa: 24.0, visceral: 11, calorias: 1902 },
  { fecha: "2025-04-09", peso: 92.0, imc: 28.6, musculo: 35.0, grasa: 26.5, visceral: 11, calorias: 1904 },
  { fecha: "2025-05-01", peso: 88.3, imc: 27.4, musculo: 35.1, grasa: 26.2, visceral: 10, calorias: 1853 },
  { fecha: "2025-07-18", peso: 87.6, imc: 27.2, musculo: 36.2, grasa: 24.3, visceral: 10, calorias: 1850 },
  { fecha: "2025-08-02", peso: 88.6, imc: 27.5, musculo: 36.4, grasa: 24.0, visceral: 10, calorias: 1862 },
  { fecha: "2025-08-10", peso: 89.6, imc: 27.8, musculo: 37.0, grasa: 22.8, visceral: 10, calorias: 1877 },
  { fecha: "2025-08-16", peso: 89.0, imc: 27.6, musculo: 36.5, grasa: 23.7, visceral: 10, calorias: 1868 },
  { fecha: "2025-09-01", peso: 92.4, imc: 28.7, musculo: 35.9, grasa: 24.8, visceral: 11, calorias: 1913 },
  { fecha: "2025-09-20", peso: 93.0, imc: 28.9, musculo: 36.1, grasa: 24.5, visceral: 11, calorias: 1921 },
  { fecha: "2025-09-26", peso: 92.1, imc: 28.6, musculo: 36.6, grasa: 23.6, visceral: 11, calorias: 1910 },
  { fecha: "2025-10-13", peso: 93.4, imc: 29.0, musculo: 37.2, grasa: 22.4, visceral: 11, calorias: 1928 },
  { fecha: "2025-10-25", peso: 92.2, imc: 28.6, musculo: 36.4, grasa: 23.9, visceral: 11, calorias: 1911 },
  { fecha: "2025-10-29", peso: 91.3, imc: 28.3, musculo: 36.7, grasa: 23.4, visceral: 11, calorias: 1900 },
  { fecha: "2025-11-20", peso: 91.9, imc: 28.1, musculo: 36.6, grasa: 23.5, visceral: 11, calorias: 1907 },
  { fecha: "2025-12-05", peso: 91.7, imc: 28.5, musculo: 36.6, grasa: 23.5, visceral: 11, calorias: 1905 },
  { fecha: "2025-12-27", peso: 93.4, imc: 29.0, musculo: 35.7, grasa: 25.2, visceral: 12, calorias: 1926 },
  { fecha: "2026-01-14", peso: 93.2, imc: 28.9, musculo: 36.6, grasa: 23.6, visceral: 11, calorias: 1925 },
  { fecha: "2026-01-19", peso: 92.9, imc: 28.8, musculo: 36.7, grasa: 23.4, visceral: 11, calorias: 1921 },
  { fecha: "2026-02-02", peso: 90.3, imc: 28.0, musculo: 35.7, grasa: 25.1, visceral: 11, calorias: 1883, caloriasQuemadas: 2533, nutricion: 7, deporte: 4, emocional: 7, kmSemana: 58.1 },
  { fecha: "2026-02-23", peso: 91.8, imc: 28.5, musculo: 36.5, grasa: 23.7, visceral: 11, calorias: 1906, caloriasQuemadas: 2357, nutricion: 6, deporte: 3, emocional: 8, kmSemana: 51.7 },
  { fecha: "2026-04-03", peso: 91.7, imc: 28.5, musculo: 35.0, grasa: 26.5, visceral: 11, calorias: 1901, caloriasQuemadas: 2265, nutricion: 8, deporte: 5, emocional: 9, kmSemana: 44.6 },
  { fecha: "2026-04-17", peso: 92.4, imc: 28.7, musculo: 36.1, grasa: 24.4, visceral: 11, calorias: 1913, caloriasQuemadas: 2137, nutricion: 8, deporte: 2, emocional: 5, kmSemana: 11.6 },
  { fecha: "2026-05-11", peso: 93.2, imc: 28.9, musculo: 36.1, grasa: 24.4, visceral: 11, calorias: 1924, caloriasQuemadas: 2280, nutricion: 4, deporte: 1, emocional: 7, kmSemana: 50.8 },
  { fecha: "2026-05-18", peso: 93.1, imc: 28.9, musculo: 35.3, grasa: 25.9, visceral: 11, calorias: 1921, caloriasQuemadas: 2323, nutricion: 4, deporte: 1, emocional: 6, kmSemana: 65.2 },
  { fecha: "2026-05-25", peso: 91.6, imc: 28.4, musculo: 35.9, grasa: 24.9, visceral: 11, calorias: 1902, caloriasQuemadas: 2754, nutricion: 6, deporte: 5, emocional: 6, kmSemana: 79.5 },
  { fecha: "2026-06-01", peso: 91.7, imc: 28.5, musculo: 36.6, grasa: 23.6, visceral: 11, calorias: 1905, caloriasQuemadas: 2521, nutricion: 7, deporte: 4, emocional: 7, kmSemana: 62.4 },
  { fecha: "2026-06-08", peso: 90.6, imc: 28.0, musculo: 35.8, grasa: 24.9, visceral: 11, calorias: 1891, caloriasQuemadas: 2512, nutricion: 7, deporte: 4, emocional: 8, kmSemana: 61.8 },
  { fecha: "2026-06-15", peso: 90.2, imc: 28.0, musculo: 36.1, grasa: 24.5, visceral: 10, calorias: 1883, caloriasQuemadas: 2350, nutricion: 5, deporte: 4, emocional: 8, kmSemana: 56.0 },
  { fecha: "2026-06-22", peso: 90.3, imc: 28.1, musculo: 36.6, grasa: 23.6, visceral: 10, calorias: 1888, caloriasQuemadas: 2554, nutricion: 6, deporte: 5, emocional: 7, kmSemana: 64.0 },
  { fecha: "2026-06-29", peso: 90.2, imc: 27.9, musculo: 37.5, grasa: 21.9, visceral: 10, calorias: 1887, caloriasQuemadas: 2483, nutricion: 8, deporte: 4, emocional: 8, kmSemana: 59.0 },
  { fecha: "2026-07-06", peso: 90.0, imc: 27.9, musculo: 36.4, grasa: 23.9, visceral: 10, calorias: 1882, caloriasQuemadas: 2584, nutricion: 8, deporte: 4, emocional: 8, kmSemana: 66.0 },
  { fecha: "2026-07-20", peso: 88.1, imc: 27.2, musculo: 36.8, grasa: 23.2, visceral: 10, calorias: 1857, caloriasQuemadas: 2494, nutricion: 10, deporte: 3, emocional: 8, kmSemana: 58.0 },
  { fecha: "2026-07-31", peso: 87.9, imc: 27.3, musculo: 37.9, grasa: 21.3, visceral: 10, calorias: 1858, caloriasQuemadas: 2638, nutricion: 8, deporte: 4, emocional: 8, kmSemana: 70.0 },
  { fecha: "2026-08-06", peso: 86.7, imc: 26.9, musculo: 37.1, grasa: 21.5, visceral: 9, calorias: 1834, caloriasQuemadas: 2540, nutricion: 10, deporte: 3, emocional: 9, kmSemana: 75.0 }
];

const METRICS = [
  { key: "peso", label: "Peso", unit: "kg", color: "#276ef1", decimals: 1, lowerIsGood: true },
  { key: "imc", label: "IMC", unit: "", color: "#7a5cff", decimals: 1, lowerIsGood: true },
  { key: "musculo", label: "Musculo", unit: "%", color: "#16875d", decimals: 1, lowerIsGood: false },
  { key: "grasa", label: "Grasa", unit: "%", color: "#dc4666", decimals: 1, lowerIsGood: true },
  { key: "visceral", label: "G. visceral", unit: "", color: "#b47a17", decimals: 0, lowerIsGood: true },
  { key: "calorias", label: "Cal. necesarias", unit: "kcal", color: "#0b8195", decimals: 0, lowerIsGood: false }
];

const ACTIVITY_METRICS = [
  { key: "caloriasQuemadas", label: "Cal. quemadas", unit: "kcal", color: "#e26f35", decimals: 0, lowerIsGood: false },
  { key: "deporte", label: "Deporte", unit: "d", color: "#276ef1", decimals: 0, lowerIsGood: false },
  { key: "kmSemana", label: "Km", unit: "km", color: "#18a7b8", decimals: 1, lowerIsGood: false }
];

const RANGE_OPTIONS = [
  { key: "4w", label: "4 semanas", days: 28 },
  { key: "8w", label: "8 semanas", days: 56 },
  { key: "all", label: "Todo", days: null }
];

const MOTIVATIONAL_QUOTES = [
  "Si lo hiciste una vez, lo haras otra vez.",
  "Cada semana cuenta, incluso cuando no es perfecta.",
  "La mejor version no aparece: se construye.",
  "No estas empezando de cero, estas volviendo con experiencia.",
  "El dato no juzga, te orienta.",
  "La constancia gana cuando dejas de negociar con ella.",
  "Hoy toca hacerlo facil, claro y repetible.",
  "Tu mejor registro no es techo, es referencia.",
  "El objetivo esta cerca. La calma tambien entrena.",
  "No necesitas heroismo, necesitas continuidad."
];

const SOURCE_KEY = "camino-a-los-85-source";
const GOAL_KEY = "camino-a-los-85-goal";
const THEME_KEY = "camino-a-los-85-theme";

let rows = [];
let selectedRange = "8w";
let selectedContextMonth = "";
let goalWeight = Number(localStorage.getItem(GOAL_KEY)) || 85;
let editingDate = "";

const configUrl = window.WEIGHT_DASHBOARD_CONFIG?.sheetApiUrl?.trim() || "";
const savedUrl = localStorage.getItem(SOURCE_KEY) || "";
const activeUrl = configUrl || savedUrl;

window.addEventListener("resize", () => requestAnimationFrame(drawAllCharts));
setupTheme();
setupEntryForm();
setRandomQuote();
load(activeUrl);

function setRandomQuote() {
  document.getElementById("motivationalQuote").textContent = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

function setupTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.body.dataset.theme = savedTheme;
  updateThemeButton();
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, document.body.dataset.theme);
    updateThemeButton();
    drawAllCharts();
  });
}

function updateThemeButton() {
  document.getElementById("themeToggle").textContent = document.body.dataset.theme === "dark" ? "Modo claro" : "Modo oscuro";
}

async function load(url) {
  try {
    rows = url ? await loadJsonp(url) : SAMPLE_DATA;
    rows = normalizeRows(rows).sort((a, b) => dateValue(a.fecha) - dateValue(b.fecha));
  } catch (error) {
    console.error(error);
    rows = normalizeRows(SAMPLE_DATA);
  }
  render();
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callback = `weightDashboard_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    window[callback] = payload => {
      cleanup();
      resolve(payload.data || payload);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudieron cargar los datos"));
    };
    script.src = `${url}${separator}callback=${callback}`;
    document.body.appendChild(script);

    function cleanup() {
      delete window[callback];
      script.remove();
    }
  });
}

function setupEntryForm() {
  const form = document.getElementById("entryForm");
  document.getElementById("entryCancel").addEventListener("click", clearEntryForm);
  form.elements.fecha.value = todayIso();
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.getElementById("entryStatus");
    if (!activeUrl) {
      status.textContent = "No hay conexion configurada con Google Sheets.";
      return;
    }
    const formData = new FormData(form);
    status.textContent = editingDate ? "Guardando cambios..." : "Guardando medicion...";
    try {
      await writeMeasurement(Object.fromEntries(formData.entries()));
      status.textContent = editingDate ? "Registro actualizado en Google Sheets." : "Medicion guardada en Google Sheets.";
      editingDate = "";
      updateEntryMode();
      await load(activeUrl);
    } catch (error) {
      console.error(error);
      status.textContent = "No se pudo guardar. Revisa el despliegue del Apps Script.";
    }
  });
}

function writeMeasurement(values) {
  return loadJsonp(withParams(activeUrl, {
    action: "upsert",
    fecha: values.fecha,
    peso: values.peso,
    imc: values.imc,
    musculo: values.musculo,
    grasa: values.grasa,
    visceral: values.visceral,
    calorias: values.calorias,
    caloriasQuemadas: values.caloriasQuemadas,
    nutricion: values.nutricion,
    deporte: values.deporte,
    emocional: values.emocional,
    kmSemana: values.kmSemana
  }));
}

function withParams(url, params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });
  return `${url}${url.includes("?") ? "&" : "?"}${query.toString()}`;
}

function normalizeRows(input) {
  return input
    .map(row => ({
      fecha: toIsoDate(firstValue(row.fecha, row.Fecha, row.date, row.Date)),
      peso: number(firstValue(row.peso, row.Peso)),
      imc: number(firstValue(row.imc, row.IMC)),
      musculo: number(firstValue(row.musculo, row.Musculo, row["Musculo"], row["Musculo"])),
      grasa: number(firstValue(row.grasa, row.Grasa)),
      visceral: number(firstValue(row.visceral, row["G.Visceral"], row["G. visceral"], row["Grasa visceral"])),
      calorias: number(firstValue(row.calorias, row.Calorias, row["Calorias"])),
      caloriasQuemadas: number(firstValue(row.caloriasQuemadas, row.CaloriasQuemadas, row["Calorias quemadas"], row["Cal. quemadas"])),
      nutricion: boundedNumber(firstValue(row.nutricion, row.Nutricion, row["Nutricion"], row["Nutricion (0-10)"]), 0, 10),
      deporte: boundedNumber(firstValue(row.deporte, row.Deporte, row["Deporte"], row["Deporte (dias)"]), 0, 7),
      emocional: emotionalValue(firstValue(row.emocional, row.Emocional, row["Emocional (0-10)"])),
      kmSemana: number(firstValue(row.kmSemana, row.KmSemana, row["Km semana"], row["KM semana"], row["Kilometros semana"]))
    }))
    .filter(row => row.fecha && Number.isFinite(row.peso));
}

function render() {
  if (!rows.length) return;
  renderHero();
  renderCards();
  renderProgressComparison();
  renderLastReading();
  renderInsights();
  renderTrendSummary();
  renderCharts();
  renderContextAnalysis();
  renderRecords();
  renderTable();
}

function renderHero() {
  const first = rows[0];
  const last = rows.at(-1);
  const diff = last.peso - goalWeight;
  const totalRoad = Math.max(0.1, first.peso - goalWeight);
  const done = clamp(((first.peso - last.peso) / totalRoad) * 100, 0, 100);

  document.getElementById("heroWeight").textContent = format(last.peso, metric("peso"));
  document.getElementById("heroDate").textContent = `A fecha de ${formatDate(last.fecha)}`;
  document.getElementById("heroGoalDiff").innerHTML = `Diferencia: <b class="${diff <= 0 ? "good" : "bad"}">${formatSigned(diff, metric("peso"))}</b>`;
  document.getElementById("goalProgress").style.setProperty("--progress", `${done}%`);
  document.getElementById("heroStatus").textContent = heroStatus(first, last, diff);

  const goalInput = document.getElementById("heroGoalInput");
  goalInput.value = String(goalWeight);
  goalInput.onchange = event => {
    goalWeight = Number(String(event.target.value).replace(",", ".")) || 85;
    localStorage.setItem(GOAL_KEY, String(goalWeight));
    render();
  };
}

function heroStatus(first, last, diff) {
  const bestWeight = minRow(rows, "peso");
  if (last.fecha === bestWeight.fecha) return "Estas en tu mejor peso registrado. Esto ya no es una idea: esta en tus datos.";
  if (diff <= 0) return "Objetivo alcanzado. Ahora la mision es consolidar composicion y rutina.";
  const total = first.peso - last.peso;
  if (total > 5) return `Llevas ${formatSigned(-Math.abs(total), metric("peso"))} desde el inicio. El objetivo esta muy cerca.`;
  return "El foco es simple: medir, ajustar y repetir.";
}

function renderCards() {
  const last = rows.at(-1);
  const previous = previousOf(last);
  const cards = [
    { label: "Peso actual", value: last.peso, m: metric("peso"), change: delta(last, previous, "peso") },
    { label: "Faltan al objetivo", value: Math.max(0, last.peso - goalWeight), m: metric("peso"), change: null, forceGood: last.peso <= goalWeight },
    { label: "Grasa", value: last.grasa, m: metric("grasa"), change: delta(last, previous, "grasa") },
    { label: "Musculo", value: last.musculo, m: metric("musculo"), change: delta(last, previous, "musculo") },
    { label: "G. visceral", value: last.visceral, m: metric("visceral"), change: delta(last, previous, "visceral") },
    { label: "IMC", value: last.imc, m: metric("imc"), change: delta(last, previous, "imc") }
  ];

  document.getElementById("metricCards").innerHTML = cards.map(card => `
    <article class="metric-card">
      <span>${card.label}</span>
      <strong>${format(card.value, card.m)}</strong>
      <p>${card.change === null
        ? `<b class="${card.forceGood ? "good" : ""}">${card.forceGood ? "Objetivo cumplido" : "Camino restante"}</b>`
        : `<b class="${deltaClass(card.change, card.m)}">${formatSigned(card.change, card.m)}</b> vs medicion anterior`}</p>
    </article>
  `).join("");
}

function renderProgressComparison() {
  const first = rows[0];
  const worst = maxRow(rows.filter(row => Number.isFinite(row.peso)), "peso");
  const last = rows.at(-1);
  const references = [
    {
      label: "Desde el primer dia",
      date: first.fecha,
      row: first,
      note: "Tu punto de salida"
    },
    {
      label: "Desde tu peor pico",
      date: worst.fecha,
      row: worst,
      note: "Mayor peso registrado"
    }
  ];
  const progressMetrics = ["peso", "grasa", "musculo", "visceral"].map(metric);

  document.getElementById("progressComparison").innerHTML = `
    <div class="section-head compact">
      <div>
        <p class="eyebrow">Progreso acumulado</p>
        <h2>Lo que ya has recuperado</h2>
      </div>
      <p>Comparo el dato actual contra el inicio y contra el pico mas alto de peso.</p>
    </div>
    <div class="progress-columns">
      ${references.map(reference => `
        <article class="progress-card">
          <div class="progress-card-head">
            <div>
              <span>${reference.label}</span>
              <strong>${formatDate(reference.date)}</strong>
            </div>
            <p>${reference.note}</p>
          </div>
          <div class="progress-kpis">
            ${progressMetrics.map(item => {
              const change = delta(last, reference.row, item.key);
              return `
                <div>
                  <span>${item.label}</span>
                  <strong class="${deltaClass(change, item)}">${formatSigned(change, item)}</strong>
                </div>
              `;
            }).join("")}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderLastReading() {
  const last = rows.at(-1);
  const previous = previousOf(last);
  const week = latestContextSummary();
  const deltas = [
    { label: "Peso", value: delta(last, previous, "peso"), m: metric("peso") },
    { label: "Grasa", value: delta(last, previous, "grasa"), m: metric("grasa") },
    { label: "Musculo", value: delta(last, previous, "musculo"), m: metric("musculo") },
    { label: "G. visceral", value: delta(last, previous, "visceral"), m: metric("visceral") }
  ];

  document.getElementById("lastReading").innerHTML = `
    <p class="eyebrow">Ultima medicion</p>
    <h2>${lastReadingTitle(last, previous)}</h2>
    <p class="lead">${lastReadingText(last, previous)}</p>
    <div class="delta-grid">
      ${deltas.map(item => `
        <div>
          <span>${item.label}</span>
          <strong class="${deltaClass(item.value, item.m)}">${formatSigned(item.value, item.m)}</strong>
        </div>
      `).join("")}
    </div>
    <div class="context-strip">
      <div><span>Nutricion</span><strong class="${thresholdClass(week.nutricion, 6)}">${formatPlain(week.nutricion, 0)}</strong></div>
      <div><span>Deporte</span><strong class="${thresholdClass(week.deporte, 4)}">${formatPlain(week.deporte, 0)}</strong></div>
      <div><span>Emocional</span><strong class="${thresholdClass(week.emocional, 5)}">${formatPlain(week.emocional, 0)}</strong></div>
      <div><span>Contexto</span><strong class="${thresholdClass(week.score * 10, 6)}">${formatPlain(week.score * 100, 0)}%</strong></div>
    </div>
  `;
}

function lastReadingTitle(last, previous) {
  if (!previous) return "Primer punto de referencia";
  const peso = delta(last, previous, "peso");
  const musculo = delta(last, previous, "musculo");
  const visceral = delta(last, previous, "visceral");
  if (peso < -0.8 && visceral < 0) return "Semana muy potente: baja peso y visceral";
  if (peso < -0.8 && musculo < -0.4) return "Buena bajada, pero vigila el musculo";
  if (peso < -0.3) return "Vas bajando: buen ritmo";
  if (peso > 0.5) return "Semana de revisar el plan";
  return "Semana estable";
}

function lastReadingText(last, previous) {
  if (!previous) return "Esta medicion abre la referencia para las siguientes semanas.";
  const peso = delta(last, previous, "peso");
  const grasa = delta(last, previous, "grasa");
  const musculo = delta(last, previous, "musculo");
  const visceral = delta(last, previous, "visceral");
  if (peso < -0.8 && musculo < -0.4) {
    return `Bajas ${format(Math.abs(peso), metric("peso"))}, pero el musculo tambien cae ${format(Math.abs(musculo), metric("musculo"))}. Esta semana priorizaria fuerza, proteina y no apretar demasiado.`;
  }
  if (peso < -0.8 && visceral < 0) {
    return `Gran lectura: ${formatSigned(peso, metric("peso"))} y visceral ${formatSigned(visceral, metric("visceral"))}. Es una semana para repetir lo que funciono.`;
  }
  if (grasa > 0.4) return "El peso puede moverse, pero la grasa sube. Mejor mirar nutricion, descanso y constancia antes de tocar todo.";
  return "La lectura no pide drama: mira tendencia, contexto y siguiente accion.";
}

function renderInsights() {
  const last = rows.at(-1);
  const bestWeight = minRow(rows, "peso");
  const bestFat = minRow(rows.filter(row => Number.isFinite(row.grasa)), "grasa");
  const bestMuscle = maxRow(rows.filter(row => Number.isFinite(row.musculo)), "musculo");
  const trend = trendStats(rangeRows("8w"));
  const lever = mainLever();

  document.getElementById("insightPanel").innerHTML = `
    <p class="eyebrow">Lectura accionable</p>
    <h2>${last.fecha === bestWeight.fecha ? "Estas en zona de mejor version" : "Lo importante ahora"}</h2>
    <div class="insight-list">
      <p><b>Ritmo 8 semanas:</b> ${formatSigned(trend.pesoDelta, metric("peso"))}, ${formatPlain(Math.abs(trend.pace), 2)} kg/semana.</p>
      <p><b>Marca fuerte:</b> mejor peso ${format(bestWeight.peso, metric("peso"))} el ${formatDate(bestWeight.fecha)}.</p>
      <p><b>Composicion:</b> mejor grasa ${format(bestFat.grasa, metric("grasa"))} y maximo musculo ${format(bestMuscle.musculo, metric("musculo"))}.</p>
      <p><b>Palanca probable:</b> ${lever}</p>
    </div>
  `;
}

function mainLever() {
  const comparable = contextComparableRows();
  if (comparable.length < 6) return "aun faltan semanas para sacar una lectura fuerte.";
  const correlations = [
    { label: "nutricion", value: correlation(comparable.map(row => row.nutricion), comparable.map(row => row.pesoDelta)) },
    { label: "deporte", value: correlation(comparable.map(row => row.deporte), comparable.map(row => row.pesoDelta)) },
    { label: "calorias quemadas", value: correlation(comparable.map(row => row.caloriasQuemadas), comparable.map(row => row.pesoDelta)) },
    { label: "km", value: correlation(comparable.map(row => row.kmSemana), comparable.map(row => row.pesoDelta)) }
  ].filter(item => Number.isFinite(item.value)).sort((a, b) => a.value - b.value);
  const best = correlations[0];
  if (!best || best.value > -0.2) return "la bajada existe, pero no hay una palanca aislada clara.";
  return `${best.label} es lo que mas se esta asociando a bajadas de peso en tu historial reciente.`;
}

function renderTrendSummary() {
  const selected = RANGE_OPTIONS.find(option => option.key === selectedRange) || RANGE_OPTIONS[1];
  const trend = trendStats(rangeRows(selected.key));
  const text = trend.pesoDelta <= -2
    ? `En ${selected.label.toLowerCase()} vas muy bien: ${formatSigned(trend.pesoDelta, metric("peso"))}.`
    : trend.pesoDelta < 0
      ? `En ${selected.label.toLowerCase()} sigues bajando: ${formatSigned(trend.pesoDelta, metric("peso"))}.`
      : `En ${selected.label.toLowerCase()} toca revisar: ${formatSigned(trend.pesoDelta, metric("peso"))}.`;
  document.getElementById("trendSummary").textContent = `${text} La grasa cambia ${formatSigned(trend.grasaDelta, metric("grasa"))} y el musculo ${formatSigned(trend.musculoDelta, metric("musculo"))}.`;
}

function renderCharts() {
  const controls = document.getElementById("rangeControls");
  controls.innerHTML = RANGE_OPTIONS.map(option => `
    <button type="button" class="${option.key === selectedRange ? "active" : ""}" data-range="${option.key}">${option.label}</button>
  `).join("");
  controls.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      selectedRange = button.dataset.range;
      renderTrendSummary();
      renderCharts();
    });
  });

  document.getElementById("chartsGrid").innerHTML = `
    <article class="chart-card weight-chart">
      <h3>Peso hacia objetivo</h3>
      <div class="chart-frame"><canvas id="weightChart"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Grasa</h3>
      <div class="chart-frame"><canvas id="fatChart"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Musculo</h3>
      <div class="chart-frame"><canvas id="muscleChart"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Grasa visceral</h3>
      <div class="chart-frame"><canvas id="visceralChart"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Contexto semanal</h3>
      <div class="chart-frame"><canvas id="contextChart"></canvas></div>
    </article>
    <article class="chart-card">
      <h3>Actividad semanal</h3>
      <div class="chart-frame"><canvas id="activityChart"></canvas></div>
    </article>
  `;
  requestAnimationFrame(drawAllCharts);
}

function drawAllCharts() {
  if (!rows.length) return;
  const chartRows = rangeRows(selectedRange);
  drawLineChart(document.getElementById("weightChart"), chartRows, [
    { key: "peso", label: "Peso", color: metric("peso").color, m: metric("peso") }
  ], { target: goalWeight, targetLabel: "Objetivo" });
  drawLineChart(document.getElementById("fatChart"), chartRows, [
    { key: "grasa", label: "Grasa", color: metric("grasa").color, m: metric("grasa") }
  ]);
  drawLineChart(document.getElementById("muscleChart"), chartRows, [
    { key: "musculo", label: "Musculo", color: metric("musculo").color, m: metric("musculo") }
  ]);
  drawLineChart(document.getElementById("visceralChart"), chartRows, [
    { key: "visceral", label: "Visceral", color: metric("visceral").color, m: metric("visceral") }
  ]);
  const contextRows = contextRowsInRange(selectedRange).map(row => ({ ...row, scorePct: contextScore(row) * 100 }));
  drawLineChart(document.getElementById("contextChart"), contextRows, [
    { key: "nutricion", label: "Nutricion", color: "#cfe86a", m: { unit: "", decimals: 0 } },
    { key: "deporteScaled", label: "Deporte", color: "#276ef1", m: { unit: "", decimals: 0 }, value: row => (row.deporte / 7) * 10 },
    { key: "emocional", label: "Emocional", color: "#16875d", m: { unit: "", decimals: 0 } }
  ], { fixedMin: 0, fixedMax: 10 });
  drawActivityChart(document.getElementById("activityChart"), selectedRange);
}

function drawActivityChart(canvas, rangeKey) {
  const source = contextRowsInRange(rangeKey).filter(row => Number.isFinite(row.caloriasQuemadas) || Number.isFinite(row.kmSemana) || Number.isFinite(row.deporte));
  drawNormalizedChart(canvas, source, [
    { key: "caloriasQuemadas", label: "Cal. quemadas", color: "#e26f35" },
    { key: "kmSemana", label: "Km", color: "#18a7b8" },
    { key: "deporte", label: "Deporte", color: "#276ef1" }
  ]);
}

function renderContextAnalysis() {
  const contextRows = rows.filter(hasContext);
  const container = document.getElementById("contextAnalysis");
  if (!contextRows.length) {
    container.innerHTML = "";
    return;
  }
  const months = monthlyContext(contextRows);
  if (!selectedContextMonth || !months.some(month => month.key === selectedContextMonth)) selectedContextMonth = months.at(-1).key;
  const selected = months.find(month => month.key === selectedContextMonth);
  const total = trendStats(contextRows);
  const avgNutrition = average(contextRows.map(row => row.nutricion));
  const avgSport = average(contextRows.map(row => row.deporte));
  const avgEmotional = average(contextRows.map(row => row.emocional));

  container.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">Contexto y composicion</p>
        <h2>Que esta pasando alrededor del peso</h2>
        <p>Analisis desde que registras nutricion, deporte, emocional, Garmin y km.</p>
      </div>
      <label class="month-picker">Mes
        <select id="contextMonthSelect">
          ${months.map(month => `<option value="${month.key}" ${month.key === selectedContextMonth ? "selected" : ""}>${month.label}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="context-board">
      <article class="context-total">
        <p class="eyebrow">Desde que hay contexto</p>
        <h3>${formatSigned(total.pesoDelta, metric("peso"))} en peso</h3>
        <div class="context-mini-grid">
          <span>Grasa <b class="${deltaClass(total.grasaDelta, metric("grasa"))}">${formatSigned(total.grasaDelta, metric("grasa"))}</b></span>
          <span>Musculo <b class="${deltaClass(total.musculoDelta, metric("musculo"))}">${formatSigned(total.musculoDelta, metric("musculo"))}</b></span>
          <span>Visceral <b class="${deltaClass(total.visceralDelta, metric("visceral"))}">${formatSigned(total.visceralDelta, metric("visceral"))}</b></span>
        </div>
        <div class="context-bars">
          ${contextBar("Nutricion media", avgNutrition, 10, 6)}
          ${contextBar("Deporte medio", avgSport, 7, 4)}
          ${contextBar("Emocional medio", avgEmotional, 10, 5)}
        </div>
      </article>
      <article class="month-card">
        <p class="eyebrow">Mes seleccionado</p>
        <h3>${selected.label}</h3>
        <div class="month-grid">
          <div><span>Peso</span><strong class="${deltaClass(selected.pesoDelta, metric("peso"))}">${formatSigned(selected.pesoDelta, metric("peso"))}</strong></div>
          <div><span>Grasa</span><strong class="${deltaClass(selected.grasaDelta, metric("grasa"))}">${formatSigned(selected.grasaDelta, metric("grasa"))}</strong></div>
          <div><span>Musculo</span><strong class="${deltaClass(selected.musculoDelta, metric("musculo"))}">${formatSigned(selected.musculoDelta, metric("musculo"))}</strong></div>
        </div>
        <p>${monthNarrative(selected)}</p>
        <div class="context-bars">
          ${contextBar("Nutricion", selected.nutricion, 10, 6)}
          ${contextBar("Deporte", selected.deporte, 7, 4)}
          ${contextBar("Emocional", selected.emocional, 10, 5)}
        </div>
      </article>
    </div>
  `;
  document.getElementById("contextMonthSelect").addEventListener("change", event => {
    selectedContextMonth = event.target.value;
    renderContextAnalysis();
  });
}

function contextBar(label, value, max, threshold) {
  return `
    <div class="bar-row">
      <span>${label}</span>
      <div class="mini-bar"><i style="width:${percentage(value, max)}%"></i></div>
      <b class="${thresholdClass(value, threshold)}">${formatPlain(value, 1)}</b>
    </div>
  `;
}

function monthNarrative(month) {
  if (month.pesoDelta < -1 && month.grasaDelta <= 0) return "Mes de avance claro: peso baja y la composicion acompana.";
  if (month.pesoDelta < 0 && month.musculoDelta > 0) return "Buen mes: baja peso y el musculo responde.";
  if (month.pesoDelta > 0.5) return "Mes para revisar: el peso sube respecto a la referencia anterior.";
  if (month.grasaDelta > 0.6) return "El peso no lo cuenta todo: la grasa pide mas atencion.";
  return "Mes estable: util para mantener el plan y buscar consistencia.";
}

function renderRecords() {
  const recordMetrics = ["peso", "grasa", "musculo", "visceral", "imc", "calorias"].map(metric);
  document.getElementById("recordsGrid").innerHTML = recordMetrics.map(item => {
    const values = rows.filter(row => Number.isFinite(row[item.key]));
    const best = item.lowerIsGood ? minRow(values, item.key) : maxRow(values, item.key);
    const other = item.lowerIsGood ? maxRow(values, item.key) : minRow(values, item.key);
    return `
      <article class="record">
        <span>${item.label}</span>
        <strong class="good">Mejor: ${format(best[item.key], item)}</strong>
        <p>${formatDate(best.fecha)}</p>
        <strong class="bad">Peor: ${format(other[item.key], item)}</strong>
        <p>${formatDate(other.fecha)}</p>
      </article>
    `;
  }).join("");
}

function renderTable() {
  const displayRows = rows.map((row, index) => ({ row, index })).reverse();
  document.getElementById("historyTable").innerHTML = displayRows.map(({ row, index }) => `
    <tr>
      <td>${formatDate(row.fecha)}</td>
      <td>${format(row.peso, metric("peso"))}</td>
      <td>${format(row.imc, metric("imc"))}</td>
      <td>${format(row.musculo, metric("musculo"))}</td>
      <td>${format(row.grasa, metric("grasa"))}</td>
      <td>${format(row.visceral, metric("visceral"))}</td>
      <td>${format(row.calorias, metric("calorias"))}</td>
      <td>${format(row.caloriasQuemadas, ACTIVITY_METRICS[0])}</td>
      <td>${formatPlain(row.nutricion, 0)}</td>
      <td>${formatPlain(row.deporte, 0)}</td>
      <td>${formatPlain(row.emocional, 0)}</td>
      <td>${format(row.kmSemana, ACTIVITY_METRICS[2])}</td>
      <td><button class="row-edit" type="button" data-edit-index="${index}">Editar</button></td>
    </tr>
  `).join("");
  document.querySelectorAll("[data-edit-index]").forEach(button => {
    button.addEventListener("click", () => fillEntryForm(rows[Number(button.dataset.editIndex)]));
  });
}

function fillEntryForm(row) {
  const form = document.getElementById("entryForm");
  const fields = ["fecha", "peso", "imc", "musculo", "grasa", "visceral", "calorias", "caloriasQuemadas", "nutricion", "deporte", "emocional", "kmSemana"];
  fields.forEach(field => {
    form.elements[field].value = row[field] ?? "";
  });
  editingDate = row.fecha;
  updateEntryMode();
  document.getElementById("entryDetails").open = true;
  document.getElementById("entryStatus").textContent = `Editando el registro del ${formatDate(row.fecha)}. Al guardar se actualizara esa fecha.`;
  document.querySelector(".entry-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearEntryForm() {
  const form = document.getElementById("entryForm");
  form.reset();
  form.elements.fecha.value = todayIso();
  editingDate = "";
  updateEntryMode();
  document.getElementById("entryStatus").textContent = "";
}

function updateEntryMode() {
  document.getElementById("entrySummary").textContent = editingDate ? "Editar medicion semanal" : "Anadir medicion semanal";
  document.getElementById("entrySubmit").textContent = editingDate ? "Guardar cambios" : "Guardar en Sheet";
}

function drawLineChart(canvas, chartRows, series, options = {}) {
  if (!canvas) return;
  const ctx = setupCanvas(canvas);
  const { width, height, dark } = chartBase(canvas, ctx);
  const pad = { left: 58, right: 18, top: 24, bottom: 42 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const prepared = series.map(item => ({
    ...item,
    values: chartRows.map(row => item.value ? item.value(row) : row[item.key])
  }));
  const allValues = prepared.flatMap(item => item.values).filter(Number.isFinite);
  if (Number.isFinite(options.target)) allValues.push(options.target);
  if (!allValues.length || !chartRows.length) {
    emptyChart(ctx, width, height, "Aun no hay datos suficientes.");
    return;
  }

  const rawMin = options.fixedMin ?? Math.min(...allValues);
  const rawMax = options.fixedMax ?? Math.max(...allValues);
  const spread = rawMax - rawMin || 1;
  const min = options.fixedMin ?? rawMin - spread * 0.14;
  const max = options.fixedMax ?? rawMax + spread * 0.14;

  drawGrid(ctx, width, height, pad, min, max, prepared[0]?.m || { decimals: 1, unit: "" }, dark);

  if (Number.isFinite(options.target)) {
    const y = pad.top + plotH - ((options.target - min) / (max - min)) * plotH;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = dark ? "#d5f06d" : "#8aaa14";
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = dark ? "#d5f06d" : "#6f8a11";
    ctx.textAlign = "right";
    ctx.fillText(options.targetLabel || "Objetivo", width - pad.right, y - 8);
  }

  prepared.forEach(item => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    item.values.forEach((value, index) => {
      if (!Number.isFinite(value)) return;
      const x = pad.left + (plotW * index) / Math.max(chartRows.length - 1, 1);
      const y = pad.top + plotH - ((value - min) / (max - min)) * plotH;
      if (index === 0 || !Number.isFinite(item.values[index - 1])) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  drawLegend(ctx, prepared, pad.left, 13, dark);
  drawDateLabels(ctx, chartRows, width, height, pad, dark);
}

function drawNormalizedChart(canvas, chartRows, series) {
  if (!canvas) return;
  const ctx = setupCanvas(canvas);
  const { width, height, dark } = chartBase(canvas, ctx);
  const pad = { left: 44, right: 18, top: 24, bottom: 42 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  if (!chartRows.length) {
    emptyChart(ctx, width, height, "Anade datos de Garmin o km para comparar actividad.");
    return;
  }

  ctx.strokeStyle = dark ? "#2a3a32" : "#dfe6df";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + plotH * (i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  const prepared = series.map(item => ({
    ...item,
    values: chartRows.map(row => Number(row[item.key]))
  }));

  prepared.forEach(item => {
    const valid = item.values.filter(Number.isFinite);
    if (!valid.length) return;
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const spread = max - min || 1;
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    item.values.forEach((value, index) => {
      if (!Number.isFinite(value)) return;
      const x = pad.left + (plotW * index) / Math.max(chartRows.length - 1, 1);
      const y = pad.top + plotH - ((value - min) / spread) * plotH;
      if (index === 0 || !Number.isFinite(item.values[index - 1])) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  drawLegend(ctx, prepared, pad.left, 13, dark);
  drawDateLabels(ctx, chartRows, width, height, pad, dark);
}

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function chartBase(canvas, ctx) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const dark = document.body.dataset.theme === "dark";
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = dark ? "#101814" : "#fbfcfa";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "12px Inter, sans-serif";
  ctx.lineWidth = 1;
  return { width, height, dark };
}

function drawGrid(ctx, width, height, pad, min, max, m, dark) {
  const plotH = height - pad.top - pad.bottom;
  ctx.strokeStyle = dark ? "#2a3a32" : "#dfe6df";
  ctx.fillStyle = dark ? "#a9b8af" : "#627169";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + plotH * (i / 4);
    const value = max - (max - min) * (i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(format(value, m), pad.left - 8, y);
  }
}

function drawLegend(ctx, items, xStart, y, dark) {
  let x = xStart;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  items.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y - 5, 10, 10);
    ctx.fillStyle = dark ? "#eff7f2" : "#111915";
    ctx.fillText(item.label, x + 16, y);
    x += ctx.measureText(item.label).width + 44;
  });
}

function drawDateLabels(ctx, chartRows, width, height, pad, dark) {
  if (!chartRows.length) return;
  const plotW = width - pad.left - pad.right;
  const labels = [0, Math.floor((chartRows.length - 1) / 2), chartRows.length - 1];
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = dark ? "#a9b8af" : "#627169";
  [...new Set(labels)].forEach(index => {
    const x = pad.left + (plotW * index) / Math.max(chartRows.length - 1, 1);
    ctx.fillText(formatDate(chartRows[index].fecha).slice(3), x, height - pad.bottom + 14);
  });
}

function emptyChart(ctx, width, height, message) {
  ctx.fillStyle = document.body.dataset.theme === "dark" ? "#a9b8af" : "#627169";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, width / 2, height / 2);
}

function latestContextSummary() {
  const contextRows = rows.filter(hasContext);
  const latest = contextRows.at(-1) || rows.at(-1);
  const week = sameWeekRows(latest.fecha).filter(hasContext);
  const group = week.length ? week : [latest];
  return {
    nutricion: average(group.map(row => row.nutricion)),
    deporte: average(group.map(row => row.deporte)),
    emocional: average(group.map(row => row.emocional)),
    score: average(group.map(row => contextScore(row))) || 0
  };
}

function monthlyContext(contextRows) {
  const groups = contextRows.reduce((acc, row) => {
    const key = row.fecha.slice(0, 7);
    acc[key] ||= [];
    acc[key].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([key, group]) => {
    const first = group[0];
    const last = group.at(-1);
    const baseline = previousBefore(first.fecha) || first;
    return {
      key,
      label: new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(dateValue(`${key}-01`)),
      count: group.length,
      baseline,
      last,
      pesoDelta: delta(last, baseline, "peso"),
      grasaDelta: delta(last, baseline, "grasa"),
      musculoDelta: delta(last, baseline, "musculo"),
      visceralDelta: delta(last, baseline, "visceral"),
      nutricion: average(group.map(row => row.nutricion)),
      deporte: average(group.map(row => row.deporte)),
      emocional: average(group.map(row => row.emocional))
    };
  });
}

function trendStats(sourceRows) {
  const clean = sourceRows.filter(row => Number.isFinite(row.peso));
  const first = clean[0] || rows[0];
  const last = clean.at(-1) || rows.at(-1);
  const days = Math.max(1, (dateValue(last.fecha) - dateValue(first.fecha)) / 86400000);
  return {
    first,
    last,
    pesoDelta: delta(last, first, "peso"),
    grasaDelta: delta(last, first, "grasa"),
    musculoDelta: delta(last, first, "musculo"),
    visceralDelta: delta(last, first, "visceral"),
    pace: (delta(last, first, "peso") / days) * 7
  };
}

function contextComparableRows() {
  return rows.filter(hasContext).map(row => {
    const previous = previousOf(row);
    return {
      ...row,
      previous,
      pesoDelta: previous ? delta(row, previous, "peso") : null,
      grasaDelta: previous ? delta(row, previous, "grasa") : null,
      musculoDelta: previous ? delta(row, previous, "musculo") : null
    };
  }).filter(row => row.previous && Number.isFinite(row.pesoDelta));
}

function rangeRows(rangeKey) {
  const option = RANGE_OPTIONS.find(item => item.key === rangeKey);
  if (!option || !option.days) return rows;
  const lastDate = dateValue(rows.at(-1).fecha);
  const start = new Date(lastDate);
  start.setDate(start.getDate() - option.days);
  return rows.filter(row => dateValue(row.fecha) >= start);
}

function contextRowsInRange(rangeKey) {
  return rangeRows(rangeKey).filter(hasContext);
}

function sameWeekRows(fecha) {
  const key = weekKey(fecha);
  return rows.filter(row => weekKey(row.fecha) === key);
}

function weekKey(fecha) {
  const date = dateValue(fecha);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return toIsoDate(date);
}

function hasContext(row) {
  return Number.isFinite(row.nutricion) || Number.isFinite(row.deporte) || Number.isFinite(row.emocional);
}

function contextScore(row) {
  const parts = [
    Number.isFinite(row.nutricion) ? { value: row.nutricion / 10, weight: 0.45 } : null,
    Number.isFinite(row.deporte) ? { value: row.deporte / 7, weight: 0.35 } : null,
    Number.isFinite(row.emocional) ? { value: row.emocional / 10, weight: 0.2 } : null
  ].filter(Boolean);
  if (!parts.length) return null;
  return parts.reduce((sum, part) => sum + part.value * part.weight, 0) / parts.reduce((sum, part) => sum + part.weight, 0);
}

function previousOf(row) {
  const index = rows.indexOf(row);
  return index > 0 ? rows[index - 1] : null;
}

function previousBefore(fecha) {
  return rows.filter(row => dateValue(row.fecha) < dateValue(fecha)).at(-1) || null;
}

function delta(current, previous, key) {
  if (!current || !previous || !Number.isFinite(current[key]) || !Number.isFinite(previous[key])) return null;
  return current[key] - previous[key];
}

function metric(key) {
  return METRICS.find(item => item.key === key);
}

function minRow(sourceRows, key) {
  return sourceRows.reduce((best, row) => row[key] < best[key] ? row : best, sourceRows[0]);
}

function maxRow(sourceRows, key) {
  return sourceRows.reduce((best, row) => row[key] > best[key] ? row : best, sourceRows[0]);
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function correlation(xs, ys) {
  const pairs = xs.map((x, index) => [x, ys[index]]).filter(pair => pair.every(Number.isFinite));
  if (pairs.length < 3) return null;
  const xAvg = average(pairs.map(pair => pair[0]));
  const yAvg = average(pairs.map(pair => pair[1]));
  let numerator = 0;
  let xSpread = 0;
  let ySpread = 0;
  pairs.forEach(([x, y]) => {
    const dx = x - xAvg;
    const dy = y - yAvg;
    numerator += dx * dy;
    xSpread += dx * dx;
    ySpread += dy * dy;
  });
  if (!xSpread || !ySpread) return null;
  return numerator / Math.sqrt(xSpread * ySpread);
}

function format(value, m) {
  if (!Number.isFinite(Number(value))) return "--";
  const formatted = Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: m.decimals,
    maximumFractionDigits: m.decimals
  });
  return `${formatted}${m.unit ? ` ${m.unit}` : ""}`;
}

function formatSigned(value, m) {
  if (!Number.isFinite(Number(value))) return "--";
  if (Number(value) === 0) return "Sin cambio";
  const sign = Number(value) > 0 ? "+" : "";
  return `${sign}${format(value, m)}`;
}

function formatPlain(value, decimals) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dateValue(value));
}

function deltaClass(value, m) {
  if (!Number.isFinite(Number(value)) || Number(value) === 0) return "";
  const good = m.lowerIsGood ? Number(value) < 0 : Number(value) > 0;
  return good ? "good" : "bad";
}

function thresholdClass(value, min) {
  if (!Number.isFinite(Number(value))) return "";
  return Number(value) < min ? "bad" : "good";
}

function percentage(value, max) {
  if (!Number.isFinite(Number(value))) return 0;
  return clamp((Number(value) / max) * 100, 0, 100);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function number(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function boundedNumber(value, min, max) {
  const parsed = number(value);
  if (!Number.isFinite(parsed)) return null;
  return clamp(parsed, min, max);
}

function emotionalValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = number(value);
  if (Number.isFinite(parsed)) return clamp(parsed, 0, 10);
  const normalized = String(value).trim().toLowerCase();
  if (["bien", "bueno", "good"].includes(normalized)) return 8;
  if (["regular", "medio", "ok"].includes(normalized)) return 5;
  if (["mal", "malo", "bad"].includes(normalized)) return 2;
  return null;
}

function firstValue(...values) {
  return values.find(value => value !== "" && value !== null && value !== undefined);
}

function toIsoDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  return "";
}

function dateValue(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const iso = toIsoDate(value);
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayIso() {
  return toIsoDate(new Date());
}
