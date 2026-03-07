import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "blw-v5";

// ── Estructura de un bebé vacío ──────────────────────────────────────────────
export function emptyBaby(id, name = "", birthDate = "") {
  return {
    id,
    name,
    birthDate,
    prematuryNotes: "",
    familyAllergyNotes: "",
    pediatricNotes: "",
    foods: {},        // { [foodId]: { date, preparation, quantity, acceptance } }
    reactions: {},    // { [foodId]: { text, severity, date } }
    meals: {},        // { [dateStr]: { [slot]: [foodId] } }
    favorites: [],    // [recipeId]
    customFoods: [],  // [{ id, name, cat, al, at, age, em }]
    weeklyPlan: {},   // { [mondayISO]: { [dayIndex]: { [slot]: recipeId } } }
  };
}

function emptyStore() {
  return { version: 2, disclaimerAccepted: false, activeBabyId: null, babies: {} };
}

function generateId() {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Migración desde formato v1 (blw-v4) ─────────────────────────────────────
function migrateV1(old) {
  if (!old?.babyName) return null;
  const id = generateId();
  const baby = emptyBaby(id, old.babyName, old.babyBirthDate ?? "");

  // Foods v1 era { id: "dateStr" }  →  v2 es { id: { date, ... } }
  for (const [foodId, value] of Object.entries(old.introducedFoods ?? old.foods ?? {})) {
    const dateStr = typeof value === "string" ? value : value?.date ?? "";
    baby.foods[foodId] = { date: dateStr, preparation: "", quantity: "", acceptance: "" };
  }

  baby.reactions = old.reactions ?? {};
  baby.meals     = old.meals ?? {};

  return { ...emptyStore(), disclaimerAccepted: true, activeBabyId: id, babies: { [id]: baby } };
}

// ── Persistencia ─────────────────────────────────────────────────────────────
async function getBackend() {
  if (typeof window !== "undefined" && window.storage) {
    return { get: (k) => window.storage.get(k), set: (k, v) => window.storage.set(k, v) };
  }
  return {
    get: (k) => ({ value: localStorage.getItem(k) }),
    set: (k, v) => localStorage.setItem(k, v),
  };
}

async function loadFromStorage() {
  try {
    const backend = await getBackend();
    let result;

    try { result = await backend.get(STORAGE_KEY); } catch { result = null; }
    if (result?.value) {
      const parsed = JSON.parse(result.value);
      if (parsed.version === 2) return parsed;
    }

    // Intentar migrar desde v1
    for (const key of ["blw-v4", "blw-tracker-v2"]) {
      try { result = await backend.get(key); } catch { result = null; }
      if (result?.value) {
        const migrated = migrateV1(JSON.parse(result.value));
        if (migrated) {
          await backend.set(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    }
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

async function saveToStorage(store) {
  try {
    const backend = await getBackend();
    await backend.set(STORAGE_KEY, JSON.stringify(store));
  } catch { /* noop */ }
}

// ── Hook principal ───────────────────────────────────────────────────────────
export function useBLWStore() {
  const [store, setStore]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().then((s) => { setStore(s); setIsLoading(false); });
  }, []);

  const persistStore = useCallback((next) => {
    setStore(next);
    saveToStorage(next);
  }, []);

  // Baby activo (los componentes usan este objeto igual que antes usaban `data`)
  const activeBaby = store ? (store.babies[store.activeBabyId] ?? null) : null;

  // Helper: muta el bebé activo sin duplicar lógica
  function mutateBaby(updater) {
    setStore((prev) => {
      const id = prev.activeBabyId;
      if (!id || !prev.babies[id]) return prev;
      const updated = updater(structuredClone(prev.babies[id]));
      const next = { ...prev, babies: { ...prev.babies, [id]: updated } };
      saveToStorage(next);
      return next;
    });
  }

  // ── Disclaimer ───────────────────────────────────────────────────────────
  const acceptDisclaimer = useCallback(() => {
    setStore((prev) => {
      const next = { ...prev, disclaimerAccepted: true };
      saveToStorage(next);
      return next;
    });
  }, []);

  // ── Bebés ────────────────────────────────────────────────────────────────
  const addBaby = useCallback((name, birthDate, notes = {}) => {
    const id = generateId();
    const baby = emptyBaby(id, name, birthDate);
    baby.prematuryNotes     = notes.prematuryNotes     ?? "";
    baby.familyAllergyNotes = notes.familyAllergyNotes ?? "";
    baby.pediatricNotes     = notes.pediatricNotes     ?? "";
    setStore((prev) => {
      const next = { ...prev, activeBabyId: id, babies: { ...prev.babies, [id]: baby } };
      saveToStorage(next);
      return next;
    });
    return id;
  }, []);

  const updateBaby = useCallback((babyId, fields) => {
    setStore((prev) => {
      if (!prev.babies[babyId]) return prev;
      const next = { ...prev, babies: { ...prev.babies, [babyId]: { ...prev.babies[babyId], ...fields } } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setActiveBaby = useCallback((babyId) => {
    setStore((prev) => {
      const next = { ...prev, activeBabyId: babyId };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteBaby = useCallback((babyId) => {
    setStore((prev) => {
      const babies = { ...prev.babies };
      delete babies[babyId];
      const ids = Object.keys(babies);
      const next = { ...prev, activeBabyId: ids[0] ?? null, babies };
      saveToStorage(next);
      return next;
    });
  }, []);

  // ── Alimentos ────────────────────────────────────────────────────────────
  const toggleFood = useCallback((foodId) => {
    mutateBaby((baby) => {
      if (baby.foods[foodId]) {
        delete baby.foods[foodId];
        delete baby.reactions[foodId];
      } else {
        baby.foods[foodId] = {
          date: new Date().toISOString().split("T")[0],
          preparation: "", quantity: "", acceptance: "",
        };
      }
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerFoodOnDate = useCallback((foodId, dateStr, details = {}) => {
    mutateBaby((baby) => {
      if (baby.foods[foodId]) return baby;
      baby.foods[foodId] = {
        date: dateStr,
        preparation: details.preparation ?? "",
        quantity:    details.quantity    ?? "",
        acceptance:  details.acceptance  ?? "",
      };
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFoodDetails = useCallback((foodId, details) => {
    mutateBaby((baby) => {
      if (!baby.foods[foodId]) return baby;
      baby.foods[foodId] = { ...baby.foods[foodId], ...details };
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCustomFood = useCallback((food) => {
    mutateBaby((baby) => {
      baby.customFoods = [...(baby.customFoods ?? []), { ...food, id: `custom_${Date.now()}` }];
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reacciones ───────────────────────────────────────────────────────────
  const saveReaction = useCallback((foodId, text, severity) => {
    mutateBaby((baby) => {
      baby.reactions[foodId] = { text, severity, date: new Date().toISOString().split("T")[0] };
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Diario de comidas ────────────────────────────────────────────────────
  const addMeal = useCallback((dateStr, slot, foodId) => {
    mutateBaby((baby) => {
      if (!baby.meals[dateStr]) baby.meals[dateStr] = {};
      if (!baby.meals[dateStr][slot]) baby.meals[dateStr][slot] = [];
      if (!baby.meals[dateStr][slot].includes(foodId)) baby.meals[dateStr][slot].push(foodId);
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeMeal = useCallback((dateStr, slot, foodId) => {
    mutateBaby((baby) => {
      if (!baby.meals?.[dateStr]?.[slot]) return baby;
      baby.meals[dateStr][slot] = baby.meals[dateStr][slot].filter((id) => id !== foodId);
      if (!baby.meals[dateStr][slot].length) delete baby.meals[dateStr][slot];
      if (!Object.keys(baby.meals[dateStr]).length) delete baby.meals[dateStr];
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Favoritos ────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((recipeId) => {
    mutateBaby((baby) => {
      const favs = baby.favorites ?? [];
      baby.favorites = favs.includes(recipeId)
        ? favs.filter((id) => id !== recipeId)
        : [...favs, recipeId];
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Planificador semanal ─────────────────────────────────────────────────
  const setWeeklyPlanItem = useCallback((mondayISO, dayIndex, slot, recipeId) => {
    mutateBaby((baby) => {
      if (!baby.weeklyPlan[mondayISO]) baby.weeklyPlan[mondayISO] = {};
      if (!baby.weeklyPlan[mondayISO][dayIndex]) baby.weeklyPlan[mondayISO][dayIndex] = {};
      if (recipeId) baby.weeklyPlan[mondayISO][dayIndex][slot] = recipeId;
      else delete baby.weeklyPlan[mondayISO][dayIndex][slot];
      return baby;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetStore = useCallback(() => { persistStore(emptyStore()); }, [persistStore]);

  return {
    store,
    isLoading,
    activeBaby,
    persistStore,
    acceptDisclaimer,
    addBaby, updateBaby, setActiveBaby, deleteBaby,
    toggleFood, registerFoodOnDate, updateFoodDetails, addCustomFood,
    saveReaction,
    addMeal, removeMeal,
    toggleFavorite,
    setWeeklyPlanItem,
    resetStore,
  };
}
