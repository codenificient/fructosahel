import { useTranslations } from "next-intl";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Users, MapPin, Sprout, TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <AboutHero locale={locale} />
        <MissionSection locale={locale} />
        <CountriesSection locale={locale} />
        <TeamSection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}

function AboutHero({ locale }: { locale: string }) {
  const t = useTranslations("about");

  return (
    <section className="gradient-hero py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {locale === "fr"
            ? "Transformer l'agriculture du Sahel grace a la technologie et a l'innovation"
            : "Transforming Sahel agriculture through technology and innovation"}
        </p>
      </div>
    </section>
  );
}

function MissionSection({ locale }: { locale: string }) {
  const t = useTranslations("about");

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t("mission.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("mission.content")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Eye className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">{t("vision.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{t("vision.content")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CountriesSection({ locale }: { locale: string }) {
  const countries = [
    {
      name: "Burkina Faso",
      capital: "Ouagadougou",
      farms: 6,
      hectares: 180,
      flag: "🇧🇫",
    },
    {
      name: "Mali",
      capital: "Bamako",
      farms: 4,
      hectares: 150,
      flag: "🇲🇱",
    },
    {
      name: "Niger",
      capital: "Niamey",
      farms: 3,
      hectares: 120,
      flag: "🇳🇪",
    },
  ];

  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {locale === "fr" ? "Nos Pays d'Operation" : "Our Operating Countries"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {locale === "fr"
              ? "Presence dans trois pays du Sahel"
              : "Present in three Sahel countries"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {countries.map((country) => (
            <Card key={country.name} className="text-center">
              <CardHeader>
                <div className="mx-auto text-6xl">{country.flag}</div>
                <CardTitle className="text-xl">{country.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {country.capital}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">{country.farms}</div>
                      <div className="text-xs text-muted-foreground">
                        {locale === "fr" ? "Fermes" : "Farms"}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{country.hectares}</div>
                      <div className="text-xs text-muted-foreground">Hectares</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection({ locale }: { locale: string }) {
  const t = useTranslations("about");

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{t("team.title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("team.content")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <Sprout className="mx-auto h-10 w-10 text-primary" />
              <CardTitle>
                {locale === "fr" ? "Experts Agricoles" : "Agricultural Experts"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {locale === "fr"
                  ? "Agronomes et specialistes des cultures tropicales avec plus de 20 ans d'experience dans le Sahel"
                  : "Agronomists and tropical crop specialists with over 20 years of experience in the Sahel"}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="mx-auto h-10 w-10 text-primary" />
              <CardTitle>
                {locale === "fr" ? "Equipe Technologique" : "Technology Team"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {locale === "fr"
                  ? "Ingenieurs logiciels et specialistes en IA developpant des solutions adaptees a l'agriculture africaine"
                  : "Software engineers and AI specialists building solutions tailored for African agriculture"}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="mx-auto h-10 w-10 text-primary" />
              <CardTitle>
                {locale === "fr" ? "Support Terrain" : "Field Support"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {locale === "fr"
                  ? "Equipes locales dans chaque pays pour accompagner les agriculteurs au quotidien"
                  : "Local teams in each country to support farmers on the ground daily"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
