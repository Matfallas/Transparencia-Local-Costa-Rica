import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

import concejo from "./data/concejo.json";
import metasData from "./data/metas.json";
import votacionesData from "./data/votaciones.json";
import presupuesto from "./data/presupuesto.json";

// ─────────────────────────────────────────────────────────
// CívicosCR — Plan Piloto: Desamparados
// Los datos se editan en src/data/*.json (ver README.md)
// ─────────────────────────────────────────────────────────

const C = {
  ink: "#14213D",
  inkSoft: "#3D4B6B",
  paper: "#FAFBF7",
  card: "#FFFFFF",
  line: "#E3E7DD",
  green: "#2D6A4F",
  done: "#2D9D78",
  progress: "#E9B44C",
  stalled: "#C44536",
  none: "#8B93A7",
};

const PARTIDOS = concejo.partidos;
const REGIDORES = concejo.regidores;
const SUPLENTES = concejo.suplentes;
const ALCALDIA = concejo.alcaldia;
const PROMESAS = metasData.metas;
const VOTACIONES = votacionesData.votaciones;

const ESTADOS = {
  cumplida: { label: "Cumplida", color: C.done },
  progreso: { label: "En progreso", color: C.progress },
  estancada: { label: "Estancada", color: C.stalled },
  "sin-iniciar": { label: "Sin iniciar", color: C.none },
  "sin-verificar": { label: "Sin verificar", color: "#5B7DB1" },
};

const fmtMillones = (n) => "₡" + Number(n).toLocaleString("es-CR") + " M";

const curules = Object.entries(
  REGIDORES.reduce((acc, r) => { acc[r.partido] = (acc[r.partido] || 0) + 1; return acc; }, {})
).sort((a, b) => b[1] - a[1]);

export default function App() {
  const [tab, setTab] = useState("quienes");
  const [filtro, setFiltro] = useState("todas");
  const [partidoFiltro, setPartidoFiltro] = useState("todos");
  const [verSuplentes, setVerSuplentes] = useState(false);
  const [aporteEnviado, setAporteEnviado] = useState(false);
  const [aporteTexto, setAporteTexto] = useState("");

  const promesasFiltradas =
    filtro === "todas" ? PROMESAS : PROMESAS.filter((p) => p.estado === filtro);
  const cumplidas = PROMESAS.filter((p) => p.estado === "cumplida").length;

  const regidoresFiltrados =
    partidoFiltro === "todos" ? REGIDORES : REGIDORES.filter((r) => r.partido === partidoFiltro);

  const presupuestoListo =
    presupuesto.estado !== "pendiente" && presupuesto.total && presupuesto.detalle.length > 0;

  const enviarAporte = () => {
    if (aporteTexto.trim().length > 0) {
      setAporteEnviado(true);
      setAporteTexto("");
      setTimeout(() => setAporteEnviado(false), 3500);
    }
  };

  const Badge = ({ partido, small }) => {
    const p = PARTIDOS[partido];
    if (!p) return null;
    return (
      <span className="cv-body" style={{
        fontSize: small ? 10.5 : 11.5, fontWeight: 800, padding: small ? "2px 8px" : "3px 10px",
        borderRadius: 999, background: p.color, color: "#fff", whiteSpace: "nowrap",
      }}>
        {partido}
      </span>
    );
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.paper, color: C.ink,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&family=Inter:wght@400;500;600;700&display=swap');
        .cv-display { font-family: 'Archivo', 'Segoe UI', sans-serif; }
        .cv-body { font-family: 'Inter', 'Segoe UI', sans-serif; }
        .cv-tab { transition: all .15s ease; cursor: pointer; border: none; background: transparent; }
        .cv-tab:hover { opacity: .8; }
        .cv-chip { transition: all .15s ease; cursor: pointer; }
        .cv-chip:hover { transform: translateY(-1px); }
        .cv-card { transition: box-shadow .2s ease; }
        .cv-card:hover { box-shadow: 0 4px 16px rgba(20,33,61,.08); }
        @media (prefers-reduced-motion: reduce) {
          .cv-tab, .cv-chip, .cv-card { transition: none; }
        }
      `}</style>

      <header style={{
        background: C.ink, color: "#fff", padding: "20px 24px",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <div className="cv-display" style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.5px" }}>
            Cívicos<span style={{ color: C.progress }}>CR</span>
          </div>
          <div className="cv-body" style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
            Tu municipalidad, en datos que sí se entienden
          </div>
        </div>
        <div className="cv-body" style={{
          fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999,
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
        }}>
          🧪 Plan Piloto · Desamparados
        </div>
      </header>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 8px" }}>
        <div className="cv-body" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          color: C.green, marginBottom: 6,
        }}>
          Administración 2024–2028 · 13 distritos
        </div>
        <h1 className="cv-display" style={{ fontSize: 34, fontWeight: 900, margin: "0 0 18px", letterSpacing: "-1px" }}>
          Municipalidad de Desamparados
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Partidos en el Concejo", valor: String(curules.length), nota: REGIDORES.length + " regidurías · dato real" },
            { label: "Metas rastreadas", valor: String(PROMESAS.length), nota: "Plan de Desarrollo Municipal · real" },
            { label: "Metas verificadas", valor: cumplidas + " de " + PROMESAS.length, nota: "verificación ciudadana en curso" },
            { label: "Sesiones del Concejo", valor: "Lunes 6 p.m.", nota: "públicas · podés asistir" },
          ].map((kpi) => (
            <div key={kpi.label} className="cv-card" style={{
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px",
            }}>
              <div className="cv-display" style={{ fontSize: 24, fontWeight: 900 }}>{kpi.valor}</div>
              <div className="cv-body" style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>{kpi.label}</div>
              <div className="cv-body" style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{kpi.nota}</div>
            </div>
          ))}
        </div>
      </section>

      <nav style={{
        maxWidth: 980, margin: "24px auto 0", padding: "0 20px",
        display: "flex", flexWrap: "wrap", gap: 4, borderBottom: `2px solid ${C.line}`,
      }}>
        {[
          { id: "quienes", label: "🏛️ ¿Quiénes deciden?" },
          { id: "promesas", label: "🤝 Metas y promesas" },
          { id: "presupuesto", label: "💰 Presupuesto" },
          { id: "votaciones", label: "🗳️ Votaciones" },
          { id: "aporta", label: "✋ Aportá datos" },
        ].map((t) => (
          <button
            key={t.id} className="cv-tab cv-body" onClick={() => setTab(t.id)}
            style={{
              padding: "12px 14px", fontSize: 14, fontWeight: 600,
              color: tab === t.id ? C.ink : C.inkSoft,
              borderBottom: tab === t.id ? `3px solid ${C.progress}` : "3px solid transparent",
              marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px 60px" }}>

        {tab === "quienes" && (
          <div>
            <div className="cv-body" style={{
              display: "inline-block", fontSize: 11.5, fontWeight: 800, padding: "4px 12px",
              borderRadius: 999, background: "#E9F7F1", border: `1.5px solid ${C.done}`,
              color: C.green, marginBottom: 12,
            }}>
              ✓ DATOS REALES — Fuente: desamparados.go.cr
            </div>
            <p className="cv-body" style={{ fontSize: 14.5, color: C.inkSoft, maxWidth: 680, lineHeight: 1.6, marginTop: 0 }}>
              El Concejo Municipal es la máxima autoridad del cantón: {REGIDORES.length} regidores propietarios
              con voz y voto, electos por 4 años. {concejo.sesiones}
            </p>

            <div className="cv-card" style={{
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
              padding: "18px 20px", margin: "16px 0",
            }}>
              <div className="cv-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                Composición del Concejo · {REGIDORES.length} curules, {curules.length} partidos
              </div>
              <div style={{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                {curules.map(([sigla, n]) => (
                  <div key={sigla} title={`${PARTIDOS[sigla].nombre}: ${n}`} style={{
                    flex: n, background: PARTIDOS[sigla].color, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="cv-body" style={{ fontSize: 10.5, fontWeight: 800, color: "#fff" }}>
                      {sigla} {n > 1 ? "· " + n : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12 }}>
                {curules.map(([sigla, n]) => (
                  <div key={sigla} className="cv-body" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: PARTIDOS[sigla].color, display: "inline-block" }} />
                    <span><strong>{PARTIDOS[sigla].nombre}</strong> ({n})</span>
                  </div>
                ))}
              </div>
              <div className="cv-body" style={{
                marginTop: 14, padding: "12px 14px", borderRadius: 10,
                background: "#FFF8E8", border: `1px solid ${C.progress}`, fontSize: 13, lineHeight: 1.55,
              }}>
                📌 <strong>Contexto político:</strong> {concejo.contextoPolitico}
              </div>
            </div>

            <div className="cv-card" style={{
              background: C.card, border: `1px solid ${C.line}`,
              borderLeft: `5px solid ${PARTIDOS[ALCALDIA.partido].color}`, borderRadius: 12,
              padding: "16px 20px", marginBottom: 20,
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <Badge partido={ALCALDIA.partido} />
                <span className="cv-body" style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 1 }}>
                  {ALCALDIA.cargo}
                </span>
              </div>
              <div className="cv-display" style={{ fontSize: 19, fontWeight: 900, margin: "6px 0 4px" }}>
                {ALCALDIA.nombre}
              </div>
              <div className="cv-body" style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                ⚠️ {ALCALDIA.nota} La alcaldía participa en las sesiones del Concejo con voz pero sin voto.
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <button
                className="cv-chip cv-body" onClick={() => setPartidoFiltro("todos")}
                style={{
                  padding: "5px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                  border: `1.5px solid ${C.ink}`,
                  background: partidoFiltro === "todos" ? C.ink : "transparent",
                  color: partidoFiltro === "todos" ? "#fff" : C.ink,
                }}
              >Todos</button>
              {curules.map(([sigla]) => (
                <button
                  key={sigla} className="cv-chip cv-body" onClick={() => setPartidoFiltro(sigla)}
                  style={{
                    padding: "5px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                    border: `1.5px solid ${PARTIDOS[sigla].color}`,
                    background: partidoFiltro === sigla ? PARTIDOS[sigla].color : "transparent",
                    color: partidoFiltro === sigla ? "#fff" : PARTIDOS[sigla].color,
                  }}
                >{sigla}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {regidoresFiltrados.map((r) => (
                <div key={r.nombre} className="cv-card" style={{
                  background: C.card, border: `1px solid ${C.line}`,
                  borderTop: `4px solid ${PARTIDOS[r.partido].color}`,
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div className="cv-display" style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3 }}>
                      {r.nombre}
                    </div>
                    <Badge partido={r.partido} small />
                  </div>
                  <div className="cv-body" style={{ fontSize: 12, color: C.inkSoft, margin: "6px 0 8px", lineHeight: 1.4 }}>
                    {r.rol}
                  </div>
                  <a href={"mailto:" + r.email} className="cv-body" style={{
                    fontSize: 12, color: C.green, fontWeight: 600, textDecoration: "none",
                  }}>
                    ✉️ {r.email}
                  </a>
                </div>
              ))}
            </div>

            <button
              className="cv-chip cv-body" onClick={() => setVerSuplentes(!verSuplentes)}
              style={{
                marginTop: 20, padding: "9px 18px", borderRadius: 10,
                border: `1.5px solid ${C.line}`, background: C.card,
                fontSize: 13.5, fontWeight: 700, color: C.ink, cursor: "pointer",
              }}
            >
              {verSuplentes ? "▲ Ocultar regidurías suplentes" : `▼ Ver regidurías suplentes (${SUPLENTES.length})`}
            </button>
            {verSuplentes && (
              <div style={{
                marginTop: 12, display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8,
              }}>
                {SUPLENTES.map((s) => (
                  <div key={s.nombre} className="cv-body" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                    background: C.card, border: `1px solid ${C.line}`, borderRadius: 10,
                    padding: "10px 14px", fontSize: 13, fontWeight: 600,
                  }}>
                    <span>{s.nombre}</span>
                    <Badge partido={s.partido} small />
                  </div>
                ))}
              </div>
            )}

            <div className="cv-body" style={{ marginTop: 18, fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>
              Las regidurías suplentes tienen voz, y votan solo cuando sustituyen a una propietaria de su mismo
              partido. También participan 13 síndicos y síndicas (una por distrito) con voz pero sin voto.
              Fuente: {concejo.fuente}.
            </div>
          </div>
        )}

        {tab === "promesas" && (
          <div>
            <div className="cv-body" style={{
              display: "inline-block", fontSize: 11.5, fontWeight: 800, padding: "4px 12px",
              borderRadius: 999, background: "#E9F7F1", border: `1.5px solid ${C.done}`,
              color: C.green, marginBottom: 12,
            }}>
              ✓ METAS REALES — {metasData.fuente}
            </div>
            <p className="cv-body" style={{ fontSize: 14.5, color: C.inkSoft, maxWidth: 680, lineHeight: 1.6, marginTop: 0 }}>
              Estas son metas estratégicas oficiales del Plan de Desarrollo Municipal — cada una con su
              código institucional y, cuando aplica, su plazo. Todas arrancan <strong>"Sin verificar"</strong>:
              el estado se actualiza conforme la comunidad y los informes oficiales de cumplimiento aporten
              evidencia. Ese es el corazón de CívicosCR.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0 20px" }}>
              {["todas", "sin-verificar", "cumplida", "progreso", "estancada", "sin-iniciar"].map((f) => (
                <button
                  key={f} className="cv-chip cv-body" onClick={() => setFiltro(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${f === "todas" ? C.ink : ESTADOS[f]?.color || C.ink}`,
                    background: filtro === f ? (f === "todas" ? C.ink : ESTADOS[f].color) : "transparent",
                    color: filtro === f ? "#fff" : (f === "todas" ? C.ink : ESTADOS[f].color),
                  }}
                >
                  {f === "todas" ? "Todas" : ESTADOS[f].label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {promesasFiltradas.map((p, i) => {
                const e = ESTADOS[p.estado];
                return (
                  <div key={i} className="cv-card" style={{
                    background: C.card, border: `1px solid ${C.line}`,
                    borderLeft: `5px solid ${e.color}`, borderRadius: 12, padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span className="cv-body" style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                        background: e.color, color: "#fff",
                      }}>{e.label}</span>
                      <span className="cv-body" style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                        background: C.paper, border: `1px solid ${C.line}`, color: C.inkSoft,
                      }}>{p.area}</span>
                      {p.codigo && (
                        <span style={{
                          fontFamily: "monospace", fontSize: 10.5, fontWeight: 700, padding: "3px 9px",
                          borderRadius: 6, background: C.ink, color: "#fff", letterSpacing: 0.5,
                        }}>{p.codigo}</span>
                      )}
                      {p.plazo && (
                        <span className="cv-body" style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                          background: "#FFF8E8", border: `1px solid ${C.progress}`, color: "#9A7115",
                        }}>⏱ Plazo: {p.plazo}</span>
                      )}
                    </div>
                    <div className="cv-display" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35 }}>
                      {p.texto}
                    </div>
                    <div style={{ margin: "12px 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: C.line, overflow: "hidden" }}>
                        <div style={{ width: p.avance + "%", height: "100%", background: e.color, borderRadius: 999 }} />
                      </div>
                      <span className="cv-body" style={{ fontSize: 12.5, fontWeight: 700, minWidth: 36, textAlign: "right" }}>
                        {p.avance}%
                      </span>
                    </div>
                    <div className="cv-body" style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                      <strong style={{ color: C.ink }}>Evidencia:</strong> {p.evidencia}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "presupuesto" && (
          <div>
            <p className="cv-body" style={{ fontSize: 14.5, color: C.inkSoft, maxWidth: 680, lineHeight: 1.6 }}>
              ¿En qué se gasta la plata del cantón? Este módulo se alimenta del presupuesto oficial que la
              Municipalidad publica en su portal de transparencia.
            </p>
            {presupuestoListo ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "16px 0" }}>
                  <div className="cv-card" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px" }}>
                    <div className="cv-display" style={{ fontSize: 24, fontWeight: 900 }}>{fmtMillones(presupuesto.total)}</div>
                    <div className="cv-body" style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>Presupuesto {presupuesto.anio}</div>
                  </div>
                  {presupuesto.ejecucion != null && (
                    <div className="cv-card" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px" }}>
                      <div className="cv-display" style={{ fontSize: 24, fontWeight: 900 }}>{presupuesto.ejecucion}%</div>
                      <div className="cv-body" style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>Ejecución</div>
                    </div>
                  )}
                </div>
                <div className="cv-card" style={{
                  background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
                  padding: "20px 12px 8px",
                }}>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={presupuesto.detalle} layout="vertical" margin={{ left: 30, right: 30 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: C.inkSoft }} tickFormatter={(v) => "₡" + v.toLocaleString("es-CR")} />
                      <YAxis type="category" dataKey="rubro" width={150} tick={{ fontSize: 12, fill: C.ink, fontWeight: 600 }} />
                      <Tooltip formatter={(v) => [fmtMillones(v), "Monto"]} cursor={{ fill: "rgba(20,33,61,0.04)" }} />
                      <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
                        {presupuesto.detalle.map((d, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? C.green : C.ink} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="cv-card" style={{
                marginTop: 16, padding: "32px 24px", borderRadius: 12, textAlign: "center",
                background: C.card, border: `1.5px dashed ${C.line}`,
              }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🚧</div>
                <div className="cv-display" style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
                  Módulo en construcción con datos oficiales
                </div>
                <p className="cv-body" style={{ fontSize: 14, color: C.inkSoft, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
                  El presupuesto ordinario {presupuesto.anio} está publicado en PDF en el{" "}
                  <a href={presupuesto.fuenteOficial} target="_blank" rel="noreferrer" style={{ color: C.green, fontWeight: 700 }}>
                    portal de transparencia municipal
                  </a>. Preferimos mostrar este aviso antes que cifras no verificadas: el equipo de CívicosCR
                  está convirtiendo el documento oficial a formato abierto. ¿Querés ayudar? Pasá por la
                  pestaña "Aportá datos".
                </p>
              </div>
            )}
            <div className="cv-body" style={{
              marginTop: 14, padding: "14px 18px", borderRadius: 12,
              background: "#FFF8E8", border: `1px solid ${C.progress}`, fontSize: 13.5, lineHeight: 1.55,
            }}>
              💡 <strong>Fuentes oficiales:</strong> la Municipalidad publica presupuesto aprobado, informes
              parciales de ejecución, liquidaciones y auditorías en transparencia.desamparados.go.cr; la
              Contraloría General de la República consolida los presupuestos municipales en el SIPP.
            </div>
          </div>
        )}

        {tab === "votaciones" && (
          <div>
            <div className="cv-body" style={{
              display: "inline-block", fontSize: 11.5, fontWeight: 800, padding: "4px 12px",
              borderRadius: 999, background: "#E9F7F1", border: `1.5px solid ${C.done}`,
              color: C.green, marginBottom: 12,
            }}>
              ✓ VOTACIONES REALES — con fuente verificable
            </div>
            <p className="cv-body" style={{ fontSize: 14.5, color: C.inkSoft, maxWidth: 680, lineHeight: 1.6, marginTop: 0 }}>
              Lo que se vota cada lunes en el Concejo te afecta directamente. Acá traducimos los acuerdos a
              lenguaje claro, siempre con su fuente. {votacionesData.nota}
            </p>
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              {VOTACIONES.map((v, i) => {
                const aprobado = v.resultado === "Aprobado";
                const tieneVotos = typeof v.favor === "number";
                return (
                  <div key={i} className="cv-card" style={{
                    background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                      <span className="cv-body" style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{v.fecha}</span>
                      <span className="cv-body" style={{
                        fontSize: 11.5, fontWeight: 800, padding: "3px 12px", borderRadius: 999,
                        background: aprobado ? C.done : C.stalled, color: "#fff",
                      }}>{v.resultado}</span>
                    </div>
                    <div className="cv-display" style={{ fontSize: 16.5, fontWeight: 700, margin: "8px 0 6px", lineHeight: 1.35 }}>
                      {v.titulo}
                    </div>
                    <div className="cv-body" style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 }}>{v.detalle}</div>
                    {tieneVotos && (
                      <>
                        <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginTop: 12 }}>
                          <div style={{ flex: v.favor, background: C.done }} />
                          <div style={{ flex: v.contra || 0.001, background: C.stalled }} />
                          {v.ausente > 0 && <div style={{ flex: v.ausente, background: C.none }} />}
                        </div>
                        <div className="cv-body" style={{ fontSize: 12, color: C.inkSoft, marginTop: 6 }}>
                          ✅ {v.favor} a favor · ❌ {v.contra} en contra{v.ausente > 0 ? ` · ⚪ ${v.ausente} ausencia` : ""}
                        </div>
                      </>
                    )}
                    {v.fuente && (
                      <div className="cv-body" style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 8, fontStyle: "italic" }}>
                        Fuente: {v.fuente}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "aporta" && (
          <div style={{ maxWidth: 640 }}>
            <h2 className="cv-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>
              Construyamos esto juntos
            </h2>
            <p className="cv-body" style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6 }}>
              CívicosCR se construye en tiempo real con aportes ciudadanos. Si tenés evidencia sobre una
              meta del plan municipal, un acta, o un dato del presupuesto de Desamparados, compartila.
              Todo aporte pasa por verificación antes de publicarse.
            </p>
            <div className="cv-card" style={{
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20, marginTop: 16,
            }}>
              <label className="cv-body" style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>
                ¿Qué información querés aportar sobre Desamparados?
              </label>
              <textarea
                value={aporteTexto}
                onChange={(e) => setAporteTexto(e.target.value)}
                placeholder="Ej: La meta ME15 sí se cumplió en 2025 — la feria de ambiente se hizo en el parque central, adjunto el enlace de la noticia…"
                rows={4}
                className="cv-body"
                style={{
                  width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10,
                  border: `1.5px solid ${C.line}`, fontSize: 14, resize: "vertical",
                  fontFamily: "inherit", color: C.ink, background: C.paper,
                }}
              />
              <button
                onClick={enviarAporte}
                className="cv-body"
                style={{
                  marginTop: 12, padding: "10px 22px", borderRadius: 10, border: "none",
                  background: C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                Enviar aporte para verificación
              </button>
              {aporteEnviado && (
                <div className="cv-body" style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 10,
                  background: "#E9F7F1", border: `1px solid ${C.done}`, fontSize: 13.5, color: C.green, fontWeight: 600,
                }}>
                  ✅ ¡Gracias! Tu aporte entró a la cola de verificación comunitaria.
                </div>
              )}
            </div>
            <div className="cv-body" style={{ marginTop: 14, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
              En esta fase piloto, los aportes se reciben también por correo o redes (configurable). En la
              versión final: registro de contribuyentes, sistema de reputación, carga de documentos y panel
              de moderación con verificadores voluntarios (modelo wiki cívica).
            </div>
          </div>
        )}
      </main>

      <footer className="cv-body" style={{
        borderTop: `1px solid ${C.line}`, padding: "18px 24px",
        fontSize: 12, color: C.inkSoft, textAlign: "center", lineHeight: 1.6,
      }}>
        CívicosCR · Plan Piloto Desamparados · Iniciativa para el Change Agents Programme (FES)<br />
        Concejo Municipal: desamparados.go.cr · Metas: Plan de Desarrollo Municipal 2024–2028 (Acuerdo N.º 6,
        Sesión 60-2024) · Votaciones: actas oficiales y prensa · Presupuesto: en proceso de carga oficial
      </footer>
    </div>
  );
}
