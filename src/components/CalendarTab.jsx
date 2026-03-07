import { useState } from "react";
import { FOODS, MONTH_NAMES, buildCalendarDays, getFood, makeDateKey } from "../data/foods.js";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarTab({ data, onDayClick }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Mapa de fecha → alimentos introducidos ese día
  const foodsByDate = {};
  for (const [foodId, dateStr] of Object.entries(data.foods)) {
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!foodsByDate[key]) foodsByDate[key] = [];
    foodsByDate[key].push(foodId);
  }

  const calendarDays = buildCalendarDays(year, month);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div>
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
        <div className="calendar-month">{MONTH_NAMES[month]} {year}</div>
        <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}

        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateKey = `${year}-${month}-${day}`;
          const dateStr = makeDateKey(year, month, day);
          const dayFoods = foodsByDate[dateKey] ?? [];
          const hasMeals = data.meals?.[dateStr] && Object.keys(data.meals[dateStr]).length > 0;
          const hasAllergen = dayFoods.some((id) => getFood(id)?.al);
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          let cls = "calendar-day";
          if (isToday)       cls += " today";
          else if (hasAllergen) cls += " has-allergen";
          else if (dayFoods.length > 0) cls += " has-food";
          if (hasMeals) cls += " has-meals";

          return (
            <div key={i} className={cls} onClick={() => onDayClick(year, month, day)}>
              <span>{day}</span>
              {dayFoods.length > 0 && (
                <div className="calendar-food-dots">
                  {dayFoods.slice(0, 4).map((id) => (
                    <span key={id} className="calendar-food-dot">
                      {getFood(id)?.em ?? ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="legend" style={{ marginTop: 16 }}>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--ac)" }} /> Alimento
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--or)" }} /> Alérgeno
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--bl)" }} /> Hoy
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--pu)" }} /> Comidas
        </span>
      </div>
    </div>
  );
}
