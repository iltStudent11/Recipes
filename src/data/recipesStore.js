const fs = require('fs/promises');
const { getEnv } = require('../config/env');

const { recipesFilePath } = getEnv();

async function readRecipes() {
  const fileContent = await fs.readFile(recipesFilePath, 'utf8');
  return JSON.parse(fileContent);
}

async function writeRecipes(recipes) {
  await fs.writeFile(recipesFilePath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
}

function getNextId(recipes) {
  return recipes.length > 0 ? Math.max(...recipes.map((item) => item.id)) + 1 : 1;
}

module.exports = {
  readRecipes,
  writeRecipes,
  getNextId
};
