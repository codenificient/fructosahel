"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Truck,
  Package,
  Sun,
  Warehouse,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { demoLogisticsOrders } from "@/lib/demo-data";

const ORDER_TYPE_ICONS: Record<string, typeof Truck> = {
  distribution: Truck,
  storage: Warehouse,
  processing_transport: Package,
  solar_installation: Sun,
  equipment_delivery: Package,
};

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  scheduled: "secondary",
  in_transit: "secondary",
  delivered: "default",
  stored: "default",
  cancelled: "destructive",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered":
    case "stored":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_transit":
    case "scheduled":
      return <Clock className="h-4 w-4 text-amber-600" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

export default function DemoLogisticsPage() {
  const t = useTranslations();

  const stats = useMemo(() => {
    const totalOrders = demoLogisticsOrders.length;
    const activeShipments = demoLogisticsOrders.filter(
      (o) => o.status === "in_transit" || o.status === "scheduled",
    ).length;
    const totalWeight = demoLogisticsOrders.reduce(
      (sum, o) => sum + (o.weightKg ? parseFloat(o.weightKg) : 0),
      0,
    );
    const solarInstallations = demoLogisticsOrders.filter(
      (o) => o.orderType === "solar_installation",
    ).length;
    return { totalOrders, activeShipments, totalWeight, solarInstallations };
  }, []);

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t("logistics.demoBanner")}
        </p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("logistics.title")}</h1>
        <p className="text-muted-foreground">{t("logistics.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.totalOrders")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.activeShipments")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.totalWeightKg")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalWeight.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.solarInstallations")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.solarInstallations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {demoLogisticsOrders.map((order) => {
          const Icon = ORDER_TYPE_ICONS[order.orderType] || Package;
          return (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {t(`logistics.orderTypes.${order.orderType}`)}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="max-w-[200px] truncate">{order.origin}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="max-w-[200px] truncate">
                          {order.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={order.status} />
                    <Badge variant={STATUS_BADGE[order.status] || "outline"}>
                      {t(`logistics.statuses.${order.status}`)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  {order.cargoDescription && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {t("logistics.cargo")}:
                      </span>{" "}
                      {order.cargoDescription}
                    </div>
                  )}
                  {order.weightKg && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {t("logistics.weight")}:
                      </span>{" "}
                      {parseFloat(order.weightKg).toLocaleString()} kg
                    </div>
                  )}
                  {order.vehicleInfo && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {t("logistics.vehicle")}:
                      </span>{" "}
                      {order.vehicleInfo}
                    </div>
                  )}
                  {(order.estimatedCostUsd || order.actualCostUsd) && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {order.actualCostUsd
                          ? t("logistics.actualCost")
                          : t("logistics.estimatedCost")}
                        :
                      </span>{" "}
                      $
                      {parseFloat(
                        order.actualCostUsd || order.estimatedCostUsd || "0",
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
                {order.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">{order.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
