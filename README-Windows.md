# ConstructPro - Instruções para Windows

## Como executar no Windows

O erro que você está vendo ocorre porque o Windows não reconhece a sintaxe `NODE_ENV=development` diretamente. Aqui estão as soluções:

### Opção 1: Usar o arquivo .bat (Recomendado)
```bash
./dev-windows.bat
```
Este script faz tudo automaticamente:
- Verifica e instala dependências
- Configura as variáveis de ambiente
- Cria/atualiza tabelas da base de dados (se configurada)
- Inicia o servidor

### Opção 2: Usar PowerShell
```powershell
./dev-windows.ps1
```

### Opção 3: Usar script Node.js (Multiplataforma)
```bash
node scripts/dev.js
```

### Opção 4: Usar cross-env através do npx
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Opção 5: Usar npm run dev com cross-env
```bash
npx cross-env NODE_ENV=development npm run dev
```

## Pré-requisitos
Certifique-se de ter instalado:
- Node.js (versão 18 ou superior)
- npm ou yarn

## Configuração da base de dados (AUTOMÁTICA)

### Armazenamento em memória (padrão)
A aplicação funciona automaticamente com armazenamento em memória. Basta executar:
```bash
npm run dev
```
ou
```bash
./dev-windows.bat
```

### Base de dados PostgreSQL (persistente)
Para usar uma base de dados persistente:

1. **Configure o PostgreSQL** (instale localmente ou use um serviço na nuvem)
2. **Crie um ficheiro `.env`** (copie de `.env.example`):
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/constructpro
   ```
3. **Execute o desenvolvimento**:
   ```bash
   npm run dev
   ```

**🎉 A aplicação cria automaticamente as tabelas!** Não precisa de executar comandos manuais.

## Funcionalidades automáticas
Quando executa `npm run dev` ou os scripts do Windows:
- ✅ Verifica e instala dependências
- ✅ Configura variáveis de ambiente
- ✅ Deteta se existe DATABASE_URL
- ✅ Cria/atualiza tabelas automaticamente se a base de dados estiver configurada
- ✅ Inicia o servidor na porta 5000

## Notas importantes
- **Dados em memória** são perdidos quando o servidor é reiniciado
- **Base de dados PostgreSQL** mantém os dados permanentemente
- A aplicação estará disponível em `http://localhost:5000`
- Sistema de login: username/password (criado pelo diretor)