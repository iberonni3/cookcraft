/**
 * CookCraft – app.js
 * Core logic for the CookCraft premium recipe manager.
 * Handles all server communications and dynamic UI updates.
 */

// ── State Management ──────────────────────────────────────
let allRecipes = [];
let currentCategory = 'All';

// ── Icons ────────────────────────────────────────────────
const ICONS = {
    time: '<i class="fa-regular fa-clock"></i>',
    ingredients: '<i class="fa-solid fa-mortar-pestle"></i>',
    heart: '<i class="fa-solid fa-heart"></i>',
    plus: '<i class="fa-solid fa-plus"></i>',
    trash: '<i class="fa-solid fa-trash-can"></i>',
    edit: '<i class="fa-solid fa-pen-to-square"></i>'
};

// ── Initialization ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('recipeGrid');
    const detail = document.getElementById('detailContent');
    const form = document.getElementById('recipeForm');

    if (grid) fetchRecipes();
    if (detail) loadDetail();
    if (form) initForm();
});

// ── Data Fetching ─────────────────────────────────────────
async function fetchRecipes() {
    try {
        const response = await fetch('get_recipes.php');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        allRecipes = await response.json();
        renderGrid(allRecipes);
        updateSchema();
    } catch (error) {
        console.error('Error:', error);
        showGridMessage('Failed to load recipes. Please check your connection.', 'error');
    }
}

// ── Rendering ─────────────────────────────────────────────
function renderGrid(recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;

    const filtered = recipes.filter(r => {
        const matchesCat = currentCategory === 'All' || r.category === currentCategory;
        const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const matchesSearch = r.title.toLowerCase().includes(q) || 
                             r.ingredients.some(i => i.toLowerCase().includes(q));
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        showGridMessage('No recipes found. Try a different search or <a href="add-recipe.html">add one</a>!', 'empty');
        return;
    }

    grid.innerHTML = filtered.map(r => `
        <article class="card">
            <button class="favorite-btn ${r.favorite ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleFavorite(${r.id}, ${r.favorite})">
                <i class="fa-solid fa-heart"></i>
            </button>
            <div class="card-img" onclick="viewRecipe(${r.id})">
                <img src="${r.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}" 
                     alt="${r.title}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'">
            </div>
            <div class="card-body" onclick="viewRecipe(${r.id})">
                <span class="card-cat">${r.category}</span>
                <h3 class="card-title">${r.title}</h3>
                <div class="card-meta">
                    <span>${ICONS.time} ${r.prep} min</span>
                    <span>${ICONS.ingredients} ${r.ingredients.length} items</span>
                </div>
            </div>
        </article>
    `).join('');
}

function showGridMessage(msg, type) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${type === 'empty' ? '🍽️' : '⚠️'}</div>
            <p style="color: var(--muted); font-size: 1.1rem;">${msg}</p>
        </div>
    `;
}

// ── Filtering ─────────────────────────────────────────────
function filterRecipes() {
    renderGrid(allRecipes);
}

function setCategory(cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(allRecipes);
}

function viewRecipe(id) {
    window.location.href = `recipe.html?id=${id}`;
}

// ── Recipe Detail ─────────────────────────────────────────
async function loadDetail() {
    const container = document.getElementById('detailContent');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        const response = await fetch(`get_recipes.php?id=${id}`);
        if (!response.ok) throw new Error('Recipe not found');
        const recipe = await response.json();
        
        document.title = `${recipe.title} – CookCraft`;

        container.innerHTML = `
            <div class="detail-header">
                <div class="detail-img-container">
                    <img src="${recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}" alt="${recipe.title}">
                </div>
                <div class="detail-info">
                    <span class="detail-cat">${recipe.category}</span>
                    <h1 class="detail-title">${recipe.title}</h1>
                    
                    <div class="detail-meta-box">
                        <div class="meta-item">
                            <span class="meta-label">Prep Time</span>
                            <span class="meta-value">${recipe.prep} Minutes</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Ingredients</span>
                            <span class="meta-value">${recipe.ingredients.length} Items</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <button class="btn-primary" onclick="editRecipe(${recipe.id})">
                            ${ICONS.edit} Edit Recipe
                        </button>
                        <button class="btn-secondary" style="color: #e74c3c;" onclick="deleteRecipe(${recipe.id})">
                            ${ICONS.trash} Delete
                        </button>
                    </div>
                </div>
            </div>

            <div class="detail-grid">
                <section>
                    <h2 class="section-heading">Ingredients</h2>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `<li><i class="fa-solid fa-check"></i> ${ing}</li>`).join('')}
                    </ul>
                </section>
                <section>
                    <h2 class="section-heading">Method</h2>
                    <ol class="steps-list">
                        ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </section>
            </div>

            <div style="margin-top: 4rem; text-align: center;">
                <a href="index.html" class="btn-secondary">&larr; Back to Inspiration</a>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div style="text-align:center; padding:5rem;"><p>Recipe not found. <a href="index.html">Go back</a></p></div>`;
    }
}

// ── CRUD Operations ───────────────────────────────────────
async function submitRecipe() {
    const form = document.getElementById('recipeForm');
    const msg = document.getElementById('formMsg');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // UI Feedback
    msg.className = 'form-msg hidden';
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';

    const formData = new FormData(form);
    const id = document.getElementById('recipeId').value;
    
    // Add favorite state
    formData.append('favorite', document.getElementById('favorite').checked);

    // Determine target URL (update vs create)
    const targetUrl = id ? 'update_recipe.php' : 'save_recipe.php';
    if (id) formData.append('id', id);

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        const result = await response.json();

        if (response.ok) {
            msg.textContent = '✨ Recipe saved successfully! Redirecting...';
            msg.className = 'form-msg success';
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            throw new Error(result.error || result.message || 'Failed to save recipe');
        }
    } catch (error) {
        msg.textContent = '❌ ' + error.message;
        msg.className = 'form-msg error';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteRecipe(id) {
    if (!confirm('Are you sure you want to remove this recipe from your collection?')) return;

    try {
        const response = await fetch('delete_recipe.php', {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            alert('Failed to delete recipe. Please try again.');
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}

async function toggleFavorite(id, currentState) {
    try {
        await fetch('update_recipe.php', {
            method: 'POST',
            body: JSON.stringify({ id, favorite: !currentState }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Refresh grid or update local state
        if (document.getElementById('recipeGrid')) {
            fetchRecipes(); 
        } else {
            // If on detail page, we just reload or toggle class
            const btn = document.querySelector(`.favorite-btn`);
            if (btn) btn.classList.toggle('active');
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
    }
}

function editRecipe(id) {
    window.location.href = `add-recipe.html?edit=${id}`;
}

// ── Form Initialization ───────────────────────────────────
async function initForm() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (!editId) return;

    try {
        const response = await fetch(`get_recipes.php?id=${editId}`);
        const r = await response.json();

        document.getElementById('recipeId').value = r.id;
        document.getElementById('title').value = r.title;
        document.getElementById('category').value = r.category;
        document.getElementById('prep').value = r.prep;
        document.getElementById('ingredients').value = r.ingredients.join('\n');
        document.getElementById('steps').value = r.steps.join('\n');
        document.getElementById('imageUrl').value = r.imageUrl.startsWith('uploads/') ? '' : r.imageUrl;
        document.getElementById('favorite').checked = r.favorite;
        
        if (r.imageUrl) {
            const preview = document.getElementById('uploadPreview');
            const img = document.getElementById('previewImg');
            img.src = r.imageUrl;
            preview.style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load recipe for editing:', error);
    }
}

// ── SEO & Meta ────────────────────────────────────────────
function updateSchema() {
    const schemaEl = document.getElementById('recipeSchema');
    if (!schemaEl || allRecipes.length === 0) return;

    const schema = {
        "@context": "https://schema.org/",
        "@type": "ItemList",
        "itemListElement": allRecipes.map((r, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": window.location.origin + "/recipe.html?id=" + r.id,
            "name": r.title
        }))
    };
    schemaEl.textContent = JSON.stringify(schema);
}
