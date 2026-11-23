from datetime import datetime

from pydantic import BaseModel, Field


# ============================================================
# SCREENING QUESTIONS
# ============================================================

class ScreeningOption(BaseModel):
    text: str
    value: int


class ScreeningQuestion(BaseModel):
    question_number: int
    text: str
    options: list[ScreeningOption]


class ScreeningQuestionsResponse(BaseModel):
    screening_type: str
    questions: list[ScreeningQuestion]


# ============================================================
# SCREENING SUBMISSION
# ============================================================

class ScreeningAnswerInput(BaseModel):
    question_number: int = Field(ge=1)
    answer_value: int = Field(ge=0, le=3)


class ScreeningSubmitRequest(BaseModel):
    mother_id: int
    screening_type: str
    answers: list[ScreeningAnswerInput]


# ============================================================
# SCREENING RESULT
# ============================================================

class ScreeningResultResponse(BaseModel):
    screening_id: int
    screening_type: str
    score: int
    max_score: int
    severity: str
    needs_follow_up: bool
    self_harm_signal: bool
    created_at: datetime


# ============================================================
# SCREENING HISTORY
# ============================================================

class ScreeningHistoryItem(BaseModel):
    screening_id: int
    screening_type: str
    score: int
    max_score: int
    severity: str
    needs_follow_up: bool
    self_harm_signal: bool
    created_at: datetime


# ============================================================
# AUTHENTICATION / USER REGISTRATION
# ============================================================

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6, max_length=255)
    role: str = Field(min_length=1, max_length=30)

    # Common contact information
    phone: str | None = Field(default=None, max_length=30)

    # Mother-specific details
    age: int | None = Field(default=None, ge=1, le=120)
    village: str | None = Field(default=None, max_length=120)
    care_stage: str | None = Field(default=None, max_length=30)
    gestation_or_postpartum_week: int | None = Field(
        default=None,
        ge=0,
        le=52,
    )

    # ASHA worker details
    asha_id: str | None = Field(
        default=None,
        max_length=100,
    )

    # Healthcare professional details
    registration_number: str | None = Field(
        default=None,
        max_length=100,
    )
    qualification: str | None = Field(
        default=None,
        max_length=255,
    )
    specialization: str | None = Field(
        default=None,
        max_length=500,
    )


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=255)
    role: str = Field(min_length=1, max_length=30)


class AuthUserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    phone: str | None = None
    mother_id: int | None = None


class AuthResponse(BaseModel):
    token: str | None = None
    message: str
    user: AuthUserResponse


class MotherProfileResponse(BaseModel):
    mother_id: int
    user_id: int
    name: str
    age: int
    phone: str
    village: str
    care_stage: str
    gestation_or_postpartum_week: int