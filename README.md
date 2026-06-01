<<<<<<< HEAD
# MyFitness
=======
# MyFitness AI Coach (FastAPI + React + Gemini + Google Sheets)

This repo contains:
- `backend/`: FastAPI service (Gemini coach + Google Sheets persistence)
- `frontend/`: React web app (journal, logs, AI chat)

## Local dev (outline)

1. Create a Google Sheet (a separate spreadsheet) and note its `SPREADSHEET_ID`.
2. Create a GCP service account for Google Sheets API and grant it access to the spreadsheet.
3. Create a Gemini API key.
4. Configure environment variables:
   - backend: see `backend/.env.example`
   - `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` must be the Base64-encoded content of your Sheets API service account JSON file.
   - also set `SPREADSHEET_ID` and `GEMINI_API_KEY`
5. Run:
   - backend: `uvicorn app.main:app --reload`
   - frontend: `npm run dev` from `frontend/`

### Google Sheets bootstrap (recommended)

This project expects specific tab names and header columns. The easiest way to create them is to run:

```bash
cd backend
python -m app.scripts.setup_sheets
```

Required tabs (created automatically by the script):
- `config`
- `journal_entries`
- `body_stats`
- `run_logs`
- `strength_sessions`
- `strength_exercises`
- `meal_plan_generations`
- `training_plan_generations`
- `ai_actions`

After that, the UI can:
- log journal/body/run/strength entries
- ask Gemini questions and optionally save structured updates into Sheets

Tip: to produce the Base64 service account secret locally:
```bash
python3 - <<'PY'
import base64, pathlib
p = pathlib.Path("PATH/TO/service-account.json")
print(base64.b64encode(p.read_bytes()).decode("utf-8"))
PY
```

## CI/CD

GitHub Actions workflows are under `.github/workflows/` to deploy both apps to GCP Cloud Run.
Deployment assumes secrets are configured in your GitHub repo:
- `GCP_SA_KEY` (service account key JSON for deploy)
- `GEMINI_API_KEY`
- `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` (service account JSON for Sheets API)
- `SPREADSHEET_ID`

>>>>>>> 57bbd2a (Initial commit)
