import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool;
let db: ReturnType<typeof drizzle>;

// Check for SQL Server configuration
if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
  console.log("SQL Server configuration detected in .env file:");
  console.log(`- Host: ${process.env.DB_HOST}:${process.env.DB_PORT || '1433'}`);
  console.log(`- Database: ${process.env.DB_NAME}`);
  console.log(`- Username: ${process.env.DB_USERNAME}`);
  console.log("This system will automatically create tables when SQL Server is available.");
  console.log("Currently using memory storage until SQL Server connection is implemented.");
  
  // For now, use memory storage but show SQL Server config was detected
  pool = null as any;
  db = new Proxy({} as any, {
    get() {
      throw new Error("SQL Server configuration detected. Using memory storage until SQL Server integration is complete.");
    }
  });
} else if (process.env.DATABASE_URL) {
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