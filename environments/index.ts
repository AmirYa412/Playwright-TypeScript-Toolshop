import 'dotenv/config';
import { requireEnv } from '@helpers/env';
import { prodUrls, prodData } from './prod';
import { localUrls, localData } from './local';
import type { Credentials, EnvData, UserKey } from '@app-types/env.types';

type EnvName = 'prod' | 'local';

const URLS: Record<EnvName, { webUrl: string; apiUrl: string }> = { prod: prodUrls, local: localUrls };
const DATA: Record<EnvName, EnvData> = { prod: prodData, local: localData };

/** Resolved test environment: URLs, demo user credentials, and hardcoded expected fixture data. */
export interface Environment {
  name: EnvName;
  webUrl: string;
  apiUrl: string;
  users: Record<UserKey, Credentials>;
  data: EnvData;
}

function resolveEnvName(): EnvName {
  const raw = process.env.ENV ?? 'prod';
  if (raw !== 'prod' && raw !== 'local') {
    throw new Error(`Unknown ENV "${raw}" -- expected "prod" or "local"`);
  }
  return raw;
}

function resolveUsers(): Record<UserKey, Credentials> {
  const customer = { email: requireEnv('CUSTOMER_EMAIL'), password: requireEnv('CUSTOMER_PASSWORD') };
  return {
    admin: { email: requireEnv('ADMIN_EMAIL'), password: requireEnv('ADMIN_PASSWORD') },
    customer,
    customer2: { email: requireEnv('CUSTOMER2_EMAIL'), password: requireEnv('CUSTOMER2_PASSWORD') },
    // Deliberately wrong password -- reuses the real customer email. No new env var needed: unlike
    // real credentials, there's nothing to protect here, it's supposed to fail.
    invalidCustomer: { email: customer.email, password: 'definitely-not-the-real-password' },
  };
}

/** Resolves just the base URLs for the active ENV, without requiring credential env vars. For playwright.config.ts, which needs a `baseURL` before any test (and its fixtures) run. */
export function resolveBaseUrls(): { webUrl: string; apiUrl: string } {
  return URLS[resolveEnvName()];
}

let cached: Environment | undefined;

/** Resolves and validates the active environment from ENV + credential env vars. Fails fast, before any HTTP call, on a missing var. Cached per process. */
export function resolveEnv(): Environment {
  if (!cached) {
    const name = resolveEnvName();
    cached = { name, ...URLS[name], users: resolveUsers(), data: DATA[name] };
  }
  return cached;
}
