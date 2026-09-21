"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateOrderEstimate, formatPrice } from "@/lib/pricing";
import {
  COLOR_OPTIONS,
  createOrderSchema,
  MATERIAL_OPTIONS,
  type CreateOrderInput,
} from "@/lib/validation";

type OrderFormProps = {
  model: {
    id: string;
    title: string;
    estimatedWeightGrams: number;
    stock: number;
  };
  defaultPhone: string;
  defaultContactName: string;
};

export function OrderForm({
  model,
  defaultPhone,
  defaultContactName,
}: OrderFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CreateOrderInput>({
    modelId: model.id,
    material: "PLA",
    color: "白色",
    quantity: 1,
    contactName: defaultContactName,
    contactPhone: defaultPhone,
    contactAddress: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimate = calculateOrderEstimate({
    baseWeightGrams: model.estimatedWeightGrams,
    quantity: form.quantity,
  });
  const maxQuantity = Math.min(20, model.stock);

  function update<K extends keyof CreateOrderInput>(
    key: K,
    value: CreateOrderInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = createOrderSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "请检查填写内容");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "创建订单失败，请稍后重试");
        return;
      }
      router.push("/orders");
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4 rounded-lg border p-4 dark:border-gray-800">
        <h2 className="font-semibold">打印选项</h2>
        <label className="block space-y-1.5 text-sm font-medium">
          材质
          <select
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            value={form.material}
            onChange={(event) =>
              update(
                "material",
                event.target.value as CreateOrderInput["material"],
              )
            }
          >
            {MATERIAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          颜色
          <select
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700"
            value={form.color}
            onChange={(event) =>
              update("color", event.target.value as CreateOrderInput["color"])
            }
          >
            {COLOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          数量
          <Input
            min={1}
            max={maxQuantity}
            type="number"
            value={form.quantity}
            onChange={(event) => update("quantity", Number(event.target.value))}
          />
          <span className="block text-xs font-normal text-gray-400">
            当前库存 {model.stock} 件
          </span>
        </label>
      </section>

      <section className="space-y-4 rounded-lg border p-4 dark:border-gray-800">
        <h2 className="font-semibold">联系信息</h2>
        <label className="block space-y-1.5 text-sm font-medium">
          联系人
          <Input
            autoComplete="name"
            maxLength={30}
            placeholder="请输入联系人姓名"
            value={form.contactName}
            onChange={(event) => update("contactName", event.target.value)}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          联系手机号
          <Input
            autoComplete="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="请输入手机号"
            value={form.contactPhone}
            onChange={(event) => update("contactPhone", event.target.value)}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          收货地址
          <textarea
            className="min-h-24 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            maxLength={200}
            value={form.contactAddress}
            onChange={(event) => update("contactAddress", event.target.value)}
          />
        </label>
      </section>

      <section className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span>预估重量</span>
          <span>{estimate.estimatedWeightGrams} g</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-base font-semibold">
          <span>预估报价</span>
          <span className="text-brand">{formatPrice(estimate.priceCents)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          材料费按预估重量 × 0.3 元/g 计算，不足 2 元按起步价 2 元计；实际打印将由人工确认。
        </p>
      </section>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "正在创建订单…" : "提交订单"}
      </Button>
    </form>
  );
}
