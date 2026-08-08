import type { APIRequestContext, Page } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { UserKey } from '@app-types/env.types';
import type { LoginPage } from '@pages/login.page';
import { getToken } from '@support/token-cache';

/** Cross-cutting auth flows spanning the API and UI layers -- what the page/api factories delegate to. */

/** Logs in as `key` via POST /users/login (through the shared token cache) and returns the bearer token. */
export function loginViaApi(request: APIRequestContext, env: Environment, key: UserKey): Promise<string> {
  return getToken(request, env.apiUrl, env.users[key]);
}

/**
 * Seeds the browser with a bearer token and English locale before the first navigation, so the app
 * boots already logged in (the header reads `auth-token` from localStorage on init).
 */
export async function seedUiSession(page: Page, token: string): Promise<void> {
  if (page.url() !== 'about:blank') {
    throw new Error('seedUiSession must be called before the first page.goto() -- the app only reads the token on load.');
  }
  await page.addInitScript((authToken: string) => {
    window.localStorage.setItem('auth-token', authToken);
    window.localStorage.setItem('language', 'en');
  }, token);
}

/** Fills and submits the login form as `key`, waiting for the header to reflect a signed-in user. */
export async function loginViaUi(loginPage: LoginPage, env: Environment, key: UserKey): Promise<void> {
  const { email, password } = env.users[key];
  await loginPage.goto();
  await loginPage.emailInput.fill(email);
  await loginPage.passwordInput.fill(password);
  await loginPage.submitButton.click();
  await loginPage.header.userMenu.waitFor();
}
