import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';
import { loginViaUi } from '@common-actions/auth/auth.actions';
import type { Environment } from '@environments/index';
import type { UserKey } from '@app-types/env.types';

export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';
  readonly header: HeaderComponent;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(
    page: Page,
    private readonly env: Environment,
  ) {
    super(page);
    this.header = new HeaderComponent(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
  }

  /** Logs in through the UI login form as the demo user identified by `key`. */
  async loginUser(key: UserKey): Promise<void> {
    await loginViaUi(this, this.env, key);
  }
}
