"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/db/schema";
import { ORDER_STATUS_MAX_LENGTH } from "@/lib/validation";

interface Props {
  orderId: string;
  initialStatus: string;
}

// 下拉框里「自定义」选项的取值，避免和真实状态冲突
const CUSTOM_OPTION = "__custom__";

const PRESET_SET = new Set<string>(ORDER_STATUSES);

/**
 * 订单状态更新控件：可选预设状态，也可输入自定义状态后保存。
 * 保存成功后刷新服务端数据，让详情页与列表页展示保持一致。
 */
export function OrderStatusControl({ orderId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  // 当前状态不在预设里，说明是自定义状态，进入自定义模式
  const [isCustom, setIsCustom] = useState(!PRESET_SET.has(initialStatus));
  const [customValue, setCustomValue] = useState(
    PRESET_SET.has(initialStatus) ? "" : initialStatus,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 下拉框选中值：自定义模式时固定指向自定义选项
  const selectValue = isCustom ? CUSTOM_OPTION : status;

  function onSelectChange(value: string) {
    setError(null);
    setNotice(null);
    if (value === CUSTOM_OPTION) {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    void save(value);
  }

  async function save(next: string) {
    const trimmed = next.trim();
    if (!trimmed) {
      setError("请输入订单状态");
      return;
    }
    if (trimmed === status) {
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(data?.message ?? "更新失败，请稍后重试");
        return;
      }

      setStatus(trimmed);
      const label = PRESET_SET.has(trimmed)
        ? ORDER_STATUS_LABELS[trimmed as OrderStatus]
        : trimmed;
      setNotice(`已更新为「${label}」`);
      // 刷新服务端组件，让徽标等展示同步最新状态
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="order-status"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        订单状态
      </label>

      <select
        id="order-status"
        value={selectValue}
        disabled={saving}
        onChange={(e) => onSelectChange(e.target.value)}
        className="w-full max-w-xs rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 dark:border-gray-700"
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS_LABELS[value]}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>自定义…</option>
      </select>

      {isCustom && (
        <div className="flex max-w-md flex-wrap items-center gap-2">
          <input
            type="text"
            value={customValue}
            maxLength={ORDER_STATUS_MAX_LENGTH}
            disabled={saving}
            placeholder="输入自定义状态"
            aria-label="自定义订单状态"
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save(customValue);
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 dark:border-gray-700"
          />
          <button
            type="button"
            disabled={saving || customValue.trim().length === 0}
            onClick={() => void save(customValue)}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
          >
            保存
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-green-600">
          {notice}
        </p>
      )}
    </div>
  );
}
