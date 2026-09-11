"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const input = {
      username: String(form.get("username") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "输入不合法");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(data?.message ?? "注册失败，请稍后重试");
        return;
      }

      // 注册成功后自动登录
      const result = await signIn("credentials", {
        username: parsed.data.username,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        // 注册成功但自动登录失败，引导去登录页
        router.push("/login");
        return;
      }

      router.push("/orders");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          账号名
        </label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="3-20 位字母、数字或下划线"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          手机号
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="用于联系与下单默认收货"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="至少 6 位"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "注册中…" : "注册"}
      </Button>
    </form>
  );
}
