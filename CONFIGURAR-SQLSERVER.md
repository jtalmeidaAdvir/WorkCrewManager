# Configurar SQL Server Local no Windows

## ✅ CONFIGURAÇÃO ATUAL
O sistema já está configurado para usar a sua base de dados:
- **Servidor**: localhost:1433
- **Base de dados**: Obras (será criada automaticamente)
- **Utilizador**: sa
- **Password**: 1234

## 🎯 PRÓXIMOS PASSOS

### 1. Instalar SQL Server

#### Opção A: SQL Server Express (Grátis)
1. Vá a: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Baixe "SQL Server Express"
3. Durante a instalação:
   - Escolha "Basic" installation
   - Configure authentication: "Mixed Mode"
   - Password para 'sa': **1234** (como configurado)

#### Opção B: SQL Server Developer (Grátis)
1. Baixe SQL Server Developer Edition
2. Durante a instalação:
   - Configure "Mixed Mode Authentication"
   - Password para 'sa': **1234**

### 2. Instalar SQL Server Management Studio (SSMS)
1. Baixe de: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms
2. Instale para gerir a base de dados

### 3. Verificar se SQL Server está a executar
```cmd
# Verificar serviços
net start | find "SQL"

# Iniciar SQL Server se necessário
net start MSSQLSERVER
```

### 4. Testar a aplicação
Depois de instalar e iniciar SQL Server:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Verá estas mensagens se tudo estiver correto:**
```
🔄 Configurando SQL Server...
📍 Servidor: localhost:1433
🏢 Base de dados: Obras
👤 Utilizador: sa
🔗 Conectando ao SQL Server...
✅ Conectado ao SQL Server com sucesso!
🔄 Criando/verificando tabelas...
```

## 🐳 ALTERNATIVA: Docker (Mais rápido)

Se tiver Docker instalado:
```bash
# Executar SQL Server em container
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=1234" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest

# Verificar se está a executar
docker ps
```

## 🔧 RESOLUÇÃO DE PROBLEMAS

### Erro "Could not connect"
- Verificar se SQL Server está instalado e a executar
- Verificar se a porta 1433 está disponível
- Verificar firewall do Windows

### Erro "Login failed"
- Confirmar que Mixed Mode Authentication está ativado
- Verificar password do utilizador 'sa'

### Erro "Invalid object name"
- Normal na primeira execução
- O sistema cria automaticamente as tabelas

## ✨ FUNCIONALIDADES AUTOMÁTICAS

Quando conectar ao SQL Server:
- ✅ Cria automaticamente a base de dados "Obras"
- ✅ Cria todas as tabelas necessárias
- ✅ Dados persistem permanentemente
- ✅ Suporte completo para utilizadores, projetos, equipas
- ✅ Sistema de login funcional
- ✅ Registo de ponto com QR codes

## 📊 ESTRUTURA DA BASE DE DADOS

O sistema criará automaticamente estas tabelas:
- `users` - Utilizadores (Trabalhador, Encarregado, Diretor)
- `obras` - Projetos de construção
- `registo_ponto` - Registo de entrada/saída
- `equipa_obra` - Equipas de trabalho
- `equipa_membros` - Membros das equipas
- `partes_diarias` - Relatórios diários
- `sessions` - Sessões de utilizador