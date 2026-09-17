import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { OrderForm } from "@/components/order/order-form";
import { Container } from "@/components/ui/container";
import { getSampleModel } from "@/lib/sample-models";

export const metadata: Metadata = { title: "创建订单" };

type SearchParams = { searchParams: Promise<{ modelId?: string }> };

export default async function NewOrderPage({ searchParams }: SearchParams) {
  const { modelId } = await searchParams;
  const model = modelId ? getSampleModel(modelId) : undefined;
  if (!model) {
    notFound();
  }

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/orders/new?modelId=${model.id}`)}`);
  }

  return (
    <Container className="max-w-2xl py-10">
      <Link className="text-sm text-brand hover:underline" href={`/models/${model.id}`}>
        ← 返回模型详情
      </Link>
      <h1 className="mt-4 text-2xl font-bold">创建订单</h1>
      <p className="mt-2 text-gray-500">模型：{model.title}</p>
      <div className="mt-6">
        <OrderForm
          model={model}
          defaultContactName={session.user.name ?? ""}
          defaultPhone={session.user.phone}
        />
      </div>
    </Container>
  );
}
