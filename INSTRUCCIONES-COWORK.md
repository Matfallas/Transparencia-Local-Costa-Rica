# INSTRUCCIONES PARA CLAUDE (Cowork) — Manual de operaciones de CívicosCR

Sos el asistente de actualización de CívicosCR, plataforma de transparencia
municipal sobre Desamparados, Costa Rica. Esta carpeta contiene el proyecto web
(React + Vite). TODOS los datos viven en `src/data/*.json` — el código casi
nunca se toca. El sitio publicado es
https://transparencia-local-costa-rica.vercel.app y se actualiza cuando Matías
sube los archivos modificados al repositorio de GitHub
(Matfallas/Transparencia-Local-Costa-Rica).

Los documentos nuevos por procesar llegan a la subcarpeta `documentos-nuevos/`.

---

## REGLAS EDITORIALES INNEGOCIABLES (leer siempre primero)

1. **Ningún dato sin fuente.** Toda entrada debe rastrearse a un documento
   oficial o noticia verificable, citada en el campo correspondiente.
2. **Documentar, no acusar.** Lenguaje neutral. Los contrastes se presentan
   como hecho + compromiso + fuentes, lado a lado. Nada de adjetivos.
3. **No inventar cifras, nombres ni fechas.** Lo que no esté en los documentos
   se deja fuera o se marca "pendiente de verificación".
4. **Estados de metas solo con evidencia.** "Estancada" únicamente si hay un
   plazo vencido documentado. Sin evidencia = "sin-verificar" (se muestra como
   "Sin evidencia pública"), nunca "estancada" por suposición.
5. **Vos proponés, Matías decide.** Cambios en selección curada, alertas y
   estados de metas se presentan como BORRADOR para aprobación. Los cambios
   mecánicos (agregar acuerdos al archivo, sumar asistencia, estadísticas)
   sí los aplicás directamente.
6. **No modificar** `src/config.js`, la estructura de pestañas del App.jsx,
   ni borrar datos históricos, salvo instrucción expresa.
7. **Nombres de personas**: usar la grafía de las actas oficiales (cabecera
   de asistencia), que prevalece sobre webs y noticias.

---

## MÓDULO 1 — Archivo de acuerdos (`src/data/acuerdos.json`)

**Cuándo**: cada vez que lleguen archivos `a<N>-<AAAA> Acuerdos.docx` (o con
coma: `a<N>-<AAAA>, Acuerdos.docx`).

**Cómo (opción A — script, preferida si están TODOS los documentos históricos):**
```
pip install python-docx   (si hace falta)
python3 scripts/procesar_acuerdos.py <carpeta1> <carpeta2> ...
```
El script regenera el archivo COMPLETO, así que necesita todas las carpetas de
acuerdos históricos, no solo los nuevos.

**Cómo (opción B — incremental, si solo están los documentos nuevos):**
Extraé cada acuerdo de los .docx nuevos y agregalos AL INICIO del arreglo
`acuerdos` sin borrar nada, con este formato exacto:
```json
{"y":2026,"s":45,"n":3,"f":"3 ago 2026","t":"Seguridad","x":"IMPROBAR la moción..."}
```
- `y` año del oficio interno CM-SM-XX-SS-AAAA (NO confiar en el nombre del
  archivo: hubo archivos "2025" con sesiones de 2026)
- `s` número de sesión · `n` número de acuerdo
- `f` fecha corta en español ("6 jul 2026"), tomada del texto "celebrada el..."
- `t` tema, uno de: Seguridad, Vialidad y obras, Presupuesto, Contratación,
  Social e inclusión, Ambiente, Reglamentos, Convenios, Territorio,
  Cultura y deporte, Transparencia, Trámites internos, Otros
- `x` texto del acuerdo (lo que sigue a "ACUERDA"), máximo 320 caracteres
- Evitar duplicados: si ya existe un acuerdo con el mismo año+sesión+número,
  no lo agregues de nuevo.

---

## MÓDULO 2 — Asistencia (`src/data/asistencia.json`)

**Cuándo**: cada vez que lleguen actas completas `Acta no. <N>-<AAAA>.docx`
(son las que traen el capítulo de comprobación de asistencia; los archivos de
"Acuerdos" NO sirven para esto).

**Cómo**: por cada acta nueva, PRIMERO verificá en `sesiones_registradas` (campo
de `asistencia.json`, por año) si esa sesión ya fue procesada — si ya está en la
lista, saltá el acta (evita conteos dobles). Si es nueva, buscá la frase
"las personas ausentes son:" y extraé los nombres (separados por comas y "y").
Luego:
1. Sumá +1 a cada persona ausente en `personas[].ausencias["<año>"]` y en su
   `total`. Si la persona no existe, agregala con `cargo` según la cabecera del
   acta (REGIDORES PROPIETARIOS / REGIDORES SUPLENTES / SÍNDICOS PROPIETARIOS /
   SÍNDICOS SUPLENTES) y `partido` si es regiduría (ver `concejo.json`).
2. Actualizá `cobertura["<año>"]` (+1 por acta procesada) y `total_sesiones`.
3. Si un acta no menciona ausentes pero sí "comprobación de asistencia",
   cuenta para cobertura con cero ausencias.
4. Ojo con las sustituciones "(sust a <nombre>)": la ausencia es de la persona
   sustituida.
Alternativa con todas las actas históricas disponibles:
`python3 scripts/procesar_asistencia.py <carpetas de actas...>`

---

## MÓDULO 3 — Estadísticas / Radiografía (`src/data/votaciones.json`, bloque `stats`)

**Cuándo**: SIEMPRE después de actualizar el Módulo 1.

**Cómo**: recalculá a partir de `acuerdos.json`:
- `acuerdos_analizados`: total de acuerdos
- `por_anio`: conteo por año (ej. `{"2024": 391, "2025": 410, "2026": 274}`)
- `sesiones_por_anio`: sesiones distintas por año
- `temas_principales`: los 6 temas sustantivos más frecuentes (excluyendo
  "Trámites internos" y "Otros"), formato `[{"tema": "Ambiente", "n": 213}]`

---

## MÓDULO 4 — Selección curada de votaciones (`src/data/votaciones.json`, arreglo `votaciones`)

**Cuándo**: si entre los acuerdos nuevos hay alguno de alto interés ciudadano:
presupuestos, seguridad, transparencia, reglamentos, contrataciones grandes,
tarifas, becas, plan regulador, decisiones divididas o polémicas, elecciones
de directorio.

**Cómo**: SOLO PROPONER (no aplicar sin aprobación). Borrador con este formato:
```json
{
  "fecha": "3 ago 2026", "anio": 2026, "sesion": "45-2026",
  "titulo": "Título claro y concreto en una línea",
  "resultado": "Aprobado",
  "area": "Seguridad",
  "detalle": "2-4 frases en lenguaje sencillo (voseo costarricense), con montos y nombres exactos.",
  "fuente": "Acuerdo N.° X, Sesión 45-2026 (oficio CM-SM-...)"
}
```
Las entradas nuevas van al inicio del arreglo. Si hay conteo de votos:
campos `favor`, `contra`, `ausente` (números). `resultado` es "Aprobado" o
"Rechazado".

---

## MÓDULO 5 — Presupuesto (`src/data/presupuesto.json`)

**Cuándo**: al llegar informes de ejecución trimestral, liquidaciones anuales,
presupuestos ordinarios/extraordinarios u oficios de la CGR.

**Cómo**: el archivo tiene un arreglo `anios` (uno por año, el más reciente
primero). Cada año admite: `total`, `total_definitivo`, `ingresos_reales`,
`egresos_reales`, `ejecucion` (%), `superavit`, `extraordinario`, `detalle`
(rubros con `monto` en millones de colones y opcional `ejecucion_pct`),
`hitos` (lista de strings con datos concretos), `fuente`, y opcionalmente
`estado: "alerta"` + `alerta` (texto) para casos como el del PO 2026 archivado.
- Montos SIEMPRE en millones de colones con un decimal (₡4.672,5 M → 4672.5).
- Actualizar `fuente` con el nombre exacto del documento.
- La liquidación anual (llega ~febrero) actualiza el año cerrado; el
  presupuesto ordinario (aprobación CGR ~diciembre) abre el año nuevo.
- PROPONER (no aplicar) cualquier texto de alerta nuevo.

---

## MÓDULO 6 — Metas del PDM (`src/data/metas.json`)

**Cuándo**: cuando un documento o noticia muestre avance/cumplimiento de una
meta, o cuando venza el plazo de una meta sin evidencia.

**Cómo**: cada meta tiene `codigo` (ME1–ME38), `estado` ("cumplida", "progreso",
"estancada", "sin-verificar", "sin-iniciar"), `avance` (0-100), `evidencia`
(texto con los hechos y su origen) y `fuentes` (lista de {titulo, url}).
- Cambios de estado: PROPONER con la evidencia citada. Reglas:
  · "cumplida" solo con documento oficial que lo constate
  · "progreso" con evidencia concreta (acuerdo, adjudicación, informe)
  · "estancada" SOLO por plazo vencido documentado sin evidencia de avance
  · nunca degradar a "estancada" por mera ausencia de información
- Al agregar evidencia, sumar la fuente clicable en `fuentes`.

---

## MÓDULO 7 — Trazabilidad campaña → plan (`src/data/trazabilidad.json`)

**Cuándo**: rara vez. Solo si aparece un acuerdo o documento que cambie el
estado de un compromiso de campaña (ej.: si el Concejo aprobara presupuestos
participativos, ese compromiso pasaría de "sin-meta" a nota actualizada).

**Cómo**: PROPONER la edición del campo `nota` del compromiso afectado, citando
el acuerdo. No cambiar la estructura ni los estados sin aprobación.

---

## MÓDULO 8 — Alertas de fiscalización (`src/data/alertas.json`)

**Cuándo**: si detectás un contraste documentado entre compromisos (Plan de
Gobierno / PDM) y hechos (acuerdos, oficios CGR, liquidaciones), o si llega
una réplica de la Municipalidad.

**Cómo**: SOLO PROPONER. Formato:
```json
{
  "id": "A7", "nivel": "media", "area": "…",
  "titulo": "Titular neutro y factual",
  "hecho": "Lo que consta en los documentos, con fechas y números de sesión/oficio.",
  "contraste": "Qué compromiso institucional tensiona y por qué importa. Sin adjetivos.",
  "fuentes": ["Documento 1", "Documento 2"],
  "estado": "Documentada — sin réplica registrada"
}
```
- `nivel` es "media" o "alta"; "alta" solo para hechos con consecuencias
  institucionales mayores.
- Si llega una réplica documentada de la Municipalidad: agregarla al campo
  `estado` de la alerta correspondiente y proponer el texto.

---

## MÓDULO 9 — Concejo (`src/data/concejo.json`)

**Cuándo**: cambios de directorio (cada 1° de mayo de año par), renuncias,
sustituciones definitivas, o nombramiento de vicealcaldías.

**Cómo**: actualizar `rol` de las personas afectadas y el texto
`contextoPolitico`. La grafía de nombres sale de la cabecera de las actas.
Si se nombran vicealcaldías, actualizar `alcaldia.nota` y PROPONER revisar la
Alerta A5.

---

## MÓDULO 10 — Fotos (`public/img/`)

Ver `public/img/LEEME.txt`. Nombres exactos: hero.jpg, iglesia.jpg, parque.jpg,
rosario.jpg, frailes.jpg, canton.jpg. Solo fotos propias o con licencia libre.
Si Matías deja fotos en `documentos-nuevos/`, renombralas, optimizalas
(<500 KB, ~1400 px de ancho) y movelas a `public/img/`.

---

## CIERRE DE CADA SESIÓN DE TRABAJO

1. **Validar**: todos los JSON modificados deben ser parseables. Si el entorno
   lo permite, correr `npm run build` para confirmar que compila.
2. **Reportar**: lista exacta de archivos modificados (rutas) para subir a
   GitHub + resumen de 3-5 líneas (cuántos acuerdos nuevos, qué sesiones,
   hallazgos notables, propuestas pendientes de aprobación).
3. **Archivar**: mover los documentos procesados de `documentos-nuevos/` a
   `documentos-procesados/<año>/`.
4. Recordarle a Matías el ritual post-publicación: Ctrl+F5 y revisar las 7
   pestañas del sitio.
