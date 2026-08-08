import type { Locator } from '@playwright/test';

/** Base class for page components -- scopes every locator to a root element instead of the whole page. */
export abstract class BaseComponent {
  constructor(protected readonly root: Locator) {}
}
