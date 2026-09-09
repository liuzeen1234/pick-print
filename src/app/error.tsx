"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// 全局运行时错误边界（App Router 约定文件）
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 生产环境这里接入错误监控（如 Sentry）
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">出错了</h1>
      <p className="text-sm text-gray-500">页面加载时发生了错误，请重试。</p>
      <Button onClick={reset}>重试</Button>
    </Container>
  );
}
