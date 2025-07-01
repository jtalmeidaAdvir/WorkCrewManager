import {
  users,
  obras,
  registoPonto,
  equipaObra,
  equipaMembros,
  partesDiarias,
  type User,
  type UpsertUser,
  type Obra,
  type InsertObra,
  type RegistoPonto,
  type InsertRegistoPonto,
  type EquipaObra,
  type InsertEquipaObra,
  type EquipaMembros,
  type InsertEquipaMembros,
  type PartesDiarias,
  type InsertPartesDiarias,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserType(id: string, tipoUser: string): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Obra operations
  getObras(): Promise<Obra[]>;
  getObra(id: number): Promise<Obra | undefined>;
  getObraByQRCode(qrCode: string): Promise<Obra | undefined>;
  createObra(obra: InsertObra): Promise<Obra>;
  updateObra(id: number, obra: Partial<InsertObra>): Promise<Obra>;
  
  // Registo Ponto operations
  getRegistosPonto(userId: string): Promise<RegistoPonto[]>;
  getRegistoPontoByDate(userId: string, date: string): Promise<RegistoPonto | undefined>;
  createRegistoPonto(registo: InsertRegistoPonto): Promise<RegistoPonto>;
  updateRegistoPonto(id: number, registo: Partial<InsertRegistoPonto>): Promise<RegistoPonto>;
  
  // Equipa operations
  getEquipas(): Promise<(EquipaObra & { obra: Obra; encarregado: User; membros: (EquipaMembros & { user: User })[] })[]>;
  getEquipasByEncarregado(encarregadoId: string): Promise<(EquipaObra & { obra: Obra; membros: (EquipaMembros & { user: User })[] })[]>;
  getEquipasByMembro(userId: string): Promise<(EquipaObra & { obra: Obra; encarregado: User })[]>;
  createEquipa(equipa: InsertEquipaObra): Promise<EquipaObra>;
  addMembroToEquipa(equipaMembro: InsertEquipaMembros): Promise<EquipaMembros>;
  removeMembroFromEquipa(equipaId: number, userId: string): Promise<void>;
  
  // Partes Diarias operations
  getPartesDiarias(userId: string): Promise<(PartesDiarias & { obra: Obra })[]>;
  getPartesDiariasByObra(obraId: number): Promise<(PartesDiarias & { user: User })[]>;
  createParteDiaria(parte: InsertPartesDiarias): Promise<PartesDiarias>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    hoursToday: number;
    hoursWeek: number;
    activeProjects: number;
    teamMembers: number;
  }>;
}

// Memory Storage implementation for when database is not available
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private obras: Obra[] = [];
  private registosPonto: RegistoPonto[] = [];
  private equipas: EquipaObra[] = [];
  private equipaMembros: EquipaMembros[] = [];
  private partesDiarias: PartesDiarias[] = [];
  
  private nextUserId = 1;
  private nextObraId = 1;
  private nextRegistoId = 1;
  private nextEquipaId = 1;
  private nextParteId = 1;

  constructor() {
    // Create default admin user with hashed password
    this.users.push({
      id: "admin",
      username: "admin",
      password: "415fcda5e3ba8ea5fb450927d2351e84dc4733f341f02ab1cbcb9c5f87c53d59f77f5db66c39e332772ffafe4ac0722e1ef101a301b4a4e131e678cf75beabf3.92f33c3d2aa82613bc3204201e2e7514", // hashed "admin123"
      email: "admin@constructpro.com",
      tipoUser: "Diretor",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === userData.id);
    const now = new Date();
    
    if (existingIndex >= 0) {
      this.users[existingIndex] = {
        ...this.users[existingIndex],
        ...userData,
        updatedAt: now,
      };
      return this.users[existingIndex];
    } else {
      const newUser: User = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      } as User;
      this.users.push(newUser);
      return newUser;
    }
  }

  async updateUserType(id: string, tipoUser: string): Promise<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    user.tipoUser = tipoUser;
    user.updatedAt = new Date();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    user.password = hashedPassword;
    user.updatedAt = new Date();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...userData,
      id: userData.id || String(this.nextUserId++),
      createdAt: now,
      updatedAt: now,
    } as User;
    this.users.push(newUser);
    return newUser;
  }

  async getObras(): Promise<Obra[]> {
    return [...this.obras];
  }

  async getObra(id: number): Promise<Obra | undefined> {
    return this.obras.find(o => o.id === id);
  }

  async getObraByQRCode(qrCode: string): Promise<Obra | undefined> {
    return this.obras.find(o => o.qrCode === qrCode);
  }

  async createObra(obra: InsertObra): Promise<Obra> {
    const newObra: Obra = {
      ...obra,
      id: this.nextObraId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Obra;
    this.obras.push(newObra);
    return newObra;
  }

  async updateObra(id: number, obra: Partial<InsertObra>): Promise<Obra> {
    const existingObra = this.obras.find(o => o.id === id);
    if (!existingObra) throw new Error("Obra not found");
    Object.assign(existingObra, obra, { updatedAt: new Date() });
    return existingObra;
  }

  async getRegistosPonto(userId: string): Promise<RegistoPonto[]> {
    return this.registosPonto.filter(r => r.userId === userId);
  }

  async getRegistoPontoByDate(userId: string, date: string): Promise<RegistoPonto | undefined> {
    return this.registosPonto.find(r => r.userId === userId && r.data === date);
  }

  async createRegistoPonto(registo: InsertRegistoPonto): Promise<RegistoPonto> {
    const newRegisto: RegistoPonto = {
      ...registo,
      id: this.nextRegistoId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as RegistoPonto;
    this.registosPonto.push(newRegisto);
    return newRegisto;
  }

  async updateRegistoPonto(id: number, registo: Partial<InsertRegistoPonto>): Promise<RegistoPonto> {
    const existing = this.registosPonto.find(r => r.id === id);
    if (!existing) throw new Error("Registo not found");
    Object.assign(existing, registo, { updatedAt: new Date() });
    return existing;
  }

  async getEquipas(): Promise<(EquipaObra & { obra: Obra; encarregado: User; membros: (EquipaMembros & { user: User })[] })[]> {
    return this.equipas.map(equipa => ({
      ...equipa,
      obra: this.obras.find(o => o.id === equipa.obraId)!,
      encarregado: this.users.find(u => u.id === equipa.encarregadoId)!,
      membros: this.equipaMembros
        .filter(m => m.equipaId === equipa.id)
        .map(m => ({
          ...m,
          user: this.users.find(u => u.id === m.userId)!
        }))
    }));
  }

  async getEquipasByEncarregado(encarregadoId: string): Promise<(EquipaObra & { obra: Obra; membros: (EquipaMembros & { user: User })[] })[]> {
    return this.equipas
      .filter(e => e.encarregadoId === encarregadoId)
      .map(equipa => ({
        ...equipa,
        obra: this.obras.find(o => o.id === equipa.obraId)!,
        membros: this.equipaMembros
          .filter(m => m.equipaId === equipa.id)
          .map(m => ({
            ...m,
            user: this.users.find(u => u.id === m.userId)!
          }))
      }));
  }

  async getEquipasByMembro(userId: string): Promise<(EquipaObra & { obra: Obra; encarregado: User })[]> {
    const userEquipas = this.equipaMembros.filter(m => m.userId === userId);
    return userEquipas.map(m => {
      const equipa = this.equipas.find(e => e.id === m.equipaId)!;
      return {
        ...equipa,
        obra: this.obras.find(o => o.id === equipa.obraId)!,
        encarregado: this.users.find(u => u.id === equipa.encarregadoId)!
      };
    });
  }

  async createEquipa(equipa: InsertEquipaObra): Promise<EquipaObra> {
    const newEquipa: EquipaObra = {
      ...equipa,
      id: this.nextEquipaId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as EquipaObra;
    this.equipas.push(newEquipa);
    return newEquipa;
  }

  async addMembroToEquipa(equipaMembro: InsertEquipaMembros): Promise<EquipaMembros> {
    const newMembro: EquipaMembros = {
      ...equipaMembro,
      createdAt: new Date(),
    } as EquipaMembros;
    this.equipaMembros.push(newMembro);
    return newMembro;
  }

  async removeMembroFromEquipa(equipaId: number, userId: string): Promise<void> {
    const index = this.equipaMembros.findIndex(m => m.equipaId === equipaId && m.userId === userId);
    if (index >= 0) {
      this.equipaMembros.splice(index, 1);
    }
  }

  async getPartesDiarias(userId: string): Promise<(PartesDiarias & { obra: Obra })[]> {
    return this.partesDiarias
      .filter(p => p.userId === userId)
      .map(p => ({
        ...p,
        obra: this.obras.find(o => o.id === p.obraId)!
      }));
  }

  async getPartesDiariasByObra(obraId: number): Promise<(PartesDiarias & { user: User })[]> {
    return this.partesDiarias
      .filter(p => p.obraId === obraId)
      .map(p => ({
        ...p,
        user: this.users.find(u => u.id === p.userId)!
      }));
  }

  async createParteDiaria(parte: InsertPartesDiarias): Promise<PartesDiarias> {
    const newParte: PartesDiarias = {
      ...parte,
      id: this.nextParteId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PartesDiarias;
    this.partesDiarias.push(newParte);
    return newParte;
  }

  async getUserStats(userId: string): Promise<{
    hoursToday: number;
    hoursWeek: number;
    activeProjects: number;
    teamMembers: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const userRegistos = this.registosPonto.filter(r => r.userId === userId);
    
    const todayRegisto = userRegistos.find(r => r.data === today);
    const hoursToday = todayRegisto ? parseFloat(todayRegisto.totalHorasTrabalhadas || '0') : 0;
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekRegistos = userRegistos.filter(r => new Date(r.data) >= weekStart);
    const hoursWeek = weekRegistos.reduce((total, r) => total + parseFloat(r.totalHorasTrabalhadas || '0'), 0);
    
    const userEquipas = this.equipaMembros.filter(m => m.userId === userId);
    const activeProjects = new Set(userEquipas.map(m => {
      const equipa = this.equipas.find(e => e.id === m.equipaId);
      return equipa?.obraId;
    })).size;
    
    const teamMembers = this.equipaMembros.filter(m => {
      const equipa = this.equipas.find(e => e.id === m.equipaId);
      return equipa?.encarregadoId === userId;
    }).length;
    
    return {
      hoursToday,
      hoursWeek,
      activeProjects,
      teamMembers,
    };
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserType(id: string, tipoUser: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ tipoUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Obra operations
  async getObras(): Promise<Obra[]> {
    return await db.select().from(obras).orderBy(desc(obras.createdAt));
  }

  async getObra(id: number): Promise<Obra | undefined> {
    const [obra] = await db.select().from(obras).where(eq(obras.id, id));
    return obra;
  }

  async getObraByQRCode(qrCode: string): Promise<Obra | undefined> {
    const [obra] = await db.select().from(obras).where(eq(obras.qrCode, qrCode));
    return obra;
  }

  async createObra(obra: InsertObra): Promise<Obra> {
    const [newObra] = await db.insert(obras).values(obra).returning();
    return newObra;
  }

  async updateObra(id: number, obra: Partial<InsertObra>): Promise<Obra> {
    const [updatedObra] = await db
      .update(obras)
      .set(obra)
      .where(eq(obras.id, id))
      .returning();
    return updatedObra;
  }

  // Registo Ponto operations
  async getRegistosPonto(userId: string): Promise<RegistoPonto[]> {
    return await db
      .select()
      .from(registoPonto)
      .where(eq(registoPonto.userId, userId))
      .orderBy(desc(registoPonto.data));
  }

  async getRegistoPontoByDate(userId: string, date: string): Promise<RegistoPonto | undefined> {
    const [registo] = await db
      .select()
      .from(registoPonto)
      .where(and(eq(registoPonto.userId, userId), eq(registoPonto.data, date)));
    return registo;
  }

  async createRegistoPonto(registo: InsertRegistoPonto): Promise<RegistoPonto> {
    const [newRegisto] = await db.insert(registoPonto).values(registo).returning();
    return newRegisto;
  }

  async updateRegistoPonto(id: number, registo: Partial<InsertRegistoPonto>): Promise<RegistoPonto> {
    const [updatedRegisto] = await db
      .update(registoPonto)
      .set(registo)
      .where(eq(registoPonto.id, id))
      .returning();
    return updatedRegisto;
  }

  // Equipa operations
  async getEquipas(): Promise<(EquipaObra & { obra: Obra; encarregado: User; membros: (EquipaMembros & { user: User })[] })[]> {
    const result = await db.query.equipaObra.findMany({
      with: {
        obra: true,
        encarregado: true,
        membros: {
          with: {
            user: true,
          },
        },
      },
    });
    return result as any;
  }

  async getEquipasByEncarregado(encarregadoId: string): Promise<(EquipaObra & { obra: Obra; membros: (EquipaMembros & { user: User })[] })[]> {
    const result = await db.query.equipaObra.findMany({
      where: eq(equipaObra.encarregadoId, encarregadoId),
      with: {
        obra: true,
        membros: {
          with: {
            user: true,
          },
        },
      },
    });
    return result as any;
  }

  async getEquipasByMembro(userId: string): Promise<(EquipaObra & { obra: Obra; encarregado: User })[]> {
    const result = await db.query.equipaMembros.findMany({
      where: eq(equipaMembros.userId, userId),
      with: {
        equipa: {
          with: {
            obra: true,
            encarregado: true,
          },
        },
      },
    });
    return result.map(r => r.equipa) as any;
  }

  async createEquipa(equipa: InsertEquipaObra): Promise<EquipaObra> {
    const [newEquipa] = await db.insert(equipaObra).values(equipa).returning();
    return newEquipa;
  }

  async addMembroToEquipa(equipaMembro: InsertEquipaMembros): Promise<EquipaMembros> {
    const [newMembro] = await db.insert(equipaMembros).values(equipaMembro).returning();
    return newMembro;
  }

  async removeMembroFromEquipa(equipaId: number, userId: string): Promise<void> {
    await db
      .delete(equipaMembros)
      .where(and(eq(equipaMembros.equipaId, equipaId), eq(equipaMembros.userId, userId)));
  }

  // Partes Diarias operations
  async getPartesDiarias(userId: string): Promise<(PartesDiarias & { obra: Obra })[]> {
    const result = await db.query.partesDiarias.findMany({
      where: eq(partesDiarias.userId, userId),
      with: {
        obra: true,
      },
      orderBy: desc(partesDiarias.data),
    });
    return result as any;
  }

  async getPartesDiariasByObra(obraId: number): Promise<(PartesDiarias & { user: User })[]> {
    const result = await db.query.partesDiarias.findMany({
      where: eq(partesDiarias.obraId, obraId),
      with: {
        user: true,
      },
      orderBy: desc(partesDiarias.data),
    });
    return result as any;
  }

  async createParteDiaria(parte: InsertPartesDiarias): Promise<PartesDiarias> {
    const [newParte] = await db.insert(partesDiarias).values(parte).returning();
    return newParte;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    hoursToday: number;
    hoursWeek: number;
    activeProjects: number;
    teamMembers: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Hours today
    const [hoursToday] = await db
      .select({ total: sql<number>`COALESCE(SUM(${registoPonto.totalHorasTrabalhadas}), 0)` })
      .from(registoPonto)
      .where(and(eq(registoPonto.userId, userId), eq(registoPonto.data, today)));

    // Hours this week
    const [hoursWeek] = await db
      .select({ total: sql<number>`COALESCE(SUM(${registoPonto.totalHorasTrabalhadas}), 0)` })
      .from(registoPonto)
      .where(and(eq(registoPonto.userId, userId), sql`${registoPonto.data} >= ${weekStart}`));

    // Active projects
    const activeProjects = await db
      .selectDistinct({ obraId: registoPonto.obraId })
      .from(registoPonto)
      .where(and(eq(registoPonto.userId, userId), sql`${registoPonto.data} >= ${weekStart}`));

    // Team members
    const userEquipas = await db
      .select({ equipaId: equipaMembros.equipaId })
      .from(equipaMembros)
      .where(eq(equipaMembros.userId, userId));

    let teamMembersCount = 0;
    if (userEquipas.length > 0) {
      const equipaIds = userEquipas.map(e => e.equipaId);
      const [teamMembers] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${equipaMembros.userId})` })
        .from(equipaMembros)
        .where(sql`${equipaMembros.equipaId} = ANY(${equipaIds})`);
      teamMembersCount = teamMembers.count;
    }

    return {
      hoursToday: Number(hoursToday?.total || 0),
      hoursWeek: Number(hoursWeek?.total || 0),
      activeProjects: activeProjects.length,
      teamMembers: teamMembersCount,
    };
  }
}

// Use database if available, otherwise use memory storage
export const storage = (() => {
  if (process.env.DATABASE_URL) {
    console.log("Using PostgreSQL database storage");
    return new DatabaseStorage();
  } else {
    console.warn("Using memory storage - data will be lost on server restart");
    console.log("To persist data, provision a PostgreSQL database or configure SQL Server");
    return new MemoryStorage();
  }
})();
