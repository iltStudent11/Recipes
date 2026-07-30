const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { readPantryItems, writePantryItems } = require('../data/pantryStore');

const router = express.Router();

function normalizeIngredientName(name) {
  return String(name || '').trim().toLowerCase();
}

function parsePantryName(req, res) {
  const decodedName = decodeURIComponent(req.params.name || '');
  const normalized = normalizeIngredientName(decodedName);

  if (!normalized) {
    res.status(400).json({ error: 'Invalid pantry item name.' });
    return null;
  }

  return normalized;
}

router.get('/', asyncHandler(async (_req, res) => {
  const items = await readPantryItems();
  return res.status(200).json(items);
}));

router.post('/', asyncHandler(async (req, res) => {
  const name = normalizeIngredientName(req.body?.name);
  const quantity = String(req.body?.quantity || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'Invalid payload. name is required.' });
  }

  const items = await readPantryItems();
  const existingIndex = items.findIndex((item) => item.name === name);

  const pantryItem = {
    name,
    quantity
  };

  if (existingIndex === -1) {
    items.push(pantryItem);
    await writePantryItems(items);
    return res.status(201).location(`/pantry/${encodeURIComponent(name)}`).json(pantryItem);
  }

  items[existingIndex] = pantryItem;
  await writePantryItems(items);
  return res.status(200).json(pantryItem);
}));

router.delete('/:name', asyncHandler(async (req, res) => {
  const name = parsePantryName(req, res);
  if (name === null) {
    return;
  }

  const items = await readPantryItems();
  const itemIndex = items.findIndex((item) => item.name === name);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Pantry item not found' });
  }

  items.splice(itemIndex, 1);
  await writePantryItems(items);

  return res.status(204).send();
}));

module.exports = router;
