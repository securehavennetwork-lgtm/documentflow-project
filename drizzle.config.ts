import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv"; // <-- Agrega esta línea

dotenv.config({ path: "client/.env" }); // <-- Agrega esta línea con la ruta correcta

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});