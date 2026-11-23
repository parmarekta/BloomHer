from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Basic account information
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    # mother / asha / professional
    role: Mapped[str] = mapped_column(String(30), index=True)

    # Contact information
    phone: Mapped[str | None] = mapped_column(
        String(30),
        unique=True,
        nullable=True,
        index=True,
    )

    phone_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # Identity verification
    # For ASHA -> ASHA worker ID
    # For professional -> professional registration / ID
    identity_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
    )

    # Professional information
    title: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    qualification: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    expertise: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    organization: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationships

    # ASHA -> assigned mothers
    mothers: Mapped[list["Mother"]] = relationship(
        back_populates="asha",
        foreign_keys="Mother.asha_id",
    )

    # Healthcare professional -> referrals
    referrals_received: Mapped[list["Referral"]] = relationship(
        back_populates="professional",
        foreign_keys="Referral.professional_id",
    )

    # ASHA -> referrals created
    referrals_created: Mapped[list["Referral"]] = relationship(
        back_populates="asha",
        foreign_keys="Referral.asha_id",
    )

    # ASHA -> follow-ups
    follow_ups: Mapped[list["FollowUp"]] = relationship(
        back_populates="asha",
        foreign_keys="FollowUp.asha_id",
    )


class Mother(Base):
    __tablename__ = "mothers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Optional link to the mother's User account
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
    )

    age: Mapped[int] = mapped_column(
        Integer,
    )

    phone: Mapped[str] = mapped_column(
        String(30),
    )

    village: Mapped[str] = mapped_column(
        String(120),
    )

    care_stage: Mapped[str] = mapped_column(
        String(30),
    )

    gestation_or_postpartum_week: Mapped[int] = mapped_column(
        Integer,
    )

    # Assigned ASHA worker
    asha_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    user: Mapped["User | None"] = relationship(
        foreign_keys=[user_id],
    )

    asha: Mapped["User | None"] = relationship(
        back_populates="mothers",
        foreign_keys=[asha_id],
    )

    screenings: Mapped[list["Screening"]] = relationship(
        back_populates="mother",
        cascade="all, delete-orphan",
    )

    follow_ups: Mapped[list["FollowUp"]] = relationship(
        back_populates="mother",
        cascade="all, delete-orphan",
    )

    referrals: Mapped[list["Referral"]] = relationship(
        back_populates="mother",
        cascade="all, delete-orphan",
    )


class Screening(Base):
    __tablename__ = "screenings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id"),
        index=True,
    )

    # EPDS or PHQ9
    screening_type: Mapped[str] = mapped_column(
        String(20),
    )

    score: Mapped[int] = mapped_column(
        Integer,
    )

    max_score: Mapped[int] = mapped_column(
        Integer,
    )

    severity: Mapped[str] = mapped_column(
        String(100),
    )

    needs_follow_up: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # Used for safety escalation
    self_harm_signal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    mother: Mapped["Mother"] = relationship(
        back_populates="screenings",
    )

    answers: Mapped[list["ScreeningAnswer"]] = relationship(
        back_populates="screening",
        cascade="all, delete-orphan",
    )


class ScreeningAnswer(Base):
    __tablename__ = "screening_answers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    screening_id: Mapped[int] = mapped_column(
        ForeignKey("screenings.id"),
        index=True,
    )

    # Question number: 1, 2, 3...
    question_number: Mapped[int] = mapped_column(
        Integer,
    )

    # Actual selected answer value
    # EPDS / PHQ-9 scoring values are generally 0-3
    answer_value: Mapped[int] = mapped_column(
        Integer,
    )

    # Optional text representation of the selected option
    answer_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    screening: Mapped["Screening"] = relationship(
        back_populates="answers",
    )


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id"),
        index=True,
    )

    # ASHA worker responsible for the follow-up
    asha_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="Pending",
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    follow_up_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    mother: Mapped["Mother"] = relationship(
        back_populates="follow_ups",
    )

    asha: Mapped["User | None"] = relationship(
        back_populates="follow_ups",
        foreign_keys=[asha_id],
    )


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    mother_id: Mapped[int] = mapped_column(
        ForeignKey("mothers.id"),
        index=True,
    )

    # ASHA worker who created the referral
    asha_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # Healthcare professional assigned to the referral
    professional_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    reason: Mapped[str] = mapped_column(
        Text,
    )

    status: Mapped[str] = mapped_column(
        String(40),
        default="open",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Relationships
    mother: Mapped["Mother"] = relationship(
        back_populates="referrals",
    )

    asha: Mapped["User | None"] = relationship(
        back_populates="referrals_created",
        foreign_keys=[asha_id],
    )

    professional: Mapped["User | None"] = relationship(
        back_populates="referrals_received",
        foreign_keys=[professional_id],
    )

class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mother_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
