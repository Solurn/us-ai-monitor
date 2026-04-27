@echo off
setlocal
cd /d "%~dp0"

echo Updating US performance snapshot...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-performance-update.ps1" -Quiet

echo Opening dashboard...
start "" "%~dp0web\index.html"

endlocal
