# Solução para Conectar à Base de Dados SQL Server

## Problema
O Replit não consegue conectar diretamente ao seu SQL Server local porque estão em redes diferentes.

## Solução 1: Túnel Ngrok (Mais Rápida - 5 minutos)

### No seu PC:
1. Baixar ngrok: https://ngrok.com/download
2. Instalar e executar:
   ```cmd
   ngrok tcp 1433
   ```
3. Vai aparecer algo como:
   ```
   Forwarding tcp://0.tcp.ngrok.io:12345 -> localhost:1433
   ```

### No Replit (.env):
```env
# Usar o URL do ngrok
DB_SERVER=0.tcp.ngrok.io
DB_PORT=12345
DB_USER=sa
DB_PASSWORD=1234
DB_NAME=Advir
```

## Solução 2: Azure SQL Database (Permanente)

### Criar Azure SQL Database:
1. Ir a: https://portal.azure.com
2. Criar "SQL Database" (gratuito 12 meses)
3. Obter connection string

### No Replit (.env):
```env
DB_SERVER=seu-servidor.database.windows.net
DB_PORT=1433
DB_USER=seu-utilizador
DB_PASSWORD=sua-password
DB_NAME=Advir
```

## Solução 3: Usar PostgreSQL Agora (Temporária)

Se quiser testar a aplicação agora, posso reativar PostgreSQL temporariamente.

---

**Qual prefere? A Solução 1 (ngrok) é a mais rápida se tem o SQL Server no PC.**