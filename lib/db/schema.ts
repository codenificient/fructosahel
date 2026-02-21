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
  "potato",
  "cowpea",
  "bambara_groundnut",
  "sorghum",
  "pearl_millet",
  "moringa",
  "sweet_potato",
  "onion",
  "rice",
  "tomato",
  "pepper",
  "okra",
  "peanut",
  "cassava",
  "pigeon_pea",
  "citrus",
  "guava",
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
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);
export const agentTypeEnum = pgEnum("agent_type", [
  "marketing",
  "finance",
  "agronomist",
]);
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "worker",
  "viewer",
]);
export const phaseStatusEnum = pgEnum("phase_status", [
  "not_started",
  "in_progress",
  "completed",
  "on_hold",
]);
export const milestoneStatusEnum = pgEnum("milestone_status", [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
]);
export const milestoneCategoryEnum = pgEnum("milestone_category", [
  "infrastructure",
  "crops",
  "livestock",
  "equipment",
  "processing",
  "financial",
  "other",
]);
export const livestockTypeEnum = pgEnum("livestock_type", [
  "chickens",
  "guinea_fowl",
  "ducks",
  "sheep",
  "pigs",
]);
export const farmZoneTypeEnum = pgEnum("farm_zone_type", [
  "zone_0_core",
  "zone_1_intensive",
  "zone_2_semi_intensive",
  "zone_3_extensive",
  "zone_4_catchment",
  "buffer",
]);
export const logisticsOrderTypeEnum = pgEnum("logistics_order_type", [
  "distribution",
  "storage",
  "processing_transport",
  "solar_installation",
  "equipment_delivery",
]);
export const logisticsStatusEnum = pgEnum("logistics_status", [
  "pending",
  "scheduled",
  "in_transit",
  "delivered",
  "stored",
  "cancelled",
]);
export const trainingStatusEnum = pgEnum("training_status", [
  "planning",
  "enrolling",
  "in_progress",
  "completed",
  "cancelled",
]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "applied",
  "enrolled",
  "in_progress",
  "completed",
  "dropped",
]);

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
  imageUrl: text("image_url"), // Optional photo of the crop
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

// Roadmap phases
export const roadmapPhases = pgTable("roadmap_phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id")
    .references(() => farms.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  phaseNumber: integer("phase_number").notNull(),
  status: phaseStatusEnum("status").default("not_started").notNull(),
  targetStartDate: timestamp("target_start_date"),
  targetEndDate: timestamp("target_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  targetHectares: decimal("target_hectares", { precision: 10, scale: 2 }),
  targetRevenueUsd: decimal("target_revenue_usd", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Milestones within phases
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  phaseId: uuid("phase_id")
    .references(() => roadmapPhases.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: milestoneCategoryEnum("category").default("other").notNull(),
  status: milestoneStatusEnum("status").default("not_started").notNull(),
  targetDate: timestamp("target_date"),
  completedDate: timestamp("completed_date"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Livestock
export const livestock = pgTable("livestock", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id")
    .references(() => farms.id, { onDelete: "cascade" })
    .notNull(),
  livestockType: livestockTypeEnum("livestock_type").notNull(),
  breed: varchar("breed", { length: 100 }),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Farm zones
export const farmZones = pgTable("farm_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id")
    .references(() => farms.id, { onDelete: "cascade" })
    .notNull(),
  zoneType: farmZoneTypeEnum("zone_type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sizeHectares: decimal("size_hectares", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Logistics orders (Sahel Energies Incorporated)
export const logisticsOrders = pgTable("logistics_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id").references(() => farms.id, { onDelete: "cascade" }),
  orderType: logisticsOrderTypeEnum("order_type").notNull(),
  status: logisticsStatusEnum("status").default("pending").notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  cargoDescription: text("cargo_description"),
  weightKg: decimal("weight_kg", { precision: 10, scale: 2 }),
  vehicleInfo: varchar("vehicle_info", { length: 255 }),
  estimatedCostUsd: decimal("estimated_cost_usd", { precision: 12, scale: 2 }),
  actualCostUsd: decimal("actual_cost_usd", { precision: 12, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Training programs (Youth farmer training)
export const trainingPrograms = pgTable("training_programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmId: uuid("farm_id").references(() => farms.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: trainingStatusEnum("status").default("planning").notNull(),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxParticipants: integer("max_participants"),
  curriculumAreas: jsonb("curriculum_areas"), // string[] of focus areas
  durationWeeks: integer("duration_weeks"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Training enrollments
export const trainingEnrollments = pgTable("training_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .references(() => trainingPrograms.id, { onDelete: "cascade" })
    .notNull(),
  participantName: varchar("participant_name", { length: 255 }).notNull(),
  participantAge: integer("participant_age"),
  participantPhone: varchar("participant_phone", { length: 50 }),
  homeVillage: varchar("home_village", { length: 255 }),
  status: enrollmentStatusEnum("status").default("applied").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
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
  roadmapPhases: many(roadmapPhases),
  livestock: many(livestock),
  farmZones: many(farmZones),
  logisticsOrders: many(logisticsOrders),
  trainingPrograms: many(trainingPrograms),
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

export const agentConversationsRelations = relations(
  agentConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [agentConversations.userId],
      references: [users.id],
    }),
    messages: many(agentMessages),
  }),
);

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

export const roadmapPhasesRelations = relations(
  roadmapPhases,
  ({ one, many }) => ({
    farm: one(farms, {
      fields: [roadmapPhases.farmId],
      references: [farms.id],
    }),
    milestones: many(milestones),
  }),
);

export const milestonesRelations = relations(milestones, ({ one }) => ({
  phase: one(roadmapPhases, {
    fields: [milestones.phaseId],
    references: [roadmapPhases.id],
  }),
}));

export const livestockRelations = relations(livestock, ({ one }) => ({
  farm: one(farms, {
    fields: [livestock.farmId],
    references: [farms.id],
  }),
}));

export const farmZonesRelations = relations(farmZones, ({ one }) => ({
  farm: one(farms, {
    fields: [farmZones.farmId],
    references: [farms.id],
  }),
}));

export const logisticsOrdersRelations = relations(
  logisticsOrders,
  ({ one }) => ({
    farm: one(farms, {
      fields: [logisticsOrders.farmId],
      references: [farms.id],
    }),
  }),
);

export const trainingProgramsRelations = relations(
  trainingPrograms,
  ({ one, many }) => ({
    farm: one(farms, {
      fields: [trainingPrograms.farmId],
      references: [farms.id],
    }),
    enrollments: many(trainingEnrollments),
  }),
);

export const trainingEnrollmentsRelations = relations(
  trainingEnrollments,
  ({ one }) => ({
    program: one(trainingPrograms, {
      fields: [trainingEnrollments.programId],
      references: [trainingPrograms.id],
    }),
  }),
);

// Push notification subscriptions
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  enabled: boolean("enabled").default(true).notNull(),
  taskReminders: boolean("task_reminders").default(true).notNull(),
  urgentAlerts: boolean("urgent_alerts").default(true).notNull(),
  dailyDigest: boolean("daily_digest").default(false).notNull(),
  newTaskAssigned: boolean("new_task_assigned").default(true).notNull(),
  taskOverdue: boolean("task_overdue").default(true).notNull(),
  reminderHoursBefore: integer("reminder_hours_before").default(24).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Push subscriptions relations
export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

// Notification preferences relations
export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
);
