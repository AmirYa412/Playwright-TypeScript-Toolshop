/**
 * Demo user keys -- resolved to real credentials by environments/index.ts. `invalidCustomer` is not
 * a real account: same email as `customer`, deliberately wrong password, for negative login tests.
 */
export type UserKey = 'admin' | 'customer' | 'customer2' | 'invalidCustomer';

export interface Credentials {
  email: string;
  password: string;
}

// Both fixture interfaces carry an index signature purely so `expect(actual).toMatchObject(fixture)`
// type-checks -- that matcher's overload requires an indexable object, not a specific nominal type.

/** Minimal fields asserted against a live GET /brands response. */
export interface BrandFixture {
  [key: string]: unknown;
  name: string;
  slug: string;
}

/** Minimal fields asserted against a live GET /users/me response. */
export interface UserFixture {
  [key: string]: unknown;
  email: string;
  first_name: string;
  last_name: string;
  address: { city: string };
}

/** Hardcoded expected values for an environment's seeded demo data. */
export interface EnvData {
  brands: { forgeflex: BrandFixture };
  users: { customer: UserFixture };
}
