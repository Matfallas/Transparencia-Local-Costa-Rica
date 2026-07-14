# CívicosCR — Plan Piloto Desamparados 🇨🇷

Plataforma cívica que traduce los datos de la Municipalidad de Desamparados a un
lenguaje claro para jóvenes (15–25): quiénes deciden, qué metas tiene el plan
municipal, en qué se gasta el presupuesto y qué se vota en el Concejo.

Iniciativa para el **Change Agents Programme (Friedrich-Ebert-Stiftung)**.

---

## 🚀 Cómo ponerlo en línea (una sola vez, ~20 minutos)

### Paso 1 — Subir el código a GitHub
1. Creá una cuenta gratuita en [github.com](https://github.com) si no tenés.
2. Botón **New repository** → nombre: `civicoscr` → **Public** → Create.
3. En la página del repo, usá **uploading an existing file** y arrastrá TODO el
   contenido de esta carpeta (menos `node_modules` y `dist`, si existieran).
4. **Commit changes**.

> 💡 Bonus de transparencia: al ser un repo público, cualquier persona puede ver
> el historial de cambios de los datos — quién actualizó qué y cuándo. Eso es
> coherencia entre el medio y el mensaje de CívicosCR.

### Paso 2 — Desplegar en Vercel
1. Creá una cuenta gratuita en [vercel.com](https://vercel.com) usando
   **Continue with GitHub**.
2. **Add New → Project** → importá el repositorio `civicoscr`.
3. Vercel detecta Vite automáticamente. No cambiés nada. **Deploy**.
4. En ~1 minuto tendrás tu URL pública: `https://civicoscr.vercel.app`
   (o similar). Podés conectar un dominio propio después en Settings → Domains.

A partir de aquí, **cada cambio que hagás en GitHub se publica solo** en ~1 min.

---

## ✏️ Cómo actualizar los datos (cada vez que haga falta)

Todos los datos viven en `src/data/` como archivos JSON editables. **No hace
falta tocar el código.** Para editar desde el navegador: abrí el archivo en
GitHub → ícono del lápiz ✏️ → editá → **Commit changes** → el sitio se actualiza
solo.

| Archivo | Qué contiene | Cuándo actualizarlo |
|---|---|---|
| `concejo.json` | Regidores, suplentes, alcaldía, partidos, contexto político | Cambios de directorio (cada 1.º de mayo par), renuncias, sustituciones |
| `metas.json` | Las 18 metas del Plan de Desarrollo Municipal con su estado | Cuando haya evidencia de avance o cumplimiento (informes, noticias, aportes verificados) |
| `votaciones.json` | Acuerdos del Concejo en lenguaje claro | Después de revisar actas (sesiones: lunes 6 p.m.; actas en el portal de transparencia) |
| `presupuesto.json` | Presupuesto por rubro en millones de colones | Al aprobarse el presupuesto (set–oct) y con cada informe de ejecución trimestral |

### Cómo actualizar el estado de una meta
En `metas.json`, cada meta tiene:
```json
{
  "codigo": "ME15",
  "texto": "Realizar cada año una feria de ambiente, agua y salud en el cantón",
  "estado": "sin-verificar",   ← cambiá a: "cumplida" | "progreso" | "estancada" | "sin-iniciar"
  "avance": 0,                 ← porcentaje 0–100
  "evidencia": "..."           ← agregá SIEMPRE la fuente: enlace al informe, acta o noticia
}
```
**Regla de oro:** ningún cambio de estado sin evidencia citada. Esa disciplina
es la credibilidad del proyecto.

### Cómo activar el módulo de presupuesto
1. Descargá el PDF del presupuesto desde
   [transparencia.desamparados.go.cr](https://transparencia.desamparados.go.cr/rendicion-de-cuentas/presupuesto)
   (pestaña del año vigente).
2. Extraé los montos por programa o rubro.
3. En `presupuesto.json`, cambiá `"estado": "pendiente"` por `"estado": "activo"`
   y completá:
```json
{
  "estado": "activo",
  "anio": 2026,
  "total": 00000,
  "ejecucion": null,
  "detalle": [
    { "rubro": "Programa I: Administración general", "monto": 0000 },
    { "rubro": "Programa II: Servicios comunales", "monto": 0000 },
    { "rubro": "Programa III: Inversiones", "monto": 0000 }
  ]
}
```
El gráfico aparece automáticamente.

### Cómo agregar una votación
Las actas se publican en el portal de transparencia (Rendición de cuentas →
Actas y acuerdos). Después de leer un acta, agregá al inicio de la lista en
`votaciones.json`:
```json
{
  "fecha": "15 jun 2026",
  "titulo": "Título en lenguaje claro",
  "resultado": "Aprobado",
  "favor": 7, "contra": 4,
  "detalle": "Qué significa para la gente del cantón.",
  "fuente": "Acta de la Sesión XX-2026"
}
```
Los campos `favor`/`contra`/`ausente` son opcionales — si no hay conteo en el
acta, omitilos y la tarjeta se muestra sin la barra de votos.

---

## 🗓 Rutina de actualización sugerida (fase piloto)

- **Semanal (30 min, después del lunes):** revisar el acta u orden del día más
  reciente; si hay un acuerdo relevante para jóvenes, agregarlo a `votaciones.json`.
- **Mensual:** revisar noticias y redes municipales buscando evidencia de
  cumplimiento de metas; actualizar `metas.json`.
- **Trimestral:** revisar informes de ejecución presupuestaria; actualizar
  `presupuesto.json`.
- **Cada 1.º de mayo de año par:** actualizar el directorio del Concejo en
  `concejo.json`.

Con voluntarios: cada quien puede proponer cambios vía *pull request* en GitHub,
y vos (o un comité editorial) los aprobás. Eso ES el sistema de verificación.

---

## 💻 Para programadores (opcional)

```bash
npm install      # instalar dependencias
npm run dev      # servidor local en http://localhost:5173
npm run build    # compilar para producción (carpeta dist/)
```

Stack: React 18 + Vite + Recharts. Sin backend: los datos son JSON estáticos,
lo cual hace el sitio gratuito, rápido y a prueba de fallos.

---

## 📚 Fuentes de datos

- **Concejo Municipal:** sitio oficial — desamparados.go.cr/es/municipalidad/concejo-municipal
- **Metas:** Plan de Desarrollo Municipal 2024–2028 (Acuerdo N.º 6, Sesión 60-2024)
- **Plan de Gobierno 2024–2028:** desamparados.go.cr (sección Concejo Municipal)
- **Actas, presupuesto, informes:** transparencia.desamparados.go.cr
- **Consolidado nacional de presupuestos municipales:** SIPP, Contraloría General de la República
- **Programas de gobierno de todas las candidaturas:** Tribunal Supremo de Elecciones (tse.go.cr)
