import { useState } from "react";
import { RECIPES } from "../data/recipes.js";
import { getFood } from "../data/foods.js";

const MEAL_FILTERS = ["todas", "desayuno", "comida", "cena", "snack", "merienda"];
const TEXTURE_LABELS = { blando: "🥣 Blando", aplastable: "🥄 Aplastable", finger_food: "🖐️ Finger food" };
const DIFF_LABELS    = { rapida: "⚡ Rápida", elaborada: "👨‍🍳 Elaborada", batch: "📦 Batch cooking" };
const NUT_COLORS     = { alto: "#34C759", medio: "#FF9F0A", bajo: "#AEAEB2" };

const NON_VEGETARIAN_IDS = new Set([
  "pollo", "pavo", "ternera", "cerdo",
  "merluza", "salmon", "bacalao", "lubina", "dorada", "atun",
  "gambas", "mejillones",
]);

export default function RecipesTab({ data, ageMonths, babyName, onToggleFavorite }) {
  const [availFilter, setAvailFilter] = useState("disponibles");
  const [mealFilter,  setMealFilter]  = useState("todas");
  const [textFilter,  setTextFilter]  = useState("todas");
  const [vegOnly,     setVegOnly]     = useState(false);
  const [expanded,    setExpanded]    = useState({});
  const [showShop,    setShowShop]    = useState(false);
  const [aiPrompt,    setAiPrompt]    = useState("");
  const [aiResult,    setAiResult]    = useState("");
  const [aiLoading,   setAiLoading]   = useState(false);

  const favorites = data.favorites ?? [];

  const visible = RECIPES.filter((r) => {
    if (availFilter === "disponibles" && (!r.ingredients.every((id) => !!data.foods[id]) || r.age > ageMonths)) return false;
    if (availFilter === "favoritos"   && !favorites.includes(r.id)) return false;
    if (mealFilter !== "todas"        && !r.tags.includes(mealFilter))  return false;
    if (textFilter !== "todas"        && r.texture !== textFilter)       return false;
    if (vegOnly && r.ingredients.some((id) => NON_VEGETARIAN_IDS.has(id))) return false;
    return true;
  });

  // Lista de la compra: ingredientes faltantes de recetas favoritas
  const shopList = favorites.flatMap((rid) => {
    const recipe = RECIPES.find((r) => r.id === rid);
    if (!recipe) return [];
    return recipe.ingredients.filter((id) => !data.foods[id]).map((id) => ({ recipeId: rid, recipeName: recipe.name, foodId: id }));
  });
  const uniqueShopItems = shopList.reduce((acc, item) => {
    if (!acc.find((x) => x.foodId === item.foodId)) acc.push(item);
    return acc;
  }, []);

  async function generateWithAI() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiResult("");
    const names = Object.keys(data.foods).map((id) => getFood(id)?.name).filter(Boolean);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageMonths, foods: names, prompt: aiPrompt }),
      });
      const json = await res.json();
      setAiResult(json.recipe || json.error || "No se pudo generar.");
    } catch (err) {
      setAiResult("Error de conexión. Asegúrate de que el servidor está en marcha (npm run dev).");
    }
    setAiLoading(false);
  }

  return (
    <div>
      <h2 className="section-title">Recetas</h2>

      {/* Filtros de disponibilidad */}
      <div className="filter-row" style={{ marginTop: 12 }}>
        {["disponibles", "todas", "favoritos"].map((k) => (
          <button key={k} className={"pill-btn" + (availFilter === k ? " active" : "")} onClick={() => setAvailFilter(k)}>
            {k === "disponibles" ? "Puedo hacer" : k === "todas" ? "Todas" : "❤️ Favoritas"}
          </button>
        ))}
        <button className={"pill-btn" + (showShop ? " active" : "")} onClick={() => setShowShop((v) => !v)}>
          🛒 Compra
        </button>
      </div>

      {/* Lista de la compra */}
      {showShop && (
        <div style={{ padding: "14px 16px", background: "var(--cs)", border: "1.5px solid var(--bd)", borderRadius: "var(--rm)", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>🛒 Lista de la compra</div>
          {uniqueShopItems.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--t3)" }}>
              {favorites.length === 0 ? "Marca recetas como favoritas para generar la lista." : "Tienes todos los ingredientes de tus favoritas. 🎉"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {uniqueShopItems.map((item) => {
                const food = getFood(item.foodId);
                return food ? (
                  <div key={item.foodId} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <span style={{ fontSize: 20 }}>{food.em}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--t1)" }}>{food.name}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>Para: {item.recipeName}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}

      {/* Filtros de franja + textura */}
      <div className="filter-row">
        {MEAL_FILTERS.map((f) => (
          <button key={f} className={"pill-btn sm" + (mealFilter === f ? " active" : "")} onClick={() => setMealFilter(f)}>
            {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {["todas", "blando", "aplastable", "finger_food"].map((t) => (
          <button key={t} className={"pill-btn sm" + (textFilter === t ? " active" : "")} onClick={() => setTextFilter(t)}>
            {t === "todas" ? "Cualquier textura" : TEXTURE_LABELS[t]}
          </button>
        ))}
        <button
          className={"pill-btn sm" + (vegOnly ? " active" : "")}
          onClick={() => setVegOnly((v) => !v)}
          style={vegOnly ? { background: "#34C759", color: "#fff", borderColor: "#34C759" } : {}}
        >
          🥦 Vegetariana
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          {availFilter === "disponibles" ? "Introduce más alimentos para desbloquear recetas." :
           availFilter === "favoritos"   ? "Aún no tienes favoritas." : "Sin recetas para esa combinación."}
        </div>
      ) : (
        <div className="recipe-list">
          {visible.map((r) => {
            const canMake  = r.ingredients.every((id) => !!data.foods[id]);
            const missing  = r.ingredients.filter((id) => !data.foods[id]);
            const isFav    = favorites.includes(r.id);

            return (
              <div key={r.id} className="recipe-card" style={{ opacity: canMake ? 1 : 0.65 }}>
                <div className="recipe-card-header">
                  <div className="recipe-name">{r.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="recipe-time">{r.time}</div>
                    <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                      onClick={() => onToggleFavorite(r.id)} title={isFav ? "Quitar de favoritas" : "Añadir a favoritas"}>
                      {isFav ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>

                <div className="recipe-tags">
                  {r.tags.map((t) => <span key={t} className="recipe-tag">{t}</span>)}
                  <span className="recipe-tag age-tag">+{r.age}m</span>
                  <span className="recipe-tag" style={{ fontSize: 9 }}>{TEXTURE_LABELS[r.texture]}</span>
                  <span className="recipe-tag" style={{ fontSize: 9 }}>{DIFF_LABELS[r.difficulty]}</span>
                </div>

                {/* Info nutricional */}
                {r.nutrition && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {[["🩸 Hierro", r.nutrition.iron], ["💪 Proteína", r.nutrition.protein], ["🍊 Vit C", r.nutrition.vitaminC]].map(([label, level]) => (
                      <div key={label} style={{ fontSize: 10, fontWeight: 600, color: NUT_COLORS[level], background: NUT_COLORS[level] + "18", padding: "2px 8px", borderRadius: 10 }}>
                        {label}: {level}
                      </div>
                    ))}
                  </div>
                )}

                <div className="recipe-ingredients">
                  {r.ingredients.map((id) => {
                    const food = getFood(id);
                    return food ? (
                      <span key={id} className={"recipe-ingredient" + (data.foods[id] ? "" : " missing")}>
                        {food.em} {food.name}
                      </span>
                    ) : null;
                  })}
                </div>

                {!canMake && missing.length > 0 && (
                  <div className="recipe-missing">Falta: {missing.map((id) => getFood(id)?.name ?? id).join(", ")}</div>
                )}

                {expanded[r.id] && <p className="recipe-steps">{r.steps}</p>}

                <button className="recipe-expand-btn" onClick={() => setExpanded((p) => ({ ...p, [r.id]: !p[r.id] }))}>
                  {expanded[r.id] ? "Ocultar" : "Ver preparación →"}
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
        <div className="ai-desc">Receta personalizada con los alimentos de {babyName}.</div>
        <div className="ai-input-row">
          <input className="ai-input" placeholder="Ej: cena con pollo..." value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateWithAI()} />
          <button className="ai-submit-btn" onClick={generateWithAI} disabled={aiLoading}>
            {aiLoading ? "..." : "Generar"}
          </button>
        </div>
        {aiLoading && <div className="ai-loading">Generando...</div>}
        {aiResult && !aiLoading && (
          <div className="ai-result"><div className="ai-result-text">{aiResult}</div></div>
        )}
      </div>
    </div>
  );
}
