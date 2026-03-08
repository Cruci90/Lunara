import { useState } from "react";

const ROLES = ["Padre", "Madre", "Abuelo", "Abuela", "Otros"];
const ROLE_EMOJIS = { Padre: "👨", Madre: "👩", Abuelo: "👴", Abuela: "👵", Otros: "🧑" };

export default function AuthModal({ onAuth, onClose, authError, authLoading, onRegister, onLogin }) {
  const [mode,     setMode]     = useState("login"); // "login" | "register"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [role,     setRole]     = useState("Padre");

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      await onLogin(email, password);
    } else {
      await onRegister(email, password, name, role);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "85vh", overflowY: "auto" }}>
        <div className="modal-handle" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--t1)" }}>
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta familiar"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--t3)" }}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 20, lineHeight: 1.5 }}>
          {mode === "login"
            ? "Inicia sesión para sincronizar los datos entre dispositivos y compartir con la familia."
            : "Crea tu cuenta familiar para sincronizar datos y que todos puedan añadir información."}
        </p>

        {/* Selector modo */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid",
                borderColor: mode === m ? "var(--bl)" : "var(--bd)",
                background: mode === m ? "var(--blb)" : "transparent",
                color: mode === m ? "var(--bl)" : "var(--t2)",
                fontFamily: "var(--ft)", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              {m === "login" ? "Entrar" : "Registrarme"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <>
              <div>
                <label className="form-label">Tu nombre</label>
                <input className="form-input" placeholder="María" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Soy...</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ROLES.map((r) => (
                    <button
                      key={r} type="button"
                      onClick={() => setRole(r)}
                      style={{
                        padding: "8px 14px", borderRadius: 20, border: "1.5px solid",
                        borderColor: role === r ? "var(--ac)" : "var(--bd)",
                        background: role === r ? "var(--acb)" : "transparent",
                        color: role === r ? "var(--ac)" : "var(--t2)",
                        fontFamily: "var(--ft)", fontWeight: 600, fontSize: 13, cursor: "pointer",
                      }}
                    >
                      {ROLE_EMOJIS[r]} {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="tu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {authError && (
            <div style={{ fontSize: 13, color: "var(--rd)", background: "var(--rdb)", padding: "10px 14px", borderRadius: 10 }}>
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            style={{
              padding: "14px", background: "var(--t1)", color: "#fff",
              border: "none", borderRadius: 12, fontFamily: "var(--ft)",
              fontWeight: 700, fontSize: 15, cursor: authLoading ? "not-allowed" : "pointer",
              opacity: authLoading ? 0.7 : 1, marginTop: 4,
            }}
          >
            {authLoading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
