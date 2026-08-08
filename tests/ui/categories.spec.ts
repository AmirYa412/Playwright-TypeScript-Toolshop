import { test, expect } from '@fixtures/ui';

test.describe('Categories navigation', { tag: '@ui' }, () => {
  test('user logs in via the API and switches to the Hand Tools category', async ({ pages }) => {
    await pages.authenticated('customer');
    await pages.home.goto();
    await expect(pages.home.header.userMenu).toBeVisible();

    await pages.home.header.openCategories();
    await pages.home.header.selectCategory('hand-tools');

    await expect(pages.page).toHaveURL(/\/category\/hand-tools/);
    await expect(pages.category.title).toContainText('Hand Tools');
    await expect(pages.category.header.userMenu).toBeVisible(); // session survived the navigation
  });
});
