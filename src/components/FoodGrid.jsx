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

export default function FoodGrid({ data, ageMonths, onFoodClick }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("todos");
  const [catFilter, setCatFilter] = useState("Todas");

  // Categorías disponibles
  const categories = ["Todas", ...new Set(FOODS.map((f) => f.cat))];

  const filtered = FOODS.filter((f) => {
    if (filter === "introducidos" && !data.foods[f.id]) return false;
    if (filter === "pendientes"   &&  data.foods[f.id]) return false;
    if (filter === "alergenos"    && !f.al)             return false;
    if (catFilter !== "Todas"     && f.cat !== catFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Buscar alimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`pill-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="filter-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill-btn sm${catFilter === cat ? " active" : ""}`}
            onClick={() => setCatFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="food-grid">
        {filtered.map((food) => {
          const isIntroduced = !!data.foods[food.id];
          const hasReaction  = !!data.reactions[food.id];
          const isTooYoung   = food.age > ageMonths;
          const isTesting    = isIntroduced && food.al && daysSince(data.foods[food.id]) < 3;

          let cardClass = "food-card";
          if (isTooYoung)   cardClass += " too-young";
          else if (hasReaction)  cardClass += " reaction";
          else if (isTesting)    cardClass += " testing";
          else if (isIntroduced) cardClass += " introduced";

          return (
            <div
              key={food.id}
              className={cardClass}
              onClick={() => !isTooYoung && onFoodClick(food)}
            >
              <div className="food-emoji">{food.em}</div>
              <div className="food-name">{food.name}</div>
              {food.al    && <div className="food-allergen-badge">⚠️</div>}
              {isIntroduced && <div className="food-check">{CHECK_SVG}</div>}
              {isTooYoung && <div className="food-age-badge">+{food.age}m</div>}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">Sin resultados</div>
      )}
    </div>
  );
}
