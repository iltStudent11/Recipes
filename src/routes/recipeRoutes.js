const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validateRecipe = require('../middleware/validateRecipe');
const { readRecipes, writeRecipes, getNextId } = require('../data/recipesStore');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const recipes = await readRecipes();
  res.status(200).json(recipes);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
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
  const id = Number(req.params.id);
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

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
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
