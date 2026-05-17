// Si pegas este script desde Extensiones > Apps Script dentro de tu Google Sheet,
// puedes dejar SHEET_ID vacio y cogera automaticamente ese archivo.
const SHEET_ID = "";

// Dejalo vacio para usar la primera pestana de la Sheet.
const SHEET_NAME = "";

const REQUIRED_HEADERS = [
  "Fecha",
  "Peso",
  "IMC",
  "Musculo",
  "Grasa",
  "G.Visceral",
  "Calorías",
  "Nutrición (1-10)",
  "Deporte (días)",
  "Emocional (0-10)"
];

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

  const headers = sheet.getRange(headerRowIndex + 1, 1, 1, Math.max(sheet.getLastColumn(), REQUIRED_HEADERS.length)).getValues()[0];
  const normalizedHeaders = headers.map(normalizeHeader);
  REQUIRED_HEADERS.forEach(header => {
    if (normalizedHeaders.indexOf(normalizeHeader(header)) === -1) {
      headers.push(header);
      normalizedHeaders.push(normalizeHeader(header));
    }
  });
  sheet.getRange(headerRowIndex + 1, 1, 1, headers.length).setValues([headers]);

  const index = {};
  normalizedHeaders.forEach((header, i) => index[header] = i + 1);
  return { sheet, headerRow: headerRowIndex + 1, headers, index };
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
    fecha: formatDate(row[valueIndex(index, "fecha")]),
    peso: number(row[valueIndex(index, "peso")]),
    imc: number(row[valueIndex(index, "imc")]),
    musculo: number(row[valueIndex(index, "musculo")]),
    grasa: number(row[valueIndex(index, "grasa")]),
    visceral: number(firstValue(row[valueIndex(index, "visceral")], row[valueIndex(index, "gvisceral")], row[valueIndex(index, "grasavisceral")])),
    calorias: number(row[valueIndex(index, "calorias")]),
    nutricion: boundedNumber(firstValue(row[valueIndex(index, "nutricion")], row[valueIndex(index, "nutricion110")]), 0, 10),
    deporte: boundedNumber(firstValue(row[valueIndex(index, "deporte")], row[valueIndex(index, "deportedias")]), 0, 7),
    emocional: emotionalValue(firstValue(row[valueIndex(index, "emocional")], row[valueIndex(index, "emocional010")]))
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
  const row = new Array(info.headers.length).fill("");
  setCell(row, info.index, "fecha", new Date(`${fecha}T00:00:00`));
  setCell(row, info.index, "peso", number(params.peso));
  setCell(row, info.index, "imc", number(params.imc));
  setCell(row, info.index, "musculo", number(params.musculo));
  setCell(row, info.index, "grasa", number(params.grasa));
  setCell(row, info.index, "gvisceral", number(params.visceral));
  setCell(row, info.index, "calorias", number(params.calorias));
  setCell(row, info.index, "nutricion110", boundedNumber(params.nutricion, 0, 10));
  setCell(row, info.index, "deportedias", boundedNumber(params.deporte, 0, 7));
  setCell(row, info.index, "emocional010", boundedNumber(params.emocional, 0, 10));

  info.sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  sortDataByDate(info);
  return { ok: true, updatedAt: new Date().toISOString(), data: getRows() };
}

function findDateRow(info, fecha) {
  const dateColumn = info.index.fecha;
  const lastRow = info.sheet.getLastRow();
  if (!dateColumn || lastRow <= info.headerRow) return null;
  const values = info.sheet.getRange(info.headerRow + 1, dateColumn, lastRow - info.headerRow, 1).getValues();
  const offset = values.findIndex(row => formatDate(row[0]) === fecha);
  return offset === -1 ? null : info.headerRow + 1 + offset;
}

function sortDataByDate(info) {
  const lastRow = info.sheet.getLastRow();
  if (lastRow <= info.headerRow + 1 || !info.index.fecha) return;
  info.sheet
    .getRange(info.headerRow + 1, 1, lastRow - info.headerRow, info.headers.length)
    .sort({ column: info.index.fecha, ascending: true });
}

function setCell(row, index, key, value) {
  const col = index[key];
  if (col) row[col - 1] = value === null ? "" : value;
}

function valueIndex(index, key) {
  const col = index[key];
  return col ? col - 1 : -1;
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
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return "";
}

function number(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(",", "."));
  return isNaN(parsed) ? null : parsed;
}

function firstValue() {
  for (let i = 0; i < arguments.length; i++) {
    const value = arguments[i];
    if (value !== "" && value !== null && value !== undefined) return value;
  }
  return null;
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
