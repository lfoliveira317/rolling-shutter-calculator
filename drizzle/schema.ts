import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product pricing configuration table
 * Stores price per square meter for each product type
 */
export const productPrices = mysqlTable("product_prices", {
  id: int("id").autoincrement().primaryKey(),
  productType: varchar("product_type", { length: 50 }).notNull().unique(),
  pricePerSqm: decimal("price_per_sqm", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProductPrice = typeof productPrices.$inferSelect;
export type InsertProductPrice = typeof productPrices.$inferInsert;

/**
 * Quotations table
 * Stores all generated quotations with customer and pricing details
 */
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),
  
  // Customer information
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerAddress: text("customer_address"),
  
  // Product details
  productType: varchar("product_type", { length: 50 }).notNull(),
  width: decimal("width", { precision: 10, scale: 2 }).notNull(), // in cm
  height: decimal("height", { precision: 10, scale: 2 }).notNull(), // in cm
  quantity: int("quantity").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(), // in m²
  
  // Pricing
  pricePerSqm: decimal("price_per_sqm", { precision: 10, scale: 2 }).notNull(),
  netPrice: decimal("net_price", { precision: 10, scale: 2 }).notNull(),
  vatPercentage: decimal("vat_percentage", { precision: 5, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  grossPrice: decimal("gross_price", { precision: 10, scale: 2 }).notNull(),
  
  // Discounts
  discountType: mysqlEnum("discount_type", ["none", "percentage", "fixed"]).default("none").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  
  // Additional costs (stored as JSON array)
  additionalCosts: json("additional_costs").$type<Array<{ name: string; amount: number }>>(),
  additionalCostsTotal: decimal("additional_costs_total", { precision: 10, scale: 2 }).default("0").notNull(),
  
  // Final total
  finalTotal: decimal("final_total", { precision: 10, scale: 2 }).notNull(),
  
  // Metadata
  notes: text("notes"),
  createdBy: int("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;
