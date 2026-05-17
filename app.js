const SAMPLE_DATA = [
  { fecha: "2024-12-15", peso: 93.8, imc: 29.1, musculo: 35.2, grasa: 24.5, visceral: 11, calorias: 1934 },
  { fecha: "2024-12-17", peso: 92.8, imc: 28.8, musculo: 36.3, grasa: 24, visceral: 11, calorias: 1919 },
  { fecha: "2024-12-20", peso: 90.4, imc: 28.1, musculo: 35, grasa: 26.5, visceral: 11, calorias: 1882 },
  { fecha: "2025-03-25", peso: 94.4, imc: 29.3, musculo: 36, grasa: 24.6, visceral: 12, calorias: 1940 },
  { fecha: "2025-07-18", peso: 87.6, imc: 27.2, musculo: 36.2, grasa: 24.3, visceral: 10, calorias: 1850 },
  { fecha: "2025-08-10", peso: 89.6, imc: 27.8, musculo: 37, grasa: 22.8, visceral: 10, calorias: 1877 },
  { fecha: "2025-10-13", peso: 93.4, imc: 29, musculo: 37.2, grasa: 22.4, visceral: 11, calorias: 1928 },
  { fecha: "2026-01-19", peso: 92.9, imc: 28.8, musculo: 36.7, grasa: 23.4, visceral: 11, calorias: 1921 },
  { fecha: "2026-02-23", peso: 91.8, imc: 28.5, musculo: 36.5, grasa: 23.7, visceral: 11, calorias: 1906 },
  { fecha: "2026-04-17", peso: 92.4, imc: 28.7, musculo: 36.1, grasa: 24.4, visceral: 11, calorias: 1913 }
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

const configUrl = window.WEIGHT_DASHBOARD_CONFIG?.sheetApiUrl?.trim() || "";
const savedUrl = localStorage.getItem(SOURCE_KEY) || "";
const activeUrl = savedUrl || configUrl;

document.getElementById("sourceUrl").value = activeUrl;
document.getElementById("sourceForm").addEventListener("submit", event => {
  event.preventDefault();
  const url = document.getElementById("sourceUrl").value.trim();
  if (url) localStorage.setItem(SOURCE_KEY, url);
  load(url);
});

document.getElementById("clearSource").addEventListener("click", () => {
  localStorage.removeItem(SOURCE_KEY);
  document.getElementById("sourceUrl").value = configUrl;
  load(configUrl);
});

document.getElementById("toggleSetup").addEventListener("click", () => {
  document.getElementById("setupPanel").classList.toggle("hidden");
});

window.addEventListener("resize", () => drawAllCharts());
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
    document.getElementById("setupPanel").classList.remove("hidden");
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

function normalizeRows(input) {
  return input
    .map(row => ({
      fecha: toIsoDate(row.fecha || row.Fecha || row.date || row.Date),
      peso: number(row.peso || row.Peso),
      imc: number(row.imc || row.IMC),
      musculo: number(row.musculo || row.Musculo || row["Músculo"]),
      grasa: number(row.grasa || row.Grasa),
      visceral: number(row.visceral || row["G.Visceral"] || row["G. visceral"] || row["Grasa visceral"]),
      calorias: number(row.calorias || row.Calorias || row["Calorías"])
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

function render() {
  renderHero();
  renderCards();
  renderCharts();
  renderRecords();
  renderTable();
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
    { label: "Grasa", metric: METRICS[3], value: last.grasa, change: last.grasa - first.grasa }
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
    const good = card.metric.lowerIsGood ? card.change <= 0 : card.change >= 0;
    const sign = card.change > 0 ? "+" : "";
    return `<article class="metric-card">
      <span>${card.label}</span>
      <strong>${format(card.value, card.metric)}</strong>
      <p><b class="${good ? "good" : "bad"}">${sign}${format(card.change, card.metric)}</b> desde el primer registro</p>
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
    return `<article class="record">
      <span>${metric.label}</span>
      <strong>Mín: ${format(minRow[metric.key], metric)}</strong>
      <p>${formatDate(minRow.fecha)}</p>
      <strong>Máx: ${format(maxRow[metric.key], metric)}</strong>
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

function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
