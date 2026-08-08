import { BaseApiClient } from '@api/base';
import type { LoginPayload, LoginResponse } from '@app-types/auth.types';
import type { User } from '@app-types/user.types';

export class UsersClient extends BaseApiClient {
  /** POST /users/login -- exchanges credentials for a bearer token. Does not require prior authentication. */
  login(payload: LoginPayload): Promise<LoginResponse> {
    return this.post<LoginResponse>('/users/login', { data: payload });
  }

  /** GET /users/me -- the currently authenticated user. Requires a prior authenticate() call on the factory. */
  me(): Promise<User> {
    return this.get<User>('/users/me');
  }
}
