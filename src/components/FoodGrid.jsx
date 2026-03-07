import { useState } from "react";
import { FOODS } from "../data/foods.js";
import { daysSince } from "../utils.js";

const CHECK_SVG = (
  <svg viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FILTERS = [
  { key: "todos",        label: "Todos" },
  { key: "introducidos", label: "Introducidos" },
  { key: "pendientes",   label: "Pendientes" },
  { key: "alergenos",    label: "Alérgenos" },
];

function getFoodDate(entry) {
  return typeof entry === "string" ? entry : entry?.date ?? "";
}

export default function FoodGrid({ data, ageMonths, onFoodClick, onAddCustomFood }) {
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("todos");
  const [catFilter, setCatFilter] = useState("Todas");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName]       = useState("");
  const [customEmoji, setCustomEmoji]     = useState("🍽️");
  const [customCat, setCustomCat]         = useState("Otros");
  const [customAge, setCustomAge]         = useState(6);
  const [customAl, setCustomAl]           = useState(false);

  // Catálogo base + personalizados del bebé
  const allFoods = [...FOODS, ...(data.customFoods ?? [])];
  const categories = ["Todas", ...new Set(allFoods.map((f) => f.cat))];

  const filtered = allFoods.filter((f) => {
    if (filter === "introducidos" && !data.foods[f.id]) return false;
    if (filter === "pendientes"   &&  data.foods[f.id]) return false;
    if (filter === "alergenos"    && !f.al)             return false;
    if (catFilter !== "Todas"     && f.cat !== catFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAddCustom() {
    if (!customName.trim()) return;
    onAddCustomFood({ name: customName.trim(), cat: customCat, em: customEmoji, age: Number(customAge), al: customAl, at: customAl ? "Personalizado" : "" });
    setCustomName(""); setCustomEmoji("🍽️"); setCustomAl(false); setShowAddCustom(false);
  }

  return (
    <div>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Buscar alimento..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f.key} className={"pill-btn" + (filter === f.key ? " active" : "")} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <button className={"pill-btn" + (showAddCustom ? " active" : "")} onClick={() => setShowAddCustom((v) => !v)}>
          + Personalizado
        </button>
      </div>

      {showAddCustom && (
        <div style={{ padding: "14px 16px", background: "var(--cs)", border: "1.5px solid var(--bd)", borderRadius: "var(--rm)", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>Añadir alimento personalizado</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input className="search-input" style={{ flex: 1 }} placeholder="Nombre" value={customName}
              onChange={(e) => setCustomName(e.target.value)} />
            <input className="search-input" style={{ width: 60, textAlign: "center", fontSize: 22 }} placeholder="🍽️" value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select className="search-input" style={{ flex: 1 }} value={customCat} onChange={(e) => setCustomCat(e.target.value)}>
              {["Frutas","Verduras","Cereales","Proteínas","Pescado","Lácteos","Frutos secos","Otros"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input className="search-input" style={{ width: 70 }} type="number" min={4} max={24} placeholder="Edad mín." value={customAge}
              onChange={(e) => setCustomAge(e.target.value)} />
          </div>
          <label style={{ fontSize: 13, color: "var(--t2)", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <input type="checkbox" checked={customAl} onChange={(e) => setCustomAl(e.target.checked)} />
            Es alérgeno
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-full" style={{ background: "var(--bg)", color: "var(--t2)", border: "1.5px solid var(--bd)" }}
              onClick={() => setShowAddCustom(false)}>Cancelar</button>
            <button className="btn-full btn-primary" disabled={!customName.trim()} onClick={handleAddCustom}>Añadir</button>
          </div>
        </div>
      )}

      <div className="filter-row">
        {categories.map((cat) => (
          <button key={cat} className={"pill-btn sm" + (catFilter === cat ? " active" : "")} onClick={() => setCatFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="food-grid">
        {filtered.map((food) => {
          const entry        = data.foods[food.id];
          const isIntroduced = !!entry;
          const hasReaction  = !!data.reactions[food.id];
          const isTooYoung   = food.age > ageMonths;
          const isTesting    = isIntroduced && food.al && daysSince(getFoodDate(entry)) < 3;

          let cardClass = "food-card";
          if (isTooYoung)        cardClass += " too-young";
          else if (hasReaction)  cardClass += " reaction";
          else if (isTesting)    cardClass += " testing";
          else if (isIntroduced) cardClass += " introduced";

          return (
            <div key={food.id} className={cardClass} onClick={() => !isTooYoung && onFoodClick(food)}>
              <div className="food-emoji">{food.em}</div>
              <div className="food-name">{food.name}</div>
              {food.al      && <div className="food-allergen-badge">⚠️</div>}
              {isIntroduced && <div className="food-check">{CHECK_SVG}</div>}
              {isTooYoung   && <div className="food-age-badge">+{food.age}m</div>}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">Sin resultados</div>}
    </div>
  );
}
