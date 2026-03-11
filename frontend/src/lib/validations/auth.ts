import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
