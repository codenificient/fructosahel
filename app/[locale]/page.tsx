import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Sprout,
  TrendingUp,
  BarChart3,
  BookOpen,
  MapPin,
  Users,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header, Footer } from "@/components/layout";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <HeroSection locale={locale} />
        <FeaturesSection locale={locale} />
        <CropsSection locale={locale} />
        <StatsSection locale={locale} />
        <CTASection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}

function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="animate-slide-up mt-6 text-lg text-muted-foreground md:text-xl">
            {t("subtitle")}
          </p>
          <div className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={`/${locale}/dashboard`}>
                {t("cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${locale}/demo`}>{t("tryDemo")}</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href={`/${locale}/blog`}>{t("learnMore")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute left-0 top-0 -z-10 h-full w-full">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </section>
  );
}

function FeaturesSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: MapPin,
      titleKey: "farmManagement.title",
      descKey: "farmManagement.description",
    },
    {
      icon: Sprout,
      titleKey: "aiAgents.title",
      descKey: "aiAgents.description",
    },
    {
      icon: BarChart3,
      titleKey: "analytics.title",
      descKey: "analytics.description",
    },
    {
      icon: BookOpen,
      titleKey: "knowledgeBase.title",
      descKey: "knowledgeBase.description",
    },
  ];

  return (
    <section className="border-t bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.titleKey} className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t(feature.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(feature.descKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CropsSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.crops");

  const crops = [
    { key: "pineapple", emoji: "🍍", color: "bg-yellow-500" },
    { key: "cashew", emoji: "🥜", color: "bg-amber-600" },
    { key: "avocado", emoji: "🥑", color: "bg-green-600" },
    { key: "mango", emoji: "🥭", color: "bg-orange-500" },
    { key: "banana", emoji: "🍌", color: "bg-yellow-400" },
    { key: "papaya", emoji: "🍈", color: "bg-orange-400" },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {crops.map((crop) => (
            <Link
              key={crop.key}
              href={`/${locale}/blog/${crop.key}`}
              className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
            >
              <span className="text-5xl">{crop.emoji}</span>
              <span className="mt-4 font-semibold group-hover:text-primary">
                {t(crop.key)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ locale }: { locale: string }) {
  const t = useTranslations("landing.stats");

  const stats = [
    { value: "50+", label: t("farms") },
    { value: "1,200", label: t("hectares") },
    { value: "500+", label: t("farmers") },
    { value: "3", label: t("countries") },
  ];

  return (
    <section className="border-t bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold md:text-5xl">{stat.value}</div>
              <div className="mt-2 text-primary-foreground/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ locale }: { locale: string }) {
  const t = useTranslations("landing.cta");

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            {t("subtitle")}
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href={`/${locale}/dashboard`}>
              {t("button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
