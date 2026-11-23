# BloomHer API

FastAPI backend for the BloomHer classroom prototype.

## Run

```bash
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Swagger UI: `http://127.0.0.1:8000/docs`.

The SQLite database is created in the current working directory as `bloomher.db`. Run commands from this directory for consistent database placement.

## Important

This API is not production-secure: private routes currently use numeric IDs without bearer-token authentication or role/ownership enforcement. Use fictional classroom data only and bind to localhost. See the repository root README for the full safety and privacy limitations.
