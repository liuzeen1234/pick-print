"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 顶部栏的客户端渲染部分。
 * - 左上角：返回首页按钮，位于首页时隐藏。
 * - 右上角：管理员的“管理”入口 + “我的”入口，已在目标页面时隐藏，避免指向自身的多余入口。
 */
export function SiteHeaderClient({
  href,
  isAdmin = false,
}: {
  href: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const adminHref = "/admin/users";
  const showHome = pathname !== "/";
  const showMine = pathname !== href;
  // 已经在后台任意页面时隐藏“管理”入口，后台内部由侧边栏负责导航
  const showAdmin =
    isAdmin && pathname !== "/admin" && !pathname.startsWith("/admin/");

  // 所有按钮都不显示时不渲染顶部栏。
  if (!showHome && !showMine && !showAdmin) {
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

          <div className="flex items-center gap-2">
            {showAdmin ? (
              <Link
                href={adminHref}
                className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-gray-100 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              >
                管理
              </Link>
            ) : null}

            {showMine ? (
              <Link
                href={href}
                className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-gray-100 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              >
                我的
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      {/* 占位块：与固定顶部栏等高，避免内容被遮挡（首页无顶部栏时不渲染）。 */}
      <div aria-hidden className="h-[60px]" />
    </>
  );
}
