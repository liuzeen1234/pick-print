import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ModelViewerClient } from "@/components/model/ModelViewerClient";
import { getSampleModel } from "@/lib/sample-models";

type Params = { params: Promise<{ id: string }> };

// 目录可在后台动态增删，改为按需渲染而非构建期静态生成。
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { id } = await params;
  const model = getSampleModel(id);
  if (!model) return { title: "模型未找到" };
  return { title: model.title };
}

export default async function ModelDetailPage({ params }: Params) {
  const { id } = await params;
  const model = getSampleModel(id);

  if (!model) {
    notFound();
  }

  return (
    <Container className="flex min-h-screen flex-col gap-8 py-10 lg:flex-row lg:items-start">
      <div className="w-full lg:w-1/2">
        <ModelViewerClient src={model.src} format={model.format} />
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        <h1 className="text-2xl font-bold sm:text-3xl">{model.title}</h1>
        <p className="text-gray-500">{model.description}</p>
        <p className="text-sm text-gray-500">
          库存：
          <span className={model.stock === 0 ? "font-medium text-red-600" : "font-medium text-gray-700"}>
            {model.stock === 0 ? "已售罄" : `${model.stock} 件`}
          </span>
        </p>

        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-500">
          <p className="font-medium text-gray-700">操作方式</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>左键拖拽：旋转</li>
            <li>滚轮：缩放</li>
            <li>右键拖拽：平移</li>
          </ul>
        </div>

        <div className="mt-2 flex gap-3">
          {model.stock === 0 ? (
            <Button disabled>已售罄</Button>
          ) : (
            <Link href={`/orders/new?modelId=${model.id}`}>
              <Button>选材质下单</Button>
            </Link>
          )}
          <Link href="/models">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
