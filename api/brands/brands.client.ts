import { BaseApiClient } from '@api/base';
import type { Brand } from '@app-types/brand.types';

export class BrandsClient extends BaseApiClient {
  /** GET /brands -- all product brands. */
  list(): Promise<Brand[]> {
    return this.get<Brand[]>('/brands');
  }
}
