const fs = require('fs/promises');
const path = require('path');
const { getEnv } = require('../config/env');

const { recipesFilePath } = getEnv();
const mealPlansFilePath = path.join(path.dirname(recipesFilePath), 'mealPlans.json');

async function readMealPlans() {
  const fileContent = await fs.readFile(mealPlansFilePath, 'utf8');
  return JSON.parse(fileContent);
}

async function writeMealPlans(mealPlans) {
  await fs.writeFile(mealPlansFilePath, `${JSON.stringify(mealPlans, null, 2)}\n`, 'utf8');
}

function getNextMealPlanId(mealPlans) {
  return mealPlans.length > 0 ? Math.max(...mealPlans.map((item) => item.id)) + 1 : 1;
}

module.exports = {
  readMealPlans,
  writeMealPlans,
  getNextMealPlanId
};
