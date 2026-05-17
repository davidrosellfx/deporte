// Pegalo desde Extensiones > Apps Script dentro de tu Google Sheet.
const SHEET_ID = "";
const SHEET_NAME = "";

// Estructura real de tu hoja:
// Fecha | Peso | IMC | Musculo | Grasa | G.Visceral | Calorias | Calorias quemadas | Nutricion (0-10) | Deporte (dias) | Emocional | Km semana
const REQUIRED_HEADERS = [
  "Fecha",
  "Peso",
  "IMC",
  "Musculo",
  "Grasa",
  "G.Visceral",
  "Calorias",
  "Calorias quemadas",
  "Nutricion (0-10)",
  "Deporte (dias)",
  "Emocional",
  "Km semana"
];

const FIELD_ALIASES = {
  fecha: ["fecha"],
  peso: ["peso"],
  imc: ["imc"],
  musculo: ["musculo"],
  grasa: ["grasa"],
  visceral: ["gvisceral", "visceral", "grasavisceral"],
  calorias: ["calorias"],
  caloriasQuemadas: ["caloriasquemadas", "calquemadas", "caloriasgarmin", "garmin"],
  nutricion: ["nutricion010", "nutricion110", "nutricion"],
  deporte: ["deportedias", "deporte"],
  emocional: ["emocional", "emocional010"],
  kmSemana: ["kmsemana", "kilometrossemana", "kmssemana", "kms", "km"]
};

function doGet(e) {
  const action = e.parameter.action || "read";
  const payload = action === "upsert"
    ? upsertMeasurement(e.parameter)
    : { updatedAt: new Date().toISOString(), data: getRows() };
  return output(payload, e.parameter.callback);
}

function output(payload, callback) {
  const body = callback
    ? `${callback}(${JSON.stringify(payload)})`
    : JSON.stringify(payload);
  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME
    ? spreadsheet.getSheetByName(SHEET_NAME)
    : spreadsheet.getSheets()[0];
}

function getSheetInfo() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  let headerRowIndex = values.findIndex(row => {
    const normalized = row.map(normalizeHeader);
    return normalized.indexOf("fecha") !== -1 && normalized.indexOf("peso") !== -1;
  });

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
  }

  const headerRow = headerRowIndex + 1;
  const width = Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length);
  const headers = sheet.getRange(headerRow, 1, 1, width).getValues()[0];
  const normalizedHeaders = headers.map(normalizeHeader);

  REQUIRED_HEADERS.forEach(header => {
    const normalized = normalizeHeader(header);
    if (normalizedHeaders.indexOf(normalized) === -1 && !hasAliasForRequired(normalizedHeaders, normalized)) {
      headers.push(header);
      normalizedHeaders.push(normalized);
    }
  });

  sheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);

  const index = {};
  normalizedHeaders.forEach((header, i) => {
    if (header) index[header] = i + 1;
  });
  return { sheet, headerRow, headers, index };
}

function hasAliasForRequired(normalizedHeaders, required) {
  if (required === "nutricion010") return normalizedHeaders.indexOf("nutricion") !== -1 || normalizedHeaders.indexOf("nutricion110") !== -1;
  if (required === "deportedias") return normalizedHeaders.indexOf("deporte") !== -1;
  if (required === "emocional") return normalizedHeaders.indexOf("emocional010") !== -1;
  if (required === "gvisceral") return normalizedHeaders.indexOf("visceral") !== -1 || normalizedHeaders.indexOf("grasavisceral") !== -1;
  if (required === "caloriasquemadas") return normalizedHeaders.indexOf("calquemadas") !== -1 || normalizedHeaders.indexOf("caloriasgarmin") !== -1;
  if (required === "kmsemana") return normalizedHeaders.indexOf("kilometrossemana") !== -1 || normalizedHeaders.indexOf("kms") !== -1 || normalizedHeaders.indexOf("km") !== -1;
  return false;
}

function getRows() {
  const info = getSheetInfo();
  const lastRow = info.sheet.getLastRow();
  if (lastRow <= info.headerRow) return [];
  const values = info.sheet.getRange(info.headerRow + 1, 1, lastRow - info.headerRow, info.headers.length).getValues();

  return values
    .filter(row => row.some(value => value !== "" && value !== null))
    .map(row => rowToObject(row, info.index))
    .filter(row => row.fecha && row.peso !== null);
}

function rowToObject(row, index) {
  return {
    fecha: formatDate(getValue(row, index, "fecha")),
    peso: number(getValue(row, index, "peso")),
    imc: number(getValue(row, index, "imc")),
    musculo: number(getValue(row, index, "musculo")),
    grasa: number(getValue(row, index, "grasa")),
    visceral: number(getValue(row, index, "visceral")),
    calorias: number(getValue(row, index, "calorias")),
    caloriasQuemadas: number(getValue(row, index, "caloriasQuemadas")),
    nutricion: boundedNumber(getValue(row, index, "nutricion"), 0, 10),
    deporte: boundedNumber(getValue(row, index, "deporte"), 0, 7),
    emocional: emotionalValue(getValue(row, index, "emocional")),
    kmSemana: number(getValue(row, index, "kmSemana"))
  };
}

function upsertMeasurement(params) {
  const info = getSheetInfo();
  const fecha = formatDate(params.fecha);
  if (!fecha || params.peso === undefined || params.peso === "") {
    throw new Error("Fecha y peso son obligatorios");
  }

  const existingRow = findDateRow(info, fecha);
  const targetRow = existingRow || info.sheet.getLastRow() + 1;
  const row = existingRow
    ? info.sheet.getRange(targetRow, 1, 1, info.headers.length).getValues()[0]
    : new Array(info.headers.length).fill("");

  setValue(row, info.index, "fecha", localDate(fecha));
  setValue(row, info.index, "peso", number(params.peso));
  setValue(row, info.index, "imc", number(params.imc));
  setValue(row, info.index, "musculo", number(params.musculo));
  setValue(row, info.index, "grasa", number(params.grasa));
  setValue(row, info.index, "visceral", number(params.visceral));
  setValue(row, info.index, "calorias", number(params.calorias));
  setValue(row, info.index, "caloriasQuemadas", number(params.caloriasQuemadas));
  setValue(row, info.index, "nutricion", boundedNumber(params.nutricion, 0, 10));
  setValue(row, info.index, "deporte", boundedNumber(params.deporte, 0, 7));
  setValue(row, info.index, "emocional", boundedNumber(params.emocional, 0, 10));
  setValue(row, info.index, "kmSemana", number(params.kmSemana));

  info.sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  sortDataByDate(info);
  return { ok: true, updatedAt: new Date().toISOString(), data: getRows() };
}

function findDateRow(info, fecha) {
  const dateColumn = findColumn(info.index, "fecha");
  const lastRow = info.sheet.getLastRow();
  if (!dateColumn || lastRow <= info.headerRow) return null;
  const values = info.sheet.getRange(info.headerRow + 1, dateColumn, lastRow - info.headerRow, 1).getValues();
  const offset = values.findIndex(row => formatDate(row[0]) === fecha);
  return offset === -1 ? null : info.headerRow + 1 + offset;
}

function sortDataByDate(info) {
  const lastRow = info.sheet.getLastRow();
  const dateColumn = findColumn(info.index, "fecha");
  if (lastRow <= info.headerRow + 1 || !dateColumn) return;
  info.sheet
    .getRange(info.headerRow + 1, 1, lastRow - info.headerRow, info.headers.length)
    .sort({ column: dateColumn, ascending: true });
}

function getValue(row, index, field) {
  const col = findColumn(index, field);
  return col ? row[col - 1] : null;
}

function setValue(row, index, field, value) {
  const col = findColumn(index, field);
  if (col) row[col - 1] = value === null ? "" : value;
}

function findColumn(index, field) {
  const aliases = FIELD_ALIASES[field] || [field];
  for (let i = 0; i < aliases.length; i++) {
    if (index[aliases[i]]) return index[aliases[i]];
  }
  return null;
}

function normalizeHeader(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return "";
}

function localDate(isoDate) {
  const parts = String(isoDate).split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function number(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(",", "."));
  return isNaN(parsed) ? null : parsed;
}

function boundedNumber(value, min, max) {
  const parsed = number(value);
  if (parsed === null) return null;
  return Math.min(max, Math.max(min, parsed));
}

function emotionalValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = number(value);
  if (parsed !== null) return Math.min(10, Math.max(0, parsed));
  const normalized = String(value).trim().toLowerCase();
  if (["bien", "bueno", "good"].indexOf(normalized) !== -1) return 8;
  if (["regular", "medio", "ok"].indexOf(normalized) !== -1) return 5;
  if (["mal", "malo", "bad"].indexOf(normalized) !== -1) return 2;
  return null;
}
