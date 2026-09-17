import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 用户表。
 * - username：账号名，登录凭证，唯一。
 * - phone：手机号，注册必填，唯一（用于联系；下单默认联系方式）。
 * - passwordHash：bcrypt 哈希，禁止明文存储。
 * - opLevel：操作权限等级。普通用户创建时为 1，管理员为 4；可在后台调整。
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  opLevel: integer("op_level").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** 管理员 op 等级，拥有后台调整他人 op 等级的权限。 */
export const ADMIN_OP_LEVEL = 4;

/**
 * 订单表。订单金额、重量和模型标题均为下单时的快照，避免后续目录调整影响历史记录。
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    modelId: text("model_id").notNull(),
    modelTitle: text("model_title").notNull(),
    material: text("material").notNull(),
    color: text("color").notNull(),
    quantity: integer("quantity").notNull(),
    estimatedWeightGrams: integer("estimated_weight_grams").notNull(),
    priceCents: integer("price_cents").notNull(),
    contactName: text("contact_name").notNull(),
    contactPhone: text("contact_phone").notNull(),
    contactAddress: text("contact_address").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("orders_user_created_at_idx").on(table.userId, table.createdAt)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
