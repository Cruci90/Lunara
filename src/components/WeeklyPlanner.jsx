import { useState } from "react";
import { RECIPES } from "../data/recipes.js";
import { MEAL_SLOTS } from "../data/foods.js";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = domingo
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

function formatMonday(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

function addWeeks(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().split("T")[0];
}

export default function WeeklyPlanner({ data, ageMonths, onSetItem }) {
  const [monday, setMonday] = useState(getMondayOfCurrentWeek());
  const [picking, setPicking] = useState(null); // { dayIndex, slot }
  const [search, setSearch]   = useState("");

  const weekPlan = data.weeklyPlan?.[monday] ?? {};
  const availableRecipes = RECIPES.filter((r) => r.ingredients.every((id) => !!data.foods[id]) && r.age <= ageMonths);
  const filteredRecipes  = availableRecipes.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  function pickRecipe(recipeId) {
    onSetItem(monday, picking.dayIndex, picking.slot, recipeId);
    setPicking(null);
    setSearch("");
  }

  function clearSlot(dayIndex, slot) {
    onSetItem(monday, dayIndex, slot, null);
  }

  const mainSlots = MEAL_SLOTS.filter((s) => ["desayuno", "comida", "cena"].includes(s.key));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button className="calendar-nav-btn" onClick={() => setMonday(addWeeks(monday, -1))}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--t1)" }}>Semana</div>
          <div style={{ fontSize: 13, color: "var(--t3)" }}>desde el {formatMonday(monday)}</div>
        </div>
        <button className="calendar-nav-btn" onClick={() => setMonday(addWeeks(monday, 1))}>›</button>
      </div>

      {/* Grid de días */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map((dayName, dayIndex) => (
          <div key={dayIndex} style={{ background: "var(--cs)", border: "1.5px solid var(--bd)", borderRadius: "var(--rm)", padding: "12px 14px" }}>
            <div style={{ fontWeight: 700, color: "var(--t1)", fontSize: 13, marginBottom: 8 }}>{dayName}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {mainSlots.map((slot) => {
                const recipeId = weekPlan[dayIndex]?.[slot.key];
                const recipe   = recipeId ? RECIPES.find((r) => r.id === recipeId) : null;
                return (
                  <div key={slot.key} style={{ flex: 1, minWidth: 90 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".3px", marginBottom: 4 }}>
                      {slot.emoji} {slot.label}
                    </div>
                    {recipe ? (
                      <div style={{ padding: "6px 10px", background: "var(--acb)", borderRadius: 10, border: "1px solid rgba(52,199,89,.2)", cursor: "pointer" }}
                        onClick={() => clearSlot(dayIndex, slot.key)}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1B8A38", lineHeight: 1.3 }}>{recipe.name}</div>
                        <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>toca para quitar</div>
                      </div>
                    ) : (
                      <button
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 10, border: "1.5px dashed var(--bd)", background: "var(--bg)", color: "var(--t3)", fontSize: 11, cursor: "pointer", fontFamily: "var(--ft)" }}
                        onClick={() => { setPicking({ dayIndex, slot: slot.key }); setSearch(""); }}>
                        + Añadir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal picker de receta */}
      {picking && (
        <div className="modal-overlay" onClick={() => setPicking(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>
              Elegir receta — {DAYS[picking.dayIndex]}, {MEAL_SLOTS.find((s) => s.key === picking.slot)?.label}
            </div>
            <div className="search-wrap" style={{ marginBottom: 10 }}>
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Buscar receta..." value={search}
                onChange={(e) => setSearch(e.target.value)} autoFocus />
            </div>
            {filteredRecipes.length === 0 && <div className="empty-state">Sin recetas disponibles</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {filteredRecipes.map((r) => (
                <div key={r.id} className="search-result-item" onClick={() => pickRecipe(r.id)}>
                  <div style={{ flex: 1 }}>
                    <div className="search-result-name">{r.name}</div>
                    <div className="search-result-cat">{r.time} · {r.tags.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
