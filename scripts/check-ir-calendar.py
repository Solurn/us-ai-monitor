from __future__ import annotations

import sys
from datetime import date
from pathlib import Path


def main() -> int:
    if len(sys.argv) not in {3, 5}:
        print(
            "Usage: check-ir-calendar.py <ir_root> <yyyy-mm-dd> [history_js days]",
            file=sys.stderr,
        )
        return 1

    ir_root = sys.argv[1]
    target_date = date.fromisoformat(sys.argv[2])
    history_path = Path(sys.argv[3]) if len(sys.argv) == 5 else None
    days = int(sys.argv[4]) if len(sys.argv) == 5 else 1
    sys.path.insert(0, ir_root)

    from ir_tool.dates import recent_trading_days
    from ir_tool.histock import fetch_calendar_events
    from ir_tool.http import HttpClient

    latest_imported = read_latest_date(history_path)
    trading_days = recent_trading_days(target_date, max(days, 1), holidays=set())
    events = fetch_calendar_events(HttpClient(timeout=30), trading_days, anchor_date=target_date)
    new_events = [
        event
        for event in events
        if event.date <= target_date.isoformat()
        and (not latest_imported or event.date > latest_imported)
    ]
    if new_events:
        print(",".join(f"{event.date}:{event.code}" for event in new_events))
        return 0
    print("NO_EVENTS")
    return 2


def read_latest_date(path: Path | None) -> str:
    if not path or not path.exists():
        return ""
    text = path.read_text(encoding="utf-8", errors="replace")
    marker = '"latestDate": "'
    start = text.find(marker)
    if start < 0:
        return ""
    start += len(marker)
    end = text.find('"', start)
    return text[start:end] if end > start else ""


if __name__ == "__main__":
    raise SystemExit(main())
