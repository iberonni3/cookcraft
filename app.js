// ── Storage helpers ──────────────────────────────────────
const STORAGE_KEY = 'cookcraft_recipes';

function getRecipes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// ── Seed data (shown on first load) ──────────────────────
const SEED_RECIPES = [
  {
    id: 1,
    title: 'Ugali with Sukuma Wiki',
    category: 'Dinner',
    prep: 30,
    imageUrl: '',
    ingredients: ['2 cups maize flour', '3 cups water', '1 bunch kale (sukuma wiki)', '1 onion', '2 tomatoes', '2 tbsp cooking oil', 'Salt to taste'],
    steps: ['Boil water in a sufuria.', 'Add maize flour gradually, stirring constantly to avoid lumps.', 'Cook over low heat for 15 minutes, folding until firm.', 'Sauté onion in oil until golden. Add tomatoes and cook for 5 minutes.', 'Add chopped sukuma wiki and stir-fry for 3 minutes.', 'Season with salt and serve with ugali.'],
  },
  {
    id: 2,
    title: 'Pilau Rice',
    category: 'Lunch',
    prep: 45,
    imageUrl: '',
    ingredients: ['2 cups basmati rice', '500g beef (cubed)', '1 onion', '4 garlic cloves', '1 tsp cumin seeds', '1 tsp pilau masala', '2 cups beef stock', '3 tbsp oil', 'Salt'],
    steps: ['Wash and soak rice for 20 minutes.', 'Brown beef in oil, remove and set aside.', 'Fry onion, garlic and cumin seeds until golden.', 'Add pilau masala and stir for 30 seconds.', 'Return beef, add rice and stock. Mix gently.', 'Cover and cook on low heat for 20 minutes until rice is done.'],
  },
  {
    id: 3,
    title: 'Mandazi',
    category: 'Breakfast',
    prep: 40,
    imageUrl: '',
    ingredients: ['3 cups all-purpose flour', '½ cup sugar', '1 tsp baking powder', '1 egg', '1 cup coconut milk', '½ tsp cardamom', 'Oil for frying'],
    steps: ['Mix flour, sugar, baking powder and cardamom.', 'Add egg and coconut milk; knead into soft dough.', 'Let dough rest for 15 minutes.', 'Roll out dough and cut into triangles or squares.', 'Deep-fry in hot oil until golden brown.', 'Drain on paper towels and serve warm.'],
  },
];

function seedIfEmpty() {
  if (getRecipes().length === 0) {
    saveRecipes(SEED_RECIPES);
  }
}

// ── Home page ─────────────────────────────────────────────
function renderGrid(recipes) {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;

  if (recipes.length === 0) {
    grid.innerHTML = `<div class="empty-state">🍽️<p>No recipes found. <a href="add-recipe.html">Add one!</a></p></div>`;
    return;
  }

  grid.innerHTML = recipes.map(r => `
    <div class="card" onclick="viewRecipe(${r.id})">
      <div class="card-img">
        ${r.imageUrl ? `<img src="${r.imageUrl}" alt="${r.title}" onerror="this.style.display='none'"/>` : '🍽️'}
      </div>
      <div class="card-body">
        <span class="card-cat">${r.category}</span>
        <div class="card-title">${r.title}</div>
        <div class="card-meta">⏱ ${r.prep} min · ${r.ingredients.length} ingredients</div>
      </div>
    </div>
  `).join('');
}

function filterRecipes() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const all = getRecipes();
  const filtered = all.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.ingredients.some(i => i.toLowerCase().includes(q))
  );
  renderGrid(filtered);
}

function viewRecipe(id) {
  window.location.href = `recipe.html?id=${id}`;
}

// ── Add-recipe page ───────────────────────────────────────
function submitRecipe() {
  const msg    = document.getElementById('formMsg');
  const title  = document.getElementById('title')?.value.trim();
  const cat    = document.getElementById('category')?.value;
  const prep   = parseInt(document.getElementById('prep')?.value) || 0;
  const ingRaw = document.getElementById('ingredients')?.value.trim();
  const stepsRaw = document.getElementById('steps')?.value.trim();
  const imgUrl = document.getElementById('imageUrl')?.value.trim();

  if (!title || !ingRaw || !stepsRaw) {
    showMsg(msg, 'Please fill in the required fields (Name, Ingredients, Steps).', 'error');
    return;
  }

  const ingredients = ingRaw.split('\n').map(l => l.trim()).filter(Boolean);
  const steps       = stepsRaw.split('\n').map(l => l.trim()).filter(Boolean);

  const recipes = getRecipes();
  const newId   = Date.now();
  recipes.push({ id: newId, title, category: cat, prep, imageUrl: imgUrl, ingredients, steps });
  saveRecipes(recipes);

  showMsg(msg, '✅ Recipe saved! Redirecting…', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1400);
}

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-msg ${type}`;
}

// ── Recipe detail page ────────────────────────────────────
function loadDetail() {
  const container = document.getElementById('detailContent');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'));
  const recipe = getRecipes().find(r => r.id === id);

  if (!recipe) {
    container.innerHTML = '<p style="padding:2rem">Recipe not found. <a href="index.html">Go back</a></p>';
    return;
  }

  document.title = `${recipe.title} – CookCraft`;

  container.innerHTML = `
    <div class="detail-hero-img">
      ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.title}" onerror="this.style.display='none'"/>` : '🍽️'}
    </div>

    <span class="detail-cat">${recipe.category}</span>
    <h1 class="detail-title">${recipe.title}</h1>
    <p class="detail-meta">⏱ Prep time: ${recipe.prep} min &nbsp;|&nbsp; 🧂 ${recipe.ingredients.length} ingredients</p>

    <h2 class="section-heading">Ingredients</h2>
    <ul class="ingredients-list">
      ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
    </ul>

    <h2 class="section-heading">Method</h2>
    <ol class="steps-list">
      ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
    </ol>

    <div class="detail-actions">
      <a href="index.html" class="btn-primary" style="text-decoration:none">← Back</a>
      <button class="btn-delete" onclick="deleteRecipe(${recipe.id})">🗑 Delete</button>
    </div>
  `;
}

function deleteRecipe(id) {
  if (!confirm('Delete this recipe?')) return;
  const updated = getRecipes().filter(r => r.id !== id);
  saveRecipes(updated);
  window.location.href = 'index.html';
}

// ── PHP form submission handler (client-side preview) ─────
// In production this is handled by save_recipe.php
function handlePhpFallback() {
  // Check if coming back from PHP submission
  const params = new URLSearchParams(window.location.search);
  if (params.get('saved') === '1') {
    // PHP saved it; JS just shows feedback
    alert('Recipe saved via server!');
  }
}

// ── Init ──────────────────────────────────────────────────
seedIfEmpty();

if (document.getElementById('recipeGrid')) renderGrid(getRecipes());
if (document.getElementById('detailContent')) loadDetail();
