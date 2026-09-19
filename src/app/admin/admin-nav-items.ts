/**
 * 后台各界面项目的集中定义，供侧边栏渲染与高亮使用。
 * 新增后台页面时，在这里追加一项即可。
 */
export interface AdminNavItem {
  /** 路由地址 */
  href: string;
  /** 侧边栏显示名称 */
  label: string;
  /** 简短描述（可选，作为 title 提示） */
  description?: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/users",
    label: "用户管理",
    description: "查看用户并调整 op 等级",
  },
  {
    href: "/admin/orders",
    label: "订单管理",
    description: "查看所有订单并更新状态",
  },
  {
    href: "/admin/models",
    label: "模型管理",
    description: "上传或删除模型",
  },
];
