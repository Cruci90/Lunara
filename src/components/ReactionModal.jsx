import { useState } from "react";

const SEVERITIES = ["leve", "moderada", "grave"];

export default function ReactionModal({ foodId, existingReaction, onClose, onSave }) {
  const [text, setText]         = useState(existingReaction?.text ?? "");
  const [severity, setSeverity] = useState(existingReaction?.severity ?? "leve");

  if (!foodId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="food-modal-title" style={{ marginTop: 8 }}>Registrar Reacción</div>

        <label className="form-label" style={{ marginTop: 16 }}>Descripción</label>
        <textarea
          className="reaction-textarea"
          placeholder="Sarpullido, urticaria..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <label className="form-label" style={{ marginTop: 12 }}>Severidad</label>
        <div className="severity-row">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              className={`severity-btn${severity === s ? ` ${s}` : ""}`}
              onClick={() => setSeverity(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="btn-full btn-primary"
          onClick={() => {
            onSave(foodId, text, severity);
            onClose();
          }}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
