# Bakery Recipes API

This is my small Express REST API for managing bakery recipes with JSON-file persistence.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
  ```bash
  cp .env.example .env
  ```
3. Start the API:
   ```bash
   npm run api
   ```

For development with auto-reload when files change in `src`, `public`, or `data`:

```bash
npm run dev
```

I run the server on `http://localhost:3000` by default.

My front-end URL is `http://localhost:3000`

My front-end page includes **Recipes**, **Meal Plans**, **Shopping Lists**, and **Pantry** sections.

I organized the front-end into four tabs:
- **Recipes**: browse/filter recipes, view details, create/edit/delete
- **Meal Plans**: create and manage meal plans from existing recipes
- **Shopping Lists**: generate aggregated shopping lists and pantry-missing items by meal plan
- **Pantry**: track available ingredients and quantities

## Project Structure

```text
src/
  app.js                  # Express app setup
  index.js                # Server bootstrap + dotenv config
  config/
    env.js                # Environment parsing/validation
  routes/
    healthRoutes.js       # /health endpoint
    recipeRoutes.js       # /recipes CRUD endpoints
    mealPlanRoutes.js     # /meal-plans + shopping list endpoints
    pantryRoutes.js       # /pantry inventory endpoints
  middleware/
    asyncHandler.js       # Async error wrapper
    requestLogger.js      # Request logging middleware
    validateRecipe.js     # Request payload validation
    errorHandlers.js      # 404 and error middleware
  data/
    recipesStore.js       # JSON file read/write logic
    mealPlansStore.js     # Meal plan JSON file read/write logic
    pantryStore.js        # Pantry JSON file read/write logic
```

I load environment variables with `dotenv` from `.env` and parse them via `src/config/env.js`.

- `PORT`: server port (default: `3000`, must be `1-65535`)
- `RECIPES_FILE`: JSON data file path (default: `./data/recipes.json`)

## Endpoints

- `GET /health` → `200 OK`
- `GET /recipes` → `200 OK` (supports query params: `category`, `q`)
- `GET /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `POST /recipes` → `201 Created` or `400 Bad Request`
- `PUT /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `PATCH /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `GET /recipes/:id/availability` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `DELETE /recipes/:id` → `204 No Content`, `400 Bad Request`, or `404 Not Found`
- `GET /meal-plans` → `200 OK`
- `GET /meal-plans/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `POST /meal-plans` → `201 Created` or `400 Bad Request`
- `GET /meal-plans/:id/shopping-list` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `GET /meal-plans/:id/missing-items` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `DELETE /meal-plans/:id` → `204 No Content`, `400 Bad Request`, or `404 Not Found`
- `GET /pantry` → `200 OK`
- `POST /pantry` → `201 Created`, `200 OK`, or `400 Bad Request`
- `DELETE /pantry/:name` → `204 No Content`, `400 Bad Request`, or `404 Not Found`

My API returns JSON bodies for success and errors (`400`, `404`, `500`).

## Example Requests

### List all recipes
```bash
curl -i http://localhost:3000/recipes
```

### Filter recipes by category
```bash
curl -i "http://localhost:3000/recipes?category=bread"
```

### Search recipes by text
```bash
curl -i "http://localhost:3000/recipes?q=chocolate"
```

### Get one recipe
```bash
curl -i http://localhost:3000/recipes/1
```

### Create a recipe
```bash
curl -i -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vanilla Cupcakes",
    "category": "cupcake",
    "ingredients": ["flour", "sugar", "butter", "eggs", "vanilla"],
    "instructions": "Mix batter, fill cups, and bake at 175°C for 18 minutes."
  }'
```

### Update a recipe
```bash
curl -i -X PUT http://localhost:3000/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Cookies",
    "category": "cookie",
    "ingredients": ["flour", "butter", "sugar", "eggs"],
    "instructions": "Mix ingredients and bake."
  }'
```

### Partially update a recipe
```bash
curl -i -X PATCH http://localhost:3000/recipes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "Rest dough overnight, then bake."
  }'
```

### Check recipe availability against pantry
```bash
curl -i http://localhost:3000/recipes/1/availability
```

### Delete a recipe
```bash
curl -i -X DELETE http://localhost:3000/recipes/1
```

### Create a meal plan
```bash
curl -i -X POST http://localhost:3000/meal-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Baking",
    "recipeIds": [1, 2]
  }'
```

### Get a shopping list for a meal plan
```bash
curl -i http://localhost:3000/meal-plans/1/shopping-list
```

### Get missing items for a meal plan (after pantry matching)
```bash
curl -i http://localhost:3000/meal-plans/1/missing-items
```

### Add or update a pantry item
```bash
curl -i -X POST http://localhost:3000/pantry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "flour",
    "quantity": "2 bags"
  }'
```

### Delete a pantry item
```bash
curl -i -X DELETE http://localhost:3000/pantry/flour
```

## Data Persistence

I store recipes in [data/recipes.json](data/recipes.json), meal plans in [data/mealPlans.json](data/mealPlans.json), and pantry items in [data/pantry.json](data/pantry.json).

## Deliverables Verification

- ✅ Express REST API with full CRUD operations:
  - Recipes CRUD in [src/routes/recipeRoutes.js](src/routes/recipeRoutes.js)
  - Meal plans CRUD-adjacent operations in [src/routes/mealPlanRoutes.js](src/routes/mealPlanRoutes.js)
  - Pantry CRUD-adjacent operations in [src/routes/pantryRoutes.js](src/routes/pantryRoutes.js)
- ✅ At least one custom middleware function:
  - Request logger in [src/middleware/requestLogger.js](src/middleware/requestLogger.js)
- ✅ Express Router for route organization:
  - Resource routers in [src/routes/recipeRoutes.js](src/routes/recipeRoutes.js), [src/routes/mealPlanRoutes.js](src/routes/mealPlanRoutes.js), [src/routes/pantryRoutes.js](src/routes/pantryRoutes.js), and [src/routes/healthRoutes.js](src/routes/healthRoutes.js)
- ✅ Centralized error handling:
  - Not-found and error handlers in [src/middleware/errorHandlers.js](src/middleware/errorHandlers.js), mounted in [src/app.js](src/app.js)
- ✅ Query parameter support for filtering or search:
  - `category` and `q` filters on `GET /recipes` in [src/routes/recipeRoutes.js](src/routes/recipeRoutes.js)
- ✅ AI usage documentation with at least two interactions:
  - Documented in [AI-USAGE.md](AI-USAGE.md)

## API Client Collections

- Postman: [postman/Bakery Recipes API.postman_collection.json](postman/Bakery%20Recipes%20API.postman_collection.json)
- Insomnia: [insomnia/Bakery Recipes API.insomnia.json](insomnia/Bakery%20Recipes%20API.insomnia.json)

Both collections include requests for all resources I use in this app.

## Import Instructions

### Postman

1. Open Postman.
2. Click **Import**.
3. Choose **Upload Files** and select [postman/Bakery Recipes API.postman_collection.json](postman/Bakery%20Recipes%20API.postman_collection.json).
4. Run requests using `{{baseUrl}}` (default: `http://localhost:3000`).

### Insomnia

1. Open Insomnia.
2. Go to **Application** → **Preferences** → **Data**.
3. Click **Import Data** → **From File**.
4. Select [insomnia/Bakery Recipes API.insomnia.json](insomnia/Bakery%20Recipes%20API.insomnia.json).
5. Run requests using `{{ _.base_url }}` (default: `http://localhost:3000`).

### Troubleshooting

- **Import fails**: re-download or re-open the file and ensure you selected the correct format-specific file:
  - Postman: [postman/Bakery Recipes API.postman_collection.json](postman/Bakery%20Recipes%20API.postman_collection.json)
  - Insomnia: [insomnia/Bakery Recipes API.insomnia.json](insomnia/Bakery%20Recipes%20API.insomnia.json)
- **Requests return connection refused**: start the API with `npm run api` and confirm it is running on port `3000`.
- **404 on recipe by ID**: verify the ID exists by calling `GET /recipes` first.
- **400 on create/update**: ensure payload includes `name`, `category`, `ingredients` (array), and `instructions`.

## 1-Minute Happy Path Test

Run these commands in order while the API is running (`npm run api`):

Or run the automated version:

```bash
npm run smoke
```

1. **List current recipes** (expect `200`)
  ```bash
  curl -i http://localhost:3000/recipes
  ```

2. **Create a recipe** (expect `201` and note returned `id`)
  ```bash
  curl -i -X POST http://localhost:3000/recipes \
    -H "Content-Type: application/json" \
    -d '{
     "name": "Quick Brownie",
     "category": "brownie",
     "ingredients": ["cocoa", "flour", "butter", "sugar", "eggs"],
     "instructions": "Mix, pour, and bake."
    }'
  ```

3. **Read that recipe** (replace `ID`, expect `200`)
  ```bash
  curl -i http://localhost:3000/recipes/ID
  ```

4. **Update that recipe** (replace `ID`, expect `200`)
  ```bash
  curl -i -X PUT http://localhost:3000/recipes/ID \
    -H "Content-Type: application/json" \
    -d '{
     "name": "Quick Fudgy Brownie",
     "category": "brownie",
     "ingredients": ["cocoa", "flour", "butter", "sugar", "eggs"],
     "instructions": "Mix, pour, and bake until set."
    }'
  ```

5. **Delete that recipe** (replace `ID`, expect `204`)
  ```bash
  curl -i -X DELETE http://localhost:3000/recipes/ID
  ```

6. **Confirm deletion** (replace `ID`, expect `404`)
  ```bash
  curl -i http://localhost:3000/recipes/ID
  ```
