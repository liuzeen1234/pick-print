import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/ui/container";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = { title: "我的订单" };

// 需要登录才能访问：未登录跳转到登录页，并带上回跳地址
export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const { id, name, phone } = session.user;
  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, id))
    .orderBy(desc(orders.createdAt));

  return (
    <Container className="flex min-h-screen flex-col gap-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <LogoutButton />
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
        <p>
          账号：<span className="font-medium">{name}</span>
        </p>
        <p className="mt-1 text-gray-500">下单默认联系手机号：{phone}</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
          还没有订单。去
          <Link
            href="/models"
            className="mx-1 font-medium text-brand hover:underline"
          >
            挑一个模型
          </Link>
          下单吧。
        </div>
      ) : (
        <ul className="space-y-4">
          {userOrders.map((order) => (
            <li key={order.id} className="rounded-lg border p-5 dark:border-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{order.modelTitle}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.material} · {order.color} · {order.quantity} 件
                  </p>
                </div>
                <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                  {order.status === "pending" ? "待人工确认" : order.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap justify-between gap-2 border-t pt-4 text-sm text-gray-500 dark:border-gray-800">
                <span>预估重量：{order.estimatedWeightGrams} g</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(order.priceCents)}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                创建于 {order.createdAt.toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
