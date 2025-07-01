# ConstructPro - Instruções para Windows

## Como executar no Windows

O erro que você está vendo ocorre porque o Windows não reconhece a sintaxe `NODE_ENV=development` diretamente. Aqui estão 3 soluções:

### Opção 1: Usar o arquivo .bat (Mais simples)
```bash
./dev-windows.bat
```

### Opção 2: Usar PowerShell
```powershell
./dev-windows.ps1
```

### Opção 3: Usar cross-env através do npx
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Opção 4: Definir a variável e executar separadamente
```bash
set NODE_ENV=development
tsx server/index.ts
```

## Pré-requisitos
Certifique-se de ter instalado:
- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação das dependências
```bash
npm install
```

## Configuração da base de dados
A aplicação funciona com armazenamento em memória por padrão. Para usar uma base de dados persistente:

1. Configure uma base de dados PostgreSQL
2. Defina a variável `DATABASE_URL` no seu ambiente
3. Execute `npm run db:push` para criar as tabelas

## Notas importantes
- Os dados em memória são perdidos quando o servidor é reiniciado
- Para produção, recomenda-se usar uma base de dados PostgreSQL
- A aplicação estará disponível em `http://localhost:5000`