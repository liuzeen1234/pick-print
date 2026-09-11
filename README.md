# PickPrint（选模打印）

> 挑一个模型，下单，我们帮你打印出来。

面向国内用户的 3D 打印定制下单平台。用户从模型库中挑选模型，在线 3D 预览，选材质/颜色/尺寸后下单，由运营方远程完成打印并交付。

详细产品规划与决策记录见 [PLAN.md](./PLAN.md)。

## 技术栈

- **框架**：Next.js 15（App Router）+ React 19
- **语言**：TypeScript 5.7
- **样式**：Tailwind CSS 3.4
- **3D 预览**：three.js + @react-three/fiber + @react-three/drei（支持 STL / GLB / GLTF / 3MF）
- **校验**：zod
- **认证**：Auth.js v5（Credentials Provider，账号名 + 密码），bcrypt 哈希
- **数据库**：Postgres（Vercel Postgres / Neon）+ Drizzle ORM
- **测试**：Vitest + Testing Library

## 本地开发

```bash
npm install
cp .env.example .env.local   # 填入 DATABASE_URL、AUTH_SECRET
npx auth secret              # 可用于生成 AUTH_SECRET
npm run db:migrate           # 建表（需先配好 DATABASE_URL）
npm run dev                  # 启动开发服务器 http://localhost:3000
```

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | Postgres 连接串（Vercel Postgres / Neon） |
| `AUTH_SECRET` | Auth.js 会话加密密钥（`npx auth secret` 生成） |
| `NEXT_PUBLIC_SITE_URL` | 站点基础地址 |

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 运行生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test` | 运行测试（单次） |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run db:generate` | 根据 schema 生成迁移 |
| `npm run db:migrate` | 应用迁移到数据库 |
| `npm run db:push` | 直接同步 schema（开发用） |

## 账号系统

Auth.js v5 + Credentials Provider，账号名 + 密码登录，密码经 bcrypt 哈希存储。

- 注册：`/register`（账号名 + 手机号 + 密码，账号名与手机号均唯一）
- 登录：`/login`（账号名 + 密码）
- 我的订单：`/orders`（需登录，未登录跳转登录页）

用户表定义在 `src/lib/db/schema.ts`，迁移文件在 `drizzle/`。

### 本地数据库（Docker）

本地开发用 `scripts/db-local.sh` 管理一个带持久化卷的 Postgres：

```bash
bash scripts/db-local.sh up      # 启动（数据持久化到命名卷 pickprint-pgdata）
npm run db:migrate               # 首次使用建表
bash scripts/db-local.sh psql    # 进入 psql
bash scripts/db-local.sh down    # 停止（数据保留）
bash scripts/db-local.sh reset   # 删除容器和数据卷（清空数据，慎用）
```

数据存在命名卷里，容器停止或电脑重启都不会丢。之后切换到 Neon / Vercel
Postgres 时，只需替换 `.env.local` 里的 `DATABASE_URL` 再跑一次 `npm run db:migrate`。

## 目录结构

```
src/
├── app/                    # 路由与页面（App Router）
│   ├── page.tsx            # 首页
│   └── models/             # 模型列表与详情
├── components/
│   ├── ui/                 # 通用 UI 组件
│   └── model/              # 3D 预览相关组件
├── lib/                    # apiFetch、env、示例数据、工具函数
└── types/                  # 全局共享类型
```

## 3D 预览

`ModelViewer` 组件按文件扩展名自动分发加载器，支持 STL / GLB / GLTF / 3MF。
交互：左键旋转、滚轮缩放、右键平移，自动居中并适配视野。

> 目前 `src/lib/sample-models.ts` 为阶段 1 的临时示例数据，阶段 2 会替换为真正的模型数据源。

## 合规提示

模型来源需逐个核对授权协议，仅收录允许商用的模型。详见 PLAN.md 第 7 节。
