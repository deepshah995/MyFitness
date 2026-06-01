from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, Tuple

from google.oauth2 import service_account
from googleapiclient.discovery import build

from app.core.config import Settings

SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class SheetsClient:
    def __init__(self, settings: Settings):
        creds = service_account.Credentials.from_service_account_info(
            settings.service_account_info(), scopes=SHEETS_SCOPES
        )
        self.service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        self.spreadsheet_id = settings.spreadsheet_id

    def get_values(self, *, range_name: str) -> List[List[str]]:
        try:
            resp = (
                self.service.spreadsheets()
                .values()
                .get(spreadsheetId=self.spreadsheet_id, range=range_name)
                .execute()
            )
            return resp.get("values", [])
        except Exception:
            # Common before setup: tabs/headers not created yet.
            return []

    def append_row(self, *, sheet_name: str, values: List[Any]) -> None:
        range_name = f"{sheet_name}!A1"
        body = {"values": [values]}
        (
            self.service.spreadsheets()
            .values()
            .append(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption="USER_ENTERED",
                body=body,
                insertDataOption="INSERT_ROWS",
            )
            .execute()
        )

    def clear_and_write_row(self, *, sheet_name: str, header: List[str], row: List[Any]) -> None:
        """
        For MVP bootstrapping only. Assumes tab has the same header row shape.
        """
        # Write header
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f"{sheet_name}!A1",
            valueInputOption="USER_ENTERED",
            body={"values": [header]},
        ).execute()
        # Write row
        self.service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f"{sheet_name}!A2",
            valueInputOption="USER_ENTERED",
            body={"values": [row]},
        ).execute()


def build_sheets_client(settings: Settings) -> SheetsClient:
    return SheetsClient(settings)

