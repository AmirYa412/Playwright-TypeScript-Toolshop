import { z } from 'zod';

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
  expires_in: z.number(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
