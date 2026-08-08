import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';

export class CategoryPage extends BasePage {
  protected readonly path = '/category';
  readonly header: HeaderComponent;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('page-title');
  }

  /** Navigates to a category by slug, e.g. goto('hand-tools') -- appends to this page's base `/category` path. */
  override async goto(slug: string): Promise<void> {
    await super.goto(`${this.path}/${slug}`);
  }

  /** Asserts the browser is currently on this specific category's page. */
  override async verifyOnPage(slug: string): Promise<void> {
    await this.assertUrlEndsWith(`${this.path}/${slug}`);
  }
}
