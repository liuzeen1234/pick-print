// 阶段 1 临时示例数据：用于验证 3D 预览效果。
// 阶段 2 会替换为真正的模型数据源（静态 JSON / 数据库）。

export interface SampleModel {
  id: string;
  title: string;
  description: string;
  src: string;
  format: "stl" | "glb" | "gltf";
}

export const SAMPLE_MODELS: SampleModel[] = [
  {
    id: "godox-x5-cap",
    title: "神牛 X5 引闪器保护盖 v2",
    description: "小巧的本地 STL 示例（无内嵌材质，使用统一渲染色）。",
    src: "/sample-models/godox-x5-cap.stl",
    format: "stl",
  },
  {
    id: "mouthwash-holder-v2",
    title: "漱口水架子 v2",
    description: "轻量 STL 示例，适合快速验证加载与旋转交互。",
    src: "/sample-models/mouthwash-holder-v2.stl",
    format: "stl",
  },
  {
    id: "planter-column-v1",
    title: "花盆柱 v1",
    description: "中等体量 STL 示例，验证自动居中与视野适配。",
    src: "/sample-models/planter-column-v1.stl",
    format: "stl",
  },
  {
    id: "vacuum-cover-v7",
    title: "吸尘器盖 v7",
    description: "带细节结构的功能件 STL，验证法线与光照表现。",
    src: "/sample-models/vacuum-cover-v7.stl",
    format: "stl",
  },
  {
    id: "canopy-ant",
    title: "Canopy Ant（头罩）",
    description: "较大的本地 STL 示例（约 3MB），验证大文件加载。",
    src: "/sample-models/canopy-ant.stl",
    format: "stl",
  },
  {
    id: "3dbenchy",
    title: "3DBenchy（打印测试船）",
    description: "经典打印测试模型（约 11MB），验证大文件与细节渲染。",
    src: "/sample-models/3dbenchy.stl",
    format: "stl",
  },
];

export function getSampleModel(id: string): SampleModel | undefined {
  return SAMPLE_MODELS.find((m) => m.id === id);
}
