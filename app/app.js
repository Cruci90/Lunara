const STORAGE_KEY = "blw-app-v1";

const DEFAULT_FOODS = [
  { id: "f-avena", name: "Avena", allergen: "gluten" },
  { id: "f-huevo", name: "Huevo", allergen: "huevo" },
  { id: "f-manzana", name: "Manzana", allergen: null },
  { id: "f-platano", name: "Plátano", allergen: null },
  { id: "f-yogur", name: "Yogur natural", allergen: "leche" },
  { id: "f-lenteja", name: "Lenteja", allergen: null },
  { id: "f-salmon", name: "Salmón", allergen: "pescado" },
  { id: "f-pan", name: "Pan integral", allergen: "gluten" },
  { id: "f-brocoli", name: "Brócoli", allergen: null },
  { id: "f-cacahuete", name: "Cacahuete molido", allergen: "cacahuete" },
];

const RECIPES = [
  { title: "Porridge suave de avena y plátano", foods: ["f-avena", "f-platano"], mode: "quick", minAge: 6 },
  { title: "Tortita de huevo y plátano", foods: ["f-huevo", "f-platano"], mode: "quick", minAge: 7 },
  { title: "Puré de lenteja con brócoli", foods: ["f-lenteja", "f-brocoli"], mode: "batch", minAge: 7 },
  { title: "Salmón al horno con brócoli", foods: ["f-salmon", "f-brocoli"], mode: "elaborate", minAge: 8 },
  { title: "Bowl de yogur y manzana", foods: ["f-yogur", "f-manzana"], mode: "quick", minAge: 6 },
  { title: "Crema de avena y manzana", foods: ["f-avena", "f-manzana"], mode: "quick", minAge: 6 },
  { title: "Tosta blanda con huevo", foods: ["f-pan", "f-huevo"], mode: "elaborate", minAge: 9 },
  { title: "Bastones de brócoli y yogur", foods: ["f-brocoli", "f-yogur"], mode: "quick", minAge: 7 },
  { title: "Lenteja con salmón desmigado", foods: ["f-lenteja", "f-salmon"], mode: "batch", minAge: 9 },
  { title: "Avena con cacahuete y plátano", foods: ["f-avena", "f-cacahuete", "f-platano"], mode: "elaborate", minAge: 10 },
];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return { babies: [], entries: [] };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();
let activeBabyId = state.babies[0]?.id;

const babyForm = document.getElementById("baby-form");
const babySelect = document.getElementById("baby-select");
const foodSelect = document.getElementById("food-select");
const introForm = document.getElementById("intro-form");
const introBody = document.getElementById("intro-table-body");
const safeRecipes = document.getElementById("safe-recipes");
const pills = document.getElementById("introduced-foods-pills");
const generated = document.getElementById("generated-recipes");

function renderBabySelect() {
  babySelect.innerHTML = state.babies.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
  if (activeBabyId) babySelect.value = activeBabyId;
}

function renderFoodSelect() {
  foodSelect.innerHTML = DEFAULT_FOODS.map(f => `<option value="${f.id}">${f.name}</option>`).join("");
}

function babyEntries() {
  return state.entries.filter(e => e.babyId === activeBabyId);
}

function latestStatusByFood() {
  const map = new Map();
  babyEntries()
    .sort((a,b) => new Date(a.date)-new Date(b.date))
    .forEach(e => map.set(e.foodId, e.status));
  return map;
}

function renderEntries() {
  introBody.innerHTML = babyEntries()
    .sort((a,b) => new Date(b.date)-new Date(a.date))
    .map(e => {
      const food = DEFAULT_FOODS.find(f=>f.id===e.foodId);
      return `<tr><td>${e.date}</td><td>${food?.name||e.foodId}</td><td>${e.status}</td><td>${e.acceptance}</td><td>${food?.allergen||"-"}</td></tr>`;
    }).join("");
}

function computeSafeRecipes(selectedFoodIds = null) {
  const status = latestStatusByFood();
  const introducedFoods = DEFAULT_FOODS.filter(f => status.get(f.id) === "introduced");
  const introducedIds = new Set(introducedFoods.map(f => f.id));
  const allowedSet = selectedFoodIds ? new Set(selectedFoodIds) : introducedIds;
  return RECIPES.filter(r => r.foods.every(fid => introducedIds.has(fid) && allowedSet.has(fid))).slice(0,10);
}

function renderSafeRecipes() {
  const list = computeSafeRecipes();
  safeRecipes.innerHTML = list.length ? list.map(r => `<div class="recipe"><strong>${r.title}</strong><span class="badge ${r.mode}">${r.mode}</span></div>`).join("") : "<p>No hay recetas seguras todavía. Introduce más alimentos.</p>";
}

function renderSelectionPills() {
  const status = latestStatusByFood();
  const introduced = DEFAULT_FOODS.filter(f => status.get(f.id) === "introduced");
  pills.innerHTML = introduced.map(f => `<label class="pill"><input type="checkbox" value="${f.id}" checked /> ${f.name}</label>`).join("");
}

babyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("baby-name").value.trim();
  const birth = document.getElementById("baby-birth").value;
  if (!name || !birth) return;
  const id = `b-${Date.now()}`;
  state.babies.push({ id, name, birth });
  activeBabyId = id;
  saveState();
  renderAll();
  babyForm.reset();
});

babySelect.addEventListener("change", () => {
  activeBabyId = babySelect.value;
  renderAll();
});

introForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeBabyId) return alert("Primero crea un perfil de bebé.");
  state.entries.push({
    babyId: activeBabyId,
    foodId: document.getElementById("food-select").value,
    status: document.getElementById("status-select").value,
    date: document.getElementById("intro-date").value,
    preparation: document.getElementById("intro-preparation").value,
    quantity: document.getElementById("intro-quantity").value,
    acceptance: document.getElementById("intro-acceptance").value,
  });
  saveState();
  renderAll();
  introForm.reset();
});

document.getElementById("generate-btn").addEventListener("click", () => {
  const selected = [...pills.querySelectorAll("input[type=checkbox]:checked")].map(i => i.value);
  const list = computeSafeRecipes(selected);
  generated.innerHTML = list.length ? list.map(r => `<div class="recipe">${r.title}</div>`).join("") : "<p>No hay recetas para esa combinación.</p>";
});

function renderAll() {
  renderBabySelect();
  renderFoodSelect();
  renderEntries();
  renderSafeRecipes();
  renderSelectionPills();
}

renderAll();
