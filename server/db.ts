import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn("DATABASE_URL not found. Database operations will be disabled until a PostgreSQL database is provisioned.");
  // Create placeholder pool and db that will throw helpful errors
  pool = null as any;
  db = new Proxy({} as any, {
    get() {
      throw new Error("Database not configured. Please provision a PostgreSQL database in Replit and set DATABASE_URL environment variable.");
    }
  });
}

export { pool, db };