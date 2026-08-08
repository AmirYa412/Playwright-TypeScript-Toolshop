import { request as pwRequest } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { resolveEnv } from '@environments/index';
import type { Environment } from '@environments/index';
import { ApiFactory } from '@factories/api.factory';
import { PageFactory } from '@factories/page.factory';

// Construction logic shared by fixtures/api.ts and fixtures/ui.ts. Kept as plain functions
// (not Playwright Fixture objects) so each test object can compose and type its own fixture set.

/** Resolves the active Environment (validated and cached once per worker process by resolveEnv itself). */
export function makeEnv(): Environment {
  return resolveEnv();
}

/** Creates a fresh APIRequestContext bound to the API base URL -- independent of any UI project baseURL. */
export function makeApiContext(env: Environment): Promise<APIRequestContext> {
  return pwRequest.newContext({ baseURL: env.apiUrl });
}

/** Creates a fresh, anonymous ApiFactory bound to `apiContext`. */
export function makeApiFactory(apiContext: APIRequestContext, env: Environment): ApiFactory {
  return new ApiFactory(apiContext, env);
}

/** Creates a fresh PageFactory bound to `page` -- no API dependency of its own; authenticated() builds one on demand. */
export function makePageFactory(page: Page, env: Environment): PageFactory {
  return new PageFactory(page, env);
}
