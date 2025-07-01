import mssql from 'mssql';

// SQL Server configuration and table creation
let sqlServerPool: mssql.ConnectionPool | null = null;

export async function initializeSqlServer() {
  if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    return false;
  }

  console.log("🔄 Configurando SQL Server...");
  console.log(`📍 Servidor: ${process.env.DB_HOST}:${process.env.DB_PORT || '1433'}`);
  console.log(`🏢 Base de dados: ${process.env.DB_NAME}`);
  console.log(`👤 Utilizador: ${process.env.DB_USERNAME}`);

  // First, connect without specifying database to create it if needed
  const masterConfig: mssql.config = {
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    database: 'master', // Connect to master database first
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  try {
    // Connect to master database to create target database if needed
    console.log("🔗 Conectando ao SQL Server...");
    const masterPool = new mssql.ConnectionPool(masterConfig);
    await masterPool.connect();
    
    // Create database if it doesn't exist
    const createDbQuery = `
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME}')
      BEGIN
        CREATE DATABASE [${process.env.DB_NAME}]
        PRINT 'Base de dados ${process.env.DB_NAME} criada com sucesso!'
      END
      ELSE
      BEGIN
        PRINT 'Base de dados ${process.env.DB_NAME} já existe'
      END
    `;
    
    await masterPool.request().query(createDbQuery);
    await masterPool.close();
    
    // Now connect to the target database
    const config: mssql.config = {
      ...masterConfig,
      database: process.env.DB_NAME,
    };

    sqlServerPool = new mssql.ConnectionPool(config);
    await sqlServerPool.connect();
    console.log("✅ Conectado ao SQL Server com sucesso!");
    console.log("🔄 Criando/verificando tabelas...");
    await createTablesIfNotExist();
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao SQL Server:", error);
    console.log("🔄 A continuar com armazenamento em memória...");
    sqlServerPool = null;
    return false;
  }
}

async function createTablesIfNotExist() {
  if (!sqlServerPool) return;
  
  try {
    const request = sqlServerPool.request();
    
    // Check if users table exists, if not create all tables
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
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
          descricao NVARCHAR(MAX),
          estado NVARCHAR(50) DEFAULT 'Ativo',
          coordenadas NVARCHAR(255),
          qrCode NVARCHAR(255) UNIQUE,
          createdAt DATETIME2 DEFAULT GETDATE()
        );
        
        -- Create registo_ponto table
        CREATE TABLE registo_ponto (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          data NVARCHAR(10) NOT NULL,
          horaEntrada NVARCHAR(8),
          horaSaida NVARCHAR(8),
          coordenadasEntrada NVARCHAR(255),
          coordenadasSaida NVARCHAR(255),
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
      END
    `);
    
    console.log("Database tables verified/created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

export function getSqlServerPool() {
  return sqlServerPool;
}