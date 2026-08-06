# Vuelta a mi mejor version

Web estatica para GitHub Pages con seguimiento visual de peso, composicion corporal y contexto semanal sincronizado con Google Sheets.

## Que muestra

- Estado actual con ultimo peso, objetivo editable y diferencia.
- Lectura de la ultima medicion con cambios de peso, grasa, musculo y grasa visceral.
- Tendencias por 4 semanas, 8 semanas o todo el historial.
- Graficas separadas de peso, grasa, musculo, grasa visceral, contexto y actividad semanal.
- Analisis de contexto por meses desde que hay datos de nutricion, deporte y emocional.
- Historial completo con boton **Editar** para corregir una fila desde la propia web.

## Columnas esperadas en Google Sheets

La hoja debe tener estos encabezados:

`Fecha`, `Peso`, `IMC`, `Musculo`, `Grasa`, `G.Visceral`, `Calorias`, `Calorias quemadas`, `Nutricion (0-10)`, `Deporte (dias)`, `Emocional`, `Km semana`

Notas:

- `Calorias` es la estimacion de calorias necesarias.
- `Calorias quemadas` es la media semanal segun Garmin.
- `Nutricion (0-10)` mide cumplimiento nutricional.
- `Deporte (dias)` va de 0 a 7.
- `Emocional` va de 0 a 10.
- `Km semana` mide la carga total de movimiento semanal.

## Conectar con Google Sheets

1. Abre tu Google Sheet.
2. Ve a **Extensiones > Apps Script**.
3. Pega el contenido de `google-apps-script.gs`.
4. Despliega como **Web app**.
5. Usa:
   - Ejecutar como: **tu**
   - Quien tiene acceso: **cualquiera con el enlace**
6. Copia la URL del Web App.
7. Pegala en `config.js` como `sheetApiUrl`.

Solo necesitas poner `SHEET_ID` manualmente si creas el Apps Script fuera de la Sheet.

## Editar datos

En el historial, pulsa **Editar** en la fila que quieras corregir. La web rellena el formulario con esa medicion y al guardar actualiza la fila con la misma fecha.

Si introduces una fecha nueva, se anade una fila nueva y el script ordena la hoja por fecha.

## Subir a GitHub Pages

Sube estos archivos al repositorio:

`index.html`, `styles.css`, `app.js`, `config.js`, `google-apps-script.gs`, `README.md`

Despues activa GitHub Pages desde la rama principal.
