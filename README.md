# Vuelta a mi mejor version

Web estática para GitHub Pages con seguimiento visual de peso y composición corporal sincronizado con Google Sheets.

## Cómo conectarlo a tu Google Sheet

1. Abre tu Google Sheet.
2. Ve a **Extensiones > Apps Script**.
3. Pega el contenido de `google-apps-script.gs`.
4. Déjalo tal cual si lo estás pegando desde esa misma Sheet.
5. Despliega como **Web app**.
6. En permisos, usa:
   - Ejecutar como: **tú**
   - Quién tiene acceso: **cualquiera con el enlace**
7. Copia la URL del Web App.
8. Pégala en la web o en `config.js`.

Solo necesitas poner `SHEET_ID` manualmente si creas el Apps Script fuera de la Sheet. En ese caso, si la URL es `https://docs.google.com/spreadsheets/d/ABC123/edit`, el ID es `ABC123`.

## Columnas esperadas

La primera fila debe tener estos encabezados, con o sin acentos:

`Fecha`, `Peso`, `IMC`, `Musculo`, `Grasa`, `G.Visceral`, `Calorías`

Opcionalmente puedes añadir estas columnas de contexto semanal:

`Nutricion (1-10)`, `Deporte (dias)`, `Emocional (0-10)`

`Nutricion (1-10)` mide calidad de dieta de 0 a 10. `Deporte (dias)` mide entrenamientos de 0 a 7. `Emocional (0-10)` mide estado emocional, donde 10 es muy bien y 0 es muy mal.

## Subir a GitHub Pages

Sube `index.html`, `styles.css`, `app.js`, `config.js` y `google-apps-script.gs` al repositorio. Después activa GitHub Pages desde la rama principal.
