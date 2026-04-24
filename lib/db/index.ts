// Database client — CNPG / standard PostgreSQL via pg (node-postgres).
//
// Previously used @neondatabase/serverless (Neon HTTP WebSocket driver) which
// is Neon-specific. After migrating to self-hosted CNPG in k3s the DATABASE_URL
// points to a standard TCP endpoint
// (postgresql://user:pass@host:5432/db?sslmode=disable) that the Neon HTTP
// driver cannot reach. Swap follows the pattern in codenalytics commit ed2377b.
//
// drizzle-orm/node-postgres uses the pg Pool directly — no driver adapter
// indirection needed (unlike PrismaPg). Call-site ergonomics are unchanged:
//   db.query.*, db.select(), db.insert(), db.update(), db.delete()
// all work identically.

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: NodePgDatabase<typeof schema> | undefined;
  pool: Pool | undefined;
};

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please add it to your .env.local file.",
    );
  }
  return connectionString;
}

function getPool(): Pool {
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: getConnectionString(),
      max: 10,
    });
  }
  return globalForDb.pool;
}

function getDatabase(): NodePgDatabase<typeof schema> {
  if (!globalForDb.db) {
    globalForDb.db = drizzle(getPool(), { schema });
  }
  return globalForDb.db;
}

// Export a proxy that lazily initializes on first use — avoids build-time
// errors when DATABASE_URL is not set during static page collection.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const database = getDatabase();
    const value = database[prop as keyof typeof database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

export * from "./schema";
