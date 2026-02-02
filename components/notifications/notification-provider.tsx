"use client";

import dynamic from "next/dynamic";

// Dynamically import the user-dependent notification prompt
const NotificationPromptWithUser = dynamic(
  () => import("./notification-prompt-user"),
  { ssr: false },
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <>
      {children}
      <NotificationPromptWithUser />
    </>
  );
}
