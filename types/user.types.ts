import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().nullable(),
  house_number: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  postal_code: z.string().nullable(),
});
export type Address = z.infer<typeof AddressSchema>;

export const UserSchema = z.object({
  id: z.string(),
  provider: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  dob: z.string().nullable(),
  email: z.string().email(),
  totp_enabled: z.boolean(),
  created_at: z.string(),
  address: AddressSchema,
});
export type User = z.infer<typeof UserSchema>;
