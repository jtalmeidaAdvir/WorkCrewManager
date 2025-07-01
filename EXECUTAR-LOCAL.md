# Como Executar o Projeto ConstructPro no seu PC Local

## Pré-requisitos

### 1. Node.js
- Baixar em: https://nodejs.org (versão 18 ou superior)
- Instalar com configurações padrão

### 2. SQL Server no seu PC
- SQL Server Express (gratuito) ou Developer
- Porta 1433 aberta
- Utilizador 'sa' com password '1234'
- Base de dados 'Advir' (será criada automaticamente)

## Passos para Executar

### 1. Baixar o Projeto
```cmd
# Clonar ou baixar o projeto para uma pasta no seu PC
# Por exemplo: C:\ConstructPro
```

### 2. Instalar Dependências
```cmd
# Abrir Command Prompt na pasta do projeto
cd C:\ConstructPro

# Instalar dependências
npm install
```

### 3. Configurar Base de Dados
O ficheiro `.env` já está configurado para:
```env
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=1234
DB_NAME=Advir
DB_PORT=1433
```

### 4. Executar a Aplicação
```cmd
# Comando para iniciar
npm run dev
```

### 5. Verificar se Funciona
- Aplicação abrirá em: http://localhost:5000
- Logs mostrarão:
  ```
  ✅ Conectado à base de dados Advir com sucesso!
  [express] serving on port 5000
  ```

## Scripts Disponíveis

```cmd
# Iniciar aplicação (desenvolvimento)
npm run dev

# Construir para produção
npm run build

# Iniciar produção
npm start

# Atualizar base de dados
npm run db:push
```

## Resolução de Problemas

### SQL Server não conecta:
1. Verificar se SQL Server está a correr
2. Verificar se porta 1433 está aberta
3. Verificar utilizador 'sa' e password '1234'

### Erro de dependências:
```cmd
# Limpar e reinstalar
rm -rf node_modules
npm install
```

### Porta ocupada:
- Alterar porta no código ou fechar outra aplicação na porta 5000

## Estrutura do Projeto
```
ConstructPro/
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos e schemas partilhados
├── .env            # Configuração base de dados
└── package.json    # Dependências
```

Depois de funcionar localmente, posso ajudar a colocar online!