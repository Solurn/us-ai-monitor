param(
  [string]$TaskName = "US AI Monitor Taiwan IR Summary Update"
)

$ErrorActionPreference = "Stop"
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Removed scheduled task: $TaskName"
