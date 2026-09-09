import Link from "next/link";
import { Container } from "@/components/ui/container";

// 404 页面（App Router 约定文件）
export default function NotFound() {
  return (
    <Container className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-sm text-gray-500">找不到你要访问的页面。</p>
      <Link href="/" className="text-brand underline underline-offset-4">
        返回首页
      </Link>
    </Container>
  );
}
