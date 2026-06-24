const { test, expect } = require("@playwright/test");

async function onboard(page, { name = "Vega", monthsAgo = 4, wake = "07:30" } = {}) {
  await page.goto("/index.html");
  await page.fill("#onb-name", name);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  await page.fill("#onb-birth", d.toISOString().slice(0, 10));
  await page.fill("#onb-wake", wake);
  await page.click("#onb-form button[type=submit]");
  await page.waitForSelector("#main:not(.hidden)");
}

test.describe("Onboarding y cronómetro", () => {
  test("crea el perfil y calcula la edad", async ({ page }) => {
    await onboard(page, { name: "Vega", monthsAgo: 4 });
    await expect(page.locator("#baby-name")).toHaveText("Vega");
    await expect(page.locator("#baby-age")).toContainText("4-6 meses");
  });

  test("dormir / despertar cambia el estado y el temporizador", async ({ page }) => {
    await onboard(page);
    await expect(page.locator("#status-label")).toContainText("está despierto/a");
    await page.click("#sleep-toggle");
    await expect(page.locator("#status-label")).toContainText("está durmiendo");
    await expect(page.locator("#sleep-toggle")).toHaveClass(/sleeping/);
    await page.click("#sleep-toggle");
    await expect(page.locator("#status-label")).toContainText("está despierto/a");
  });

  test("clics rápidos repetidos no rompen el estado", async ({ page }) => {
    await onboard(page);
    await page.click("#sleep-toggle");
    await page.click("#sleep-toggle");
    await page.click("#sleep-toggle");
    await expect(page.locator("#status-label")).toContainText("está durmiendo");
  });
});

test.describe("Navegación", () => {
  test("las 5 pestañas se muestran correctamente", async ({ page }) => {
    await onboard(page);
    for (const view of ["log", "stats", "sounds", "profile", "today"]) {
      await page.click(`.tab[data-view="${view}"]`);
      await expect(page.locator(`#view-${view}`)).toBeVisible();
    }
  });
});

test.describe("Registro de sueño (CRUD)", () => {
  test("añadir, editar y eliminar una sesión manual", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await expect(page.locator("#modal")).toBeVisible();
    await page.selectOption("#sess-type", "nap");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator(".log-item")).toHaveCount(1);

    await page.click(".log-item");
    await expect(page.locator("#modal-title")).toHaveText("Editar sueño");
    await expect(page.locator("#sess-delete")).toBeVisible();
    await page.selectOption("#sess-type", "night");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator("#modal")).toBeHidden();

    page.once("dialog", (d) => d.accept());
    await page.click(".log-item");
    await page.click("#sess-delete");
    await expect(page.locator(".log-item")).toHaveCount(0);
  });

  test("rechaza una sesión con fin anterior al inicio", async ({ page }) => {
    await onboard(page);
    page.once("dialog", (d) => d.accept());
    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await page.fill("#sess-start", "2026-06-22T10:00");
    await page.fill("#sess-end", "2026-06-22T09:00");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator("#modal")).toBeVisible();
  });

  test("los datos persisten tras recargar", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator(".log-item")).toHaveCount(1);
    await page.reload();
    await page.click('.tab[data-view="log"]');
    await expect(page.locator(".log-item")).toHaveCount(1);
  });
});

test.describe("Reloj de 24 horas", () => {
  test("dibuja el SVG con ticks, predicción y sueño registrado", async ({ page }) => {
    await onboard(page, { monthsAgo: 4 });
    await expect(page.locator(".clock-svg")).toBeVisible();
    await expect(page.locator(".clock-tick")).toHaveCount(8); // cada 3h en 24h
    await expect(page.locator(".clock-pred")).toHaveCount(3); // 3 siestas previstas a esta edad
    await expect(page.locator(".clock-now")).toHaveCount(1);

    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await page.selectOption("#sess-type", "nap");
    await page.click("#session-form button[type=submit]");
    await page.click('.tab[data-view="today"]');
    await expect(page.locator(".clock-nap")).toHaveCount(1);
  });

  test("no lanza errores de consola al iniciar y detener el sueño", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await onboard(page);
    await page.click("#sleep-toggle");
    await page.waitForTimeout(150);
    await page.click("#sleep-toggle");
    expect(errors).toEqual([]);
  });
});

test.describe("Editar siestas desde el plan de hoy", () => {
  test("una siesta olvidada se puede confirmar y luego editar", async ({ page }) => {
    await onboard(page, { monthsAgo: 4 });
    const napCount = await page.locator(".sched-clickable").count();
    expect(napCount).toBeGreaterThan(0);

    await page.locator(".sched-clickable").first().click();
    await expect(page.locator("#modal-title")).toHaveText("Añadir sueño");
    await expect(page.locator("#sess-type")).toHaveValue("nap");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator("#modal")).toBeHidden();

    await page.click('.tab[data-view="log"]');
    await expect(page.locator(".log-item")).toHaveCount(1);

    await page.click('.tab[data-view="today"]');
    await page.locator(".sched-clickable").first().click();
    await expect(page.locator("#modal-title")).toHaveText("Editar sueño");
    await expect(page.locator("#sess-delete")).toBeVisible();
  });
});

test.describe("Tomas y pañales", () => {
  test("registrar una toma de pecho desde el registro", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="feed"]');
    await page.click("#add-session");
    await expect(page.locator("#feed-modal")).toBeVisible();
    await expect(page.locator("#feed-side-row")).toBeVisible();
    await expect(page.locator("#feed-amount-row")).toBeHidden();
    await page.selectOption("#feed-side", "right");
    await page.fill("#feed-duration", "12");
    await page.click("#feed-form button[type=submit]");
    await expect(page.locator("#feed-modal")).toBeHidden();
    await expect(page.locator("[data-feed-id]")).toHaveCount(1);
    await expect(page.locator("[data-feed-id]")).toContainText("derecho");
  });

  test("registrar un biberón muestra el campo de cantidad", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="feed"]');
    await page.click("#add-session");
    await page.selectOption("#feed-type", "bottle");
    await expect(page.locator("#feed-amount-row")).toBeVisible();
    await expect(page.locator("#feed-side-row")).toBeHidden();
    await page.fill("#feed-amount", "120");
    await page.click("#feed-form button[type=submit]");
    await expect(page.locator("[data-feed-id]")).toContainText("120 ml");
  });

  test("editar y eliminar una toma", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="feed"]');
    await page.click("#add-session");
    await page.click("#feed-form button[type=submit]");
    await page.click("[data-feed-id]");
    await expect(page.locator("#feed-modal-title")).toHaveText("Editar toma");
    page.once("dialog", (d) => d.accept());
    await page.click("#feed-delete");
    await expect(page.locator("[data-feed-id]")).toHaveCount(0);
  });

  test("registrar un pañal y verlo reflejado en el resumen de hoy", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="diaper"]');
    await page.click("#add-session");
    await expect(page.locator("#diaper-modal")).toBeVisible();
    await page.selectOption("#diaper-type", "dirty");
    await page.click("#diaper-form button[type=submit]");
    await expect(page.locator("[data-diaper-id]")).toHaveCount(1);
    await expect(page.locator("[data-diaper-id]")).toContainText("Sucio");

    await page.click('.tab[data-view="today"]');
    await expect(page.locator("#care-summary")).toContainText("1");
  });

  test("las acciones rápidas de Hoy abren los modales correspondientes", async ({ page }) => {
    await onboard(page);
    await page.click("#quick-feed");
    await expect(page.locator("#feed-modal")).toBeVisible();
    await page.click("#feed-cancel");
    await expect(page.locator("#feed-modal")).toBeHidden();

    await page.click("#quick-diaper");
    await expect(page.locator("#diaper-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#diaper-modal")).toBeHidden();
  });

  test("cada bebé mantiene tomas y pañales separados", async ({ page }) => {
    await onboard(page, { name: "Vega" });
    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="feed"]');
    await page.click("#add-session");
    await page.click("#feed-form button[type=submit]");
    await expect(page.locator("[data-feed-id]")).toHaveCount(1);

    await page.click('.tab[data-view="profile"]');
    await page.click("#add-baby-toggle");
    await page.fill("#newbaby-name", "Nova");
    const d = new Date(); d.setMonth(d.getMonth() - 2);
    await page.fill("#newbaby-birth", d.toISOString().slice(0, 10));
    await page.fill("#newbaby-wake", "08:00");
    await page.click("#add-baby-form button[type=submit]");

    await page.click('.tab[data-view="log"]');
    await page.click('.subtab[data-sub="feed"]');
    await expect(page.locator("[data-feed-id]")).toHaveCount(0);
  });
});

test.describe("Estadísticas", () => {
  test("la gráfica muestra 7 columnas", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="stats"]');
    await expect(page.locator(".chart-col")).toHaveCount(7);
  });
});

test.describe("Sonidos", () => {
  test("reproducir y detener un sonido actualiza el estado", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="sounds"]');
    await page.click('.sound-btn[data-sound="white"]');
    await expect(page.locator("#sound-status")).toContainText("Reproduciendo");
    await expect(page.locator(".sound-btn.active")).toHaveCount(1);
    await page.click('.sound-btn[data-sound="white"]');
    await expect(page.locator("#sound-status")).toContainText("Sin sonido");
  });
});

test.describe("Perfil", () => {
  test("muestra los datos guardados y permite guardar de nuevo", async ({ page }) => {
    await onboard(page, { name: "Nova" });
    await page.click('.tab[data-view="profile"]');
    await expect(page.locator("#prof-name")).toHaveValue("Nova");
    page.once("dialog", (d) => d.accept());
    await page.click("#profile-form button[type=submit]");
  });
});

test.describe("Predicción inteligente", () => {
  test("sin historial usa la estimación por edad", async ({ page }) => {
    await onboard(page, { monthsAgo: 5 });
    await page.click('.tab[data-view="profile"]');
    await expect(page.locator("#prof-windows")).toContainText("estimación orientativa");
  });

  test("con suficiente historial cambia a predicción personalizada", async ({ page }) => {
    await onboard(page, { monthsAgo: 5 });
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("lunara_state_v1"));
      const sessions = [];
      const now = new Date();
      for (let d = 10; d >= 1; d--) {
        const day = new Date(now);
        day.setDate(day.getDate() - d);
        day.setHours(0, 0, 0, 0);
        const wake = new Date(day);
        wake.setHours(7, 0, 0, 0);
        const nap1Start = new Date(wake.getTime() + 100 * 60000);
        const nap1End = new Date(nap1Start.getTime() + 50 * 60000);
        sessions.push({ id: "n1-" + d, start: nap1Start.toISOString(), end: nap1End.toISOString(), type: "nap" });
        const nap2Start = new Date(nap1End.getTime() + 110 * 60000);
        const nap2End = new Date(nap2Start.getTime() + 55 * 60000);
        sessions.push({ id: "n2-" + d, start: nap2Start.toISOString(), end: nap2End.toISOString(), type: "nap" });
        const bedStart = new Date(day);
        bedStart.setHours(19, 30, 0, 0);
        const bedEnd = new Date(day);
        bedEnd.setDate(bedEnd.getDate() + 1);
        bedEnd.setHours(7, 0, 0, 0);
        sessions.push({ id: "night-" + d, start: bedStart.toISOString(), end: bedEnd.toISOString(), type: "night" });
      }
      const baby = state.babies.find((b) => b.id === state.activeBabyId);
      baby.sessions = sessions;
      localStorage.setItem("lunara_state_v1", JSON.stringify(state));
    });
    await page.reload();
    await page.click('.tab[data-view="profile"]');
    await expect(page.locator("#prof-windows")).toContainText("calculado a partir de tu historial");
  });
});

test.describe("Multi-perfil (varios bebés)", () => {
  test("añadir un segundo bebé, cambiar entre ellos y eliminar uno", async ({ page }) => {
    await onboard(page, { name: "Vega" });
    await page.click('.tab[data-view="profile"]');

    await page.click("#add-baby-toggle");
    await page.fill("#newbaby-name", "Nova");
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    await page.fill("#newbaby-birth", d.toISOString().slice(0, 10));
    await page.fill("#newbaby-wake", "08:00");
    await page.click("#add-baby-form button[type=submit]");

    // Tras añadir, el nuevo bebé queda activo.
    await expect(page.locator("#baby-name")).toHaveText("Nova");
    await expect(page.locator(".baby-row")).toHaveCount(2);
    await expect(page.locator(".baby-row.active .baby-row-name")).toContainText("Nova");

    // Cambiar de vuelta a Vega.
    await page.click('[data-switch]');
    await expect(page.locator("#baby-name")).toHaveText("Vega");

    // Eliminar a Nova.
    page.once("dialog", (d) => d.accept());
    await page.click('.tab[data-view="profile"]');
    await page.click('.baby-row:not(.active) [data-delete]');
    await expect(page.locator(".baby-row")).toHaveCount(1);
    await expect(page.locator("#baby-name")).toHaveText("Vega");
  });

  test("cada bebé mantiene su propio registro de sueño", async ({ page }) => {
    await onboard(page, { name: "Vega" });
    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await page.click("#session-form button[type=submit]");
    await expect(page.locator(".log-item")).toHaveCount(1);

    await page.click('.tab[data-view="profile"]');
    await page.click("#add-baby-toggle");
    await page.fill("#newbaby-name", "Nova");
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    await page.fill("#newbaby-birth", d.toISOString().slice(0, 10));
    await page.fill("#newbaby-wake", "08:00");
    await page.click("#add-baby-form button[type=submit]");

    await page.click('.tab[data-view="log"]');
    await expect(page.locator(".log-item")).toHaveCount(0);

    await page.click('.tab[data-view="profile"]');
    await page.click("[data-switch]");
    await page.click('.tab[data-view="log"]');
    await expect(page.locator(".log-item")).toHaveCount(1);
  });

  test("migra automáticamente el formato antiguo de un solo bebé", async ({ page }) => {
    await page.goto("/index.html");
    await page.evaluate(() => {
      const oldState = {
        baby: { name: "Legacy", birth: "2026-02-01", wakeTime: "07:00", bedTime: "20:00" },
        sessions: [{ id: "s1", start: "2026-06-20T09:00:00.000Z", end: "2026-06-20T09:40:00.000Z", type: "nap" }],
        activeSleep: null,
      };
      localStorage.setItem("lunara_state_v1", JSON.stringify(oldState));
    });
    await page.reload();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.locator("#baby-name")).toHaveText("Legacy");
    await page.click('.tab[data-view="log"]');
    await expect(page.locator(".log-item")).toHaveCount(1);
  });
});

test.describe("Tema claro/oscuro y accesibilidad", () => {
  test("alternar tema cambia el atributo data-theme y persiste tras recargar", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="profile"]');
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.click("#theme-toggle");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("#theme-toggle")).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("las pestañas exponen aria-selected correctamente", async ({ page }) => {
    await onboard(page);
    await expect(page.locator("#tab-today")).toHaveAttribute("aria-selected", "true");
    await page.click('.tab[data-view="log"]');
    await expect(page.locator("#tab-today")).toHaveAttribute("aria-selected", "false");
    await expect(page.locator("#tab-log")).toHaveAttribute("aria-selected", "true");
  });

  test("el modal se cierra con Escape y devuelve el foco", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="log"]');
    await page.click("#add-session");
    await expect(page.locator("#modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#modal")).toBeHidden();
  });

  test("los botones de sonido reflejan aria-pressed", async ({ page }) => {
    await onboard(page);
    await page.click('.tab[data-view="sounds"]');
    const btn = page.locator('.sound-btn[data-sound="white"]');
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("PWA", () => {
  test("registra el manifest y el service worker, y cachea los assets", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "manifest.webmanifest");

    await page.waitForFunction(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.some((r) => r.active);
    });

    const cacheKeys = await page.evaluate(async () => {
      const names = await caches.keys();
      const out = {};
      for (const n of names) {
        const cache = await caches.open(n);
        out[n] = (await cache.keys()).map((r) => new URL(r.url).pathname);
      }
      return out;
    });
    const allCached = Object.values(cacheKeys).flat();
    for (const asset of ["/index.html", "/styles.css", "/app.js", "/manifest.webmanifest"]) {
      expect(allCached).toContain(asset);
    }
  });

  test("la app funciona sin conexión tras la primera carga", async ({ page, context }) => {
    await onboard(page, { name: "Offline-Test" });
    await page.waitForFunction(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.some((r) => r.active);
    });

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.locator("#baby-name")).toHaveText("Offline-Test");
    await context.setOffline(false);
  });
});
