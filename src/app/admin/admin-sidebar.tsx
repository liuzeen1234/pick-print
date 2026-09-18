"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";

/**
 * 后台侧边栏，列出各界面项目并高亮当前所在页面。
 * 桌面端固定在左侧竖排，窄屏时横向滚动。
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="后台导航"
      className="shrink-0 md:w-56"
    >
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        管理后台
      </p>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {ADMIN_NAV_ITEMS.map((item) => {
          // 精确匹配或位于该项的子路径下时高亮
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                title={item.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
