import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import concejo from "./data/concejo.json";
import metasData from "./data/metas.json";
import votacionesData from "./data/votaciones.json";
import presupuesto from "./data/presupuesto.json";
import canton from "./data/canton.json";
import alertasData from "./data/alertas.json";

const C = {
  ink: "#14213D", inkSoft: "#3D4B6B", paper: "#FAFBF7", card: "#FFFFFF",
  line: "#E3E7DD", green: "#2D6A4F", done: "#2D9D78", progress: "#E9B44C",
  stalled: "#C44536", none: "#8B93A7", verify: "#5B7DB1",
};

const ESTADOS = {
  cumplida:       { label: "Cumplida",      color: C.done     },
  progreso:       { label: "En progreso",   color: C.progress },
  estancada:      { label: "Estancada",     color: C.stalled  },
  "sin-iniciar":  { label: "Sin iniciar",   color: C.none     },
  "sin-verificar":{ label: "En verificación", color: C.verify   },
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
    }}>{partido}</span>
  );
};

const Real = ({ texto = "DATOS REALES" }) => (
  <span style={{
    display:"inline-block", fontSize:11, fontWeight:800, padding:"3px 10px",
    borderRadius:999, background:"#E9F7F1", border:`1.5px solid ${C.done}`,
    color:C.green, marginBottom:10,
  }}>✓ {texto}</span>
);

// Imagen con fallback: si no existe el archivo, se oculta sola
const Foto = ({ src, alt, style }) => {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)}
              style={{ display:"block", ...style }} />;
};

export default function App() {
  const [tab, setTab]               = useState("canton");
  const [filtroMeta, setFiltroMeta] = useState("todas");
  const [filtroPart, setFiltroPart] = useState("todos");
  const [verSupl, setVerSupl]       = useState(false);
  const [aporteEnviado, setAporteEnviado] = useState(false);
  const [aporteTexto, setAporteTexto]     = useState("");
  const [metaExpandida, setMetaExpandida] = useState(null);
  const [anioP, setAnioP]           = useState(presupuesto.anios[0].anio);
  const [anioV, setAnioV]           = useState("todos");
  const [heroOk, setHeroOk]         = useState(true);

  const metas = metasData.metas;
  const metasFiltradas = filtroMeta === "todas" ? metas : metas.filter(m => m.estado === filtroMeta);
  const conteo = metas.reduce((a,m) => { a[m.estado]=(a[m.estado]||0)+1; return a; }, {});
  const verificadas = (conteo["cumplida"]||0) + (conteo["progreso"]||0) + (conteo["estancada"]||0) + (conteo["sin-iniciar"]||0);

  const regsFiltrados = filtroPart === "todos" ? concejo.regidores
    : concejo.regidores.filter(r => r.partido === filtroPart);

  const TABS = [
    { id:"canton",      label:"🏞️ El Cantón" },
    { id:"quienes",     label:"🏛️ Quiénes deciden" },
    { id:"promesas",    label:"🤝 Metas y promesas" },
    { id:"presupuesto", label:"💰 Presupuesto" },
    { id:"votaciones",  label:"🗳️ Votaciones" },
    { id:"aporta",      label:"✋ Aportá datos" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.paper, color:C.ink,
                  fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        .disp { font-family:'Archivo','Segoe UI',sans-serif; }
        .cv-tab { border:none; background:transparent; cursor:pointer; transition:opacity .15s; }
        .cv-tab:hover { opacity:.75; }
        .chip { cursor:pointer; transition:transform .12s; }
        .chip:hover { transform:translateY(-1px); }
        .card { transition:box-shadow .18s, transform .18s; }
        .card:hover { box-shadow:0 6px 22px rgba(20,33,61,.10); }
        .galeria img { transition:transform .25s; }
        .galeria img:hover { transform:scale(1.03); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:none;} }
        .fade { animation:fadeUp .4s ease both; }
      `}</style>

      {/* ═══ HERO ═══ */}
      <header style={{ position:"relative", overflow:"hidden",
                       background:`linear-gradient(135deg, ${C.ink} 0%, #1D3557 55%, ${C.green} 130%)`,
                       color:"#fff" }}>
        {heroOk && (
          <img src="/img/hero.jpg" alt="" aria-hidden="true"
               onError={() => setHeroOk(false)}
               style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                        objectFit:"cover", opacity:.28 }} />
        )}
        <div style={{ position:"relative", maxWidth:980, margin:"0 auto",
                      padding:"38px 20px 34px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between",
                        alignItems:"flex-start", gap:12 }}>
            <div className="disp" style={{ fontWeight:900, fontSize:24, letterSpacing:"-0.5px" }}>
              Cívicos<span style={{ color:C.progress }}>CR</span>
            </div>
            <div style={{ fontSize:11.5, fontWeight:700, padding:"5px 13px", borderRadius:999,
                          background:"rgba(255,255,255,.14)", border:"1px solid rgba(255,255,255,.3)",
                          backdropFilter:"blur(4px)" }}>
              🧪 Plan Piloto · Desamparados
            </div>
          </div>
          <h1 className="disp fade" style={{ fontSize:"clamp(30px, 6vw, 46px)", fontWeight:900,
                        lineHeight:1.08, letterSpacing:"-1.5px", margin:"26px 0 10px", maxWidth:640 }}>
            Tu municipalidad,<br/>en datos que <span style={{ color:C.progress }}>sí se entienden</span>
          </h1>
          <p className="fade" style={{ fontSize:15.5, lineHeight:1.6, maxWidth:540, opacity:.92, margin:"0 0 22px" }}>
            ¿Qué prometieron? ¿Qué se ha cumplido? ¿En qué se gasta la plata del cantón?
            CívicosCR traduce los documentos oficiales de la Municipalidad de Desamparados
            para que cualquier joven pueda fiscalizar a su gobierno local.
          </p>
          <div className="fade" style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            <button className="chip" onClick={() => setTab("promesas")}
              style={{ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer",
                       background:C.progress, color:C.ink, fontSize:14, fontWeight:800 }}>
              Ver las metas del gobierno →
            </button>
            <button className="chip" onClick={() => setTab("quienes")}
              style={{ padding:"10px 20px", borderRadius:10, cursor:"pointer",
                       border:"1.5px solid rgba(255,255,255,.5)", background:"transparent",
                       color:"#fff", fontSize:14, fontWeight:700 }}>
              ¿Quiénes deciden?
            </button>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <section style={{ maxWidth:980, margin:"-1px auto 0", padding:"20px 20px 4px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:12 }}>
          {[
            { v: curules.length+" partidos",              l:"en el Concejo Municipal",      n:concejo.regidores.length+" regidurías · dato real" },
            { v: verificadas+" de "+metas.length,          l:"metas con estado verificado",  n:"contra informes oficiales" },
            { v: fmtM(presupuesto.anios[1].ingresos_reales), l:"ingresos reales "+presupuesto.anios[1].anio, n:presupuesto.anios[1].ejecucion+"% de ejecución" },
            { v: "Lunes 6 p.m.",                           l:"sesiones del Concejo",         n:"públicas — podés asistir" },
          ].map(kpi => (
            <div key={kpi.l} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                        borderRadius:12, padding:"15px 17px" }}>
              <div className="disp" style={{ fontSize:21, fontWeight:900 }}>{kpi.v}</div>
              <div style={{ fontSize:12.5, fontWeight:600, marginTop:3 }}>{kpi.l}</div>
              <div style={{ fontSize:11, color:C.inkSoft, marginTop:2 }}>{kpi.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TABS ═══ */}
      <nav style={{ maxWidth:980, margin:"20px auto 0", padding:"0 20px",
                    display:"flex", flexWrap:"wrap", gap:2, borderBottom:`2px solid ${C.line}` }}>
        {TABS.map(t => (
          <button key={t.id} className="cv-tab" onClick={() => setTab(t.id)}
            style={{ padding:"11px 12px", fontSize:13.5, fontWeight:600,
                     color: tab===t.id ? C.ink : C.inkSoft,
                     borderBottom: tab===t.id ? `3px solid ${C.progress}` : "3px solid transparent",
                     marginBottom:-2 }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px 60px" }}>

        {/* ═══ EL CANTÓN ═══ */}
        {tab==="canton" && (
          <div className="fade">
            <h2 className="disp" style={{ fontSize:26, fontWeight:900, margin:"0 0 4px" }}>
              {canton.nombre} <span style={{ color:C.inkSoft, fontWeight:700, fontSize:17 }}>· "{canton.apodo}"</span>
            </h2>
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:660, lineHeight:1.6, marginTop:6 }}>
              Antes de fiscalizar, hay que conocer. Este es el cantón que CívicosCR acompaña:
              <em> "{canton.lema}"</em>.
            </p>

            {/* Datos del cantón */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",
                          gap:12, margin:"18px 0 26px" }}>
              {canton.datos.map(d => (
                <div key={d.titulo} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                               borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ fontSize:26 }}>{d.icono}</div>
                  <div className="disp" style={{ fontSize:17, fontWeight:900, margin:"6px 0 4px" }}>{d.titulo}</div>
                  <div style={{ fontSize:12.5, color:C.inkSoft, lineHeight:1.5 }}>{d.texto}</div>
                </div>
              ))}
            </div>

            {/* Galería */}
            <div className="galeria" style={{ display:"grid",
                          gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10, marginBottom:26 }}>
              {canton.fotos.map(f => (
                <Foto key={f.archivo} src={"/img/"+f.archivo} alt={f.alt}
                      style={{ width:"100%", height:170, objectFit:"cover", borderRadius:12,
                               border:`1px solid ${C.line}` }} />
              ))}
            </div>

            {/* Línea de tiempo */}
            <h3 className="disp" style={{ fontSize:19, fontWeight:900, margin:"0 0 14px" }}>
              📜 Historia en 7 momentos
            </h3>
            <div style={{ borderLeft:`3px solid ${C.green}`, paddingLeft:18, display:"grid", gap:14 }}>
              {canton.historia.map((h,i) => (
                <div key={i} style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:-27, top:4, width:13, height:13,
                                 borderRadius:"50%", background: i===canton.historia.length-1 ? C.progress : C.green,
                                 border:`2.5px solid ${C.paper}` }} />
                  <div className="disp" style={{ fontSize:14.5, fontWeight:900, color:C.green }}>{h.anio}</div>
                  <div style={{ fontSize:13.5, color:C.inkSoft, lineHeight:1.55, maxWidth:640 }}>{h.evento}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18, fontSize:12, color:C.inkSoft }}>Fuente: {canton.fuente}</div>
          </div>
        )}

        {/* ═══ QUIÉNES DECIDEN ═══ */}
        {tab==="quienes" && (
          <div className="fade">
            <Real texto="DATOS REALES — desamparados.go.cr" />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              El Concejo Municipal es la máxima autoridad del cantón: {concejo.regidores.length} regidores propietarios
              con voz y voto, electos cada 4 años. <strong>{concejo.sesiones}</strong>
            </p>
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
              Las regidurías suplentes tienen voz y votan solo al sustituir a un propietario de su partido.
              También participan 13 síndicos/as distritales (voz, sin voto). Fuente: {concejo.fuente}.
            </div>
          </div>
        )}

        {/* ═══ METAS ═══ */}
        {tab==="promesas" && (
          <div className="fade">
            <Real texto="METAS OFICIALES + VERIFICACIÓN CONTRA INFORMES" />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              Metas estratégicas del <strong>Plan de Desarrollo Municipal 2024–2028</strong>, verificadas
              contra los Informes de Rendición de Cuentas 2024 y 2025. Tocá cada tarjeta para ver la evidencia.
            </p>

            {/* Resumen visual */}
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:12,
                                           padding:"14px 18px", margin:"14px 0" }}>
              <div style={{ display:"flex", height:14, borderRadius:999, overflow:"hidden", gap:2 }}>
                {["cumplida","progreso","estancada","sin-iniciar","sin-verificar"].map(e => (
                  (conteo[e]||0) > 0 &&
                  <div key={e} style={{ flex:conteo[e], background:ESTADOS[e].color }}
                       title={`${ESTADOS[e].label}: ${conteo[e]}`} />
                ))}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 16px", marginTop:10, fontSize:12 }}>
                {["cumplida","progreso","estancada","sin-iniciar","sin-verificar"].map(e => (
                  (conteo[e]||0) > 0 &&
                  <span key={e} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:9, height:9, borderRadius:3, background:ESTADOS[e].color, display:"inline-block" }}/>
                    <strong>{conteo[e]}</strong> {ESTADOS[e].label.toLowerCase()}
                  </span>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:12.5, color:C.inkSoft, lineHeight:1.5 }}>
                💪 Las metas "en verificación" son una <strong>invitación abierta</strong>: si tenés evidencia
                de avance (una noticia, una foto, un informe), aportala y la verificamos juntos.
              </div>
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"14px 0 18px" }}>
              {["todas","cumplida","progreso","sin-verificar","estancada","sin-iniciar"].map(f => (
                <button key={f} className="chip" onClick={() => setFiltroMeta(f)}
                  style={{ padding:"6px 14px", borderRadius:999, fontSize:13, fontWeight:600,
                           border:`1.5px solid ${f==="todas" ? C.ink : ESTADOS[f]?.color||C.ink}`,
                           background: filtroMeta===f ? (f==="todas" ? C.ink : ESTADOS[f].color) : "transparent",
                           color: filtroMeta===f ? "#fff" : (f==="todas" ? C.ink : ESTADOS[f].color) }}>
                  {f==="todas" ? `Todas (${metas.length})` : `${ESTADOS[f].label} (${conteo[f]||0})`}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gap:12 }}>
              {metasFiltradas.map((m,i) => {
                const e = ESTADOS[m.estado];
                const expanded = metaExpandida === m.codigo;
                return (
                  <div key={m.codigo||i} className="card" onClick={() => setMetaExpandida(expanded ? null : m.codigo)}
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
                        <strong style={{ color:C.ink }}>Evidencia:</strong> {m.evidencia}
                      </div>
                    )}
                    <div style={{ marginTop:6, fontSize:11.5, color:C.inkSoft }}>
                      {expanded ? "▲ Ocultar evidencia" : "▼ Ver evidencia"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:14, fontSize:12, color:C.inkSoft }}>Fuente: {metasData.fuente}</div>
          </div>
        )}

        {/* ═══ PRESUPUESTO ═══ */}
        {tab==="presupuesto" && (() => {
          const P = presupuesto.anios.find(a => a.anio === anioP);
          return (
          <div className="fade">
            <Real texto="DATOS REALES — documentos oficiales 2024·2025·2026" />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              ¿En qué se gasta la plata del cantón? Seguimiento del presupuesto municipal con base en
              liquidaciones, informes de ejecución y oficios de la Contraloría.
            </p>

            {/* Selector de año */}
            <div style={{ display:"flex", gap:8, margin:"14px 0" }}>
              {presupuesto.anios.map(a => (
                <button key={a.anio} className="chip" onClick={() => setAnioP(a.anio)}
                  style={{ padding:"8px 18px", borderRadius:10, fontSize:14, fontWeight:800,
                           border:`1.5px solid ${a.estado==="alerta" ? C.stalled : C.ink}`,
                           background: anioP===a.anio ? (a.estado==="alerta" ? C.stalled : C.ink) : "transparent",
                           color: anioP===a.anio ? "#fff" : (a.estado==="alerta" ? C.stalled : C.ink) }}>
                  {a.anio}{a.estado==="alerta" ? " ⚠" : ""}
                </button>
              ))}
            </div>

            <h3 className="disp" style={{ fontSize:18, fontWeight:900, margin:"4px 0 10px" }}>{P.titulo}</h3>

            {P.alerta && (
              <div className="card" style={{ background:"#FDF0EE", border:`1.5px solid ${C.stalled}`,
                                             borderRadius:12, padding:"16px 18px", marginBottom:14,
                                             fontSize:13.5, lineHeight:1.6 }}>
                <strong style={{ color:C.stalled }}>⚠ Caso de fiscalización:</strong> {P.alerta}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, margin:"0 0 14px" }}>
              {[
                P.total != null          && { v: fmtM(P.total),            l: P.anio===2026 ? "PO formulado (archivado)" : "Presupuesto inicial" },
                P.total_definitivo != null && { v: fmtM(P.total_definitivo), l:"Presupuesto definitivo" },
                P.extraordinario != null && { v: fmtM(P.extraordinario),   l:"Extraordinario 01-2026 aprobado" },
                P.ingresos_reales != null && { v: fmtM(P.ingresos_reales),  l:"Ingresos reales" },
                P.egresos_reales != null && { v: fmtM(P.egresos_reales),   l:"Egresos ejecutados" },
                P.ejecucion != null      && { v: P.ejecucion+"%",          l:"Ejecución global" },
                P.superavit != null      && { v: fmtM(P.superavit),        l:"Superávit al 31 dic" },
              ].filter(Boolean).map(kpi => (
                <div key={kpi.l} className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                                            borderRadius:12, padding:"13px 15px" }}>
                  <div className="disp" style={{ fontSize:19, fontWeight:900 }}>{kpi.v}</div>
                  <div style={{ fontSize:11.5, fontWeight:600, marginTop:3, color:C.inkSoft }}>{kpi.l}</div>
                </div>
              ))}
            </div>

            {P.detalle && P.detalle.some(d => d.monto != null) && (
              <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                             borderRadius:12, padding:"20px 12px 10px" }}>
                <div className="disp" style={{ fontSize:15, fontWeight:700, marginLeft:12, marginBottom:4 }}>
                  {P.detalle_nota}
                </div>
                <ResponsiveContainer width="100%" height={Math.max(200, P.detalle.length*42)}>
                  <BarChart data={P.detalle.filter(d => d.monto != null)} layout="vertical" margin={{ left:16, right:44 }}>
                    <XAxis type="number" tick={{ fontSize:11, fill:C.inkSoft }}
                           tickFormatter={v => "₡"+v.toLocaleString("es-CR")} />
                    <YAxis type="category" dataKey="rubro" width={190}
                           tick={{ fontSize:11.5, fill:C.ink, fontWeight:600 }} />
                    <Tooltip formatter={(v,n,p) => [fmtM(v)+(p.payload.ejecucion_pct ? ` (${p.payload.ejecucion_pct}% ejecutado)` : ""), "Monto"]}
                             cursor={{ fill:"rgba(20,33,61,.04)" }} />
                    <Bar dataKey="monto" radius={[0,6,6,0]}>
                      {P.detalle.filter(d => d.monto != null).map((_,i) => (
                        <Cell key={i} fill={[C.green, C.ink, "#4A7FB5", C.progress, C.verify, C.none, C.stalled][i%7]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {P.detalle && !P.detalle.some(d => d.monto != null) && (
              <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                             borderRadius:12, padding:"16px 18px" }}>
                <div className="disp" style={{ fontSize:15, fontWeight:700, marginBottom:10 }}>{P.detalle_nota}</div>
                {P.detalle.map(d => (
                  <div key={d.rubro} style={{ margin:"8px 0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600 }}>
                      <span>{d.rubro}</span><span>{d.ejecucion_pct}%</span>
                    </div>
                    <div style={{ height:8, borderRadius:999, background:C.line, overflow:"hidden", marginTop:4 }}>
                      <div style={{ width:`${d.ejecucion_pct}%`, height:"100%", borderRadius:999,
                                    background: d.ejecucion_pct >= 85 ? C.done : d.ejecucion_pct >= 70 ? C.progress : C.stalled }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {P.hitos && (
              <div style={{ marginTop:14, padding:"14px 18px", borderRadius:12,
                            background:"#FFF8E8", border:`1px solid ${C.progress}`,
                            fontSize:13.5, lineHeight:1.65 }}>
                <strong>Hitos {P.anio}:</strong>
                <ul style={{ margin:"8px 0 0", paddingLeft:20 }}>
                  {P.hitos.map((h,i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
            <div style={{ marginTop:10, fontSize:12, color:C.inkSoft }}>
              Fuente: {P.fuente} ·{" "}
              <a href={presupuesto.fuenteOficial} target="_blank" rel="noreferrer"
                 style={{ color:C.green }}>Portal de transparencia →</a>
            </div>
          </div>
          );
        })()}

        {/* ═══ VOTACIONES ═══ */}
        {tab==="votaciones" && (() => {
          const S = votacionesData.stats;
          const lista = anioV === "todos" ? votacionesData.votaciones
                        : votacionesData.votaciones.filter(v => v.anio === anioV);
          return (
          <div className="fade">
            <Real texto={"ANÁLISIS DE " + S.acuerdos_analizados.toLocaleString("es-CR") + " ACUERDOS OFICIALES 2024–2026"} />
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:680, lineHeight:1.6, marginTop:4 }}>
              CívicosCR analizó los archivos de acuerdos del Concejo Municipal publicados en el portal de
              transparencia y seleccionó los de mayor relevancia ciudadana, traducidos a lenguaje claro
              y siempre con su fuente.
            </p>

            {/* Radiografía */}
            <div className="card" style={{ background:C.card, border:`1px solid ${C.line}`,
                                           borderRadius:12, padding:"16px 18px", margin:"14px 0" }}>
              <div className="disp" style={{ fontSize:16, fontWeight:900, marginBottom:10 }}>
                🔬 Radiografía del Concejo
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
                {Object.entries(S.por_anio).map(([anio, n]) => (
                  <div key={anio} style={{ textAlign:"center", padding:"10px 8px",
                                           background:C.paper, borderRadius:10, border:`1px solid ${C.line}` }}>
                    <div className="disp" style={{ fontSize:22, fontWeight:900 }}>{n}</div>
                    <div style={{ fontSize:11.5, color:C.inkSoft }}>acuerdos analizados en {anio}</div>
                    <div style={{ fontSize:10.5, color:C.inkSoft }}>{S.sesiones_por_anio[anio]} sesiones</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, fontSize:12.5, color:C.inkSoft }}>
                <strong style={{ color:C.ink }}>¿De qué habla el Concejo?</strong> Temas más frecuentes:{" "}
                {S.temas_principales.map((t,i) => (
                  <span key={t.tema}>{i>0 ? " · " : ""}{t.tema} ({t.n})</span>
                ))}
              </div>
            </div>

            {/* Filtro por año */}
            <div style={{ display:"flex", gap:8, margin:"0 0 16px" }}>
              {["todos", 2026, 2025, 2024].map(a => (
                <button key={a} className="chip" onClick={() => setAnioV(a)}
                  style={{ padding:"6px 15px", borderRadius:999, fontSize:13, fontWeight:700,
                           border:`1.5px solid ${C.ink}`,
                           background: anioV===a ? C.ink : "transparent",
                           color: anioV===a ? "#fff" : C.ink }}>
                  {a === "todos" ? "Todos los años" : a}
                </button>
              ))}
            </div>

            <div style={{ display:"grid", gap:14 }}>
              {lista.map((v,i) => {
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
                transparencia.desamparados.go.cr →
              </a>
            </div>
          </div>
          );
        })()}

        {/* ═══ ALERTAS ═══ */}
        {tab==="alertas" && (
          <div className="fade">
            <Real texto="CONTRASTES DOCUMENTADOS — cada alerta con su fuente" />
            <h2 className="disp" style={{ fontSize:24, fontWeight:900, margin:"6px 0 8px" }}>
              Alertas de fiscalización
            </h2>
            <p style={{ fontSize:14.5, color:C.inkSoft, maxWidth:700, lineHeight:1.6, marginTop:0 }}>
              Aquí señalamos contrastes entre lo que la administración se comprometió a hacer
              (Plan de Gobierno, Plan de Desarrollo Municipal) y lo que muestran los documentos oficiales.
              Sin adjetivos: hechos, compromisos y fuentes, lado a lado.
            </p>

            {/* Marco metodológico */}
            <div className="card" style={{ background:"#F4F6FB", border:`1.5px solid ${C.verify}`,
                                           borderRadius:12, padding:"14px 18px", margin:"14px 0 20px",
                                           fontSize:12.5, lineHeight:1.6, color:C.inkSoft }}>
              ⚖️ <strong style={{ color:C.ink }}>Nuestro método:</strong> {alertasData.disclaimer}
            </div>

            <div style={{ display:"grid", gap:16 }}>
              {alertasData.alertas.map(a => {
                const alta = a.nivel === "alta";
                return (
                  <div key={a.id} className="card" style={{ background:C.card,
                                border:`1px solid ${C.line}`,
                                borderLeft:`6px solid ${alta ? C.stalled : C.progress}`,
                                borderRadius:12, padding:"18px 20px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:800, padding:"3px 11px", borderRadius:999,
                                     background: alta ? C.stalled : C.progress,
                                     color: alta ? "#fff" : C.ink }}>
                        {alta ? "⬤ ALERTA ALTA" : "⬤ ALERTA MEDIA"}
                      </span>
                      <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:999,
                                     background:C.paper, border:`1px solid ${C.line}`, color:C.inkSoft }}>
                        {a.area}
                      </span>
                      <span style={{ fontFamily:"monospace", fontSize:10.5, fontWeight:700,
                                     padding:"3px 9px", borderRadius:6, background:C.ink,
                                     color:"#fff" }}>{a.id}</span>
                    </div>
                    <div className="disp" style={{ fontSize:17, fontWeight:800, lineHeight:1.3, marginBottom:10 }}>
                      {a.titulo}
                    </div>
                    <div style={{ display:"grid", gap:10 }}>
                      <div style={{ padding:"11px 14px", borderRadius:10, background:C.paper,
                                    border:`1px solid ${C.line}`, fontSize:13.5, lineHeight:1.55 }}>
                        <strong style={{ color:C.ink }}>📋 El hecho:</strong> {a.hecho}
                      </div>
                      <div style={{ padding:"11px 14px", borderRadius:10, background:"#FFF8E8",
                                    border:`1px solid ${C.progress}`, fontSize:13.5, lineHeight:1.55 }}>
                        <strong style={{ color:C.ink }}>⚡ El contraste:</strong> {a.contraste}
                      </div>
                    </div>
                    <div style={{ marginTop:10, fontSize:11.5, color:C.inkSoft, fontStyle:"italic", lineHeight:1.5 }}>
                      📄 Fuentes: {a.fuentes.join(" · ")}
                    </div>
                    <div style={{ marginTop:6, fontSize:11.5, fontWeight:700,
                                  color: a.estado.includes("avance") ? C.green : C.inkSoft }}>
                      Estado: {a.estado}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:16, padding:"12px 16px", borderRadius:10,
                          background:C.paper, border:`1px solid ${C.line}`, fontSize:13, lineHeight:1.55 }}>
              🗣️ ¿Sos parte de la Municipalidad y querés aportar contexto o una réplica documentada?
              ¿Sos ciudadano y conocés otro contraste que deberíamos revisar? Escribinos en la pestaña
              <strong> "Aportá datos"</strong> — toda réplica con fuente se publica junto a la alerta.
            </div>
          </div>
        )}

        {/* ═══ APORTÁ ═══ */}
        {tab==="aporta" && (
          <div className="fade" style={{ maxWidth:640 }}>
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
                placeholder="Ej: La meta ME15 sí se cumplió — la feria de ambiente se realizó en el parque central. Aquí el enlace a la noticia..."
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
              y panel de moderación con verificadores voluntarios.
            </div>
          </div>
        )}
      </main>

      <footer style={{ background:C.ink, color:"rgba(255,255,255,.75)", padding:"22px 24px",
                       fontSize:12, textAlign:"center", lineHeight:1.7 }}>
        <span className="disp" style={{ fontWeight:900, fontSize:15, color:"#fff" }}>
          Cívicos<span style={{ color:C.progress }}>CR</span>
        </span><br/>
        Plan Piloto Desamparados · Change Agents Programme (FES)<br/>
        Concejo: desamparados.go.cr · Metas: PDM 2024–2028 · Verificación: Informes de Rendición de Cuentas 2024–2025 ·
        Presupuesto: Liquidación 2025 · Votaciones: actas oficiales
      </footer>
    </div>
  );
}
