# Playwright TypeScript Toolshop

UI + API test automation framework for [Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com), built with [Playwright](https://playwright.dev/) and TypeScript in strict mode.

This is a framework showcase — the goal is a clean, typed, 3-layer architecture rather than exhaustive coverage of the app under test. Test count is intentionally small; the emphasis is on the patterns (auth strategy, page objects, API clients, fixtures) being reusable and easy to extend.

## Architecture

```
tests/        -- test specs. Only call page object methods / API client methods and assert. Never touch a Locator or Page directly.
pages/        -- Page Object Model. Locators as readonly fields, methods for user actions.
components/   -- reusable page fragments (e.g. header) composed into page objects.
api/          -- typed API clients, one per resource, extending a shared BaseApiClient (retry + auth header + error surfacing).
factories/    -- PageFactory / ApiFactory: lazily construct and cache page objects / API clients bound to one Page / request context.
fixtures/     -- Playwright test objects (api.ts, ui.ts) that wire factories, env, and auth into `test`.
common-actions/auth/ -- cross-cutting auth flows (API login, UI login, browser-session seeding) and the shared token cache.
environments/ -- per-environment (prod/local) URLs and expected seed data, resolved from process.env.
types/        -- shared TypeScript types and Zod schemas for API response validation.
```

**3-layer boundary:** tests never import `Page`/`APIRequestContext` for direct interaction — they go through `pages` (page objects) or `api` (API clients), both exposed via fixtures. This keeps specs readable and keeps locator/endpoint churn out of test files.

### Auth strategy

Three independent, opt-in paths — deliberately not sharing a constructor dependency, so a pure UI spec never touches the API layer and vice versa:

- **`api.authenticate(key)`** — logs in via `POST /users/login`, attaches the bearer token to that `ApiFactory`'s clients.
- **`pages.authenticated(key)`** — logs in via the API, then seeds the token into the browser's `localStorage` via `page.addInitScript` before the first navigation, so the app boots already signed in. Use this instead of a full UI login in `beforeEach` for any test that isn't exercising the login flow itself.
- **`pages.login.loginUser(key)`** — a real UI login through the form, for testing the login flow.

All three funnel through a shared in-memory token cache (`common-actions/auth/token-cache.ts`) keyed by user, so the same user is never logged in twice within a worker.

### API clients

Each client extends `BaseApiClient`, which centralizes the bearer-token header, retries on transient infra failures (502/503/504/520/524, capped at 3 attempts with exponential backoff), and throws on non-2xx responses. Response shapes are validated with [Zod](https://zod.dev/) schemas in the tests (`types/*.types.ts`), not cast with `as`.

## Setup

Requires Node 18+.

```bash
npm install
npx playwright install   # downloads browser binaries
cp .env.example .env     # fill in ADMIN_PASSWORD / CUSTOMER_PASSWORD / CUSTOMER2_PASSWORD
```

`ENV` in `.env` selects the target environment (`prod` — the public demo site, or `local` — a local Docker stack of the app under test). Defaults to `prod`.

## Running tests

```bash
npm test           # everything
npm run test:api   # API project only
npm run test:ui    # UI project only
npm run test:headed
npm run report      # open the last HTML report
```

Other checks:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
```

## Tech stack

Playwright Test, TypeScript (`strict: true`), Zod, ESLint + typescript-eslint.
