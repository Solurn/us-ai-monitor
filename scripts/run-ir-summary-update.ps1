param(
  [switch]$Quiet,
  [switch]$Push,
  [switch]$NoTranscribe,
  [switch]$ForceUpdate,
  [string]$AsOf = "",
  [int]$Days = 3
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $Root
$IrRootItem = Get-ChildItem -Path $ProjectRoot -Directory |
  Where-Object {
    (Test-Path (Join-Path $_.FullName "main.py")) -and
    (Test-Path (Join-Path $_.FullName "ir_tool"))
  } |
  Select-Object -First 1

if (-not $IrRootItem) {
  throw "Could not find the IR summary project. Expected a sibling folder containing main.py and ir_tool."
}

$IrRoot = $IrRootItem.FullName
$LogDir = Join-Path $Root "outputs\logs"
$LockPath = Join-Path $LogDir "ir-summary-update.lock"
$LogPath = Join-Path $LogDir ("ir-summary-update-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
$BundledNode = "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (Test-Path $LockPath) {
  $lockAge = (Get-Date) - (Get-Item $LockPath).LastWriteTime
  $lockPidText = (Get-Content -Path $LockPath -ErrorAction SilentlyContinue | Select-Object -First 1)
  $lockPid = 0
  [void][int]::TryParse($lockPidText, [ref]$lockPid)
  $running = $false
  if ($lockPid -gt 0) {
    $running = $null -ne (Get-Process -Id $lockPid -ErrorAction SilentlyContinue)
  }
  if ($running) {
    "Another IR update appears to be running. PID: $lockPid. Lock age: {0:N1} minutes." -f $lockAge.TotalMinutes | Out-File -FilePath $LogPath -Encoding utf8
    exit 0
  }
  "Removing stale IR update lock. Lock age: {0:N1} minutes. PID: $lockPidText" -f $lockAge.TotalMinutes | Out-File -FilePath $LogPath -Encoding utf8
  Remove-Item -Path $LockPath -Force -ErrorAction SilentlyContinue
}

$PID | Out-File -FilePath $LockPath -Encoding ascii

try {
  $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
  if (-not $PythonCommand) {
    throw "Python was not found."
  }
  $PythonExe = $PythonCommand.Source

  if (Test-Path $BundledNode) {
    $NodeExe = $BundledNode
  }
  elseif (Get-Command node -ErrorAction SilentlyContinue) {
    $NodeExe = (Get-Command node).Source
  }
  else {
    throw "Node.js was not found."
  }

  "Started: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Out-File -FilePath $LogPath -Encoding utf8
  "Dashboard root: $Root" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "IR root: $IrRoot" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "Python: $PythonExe" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  "Node: $NodeExe" | Out-File -FilePath $LogPath -Encoding utf8 -Append

  $shouldRunSummary = $Days -gt 0
  $shouldImportSummary = $true
  if ($shouldRunSummary -and -not $ForceUpdate) {
    if ($AsOf) {
      $checkDate = $AsOf
    }
    else {
      $checkDate = Get-Date -Format "yyyy-MM-dd"
    }
    $calendarUrl = "https://histock.tw/stock/stockskd.aspx?cid=2&t=$checkDate"
    $calendarCheckScript = Join-Path $Root "scripts\check-ir-calendar.py"
    "Checking HiStock calendar: $calendarUrl" | Out-File -FilePath $LogPath -Encoding utf8 -Append
    try {
      $historyPath = Join-Path $Root "web\data\ir-summary-history.js"
      $calendarCheckOutput = & $PythonExe $calendarCheckScript $IrRoot $checkDate $historyPath $Days 2>&1
      $calendarCheckExit = $LASTEXITCODE
      if ($calendarCheckExit -eq 0) {
        "New HiStock investor conference rows after latest import: $calendarCheckOutput" | Out-File -FilePath $LogPath -Encoding utf8 -Append
      }
      elseif ($calendarCheckExit -eq 2) {
        "No investor conference found for $checkDate. Skipping IR crawl/transcription." | Out-File -FilePath $LogPath -Encoding utf8 -Append
        $shouldRunSummary = $false
        $shouldImportSummary = $false
      }
      else {
        "HiStock calendar check returned exit code ${calendarCheckExit}: $calendarCheckOutput" | Out-File -FilePath $LogPath -Encoding utf8 -Append
        $shouldRunSummary = $false
        $shouldImportSummary = $false
      }
    }
    catch {
      "HiStock calendar check failed. Skipping IR crawl/transcription. Error: $($_.Exception.Message)" | Out-File -FilePath $LogPath -Encoding utf8 -Append
      $shouldRunSummary = $false
      $shouldImportSummary = $false
    }
  }

  if ($shouldRunSummary) {
    Push-Location $IrRoot
    "Running IR summary..." | Out-File -FilePath $LogPath -Encoding utf8 -Append
    $pythonArgs = @("main.py", "--days", "$Days")
    if ($AsOf) {
      $pythonArgs += @("--as-of", "$AsOf")
    }
    if ($NoTranscribe -or $env:IR_SUMMARY_TRANSCRIBE -eq "0") {
      $pythonArgs += "--no-transcribe"
    }
    "Command: $PythonExe $($pythonArgs -join ' ')" | Out-File -FilePath $LogPath -Encoding utf8 -Append
    & $PythonExe @pythonArgs *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
    if ($LASTEXITCODE -ne 0) {
      throw "IR summary failed with exit code $LASTEXITCODE."
    }
    Pop-Location
  }
  else {
    "IR summary run skipped." | Out-File -FilePath $LogPath -Encoding utf8 -Append
  }

  if (-not $shouldImportSummary) {
    "IR dashboard import skipped." | Out-File -FilePath $LogPath -Encoding utf8 -Append
    "Finished: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Out-File -FilePath $LogPath -Encoding utf8 -Append
    if (-not $Quiet) {
      Get-Content -Path $LogPath
    }
    exit 0
  }

  Push-Location $Root
  "Importing IR summary into dashboard..." | Out-File -FilePath $LogPath -Encoding utf8 -Append
  if ($AsOf) {
    $env:IR_SUMMARY_MAX_DATE = $AsOf
    "Import max meeting date: $AsOf" | Out-File -FilePath $LogPath -Encoding utf8 -Append
  }
  & $NodeExe "scripts\import-ir-summary.mjs" *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
  if ($AsOf) {
    Remove-Item Env:\IR_SUMMARY_MAX_DATE -ErrorAction SilentlyContinue
  }
  if ($LASTEXITCODE -ne 0) {
    throw "IR import failed with exit code $LASTEXITCODE."
  }

  if ($Push) {
    $GitCommand = Get-Command git -ErrorAction SilentlyContinue
    if (-not $GitCommand) {
      throw "Git was not found, cannot push."
    }
    "Committing and pushing dashboard data..." | Out-File -FilePath $LogPath -Encoding utf8 -Append
    & git add "web/data/ir-summary-history.js" "web/index.html" "web/app.js" "web/styles.css" "scripts/import-ir-summary.mjs" "scripts/run-ir-summary-update.ps1" "scripts/install-ir-summary-update-task.ps1" "package.json" *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
      "No git changes to commit." | Out-File -FilePath $LogPath -Encoding utf8 -Append
    }
    else {
      & git commit -m "Update Taiwan IR summaries" *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
      & git push *>&1 | Out-File -FilePath $LogPath -Encoding utf8 -Append
    }
  }
  Pop-Location

  "Finished: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Out-File -FilePath $LogPath -Encoding utf8 -Append
  Get-ChildItem -Path $LogDir -Filter "ir-summary-update-*.log" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-14) } |
    Remove-Item -Force

  if (-not $Quiet) {
    Get-Content -Path $LogPath
  }
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
  Remove-Item -Path $LockPath -Force -ErrorAction SilentlyContinue
}
