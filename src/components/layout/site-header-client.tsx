"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 顶部栏的客户端渲染部分。
 * - 左上角：返回首页按钮，位于首页时隐藏。
 * - 右上角：“我的”入口，已在目标页面时隐藏，避免指向自身的多余入口。
 */
export function SiteHeaderClient({ href }: { href: string }) {
  const pathname = usePathname();

  const showHome = pathname !== "/";
  const showMine = pathname !== href;

  // 两个按钮都不显示时（例如首页且 href 也是 "/"）不渲染顶部栏。
  if (!showHome && !showMine) {
    return null;
  }

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {showHome ? (
            <Link
              href="/"
              className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-gray-100 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            >
              ← 返回首页
            </Link>
          ) : (
            <span />
          )}

          {showMine ? (
            <Link
              href={href}
              className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-gray-100 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            >
              我的
            </Link>
          ) : (
            <span />
          )}
        </div>
      </header>
      {/* 占位块：与固定顶部栏等高，避免内容被遮挡（首页无顶部栏时不渲染）。 */}
      <div aria-hidden className="h-[60px]" />
    </>
  );
}
