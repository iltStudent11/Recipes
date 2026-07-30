# AI Usage Report

## Prompt / Context Given to AI Tool

- My primary task prompt was to implement the meal planner + shopping list MVP feature for this bakery recipes app.
- I also asked for documentation in this file covering prompt/context, decisions, validation approach, and limitations/hallucinations.
- I provided this project context:
  - Existing Express app with modular routes/middleware/data layers.
  - Existing JSON file persistence in `data/recipes.json`.
  - Existing REST conventions and smoke test workflow.

## AI Suggestions and Decision Outcomes

1. Suggestion: Add a new REST resource at `/meal-plans` with JSON-file persistence.
  - My decision: **Accepted**.
  - Result:
     - Added `src/routes/mealPlanRoutes.js`.
     - Added `src/data/mealPlansStore.js`.
     - Added persistent file `data/mealPlans.json`.

2. Suggestion: Generate shopping list by aggregating ingredients from recipe IDs in a meal plan.
  - My decision: **Accepted with modification**.
  - My modification:
     - Used ingredient occurrence counts (`count`) rather than quantity math because recipe ingredients are plain strings with no unit/amount schema.

3. Suggestion: Include CRUD-adjacent endpoints for meal plans (`GET`, `POST`, `DELETE`) plus `GET /meal-plans/:id/shopping-list`.
  - My decision: **Accepted**.

4. Suggestion: Validate meal plan payloads and ID parameters with 400/404 behavior.
  - My decision: **Accepted**.

5. Suggestion: Add README documentation updates for new endpoints.
  - My decision: **Accepted**.

## Validation of AI-Generated Code

- I validated this feature with automated regression testing:
  - Ran `npm run smoke` to confirm existing recipes CRUD behavior remained intact.
- I validated manually with endpoint checks:
  - Created meal plan via `POST /meal-plans`.
  - Retrieved meal plans via `GET /meal-plans` and `GET /meal-plans/:id`.
  - Generated shopping list via `GET /meal-plans/:id/shopping-list`.
  - Verified status codes and JSON response shapes.
- I also did static review/diagnostics:
  - Checked edited files for diagnostics errors using editor problem checks.

## Limitations / Hallucinations and Handling

- Limitation: Shopping-list quantities cannot represent real amounts (e.g., cups, grams) because recipe ingredients are stored as plain strings.
  - How I handled it: I accepted deterministic occurrence counts (`count`) and documented this behavior.

- Limitation: Earlier verification in this project history occasionally hit stale server processes during route updates.
  - How I handled it: I restarted the API process before re-running checks so the latest code path was tested.

- Hallucination handling approach I used:
  - I avoided fabricated external assumptions.
  - I kept behavior grounded in the current repository schema and executable tests.

## Pantry Feature (Inventory + Availability Matcher)

### Prompt / Context Given to AI Tool

- My primary prompt was to implement Pantry Inventory + "Can I Bake This?" matcher MVP as the next app feature.
- I also asked for the same documentation workflow as the previous feature and to update `AI-USAGE.md` with prompt/context, decisions, validation, and limitations/hallucinations.
- I provided this context:
  - Existing modular Express app with `routes`, `middleware`, and `data` layers.
  - Existing resources: recipes and meal plans.
  - Existing front-end tabbed interface and API collections.

### AI Suggestions and Decision Outcomes

1. Suggestion: Add pantry resource with JSON persistence (`GET /pantry`, `POST /pantry`, `DELETE /pantry/:name`).
  - My decision: **Accepted**.
  - Result:
     - Added `data/pantry.json`.
     - Added `src/data/pantryStore.js`.
     - Added `src/routes/pantryRoutes.js`.

2. Suggestion: Add recipe-level pantry availability endpoint.
  - My decision: **Accepted**.
  - Result:
     - Added `GET /recipes/:id/availability` in `src/routes/recipeRoutes.js`.

3. Suggestion: Add meal-plan-level missing-items endpoint.
  - My decision: **Accepted**.
  - Result:
     - Added `GET /meal-plans/:id/missing-items` in `src/routes/mealPlanRoutes.js`.

4. Suggestion: Add a dedicated Pantry tab in the front-end and wire availability actions in Recipes/Shopping tabs.
  - My decision: **Accepted**.
  - Result:
     - Updated `public/index.html` and `public/app.js`.

5. Suggestion: Update API collections and README for pantry-related endpoints.
  - My decision: **Accepted**.
  - Result:
     - Updated Postman and Insomnia export files.
     - Updated README endpoint and usage documentation.

6. Suggestion: Move pantry storage from JSON files to SQLite immediately.
  - My decision: **Rejected**.
  - My reason: Out of MVP scope; project requirement was file-based persistence.

7. Suggestion: Add fuzzy ingredient synonym matching (for example, mapping "plain flour" to "flour") in this iteration.
  - My decision: **Rejected**.
  - My reason: Added complexity without a controlled ingredient taxonomy; I kept deterministic exact-normalized matching.

### Validation of AI-Generated Code

- I validated with automated testing:
  - Ran `npm run smoke` to ensure recipes CRUD regression safety.
- I validated with manual endpoint checks:
  - Tested pantry add/list/delete.
  - Tested `GET /recipes/:id/availability`.
  - Tested `GET /meal-plans/:id/missing-items`.
- I validated via front-end/manual review:
  - Verified Pantry tab appears and can save/delete items.
  - Verified recipe availability and missing-items buttons use new endpoints.
- I validated with static diagnostics:
  - Checked edited files for syntax/errors via editor diagnostics and script syntax checks.

### Limitations / Hallucinations and Handling

- Limitation: Ingredient matching is exact string-based after normalization (lowercase/trim), so synonyms (e.g., "plain flour" vs "flour") are not auto-mapped.
  - How I handled it: I used deterministic normalized matching and documented behavior.

- Limitation: Pantry quantities are currently descriptive text and are not used in arithmetic depletion.
  - How I handled it: I kept endpoint responses count-based for missing ingredients and deferred quantity math to a future schema upgrade.

- Runtime verification issue encountered: stale server instances can mask new routes.
  - How I handled it: I restarted API processes when needed and re-ran checks against the latest process.

- Hallucination encountered: I initially treated the tab-switching issue as a JavaScript routing problem and proposed navigation-layer fixes first.
  - How I handled it: I fixed the actual root cause in the UI layer (hidden-view styling precedence), and then I validated behavior after that correction.
