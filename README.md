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

## Documentación funcional
- `docs/plan-mvp-blw.md`
