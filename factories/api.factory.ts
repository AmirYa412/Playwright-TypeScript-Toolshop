import type { APIRequestContext } from '@playwright/test';
import type { Environment } from '@environments/index';
import type { AuthState } from '@api/base';
import type { UserKey } from '@app-types/env.types';
import { UsersClient } from '@api/users/users.client';
import { BrandsClient } from '@api/brands/brands.client';
import { CategoriesClient } from '@api/categories/categories.client';
import { getToken } from '@common-actions/auth/token-cache';

type ClientCtor<T> = new (request: APIRequestContext, authState: AuthState) => T;

/**
 * Creates and caches API clients bound to one shared auth state. A fresh factory is anonymous --
 * neither constructing nor reading a client triggers a login; only authenticate() does.
 */
export class ApiFactory {
  private readonly authState: AuthState = {};
  private readonly cache = new Map<ClientCtor<unknown>, unknown>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly env: Environment,
  ) {}

  get users(): UsersClient {
    return this.resolve(UsersClient);
  }

  get brands(): BrandsClient {
    return this.resolve(BrandsClient);
  }

  get categories(): CategoriesClient {
    return this.resolve(CategoriesClient);
  }

  /** Logs in as `key` (via the shared token cache) and attaches the token to every client from this factory -- including ones already retrieved, since they share this factory's auth state by reference. */
  async authenticate(key: UserKey): Promise<this> {
    this.authState.token = await getToken(this.request, this.env.apiUrl, this.env.users[key]);
    return this;
  }

  private resolve<T>(ctor: ClientCtor<T>): T {
    let instance = this.cache.get(ctor as ClientCtor<unknown>) as T | undefined;
    if (!instance) {
      instance = new ctor(this.request, this.authState);
      this.cache.set(ctor as ClientCtor<unknown>, instance);
    }
    return instance;
  }
}
