import { Pool } from "pg";
import { readFileSync } from "fs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });

async function runMigration(file: string) {
  console.log(`\nRunning ${file}...`);
  const content = readFileSync(file, "utf-8");
  const statements = content
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split("\n").some((line) => line.trim().length > 0 && !line.trim().startsWith("--")));

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      console.log("  OK:", stmt.replace(/\n/g, " ").slice(0, 70));
    } catch (e: unknown) {
      const msg = (e as Error).message || "";
      console.log("  SKIP:", msg.slice(0, 80));
    }
  }
}

async function main() {
  await runMigration("drizzle/0001_add_crop_image_url.sql");
  await runMigration("drizzle/0002_add_roadmap_and_livestock.sql");
  await runMigration("drizzle/0003_add_logistics_and_training.sql");
  console.log("\nAll migrations complete.");
  await pool.end();
}

main().catch(console.error);
