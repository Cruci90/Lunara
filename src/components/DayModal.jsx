import { useState } from "react";
import { FOODS, MEAL_SLOTS, getFood } from "../data/foods.js";
import { formatFullDate } from "../utils.js";

/** Vista: resumen del día → elige acción */
function DaySummary({ dateStr, dayFoods, dayMeals, onNewFood, onMealLog }) {
  const mealSlotsWithData = MEAL_SLOTS.filter(
    (s) => dayMeals[s.key]?.length > 0
  );

  return (
    <>
      <div className="day-date">{formatFullDate(dateStr)}</div>

      {dayFoods.length > 0 && (
        <div className="day-section">
          <div className="day-section-title">Introducidos este día</div>
          <div className="chip-list">
            {dayFoods.map((f) => (
              <span key={f.id} className="chip selected">
                {f.em} {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {mealSlotsWithData.length > 0 && (
        <div className="day-section">
          <div className="day-section-title">Comidas registradas</div>
          {mealSlotsWithData.map((slot) => (
            <div key={slot.key} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
                {slot.emoji} {slot.label}
              </div>
              <div className="chip-list">
                {dayMeals[slot.key].map((id) => {
                  const food = getFood(id);
                  return food ? (
                    <span key={id} className="chip">{food.em} {food.name}</span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="day-actions">
        <button className="day-action-btn" onClick={onNewFood}>
          <div className="day-action-icon">🆕</div>
          <div className="day-action-title">Nuevo alimento</div>
          <div className="day-action-desc">Registrar primera vez</div>
        </button>
        <button className="day-action-btn" onClick={onMealLog}>
          <div className="day-action-icon">🍽️</div>
          <div className="day-action-title">Diario de comidas</div>
          <div className="day-action-desc">Qué comió hoy</div>
        </button>
      </div>
    </>
  );
}

/** Vista: registrar nuevo alimento en este día */
function RegisterFoodView({ dateStr, data, onBack, onConfirm }) {
  const [search, setSearch]  = useState("");
  const [selected, setSelected] = useState([]);

  const notIntroduced = FOODS.filter((f) => !data.foods[f.id]);
  const searchResults = search
    ? notIntroduced.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : [];

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="sub-section-title">Registrar alimento</div>
        <button className="back-btn" onClick={onBack}>← Volver</button>
      </div>

      {selected.length > 0 && (
        <div className="chip-list">
          {selected.map((id) => {
            const food = getFood(id);
            return food ? (
              <span key={id} className="chip selected" onClick={() => toggleSelect(id)}>
                {food.em} {food.name} ✕
              </span>
            ) : null;
          })}
        </div>
      )}

      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search ? (
        <div className="search-results">
          {searchResults.map((f) => {
            const isSel = selected.includes(f.id);
            return (
              <div
                key={f.id}
                className={`search-result-item${isSel ? " selected-item" : ""}`}
                onClick={() => toggleSelect(f.id)}
              >
                <div className="search-result-emoji">{f.em}</div>
                <div>
                  <div className="search-result-name">{f.name}</div>
                  <div className="search-result-cat">{f.cat}{f.al ? " · ⚠️" : ""}</div>
                </div>
              </div>
            );
          })}
          {searchResults.length === 0 && (
            <div className="empty-state" style={{ padding: 16 }}>Sin resultados</div>
          )}
        </div>
      ) : (
        <div>
          <div className="day-section-title">Pendientes</div>
          <div className="chip-list">
            {notIntroduced.slice(0, 16).map((f) => {
              const isSel = selected.includes(f.id);
              return (
                <span
                  key={f.id}
                  className={`chip${isSel ? " selected" : ""}`}
                  onClick={() => toggleSelect(f.id)}
                >
                  {f.em} {f.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <button
          className="btn-full btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => onConfirm(selected, dateStr)}
        >
          Registrar {selected.length} alimento{selected.length > 1 ? "s" : ""}
        </button>
      )}
    </>
  );
}

/** Vista: diario de comidas */
function MealLogView({ dateStr, data, onBack, onAdd, onRemove }) {
  const [openSlot, setOpenSlot] = useState(null);
  const [slotSearch, setSlotSearch] = useState("");

  const dayMeals = data.meals?.[dateStr] ?? {};
  const introducedIds = Object.keys(data.foods);

  // Alimentos frecuentes basados en historial
  const counts = {};
  for (const dm of Object.values(data.meals ?? {})) {
    for (const arr of Object.values(dm ?? {})) {
      if (Array.isArray(arr)) arr.forEach((id) => { counts[id] = (counts[id] ?? 0) + 1; });
    }
  }
  const frequentIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 8);

  const searchResults = slotSearch
    ? FOODS.filter(
        (f) =>
          !!data.foods[f.id] &&
          f.name.toLowerCase().includes(slotSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="sub-section-title">Diario de comidas</div>
        <button className="back-btn" onClick={() => { onBack(); setOpenSlot(null); }}>
          ← Volver
        </button>
      </div>

      <div className="meal-slots">
        {MEAL_SLOTS.map((slot) => {
          const slotFoods = dayMeals[slot.key] ?? [];
          const isOpen = openSlot === slot.key;

          return (
            <div key={slot.key} className="meal-slot">
              <div
                className="meal-slot-header"
                onClick={() => {
                  setOpenSlot(isOpen ? null : slot.key);
                  setSlotSearch("");
                }}
              >
                <div className="meal-slot-emoji">{slot.emoji}</div>
                <div className="meal-slot-label">{slot.label}</div>
                {slotFoods.length > 0 && (
                  <div className="meal-slot-count">{slotFoods.length}</div>
                )}
                <span className="meal-slot-toggle">{isOpen ? "▲" : "▼"}</span>
              </div>

              {slotFoods.length > 0 && (
                <div className="meal-slot-foods">
                  {slotFoods.map((id) => {
                    const food = getFood(id);
                    return food ? (
                      <span key={id} className="meal-food-chip">
                        {food.em} {food.name}
                        <span
                          className="meal-food-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(dateStr, slot.key, id);
                          }}
                        >
                          ✕
                        </span>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {isOpen && (
                <div className="meal-slot-body">
                  <input
                    className="meal-search-input"
                    placeholder="Buscar..."
                    value={slotSearch}
                    onChange={(e) => setSlotSearch(e.target.value)}
                  />

                  {!slotSearch && (
                    <>
                      <div className="day-section-title">Frecuentes</div>
                      <div className="food-suggestion-list">
                        {frequentIds
                          .filter((id) => !slotFoods.includes(id) && data.foods[id])
                          .map((id) => {
                            const food = getFood(id);
                            return food ? (
                              <span
                                key={id}
                                className="food-suggestion-chip"
                                onClick={() => onAdd(dateStr, slot.key, id)}
                              >
                                {food.em} {food.name}
                              </span>
                            ) : null;
                          })}
                      </div>
                      <div className="day-section-title" style={{ marginTop: 8 }}>Todos</div>
                      <div className="food-suggestion-list">
                        {introducedIds
                          .filter((id) => !slotFoods.includes(id) && !frequentIds.includes(id))
                          .slice(0, 12)
                          .map((id) => {
                            const food = getFood(id);
                            return food ? (
                              <span
                                key={id}
                                className="food-suggestion-chip"
                                onClick={() => onAdd(dateStr, slot.key, id)}
                              >
                                {food.em} {food.name}
                              </span>
                            ) : null;
                          })}
                      </div>
                    </>
                  )}

                  {slotSearch && (
                    <div className="search-results">
                      {searchResults
                        .filter((f) => !slotFoods.includes(f.id))
                        .map((f) => (
                          <div
                            key={f.id}
                            className="search-result-item"
                            onClick={() => {
                              onAdd(dateStr, slot.key, f.id);
                              setSlotSearch("");
                            }}
                          >
                            <div className="search-result-emoji">{f.em}</div>
                            <div>
                              <div className="search-result-name">{f.name}</div>
                              <div className="search-result-cat">{f.cat}</div>
                            </div>
                          </div>
                        ))}
                      {searchResults.filter((f) => !slotFoods.includes(f.id)).length === 0 && (
                        <div className="empty-state" style={{ padding: 12 }}>Sin resultados</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DayModal({ selectedDay, data, onClose, onRegisterFood, onAddMeal, onRemoveMeal }) {
  const [view, setView] = useState("summary"); // "summary" | "register" | "meals"

  if (!selectedDay) return null;

  const { year, month, day, dateStr } = selectedDay;

  // Alimentos introducidos en este día
  const dayFoods = Object.entries(data.foods)
    .filter(([, ds]) => {
      const d = new Date(ds);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    })
    .map(([id]) => getFood(id))
    .filter(Boolean);

  const dayMeals = data.meals?.[dateStr] ?? {};

  function handleConfirmRegister(ids, ds) {
    ids.forEach((id) => onRegisterFood(id, ds));
    setView("summary");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        {view === "summary" && (
          <DaySummary
            dateStr={dateStr}
            dayFoods={dayFoods}
            dayMeals={dayMeals}
            onNewFood={() => setView("register")}
            onMealLog={() => setView("meals")}
          />
        )}

        {view === "register" && (
          <RegisterFoodView
            dateStr={dateStr}
            data={data}
            onBack={() => setView("summary")}
            onConfirm={handleConfirmRegister}
          />
        )}

        {view === "meals" && (
          <MealLogView
            dateStr={dateStr}
            data={data}
            onBack={() => setView("summary")}
            onAdd={onAddMeal}
            onRemove={onRemoveMeal}
          />
        )}
      </div>
    </div>
  );
}
