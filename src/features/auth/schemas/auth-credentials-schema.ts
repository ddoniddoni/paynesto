import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 형식을 입력해 주세요.'),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.')
    .max(72, '비밀번호는 72자 이하로 입력해 주세요.'),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
