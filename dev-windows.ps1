Write-Host "Iniciando ConstructPro..." -ForegroundColor Green
Write-Host "Configurando ambiente de desenvolvimento..." -ForegroundColor Yellow
$env:NODE_ENV = "development"

Write-Host "Verificando dependencias..." -ForegroundColor Yellow
npm install

Write-Host "A iniciar servidor..." -ForegroundColor Green
tsx server/index.ts