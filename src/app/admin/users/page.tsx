import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { db } from "@/lib/db";
import { ADMIN_OP_LEVEL, users } from "@/lib/db/schema";
import { UserOpLevelTable } from "./user-op-level-table";

export const metadata: Metadata = { title: "用户管理 · 后台" };

/**
 * 后台用户管理页。仅管理员（op 等级 >= 4）可访问。
 * 展示所有用户并允许调整其 op 等级。
 */
export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/users");
  }
  if ((session.user.opLevel ?? 1) < ADMIN_OP_LEVEL) {
    // 非管理员没有后台权限
    redirect("/");
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

  const initialUsers = rows.map((u) => ({
    id: u.id,
    username: u.username,
    phone: u.phone,
    opLevel: u.opLevel,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <Container className="flex min-h-screen flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          调整用户的 op 等级（1-4）。管理员为 4 级。
        </p>
      </div>
      <UserOpLevelTable
        initialUsers={initialUsers}
        currentUserId={session.user.id}
        adminOpLevel={ADMIN_OP_LEVEL}
      />
    </Container>
  );
}
