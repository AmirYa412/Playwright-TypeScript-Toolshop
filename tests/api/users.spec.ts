import { test, expect } from '@fixtures/api';
import { expectSchema } from '@helpers/schema';
import { UserSchema } from '@app-types/user.types';

test.describe('Users API', { tag: '@api' }, () => {
  test('login as customer, then GET /users/me returns the authenticated user', async ({ api, env }) => {
    await api.authenticate('customer');
    const me = await api.users.getUsersMe();

    expectSchema(UserSchema, me);
    expect(me).toMatchObject(env.data.users.customer);
  });
});
