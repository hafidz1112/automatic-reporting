import { pgTable, text, timestamp, boolean, integer, decimal, date } from "drizzle-orm/pg-core";

// --- BETTER AUTH CORE TABLES ---
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(), // Diperlukan oleh core auth, walau nanti login via username
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
    // Admin Plugin
    role: text("role").notNull().default("kasir"),
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires"),
    // Relasi ke tabel store
    storeId: text("store_id").references(() => store.id),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"), // Password hash disimpan disini
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

// --- CUSTOM TABLES UNTUK APLIKASI ---

export const store = pgTable("store", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").unique(),
    location: text("location"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyReport = pgTable("daily_report", {
    id: text("id").primaryKey(),
    storeId: text("store_id").references(() => store.id).notNull(),
    userId: text("user_id").references(() => user.id).notNull(),
    reportDate: date("report_date").notNull(),
    status: text("status").default("draft"), // draft / submitted
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesDetail = pgTable("sales_detail", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    category: text("category").notNull(), // 'groceries', 'lpg', 'pelumas'
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const fulfillmentMetric = pgTable("fulfillment_metric", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    fulfillmentPb: decimal("fulfillment_pb", { precision: 5, scale: 2 }),
    avgFulfillmentDc: decimal("avg_fulfillment_dc", { precision: 5, scale: 2 }),
});

export const oosItem = pgTable("oos_item", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    itemName: text("item_name").notNull(),
});

export const lpgStock = pgTable("lpg_stock", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    type: text("type").notNull(), // '3kg', '5.5kg', '12kg'
    quantity: integer("quantity").notNull().default(0),
});

export const shrinkage = pgTable("shrinkage", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    type: text("type").notNull(), // 'waste', 'losses'
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const otherSupport = pgTable("other_support", {
    id: text("id").primaryKey(),
    dailyReportId: text("daily_report_id").references(() => dailyReport.id).notNull(),
    note: text("note").notNull(),
});
