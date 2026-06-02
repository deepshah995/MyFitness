from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, Tuple

import google.auth
from google.oauth2 import service_account
from googleapiclient.discovery import build

from app.core.config import Settings

SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class SheetsClient:
    def __init__(self, settings: Settings):
        self.spreadsheet_id = settings.spreadsheet_id
        self.service = None
        
        # Check if spreadsheet ID is provided
        if not self.spreadsheet_id:
            return

        try:
            sa_info = settings.service_account_info()
            if sa_info:
                creds = service_account.Credentials.from_service_account_info(
                    sa_info, scopes=SHEETS_SCOPES
                )
            else:
                # Fallback to Application Default Credentials (Cloud Run service account).
                try:
                    creds, _ = google.auth.default(scopes=SHEETS_SCOPES)
                except Exception:
                    # In local dev environment without credentials
                    creds = None
            
            if creds:
                self.service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        except Exception:
            # Silence auth initialization failures so the app stays up.
            self.service = None

    def get_values(self, *, range_name: str) -> List[List[str]]:
        if not self.service or not self.spreadsheet_id:
            return []
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
        if not self.service or not self.spreadsheet_id:
            return
        range_name = f"{sheet_name}!A1"
        body = {"values": [values]}
        try:
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
        except Exception:
            pass

    def clear_and_write_row(self, *, sheet_name: str, header: List[str], row: List[Any]) -> None:
        """
        For MVP bootstrapping only. Assumes tab has the same header row shape.
        """
        if not self.service or not self.spreadsheet_id:
            return
        # Write header
        try:
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
        except Exception:
            pass


def build_sheets_client(settings: Settings) -> SheetsClient:
    return SheetsClient(settings)

