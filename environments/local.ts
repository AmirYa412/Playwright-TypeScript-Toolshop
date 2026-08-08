import type { EnvData } from '@app-types/env.types';

export const localUrls = {
  webUrl: 'http://localhost:4200',
  apiUrl: 'http://localhost:8091',
};

// The local Docker stack (docker-compose.yml) seeds the same fixture data as production.
// Not verified live -- confirm against your local instance before relying on it.
export const localData: EnvData = {
  brands: {
    forgeflex: { name: 'ForgeFlex Tools', slug: 'forgeflex-tools' },
  },
  users: {
    customer: {
      email: 'customer@practicesoftwaretesting.com',
      first_name: 'Jane',
      last_name: 'Doe',
      address: { city: 'Vienna' },
    },
  },
};
