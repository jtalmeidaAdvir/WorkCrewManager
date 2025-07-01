import mssql from 'mssql';

// SQL Server configuration and table creation
let sqlServerPool: mssql.ConnectionPool | null = null;

export async function initializeSqlServer() {
  if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    return false;
  }

  console.log("Configurando SQL Server...");
  console.log(`Servidor: ${process.env.DB_HOST}:${process.env.DB_PORT || '1433'}`);
  console.log(`Base de dados: ${process.env.DB_NAME}`);
  console.log(`Utilizador: ${process.env.DB_USERNAME}`);

  const connectionStrings = [
    `Server=${process.env.DB_HOST},${process.env.DB_PORT || '1433'};Database=master;User Id=${process.env.DB_USERNAME};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`,
    `Server=${process.env.DB_HOST}\\SQLEXPRESS;Database=master;User Id=${process.env.DB_USERNAME};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`,
    `Server=${process.env.DB_HOST};Database=master;User Id=${process.env.DB_USERNAME};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`,
  ];

  let workingConnectionString = null;

  for (let i = 0; i < connectionStrings.length; i++) {
    console.log(`Tentativa ${i + 1}...`);
    try {
      const testPool = new mssql.ConnectionPool(connectionStrings[i]);
      await testPool.connect();
      workingConnectionString = connectionStrings[i];
      await testPool.close();
      console.log(`Conexão bem-sucedida na tentativa ${i + 1}!`);
      break;
    } catch (error) {
      console.log(`Tentativa ${i + 1} falhou`);
    }
  }

  if (!workingConnectionString) {
    console.log("Não foi possível conectar ao SQL Server");
    return false;
  }

  try {
    // Create database if needed
    const masterPool = new mssql.ConnectionPool(workingConnectionString);
    await masterPool.connect();
    
    const createDbQuery = `
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME}')
      BEGIN
        CREATE DATABASE [${process.env.DB_NAME}]
        PRINT 'Base de dados criada'
      END
    `;
    
    await masterPool.request().query(createDbQuery);
    await masterPool.close();
    
    // Connect to target database
    const targetConnectionString = workingConnectionString.replace('Database=master', `Database=${process.env.DB_NAME}`);
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