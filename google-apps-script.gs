// Si pegas este script desde Extensiones > Apps Script dentro de tu Google Sheet,
// puedes dejar SHEET_ID vacío y cogerá automáticamente ese archivo.
const SHEET_ID = "";

// Déjalo vacío para usar la primera pestaña de la Sheet.
const SHEET_NAME = "";

function doGet(e) {
  const callback = e.parameter.callback;
  const payload = {
    updatedAt: new Date().toISOString(),
    data: getRows()
  };
  const body = callback
    ? `${callback}(${JSON.stringify(payload)})`
    : JSON.stringify(payload);

  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function getRows() {
  const spreadsheet = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SHEET_NAME
    ? spreadsheet.getSheetByName(SHEET_NAME)
    : spreadsheet.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(normalizeHeader);

  return values
    .filter(row => row.some(value => value !== "" && value !== null))
    .map(row => {
      const item = {};
      headers.forEach((header, index) => item[header] = row[index]);
      return {
        fecha: formatDate(item.fecha),
        peso: number(item.peso),
        imc: number(item.imc),
        musculo: number(item.musculo),
        grasa: number(item.grasa),
        visceral: number(item.visceral || item.gvisceral || item.grasavisceral),
        calorias: number(item.calorias)
      };
    })
    .filter(row => row.fecha && row.peso !== null);
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
