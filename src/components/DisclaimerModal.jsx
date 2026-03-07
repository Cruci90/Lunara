export default function DisclaimerModal({ onAccept }) {
  return (
    <div className="modal-overlay" style={{ alignItems: "center" }}>
      <div className="modal-sheet" style={{ borderRadius: 20, margin: "0 16px", maxHeight: "80vh" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>⚕️</span>
        </div>
        <h2 className="food-modal-title" style={{ marginTop: 0 }}>Aviso médico</h2>

        <div style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, marginTop: 16 }}>
          <p>
            <strong style={{ color: "var(--t1)" }}>BLW Tracker es una herramienta de seguimiento personal</strong>,
            no un sustituto del consejo médico profesional.
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Consulta siempre con tu pediatra antes de comenzar la alimentación complementaria.</li>
            <li>Ante cualquier reacción alérgica, especialmente grave, acude a urgencias.</li>
            <li>La regla de los 3 días es una guía orientativa, no un protocolo médico.</li>
            <li>Los datos se guardan solo en tu dispositivo y no se comparten con terceros.</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            background: "var(--rdb)",
            borderRadius: 10,
            border: "1px solid rgba(255,59,48,.15)",
            fontSize: 13,
            color: "var(--rd)",
            fontWeight: 600,
          }}
        >
          ⚠️ En caso de reacción alérgica severa (dificultad respiratoria, hinchazón de boca/garganta),
          llama al 112 inmediatamente.
        </div>

        <button
          className="btn-full btn-primary"
          style={{ marginTop: 24 }}
          onClick={onAccept}
        >
          Entendido, comenzar
        </button>
      </div>
    </div>
  );
}
