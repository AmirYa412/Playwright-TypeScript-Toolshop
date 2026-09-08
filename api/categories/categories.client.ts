import { BaseApiClient } from '@api/base';
import type { Category } from '@app-types/category.types';

export class CategoriesClient extends BaseApiClient {
  private readonly path = '/categories';

  /** GET /categories/tree -- full category tree with nested sub_categories. */
  getCategoriesTree(): Promise<Category[]> {
    return this.get(`${this.path}/tree`);
  }
}
