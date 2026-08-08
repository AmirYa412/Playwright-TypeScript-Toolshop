import type { EnvData } from '@app-types/env.types';

export const prodUrls = {
  webUrl: 'https://practicesoftwaretesting.com',
  apiUrl: 'https://api.practicesoftwaretesting.com',
};

// Hardcoded expected values for the production demo dataset. Update if the seed data is ever reseeded
// with different fixtures -- verified live against https://api.practicesoftwaretesting.com on 2026-08-07.
export const prodData: EnvData = {
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
