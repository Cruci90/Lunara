import { formatShortDate, daysSince } from "../utils.js";

export default function FoodModal({ food, data, onClose, onToggle, onReactionClick }) {
  if (!food) return null;

  const isIntroduced = !!data.foods[food.id];
  const reaction = data.reactions[food.id];
  const daysAgo = isIntroduced ? daysSince(data.foods[food.id]) : null;
  const inTrial = isIntroduced && food.al && daysAgo < 3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="food-modal-emoji">{food.em}</div>
        <div className="food-modal-title">{food.name}</div>

        <div className="food-modal-meta">
          <span className="food-modal-meta-item">{food.cat}</span>
          <span className="food-modal-meta-item">+{food.age} meses</span>
          {food.al && (
            <span className="food-modal-meta-item warn">⚠️ {food.at}</span>
          )}
        </div>

        {isIntroduced && (
          <div className="food-modal-intro-date">
            Introducido el {formatShortDate(data.foods[food.id])}
            {inTrial && (
              <div className="food-modal-timer">
                ⏳ {3 - daysAgo} días restantes
              </div>
            )}
          </div>
        )}

        {reaction && (
          <div className="food-modal-reaction">
            <div className="food-modal-reaction-title">Reacción registrada</div>
            <div className="food-modal-reaction-text">{reaction.text}</div>
            <div className="food-modal-reaction-meta">
              Severidad: {reaction.severity} · {formatShortDate(reaction.date)}
            </div>
          </div>
        )}

        <div className="food-modal-actions">
          <button
            className={`btn-full ${isIntroduced ? "btn-danger" : "btn-primary"}`}
            onClick={() => {
              onToggle(food.id);
              if (isIntroduced) onClose();
            }}
          >
            {isIntroduced ? "Quitar de introducidos" : "Marcar como introducido"}
          </button>

          {isIntroduced && (
            <button
              className="btn-full btn-warning"
              onClick={() => onReactionClick(food.id, reaction)}
            >
              Registrar reacción
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
