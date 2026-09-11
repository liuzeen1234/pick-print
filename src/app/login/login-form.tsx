"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/orders";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const input = {
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "输入不合法");
      return;
    }

    setPending(true);
    try {
      const result = await signIn("credentials", {
        username: parsed.data.username,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("账号名或密码错误");
        return;
      }

      router.push(callbackUrl);
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
          placeholder="你的账号名"
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
          autoComplete="current-password"
          placeholder="你的密码"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "登录中…" : "登录"}
      </Button>
    </form>
  );
}
