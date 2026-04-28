@echo off
setlocal
cd /d "%~dp0"

echo Updating dashboard data...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-performance-update.ps1" -Quiet

echo Opening dashboard...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=8780; $root='%~dp0web'; $busy=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if (-not $busy) { Start-Process -FilePath python -ArgumentList '-m','http.server',$port,'--bind','127.0.0.1','--directory',$root -WorkingDirectory $root -WindowStyle Hidden }; Start-Sleep -Milliseconds 500; Start-Process ('http://127.0.0.1:' + $port + '/index.html?v=' + [DateTimeOffset]::Now.ToUnixTimeSeconds())"

endlocal
