import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, generatePassword } from "./auth";
import {
  insertObraSchema,
  insertRegistoPontoSchema,
  insertEquipaObraSchema,
  insertEquipaMembrosSchema,
  insertPartesDiariasSchema,
} from "@shared/schema";
import crypto from "crypto";

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Authorization middleware
const isDirector = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user;
  if (user.tipoUser !== "Diretor") {
    return res.status(403).json({ message: "Access denied. Director access required." });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);



  // Obras routes
  app.get("/api/obras", isAuthenticated, async (req, res) => {
    try {
      const obras = await storage.getObras();
      res.json(obras);
    } catch (error) {
      console.error("Error fetching obras:", error);
      res.status(500).json({ message: "Failed to fetch obras" });
    }
  });

  app.post("/api/obras", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.tipoUser !== "Diretor") {
        return res.status(403).json({ message: "Only Directors can create obras" });
      }

      // Generate QR code
      const qrCode = crypto.randomUUID();
      const obraData = { ...req.body, qrCode };
      
      const validatedData = insertObraSchema.parse(obraData);
      const obra = await storage.createObra(validatedData);
      res.json(obra);
    } catch (error) {
      console.error("Error creating obra:", error);
      res.status(500).json({ message: "Failed to create obra" });
    }
  });

  app.get("/api/obras/qr/:qrCode", isAuthenticated, async (req, res) => {
    try {
      const obra = await storage.getObraByQRCode(req.params.qrCode);
      if (!obra) {
        return res.status(404).json({ message: "Obra not found" });
      }
      res.json(obra);
    } catch (error) {
      console.error("Error fetching obra by QR:", error);
      res.status(500).json({ message: "Failed to fetch obra" });
    }
  });

  // Registo Ponto routes
  app.get("/api/registo-ponto", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const registos = await storage.getRegistosPonto(userId);
      res.json(registos);
    } catch (error) {
      console.error("Error fetching registos:", error);
      res.status(500).json({ message: "Failed to fetch registos" });
    }
  });

  app.get("/api/registo-ponto/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      const registo = await storage.getRegistoPontoByDate(userId, today);
      res.json(registo || null);
    } catch (error) {
      console.error("Error fetching today's registo:", error);
      res.status(500).json({ message: "Failed to fetch today's registo" });
    }
  });

  app.post("/api/registo-ponto/clock-in", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      // Check if already clocked in today
      const existingRegisto = await storage.getRegistoPontoByDate(userId, today);
      if (existingRegisto && existingRegisto.horaEntrada) {
        return res.status(400).json({ message: "Already clocked in today" });
      }

      const registoData = {
        userId,
        data: today,
        horaEntrada: now,
        obraId: req.body.obraId,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      };

      const validatedData = insertRegistoPontoSchema.parse(registoData);
      
      if (existingRegisto) {
        const registo = await storage.updateRegistoPonto(existingRegisto.id, validatedData);
        res.json(registo);
      } else {
        const registo = await storage.createRegistoPonto(validatedData);
        res.json(registo);
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/registo-ponto/clock-out", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];

      const existingRegisto = await storage.getRegistoPontoByDate(userId, today);
      if (!existingRegisto || !existingRegisto.horaEntrada) {
        return res.status(400).json({ message: "Not clocked in today" });
      }

      if (existingRegisto.horaSaida) {
        return res.status(400).json({ message: "Already clocked out today" });
      }

      // Calculate total hours
      const entrada = new Date(`${today}T${existingRegisto.horaEntrada}`);
      const saida = new Date(`${today}T${now}`);
      const totalHours = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);

      const updateData = {
        horaSaida: now,
        totalHorasTrabalhadas: totalHours.toString(),
        totalTempoIntervalo: req.body.totalTempoIntervalo || "0",
      };

      const registo = await storage.updateRegistoPonto(existingRegisto.id, updateData);
      res.json(registo);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Equipas routes
  app.get("/api/equipas", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let equipas;
      if (user.tipoUser === "Diretor") {
        equipas = await storage.getEquipas();
      } else if (user.tipoUser === "Encarregado") {
        equipas = await storage.getEquipasByEncarregado(user.id);
      } else {
        equipas = await storage.getEquipasByMembro(user.id);
      }

      res.json(equipas);
    } catch (error) {
      console.error("Error fetching equipas:", error);
      res.status(500).json({ message: "Failed to fetch equipas" });
    }
  });

  app.post("/api/equipas", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || (user.tipoUser !== "Diretor" && user.tipoUser !== "Encarregado")) {
        return res.status(403).json({ message: "Only Directors and Supervisors can create teams" });
      }

      const equipaData = {
        ...req.body,
        encarregadoId: req.body.encarregadoId || user.id,
      };

      const validatedData = insertEquipaObraSchema.parse(equipaData);
      const equipa = await storage.createEquipa(validatedData);
      res.json(equipa);
    } catch (error) {
      console.error("Error creating equipa:", error);
      res.status(500).json({ message: "Failed to create equipa" });
    }
  });

  app.post("/api/equipas/:equipaId/members", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || (user.tipoUser !== "Diretor" && user.tipoUser !== "Encarregado")) {
        return res.status(403).json({ message: "Only Directors and Supervisors can add team members" });
      }

      const memberData = {
        equipaId: parseInt(req.params.equipaId),
        userId: req.body.userId,
      };

      const validatedData = insertEquipaMembrosSchema.parse(memberData);
      const member = await storage.addMembroToEquipa(validatedData);
      res.json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  // Partes Diarias routes
  app.get("/api/partes-diarias", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const partes = await storage.getPartesDiarias(userId);
      res.json(partes);
    } catch (error) {
      console.error("Error fetching partes diarias:", error);
      res.status(500).json({ message: "Failed to fetch partes diarias" });
    }
  });

  app.post("/api/partes-diarias", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const parteData = {
        ...req.body,
        userId,
      };

      const validatedData = insertPartesDiariasSchema.parse(parteData);
      const parte = await storage.createParteDiaria(validatedData);
      res.json(parte);
    } catch (error) {
      console.error("Error creating parte diaria:", error);
      res.status(500).json({ message: "Failed to create parte diaria" });
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User management routes
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.tipoUser !== "Diretor" && user.tipoUser !== "Encarregado")) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || user.tipoUser !== "Diretor") {
        return res.status(403).json({ message: "Only Directors can create users" });
      }
      
      const { firstName, lastName, email, tipoUser } = req.body;
      
      if (!firstName || !lastName || !email || !tipoUser) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (!["Trabalhador", "Encarregado", "Diretor"].includes(tipoUser)) {
        return res.status(400).json({ message: "Invalid user type" });
      }
      
      // Generate username and password
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
      const password = generatePassword();
      const hashedPassword = await hashPassword(password);
      
      // Generate unique ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const newUser = await storage.createUser({
        id: userId,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        tipoUser,
      });

      // Return user with plain password for the director to share
      res.json({
        user: newUser,
        credentials: {
          username,
          password // Plain password to share with the new user
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/user/change-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { tipoUser } = req.body;
      
      if (!["Trabalhador", "Encarregado", "Diretor"].includes(tipoUser)) {
        return res.status(400).json({ message: "Invalid user type" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUserType(userId, tipoUser);
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error changing user role:", error);
      res.status(500).json({ message: "Failed to change user role" });
    }
  });

  // Endpoint para diretor ver credenciais de um utilizador
  app.get("/api/users/:userId/credentials", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.tipoUser !== "Diretor") {
        return res.status(403).json({ message: "Only Directors can view user credentials" });
      }

      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Retorna só o username (a senha não pode ser recuperada por estar hasheada)
      res.json({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        message: "A senha está encriptada e não pode ser recuperada. Se necessário, crie um novo utilizador."
      });
    } catch (error) {
      console.error("Error fetching user credentials:", error);
      res.status(500).json({ message: "Failed to fetch user credentials" });
    }
  });

  // Endpoint para diretor redefinir senha de um utilizador
  app.post("/api/users/:userId/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || currentUser.tipoUser !== "Diretor") {
        return res.status(403).json({ message: "Only Directors can reset passwords" });
      }

      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate new password and hash it
      const newPassword = generatePassword();
      const hashedPassword = await hashPassword(newPassword);

      // Update user password in database
      await storage.updateUserPassword(userId, hashedPassword);

      res.json({
        username: user.username,
        newPassword: newPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        message: "Password reset successfully"
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
