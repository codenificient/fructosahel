"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { NotificationSettings } from "@/components/notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

// Dynamically import the user-dependent component
const UserInfo = dynamic(() => import("./user-info"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </div>
  ),
});

export default function SettingsPage() {
  // Use a demo user ID by default - actual user ID handled in child components
  const userId = "demo-user-id";
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettings userId={userId} />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                <UserInfo />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how FructoSahel looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Theme customization coming soon. The app currently follows your
                system theme preference.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Display Currency
              </CardTitle>
              <CardDescription>
                Choose how financial values are displayed across the app.
                All data is stored in XOF — this only affects the display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["XOF", "USD", "ECO"] as CurrencyCode[]).map((code) => {
                  const config = CURRENCIES[code];
                  const isSelected = currency === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCurrency(code)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium">
                          {code} — {config.label}
                          {code === "ECO" && (
                            <Badge variant="secondary" className="text-xs">
                              Coming soon
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Symbol: {config.symbol}
                          {code === "ECO" && " (pegged 1:1 to XOF)"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security settings coming soon. Two-factor authentication and
                session management will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
