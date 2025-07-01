# Comandos para Windows - ConstructPro

## Problema Resolvido
O erro `'NODE_ENV' is not recognized` acontece no Windows. Criei scripts específicos para Windows.

## Comandos Corretos no seu PC:

### Opção 1: Usar script .bat (Mais Simples)
```cmd
# No Command Prompt, na pasta do projeto:
dev.bat
```

### Opção 2: Usar npx cross-env
```cmd
# Instalar cross-env globalmente (uma vez)
npm install -g cross-env

# Depois executar:
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Opção 3: Definir variável manualmente
```cmd
# Definir variável
set NODE_ENV=development

# Executar aplicação
npx tsx server/index.ts
```

## Ordem Completa de Comandos:

```cmd
# 1. Navegar para pasta do projeto
cd "C:\Users\jtalm\Desktop\GIT\WorkCrewManager (8)\WorkCrewManager"

# 2. Instalar dependências (já feito)
npm install

# 3. Executar aplicação
dev.bat
```

## O que Deve Aparecer:
```
Tentando conectar à sua base SQL Server existente...
Configurando SQL Server...
Servidor: localhost:1433
Base de dados: Advir
Utilizador: sa
✅ Conectado à base de dados Advir com sucesso!
[express] serving on port 5000
```

Se aparecer erro de SQL Server, verifique:
- SQL Server está a correr
- Utilizador 'sa' existe com password '1234'
- Porta 1433 acessível

**Teste agora com: `dev.bat`**