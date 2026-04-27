param(
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$LogDir = Join-Path $Root "outputs\logs"
$LockPath = Join-Path $LogDir "performance-update.lock"
$LogPath = Join-Path $LogDir ("performance-update-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
$NodeScripts = @(
  (Join-Path $ScriptDir "update-performance.mjs"),
  (Join-Path $ScriptDir "update-daily-briefing.mjs")
)
$BundledNode = "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (Test-Path $LockPath) {
  $lockAge = (Get-Date) - (Get-Item $LockPath).LastWriteTime
  if ($lockAge.TotalMinutes -lt 30) {
    "Another update appears to be running. Lock age: {0:N1} minutes." -f $lockAge.TotalMinutes | Out-File -FilePath $LogPath -Encoding utf8
    exit 0
  }
}

New-Item -ItemType File -Force -Path $LockPath | Out-Null

try {
  Push-Location $Root
  $NodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($NodeCommand) {
    $NodeExe = $NodeCommand.Source
  }
  elseif (Test-Path $BundledNode) {
    $NodeExe = $BundledNode
  }
  else {
    "Node.js was not found. Install Node.js or update BundledNode in this script." | Out-File -FilePath $LogPath -Encoding utf8
    throw "Node.js was not found."
  }

  "Started: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Out-File -FilePath $LogPath -Encoding utf8
  "Root: $Root" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "Node: $NodeExe" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "Command: $NodeExe update-performance.mjs; $NodeExe update-daily-briefing.mjs" | Out-File -FilePath $LogPath -Encoding utf8 -Append

  $exitCode = 0
  foreach ($NodeScript in $NodeScripts) {
    "Running: $NodeScript" | Out-File -FilePath $LogPath -Encoding utf8 -Append
    & $NodeExe $NodeScript *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
    if ($LASTEXITCODE -ne 0) {
      $exitCode = $LASTEXITCODE
      break
    }
  }

  "Finished: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "ExitCode: $exitCode" | Out-File -FilePath $LogPath -Encoding utf8 -Append

  Get-ChildItem -Path $LogDir -Filter "performance-update-*.log" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
    Remove-Item -Force

  if (-not $Quiet) {
    Get-Content -Path $LogPath
  }

  exit $exitCode
}
finally {
  Pop-Location
  Remove-Item -Path $LockPath -Force -ErrorAction SilentlyContinue
}
