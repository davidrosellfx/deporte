# Vuelta a mi mejor version

Web estatica para GitHub Pages con seguimiento visual de peso, composicion corporal y contexto semanal sincronizado con Google Sheets.

## Que muestra

La pagina sigue una jerarquia editorial: primero progreso y tendencia, despues interpretacion y al final detalle e historial.

- **Cabecera**: ultimo peso, fecha y dias desde la ultima medicion (aviso si pasan mas de 10), objetivo editable, progreso desde el pico y ritmo estimado.
- **Estado actual**: peso, grasa, musculo, grasa visceral, IMC y calorias con cambio frente a la medicion anterior y mini tendencia de las 12 ultimas.
- **01 Progreso acumulado**: dato actual frente al primer registro y frente al peor pico de peso.
- **02 Tendencia**: graficas independientes (Chart.js) de peso con linea de objetivo, grasa, musculo y grasa visceral. Puntos = lecturas; linea = media de 3 mediciones para filtrar el ruido de la bioimpedancia.
- **03 Que dice el dato**: que mejora, que se estanca, que habitos acompanan a las mejores semanas y siguiente foco razonable, junto con el resumen de la ultima medicion.
- **04 Habitos y actividad**: nutricion, deporte y emocional con su minimo; calorias quemadas, km y ritmo de peso coloreados segun si esa semana bajo o subio el peso. Tabla que compara el ritmo tipico (mediana, kg/semana) entre semanas altas y bajas de cada habito.
- **05 Mes a mes**: desplegable con medias del mes, comparacion con el mes anterior y lectura prudente.
- **06 Marcas**: mejor, peor, ultimo y distancia a la mejor marca.
- **07 Historial**: tabla completa con boton **Editar** por fila.

El formulario de medicion se abre en un panel desde **Nueva medicion** o desde **Editar**.

Si no hay conexion con el Apps Script, la web muestra una copia de respaldo de los datos (incluida en `app.js`) y lo indica con un aviso.

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
