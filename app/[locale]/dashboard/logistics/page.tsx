"use client";

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
  Plus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogisticsOrders } from "@/lib/hooks/use-logistics";

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

export default function DashboardLogisticsPage() {
  const t = useTranslations();
  const { data: orders, isLoading, error, refetch } = useLogisticsOrders();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">{t("dashboard.errorTitle")}</h2>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("dashboard.tryAgain")}
        </Button>
      </div>
    );
  }

  const ordersList = orders || [];
  const activeShipments = ordersList.filter(
    (o) => o.status === "in_transit" || o.status === "scheduled",
  ).length;
  const totalWeight = ordersList.reduce(
    (sum, o) => sum + (o.weightKg ? parseFloat(o.weightKg) : 0),
    0,
  );
  const solarInstallations = ordersList.filter(
    (o) => o.orderType === "solar_installation",
  ).length;

  if (ordersList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Truck className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t("logistics.title")}</h2>
        <p className="text-muted-foreground">{t("logistics.emptyState")}</p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("logistics.addOrder")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("logistics.title")}</h1>
          <p className="text-muted-foreground">{t("logistics.subtitle")}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("logistics.addOrder")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.totalOrders")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.activeShipments")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.totalWeightKg")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("logistics.stats.solarInstallations")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solarInstallations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {ordersList.map((order) => {
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
