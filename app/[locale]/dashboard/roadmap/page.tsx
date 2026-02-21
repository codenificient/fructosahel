"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Route,
  CheckCircle2,
  Clock,
  Circle,
  Pause,
  SkipForward,
  ChevronDown,
  ChevronRight,
  Target,
  DollarSign,
  MapPin,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhases } from "@/lib/hooks/use-roadmap";
import type { RoadmapPhase, Milestone } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500",
  in_progress: "bg-amber-500",
  not_started: "bg-gray-300 dark:bg-gray-600",
  on_hold: "bg-blue-400",
};

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  in_progress: "secondary",
  not_started: "outline",
  on_hold: "secondary",
  skipped: "outline",
};

function MilestoneStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-amber-600" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-gray-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-300" />;
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  infrastructure: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  crops: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  livestock: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  equipment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  processing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  financial: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

interface PhaseWithMilestones extends RoadmapPhase {
  milestones?: Milestone[];
}

export default function DashboardRoadmapPage() {
  const t = useTranslations();
  const {
    data: phases,
    isLoading,
    error,
    refetch,
  } = usePhases();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const phasesData = (phases ?? []) as PhaseWithMilestones[];

  const stats = useMemo(() => {
    const completedPhases = phasesData.filter(
      (p) => p.status === "completed",
    ).length;
    const allMilestones = phasesData.flatMap((p) => p.milestones ?? []);
    const activeMilestones = allMilestones.filter(
      (m) => m.status === "in_progress",
    ).length;
    const totalTargetRevenue = phasesData.reduce(
      (sum, p) => sum + parseFloat(p.targetRevenueUsd ?? "0"),
      0,
    );

    return {
      totalPhases: phasesData.length,
      completedPhases,
      activeMilestones,
      totalTargetRevenue,
    };
  }, [phasesData]);

  const phaseProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    for (const phase of phasesData) {
      const phaseMilestones = phase.milestones ?? [];
      if (phaseMilestones.length === 0) {
        progress[phase.id] = phase.status === "completed" ? 100 : 0;
      } else {
        const completed = phaseMilestones.filter(
          (m) => m.status === "completed",
        ).length;
        progress[phase.id] = Math.round(
          (completed / phaseMilestones.length) * 100,
        );
      }
    }
    return progress;
  }, [phasesData]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-8 w-8" />
            {t("roadmap.title")}
          </h1>
          <p className="text-muted-foreground">{t("roadmap.subtitle")}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-8 w-8" />
            {t("roadmap.title")}
          </h1>
          <p className="text-muted-foreground">{t("roadmap.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          {t("roadmap.addPhase")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: t("roadmap.stats.totalPhases"),
            value: stats.totalPhases.toString(),
            icon: Target,
            color: "text-primary",
          },
          {
            label: t("roadmap.stats.completedPhases"),
            value: stats.completedPhases.toString(),
            icon: CheckCircle2,
            color: "text-green-600",
          },
          {
            label: t("roadmap.stats.activeMilestones"),
            value: stats.activeMilestones.toString(),
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: t("roadmap.stats.targetRevenue"),
            value: formatCurrency(stats.totalTargetRevenue),
            icon: DollarSign,
            color: "text-primary",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <Skeleton className="h-32 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && phasesData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8">
            <Route className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="font-bold text-xl">
              {t("roadmap.title")}
            </h3>
            <p className="text-muted-foreground mt-2">
              {t("roadmap.emptyState")}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && phasesData.length > 0 && (
        <div className="relative">
          {phasesData.map((phase, index) => {
            const phaseMilestones = phase.milestones ?? [];
            const isExpanded = expandedPhases.has(phase.id);
            const isLast = index === phasesData.length - 1;
            const progress = phaseProgress[phase.id] ?? 0;

            return (
              <div key={phase.id} className="relative flex gap-6">
                {/* Timeline line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${STATUS_COLORS[phase.status]}`}
                  >
                    {phase.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : phase.status === "on_hold" ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      phase.phaseNumber
                    )}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-border min-h-[2rem]" />
                  )}
                </div>

                {/* Phase card */}
                <div className="flex-1 pb-8">
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => togglePhase(phase.id)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                  {phase.name}
                                </CardTitle>
                                <Badge variant={STATUS_BADGE[phase.status]}>
                                  {t(`roadmap.statuses.${phase.status}`)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(phase.targetStartDate)} &mdash;{" "}
                                {formatDate(phase.targetEndDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right text-sm hidden sm:block">
                                {phase.targetHectares && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {phase.targetHectares} ha
                                  </div>
                                )}
                                {phase.targetRevenueUsd && (
                                  <div className="font-medium">
                                    {formatCurrency(
                                      parseFloat(phase.targetRevenueUsd),
                                    )}
                                  </div>
                                )}
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{t("roadmap.progress")}</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {phase.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {phase.description}
                            </p>
                          )}
                          {phase.notes && (
                            <p className="text-sm italic text-muted-foreground mb-4 border-l-2 border-primary/30 pl-3">
                              {phase.notes}
                            </p>
                          )}

                          {phaseMilestones.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">
                                {t("roadmap.milestones")} ({phaseMilestones.length})
                              </h4>
                              <div className="space-y-2">
                                {phaseMilestones.map((milestone) => (
                                  <div
                                    key={milestone.id}
                                    className="flex items-start gap-3 rounded-lg border p-3"
                                  >
                                    <MilestoneStatusIcon
                                      status={milestone.status}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          className={`text-sm font-medium ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                                        >
                                          {milestone.title}
                                        </span>
                                        <span
                                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[milestone.category]}`}
                                        >
                                          {t(
                                            `roadmap.categories.${milestone.category}`,
                                          )}
                                        </span>
                                      </div>
                                      {milestone.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {milestone.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {milestone.targetDate && (
                                          <span>
                                            Target:{" "}
                                            {formatDate(milestone.targetDate)}
                                          </span>
                                        )}
                                        {milestone.completedDate && (
                                          <span className="text-green-600">
                                            Done:{" "}
                                            {formatDate(
                                              milestone.completedDate,
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
