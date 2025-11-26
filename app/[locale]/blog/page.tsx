import { useTranslations } from "next-intl";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <BlogHero locale={locale} />
        <CropGuides locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}

function BlogHero({ locale }: { locale: string }) {
  const t = useTranslations("blog");

  return (
    <section className="gradient-hero py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
    </section>
  );
}

function CropGuides({ locale }: { locale: string }) {
  const t = useTranslations();

  const crops = [
    {
      slug: "pineapple",
      emoji: "🍍",
      name: locale === "fr" ? "Ananas" : "Pineapple",
      description:
        locale === "fr"
          ? "Guide complet pour cultiver l'ananas dans les conditions du Sahel"
          : "Complete guide to growing pineapple in Sahel conditions",
      readTime: "15 min",
    },
    {
      slug: "cashew",
      emoji: "🥜",
      name: locale === "fr" ? "Noix de Cajou" : "Cashew",
      description:
        locale === "fr"
          ? "Tout ce que vous devez savoir sur la culture de l'anacardier"
          : "Everything you need to know about cashew tree cultivation",
      readTime: "12 min",
    },
    {
      slug: "mango",
      emoji: "🥭",
      name: locale === "fr" ? "Mangue" : "Mango",
      description:
        locale === "fr"
          ? "Techniques et conseils pour une production de mangues reussie"
          : "Techniques and tips for successful mango production",
      readTime: "14 min",
    },
    {
      slug: "avocado",
      emoji: "🥑",
      name: locale === "fr" ? "Avocat" : "Avocado",
      description:
        locale === "fr"
          ? "Cultiver l'avocat dans le climat semi-aride du Sahel"
          : "Growing avocado in the semi-arid Sahel climate",
      readTime: "13 min",
    },
    {
      slug: "banana",
      emoji: "🍌",
      name: locale === "fr" ? "Banane" : "Banana",
      description:
        locale === "fr"
          ? "Guide de culture du bananier pour les agriculteurs du Sahel"
          : "Banana cultivation guide for Sahel farmers",
      readTime: "11 min",
    },
    {
      slug: "papaya",
      emoji: "🍈",
      name: locale === "fr" ? "Papaye" : "Papaya",
      description:
        locale === "fr"
          ? "Produire des papayes de qualite dans la region du Sahel"
          : "Producing quality papayas in the Sahel region",
      readTime: "10 min",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-2xl font-bold">{t("blog.growingGuide")}s</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <Link key={crop.slug} href={`/${locale}/blog/${crop.slug}`}>
              <Card className="h-full transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-4xl">{crop.emoji}</span>
                    <Badge variant="secondary">{crop.readTime}</Badge>
                  </div>
                  <CardTitle className="text-xl">{crop.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{crop.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
