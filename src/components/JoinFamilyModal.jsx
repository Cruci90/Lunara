import { useState } from "react";

const ROLE_EMOJIS = { Padre: "👨", Madre: "👩", Abuelo: "👴", Abuela: "👵", Otros: "🧑" };

export default function JoinFamilyModal({ onJoin, onClose, shareCode, user, onLogout }) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const result = await onJoin(code.trim().toUpperCase());
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  function copyCode() {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--t1)" }}>Familia compartida</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--t3)" }}>✕</button>
        </div>

        {/* Info del usuario */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--cs)", border: "1.5px solid var(--bd)", borderRadius: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{ROLE_EMOJIS[user.role] ?? "🧑"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>{user.role} · {user.email}</div>
            </div>
            <button
              onClick={onLogout}
              style={{ background: "none", border: "1px solid var(--bd)", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "var(--t2)", cursor: "pointer", fontFamily: "var(--ft)" }}
            >
              Salir
            </button>
          </div>
        )}

        {/* Código de familia */}
        {shareCode && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", marginBottom: 8 }}>Tu código familiar</div>
            <div
              onClick={copyCode}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "16px", background: "var(--blb)", border: "1.5px solid var(--bl)",
                borderRadius: 12, cursor: "pointer",
              }}
            >
              <span style={{ letterSpacing: 8, fontSize: 24, fontWeight: 700, color: "var(--bl)" }}>{shareCode}</span>
              <span style={{ fontSize: 13, color: "var(--bl)" }}>{copied ? "✓ Copiado" : "📋 Copiar"}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 6, textAlign: "center" }}>
              Comparte este código con tu pareja, abuelos u otros cuidadores.
            </p>
          </div>
        )}

        {/* Unirse con código */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)", marginBottom: 8 }}>
          Unirme al perfil de otro bebé
        </div>
        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className="form-input"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ textAlign: "center", letterSpacing: 8, fontSize: 22, fontWeight: 700 }}
          />
          {error && (
            <div style={{ fontSize: 13, color: "var(--rd)", background: "var(--rdb)", padding: "10px 14px", borderRadius: 10 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || code.length < 6}
            style={{
              padding: 14, background: "var(--t1)", color: "#fff", border: "none",
              borderRadius: 12, fontFamily: "var(--ft)", fontWeight: 700, fontSize: 15,
              cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
              opacity: loading || code.length < 6 ? 0.6 : 1,
            }}
          >
            {loading ? "Buscando..." : "Unirme"}
          </button>
        </form>
      </div>
    </div>
  );
}
