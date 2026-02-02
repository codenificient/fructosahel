import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Droplets, Leaf, Bug, Scissors, Sun } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Crop data with detailed growing information
const cropData: Record<
  string,
  {
    emoji: string;
    nameEn: string;
    nameFr: string;
    descriptionEn: string;
    descriptionFr: string;
    growingSchedule: { month: string; tasksEn: string[]; tasksFr: string[] }[];
    waterNeeds: {
      titleEn: string;
      titleFr: string;
      detailsEn: string[];
      detailsFr: string[];
    };
    fertilizer: {
      titleEn: string;
      titleFr: string;
      detailsEn: string[];
      detailsFr: string[];
    };
    pestControl: {
      titleEn: string;
      titleFr: string;
      pestsEn: string[];
      pestsFr: string[];
      solutionsEn: string[];
      solutionsFr: string[];
    };
    harvesting: {
      titleEn: string;
      titleFr: string;
      tipsEn: string[];
      tipsFr: string[];
    };
    sahelTips: {
      titleEn: string;
      titleFr: string;
      tipsEn: string[];
      tipsFr: string[];
    };
  }
> = {
  pineapple: {
    emoji: "🍍",
    nameEn: "Pineapple",
    nameFr: "Ananas",
    descriptionEn:
      "Pineapple (Ananas comosus) is a tropical fruit that can be successfully grown in the Sahel region with proper irrigation. It's a hardy plant that can tolerate some drought but produces best with consistent moisture.",
    descriptionFr:
      "L'ananas (Ananas comosus) est un fruit tropical qui peut etre cultive avec succes dans la region du Sahel avec une irrigation appropriee. C'est une plante resistante qui peut tolerer une certaine secheresse mais produit mieux avec une humidite constante.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: ["Prepare planting beds", "Apply organic matter"],
        tasksFr: [
          "Preparer les plates-bandes",
          "Appliquer la matiere organique",
        ],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Plant suckers/crowns", "Set up drip irrigation"],
        tasksFr: [
          "Planter les rejets/couronnes",
          "Installer l'irrigation goutte a goutte",
        ],
      },
      {
        month: "May-Jun",
        tasksEn: [
          "Monitor growth",
          "Weed control",
          "First fertilizer application",
        ],
        tasksFr: [
          "Surveiller la croissance",
          "Desherbage",
          "Premiere application d'engrais",
        ],
      },
      {
        month: "Jul-Aug",
        tasksEn: ["Rainy season care", "Disease monitoring", "Mulching"],
        tasksFr: [
          "Soins saison des pluies",
          "Surveillance des maladies",
          "Paillage",
        ],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["Flower induction preparation", "Second fertilizer"],
        tasksFr: ["Preparation induction florale", "Deuxieme engrais"],
      },
      {
        month: "Nov-Dec",
        tasksEn: [
          "Ethylene treatment for flowering",
          "Fruit development monitoring",
        ],
        tasksFr: [
          "Traitement ethylene pour floraison",
          "Suivi developpement fruit",
        ],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "Weekly water needs: 25-50mm during dry season",
        "Reduce watering during rainy season (June-October)",
        "Drip irrigation recommended for water efficiency",
        "Morning watering preferred to reduce disease",
        "Mulching reduces water needs by 30-40%",
      ],
      detailsFr: [
        "Besoins hebdomadaires: 25-50mm en saison seche",
        "Reduire l'arrosage en saison des pluies (juin-octobre)",
        "Irrigation goutte a goutte recommandee pour l'efficacite",
        "Arrosage matinal prefere pour reduire les maladies",
        "Le paillage reduit les besoins en eau de 30-40%",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "NPK ratio: 12-12-12 or 15-15-15",
        "Apply 10g per plant every 2 months",
        "Foliar feeding with micronutrients recommended",
        "Organic options: compost, manure tea",
        "Potassium boost before flowering improves fruit quality",
      ],
      detailsFr: [
        "Ratio NPK: 12-12-12 ou 15-15-15",
        "Appliquer 10g par plante tous les 2 mois",
        "Alimentation foliaire avec micronutriments recommandee",
        "Options biologiques: compost, the de fumier",
        "Boost de potassium avant floraison ameliore la qualite du fruit",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: ["Mealybugs", "Pineapple scale", "Nematodes", "Fruit flies"],
      pestsFr: [
        "Cochenilles",
        "Cochenille de l'ananas",
        "Nematodes",
        "Mouches des fruits",
      ],
      solutionsEn: [
        "Neem oil spray for mealybugs",
        "Crop rotation to reduce nematodes",
        "Fruit fly traps with pheromones",
        "Remove infected plant material",
        "Beneficial insects (ladybugs)",
      ],
      solutionsFr: [
        "Pulverisation d'huile de neem contre les cochenilles",
        "Rotation des cultures pour reduire les nematodes",
        "Pieges a mouches des fruits avec pheromones",
        "Retirer le materiel vegetal infecte",
        "Insectes benefiques (coccinelles)",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Harvest when 1/3 to 2/3 of fruit turns yellow",
        "Fruit should smell sweet at the base",
        "Cut with 2-3cm of stem attached",
        "Handle carefully to avoid bruising",
        "Best harvested in early morning",
      ],
      tipsFr: [
        "Recolter quand 1/3 a 2/3 du fruit devient jaune",
        "Le fruit doit sentir sucre a la base",
        "Couper avec 2-3cm de tige attachee",
        "Manipuler avec soin pour eviter les meurtrissures",
        "Meilleur recolte tot le matin",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Use shade cloth during extreme heat (>40°C)",
        "Plant in raised beds for better drainage",
        "Choose drought-tolerant varieties like 'Smooth Cayenne'",
        "Windbreaks protect against Harmattan winds",
        "Water harvesting systems maximize rainfall use",
      ],
      tipsFr: [
        "Utiliser un tissu d'ombrage pendant les chaleurs extremes (>40°C)",
        "Planter sur des plates-bandes sureleves pour un meilleur drainage",
        "Choisir des varietes tolerantes a la secheresse comme 'Smooth Cayenne'",
        "Les brise-vent protegent contre les vents de l'Harmattan",
        "Les systemes de collecte d'eau maximisent l'utilisation des pluies",
      ],
    },
  },
  cashew: {
    emoji: "🥜",
    nameEn: "Cashew",
    nameFr: "Noix de Cajou",
    descriptionEn:
      "Cashew (Anacardium occidentale) is one of the most important cash crops in the Sahel. The tree is well-adapted to hot, dry conditions and can produce for 25+ years with proper care.",
    descriptionFr:
      "L'anacardier (Anacardium occidentale) est l'une des cultures de rente les plus importantes du Sahel. L'arbre est bien adapte aux conditions chaudes et seches et peut produire pendant plus de 25 ans avec des soins appropries.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: ["Pruning after harvest", "Clean orchard floor"],
        tasksFr: ["Taille apres recolte", "Nettoyer le sol du verger"],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Flowering period", "Pest monitoring", "Light irrigation"],
        tasksFr: [
          "Periode de floraison",
          "Surveillance des ravageurs",
          "Irrigation legere",
        ],
      },
      {
        month: "May-Jun",
        tasksEn: ["Fruit development", "Apply NPK fertilizer"],
        tasksFr: ["Developpement du fruit", "Appliquer engrais NPK"],
      },
      {
        month: "Jul-Aug",
        tasksEn: ["Protect from excess rain", "Weed control"],
        tasksFr: ["Proteger de l'exces de pluie", "Desherbage"],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["Prepare for harvest", "Check drying facilities"],
        tasksFr: [
          "Preparer la recolte",
          "Verifier les installations de sechage",
        ],
      },
      {
        month: "Nov-Dec",
        tasksEn: ["Harvest nuts", "Processing and storage"],
        tasksFr: ["Recolter les noix", "Transformation et stockage"],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "Mature trees: drought tolerant, minimal irrigation needed",
        "Young trees (1-3 years): water weekly during dry season",
        "Critical period: flowering (avoid water stress)",
        "Avoid waterlogging - causes root rot",
        "Deep watering encourages deep root growth",
      ],
      detailsFr: [
        "Arbres matures: tolerants a la secheresse, irrigation minimale",
        "Jeunes arbres (1-3 ans): arroser chaque semaine en saison seche",
        "Periode critique: floraison (eviter le stress hydrique)",
        "Eviter l'engorgement - cause la pourriture des racines",
        "Arrosage profond encourage la croissance racinaire profonde",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "NPK 10-10-10: 500g per year of tree age (max 5kg)",
        "Apply in two doses: start and end of rainy season",
        "Add organic matter annually around drip line",
        "Micronutrients: zinc and boron important for flowering",
        "Avoid nitrogen excess - promotes leaves over fruits",
      ],
      detailsFr: [
        "NPK 10-10-10: 500g par annee d'age de l'arbre (max 5kg)",
        "Appliquer en deux doses: debut et fin de saison des pluies",
        "Ajouter de la matiere organique annuellement autour de la couronne",
        "Micronutriments: zinc et bore importants pour la floraison",
        "Eviter l'exces d'azote - favorise les feuilles au detriment des fruits",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: [
        "Tea mosquito bug",
        "Stem borers",
        "Leaf miners",
        "Anthracnose",
      ],
      pestsFr: [
        "Punaise moustique du the",
        "Foreurs de tiges",
        "Mineuses de feuilles",
        "Anthracnose",
      ],
      solutionsEn: [
        "Spray neem-based insecticides for tea mosquito",
        "Prune and burn infested branches",
        "Bordeaux mixture for fungal diseases",
        "Maintain orchard hygiene",
        "Release biological control agents",
      ],
      solutionsFr: [
        "Pulveriser insecticides a base de neem contre la punaise",
        "Tailler et bruler les branches infestees",
        "Bouillie bordelaise pour maladies fongiques",
        "Maintenir l'hygiene du verger",
        "Liberer des agents de lutte biologique",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Harvest when apple turns pink/red and nut is grey",
        "Collect fallen nuts daily for best quality",
        "Separate nuts from apples immediately",
        "Dry nuts in sun for 2-3 days",
        "Store in jute bags in cool, dry place",
      ],
      tipsFr: [
        "Recolter quand la pomme devient rose/rouge et la noix est grise",
        "Ramasser les noix tombees quotidiennement pour la meilleure qualite",
        "Separer les noix des pommes immediatement",
        "Secher les noix au soleil pendant 2-3 jours",
        "Stocker dans des sacs de jute dans un endroit frais et sec",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Excellent crop for Sahel - very drought tolerant",
        "Plant at 10x10m spacing in sandy soils",
        "Use grafted seedlings for faster production",
        "Protect young trees from Harmattan winds",
        "Intercrop with groundnuts in early years",
      ],
      tipsFr: [
        "Excellente culture pour le Sahel - tres tolerante a la secheresse",
        "Planter a 10x10m d'espacement dans les sols sableux",
        "Utiliser des plants greffes pour une production plus rapide",
        "Proteger les jeunes arbres des vents de l'Harmattan",
        "Interculture avec arachides dans les premieres annees",
      ],
    },
  },
  mango: {
    emoji: "🥭",
    nameEn: "Mango",
    nameFr: "Mangue",
    descriptionEn:
      "Mango (Mangifera indica) is a major fruit crop in the Sahel, particularly suited to the hot climate. With over 100 varieties, it's important to select those adapted to local conditions.",
    descriptionFr:
      "La mangue (Mangifera indica) est une culture fruitiere majeure au Sahel, particulierement adaptee au climat chaud. Avec plus de 100 varietes, il est important de choisir celles adaptees aux conditions locales.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: ["Flowering season", "Pest monitoring", "Avoid irrigation"],
        tasksFr: [
          "Saison de floraison",
          "Surveillance des ravageurs",
          "Eviter l'irrigation",
        ],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Fruit set", "Thinning if needed", "Light watering"],
        tasksFr: ["Nouaison", "Eclaircissage si necessaire", "Arrosage leger"],
      },
      {
        month: "May-Jun",
        tasksEn: ["Harvest early varieties", "Fruit fly control"],
        tasksFr: [
          "Recolter varietes precoces",
          "Lutte contre mouches des fruits",
        ],
      },
      {
        month: "Jul-Aug",
        tasksEn: ["Rainy season", "Post-harvest pruning", "Apply fertilizer"],
        tasksFr: [
          "Saison des pluies",
          "Taille post-recolte",
          "Appliquer engrais",
        ],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["New growth management", "Disease prevention"],
        tasksFr: ["Gestion nouvelle croissance", "Prevention maladies"],
      },
      {
        month: "Nov-Dec",
        tasksEn: ["Reduce irrigation", "Prepare for flowering"],
        tasksFr: ["Reduire irrigation", "Preparer floraison"],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "Stop irrigation 2-3 months before flowering",
        "Resume light watering after fruit set",
        "Young trees: weekly watering in dry season",
        "Basin irrigation most effective",
        "Mulching essential for water conservation",
      ],
      detailsFr: [
        "Arreter l'irrigation 2-3 mois avant la floraison",
        "Reprendre un arrosage leger apres la nouaison",
        "Jeunes arbres: arrosage hebdomadaire en saison seche",
        "Irrigation en cuvette plus efficace",
        "Paillage essentiel pour conservation de l'eau",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "Young trees: NPK 15-15-15, 200g per year of age",
        "Bearing trees: 2-3kg NPK annually",
        "Apply organic matter in rainy season",
        "Foliar zinc spray for better flowering",
        "Potassium improves fruit quality",
      ],
      detailsFr: [
        "Jeunes arbres: NPK 15-15-15, 200g par annee d'age",
        "Arbres productifs: 2-3kg NPK annuellement",
        "Appliquer matiere organique en saison des pluies",
        "Pulverisation foliaire de zinc pour meilleure floraison",
        "Le potassium ameliore la qualite du fruit",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: [
        "Fruit flies",
        "Mango mealybug",
        "Anthracnose",
        "Powdery mildew",
      ],
      pestsFr: [
        "Mouches des fruits",
        "Cochenille du manguier",
        "Anthracnose",
        "Oidium",
      ],
      solutionsEn: [
        "Fruit fly traps and protein baits",
        "Hot water treatment for harvested fruit",
        "Copper fungicide for anthracnose",
        "Sulfur spray for powdery mildew",
        "Orchard sanitation - remove fallen fruit",
      ],
      solutionsFr: [
        "Pieges a mouches des fruits et appats proteines",
        "Traitement a l'eau chaude pour fruits recoltes",
        "Fongicide cuivre pour anthracnose",
        "Pulverisation de soufre pour oidium",
        "Hygiene du verger - retirer les fruits tombes",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Harvest when shoulders fill out and skin color changes",
        "Pick with 5cm stem to prevent latex burn",
        "Harvest in morning when cool",
        "Handle gently - bruising reduces quality",
        "Ripen in shade at room temperature",
      ],
      tipsFr: [
        "Recolter quand les epaules se remplissent et la couleur de peau change",
        "Cueillir avec 5cm de tige pour eviter brulure de latex",
        "Recolter le matin quand il fait frais",
        "Manipuler doucement - meurtrissures reduisent qualite",
        "Murir a l'ombre a temperature ambiante",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Recommended varieties: Kent, Keitt, Brooks, local Amelie",
        "Stress period (no water) crucial for flowering",
        "Use zai pits for water harvesting",
        "Windbreaks reduce fruit drop",
        "Export potential to Europe (April-July)",
      ],
      tipsFr: [
        "Varietes recommandees: Kent, Keitt, Brooks, Amelie locale",
        "Periode de stress (sans eau) cruciale pour floraison",
        "Utiliser fosses zai pour collecte d'eau",
        "Brise-vent reduisent la chute des fruits",
        "Potentiel d'exportation vers l'Europe (avril-juillet)",
      ],
    },
  },
  avocado: {
    emoji: "🥑",
    nameEn: "Avocado",
    nameFr: "Avocat",
    descriptionEn:
      "Avocado (Persea americana) requires more water than other Sahel crops but can be grown successfully with irrigation in suitable microclimates, particularly near rivers or with reliable water sources.",
    descriptionFr:
      "L'avocat (Persea americana) necessite plus d'eau que les autres cultures du Sahel mais peut etre cultive avec succes avec irrigation dans des microclimats appropries, particulierement pres des rivieres ou avec des sources d'eau fiables.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: [
          "Flowering begins",
          "Regular irrigation",
          "Bee activity important",
        ],
        tasksFr: [
          "Debut floraison",
          "Irrigation reguliere",
          "Activite des abeilles importante",
        ],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Fruit set", "Maintain consistent moisture"],
        tasksFr: ["Nouaison", "Maintenir humidite constante"],
      },
      {
        month: "May-Jun",
        tasksEn: ["Fruit development", "Apply potassium fertilizer"],
        tasksFr: ["Developpement fruit", "Appliquer engrais potassique"],
      },
      {
        month: "Jul-Aug",
        tasksEn: ["Rainy season", "Monitor for root rot", "Weed control"],
        tasksFr: [
          "Saison pluies",
          "Surveiller pourriture racines",
          "Desherbage",
        ],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["Harvest early varieties", "Post-harvest care"],
        tasksFr: ["Recolter varietes precoces", "Soins post-recolte"],
      },
      {
        month: "Nov-Dec",
        tasksEn: ["Main harvest season", "Prepare for next cycle"],
        tasksFr: ["Saison principale recolte", "Preparer cycle suivant"],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "High water needs: 50-70mm per week in dry season",
        "Never let soil completely dry out",
        "Excellent drainage essential - hates wet feet",
        "Drip irrigation best - avoids trunk wetting",
        "Mulch heavily to conserve moisture",
      ],
      detailsFr: [
        "Besoins eleves en eau: 50-70mm par semaine en saison seche",
        "Ne jamais laisser le sol se dessecher completement",
        "Excellent drainage essentiel - deteste les pieds mouilles",
        "Irrigation goutte a goutte meilleure - evite mouillage du tronc",
        "Pailler abondamment pour conserver l'humidite",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "NPK 6-6-6 or 10-10-10 for general growth",
        "Apply 1-2kg per tree, 4 times per year",
        "Zinc important - apply as foliar spray",
        "Avoid high nitrogen near flowering",
        "Organic matter crucial for root health",
      ],
      detailsFr: [
        "NPK 6-6-6 ou 10-10-10 pour croissance generale",
        "Appliquer 1-2kg par arbre, 4 fois par an",
        "Zinc important - appliquer en pulverisation foliaire",
        "Eviter azote eleve pres de la floraison",
        "Matiere organique cruciale pour sante des racines",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: [
        "Phytophthora root rot",
        "Anthracnose",
        "Thrips",
        "Scale insects",
      ],
      pestsFr: [
        "Pourriture des racines Phytophthora",
        "Anthracnose",
        "Thrips",
        "Cochenilles",
      ],
      solutionsEn: [
        "Improve drainage for root rot prevention",
        "Phosphonate trunk injections",
        "Copper sprays for anthracnose",
        "Neem oil for thrips and scale",
        "Remove infected material promptly",
      ],
      solutionsFr: [
        "Ameliorer drainage pour prevention pourriture racines",
        "Injections de phosphonate dans le tronc",
        "Pulverisations de cuivre pour anthracnose",
        "Huile de neem pour thrips et cochenilles",
        "Retirer materiel infecte rapidement",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Avocados don't ripen on tree - harvest mature fruit",
        "Test maturity by harvesting one and ripening",
        "Cut stem, don't pull fruit",
        "Handle very carefully - bruise easily",
        "Store at 5-7°C to delay ripening",
      ],
      tipsFr: [
        "Les avocats ne murissent pas sur l'arbre - recolter fruits matures",
        "Tester maturite en recoltant un et le laissant murir",
        "Couper la tige, ne pas tirer le fruit",
        "Manipuler tres soigneusement - se meurtrissent facilement",
        "Stocker a 5-7°C pour retarder maturation",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Only viable with reliable irrigation",
        "Plant in microclimates with morning shade",
        "Use windbreaks - sensitive to hot dry winds",
        "Consider greenhouse/shade net production",
        "Mexican varieties more heat tolerant",
      ],
      tipsFr: [
        "Viable uniquement avec irrigation fiable",
        "Planter dans microclimats avec ombre matinale",
        "Utiliser brise-vent - sensible aux vents chauds secs",
        "Considerer production sous serre/filet d'ombrage",
        "Varietes mexicaines plus tolerantes a la chaleur",
      ],
    },
  },
  banana: {
    emoji: "🍌",
    nameEn: "Banana",
    nameFr: "Banane",
    descriptionEn:
      "Banana (Musa spp.) is a high-value crop that can be grown in Sahel oases and irrigated areas. It requires consistent moisture but can produce year-round with proper management.",
    descriptionFr:
      "La banane (Musa spp.) est une culture a haute valeur qui peut etre cultivee dans les oasis du Sahel et les zones irriguees. Elle necessite une humidite constante mais peut produire toute l'annee avec une gestion appropriee.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: ["Sucker selection", "Remove dry leaves", "Fertilize"],
        tasksFr: [
          "Selection des rejets",
          "Retirer feuilles seches",
          "Fertiliser",
        ],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Plant new suckers", "Irrigate heavily", "Mulch"],
        tasksFr: ["Planter nouveaux rejets", "Irriguer abondamment", "Pailler"],
      },
      {
        month: "May-Jun",
        tasksEn: ["Monitor growth", "Weed control", "Support if needed"],
        tasksFr: [
          "Surveiller croissance",
          "Desherbage",
          "Tuteurage si necessaire",
        ],
      },
      {
        month: "Jul-Aug",
        tasksEn: ["Rainy season care", "Reduce irrigation", "Disease check"],
        tasksFr: [
          "Soins saison pluies",
          "Reduire irrigation",
          "Verifier maladies",
        ],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["Bunch emergence", "Prop stems", "Bag bunches"],
        tasksFr: ["Emergence regime", "Etayer tiges", "Ensacher regimes"],
      },
      {
        month: "Nov-Dec",
        tasksEn: ["Harvest mature bunches", "Process pseudostem"],
        tasksFr: ["Recolter regimes matures", "Traiter pseudo-tronc"],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "Very high water needs: 150-200mm per month",
        "Daily drip irrigation recommended",
        "Never allow wilting - permanent damage",
        "Good drainage essential despite high water needs",
        "Mulching reduces water needs by 40%",
      ],
      detailsFr: [
        "Besoins en eau tres eleves: 150-200mm par mois",
        "Irrigation goutte a goutte quotidienne recommandee",
        "Ne jamais permettre le fletrissement - dommage permanent",
        "Bon drainage essentiel malgre besoins eleves en eau",
        "Paillage reduit besoins en eau de 40%",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "Heavy feeder - monthly fertilization needed",
        "NPK 15-5-30 ideal for fruiting",
        "200g urea + 200g potassium per plant monthly",
        "Organic matter essential - apply 20kg compost/year",
        "Magnesium deficiency common - apply Epsom salt",
      ],
      detailsFr: [
        "Grosse consommatrice - fertilisation mensuelle necessaire",
        "NPK 15-5-30 ideal pour fructification",
        "200g uree + 200g potassium par plante mensuellement",
        "Matiere organique essentielle - appliquer 20kg compost/an",
        "Carence en magnesium courante - appliquer sel d'Epsom",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: [
        "Banana weevil",
        "Nematodes",
        "Black Sigatoka",
        "Panama disease",
      ],
      pestsFr: [
        "Charancon du bananier",
        "Nematodes",
        "Cercosporiose noire",
        "Maladie de Panama",
      ],
      solutionsEn: [
        "Use tissue culture plants to avoid weevils",
        "Hot water treatment for suckers",
        "Remove infected leaves for Sigatoka control",
        "Avoid planting in infected soils",
        "Trap weevils with pseudostem pieces",
      ],
      solutionsFr: [
        "Utiliser plants de culture tissulaire pour eviter charancons",
        "Traitement eau chaude pour rejets",
        "Retirer feuilles infectees pour controle Cercosporiose",
        "Eviter planter dans sols infectes",
        "Pieger charancons avec morceaux de pseudo-tronc",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Harvest when fingers are 3/4 round (not angular)",
        "Cut bunch with 30cm stem attached",
        "Handle carefully to prevent bruising",
        "Ripen in shade at 15-20°C",
        "Remove male bud to improve fruit size",
      ],
      tipsFr: [
        "Recolter quand doigts sont 3/4 ronds (pas angulaires)",
        "Couper regime avec 30cm de tige attachee",
        "Manipuler soigneusement pour eviter meurtrissures",
        "Murir a l'ombre a 15-20°C",
        "Retirer bourgeon male pour ameliorer taille fruit",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Only viable in oases or with permanent irrigation",
        "Windbreaks essential - leaves tear easily",
        "Dense planting provides mutual shade protection",
        "Williams and Grand Nain varieties recommended",
        "Can intercrop with papaya in early years",
      ],
      tipsFr: [
        "Viable uniquement dans oasis ou avec irrigation permanente",
        "Brise-vent essentiels - feuilles se dechirent facilement",
        "Plantation dense fournit protection mutuelle contre soleil",
        "Varietes Williams et Grand Nain recommandees",
        "Peut interculture avec papaye dans premieres annees",
      ],
    },
  },
  papaya: {
    emoji: "🍈",
    nameEn: "Papaya",
    nameFr: "Papaye",
    descriptionEn:
      "Papaya (Carica papaya) is fast-growing and can fruit within 9-12 months of planting. It's relatively well-suited to Sahel conditions with proper irrigation and can produce year-round.",
    descriptionFr:
      "La papaye (Carica papaya) pousse rapidement et peut fructifier dans les 9-12 mois apres plantation. Elle est relativement bien adaptee aux conditions du Sahel avec une irrigation appropriee et peut produire toute l'annee.",
    growingSchedule: [
      {
        month: "Jan-Feb",
        tasksEn: ["Prepare nursery beds", "Sow seeds in trays"],
        tasksFr: ["Preparer pepiniere", "Semer graines en bacs"],
      },
      {
        month: "Mar-Apr",
        tasksEn: ["Transplant seedlings", "Set up irrigation"],
        tasksFr: ["Transplanter plants", "Installer irrigation"],
      },
      {
        month: "May-Jun",
        tasksEn: ["Monitor growth", "Apply fertilizer monthly", "Weed control"],
        tasksFr: [
          "Surveiller croissance",
          "Appliquer engrais mensuellement",
          "Desherbage",
        ],
      },
      {
        month: "Jul-Aug",
        tasksEn: [
          "Flowering begins",
          "Select female/hermaphrodite plants",
          "Disease monitoring",
        ],
        tasksFr: [
          "Debut floraison",
          "Selectionner plants femelles/hermaphrodites",
          "Surveillance maladies",
        ],
      },
      {
        month: "Sep-Oct",
        tasksEn: ["First fruits developing", "Support heavy bearing plants"],
        tasksFr: [
          "Premiers fruits en developpement",
          "Soutenir plants charges",
        ],
      },
      {
        month: "Nov-Dec",
        tasksEn: ["Begin harvesting", "Continue fertilizing"],
        tasksFr: ["Debut recolte", "Continuer fertilisation"],
      },
    ],
    waterNeeds: {
      titleEn: "Water Requirements",
      titleFr: "Besoins en Eau",
      detailsEn: [
        "Moderate water needs: 25-50mm per week",
        "Consistent moisture but not waterlogged",
        "Very sensitive to waterlogging - root rot risk",
        "Drip irrigation ideal",
        "Water stress causes flower drop",
      ],
      detailsFr: [
        "Besoins en eau moderes: 25-50mm par semaine",
        "Humidite constante mais pas d'engorgement",
        "Tres sensible a l'engorgement - risque pourriture racines",
        "Irrigation goutte a goutte ideale",
        "Stress hydrique cause chute des fleurs",
      ],
    },
    fertilizer: {
      titleEn: "Fertilizer Guide",
      titleFr: "Guide d'Engrais",
      detailsEn: [
        "Heavy feeder - needs regular fertilization",
        "NPK 10-10-10: 100g monthly per plant",
        "Increase potassium during fruiting",
        "Organic matter improves fruit quality",
        "Boron deficiency causes deformed fruit",
      ],
      detailsFr: [
        "Grosse consommatrice - necessite fertilisation reguliere",
        "NPK 10-10-10: 100g par mois par plante",
        "Augmenter potassium pendant fructification",
        "Matiere organique ameliore qualite fruit",
        "Carence en bore cause fruits deformes",
      ],
    },
    pestControl: {
      titleEn: "Pest Control",
      titleFr: "Lutte Antiparasitaire",
      pestsEn: [
        "Papaya ringspot virus",
        "Fruit flies",
        "Mealybugs",
        "Powdery mildew",
      ],
      pestsFr: [
        "Virus taches annulaires papayer",
        "Mouches des fruits",
        "Cochenilles",
        "Oidium",
      ],
      solutionsEn: [
        "Use virus-resistant varieties",
        "Remove infected plants immediately",
        "Fruit fly traps and baits",
        "Neem oil for mealybugs",
        "Sulfur spray for powdery mildew",
      ],
      solutionsFr: [
        "Utiliser varietes resistantes aux virus",
        "Retirer plantes infectees immediatement",
        "Pieges et appats mouches des fruits",
        "Huile de neem pour cochenilles",
        "Pulverisation de soufre pour oidium",
      ],
    },
    harvesting: {
      titleEn: "Harvesting Tips",
      titleFr: "Conseils de Recolte",
      tipsEn: [
        "Harvest when 1/4 of skin turns yellow",
        "Twist fruit gently to detach",
        "Harvest every 7-10 days",
        "Handle carefully - skin damages easily",
        "Ripen at room temperature",
      ],
      tipsFr: [
        "Recolter quand 1/4 de la peau devient jaune",
        "Tourner doucement le fruit pour detacher",
        "Recolter tous les 7-10 jours",
        "Manipuler soigneusement - peau s'abime facilement",
        "Murir a temperature ambiante",
      ],
    },
    sahelTips: {
      titleEn: "Sahel-Specific Tips",
      titleFr: "Conseils Specifiques au Sahel",
      tipsEn: [
        "Fast return on investment - fruits in 9 months",
        "Protect from Harmattan winds",
        "Raised beds essential for drainage",
        "Solo and Sunrise varieties recommended",
        "Replace plants every 3-4 years for best production",
      ],
      tipsFr: [
        "Retour rapide sur investissement - fruits en 9 mois",
        "Proteger des vents de l'Harmattan",
        "Plates-bandes sureleves essentielles pour drainage",
        "Varietes Solo et Sunrise recommandees",
        "Remplacer plants tous les 3-4 ans pour meilleure production",
      ],
    },
  },
};

export default async function CropGuidePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const crop = cropData[slug];

  if (!crop) {
    notFound();
  }

  const name = locale === "fr" ? crop.nameFr : crop.nameEn;
  const description = locale === "fr" ? crop.descriptionFr : crop.descriptionEn;

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        {/* Header */}
        <section className="gradient-hero py-12">
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-6">
              <Link href={`/${locale}/blog`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {locale === "fr" ? "Retour" : "Back"}
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{crop.emoji}</span>
              <div>
                <h1 className="text-4xl font-bold">{name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {locale === "fr" ? "Guide de Culture" : "Growing Guide"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Description */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">{description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="schedule" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="schedule" className="gap-2">
                  <Leaf className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale === "fr" ? "Calendrier" : "Schedule"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="water" className="gap-2">
                  <Droplets className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale === "fr" ? "Eau" : "Water"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="fertilizer" className="gap-2">
                  <Leaf className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale === "fr" ? "Engrais" : "Fertilizer"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pests" className="gap-2">
                  <Bug className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale === "fr" ? "Ravageurs" : "Pests"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="harvest" className="gap-2">
                  <Scissors className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {locale === "fr" ? "Recolte" : "Harvest"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="sahel" className="gap-2">
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Sahel</span>
                </TabsTrigger>
              </TabsList>

              {/* Growing Schedule */}
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === "fr"
                        ? "Calendrier de Culture"
                        : "Growing Schedule"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {crop.growingSchedule.map((period) => (
                        <div
                          key={period.month}
                          className="rounded-lg border p-4"
                        >
                          <Badge variant="secondary" className="mb-3">
                            {period.month}
                          </Badge>
                          <ul className="space-y-1 text-sm">
                            {(locale === "fr"
                              ? period.tasksFr
                              : period.tasksEn
                            ).map((task, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Water */}
              <TabsContent value="water">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      {locale === "fr"
                        ? crop.waterNeeds.titleFr
                        : crop.waterNeeds.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === "fr"
                        ? crop.waterNeeds.detailsFr
                        : crop.waterNeeds.detailsEn
                      ).map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fertilizer */}
              <TabsContent value="fertilizer">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      {locale === "fr"
                        ? crop.fertilizer.titleFr
                        : crop.fertilizer.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === "fr"
                        ? crop.fertilizer.detailsFr
                        : crop.fertilizer.detailsEn
                      ).map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pests */}
              <TabsContent value="pests">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-red-500" />
                      {locale === "fr"
                        ? crop.pestControl.titleFr
                        : crop.pestControl.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="mb-3 font-semibold">
                        {locale === "fr" ? "Ravageurs Communs" : "Common Pests"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(locale === "fr"
                          ? crop.pestControl.pestsFr
                          : crop.pestControl.pestsEn
                        ).map((pest, i) => (
                          <Badge key={i} variant="destructive">
                            {pest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 font-semibold">
                        {locale === "fr" ? "Solutions" : "Solutions"}
                      </h4>
                      <ul className="space-y-2">
                        {(locale === "fr"
                          ? crop.pestControl.solutionsFr
                          : crop.pestControl.solutionsEn
                        ).map((solution, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Bug className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Harvest */}
              <TabsContent value="harvest">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-orange-500" />
                      {locale === "fr"
                        ? crop.harvesting.titleFr
                        : crop.harvesting.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === "fr"
                        ? crop.harvesting.tipsFr
                        : crop.harvesting.tipsEn
                      ).map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sahel Tips */}
              <TabsContent value="sahel">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      {locale === "fr"
                        ? crop.sahelTips.titleFr
                        : crop.sahelTips.titleEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(locale === "fr"
                        ? crop.sahelTips.tipsFr
                        : crop.sahelTips.tipsEn
                      ).map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Sun className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
