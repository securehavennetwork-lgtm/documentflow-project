import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

console.log("📡 Using connection string:", connectionString.replace(/:.*@/, ":****@")); 
// <-- esto enmascara tu password, pero confirma que sí se carga

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // necesario para Neon
  },
});

export const db = drizzle(pool, { schema });

// Test connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}