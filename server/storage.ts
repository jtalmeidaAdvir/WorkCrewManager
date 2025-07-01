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
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserType(id: string, tipoUser: string): Promise<User>;
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

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

export const storage = new DatabaseStorage();
