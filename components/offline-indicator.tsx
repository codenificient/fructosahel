"use client";

import {
  AlertTriangle,
  Check,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOffline } from "@/lib/hooks/use-offline";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({
  className,
  showDetails = true,
}: OfflineIndicatorProps) {
  const { isOnline, isOffline, wasOffline, pendingMutations, isSyncing, sync } =
    useOffline();

  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track mount state for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show "reconnected" message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Don't render anything during SSR
  if (!mounted) {
    return null;
  }

  // Online with no pending changes - minimal indicator
  if (isOnline && pendingMutations === 0 && !showReconnected) {
    if (!showDetails) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1.5", className)}>
              <Wifi className="h-4 w-4 text-green-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Online</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Just reconnected
  if (showReconnected) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400",
          className,
        )}
      >
        <Check className="h-4 w-4" />
        <span>Back online</span>
        {pendingMutations > 0 && (
          <span className="text-xs">
            - Syncing {pendingMutations} change
            {pendingMutations !== 1 ? "s" : ""}...
          </span>
        )}
      </div>
    );
  }

  // Offline
  if (isOffline) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          className,
        )}
      >
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
        {pendingMutations > 0 && (
          <span className="ml-1 flex items-center gap-1">
            <CloudOff className="h-3.5 w-3.5" />
            {pendingMutations} pending
          </span>
        )}
      </div>
    );
  }

  // Online with pending mutations
  if (pendingMutations > 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          className,
        )}
      >
        {isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            <span>{pendingMutations} pending</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-6 px-2 text-xs"
              onClick={() => sync()}
            >
              Sync now
            </Button>
          </>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Offline banner component for showing at the top of the page
 */
export function OfflineBanner() {
  const { isOffline, pendingMutations } = useOffline();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white shadow-md">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>
          You are currently offline.
          {pendingMutations > 0 && (
            <>
              {" "}
              {pendingMutations} change{pendingMutations !== 1 ? "s" : ""} will
              sync when you reconnect.
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact offline status badge for headers
 */
export function OfflineStatusBadge({ className }: { className?: string }) {
  const { isOffline, pendingMutations, isSyncing } = useOffline();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isOffline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30",
                className,
              )}
            >
              <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Offline - {pendingMutations} pending changes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isSyncing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30",
                className,
              )}
            >
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Syncing changes...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (pendingMutations > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30",
                className,
              )}
            >
              <CloudOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {pendingMutations > 9 ? "9+" : pendingMutations}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pendingMutations} pending changes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}
