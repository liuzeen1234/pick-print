import { getCurrentUser } from "@/lib/session";
import { SiteHeaderClient } from "./site-header-client";

/**
 * 全站顶部栏，右上角提供“我的”入口。
 * 已登录跳转到订单页，未登录跳转到登录页。
 * 当前已在目标页面时由客户端组件负责隐藏按钮。
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const href = user ? "/orders" : "/login";

  return <SiteHeaderClient href={href} />;
}
