import { FOODS, ALLERGENS } from "../data/foods.js";
import { daysSince } from "../utils.js";

export default function Header({ data, ageMonths, babyCount, onBabySelect, onSettingsClick, onExportPDF }) {
  const introducedIds = Object.keys(data.foods);
  const totalFoods    = FOODS.length + (data.customFoods?.length ?? 0);
  const progressPct   = Math.round((introducedIds.length / totalFoods) * 100);

  const allergensDone = ALLERGENS.filter((a) =>
    FOODS.some((f) => f.at === a.name && data.foods[f.id])
  ).length;

  // foods[id].date en formato nuevo (objeto) — compatible con string legado
  function getFoodDate(entry) {
    return typeof entry === "string" ? entry : entry?.date ?? "";
  }

  const inTrialAllergens = FOODS.filter(
    (f) => f.al && data.foods[f.id] && daysSince(getFoodDate(data.foods[f.id])) < 3
  );

  return (
    <div className="header">
      <div className="header-row">
        <div style={{ cursor: babyCount > 1 ? "pointer" : "default" }} onClick={babyCount > 1 ? onBabySelect : undefined}>
          <div className="header-subtitle">
            Baby Led Weaning{babyCount > 1 && <span style={{ marginLeft: 6, fontSize: 12, color: "var(--bl)" }}>▾ cambiar</span>}
          </div>
          <div className="header-name">{data.name}, {ageMonths}m</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="settings-btn" title="Exportar PDF" aria-label="Exportar PDF" onClick={onExportPDF}>📄</button>
          <button className="settings-btn" title="Configuración" aria-label="Configuración y ajustes" onClick={onSettingsClick}>⚙️</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{introducedIds.length}</div>
          <div className="stat-label">Alimentos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{allergensDone}<span>/{ALLERGENS.length}</span></div>
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
            <div className="allergen-warning-desc">Espera antes de introducir otro alérgeno</div>
            <div className="allergen-warning-chips">
              {inTrialAllergens.map((f) => (
                <span key={f.id} className="allergen-chip">
                  {f.em} {f.name} · {3 - daysSince(getFoodDate(data.foods[f.id]))}d
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
