import { useState, useEffect } from "react";
import { useBLWStore } from "./hooks/useBLWStore.js";
import { useToast }    from "./hooks/useToast.js";
import { useAuth }     from "./hooks/useAuth.js";
import { useSync }     from "./hooks/useSync.js";
import { getAgeInMonths } from "./utils.js";
import { makeDateKey } from "./data/foods.js";

import DisclaimerModal  from "./components/DisclaimerModal.jsx";
import SetupScreen      from "./components/SetupScreen.jsx";
import BabySelector     from "./components/BabySelector.jsx";
import Header           from "./components/Header.jsx";
import FoodGrid         from "./components/FoodGrid.jsx";
import AllergenTab      from "./components/AllergenTab.jsx";
import CalendarTab      from "./components/CalendarTab.jsx";
import RecipesTab       from "./components/RecipesTab.jsx";
import WeeklyPlanner    from "./components/WeeklyPlanner.jsx";
import PDFExport        from "./components/PDFExport.jsx";
import FoodModal        from "./components/FoodModal.jsx";
import ReactionModal    from "./components/ReactionModal.jsx";
import DayModal         from "./components/DayModal.jsx";
import Toast            from "./components/Toast.jsx";
import AuthModal        from "./components/AuthModal.jsx";
import JoinFamilyModal  from "./components/JoinFamilyModal.jsx";

const TABS = [
  { key: "alimentos",  label: "Alimentos" },
  { key: "alergenos",  label: "Alérgenos" },
  { key: "calendario", label: "Calendario" },
  { key: "recetas",    label: "Recetas" },
  { key: "semana",     label: "Semana" },
];

export default function App() {
  const {
    store, isLoading, activeBaby,
    acceptDisclaimer,
    addBaby, updateBaby, setActiveBaby, deleteBaby,
    toggleFood, registerFoodOnDate, updateFoodDetails, addCustomFood,
    saveReaction,
    addMeal, removeMeal, setMealNote,
    toggleFavorite,
    setWeeklyPlanItem,
    resetStore,
    persistStore,
  } = useBLWStore();

  const { toast, showToast } = useToast();
  const { token, user, authError, authLoading, register, login, logout, setAuthError } = useAuth();
  const { syncStatus, shareCode, push, pull, debouncedPush, joinByCode } = useSync(token);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [showSetup,      setShowSetup]      = useState(false);
  const [showBabies,     setShowBabies]     = useState(false);
  const [showPDF,        setShowPDF]        = useState(false);
  const [showAuth,       setShowAuth]       = useState(false);
  const [showJoin,       setShowJoin]       = useState(false);
  const [activeTab,      setActiveTab]      = useState("alimentos");
  const [selectedFood,   setSelectedFood]   = useState(null);
  const [reactionModal,  setReactionModal]  = useState(null); // { foodId, existing }
  const [selectedDay,    setSelectedDay]    = useState(null);

  // ── Sync automático cuando cambian los datos del bebé activo ─────────────
  useEffect(() => {
    if (!token || !activeBaby) return;
    debouncedPush(activeBaby.id, activeBaby);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBaby]);

  // ── Pull inicial al hacer login ───────────────────────────────────────────
  useEffect(() => {
    if (!token || !activeBaby || isLoading) return;
    pull(activeBaby.id).then((serverData) => {
      if (serverData) {
        updateBaby(activeBaby.id, serverData);
        showToast("Datos sincronizados ☁️", "success");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  // ── Disclaimer ────────────────────────────────────────────────────────────
  if (!store?.disclaimerAccepted) {
    return <DisclaimerModal onAccept={acceptDisclaimer} />;
  }

  // ── Setup (primer bebé o edición de perfil) ──────────────────────────────
  if (!activeBaby || showSetup) {
    return (
      <SetupScreen
        existingBaby={showSetup && activeBaby ? activeBaby : null}
        onCancel={showSetup && activeBaby ? () => setShowSetup(false) : null}
        onStart={(name, birthDate, notes) => {
          if (showSetup && activeBaby) {
            updateBaby(activeBaby.id, { name, birthDate, ...notes });
          } else {
            addBaby(name, birthDate, notes);
          }
          setShowSetup(false);
        }}
      />
    );
  }

  const ageMonths = getAgeInMonths(activeBaby.birthDate);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleDayClick(year, month, day) {
    setSelectedDay({ year, month, day, dateStr: makeDateKey(year, month, day) });
  }

  function handleReactionClick(foodId, existing) {
    setSelectedFood(null);
    setReactionModal({ foodId, existing });
  }

  function handleReset() {
    if (window.confirm("¿Eliminar TODOS los datos? Esta acción no se puede deshacer.")) {
      resetStore();
    }
  }

  async function handleAuthSuccess() {
    setShowAuth(false);
    const serverData = await pull(activeBaby.id);
    if (serverData) {
      updateBaby(activeBaby.id, serverData);
      showToast("Datos sincronizados ☁️", "success");
    }
  }

  async function handleJoin(code) {
    const result = await joinByCode(code);
    if (result?.error) return result;
    if (result?.babyId) {
      const newId = result.babyId;
      if (store.babies[newId]) {
        if (result.data) updateBaby(newId, result.data);
        setActiveBaby(newId);
      } else if (result.data) {
        const serverBaby = { ...result.data, id: newId };
        persistStore({ ...store, activeBabyId: newId, babies: { ...store.babies, [newId]: serverBaby } });
      }
      setShowJoin(false);
      showToast("¡Unido a la familia! 👨‍👩‍👧", "success");
    }
    return null;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <Header
        data={activeBaby}
        ageMonths={ageMonths}
        babyCount={Object.keys(store.babies).length}
        onBabySelect={() => setShowBabies(true)}
        onSettingsClick={() => setShowSetup(true)}
        onExportPDF={() => setShowPDF(true)}
        user={user}
        syncStatus={syncStatus}
        shareCode={shareCode}
        onAuthClick={() => user ? setShowJoin(true) : setShowAuth(true)}
      />

      <div className="tab-bar" role="tablist" aria-label="Secciones de la aplicación">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
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
            data={activeBaby}
            ageMonths={ageMonths}
            onFoodClick={setSelectedFood}
            onAddCustomFood={(food) => { addCustomFood(food); showToast(`${food.em} ${food.name} añadido ✓`); }}
          />
        )}
        {activeTab === "alergenos" && <AllergenTab data={activeBaby} />}
        {activeTab === "calendario" && (
          <CalendarTab data={activeBaby} onDayClick={handleDayClick} />
        )}
        {activeTab === "recetas" && (
          <RecipesTab
            data={activeBaby}
            ageMonths={ageMonths}
            babyName={activeBaby.name}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activeTab === "semana" && (
          <WeeklyPlanner
            data={activeBaby}
            ageMonths={ageMonths}
            onSetItem={setWeeklyPlanItem}
          />
        )}
      </div>

      <div className="footer">
        {user && shareCode && (
          <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8, textAlign: "center" }}>
            Código familiar: <strong style={{ letterSpacing: 3, color: "var(--t2)" }}>{shareCode}</strong>
          </div>
        )}
        {user && (
          <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8, textAlign: "center" }}>
            {user.name} · {user.role} ·{" "}
            <button onClick={logout} style={{ background: "none", border: "none", color: "var(--bl)", cursor: "pointer", fontFamily: "var(--ft)", fontSize: 12 }}>
              Cerrar sesión
            </button>
          </div>
        )}
        <button className="reset-btn" onClick={handleReset}>Reiniciar datos</button>
      </div>

      {/* ── Modales ── */}
      {showBabies && (
        <BabySelector
          store={store}
          activeBaby={activeBaby}
          onSelect={setActiveBaby}
          onAdd={(name, birthDate, notes) => addBaby(name, birthDate, notes)}
          onDelete={deleteBaby}
          onClose={() => setShowBabies(false)}
        />
      )}

      <FoodModal
        food={selectedFood}
        data={activeBaby}
        onClose={() => setSelectedFood(null)}
        onToggle={(foodId) => {
          const wasIntroduced = !!activeBaby.foods[foodId];
          const food = selectedFood;
          toggleFood(foodId);
          setSelectedFood(null);
          showToast(
            wasIntroduced
              ? `${food?.em ?? ""} ${food?.name} quitado`
              : `${food?.em ?? ""} ${food?.name} introducido ✓`,
            wasIntroduced ? "info" : "success"
          );
        }}
        onUpdateDetails={(foodId, details) => {
          updateFoodDetails(foodId, details);
          showToast("Detalles guardados ✓");
        }}
        onReactionClick={handleReactionClick}
      />

      <ReactionModal
        foodId={reactionModal?.foodId ?? null}
        existingReaction={reactionModal?.existing ?? null}
        onClose={() => setReactionModal(null)}
        onSave={(foodId, data) => { saveReaction(foodId, data); setReactionModal(null); showToast("Reacción guardada", "warning"); }}
      />

      <DayModal
        selectedDay={selectedDay}
        data={activeBaby}
        onClose={() => setSelectedDay(null)}
        onRegisterFood={registerFoodOnDate}
        onAddMeal={addMeal}
        onRemoveMeal={removeMeal}
        onSetMealNote={setMealNote}
      />

      {showPDF && (
        <PDFExport
          baby={activeBaby}
          ageMonths={ageMonths}
          onClose={() => setShowPDF(false)}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthError(null); }}
          authError={authError}
          authLoading={authLoading}
          onRegister={async (...args) => { const ok = await register(...args); if (ok) handleAuthSuccess(); }}
          onLogin={async (...args) => { const ok = await login(...args); if (ok) handleAuthSuccess(); }}
        />
      )}

      {showJoin && (
        <JoinFamilyModal
          onClose={() => setShowJoin(false)}
          onJoin={handleJoin}
          shareCode={shareCode}
          user={user}
          onLogout={() => { logout(); setShowJoin(false); }}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
