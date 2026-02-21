"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { demoTrainingPrograms } from "@/lib/demo-data";

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

export default function DemoTrainingPage() {
  const t = useTranslations();

  const stats = useMemo(() => {
    const totalPrograms = demoTrainingPrograms.length;
    const activePrograms = demoTrainingPrograms.filter(
      (p) => p.status === "in_progress" || p.status === "enrolling",
    ).length;
    const totalParticipants = demoTrainingPrograms.reduce(
      (sum, p) => sum + (p.maxParticipants || 0),
      0,
    );
    const graduatedFarmers = demoTrainingPrograms
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.maxParticipants || 0), 0);
    return { totalPrograms, activePrograms, totalParticipants, graduatedFarmers };
  }, []);

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t("training.demoBanner")}
        </p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("training.title")}</h1>
        <p className="text-muted-foreground">{t("training.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.totalPrograms")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.activePrograms")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePrograms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.totalParticipants")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("training.stats.graduatedFarmers")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduatedFarmers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Programs list */}
      <div className="space-y-4">
        {demoTrainingPrograms.map((program) => {
          const curriculum = (program.curriculumAreas as string[]) || [];
          const enrollmentProgress = program.maxParticipants
            ? Math.round(
                ((program.status === "in_progress" ? program.maxParticipants * 0.88 : program.status === "enrolling" ? program.maxParticipants * 0.6 : 0) /
                  program.maxParticipants) *
                  100,
              )
            : 0;

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

                {program.maxParticipants &&
                  (program.status === "in_progress" ||
                    program.status === "enrolling") && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("training.enrolled")}
                        </span>
                        <span>{enrollmentProgress}%</span>
                      </div>
                      <Progress value={enrollmentProgress} className="h-2" />
                    </div>
                  )}

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
