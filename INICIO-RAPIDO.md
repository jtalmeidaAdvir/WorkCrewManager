# ConstructPro - Início Rápido Windows

## 🚀 Soluções para "NODE_ENV is not recognized"

### MAIS SIMPLES - Copie e cole no terminal:
```bash
start-dev.cmd
```

### ALTERNATIVAS:

#### 1. Script Windows (.bat)
```bash
dev-windows.bat
```

#### 2. PowerShell 
```bash
dev-windows.ps1
```

#### 3. Script Node.js
```bash
node scripts/dev.js
```

#### 4. Com npx (comando único)
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

---

## 🎯 O que acontece automaticamente:
- ✅ Instala dependências necessárias
- ✅ Configura variáveis de ambiente
- ✅ Cria tabelas da base de dados (se configurada)
- ✅ Inicia servidor em http://localhost:5000

## 📊 Sistema de Login:
- **Diretor** cria utilizadores
- **Username/Password** gerados automaticamente
- **3 tipos**: Trabalhador, Encarregado, Diretor

## 💾 Base de Dados:
- **Padrão**: Armazenamento em memória (dados temporários)
- **Persistente**: Configure DATABASE_URL no ficheiro .env