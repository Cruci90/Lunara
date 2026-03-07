import { useState } from "react";
import { getAgeInMonths } from "../utils.js";

/** Selector de bebé activo + gestión (añadir/eliminar) */
export default function BabySelector({ store, activeBaby, onSelect, onAdd, onDelete, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName]             = useState("");
  const [birthDate, setBirthDate]   = useState("");
  const [prematuryNotes, setPrematuryNotes]         = useState("");
  const [familyAllergyNotes, setFamilyAllergyNotes] = useState("");
  const [pediatricNotes, setPediatricNotes]         = useState("");

  const babies = Object.values(store.babies);

  function handleAdd() {
    if (!name || !birthDate) return;
    onAdd(name, birthDate, { prematuryNotes, familyAllergyNotes, pediatricNotes });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="food-modal-title" style={{ marginTop: 0, textAlign: "left" }}>Perfiles</h2>

        {/* Lista de bebés existentes */}
        {babies.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {babies.map((baby) => {
              const isActive = baby.id === activeBaby?.id;
              const age = getAgeInMonths(baby.birthDate);
              return (
                <div
                  key={baby.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: `1.5px solid ${isActive ? "var(--ac)" : "var(--bd)"}`,
                    background: isActive ? "var(--acb)" : "var(--cs)",
                    cursor: "pointer",
                  }}
                  onClick={() => { onSelect(baby.id); onClose(); }}
                >
                  <div style={{ fontSize: 28 }}>👶</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--t1)" }}>{baby.name}</div>
                    <div style={{ fontSize: 12, color: "var(--t3)" }}>{age} meses · {Object.keys(baby.foods).length} alimentos</div>
                  </div>
                  {isActive && <span style={{ color: "var(--ac)", fontWeight: 700, fontSize: 13 }}>Activo</span>}
                  {!isActive && babies.length > 1 && (
                    <button
                      style={{ background: "none", border: "none", color: "var(--rd)", fontSize: 18, cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar el perfil de ${baby.name}?`)) onDelete(baby.id); }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario de nuevo bebé */}
        {!showForm ? (
          <button
            className="btn-full"
            style={{ marginTop: 16, background: "var(--bg)", color: "var(--t1)", border: "1.5px dashed var(--bd)", fontSize: 14 }}
            onClick={() => setShowForm(true)}
          >
            + Añadir perfil
          </button>
        ) : (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>Nuevo perfil</div>

            <label className="form-label">Nombre del bebé</label>
            <input className="form-input" placeholder="Lucía" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="form-label">Fecha de nacimiento</label>
            <input className="form-input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", cursor: "pointer" }}>
                Información de salud (opcional)
              </summary>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="form-label" style={{ marginTop: 4 }}>Notas de prematuridad</label>
                <input className="form-input" placeholder="Ej: 34 semanas" value={prematuryNotes} onChange={(e) => setPrematuryNotes(e.target.value)} />

                <label className="form-label">Antecedentes familiares de alergias</label>
                <input className="form-input" placeholder="Ej: alergia a frutos secos en padre" value={familyAllergyNotes} onChange={(e) => setFamilyAllergyNotes(e.target.value)} />

                <label className="form-label">Recomendaciones del pediatra</label>
                <input className="form-input" placeholder="Ej: retrasar introducción de marisco" value={pediatricNotes} onChange={(e) => setPediatricNotes(e.target.value)} />
              </div>
            </details>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="btn-full" style={{ background: "var(--bg)", color: "var(--t2)", border: "1.5px solid var(--bd)" }} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button className="btn-full btn-primary" disabled={!name || !birthDate} onClick={handleAdd}>
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
