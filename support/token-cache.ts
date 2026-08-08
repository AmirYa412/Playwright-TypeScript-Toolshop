import type { APIRequestContext } from '@playwright/test';
import { isExpiringSoon } from '@helpers/jwt';
import { UsersClient } from '@api/users/users.client';
import type { Credentials } from '@app-types/env.types';

const SKEW_SECONDS = 30;

// Module-level, so this is scoped to one Playwright worker process for free.
const tokens = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

/**
 * Returns a bearer token for `credentials`, reusing a cached one until it's within 30s of expiring
 * (tokens live 300s). Concurrent calls for the same user in one worker dedupe onto a single login request.
 */
export async function getToken(request: APIRequestContext, apiUrl: string, credentials: Credentials): Promise<string> {
  const key = `${apiUrl}|${credentials.email}`;

  const cached = tokens.get(key);
  if (cached && !isExpiringSoon(cached, SKEW_SECONDS)) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const login = (async () => {
    const client = new UsersClient(request, {});
    const { access_token } = await client.login(credentials);
    tokens.set(key, access_token);
    return access_token;
  })();

  inFlight.set(key, login);
  try {
    return await login;
  } finally {
    inFlight.delete(key);
  }
}
