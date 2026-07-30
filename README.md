# Bakery Recipes API

A small Express REST API for managing bakery recipes with JSON-file persistence.

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

The server runs on `http://localhost:3000` by default.

Frontend URL: `http://localhost:3000`

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
  middleware/
    asyncHandler.js       # Async error wrapper
    requestLogger.js      # Request logging middleware
    validateRecipe.js     # Request payload validation
    errorHandlers.js      # 404 and error middleware
  data/
    recipesStore.js       # JSON file read/write logic
```

Environment variables are loaded with `dotenv` from `.env` and parsed via `src/config/env.js`.

- `PORT`: server port (default: `3000`, must be `1-65535`)
- `RECIPES_FILE`: JSON data file path (default: `./data/recipes.json`)

## Endpoints

- `GET /health` → `200 OK`
- `GET /recipes` → `200 OK` (supports query params: `category`, `q`)
- `GET /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `POST /recipes` → `201 Created` or `400 Bad Request`
- `PUT /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `PATCH /recipes/:id` → `200 OK`, `400 Bad Request`, or `404 Not Found`
- `DELETE /recipes/:id` → `204 No Content`, `400 Bad Request`, or `404 Not Found`

The API returns JSON bodies for success and errors (`400`, `404`, `500`).

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

### Delete a recipe
```bash
curl -i -X DELETE http://localhost:3000/recipes/1
```

## Data Persistence

Recipes are stored in [data/recipes.json](data/recipes.json). Changes made through the API are written to that file.

## API Client Collections

- Postman: [postman/Bakery Recipes API.postman_collection.json](postman/Bakery%20Recipes%20API.postman_collection.json)
- Insomnia: [insomnia/Bakery Recipes API.insomnia.json](insomnia/Bakery%20Recipes%20API.insomnia.json)

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
