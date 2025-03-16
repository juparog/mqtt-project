import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('You must give a valid email'),
  password: z
    .string()
    .min(8, { message: 'Your password must be atleast 8 characters long' })
    .max(64, {
      message: 'Your password can not be longer then 64 characters long',
    })
    .refine(
      (value) =>
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(
          value ?? ''
        ),
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol'
    ),
});
