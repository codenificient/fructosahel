/**
 * Database Seed Script
 *
 * Seeds the database with sample data for development and demo purposes.
 * Run with: bun run db:seed
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set.");
  console.error("Please add it to your .env.local file.");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...\n");

  // --- 1. Seed Users (Farmers / Team Members) ---
  console.log("Creating users (farmers)...");
  const [admin, manager1, manager2, worker1, worker2] = await db
    .insert(schema.users)
    .values([
      {
        name: "Amadou Diallo",
        email: "amadou@fructosahel.com",
        role: "admin",
        phone: "+226 70 12 34 56",
        language: "fr",
      },
      {
        name: "Fatimata Ouédraogo",
        email: "fatimata@fructosahel.com",
        role: "manager",
        phone: "+226 76 23 45 67",
        language: "fr",
      },
      {
        name: "Moussa Traoré",
        email: "moussa@fructosahel.com",
        role: "manager",
        phone: "+223 66 34 56 78",
        language: "fr",
      },
      {
        name: "Ibrahim Sawadogo",
        email: "ibrahim@fructosahel.com",
        role: "worker",
        phone: "+226 71 45 67 89",
        language: "fr",
      },
      {
        name: "Aïssata Coulibaly",
        email: "aissata@fructosahel.com",
        role: "worker",
        phone: "+227 90 56 78 90",
        language: "en",
      },
    ])
    .returning();
  console.log(`  Created ${5} users`);

  // --- 2. Seed Farms ---
  console.log("Creating farms...");
  const [farm1, farm2] = await db
    .insert(schema.farms)
    .values([
      {
        name: "Ferme Soleil du Sahel",
        location: "Ouagadougou, Kadiogo",
        country: "burkina_faso",
        sizeHectares: "12.50",
        latitude: "12.3714",
        longitude: "-1.5197",
        description:
          "Main production farm with mango orchards and vegetable plots, using Zaï techniques for water conservation.",
        managerId: manager1.id,
      },
      {
        name: "Jardin du Niger",
        location: "Niamey, Communauté Urbaine",
        country: "niger",
        sizeHectares: "8.00",
        latitude: "13.5127",
        longitude: "2.1128",
        description:
          "Irrigated farm along the Niger River, focused on high-value crops and moringa production.",
        managerId: manager2.id,
      },
    ])
    .returning();
  console.log(`  Created ${2} farms`);

  // --- 3. Seed Fields ---
  console.log("Creating fields...");
  const [field1, field2, field3] = await db
    .insert(schema.fields)
    .values([
      {
        farmId: farm1.id,
        name: "Parcelle Mangue Nord",
        sizeHectares: "5.00",
        soilType: "Laterite",
        irrigationType: "Drip irrigation",
        notes: "Established mango orchard, mature trees.",
      },
      {
        farmId: farm1.id,
        name: "Parcelle Légumes Est",
        sizeHectares: "3.50",
        soilType: "Sandy loam",
        irrigationType: "Furrow irrigation",
        notes: "Seasonal vegetable production field.",
      },
      {
        farmId: farm2.id,
        name: "Parcelle Moringa Sud",
        sizeHectares: "4.00",
        soilType: "Alluvial",
        irrigationType: "Flood irrigation",
        notes: "Moringa and cashew intercropping area.",
      },
    ])
    .returning();
  console.log(`  Created ${3} fields`);

  // --- 4. Seed Crops ---
  console.log("Creating crops...");
  const [crop1, crop2, crop3] = await db
    .insert(schema.crops)
    .values([
      {
        fieldId: field1.id,
        cropType: "mango",
        variety: "Kent",
        status: "fruiting",
        plantingDate: new Date("2024-03-15"),
        expectedHarvestDate: new Date("2026-06-01"),
        numberOfPlants: 120,
        expectedYieldKg: "4800.00",
        notes: "Third-year mango trees, healthy canopy growth.",
      },
      {
        fieldId: field2.id,
        cropType: "tomato",
        variety: "Roma VF",
        status: "growing",
        plantingDate: new Date("2026-01-20"),
        expectedHarvestDate: new Date("2026-04-15"),
        numberOfPlants: 2000,
        expectedYieldKg: "6000.00",
        notes: "Dry season tomato cultivation with mulching.",
      },
      {
        fieldId: field3.id,
        cropType: "moringa",
        variety: "Oleifera",
        status: "harvesting",
        plantingDate: new Date("2025-06-01"),
        expectedHarvestDate: new Date("2026-03-30"),
        numberOfPlants: 500,
        expectedYieldKg: "2500.00",
        notes: "Moringa leaves harvested monthly for nutritional supplements.",
      },
    ])
    .returning();
  console.log(`  Created ${3} crops`);

  // --- 5. Seed Tasks ---
  console.log("Creating tasks...");
  await db.insert(schema.tasks).values([
    {
      title: "Apply organic fertilizer to mango orchard",
      description:
        "Spread composted manure around the base of mango trees in Parcelle Mangue Nord.",
      farmId: farm1.id,
      cropId: crop1.id,
      assignedTo: worker1.id,
      createdBy: manager1.id,
      status: "pending",
      priority: "high",
      dueDate: new Date("2026-03-25"),
    },
    {
      title: "Inspect drip irrigation system",
      description:
        "Check all drip lines for blockages and leaks in the mango field.",
      farmId: farm1.id,
      assignedTo: worker1.id,
      createdBy: manager1.id,
      status: "in_progress",
      priority: "medium",
      dueDate: new Date("2026-03-20"),
    },
    {
      title: "Harvest moringa leaves - March batch",
      description:
        "Collect moringa leaves for drying. Target 200kg fresh weight.",
      farmId: farm2.id,
      cropId: crop3.id,
      assignedTo: worker2.id,
      createdBy: manager2.id,
      status: "pending",
      priority: "urgent",
      dueDate: new Date("2026-03-18"),
    },
    {
      title: "Prepare tomato seedbed for next rotation",
      description:
        "Clear and prepare the eastern plot for the next round of tomato planting.",
      farmId: farm1.id,
      cropId: crop2.id,
      assignedTo: worker1.id,
      createdBy: admin.id,
      status: "pending",
      priority: "low",
      dueDate: new Date("2026-04-10"),
    },
  ]);
  console.log(`  Created ${4} tasks`);

  // --- 6. Seed Transactions ---
  console.log("Creating transactions...");
  await db.insert(schema.transactions).values([
    {
      farmId: farm1.id,
      type: "income",
      category: "Crop Sales",
      description: "Mango harvest sale to Ouaga market cooperative",
      amount: "1250000",
      currency: "XOF",
      transactionDate: new Date("2026-02-15"),
      createdBy: manager1.id,
    },
    {
      farmId: farm1.id,
      type: "expense",
      category: "Fertilizer",
      description: "Organic compost purchase for mango orchard",
      amount: "175000",
      currency: "XOF",
      transactionDate: new Date("2026-03-01"),
      createdBy: manager1.id,
    },
    {
      farmId: farm2.id,
      type: "income",
      category: "Crop Sales",
      description: "Moringa leaf powder sold to health food distributor",
      amount: "820000",
      currency: "XOF",
      transactionDate: new Date("2026-02-28"),
      createdBy: manager2.id,
    },
    {
      farmId: farm2.id,
      type: "expense",
      category: "Equipment",
      description: "Irrigation pump maintenance and spare parts",
      amount: "95000",
      currency: "XOF",
      transactionDate: new Date("2026-03-05"),
      createdBy: manager2.id,
    },
    {
      farmId: farm1.id,
      type: "expense",
      category: "Labor",
      description: "Seasonal workers for tomato harvesting",
      amount: "300000",
      currency: "XOF",
      transactionDate: new Date("2026-03-10"),
      createdBy: admin.id,
    },
  ]);
  console.log(`  Created ${5} transactions`);

  // --- 7. Seed Sales ---
  console.log("Creating sales records...");
  await db.insert(schema.sales).values([
    {
      farmId: farm1.id,
      cropType: "mango",
      quantityKg: "800.00",
      pricePerKg: "750.00",
      totalAmount: "600000.00",
      currency: "XOF",
      buyerName: "Coopérative Fruitière de Ouaga",
      buyerContact: "+226 25 30 12 34",
      saleDate: new Date("2026-02-10"),
      createdBy: manager1.id,
    },
    {
      farmId: farm2.id,
      cropType: "moringa",
      quantityKg: "150.00",
      pricePerKg: "3500.00",
      totalAmount: "525000.00",
      currency: "XOF",
      buyerName: "Sahel Nutrition Export",
      buyerContact: "+227 20 73 45 67",
      saleDate: new Date("2026-02-25"),
      createdBy: manager2.id,
    },
    {
      farmId: farm1.id,
      cropType: "tomato",
      quantityKg: "1200.00",
      pricePerKg: "400.00",
      totalAmount: "480000.00",
      currency: "XOF",
      buyerName: "Marché Central",
      saleDate: new Date("2026-03-08"),
      createdBy: manager1.id,
    },
  ]);
  console.log(`  Created ${3} sales`);

  // --- 8. Seed Livestock ---
  console.log("Creating livestock...");
  await db.insert(schema.livestock).values([
    {
      farmId: farm1.id,
      livestockType: "chickens",
      breed: "Local Faso",
      quantity: 45,
      notes: "Free-range laying hens for egg production and pest control in orchards.",
    },
    {
      farmId: farm2.id,
      livestockType: "guinea_fowl",
      breed: "Helmeted Guinea Fowl",
      quantity: 30,
      notes: "Natural pest control for moringa and cashew fields.",
    },
  ]);
  console.log(`  Created ${2} livestock records`);

  console.log("\nSeed completed successfully!");
  console.log("\nSample login credentials:");
  console.log("  Admin:   amadou@fructosahel.com");
  console.log("  Manager: fatimata@fructosahel.com");
  console.log("  Worker:  ibrahim@fructosahel.com");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
