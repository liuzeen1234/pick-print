import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "更改密码" };

// 需要登录才能访问：未登录跳转到登录页，并带上回跳地址
export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account/change-password");
  }

  return (
    <Container className="flex min-h-screen max-w-md flex-col justify-center gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">更改密码</h1>
        <p className="mt-2 text-sm text-gray-500">
          输入当前密码，并两次输入新密码。
        </p>
      </div>
      <ChangePasswordForm />
      <p className="text-center text-sm text-gray-500">
        <Link href="/orders" className="font-medium text-brand hover:underline">
          返回我的订单
        </Link>
      </p>
    </Container>
  );
}
