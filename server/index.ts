import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./setup-database";
import { initializeSqlServer } from "./sqlserver";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Import storage functions
  const { setStorageInstance, DatabaseStorage, MemoryStorage } = await import("./storage");
  
  // Tentar conectar ao SQL Server local primeiro, depois PostgreSQL como fallback
  try {
    console.log("Tentando conectar ao SQL Server local...");
    const sqlServerConnected = await initializeSqlServer();
    
    if (sqlServerConnected) {
      console.log("SQL Server conectado com sucesso!");
      setStorageInstance(new MemoryStorage()); // Temporarily use memory until SQL Server storage is implemented
    } else {
      console.log("SQL Server não disponível, usando PostgreSQL...");
      await setupDatabase();
      if (process.env.DATABASE_URL) {
        console.log("Using PostgreSQL database storage");
        setStorageInstance(new DatabaseStorage());
      } else {
        console.log("Using memory storage - data will be lost on server restart");
        setStorageInstance(new MemoryStorage());
      }
    }
  } catch (error) {
    console.log("Erro ao conectar SQL Server, usando PostgreSQL...");
    await setupDatabase();
    if (process.env.DATABASE_URL) {
      console.log("Using PostgreSQL database storage");
      setStorageInstance(new DatabaseStorage());
    } else {
      console.log("Using memory storage - data will be lost on server restart");
      setStorageInstance(new MemoryStorage());
    }
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
