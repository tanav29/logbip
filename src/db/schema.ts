import { pgTable, text, timestamp, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  xAccount: text("x_account"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at")
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$default(() => new Date())
    .notNull(),
});

export const paths = pgTable("paths", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  banner: text("banner"),
  isPublic: boolean("is_public")
    .$default(() => true)
    .notNull(),
  createdAt: timestamp("created_at")
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$default(() => new Date())
    .notNull(),
});

export const entries = pgTable(
  "entries",
  {
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
    createdAt: timestamp("created_at")
      .$default(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$default(() => new Date())
      .notNull(),
  },
  (table) => ({
    pathDateUnique: uniqueIndex("entries_path_date_unique").on(table.pathId, table.date),
    pathDateIndex: index("entries_path_date_idx").on(table.pathId, table.date),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at")
      .$default(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIndex: index("sessions_user_idx").on(table.userId),
  }),
);

export const feedback = pgTable(
  "feedback",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at")
      .$default(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIndex: index("feedback_user_idx").on(table.userId),
  }),
);
