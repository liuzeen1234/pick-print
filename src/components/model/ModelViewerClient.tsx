"use client";

import dynamic from "next/dynamic";
import type { ModelViewerProps } from "./ModelViewer";

// three.js 依赖浏览器环境，禁用 SSR 并提供加载占位
const ModelViewer = dynamic(
  () => import("./ModelViewer").then((m) => m.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-400">
        正在加载 3D 预览…
      </div>
    ),
  },
);

export function ModelViewerClient(props: ModelViewerProps) {
  return <ModelViewer {...props} />;
}
