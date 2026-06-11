# BLW App

Aplicación web inicial para seguimiento de Baby Led Weaning (BLW): perfiles de bebé, introducción de alimentos y recetas seguras basadas en alimentos ya introducidos.

## Ejecutar en local
```bash
cd app
python3 -m http.server 4173
```
Abrir: `http://localhost:4173`

## Estado actual (MVP técnico inicial)
- Múltiples perfiles de bebé.
- Registro de introducción de alimentos con estado y aceptación.
- Historial por perfil.
- Top 10 recetas seguras con ingredientes introducidos.
- Generador de recetas por selección manual de alimentos introducidos.
- Persistencia local en `localStorage`.

## Lunara — seguimiento de sueño (estilo Napper)
App web independiente en `napper/` para el seguimiento del sueño del bebé:
- Predicción de siestas según ventanas de vigilia por edad.
- Cronómetro de sueño (dormir/despertar) y plan del día.
- Registro manual editable de siestas y noches.
- Estadísticas de los últimos 7 días con gráfica.
- Sonidos para dormir (ruido blanco/rosa/marrón y latidos) generados con Web Audio.
- Persistencia local en `localStorage`, sin dependencias ni build.

Ejecutar:
```bash
cd napper
python3 -m http.server 4180
```
Abrir: `http://localhost:4180`

## Documentación funcional
- `docs/plan-mvp-blw.md`
Especificación funcional para una app de seguimiento de Baby Led Weaning (BLW).

## Contenido
- Plan funcional MVP v2: `docs/plan-mvp-blw.md`

## Objetivo
Centralizar la introducción de alimentos, el control de alérgenos y la sugerencia de recetas seguras en función de los alimentos ya introducidos por cada bebé.
