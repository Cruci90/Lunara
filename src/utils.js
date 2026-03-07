/** Retorna la edad del bebé en meses completos */
export function getAgeInMonths(birthDateStr) {
  if (!birthDateStr) return 6;
  const birth = new Date(birthDateStr);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
}

/** Retorna los días transcurridos desde una fecha ISO */
export function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86_400_000);
}

/** Formatea una fecha como "12 de enero" */
export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

/** Formatea una fecha como "lunes, 12 de enero" */
export function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Calcula los alimentos más frecuentes en el diario de comidas.
 * Devuelve un array de IDs ordenado por frecuencia de uso.
 */
export function getFrequentFoods(meals, maxCount = 8) {
  const counts = {};
  for (const dayMeals of Object.values(meals ?? {})) {
    for (const slotFoods of Object.values(dayMeals ?? {})) {
      if (Array.isArray(slotFoods)) {
        for (const id of slotFoods) counts[id] = (counts[id] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, maxCount);
}
