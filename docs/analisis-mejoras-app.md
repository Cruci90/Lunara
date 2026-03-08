# Análisis del repositorio y mejoras sugeridas

## Hallazgos rápidos

1. Hay un bug en el guardado de reacciones: el modal envía `(foodId, text, severity)`, pero en `App.jsx` se estaba pasando un solo objeto intermedio al store.
2. El backend fuerza `GEMINI_API_KEY` al arrancar incluso en desarrollo sin uso de IA, lo que dificulta pruebas locales.
3. No hay suite de tests automatizados para componentes clave ni para el hook de estado principal.
4. La app depende de `localStorage` sin export/import de backups y sin estrategia de recuperación ante corrupción de datos.

## Mejoras prioritarias (Roadmap)

### P0 — Fiabilidad funcional
- Corregir flujos críticos de guardado (reacciones, calendario, favoritos) y añadir tests de regresión.
- Añadir validaciones UI para campos vacíos en modales (ej. descripción de reacción).
- Incorporar toasts de error en operaciones potencialmente fallidas.

### P1 — Calidad y mantenibilidad
- Añadir Vitest + React Testing Library para:
  - `useBLWStore` (alta/baja de bebés, toggle de alimentos, reacciones).
  - Componentes con lógica de interacción (`ReactionModal`, `FoodModal`, `WeeklyPlanner`).
- Extraer lógica de dominio de `App.jsx` a hooks/coordinadores para reducir complejidad del componente raíz.
- Estandarizar nombres (ej. `prematuryNotes` → `prematurityNotes`) con migración de datos versionada.

### P2 — UX y producto
- Mejorar accesibilidad:
  - `aria-label` en botones icónicos y modales.
  - Focus trap en modales y cierre con tecla `Escape`.
- Añadir onboarding mínimo de seguridad BLW (edad, textura, alérgenos).
- Implementar exportación/importación JSON del perfil para respaldo y cambio de dispositivo.

### P3 — Backend y seguridad
- Añadir rate limiting y timeout explícito en `/api/recipe`.
- Validar y sanear payload de entrada (schema con Zod/Joi).
- Registrar errores con trazabilidad (request id) y mensajes consistentes para cliente.

## Métricas de éxito sugeridas
- Reducción de bugs funcionales reportados en >40%.
- Cobertura de pruebas del estado principal >70%.
- Tiempo de primera receta <3 s en p50.
- Tasa de retención semanal (+7 días) con mejora de UX en onboarding.
