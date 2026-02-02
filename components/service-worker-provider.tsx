"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ServiceWorkerContextValue {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  skipWaiting: () => void;
  unregister: () => Promise<boolean>;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextValue>({
  isSupported: false,
  isRegistered: false,
  registration: null,
  updateAvailable: false,
  skipWaiting: () => {},
  unregister: async () => false,
});

export function useServiceWorker() {
  return useContext(ServiceWorkerContext);
}

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({
  children,
}: ServiceWorkerProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "serviceWorker" in navigator;
    setIsSupported(supported);

    if (!supported) {
      console.log("[SW Provider] Service workers not supported");
      return;
    }

    // Register the service worker
    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setIsRegistered(true);
        console.log("[SW Provider] Service worker registered:", reg.scope);

        // Check for updates on registration
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          console.log("[SW Provider] Update found");

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available
                setUpdateAvailable(true);
                setWaitingWorker(newWorker);
                console.log("[SW Provider] New content available");
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (reg.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(reg.waiting);
        }
      } catch (error) {
        console.error(
          "[SW Provider] Service worker registration failed:",
          error,
        );
      }
    };

    // Only register in production or when specifically enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SW === "true"
    ) {
      registerServiceWorker();
    } else {
      console.log(
        "[SW Provider] Service worker registration skipped in development",
      );
    }

    // Listen for controller change
    const handleControllerChange = () => {
      console.log("[SW Provider] Controller changed, reloading...");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  // Skip waiting and activate the new service worker
  const skipWaiting = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
    }
  }, [waitingWorker]);

  // Unregister the service worker
  const unregister = useCallback(async (): Promise<boolean> => {
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        setIsRegistered(false);
        setRegistration(null);
        console.log("[SW Provider] Service worker unregistered");
      }
      return success;
    }
    return false;
  }, [registration]);

  const value: ServiceWorkerContextValue = {
    isSupported,
    isRegistered,
    registration,
    updateAvailable,
    skipWaiting,
    unregister,
  };

  return (
    <ServiceWorkerContext.Provider value={value}>
      {children}
    </ServiceWorkerContext.Provider>
  );
}

/**
 * Component that shows an update prompt when a new service worker is available
 */
export function ServiceWorkerUpdatePrompt() {
  const { updateAvailable, skipWaiting } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-lg">
      <h3 className="font-semibold">Update Available</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        A new version of FructoSahel is available. Refresh to get the latest
        features and improvements.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={skipWaiting}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Update Now
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Later
        </button>
      </div>
    </div>
  );
}
