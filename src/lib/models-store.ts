import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * 模型目录的持久化存储（阶段 1）。
 *
 * 设计取舍：现有代码（下单报价、模型详情页、列表页）均以同步方式使用
 * `SAMPLE_MODELS` / `getSampleModel`，为避免大范围改造，这里用一个本地
 * JSON 文件（data/models.json）作为可读写的目录来源，并以内置的示例列表
 * 作为首次运行的种子。上传的模型文件写入 public/sample-models/。
 *
 * 注意：写文件依赖可写文件系统，适用于本地/自建服务器部署；在 Vercel 等
 * 只读/临时文件系统的无服务器环境下不会持久化，后续阶段可替换为数据库或对象存储。
 */

export interface ModelRecord {
  id: string;
  title: string;
  description: string;
  src: string;
  format: "stl" | "glb" | "gltf" | "3mf";
  /** 标准尺寸、单件的打印耗材预估重量（g）。 */
  estimatedWeightGrams: number;
  /** 仅允许已确认可商用的模型进入下单流程。 */
  commercialAllowed: boolean;
  /** 当前可用库存（件）。下单成功后会扣减，库存不足时拒绝下单。 */
  stock: number;
}

/** 允许上传的模型格式与对应扩展名。 */
export const SUPPORTED_MODEL_FORMATS = ["stl", "3mf", "glb", "gltf"] as const;
export type ModelFormat = (typeof SUPPORTED_MODEL_FORMATS)[number];

/** 上传目录（相对 public），最终对外 URL 为 /sample-models/<file>。 */
const PUBLIC_MODELS_DIR = path.join(process.cwd(), "public", "sample-models");
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "models.json");

/**
 * 首次运行的种子目录。与历史 SAMPLE_MODELS 保持一致，
 * 对应文件已存在于 public/sample-models/。
 */
const SEED_MODELS: ModelRecord[] = [
  {
    id: "godox-x5-cap",
    title: "神牛 X5 引闪器保护盖 v2",
    description: "小巧的本地 STL 示例（无内嵌材质，使用统一渲染色）。",
    src: "/sample-models/godox-x5-cap.stl",
    format: "stl",
    estimatedWeightGrams: 8,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "godox-x5-cap-3mf",
    title: "神牛 X5 引闪器保护盖（3MF）",
    description: "3MF 格式示例，验证 3MFLoader 加载与材质/法线兜底处理。",
    src: "/sample-models/godox-x5-cap.3mf",
    format: "3mf",
    estimatedWeightGrams: 8,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "mouthwash-holder-v2",
    title: "漱口水架子 v2",
    description: "轻量 STL 示例，适合快速验证加载与旋转交互。",
    src: "/sample-models/mouthwash-holder-v2.stl",
    format: "stl",
    estimatedWeightGrams: 35,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "planter-column-v1",
    title: "花盆柱 v1",
    description: "中等体量 STL 示例，验证自动居中与视野适配。",
    src: "/sample-models/planter-column-v1.stl",
    format: "stl",
    estimatedWeightGrams: 120,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "vacuum-cover-v7",
    title: "吸尘器盖 v7",
    description: "带细节结构的功能件 STL，验证法线与光照表现。",
    src: "/sample-models/vacuum-cover-v7.stl",
    format: "stl",
    estimatedWeightGrams: 55,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "canopy-ant",
    title: "Canopy Ant（头罩）",
    description: "较大的本地 STL 示例（约 3MB），验证大文件加载。",
    src: "/sample-models/canopy-ant.stl",
    format: "stl",
    estimatedWeightGrams: 180,
    commercialAllowed: true,
    stock: 100,
  },
  {
    id: "3dbenchy",
    title: "3DBenchy（打印测试船）",
    description: "经典打印测试模型（约 11MB），验证大文件与细节渲染。",
    src: "/sample-models/3dbenchy.stl",
    format: "stl",
    estimatedWeightGrams: 15,
    commercialAllowed: true,
    stock: 100,
  },
];

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** 确保上传目录存在（供上传接口在写文件前调用）。 */
export function ensurePublicModelsDir() {
  if (!existsSync(PUBLIC_MODELS_DIR)) {
    mkdirSync(PUBLIC_MODELS_DIR, { recursive: true });
  }
}

function isModelRecord(value: unknown): value is ModelRecord {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.description === "string" &&
    typeof v.src === "string" &&
    typeof v.format === "string" &&
    typeof v.estimatedWeightGrams === "number" &&
    typeof v.commercialAllowed === "boolean" &&
    typeof v.stock === "number"
  );
}

function writeStore(models: ModelRecord[]) {
  ensureDataDir();
  writeFileSync(STORE_FILE, `${JSON.stringify(models, null, 2)}\n`, "utf8");
}

/**
 * 读取全部模型。首次调用（无 JSON 文件）时以种子写入并返回。
 * 读取失败或内容非法时回退到种子，保证列表页/下单流程始终可用。
 */
export function readModels(): ModelRecord[] {
  try {
    if (!existsSync(STORE_FILE)) {
      writeStore(SEED_MODELS);
      return [...SEED_MODELS];
    }
    const raw = readFileSync(STORE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...SEED_MODELS];
    return parsed.filter(isModelRecord);
  } catch (error) {
    console.error("读取模型目录失败，回退到内置示例", error);
    return [...SEED_MODELS];
  }
}

/** 按 id 读取单个模型。 */
export function findModel(id: string): ModelRecord | undefined {
  return readModels().find((model) => model.id === id);
}

/** 新增一个模型记录（调用方负责已写入模型文件）。 */
export function addModel(record: ModelRecord): ModelRecord {
  const models = readModels();
  if (models.some((m) => m.id === record.id)) {
    throw new Error("模型标识已存在");
  }
  models.push(record);
  writeStore(models);
  return record;
}

/** 允许通过 updateModel 修改的字段：不包含 id / src / format，这些与磁盘文件绑定。 */
export type ModelUpdatableFields = Partial<
  Pick<
    ModelRecord,
    "title" | "description" | "estimatedWeightGrams" | "commercialAllowed" | "stock"
  >
>;

/**
 * 更新模型的元数据（名称、描述、预估重量、库存、商用状态）。
 * 不允许通过此方法修改 id / src / format（文件绑定字段）。
 * 模型不存在时返回 undefined。
 */
export function updateModel(
  id: string,
  patch: ModelUpdatableFields,
): ModelRecord | undefined {
  const models = readModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  const updated: ModelRecord = { ...models[index], ...patch };
  models[index] = updated;
  writeStore(models);
  return updated;
}

/**
 * 删除模型记录。返回被删除的记录（不存在则返回 undefined）。
 * 不在此处删除磁盘文件，由调用方决定，避免存储层耦合文件系统副作用。
 */
export function removeModel(id: string): ModelRecord | undefined {
  const models = readModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  const [removed] = models.splice(index, 1);
  writeStore(models);
  return removed;
}

/**
 * 扣减指定模型的库存（下单成功时调用）。
 * 库存不足或模型不存在时返回 false，不做任何修改；成功扣减返回 true。
 */
export function decrementStock(id: string, quantity: number): boolean {
  const models = readModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return false;
  const model = models[index];
  if (model.stock < quantity) return false;
  models[index] = { ...model, stock: model.stock - quantity };
  writeStore(models);
  return true;
}

/**
 * 增加指定模型的库存（用于订单创建失败时回滚已扣减的库存）。
 * 模型不存在时返回 false。
 */
export function incrementStock(id: string, quantity: number): boolean {
  const models = readModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return false;
  const model = models[index];
  models[index] = { ...model, stock: model.stock + quantity };
  writeStore(models);
  return true;
}

export { PUBLIC_MODELS_DIR };
