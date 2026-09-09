import { Container } from "@/components/ui/container";

// 全局加载状态（App Router 约定文件）
export default function Loading() {
  return (
    <Container className="flex min-h-screen items-center justify-center">
      <div
        className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand"
        role="status"
        aria-label="加载中"
      />
    </Container>
  );
}
