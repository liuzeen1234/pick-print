import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { formatPrice } from "@/lib/pricing";
import { OrderStatusBadge } from "./order-status-badge";

export const metadata: Metadata = { title: "订单管理 · 后台" };

/**
 * 后台订单管理页。权限校验由 admin/layout.tsx 统一处理。
 * 展示所有订单及其状态，点击某行进入订单详情页。
 */
export default async function AdminOrdersPage() {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">订单管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          共 {rows.length} 笔订单。点击任意订单查看详情并更新状态。
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
          还没有任何订单。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 font-medium">模型</th>
                <th className="px-4 py-3 font-medium">下单账号</th>
                <th className="px-4 py-3 font-medium">规格</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">下单时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {order.modelTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.username ?? "（已注销）"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.material} · {order.color} · {order.quantity} 件
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(order.priceCents)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.createdAt.toLocaleString("zh-CN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
