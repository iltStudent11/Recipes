const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, '..', 'data', 'recipes.json');
const publicDirPath = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(publicDirPath));

async function readRecipes() {
  const fileContent = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContent);
}

async function writeRecipes(recipes) {
  await fs.writeFile(dataFilePath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
}

function isValidRecipePayload(payload) {
  return Boolean(
    payload?.name
      && payload?.category
      && Array.isArray(payload?.ingredients)
      && payload?.instructions
  );
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/recipes', async (_req, res) => {
  try {
    const recipes = await readRecipes();
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read recipes data' });
  }
});

app.get('/recipes/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const recipes = await readRecipes();
    const recipe = recipes.find((item) => item.id === id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read recipes data' });
  }
});

app.post('/recipes', async (req, res) => {
  const { name, category, ingredients, instructions } = req.body;

  if (!isValidRecipePayload(req.body)) {
    return res.status(400).json({
      error: 'Invalid payload. Required fields: name, category, ingredients (array), instructions.'
    });
  }

  try {
    const recipes = await readRecipes();
    const nextId = recipes.length > 0 ? Math.max(...recipes.map((item) => item.id)) + 1 : 1;

    const newRecipe = {
      id: nextId,
      name,
      category,
      ingredients,
      instructions
    };

    recipes.push(newRecipe);
    await writeRecipes(recipes);

    return res.status(201).location(`/recipes/${newRecipe.id}`).json(newRecipe);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save recipe data' });
  }
});

app.put('/recipes/:id', async (req, res) => {
  const id = Number(req.params.id);

  const { name, category, ingredients, instructions } = req.body;

  if (!isValidRecipePayload(req.body)) {
    return res.status(400).json({
      error: 'Invalid payload. Required fields: name, category, ingredients (array), instructions.'
    });
  }

  try {
    const recipes = await readRecipes();
    const recipeIndex = recipes.findIndex((item) => item.id === id);

    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const updatedRecipe = {
      id,
      name,
      category,
      ingredients,
      instructions
    };

    recipes[recipeIndex] = updatedRecipe;
    await writeRecipes(recipes);

    return res.status(200).json(updatedRecipe);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save recipe data' });
  }
});

app.delete('/recipes/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const recipes = await readRecipes();
    const recipeIndex = recipes.findIndex((item) => item.id === id);

    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    recipes.splice(recipeIndex, 1);
    await writeRecipes(recipes);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save recipe data' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Bakery Recipes API running on port ${port}`);
});
