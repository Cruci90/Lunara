# BLW App — Especificación funcional (MVP v2)

Esta versión incorpora decisiones cerradas a partir de tus respuestas para pasar de una idea general a una especificación accionable.

## 1) Decisiones de producto (cerradas)

## Alcance y usuarios
- Edad objetivo: desde **6 meses en adelante**.
- Perfiles: **múltiples bebés** (incluye hermanos/gemelos).
- Uso colaborativo: **varios cuidadores** por perfil.
- Tipo de proyecto: personal, **modelo gratuito**.
- Métrica principal inicial: **número de alimentos introducidos**.

## Salud y seguridad
- Registrar datos de salud: prematuridad, antecedentes familiares de alergias y recomendaciones pediátricas.
- Incluir disclaimer médico y mensajes de seguridad (no sustituye al pediatra).
- Gestión de evento alérgico:
  - registro de síntomas,
  - nivel de reacción,
  - recomendación de consultar pediatra/urgencias.

## Seguimiento de alimentos
- Campos por introducción:
  - fecha,
  - forma (triturado, bastones, cocido, crudo, horno...),
  - cantidad aproximada,
  - reacción observada,
  - aceptación (le gustó / no le gustó).
- Estados de alimento:
  - no introducido,
  - en prueba,
  - introducido,
  - reacción,
  - evitado.
- Catálogo de alimentos:
  - lista predeterminada,
  - opción de añadir alimentos manualmente.
- Categorías visibles (frutas, verduras, cereales, legumbres, proteínas, lácteos, frutos secos, etc.).

## Alérgenos
- Base oficial: **14 alérgenos UE**.
- Extensible: opción de añadir alérgenos manuales.
- Recetas:
  - sugerir 10 recetas solo con alimentos introducidos,
  - opción para seleccionar alimentos ya introducidos y generar recetas basadas en esa selección,
  - excluir alérgenos pendientes.

## Recetas inteligentes
- Criterios:
  - solo alimentos introducidos,
  - exclusión de alérgenos pendientes,
  - edad del bebé,
  - textura por etapa (blando, aplastable, finger food).
- Modos de tiempo:
  - rápidas (<15 min),
  - elaboradas,
  - batch cooking semanal.
- Extras:
  - información nutricional básica (hierro, proteínas, vitamina C),
  - favoritos,
  - planificación semanal.

## Plataforma y experiencia
- Plataformas objetivo: **web + móvil**.
- Idiomas iniciales: **español, euskera, inglés**.
- Notificaciones push: sí.
- Modo offline: sí.
- Reportes para pediatra: exportación PDF.

## Privacidad
- Fase inicial: almacenamiento **solo local**.
- Control de usuario: exportar/eliminar datos fácilmente.

---

## 2) Dos propuestas de UX para validar

## Opción A — Checklist visual (rápida y accionable)
**Cuándo encaja mejor:** familias que quieren ver “qué falta por introducir” de un vistazo.

Pantallas clave:
1. Dashboard con progreso por categorías.
2. Lista de alimentos con estados (chips de color).
3. Flujo rápido de “Registrar introducción” en 1 minuto.
4. Recetas con filtros y semáforo de seguridad.

Ventajas:
- Muy clara para objetivos semanales.
- Reduce fricción de registro diario.

Riesgos:
- Menos contexto histórico detallado si no se complementa con timeline.

## Opción B — Diario cronológico (contexto y trazabilidad)
**Cuándo encaja mejor:** familias que priorizan historial clínico/completo por fechas.

Pantallas clave:
1. Timeline por días/semanas.
2. Cada evento incluye alimentos, textura, cantidad, reacción y aceptación.
3. Ficha de alimento con historial completo de exposiciones.
4. Recetas y planificación vinculadas al historial.

Ventajas:
- Mejor seguimiento longitudinal.
- Útil para compartir con pediatra.

Riesgos:
- Puede resultar más lento para registrar rápidamente.

## Recomendación
Implementar un híbrido:
- Home en formato checklist (acción rápida),
- módulo de historial en formato diario (profundidad clínica).

---

## 3) Mapa de pantallas MVP v2

1. Onboarding + consentimiento/disclaimer.
2. Selector/gestión de perfiles de bebé.
3. Dashboard (resumen semanal + CTA registrar comida).
4. Catálogo de alimentos (lista base + añadir nuevos).
5. Registro de comida/introducción.
6. Eventos alérgicos y síntomas.
7. Recetas sugeridas (top 10 seguras).
8. “Generar receta con mis alimentos” (selección manual).
9. Detalle de receta + adaptación por textura + nutrición.
10. Favoritos + planificador semanal + lista de compra.
11. Historial/diario cronológico.
12. Reportes PDF para pediatra.
13. Ajustes: idiomas, notificaciones, privacidad y datos.

---

## 4) Modelo de datos inicial (v2)

> Propuesta relacional compatible con SQLite (fase local) y migrable a PostgreSQL.

### `caregivers`
- `id` (uuid, pk)
- `name` (text)
- `role` (text, nullable)
- `locale` (text)
- `created_at` (timestamp)

### `babies`
- `id` (uuid, pk)
- `name` (text)
- `birth_date` (date)
- `prematurity_notes` (text, nullable)
- `family_allergy_notes` (text, nullable)
- `pediatric_recommendations` (text, nullable)
- `created_at` (timestamp)

### `baby_caregivers`
- `baby_id` (uuid, fk -> babies.id)
- `caregiver_id` (uuid, fk -> caregivers.id)
- `permission` (enum: owner, editor, viewer)
- PK compuesto (`baby_id`, `caregiver_id`)

### `allergens`
- `id` (uuid, pk)
- `name` (text)
- `source` (enum: eu14, custom)
- `created_at` (timestamp)

### `foods`
- `id` (uuid, pk)
- `name` (text)
- `category` (text)
- `default_allergen_id` (uuid, nullable, fk -> allergens.id)
- `is_custom` (boolean)
- `created_at` (timestamp)

### `food_introductions`
- `id` (uuid, pk)
- `baby_id` (uuid, fk -> babies.id)
- `food_id` (uuid, fk -> foods.id)
- `introduced_on` (date)
- `preparation` (text)
- `quantity_note` (text)
- `acceptance` (enum: liked, neutral, disliked)
- `status` (enum: not_introduced, in_trial, introduced, reaction, avoided)
- `reaction_level` (enum: none, mild, moderate, severe)
- `notes` (text, nullable)
- `created_by` (uuid, fk -> caregivers.id)
- `created_at` (timestamp)

### `allergic_events`
- `id` (uuid, pk)
- `baby_id` (uuid, fk -> babies.id)
- `food_id` (uuid, nullable, fk -> foods.id)
- `symptoms` (text)
- `reaction_level` (enum: mild, moderate, severe)
- `recommended_action` (text)
- `event_at` (timestamp)
- `created_by` (uuid, fk -> caregivers.id)

### `recipes`
- `id` (uuid, pk)
- `title` (text)
- `min_age_months` (int)
- `difficulty` (enum: quick, elaborate, batch)
- `prep_minutes` (int)
- `texture_stage` (enum: soft, mashable, finger_food)
- `nutrition_iron` (text, nullable)
- `nutrition_protein` (text, nullable)
- `nutrition_vitamin_c` (text, nullable)
- `instructions` (text)
- `created_at` (timestamp)

### `recipe_ingredients`
- `recipe_id` (uuid, fk -> recipes.id)
- `food_id` (uuid, fk -> foods.id)
- `amount_note` (text, nullable)
- PK compuesto (`recipe_id`, `food_id`)

### `recipe_favorites`
- `id` (uuid, pk)
- `baby_id` (uuid, fk -> babies.id)
- `recipe_id` (uuid, fk -> recipes.id)
- `created_at` (timestamp)

### `meal_plans`
- `id` (uuid, pk)
- `baby_id` (uuid, fk -> babies.id)
- `week_start` (date)
- `notes` (text, nullable)

### `meal_plan_items`
- `meal_plan_id` (uuid, fk -> meal_plans.id)
- `recipe_id` (uuid, fk -> recipes.id)
- `day_of_week` (int)
- `meal_slot` (text, nullable)
- PK compuesto (`meal_plan_id`, `recipe_id`, `day_of_week`)

---

## 5) Reglas de negocio (v2)

1. El sistema prioriza recetas con ingredientes 100% introducidos para ese bebé.
2. El motor devuelve un **Top 10** de recetas seguras por defecto.
3. Si el usuario selecciona alimentos introducidos manualmente, las recetas se generan solo con ese subconjunto.
4. Alérgenos pendientes quedan excluidos en modo seguro.
5. Reacciones moderadas o severas disparan alerta visible y recomendación de consulta médica.
6. El estado final de alimento se calcula por última exposición y eventos asociados.
7. Toda acción importante se guarda con cuidador responsable (`created_by`).

---

## 6) Roadmap de implementación (4 semanas)

### Semana 1 — Base + datos locales
- Estructura de app web/móvil compartida.
- Base de datos local y migraciones iniciales.
- Onboarding, perfiles múltiples y disclaimer.
- Seed de alimentos y alérgenos UE14.

### Semana 2 — Registro completo
- Alta de introducciones con preparación, cantidad, aceptación y reacción.
- Eventos alérgicos y recomendaciones.
- Dashboard con métricas de progreso.
- Timeline/diario inicial.

### Semana 3 — Recetas inteligentes
- Motor top 10 seguro.
- Generador por selección manual de alimentos introducidos.
- Filtros por tiempo (quick/elaborate/batch), edad y textura.
- Favoritos y borrador de planificación semanal.

### Semana 4 — Calidad y salida
- Exportación PDF para pediatra.
- Notificaciones push y ajuste de idioma ES/EU/EN.
- Modo offline (lectura + alta pendiente de sincronizar).
- Pulido UX y checklist de privacidad/exportación/borrado.

---

## 7) Backlog post-MVP
- Sincronización cloud cifrada (opt-in).
- Multi-dispositivo en tiempo real.
- Recomendaciones más avanzadas de nutrición.
- Integración con escaneo de productos.
