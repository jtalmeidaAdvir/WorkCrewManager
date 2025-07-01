import { getSqlServerPool } from "./sqlserver";
import type { IStorage } from "./storage";
import type { User, UpsertUser, Obra, InsertObra, RegistoPonto, InsertRegistoPonto, EquipaObra, InsertEquipaObra, EquipaMembros, InsertEquipaMembros, PartesDiarias, InsertPartesDiarias } from "@shared/schema";

export class SqlServerStorage implements IStorage {
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM users WHERE id = @id');
      
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('username', username)
        .query('SELECT * FROM users WHERE username = @username');
      
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      // Check if user exists
      const existing = await this.getUserByUsername(userData.username || '');
      
      if (existing) {
        // Update existing user
        const result = await pool.request()
          .input('id', existing.id)
          .input('email', userData.email)
          .input('firstName', userData.firstName)
          .input('lastName', userData.lastName)
          .input('profileImageUrl', userData.profileImageUrl)
          .input('tipoUser', userData.tipoUser)
          .query(`
            UPDATE users 
            SET email = @email, firstName = @firstName, lastName = @lastName, 
                profileImageUrl = @profileImageUrl, tipoUser = @tipoUser, 
                updatedAt = GETDATE()
            WHERE id = @id;
            SELECT * FROM users WHERE id = @id;
          `);
        
        return result.recordset[0];
      } else {
        // Create new user
        const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await pool.request()
          .input('id', newId)
          .input('username', userData.username)
          .input('password', userData.password)
          .input('email', userData.email)
          .input('firstName', userData.firstName)
          .input('lastName', userData.lastName)
          .input('profileImageUrl', userData.profileImageUrl)
          .input('tipoUser', userData.tipoUser || 'Trabalhador')
          .query(`
            INSERT INTO users (id, username, password, email, firstName, lastName, profileImageUrl, tipoUser)
            VALUES (@id, @username, @password, @email, @firstName, @lastName, @profileImageUrl, @tipoUser);
            SELECT * FROM users WHERE id = @id;
          `);
        
        return result.recordset[0];
      }
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  async updateUserType(id: string, tipoUser: string): Promise<User> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('id', id)
        .input('tipoUser', tipoUser)
        .query(`
          UPDATE users SET tipoUser = @tipoUser, updatedAt = GETDATE() WHERE id = @id;
          SELECT * FROM users WHERE id = @id;
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error updating user type:", error);
      throw error;
    }
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('id', id)
        .input('password', hashedPassword)
        .query(`
          UPDATE users SET password = @password, updatedAt = GETDATE() WHERE id = @id;
          SELECT * FROM users WHERE id = @id;
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .query('SELECT * FROM users ORDER BY firstName, lastName');
      
      return result.recordset;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async createUser(userData: UpsertUser): Promise<User> {
    return this.upsertUser(userData);
  }

  // Obra operations
  async getObras(): Promise<Obra[]> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .query('SELECT * FROM obras ORDER BY nome');
      
      return result.recordset;
    } catch (error) {
      console.error("Error getting obras:", error);
      return [];
    }
  }

  async getObra(id: number): Promise<Obra | undefined> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('id', id)
        .query('SELECT * FROM obras WHERE id = @id');
      
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error("Error getting obra:", error);
      return undefined;
    }
  }

  async getObraByQRCode(qrCode: string): Promise<Obra | undefined> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('qrCode', qrCode)
        .query('SELECT * FROM obras WHERE qrCode = @qrCode');
      
      return result.recordset[0] || undefined;
    } catch (error) {
      console.error("Error getting obra by QR code:", error);
      return undefined;
    }
  }

  async createObra(obra: InsertObra): Promise<Obra> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('codigo', obra.codigo)
        .input('nome', obra.nome)
        .input('localizacao', obra.localizacao)
        .input('estado', obra.estado || 'Ativa')
        .input('qrCode', obra.qrCode)
        .query(`
          INSERT INTO obras (codigo, nome, localizacao, estado, qrCode)
          OUTPUT INSERTED.*
          VALUES (@codigo, @nome, @localizacao, @estado, @qrCode)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error creating obra:", error);
      throw error;
    }
  }

  async updateObra(id: number, obra: Partial<InsertObra>): Promise<Obra> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const updates = [];
      const inputs: any = { id };
      
      if (obra.codigo !== undefined) {
        updates.push('codigo = @codigo');
        inputs.codigo = obra.codigo;
      }
      if (obra.nome !== undefined) {
        updates.push('nome = @nome');
        inputs.nome = obra.nome;
      }
      if (obra.localizacao !== undefined) {
        updates.push('localizacao = @localizacao');
        inputs.localizacao = obra.localizacao;
      }
      if (obra.estado !== undefined) {
        updates.push('estado = @estado');
        inputs.estado = obra.estado;
      }
      if (obra.qrCode !== undefined) {
        updates.push('qrCode = @qrCode');
        inputs.qrCode = obra.qrCode;
      }
      
      const request = pool.request();
      Object.keys(inputs).forEach(key => {
        request.input(key, inputs[key]);
      });
      
      const result = await request.query(`
        UPDATE obras SET ${updates.join(', ')} WHERE id = @id;
        SELECT * FROM obras WHERE id = @id;
      `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error updating obra:", error);
      throw error;
    }
  }

  // For now, implement other methods as minimal placeholders
  async getRegistosPonto(userId: string): Promise<RegistoPonto[]> {
    return [];
  }

  async getRegistoPontoByDate(userId: string, date: string): Promise<RegistoPonto | undefined> {
    return undefined;
  }

  async createRegistoPonto(registo: InsertRegistoPonto): Promise<RegistoPonto> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('userId', registo.userId)
        .input('data', registo.data)
        .input('horaEntrada', registo.horaEntrada || null)
        .input('horaSaida', registo.horaSaida || null)
        .input('coordenadasEntrada', registo.coordenadasEntrada || null)
        .input('coordenadasSaida', registo.coordenadasSaida || null)
        .input('obraId', registo.obraId || null)
        .query(`
          INSERT INTO registo_ponto (userId, data, horaEntrada, horaSaida, coordenadasEntrada, coordenadasSaida, obraId)
          OUTPUT INSERTED.*
          VALUES (@userId, @data, @horaEntrada, @horaSaida, @coordenadasEntrada, @coordenadasSaida, @obraId)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error creating registo ponto:", error);
      throw error;
    }
  }

  async updateRegistoPonto(id: number, registo: Partial<InsertRegistoPonto>): Promise<RegistoPonto> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const updates: string[] = [];
      const inputs: any = { id };
      
      if (registo.horaEntrada !== undefined) {
        updates.push('horaEntrada = @horaEntrada');
        inputs.horaEntrada = registo.horaEntrada;
      }
      if (registo.horaSaida !== undefined) {
        updates.push('horaSaida = @horaSaida');
        inputs.horaSaida = registo.horaSaida;
      }
      if (registo.coordenadasEntrada !== undefined) {
        updates.push('coordenadasEntrada = @coordenadasEntrada');
        inputs.coordenadasEntrada = registo.coordenadasEntrada;
      }
      if (registo.coordenadasSaida !== undefined) {
        updates.push('coordenadasSaida = @coordenadasSaida');
        inputs.coordenadasSaida = registo.coordenadasSaida;
      }
      if (registo.obraId !== undefined) {
        updates.push('obraId = @obraId');
        inputs.obraId = registo.obraId;
      }
      
      if (updates.length === 0) {
        throw new Error("No fields to update");
      }
      
      const request = pool.request();
      Object.keys(inputs).forEach(key => {
        request.input(key, inputs[key]);
      });
      
      const result = await request.query(`
        UPDATE registo_ponto 
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
      
      if (result.recordset.length === 0) {
        throw new Error("Registo not found");
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error updating registo ponto:", error);
      throw error;
    }
  }

  async getEquipas(): Promise<(EquipaObra & { obra: Obra; encarregado: User; membros: (EquipaMembros & { user: User })[] })[]> {
    return [];
  }

  async getEquipasByEncarregado(encarregadoId: string): Promise<(EquipaObra & { obra: Obra; membros: (EquipaMembros & { user: User })[] })[]> {
    return [];
  }

  async getEquipasByMembro(userId: string): Promise<(EquipaObra & { obra: Obra; encarregado: User })[]> {
    return [];
  }

  async createEquipa(equipa: InsertEquipaObra): Promise<EquipaObra> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('nome', equipa.nome)
        .input('obraId', equipa.obraId)
        .input('encarregadoId', equipa.encarregadoId)
        .query(`
          INSERT INTO equipa_obra (nome, obraId, encarregadoId)
          OUTPUT INSERTED.*
          VALUES (@nome, @obraId, @encarregadoId)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error creating equipa:", error);
      throw error;
    }
  }

  async addMembroToEquipa(equipaMembro: InsertEquipaMembros): Promise<EquipaMembros> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      const result = await pool.request()
        .input('equipaId', equipaMembro.equipaId)
        .input('userId', equipaMembro.userId)
        .query(`
          INSERT INTO equipa_membros (equipaId, userId)
          OUTPUT INSERTED.*
          VALUES (@equipaId, @userId)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error("Error adding member to equipa:", error);
      throw error;
    }
  }

  async removeMembroFromEquipa(equipaId: number, userId: string): Promise<void> {
    const pool = getSqlServerPool();
    if (!pool) throw new Error("SQL Server not connected");
    
    try {
      await pool.request()
        .input('equipaId', equipaId)
        .input('userId', userId)
        .query(`
          DELETE FROM equipa_membros 
          WHERE equipaId = @equipaId AND userId = @userId
        `);
    } catch (error) {
      console.error("Error removing member from equipa:", error);
      throw error;
    }
  }

  async getPartesDiarias(userId: string): Promise<(PartesDiarias & { obra: Obra })[]> {
    return [];
  }

  async getPartesDiariasByObra(obraId: number): Promise<(PartesDiarias & { user: User })[]> {
    return [];
  }

  async createParteDiaria(parte: InsertPartesDiarias): Promise<PartesDiarias> {
    throw new Error("Not implemented yet");
  }

  async getUserStats(userId: string): Promise<{
    hoursToday: number;
    hoursWeek: number;
    activeProjects: number;
    teamMembers: number;
  }> {
    return {
      hoursToday: 0,
      hoursWeek: 0,
      activeProjects: 0,
      teamMembers: 0
    };
  }
}