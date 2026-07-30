const statusEl = document.getElementById('status');
const recipesListEl = document.getElementById('recipes-list');
const createForm = document.getElementById('create-form');
const refreshBtn = document.getElementById('refresh-btn');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b91c1c' : '#0f766e';
}

function toIngredientArray(text) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchRecipes() {
  const response = await fetch('/recipes');
  if (!response.ok) {
    throw new Error('Failed to load recipes');
  }
  return response.json();
}

function recipeTemplate(recipe) {
  const ingredients = recipe.ingredients.join(', ');
  return `
    <li>
      <strong>#${recipe.id} ${recipe.name}</strong>
      <div class="muted">Category: ${recipe.category}</div>
      <div class="muted">Ingredients: ${ingredients}</div>
      <div style="margin: 8px 0;">${recipe.instructions}</div>
      <form data-update-id="${recipe.id}" style="margin-bottom: 8px;">
        <input name="name" value="${recipe.name}" required />
        <input name="category" value="${recipe.category}" required />
        <input name="ingredients" value="${ingredients}" required />
        <textarea name="instructions" required>${recipe.instructions}</textarea>
        <button class="primary" type="submit">Update</button>
      </form>
      <button data-delete-id="${recipe.id}" class="danger" type="button">Delete</button>
    </li>
  `;
}

async function renderRecipes() {
  const recipes = await fetchRecipes();
  recipesListEl.innerHTML = recipes.map(recipeTemplate).join('');

  recipesListEl.querySelectorAll('form[data-update-id]').forEach((formEl) => {
    formEl.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = formEl.getAttribute('data-update-id');
      const formData = new FormData(formEl);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        category: String(formData.get('category') || '').trim(),
        ingredients: toIngredientArray(String(formData.get('ingredients') || '')),
        instructions: String(formData.get('instructions') || '').trim()
      };

      const response = await fetch(`/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to update recipe');
      }

      setStatus(`Recipe #${id} updated`);
      await renderRecipes();
    });
  });

  recipesListEl.querySelectorAll('button[data-delete-id]').forEach((buttonEl) => {
    buttonEl.addEventListener('click', async () => {
      const id = buttonEl.getAttribute('data-delete-id');
      const response = await fetch(`/recipes/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to delete recipe');
      }

      setStatus(`Recipe #${id} deleted`);
      await renderRecipes();
    });
  });
}

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(createForm);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    ingredients: toIngredientArray(String(formData.get('ingredients') || '')),
    instructions: String(formData.get('instructions') || '').trim()
  };

  try {
    const response = await fetch('/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Failed to create recipe');
    }

    createForm.reset();
    setStatus('Recipe created');
    await renderRecipes();
  } catch (error) {
    setStatus(error.message, true);
  }
});

refreshBtn.addEventListener('click', async () => {
  try {
    await renderRecipes();
    setStatus('Recipes refreshed');
  } catch (error) {
    setStatus(error.message, true);
  }
});

(async () => {
  try {
    await renderRecipes();
    setStatus('Loaded recipes');
  } catch (error) {
    setStatus(error.message, true);
  }
})();
