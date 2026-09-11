import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit 配置：schema 位置、迁移输出目录、数据库连接。
 * 用法：
 *   npm run db:generate  生成迁移
 *   npm run db:migrate   应用迁移
 *   npm run db:push      直接同步 schema（开发用）
 */
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
