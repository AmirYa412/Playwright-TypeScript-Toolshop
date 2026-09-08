import { BaseApiClient } from '@api/base';
import type { LoginPayload, LoginResponse } from '@app-types/auth.types';
import type { User } from '@app-types/user.types';

export class UsersClient extends BaseApiClient {
  private readonly path = '/users';

  /** POST /users/login -- exchanges credentials for a bearer token. Does not require prior authentication. */
  postUsersLogin(payload: LoginPayload): Promise<LoginResponse> {
    return this.post(`${this.path}/login`, { data: payload });
  }

  /** GET /users/me -- the currently authenticated user. Requires a prior authenticate() call on the factory. */
  getUsersMe(): Promise<User> {
    return this.get(`${this.path}/me`);
  }
}
