/**
 * Database seed script for FructoSahel
 *
 * Seeds all tables with realistic data for the Sahel agricultural context.
 * Uses the existing Neon Auth user as the owner/manager/creator.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/seed.ts
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL as string,
});

// The single Neon Auth user
const AUTH_USER_ID = "fc49699a-4439-465c-ba51-72c6d77e35a7";
const AUTH_USER_EMAIL = "admin@fructosahel.com";
const AUTH_USER_NAME = "Christian Admin";

async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

async function seed() {
  console.log("Seeding database...\n");

  // ─── 1. Users ───
  console.log("1. Creating app user...");
  const userResult = await query(
    `INSERT INTO users (id, email, name, role, phone, language)
     VALUES ($1, $2, $3, 'admin', '+226 70 12 34 56', 'en')
     ON CONFLICT (id) DO UPDATE SET name = $3, role = 'admin'
     RETURNING id`,
    [AUTH_USER_ID, AUTH_USER_EMAIL, AUTH_USER_NAME]
  );
  const userId = userResult.rows[0].id;
  console.log("  User:", userId);

  // ─── 2. Farms ───
  console.log("2. Creating farms...");
  const farmData = [
    {
      name: "Domaine Fructo Bobo",
      location: "Bobo-Dioulasso, Hauts-Bassins",
      country: "burkina_faso",
      sizeHectares: 25.0,
      lat: 11.1771,
      lng: -4.2979,
      description:
        "Main pineapple and mango production farm near Bobo-Dioulasso. Rich laterite soil with good drainage.",
    },
    {
      name: "Ferme Sahel Niamey",
      location: "Niamey, Tillabéri",
      country: "niger",
      sizeHectares: 15.5,
      lat: 13.5127,
      lng: 2.1126,
      description:
        "Irrigated farm along the Niger River. Focus on cashew, moringa, and vegetable production.",
    },
    {
      name: "Exploitation Bamako Sud",
      location: "Bamako, Koulikoro",
      country: "mali",
      sizeHectares: 18.0,
      lat: 12.6392,
      lng: -8.0029,
      description:
        "Mixed fruit farm on the outskirts of Bamako. Avocado, banana, and papaya orchards.",
    },
  ];

  const farmIds: string[] = [];
  for (const f of farmData) {
    const res = await query(
      `INSERT INTO farms (name, location, country, size_hectares, latitude, longitude, description, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [f.name, f.location, f.country, f.sizeHectares, f.lat, f.lng, f.description, userId]
    );
    farmIds.push(res.rows[0].id);
    console.log(`  Farm: ${f.name} (${res.rows[0].id})`);
  }

  // ─── 3. Fields ───
  console.log("3. Creating fields...");
  const fieldData = [
    // Farm 1 (Bobo) - 4 fields
    { farmIdx: 0, name: "Parcelle Ananas Nord", size: 8.0, soil: "Laterite", irrigation: "Drip" },
    { farmIdx: 0, name: "Verger Mangue Est", size: 6.5, soil: "Sandy loam", irrigation: "Sprinkler" },
    { farmIdx: 0, name: "Champ Cajou Ouest", size: 5.5, soil: "Laterite", irrigation: "Rainfed" },
    { farmIdx: 0, name: "Zone Maraîchère Sud", size: 5.0, soil: "Alluvial", irrigation: "Drip" },
    // Farm 2 (Niamey) - 3 fields
    { farmIdx: 1, name: "Parcelle Cajou Rivière", size: 6.0, soil: "Sandy", irrigation: "Flood" },
    { farmIdx: 1, name: "Champ Moringa", size: 4.5, soil: "Clayey", irrigation: "Drip" },
    { farmIdx: 1, name: "Jardin Légumes", size: 5.0, soil: "Alluvial", irrigation: "Drip" },
    // Farm 3 (Bamako) - 3 fields
    { farmIdx: 2, name: "Verger Avocat", size: 7.0, soil: "Red clay", irrigation: "Sprinkler" },
    { farmIdx: 2, name: "Bananeraie Principale", size: 6.0, soil: "Volcanic", irrigation: "Drip" },
    { farmIdx: 2, name: "Papaye et Agrumes", size: 5.0, soil: "Sandy loam", irrigation: "Sprinkler" },
  ];

  const fieldIds: string[] = [];
  for (const f of fieldData) {
    const res = await query(
      `INSERT INTO fields (farm_id, name, size_hectares, soil_type, irrigation_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [farmIds[f.farmIdx], f.name, f.size, f.soil, f.irrigation]
    );
    fieldIds.push(res.rows[0].id);
  }
  console.log(`  Created ${fieldIds.length} fields`);

  // ─── 4. Crops ───
  console.log("4. Creating crops...");
  const now = new Date();
  const monthsAgo = (m: number) => new Date(now.getFullYear(), now.getMonth() - m, 15);
  const monthsAhead = (m: number) => new Date(now.getFullYear(), now.getMonth() + m, 15);

  const cropData = [
    // Farm 1 fields
    { fieldIdx: 0, type: "pineapple", variety: "Cayenne Lisse", status: "fruiting", planted: monthsAgo(10), harvest: monthsAhead(2), plants: 12000, expectedKg: 18000 },
    { fieldIdx: 0, type: "pineapple", variety: "Queen Victoria", status: "growing", planted: monthsAgo(5), harvest: monthsAhead(7), plants: 8000, expectedKg: 10000 },
    { fieldIdx: 1, type: "mango", variety: "Kent", status: "flowering", planted: monthsAgo(36), harvest: monthsAhead(3), plants: 200, expectedKg: 8000 },
    { fieldIdx: 1, type: "mango", variety: "Amélie", status: "growing", planted: monthsAgo(24), harvest: monthsAhead(6), plants: 150, expectedKg: 5000 },
    { fieldIdx: 2, type: "cashew", variety: "Jumbo", status: "growing", planted: monthsAgo(18), harvest: monthsAhead(8), plants: 300, expectedKg: 1500 },
    { fieldIdx: 3, type: "tomato", variety: "Roma", status: "harvesting", planted: monthsAgo(4), harvest: monthsAhead(0), plants: 3000, expectedKg: 9000, actualKg: 7200 },
    { fieldIdx: 3, type: "okra", variety: "Clemson Spineless", status: "harvested", planted: monthsAgo(6), harvest: monthsAgo(1), plants: 2000, expectedKg: 4000, actualKg: 3800 },
    // Farm 2 fields
    { fieldIdx: 4, type: "cashew", variety: "Local Improved", status: "planted", planted: monthsAgo(2), harvest: monthsAhead(34), plants: 250, expectedKg: 1200 },
    { fieldIdx: 5, type: "moringa", variety: "PKM-1", status: "growing", planted: monthsAgo(8), harvest: monthsAhead(1), plants: 500, expectedKg: 2500 },
    { fieldIdx: 6, type: "onion", variety: "Violet de Galmi", status: "growing", planted: monthsAgo(3), harvest: monthsAhead(1), plants: 15000, expectedKg: 12000 },
    { fieldIdx: 6, type: "pepper", variety: "Piment Fort", status: "planted", planted: monthsAgo(1), harvest: monthsAhead(4), plants: 4000, expectedKg: 3000 },
    // Farm 3 fields
    { fieldIdx: 7, type: "avocado", variety: "Hass", status: "fruiting", planted: monthsAgo(48), harvest: monthsAhead(1), plants: 180, expectedKg: 7200 },
    { fieldIdx: 7, type: "avocado", variety: "Fuerte", status: "growing", planted: monthsAgo(12), harvest: monthsAhead(24), plants: 120, expectedKg: 4800 },
    { fieldIdx: 8, type: "banana", variety: "Grand Nain", status: "harvesting", planted: monthsAgo(14), harvest: monthsAhead(0), plants: 2000, expectedKg: 30000, actualKg: 24000 },
    { fieldIdx: 9, type: "papaya", variety: "Solo", status: "fruiting", planted: monthsAgo(10), harvest: monthsAhead(2), plants: 800, expectedKg: 16000 },
    { fieldIdx: 9, type: "citrus", variety: "Valencia Orange", status: "flowering", planted: monthsAgo(30), harvest: monthsAhead(4), plants: 100, expectedKg: 3000 },
  ];

  const cropIds: string[] = [];
  for (const c of cropData) {
    const res = await query(
      `INSERT INTO crops (field_id, crop_type, variety, status, planting_date, expected_harvest_date, number_of_plants, expected_yield_kg, actual_yield_kg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [fieldIds[c.fieldIdx], c.type, c.variety, c.status, c.planted, c.harvest, c.plants, c.expectedKg, c.actualKg || null]
    );
    cropIds.push(res.rows[0].id);
  }
  console.log(`  Created ${cropIds.length} crops`);

  // ─── 5. Crop Activities ───
  console.log("5. Creating crop activities...");
  const activities = [
    { cropIdx: 0, type: "fertilizing", desc: "NPK 15-15-15 application, 200kg/ha", date: monthsAgo(8), cost: 45000 },
    { cropIdx: 0, type: "watering", desc: "Drip irrigation system check and run", date: monthsAgo(6), cost: 5000 },
    { cropIdx: 0, type: "pest_control", desc: "Mealybug treatment with neem oil", date: monthsAgo(4), cost: 15000 },
    { cropIdx: 2, type: "pruning", desc: "Annual canopy shaping and dead wood removal", date: monthsAgo(3), cost: 8000 },
    { cropIdx: 2, type: "fertilizing", desc: "Organic compost application around base", date: monthsAgo(5), cost: 20000 },
    { cropIdx: 5, type: "harvesting", desc: "First tomato harvest - 2400 kg picked", date: monthsAgo(1), cost: 12000 },
    { cropIdx: 5, type: "pest_control", desc: "Tomato leaf miner spray (bio-pesticide)", date: monthsAgo(2), cost: 18000 },
    { cropIdx: 8, type: "watering", desc: "Moringa irrigation schedule adjusted for dry season", date: monthsAgo(2), cost: 3000 },
    { cropIdx: 11, type: "fertilizing", desc: "Avocado potassium boost for fruit development", date: monthsAgo(3), cost: 25000 },
    { cropIdx: 13, type: "harvesting", desc: "Banana bunch cutting and transport to market", date: monthsAgo(0), cost: 15000 },
    { cropIdx: 14, type: "watering", desc: "Papaya micro-sprinkler maintenance", date: monthsAgo(1), cost: 7000 },
  ];

  for (const a of activities) {
    await query(
      `INSERT INTO crop_activities (crop_id, activity_type, description, performed_at, performed_by, cost)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cropIds[a.cropIdx], a.type, a.desc, a.date, userId, a.cost]
    );
  }
  console.log(`  Created ${activities.length} activities`);

  // ─── 6. Tasks ───
  console.log("6. Creating tasks...");
  const taskData = [
    { title: "Install drip irrigation on Parcelle Ananas Nord", farmIdx: 0, priority: "high", status: "completed", due: monthsAgo(8), completed: monthsAgo(7) },
    { title: "Order NPK fertilizer for mango season", farmIdx: 0, priority: "medium", status: "completed", due: monthsAgo(5), completed: monthsAgo(5) },
    { title: "Harvest Roma tomatoes - Zone Maraîchère", farmIdx: 0, priority: "urgent", status: "in_progress", due: monthsAhead(0) },
    { title: "Repair fence around cashew orchard", farmIdx: 0, priority: "medium", status: "pending", due: monthsAhead(1) },
    { title: "Prepare soil for next pineapple rotation", farmIdx: 0, priority: "low", status: "pending", due: monthsAhead(3) },
    { title: "Contact SOFITEX for cotton pest advisory", farmIdx: 0, priority: "medium", status: "cancelled" },
    { title: "Set up nursery for new cashew seedlings", farmIdx: 1, priority: "high", status: "in_progress", due: monthsAhead(1) },
    { title: "Schedule moringa leaf harvest", farmIdx: 1, priority: "medium", status: "pending", due: monthsAhead(1) },
    { title: "Test Niger River water quality for irrigation", farmIdx: 1, priority: "high", status: "completed", due: monthsAgo(2), completed: monthsAgo(2) },
    { title: "Transplant onion seedlings to main field", farmIdx: 1, priority: "urgent", status: "completed", due: monthsAgo(3), completed: monthsAgo(3) },
    { title: "Arrange banana transport to Bamako market", farmIdx: 2, priority: "urgent", status: "in_progress", due: monthsAhead(0) },
    { title: "Prune avocado trees before rainy season", farmIdx: 2, priority: "high", status: "pending", due: monthsAhead(2) },
    { title: "Apply organic mulch to papaya rows", farmIdx: 2, priority: "medium", status: "pending", due: monthsAhead(1) },
    { title: "Order citrus rootstock for grafting", farmIdx: 2, priority: "low", status: "pending", due: monthsAhead(4) },
    { title: "Negotiate with cooperative for avocado export", farmIdx: 2, priority: "high", status: "in_progress", due: monthsAhead(2) },
  ];

  for (const t of taskData) {
    await query(
      `INSERT INTO tasks (title, farm_id, assigned_to, created_by, status, priority, due_date, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [t.title, farmIds[t.farmIdx], userId, userId, t.status, t.priority, t.due || null, t.completed || null]
    );
  }
  console.log(`  Created ${taskData.length} tasks`);

  // ─── 7. Transactions ───
  console.log("7. Creating transactions...");
  const txData = [
    // Expenses
    { farmIdx: 0, type: "expense", category: "fertilizer", desc: "NPK 15-15-15, 50 bags", amount: 375000, date: monthsAgo(5) },
    { farmIdx: 0, type: "expense", category: "labor", desc: "Seasonal workers for pineapple planting", amount: 180000, date: monthsAgo(4) },
    { farmIdx: 0, type: "expense", category: "equipment", desc: "Drip irrigation system components", amount: 850000, date: monthsAgo(8) },
    { farmIdx: 0, type: "expense", category: "transport", desc: "Tomato transport to Ouagadougou", amount: 45000, date: monthsAgo(1) },
    { farmIdx: 1, type: "expense", category: "fertilizer", desc: "Organic compost, 10 tonnes", amount: 150000, date: monthsAgo(3) },
    { farmIdx: 1, type: "expense", category: "labor", desc: "Moringa leaf harvesting crew", amount: 75000, date: monthsAgo(2) },
    { farmIdx: 1, type: "expense", category: "equipment", desc: "Water pump maintenance", amount: 120000, date: monthsAgo(4) },
    { farmIdx: 2, type: "expense", category: "labor", desc: "Banana harvesting and packing", amount: 95000, date: monthsAgo(1) },
    { farmIdx: 2, type: "expense", category: "transport", desc: "Avocado freight to export depot", amount: 180000, date: monthsAgo(2) },
    { farmIdx: 2, type: "expense", category: "fertilizer", desc: "Potassium sulfate for fruit trees", amount: 210000, date: monthsAgo(3) },
    // Income
    { farmIdx: 0, type: "income", category: "sales", desc: "Tomato sales - Ouagadougou market", amount: 540000, date: monthsAgo(1) },
    { farmIdx: 0, type: "income", category: "sales", desc: "Okra wholesale to restaurant chain", amount: 285000, date: monthsAgo(2) },
    { farmIdx: 1, type: "income", category: "sales", desc: "Moringa powder export to Europe", amount: 480000, date: monthsAgo(1) },
    { farmIdx: 1, type: "income", category: "sales", desc: "Onion sales at Niamey grand marché", amount: 360000, date: monthsAgo(1) },
    { farmIdx: 2, type: "income", category: "sales", desc: "Banana sales - Bamako wholesale", amount: 720000, date: monthsAgo(0) },
    { farmIdx: 2, type: "income", category: "sales", desc: "Avocado export container", amount: 1250000, date: monthsAgo(2) },
    { farmIdx: 2, type: "income", category: "other", desc: "Government agricultural subsidy", amount: 500000, date: monthsAgo(4) },
  ];

  for (const t of txData) {
    await query(
      `INSERT INTO transactions (farm_id, type, category, description, amount, currency, transaction_date, created_by)
       VALUES ($1, $2, $3, $4, $5, 'XOF', $6, $7)`,
      [farmIds[t.farmIdx], t.type, t.category, t.desc, t.amount, t.date, userId]
    );
  }
  console.log(`  Created ${txData.length} transactions`);

  // ─── 8. Sales ───
  console.log("8. Creating sales...");
  const salesData = [
    { farmIdx: 0, crop: "tomato", kg: 2400, priceKg: 225, buyer: "Marché Rood Woko", contact: "+226 65 00 11 22", date: monthsAgo(1) },
    { farmIdx: 0, crop: "okra", kg: 1900, priceKg: 150, buyer: "Restaurant Le Verdure", contact: "+226 70 33 44 55", date: monthsAgo(2) },
    { farmIdx: 0, crop: "pineapple", kg: 3500, priceKg: 400, buyer: "Export Tropicale SARL", contact: "+226 25 30 12 00", date: monthsAgo(3) },
    { farmIdx: 0, crop: "mango", kg: 2000, priceKg: 350, buyer: "Séchoir Mango Gold", contact: "+226 70 88 99 00", date: monthsAgo(4) },
    { farmIdx: 1, crop: "moringa", kg: 500, priceKg: 960, buyer: "Bio Sahel Export", contact: "+227 90 12 34 56", date: monthsAgo(1) },
    { farmIdx: 1, crop: "onion", kg: 4000, priceKg: 90, buyer: "Grand Marché Niamey", contact: "+227 96 78 90 12", date: monthsAgo(1) },
    { farmIdx: 1, crop: "cashew", kg: 800, priceKg: 1200, buyer: "OLAM Niger", contact: "+227 20 73 40 00", date: monthsAgo(5) },
    { farmIdx: 2, crop: "banana", kg: 8000, priceKg: 90, buyer: "Grossiste Banane Bamako", contact: "+223 76 12 34 56", date: monthsAgo(0) },
    { farmIdx: 2, crop: "avocado", kg: 5000, priceKg: 250, buyer: "AvoFresh Export", contact: "+223 66 78 90 12", date: monthsAgo(2) },
    { farmIdx: 2, crop: "papaya", kg: 3000, priceKg: 175, buyer: "Marché de Médine", contact: "+223 79 45 67 89", date: monthsAgo(1) },
    { farmIdx: 2, crop: "citrus", kg: 1500, priceKg: 200, buyer: "Jus Naturel SA", contact: "+223 66 11 22 33", date: monthsAgo(3) },
  ];

  for (const s of salesData) {
    const total = s.kg * s.priceKg;
    await query(
      `INSERT INTO sales (farm_id, crop_type, quantity_kg, price_per_kg, total_amount, currency, buyer_name, buyer_contact, sale_date, created_by)
       VALUES ($1, $2, $3, $4, $5, 'XOF', $6, $7, $8, $9)`,
      [farmIds[s.farmIdx], s.crop, s.kg, s.priceKg, total, s.buyer, s.contact, s.date, userId]
    );
  }
  console.log(`  Created ${salesData.length} sales`);

  // ─── 9. Roadmap Phases & Milestones ───
  console.log("9. Creating roadmap phases and milestones...");
  const phases = [
    {
      farmIdx: 0,
      name: "Phase 1: Foundation",
      desc: "Establish core pineapple and mango orchards with drip irrigation",
      num: 1,
      status: "in_progress",
      start: monthsAgo(12),
      end: monthsAhead(6),
      hectares: 15,
      revenue: 25000,
      milestones: [
        { title: "Clear and prepare 15 ha", cat: "infrastructure", status: "completed", date: monthsAgo(11) },
        { title: "Install drip irrigation system", cat: "infrastructure", status: "completed", date: monthsAgo(8) },
        { title: "Plant 12,000 pineapple suckers", cat: "crops", status: "completed", date: monthsAgo(10) },
        { title: "Establish mango nursery (350 trees)", cat: "crops", status: "in_progress", date: monthsAhead(2) },
        { title: "Purchase tractor and implements", cat: "equipment", status: "not_started", date: monthsAhead(4) },
        { title: "First pineapple harvest revenue", cat: "financial", status: "not_started", date: monthsAhead(2) },
      ],
    },
    {
      farmIdx: 0,
      name: "Phase 2: Expansion",
      desc: "Scale to 25 ha, add cashew orchards and processing facility",
      num: 2,
      status: "not_started",
      start: monthsAhead(6),
      end: monthsAhead(24),
      hectares: 25,
      revenue: 75000,
      milestones: [
        { title: "Clear additional 10 ha", cat: "infrastructure", status: "not_started", date: monthsAhead(7) },
        { title: "Plant cashew orchard (500 trees)", cat: "crops", status: "not_started", date: monthsAhead(8) },
        { title: "Build fruit drying facility", cat: "processing", status: "not_started", date: monthsAhead(12) },
        { title: "Reach break-even point", cat: "financial", status: "not_started", date: monthsAhead(18) },
      ],
    },
    {
      farmIdx: 1,
      name: "Phase 1: River Farm Setup",
      desc: "Establish irrigated cashew and moringa production along Niger River",
      num: 1,
      status: "in_progress",
      start: monthsAgo(8),
      end: monthsAhead(10),
      hectares: 10,
      revenue: 15000,
      milestones: [
        { title: "Secure water rights and pump installation", cat: "infrastructure", status: "completed", date: monthsAgo(7) },
        { title: "Plant moringa field (500 trees)", cat: "crops", status: "completed", date: monthsAgo(8) },
        { title: "Establish onion beds (5 ha)", cat: "crops", status: "completed", date: monthsAgo(3) },
        { title: "First moringa powder export", cat: "financial", status: "in_progress", date: monthsAhead(1) },
      ],
    },
    {
      farmIdx: 2,
      name: "Phase 1: Orchard Establishment",
      desc: "Build mixed fruit orchard for domestic and export markets",
      num: 1,
      status: "in_progress",
      start: monthsAgo(48),
      end: monthsAhead(6),
      hectares: 18,
      revenue: 40000,
      milestones: [
        { title: "Plant Hass avocado orchard (180 trees)", cat: "crops", status: "completed", date: monthsAgo(48) },
        { title: "Establish banana plantation (2000 plants)", cat: "crops", status: "completed", date: monthsAgo(14) },
        { title: "Build cold storage unit", cat: "infrastructure", status: "in_progress", date: monthsAhead(3) },
        { title: "Secure avocado export contract", cat: "financial", status: "completed", date: monthsAgo(6) },
        { title: "Acquire 20 guinea fowl for pest control", cat: "livestock", status: "completed", date: monthsAgo(10) },
      ],
    },
  ];

  for (const p of phases) {
    const phaseRes = await query(
      `INSERT INTO roadmap_phases (farm_id, name, description, phase_number, status, target_start_date, target_end_date, actual_start_date, target_hectares, target_revenue_usd)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [farmIds[p.farmIdx], p.name, p.desc, p.num, p.status, p.start, p.end, p.status !== "not_started" ? p.start : null, p.hectares, p.revenue]
    );
    const phaseId = phaseRes.rows[0].id;

    for (let i = 0; i < p.milestones.length; i++) {
      const m = p.milestones[i];
      await query(
        `INSERT INTO milestones (phase_id, title, category, status, target_date, completed_date, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [phaseId, m.title, m.cat, m.status, m.date, m.status === "completed" ? m.date : null, i + 1]
      );
    }
  }
  console.log(`  Created ${phases.length} phases with milestones`);

  // ─── 10. Livestock ───
  console.log("10. Creating livestock...");
  const livestockData = [
    { farmIdx: 0, type: "chickens", breed: "Local Improved", qty: 50, notes: "Free-range around mango orchard for pest control" },
    { farmIdx: 0, type: "guinea_fowl", breed: "Helmeted", qty: 30, notes: "Tick and insect control in cashew fields" },
    { farmIdx: 1, type: "chickens", breed: "Fayoumi", qty: 25, notes: "Egg production and compost contribution" },
    { farmIdx: 1, type: "sheep", breed: "Sahelian", qty: 8, notes: "Grazing on field borders, manure for compost" },
    { farmIdx: 2, type: "guinea_fowl", breed: "Helmeted", qty: 20, notes: "Pest control in avocado and banana fields" },
    { farmIdx: 2, type: "ducks", breed: "Muscovy", qty: 15, notes: "Snail and slug control in papaya area" },
    { farmIdx: 2, type: "chickens", breed: "Rhode Island Red", qty: 40, notes: "Egg laying flock near farm house" },
  ];

  for (const l of livestockData) {
    await query(
      `INSERT INTO livestock (farm_id, livestock_type, breed, quantity, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [farmIds[l.farmIdx], l.type, l.breed, l.qty, l.notes]
    );
  }
  console.log(`  Created ${livestockData.length} livestock entries`);

  // ─── 11. Farm Zones ───
  console.log("11. Creating farm zones...");
  const zoneData = [
    { farmIdx: 0, type: "zone_0_core", name: "Farm Office & Storage", size: 0.5, desc: "Main office, tool storage, and packing shed" },
    { farmIdx: 0, type: "zone_1_intensive", name: "Pineapple Intensive Zone", size: 8.0, desc: "High-value pineapple production with drip irrigation" },
    { farmIdx: 0, type: "zone_2_semi_intensive", name: "Mango & Cashew Orchards", size: 12.0, desc: "Fruit tree orchards with moderate management" },
    { farmIdx: 0, type: "zone_3_extensive", name: "Grazing & Fallow", size: 3.5, desc: "Rotational grazing for livestock, fallow recovery" },
    { farmIdx: 0, type: "buffer", name: "Windbreak Hedgerow", size: 1.0, desc: "Neem and eucalyptus windbreak along northern edge" },
    { farmIdx: 1, type: "zone_0_core", name: "Pump Station & Office", size: 0.3, desc: "River pump, water treatment, and field office" },
    { farmIdx: 1, type: "zone_1_intensive", name: "Moringa & Vegetables", size: 9.5, desc: "Irrigated moringa and market garden" },
    { farmIdx: 1, type: "zone_2_semi_intensive", name: "Cashew Plantation", size: 6.0, desc: "Young cashew trees with intercropping" },
    { farmIdx: 2, type: "zone_0_core", name: "Farmhouse & Nursery", size: 0.5, desc: "Living quarters, seedling nursery, cold storage" },
    { farmIdx: 2, type: "zone_1_intensive", name: "Banana & Papaya", size: 11.0, desc: "Dense tropical fruit production" },
    { farmIdx: 2, type: "zone_2_semi_intensive", name: "Avocado & Citrus Groves", size: 6.5, desc: "Established fruit tree groves" },
  ];

  for (const z of zoneData) {
    await query(
      `INSERT INTO farm_zones (farm_id, zone_type, name, size_hectares, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [farmIds[z.farmIdx], z.type, z.name, z.size, z.desc]
    );
  }
  console.log(`  Created ${zoneData.length} farm zones`);

  // ─── 12. Logistics Orders ───
  console.log("12. Creating logistics orders...");
  const logisticsData = [
    { farmIdx: 0, type: "distribution", status: "delivered", origin: "Bobo-Dioulasso", dest: "Ouagadougou", cargo: "2400 kg fresh tomatoes", weight: 2400, vehicle: "Refrigerated truck 10T", estCost: 150, actCost: 135, scheduled: monthsAgo(1), completed: monthsAgo(1) },
    { farmIdx: 0, type: "equipment_delivery", status: "delivered", origin: "Ouagadougou", dest: "Bobo-Dioulasso", cargo: "Drip irrigation components (pipes, emitters, filters)", weight: 850, vehicle: "Flatbed truck 5T", estCost: 200, actCost: 210, scheduled: monthsAgo(8), completed: monthsAgo(8) },
    { farmIdx: 0, type: "solar_installation", status: "scheduled", origin: "Ouagadougou", dest: "Bobo-Dioulasso", cargo: "Solar panel system (5kW) for pump and cold storage", weight: 350, vehicle: "Van", estCost: 3500, actCost: null, scheduled: monthsAhead(2), completed: null },
    { farmIdx: 1, type: "distribution", status: "in_transit", origin: "Niamey", dest: "Cotonou, Benin", cargo: "500 kg moringa powder (export)", weight: 500, vehicle: "Container truck 20T", estCost: 450, actCost: null, scheduled: monthsAgo(0), completed: null },
    { farmIdx: 1, type: "storage", status: "stored", origin: "Niamey", dest: "Niamey Cold Store", cargo: "4000 kg onions for price stabilization", weight: 4000, vehicle: "Local pickup", estCost: 50, actCost: 45, scheduled: monthsAgo(1), completed: monthsAgo(1) },
    { farmIdx: 2, type: "distribution", status: "delivered", origin: "Bamako", dest: "Dakar, Senegal", cargo: "5000 kg Hass avocados (export)", weight: 5000, vehicle: "Refrigerated container 40ft", estCost: 800, actCost: 780, scheduled: monthsAgo(2), completed: monthsAgo(2) },
    { farmIdx: 2, type: "processing_transport", status: "pending", origin: "Bamako", dest: "Bamako Industrial Zone", cargo: "3000 kg papaya for juice processing", weight: 3000, vehicle: "Truck 10T", estCost: 80, actCost: null, scheduled: monthsAhead(1), completed: null },
    { farmIdx: 2, type: "equipment_delivery", status: "scheduled", origin: "Abidjan, Côte d'Ivoire", dest: "Bamako", cargo: "Cold storage unit (20m³) and generator", weight: 2500, vehicle: "Heavy transport", estCost: 1200, actCost: null, scheduled: monthsAhead(3), completed: null },
  ];

  for (const l of logisticsData) {
    await query(
      `INSERT INTO logistics_orders (farm_id, order_type, status, origin, destination, cargo_description, weight_kg, vehicle_info, estimated_cost_usd, actual_cost_usd, scheduled_date, completed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [farmIds[l.farmIdx], l.type, l.status, l.origin, l.dest, l.cargo, l.weight, l.vehicle, l.estCost, l.actCost, l.scheduled, l.completed]
    );
  }
  console.log(`  Created ${logisticsData.length} logistics orders`);

  // ─── 13. Training Programs & Enrollments ───
  console.log("13. Creating training programs and enrollments...");
  const trainingData = [
    {
      farmIdx: 0,
      name: "Pineapple Cultivation Intensive",
      desc: "Hands-on training for young farmers in pineapple cultivation, from soil preparation to post-harvest handling.",
      status: "in_progress",
      location: "Domaine Fructo Bobo, Bobo-Dioulasso",
      start: monthsAgo(2),
      end: monthsAhead(4),
      maxPart: 20,
      curriculum: ["Soil preparation", "Sucker selection", "Planting techniques", "Drip irrigation", "Fertilization", "Pest management", "Harvesting", "Post-harvest handling"],
      weeks: 24,
      enrollments: [
        { name: "Ouédraogo Ibrahim", age: 22, phone: "+226 70 11 22 33", village: "Bama", status: "in_progress" },
        { name: "Traoré Fatoumata", age: 19, phone: "+226 76 44 55 66", village: "Banfora", status: "in_progress" },
        { name: "Sanou Moussa", age: 24, phone: "+226 65 77 88 99", village: "Orodara", status: "in_progress" },
        { name: "Kaboré Aminata", age: 20, phone: "+226 70 22 33 44", village: "Dédougou", status: "in_progress" },
        { name: "Diallo Souleymane", age: 23, phone: "+226 76 55 66 77", village: "Bobo-Dioulasso", status: "enrolled" },
      ],
    },
    {
      farmIdx: 1,
      name: "Moringa Value Chain Training",
      desc: "Training youth in moringa leaf production, drying, powder processing, and export market requirements.",
      status: "enrolling",
      location: "Ferme Sahel Niamey",
      start: monthsAhead(1),
      end: monthsAhead(4),
      maxPart: 15,
      curriculum: ["Moringa agronomy", "Leaf harvesting", "Solar drying", "Powder processing", "Quality control", "Export packaging", "Market linkages"],
      weeks: 12,
      enrollments: [
        { name: "Abdou Hamidou", age: 21, phone: "+227 96 11 22 33", village: "Say", status: "enrolled" },
        { name: "Mariama Issaka", age: 18, phone: "+227 90 44 55 66", village: "Tillabéri", status: "applied" },
        { name: "Adamou Boubacar", age: 25, phone: "+227 96 77 88 99", village: "Dosso", status: "applied" },
      ],
    },
    {
      farmIdx: 2,
      name: "Tropical Fruit Farm Management",
      desc: "Comprehensive training for aspiring farm managers covering avocado, banana, and papaya commercial production.",
      status: "completed",
      location: "Exploitation Bamako Sud",
      start: monthsAgo(8),
      end: monthsAgo(2),
      maxPart: 12,
      curriculum: ["Farm planning", "Orchard establishment", "Irrigation systems", "Financial management", "Labor management", "Market analysis", "Export logistics"],
      weeks: 24,
      enrollments: [
        { name: "Konaté Amadou", age: 26, phone: "+223 76 11 22 33", village: "Kati", status: "completed" },
        { name: "Diarra Oumou", age: 22, phone: "+223 66 44 55 66", village: "Koulikoro", status: "completed" },
        { name: "Coulibaly Drissa", age: 24, phone: "+223 79 77 88 99", village: "Ségou", status: "completed" },
        { name: "Keita Aissata", age: 20, phone: "+223 76 22 33 44", village: "Sikasso", status: "completed" },
        { name: "Sidibé Mamadou", age: 23, phone: "+223 66 55 66 77", village: "Bamako", status: "dropped" },
      ],
    },
  ];

  for (const tp of trainingData) {
    const res = await query(
      `INSERT INTO training_programs (farm_id, name, description, status, location, start_date, end_date, max_participants, curriculum_areas, duration_weeks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [farmIds[tp.farmIdx], tp.name, tp.desc, tp.status, tp.location, tp.start, tp.end, tp.maxPart, JSON.stringify(tp.curriculum), tp.weeks]
    );
    const progId = res.rows[0].id;

    for (const e of tp.enrollments) {
      await query(
        `INSERT INTO training_enrollments (program_id, participant_name, participant_age, participant_phone, home_village, status, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [progId, e.name, e.age, e.phone, e.village, e.status, e.status === "completed" ? monthsAgo(2) : null]
      );
    }
  }
  console.log(`  Created ${trainingData.length} programs with enrollments`);

  // ─── Done ───
  console.log("\nSeeding complete.");
  await pool.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  pool.end();
  process.exit(1);
});
