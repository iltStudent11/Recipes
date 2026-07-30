function isValidRecipePayload(payload) {
  return Boolean(
    payload?.name
      && payload?.category
      && Array.isArray(payload?.ingredients)
      && payload?.instructions
  );
}

function validateRecipe(req, res, next) {
  if (!isValidRecipePayload(req.body)) {
    return res.status(400).json({
      error: 'Invalid payload. Required fields: name, category, ingredients (array), instructions.'
    });
  }

  return next();
}

module.exports = validateRecipe;
