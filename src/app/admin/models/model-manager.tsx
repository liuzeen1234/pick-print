"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ModelRecord } from "@/lib/models-store";

interface Props {
  initialModels: ModelRecord[];
}

/** 与后端一致的可上传扩展名，用于文件选择器过滤。 */
const ACCEPTED_EXTENSIONS = ".stl,.3mf,.glb,.gltf";

const FORMAT_LABELS: Record<string, string> = {
  stl: "STL",
  "3mf": "3MF",
  glb: "GLB",
  gltf: "GLTF",
};

export function ModelManager({ initialModels }: Props) {
  const [models, setModels] = useState<ModelRecord[]>(initialModels);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<ModelRecord | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // 复选框未勾选时不会出现在 FormData 中，这里显式规范为 "true"/"false"
    data.set("commercialAllowed", data.get("commercialAllowed") ? "true" : "false");

    setUploading(true);
    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        body: data,
      });
      const payload = (await res.json().catch(() => null)) as
        | (ModelRecord & { message?: string })
        | { message?: string }
        | null;

      if (!res.ok) {
        setError(
          (payload && "message" in payload && payload.message) ||
            "上传失败，请稍后重试",
        );
        return;
      }

      const created = payload as ModelRecord;
      setModels((list) => [...list, created]);
      setNotice(`已上传模型「${created.title}」`);
      form.reset();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(model: ModelRecord) {
    if (!window.confirm(`确定删除模型「${model.title}」？此操作不可撤销。`)) {
      return;
    }
    setError(null);
    setNotice(null);
    setDeletingId(model.id);

    // 乐观移除，失败时回滚
    const previous = models;
    setModels((list) => list.filter((m) => m.id !== model.id));

    try {
      const res = await fetch("/api/admin/models", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: model.id }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(payload?.message ?? "删除失败，请稍后重试");
        setModels(previous);
        return;
      }

      setNotice(`已删除模型「${model.title}」`);
    } catch {
      setError("网络错误，请稍后重试");
      setModels(previous);
    } finally {
      setDeletingId(null);
    }
  }

  function handleUpdated(updated: ModelRecord) {
    setModels((list) => list.map((m) => (m.id === updated.id ? updated : m)));
    setNotice(`已更新模型「${updated.title}」`);
    setEditingModel(null);
  }

  return (
    <div className="flex flex-col gap-6">
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

      {/* 上传表单 */}
      <form
        ref={formRef}
        onSubmit={handleUpload}
        className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5 dark:border-gray-800"
      >
        <h2 className="text-lg font-semibold">上传新模型</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">模型标识（英文/数字/连字符）</span>
            <input
              name="id"
              required
              pattern="[a-z0-9-]+"
              placeholder="例如 my-model-v1"
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">模型名称</span>
            <input
              name="title"
              required
              maxLength={100}
              placeholder="展示用名称"
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">预估重量（克）</span>
            <input
              name="estimatedWeightGrams"
              type="number"
              required
              min={1}
              max={100000}
              step={1}
              placeholder="单件耗材预估重量"
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">库存（件）</span>
            <input
              name="stock"
              type="number"
              required
              min={0}
              max={1000000}
              step={1}
              placeholder="当前可用库存"
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">描述（可选）</span>
          <textarea
            name="description"
            rows={2}
            maxLength={300}
            placeholder="简要说明模型用途或注意事项"
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">模型文件</span>
          <input
            name="file"
            type="file"
            required
            accept={ACCEPTED_EXTENSIONS}
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-foreground hover:file:opacity-90"
          />
          <span className="text-xs text-gray-400">
            支持 STL / 3MF / GLB / GLTF，格式由文件扩展名自动识别，单个文件最大 30MB。
          </span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            name="commercialAllowed"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-brand focus-visible:ring-brand"
          />
          <span>允许商用（未勾选的模型不会进入下单流程）</span>
        </label>

        <div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "上传中…" : "上传模型"}
          </Button>
        </div>
      </form>

      {/* 模型列表 */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 font-medium">名称</th>
              <th className="px-4 py-3 font-medium">标识</th>
              <th className="px-4 py-3 font-medium">格式</th>
              <th className="px-4 py-3 font-medium">预估重量</th>
              <th className="px-4 py-3 font-medium">库存</th>
              <th className="px-4 py-3 font-medium">商用</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  暂无模型，请在上方上传。
                </td>
              </tr>
            )}
            {models.map((model) => (
              <tr
                key={model.id}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800"
              >
                <td className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setEditingModel(model)}
                    className="text-left hover:text-brand hover:underline"
                  >
                    {model.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">{model.id}</td>
                <td className="px-4 py-3 uppercase text-gray-500">
                  {FORMAT_LABELS[model.format] ?? model.format}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {model.estimatedWeightGrams} g
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <span className={model.stock === 0 ? "text-red-600" : undefined}>
                    {model.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {model.commercialAllowed ? "是" : "否"}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(model)}
                    disabled={deletingId === model.id}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {deletingId === model.id ? "删除中…" : "删除"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingModel && (
        <EditModelDialog
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

interface EditModelDialogProps {
  model: ModelRecord;
  onClose: () => void;
  onUpdated: (updated: ModelRecord) => void;
}

/** 编辑模型信息的弹窗：名称、描述、预估重量、库存、商用状态。id/格式/文件不可修改。 */
function EditModelDialog({ model, onClose, onUpdated }: EditModelDialogProps) {
  const [title, setTitle] = useState(model.title);
  const [description, setDescription] = useState(model.description);
  const [estimatedWeightGrams, setEstimatedWeightGrams] = useState(
    String(model.estimatedWeightGrams),
  );
  const [stock, setStock] = useState(String(model.stock));
  const [commercialAllowed, setCommercialAllowed] = useState(model.commercialAllowed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: model.id,
          title,
          description,
          estimatedWeightGrams: Number(estimatedWeightGrams),
          stock: Number(stock),
          commercialAllowed,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | (ModelRecord & { message?: string })
        | { message?: string }
        | null;

      if (!res.ok) {
        setError(
          (payload && "message" in payload && payload.message) ||
            "更新失败，请稍后重试",
        );
        return;
      }

      onUpdated(payload as ModelRecord);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`编辑模型 ${model.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">编辑模型</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-400">
          标识：{model.id} · 格式：{FORMAT_LABELS[model.format] ?? model.format}
          （不可修改）
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">模型名称</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">预估重量（克）</span>
            <input
              type="number"
              value={estimatedWeightGrams}
              onChange={(e) => setEstimatedWeightGrams(e.target.value)}
              required
              min={1}
              max={100000}
              step={1}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">库存（件）</span>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min={0}
              max={1000000}
              step={1}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">描述（可选）</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={commercialAllowed}
            onChange={(e) => setCommercialAllowed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand focus-visible:ring-brand"
          />
          <span>允许商用（未勾选的模型不会进入下单流程）</span>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
