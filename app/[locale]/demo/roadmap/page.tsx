"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { demoRoadmapPhases, demoMilestones } from "@/lib/demo-data";
import { useState } from "react";

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

export default function DemoRoadmapPage() {
  const t = useTranslations();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(["demo-phase-1", "demo-phase-2"]),
  );

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

  const stats = useMemo(() => {
    const completedPhases = demoRoadmapPhases.filter(
      (p) => p.status === "completed",
    ).length;
    const activeMilestones = demoMilestones.filter(
      (m) => m.status === "in_progress",
    ).length;
    const totalTargetRevenue = demoRoadmapPhases.reduce(
      (sum, p) => sum + parseFloat(p.targetRevenueUsd ?? "0"),
      0,
    );

    return {
      totalPhases: demoRoadmapPhases.length,
      completedPhases,
      activeMilestones,
      totalTargetRevenue,
    };
  }, []);

  const phaseProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    for (const phase of demoRoadmapPhases) {
      const phaseMilestones = demoMilestones.filter(
        (m) => m.phaseId === phase.id,
      );
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
  }, []);

  const formatDate = (date: Date | null) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-8 w-8" />
            {t("roadmap.title")}
          </h1>
          <p className="text-muted-foreground">{t("roadmap.subtitle")}</p>
        </div>

        {/* Demo Banner */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("roadmap.demoBanner")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("roadmap.stats.totalPhases")}
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("roadmap.stats.completedPhases")}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedPhases}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("roadmap.stats.activeMilestones")}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.activeMilestones}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("roadmap.stats.targetRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalTargetRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative">
        {demoRoadmapPhases.map((phase, index) => {
          const phaseMilestones = demoMilestones.filter(
            (m) => m.phaseId === phase.id,
          );
          const isExpanded = expandedPhases.has(phase.id);
          const isLast = index === demoRoadmapPhases.length - 1;
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
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {phase.targetHectares} ha
                              </div>
                              <div className="font-medium">
                                {formatCurrency(
                                  parseFloat(phase.targetRevenueUsd ?? "0"),
                                )}
                              </div>
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

                        {/* Milestones */}
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
                                          Target: {formatDate(milestone.targetDate)}
                                        </span>
                                      )}
                                      {milestone.completedDate && (
                                        <span className="text-green-600">
                                          Done: {formatDate(milestone.completedDate)}
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
    </div>
  );
}
