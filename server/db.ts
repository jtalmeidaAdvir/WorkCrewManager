import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if SQL Server is configured
const isSqlServerConfigured = process.env.DB_SERVER && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

if (!isSqlServerConfigured && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL or SQL Server configuration must be set. Configure DB_SERVER, DB_USER, DB_PASSWORD, and DB_NAME for SQL Server.",
  );
}

// Only create PostgreSQL connection if DATABASE_URL exists and no SQL Server config
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL && !isSqlServerConfigured) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // SQL Server will be handled by sqlserver.ts
  pool = null;
  db = null;
}

export { pool, db };