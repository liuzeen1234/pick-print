import { NextResponse } from "next/server";
import { or, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation";

// 注册接口：账号名 + 手机号 + 密码。密码 bcrypt 哈希存储。
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { message: firstIssue?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { username, phone, password } = parsed.data;

  // 账号名 / 手机号唯一性预检查（数据库仍有唯一约束兜底）
  const existing = await db
    .select({ id: users.id, username: users.username, phone: users.phone })
    .from(users)
    .where(or(eq(users.username, username), eq(users.phone, phone)))
    .limit(1);

  if (existing.length > 0) {
    const conflict = existing[0].username === username ? "账号名" : "手机号";
    return NextResponse.json({ message: `${conflict}已被注册` }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [created] = await db
      .insert(users)
      .values({ username, phone, passwordHash })
      .returning({ id: users.id, username: users.username });

    return NextResponse.json(
      { id: created.id, username: created.username },
      { status: 201 },
    );
  } catch (error) {
    // 唯一约束并发冲突兜底
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return NextResponse.json(
        { message: "账号名或手机号已被注册" },
        { status: 409 },
      );
    }
    console.error("注册失败", error);
    // 开发环境下暴露更具体的原因（如数据库未连接），方便排查
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `：${error.message}`
        : "";
    return NextResponse.json(
      { message: `注册失败，请稍后重试${detail}` },
      { status: 500 },
    );
  }
}
