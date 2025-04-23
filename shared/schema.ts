import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define transformation options schemas
export const xmlTransformOptionsSchema = z.object({
  validateXml: z.boolean().default(false),
  preserveComments: z.boolean().default(false)
});

export const jsonLdTransformOptionsSchema = z.object({
  prettyPrint: z.boolean().default(true),
  includeContext: z.boolean().default(true)
});

export type XmlTransformOptions = z.infer<typeof xmlTransformOptionsSchema>;
export type JsonLdTransformOptions = z.infer<typeof jsonLdTransformOptionsSchema>;

// Status message schema for the UI
export const statusSchema = z.object({
  id: z.string(),
  type: z.enum(["success", "error", "warning", "processing", "info"]),
  title: z.string(),
  description: z.string(),
  timestamp: z.string()
});

export type StatusMessage = z.infer<typeof statusSchema>;

// Original schema items (keeping these for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
