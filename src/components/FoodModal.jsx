import { useState } from "react";
import { formatShortDate, daysSince } from "../utils.js";
import { useSwipeToClose } from "../hooks/useSwipeToClose.js";

const ACCEPTANCE_LABELS = { liked: "Le encantó 😍", neutral: "Indiferente 😐", disliked: "No le gustó 😒" };
const PREP_OPTIONS = ["bastones", "triturado", "puré", "dados", "rallado", "cocido", "al vapor", "horno", "crudo", "aplastado"];

function getFoodDate(entry) {
  return typeof entry === "string" ? entry : entry?.date ?? "";
}

export default function FoodModal({ food, data, onClose, onToggle, onUpdateDetails, onReactionClick }) {
  const entry        = food ? data.foods[food.id] : null;
  const isIntroduced = !!entry;
  const entryDate    = getFoodDate(entry);
  const daysAgo      = isIntroduced ? daysSince(entryDate) : null;
  const inTrial      = isIntroduced && food?.al && daysAgo < 3;
  const reaction     = food ? data.reactions[food.id] : null;

  const [editing,     setEditing]     = useState(false);
  const [preparation, setPreparation] = useState(entry?.preparation ?? "");
  const [quantity,    setQuantity]    = useState(entry?.quantity    ?? "");
  const [acceptance,  setAcceptance]  = useState(entry?.acceptance  ?? "");

  const swipeHandlers = useSwipeToClose(onClose);

  if (!food) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalles de ${food.name}`}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" {...swipeHandlers} aria-hidden="true" />

        <div className="food-modal-emoji">{food.em}</div>
        <div className="food-modal-title">{food.name}</div>

        <div className="food-modal-meta">
          <span className="food-modal-meta-item">{food.cat}</span>
          <span className="food-modal-meta-item">+{food.age} meses</span>
          {food.al && <span className="food-modal-meta-item warn">⚠️ {food.at}</span>}
        </div>

        {isIntroduced && (
          <div className="food-modal-intro-date">
            Introducido el {formatShortDate(entryDate)}
            {inTrial && <div className="food-modal-timer">⏳ {3 - daysAgo} días restantes</div>}
          </div>
        )}

        {isIntroduced && !editing && (
          <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--bd)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".3px" }}>Detalles</span>
              <button style={{ background: "none", border: "none", color: "var(--bl)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--ft)" }}
                onClick={() => setEditing(true)}>Editar</button>
            </div>
            {entry?.preparation && <div style={{ fontSize: 13, color: "var(--t2)" }}>🍴 {entry.preparation}</div>}
            {entry?.quantity    && <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>📏 {entry.quantity}</div>}
            {entry?.acceptance  && <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>{ACCEPTANCE_LABELS[entry.acceptance]}</div>}
            {!entry?.preparation && !entry?.quantity && !entry?.acceptance && (
              <span style={{ fontSize: 12, color: "var(--t3)" }}>Sin detalles — pulsa editar para añadir</span>
            )}
          </div>
        )}

        {isIntroduced && editing && (
          <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--bd)" }}>
            <label className="form-label" style={{ marginTop: 0 }}>Forma de preparación</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {PREP_OPTIONS.map((opt) => (
                <button key={opt} className={"pill-btn sm" + (preparation === opt ? " active" : "")}
                  onClick={() => setPreparation(preparation === opt ? "" : opt)}>{opt}</button>
              ))}
            </div>
            <label className="form-label">Cantidad aproximada</label>
            <input className="search-input" style={{ marginBottom: 10 }} placeholder="Ej: 2-3 trozos" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} />
            <label className="form-label">Aceptación</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["liked", "neutral", "disliked"].map((val) => (
                <button key={val} className={"pill-btn" + (acceptance === val ? " active" : "")} style={{ flex: 1, fontSize: 11 }}
                  onClick={() => setAcceptance(acceptance === val ? "" : val)}>
                  {val === "liked" ? "😍 Gustó" : val === "neutral" ? "😐 Neutro" : "😒 No gustó"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-full" style={{ background: "var(--bg)", color: "var(--t2)", border: "1.5px solid var(--bd)" }}
                onClick={() => setEditing(false)}>Cancelar</button>
              <button className="btn-full btn-primary" onClick={() => { onUpdateDetails(food.id, { preparation, quantity, acceptance }); setEditing(false); }}>
                Guardar
              </button>
            </div>
          </div>
        )}

        {reaction && (
          <div className="food-modal-reaction" style={{ marginTop: 12 }}>
            <div className="food-modal-reaction-title">Reacción registrada</div>
            <div className="food-modal-reaction-text">{reaction.text}</div>
            <div className="food-modal-reaction-meta">Severidad: {reaction.severity} · {formatShortDate(reaction.date)}</div>
          </div>
        )}

        <div className="food-modal-actions" style={{ marginTop: 16 }}>
          <button
            className={"btn-full " + (isIntroduced ? "btn-danger" : "btn-primary")}
            aria-pressed={isIntroduced}
            onClick={() => { onToggle(food.id); if (isIntroduced) onClose(); }}
          >
            {isIntroduced ? "Quitar de introducidos" : "Marcar como introducido"}
          </button>
          {isIntroduced && (
            <button className="btn-full btn-warning" onClick={() => onReactionClick(food.id, reaction)}>
              {reaction ? "Editar reacción" : "Registrar reacción"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
