# AI Usage Report

## Prompt / Context Given to AI Tool

- Primary task prompt: implement the meal planner + shopping list MVP feature for the bakery recipes app.
- Additional required documentation prompt: create this file and document prompt/context, acceptance decisions, validation approach, and limitations/hallucinations.
- Project context used:
  - Existing Express app with modular routes/middleware/data layers.
  - Existing JSON file persistence in `data/recipes.json`.
  - Existing REST conventions and smoke test workflow.

## AI Suggestions and Decision Outcomes

1. Suggestion: Add a new REST resource at `/meal-plans` with JSON-file persistence.
   - Decision: **Accepted**.
   - Implementation:
     - Added `src/routes/mealPlanRoutes.js`.
     - Added `src/data/mealPlansStore.js`.
     - Added persistent file `data/mealPlans.json`.

2. Suggestion: Generate shopping list by aggregating ingredients from recipe IDs in a meal plan.
   - Decision: **Accepted with modification**.
   - Modification:
     - Used ingredient occurrence counts (`count`) rather than quantity math because recipe ingredients are plain strings with no unit/amount schema.

3. Suggestion: Include CRUD-adjacent endpoints for meal plans (`GET`, `POST`, `DELETE`) plus `GET /meal-plans/:id/shopping-list`.
   - Decision: **Accepted**.

4. Suggestion: Validate meal plan payloads and ID parameters with 400/404 behavior.
   - Decision: **Accepted**.

5. Suggestion: Add README documentation updates for new endpoints.
   - Decision: **Accepted**.

## Validation of AI-Generated Code

- Automated regression testing:
  - Ran `npm run smoke` to confirm existing recipes CRUD behavior remained intact.
- Manual endpoint verification for new feature:
  - Created meal plan via `POST /meal-plans`.
  - Retrieved meal plans via `GET /meal-plans` and `GET /meal-plans/:id`.
  - Generated shopping list via `GET /meal-plans/:id/shopping-list`.
  - Verified status codes and JSON response shapes.
- Static review / diagnostics:
  - Checked edited files for diagnostics errors using editor problem checks.

## Limitations / Hallucinations and Handling

- Limitation: Shopping-list quantities cannot represent real amounts (e.g., cups, grams) because recipe ingredients are stored as plain strings.
  - Handling: Implemented deterministic occurrence counts (`count`) and documented this behavior.

- Limitation: Earlier verification in this project history occasionally hit stale server processes during route updates.
  - Handling: Restarted the API process before re-running checks to ensure the latest code path was tested.

- Hallucination handling approach:
  - Avoided fabricating external assumptions.
  - Kept behavior grounded in current repository schema and executable tests.
