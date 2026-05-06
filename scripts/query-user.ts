import { Client } from "pg";
import "dotenv/config";

const client = new Client({ connectionString: process.env.DATABASE_URL as string });
await client.connect();

async function main() {
  const { rows: tables } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log("Tables:", tables.map((t: Record<string, string>) => t.tablename).join(", "));

  try {
    const { rows: authUsers } = await client.query('SELECT id, email, name FROM "user" LIMIT 5');
    console.log("Auth users:", JSON.stringify(authUsers, null, 2));
  } catch (e: unknown) {
    console.log("No user table:", (e as Error).message);
  }

  try {
    const { rows: appUsers } = await client.query("SELECT id, email, name, role FROM users LIMIT 5");
    console.log("App users:", JSON.stringify(appUsers, null, 2));
  } catch (e: unknown) {
    console.log("No users table:", (e as Error).message);
  }
}

main().then(() => client.end()).catch((e) => { client.end(); console.error(e); });
