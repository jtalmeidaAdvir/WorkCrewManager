@echo off
echo ConstructPro - Diagnostico SQL Server
echo.

echo 1. Verificando servicos SQL Server...
net start | find /i "sql"
echo.

echo 2. Verificando porta 1433...
netstat -an | find ":1433"
echo.

echo 3. Testando conexao com sqlcmd...
echo Tentando conectar com: sqlcmd -S localhost -U sa
sqlcmd -S localhost -U sa -Q "SELECT @@VERSION" 2>nul
if errorlevel 1 (
    echo Erro na conexao com sqlcmd
    echo.
    echo POSSIVEIS SOLUCOES:
    echo - Verificar se SQL Server esta executando
    echo - Verificar se TCP/IP esta habilitado
    echo - Verificar se Mixed Mode Authentication esta ativo
    echo - Verificar password do usuario 'sa'
) else (
    echo Conexao SQL Server OK!
)

echo.
echo 4. Verificando se base 'Obras' existe...
sqlcmd -S localhost -U sa -Q "SELECT name FROM sys.databases WHERE name = 'Obras'" 2>nul

echo.
echo Diagnostico concluido.
pause