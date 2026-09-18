import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ADMIN_OP_LEVEL, users } from "@/lib/db/schema";
import { UserOpLevelTable } from "./user-op-level-table";

export const metadata: Metadata = { title: "用户管理 · 后台" };

/**
 * 后台用户管理页。权限校验由 admin/layout.tsx 统一处理。
 * 展示所有用户并允许调整其 op 等级。
 */
export default async function AdminUsersPage() {
  const session = await auth();

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          调整用户的 op 等级（1-4）。管理员为 4 级。
        </p>
      </div>
      <UserOpLevelTable
        initialUsers={initialUsers}
        currentUserId={session?.user?.id ?? ""}
        adminOpLevel={ADMIN_OP_LEVEL}
      />
    </div>
  );
}
