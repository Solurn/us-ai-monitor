param(
  [string]$TaskName = "US AI Monitor Taiwan IR Summary Update",
  [string]$Time = "19:30",
  [switch]$Push
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RunScript = Join-Path $ScriptDir "run-ir-summary-update.ps1"
$PushArg = if ($Push) { " -Push" } else { "" }
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$RunScript`" -Quiet$PushArg"
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 3) -StartWhenAvailable
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Force | Out-Null
Write-Host "Installed scheduled task: $TaskName at $Time"
if ($Push) {
  Write-Host "Git push is enabled. The task will commit and push dashboard data if git credentials are available."
}
else {
  Write-Host "Git push is disabled. Add -Push when installing if you want automatic commit/push."
}
