import { z } from "zod";

/**
 * 账号系统的输入校验规则。前后端复用同一套 schema，保证一致性。
 */

// 账号名：3-20 位，字母/数字/下划线
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "账号名至少 3 个字符")
  .max(20, "账号名最多 20 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "账号名只能包含字母、数字和下划线");

// 手机号：中国大陆 11 位
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号");

// 密码：6-64 位
export const passwordSchema = z
  .string()
  .min(6, "密码至少 6 个字符")
  .max(64, "密码最多 64 个字符");

// 注册：账号名 + 手机号 + 密码
export const registerSchema = z.object({
  username: usernameSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

// 登录：账号名 + 密码
export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
