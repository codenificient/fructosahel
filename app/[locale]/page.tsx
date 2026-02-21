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
  Leaf,
  Sun,
  Droplets,
  Bot,
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
      <div className="container mx-auto px-4 py-28 md:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Leaf className="h-4 w-4" />
            {t("badge")}
          </div>
          <h1 className="animate-fade-in text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("titleLine1")}
            <span className="bg-gradient-to-r from-primary via-sahel-terracotta to-accent bg-clip-text text-transparent">
              {" "}
              {t("titleHighlight")}
            </span>
          </h1>
          <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25" asChild>
              <Link href={`/${locale}/dashboard`}>
                {t("cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href={`/${locale}/demo`}>{t("tryDemo")}</Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-8 text-base" asChild>
              <Link href={`/${locale}/blog`}>{t("learnMore")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute left-0 top-0 -z-10 h-full w-full">
        <div className="animate-pulse-glow absolute left-[15%] top-[20%] h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="animate-pulse-glow absolute right-[15%] bottom-[20%] h-72 w-72 rounded-full bg-accent/8 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="animate-float absolute left-[10%] bottom-[30%] h-48 w-48 rounded-full bg-sahel-terracotta/5 blur-3xl" />
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
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      icon: Bot,
      titleKey: "aiAgents.title",
      descKey: "aiAgents.description",
      gradient: "from-accent/10 to-accent/5",
      iconColor: "text-accent",
    },
    {
      icon: BarChart3,
      titleKey: "analytics.title",
      descKey: "analytics.description",
      gradient: "from-sahel-terracotta/10 to-sahel-terracotta/5",
      iconColor: "text-sahel-terracotta",
    },
    {
      icon: BookOpen,
      titleKey: "knowledgeBase.title",
      descKey: "knowledgeBase.description",
      gradient: "from-sahel-earth/10 to-sahel-earth/5",
      iconColor: "text-sahel-earth",
    },
  ];

  return (
    <section className="border-t py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={feature.titleKey}
              className="group relative overflow-hidden border-0 bg-gradient-to-b shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`} />
              <CardHeader className="relative">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 shadow-sm ${feature.iconColor}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-base leading-relaxed">
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
    { key: "pineapple", emoji: "\uD83C\uDF4D", accent: "hover:border-yellow-500/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-500/5" },
    { key: "cashew", emoji: "\uD83E\uDD5C", accent: "hover:border-amber-600/50 hover:bg-amber-50/50 dark:hover:bg-amber-500/5" },
    { key: "avocado", emoji: "\uD83E\uDD51", accent: "hover:border-green-600/50 hover:bg-green-50/50 dark:hover:bg-green-500/5" },
    { key: "mango", emoji: "\uD83E\uDD6D", accent: "hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-500/5" },
    { key: "banana", emoji: "\uD83C\uDF4C", accent: "hover:border-yellow-400/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-400/5" },
    { key: "papaya", emoji: "\uD83C\uDF48", accent: "hover:border-orange-400/50 hover:bg-orange-50/50 dark:hover:bg-orange-400/5" },
  ];

  return (
    <section className="py-28 mesh-pattern">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {crops.map((crop) => (
            <Link
              key={crop.key}
              href={`/${locale}/blog/${crop.key}`}
              className={`group flex flex-col items-center rounded-2xl border bg-card/50 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${crop.accent}`}
            >
              <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
                {crop.emoji}
              </span>
              <span className="mt-4 font-semibold text-foreground/80 transition-colors group-hover:text-foreground">
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
    { value: "50+", label: t("farms"), icon: MapPin },
    { value: "1,200", label: t("hectares"), icon: Sun },
    { value: "500+", label: t("farmers"), icon: Users },
    { value: "3", label: t("countries"), icon: Droplets },
  ];

  return (
    <section className="relative overflow-hidden border-t py-20">
      <div className="absolute inset-0 gradient-sahel opacity-90" />
      <div className="container relative mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center text-primary-foreground">
              <stat.icon className="mx-auto mb-3 h-6 w-6 opacity-70" />
              <div className="text-4xl font-extrabold tracking-tight md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider opacity-80">
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
    <section className="py-28">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-1">
          <div className="absolute inset-0 gradient-sahel opacity-80" />
          <div className="relative rounded-[1.35rem] bg-gradient-to-br from-primary/95 to-primary/85 px-8 py-16 text-center text-primary-foreground sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              {t("subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base font-semibold shadow-lg"
                asChild
              >
                <Link href={`/${locale}/dashboard`}>
                  {t("button")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-12 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link href={`/${locale}/demo`}>{t("demoButton")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
