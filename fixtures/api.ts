import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, TestType } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { ApiFactory } from '@factories/api.factory';
import { makeEnv, makeApiContext, makeApiFactory } from './builders';

export interface ApiFixtures {
  env: Environment;
  apiContext: APIRequestContext;
  api: ApiFactory;
}

const extended = base.extend<ApiFixtures>({
  // makeEnv() -> resolveEnv() caches internally per process, so this only resolves once per worker
  // regardless of Playwright fixture scope; kept test-scoped (default) to sidestep the extra typing
  // ceremony custom worker-scoped fixtures require.
  env: async ({}, use) => use(makeEnv()),
  apiContext: async ({ env }, use) => {
    const ctx = await makeApiContext(env);
    await use(ctx);
    await ctx.dispose();
  },
  api: async ({ apiContext, env }, use) => use(makeApiFactory(apiContext, env)),
});

/**
 * Test object for API specs. Deliberately typed without `page`/`context`/`browser` so requesting a
 * browser fixture from an API spec is a compile error. Playwright fixtures are lazy at runtime
 * regardless -- this makes "API specs never touch a browser" a guarantee the compiler enforces,
 * not just a convention.
 */
export const test = extended as unknown as TestType<ApiFixtures, Record<string, never>>;
export { expect };
