import { FOODS, ALLERGENS } from "../data/foods.js";
import { daysSince } from "../utils.js";

function getAllergenStatus(allergenName, foods, reactions) {
  const foodsForAllergen = FOODS.filter((f) => f.at === allergenName);
  const introduced = foodsForAllergen.filter((f) => !!foods[f.id]);
  const hasReaction = foodsForAllergen.some((f) => !!reactions[f.id]);

  if (introduced.length === 0) return "no";
  if (hasReaction) return "wn";
  if (introduced.some((f) => daysSince(foods[f.id]) < 3)) return "tt";
  return "ok";
}

const STATUS_LABELS = {
  ok: "Tolerado",
  tt: "En observación (3 días)",
  wn: "Reacción detectada",
  no: "No introducido",
};

const STATUS_COLOR_CLASS = { ok: "green", tt: "yellow", wn: "red", no: "gray" };

export default function AllergenTab({ data }) {
  return (
    <div>
      <h2 className="section-title">Semáforo de Alérgenos</h2>
      <p className="section-subtitle">
        Los 14 alérgenos principales. Introduce cada uno individualmente y espera 3 días.
      </p>

      <div className="allergen-list">
        {ALLERGENS.map((allergen) => {
          const status = getAllergenStatus(allergen.name, data.foods, data.reactions);
          const foodsForAllergen = FOODS.filter((f) => f.at === allergen.name);

          return (
            <div key={allergen.name} className={`allergen-row ${status}`}>
              <div className="allergen-emoji">{allergen.emoji}</div>
              <div className="allergen-info">
                <div className="allergen-name">{allergen.name}</div>
                <div className={`allergen-status ${STATUS_COLOR_CLASS[status]}`}>
                  {STATUS_LABELS[status]}
                </div>
                <div className="allergen-foods">
                  {foodsForAllergen.map((f) => (
                    <span
                      key={f.id}
                      className={`allergen-food-tag${data.foods[f.id] ? " done" : ""}`}
                    >
                      {f.em} {f.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="legend" style={{ marginTop: 16 }}>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--ac)" }} /> Tolerado
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--or)" }} /> En prueba
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--rd)" }} /> Reacción
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--t3)" }} /> Pendiente
        </span>
      </div>
    </div>
  );
}
