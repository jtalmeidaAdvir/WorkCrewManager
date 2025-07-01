import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  time,
  boolean
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  tipoUser: varchar("tipo_user").notNull().default("Trabalhador"), // Trabalhador, Diretor, Encarregado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OBRA table
export const obras = pgTable("obras", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo").notNull().unique(),
  nome: varchar("nome").notNull(),
  estado: varchar("estado").notNull().default("Ativa"), // Ativa, Pausada, Concluida
  localizacao: text("localizacao").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// REGISTOPONTO table
export const registoPonto = pgTable("registo_ponto", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  data: date("data").notNull(),
  horaEntrada: time("hora_entrada"),
  horaSaida: time("hora_saida"),
  totalHorasTrabalhadas: decimal("total_horas_trabalhadas", { precision: 4, scale: 2 }),
  totalTempoIntervalo: decimal("total_tempo_intervalo", { precision: 4, scale: 2 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  obraId: integer("obra_id").notNull().references(() => obras.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// EQUIPAOBRA table
export const equipaObra = pgTable("equipa_obra", {
  id: serial("id").primaryKey(),
  nome: varchar("nome").notNull(),
  encarregadoId: varchar("encarregado_id").notNull().references(() => users.id),
  obraId: integer("obra_id").notNull().references(() => obras.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for team members
export const equipaMembros = pgTable("equipa_membros", {
  id: serial("id").primaryKey(),
  equipaId: integer("equipa_id").notNull().references(() => equipaObra.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// PARTESDIARIAS table
export const partesDiarias = pgTable("partes_diarias", {
  id: serial("id").primaryKey(),
  categoria: varchar("categoria").notNull(), // MaoObra, Materiais, Equipamentos
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }),
  especialidade: varchar("especialidade"), // For MaoObra
  unidade: varchar("unidade"), // For Materiais
  designacao: varchar("designacao").notNull(),
  data: date("data").notNull(),
  horas: decimal("horas", { precision: 4, scale: 2 }), // For MaoObra and Equipamentos
  nome: varchar("nome"), // Worker name for MaoObra
  userId: varchar("user_id").notNull().references(() => users.id),
  obraId: integer("obra_id").notNull().references(() => obras.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  registosPonto: many(registoPonto),
  equipasEncarregadas: many(equipaObra),
  equipasMembro: many(equipaMembros),
  partesDiarias: many(partesDiarias),
}));

export const obrasRelations = relations(obras, ({ many }) => ({
  registosPonto: many(registoPonto),
  equipas: many(equipaObra),
  partesDiarias: many(partesDiarias),
}));

export const registoPontoRelations = relations(registoPonto, ({ one }) => ({
  user: one(users, {
    fields: [registoPonto.userId],
    references: [users.id],
  }),
  obra: one(obras, {
    fields: [registoPonto.obraId],
    references: [obras.id],
  }),
}));

export const equipaObraRelations = relations(equipaObra, ({ one, many }) => ({
  encarregado: one(users, {
    fields: [equipaObra.encarregadoId],
    references: [users.id],
  }),
  obra: one(obras, {
    fields: [equipaObra.obraId],
    references: [obras.id],
  }),
  membros: many(equipaMembros),
}));

export const equipaMembrosRelations = relations(equipaMembros, ({ one }) => ({
  equipa: one(equipaObra, {
    fields: [equipaMembros.equipaId],
    references: [equipaObra.id],
  }),
  user: one(users, {
    fields: [equipaMembros.userId],
    references: [users.id],
  }),
}));

export const partesDiariasRelations = relations(partesDiarias, ({ one }) => ({
  user: one(users, {
    fields: [partesDiarias.userId],
    references: [users.id],
  }),
  obra: one(obras, {
    fields: [partesDiarias.obraId],
    references: [obras.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userSchema = insertUserSchema.omit({
  password: true,
});

export const insertObraSchema = createInsertSchema(obras).omit({
  id: true,
  createdAt: true,
});

export const insertRegistoPontoSchema = createInsertSchema(registoPonto).omit({
  id: true,
  createdAt: true,
});

export const insertEquipaObraSchema = createInsertSchema(equipaObra).omit({
  id: true,
  createdAt: true,
});

export const insertEquipaMembrosSchema = createInsertSchema(equipaMembros).omit({
  id: true,
  createdAt: true,
});

export const insertPartesDiariasSchema = createInsertSchema(partesDiarias).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obras.$inferSelect;
export type InsertRegistoPonto = z.infer<typeof insertRegistoPontoSchema>;
export type RegistoPonto = typeof registoPonto.$inferSelect;
export type InsertEquipaObra = z.infer<typeof insertEquipaObraSchema>;
export type EquipaObra = typeof equipaObra.$inferSelect;
export type InsertEquipaMembros = z.infer<typeof insertEquipaMembrosSchema>;
export type EquipaMembros = typeof equipaMembros.$inferSelect;
export type InsertPartesDiarias = z.infer<typeof insertPartesDiariasSchema>;
export type PartesDiarias = typeof partesDiarias.$inferSelect;
