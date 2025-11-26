import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const countryEnum = pgEnum("country", ["burkina_faso", "mali", "niger"]);
export const cropTypeEnum = pgEnum("crop_type", [
  "pineapple",
  "cashew",
  "avocado",
  "mango",
  "banana",
  "papaya",
]);
export const cropStatusEnum = pgEnum("crop_status", [
  "planning",
  "planted",
  "growing",
  "flowering",
  "fruiting",
  "harvesting",
  "harvested",
  "dormant",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const agentTypeEnum = pgEnum("agent_type", ["marketing", "finance", "agronomist"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "worker", "viewer"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("viewer").notNull(),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 50 }),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Farms table
export const farms = pgTable("farms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  country: countryEnum("country").notNull(),
  sizeHectares: decimal("size_hectares", { precision: 10, scale: 2 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  description: text("description"),
  managerId: uuid("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Fields/Plots within farms
export const fields = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id")
    .references(() => farms.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sizeHectares: decimal("size_hectares", { precision: 10, scale: 2 }).notNull(),
  soilType: varchar("soil_type", { length: 100 }),
  irrigationType: varchar("irrigation_type", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Crops table
export const crops = pgTable("crops", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .references(() => fields.id, { onDelete: "cascade" })
    .notNull(),
  cropType: cropTypeEnum("crop_type").notNull(),
  variety: varchar("variety", { length: 100 }),
  status: cropStatusEnum("status").default("planning").notNull(),
  plantingDate: timestamp("planting_date"),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  actualHarvestDate: timestamp("actual_harvest_date"),
  numberOfPlants: integer("number_of_plants"),
  expectedYieldKg: decimal("expected_yield_kg", { precision: 10, scale: 2 }),
  actualYieldKg: decimal("actual_yield_kg", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Crop activities (watering, fertilizing, pest control, etc.)
export const cropActivities = pgTable("crop_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  cropId: uuid("crop_id")
    .references(() => crops.id, { onDelete: "cascade" })
    .notNull(),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  description: text("description"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  performedBy: uuid("performed_by").references(() => users.id),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  farmId: uuid("farm_id").references(() => farms.id),
  cropId: uuid("crop_id").references(() => crops.id),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id").references(() => farms.id),
  type: transactionTypeEnum("type").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(), // West African CFA franc
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales records
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id")
    .references(() => farms.id)
    .notNull(),
  cropType: cropTypeEnum("crop_type").notNull(),
  quantityKg: decimal("quantity_kg", { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("XOF").notNull(),
  buyerName: varchar("buyer_name", { length: 255 }),
  buyerContact: varchar("buyer_contact", { length: 255 }),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Agent conversations
export const agentConversations = pgTable("agent_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  agentType: agentTypeEnum("agent_type").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Agent messages
export const agentMessages = pgTable("agent_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => agentConversations.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blog posts (for knowledge base)
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleFr: varchar("title_fr", { length: 255 }).notNull(),
  contentEn: text("content_en").notNull(),
  contentFr: text("content_fr").notNull(),
  excerptEn: text("excerpt_en"),
  excerptFr: text("excerpt_fr"),
  cropType: cropTypeEnum("crop_type"),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: uuid("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Growing guides (detailed info per crop)
export const growingGuides = pgTable("growing_guides", {
  id: uuid("id").primaryKey().defaultRandom(),
  cropType: cropTypeEnum("crop_type").notNull().unique(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleFr: varchar("title_fr", { length: 255 }).notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  growingSchedule: jsonb("growing_schedule").notNull(), // Monthly tasks
  waterNeeds: jsonb("water_needs").notNull(),
  fertilizerSchedule: jsonb("fertilizer_schedule").notNull(),
  pestControl: jsonb("pest_control").notNull(),
  harvestingTips: jsonb("harvesting_tips").notNull(),
  sahelSpecificTips: jsonb("sahel_specific_tips").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  managedFarms: many(farms),
  tasks: many(tasks),
  conversations: many(agentConversations),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  manager: one(users, {
    fields: [farms.managerId],
    references: [users.id],
  }),
  fields: many(fields),
  tasks: many(tasks),
  transactions: many(transactions),
  sales: many(sales),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  farm: one(farms, {
    fields: [fields.farmId],
    references: [farms.id],
  }),
  crops: many(crops),
}));

export const cropsRelations = relations(crops, ({ one, many }) => ({
  field: one(fields, {
    fields: [crops.fieldId],
    references: [fields.id],
  }),
  activities: many(cropActivities),
  tasks: many(tasks),
}));

export const cropActivitiesRelations = relations(cropActivities, ({ one }) => ({
  crop: one(crops, {
    fields: [cropActivities.cropId],
    references: [crops.id],
  }),
  performer: one(users, {
    fields: [cropActivities.performedBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  farm: one(farms, {
    fields: [tasks.farmId],
    references: [farms.id],
  }),
  crop: one(crops, {
    fields: [tasks.cropId],
    references: [crops.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  farm: one(farms, {
    fields: [transactions.farmId],
    references: [farms.id],
  }),
  creator: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  farm: one(farms, {
    fields: [sales.farmId],
    references: [farms.id],
  }),
  creator: one(users, {
    fields: [sales.createdBy],
    references: [users.id],
  }),
}));

export const agentConversationsRelations = relations(agentConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [agentConversations.userId],
    references: [users.id],
  }),
  messages: many(agentMessages),
}));

export const agentMessagesRelations = relations(agentMessages, ({ one }) => ({
  conversation: one(agentConversations, {
    fields: [agentMessages.conversationId],
    references: [agentConversations.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));
