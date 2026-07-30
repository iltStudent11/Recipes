function validateRecipePatch(req, res, next) {
  const allowedFields = ['name', 'category', 'ingredients', 'instructions'];
  const providedFields = Object.keys(req.body || {});
  const updates = providedFields.filter((field) => allowedFields.includes(field));

  if (updates.length === 0) {
    return res.status(400).json({
      error: 'Invalid payload. Provide at least one of: name, category, ingredients, instructions.'
    });
  }

  if ('ingredients' in req.body && !Array.isArray(req.body.ingredients)) {
    return res.status(400).json({
      error: 'Invalid payload. ingredients must be an array when provided.'
    });
  }

  return next();
}

module.exports = validateRecipePatch;
