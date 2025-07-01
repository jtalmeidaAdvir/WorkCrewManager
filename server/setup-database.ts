import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL não encontrado. A usar armazenamento em memória.');
    console.log('Para usar base de dados persistente, configure DATABASE_URL');
    return false;
  }

  try {
    console.log('A configurar base de dados PostgreSQL...');
    
    // Executar drizzle push para criar/atualizar tabelas
    console.log('A criar/atualizar tabelas...');
    await execAsync('npx drizzle-kit push --force', {
      env: process.env,
      cwd: process.cwd()
    });
    
    console.log('Tabelas criadas/atualizadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao configurar base de dados:', error);
    console.log('A continuar com armazenamento em memória...');
    return false;
  }
}