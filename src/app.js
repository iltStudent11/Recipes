const express = require('express');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();
const publicDirPath = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(requestLogger);
app.use(express.static(publicDirPath));

app.use('/health', healthRoutes);
app.use('/recipes', recipeRoutes);
app.use('/meal-plans', mealPlanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
