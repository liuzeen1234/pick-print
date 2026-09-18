import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { ADMIN_OP_LEVEL } from "@/lib/db/schema";
import { AdminSidebar } from "./admin-sidebar";

/**
 * 后台统一布局：左侧侧边栏 + 右侧内容区。
 * 权限校验集中在这里：仅管理员（op 等级 >= 4）可进入 /admin 下的任意页面。
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/users");
  }
  if ((session.user.opLevel ?? 1) < ADMIN_OP_LEVEL) {
    // 非管理员没有后台权限
    redirect("/");
  }

  return (
    <Container className="flex min-h-screen flex-col gap-6 py-12 md:flex-row md:gap-8">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </Container>
  );
}
