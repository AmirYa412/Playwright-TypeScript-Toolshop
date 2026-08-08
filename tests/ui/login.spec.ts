import { test, expect } from '@fixtures/ui';

test.describe('Login', { tag: '@ui' }, () => {
  test('user logs in via the UI and sees their name in the header', async ({ pages }) => {
    await pages.login.loginUser('customer');

    await expect(pages.login.header.userMenu).toContainText('Jane Doe');
    await expect(pages.login.header.signInLink).toBeHidden();
  });
});
