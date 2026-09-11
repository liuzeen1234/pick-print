import type { DefaultSession } from "next-auth";

/**
 * 扩展 Auth.js 的 Session 与 JWT 类型，加入我们自定义的字段：
 * - id：用户主键（关联订单 userId）
 * - phone：注册手机号（下单默认联系方式）
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    phone?: string;
  }
}
