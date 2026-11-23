# Mother feedback feature

## Running the project

Backend (from `backend`): `python -m pip install -r requirements.txt`, then `uvicorn main:app --reload --port 8000`.
Frontend (from `frontend`): `npm install`, then `npm run dev`.

**Important:** Restart the backend after replacing your source files so SQLAlchemy creates the new `feedback` table. Existing SQLite data is retained. Do not overwrite your current `backend/bloomher.db`.

Log out and log in again after updating the application. Feedback API calls require a new signed session token returned by `/auth/login`.

## Use

1. Sign in as a mother. Choose **Feedback** in the left menu. Select 1–5 stars, type a message, and submit. Your submissions are shown below the form.
2. Sign out. Sign in as an ASHA worker. Select **Mother feedback** to see the submitted feedback.
3. Sign in as a healthcare professional. Select **Mother feedback** to see the same shared inbox.

## API

- `POST /feedback` — mother only, body `{ "rating": 5, "message": "Helpful app" }`
- `GET /feedback` — mother sees own entries; ASHA/professional see all demo entries.
- Both require `Authorization: Bearer <token>` from `/auth/login`.

## Scope and security limitations

This is a **college demonstration feature**, not a clinical or production messaging system. All ASHA and professional accounts can see all submitted feedback, rather than only assigned mothers. Do not submit real patient data or sensitive medical information. Other existing application endpoints have not been fully secured. Tokens last 24 hours and are held in browser session storage. The signing key is stored in `backend/.feedback_signing_key` unless `BLOOMHER_FEEDBACK_SECRET` is configured. Protect that file; do not share it.

## Verification

Backend API smoke tests passed for successful mother submission, mother/ASHA/professional retrieval, anonymous access rejection (401), staff submission rejection (403), and invalid rating rejection (422). Python syntax compilation passed. The frontend TypeScript build could not be completed in this environment because npm dependencies are not installed; run `npm install && npm run build` on the target machine.
