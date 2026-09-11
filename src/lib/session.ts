import { auth } from "@/auth";

/**
 * 服务端读取当前登录用户。未登录返回 null。
 * 用于页面与 API 路由的登录判断。
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * API 路由里要求登录：返回用户，或抛出可被上层转成 401 的错误。
 * 用法：
 *   const user = await requireUser();  // 未登录则抛错
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("未登录");
    this.name = "UnauthorizedError";
  }
}
