$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root 'SentriAi'

Write-Host "Starting backend..."
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$root'; uvicorn api:app --reload --host 0.0.0.0 --port 8000"
)

Write-Host "Starting frontend..."
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendDir'; npm run dev -- --host 0.0.0.0"
)

Write-Host ""
Write-Host "Both services were started."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
