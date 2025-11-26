"use client";

import { useTranslations } from "next-intl";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <ContactContent locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}

function ContactContent({ locale }: { locale: string }) {
  const t = useTranslations("contact");

  const offices = [
    {
      country: "Burkina Faso",
      city: "Ouagadougou",
      address: "Zone du Bois, Secteur 15",
      phone: "+226 25 36 XX XX",
      email: "burkina@fructosahel.com",
      flag: "🇧🇫",
    },
    {
      country: "Mali",
      city: "Bamako",
      address: "Quartier du Fleuve, ACI 2000",
      phone: "+223 20 XX XX XX",
      email: "mali@fructosahel.com",
      flag: "🇲🇱",
    },
    {
      country: "Niger",
      city: "Niamey",
      address: "Plateau, Boulevard de la Liberte",
      phone: "+227 20 XX XX XX",
      email: "niger@fructosahel.com",
      flag: "🇳🇪",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === "fr" ? "Envoyez-nous un message" : "Send us a message"}
              </CardTitle>
              <CardDescription>
                {locale === "fr"
                  ? "Remplissez le formulaire ci-dessous et nous vous repondrons rapidement"
                  : "Fill out the form below and we'll get back to you soon"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("form.name")}</Label>
                    <Input id="name" placeholder={locale === "fr" ? "Votre nom" : "Your name"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("form.subject")}</Label>
                  <Input
                    id="subject"
                    placeholder={locale === "fr" ? "Sujet de votre message" : "Subject of your message"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("form.message")}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder={locale === "fr" ? "Votre message..." : "Your message..."}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("form.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Main Contact */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === "fr" ? "Informations de Contact" : "Contact Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {locale === "fr" ? "Siege Social" : "Headquarters"}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("info.address")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{t("info.email")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {locale === "fr" ? "Telephone" : "Phone"}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("info.phone")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {locale === "fr" ? "Heures d'ouverture" : "Business Hours"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {locale === "fr"
                        ? "Lun - Ven: 8h00 - 17h00"
                        : "Mon - Fri: 8:00 AM - 5:00 PM"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Offices */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === "fr" ? "Bureaux Regionaux" : "Regional Offices"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offices.map((office) => (
                    <div key={office.country} className="flex items-start gap-3 rounded-lg border p-3">
                      <span className="text-2xl">{office.flag}</span>
                      <div className="flex-1">
                        <p className="font-medium">{office.country}</p>
                        <p className="text-sm text-muted-foreground">{office.city}</p>
                        <p className="text-sm text-muted-foreground">{office.address}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {office.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {office.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
