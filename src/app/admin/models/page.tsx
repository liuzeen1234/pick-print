import type { Metadata } from "next";
import { readModels } from "@/lib/models-store";
import { ModelManager } from "./model-manager";

export const metadata: Metadata = { title: "模型管理 · 后台" };

// 目录来自可读写存储，禁用静态化以反映上传/删除。
export const dynamic = "force-dynamic";

/**
 * 后台模型管理页。权限校验由 admin/layout.tsx 统一处理。
 * 展示当前模型目录，并支持上传新模型与删除模型。
 */
export default function AdminModelsPage() {
  const models = readModels();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">模型管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          上传新的模型文件（STL / 3MF / GLB / GLTF），或删除已有模型。
        </p>
      </div>
      <ModelManager initialModels={models} />
    </div>
  );
}
