# PickPrint — 项目计划文档

> 3D 打印定制下单平台。用户在网页上从模型库中挑选喜欢的模型，提交打印订单，由运营方远程完成打印并交付。

- **产品名（暂定）**：PickPrint（选模打印）
- **仓库名**：pick-print
- **一句话定位**：挑一个模型，下单，我们帮你打印出来。

---

## 1. 产品目标

| 项 | 说明 |
| --- | --- |
| 核心场景 | 用户浏览模型库 → 3D 预览 → 选材质/颜色/尺寸 → 下单 → 运营方远程打印并发货 |
| 目标用户 | 想要 3D 打印成品但没有打印机、不懂建模的普通消费者 |
| 模型来源 | 拓竹社区 MakerWorld（需逐个确认授权，见第 7 节合规） |
| MVP 范围 | 模型浏览 + 3D 预览 + 下单表单 + 订单查询。**先不做**在线支付、用户上传自定义模型 |

---

## 2. 技术栈（基于现有项目）

现有基座已具备，直接沿用：

- **框架**：Next.js 15（App Router）+ React 19
- **语言**：TypeScript 5.7
- **样式**：Tailwind CSS 3.4
- **测试**：Vitest + Testing Library
- **工具**：`src/lib/api.ts` 的 `apiFetch` 封装、`clsx` + `tailwind-merge`

需要新增的依赖：

| 用途 | 依赖 | 说明 |
| --- | --- | --- |
| 3D 预览 | `three`、`@react-three/fiber`、`@react-three/drei` | 渲染 STL/GLB/3MF 模型 |
| 数据校验 | `zod` | 表单与 API 输入校验 |
| 数据库 ORM | `drizzle-orm` + `drizzle-kit` | 模型、订单持久化（可选，MVP 初期可用静态 JSON） |
| 状态管理 | `zustand`（可选） | 购物车/选型状态 |

---

## 3. 参考项目

| 项目 | 用途 | 链接 |
| --- | --- | --- |
| erenokur/next-threejs-web-store | 「3D 预览 + 购买」流程最贴合，技术栈相同 | https://github.com/erenokur/next-threejs-web-store |
| squancy/zaccord | 同类 3D 打印下单电商，参考业务逻辑 | https://github.com/squancy/zaccord |
| MarcosCamara01/ecommerce-template | 订单/数据库/认证设计参考，栈一致 | https://github.com/MarcosCamara01/ecommerce-template |
| ekankr2/threejs-STL-example | STL 文件加载示例 | https://github.com/ekankr2/threejs-STL-example |
| vercel/commerce | 电商结构最佳实践参考 | https://github.com/vercel/commerce |

> 策略：**不整体 fork**，在现有基座上扩展，从上述项目中借鉴具体实现。

---

## 4. 目录结构规划

```
src/
├── app/
│   ├── page.tsx                # 首页（模型精选 + 引导）
│   ├── models/
│   │   ├── page.tsx            # 模型列表页（筛选、分页）
│   │   └── [id]/page.tsx       # 模型详情页（3D 预览 + 选型 + 下单入口）
│   ├── order/
│   │   ├── page.tsx            # 下单表单（材质/颜色/尺寸/收货信息）
│   │   └── [id]/page.tsx       # 订单详情/状态查询
│   └── api/
│       ├── models/route.ts     # 模型列表/详情接口
│       └── orders/route.ts     # 创建订单/查询订单
├── components/
│   ├── ui/                     # 已有：button、container 等
│   ├── model/
│   │   ├── ModelViewer.tsx     # three.js 3D 预览组件
│   │   ├── ModelCard.tsx       # 列表卡片
│   │   └── ModelFilters.tsx    # 筛选器
│   └── order/
│       ├── OrderForm.tsx       # 下单表单
│       └── OptionSelector.tsx  # 材质/颜色/尺寸选择
├── lib/
│   ├── api.ts                  # 已有：apiFetch
│   ├── env.ts                  # 已有：环境变量
│   ├── pricing.ts              # 打印报价计算
│   └── db/                     # drizzle schema 与 client（如启用数据库）
└── types/
    └── index.ts                # 已有，扩展 Model / Order 类型
```

---

## 5. 数据模型（初版）

```ts
// 模型
interface Model {
  id: string;
  title: string;
  source: "makerworld";
  sourceUrl: string;        // 原始社区链接
  license: string;          // 授权协议，用于合规判断
  commercialAllowed: boolean; // 是否允许商用
  thumbnail: string;
  fileUrl: string;          // 预览用模型文件（STL/GLB/3MF）
  tags: string[];
}

// 订单
interface Order {
  id: string;
  modelId: string;
  options: {
    material: string;       // PLA / PETG / ...
    color: string;
    scale: number;          // 缩放比例
  };
  quantity: number;
  price: number;
  contact: { name: string; phone: string; address: string };
  status: "pending" | "printing" | "shipped" | "done" | "cancelled";
  createdAt: string;
}
```

---

## 6. 里程碑与任务拆解

### 阶段 0：命名与初始化（0.5 天）
- [ ] 确定产品名，更新 `package.json` name、首页标题、README
- [ ] 安装 3D 与校验依赖

### 阶段 1：3D 预览能力（1–2 天）
- [ ] 封装 `ModelViewer` 组件（加载 STL/GLB，支持旋转/缩放/平移）
- [ ] 在详情页跑通一个示例模型的预览

### 阶段 2：模型库（2–3 天）
- [ ] 定义 `Model` 类型与数据源（MVP 用静态 JSON，后续接数据库）
- [ ] 模型列表页 + 卡片 + 筛选器
- [ ] 模型详情页（预览 + 基本信息 + 授权提示）

### 阶段 3：下单流程（2–3 天）
- [ ] 选型组件（材质/颜色/尺寸/数量）
- [ ] 报价计算 `pricing.ts`
- [ ] 下单表单 + zod 校验
- [ ] `POST /api/orders` 创建订单，订单查询页

### 阶段 4：后台与运营（视情况）
- [ ] 简易订单管理（查看/更新状态）
- [ ] 数据库接入（Drizzle）

### 阶段 5：上线（1 天）
- [ ] 部署到 Vercel
- [ ] 环境变量、域名配置

---

## 7. 合规与风险（重要）

| 风险 | 说明 | 应对 |
| --- | --- | --- |
| **模型授权** | MakerWorld 模型多为 CC 协议，部分明确禁止商用 | 逐个核对 `license`，仅收录允许商用的模型；`commercialAllowed` 字段做拦截 |
| 品牌关联 | 避免使用「拓竹 / Bambu」字样宣传 | 命名与文案不碰对方商标 |
| 报价准确性 | 打印耗时/耗材难精确预估 | 初期用「体积 × 材料单价 + 基础费」的粗略模型，人工二次确认 |
| 支付合规 | 涉及收款 | MVP 先走线下/人工确认，正式收款再接第三方支付 |

---

## 8. 待用户确认的决策点

1. 面向国内还是海外用户？（影响支付、物流、语言）
2. MVP 是否需要在线支付，还是先人工确认收款？
3. 模型库初期规模（几十个精选 vs 大量导入）？
4. 是否需要用户账号系统，还是匿名下单 + 手机号查询即可？
5. 最终产品名确认（PickPrint / PrintOrder / 其他）。

---

_本文档为初版计划，随实现进展持续更新。_
