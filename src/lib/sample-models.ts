// 阶段 1 的本地模型目录，同时为下单报价提供服务端可信的重量和授权信息。

export interface SampleModel {
  id: string;
  title: string;
  description: string;
  src: string;
  format: "stl" | "glb" | "gltf" | "3mf";
  /** 标准尺寸、单件的打印耗材预估重量（g）。 */
  estimatedWeightGrams: number;
  /** 仅允许已确认可商用的模型进入下单流程。 */
  commercialAllowed: boolean;
}

/**
 * 本地示例模型目录。
 * 重量为切片前的粗略估算，实际打印将在订单人工确认时再次核验。
 */
export const SAMPLE_MODELS: SampleModel[] = [
  {
    id: "godox-x5-cap",
    title: "神牛 X5 引闪器保护盖 v2",
    description: "小巧的本地 STL 示例（无内嵌材质，使用统一渲染色）。",
    src: "/sample-models/godox-x5-cap.stl",
    format: "stl",
    estimatedWeightGrams: 8,
    commercialAllowed: true,
  },
  {
    id: "godox-x5-cap-3mf",
    title: "神牛 X5 引闪器保护盖（3MF）",
    description: "3MF 格式示例，验证 3MFLoader 加载与材质/法线兜底处理。",
    src: "/sample-models/godox-x5-cap.3mf",
    format: "3mf",
    estimatedWeightGrams: 8,
    commercialAllowed: true,
  },
  {
    id: "mouthwash-holder-v2",
    title: "漱口水架子 v2",
    description: "轻量 STL 示例，适合快速验证加载与旋转交互。",
    src: "/sample-models/mouthwash-holder-v2.stl",
    format: "stl",
    estimatedWeightGrams: 35,
    commercialAllowed: true,
  },
  {
    id: "planter-column-v1",
    title: "花盆柱 v1",
    description: "中等体量 STL 示例，验证自动居中与视野适配。",
    src: "/sample-models/planter-column-v1.stl",
    format: "stl",
    estimatedWeightGrams: 120,
    commercialAllowed: true,
  },
  {
    id: "vacuum-cover-v7",
    title: "吸尘器盖 v7",
    description: "带细节结构的功能件 STL，验证法线与光照表现。",
    src: "/sample-models/vacuum-cover-v7.stl",
    format: "stl",
    estimatedWeightGrams: 55,
    commercialAllowed: true,
  },
  {
    id: "canopy-ant",
    title: "Canopy Ant（头罩）",
    description: "较大的本地 STL 示例（约 3MB），验证大文件加载。",
    src: "/sample-models/canopy-ant.stl",
    format: "stl",
    estimatedWeightGrams: 180,
    commercialAllowed: true,
  },
  {
    id: "3dbenchy",
    title: "3DBenchy（打印测试船）",
    description: "经典打印测试模型（约 11MB），验证大文件与细节渲染。",
    src: "/sample-models/3dbenchy.stl",
    format: "stl",
    estimatedWeightGrams: 15,
    commercialAllowed: true,
  },
];

export function getSampleModel(id: string): SampleModel | undefined {
  return SAMPLE_MODELS.find((model) => model.id === id);
}
