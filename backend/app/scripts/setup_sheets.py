from __future__ import annotations

import os
from typing import List

from app.core.config import get_settings
from app.core.sheets_client import SheetsClient
from app.services.sheets_repository import HEADERS


def _print(msg: str) -> None:
    print(msg, flush=True)


def ensure_tabs(*, sheets: SheetsClient, spreadsheet_id: str, tab_names: List[str]) -> None:
    ss = sheets.service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    existing = {s.get("properties", {}).get("title") for s in ss.get("sheets", [])}

    missing = [t for t in tab_names if t not in existing]
    if not missing:
        _print("All required tabs already exist.")
        return

    body = {
        "requests": [
            {
                "addSheet": {
                    "properties": {
                        "title": t,
                        "gridProperties": {"rowCount": 1000, "columnCount": 30},
                    }
                }
            }
            for t in missing
        ]
    }
    sheets.service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body=body).execute()
    _print(f"Created missing tabs: {missing}")


def write_headers(*, sheets: SheetsClient, tab_names: List[str]) -> None:
    for tab in tab_names:
        header = HEADERS[tab]
        sheets.service.spreadsheets().values().update(
            spreadsheetId=sheets.spreadsheet_id,
            range=f"{tab}!A1",
            valueInputOption="USER_ENTERED",
            body={"values": [header]},
        ).execute()
    _print(f"Wrote headers for tabs: {tab_names}")


def main() -> None:
    settings = get_settings()
    sheets = SheetsClient(settings=settings)

    # Optional: if user only wants headers without creating tabs.
    if os.getenv("SKIP_CREATE", "").strip():
        _print("SKIP_CREATE set; not creating missing tabs.")
    else:
        ensure_tabs(sheets=sheets, spreadsheet_id=settings.spreadsheet_id, tab_names=list(HEADERS.keys()))

    write_headers(sheets=sheets, tab_names=list(HEADERS.keys()))


if __name__ == "__main__":
    main()

