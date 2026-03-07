import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "blw-v4";
const LEGACY_KEY = "blw-tracker-v2";

function emptyState() {
  return { babyName: "", babyBirthDate: "", foods: {}, reactions: {}, meals: {} };
}

/** Lee el estado guardado desde window.storage (Claude artifact) o localStorage */
async function loadFromStorage() {
  try {
    // Intentar con window.storage (entorno Claude artifacts)
    if (window.storage) {
      let result;
      try { result = await window.storage.get(STORAGE_KEY); } catch { result = null; }
      if (result?.value) {
        const data = JSON.parse(result.value);
        return { ...emptyState(), ...data };
      }
      // Migrar desde versión anterior
      try { result = await window.storage.get(LEGACY_KEY); } catch { result = null; }
      if (result?.value) {
        const old = JSON.parse(result.value);
        const migrated = {
          babyName: old.babyName ?? "",
          babyBirthDate: old.babyBirthDate ?? "",
          foods: old.introducedFoods ?? {},
          reactions: old.reactions ?? {},
          meals: {},
        };
        try { await window.storage.set(STORAGE_KEY, JSON.stringify(migrated)); } catch { /* noop */ }
        return migrated;
      }
    }
    // Fallback: localStorage estándar
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { ...emptyState(), ...data };
    }
    return emptyState();
  } catch {
    return emptyState();
  }
}

async function saveToStorage(data) {
  try {
    const serialized = JSON.stringify(data);
    if (window.storage) {
      await window.storage.set(STORAGE_KEY, serialized);
    } else {
      localStorage.setItem(STORAGE_KEY, serialized);
    }
  } catch { /* noop */ }
}

/**
 * Hook principal de estado de la app BLW.
 * Devuelve el estado actual y acciones para mutarlo.
 */
export function useBLWStore() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().then((loaded) => {
      setData(loaded);
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback((newData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyState();
    persist(fresh);
    return fresh;
  }, [persist]);

  // --- Acciones de alimentos ---

  const toggleFood = useCallback((foodId) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (next.foods[foodId]) {
        delete next.foods[foodId];
        delete next.reactions[foodId];
      } else {
        next.foods[foodId] = new Date().toISOString().split("T")[0];
      }
      saveToStorage(next);
      return next;
    });
  }, []);

  const registerFoodOnDate = useCallback((foodId, dateStr) => {
    setData((prev) => {
      if (prev.foods[foodId]) return prev; // ya introducido, no sobreescribir
      const next = structuredClone(prev);
      next.foods[foodId] = dateStr;
      saveToStorage(next);
      return next;
    });
  }, []);

  // --- Acciones de reacciones ---

  const saveReaction = useCallback((foodId, text, severity) => {
    setData((prev) => {
      const next = structuredClone(prev);
      next.reactions[foodId] = {
        text,
        severity,
        date: new Date().toISOString().split("T")[0],
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  // --- Acciones del diario de comidas ---

  const addMeal = useCallback((dateStr, slot, foodId) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (!next.meals[dateStr]) next.meals[dateStr] = {};
      if (!next.meals[dateStr][slot]) next.meals[dateStr][slot] = [];
      if (!next.meals[dateStr][slot].includes(foodId)) {
        next.meals[dateStr][slot].push(foodId);
      }
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeMeal = useCallback((dateStr, slot, foodId) => {
    setData((prev) => {
      const next = structuredClone(prev);
      if (!next.meals?.[dateStr]?.[slot]) return prev;
      next.meals[dateStr][slot] = next.meals[dateStr][slot].filter((id) => id !== foodId);
      if (next.meals[dateStr][slot].length === 0) delete next.meals[dateStr][slot];
      if (Object.keys(next.meals[dateStr]).length === 0) delete next.meals[dateStr];
      saveToStorage(next);
      return next;
    });
  }, []);

  return {
    data,
    isLoading,
    persist,
    reset,
    toggleFood,
    registerFoodOnDate,
    saveReaction,
    addMeal,
    removeMeal,
  };
}
