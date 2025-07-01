@echo off
echo ConstructPro - Configuracao PostgreSQL
echo.

echo Verificando se PostgreSQL esta instalado...
psql --version >nul 2>&1
if errorlevel 1 (
    echo PostgreSQL nao encontrado!
    echo.
    echo OPCOES DE INSTALACAO:
    echo 1. Baixar de https://www.postgresql.org/download/windows/
    echo 2. Instalar via Chocolatey: choco install postgresql
    echo 3. Usar Docker: docker run -d -p 5432:5432 -e POSTGRES_password=password postgres
    echo.
    echo Apos instalar, execute este script novamente.
    pause
    exit /b 1
)

echo PostgreSQL encontrado!
echo.

echo Criando base de dados 'constructpro'...
psql -U postgres -c "CREATE DATABASE IF NOT EXISTS constructpro;" 2>nul
if errorlevel 1 (
    echo Erro ao criar base de dados. Verifique:
    echo - Se o servico PostgreSQL esta a executar
    echo - Se a password esta correta
    echo - Se tem permissoes de administrador
    echo.
    echo Pode criar manualmente:
    echo psql -U postgres
    echo CREATE DATABASE constructpro;
    pause
    exit /b 1
)

echo Base de dados 'constructpro' criada com sucesso!
echo.

echo Configuracao do ficheiro .env:
echo DATABASE_URL=postgresql://postgres:SUA_PASSWORD@localhost:5432/constructpro
echo.
echo Substitua SUA_PASSWORD pela password do PostgreSQL
echo.

echo Configuracao concluida!
echo Agora execute: npx cross-env NODE_ENV=development tsx server/index.ts
pause