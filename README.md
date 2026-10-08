# Lunara

Lunara es una app web de seguimiento del sueño del bebé (clon estilo Napper): predicción de siestas, plan del día que se adapta a lo que registras, cronómetro de sueño, tomas y pañales, estadísticas y sonidos para dormir. Es una app estática (HTML, CSS y JavaScript sin build) instalable como PWA y que funciona sin conexión.

## Ejecutar en local
```bash
cd napper
python3 -m http.server 4180
```
Abrir: `http://localhost:4180`

## Funcionalidades
- **Hoy**
  - Cronómetro de sueño (dormir/despertar) con la ventana de sueño recomendada.
  - Corrección de la hora de inicio y del tipo de un sueño en curso.
  - Plan del día que parte de la hora real de despertar, muestra las siestas hechas y la que está en curso, y prevé solo las que caben antes de dormir. Las siestas del plan se pueden confirmar o editar.
  - Reloj circular de 24 horas con lo previsto y lo registrado.
  - Despertares nocturnos: al despertarse de noche, «Volver a dormir» continúa la misma noche.
  - Aviso cuando el bebé parece estar pasando a hacer menos siestas.
- **Predicción**: por edad y, con historial suficiente, según los datos reales del bebé.
- **Registro**: sueño, tomas (pecho o biberón) y pañales, con añadir, editar y borrar.
- **Datos**: gráfica de 7 o 30 días, medias de sueño, despertares por noche y horas medias de acostarse y de despertar.
- **Sonidos**: ruido blanco, rosa y marrón, latidos, lluvia, bosque y nana, generados con Web Audio en bucle, con volumen y temporizador.
- **Perfil**
  - Varios bebés por dispositivo y modo claro u oscuro.
  - Avisos antes de la siesta y de la hora de dormir.
  - Compartir los datos con otro cuidador e importarlos (los registros se combinan).
  - Exportar y borrar los datos.

Los datos se guardan en el navegador (`localStorage`). Al no haber servidor:
- Los avisos solo salen mientras la app esté abierta o en segundo plano.
- Compartir con otro cuidador consiste en intercambiar un archivo, no hay sincronización automática.

## Tests
Pruebas E2E con Playwright:
```bash
cd napper
npm ci
npx playwright install chromium
npm test
```
