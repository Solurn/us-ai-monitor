param(
  [string]$TaskName = "US Equity Monitor - Update Performance Snapshot",
  [int]$DelayMinutes = 3,
  [int]$MaxRuntimeMinutes = 10
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$Runner = Join-Path $ScriptDir "run-performance-update.ps1"

if (-not (Test-Path $Runner)) {
  throw "Runner script not found: $Runner"
}

$Action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Runner`" -Quiet" `
  -WorkingDirectory $Root

$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Trigger.Delay = "PT${DelayMinutes}M"

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Minutes $MaxRuntimeMinutes) `
  -MultipleInstances IgnoreNew `
  -StartWhenAvailable

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Principal $Principal `
  -Description "Updates the local US equity monitor performance snapshot shortly after Windows logon." `
  -Force | Out-Null

Write-Host "Installed scheduled task: $TaskName"
Write-Host "Delay after logon: $DelayMinutes minutes"
Write-Host "Max runtime: $MaxRuntimeMinutes minutes"
Write-Host "Runner: $Runner"
