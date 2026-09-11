"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

// 退出登录按钮，退出后回到首页
export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      退出登录
    </Button>
  );
}
