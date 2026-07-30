# Rationale

## API Design Decisions

I modeled this API around clear domain resources so each URL maps to one concept:

- `/recipes` for recipe CRUD and recipe-specific operations
- `/meal-plans` for planning and plan-specific operations
- `/pantry` for inventory management
- `/health` for service health checks

I kept resource URLs noun-based and predictable. For example, `GET /recipes/:id` reads one recipe, `POST /recipes` creates one, and `DELETE /recipes/:id` removes one. For scoped behaviors that belong to a resource, I used nested endpoints:

- `GET /recipes/:id/availability` checks pantry fit for one recipe
- `GET /meal-plans/:id/shopping-list` builds aggregated ingredients
- `GET /meal-plans/:id/missing-items` shows only pantry-missing ingredients

I used HTTP methods and status codes intentionally:

- `200 OK` for successful reads/updates
- `201 Created` for new resources (with `Location` header)
- `204 No Content` for successful deletes
- `400 Bad Request` for invalid IDs or invalid payloads
- `404 Not Found` for missing resources
- `500 Internal Server Error` for unexpected server/runtime errors

All request/response data is JSON so the API stays consistent for frontend and API clients.

## Route and Middleware Organization

I split routing by resource to keep each module focused and maintainable:

- `src/routes/recipeRoutes.js`
- `src/routes/mealPlanRoutes.js`
- `src/routes/pantryRoutes.js`
- `src/routes/healthRoutes.js`

I mount all route modules in `src/app.js`, which acts as the composition layer.

Middleware is separated by concern:

- `requestLogger` for request visibility
- `validateRecipe` and `validateRecipePatch` for request-shape validation
- `asyncHandler` to avoid repetitive try/catch blocks in async route handlers
- centralized `notFoundHandler` and `errorHandler` at the end of the pipeline

I chose this structure so each file has one responsibility, and adding new resources (like pantry) does not require rewriting unrelated code.

## Error and Edge Case Handling

I addressed edge cases at both parameter and payload levels.

ID validation:

- Recipe and meal-plan IDs must be positive integers.
- Invalid IDs return `400` immediately before data access.

Payload validation:

- Recipe create/update requires `name`, `category`, `ingredients[]`, and `instructions`.
- Recipe patch requires at least one allowed field and validates `ingredients` type when provided.
- Meal-plan create requires a non-empty name and non-empty array of valid recipe IDs.
- Pantry upsert requires a non-empty ingredient name.

Missing resources:

- If a recipe/meal-plan/pantry item does not exist, I return `404` with a clear JSON error message.

Global failures:

- Unknown routes are handled by the centralized 404 middleware.
- Unexpected runtime errors are captured by the centralized error middleware and returned as `500` JSON responses.

This gives predictable behavior for UI code and external API clients.

## AI Tooling Experience and Responsible Usage

Where AI helped me:

- Speeding up first drafts of route structures and repetitive CRUD scaffolding
- Proposing endpoint naming options and consistency checks
- Suggesting documentation coverage and verification checklists

Where AI was less reliable:

- It occasionally suggested scope expansion beyond MVP (for example, immediate DB migration or advanced fuzzy matching)
- It can mis-prioritize probable causes during debugging if not anchored to observed behavior

How I used AI responsibly:

- I treated AI output as draft code, not final truth
- I accepted, modified, or rejected suggestions based on scope and requirements
- I validated changes using smoke tests, manual endpoint checks, and diagnostics
- I documented limitations instead of pretending unsupported behavior exists
- I avoided adding hidden complexity when schema/data quality did not justify it

My main lesson is that AI is best used as an accelerator for implementation and review, but final engineering decisions still require explicit scope control, validation, and accountability.
