import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL as string);

async function main() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log("Tables:", tables.map((t: Record<string, string>) => t.tablename).join(", "));

  try {
    const authUsers = await sql`SELECT id, email, name FROM "user" LIMIT 5`;
    console.log("Auth users:", JSON.stringify(authUsers, null, 2));
  } catch (e: unknown) {
    console.log("No user table:", (e as Error).message);
  }

  try {
    const appUsers = await sql`SELECT id, email, name, role FROM users LIMIT 5`;
    console.log("App users:", JSON.stringify(appUsers, null, 2));
  } catch (e: unknown) {
    console.log("No users table:", (e as Error).message);
  }
}

main().catch(console.error);
