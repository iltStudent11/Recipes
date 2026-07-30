const fs = require('fs/promises');
const path = require('path');
const { getEnv } = require('../config/env');

const { recipesFilePath } = getEnv();
const pantryFilePath = path.join(path.dirname(recipesFilePath), 'pantry.json');

async function readPantryItems() {
  const fileContent = await fs.readFile(pantryFilePath, 'utf8');
  return JSON.parse(fileContent);
}

async function writePantryItems(items) {
  await fs.writeFile(pantryFilePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

module.exports = {
  readPantryItems,
  writePantryItems
};
