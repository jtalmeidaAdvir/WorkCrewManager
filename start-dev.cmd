@echo off
echo ConstructPro - Sistema de Gestao de Construcao
echo.
echo Configurando ambiente de desenvolvimento...
set NODE_ENV=development

echo Verificando se tsx esta instalado...
npx tsx --version >nul 2>&1
if errorlevel 1 (
    echo Instalando tsx...
    npm install -g tsx
)

echo.
echo Iniciando servidor...
npx tsx server/index.ts