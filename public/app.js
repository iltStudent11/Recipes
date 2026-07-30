const statusEl = document.getElementById('status');

const tabRecipesBtn = document.getElementById('tab-recipes');
const tabMealPlansBtn = document.getElementById('tab-meal-plans');
const tabShoppingBtn = document.getElementById('tab-shopping');
const tabPantryBtn = document.getElementById('tab-pantry');

const viewRecipes = document.getElementById('view-recipes');
const viewMealPlans = document.getElementById('view-meal-plans');
const viewShopping = document.getElementById('view-shopping');
const viewPantry = document.getElementById('view-pantry');

const quickNewRecipeBtn = document.getElementById('quick-new-recipe');
const quickNewMealPlanBtn = document.getElementById('quick-new-meal-plan');

const recipeSearchInput = document.getElementById('recipe-search');
const recipeCategoryFilter = document.getElementById('recipe-category-filter');
const recipeFilterBtn = document.getElementById('recipe-filter-btn');
const recipeClearBtn = document.getElementById('recipe-clear-btn');

const recipeSummaryListEl = document.getElementById('recipe-summary-list');
const recipeDetailEl = document.getElementById('recipe-detail');
const recipeEditBtn = document.getElementById('recipe-edit-btn');
const recipeDeleteBtn = document.getElementById('recipe-delete-btn');
const recipeAvailabilityBtn = document.getElementById('recipe-availability-btn');
const recipeAvailabilityOutput = document.getElementById('recipe-availability-output');

const recipeFormTitle = document.getElementById('recipe-form-title');
const recipeForm = document.getElementById('recipe-form');
const recipeFormId = document.getElementById('recipe-form-id');
const recipeFormName = document.getElementById('recipe-form-name');
const recipeFormCategory = document.getElementById('recipe-form-category');
const recipeFormIngredients = document.getElementById('recipe-form-ingredients');
const recipeFormInstructions = document.getElementById('recipe-form-instructions');
const recipeFormCancelBtn = document.getElementById('recipe-form-cancel');

const mealPlansListEl = document.getElementById('meal-plans-list');
const mealPlansRefreshBtn = document.getElementById('meal-plans-refresh-btn');
const mealPlanForm = document.getElementById('meal-plan-form');
const mealPlanNameInput = document.getElementById('meal-plan-name');
const mealPlanRecipeSearchInput = document.getElementById('meal-plan-recipe-search');
const mealPlanRecipeOptionsEl = document.getElementById('meal-plan-recipe-options');

const shoppingPlanSelect = document.getElementById('shopping-plan-select');
const shoppingLoadBtn = document.getElementById('shopping-load-btn');
const shoppingMissingBtn = document.getElementById('shopping-missing-btn');
const shoppingListItemsEl = document.getElementById('shopping-list-items');

const pantryListEl = document.getElementById('pantry-list');
const pantryRefreshBtn = document.getElementById('pantry-refresh-btn');
const pantryForm = document.getElementById('pantry-form');
const pantryNameInput = document.getElementById('pantry-name');
const pantryQuantityInput = document.getElementById('pantry-quantity');

const state = {
  activeView: 'recipes',
  recipes: [],
  visibleRecipes: [],
  mealPlans: [],
  pantryItems: [],
  selectedRecipeId: null,
  recipeFormMode: 'create',
  selectedMealPlanId: null
};

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b91c1c' : '#0f766e';
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeIngredientInput(text) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function setActiveTab(viewName) {
  state.activeView = viewName;

  viewRecipes.classList.toggle('hidden', viewName !== 'recipes');
  viewMealPlans.classList.toggle('hidden', viewName !== 'meal-plans');
  viewShopping.classList.toggle('hidden', viewName !== 'shopping');
  viewPantry.classList.toggle('hidden', viewName !== 'pantry');

  tabRecipesBtn.classList.toggle('active', viewName === 'recipes');
  tabMealPlansBtn.classList.toggle('active', viewName === 'meal-plans');
  tabShoppingBtn.classList.toggle('active', viewName === 'shopping');
  tabPantryBtn.classList.toggle('active', viewName === 'pantry');
}

function viewToHash(viewName) {
  if (viewName === 'meal-plans') {
    return '#meal-plans';
  }

  if (viewName === 'shopping') {
    return '#shopping';
  }

  if (viewName === 'pantry') {
    return '#pantry';
  }

  return '#recipes';
}

function hashToView(hashValue) {
  if (hashValue === '#meal-plans') {
    return 'meal-plans';
  }

  if (hashValue === '#shopping') {
    return 'shopping';
  }

  if (hashValue === '#pantry') {
    return 'pantry';
  }

  return 'recipes';
}

function goToView(viewName) {
  setActiveTab(viewName);
  const nextHash = viewToHash(viewName);
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}

function resetRecipeForm() {
  state.recipeFormMode = 'create';
  recipeFormTitle.textContent = 'Create Recipe';
  recipeFormId.value = '';
  recipeForm.reset();
}

function renderRecipeDetail() {
  const selected = state.visibleRecipes.find((item) => item.id === state.selectedRecipeId)
    || state.recipes.find((item) => item.id === state.selectedRecipeId);

  if (!selected) {
    recipeDetailEl.innerHTML = '<span class="muted">Select a recipe to view details.</span>';
    recipeAvailabilityOutput.textContent = '';
    return;
  }

  recipeDetailEl.innerHTML = `
    <strong>#${selected.id} ${selected.name}</strong>
    <div class="muted">Category: ${selected.category}</div>
    <div class="muted">Ingredients: ${selected.ingredients.join(', ')}</div>
    <div style="margin-top: 8px;">${selected.instructions}</div>
  `;
}

function renderRecipeAvailability(data) {
  const availableText = data.available
    ? 'Available now'
    : `Missing: ${data.missingIngredients.join(', ')}`;
  recipeAvailabilityOutput.textContent = availableText;
}

function renderRecipeList() {
  if (state.visibleRecipes.length === 0) {
    recipeSummaryListEl.innerHTML = '<li>No recipes found for the current filter.</li>';
    renderRecipeDetail();
    return;
  }

  recipeSummaryListEl.innerHTML = state.visibleRecipes
    .map((recipe) => {
      const isSelected = recipe.id === state.selectedRecipeId;
      const borderColor = isSelected ? '#0ea5e9' : '#e2e8f0';
      return `
        <li style="border-color: ${borderColor}; cursor: pointer;" data-recipe-id="${recipe.id}">
          <strong>${recipe.name}</strong>
          <div class="muted">${recipe.category}</div>
          <div class="muted">${recipe.ingredients.length} ingredients</div>
        </li>
      `;
    })
    .join('');

  recipeSummaryListEl.querySelectorAll('li[data-recipe-id]').forEach((itemEl) => {
    itemEl.addEventListener('click', () => {
      state.selectedRecipeId = Number(itemEl.getAttribute('data-recipe-id'));
      renderRecipeList();
      renderRecipeDetail();
    });
  });

  if (!state.selectedRecipeId && state.visibleRecipes.length > 0) {
    state.selectedRecipeId = state.visibleRecipes[0].id;
    renderRecipeList();
    return;
  }

  renderRecipeDetail();
}

function renderRecipeCategoryOptions() {
  const categories = [...new Set(state.recipes.map((item) => item.category))].sort();
  recipeCategoryFilter.innerHTML = '<option value="">All categories</option>'
    + categories.map((category) => `<option value="${category}">${category}</option>`).join('');
}

async function loadRecipesWithFilters() {
  const params = new URLSearchParams();
  const searchValue = recipeSearchInput.value.trim();
  const categoryValue = recipeCategoryFilter.value.trim();

  if (searchValue) {
    params.set('q', searchValue);
  }

  if (categoryValue) {
    params.set('category', categoryValue);
  }

  const url = params.toString() ? `/recipes?${params.toString()}` : '/recipes';
  state.visibleRecipes = await apiRequest(url);
  renderRecipeList();
}

async function refreshRecipesBase() {
  state.recipes = await apiRequest('/recipes');
  renderRecipeCategoryOptions();
  await loadRecipesWithFilters();
  renderMealPlanRecipeOptions();
}

function setRecipeFormForEdit() {
  const selected = state.recipes.find((item) => item.id === state.selectedRecipeId);

  if (!selected) {
    setStatus('Select a recipe before editing.', true);
    return;
  }

  state.recipeFormMode = 'edit';
  recipeFormTitle.textContent = `Edit Recipe #${selected.id}`;
  recipeFormId.value = String(selected.id);
  recipeFormName.value = selected.name;
  recipeFormCategory.value = selected.category;
  recipeFormIngredients.value = selected.ingredients.join(', ');
  recipeFormInstructions.value = selected.instructions;
}

function renderMealPlanRecipeOptions() {
  const searchQuery = mealPlanRecipeSearchInput.value.trim().toLowerCase();
  const recipes = state.recipes.filter((recipe) => {
    return !searchQuery || recipe.name.toLowerCase().includes(searchQuery);
  });

  if (recipes.length === 0) {
    mealPlanRecipeOptionsEl.innerHTML = '<div class="muted">No recipes match the search.</div>';
    return;
  }

  mealPlanRecipeOptionsEl.innerHTML = recipes
    .map((recipe) => `
      <label class="recipe-option">
        <input type="checkbox" name="meal-plan-recipe-id" value="${recipe.id}" />
        <span>#${recipe.id} ${recipe.name}</span>
      </label>
    `)
    .join('');
}

function renderMealPlansList() {
  if (state.mealPlans.length === 0) {
    mealPlansListEl.innerHTML = '<li>No meal plans yet.</li>';
    return;
  }

  mealPlansListEl.innerHTML = state.mealPlans
    .map((plan) => {
      const selected = plan.id === state.selectedMealPlanId;
      const borderColor = selected ? '#0ea5e9' : '#e2e8f0';

      return `
        <li style="border-color: ${borderColor};">
          <strong>#${plan.id} ${plan.name}</strong>
          <div class="muted">Recipes: ${plan.recipeIds.join(', ')}</div>
          <div class="row" style="margin-top: 8px;">
            <button class="secondary" data-load-shopping-id="${plan.id}" type="button">View Shopping List</button>
            <button class="danger" data-delete-meal-plan-id="${plan.id}" type="button">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');

  mealPlansListEl.querySelectorAll('button[data-load-shopping-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const planId = Number(btn.getAttribute('data-load-shopping-id'));
      try {
        await loadShoppingList(planId);
        goToView('shopping');
        setStatus(`Loaded shopping list for meal plan #${planId}`);
      } catch (error) {
        setStatus(error.message, true);
      }
    });
  });

  mealPlansListEl.querySelectorAll('button[data-delete-meal-plan-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const planId = Number(btn.getAttribute('data-delete-meal-plan-id'));
      try {
        await apiRequest(`/meal-plans/${planId}`, { method: 'DELETE' });
        if (state.selectedMealPlanId === planId) {
          state.selectedMealPlanId = null;
          shoppingListItemsEl.innerHTML = '';
        }
        await refreshMealPlans();
        setStatus(`Deleted meal plan #${planId}`);
      } catch (error) {
        setStatus(error.message, true);
      }
    });
  });
}

function renderShoppingPlanSelect() {
  const options = state.mealPlans
    .map((plan) => `<option value="${plan.id}">#${plan.id} ${plan.name}</option>`)
    .join('');

  shoppingPlanSelect.innerHTML = '<option value="">Select a meal plan</option>' + options;

  if (state.selectedMealPlanId) {
    shoppingPlanSelect.value = String(state.selectedMealPlanId);
  }
}

function renderShoppingItems(data) {
  if (!data.items.length) {
    shoppingListItemsEl.innerHTML = '<li>No ingredients in this meal plan.</li>';
    return;
  }

  shoppingListItemsEl.innerHTML = data.items
    .map((item) => `<li>${item.ingredient} (x${item.count})</li>`)
    .join('');
}

async function refreshMealPlans() {
  state.mealPlans = await apiRequest('/meal-plans');
  renderMealPlansList();
  renderShoppingPlanSelect();
}

function renderPantryList() {
  if (state.pantryItems.length === 0) {
    pantryListEl.innerHTML = '<li>No pantry items yet.</li>';
    return;
  }

  pantryListEl.innerHTML = state.pantryItems
    .map((item) => {
      const quantityText = item.quantity ? ` (${item.quantity})` : '';
      return `
        <li>
          <strong>${item.name}</strong>${quantityText}
          <div class="row" style="margin-top: 8px;">
            <button class="danger" data-delete-pantry-name="${encodeURIComponent(item.name)}" type="button">Delete</button>
          </div>
        </li>
      `;
    })
    .join('');

  pantryListEl.querySelectorAll('button[data-delete-pantry-name]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const encodedName = btn.getAttribute('data-delete-pantry-name');
      try {
        await apiRequest(`/pantry/${encodedName}`, { method: 'DELETE' });
        await refreshPantry();
        setStatus('Pantry item deleted');
      } catch (error) {
        setStatus(error.message, true);
      }
    });
  });
}

async function refreshPantry() {
  state.pantryItems = await apiRequest('/pantry');
  renderPantryList();
}

async function loadShoppingList(planId) {
  state.selectedMealPlanId = planId;
  renderShoppingPlanSelect();
  const data = await apiRequest(`/meal-plans/${planId}/shopping-list`);
  renderShoppingItems(data);
}

tabRecipesBtn.addEventListener('click', (event) => {
  event.preventDefault();
  goToView('recipes');
});
tabMealPlansBtn.addEventListener('click', (event) => {
  event.preventDefault();
  goToView('meal-plans');
});
tabShoppingBtn.addEventListener('click', (event) => {
  event.preventDefault();
  goToView('shopping');
});
tabPantryBtn.addEventListener('click', (event) => {
  event.preventDefault();
  goToView('pantry');
});

quickNewRecipeBtn.addEventListener('click', () => {
  goToView('recipes');
  resetRecipeForm();
  recipeFormName.focus();
});

quickNewMealPlanBtn.addEventListener('click', () => {
  goToView('meal-plans');
  mealPlanNameInput.focus();
});

recipeAvailabilityBtn.addEventListener('click', async () => {
  if (!state.selectedRecipeId) {
    setStatus('Select a recipe first.', true);
    return;
  }

  try {
    const data = await apiRequest(`/recipes/${state.selectedRecipeId}/availability`);
    renderRecipeAvailability(data);
    setStatus(`Checked pantry availability for recipe #${state.selectedRecipeId}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

window.addEventListener('hashchange', () => {
  const targetView = hashToView(window.location.hash);
  setActiveTab(targetView);
});

recipeFilterBtn.addEventListener('click', async () => {
  try {
    await loadRecipesWithFilters();
    setStatus('Recipe filter applied');
  } catch (error) {
    setStatus(error.message, true);
  }
});

recipeClearBtn.addEventListener('click', async () => {
  recipeSearchInput.value = '';
  recipeCategoryFilter.value = '';
  try {
    await loadRecipesWithFilters();
    setStatus('Recipe filters cleared');
  } catch (error) {
    setStatus(error.message, true);
  }
});

recipeEditBtn.addEventListener('click', () => {
  setRecipeFormForEdit();
});

recipeDeleteBtn.addEventListener('click', async () => {
  if (!state.selectedRecipeId) {
    setStatus('Select a recipe before deleting.', true);
    return;
  }

  try {
    await apiRequest(`/recipes/${state.selectedRecipeId}`, { method: 'DELETE' });
    const deletedId = state.selectedRecipeId;
    state.selectedRecipeId = null;
    resetRecipeForm();
    await refreshRecipesBase();
    setStatus(`Deleted recipe #${deletedId}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

recipeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: recipeFormName.value.trim(),
    category: recipeFormCategory.value.trim(),
    ingredients: normalizeIngredientInput(recipeFormIngredients.value),
    instructions: recipeFormInstructions.value.trim()
  };

  try {
    if (state.recipeFormMode === 'edit' && recipeFormId.value) {
      const recipeId = Number(recipeFormId.value);
      await apiRequest(`/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      state.selectedRecipeId = recipeId;
      setStatus(`Updated recipe #${recipeId}`);
    } else {
      const created = await apiRequest('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      state.selectedRecipeId = created.id;
      setStatus(`Created recipe #${created.id}`);
    }

    resetRecipeForm();
    await refreshRecipesBase();
    await refreshMealPlans();
  } catch (error) {
    setStatus(error.message, true);
  }
});

recipeFormCancelBtn.addEventListener('click', () => {
  resetRecipeForm();
});

mealPlansRefreshBtn.addEventListener('click', async () => {
  try {
    await refreshMealPlans();
    setStatus('Meal plans refreshed');
  } catch (error) {
    setStatus(error.message, true);
  }
});

mealPlanRecipeSearchInput.addEventListener('input', () => {
  renderMealPlanRecipeOptions();
});

mealPlanForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const selectedIds = Array.from(
    mealPlanRecipeOptionsEl.querySelectorAll('input[name="meal-plan-recipe-id"]:checked')
  ).map((checkbox) => Number(checkbox.value));

  const payload = {
    name: mealPlanNameInput.value.trim(),
    recipeIds: selectedIds
  };

  if (!payload.name || payload.recipeIds.length === 0) {
    setStatus('Provide a plan name and select at least one recipe.', true);
    return;
  }

  try {
    const created = await apiRequest('/meal-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    state.selectedMealPlanId = created.id;
    mealPlanForm.reset();
    renderMealPlanRecipeOptions();
    await refreshMealPlans();
    setStatus(`Created meal plan #${created.id}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

shoppingLoadBtn.addEventListener('click', async () => {
  const selectedId = Number(shoppingPlanSelect.value);

  if (!Number.isInteger(selectedId) || selectedId < 1) {
    setStatus('Select a meal plan first.', true);
    return;
  }

  try {
    await loadShoppingList(selectedId);
    setStatus(`Loaded shopping list for meal plan #${selectedId}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

shoppingMissingBtn.addEventListener('click', async () => {
  const selectedId = Number(shoppingPlanSelect.value);

  if (!Number.isInteger(selectedId) || selectedId < 1) {
    setStatus('Select a meal plan first.', true);
    return;
  }

  try {
    const data = await apiRequest(`/meal-plans/${selectedId}/missing-items`);
    if (!data.items.length) {
      shoppingListItemsEl.innerHTML = '<li>All ingredients are available in pantry.</li>';
    } else {
      shoppingListItemsEl.innerHTML = data.items
        .map((item) => `<li>${item.ingredient} (x${item.count})</li>`)
        .join('');
    }
    setStatus(`Loaded missing items for meal plan #${selectedId}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

pantryRefreshBtn.addEventListener('click', async () => {
  try {
    await refreshPantry();
    setStatus('Pantry refreshed');
  } catch (error) {
    setStatus(error.message, true);
  }
});

pantryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: pantryNameInput.value.trim(),
    quantity: pantryQuantityInput.value.trim()
  };

  if (!payload.name) {
    setStatus('Pantry item name is required.', true);
    return;
  }

  try {
    await apiRequest('/pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    pantryForm.reset();
    await refreshPantry();
    setStatus(`Saved pantry item: ${payload.name}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

(async () => {
  try {
    await refreshRecipesBase();
    await refreshMealPlans();
    await refreshPantry();
    setActiveTab(hashToView(window.location.hash));
    resetRecipeForm();
    setStatus('Loaded recipes, meal plans, and pantry');
  } catch (error) {
    setStatus(error.message, true);
  }
})();
