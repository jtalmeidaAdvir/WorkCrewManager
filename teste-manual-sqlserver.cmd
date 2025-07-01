@echo off
echo Teste Manual SQL Server - ConstructPro
echo.

echo Testando instancias disponiveis:
echo.

echo 1. Testando SQL2022...
sqlcmd -S localhost\SQL2022 -U sa -P 1234 -Q "SELECT @@SERVERNAME" -t 5 2>nul
if not errorlevel 1 (
    echo ✓ SQL2022 - FUNCIONA!
    echo Configure .env com: DB_HOST=localhost\SQL2022
    goto :found
)

echo 2. Testando PRIEXPRESS100...
sqlcmd -S localhost\PRIEXPRESS100 -U sa -P 1234 -Q "SELECT @@SERVERNAME" -t 5 2>nul
if not errorlevel 1 (
    echo ✓ PRIEXPRESS100 - FUNCIONA!
    echo Configure .env com: DB_HOST=localhost\PRIEXPRESS100
    goto :found
)

echo 3. Testando SQL_LA_2025...
sqlcmd -S localhost\SQL_LA_2025 -U sa -P 1234 -Q "SELECT @@SERVERNAME" -t 5 2>nul
if not errorlevel 1 (
    echo ✓ SQL_LA_2025 - FUNCIONA!
    echo Configure .env com: DB_HOST=localhost\SQL_LA_2025
    goto :found
)

echo 4. Testando localhost default...
sqlcmd -S localhost -U sa -P 1234 -Q "SELECT @@SERVERNAME" -t 5 2>nul
if not errorlevel 1 (
    echo ✓ localhost - FUNCIONA!
    echo Configure .env com: DB_HOST=localhost
    goto :found
)

echo.
echo ❌ Nenhuma instância respondeu com utilizador 'sa' e password '1234'
echo.
echo POSSÍVEIS SOLUÇÕES:
echo 1. Verificar se Mixed Mode Authentication está ativo
echo 2. Verificar password do utilizador 'sa'
echo 3. Usar Windows Authentication em vez de SQL Authentication
echo.
goto :end

:found
echo.
echo 🎉 SUCESSO! Use a configuração acima no ficheiro .env
echo Depois reinicie a aplicação ConstructPro

:end
echo.
pause