# Lunara

Lunara es una app web de seguimiento del sueño del bebé (clon estilo Napper): predicción de siestas, cronómetro de sueño, registro editable, estadísticas y sonidos para dormir.

## Ejecutar en local
```bash
cd napper
python3 -m http.server 4180
```
Abrir: `http://localhost:4180`

## Funcionalidades
- Predicción de siestas según ventanas de vigilia por edad del bebé.
- Cronómetro de sueño (dormir/despertar) y plan del día, con siestas editables desde el propio plan.
- Registro manual editable de siestas y noches, agrupado por día.
- Estadísticas de los últimos 7 días con gráfica de barras.
- Sonidos para dormir (ruido blanco/rosa/marrón y latidos) generados con Web Audio.
- App estática sin dependencias ni build, persistencia local en `localStorage`.
