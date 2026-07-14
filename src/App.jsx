import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import concejo from "./data/concejo.json";
import metasData from "./data/metas.json";
import votacionesData from "./data/votaciones.json";
import presupuesto from "./data/presupuesto.json";

const C = {
  ink: "#14213D", inkSoft: "#3D4B6B", paper: "#FAFBF7", card: "#FFFFFF",
  line: "#E3E7DD", green: "#2D6A4F", done: "#2D9D78", progress: "#E9B44C",
  stalled: "#C44536", none: "#8B93A7",
};

const ESTADOS = {
  cumplida:      { label: "Cumplida",      color: C.done     },
  progreso:      { label: "En progreso",   color: C.progress },
  estancada:     { label: "Estancada",     color: C.stalled  },
  "sin-iniciar": { label: "Sin iniciar",   color: C.none     },
  "sin-verificar":{ label: "Sin verificar", color: "#5B7DB1" },
};

const PARTIDOS = concejo.partidos;
const fmtM = (n) => "₡" + Number(n).toLocaleString("es-CR") + " M";

const curules = Object.entries(
  concejo.regidores.reduce((acc, r) => { acc[r.partido] = (acc[r.partido]||0)+1; return acc; }, {})
).sort((a,b) => b[1]-a[1]);

const Badge = ({ partido, small }) => {
  const p = PARTIDOS[partido];
  if (!p) return null;
  return (
    <span style={{
      fontSize: small ? 10.5 : 11.5, fontWeight: 800,
      padding: small ? "2px 8px" : "3px 10px", borderRadius: 999,
      background: p.color, color: "#fff", whiteSpace: "nowrap",
      fontFamily: "'Inter',sans-serif",
    }}>{partido}</span>
  );
};

const Real = () => (
  <span style={{
    display:"inline-block", fontSize:11, fontWeight:800, padding:"3px 10px",
    borderRadius:999, background:"#E9F7F1", border:`1.5px solid ${C.done}`,
    color:C.green, marginBottom:10, fontFamily:"'Inter',sans-serif",
  }}>✓ DATOS REALES</span>
);

export default function App() {
  const [tab, setTab]           = useState("quienes");
  const [filtroMeta, setFiltroMeta]   = useState("todas");
  const [filtroPart, setFiltroPart]   = useState("todos");
  const [verSupl, setVerSupl]         = useState(false);
  const [aporteEnviado, setAporteEnviado] = useState(false);
  const [aporteTexto, setAporteTexto] = useState("");
  const [metaExpandida, setMetaExpandida] = useState(null);

  const metas = metasData.metas;
  const metasFiltradas = filtroMeta === "todas" ? metas : metas.filter(m => m.estado === filtroMeta);
  const cumplidas = metas.filter(m => m.estado === "cumplida").length;
  const enProgreso = metas.filter(m => m.estado === "progreso").length;

  const regsFiltrados = filtroPart === "todos" ? concejo.regidores
    : concejo.regidores.filter(r => r.partido === filtroPart);

  const TABS = [
    { id:"quienes",      label:"🏛️ Quiénes deciden" },
    { id:"promesas",     label:"🤝 Metas y promesas" },
    { id:"presupuesto",  label:"💰 Presupuesto" },
    { id:"votaciones",   label:"🗳️ Votaciones" },
    { id:"aporta",       label:"✋ Aportá datos" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.paper, color:C.ink,
                  fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        .disp { font-family:'Archivo','Segoe UI',sans-serif; }
        .cv-tab { border:none; background:transparent; cursor:pointer; transition:opacity .15s; }
        .cv-tab:hover { opacity:.75; }
        .chip { cursor:pointer; transition:transform .12s; }
        .chip:hover { transform:translateY(-1px); }
        .card { transition:box-shadow .18s; }
        .card:hover { box-shadow:0 4px 18px rgba(20,33,61,.09); }
      `}</style>

      {/* HEADER */}
      <header style={{ background:C.ink, color:"#fff", padding:"18px 24px",
                       display:"flex", flexWrap:"wrap", alignItems:"center",
                       justifyContent:"space-between", gap:12 }}>
        <div>
          <div className="disp" style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.5px" }}>
            Cívicos<span style={{ color:C.progress }}>CR</span>
          </div>
          <div style={{ fontSize:12, opacity:.7, marginTop:2 }}>
            Tu municipalidad, en datos que sí se entienden
          </div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, padding:"6px 14px", borderRadius:999,
                      background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.25)" }}>
          🧪 Plan Piloto · Desamparados
        </div>
      </header>

      {/* KPIs */}
      <section style={{ maxWidth:980, margin:"0 auto", padding:"28px 20px 8px" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase",
                      color:C.green, marginBottom:6 }}>
          Administración 2024–2028 · 13 distritos
        </div>
        <h1 className="disp" style={{ fontSize:32, fontWeight:900, margin:"0 0 18px", letterSpacing:"-1px" }}>
          Municipalidad de Desamparados
        </h1>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:12 }}>
          {[
            { v: String(curules.length)+" partidos", l:"Concejo Municipal",        n: concejo.regidores.length+" regidores · dato real" },
            { v: String(metas.length)+" metas",      l:"Plan de Desarrollo 2024–28", n:"PDM aprobado por el Concejo · real" },
            { v: enProgreso+" en progreso",           l:"Metas verificadas",         n:`${cumplidas} cumplidas · verificación en curso` },
            { v: "₡"+presupuesto.ingresos_reales+" M", l:`Ingresos reales ${presupuesto.anio}`,n:`${presupuesto.ejecucion}% ejecución · dato real` },
          ].map(kpi => (
            <div key={kpi.l} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                        borderRadius:12, padding:"16px 18px" }}>
              <div className="disp" style={{ fontSize:22, fontWeight:900 }}>{kpi.v}</div>
              <div style={{ fontSize:12.5, fontWeight:600, marginTop:4 }}>{kpi.l}</div>
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{kpi.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TABS */}
      <nav style={{ maxWidth:980, margin:"22px auto 0", padding:"0 20px",
                    display:"flex", flexWrap:"wrap", gap:2, borderBottom:`2px solid ${C.line}` }}>
        {TABS.map(t => (
          <button key={t.id} className="cv-tab" onClick={() => setTab(t.id)}
            style={{ padding:"11px 13px", fontSize:13.5, fontWeight:600,
                     color: tab===t.id ? C.ink : C.inkSoft,
                     borderBottom: tab===t.id ? `3px solid ${C.progress}` : "3px solid transparent",
                     marginBottom:-2 }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px 60px" }}>

        {/* ── ¿QUIÉNES DECIDEN? ── */}
        {tab==="quienes" && (
          <div>
            <Real />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              El Concejo Municipal es la máxima autoridad del cantón: {concejo.regidores.length} regidores propietarios
              con voz y voto, electos cada 4 años. <strong>{concejo.sesiones}</strong>
            </p>

            {/* Barra composición */}
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                           borderRadius:12, padding:"18px 20px", margin:"16px 0" }}>
              <div className="disp" style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>
                Composición · {concejo.regidores.length} curules, {curules.length} partidos
              </div>
              <div style={{ display:"flex", height:26, borderRadius:8, overflow:"hidden", gap:2 }}>
                {curules.map(([s,n]) => (
                  <div key={s} title={`${PARTIDOS[s].nombre}: ${n}`}
                    style={{ flex:n, background:PARTIDOS[s].color,
                             display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:10.5, fontWeight:800, color:"#fff" }}>{s}{n>1?` · ${n}`:""}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginTop:10 }}>
                {curules.map(([s,n]) => (
                  <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                    <span style={{ width:10, height:10, borderRadius:3, background:PARTIDOS[s].color, display:"inline-block" }}/>
                    <span><strong>{PARTIDOS[s].nombre}</strong> ({n})</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"12px 14px", borderRadius:10,
                            background:"#FFF8E8", border:`1px solid ${C.progress}`,
                            fontSize:13, lineHeight:1.55 }}>
                📌 <strong>Contexto:</strong> {concejo.contextoPolitico}
              </div>
            </div>

            {/* Alcaldesa */}
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                           borderLeft:`5px solid ${PARTIDOS[concejo.alcaldia.partido].color}`,
                                           borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <Badge partido={concejo.alcaldia.partido} />
                <span style={{ fontSize:11, fontWeight:700, color:C.inkSoft, textTransform:"uppercase", letterSpacing:1 }}>
                  {concejo.alcaldia.cargo}
                </span>
              </div>
              <div className="disp" style={{ fontSize:19, fontWeight:900, margin:"6px 0 4px" }}>
                {concejo.alcaldia.nombre}
              </div>
              <div style={{ fontSize:13, color:C.inkSoft, lineHeight:1.5 }}>
                ⚠️ {concejo.alcaldia.nota} Participa en sesiones con voz pero sin voto.
              </div>
            </div>

            {/* Filtro partido */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              {["todos", ...curules.map(([s])=>s)].map(s => (
                <button key={s} className="chip" onClick={() => setFiltroPart(s)}
                  style={{ padding:"5px 13px", borderRadius:999, fontSize:12.5, fontWeight:700,
                           border:`1.5px solid ${s==="todos" ? C.ink : PARTIDOS[s].color}`,
                           background: filtroPart===s ? (s==="todos" ? C.ink : PARTIDOS[s].color) : "transparent",
                           color: filtroPart===s ? "#fff" : (s==="todos" ? C.ink : PARTIDOS[s].color) }}>
                  {s==="todos" ? "Todos" : s}
                </button>
              ))}
            </div>

            {/* Tarjetas regidores */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
              {regsFiltrados.map(r => (
                <div key={r.nombre} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                               borderTop:`4px solid ${PARTIDOS[r.partido].color}`,
                                                               borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"flex-start" }}>
                    <div className="disp" style={{ fontSize:15, fontWeight:700, lineHeight:1.3 }}>{r.nombre}</div>
                    <Badge partido={r.partido} small />
                  </div>
                  <div style={{ fontSize:12, color:C.inkSoft, margin:"6px 0 8px", lineHeight:1.4 }}>{r.rol}</div>
                  <a href={`mailto:${r.email}`} style={{ fontSize:12, color:C.green, fontWeight:600, textDecoration:"none" }}>
                    ✉️ {r.email}
                  </a>
                </div>
              ))}
            </div>

            {/* Suplentes */}
            <button className="chip" onClick={() => setVerSupl(!verSupl)}
              style={{ marginTop:18, padding:"9px 18px", borderRadius:10,
                       border:`1.5px solid ${C.line}`, background:C.card,
                       fontSize:13.5, fontWeight:700, color:C.ink }}>
              {verSupl ? "▲ Ocultar regidurías suplentes" : `▼ Ver regidurías suplentes (${concejo.suplentes.length})`}
            </button>
            {verSupl && (
              <div style={{ marginTop:10, display:"grid",
                            gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:8 }}>
                {concejo.suplentes.map(s => (
                  <div key={s.nombre} style={{ display:"flex", justifyContent:"space-between",
                                               alignItems:"center", gap:8, background:C.card,
                                               border:`1px solid ${C.line}`, borderRadius:10,
                                               padding:"10px 14px", fontSize:13, fontWeight:600 }}>
                    <span>{s.nombre}</span><Badge partido={s.partido} small />
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop:16, fontSize:12, color:C.inkSoft, lineHeight:1.55 }}>
              Las regidurías suplentes tienen voz y votan solo cuando sustituyen a un propietario de su partido.
              También participan 13 síndicos/as distritales (voz, sin voto). Fuente: {concejo.fuente}.
            </div>
          </div>
        )}

        {/* ── METAS ── */}
        {tab==="promesas" && (
          <div>
            <Real />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              Metas estratégicas oficiales del <strong>Plan de Desarrollo Municipal 2024–2028</strong>,
              cada una con su código institucional. Las marcadas "Sin verificar" esperan evidencia ciudadana
              o de los informes de cumplimiento. ¡Ayudanos a actualizarlas en la pestaña "Aportá datos"!
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"14px 0 18px" }}>
              {["todas","sin-verificar","progreso","cumplida","estancada","sin-iniciar"].map(f => (
                <button key={f} className="chip" onClick={() => setFiltroMeta(f)}
                  style={{ padding:"6px 14px", borderRadius:999, fontSize:13, fontWeight:600,
                           border:`1.5px solid ${f==="todas" ? C.ink : ESTADOS[f]?.color||C.ink}`,
                           background: filtroMeta===f ? (f==="todas" ? C.ink : ESTADOS[f].color) : "transparent",
                           color: filtroMeta===f ? "#fff" : (f==="todas" ? C.ink : ESTADOS[f].color) }}>
                  {f==="todas" ? "Todas" : ESTADOS[f].label}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gap:12 }}>
              {metasFiltradas.map((m,i) => {
                const e = ESTADOS[m.estado];
                const expanded = metaExpandida === i;
                return (
                  <div key={i} className="card" onClick={() => setMetaExpandida(expanded ? null : i)}
                    style={{ background:C.card, border:`1px solid ${C.line}`,
                             borderLeft:`5px solid ${e.color}`, borderRadius:12,
                             padding:"16px 20px", cursor:"pointer" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7, alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999,
                                     background:e.color, color:"#fff" }}>{e.label}</span>
                      <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:999,
                                     background:C.paper, border:`1px solid ${C.line}`, color:C.inkSoft }}>{m.area}</span>
                      {m.codigo && (
                        <span style={{ fontFamily:"monospace", fontSize:10.5, fontWeight:700,
                                       padding:"3px 9px", borderRadius:6, background:C.ink,
                                       color:"#fff", letterSpacing:0.5 }}>{m.codigo}</span>
                      )}
                      {m.plazo && (
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999,
                                       background:"#FFF8E8", border:`1px solid ${C.progress}`,
                                       color:"#9A7115" }}>⏱ {m.plazo}</span>
                      )}
                    </div>
                    <div className="disp" style={{ fontSize:16, fontWeight:700, lineHeight:1.35 }}>{m.texto}</div>
                    {m.avance > 0 && (
                      <div style={{ margin:"10px 0 4px", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ flex:1, height:7, borderRadius:999, background:C.line, overflow:"hidden" }}>
                          <div style={{ width:`${m.avance}%`, height:"100%", background:e.color, borderRadius:999 }}/>
                        </div>
                        <span style={{ fontSize:12.5, fontWeight:700, minWidth:34, textAlign:"right" }}>{m.avance}%</span>
                      </div>
                    )}
                    {expanded && (
                      <div style={{ marginTop:10, fontSize:13, color:C.inkSoft, lineHeight:1.5,
                                    borderTop:`1px solid ${C.line}`, paddingTop:10 }}>
                        <strong style={{ color:C.ink }}>Evidencia / pista de verificación:</strong> {m.evidencia}
                      </div>
                    )}
                    <div style={{ marginTop:6, fontSize:11.5, color:C.inkSoft }}>
                      {expanded ? "▲ Ocultar evidencia" : "▼ Ver evidencia y pista de verificación"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:14, fontSize:12, color:C.inkSoft }}>
              Fuente: {metasData.fuente}
            </div>
          </div>
        )}

        {/* ── PRESUPUESTO ── */}
        {tab==="presupuesto" && (
          <div>
            <Real />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              Datos reales de la <strong>Liquidación Presupuestaria {presupuesto.anio}</strong>.
              {presupuesto.nota_aprobacion}.
            </p>

            {/* KPIs presupuesto */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:10, margin:"16px 0" }}>
              {[
                { v: fmtM(presupuesto.total),          l:"Presupuesto inicial",    n:presupuesto.nota_aprobacion?.split(',')[0] },
                { v: fmtM(presupuesto.total_definitivo),l:"Presupuesto definitivo", n:"Incl. extraordinario + modificaciones" },
                { v: fmtM(presupuesto.ingresos_reales), l:"Ingresos reales",        n:"109% de lo presupuestado" },
                { v: presupuesto.ejecucion+"%",         l:"Ejecución global",       n:"Rango aceptable según norma CGR" },
                { v: fmtM(presupuesto.superavit),       l:"Superávit al 31 dic",    n:"Libre + específico" },
              ].map(kpi => (
                <div key={kpi.l} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                            borderRadius:12, padding:"14px 16px" }}>
                  <div className="disp" style={{ fontSize:20, fontWeight:900 }}>{kpi.v}</div>
                  <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>{kpi.l}</div>
                  <div style={{ fontSize:10.5, color:C.inkSoft, marginTop:2 }}>{kpi.n}</div>
                </div>
              ))}
            </div>

            {/* Gráfico por programa */}
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                           borderRadius:12, padding:"20px 12px 10px" }}>
              <div className="disp" style={{ fontSize:15, fontWeight:700, marginLeft:12, marginBottom:14 }}>
                Distribución por programa presupuestario (₡ millones)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={presupuesto.detalle} layout="vertical" margin={{ left:16, right:40 }}>
                  <XAxis type="number" tick={{ fontSize:11, fill:C.inkSoft }}
                         tickFormatter={v => "₡"+v.toLocaleString("es-CR")} />
                  <YAxis type="category" dataKey="rubro" width={200}
                         tick={{ fontSize:11.5, fill:C.ink, fontWeight:600 }} />
                  <Tooltip formatter={(v,n,p) => [fmtM(v)+" ("+p.payload.ejecucion_pct+"% ejecutado)", "Monto inicial"]}
                           cursor={{ fill:"rgba(20,33,61,.04)" }} />
                  <Bar dataKey="monto" radius={[0,6,6,0]}>
                    {presupuesto.detalle.map((_,i) => (
                      <Cell key={i} fill={[C.green, C.ink, "#4A7FB5"][i%3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:"6px 20px", paddingLeft:12 }}>
                {presupuesto.detalle.map((p,i) => (
                  <div key={i} style={{ fontSize:12, color:C.inkSoft }}>
                    <span style={{ fontWeight:700, color:[C.green, C.ink, "#4A7FB5"][i%3] }}>
                      {["Prog. I","Prog. II","Prog. III"][i]}
                    </span>{" "}— {p.ejecucion_pct}% ejecutado · {p.nota}
                  </div>
                ))}
              </div>
            </div>

            {/* Hitos */}
            <div style={{ marginTop:14, padding:"14px 18px", borderRadius:12,
                          background:"#FFF8E8", border:`1px solid ${C.progress}`,
                          fontSize:13.5, lineHeight:1.65 }}>
              <strong>Hitos financieros 2025:</strong>
              <ul style={{ margin:"8px 0 0", paddingLeft:20 }}>
                {presupuesto.hitos.map((h,i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
            <div style={{ marginTop:10, fontSize:12, color:C.inkSoft }}>
              Fuente: {presupuesto.fuente} ·{" "}
              <a href={presupuesto.fuenteOficial} target="_blank" rel="noreferrer"
                 style={{ color:C.green }}>Portal de transparencia municipal →</a>
            </div>
          </div>
        )}

        {/* ── VOTACIONES ── */}
        {tab==="votaciones" && (
          <div>
            <Real />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              Acuerdos reales extraídos de las actas y documentos oficiales del Concejo Municipal.
              {" "}{votacionesData.nota}
            </p>
            <div style={{ display:"grid", gap:14, marginTop:16 }}>
              {votacionesData.votaciones.map((v,i) => {
                const aprobado = v.resultado === "Aprobado";
                const tieneVotos = typeof v.favor === "number";
                return (
                  <div key={i} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                          borderRadius:12, padding:"18px 20px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:8 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.inkSoft }}>{v.fecha}</span>
                        {v.sesion && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6,
                                                    background:C.paper, border:`1px solid ${C.line}`,
                                                    color:C.inkSoft }}>Sesión {v.sesion}</span>}
                        {v.area && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6,
                                                   background:C.paper, border:`1px solid ${C.line}`,
                                                   color:C.inkSoft }}>{v.area}</span>}
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:800, padding:"3px 12px", borderRadius:999,
                                     background: aprobado ? C.done : C.stalled, color:"#fff" }}>
                        {v.resultado}
                      </span>
                    </div>
                    <div className="disp" style={{ fontSize:16, fontWeight:700, margin:"8px 0 6px", lineHeight:1.35 }}>
                      {v.titulo}
                    </div>
                    <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.5 }}>{v.detalle}</div>
                    {tieneVotos && (
                      <>
                        <div style={{ display:"flex", height:10, borderRadius:999, overflow:"hidden", marginTop:12 }}>
                          <div style={{ flex:v.favor, background:C.done }}/>
                          <div style={{ flex:v.contra||0.001, background:C.stalled }}/>
                          {v.ausente>0 && <div style={{ flex:v.ausente, background:C.none }}/>}
                        </div>
                        <div style={{ fontSize:12, color:C.inkSoft, marginTop:6 }}>
                          ✅ {v.favor} a favor · ❌ {v.contra} en contra
                          {v.ausente>0 ? ` · ⚪ ${v.ausente} ausencia` : ""}
                        </div>
                      </>
                    )}
                    {v.fuente && (
                      <div style={{ fontSize:11.5, color:C.inkSoft, marginTop:8, fontStyle:"italic" }}>
                        📄 {v.fuente}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:14, padding:"12px 16px", borderRadius:10,
                          background:C.paper, border:`1px solid ${C.line}`, fontSize:13 }}>
              💡 Las actas completas están en{" "}
              <a href="https://transparencia.desamparados.go.cr/rendicion-de-cuentas/actas-y-acuerdos"
                 target="_blank" rel="noreferrer" style={{ color:C.green, fontWeight:700 }}>
                transparencia.desamparados.go.cr → Actas y acuerdos →
              </a>
            </div>
          </div>
        )}

        {/* ── APORTÁ ── */}
        {tab==="aporta" && (
          <div style={{ maxWidth:640 }}>
            <h2 className="disp" style={{ fontSize:22, fontWeight:900, margin:"0 0 8px" }}>
              Construyamos esto juntos
            </h2>
            <p style={{ fontSize:14.5, color:C.inkSoft, lineHeight:1.6 }}>
              CívicosCR se alimenta de aportes ciudadanos verificados. Si tenés evidencia sobre una meta,
              una votación reciente, o datos del presupuesto, compartila. Todo aporte pasa por verificación
              antes de publicarse.
            </p>
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                           borderRadius:12, padding:20, marginTop:16 }}>
              <label style={{ fontSize:13, fontWeight:700, display:"block", marginBottom:8 }}>
                ¿Qué información querés aportar?
              </label>
              <textarea value={aporteTexto} onChange={e => setAporteTexto(e.target.value)}
                placeholder="Ej: La meta ME15 sí se cumplió en 2025 — la feria de ambiente se realizó en el parque central el 14 de junio. Aquí el enlace a la noticia..."
                rows={4}
                style={{ width:"100%", boxSizing:"border-box", padding:12, borderRadius:10,
                         border:`1.5px solid ${C.line}`, fontSize:14, resize:"vertical",
                         fontFamily:"inherit", color:C.ink, background:C.paper }}/>
              <button onClick={() => { if(aporteTexto.trim()){setAporteEnviado(true);setAporteTexto("");setTimeout(()=>setAporteEnviado(false),3500); }}}
                style={{ marginTop:12, padding:"10px 22px", borderRadius:10, border:"none",
                         background:C.green, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                Enviar para verificación
              </button>
              {aporteEnviado && (
                <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10,
                              background:"#E9F7F1", border:`1px solid ${C.done}`,
                              fontSize:13.5, color:C.green, fontWeight:600 }}>
                  ✅ ¡Gracias! Tu aporte entró a la cola de verificación comunitaria.
                </div>
              )}
            </div>
            <div style={{ marginTop:14, fontSize:12.5, color:C.inkSoft, lineHeight:1.55 }}>
              En la versión final: registro de contribuyentes, carga de documentos, sistema de reputación
              y panel de moderación con verificadores voluntarios. Por ahora también podés escribirnos
              directamente a través de las redes del proyecto.
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop:`1px solid ${C.line}`, padding:"16px 24px",
                       fontSize:12, color:C.inkSoft, textAlign:"center", lineHeight:1.6 }}>
        CívicosCR · Plan Piloto Desamparados · Change Agents Programme (FES)<br/>
        Concejo: desamparados.go.cr · Metas: PDM 2024–2028 (Acuerdo N.° 6, Sesión 60-2024) ·
        Presupuesto y Votaciones: documentos oficiales descargados del portal de transparencia municipal
      </footer>
    </div>
  );
}
