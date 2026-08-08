import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component';

/** The top nav bar: sign-in/sign-out state, user menu, and the categories dropdown. */
export class HeaderComponent extends BaseComponent {
  readonly signInLink: Locator;
  /** Shows the signed-in user's full name when logged in. */
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  private readonly categoriesToggle: Locator;

  constructor(page: Page) {
    super(page.locator('nav.navbar'));
    this.signInLink = this.root.getByTestId('nav-sign-in');
    this.userMenu = this.root.getByTestId('nav-menu');
    this.signOutLink = this.root.getByTestId('nav-sign-out');
    this.categoriesToggle = this.root.getByTestId('nav-categories');
  }

  /** Opens the "Categories" dropdown in the nav bar. */
  async openCategories(): Promise<void> {
    await this.categoriesToggle.click();
  }

  /** Clicks a category link in the (already open) categories dropdown, e.g. selectCategory('hand-tools'). */
  async selectCategory(slug: string): Promise<void> {
    await this.root.getByTestId(`nav-${slug}`).click();
  }
}
