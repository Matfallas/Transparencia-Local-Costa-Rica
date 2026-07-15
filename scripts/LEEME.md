# Scripts de procesamiento de CívicosCR

Estos scripts regeneran los datos de la plataforma a partir de los documentos
oficiales descargados del portal de transparencia municipal. Se pueden correr
a mano (requieren Python 3 + `pip install python-docx`) o pedirle a Claude
(Cowork/Despacho) que los ejecute sobre una carpeta de documentos nuevos.

## procesar_acuerdos.py
Lee todos los archivos `a*-AAAA Acuerdos.docx` de una carpeta y regenera
`src/data/acuerdos.json` (archivo completo de acuerdos: año, sesión, número,
fecha, tema y texto resumido).

    python3 scripts/procesar_acuerdos.py /ruta/a/carpeta-de-acuerdos

## procesar_asistencia.py
Lee todas las actas completas `Acta no. N-AAAA.docx` de una o más carpetas y
regenera `src/data/asistencia.json` (ausencias registradas por persona y año,
cruzadas con la integración del Concejo definida en `src/data/concejo.json`).

    python3 scripts/procesar_asistencia.py /ruta/a/actas [/otra/ruta ...]

## Flujo de actualización recomendado
1. Descargar del portal municipal las actas y acuerdos nuevos.
2. Correr ambos scripts (o pedírselo a Claude con los documentos en una carpeta).
3. Revisar los cambios en `src/data/*.json`.
4. Si hay acuerdos de alto interés ciudadano, agregarlos a mano a la selección
   curada en `src/data/votaciones.json` (con fecha, título claro y fuente).
5. Subir la carpeta `src` actualizada a GitHub → Vercel republica solo.

Regla de oro: ningún dato sin fuente. Toda entrada nueva debe poder rastrearse
a un documento oficial o una noticia verificable.
