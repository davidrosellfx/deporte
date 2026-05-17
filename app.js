const SAMPLE_DATA = [
  { fecha: "2024-12-15", peso: 93.8, imc: 29.1, musculo: 35.2, grasa: 24.5, visceral: 11, calorias: 1934, nutricion: 7, deporte: 4, emocional: 8 },
  { fecha: "2024-12-17", peso: 92.8, imc: 28.8, musculo: 36.3, grasa: 24, visceral: 11, calorias: 1919, nutricion: 8, deporte: 5, emocional: 8 },
  { fecha: "2024-12-20", peso: 90.4, imc: 28.1, musculo: 35, grasa: 26.5, visceral: 11, calorias: 1882, nutricion: 5, deporte: 2, emocional: 5 },
  { fecha: "2025-03-25", peso: 94.4, imc: 29.3, musculo: 36, grasa: 24.6, visceral: 12, calorias: 1940, nutricion: 4, deporte: 1, emocional: 2 },
  { fecha: "2025-07-18", peso: 87.6, imc: 27.2, musculo: 36.2, grasa: 24.3, visceral: 10, calorias: 1850, nutricion: 8, deporte: 5, emocional: 8 },
  { fecha: "2025-08-10", peso: 89.6, imc: 27.8, musculo: 37, grasa: 22.8, visceral: 10, calorias: 1877, nutricion: 7, deporte: 4, emocional: 8 },
  { fecha: "2025-10-13", peso: 93.4, imc: 29, musculo: 37.2, grasa: 22.4, visceral: 11, calorias: 1928, nutricion: 8, deporte: 5, emocional: 6 },
  { fecha: "2026-01-19", peso: 92.9, imc: 28.8, musculo: 36.7, grasa: 23.4, visceral: 11, calorias: 1921, nutricion: 6, deporte: 3, emocional: 5 },
  { fecha: "2026-02-23", peso: 91.8, imc: 28.5, musculo: 36.5, grasa: 23.7, visceral: 11, calorias: 1906, nutricion: 7, deporte: 4, emocional: 8 },
  { fecha: "2026-04-17", peso: 92.4, imc: 28.7, musculo: 36.1, grasa: 24.4, visceral: 11, calorias: 1913, nutricion: 8, deporte: 2, emocional: 5 }
];

const METRICS = [
  { key: "peso", label: "Peso", unit: "kg", color: "#2d6cdf", decimals: 1, lowerIsGood: true },
  { key: "imc", label: "IMC", unit: "", color: "#6c57d9", decimals: 1, lowerIsGood: true },
  { key: "musculo", label: "Músculo", unit: "%", color: "#16784f", decimals: 1, lowerIsGood: false },
  { key: "grasa", label: "Grasa", unit: "%", color: "#d64b63", decimals: 1, lowerIsGood: true },
  { key: "visceral", label: "G. visceral", unit: "", color: "#b77717", decimals: 0, lowerIsGood: true },
  { key: "calorias", label: "Calorías", unit: "kcal", color: "#0b7c8d", decimals: 0, lowerIsGood: false }
];

const MOTIVATIONAL_QUOTES = [
  "Si lo hiciste una vez, lo harás otra vez.",
  "Vuelta a mi mejor versión: hoy también cuenta.",
  "No necesitas perfección, necesitas volver.",
  "Cada medición es información, no juicio.",
  "El cuerpo cambia cuando la constancia se queda.",
  "Un día fuerte empieza con una decisión sencilla.",
  "La disciplina también se entrena.",
  "No estás empezando de cero: estás volviendo con experiencia.",
  "El objetivo no se negocia, el ritmo se adapta.",
  "Hazlo por el David que ya sabe que puede."
];

const SOURCE_KEY = "camino-a-los-85-source";
const GOAL_KEY = "camino-a-los-85-goal";
let rows = [];
let goalWeight = Number(localStorage.getItem(GOAL_KEY)) || 85;
let selectedContextMonth = "";

const configUrl = window.WEIGHT_DASHBOARD_CONFIG?.sheetApiUrl?.trim() || "";
const savedUrl = localStorage.getItem(SOURCE_KEY) || "";
const activeUrl = savedUrl || configUrl;

window.addEventListener("resize", () => drawAllCharts());
setupEntryForm();
setRandomQuote();
load(activeUrl);

function setRandomQuote() {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  document.getElementById("motivationalQuote").textContent = quote;
}

async function load(url) {
  try {
    rows = url ? await loadJsonp(url) : SAMPLE_DATA;
    rows = normalizeRows(rows).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    render();
  } catch (error) {
    console.error(error);
    rows = SAMPLE_DATA;
    render();
  }
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
      reject(new Error("No se pudo cargar el script de datos"));
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
  if (!form) return;
  form.elements.fecha.value = new Date().toISOString().slice(0, 10);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.getElementById("entryStatus");
    if (!activeUrl) {
      status.textContent = "No hay URL de Google Apps Script configurada.";
      return;
    }
    const formData = new FormData(form);
    status.textContent = "Guardando medición...";
    try {
      await writeMeasurement(Object.fromEntries(formData.entries()));
      status.textContent = "Medición guardada y Sheet ordenada por fecha.";
      await load(activeUrl);
    } catch (error) {
      console.error(error);
      status.textContent = "No se pudo guardar. Revisa el despliegue del Apps Script.";
    }
  });
}

function writeMeasurement(values) {
  const params = {
    action: "upsert",
    fecha: values.fecha,
    peso: values.peso,
    imc: values.imc,
    musculo: values.musculo,
    grasa: values.grasa,
    visceral: values.visceral,
    calorias: values.calorias,
    nutricion: values.nutricion,
    deporte: values.deporte,
    emocional: values.emocional
  };
  return loadJsonp(withParams(activeUrl, params));
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
      fecha: toIsoDate(row.fecha || row.Fecha || row.date || row.Date),
      peso: number(row.peso || row.Peso),
      imc: number(row.imc || row.IMC),
      musculo: number(row.musculo || row.Musculo || row["Músculo"]),
      grasa: number(row.grasa || row.Grasa),
      visceral: number(row.visceral || row["G.Visceral"] || row["G. visceral"] || row["Grasa visceral"]),
      calorias: number(row.calorias || row.Calorias || row["Calorías"]),
      nutricion: boundedNumber(firstValue(row.nutricion, row.Nutricion, row["Nutrición"], row["Nutrición (1-10)"]), 0, 10),
      deporte: boundedNumber(firstValue(row.deporte, row.Deporte, row["Deporte"], row["Deporte (días)"], row["Deporte dias"]), 0, 7),
      emocional: emotionalValue(firstValue(row.emocional, row.Emocional, row["Emocional (0-10)"]))
    }))
    .filter(row => row.fecha && Number.isFinite(row.peso));
}

function toIsoDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return "";
}

function number(value) {
  if (value === "" || value === null || value === undefined) return null;
  return Number(String(value).replace(",", "."));
}

function firstValue(...values) {
  return values.find(value => value !== "" && value !== null && value !== undefined);
}

function boundedNumber(value, min, max) {
  const parsed = number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
}

function emotionalValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = number(value);
  if (Number.isFinite(parsed)) return Math.min(10, Math.max(0, parsed));
  const normalized = String(value).trim().toLowerCase();
  if (["bien", "bueno", "good"].includes(normalized)) return 8;
  if (["regular", "medio", "ok"].includes(normalized)) return 5;
  if (["mal", "malo", "bad"].includes(normalized)) return 2;
  return null;
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function emotionClass(value) {
  if (value >= 7) return "yes";
  if (value <= 3) return "no";
  return null;
}

function render() {
  renderHero();
  renderCards();
  renderWeeklyPlan();
  renderCharts();
  renderContextAnalysis();
  renderRecords();
  renderTable();
}

function renderWeeklyPlan() {
  const plannedRows = rows.filter(row => row.nutricion !== null || row.deporte !== null || row.emocional !== null);
  const container = document.getElementById("weeklyPlan");
  if (!plannedRows.length) {
    container.innerHTML = "";
    return;
  }

  const enriched = getContextRows(plannedRows);
  const latest = enriched.at(-1);
  const latestWeek = weekSummary(enriched, latest.fecha);
  container.innerHTML = `
    <article class="plan-panel compact">
      <div>
        <p class="eyebrow">Última semana</p>
        <h2>${latestWeek.label}</h2>
        <p>Media de las mediciones de la última semana registrada, sin tapar las gráficas principales.</p>
      </div>
      <div class="compact-context">
        <div><span>Nutrición</span><strong class="${thresholdClass(latestWeek.nutricion, 6)}">${formatPlain(latestWeek.nutricion, 0)}/10</strong></div>
        <div><span>Deporte</span><strong class="${thresholdClass(latestWeek.deporte, 4)}">${formatPlain(latestWeek.deporte, 0)}/7</strong></div>
        <div><span>Emocional</span><strong class="${thresholdClass(latestWeek.emocional, 5)}">${formatPlain(latestWeek.emocional, 0)}/10</strong></div>
        <div><span>Resultado</span><strong class="${impactClass(latest)}">${impactLabel(latest)}</strong></div>
      </div>
      <div class="weekly-deltas">
        <div><span>Peso</span><strong class="${deltaClass(latest.pesoDelta, METRICS[0])}">${formatSigned(latest.pesoDelta, METRICS[0])}</strong></div>
        <div><span>Músculo</span><strong class="${deltaClass(latest.musculoDelta, METRICS[2])}">${formatSigned(latest.musculoDelta, METRICS[2])}</strong></div>
        <div><span>Grasa</span><strong class="${deltaClass(latest.grasaDelta, METRICS[3])}">${formatSigned(latest.grasaDelta, METRICS[3])}</strong></div>
        <div><span>G. visceral</span><strong class="${deltaClass(latest.visceralDelta, METRICS[4])}">${formatSigned(latest.visceralDelta, METRICS[4])}</strong></div>
      </div>
    </article>
  `;
}

function getContextRows(sourceRows) {
  return sourceRows.map(row => {
    const previous = rows[rows.indexOf(row) - 1];
    return {
      ...row,
      score: contextScore(row),
      previous,
      pesoDelta: previous ? row.peso - previous.peso : null,
      grasaDelta: previous && Number.isFinite(row.grasa) && Number.isFinite(previous.grasa) ? row.grasa - previous.grasa : null,
      musculoDelta: previous && Number.isFinite(row.musculo) && Number.isFinite(previous.musculo) ? row.musculo - previous.musculo : null,
      visceralDelta: previous && Number.isFinite(row.visceral) && Number.isFinite(previous.visceral) ? row.visceral - previous.visceral : null
    };
  });
}

function renderContextAnalysis() {
  const plannedRows = rows.filter(row => row.nutricion !== null || row.deporte !== null || row.emocional !== null);
  const container = document.getElementById("contextAnalysis");
  if (!plannedRows.length) {
    container.innerHTML = "";
    return;
  }
  const enriched = getContextRows(plannedRows);
  const nutritionAverage = average(plannedRows.map(row => row.nutricion));
  const sportAverage = average(plannedRows.map(row => row.deporte));
  const emotionalAverage = average(plannedRows.map(row => row.emocional));
  const contextAverage = average(enriched.map(row => row.score));
  const progress = Math.round((contextAverage || 0) * 100);
  const impact = impactSummary(enriched);
  const months = monthlyContext(enriched);
  if (!selectedContextMonth || !months.some(month => month.key === selectedContextMonth)) {
    selectedContextMonth = months.at(-1).key;
  }
  const selectedMonth = months.find(month => month.key === selectedContextMonth);

  container.innerHTML = `
    <div class="panel-headline">
      <div>
        <p class="eyebrow">Contexto y composición</p>
        <h2>Análisis por mes</h2>
      </div>
      <label class="month-picker">Mes
        <select id="contextMonthSelect">
          ${months.map(month => `<option value="${month.key}" ${month.key === selectedContextMonth ? "selected" : ""}>${month.label}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="context-layout">
    <article class="plan-panel wide">
      <div>
        <p class="eyebrow">Media general</p>
        <h2>Contexto acumulado</h2>
        <p>Resumen de todas las semanas con datos de nutrición, deporte y emocional.</p>
      </div>
      <div class="context-grid">
        <div class="context-card">
          <span>Nutrición media</span>
          <strong class="${thresholdClass(nutritionAverage, 6)}">${formatPlain(nutritionAverage, 1)}/10</strong>
          <div class="mini-bar"><i style="width:${percentage(nutritionAverage, 10)}%"></i></div>
        </div>
        <div class="context-card">
          <span>Deporte medio</span>
          <strong class="${thresholdClass(sportAverage, 4)}">${formatPlain(sportAverage, 1)}/7</strong>
          <div class="mini-bar"><i style="width:${percentage(sportAverage, 7)}%"></i></div>
        </div>
        <div class="context-card">
          <span>Emocional medio</span>
          <strong class="${thresholdClass(emotionalAverage, 5)}">${formatPlain(emotionalAverage, 1)}/10</strong>
          <div class="mini-bar emotion"><i style="width:${percentage(emotionalAverage, 10)}%"></i></div>
        </div>
      </div>
      <div class="plan-bar" style="--progress:${progress}%"><span></span></div>
      <p>Índice global de contexto: <strong>${progress}%</strong></p>
    </article>
    <article class="impact-card">
      <p class="eyebrow">Impacto observado</p>
      <h2>${impact.title}</h2>
      <p>${impact.text}</p>
      <div class="impact-grid">
        <span>Peso <b class="${deltaClass(impact.peso, METRICS[0])}">${formatSigned(impact.peso, METRICS[0])}</b></span>
        <span>Grasa <b class="${deltaClass(impact.grasa, METRICS[3])}">${formatSigned(impact.grasa, METRICS[3])}</b></span>
        <span>Músculo <b class="${deltaClass(impact.musculo, METRICS[2])}">${formatSigned(impact.musculo, METRICS[2])}</b></span>
      </div>
    </article>
    </div>
    <article class="plan-list wide">
      <div>
        <p class="eyebrow">Mes seleccionado</p>
        <h2>${selectedMonth.label}</h2>
      </div>
      ${renderMonthDetail(selectedMonth)}
    </article>
  `;

  document.getElementById("contextMonthSelect").addEventListener("change", event => {
    selectedContextMonth = event.target.value;
    renderContextAnalysis();
  });
}

function monthlyContext(enriched) {
  const groups = enriched.reduce((acc, row) => {
    const key = row.fecha.slice(0, 7);
    acc[key] ||= [];
    acc[key].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([key, group]) => {
    const first = group[0];
    const last = group.at(-1);
    const baseline = rows.filter(row => new Date(row.fecha) < new Date(first.fecha)).at(-1) || first;
    const peso = last.peso - baseline.peso;
    const grasa = Number.isFinite(last.grasa) && Number.isFinite(baseline.grasa) ? last.grasa - baseline.grasa : null;
    const musculo = Number.isFinite(last.musculo) && Number.isFinite(baseline.musculo) ? last.musculo - baseline.musculo : null;
    return {
      key,
      label: new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(`${key}-01T00:00:00`)),
      count: group.length,
      baseline,
      first,
      last,
      nutricion: average(group.map(row => row.nutricion)),
      deporte: average(group.map(row => row.deporte)),
      emocional: average(group.map(row => row.emocional)),
      pesoMedio: average(group.map(row => row.peso)),
      grasaMedia: average(group.map(row => row.grasa)),
      musculoMedio: average(group.map(row => row.musculo)),
      peso,
      grasa,
      musculo,
      netGood: (peso <= 0 && (grasa === null || grasa <= 0)) || (musculo !== null && musculo > 0)
    };
  });
}

function weekSummary(enriched, dateValue) {
  const target = weekKey(dateValue);
  const group = enriched.filter(row => weekKey(row.fecha) === target);
  const firstDate = group[0].fecha;
  const lastDate = group.at(-1).fecha;
  return {
    label: firstDate === lastDate ? formatDate(firstDate) : `${formatDate(firstDate)} - ${formatDate(lastDate)}`,
    nutricion: average(group.map(row => row.nutricion)),
    deporte: average(group.map(row => row.deporte)),
    emocional: average(group.map(row => row.emocional))
  };
}

function weekKey(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
}

function renderMonthDetail(month) {
  return `
    <div class="month-summary-grid">
      <div class="month-tile">
        <span>Peso medio</span>
        <strong>${format(month.pesoMedio, METRICS[0])}</strong>
        <p>Cambio vs medición anterior: <b class="${deltaClass(month.peso, METRICS[0])}">${formatSigned(month.peso, METRICS[0])}</b></p>
      </div>
      <div class="month-tile">
        <span>Grasa media</span>
        <strong>${format(month.grasaMedia, METRICS[3])}</strong>
        <p>Cambio vs medición anterior: <b class="${deltaClass(month.grasa, METRICS[3])}">${formatSigned(month.grasa, METRICS[3])}</b></p>
      </div>
      <div class="month-tile">
        <span>Músculo medio</span>
        <strong>${format(month.musculoMedio, METRICS[2])}</strong>
        <p>Cambio vs medición anterior: <b class="${deltaClass(month.musculo, METRICS[2])}">${formatSigned(month.musculo, METRICS[2])}</b></p>
      </div>
    </div>
    <div class="week-strip">
      <div class="week-head">
        <strong>${month.count} mediciones en el mes</strong>
        <b class="plan-badge ${month.netGood ? "yes" : "no"}">${month.netGood ? "Buen mes" : "Revisar"}</b>
      </div>
      <div class="bar-row">
        <span>Nutrición</span>
        <div class="mini-bar"><i style="width:${percentage(month.nutricion, 10)}%"></i></div>
        <b class="${thresholdClass(month.nutricion, 6)}">${formatPlain(month.nutricion, 1)}/10</b>
      </div>
      <div class="bar-row">
        <span>Deporte</span>
        <div class="mini-bar sport"><i style="width:${percentage(month.deporte, 7)}%"></i></div>
        <b class="${thresholdClass(month.deporte, 4)}">${formatPlain(month.deporte, 1)}/7</b>
      </div>
      <div class="bar-row">
        <span>Emocional</span>
        <div class="mini-bar emotion"><i style="width:${percentage(month.emocional, 10)}%"></i></div>
        <b class="${thresholdClass(month.emocional, 5)}">${formatPlain(month.emocional, 1)}/10</b>
      </div>
      <div class="week-foot">
        <span>Desde ${formatDate(month.baseline.fecha)}</span>
        <span>Hasta ${formatDate(month.last.fecha)}</span>
        <span>Peso <b class="${deltaClass(month.peso, METRICS[0])}">${formatSigned(month.peso, METRICS[0])}</b></span>
        <span>Grasa <b class="${deltaClass(month.grasa, METRICS[3])}">${formatSigned(month.grasa, METRICS[3])}</b></span>
      </div>
    </div>
  `;
}

function contextScore(row) {
  const nutrition = Number.isFinite(row.nutricion) ? row.nutricion / 10 : null;
  const sport = Number.isFinite(row.deporte) ? row.deporte / 7 : null;
  const emotional = Number.isFinite(row.emocional) ? row.emocional / 10 : null;
  const parts = [
    nutrition === null ? null : { value: nutrition, weight: 0.45 },
    sport === null ? null : { value: sport, weight: 0.35 },
    emotional === null ? null : { value: emotional, weight: 0.2 }
  ].filter(Boolean);
  if (!parts.length) return null;
  return parts.reduce((sum, part) => sum + part.value * part.weight, 0) / parts.reduce((sum, part) => sum + part.weight, 0);
}

function impactSummary(enriched) {
  const comparable = enriched.filter(row => row.previous && row.score !== null);
  if (!comparable.length) {
    return { title: "Aún falta historial", text: "Con unas semanas más podré comparar contexto y cambios de composición.", peso: null, grasa: null, musculo: null };
  }
  const strong = comparable.filter(row => row.score >= 0.68);
  const base = strong.length >= 2 ? strong : comparable;
  const peso = average(base.map(row => row.pesoDelta));
  const grasa = average(base.map(row => row.grasaDelta));
  const musculo = average(base.map(row => row.musculoDelta));
  const improved = (peso !== null && peso < 0) || (grasa !== null && grasa < 0) || (musculo !== null && musculo > 0);
  return {
    title: improved ? "Las mejores semanas coinciden con mejora" : "El patrón aún no es claro",
    text: strong.length >= 2
      ? "En semanas con mejor contexto global, estos fueron los cambios medios frente a la medición anterior."
      : "Todavía hay pocas semanas fuertes registradas; muestro la media disponible como referencia, no como conclusión cerrada.",
    peso,
    grasa,
    musculo
  };
}

function impactLabel(row) {
  if (!row.previous) return "Inicio";
  if ((row.grasaDelta !== null && row.grasaDelta < -0.2) || (row.pesoDelta !== null && row.pesoDelta < -0.4 && (row.musculoDelta === null || row.musculoDelta >= -0.2))) return "Mejoró";
  if ((row.grasaDelta !== null && row.grasaDelta > 0.3) || (row.pesoDelta !== null && row.pesoDelta > 0.5 && row.musculoDelta !== null && row.musculoDelta < 0)) return "Retroceso";
  return "Estable";
}

function impactClass(row) {
  const label = impactLabel(row);
  if (label === "Mejoró") return "yes";
  if (label === "Retroceso") return "no";
  return "";
}

function percentage(value, max) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(100, (Number(value) / max) * 100));
}


function renderHero() {
  const last = rows.at(-1);
  document.getElementById("heroWeight").textContent = format(last.peso, METRICS[0]);
  document.getElementById("heroDate").textContent = `Última medición: ${formatDate(last.fecha)}`;
}

function renderCards() {
  const first = rows[0];
  const last = rows.at(-1);
  const cards = [
    { label: "Peso actual", metric: METRICS[0], value: last.peso, change: last.peso - first.peso },
    { label: "Objetivo", goal: true, detail: `${format(last.peso - goalWeight, METRICS[0])} por bajar` },
    { label: "Músculo", metric: METRICS[2], value: last.musculo, change: last.musculo - first.musculo },
    { label: "Grasa", metric: METRICS[3], value: last.grasa, change: last.grasa - first.grasa },
    { label: "G. visceral", metric: METRICS[4], value: last.visceral, change: last.visceral - first.visceral }
  ];

  document.getElementById("metricCards").innerHTML = cards.map(card => {
    if (card.goal) {
      return `<article class="metric-card">
        <span>${card.label}</span>
        <div class="goal-control">
          <input class="goal-input" id="goalInput" type="number" step="0.1" value="${goalWeight}">
          <b class="goal-unit">kg</b>
        </div>
        <p>${card.detail}</p>
      </article>`;
    }
    const sign = card.change > 0 ? "+" : "";
    return `<article class="metric-card">
      <span>${card.label}</span>
      <strong>${format(card.value, card.metric)}</strong>
      <p><b class="${deltaClass(card.change, card.metric)}">${sign}${format(card.change, card.metric)}</b> desde el primer registro</p>
    </article>`;
  }).join("");

  document.getElementById("goalInput").addEventListener("change", event => {
    goalWeight = Number(event.target.value) || 85;
    localStorage.setItem(GOAL_KEY, String(goalWeight));
    renderCards();
  });
}

function renderCharts() {
  document.getElementById("chartsGrid").innerHTML = METRICS.map(metric => `
    <article class="chart-card">
      <h3 style="color:${metric.color}">${metric.label}</h3>
      <div class="chart-frame">
        <canvas data-chart="${metric.key}"></canvas>
      </div>
    </article>
  `).join("");
  drawAllCharts();
}

function drawAllCharts() {
  METRICS.forEach(metric => {
    const canvas = document.querySelector(`[data-chart="${metric.key}"]`);
    if (canvas) drawChart(canvas, metric);
  });
}

function drawChart(canvas, metric) {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const pad = { left: 64, right: 18, top: 18, bottom: 38 };
  const values = rows.map(row => Number(row[metric.key])).filter(Number.isFinite);
  if (!values.length) return;

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin || 1;
  const min = rawMin - spread * 0.14;
  const max = rawMax + spread * 0.14;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfcfa";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#dfe6df";
  ctx.fillStyle = "#66736d";
  ctx.lineWidth = 1;
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + plotH * (i / 4);
    const value = max - (max - min) * (i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(format(value, metric), pad.left - 8, y);
  }

  ctx.strokeStyle = metric.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = pad.left + (plotW * index) / Math.max(values.length - 1, 1);
    const y = pad.top + plotH - ((value - min) / (max - min)) * plotH;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  values.forEach((value, index) => {
    const x = pad.left + (plotW * index) / Math.max(values.length - 1, 1);
    const y = pad.top + plotH - ((value - min) / (max - min)) * plotH;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = "#66736d";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const labels = [0, Math.floor((rows.length - 1) / 2), rows.length - 1];
  [...new Set(labels)].forEach(index => {
    const x = pad.left + (plotW * index) / Math.max(rows.length - 1, 1);
    ctx.fillText(formatDate(rows[index].fecha).slice(3), x, height - pad.bottom + 14);
  });
}

function renderRecords() {
  document.getElementById("recordsGrid").innerHTML = METRICS.map(metric => {
    const values = rows.filter(row => Number.isFinite(row[metric.key]));
    const minRow = values.reduce((best, row) => row[metric.key] < best[metric.key] ? row : best, values[0]);
    const maxRow = values.reduce((best, row) => row[metric.key] > best[metric.key] ? row : best, values[0]);
    const minGood = metric.lowerIsGood;
    const maxGood = !metric.lowerIsGood;
    return `<article class="record">
      <span>${metric.label}</span>
      <strong class="${minGood ? "good" : "bad"}">Mín: ${format(minRow[metric.key], metric)}</strong>
      <p>${formatDate(minRow.fecha)}</p>
      <strong class="${maxGood ? "good" : "bad"}">Máx: ${format(maxRow[metric.key], metric)}</strong>
      <p>${formatDate(maxRow.fecha)}</p>
    </article>`;
  }).join("");
}

function renderTable() {
  document.getElementById("historyTable").innerHTML = [...rows].reverse().map(row => `
    <tr>
      <td>${formatDate(row.fecha)}</td>
      <td>${format(row.peso, METRICS[0])}</td>
      <td>${format(row.imc, METRICS[1])}</td>
      <td>${format(row.musculo, METRICS[2])}</td>
      <td>${format(row.grasa, METRICS[3])}</td>
      <td>${format(row.visceral, METRICS[4])}</td>
      <td>${format(row.calorias, METRICS[5])}</td>
      <td>${formatPlain(row.nutricion, 0)}</td>
      <td>${formatPlain(row.deporte, 0)}</td>
      <td>${formatPlain(row.emocional, 0)}/10</td>
    </tr>
  `).join("");
}

function format(value, metric) {
  if (!Number.isFinite(Number(value))) return "--";
  const formatted = Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: metric.decimals,
    maximumFractionDigits: metric.decimals
  });
  return `${formatted}${metric.unit ? ` ${metric.unit}` : ""}`;
}

function formatSigned(value, metric) {
  if (!Number.isFinite(Number(value))) return "--";
  if (Number(value) === 0) return "Sin cambio";
  const sign = Number(value) > 0 ? "+" : "";
  return `${sign}${format(value, metric)}`;
}

function deltaClass(value, metric) {
  if (!Number.isFinite(Number(value)) || Number(value) === 0) return "";
  const good = metric.lowerIsGood ? Number(value) < 0 : Number(value) > 0;
  return good ? "good" : "bad";
}

function thresholdClass(value, min) {
  if (!Number.isFinite(Number(value))) return "";
  return Number(value) < min ? "bad" : "good";
}

function formatPlain(value, decimals) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
