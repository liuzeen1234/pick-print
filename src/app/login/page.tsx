import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "登录" };

export default async function LoginPage() {
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
        <h1 className="text-2xl font-bold">登录 PickPrint</h1>
        <p className="mt-2 text-sm text-gray-500">用账号名和密码登录。</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          去注册
        </Link>
      </p>
    </Container>
  );
}
