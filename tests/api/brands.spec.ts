import { test, expect } from '@fixtures/api';
import { expectSchema } from '@helpers/schema';
import { BrandListSchema } from '@app-types/brand.types';

test.describe('Brands API', { tag: '@api' }, () => {
  test('GET /brands matches the expected schema and includes the known ForgeFlex brand', async ({ api, env }) => {
    const brands = await api.brands.getBrands();

    expectSchema(BrandListSchema, brands);

    // Matched on slug, not id -- brand ids are ULIDs regenerated on every demo-data reseed.
    const forgeflex = brands.find((brand) => brand.slug === env.data.brands.forgeflex.slug);
    expect(forgeflex).toBeDefined();
    expect(forgeflex).toMatchObject(env.data.brands.forgeflex);
  });
});
