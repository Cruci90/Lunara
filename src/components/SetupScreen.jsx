export default function SetupScreen({ data, onChange, onStart }) {
  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-icon">🥦</div>
        <h1 className="setup-title">BLW Tracker</h1>
        <p className="setup-subtitle">Seguimiento de alimentación complementaria</p>

        <div className="setup-form">
          <label className="form-label">Nombre del bebé</label>
          <input
            className="form-input"
            placeholder="Lucía"
            value={data.babyName}
            onChange={(e) => onChange({ ...data, babyName: e.target.value })}
          />

          <label className="form-label">Fecha de nacimiento</label>
          <input
            className="form-input"
            type="date"
            value={data.babyBirthDate}
            onChange={(e) => onChange({ ...data, babyBirthDate: e.target.value })}
          />

          <button
            className="setup-button"
            disabled={!data.babyName || !data.babyBirthDate}
            onClick={onStart}
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
