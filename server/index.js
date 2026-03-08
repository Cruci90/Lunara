import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? "blw-dev-secret-change-in-production";

// ── Validación de la API key al arrancar ─────────────────────────────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
  console.warn("⚠️  GEMINI_API_KEY no está definida. El generador de recetas IA estará desactivado.");
}

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

app.use(express.json({ limit: "2mb" }));

// ── Middleware de autenticación ───────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado." });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

function generateId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateShareCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Auth: registro ────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, contraseña y nombre son obligatorios." });
  }
  const validRoles = ["Padre", "Madre", "Abuelo", "Abuela", "Otros"];
  const userRole = validRoles.includes(role) ? role : "Otros";

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = generateId();
  db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
    .run(id, email.toLowerCase(), hash, name, userRole);

  const token = jwt.sign({ id, email: email.toLowerCase(), name, role: userRole }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token, user: { id, email: email.toLowerCase(), name, role: userRole } });
});

// ── Auth: login ───────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña obligatorios." });
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET, { expiresIn: "30d" }
  );
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// ── Auth: datos del usuario actual ────────────────────────────────────────────
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  return res.json({ user });
});

// ── Sync: subir datos del bebé ────────────────────────────────────────────────
app.post("/api/sync/push", authMiddleware, (req, res) => {
  const { babyId, babyData } = req.body;
  if (!babyId || !babyData) {
    return res.status(400).json({ error: "Faltan datos." });
  }

  const db = getDb();

  // Verificar que el usuario tiene acceso a este bebé
  const member = db.prepare(`
    SELECT b.id FROM babies b
    LEFT JOIN baby_members bm ON bm.baby_id = b.id AND bm.user_id = ?
    WHERE b.id = ? AND (b.owner_id = ? OR bm.user_id IS NOT NULL)
  `).get(req.user.id, babyId, req.user.id);

  if (!member) {
    // Si no existe el bebé aún, crearlo
    const existingBaby = db.prepare("SELECT id FROM babies WHERE id = ?").get(babyId);
    if (!existingBaby) {
      const shareCode = generateShareCode();
      db.prepare("INSERT INTO babies (id, owner_id, share_code) VALUES (?, ?, ?)")
        .run(babyId, req.user.id, shareCode);
      db.prepare("INSERT INTO baby_members (baby_id, user_id) VALUES (?, ?)")
        .run(babyId, req.user.id);
    } else {
      return res.status(403).json({ error: "Sin acceso a este bebé." });
    }
  }

  // Upsert de datos
  db.prepare(`
    INSERT INTO baby_data (baby_id, data_json, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(baby_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at
  `).run(babyId, JSON.stringify(babyData));

  const baby = db.prepare("SELECT share_code FROM babies WHERE id = ?").get(babyId);
  return res.json({ ok: true, shareCode: baby?.share_code });
});

// ── Sync: descargar datos del bebé ────────────────────────────────────────────
app.get("/api/sync/pull/:babyId", authMiddleware, (req, res) => {
  const { babyId } = req.params;
  const db = getDb();

  const member = db.prepare(`
    SELECT b.share_code FROM babies b
    LEFT JOIN baby_members bm ON bm.baby_id = b.id AND bm.user_id = ?
    WHERE b.id = ? AND (b.owner_id = ? OR bm.user_id IS NOT NULL)
  `).get(req.user.id, babyId, req.user.id);

  if (!member) {
    return res.status(404).json({ error: "Bebé no encontrado o sin acceso." });
  }

  const row = db.prepare("SELECT data_json, updated_at FROM baby_data WHERE baby_id = ?").get(babyId);
  if (!row) {
    return res.json({ data: null, shareCode: member.share_code });
  }

  return res.json({
    data: JSON.parse(row.data_json),
    shareCode: member.share_code,
    updatedAt: row.updated_at,
  });
});

// ── Sync: listar bebés del usuario ────────────────────────────────────────────
app.get("/api/sync/babies", authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT b.id, b.share_code, b.updated_at,
           CASE WHEN b.owner_id = ? THEN 1 ELSE 0 END as is_owner
    FROM babies b
    LEFT JOIN baby_members bm ON bm.baby_id = b.id AND bm.user_id = ?
    WHERE b.owner_id = ? OR bm.user_id IS NOT NULL
  `).all(req.user.id, req.user.id, req.user.id);

  return res.json({ babies: rows });
});

// ── Sync: unirse a un bebé con código ────────────────────────────────────────
app.post("/api/sync/join", authMiddleware, (req, res) => {
  const { shareCode } = req.body;
  if (!shareCode) return res.status(400).json({ error: "Código requerido." });

  const db = getDb();
  const baby = db.prepare("SELECT id FROM babies WHERE share_code = ?").get(shareCode.toUpperCase());
  if (!baby) {
    return res.status(404).json({ error: "Código no válido o bebé no encontrado." });
  }

  const existing = db.prepare("SELECT 1 FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .get(baby.id, req.user.id);
  if (!existing) {
    db.prepare("INSERT INTO baby_members (baby_id, user_id) VALUES (?, ?)").run(baby.id, req.user.id);
  }

  const row = db.prepare("SELECT data_json FROM baby_data WHERE baby_id = ?").get(baby.id);
  return res.json({
    babyId: baby.id,
    data: row ? JSON.parse(row.data_json) : null,
  });
});

// ── Endpoint: generar receta BLW ─────────────────────────────────────────────
app.post("/api/recipe", async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: "El generador IA no está configurado. Añade GEMINI_API_KEY en el archivo .env del servidor." });
  }

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
