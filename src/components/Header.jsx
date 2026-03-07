import { FOODS, ALLERGENS } from "../data/foods.js";
import { daysSince } from "../utils.js";

export default function Header({ data, ageMonths, onSettingsClick }) {
  const introducedIds = Object.keys(data.foods);
  const totalFoods = FOODS.length;
  const progressPct = Math.round((introducedIds.length / totalFoods) * 100);

  // Cuenta alérgenos tolerados (al menos un alimento del grupo introducido sin reacción)
  const allergensDone = ALLERGENS.filter((a) =>
    FOODS.some((f) => f.at === a.name && data.foods[f.id])
  ).length;

  // Alimentos alérgenos en período de observación (< 3 días desde introducción)
  const inTrialAllergens = FOODS.filter(
    (f) => f.al && data.foods[f.id] && daysSince(data.foods[f.id]) < 3
  );

  return (
    <div className="header">
      <div className="header-row">
        <div>
          <div className="header-subtitle">Baby Led Weaning</div>
          <div className="header-name">
            {data.babyName}, {ageMonths}m
          </div>
        </div>
        <button className="settings-btn" onClick={onSettingsClick}>⚙️</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{introducedIds.length}</div>
          <div className="stat-label">Alimentos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {allergensDone}<span>/{ALLERGENS.length}</span>
          </div>
          <div className="stat-label">Alérgenos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progressPct}<span>%</span></div>
          <div className="stat-label">Progreso</div>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {inTrialAllergens.length > 0 && (
        <div className="allergen-warning">
          <div className="allergen-warning-icon">⏳</div>
          <div>
            <div className="allergen-warning-title">Regla de los 3 días</div>
            <div className="allergen-warning-desc">
              Espera antes de introducir otro alérgeno
            </div>
            <div className="allergen-warning-chips">
              {inTrialAllergens.map((f) => (
                <span key={f.id} className="allergen-chip">
                  {f.em} {f.name} · {3 - daysSince(data.foods[f.id])}d
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
