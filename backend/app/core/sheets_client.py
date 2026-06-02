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
        self.service = None
        self.spreadsheet_id = settings.spreadsheet_id
        
        try:
            sa_info = settings.service_account_info()
            if sa_info:
                creds = service_account.Credentials.from_service_account_info(
                    sa_info, scopes=SHEETS_SCOPES
                )
            else:
                # Fallback to Application Default Credentials (Cloud Run service account).
                creds, _ = google.auth.default(scopes=SHEETS_SCOPES)
            self.service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        except Exception as e:
            print(f"⚠️ Sheets Client Initialization Failed: {e}", flush=True)

    def get_values(self, *, range_name: str) -> List[List[str]]:
        if not self.service or not self.spreadsheet_id:
            print("⚠️ Sheets Client not initialized; returning empty values", flush=True)
            return []
        try:
            resp = (
                self.service.spreadsheets()
                .values()
                .get(spreadsheetId=self.spreadsheet_id, range=range_name)
                .execute()
            )
            return resp.get("values", [])
        except Exception as e:
            # Common before setup: tabs/headers not created yet.
            print(f"⚠️ Sheets get_values failed: {e}", flush=True)
            return []

    def append_row(self, *, sheet_name: str, values: List[Any]) -> None:
        if not self.service or not self.spreadsheet_id:
            print("⚠️ Sheets Client not initialized; append_row skipped", flush=True)
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
        except Exception as e:
            print(f"⚠️ Sheets append_row failed: {e}", flush=True)

    def clear_and_write_row(self, *, sheet_name: str, header: List[str], row: List[Any]) -> None:
        """
        For MVP bootstrapping only. Assumes tab has the same header row shape.
        """
        if not self.service or not self.spreadsheet_id:
            print("⚠️ Sheets Client not initialized; clear_and_write_row skipped", flush=True)
            return
        try:
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
        except Exception as e:
            print(f"⚠️ Sheets clear_and_write_row failed: {e}", flush=True)


def build_sheets_client(settings: Settings) -> SheetsClient:
    return SheetsClient(settings)

