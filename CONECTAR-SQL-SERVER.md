# Como Conectar à Sua Base SQL Server Existente

## Passos Simples:

### 1. No seu PC - Instalar ngrok
- Ir a: https://ngrok.com/download
- Baixar para Windows
- Descompactar em qualquer pasta

### 2. No seu PC - Executar ngrok
Abrir Command Prompt e executar:
```cmd
# Navegar para a pasta do ngrok
cd C:\caminho\para\ngrok

# Criar túnel para SQL Server
ngrok tcp 1433
```

### 3. Copiar o URL
Vai aparecer algo como:
```
Forwarding: tcp://2.tcp.ngrok.io:19876 -> localhost:1433
```

### 4. No Replit - Atualizar .env
Alterar estas linhas no ficheiro .env:
```env
DB_SERVER=2.tcp.ngrok.io
DB_PORT=19876
DB_USER=sa
DB_PASSWORD=1234
DB_NAME=Advir
```

### 5. Reiniciar aplicação
A aplicação conectará à sua base existente!

## O que acontece:
- ngrok cria uma "ponte" da internet para o seu PC
- O Replit consegue "ver" o seu SQL Server
- Os seus dados ficam no seu PC, apenas acessíveis pela aplicação

**Quer começar? Precisa apenas instalar ngrok no seu PC.**