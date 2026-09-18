import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ADMIN_OP_LEVEL, orders, users } from "@/lib/db/schema";
import { requireUser, UnauthorizedError } from "@/lib/session";
import { updateOrderStatusSchema } from "@/lib/validation";

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

/** 列出所有订单（管理员后台用），附带下单账号名。 */
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
      id: orders.id,
      modelTitle: orders.modelTitle,
      material: orders.material,
      color: orders.color,
      quantity: orders.quantity,
      priceCents: orders.priceCents,
      status: orders.status,
      contactName: orders.contactName,
      createdAt: orders.createdAt,
      username: users.username,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: rows });
}

/** 调整指定订单的状态。仅管理员可用。 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
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

  const parsed = updateOrderStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { orderId, status } = parsed.data;

  try {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning({ id: orders.id, status: orders.status });

    if (!updated) {
      return NextResponse.json({ message: "订单不存在" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新订单状态失败", error);
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
