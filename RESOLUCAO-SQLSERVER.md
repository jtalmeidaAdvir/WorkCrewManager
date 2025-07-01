# Resolução de Problemas SQL Server

## ✅ SITUAÇÃO ATUAL
- O sistema deteta corretamente as suas configurações SQL Server
- Tenta 3 formas diferentes de conectar:
  1. `localhost:1433` (porta padrão)
  2. `localhost\SQLEXPRESS` (instância nomeada)
  3. `localhost` (sem porta específica)
- Como não consegue conectar, usa armazenamento em memória (funcional)

## 🔧 STEPS PARA RESOLVER

### 1. Verificar se SQL Server está a executar
```cmd
# Abrir Command Prompt como Administrador
net start | find /i "sql"

# Se não aparecer, iniciar SQL Server:
net start MSSQLSERVER
# OU se for SQL Server Express:
net start "SQL Server (SQLEXPRESS)"
```

### 2. Habilitar TCP/IP no SQL Server
1. Abrir **SQL Server Configuration Manager**
2. Ir para **SQL Server Network Configuration**
3. Selecionar **Protocols for MSSQLSERVER** (ou SQLEXPRESS)
4. **TCP/IP** deve estar **Enabled**
5. Clicar direito em **TCP/IP** → **Properties**
6. Na aba **IP Addresses**, encontrar **IPAll**
7. Definir **TCP Port**: `1433`
8. **Restart SQL Server service**

### 3. Verificar Authentication Mode
1. Abrir **SQL Server Management Studio**
2. Conectar ao servidor
3. Clicar direito no servidor → **Properties**
4. Ir para **Security**
5. Selecionar **SQL Server and Windows Authentication mode**
6. **Restart SQL Server**

### 4. Verificar utilizador 'sa'
```sql
-- No SQL Server Management Studio:
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = '1234';
```

### 5. Configurar Firewall (se necessário)
```cmd
# Abrir porta 1433 no Windows Firewall
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433
```

### 6. Testar conexão manualmente
```cmd
# Teste com sqlcmd
sqlcmd -S localhost -U sa -P 1234 -Q "SELECT @@VERSION"

# Se funcionar, o ConstructPro também funcionará
```

## 🎯 ALTERNATIVAS SE NÃO RESOLVER

### Opção A: Usar uma instância diferente
Se tem SQL Server Express, altere o `.env`:
```env
DB_HOST=localhost\SQLEXPRESS
DB_PORT=
DB_NAME=Obras
DB_USERNAME=sa
DB_PASSWORD=1234
```

### Opção B: Usar Windows Authentication
```env
# Para Windows Authentication (sem password)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=Obras
DB_USERNAME=
DB_PASSWORD=
```

### Opção C: Usar porta dinâmica
1. No SQL Server Configuration Manager
2. TCP/IP Properties → IP Addresses
3. Verificar que porta está a usar em **IPAll → TCP Dynamic Ports**
4. Alterar `.env` com essa porta

## 🚀 TESTE RÁPIDO
Depois de fazer alterações, execute:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Se funcionar, verá:**
```
Configurando SQL Server...
Tentativa 1...
Conexão bem-sucedida na tentativa 1!
Conectado ao SQL Server com sucesso!
Base de dados criada
Criando/verificando tabelas...
```

## 💡 NOTA IMPORTANTE
O sistema ConstructPro está funcionando perfeitamente com armazenamento em memória. Todas as funcionalidades estão disponíveis:
- Login de utilizadores
- Gestão de projetos (obras)
- Registo de ponto com QR codes
- Equipas de trabalho
- Relatórios diários

A única diferença é que os dados são temporários (perdidos ao reiniciar o servidor).