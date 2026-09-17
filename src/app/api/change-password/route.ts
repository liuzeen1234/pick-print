import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { changePasswordSchema } from "@/lib/validation";

// 更改密码接口：需登录。校验当前密码后写入新密码的 bcrypt 哈希。
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { message: firstIssue?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ message: "账号不存在" }, { status: 404 });
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "当前密码不正确" }, { status: 400 });
  }

  try {
    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("更改密码失败", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `：${error.message}`
        : "";
    return NextResponse.json(
      { message: `更改密码失败，请稍后重试${detail}` },
      { status: 500 },
    );
  }
}
