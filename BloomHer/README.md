# BloomHer — maternal wellbeing support prototype

BloomHer is a student project prototype for coordinating non-diagnostic maternal wellbeing check-ins, educational resources, ASHA follow-up, and clinician referrals during pregnancy and after childbirth.

**Clinical safety boundary:** BloomHer is not a diagnostic or treatment tool. Screening scores are signals for a conversation with a qualified person; they must not be used as a diagnosis or as the sole basis for care decisions. The AI feature only routes a voluntarily entered, non-clinical support request to an educational resource topic. It does not analyse symptoms, assess suicide risk, diagnose a condition, or provide emergency support.

## Current implementation

- React + TypeScript + Vite frontend with Mother, ASHA worker, and Healthcare Professional workspaces.
- FastAPI + SQLAlchemy + SQLite backend.
- Registration and password verification (PBKDF2-HMAC-SHA256 password hashes).
- Mother profile, screening questions, screening submission, and screening history endpoints.
- EPDS and PHQ-9 scoring functions with separate safety-signal handling.
- ASHA assigned-mother and professional-referral read endpoints.
- AI resource-topic classifier using TF-IDF + Logistic Regression. It is trained on small, illustrative synthetic phrases and returns a resource category, not a clinical assessment.
- Demo seed script and health-check endpoints.

Some workspace panels and follow-up/referral interactions still use local demonstration data. There is no production-grade administrator workspace, verified clinician/ASHA identity workflow, notification system, or secure role-based API authorization yet. See **Known limitations** below.

## Repository layout

```text
frontend/                 React + TypeScript application
backend/                  FastAPI API, SQLite models, screening and AI logic
backend/ai_support.py     Non-clinical TF-IDF resource-topic classifier
services/                 Project notes for future extensions
```

## Requirements

- Python 3.10+
- Node.js 20+
- npm

## Run locally

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API documentation: http://127.0.0.1:8000/docs
Health check: http://127.0.0.1:8000/health

Demo accounts (all use password `BloomHer@123`):

| Role | Email |
|---|---|
| Mother | `priya@bloomher.demo` |
| ASHA worker | `asha@bloomher.demo` |
| Healthcare professional | `doctor@bloomher.demo` |

Use only fictional data in the demo. The seed script creates sample records in the local SQLite database.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend calls `http://127.0.0.1:8000`. To override it, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Build and lint:

```bash
npm run build
npm run lint
```

## AI feature and evaluation

The AI resource finder uses TF-IDF text features and Logistic Regression to classify support requests into broad resource topics: sleep/rest, feeding support, family/community support, emotional wellbeing resources, and professional guidance. The training phrases in `backend/ai_support.py` are synthetic examples written for a classroom demonstration. They are **not** real participant responses, not a validated clinical dataset, and not suitable for a health-risk model.

For the college report, clearly separate:
1. Model demonstration results on the included synthetic examples.
2. Actual user testing conducted by the team, with consent and no unnecessary collection of health details.
3. Any survey/interview findings collected by the team. Do not invent respondents, interviews, accuracy, or usability scores.

## Known limitations / before any real-world use

- This is a classroom prototype, not a deployable health service.
- API routes that accept numeric user or mother IDs do not yet enforce authenticated, role-based ownership checks. Do not expose this API to the public internet or enter real patient data.
- No HTTPS, refreshable session tokens, rate limiting, audit trail, encryption-at-rest policy, consent workflow, retention/deletion workflow, or formal privacy review is implemented.
- Some ASHA/professional dashboard data and follow-up/referral interactions are still mock/local data. Confirm each screen against backend persistence before presenting it as fully integrated.
- Screening instruments and cut-offs must be checked against the version approved by the institution/clinical supervisor and local protocol. The app's labels are not clinical advice.
- The AI model has a tiny synthetic training set and has not been independently validated. Its confidence score is not a probability of illness or urgency.

## Suggested classroom validation

- Interview at least five intended users/stakeholders and document consent, anonymised notes, and themes.
- Conduct a survey with the required number of participants; report actual response counts and limitations.
- Test the prototype with at least ten users and record task completion, observed issues, and feedback.
- Evaluate the topic classifier on a separately held-out, labelled, non-clinical test set. Report precision/recall/F1 and a confusion matrix; do not report training-set accuracy as validation.
- Keep all test data synthetic or anonymised and obtain supervisor approval before collecting sensitive information.
