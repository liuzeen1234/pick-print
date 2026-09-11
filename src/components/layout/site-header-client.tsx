"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 顶部栏的客户端渲染部分。
 * 当前已经在目标页面（“我的”）时不渲染按钮，避免出现指向自身的多余入口。
 */
export function SiteHeaderClient({ href }: { href: string }) {
  const pathname = usePathname();

  if (pathname === href) {
    return null;
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-5xl justify-end px-4 py-3 sm:px-6">
        <Link
          href={href}
          className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-gray-100 dark:bg-gray-900/80 dark:hover:bg-gray-800"
        >
          我的
        </Link>
      </div>
    </header>
  );
}
