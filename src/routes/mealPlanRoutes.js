const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { readRecipes } = require('../data/recipesStore');
const { readPantryItems } = require('../data/pantryStore');
const {
  readMealPlans,
  writeMealPlans,
  getNextMealPlanId
} = require('../data/mealPlansStore');

const router = express.Router();

function normalizeIngredientName(name) {
  return String(name || '').trim().toLowerCase();
}

function parseMealPlanId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid meal plan id. It must be a positive integer.' });
    return null;
  }

  return id;
}

function validateMealPlanPayload(req, res, next) {
  const { name, recipeIds } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Invalid payload. name is required.' });
  }

  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json({ error: 'Invalid payload. recipeIds must be a non-empty array.' });
  }

  const normalizedIds = recipeIds.map((item) => Number(item));
  const hasInvalidId = normalizedIds.some((id) => !Number.isInteger(id) || id < 1);

  if (hasInvalidId) {
    return res.status(400).json({ error: 'Invalid payload. recipeIds must contain positive integers only.' });
  }

  req.validatedMealPlan = {
    name: name.trim(),
    recipeIds: normalizedIds
  };

  return next();
}

router.get('/', asyncHandler(async (_req, res) => {
  const mealPlans = await readMealPlans();
  return res.status(200).json(mealPlans);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseMealPlanId(req, res);
  if (id === null) {
    return;
  }

  const mealPlans = await readMealPlans();
  const mealPlan = mealPlans.find((item) => item.id === id);

  if (!mealPlan) {
    return res.status(404).json({ error: 'Meal plan not found' });
  }

  return res.status(200).json(mealPlan);
}));

router.post('/', validateMealPlanPayload, asyncHandler(async (req, res) => {
  const { name, recipeIds } = req.validatedMealPlan;
  const [recipes, mealPlans] = await Promise.all([readRecipes(), readMealPlans()]);

  const recipeIdSet = new Set(recipes.map((recipe) => recipe.id));
  const missingRecipeIds = [...new Set(recipeIds)].filter((id) => !recipeIdSet.has(id));

  if (missingRecipeIds.length > 0) {
    return res.status(400).json({
      error: `Some recipeIds do not exist: ${missingRecipeIds.join(', ')}`
    });
  }

  const newMealPlan = {
    id: getNextMealPlanId(mealPlans),
    name,
    recipeIds,
    createdAt: new Date().toISOString()
  };

  mealPlans.push(newMealPlan);
  await writeMealPlans(mealPlans);

  return res.status(201).location(`/meal-plans/${newMealPlan.id}`).json(newMealPlan);
}));

router.get('/:id/shopping-list', asyncHandler(async (req, res) => {
  const id = parseMealPlanId(req, res);
  if (id === null) {
    return;
  }

  const [mealPlans, recipes] = await Promise.all([readMealPlans(), readRecipes()]);
  const mealPlan = mealPlans.find((item) => item.id === id);

  if (!mealPlan) {
    return res.status(404).json({ error: 'Meal plan not found' });
  }

  const selectedRecipes = mealPlan.recipeIds
    .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
    .filter(Boolean);

  const ingredientMap = new Map();

  selectedRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const normalized = ingredient.trim().toLowerCase();
      const existing = ingredientMap.get(normalized);

      if (!existing) {
        ingredientMap.set(normalized, {
          ingredient: ingredient.trim(),
          count: 1
        });
      } else {
        existing.count += 1;
      }
    });
  });

  const items = [...ingredientMap.values()].sort((first, second) => {
    return first.ingredient.localeCompare(second.ingredient);
  });

  return res.status(200).json({
    mealPlanId: mealPlan.id,
    mealPlanName: mealPlan.name,
    recipeCount: selectedRecipes.length,
    items
  });
}));

router.get('/:id/missing-items', asyncHandler(async (req, res) => {
  const id = parseMealPlanId(req, res);
  if (id === null) {
    return;
  }

  const [mealPlans, recipes, pantryItems] = await Promise.all([
    readMealPlans(),
    readRecipes(),
    readPantryItems()
  ]);
  const mealPlan = mealPlans.find((item) => item.id === id);

  if (!mealPlan) {
    return res.status(404).json({ error: 'Meal plan not found' });
  }

  const selectedRecipes = mealPlan.recipeIds
    .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
    .filter(Boolean);

  const pantrySet = new Set(pantryItems.map((item) => normalizeIngredientName(item.name)));
  const missingMap = new Map();

  selectedRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const normalized = normalizeIngredientName(ingredient);

      if (pantrySet.has(normalized)) {
        return;
      }

      const existing = missingMap.get(normalized);
      if (!existing) {
        missingMap.set(normalized, {
          ingredient: ingredient.trim(),
          count: 1
        });
      } else {
        existing.count += 1;
      }
    });
  });

  const items = [...missingMap.values()].sort((first, second) => {
    return first.ingredient.localeCompare(second.ingredient);
  });

  return res.status(200).json({
    mealPlanId: mealPlan.id,
    mealPlanName: mealPlan.name,
    pantryItemCount: pantryItems.length,
    items
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseMealPlanId(req, res);
  if (id === null) {
    return;
  }

  const mealPlans = await readMealPlans();
  const planIndex = mealPlans.findIndex((item) => item.id === id);

  if (planIndex === -1) {
    return res.status(404).json({ error: 'Meal plan not found' });
  }

  mealPlans.splice(planIndex, 1);
  await writeMealPlans(mealPlans);

  return res.status(204).send();
}));

module.exports = router;
