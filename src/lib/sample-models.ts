// 模型目录的读取接口（保持同步用法，供下单报价、列表页、详情页复用）。
// 数据来源为可读写的本地 JSON 存储（见 models-store.ts），首次运行以内置示例种子。

import { readModels, findModel, type ModelRecord } from "./models-store";

/** 对外类型别名，保持历史命名以兼容既有引用。 */
export type SampleModel = ModelRecord;

/** 读取当前全部模型（每次调用返回最新持久化数据）。 */
export function getAllModels(): SampleModel[] {
  return readModels();
}

export function getSampleModel(id: string): SampleModel | undefined {
  return findModel(id);
}
