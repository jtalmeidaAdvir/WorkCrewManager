import mssql from 'mssql';

// SQL Server configuration and table creation
let sqlServerPool: mssql.ConnectionPool | null = null;

export async function initializeSqlServer() {
  if (!process.env.DB_SERVER || !process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    return false;
  }

  console.log("Configurando SQL Server...");
  console.log(`Servidor: ${process.env.DB_SERVER}:${process.env.DB_PORT || '1433'}`);
  console.log(`Base de dados: ${process.env.DB_NAME}`);
  console.log(`Utilizador: ${process.env.DB_USER}`);

  // First try to connect to master database to create target database if needed
  const masterConnectionString = `Server=${process.env.DB_SERVER};Database=master;User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;
  
  // Then use target database connection strings
  const connectionStrings = [
    process.env.DATABASE_URL,
    `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`,
  ].filter(Boolean);

  try {
    // Step 1: Connect to master database and create target database if needed
    console.log("Tentativa 1 - conectar ao master...");
    const masterPool = new mssql.ConnectionPool(masterConnectionString);
    
    const connectPromise = masterPool.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const createDbQuery = `
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME}')
      BEGIN
        CREATE DATABASE [${process.env.DB_NAME}]
        PRINT 'Base de dados ${process.env.DB_NAME} criada com sucesso'
      END
      ELSE
      BEGIN
        PRINT 'Base de dados ${process.env.DB_NAME} já existe'
      END
    `;
    
    await masterPool.request().query(createDbQuery);
    await masterPool.close();
    console.log("Base de dados verificada/criada com sucesso");
    
    // Step 2: Connect to target database
    console.log("Conectando à base de dados alvo...");
    const targetConnectionString = `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;
    sqlServerPool = new mssql.ConnectionPool(targetConnectionString);
    await sqlServerPool.connect();
    
    console.log("Conectado ao SQL Server com sucesso!");
    console.log("Criando/verificando tabelas...");
    await createTablesIfNotExist();
    return true;
  } catch (error) {
    console.error("Erro ao configurar SQL Server:", error);
    sqlServerPool = null;
    return false;
  }
}

async function createTablesIfNotExist() {
  if (!sqlServerPool) return;
  
  try {
    const request = sqlServerPool.request();
    
    // First, check if obras table has wrong structure and fix it
    await request.query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='obras' AND xtype='U')
      BEGIN
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'obras' AND COLUMN_NAME = 'localizacao')
        BEGIN
          -- Remove foreign key constraints first
          DECLARE @sql NVARCHAR(MAX) = '';
          SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) 
                      + ' DROP CONSTRAINT ' + QUOTENAME(CONSTRAINT_NAME) + '; '
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
          WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
            AND TABLE_NAME IN ('equipa_membros', 'equipa_obra', 'partes_diarias', 'registo_ponto');
          
          IF @sql <> ''
          BEGIN
            EXEC sp_executesql @sql;
          END
          
          -- Now drop tables in correct order
          DROP TABLE IF EXISTS equipa_membros;
          DROP TABLE IF EXISTS equipa_obra;
          DROP TABLE IF EXISTS partes_diarias;
          DROP TABLE IF EXISTS registo_ponto;
          DROP TABLE IF EXISTS obras;
          PRINT 'Tabelas antigas removidas para atualização de estrutura'
        END
      END
    `);

    // Check if obras table exists with correct structure, if not recreate all tables
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='obras' AND xtype='U') 
      OR NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'obras' AND COLUMN_NAME = 'localizacao')
      BEGIN
        -- Create users table
        CREATE TABLE users (
          id NVARCHAR(255) PRIMARY KEY,
          username NVARCHAR(255) UNIQUE,
          password NVARCHAR(255),
          email NVARCHAR(255),
          firstName NVARCHAR(255),
          lastName NVARCHAR(255),
          profileImageUrl NVARCHAR(MAX),
          tipoUser NVARCHAR(50) DEFAULT 'Trabalhador',
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE()
        );
        
        -- Create obras table
        CREATE TABLE obras (
          id INT IDENTITY(1,1) PRIMARY KEY,
          codigo NVARCHAR(255) UNIQUE NOT NULL,
          nome NVARCHAR(255) NOT NULL,
          localizacao NVARCHAR(MAX) NOT NULL,
          estado NVARCHAR(50) DEFAULT 'Ativa',
          qrCode NVARCHAR(255) UNIQUE NOT NULL,
          createdAt DATETIME2 DEFAULT GETDATE()
        );
        
        -- Create registo_ponto table
        CREATE TABLE registo_ponto (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          data NVARCHAR(10) NOT NULL,
          horaEntrada NVARCHAR(8),
          horaSaida NVARCHAR(8),
          totalHorasTrabalhadas DECIMAL(4,2),
          totalTempoIntervalo DECIMAL(4,2),
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          obraId INT,
          createdAt DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (obraId) REFERENCES obras(id)
        );
        
        -- Create equipa_obra table
        CREATE TABLE equipa_obra (
          id INT IDENTITY(1,1) PRIMARY KEY,
          nome NVARCHAR(255) NOT NULL,
          obraId INT NOT NULL,
          encarregadoId NVARCHAR(255) NOT NULL,
          createdAt DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (obraId) REFERENCES obras(id),
          FOREIGN KEY (encarregadoId) REFERENCES users(id)
        );
        
        -- Create equipa_membros table
        CREATE TABLE equipa_membros (
          id INT IDENTITY(1,1) PRIMARY KEY,
          equipaId INT NOT NULL,
          userId NVARCHAR(255) NOT NULL,
          createdAt DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (equipaId) REFERENCES equipa_obra(id),
          FOREIGN KEY (userId) REFERENCES users(id)
        );
        
        -- Create partes_diarias table
        CREATE TABLE partes_diarias (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          obraId INT NOT NULL,
          data NVARCHAR(10) NOT NULL,
          categoria NVARCHAR(255) NOT NULL,
          descricao NVARCHAR(MAX) NOT NULL,
          quantidade FLOAT,
          horas FLOAT,
          createdAt DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (obraId) REFERENCES obras(id)
        );
        
        -- Create sessions table for session storage
        CREATE TABLE sessions (
          sid NVARCHAR(255) PRIMARY KEY,
          sess NVARCHAR(MAX) NOT NULL,
          expire DATETIME2 NOT NULL
        );
        
        PRINT 'All tables created successfully!'
      END
      ELSE
      BEGIN
        PRINT 'Tables already exist'
        
        -- Update existing registo_ponto table if needed
        IF EXISTS (SELECT * FROM sysobjects WHERE name='registo_ponto' AND xtype='U')
        BEGIN
          -- Add new columns if they don't exist
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registo_ponto' AND COLUMN_NAME = 'latitude')
          BEGIN
            ALTER TABLE registo_ponto ADD latitude DECIMAL(10,8);
            PRINT 'Added latitude column to registo_ponto';
          END
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registo_ponto' AND COLUMN_NAME = 'longitude')
          BEGIN
            ALTER TABLE registo_ponto ADD longitude DECIMAL(11,8);
            PRINT 'Added longitude column to registo_ponto';
          END
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registo_ponto' AND COLUMN_NAME = 'totalHorasTrabalhadas')
          BEGIN
            ALTER TABLE registo_ponto ADD totalHorasTrabalhadas DECIMAL(4,2);
            PRINT 'Added totalHorasTrabalhadas column to registo_ponto';
          END
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'registo_ponto' AND COLUMN_NAME = 'totalTempoIntervalo')
          BEGIN
            ALTER TABLE registo_ponto ADD totalTempoIntervalo DECIMAL(4,2);
            PRINT 'Added totalTempoIntervalo column to registo_ponto';
          END
        END
      END
    `);
    
    console.log("Database tables verified/created successfully");
  } catch (error: any) {
    // Ignore error if tables already exist (error 2714)
    if (error.number === 2714) {
      console.log("Tabelas já existem - a usar estrutura existente");
    } else {
      console.error("Error creating tables:", error);
    }
  }
}

export function getSqlServerPool() {
  return sqlServerPool;
}

export function isSqlServerConnected() {
  return sqlServerPool !== null && sqlServerPool.connected;
}