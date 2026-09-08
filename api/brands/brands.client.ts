import { BaseApiClient } from '@api/base';
import type { Brand } from '@app-types/brand.types';

export class BrandsClient extends BaseApiClient {
  private readonly path = '/brands';

  /** GET /brands -- all product brands. */
  getBrands(): Promise<Brand[]> {
    return this.get(this.path);
  }
}
