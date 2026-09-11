import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "注册" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/orders");
  }

  return (
    <Container className="flex min-h-screen max-w-md flex-col justify-center gap-6 py-12">
      <Link
        href="/"
        className="text-sm text-gray-500 transition-colors hover:text-brand"
      >
        ← 返回首页
      </Link>
      <div className="text-center">
        <h1 className="text-2xl font-bold">创建账号</h1>
        <p className="mt-2 text-sm text-gray-500">
          注册后即可下单并查看「我的订单」。
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          去登录
        </Link>
      </p>
    </Container>
  );
}
