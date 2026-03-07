import { useEffect } from "react";
import { FOODS, ALLERGENS } from "../data/foods.js";
import { formatShortDate, getAgeInMonths } from "../utils.js";

function getFoodDate(entry) {
  return typeof entry === "string" ? entry : entry?.date ?? "";
}

/** Vista de informe que se imprime como PDF desde el navegador */
export default function PDFExport({ baby, ageMonths, onClose }) {
  useEffect(() => {
    // Dar un tick para que se renderice antes de imprimir
    const timeout = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timeout);
  }, []);

  const introducedFoods = FOODS.filter((f) => baby.foods[f.id])
    .sort((a, b) => getFoodDate(baby.foods[a.id]).localeCompare(getFoodDate(baby.foods[b.id])));

  const reactionFoods = FOODS.filter((f) => baby.reactions[f.id]);

  const allergenStatus = ALLERGENS.map((a) => {
    const foods = FOODS.filter((f) => f.at === a.name);
    const done  = foods.filter((f) => !!baby.foods[f.id]);
    const hasRx = foods.some((f) => !!baby.reactions[f.id]);
    return { ...a, done: done.length, total: foods.length, hasRx };
  });

  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      {/* Botón de cierre (solo pantalla, no se imprime) */}
      <div className="modal-overlay" onClick={onClose} style={{ display: "block", background: "none" }}>
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200 }}>
          <button
            className="btn-full btn-primary"
            style={{ width: "auto", padding: "10px 20px" }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Informe imprimible */}
      <div id="pdf-report" style={{ position: "fixed", inset: 0, zIndex: 150, background: "#fff", overflowY: "auto", padding: "40px", fontFamily: "system-ui, sans-serif", color: "#1D1D1F" }}>
        {/* Cabecera */}
        <div style={{ borderBottom: "2px solid #34C759", paddingBottom: 16, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, color: "#34C759" }}>🥦 BLW Tracker — Informe para el pediatra</h1>
          <div style={{ marginTop: 8, fontSize: 13, color: "#6E6E73" }}>Generado el {today}</div>
        </div>

        {/* Datos del bebé */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 12 }}>Bebé</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: 700, width: 180 }}>Nombre</td>
                <td>{baby.name}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: 700 }}>Edad</td>
                <td>{ageMonths} meses</td>
              </tr>
              {baby.prematuryNotes && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: 700 }}>Prematuridad</td>
                  <td>{baby.prematuryNotes}</td>
                </tr>
              )}
              {baby.familyAllergyNotes && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: 700 }}>Antecedentes familiares</td>
                  <td>{baby.familyAllergyNotes}</td>
                </tr>
              )}
              {baby.pediatricNotes && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: 700 }}>Recomendaciones pediátricas</td>
                  <td>{baby.pediatricNotes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Resumen */}
        <section style={{ marginBottom: 24, display: "flex", gap: 24 }}>
          {[
            { label: "Alimentos introducidos", value: introducedFoods.length },
            { label: "Alérgenos tolerados",    value: allergenStatus.filter((a) => a.done > 0 && !a.hasRx).length + " / " + ALLERGENS.length },
            { label: "Reacciones registradas", value: reactionFoods.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, padding: "12px 16px", border: "1px solid #eee", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 11, color: "#6E6E73", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </section>

        {/* Alimentos introducidos */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 12 }}>Alimentos introducidos</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f5f5f7" }}>
                {["Alimento", "Categoría", "Fecha", "Preparación", "Cantidad", "Aceptación", "Alérgeno"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {introducedFoods.map((f, i) => {
                const entry = baby.foods[f.id];
                const acc   = { liked: "Le gustó", neutral: "Neutro", disliked: "No le gustó" };
                return (
                  <tr key={f.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "5px 8px" }}>{f.em} {f.name}</td>
                    <td style={{ padding: "5px 8px", color: "#6E6E73" }}>{f.cat}</td>
                    <td style={{ padding: "5px 8px" }}>{formatShortDate(getFoodDate(entry))}</td>
                    <td style={{ padding: "5px 8px", color: "#6E6E73" }}>{entry?.preparation || "—"}</td>
                    <td style={{ padding: "5px 8px", color: "#6E6E73" }}>{entry?.quantity    || "—"}</td>
                    <td style={{ padding: "5px 8px", color: "#6E6E73" }}>{entry?.acceptance ? acc[entry.acceptance] : "—"}</td>
                    <td style={{ padding: "5px 8px", color: f.al ? "#FF9F0A" : "#AEAEB2" }}>{f.al ? "⚠️ " + f.at : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Reacciones */}
        {reactionFoods.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 12, color: "#FF3B30" }}>
              ⚠️ Reacciones registradas
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#fff5f5" }}>
                  {["Alimento", "Descripción", "Severidad", "Fecha"].map((h) => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reactionFoods.map((f) => {
                  const rx = baby.reactions[f.id];
                  const sColor = rx.severity === "grave" ? "#FF3B30" : rx.severity === "moderada" ? "#FF9F0A" : "#AEAEB2";
                  return (
                    <tr key={f.id}>
                      <td style={{ padding: "5px 8px" }}>{f.em} {f.name}</td>
                      <td style={{ padding: "5px 8px", color: "#6E6E73" }}>{rx.text}</td>
                      <td style={{ padding: "5px 8px", fontWeight: 700, color: sColor }}>{rx.severity}</td>
                      <td style={{ padding: "5px 8px" }}>{formatShortDate(rx.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* Estado de alérgenos */}
        <section>
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 12 }}>Estado de alérgenos (14 UE)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {allergenStatus.map((a) => {
              const color = a.hasRx ? "#FF3B30" : a.done > 0 ? "#34C759" : "#AEAEB2";
              const label = a.hasRx ? "Reacción" : a.done > 0 ? "Tolerado" : "No introducido";
              return (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", border: "1px solid #eee", borderRadius: 8, borderLeft: `3px solid ${color}` }}>
                  <span style={{ fontSize: 20 }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color }}>{label} ({a.done}/{a.total})</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <div style={{ marginTop: 32, padding: "12px 16px", background: "#f5f5f7", borderRadius: 8, fontSize: 11, color: "#6E6E73" }}>
          <strong>Aviso:</strong> Este informe es un resumen de seguimiento personal generado por BLW Tracker.
          No sustituye el juicio clínico del pediatra. Ante cualquier reacción alérgica grave llame al 112.
        </div>

        <style>{`
          @media print {
            #pdf-report { position: static; padding: 20px; }
            button { display: none !important; }
            .modal-overlay > div:first-child { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}
