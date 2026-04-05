'use strict';

/* ─── State ──────────────────────────────────────────────────── */
let allRecipes = [];
let currentView = 'home';

/* ─── View routing ───────────────────────────────────────────── */
function showView(view) {
  ['home', 'detail', 'add'].forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== view);
  });
  currentView = view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Navbar mobile menu ─────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ─── Toast ──────────────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
}

/* ─── Fetch helpers ──────────────────────────────────────────── */
async function fetchRecipes(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  const url = `/api/recipes${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load recipes');
  return res.json();
}

async function fetchRecipe(id) {
  const res = await fetch(`/api/recipes/${id}`);
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

async function deleteRecipeById(id) {
  const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
}

async function createRecipe(data) {
  const res = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create recipe');
  }
  return res.json();
}

/* ─── Render recipe card ─────────────────────────────────────── */
function difficultyTag(difficulty) {
  const map = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
  return `<span class="tag tag-${map[difficulty] || 'easy'}">${difficulty}</span>`;
}

function renderCard(recipe) {
  return `
    <article class="recipe-card" onclick="openRecipe(${recipe.id})">
      <img class="card-img" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.title)}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'" />
      <div class="card-body">
        <div class="card-tags">
          <span class="tag tag-category">${escHtml(recipe.category)}</span>
          ${difficultyTag(recipe.difficulty)}
        </div>
        <h3 class="card-title">${escHtml(recipe.title)}</h3>
        <p class="card-desc">${escHtml(recipe.description)}</p>
        <div class="card-meta">
          <span>⏱ ${recipe.time} min</span>
          <span>🍽 ${recipe.servings} servings</span>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="btn-view" onclick="openRecipe(${recipe.id})">View Recipe</button>
          <button class="btn-delete" title="Delete" onclick="handleDelete(${recipe.id})">🗑</button>
        </div>
      </div>
    </article>`;
}

/* ─── Load & render grid ─────────────────────────────────────── */
async function loadRecipes(params = {}) {
  const grid = document.getElementById('recipeGrid');
  grid.innerHTML = '<div class="loading">Loading recipes…</div>';

  try {
    allRecipes = await fetchRecipes(params);
    document.getElementById('recipeCount').textContent =
      `${allRecipes.length} recipe${allRecipes.length !== 1 ? 's' : ''}`;

    if (allRecipes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>No recipes found. Try different filters or <a href="#" onclick="showView('add')">add the first one</a>!</p>
        </div>`;
      return;
    }

    grid.innerHTML = allRecipes.map(renderCard).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><p>❌ ${escHtml(err.message)}</p></div>`;
  }
}

/* ─── Search & filters ───────────────────────────────────────── */
let searchDebounce = null;

function handleSearch() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(applyFilters, 250);
}

function applyFilters() {
  const search     = document.getElementById('searchInput').value.trim();
  const category   = document.getElementById('filterCategory').value;
  const difficulty = document.getElementById('filterDifficulty').value;
  loadRecipes({ search, category, difficulty });
}

function clearFilters() {
  document.getElementById('searchInput').value     = '';
  document.getElementById('filterCategory').value  = '';
  document.getElementById('filterDifficulty').value = '';
  loadRecipes();
}

/* ─── Recipe detail ──────────────────────────────────────────── */
async function openRecipe(id) {
  showView('detail');
  const el = document.getElementById('detailContent');
  el.innerHTML = '<div class="loading">Loading…</div>';

  try {
    const r = await fetchRecipe(id);
    el.innerHTML = `
      <img class="detail-hero-img" src="${escHtml(r.image)}" alt="${escHtml(r.title)}"
           onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80'" />
      <div class="detail-header">
        <div class="card-tags" style="margin-bottom:.75rem">
          <span class="tag tag-category">${escHtml(r.category)}</span>
          ${difficultyTag(r.difficulty)}
        </div>
        <h1>${escHtml(r.title)}</h1>
        <div class="detail-meta">
          <span>⏱ <strong>${r.time} min</strong></span>
          <span>🍽 <strong>${r.servings} servings</strong></span>
          <span>📊 <strong>${escHtml(r.difficulty)}</strong></span>
        </div>
      </div>
      <p class="detail-desc">${escHtml(r.description)}</p>
      <div class="detail-columns">
        <div class="detail-section">
          <h2>Ingredients</h2>
          <ul class="ingredient-list">
            ${r.ingredients.map(i => `<li>${escHtml(i)}</li>`).join('')}
          </ul>
        </div>
        <div class="detail-section">
          <h2>Instructions</h2>
          <ol class="steps-list">
            ${r.steps.map((s, idx) => `
              <li>
                <span class="step-num">${idx + 1}</span>
                <span>${escHtml(s)}</span>
              </li>`).join('')}
          </ol>
        </div>
      </div>`;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><p>❌ ${escHtml(err.message)}</p></div>`;
  }
}

/* ─── Delete recipe ──────────────────────────────────────────── */
async function handleDelete(id) {
  if (!confirm('Delete this recipe? This cannot be undone.')) return;
  try {
    await deleteRecipeById(id);
    showToast('Recipe deleted.', 'success');
    applyFilters();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ─── Add recipe form submit ─────────────────────────────────── */
async function submitRecipe(e) {
  e.preventDefault();

  const ingredients = document.getElementById('fIngredients').value
    .split('\n').map(s => s.trim()).filter(Boolean);
  const steps = document.getElementById('fSteps').value
    .split('\n').map(s => s.trim()).filter(Boolean);

  const data = {
    title:       document.getElementById('fTitle').value.trim(),
    category:    document.getElementById('fCategory').value,
    difficulty:  document.getElementById('fDifficulty').value,
    time:        parseInt(document.getElementById('fTime').value, 10),
    servings:    parseInt(document.getElementById('fServings').value, 10),
    image:       document.getElementById('fImage').value.trim(),
    description: document.getElementById('fDescription').value.trim(),
    ingredients,
    steps
  };

  try {
    await createRecipe(data);
    showToast('Recipe published! 🎉', 'success');
    document.getElementById('recipeForm').reset();
    showView('home');
    loadRecipes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ─── Escape HTML (XSS prevention) ──────────────────────────── */
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Init ───────────────────────────────────────────────────── */
loadRecipes();
