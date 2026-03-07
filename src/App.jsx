import { useState } from "react";
import { useBLWStore } from "./hooks/useBLWStore.js";
import { getAgeInMonths } from "./utils.js";
import { makeDateKey } from "./data/foods.js";

import SetupScreen    from "./components/SetupScreen.jsx";
import Header         from "./components/Header.jsx";
import FoodGrid       from "./components/FoodGrid.jsx";
import AllergenTab    from "./components/AllergenTab.jsx";
import CalendarTab    from "./components/CalendarTab.jsx";
import RecipesTab     from "./components/RecipesTab.jsx";
import FoodModal      from "./components/FoodModal.jsx";
import ReactionModal  from "./components/ReactionModal.jsx";
import DayModal       from "./components/DayModal.jsx";

const TABS = [
  { key: "alimentos",  label: "Alimentos" },
  { key: "alergenos",  label: "Alérgenos" },
  { key: "calendario", label: "Calendario" },
  { key: "recetas",    label: "Recetas" },
];

export default function App() {
  const {
    data, isLoading, persist,
    reset, toggleFood, registerFoodOnDate, saveReaction, addMeal, removeMeal,
  } = useBLWStore();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showSetup,   setShowSetup]   = useState(false);
  const [activeTab,   setActiveTab]   = useState("alimentos");
  const [selectedFood, setSelectedFood] = useState(null);   // para FoodModal
  const [reactionModal, setReactionModal] = useState(null); // { foodId, existing }
  const [selectedDay,   setSelectedDay]   = useState(null); // para DayModal

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F5F5F7", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🥦</div>
          <div style={{ marginTop: 12, fontSize: 15, color: "#AEAEB2" }}>Cargando...</div>
        </div>
      </div>
    );
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (showSetup || !data?.babyName) {
    return (
      <SetupScreen
        data={data ?? { babyName: "", babyBirthDate: "" }}
        onChange={(updated) => persist({ ...data, ...updated })}
        onStart={() => {
          persist(data);
          setShowSetup(false);
        }}
      />
    );
  }

  const ageMonths = getAgeInMonths(data.babyBirthDate);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleDayClick(year, month, day) {
    setSelectedDay({ year, month, day, dateStr: makeDateKey(year, month, day) });
  }

  function handleReactionClick(foodId, existing) {
    setSelectedFood(null);
    setReactionModal({ foodId, existing });
  }

  function handleToggleFood(foodId) {
    toggleFood(foodId);
    setSelectedFood(null);
  }

  function handleReset() {
    if (window.confirm("¿Eliminar todos los datos? Esta acción no se puede deshacer.")) {
      reset();
      setShowSetup(true);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Header
        data={data}
        ageMonths={ageMonths}
        onSettingsClick={() => setShowSetup(true)}
      />

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "alimentos" && (
          <FoodGrid
            data={data}
            ageMonths={ageMonths}
            onFoodClick={setSelectedFood}
          />
        )}
        {activeTab === "alergenos" && (
          <AllergenTab data={data} />
        )}
        {activeTab === "calendario" && (
          <CalendarTab data={data} onDayClick={handleDayClick} />
        )}
        {activeTab === "recetas" && (
          <RecipesTab
            data={data}
            ageMonths={ageMonths}
            babyName={data.babyName}
          />
        )}
      </div>

      <div className="footer">
        <button className="reset-btn" onClick={handleReset}>
          Reiniciar datos
        </button>
      </div>

      {/* Modales */}
      <FoodModal
        food={selectedFood}
        data={data}
        onClose={() => setSelectedFood(null)}
        onToggle={handleToggleFood}
        onReactionClick={handleReactionClick}
      />

      <ReactionModal
        foodId={reactionModal?.foodId ?? null}
        existingReaction={reactionModal?.existing ?? null}
        onClose={() => setReactionModal(null)}
        onSave={(foodId, text, severity) => saveReaction(foodId, text, severity)}
      />

      <DayModal
        selectedDay={selectedDay}
        data={data}
        onClose={() => setSelectedDay(null)}
        onRegisterFood={registerFoodOnDate}
        onAddMeal={addMeal}
        onRemoveMeal={removeMeal}
      />
    </div>
  );
}
