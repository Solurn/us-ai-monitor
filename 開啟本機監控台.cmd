@echo off
setlocal
cd /d "%~dp0"

echo Updating dashboard data...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-performance-update.ps1" -Quiet

echo Opening dashboard...
start "" "%~dp0web\index.html"

endlocal
