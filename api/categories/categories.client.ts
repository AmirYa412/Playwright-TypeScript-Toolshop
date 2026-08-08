import { BaseApiClient } from '@api/base';
import type { Category } from '@app-types/category.types';

export class CategoriesClient extends BaseApiClient {
  /** GET /categories/tree -- full category tree with nested sub_categories. */
  tree(): Promise<Category[]> {
    return this.get<Category[]>('/categories/tree');
  }
}
