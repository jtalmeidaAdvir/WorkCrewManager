import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if SQL Server is configured
const isSqlServerConfigured = process.env.DB_SERVER && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

// Only require configuration if we're trying to use PostgreSQL
// SQL Server configuration is optional and handled by sqlserver.ts

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