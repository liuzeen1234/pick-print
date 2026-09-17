import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_OP_LEVEL, users } from "@/lib/db/schema";
import { requireUser, UnauthorizedError } from "@/lib/session";
import { updateOpLevelSchema } from "@/lib/validation";

/**
 * 要求当前登录用户为管理员（op 等级 >= 4）。
 * 返回用户，或抛出可被上层转成 401/403 的错误。
 */
async function requireAdmin() {
  const user = await requireUser();
  if ((user.opLevel ?? 1) < ADMIN_OP_LEVEL) {
    throw new ForbiddenError();
  }
  return user;
}

class ForbiddenError extends Error {
  constructor() {
    super("无权限");
    this.name = "ForbiddenError";
  }
}

function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ message: "需要管理员权限" }, { status: 403 });
  }
  return null;
}

/** 列出所有用户（管理员后台用）。不返回密码哈希。 */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      phone: users.phone,
      opLevel: users.opLevel,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ users: rows });
}

/** 调整指定用户的 op 等级。仅管理员可用。 */
export async function PATCH(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = updateOpLevelSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { userId, opLevel } = parsed.data;

  // 防止管理员误操作降低自己的权限而把自己锁在后台外
  if (userId === admin.id && opLevel < ADMIN_OP_LEVEL) {
    return NextResponse.json(
      { message: "不能降低自己的管理员权限" },
      { status: 409 },
    );
  }

  try {
    const [updated] = await db
      .update(users)
      .set({ opLevel })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username, opLevel: users.opLevel });

    if (!updated) {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新 op 等级失败", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `：${error.message}`
        : "";
    return NextResponse.json(
      { message: `更新失败，请稍后重试${detail}` },
      { status: 500 },
    );
  }
}
