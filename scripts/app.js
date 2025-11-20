"use strict";

// --- Basic helpers ---
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);

// Normalize ingredients for matching
const SYNONYMS = new Map([
  ["tomatoes", "tomato"],
  ["tomato", "tomato"],
  ["onions", "onion"],
  ["onion", "onion"],
  ["peppers", "pepper"],
  ["red pepper", "pepper"],
  ["bell pepper", "pepper"],
  ["scotch bonnet", "pepper"],
  ["pepper flakes", "pepper"],
  ["pepper", "pepper"],
  ["vegetable oil", "oil"],
  ["veg oil", "oil"],
  ["olive oil", "oil"],
  ["oil", "oil"],
  ["palm oil", "palm oil"],
  ["stock cube", "bouillon"],
  ["maggi", "bouillon"],
  ["bouillon", "bouillon"],
  ["broth", "stock"],
  ["stock", "stock"],
  ["garri", "garri"],
  ["cassava flour", "garri"],
  ["melon seeds", "egusi"],
  ["egusi seeds", "egusi"],
  ["egusi", "egusi"],
  ["black-eyed peas", "beans"],
  ["kidney beans", "beans"],
  ["beans", "beans"],
  ["rice", "rice"],
  ["yam", "yam"],
  ["yams", "yam"],
  ["plantains", "plantain"],
  ["plantain", "plantain"],
  ["ugwu", "spinach"],
  ["spinach", "spinach"],
  ["tomato paste", "tomato paste"],
  ["curry powder", "curry"],
  ["curry", "curry"],
  ["bay leaves", "bay leaf"],
  ["bay leaf", "bay leaf"],
  ["chilli", "pepper"],
  ["chili", "pepper"],
  ["chilli powder", "pepper"],
  ["salt", "salt"],
  ["garlic", "garlic"],
  ["ginger", "ginger"],
  ["thyme", "thyme"],
  ["seasoning", "bouillon"],
  ["bouillon cube", "bouillon"],
  ["bouillon cubes", "bouillon"],
  ["beef", "beef"],
  ["goat meat", "goat"],
  ["goat", "goat"],
  ["chicken", "chicken"],
  ["fish", "fish"],
  ["tilapia", "fish"],
  ["tomatillo", "tomatillo"],
  ["corn", "corn"],
  ["maize", "corn"],
  ["cornmeal", "cornmeal"],
  ["pasta", "pasta"],
  ["spaghetti", "pasta"],
  ["basil", "basil"],
  ["tortillas", "tortilla"],
  ["tortilla", "tortilla"],
]);

const normalize = (s) => {
  if (!s) return "";
  let v = String(s).toLowerCase().trim();
  v = v.replace(/[._]/g, " ").replace(/\s+/g, " ");
  if (SYNONYMS.has(v)) return SYNONYMS.get(v);
  // very light singularization for simple plurals
  if (!SYNONYMS.has(v)) {
    if (v.endsWith("es")) v = v.slice(0, -2);
    else if (v.endsWith("s") && !v.endsWith("ss")) v = v.slice(0, -1);
  }
  return SYNONYMS.get(v) || v;
};

// --- Recipe dataset (concise & representative) ---
const RECIPES = [
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    country: "Nigeria",
    ingredients: [
      "rice", "tomato", "tomato paste", "onion", "pepper", "oil", "stock", "thyme", "curry", "bay leaf", "salt"
    ],
    steps: [
      "Blend tomato, onion, pepper.",
      "Fry mix in oil with curry and thyme; add tomato paste.",
      "Stir in stock, bay leaf, salt; add rice and steam until tender."
    ]
  },
  {
    id: "egusi-soup",
    name: "Egusi Soup",
    country: "Nigeria",
    ingredients: ["egusi", "palm oil", "onion", "pepper", "stock", "spinach", "salt", "beef"],
    steps: [
      "Fry palm oil and onions; add blended egusi and fry gently.",
      "Add stock, pepper, meat; simmer.",
      "Stir in spinach; season and serve."
    ]
  },
  {
    id: "suya",
    name: "Suya",
    country: "Nigeria",
    ingredients: ["beef", "peanut", "pepper", "salt", "oil"],
    steps: [
      "Coat beef with suya spice (peanut + pepper + salt).",
      "Skewer and grill, basting with oil until done."
    ]
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    country: "Nigeria",
    ingredients: ["beans", "onion", "pepper", "oil", "salt"],
    steps: [
      "Soak and peel beans; blend with onion and pepper.",
      "Add oil, salt; steam in ramekins until set."
    ]
  },
  {
    id: "dodo",
    name: "Dodo (Fried Plantain)",
    country: "Nigeria",
    ingredients: ["plantain", "oil", "salt"],
    steps: [
      "Slice plantains; sprinkle salt.",
      "Fry in hot oil until golden."
    ]
  },
  // Other countries
  {
    id: "waakye",
    name: "Waakye",
    country: "Ghana",
    ingredients: ["rice", "beans", "salt"],
    steps: ["Cook rice and beans together; season and serve."]
  },
  {
    id: "nyama-choma",
    name: "Nyama Choma",
    country: "Kenya",
    ingredients: ["goat", "salt", "pepper"],
    steps: ["Season goat and grill over charcoal until tender."]
  },
  {
    id: "doro-wat",
    name: "Doro Wat",
    country: "Ethiopia",
    ingredients: ["chicken", "onion", "pepper", "garlic", "ginger", "salt"],
    steps: ["Stew onion with spices, add chicken and simmer until done."]
  },
  {
    id: "moroccan-couscous",
    name: "Vegetable Couscous",
    country: "Morocco",
    ingredients: ["cornmeal", "onion", "carrot", "pepper", "salt", "oil"],
    steps: ["Steam couscous; sauté vegetables; combine and season."]
  },
  {
    id: "chana-masala",
    name: "Chana Masala",
    country: "India",
    ingredients: ["beans", "tomato", "onion", "garlic", "ginger", "pepper", "salt", "oil"],
    steps: ["Simmer chickpeas in spiced tomato-onion gravy."]
  },
  {
    id: "pasta-pomodoro",
    name: "Pasta al Pomodoro",
    country: "Italy",
    ingredients: ["pasta", "tomato", "garlic", "basil", "oil", "salt"],
    steps: ["Cook pasta; simmer tomatoes with garlic and basil; toss together."]
  },
  {
    id: "tacos",
    name: "Street Tacos",
    country: "Mexico",
    ingredients: ["tortilla", "beef", "onion", "pepper", "salt"],
    steps: ["Season and sear beef; serve on tortillas with onion and salsa."]
  }
];

// Load extra recipes from external JSON and merge with built-ins
async function loadRecipeData() {
  try {
    const res = await fetch("data/recipes.json", { cache: "no-store" });
    if (!res.ok) return;
    const extra = await res.json();
    if (Array.isArray(extra)) {
      const byId = new Set(RECIPES.map(r => r.id));
      extra.forEach(r => {
        if (r && r.id && !byId.has(r.id)) {
          RECIPES.push({
            id: r.id,
            name: r.name,
            country: r.country,
            ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
            steps: Array.isArray(r.steps) ? r.steps : []
          });
          byId.add(r.id);
        }
      });
    }
  } catch (_) {
    // ignore; fallback to built-in recipes
  }
}
// --- State ---
let pantryItems = []; // raw strings
let shoppingList = []; // { name, done }
let currentRecipe = null; // recipe object or null

let suggestionQueue = []; // ordered array of recipe objects for current selection
let suggestionIndex = 0;

// Storage helpers
const LS = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

function pantrySet() {
  return new Set(pantryItems.map(normalize));
}

function savePantry() { LS.set("pantryItems", pantryItems); }
function saveShopping() { LS.set("shoppingList", shoppingList); }

// --- Rendering ---
function renderPantry() {
  const container = $("#pantry-list");
  container.innerHTML = "";
  pantryItems.forEach((item, idx) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.innerHTML = `<span class="inline-flex items-center gap-2">${escapeHtml(item)} <button title="Remove" aria-label="Remove ${escapeHtml(item)}" data-idx="${idx}" class="rounded-md px-1.5 py-0.5 text-xs bg-black/5 hover:bg-black/10">×</button></span>`;
    const btn = span.querySelector("button");
    on(btn, "click", () => {
      pantryItems.splice(idx, 1);
      savePantry();
      renderPantry();
      refreshRecipeView();
    });
    container.appendChild(span);
  });
}

function renderShopping() {
  const ul = $("#shopping-list");
  ul.innerHTML = "";
  shoppingList.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-3 py-3";
    li.innerHTML = `
      <label class="flex items-center gap-3 w-full">
        <input type="checkbox" ${item.done ? "checked" : ""} aria-label="Mark ${escapeHtml(item.name)} as ${item.done ? "not purchased" : "purchased"}" class="h-4 w-4 rounded border-black/20">
        <span class="flex-1 ${item.done ? "line-through text-[#94A3B8]" : ""}">${escapeHtml(item.name)}</span>
      </label>
      <button class="btn-secondary px-3 py-1" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
    `;
    const checkbox = li.querySelector("input[type=checkbox]");
    const removeBtn = li.querySelector("button");
    on(checkbox, "change", () => { item.done = checkbox.checked; saveShopping(); renderShopping(); });
    on(removeBtn, "click", () => { shoppingList.splice(idx, 1); saveShopping(); renderShopping(); });
    ul.appendChild(li);
  });
}

function renderRecipe(recipe) {
  const container = $("#recipe-view");
  const subtitle = $("#recipe-subtitle");
  if (!recipe) {
    container.innerHTML = "<p class=\"text-[#475569]\">No recipe selected yet.</p>";
    subtitle.textContent = "Choose an option to see a recipe that fits your pantry.";
    $("#add-missing-btn").disabled = true;

    updateRefreshState();
    return;
  }
  const pset = pantrySet();
  const have = [];
  const missing = [];
  recipe.ingredients.forEach(ing => (pset.has(normalize(ing)) ? have : missing).push(ing));

  subtitle.textContent = `${recipe.country} • ${recipe.name}`;

  container.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="chip">${escapeHtml(recipe.country)}</span>
      <h3 class="text-xl font-semibold">${escapeHtml(recipe.name)}</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 class="font-medium text-[#334155] mb-2">Ingredients you have (${have.length})</h4>
        <ul class="space-y-1">${have.map(i => `<li class=\"flex items-center gap-2 text-sm\"><span class=\"inline-block h-2 w-2 rounded-full bg-[#0FA958]\"></span>${escapeHtml(i)}</li>`).join("") || '<li class="text-sm text-[#94A3B8]">None yet</li>'}</ul>
      </div>
      <div>
        <h4 class="font-medium text-[#334155] mb-2">Missing (${missing.length})</h4>
        <ul class="space-y-1">${missing.map(i => `<li class=\"flex items-center gap-2 text-sm\"><span class=\"inline-block h-2 w-2 rounded-full bg-[#F26D3D]\"></span>${escapeHtml(i)}</li>`).join("") || '<li class="text-sm text-[#94A3B8]">All set!</li>'}</ul>
      </div>
    </div>

    <div>
      <h4 class="font-medium text-[#334155] mt-4 mb-2">Steps</h4>
      <ol class="list-decimal list-inside space-y-1 text-sm text-[#334155]">${recipe.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    </div>
  `;

  const addBtn = $("#add-missing-btn");
  addBtn.disabled = missing.length === 0;
  addBtn.onclick = () => addMissingToShopping(missing);

  updateRefreshState();
}

function refreshRecipeView() {
  renderRecipe(currentRecipe);
}

// --- Suggestion logic ---
function bestMatchRecipe(country) {
  const pset = pantrySet();
  const candidates = RECIPES.filter(r => country === "Any" ? true : r.country === country);
  if (!candidates.length) return null;
  // Score by matches; tie-break by fewer missing, then by more total ingredients
  let best = null;
  let bestScore = -1;
  candidates.forEach(r => {
    const keys = r.ingredients.map(normalize);
    const matches = keys.filter(k => pset.has(k)).length;
    const missing = keys.length - matches;
    const score = matches * 100 - missing; // simple weighted score
    if (score > bestScore) { bestScore = score; best = r; }
  });
  return best;
}

function randomRecipe(country) {
  const candidates = RECIPES.filter(r => country === "Any" ? true : r.country === country);
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Build an ordered queue of recipe suggestions based on pantry match
function buildSuggestionQueue(country) {
  const pset = pantrySet();
  const candidates = RECIPES.filter(r => country === "Any" ? true : r.country === country);
  const scored = candidates.map(r => {
    const keys = r.ingredients.map(normalize);
    const matches = keys.filter(k => pset.has(k)).length;
    const missing = keys.length - matches;
    const score = matches * 100 - missing;
    return { r, score, missing };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score; // more matches first
    if (a.missing !== b.missing) return a.missing - b.missing; // fewer missing next
    return (b.r.ingredients.length - a.r.ingredients.length) || a.r.name.localeCompare(b.r.name);
  }).map(x => x.r);
  return scored;
}

function updateRefreshState() {
  const btn = document.getElementById("refresh-recipe-btn");
  if (!btn) return;
  btn.disabled = !currentRecipe || suggestionQueue.length < 2;
}

function nextSuggestion() {
  const country = document.getElementById("country-select")?.value || "Any";
  if (!suggestionQueue.length) {
    suggestionQueue = buildSuggestionQueue(country);
    suggestionIndex = 0;
  }
  if (suggestionQueue.length) {
    suggestionIndex = (suggestionIndex + 1) % suggestionQueue.length;
    currentRecipe = suggestionQueue[suggestionIndex] || null;
    renderRecipe(currentRecipe);
  }
}

// Override refreshRecipeView to re-build the queue when pantry changes
function refreshRecipeView() {
  if (currentRecipe) {
    const country = document.getElementById("country-select")?.value || "Any";
    suggestionQueue = buildSuggestionQueue(country);
    const idx = suggestionQueue.findIndex(r => r.id === currentRecipe.id);
    suggestionIndex = idx >= 0 ? idx : 0;
    currentRecipe = suggestionQueue[suggestionIndex] || null;
  }
  renderRecipe(currentRecipe);
}
// --- Actions ---
function addPantryItemsFromInput() {
  const input = $("#pantry-input");
  const raw = (input.value || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!raw.length) return;
  const existing = new Set(pantryItems.map(x => normalize(x)));
  raw.forEach(item => {
    const key = normalize(item);
    if (!existing.has(key)) pantryItems.push(item);
  });
  input.value = "";
  savePantry();
  renderPantry();
  refreshRecipeView();
}

function addShoppingItemFromInput() {
  const input = $("#shopping-input");
  const val = input.value.trim();
  if (!val) return;
  addToShopping(val);
  input.value = "";
  renderShopping();
}

function addMissingToShopping(missing) {
  missing.forEach(addToShopping);
  renderShopping();
}

function addToShopping(name) {
  const key = normalize(name);
  const exists = shoppingList.find(i => normalize(i.name) === key);
  if (!exists) {
    shoppingList.push({ name, done: false });
    saveShopping();
  }
}

// --- Utilities ---
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Init ---
function init() {

  loadRecipeData();
  pantryItems = LS.get("pantryItems", []);
  shoppingList = LS.get("shoppingList", []);

  renderPantry();
  renderShopping();
  renderRecipe(null);

  // Pantry events
  on($("#pantry-add-btn"), "click", addPantryItemsFromInput);
  on($("#pantry-input"), "keydown", (e) => {
    if (e.key === "Enter") addPantryItemsFromInput();
  });

  // Shopping events
  on($("#shopping-add-btn"), "click", addShoppingItemFromInput);
  on($("#shopping-input"), "keydown", (e) => { if (e.key === "Enter") addShoppingItemFromInput(); });
  on($("#clear-purchased-btn"), "click", () => {
    shoppingList = shoppingList.filter(i => !i.done);
    saveShopping();
    renderShopping();
  });
  on($("#reset-list-btn"), "click", () => {
    if (confirm("Clear the entire shopping list?")) {
      shoppingList = [];
      saveShopping();
      renderShopping();
    }
  });

  // Suggestion and random
  on($("#suggest-btn"), "click", () => {
    const country = $("#country-select").value || "Any";
    suggestionQueue = buildSuggestionQueue(country);
    suggestionIndex = 0;
    currentRecipe = suggestionQueue[0] || null;
    renderRecipe(currentRecipe);
  });

  on($("#random-ng-btn"), "click", () => {
    const country = $("#country-select").value || "Any";
    suggestionQueue = buildSuggestionQueue(country);
    if (suggestionQueue.length) {
      suggestionIndex = Math.floor(Math.random() * suggestionQueue.length);
      currentRecipe = suggestionQueue[suggestionIndex];
    } else {
      currentRecipe = null;
      suggestionIndex = 0;
    }
    renderRecipe(currentRecipe);
  });

  // Optional: update suggestion automatically when country changes if a recipe is already shown
  on($("#country-select"), "change", () => {
    if (currentRecipe) {
      const country = $("#country-select").value || "Any";
      suggestionQueue = buildSuggestionQueue(country);
      suggestionIndex = 0;
      currentRecipe = suggestionQueue[0] || null;
      renderRecipe(currentRecipe);
    }
  });
}


// Global delegation for refresh button (works even if inside disabled containers)
document.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest("#refresh-recipe-btn");
  if (!btn) return;
  nextSuggestion();
});
document.addEventListener("DOMContentLoaded", init);
