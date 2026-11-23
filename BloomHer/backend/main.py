from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import base64
import binascii
import hashlib
import hmac
import secrets
import json
import os
import time
from pathlib import Path
from fastapi import Header
import models
from database import Base, SessionLocal, engine, get_db
from datetime import datetime
from pydantic import BaseModel, Field
from ai_support import classify_support_topic
from screening_data import (
    EPDS_QUESTIONS,
    PHQ9_QUESTIONS,
    calculate_score,
    get_epds_severity,
    get_phq9_severity,
    has_epds_self_harm_signal,
    has_phq9_self_harm_signal,
)
from schemas import (
    ScreeningHistoryItem,
    ScreeningQuestionsResponse,
    ScreeningResultResponse,
    ScreeningSubmitRequest,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    MotherProfileResponse
)

# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    """Hash passwords with PBKDF2-HMAC-SHA256 and a per-user random salt."""
    salt = secrets.token_bytes(16)
    iterations = 310_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(digest).decode(),
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, iterations_text, salt_text, digest_text = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(digest_text.encode())
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), salt, int(iterations_text)
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


# ============================================================
# APP SETUP
# ============================================================

app = FastAPI(
    title="BloomHer API",
    description="Backend API for BloomHer maternal wellbeing support platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables if they do not already exist.
Base.metadata.create_all(bind=engine)

# Feedback-only signed session tokens. Persist the signing key between restarts.
_SECRET_FILE = Path(__file__).with_name(".feedback_signing_key")
if os.environ.get("BLOOMHER_FEEDBACK_SECRET"):
    _FEEDBACK_SECRET = os.environ["BLOOMHER_FEEDBACK_SECRET"].encode()
else:
    if not _SECRET_FILE.exists():
        try:
            with _SECRET_FILE.open("x") as handle:
                handle.write(secrets.token_hex(32))
        except FileExistsError:
            pass
    _FEEDBACK_SECRET = _SECRET_FILE.read_text().strip().encode()

def issue_feedback_token(user):
    payload = json.dumps({"id": user.id, "role": user.role, "exp": int(time.time()) + 86400}, separators=(",", ":")).encode()
    encoded = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    signature = hmac.new(_FEEDBACK_SECRET, encoded.encode(), hashlib.sha256).hexdigest()
    return encoded + "." + signature

def feedback_actor(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please log in again to use feedback.")
    try:
        encoded, signature = authorization[7:].split(".", 1)
        expected = hmac.new(_FEEDBACK_SECRET, encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
        if payload["exp"] < time.time():
            raise ValueError("Expired")
        user = db.get(models.User, payload["id"])
        if user is None or user.role != payload["role"]:
            raise ValueError("Invalid user")
        return user
    except (ValueError, KeyError, TypeError, UnicodeDecodeError, json.JSONDecodeError, binascii.Error):
        raise HTTPException(401, "Feedback session expired or invalid. Log in again.")

class FeedbackInput(BaseModel):
    rating: int = Field(ge=1, le=5)
    message: str = Field(min_length=3, max_length=1000)

def feedback_dict(record, db):
    author = db.get(models.User, record.mother_user_id)
    return {"id": record.id, "mother_name": author.name if author else "Mother", "rating": record.rating, "message": record.message, "created_at": record.created_at.isoformat() + "Z"}

@app.post("/feedback", status_code=201)
def submit_feedback(request: FeedbackInput, user: models.User = Depends(feedback_actor), db: Session = Depends(get_db)):
    if user.role != "mother":
        raise HTTPException(403, "Only mothers may submit feedback.")
    message = request.message.strip()
    if len(message) < 3:
        raise HTTPException(422, "Please provide at least three characters.")
    record = models.Feedback(mother_user_id=user.id, rating=request.rating, message=message)
    db.add(record)
    db.commit()
    db.refresh(record)
    return feedback_dict(record, db)

@app.get("/feedback")
def list_feedback(user: models.User = Depends(feedback_actor), db: Session = Depends(get_db)):
    query = db.query(models.Feedback)
    if user.role == "mother":
        query = query.filter(models.Feedback.mother_user_id == user.id)
    elif user.role not in ("asha", "professional"):
        raise HTTPException(403, "Not authorised to view feedback.")
    # Shared demonstration feedback inbox. All ASHA/professional accounts can view submitted feedback.
    records = query.order_by(models.Feedback.created_at.desc(), models.Feedback.id.desc()).limit(200).all()
    return [feedback_dict(record, db) for record in records]

# ============================================================
# AUTHENTICATION / REGISTRATION
# ============================================================

@app.post(
    "/auth/register",
    response_model=AuthResponse,
)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether email is already registered
    # --------------------------------------------------------

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == request.email.strip().lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # --------------------------------------------------------
    # Validate role
    # --------------------------------------------------------

    if request.role not in {"mother", "asha", "professional"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Use mother, asha, or professional.",
        )

    # --------------------------------------------------------
    # Validate ASHA registration details
    # --------------------------------------------------------

    if request.role == "asha":

        if not request.asha_id or not request.asha_id.strip():
            raise HTTPException(
                status_code=400,
                detail="ASHA Worker ID is required.",
            )

        if not request.phone or not request.phone.strip():
            raise HTTPException(
                status_code=400,
                detail="Phone number is required for an ASHA account.",
            )

        if not request.village or not request.village.strip():
            raise HTTPException(
                status_code=400,
                detail="Service area is required for an ASHA account.",
            )


    # --------------------------------------------------------
    # Validate healthcare professional registration details
    # --------------------------------------------------------

    if request.role == "professional":

        if (
            not request.registration_number
            or not request.registration_number.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Registration number is required for a professional account.",
            )

        if (
            not request.qualification
            or not request.qualification.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Qualification is required for a professional account.",
            )

        if (
            not request.specialization
            or not request.specialization.strip()
        ):
            raise HTTPException(
                status_code=400,
                detail="Specialization is required for a professional account.",
        )

    # --------------------------------------------------------
    # Validate ASHA details
    # --------------------------------------------------------

    if request.role == "asha":
        if not request.asha_id:
            raise HTTPException(
                status_code=400,
                detail="ASHA Worker ID is required for an ASHA account.",
            )

        if not request.phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number is required for an ASHA account.",
            )

    # --------------------------------------------------------
    # Validate healthcare professional details
    # --------------------------------------------------------

    if request.role == "professional":
        if not request.registration_number:
            raise HTTPException(
                status_code=400,
                detail="Registration number is required for a professional account.",
            )

        if not request.qualification:
            raise HTTPException(
                status_code=400,
                detail="Qualification is required for a professional account.",
            )

        if not request.specialization:
            raise HTTPException(
                status_code=400,
                detail="Specialization is required for a professional account.",
            )

    # --------------------------------------------------------
    # Check identity ID uniqueness
    # --------------------------------------------------------

    identity_id = None

    if request.role == "asha":
        identity_id = request.asha_id.strip()

    elif request.role == "professional":
        identity_id = request.registration_number.strip()

    if identity_id:
        existing_identity = (
            db.query(models.User)
            .filter(models.User.identity_id == identity_id)
            .first()
        )

        if existing_identity:
            raise HTTPException(
                status_code=400,
                detail="This identification number is already registered.",
            )

    # --------------------------------------------------------
    # Create User account
    # --------------------------------------------------------

    user = models.User(
        name=request.name.strip(),
        email=request.email.strip().lower(),
        password_hash=hash_password(request.password),
        role=request.role,
        phone=request.phone.strip() if request.phone else None,

        # ASHA / Professional identity
        identity_id=(
            request.asha_id.strip()
            if request.role == "asha" and request.asha_id
            else request.registration_number.strip()
            if request.role == "professional" and request.registration_number
            else None
        ),

        # Professional details
        qualification=(
            request.qualification.strip()
            if request.role == "professional" and request.qualification
            else None
        ),

        expertise=(
            request.specialization.strip()
            if request.role == "professional" and request.specialization
            else None
        ),

        # ASHA location
        location=(
            request.village.strip()
            if request.role == "asha" and request.village
            else None
        ),
    )

    db.add(user)
    db.flush()

    # --------------------------------------------------------
    # Create Mother profile
    # --------------------------------------------------------

    mother_id = None

    if request.role == "mother":

        if request.age is None:
            raise HTTPException(
                status_code=400,
                detail="Age is required for a mother account.",
            )

        if not request.phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number is required for a mother account.",
            )

        if not request.village:
            raise HTTPException(
                status_code=400,
                detail="Village is required for a mother account.",
            )

        if not request.care_stage:
            raise HTTPException(
                status_code=400,
                detail="Care stage is required for a mother account.",
            )

        if request.gestation_or_postpartum_week is None:
            raise HTTPException(
                status_code=400,
                detail="Pregnancy/postpartum week is required for a mother account.",
            )

        mother = models.Mother(
            user_id=user.id,
            name=request.name.strip(),
            age=request.age,
            phone=request.phone.strip(),
            village=request.village.strip(),
            care_stage=request.care_stage.strip(),
            gestation_or_postpartum_week=request.gestation_or_postpartum_week,
            asha_id=None,
        )

        db.add(mother)
        db.flush()

        mother_id = mother.id

    # --------------------------------------------------------
    # Save everything
    # --------------------------------------------------------

    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully.",
        "user": {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
            "mother_id": mother_id,
        },
    }


@app.post(
    "/auth/login",
    response_model=AuthResponse,
)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find account
    # --------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(
            models.User.email == request.email.strip().lower(),
            models.User.role == request.role,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email, password, or role.",
        )

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email, password, or role.",
        )

    # --------------------------------------------------------
    # Find linked mother profile
    # --------------------------------------------------------

    mother_id = None

    if user.role == "mother":
        mother = (
            db.query(models.Mother)
            .filter(models.Mother.user_id == user.id)
            .first()
        )

        if mother:
            mother_id = mother.id

    # --------------------------------------------------------
    # Return logged-in user
    # --------------------------------------------------------

    return {
        "message": "Login successful.",
        "token": issue_feedback_token(user),
        "user": {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
            "mother_id": mother_id,
        },
    }


# ============================================================
# MOTHER PROFILE
# ============================================================

@app.get(
    "/mother/{mother_id}/profile",
    response_model=MotherProfileResponse,
)
def get_mother_profile(
    mother_id: int,
    db: Session = Depends(get_db),
):
    mother = (
        db.query(models.Mother)
        .filter(models.Mother.id == mother_id)
        .first()
    )

    if not mother:
        raise HTTPException(
            status_code=404,
            detail="Mother profile not found.",
        )

    return {
        "mother_id": mother.id,
        "user_id": mother.user_id,
        "name": mother.name,
        "age": mother.age,
        "phone": mother.phone,
        "village": mother.village,
        "care_stage": mother.care_stage,
        "gestation_or_postpartum_week": mother.gestation_or_postpartum_week,
    }

# ============================================================
# ASHA - MOTHERS LIST
# ============================================================

@app.post("/asha/seed-demo-mothers")
def seed_demo_mothers(
    asha_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Verify ASHA exists
    # --------------------------------------------------------

    asha = (
        db.query(models.User)
        .filter(
            models.User.id == asha_id,
            models.User.role == "asha",
        )
        .first()
    )

    if not asha:
        raise HTTPException(
            status_code=404,
            detail="ASHA worker not found.",
        )

    # --------------------------------------------------------
    # Demo mothers
    # --------------------------------------------------------

    demo_mothers = [
        {
            "name": "Priya Sharma",
            "age": 27,
            "phone": "9000000001",
            "village": "Kubadthal",
            "care_stage": "pregnant",
            "week": 28,
            "screening_type": "EPDS",
            "score": 5,
            "max_score": 30,
            "severity": "Low",
            "needs_follow_up": False,
            "self_harm_signal": False,
        },
        {
            "name": "Meena Patel",
            "age": 31,
            "phone": "9000000002",
            "village": "Nikol",
            "care_stage": "postpartum",
            "week": 6,
            "screening_type": "PHQ9",
            "score": 14,
            "max_score": 27,
            "severity": "Moderate",
            "needs_follow_up": True,
            "self_harm_signal": False,
        },
        {
            "name": "Kavita Verma",
            "age": 29,
            "phone": "9000000003",
            "village": "Sitapur",
            "care_stage": "postpartum",
            "week": 10,
            "screening_type": "EPDS",
            "score": 18,
            "max_score": 30,
            "severity": "High",
            "needs_follow_up": True,
            "self_harm_signal": True,
        },
    ]

    created_mothers = []

    # --------------------------------------------------------
    # Create mothers + screening records
    # --------------------------------------------------------

    for data in demo_mothers:

        existing_mother = (
            db.query(models.Mother)
            .filter(
                models.Mother.phone == data["phone"]
            )
            .first()
        )

        if existing_mother:
            existing_mother.asha_id = asha_id

            mother = existing_mother

        else:
            mother = models.Mother(
                name=data["name"],
                age=data["age"],
                phone=data["phone"],
                village=data["village"],
                care_stage=data["care_stage"],
                gestation_or_postpartum_week=data["week"],
                asha_id=asha_id,
                user_id=None,
            )

            db.add(mother)
            db.flush()

        # Check whether this demo screening already exists
        existing_screening = (
            db.query(models.Screening)
            .filter(
                models.Screening.mother_id == mother.id,
                models.Screening.screening_type
                == data["screening_type"],
            )
            .first()
        )

        if not existing_screening:
            screening = models.Screening(
                mother_id=mother.id,
                screening_type=data["screening_type"],
                score=data["score"],
                max_score=data["max_score"],
                severity=data["severity"],
                needs_follow_up=data["needs_follow_up"],
                self_harm_signal=data["self_harm_signal"],
                created_at=datetime.utcnow(),
            )

            db.add(screening)

        created_mothers.append(
            {
                "mother_id": mother.id,
                "name": mother.name,
                "asha_id": mother.asha_id,
            }
        )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    db.commit()

    return {
        "message": "Demo mothers assigned successfully.",
        "asha_id": asha_id,
        "asha_name": asha.name,
        "mothers": created_mothers,
    }

# ============================================================
# ASHA - ASSIGNED MOTHERS
# ============================================================

@app.get("/asha/{asha_id}/mothers")
def get_asha_mothers(
    asha_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Make sure this is an ASHA account
    # --------------------------------------------------------

    asha = (
        db.query(models.User)
        .filter(
            models.User.id == asha_id,
            models.User.role == "asha",
        )
        .first()
    )

    if not asha:
        raise HTTPException(
            status_code=404,
            detail="ASHA worker not found.",
        )

    # --------------------------------------------------------
    # Get mothers assigned to this ASHA
    # --------------------------------------------------------

    mothers = (
        db.query(models.Mother)
        .filter(models.Mother.asha_id == asha_id)
        .order_by(models.Mother.name.asc())
        .all()
    )

    result = []

    for mother in mothers:

        # ----------------------------------------------------
        # Latest screening
        # ----------------------------------------------------

        latest_screening = (
            db.query(models.Screening)
            .filter(
                models.Screening.mother_id == mother.id
            )
            .order_by(
                models.Screening.created_at.desc()
            )
            .first()
        )

        # ----------------------------------------------------
        # Follow-up count
        # ----------------------------------------------------

        follow_up_count = (
            db.query(models.FollowUp)
            .filter(
                models.FollowUp.mother_id == mother.id
            )
            .count()
        )

        # ----------------------------------------------------
        # Referral count
        # ----------------------------------------------------

        referral_count = (
            db.query(models.Referral)
            .filter(
                models.Referral.mother_id == mother.id
            )
            .count()
        )

        # ----------------------------------------------------
        # App suggestion
        #
        # This is only decision support.
        # ASHA makes the final decision.
        # ----------------------------------------------------

        suggestion = (
            "No screening has been completed yet. "
            "Consider encouraging the mother to complete a check-in."
        )

        if latest_screening:

            if latest_screening.self_harm_signal:
                suggestion = (
                    "Safety-focused follow-up is indicated. "
                    "Contact the mother promptly and consider "
                    "professional referral."
                )

            elif latest_screening.needs_follow_up:
                suggestion = (
                    "Follow-up may be appropriate based on the "
                    "screening result. Contact the mother and "
                    "consider referral if needed."
                )

            else:
                suggestion = (
                    "Continue routine check-ins and monitor "
                    "changes over time."
                )

        result.append(
            {
                "mother_id": mother.id,
                "name": mother.name,
                "age": mother.age,
                "phone": mother.phone,
                "village": mother.village,
                "care_stage": mother.care_stage,
                "gestation_or_postpartum_week":
                    mother.gestation_or_postpartum_week,

                "latest_screening": (
                    {
                        "screening_id": latest_screening.id,
                        "screening_type":
                            latest_screening.screening_type,
                        "score": latest_screening.score,
                        "max_score":
                            latest_screening.max_score,
                        "severity":
                            latest_screening.severity,
                        "needs_follow_up":
                            latest_screening.needs_follow_up,
                        "self_harm_signal":
                            latest_screening.self_harm_signal,
                        "created_at":
                            latest_screening.created_at,
                    }
                    if latest_screening
                    else None
                ),

                "follow_up_count": follow_up_count,
                "referral_count": referral_count,
                "suggestion": suggestion,
            }
        )

    return result



class SupportTopicRequest(BaseModel):
    message: str = Field(min_length=8, max_length=1000)


@app.post("/ai/support-topic")
def recommend_support_topic(request: SupportTopicRequest):
    """Classify a non-clinical resource request; never assess health risk."""
    try:
        return classify_support_topic(request.message)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

# ============================================================
# BASIC HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "message": "BloomHer API is running",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


# ============================================================
# GET SCREENING QUESTIONS
# ============================================================

@app.get(
    "/screening/{screening_type}/questions",
    response_model=ScreeningQuestionsResponse,
)
def get_screening_questions(screening_type: str):
    screening_type = screening_type.upper()

    if screening_type == "EPDS":
        questions = EPDS_QUESTIONS

    elif screening_type == "PHQ9":
        questions = PHQ9_QUESTIONS

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid screening type. Use EPDS or PHQ9.",
        )

    return {
        "screening_type": screening_type,
        "questions": questions,
    }


# ============================================================
# SUBMIT SCREENING
# ============================================================

@app.post(
    "/screening/submit",
    response_model=ScreeningResultResponse,
)
def submit_screening(
    request: ScreeningSubmitRequest,
    db: Session = Depends(get_db),
):
    screening_type = request.screening_type.upper()

    # --------------------------------------------------------
    # Validate screening type
    # --------------------------------------------------------

    if screening_type not in {"EPDS", "PHQ9"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid screening type. Use EPDS or PHQ9.",
        )

    # --------------------------------------------------------
    # Find mother
    # --------------------------------------------------------

    mother = (
        db.query(models.Mother)
        .filter(models.Mother.id == request.mother_id)
        .first()
    )

    if not mother:
        raise HTTPException(
            status_code=404,
            detail="Mother not found.",
        )

    # --------------------------------------------------------
    # Get expected questions
    # --------------------------------------------------------

    if screening_type == "EPDS":
        expected_questions = EPDS_QUESTIONS
        max_score = 30
    else:
        expected_questions = PHQ9_QUESTIONS
        max_score = 27

    expected_question_numbers = {
        question["question_number"]
        for question in expected_questions
    }

    submitted_question_numbers = {
        answer.question_number
        for answer in request.answers
    }

    # --------------------------------------------------------
    # Make sure all questions were answered
    # --------------------------------------------------------

    if submitted_question_numbers != expected_question_numbers:
        raise HTTPException(
            status_code=400,
            detail="Please answer all screening questions exactly once.",
        )

    # --------------------------------------------------------
    # Validate answer values
    # --------------------------------------------------------

    answers_by_question = {}

    for answer in request.answers:

        if answer.question_number in answers_by_question:
            raise HTTPException(
                status_code=400,
                detail=f"Question {answer.question_number} was answered more than once.",
            )

        if answer.answer_value not in {0, 1, 2, 3}:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer value for question {answer.question_number}.",
            )

        answers_by_question[answer.question_number] = answer.answer_value

    # Keep answers in question-number order.
    answer_values = [
        answers_by_question[number]
        for number in sorted(answers_by_question)
    ]

    # --------------------------------------------------------
    # Calculate score
    # --------------------------------------------------------

    score = calculate_score(answer_values)

    # --------------------------------------------------------
    # Calculate severity / interpretation
    # --------------------------------------------------------

    if screening_type == "EPDS":
        severity = get_epds_severity(score)
        self_harm_signal = has_epds_self_harm_signal(answer_values)

        # For BloomHer coordination:
        # a higher concern score or self-harm signal means
        # human follow-up should be considered.
        needs_follow_up = score >= 10 or self_harm_signal

    else:
        severity = get_phq9_severity(score)
        self_harm_signal = has_phq9_self_harm_signal(answer_values)

        needs_follow_up = score >= 5 or self_harm_signal

    # --------------------------------------------------------
    # Save screening
    # --------------------------------------------------------

    screening = models.Screening(
        mother_id=mother.id,
        screening_type=screening_type,
        score=score,
        max_score=max_score,
        severity=severity,
        needs_follow_up=needs_follow_up,
        self_harm_signal=self_harm_signal,
    )

    db.add(screening)
    db.flush()

    # --------------------------------------------------------
    # Save individual answers
    # --------------------------------------------------------

    question_lookup = {
        question["question_number"]: question
        for question in expected_questions
    }

    for question_number in sorted(answers_by_question):

        selected_value = answers_by_question[question_number]

        question = question_lookup[question_number]

        selected_text = next(
            option["text"]
            for option in question["options"]
            if option["value"] == selected_value
        )

        answer_record = models.ScreeningAnswer(
            screening_id=screening.id,
            question_number=question_number,
            answer_value=selected_value,
            answer_text=selected_text,
        )

        db.add(answer_record)

    db.commit()
    db.refresh(screening)

    return {
        "screening_id": screening.id,
        "screening_type": screening.screening_type,
        "score": screening.score,
        "max_score": screening.max_score,
        "severity": screening.severity,
        "needs_follow_up": screening.needs_follow_up,
        "self_harm_signal": screening.self_harm_signal,
        "created_at": screening.created_at,
    }


# ============================================================
# PROFESSIONAL - ASSIGNED REFERRALS
# ============================================================


# ============================================================
# SEED DEMO REFERRAL
# ============================================================

@app.post("/professional/seed-demo-referral")
def seed_demo_referral(
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Demo professional
    # --------------------------------------------------------

    professional = (
        db.query(models.User)
        .filter(
            models.User.role == "professional",
        )
        .first()
    )

    if not professional:
        raise HTTPException(
            status_code=404,
            detail="Demo professional not found.",
        )

    # --------------------------------------------------------
    # Demo ASHA worker
    # --------------------------------------------------------

    asha = (
        db.query(models.User)
        .filter(
            models.User.role == "asha",
        )
        .first()
    )

    if not asha:
        raise HTTPException(
            status_code=404,
            detail="Demo ASHA worker not found.",
        )

    # --------------------------------------------------------
    # Ananya Sharma
    # --------------------------------------------------------

    mother = (
        db.query(models.Mother)
        .filter(
            models.Mother.name == "Priya Sharma",
        )
        .first()
    )

    if not mother:
        raise HTTPException(
            status_code=404,
            detail="Demo mother not found. Run the seed script first.",
        )

    # --------------------------------------------------------
    # Avoid creating duplicate referral
    # --------------------------------------------------------

    existing_referral = (
        db.query(models.Referral)
        .filter(
            models.Referral.mother_id == mother.id,
            models.Referral.professional_id == professional.id,
        )
        .first()
    )

    if existing_referral:
        return {
            "message": "Demo referral already exists.",
            "referral_id": existing_referral.id,
            "mother_name": mother.name,
            "professional_name": professional.name,
        }

    # --------------------------------------------------------
    # Create referral
    # --------------------------------------------------------

    referral = models.Referral(
        mother_id=mother.id,
        asha_id=asha.id,
        professional_id=professional.id,
        reason=(
            "Mother was referred for a professional conversation "
            "following screening concerns and reported difficulty "
            "with sleep and emotional wellbeing."
        ),
        status="in_review",
        created_at=datetime.utcnow(),
    )

    db.add(referral)
    db.commit()
    db.refresh(referral)

    return {
        "message": "Demo referral created successfully.",
        "referral_id": referral.id,
        "mother_id": mother.id,
        "mother_name": mother.name,
        "asha_id": asha.id,
        "professional_id": professional.id,
        "status": referral.status,
    }


@app.get("/professional/{professional_id}/referrals")
def get_professional_referrals(
    professional_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Make sure this is a healthcare professional
    # --------------------------------------------------------

    professional = (
        db.query(models.User)
        .filter(
            models.User.id == professional_id,
            models.User.role == "professional",
        )
        .first()
    )

    if not professional:
        raise HTTPException(
            status_code=404,
            detail="Healthcare professional not found.",
        )

    # --------------------------------------------------------
    # Get referrals assigned to this professional
    # --------------------------------------------------------

    referrals = (
        db.query(models.Referral)
        .filter(
            models.Referral.professional_id == professional_id
        )
        .order_by(
            models.Referral.created_at.desc()
        )
        .all()
    )

    result = []

    for referral in referrals:

        # ----------------------------------------------------
        # Get mother
        # ----------------------------------------------------

        mother = (
            db.query(models.Mother)
            .filter(
                models.Mother.id == referral.mother_id
            )
            .first()
        )

        if not mother:
            continue

        # ----------------------------------------------------
        # Get ASHA who created the referral
        # ----------------------------------------------------

        asha = None

        if referral.asha_id:
            asha = (
                db.query(models.User)
                .filter(
                    models.User.id == referral.asha_id
                )
                .first()
            )

        # ----------------------------------------------------
        # Get latest screening
        # ----------------------------------------------------

        latest_screening = (
            db.query(models.Screening)
            .filter(
                models.Screening.mother_id == mother.id
            )
            .order_by(
                models.Screening.created_at.desc()
            )
            .first()
        )

        result.append(
            {
                "referral_id": referral.id,
                "mother_id": mother.id,
                "mother_name": mother.name,
                "mother_age": mother.age,
                "mother_phone": mother.phone,
                "village": mother.village,
                "care_stage": mother.care_stage,

                "reason": referral.reason,

                "status": referral.status,

                "created_at": referral.created_at,

                "asha_name": (
                    asha.name
                    if asha
                    else "ASHA worker"
                ),

                "screening": (
                    {
                        "screening_id":
                            latest_screening.id,

                        "screening_type":
                            latest_screening.screening_type,

                        "score":
                            latest_screening.score,

                        "max_score":
                            latest_screening.max_score,

                        "severity":
                            latest_screening.severity,

                        "needs_follow_up":
                            latest_screening.needs_follow_up,

                        "self_harm_signal":
                            latest_screening.self_harm_signal,

                        "created_at":
                            latest_screening.created_at,
                    }
                    if latest_screening
                    else None
                ),
            }
        )

    return result


# ============================================================
# SCREENING HISTORY
# ============================================================

@app.get(
    "/screening/mother/{mother_id}/history",
    response_model=list[ScreeningHistoryItem],
)
def get_screening_history(
    mother_id: int,
    db: Session = Depends(get_db),
):
    mother = (
        db.query(models.Mother)
        .filter(models.Mother.id == mother_id)
        .first()
    )

    if not mother:
        raise HTTPException(
            status_code=404,
            detail="Mother not found.",
        )

    screenings = (
        db.query(models.Screening)
        .filter(models.Screening.mother_id == mother_id)
        .order_by(models.Screening.created_at.desc())
        .all()
    )

    return [
        {
            "screening_id": screening.id,
            "screening_type": screening.screening_type,
            "score": screening.score,
            "max_score": screening.max_score,
            "severity": screening.severity,
            "needs_follow_up": screening.needs_follow_up,
            "self_harm_signal": screening.self_harm_signal,
            "created_at": screening.created_at,
        }
        for screening in screenings
    ]