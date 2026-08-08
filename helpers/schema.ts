import type { ZodType } from 'zod';

/** Parses `payload` against `schema`, throwing a readable error listing every issue if it fails. Returns the typed, parsed value. */
export function expectSchema<T>(schema: ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Schema validation failed:\n${issues}`);
  }
  return result.data;
}
