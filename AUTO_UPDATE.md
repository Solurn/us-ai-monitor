# Auto Update Design

This project can update the performance snapshot as a short one-shot task after Windows logon.

## What It Does

- Waits a few minutes after Windows logon.
- Runs `scripts\update-performance.mjs`.
- Writes `web\data\performance-snapshot.js`.
- Writes logs to `outputs\logs`.
- Exits after the update finishes.

It is not a background service and does not stay resident after completion.

## Install The Logon Task

Run PowerShell from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-login-update-task.ps1
```

Defaults:

- Delay after logon: 3 minutes
- Maximum runtime: 10 minutes
- Multiple instances: ignored
- Run level: least privilege

## Manual Update

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-performance-update.ps1
```

## Remove The Logon Task

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-login-update-task.ps1
```

## Notes

- The updater currently targets US tickers only.
- Taiwan tickers stay as TradingView links and are not included in performance averages.
- If the computer is shut down at logon time, no update runs until the next logon.
- If network access is unavailable, the script exits and keeps the previous snapshot.
