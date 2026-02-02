// Base hooks
export { useFetch } from "./use-fetch";
export type { FetchState } from "./use-fetch";

export { useMutation } from "./use-mutation";
export type { MutationState, MutationOptions } from "./use-mutation";

// Offline hooks
export { useOffline, useOnlineStatus } from "./use-offline";
export type { OfflineStatus, UseOfflineReturn } from "./use-offline";

// Optimistic mutation hooks
export {
  useOptimisticMutation,
  generateTempId,
  isTempId,
} from "./use-optimistic-mutation";
export type {
  OptimisticConfig,
  OptimisticMutationOptions,
  OptimisticMutationState,
  ToastHandlers,
} from "./use-optimistic-mutation";

// Data store hooks
export {
  useDataStore,
  useDataStoreAccess,
  clearStore,
  clearAllStores,
} from "./use-data-store";
export type { DataStoreState } from "./use-data-store";

// Farm hooks
export {
  useFarms,
  useFarmsOptimistic,
  useFarm,
  useCreateFarm,
  useCreateFarmOptimistic,
  useUpdateFarm,
  useUpdateFarmOptimistic,
  useDeleteFarm,
  useDeleteFarmOptimistic,
} from "./use-farms";
export type { OptimisticOptions as FarmOptimisticOptions } from "./use-farms";

// Field hooks
export {
  useFields,
  useFieldsOptimistic,
  useField,
  useCreateField,
  useCreateFieldOptimistic,
  useUpdateField,
  useUpdateFieldOptimistic,
  useDeleteField,
  useDeleteFieldOptimistic,
} from "./use-fields";
export type { FieldOptimisticOptions } from "./use-fields";

// Crop hooks
export {
  useCrops,
  useCropsOptimistic,
  useCrop,
  useCreateCrop,
  useCreateCropOptimistic,
  useUpdateCrop,
  useUpdateCropOptimistic,
  useDeleteCrop,
  useDeleteCropOptimistic,
} from "./use-crops";
export type { CropFilters, CropOptimisticOptions } from "./use-crops";

// Task hooks
export {
  useTasks,
  useTasksOptimistic,
  useTask,
  useCreateTask,
  useCreateTaskOptimistic,
  useUpdateTask,
  useUpdateTaskOptimistic,
  useDeleteTask,
  useDeleteTaskOptimistic,
} from "./use-tasks";
export type { TaskFilters, TaskOptimisticOptions } from "./use-tasks";

// Transaction hooks
export {
  useTransactions,
  useTransactionsOptimistic,
  useTransaction,
  useCreateTransaction,
  useCreateTransactionOptimistic,
  useUpdateTransaction,
  useUpdateTransactionOptimistic,
  useDeleteTransaction,
  useDeleteTransactionOptimistic,
} from "./use-transactions";
export type {
  TransactionFilters,
  TransactionResponse,
  TransactionOptimisticOptions,
} from "./use-transactions";

// Sale hooks
export {
  useSales,
  useSalesOptimistic,
  useCreateSale,
  useCreateSaleOptimistic,
  useUpdateSaleOptimistic,
  useDeleteSaleOptimistic,
} from "./use-sales";
export type {
  SaleFilters,
  CreateSaleInput,
  SaleOptimisticOptions,
} from "./use-sales";

// User hooks
export {
  useUsers,
  useUsersOptimistic,
  useUser,
  useCreateUser,
  useCreateUserOptimistic,
  useUpdateUser,
  useUpdateUserOptimistic,
  useDeleteUser,
  useDeleteUserOptimistic,
} from "./use-users";
export type { UserOptimisticOptions } from "./use-users";

// Toast hooks
export { useToast } from "./use-toast";
export type { ToastData, ToastOptions } from "./use-toast";

// Conversation hooks
export {
  useConversations,
  useConversation,
  useCreateConversation,
  useDeleteConversation,
  useAddMessage,
  useUpdateConversationTitle,
} from "./use-conversations";
export type {
  ConversationListItem,
  ConversationWithMessages,
} from "./use-conversations";

// File upload hooks
export { useFileUpload } from "./use-file-upload";
export type {
  UseFileUploadOptions,
  UseFileUploadReturn,
} from "./use-file-upload";

// Report hooks
export {
  useReports,
  useFinancialReport,
  useCropReport,
  useTaskReport,
  useProductivityReport,
} from "./use-reports";
export type {
  ReportType,
  PeriodType,
  ReportFilters,
  FinancialSummary,
  FinancialReportData,
  CropPerformance,
  CropReportData,
  TaskReportData,
  FarmProductivity,
  ProductivityReportData,
  AllReportsData,
} from "./use-reports";

// Notification hooks
export { useNotifications } from "./use-notifications";

// Sentry hooks
export { useSentryUser } from "./use-sentry-user";
