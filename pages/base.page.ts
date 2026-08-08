import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Base class for page objects. Each page declares its own `path` as a plain instance field --
 * this is an abstract *instance* field, not a `static`, deliberately: a static would need
 * `this.constructor` cast gymnastics to read polymorphically, while an instance field gets
 * correct per-subclass dispatch for free through normal inheritance (the direct TS equivalent of
 * Python's `self.PATH` class-attribute lookup). `goto()`/`verifyOnPage()` are the single shared
 * implementations that use it. Each page composes its own components explicitly.
 */
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Navigates to this page's own path, or an explicit override (e.g. a parameterized route). */
  async goto(path: string = this.path): Promise<void> {
    await this.page.goto(path);
  }

  /** Asserts the browser is currently on this page (or an explicit path override). Not wired into goto() automatically -- call it explicitly when a test wants the assertion. */
  async verifyOnPage(path: string = this.path): Promise<void> {
    await this.assertUrlEndsWith(path);
  }

  /** Shared regex-anchoring so every verifyOnPage() checks a full path segment, not an unanchored substring (e.g. '/' would otherwise match any URL). Assumes `suffix` has no regex-special characters -- true for this app's slug-based routes. */
  protected async assertUrlEndsWith(suffix: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${suffix}$`));
  }
}
