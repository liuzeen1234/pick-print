import { formatOrderStatus, type OrderStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

/** 不同订单状态对应的徽标配色。 */
const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  confirmed: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  printing: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  shipped: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  completed: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

/** 订单状态徽标，未知状态回退为中性配色。 */
export function OrderStatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status as OrderStatus] ??
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        style,
      )}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
