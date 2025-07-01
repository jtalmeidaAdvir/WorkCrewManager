# Configurar PostgreSQL Local no Windows

## 1. Instalar PostgreSQL

### Opção A: Download Oficial
1. Vá a https://www.postgresql.org/download/windows/
2. Baixe e instale o PostgreSQL
3. Durante a instalação:
   - **Username**: postgres
   - **Password**: escolha uma password (ex: password)
   - **Port**: 5432 (padrão)
   - **Locale**: Portuguese, Portugal

### Opção B: Via Chocolatey (se tiver instalado)
```bash
choco install postgresql
```

## 2. Configurar Base de Dados

### Abrir Command Prompt como Administrador:
```bash
# Aceder ao PostgreSQL
psql -U postgres

# Criar a base de dados
CREATE DATABASE constructpro;

# Verificar se foi criada
\l

# Sair
\q
```

## 3. Configurar a Aplicação

Edite o ficheiro `.env` na raiz do projeto:
```env
DATABASE_URL=postgresql://postgres:SUA_PASSWORD@localhost:5432/constructpro
SESSION_SECRET=constructpro-secret-key-2025
```

**Substitua `SUA_PASSWORD` pela password que definiu durante a instalação.**

## 4. Testar Conexão

Execute a aplicação:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

Se tudo estiver correto, verá:
```
A configurar base de dados PostgreSQL...
A criar/atualizar tabelas...
Tabelas criadas/atualizadas com sucesso!
[express] serving on port 5000
```

## 5. Exemplos de DATABASE_URL

```env
# PostgreSQL local
DATABASE_URL=postgresql://postgres:password@localhost:5432/constructpro

# PostgreSQL com porta diferente
DATABASE_URL=postgresql://postgres:password@localhost:5433/constructpro

# PostgreSQL com utilizador diferente
DATABASE_URL=postgresql://admin:mypassword@localhost:5432/constructpro

# PostgreSQL remoto
DATABASE_URL=postgresql://user:pass@192.168.1.100:5432/constructpro
```

## 6. Resolução de Problemas

### Erro "connection refused"
- Verifique se o PostgreSQL está a executar:
  ```bash
  # Windows Services ou
  net start postgresql-x64-15
  ```

### Erro "authentication failed"
- Verifique username e password no DATABASE_URL
- Confirme se o utilizador tem permissões

### Erro "database does not exist"
- Crie a base de dados manualmente:
  ```sql
  CREATE DATABASE constructpro;
  ```

## 7. Verificar se está a funcionar

A aplicação deve mostrar:
- ✅ Tabelas criadas automaticamente
- ✅ Dados persistem após reiniciar
- ✅ Login funciona normalmente
- ✅ Sem mensagens de "memory storage"