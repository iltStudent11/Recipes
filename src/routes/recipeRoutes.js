const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRecipe = require('../middleware/validateRecipe');
const validateRecipePatch = require('../middleware/validateRecipePatch');
const { readRecipes, writeRecipes, getNextId } = require('../data/recipesStore');

const router = express.Router();

function parseRecipeId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid recipe id. It must be a positive integer.' });
    return null;
  }

  return id;
}

router.get('/', asyncHandler(async (req, res) => {
  const recipes = await readRecipes();

  const categoryFilter = String(req.query.category || '').trim().toLowerCase();
  const searchQuery = String(req.query.q || '').trim().toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => {
    const categoryMatches = !categoryFilter || recipe.category.toLowerCase() === categoryFilter;
    const searchMatches = !searchQuery
      || recipe.name.toLowerCase().includes(searchQuery)
      || recipe.instructions.toLowerCase().includes(searchQuery);

    return categoryMatches && searchMatches;
  });

  res.status(200).json(filteredRecipes);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseRecipeId(req, res);
  if (id === null) {
    return;
  }

  const recipes = await readRecipes();
  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  return res.status(200).json(recipe);
}));

router.post('/', validateRecipe, asyncHandler(async (req, res) => {
  const { name, category, ingredients, instructions } = req.body;
  const recipes = await readRecipes();

  const newRecipe = {
    id: getNextId(recipes),
    name,
    category,
    ingredients,
    instructions
  };

  recipes.push(newRecipe);
  await writeRecipes(recipes);

  return res.status(201).location(`/recipes/${newRecipe.id}`).json(newRecipe);
}));

router.put('/:id', validateRecipe, asyncHandler(async (req, res) => {
  const id = parseRecipeId(req, res);
  if (id === null) {
    return;
  }

  const { name, category, ingredients, instructions } = req.body;
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
}));

router.patch('/:id', validateRecipePatch, asyncHandler(async (req, res) => {
  const id = parseRecipeId(req, res);
  if (id === null) {
    return;
  }

  const recipes = await readRecipes();
  const recipeIndex = recipes.findIndex((item) => item.id === id);

  if (recipeIndex === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  const updatedRecipe = {
    ...recipes[recipeIndex],
    ...req.body,
    id
  };

  recipes[recipeIndex] = updatedRecipe;
  await writeRecipes(recipes);

  return res.status(200).json(updatedRecipe);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseRecipeId(req, res);
  if (id === null) {
    return;
  }

  const recipes = await readRecipes();
  const recipeIndex = recipes.findIndex((item) => item.id === id);

  if (recipeIndex === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  recipes.splice(recipeIndex, 1);
  await writeRecipes(recipes);

  return res.status(204).send();
}));

module.exports = router;
