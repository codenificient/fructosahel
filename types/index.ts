import type {
  users,
  farms,
  fields,
  crops,
  tasks,
  transactions,
  sales,
  agentConversations,
  agentMessages,
  blogPosts,
  growingGuides,
} from "@/lib/db/schema";

// Infer types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;

export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;

export type Crop = typeof crops.$inferSelect;
export type NewCrop = typeof crops.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type AgentConversation = typeof agentConversations.$inferSelect;
export type NewAgentConversation = typeof agentConversations.$inferInsert;

export type AgentMessage = typeof agentMessages.$inferSelect;
export type NewAgentMessage = typeof agentMessages.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type GrowingGuide = typeof growingGuides.$inferSelect;
export type NewGrowingGuide = typeof growingGuides.$inferInsert;

// Enum types
export type Country = "burkina_faso" | "mali" | "niger";
export type CropType = "pineapple" | "cashew" | "avocado" | "mango" | "banana" | "papaya";
export type CropStatus =
  | "planning"
  | "planted"
  | "growing"
  | "flowering"
  | "fruiting"
  | "harvesting"
  | "harvested"
  | "dormant";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TransactionType = "income" | "expense";
export type AgentType = "marketing" | "finance" | "agronomist";
export type UserRole = "admin" | "manager" | "worker" | "viewer";

// Growing schedule types
export interface MonthlyTask {
  month: number;
  tasks: string[];
}

export interface WaterNeeds {
  frequencyPerWeek: number;
  litersPerPlant: number;
  rainySeasonAdjustment: string;
  drySeasonAdjustment: string;
}

export interface FertilizerSchedule {
  type: string;
  frequency: string;
  applicationMethod: string;
  npkRatio: string;
}

export interface PestControl {
  commonPests: string[];
  organicSolutions: string[];
  preventiveMeasures: string[];
}

export interface HarvestingTips {
  signsOfMaturity: string[];
  bestTimeToHarvest: string;
  postHarvestHandling: string[];
}

export interface SahelSpecificTips {
  heatManagement: string[];
  waterConservation: string[];
  soilPreparation: string[];
  localVarietiesRecommended: string[];
}

// Dashboard statistics
export interface DashboardStats {
  totalFarms: number;
  totalHectares: number;
  activeCrops: number;
  pendingTasks: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

// Chart data types
export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CropDistribution {
  cropType: CropType;
  count: number;
  percentage: number;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Agent chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AgentConfig {
  type: AgentType;
  systemPrompt: string;
  name: string;
  description: string;
  icon: string;
}
