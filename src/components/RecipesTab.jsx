import { useState } from "react";
import { RECIPES } from "../data/recipes.js";
import { getFood } from "../data/foods.js";

const MEAL_FILTERS = ["todas", "desayuno", "comida", "cena", "snack", "merienda"];

export default function RecipesTab({ data, ageMonths, babyName }) {
  const [availabilityFilter, setAvailabilityFilter] = useState("disponibles");
  const [mealFilter, setMealFilter] = useState("todas");
  const [expanded, setExpanded] = useState({});
  const [aiPrompt, setAiPrompt]  = useState("");
  const [aiResult, setAiResult]  = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const visibleRecipes = RECIPES.filter((r) => {
    if (availabilityFilter === "disponibles") {
      if (!r.ingredients.every((id) => !!data.foods[id])) return false;
      if (r.age > ageMonths) return false;
    }
    if (mealFilter !== "todas" && !r.tags.includes(mealFilter)) return false;
    return true;
  });

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function generateWithAI() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult("");

    const introducedNames = Object.keys(data.foods)
      .map((id) => getFood(id)?.name)
      .filter(Boolean);

    try {
      // Llamada al proxy del servidor — la API key nunca llega al navegador
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageMonths,
          foods: introducedNames,
          prompt: aiPrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const { recipe } = await res.json();
      setAiResult(recipe || "No se pudo generar.");
    } catch (err) {
      setAiResult(`Error: ${err.message}`);
    }

    setAiLoading(false);
  }

  return (
    <div>
      <h2 className="section-title">Recetas</h2>

      <div className="filter-row" style={{ marginTop: 12 }}>
        <button
          className={`pill-btn${availabilityFilter === "disponibles" ? " active" : ""}`}
          onClick={() => setAvailabilityFilter("disponibles")}
        >
          Puedo hacer
        </button>
        <button
          className={`pill-btn${availabilityFilter === "todas" ? " active" : ""}`}
          onClick={() => setAvailabilityFilter("todas")}
        >
          Todas
        </button>
      </div>

      <div className="filter-row">
        {MEAL_FILTERS.map((f) => (
          <button
            key={f}
            className={`pill-btn sm${mealFilter === f ? " active" : ""}`}
            onClick={() => setMealFilter(f)}
          >
            {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visibleRecipes.length === 0 ? (
        <div className="empty-state">
          {availabilityFilter === "disponibles"
            ? "Introduce más alimentos para desbloquear recetas"
            : "Sin recetas para esa combinación"}
        </div>
      ) : (
        <div className="recipe-list">
          {visibleRecipes.map((recipe) => {
            const canMake = recipe.ingredients.every((id) => !!data.foods[id]);
            const missing = recipe.ingredients.filter((id) => !data.foods[id]);

            return (
              <div
                key={recipe.id}
                className="recipe-card"
                style={{ opacity: canMake ? 1 : 0.65 }}
              >
                <div className="recipe-card-header">
                  <div className="recipe-name">{recipe.name}</div>
                  <div className="recipe-time">{recipe.time}</div>
                </div>

                <div className="recipe-tags">
                  {recipe.tags.map((t) => (
                    <span key={t} className="recipe-tag">{t}</span>
                  ))}
                  <span className="recipe-tag age-tag">+{recipe.age}m</span>
                </div>

                <div className="recipe-ingredients">
                  {recipe.ingredients.map((id) => {
                    const food = getFood(id);
                    return food ? (
                      <span
                        key={id}
                        className={`recipe-ingredient${data.foods[id] ? "" : " missing"}`}
                      >
                        {food.em} {food.name}
                      </span>
                    ) : null;
                  })}
                </div>

                {!canMake && missing.length > 0 && (
                  <div className="recipe-missing">
                    Falta: {missing.map((id) => getFood(id)?.name ?? id).join(", ")}
                  </div>
                )}

                {expanded[recipe.id] && (
                  <p className="recipe-steps">{recipe.steps}</p>
                )}

                <button className="recipe-expand-btn" onClick={() => toggleExpand(recipe.id)}>
                  {expanded[recipe.id] ? "Ocultar" : "Ver preparación →"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bloque IA */}
      <div className="ai-block">
        <div className="ai-badge">✦ IA</div>
        <div className="ai-title">Genera una receta</div>
        <div className="ai-desc">
          Receta personalizada con los alimentos de {babyName}.
        </div>
        <div className="ai-input-row">
          <input
            className="ai-input"
            placeholder="Ej: cena con pollo..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateWithAI()}
          />
          <button className="ai-submit-btn" onClick={generateWithAI} disabled={aiLoading}>
            {aiLoading ? "..." : "Generar"}
          </button>
        </div>
        {aiLoading && <div className="ai-loading">Generando...</div>}
        {aiResult && !aiLoading && (
          <div className="ai-result">
            <div className="ai-result-text">{aiResult}</div>
          </div>
        )}
      </div>
    </div>
  );
}
