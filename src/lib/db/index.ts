import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Drizzle + postgres-js 客户端。
 *
 * 连接串从 DATABASE_URL 读取（Vercel Postgres / Neon 均兼容）。
 * 用全局单例缓存，避免开发环境热重载重复建连接。
 *
 * 延迟初始化：只有真正访问 db 时才建连接，避免在构建阶段
 * （无 DATABASE_URL）因模块加载即抛错导致 build 失败。
 */
const globalForDb = globalThis as unknown as {
  __pickprintDb?: PostgresJsDatabase<typeof schema>;
};

function createDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("缺少必需的环境变量：DATABASE_URL");
  }
  // Neon/Vercel Postgres 走连接池时建议 prepare: false
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

function getDb(): PostgresJsDatabase<typeof schema> {
  if (!globalForDb.__pickprintDb) {
    globalForDb.__pickprintDb = createDb();
  }
  return globalForDb.__pickprintDb;
}

// 通过 Proxy 惰性转发，保持 `db.select()...` 的调用体验不变。
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
