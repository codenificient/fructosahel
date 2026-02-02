/**
 * Offline Hook
 * Provides offline status detection and management
 */

import { useCallback, useEffect, useState } from "react";
import {
  getQueuedMutationsCount,
  type SyncResult,
  syncMutations,
} from "@/lib/utils/offline-storage";

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  pendingMutations: number;
  lastOnlineAt: Date | null;
  lastSyncAt: Date | null;
}

export interface UseOfflineReturn extends OfflineStatus {
  sync: () => Promise<SyncResult>;
  isSyncing: boolean;
  refreshPendingCount: () => Promise<void>;
}

/**
 * Hook to track online/offline status
 */
export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [pendingMutations, setPendingMutations] = useState(0);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update pending mutations count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getQueuedMutationsCount();
      setPendingMutations(count);
    } catch (error) {
      console.error(
        "[useOffline] Failed to get pending mutations count:",
        error,
      );
    }
  }, []);

  // Sync pending mutations
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline || isSyncing) {
      return { success: false, synced: 0, failed: 0, conflicts: 0 };
    }

    setIsSyncing(true);

    try {
      const result = await syncMutations();
      setLastSyncAt(new Date());
      await refreshPendingCount();
      return result;
    } catch (error) {
      console.error("[useOffline] Sync failed:", error);
      return { success: false, synced: 0, failed: 0, conflicts: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  // Handle online event
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());

      // Auto-sync when coming back online
      if (wasOffline) {
        sync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Set initial state
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setLastOnlineAt(new Date());
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, sync]);

  // Initial pending count fetch
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Listen for service worker sync messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === "MUTATION_SYNCED" ||
        event.data.type === "MUTATION_CONFLICT"
      ) {
        refreshPendingCount();
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    }
  }, [refreshPendingCount]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingMutations > 0) {
        sync();
      }
    }, 30000); // Try to sync every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, pendingMutations, sync]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    pendingMutations,
    lastOnlineAt,
    lastSyncAt,
    sync,
    isSyncing,
    refreshPendingCount,
  };
}

/**
 * Simple hook to check if the app is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
