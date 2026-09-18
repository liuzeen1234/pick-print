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

// 更改密码：当前密码 + 两次新密码（需一致）
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "新密码不能与当前密码相同",
    path: ["newPassword"],
  });

export const MATERIAL_OPTIONS = ["PLA", "PETG"] as const;
export const COLOR_OPTIONS = ["白色", "黑色", "灰色", "红色", "蓝色"] as const;

// 下单：模型与选型由客户端提交，服务端会再次验证模型、授权和报价。
export const createOrderSchema = z.object({
  modelId: z
    .string()
    .trim()
    .min(1, "请选择模型")
    .max(100, "模型标识不合法")
    .regex(/^[a-z0-9-]+$/, "模型标识不合法"),
  material: z.enum(MATERIAL_OPTIONS, { message: "请选择可用材质" }),
  color: z.enum(COLOR_OPTIONS, { message: "请选择可用颜色" }),
  quantity: z
    .number()
    .int("数量必须是整数")
    .min(1, "数量至少为 1")
    .max(20, "单次最多购买 20 件"),
  contactName: z
    .string()
    .trim()
    .min(2, "请输入联系人姓名")
    .max(30, "联系人姓名最多 30 个字符"),
  contactPhone: phoneSchema,
  contactAddress: z.string().trim().min(1, "请输入收货地址").max(200, "收货地址最多 200 个字符"),
});

// 后台调整用户 op 等级：目标用户 id + 新的等级（1-4）
export const updateOpLevelSchema = z.object({
  userId: z.string().uuid("用户标识不合法"),
  opLevel: z
    .number()
    .int("op 等级必须是整数")
    .min(1, "op 等级最小为 1")
    .max(4, "op 等级最大为 4"),
});

/** 订单状态最大长度，兼顾预设与自定义状态。 */
export const ORDER_STATUS_MAX_LENGTH = 20;

// 后台调整订单状态：订单 id + 新状态（预设或自定义文本，非空且不超长）
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("订单标识不合法"),
  status: z
    .string()
    .trim()
    .min(1, "请输入订单状态")
    .max(ORDER_STATUS_MAX_LENGTH, `订单状态最多 ${ORDER_STATUS_MAX_LENGTH} 个字符`),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOpLevelInput = z.infer<typeof updateOpLevelSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
