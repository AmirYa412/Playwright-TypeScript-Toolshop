import type { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }
}
