import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SAMPLE_MODELS } from "@/lib/sample-models";

export const metadata: Metadata = {
  title: "模型库",
};

export default function ModelsPage() {
  return (
    <Container className="flex min-h-screen flex-col gap-6 py-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ← 返回首页
        </Link>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">模型库（示例）</h1>
        <p className="mt-2 text-gray-500">
          阶段 1 预览测试用。点击任意模型进入 3D 预览，验证加载与交互效果。
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_MODELS.map((model) => (
          <li key={model.id}>
            <Link
              href={`/models/${model.id}`}
              className="group flex h-full flex-col rounded-xl border p-5 transition-colors hover:border-brand hover:bg-gray-50"
            >
              <span className="text-lg font-semibold group-hover:text-brand">
                {model.title}
              </span>
              <span className="mt-1 flex-1 text-sm text-gray-500">
                {model.description}
              </span>
              <span className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                {model.format}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
