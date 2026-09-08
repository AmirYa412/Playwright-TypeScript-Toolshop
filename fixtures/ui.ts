import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { ApiFactory } from '@factories/api.factory';
import type { PageFactory } from '@factories/page.factory';
import { makeEnv, makeApiContext, makeApiFactory, makePageFactory } from './builders';

export interface UiFixtures {
  env: Environment;
  apiContext: APIRequestContext;
  api: ApiFactory;
  pages: PageFactory;
}

/** Test object for UI specs. Extends the real Playwright `page`/`context`/`browser` fixtures with env, api and pages. */
export const test = base.extend<UiFixtures>({
  // See fixtures/api.ts -- makeEnv() is already cached per worker process internally.
  env: async ({}, use) => {
    await use(makeEnv());
  },

  // Fresh APIRequestContext per test; disposed after so nothing leaks between tests.
  apiContext: async ({ env }, use) => {
    const ctx = await makeApiContext(env);
    await use(ctx);
    await ctx.dispose();
  },

  // Wraps apiContext in typed API clients (api.users, api.brands, ...).
  api: async ({ apiContext, env }, use) => {
    await use(makeApiFactory(apiContext, env));
  },

  // Wraps page in typed page objects (pages.login, pages.home, ...).
  pages: async ({ page, env }, use) => {
    await use(makePageFactory(page, env));
  },
});
export { expect };
