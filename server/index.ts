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
  const { SqlServerStorage } = await import("./sqlServerStorage");
  
  // Conectar APENAS ao SQL Server local - base dados Advir
  try {
    console.log("Tentando conectar à sua base SQL Server existente...");
    const sqlServerConnected = await initializeSqlServer();
    
    if (sqlServerConnected) {
      console.log("✅ Conectado à base de dados Advir com sucesso!");
      console.log("🔄 Usando SQL Server storage...");
      const sqlStorage = new SqlServerStorage();
      setStorageInstance(sqlStorage);
      
      // Create initial admin user if it doesn't exist
      try {
        const adminUser = await sqlStorage.getUserByUsername('admin');
        if (!adminUser) {
          const { hashPassword } = await import("./auth");
          const hashedPassword = await hashPassword('admin123');
          await sqlStorage.createUser({
            id: 'admin-1',
            username: 'admin',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'System',
            email: 'admin@system.com',
            tipoUser: 'Diretor'
          });
          console.log("✅ Utilizador admin criado - username: admin, password: admin123");
        } else {
          console.log("✅ Utilizador admin já existe");
        }
      } catch (error) {
        console.error("Erro ao criar utilizador admin:", error);
      }
    } else {
      console.log("❌ SQL Server local não acessível do Replit (normal)");
      console.log("💡 SOLUÇÕES:");
      console.log("1. Usar Azure SQL Database (cloud)");
      console.log("2. Criar túnel para PC local");
      console.log("3. Usar PostgreSQL temporariamente");
      console.log("");
      console.log("🔄 Usando PostgreSQL temporariamente para funcionar...");
      
      // Try to set up PostgreSQL database first
      try {
        await setupDatabase();
        const dbStorage = new DatabaseStorage();
        setStorageInstance(dbStorage);
        
        // Create initial admin user if it doesn't exist
        try {
          const adminUser = await dbStorage.getUserByUsername('admin');
          if (!adminUser) {
            const { hashPassword } = await import("./auth");
            const hashedPassword = await hashPassword('admin123');
            await dbStorage.createUser({
              id: 'admin-1',
              username: 'admin',
              password: hashedPassword,
              firstName: 'Admin',
              lastName: 'System',
              email: 'admin@system.com',
              tipoUser: 'Diretor'
            });
            console.log("✅ Utilizador admin criado - username: admin, password: admin123");
          } else {
            console.log("✅ Utilizador admin já existe");
          }
        } catch (error) {
          console.error("Erro ao criar utilizador admin:", error);
        }
        
        console.log("✅ Aplicação funcionando com PostgreSQL");
      } catch (dbError) {
        console.log("⚠️ PostgreSQL não disponível, usando memória temporária");
        setStorageInstance(new MemoryStorage());
        console.log("✅ Aplicação funcionando (dados temporários)");
      }
    }
  } catch (error) {
    console.log("❌ ERRO ao conectar SQL Server:", error);
    console.log("🔄 Usando PostgreSQL como fallback...");
    
    // Try to set up PostgreSQL database first
    try {
      await setupDatabase();
      const dbStorage = new DatabaseStorage();
      setStorageInstance(dbStorage);
      
      // Create initial admin user if it doesn't exist
      try {
        const adminUser = await dbStorage.getUserByUsername('admin');
        if (!adminUser) {
          const { hashPassword } = await import("./auth");
          const hashedPassword = await hashPassword('admin123');
          await dbStorage.createUser({
            id: 'admin-1',
            username: 'admin',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'System',
            email: 'admin@system.com',
            tipoUser: 'Diretor'
          });
          console.log("✅ Utilizador admin criado - username: admin, password: admin123");
        } else {
          console.log("✅ Utilizador admin já existe");
        }
      } catch (error) {
        console.error("Erro ao criar utilizador admin:", error);
      }
      
      console.log("✅ Aplicação funcionando com PostgreSQL");
    } catch (dbError) {
      console.log("⚠️ PostgreSQL não disponível, usando memória temporária");
      setStorageInstance(new MemoryStorage());
      console.log("✅ Aplicação funcionando (dados temporários)");
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
