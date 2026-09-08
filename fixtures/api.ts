import { test as base, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { ApiFactory } from '@factories/api.factory';
import { makeEnv, makeApiContext, makeApiFactory } from './builders';

export interface ApiFixtures {
  env: Environment;
  apiContext: APIRequestContext;
  api: ApiFactory;
}

/**
 * Test object for API specs. No type-level restriction on page/context/browser -- Playwright
 * fixtures are lazy at runtime, so a spec that never destructures them never launches a browser
 * regardless of what the type allows. API vs UI separation is handled by playwright.config.ts's
 * projects (testDir + tag grep), not by hiding fixtures at the type level.
 */
export const test = base.extend<ApiFixtures>({
  // makeEnv() -> resolveEnv() caches internally per process, so this only resolves once per worker
  // regardless of Playwright fixture scope; kept test-scoped (default) to sidestep the extra typing
  // ceremony custom worker-scoped fixtures require.
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
});
export { expect };
