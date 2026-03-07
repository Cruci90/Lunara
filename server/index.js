import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT ?? 3000;

// ── Validación de la API key al arrancar ─────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.error("❌  GEMINI_API_KEY no está definida en .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

// ── Endpoint: generar receta BLW ─────────────────────────────────────────────
app.post("/api/recipe", async (req, res) => {
  const { ageMonths, foods, prompt } = req.body;

  if (!Array.isArray(foods) || foods.length === 0) {
    return res.status(400).json({ error: "Lista de alimentos vacía." });
  }
  if (!prompt?.trim()) {
    return res.status(400).json({ error: "Petición vacía." });
  }

  const systemInstruction =
    "Eres un experto en Baby Led Weaning (BLW) para familias de habla hispana. " +
    "Das recetas prácticas, seguras y adaptadas a la edad del bebé. " +
    "Respondes siempre en español, sin markdown, en texto plano.";

  const userMessage =
    `Bebé de ${ageMonths} meses. ` +
    `Alimentos ya introducidos: ${foods.join(", ")}. ` +
    `Petición: "${prompt}". ` +
    `Genera UNA receta usando SOLO esos alimentos. ` +
    `Formato: Nombre, Ingredientes, Tiempo de preparación, Pasos, Consejo BLW.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const result = await model.generateContent(userMessage);
    const text   = result.response.text();

    return res.json({ recipe: text });
  } catch (err) {
    console.error("Error Gemini:", err.message);
    return res.status(502).json({ error: "Error al generar la receta. Inténtalo de nuevo." });
  }
});

// ── Servir el frontend en producción ────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(join(distPath, "index.html")));
}

app.listen(PORT, () => {
  console.log(`✅  Servidor BLW en http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`    (en desarrollo, Vite corre en :5173 y proxea /api → :${PORT})`);
  }
});
