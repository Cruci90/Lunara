import { useState } from "react";

export default function SetupScreen({ onStart }) {
  const [name, setName]         = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [prematuryNotes, setPrematuryNotes]         = useState("");
  const [familyAllergyNotes, setFamilyAllergyNotes] = useState("");
  const [pediatricNotes, setPediatricNotes]         = useState("");

  function handleStart() {
    if (!name || !birthDate) return;
    onStart(name, birthDate, { prematuryNotes, familyAllergyNotes, pediatricNotes });
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-icon">🥦</div>
        <h1 className="setup-title">BLW Tracker</h1>
        <p className="setup-subtitle">Seguimiento de alimentación complementaria</p>

        <div className="setup-form">
          <label className="form-label">Nombre del bebé</label>
          <input
            className="form-input"
            placeholder="Lucía"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="form-label">Fecha de nacimiento</label>
          <input
            className="form-input"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <button
            type="button"
            style={{
              marginTop: 16,
              background: "none",
              border: "none",
              color: "var(--t3)",
              fontSize: 13,
              fontFamily: "var(--ft)",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
            onClick={() => setShowNotes((v) => !v)}
          >
            {showNotes ? "Ocultar" : "Añadir"} información de salud (opcional)
          </button>

          {showNotes && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              <label className="form-label">Notas de prematuridad</label>
              <input
                className="form-input"
                placeholder="Ej: 34 semanas"
                value={prematuryNotes}
                onChange={(e) => setPrematuryNotes(e.target.value)}
              />
              <label className="form-label">Antecedentes familiares de alergias</label>
              <input
                className="form-input"
                placeholder="Ej: alergia a frutos secos en padre"
                value={familyAllergyNotes}
                onChange={(e) => setFamilyAllergyNotes(e.target.value)}
              />
              <label className="form-label">Recomendaciones del pediatra</label>
              <input
                className="form-input"
                placeholder="Ej: retrasar marisco"
                value={pediatricNotes}
                onChange={(e) => setPediatricNotes(e.target.value)}
              />
            </div>
          )}

          <button
            className="setup-button"
            disabled={!name || !birthDate}
            onClick={handleStart}
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
