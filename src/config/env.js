const path = require('path');

function parsePort(portValue) {
  if (!portValue) {
    return 3000;
  }

  const parsed = Number(portValue);
  const isInteger = Number.isInteger(parsed);

  if (!isInteger || parsed < 1 || parsed > 65535) {
    throw new Error('Invalid PORT value. Expected an integer between 1 and 65535.');
  }

  return parsed;
}

function resolveRecipesFile(recipesFileValue) {
  const fallbackPath = path.join(process.cwd(), 'data', 'recipes.json');

  if (!recipesFileValue) {
    return fallbackPath;
  }

  return path.isAbsolute(recipesFileValue)
    ? recipesFileValue
    : path.join(process.cwd(), recipesFileValue);
}

function getEnv() {
  return {
    port: parsePort(process.env.PORT),
    recipesFilePath: resolveRecipesFile(process.env.RECIPES_FILE)
  };
}

module.exports = {
  getEnv
};
