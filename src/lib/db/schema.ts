import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 用户表。
 * - username：账号名，登录凭证，唯一。
 * - phone：手机号，注册必填，唯一（用于联系；下单默认联系方式）。
 * - passwordHash：bcrypt 哈希，禁止明文存储。
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
