import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  xAccount: text("x_account"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});

export const paths = sqliteTable("paths", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: integer("is_public", { mode: "boolean" })
    .$default(() => true)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});

export const entries = sqliteTable("entries", {
  id: text("id").primaryKey(),
  pathId: text("path_id")
    .references(() => paths.id)
    .notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  note: text("note"),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$default(() => new Date())
    .notNull(),
});
