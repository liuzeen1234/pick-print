import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ADMIN_OP_LEVEL } from "@/lib/db/schema";
import { requireUser, UnauthorizedError } from "@/lib/session";
import {
  addModel,
  ensurePublicModelsDir,
  PUBLIC_MODELS_DIR,
  readModels,
  removeModel,
  updateModel,
  type ModelFormat,
} from "@/lib/models-store";
import { deleteModelSchema, updateModelSchema, uploadModelSchema } from "@/lib/validation";

/**
 * 后台模型管理接口：列出 / 上传 / 删除模型。
 *
 * 权限：仅管理员（op 等级 >= 4）。上传的模型文件写入 public/sample-models/，
 * 目录元数据持久化在 data/models.json（见 models-store.ts）。
 */

/** 单个模型文件的大小上限（字节）。3DBenchy 约 11MB，这里留出余量到 30MB。 */
const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

/** 受支持的扩展名 → 格式映射。格式由上传文件的扩展名自动识别。 */
const EXTENSION_TO_FORMAT: Record<string, ModelFormat> = {
  ".stl": "stl",
  ".3mf": "3mf",
  ".glb": "glb",
  ".gltf": "gltf",
};

async function requireAdmin() {
  const user = await requireUser();
  if ((user.opLevel ?? 1) < ADMIN_OP_LEVEL) {
    throw new ForbiddenError();
  }
  return user;
}

class ForbiddenError extends Error {
  constructor() {
    super("无权限");
    this.name = "ForbiddenError";
  }
}

function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ message: "需要管理员权限" }, { status: 403 });
  }
  return null;
}

/** 列出全部模型（管理员后台用）。 */
export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  return NextResponse.json({ models: readModels() });
}

/** 上传一个新模型：multipart/form-data，包含文件与元数据字段。 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "请求体不是合法的表单数据" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "请选择要上传的模型文件" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { message: `文件过大，最大支持 ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` },
      { status: 400 },
    );
  }

  // 格式由文件扩展名自动识别，仅接受受支持的格式。
  const ext = path.extname(file.name).toLowerCase();
  const format = EXTENSION_TO_FORMAT[ext];
  if (!format) {
    return NextResponse.json(
      { message: "不支持的文件格式，仅支持 STL / 3MF / GLB / GLTF" },
      { status: 400 },
    );
  }

  const weightRaw = form.get("estimatedWeightGrams");
  const stockRaw = form.get("stock");
  const parsed = uploadModelSchema.safeParse({
    id: form.get("id"),
    title: form.get("title"),
    description: form.get("description") ?? "",
    estimatedWeightGrams:
      typeof weightRaw === "string" && weightRaw.trim() !== ""
        ? Number(weightRaw)
        : NaN,
    commercialAllowed: form.get("commercialAllowed") === "true",
    stock:
      typeof stockRaw === "string" && stockRaw.trim() !== ""
        ? Number(stockRaw)
        : NaN,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { id, title, description, estimatedWeightGrams, commercialAllowed, stock } =
    parsed.data;

  // id 唯一性检查（addModel 也会校验，这里提前给出更明确的错误）
  if (readModels().some((m) => m.id === id)) {
    return NextResponse.json({ message: "模型标识已存在" }, { status: 409 });
  }

  const fileName = `${id}${ext}`;
  const filePath = path.join(PUBLIC_MODELS_DIR, fileName);

  try {
    ensurePublicModelsDir();
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);
  } catch (error) {
    console.error("写入模型文件失败", error);
    const detail =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? `：${error.message}`
        : "";
    return NextResponse.json(
      { message: `保存文件失败，请稍后重试${detail}` },
      { status: 500 },
    );
  }

  try {
    const record = addModel({
      id,
      title,
      description,
      src: `/sample-models/${fileName}`,
      format,
      estimatedWeightGrams,
      commercialAllowed,
      stock,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    // 写元数据失败时回滚已写入的文件，避免产生孤儿文件。
    await unlink(filePath).catch(() => {});
    console.error("写入模型目录失败", error);
    const message = error instanceof Error ? error.message : "保存失败，请稍后重试";
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** 更新模型信息（名称/描述/预估重量/库存/商用状态）。id、格式、文件不可通过此接口修改。 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = updateModelSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { id, title, description, estimatedWeightGrams, commercialAllowed, stock } =
    parsed.data;

  const updated = updateModel(id, {
    title,
    description,
    estimatedWeightGrams,
    commercialAllowed,
    stock,
  });

  if (!updated) {
    return NextResponse.json({ message: "模型不存在" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

/** 删除一个模型：同时移除目录记录与磁盘文件。 */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("读取登录状态失败", error);
    return NextResponse.json({ message: "无法确认登录状态" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const parsed = deleteModelSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const removed = removeModel(parsed.data.id);
  if (!removed) {
    return NextResponse.json({ message: "模型不存在" }, { status: 404 });
  }

  // 删除磁盘文件（仅处理位于 sample-models 下的本地文件）。文件缺失不视为错误。
  if (removed.src.startsWith("/sample-models/")) {
    const fileName = path.basename(removed.src);
    const filePath = path.join(PUBLIC_MODELS_DIR, fileName);
    await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        console.error("删除模型文件失败", error);
      }
    });
  }

  return NextResponse.json({ id: removed.id });
}
