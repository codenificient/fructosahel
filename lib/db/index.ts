import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Switched from `@neondatabase/serverless` (Neon HTTP driver) to `pg`
// (node-postgres, raw TCP) after moving off Neon to self-hosted CNPG
// inside k3s (afrotomation-pg-rw.postgres.svc.cluster.local).

// Lazy initialization to avoid build-time errors
let _pool: Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

function getDb(): NodePgDatabase<typeof schema> {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please add it to your .env.local file.",
    );
  }

  _pool = new Pool({ connectionString, max: 10 });
  _db = drizzle(_pool, { schema });
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const database = getDb();
    const value = database[prop as keyof typeof database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

export * from "./schema";
