# 🎭 Playwright TypeScript Toolshop

A UI + API test automation framework built with **Playwright** and **TypeScript** (`strict: true`), demonstrating a typed, layered architecture for enterprise-style web application testing.

**Target Application:** [Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com) — e-commerce demo site
**Framework Type:** Hybrid (UI + API), split into independent Playwright projects
**Language:** TypeScript, strict mode, no `any`
**Validation:** Runtime API response validation with [Zod](https://zod.dev/)

This is a framework showcase — the goal is a clean, reusable architecture rather than exhaustive coverage of the app under test. Test count is intentionally small; the emphasis is on the patterns being easy to extend and easy to explain.

---

## 📋 Table of Contents

- [Framework Architecture](#-framework-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Running Tests](#-running-tests)
- [Framework Features](#-framework-features)
- [Project Structure](#-project-structure)
- [Writing Tests](#-writing-tests)
- [Best Practices](#-best-practices)

---

## 🗺️ Framework Architecture

Three layers, one direction of dependency: **tests → pages / api clients → factories / fixtures**.

```
tests/               # Test suites — only call page object / API client methods, then assert
pages/               # Page Object Model — locators as readonly fields, methods for user actions
components/          # Reusable page fragments (e.g. header) composed into page objects
api/                 # Typed API clients, one per resource, extending a shared BaseApiClient
factories/           # PageFactory / ApiFactory — lazily construct and cache instances per test
fixtures/            # Playwright test objects (api.ts, ui.ts) wiring env, api, pages into `test`
common-actions/auth/ # Cross-cutting auth flows + the shared token cache
environments/        # Per-environment (prod/local) URLs and expected seed data
types/               # Shared TypeScript types + Zod schemas for API response validation
```

### Design Patterns

- ✅ **Page Object Model (POM)** — locators and page interactions live on the page class, never in a test
- ✅ **Factory Pattern** — `PageFactory`/`ApiFactory` lazily construct and cache page objects / API clients bound to one `Page` / request context
- ✅ **Component Pattern** — reusable page fragments (e.g. `HeaderComponent`) composed into page objects, scoped to a root locator
- ✅ **Environment Abstraction** — `prod`/`local` URLs and expected seed data resolved from `process.env`, validated fail-fast
- ✅ **Split Authentication** — API login, UI login, and browser-session seeding are three independent opt-in paths sharing one token cache (see below)
- ✅ **Runtime Schema Validation** — API responses parsed through Zod schemas in tests, never cast with `as`

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Core language, `strict: true`, no `any` |
| **Playwright Test** | Browser automation + API request context + test runner |
| **Zod** | Runtime validation of API responses |
| **ESLint** + `typescript-eslint` | Linting |
| **dotenv** | Environment variable loading |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **npm**

### Installation

```bash
git clone https://github.com/AmirYa412/Playwright-TypeScript-Toolshop.git
cd Playwright-TypeScript-Toolshop

npm install
npx playwright install   # downloads browser binaries
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in the demo account passwords (`ADMIN_PASSWORD`, `CUSTOMER_PASSWORD`, `CUSTOMER2_PASSWORD`). `ENV` selects the target environment (`prod` — the public demo site, or `local` — a local Docker stack of the app under test) and defaults to `prod`.

---

## 🎯 Running Tests

```bash
npm test            # everything (api + ui projects)
npm run test:api    # API project only
npm run test:ui     # UI project only
npm run test:headed # UI project, visible browser
npm run report       # open the last HTML report
```

### Other checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
```

Tests are tagged and routed to a project by `playwright.config.ts` (`@api` → browserless project, `@ui` → Chromium project) — the tag is what determines which project a spec runs under, not its folder alone.

---

## ✨ Framework Features

### 1. Page Object Model

```typescript
export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';
  readonly header: HeaderComponent;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, private readonly env: Environment) {
    super(page);
    this.header = new HeaderComponent(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
  }

  async loginUser(key: UserKey): Promise<void> {
    await loginViaUi(this, this.env, key);
  }
}
```

Locators are declared once, in the constructor, as `readonly` fields — never inline in a method, never touched from a test.

### 2. Factory Pattern

```typescript
export class PageFactory {
  private readonly cache = new Map<PageCtor<unknown>, unknown>();

  get login(): LoginPage {
    return this.resolve(LoginPage);
  }

  /** Logs in as `key` via the API and seeds the browser session. */
  async authenticated(key: UserKey): Promise<this> {
    const ctx = await pwRequest.newContext({ baseURL: this.env.apiUrl });
    const token = await loginViaApi(ctx, this.env, key);
    await ctx.dispose();
    await seedUiSession(this.page, token);
    return this;
  }

  private resolve<T>(ctor: PageCtor<T>): T { /* construct once, cache, return */ }
}
```

Each test gets its own `PageFactory`/`ApiFactory` (via fixtures), so `pages.login` always returns the same instance within a test, but a fresh one in the next test.

### 3. Split Authentication

Three independent, opt-in paths — deliberately not sharing a constructor dependency, so a pure UI spec never touches the API layer and vice versa:

| Call | What it does | When to use |
|---|---|---|
| `api.authenticate(key)` | Logs in via `POST /users/login`, attaches the token to that factory's clients | Pure API tests |
| `pages.authenticated(key)` | Logs in via the API, then seeds the token into `localStorage` before the first navigation | Any UI test that isn't testing login itself (fast — no form fill) |
| `pages.login.loginUser(key)` | Real UI login through the form | Testing the login flow itself |

All three funnel through one in-memory token cache (`common-actions/auth/token-cache.ts`) keyed by user, so the same user is never logged in twice within a worker.

### 4. Typed API Clients

```typescript
export class BrandsClient extends BaseApiClient {
  private readonly path = '/brands';

  /** GET /brands -- all product brands. */
  getBrands(): Promise<Brand[]> {
    return this.get(this.path);
  }
}
```

`BaseApiClient` centralizes the bearer-token header, retries transient infra failures (502/503/504/520/524, capped at 3 attempts, exponential backoff), and throws on non-2xx responses.

### 5. Runtime Schema Validation

```typescript
export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type Brand = z.infer<typeof BrandSchema>;
```

```typescript
const brands = await api.brands.getBrands();
expectSchema(BrandListSchema, brands); // throws a readable diff if the API shape drifted
```

---

## 📁 Project Structure

```
Playwright-TypeScript-Toolshop/
│
├── api/                          # Typed API clients
│   ├── base/                     # BaseApiClient — auth header, retry, error surfacing
│   ├── brands/
│   ├── categories/
│   └── users/
│
├── common-actions/auth/          # Cross-cutting auth flows
│   ├── auth.actions.ts           # loginViaApi / loginViaUi / seedUiSession
│   └── token-cache.ts            # Shared, deduped login-token cache
│
├── components/                   # Reusable page fragments
│   ├── base.component.ts
│   └── header.component.ts
│
├── environments/                 # Per-environment config
│   ├── index.ts                  # resolveEnv() — validates env vars, fails fast
│   ├── prod.ts
│   └── local.ts
│
├── factories/                    # Lazy object construction
│   ├── api.factory.ts
│   └── page.factory.ts
│
├── fixtures/                     # Playwright test objects
│   ├── api.ts                    # Browserless test object for API specs
│   ├── ui.ts                     # Full test object for UI specs
│   └── builders.ts                # Shared construction logic between the two
│
├── helpers/
│   ├── env.ts                    # requireEnv() — fail-fast env var reads
│   ├── jwt.ts
│   └── schema.ts                  # expectSchema() — Zod parse + readable error
│
├── pages/                        # Page Object Model
│   ├── base.page.ts
│   ├── home.page.ts
│   ├── login.page.ts
│   └── category.page.ts
│
├── tests/
│   ├── api/                      # @api-tagged specs
│   └── ui/                       # @ui-tagged specs
│
├── types/                        # Shared types + Zod schemas
│
├── .env.example                  # Required env vars, documented
├── eslint.config.js
├── playwright.config.ts
└── tsconfig.json
```

---

## 📝 Writing Tests

### API test

```typescript
import { test, expect } from '@fixtures/api';
import { expectSchema } from '@helpers/schema';
import { BrandListSchema } from '@app-types/brand.types';

test.describe('Brands API', { tag: '@api' }, () => {
  test('GET /brands matches the expected schema', async ({ api }) => {
    const brands = await api.brands.getBrands();
    expectSchema(BrandListSchema, brands);
  });
});
```

### UI test

```typescript
import { test, expect } from '@fixtures/ui';

test.describe('Login', { tag: '@ui' }, () => {
  test('user logs in via the UI and sees their name in the header', async ({ pages }) => {
    await pages.login.loginUser('customer');

    await expect(pages.login.header.userMenu).toContainText('Jane Doe');
    await expect(pages.login.header.signInLink).toBeHidden();
  });
});
```

Tests never import `Page`/`APIRequestContext` for direct interaction, never call `.locator()` themselves, and never assert inside a page object — assertions belong in the test.

---

## 🎓 Best Practices

### Locator Strategy

- ✅ **Prefer:** `getByTestId()`, `getByRole()`, `getByLabel()`
- ❌ **Avoid:** CSS selectors, XPath, positional (`nth-child`) locators

```typescript
// Good
this.submitButton = page.getByTestId('login-submit');

// Avoid
this.submitButton = page.locator('form > button:nth-child(3)');
```

### Authentication Strategy

- ✅ Use `pages.authenticated(key)` for any test that isn't exercising login itself
- ✅ Use `pages.login.loginUser(key)` only when testing the login flow
- ❌ Don't call a full UI login in `beforeEach` for unrelated tests — it's slower and redundant with the token cache

### Type Safety

- ✅ No `any`, no `as` type-assertion shortcuts — API responses go through Zod (`.parse`/`.safeParse`), not a cast
- ✅ Every public method has an explicit return type
- ✅ `const` union types instead of `enum`

### Test Isolation

- ✅ Each test gets its own `APIRequestContext` and `PageFactory`/`ApiFactory` instance (via fixtures) — nothing is shared across tests
- ✅ Fixtures dispose their own resources (`ctx.dispose()`) after each test
- ✅ No test depends on another test's execution order

---

## 📄 License

MIT — see [LICENSE](./LICENSE).
