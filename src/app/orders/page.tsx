import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata: Metadata = { title: "我的订单" };

// 需要登录才能访问：未登录跳转到登录页，并带上回跳地址
export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const { name, phone } = session.user;

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

      {/* 订单列表将在阶段 3 接入（Order 关联 userId） */}
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
    </Container>
  );
}
