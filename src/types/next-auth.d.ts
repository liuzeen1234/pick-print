import type { DefaultSession } from "next-auth";

/**
 * 扩展 Auth.js 的 Session 与 JWT 类型，加入我们自定义的字段：
 * - id：用户主键（关联订单 userId）
 * - phone：注册手机号（下单默认联系方式）
 * - opLevel：操作权限等级（普通用户 1，管理员 4）
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      opLevel: number;
    } & DefaultSession["user"];
  }

  interface User {
    phone?: string;
    opLevel?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    phone?: string;
    opLevel?: number;
  }
}
