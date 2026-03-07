export const FOODS = [
  // Frutas
  { id: "platano",   name: "Plátano",         cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍌" },
  { id: "manzana",   name: "Manzana",          cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍎" },
  { id: "pera",      name: "Pera",             cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍐" },
  { id: "melocoton", name: "Melocotón",        cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍑" },
  { id: "ciruela",   name: "Ciruela",          cat: "Frutas",       al: false, at: "",            age: 6,  em: "🟣" },
  { id: "mango",     name: "Mango",            cat: "Frutas",       al: false, at: "",            age: 6,  em: "🥭" },
  { id: "aguacate",  name: "Aguacate",         cat: "Frutas",       al: false, at: "",            age: 6,  em: "🥑" },
  { id: "sandia",    name: "Sandía",           cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍉" },
  { id: "melon",     name: "Melón",            cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍈" },
  { id: "fresa",     name: "Fresa",            cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍓" },
  { id: "naranja",   name: "Naranja",          cat: "Frutas",       al: false, at: "",            age: 6,  em: "🍊" },
  { id: "kiwi",      name: "Kiwi",             cat: "Frutas",       al: true,  at: "Kiwi",        age: 6,  em: "🥝" },
  { id: "uva",       name: "Uva (cortada)",    cat: "Frutas",       al: false, at: "",            age: 9,  em: "🍇" },
  { id: "arandanos", name: "Arándanos",        cat: "Frutas",       al: false, at: "",            age: 6,  em: "🫐" },
  { id: "cereza",    name: "Cereza",           cat: "Frutas",       al: false, at: "",            age: 9,  em: "🍒" },
  { id: "papaya",    name: "Papaya",           cat: "Frutas",       al: false, at: "",            age: 6,  em: "🧡" },
  { id: "higos",     name: "Higos",            cat: "Frutas",       al: false, at: "",            age: 6,  em: "🟤" },

  // Verduras
  { id: "brocoli",       name: "Brócoli",      cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥦" },
  { id: "calabacin",     name: "Calabacín",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥒" },
  { id: "zanahoria",     name: "Zanahoria",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥕" },
  { id: "boniato",       name: "Boniato",      cat: "Verduras",     al: false, at: "",            age: 6,  em: "🍠" },
  { id: "patata",        name: "Patata",       cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥔" },
  { id: "calabaza",      name: "Calabaza",     cat: "Verduras",     al: false, at: "",            age: 6,  em: "🎃" },
  { id: "judias_verdes", name: "Judías verdes",cat: "Verduras",     al: false, at: "",            age: 6,  em: "🫛" },
  { id: "guisantes",     name: "Guisantes",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🟢" },
  { id: "coliflor",      name: "Coliflor",     cat: "Verduras",     al: false, at: "",            age: 6,  em: "🤍" },
  { id: "espinacas",     name: "Espinacas",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥬" },
  { id: "pimiento",      name: "Pimiento",     cat: "Verduras",     al: false, at: "",            age: 6,  em: "🫑" },
  { id: "tomate",        name: "Tomate",       cat: "Verduras",     al: false, at: "",            age: 6,  em: "🍅" },
  { id: "cebolla",       name: "Cebolla",      cat: "Verduras",     al: false, at: "",            age: 6,  em: "🧅" },
  { id: "ajo",           name: "Ajo",          cat: "Verduras",     al: false, at: "",            age: 6,  em: "🧄" },
  { id: "pepino",        name: "Pepino",       cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥒" },
  { id: "berenjena",     name: "Berenjena",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🍆" },
  { id: "remolacha",     name: "Remolacha",    cat: "Verduras",     al: false, at: "",            age: 6,  em: "🔴" },
  { id: "acelgas",       name: "Acelgas",      cat: "Verduras",     al: false, at: "",            age: 6,  em: "🥬" },
  { id: "puerro",        name: "Puerro",       cat: "Verduras",     al: false, at: "",            age: 6,  em: "🧅" },
  { id: "champiñones",   name: "Champiñones",  cat: "Verduras",     al: false, at: "",            age: 9,  em: "🍄" },

  // Cereales
  { id: "arroz",  name: "Arroz",   cat: "Cereales", al: false, at: "",       age: 6, em: "🍚" },
  { id: "avena",  name: "Avena",   cat: "Cereales", al: true,  at: "Gluten", age: 6, em: "🌾" },
  { id: "trigo",  name: "Trigo",   cat: "Cereales", al: true,  at: "Gluten", age: 6, em: "🌾" },
  { id: "pan",    name: "Pan",     cat: "Cereales", al: true,  at: "Gluten", age: 6, em: "🍞" },
  { id: "pasta",  name: "Pasta",   cat: "Cereales", al: true,  at: "Gluten", age: 6, em: "🍝" },
  { id: "maiz",   name: "Maíz",    cat: "Cereales", al: false, at: "",       age: 6, em: "🌽" },
  { id: "quinoa", name: "Quinoa",  cat: "Cereales", al: false, at: "",       age: 6, em: "⚪" },
  { id: "cuscus", name: "Cuscús",  cat: "Cereales", al: true,  at: "Gluten", age: 6, em: "🟡" },
  { id: "mijo",   name: "Mijo",    cat: "Cereales", al: false, at: "",       age: 6, em: "🟤" },

  // Proteínas
  { id: "pollo",    name: "Pollo",    cat: "Proteínas", al: false, at: "",      age: 6,  em: "🍗" },
  { id: "pavo",     name: "Pavo",     cat: "Proteínas", al: false, at: "",      age: 6,  em: "🦃" },
  { id: "ternera",  name: "Ternera",  cat: "Proteínas", al: false, at: "",      age: 6,  em: "🥩" },
  { id: "cerdo",    name: "Cerdo",    cat: "Proteínas", al: false, at: "",      age: 6,  em: "🐷" },
  { id: "cordero",  name: "Cordero",  cat: "Proteínas", al: false, at: "",      age: 6,  em: "🐑" },
  { id: "conejo",   name: "Conejo",   cat: "Proteínas", al: false, at: "",      age: 6,  em: "🐰" },
  { id: "huevo",    name: "Huevo",    cat: "Proteínas", al: true,  at: "Huevo", age: 6,  em: "🥚" },
  { id: "lentejas", name: "Lentejas", cat: "Proteínas", al: false, at: "",      age: 6,  em: "🟤" },
  { id: "garbanzos",name: "Garbanzos",cat: "Proteínas", al: false, at: "",      age: 6,  em: "🟡" },
  { id: "alubias",  name: "Alubias",  cat: "Proteínas", al: false, at: "",      age: 6,  em: "🫘" },
  { id: "tofu",     name: "Tofu",     cat: "Proteínas", al: true,  at: "Soja",  age: 6,  em: "🧈" },

  // Pescado
  { id: "merluza",    name: "Merluza",    cat: "Pescado", al: true, at: "Pescado",  age: 6,  em: "🐟" },
  { id: "salmon",     name: "Salmón",     cat: "Pescado", al: true, at: "Pescado",  age: 6,  em: "🐟" },
  { id: "bacalao",    name: "Bacalao",    cat: "Pescado", al: true, at: "Pescado",  age: 6,  em: "🐟" },
  { id: "lubina",     name: "Lubina",     cat: "Pescado", al: true, at: "Pescado",  age: 6,  em: "🐟" },
  { id: "dorada",     name: "Dorada",     cat: "Pescado", al: true, at: "Pescado",  age: 6,  em: "🐟" },
  { id: "atun",       name: "Atún",       cat: "Pescado", al: true, at: "Pescado",  age: 9,  em: "🐟" },
  { id: "gambas",     name: "Gambas",     cat: "Pescado", al: true, at: "Marisco",  age: 12, em: "🦐" },
  { id: "mejillones", name: "Mejillones", cat: "Pescado", al: true, at: "Moluscos", age: 12, em: "🦪" },
  { id: "calamares",  name: "Calamares",  cat: "Pescado", al: true, at: "Moluscos", age: 12, em: "🦑" },

  // Lácteos
  { id: "yogur",        name: "Yogur natural", cat: "Lácteos", al: true, at: "Lácteos", age: 9,  em: "🥛" },
  { id: "queso_fresco", name: "Queso fresco",  cat: "Lácteos", al: true, at: "Lácteos", age: 9,  em: "🧀" },
  { id: "queso_curado", name: "Queso curado",  cat: "Lácteos", al: true, at: "Lácteos", age: 12, em: "🧀" },
  { id: "mantequilla",  name: "Mantequilla",   cat: "Lácteos", al: true, at: "Lácteos", age: 6,  em: "🧈" },
  { id: "leche_entera", name: "Leche entera",  cat: "Lácteos", al: true, at: "Lácteos", age: 12, em: "🥛" },

  // Frutos secos
  { id: "cacahuete", name: "Cacahuete", cat: "Frutos secos", al: true, at: "Cacahuete",   age: 6, em: "🥜" },
  { id: "almendra",  name: "Almendra",  cat: "Frutos secos", al: true, at: "Frutos secos", age: 6, em: "🌰" },
  { id: "nuez",      name: "Nuez",      cat: "Frutos secos", al: true, at: "Frutos secos", age: 6, em: "🌰" },
  { id: "avellana",  name: "Avellana",  cat: "Frutos secos", al: true, at: "Frutos secos", age: 6, em: "🌰" },
  { id: "anacardo",  name: "Anacardo",  cat: "Frutos secos", al: true, at: "Frutos secos", age: 6, em: "🌰" },
  { id: "sesamo",    name: "Sésamo",    cat: "Frutos secos", al: true, at: "Sésamo",        age: 6, em: "⚪" },

  // Otros
  { id: "aceite_oliva", name: "Aceite de oliva", cat: "Otros", al: false, at: "",         age: 6,  em: "🫒" },
  { id: "apio",         name: "Apio",            cat: "Otros", al: true,  at: "Apio",     age: 6,  em: "🥬" },
  { id: "mostaza",      name: "Mostaza",         cat: "Otros", al: true,  at: "Mostaza",  age: 12, em: "🟡" },
  { id: "altramuz",     name: "Altramuz",        cat: "Otros", al: true,  at: "Altramuz", age: 12, em: "🟡" },
];

/** Los 14 alérgenos de obligatorio etiquetado en la UE */
export const ALLERGENS = [
  { name: "Gluten",       emoji: "🌾" },
  { name: "Lácteos",      emoji: "🥛" },
  { name: "Huevo",        emoji: "🥚" },
  { name: "Pescado",      emoji: "🐟" },
  { name: "Marisco",      emoji: "🦐" },
  { name: "Moluscos",     emoji: "🦪" },
  { name: "Cacahuete",    emoji: "🥜" },
  { name: "Frutos secos", emoji: "🌰" },
  { name: "Soja",         emoji: "🧈" },
  { name: "Sésamo",       emoji: "⚪" },
  { name: "Apio",         emoji: "🥬" },
  { name: "Mostaza",      emoji: "🟡" },
  { name: "Altramuz",     emoji: "🟡" },
  { name: "Kiwi",         emoji: "🥝" },
];

/** Franjas horarias del diario de comidas */
export const MEAL_SLOTS = [
  { key: "desayuno", label: "Desayuno", emoji: "🌅" },
  { key: "comida",   label: "Comida",   emoji: "☀️" },
  { key: "merienda", label: "Merienda", emoji: "🍊" },
  { key: "cena",     label: "Cena",     emoji: "🌙" },
  { key: "snack",    label: "Snack",    emoji: "🍪" },
];

/** Nombres de meses en español */
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Busca un alimento por ID */
export function getFood(id) {
  return FOODS.find((f) => f.id === id) ?? null;
}

/** Retorna los días del mes para la vista de calendario (null = celda vacía) */
export function buildCalendarDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // lunes = 0
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  return days;
}

/** Convierte año/mes/día a clave YYYY-MM-DD */
export function makeDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
