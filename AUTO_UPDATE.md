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

## Taiwan IR Summary Update

Manual import/update:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-ir-summary-update.ps1
```

By default, the IR updater first checks HiStock for new investor conference
rows newer than the dashboard's current `latestDate`. The reference calendar
page is:

```text
https://histock.tw/stock/stockskd.aspx?cid=2&t=YYYY-MM-DD
```

If HiStock does not have a newer completed/current investor conference date,
it skips the MOPS crawl, media download, audio transcription, summary
generation, and dashboard import. Use `-ForceUpdate` for historical rebuilds
or manual backfills.

Install the daily 19:30 Taiwan-time updater:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-ir-summary-update-task.ps1
```

If you want the scheduled task to commit and push the dashboard data after updating:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-ir-summary-update-task.ps1 -Push
```

Remove it:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-ir-summary-update-task.ps1
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
- Windows scheduled tasks require the computer to be on. GitHub Actions can run while the computer is off, but only for code and secrets that live in the GitHub repo.
