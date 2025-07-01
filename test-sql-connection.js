const mssql = require('mssql');
require('dotenv').config();

async function testConnections() {
  console.log('Testando conexões SQL Server...');
  console.log(`Usuario: ${process.env.DB_USERNAME}`);
  console.log('');

  const instances = [
    'localhost\\SQL2022',
    'localhost\\PRIEXPRESS100', 
    'localhost\\SQL_LA_2025',
    'localhost\\SQL2022V10',
    'localhost\\SQL2022_SQL_LA',
    'localhost,1433',
    'localhost',
  ];

  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    console.log(`Teste ${i + 1}: ${instance}`);
    
    try {
      const connectionString = `Server=${instance};Database=master;User Id=${process.env.DB_USERNAME};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;Connect Timeout=5;`;
      
      const pool = new mssql.ConnectionPool(connectionString);
      await pool.connect();
      
      const result = await pool.request().query('SELECT @@SERVERNAME as ServerName, @@VERSION as Version');
      console.log(`✓ SUCESSO! Servidor: ${result.recordset[0].ServerName}`);
      
      await pool.close();
      
      console.log(`\nCONFIGURAÇÃO PARA .env:`);
      console.log(`DB_HOST=${instance.split('\\')[0]}`);
      if (instance.includes('\\')) {
        console.log(`DB_INSTANCE=${instance.split('\\')[1]}`);
      }
      console.log(`DB_NAME=Obras`);
      console.log(`DB_USERNAME=${process.env.DB_USERNAME}`);
      console.log(`DB_PASSWORD=${process.env.DB_PASSWORD}`);
      
      break;
      
    } catch (error) {
      console.log(`✗ Falhou: ${error.message.substring(0, 100)}...`);
    }
  }
}

testConnections().catch(console.error);