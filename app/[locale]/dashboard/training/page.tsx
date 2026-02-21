"use client";

import { useTranslations } from "next-intl";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Circle,
  UserPlus,
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
import { Progress } from "@/components/ui/progress";
import { useTrainingPrograms } from "@/lib/hooks/use-training";

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  planning: "outline",
  enrolling: "secondary",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-amber-600" />;
    case "enrolling":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

export default function DashboardTrainingPage() {
  const t = useTranslations();
  const { data: programs, isLoading, error, refetch } = useTrainingPrograms();

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
          <Skeleton key={i} className="h-48 w-full" />
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

  const programsList = programs || [];
  const activePrograms = programsList.filter(
    (p) => p.status === "in_progress" || p.status === "enrolling",
  ).length;
  const totalParticipants = programsList.reduce(
    (sum, p) => sum + (p.maxParticipants || 0),
    0,
  );
  const graduatedFarmers = programsList
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.maxParticipants || 0), 0);

  if (programsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <GraduationCap className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t("training.title")}</h2>
        <p className="text-muted-foreground">{t("training.emptyState")}</p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("training.addProgram")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("training.title")}</h1>
          <p className="text-muted-foreground">{t("training.subtitle")}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("training.addProgram")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.totalPrograms")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.activePrograms")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.totalParticipants")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.graduatedFarmers")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graduatedFarmers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {programsList.map((program) => {
          const curriculum = (program.curriculumAreas as string[]) || [];

          return (
            <Card key={program.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{program.name}</CardTitle>
                      {program.location && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {program.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={program.status} />
                    <Badge variant={STATUS_BADGE[program.status] || "outline"}>
                      {t(`training.statuses.${program.status}`)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.description && (
                  <p className="text-sm text-muted-foreground">
                    {program.description}
                  </p>
                )}

                <div className="grid gap-3 text-sm md:grid-cols-3">
                  {program.startDate && program.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(program.startDate).toLocaleDateString()} —{" "}
                        {new Date(program.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {program.durationWeeks && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {program.durationWeeks} {t("training.duration")}
                      </span>
                    </div>
                  )}
                  {program.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {t("training.maxParticipants")}: {program.maxParticipants}
                      </span>
                    </div>
                  )}
                </div>

                {curriculum.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4" />
                      {t("training.curriculum")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {program.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    {program.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
