import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { formatPrice } from "@/lib/pricing";
import { OrderStatusBadge } from "../order-status-badge";
import { OrderStatusControl } from "./order-status-control";

export const metadata: Metadata = { title: "订单详情 · 后台" };

type Params = { params: Promise<{ id: string }> };

// UUID v4 格式校验，避免非法 id 触发数据库查询报错
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 后台订单详情页。权限校验由 admin/layout.tsx 统一处理。 */
export default async function AdminOrderDetailPage({ params }: Params) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    notFound();
  }

  const [order] = await db
    .select({
      id: orders.id,
      modelId: orders.modelId,
      modelTitle: orders.modelTitle,
      material: orders.material,
      color: orders.color,
      quantity: orders.quantity,
      estimatedWeightGrams: orders.estimatedWeightGrams,
      priceCents: orders.priceCents,
      status: orders.status,
      contactName: orders.contactName,
      contactPhone: orders.contactPhone,
      contactAddress: orders.contactAddress,
      createdAt: orders.createdAt,
      username: users.username,
      userPhone: users.phone,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:underline"
          >
            ← 返回订单列表
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{order.modelTitle}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <DetailCard title="订单信息">
          <DetailRow label="订单号" value={order.id} mono />
          <DetailRow label="模型" value={order.modelTitle} />
          <DetailRow label="模型标识" value={order.modelId} mono />
          <DetailRow label="材质" value={order.material} />
          <DetailRow label="颜色" value={order.color} />
          <DetailRow label="数量" value={`${order.quantity} 件`} />
          <DetailRow
            label="预估重量"
            value={`${order.estimatedWeightGrams} g`}
          />
          <DetailRow label="金额" value={formatPrice(order.priceCents)} />
          <DetailRow
            label="下单时间"
            value={order.createdAt.toLocaleString("zh-CN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </DetailCard>

        <DetailCard title="联系与收货">
          <DetailRow label="下单账号" value={order.username ?? "（已注销）"} />
          <DetailRow label="账号手机号" value={order.userPhone ?? "—"} />
          <DetailRow label="联系人" value={order.contactName} />
          <DetailRow label="联系电话" value={order.contactPhone} />
          <DetailRow label="收货地址" value={order.contactAddress} />
        </DetailCard>
      </section>

      <section className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        <OrderStatusControl orderId={order.id} initialStatus={order.status} />
      </section>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-500">{title}</h2>
      <dl className="flex flex-col gap-2 text-sm">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={
          mono
            ? "break-all text-right font-mono text-xs text-gray-700 dark:text-gray-300"
            : "text-right font-medium text-gray-900 dark:text-gray-100"
        }
      >
        {value}
      </dd>
    </div>
  );
}
