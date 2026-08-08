import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sub_categories: Category[];
}

// Recursive shape needs an explicit z.ZodType annotation -- zod can't infer it from z.lazy() alone.
export const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    parent_id: z.string().nullable(),
    sub_categories: z.array(CategorySchema),
  }),
);

export const CategoryTreeSchema = z.array(CategorySchema);
