/**
 * Standalone Drizzle migration runner — invoked by the ArgoCD PreSync Job
 * before each Deployment rolls. Idempotent: drizzle-orm tracks applied
 * migrations in `__drizzle_migrations` and skips re-runs.
 *
 * Usage:
 *   DATABASE_URL=... bun scripts/migrate.ts
 *
 * Run via Kubernetes Job at workloads/fructosahel/job-migrate.yaml.
 */
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[migrate] DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = drizzle(pool as any);

  const safeUrl = url.replace(/\/\/[^@]+@/, "//***@");
  console.log(`[migrate] applying migrations from ./drizzle against ${safeUrl}`);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[migrate] complete");
  } catch (err) {
    console.error("[migrate] FAILED", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
