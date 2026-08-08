import { request as pwRequest } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { UserKey } from '@app-types/env.types';
import { HomePage } from '@pages/home.page';
import { LoginPage } from '@pages/login.page';
import { CategoryPage } from '@pages/category.page';
import { loginViaApi, seedUiSession } from '@common-actions/auth.actions';

type PageCtor<T> = new (page: Page, env: Environment) => T;

/**
 * Creates and caches page objects bound to one Page. Deliberately has no API dependency of its own --
 * authenticated() builds a short-lived request context on demand, so a PageFactory that never
 * authenticates never touches the API. See FEEDBACK.md: chosen over sharing ApiFactory for true
 * isolation between pure UI and pure API tests, at the cost of a second small path to /users/login
 * (still deduped by the shared token cache).
 */
export class PageFactory {
  private readonly cache = new Map<PageCtor<unknown>, unknown>();

  constructor(
    /** Escape hatch for assertions that need the real Page (e.g. `expect(pages.page).toHaveURL(...)`). */
    public readonly page: Page,
    private readonly env: Environment,
  ) {}

  get login(): LoginPage {
    return this.resolve(LoginPage);
  }

  get home(): HomePage {
    return this.resolve(HomePage);
  }

  get category(): CategoryPage {
    return this.resolve(CategoryPage);
  }

  /** Logs in as `key` via the API and seeds the browser session. Must be called before the first page.goto(). */
  async authenticated(key: UserKey): Promise<this> {
    const ctx = await pwRequest.newContext({ baseURL: this.env.apiUrl });
    const token = await loginViaApi(ctx, this.env, key);
    await ctx.dispose();
    await seedUiSession(this.page, token);
    return this;
  }

  private resolve<T>(ctor: PageCtor<T>): T {
    let instance = this.cache.get(ctor as PageCtor<unknown>) as T | undefined;
    if (!instance) {
      instance = new ctor(this.page, this.env);
      this.cache.set(ctor as PageCtor<unknown>, instance);
    }
    return instance;
  }
}
