from datetime import datetime, timedelta

from sqlalchemy import select

from database import Base, SessionLocal, engine
from models import FollowUp, Mother, Screening, User


def hash_password(password: str) -> str:
    import base64
    import hashlib
    import secrets

    salt = secrets.token_bytes(16)
    iterations = 310_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(digest).decode(),
    )



def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(User.email == "asha@bloomher.demo")
        )

        if existing_user:
            print("Database already contains demo data.")
            return

        asha = User(
            name="Sunita Patel",
            email="asha@bloomher.demo",
            password_hash=hash_password("BloomHer@123"),
            role="asha",
        )

        mother_account = User(
            name="Priya Sharma",
            email="priya@bloomher.demo",
            password_hash=hash_password("BloomHer@123"),
            role="mother",
        )

        professional = User(
            name="Dr. Nandini Rao",
            email="doctor@bloomher.demo",
            password_hash=hash_password("BloomHer@123"),
            role="professional",
            identity_id="DEMO-MED-001",
            qualification="MBBS",
            expertise="Maternal health",
        )

        db.add_all([asha, mother_account, professional])
        db.flush()

        mothers = [
            Mother(
                user_id=mother_account.id,
                name="Priya Sharma",
                age=26,
                phone="9000000001",
                village="Shantipur",
                care_stage="postpartum",
                gestation_or_postpartum_week=6,
                asha_id=asha.id,
            ),
            Mother(
                name="Kavita Patel",
                age=29,
                phone="9000000002",
                village="Rampur",
                care_stage="postpartum",
                gestation_or_postpartum_week=8,
                asha_id=asha.id,
            ),
            Mother(
                name="Meena Devi",
                age=24,
                phone="9000000003",
                village="Navapura",
                care_stage="pregnant",
                gestation_or_postpartum_week=28,
                asha_id=asha.id,
            ),
            Mother(
                name="Neha Shah",
                age=31,
                phone="9000000004",
                village="Shivnagar",
                care_stage="pregnant",
                gestation_or_postpartum_week=34,
                asha_id=asha.id,
            ),
            Mother(
                name="Asha Verma",
                age=27,
                phone="9000000005",
                village="Lakshmipur",
                care_stage="postpartum",
                gestation_or_postpartum_week=3,
                asha_id=asha.id,
            ),
            Mother(
                name="Rani Patel",
                age=30,
                phone="9000000006",
                village="Madhavpur",
                care_stage="postpartum",
                gestation_or_postpartum_week=12,
                asha_id=asha.id,
            ),
        ]

        db.add_all(mothers)
        db.flush()

        now = datetime.utcnow()

        screening_data = [
            # Priya — improving EPDS
            Screening(
                mother_id=mothers[0].id,
                screening_type="EPDS",
                score=12,
                max_score=30,
                severity="Follow-up recommended",
                needs_follow_up=True,
                self_harm_signal=False,
                created_at=now - timedelta(days=14),
            ),
            Screening(
                mother_id=mothers[0].id,
                screening_type="EPDS",
                score=7,
                max_score=30,
                severity="Below configured threshold",
                needs_follow_up=False,
                self_harm_signal=False,
                created_at=now - timedelta(days=2),
            ),

            # Kavita — worsening EPDS
            Screening(
                mother_id=mothers[1].id,
                screening_type="EPDS",
                score=9,
                max_score=30,
                severity="Below configured threshold",
                needs_follow_up=False,
                self_harm_signal=False,
                created_at=now - timedelta(days=12),
            ),
            Screening(
                mother_id=mothers[1].id,
                screening_type="EPDS",
                score=16,
                max_score=30,
                severity="Follow-up recommended",
                needs_follow_up=True,
                self_harm_signal=False,
                created_at=now - timedelta(days=1),
            ),

            # Meena — PHQ-9 moderate
            Screening(
                mother_id=mothers[2].id,
                screening_type="PHQ-9",
                score=13,
                max_score=27,
                severity="Moderate",
                needs_follow_up=True,
                self_harm_signal=False,
                created_at=now - timedelta(days=3),
            ),

            # Neha — low PHQ-9
            Screening(
                mother_id=mothers[3].id,
                screening_type="PHQ-9",
                score=4,
                max_score=27,
                severity="Minimal",
                needs_follow_up=False,
                self_harm_signal=False,
                created_at=now - timedelta(days=4),
            ),

            # Asha — positive self-harm signal
            Screening(
                mother_id=mothers[4].id,
                screening_type="PHQ-9",
                score=15,
                max_score=27,
                severity="Moderately severe",
                needs_follow_up=True,
                self_harm_signal=True,
                created_at=now - timedelta(days=1),
            ),

            # Rani — stable EPDS
            Screening(
                mother_id=mothers[5].id,
                screening_type="EPDS",
                score=8,
                max_score=30,
                severity="Below configured threshold",
                needs_follow_up=False,
                self_harm_signal=False,
                created_at=now - timedelta(days=10),
            ),
            Screening(
                mother_id=mothers[5].id,
                screening_type="EPDS",
                score=8,
                max_score=30,
                severity="Below configured threshold",
                needs_follow_up=False,
                self_harm_signal=False,
                created_at=now - timedelta(days=1),
            ),
        ]

        db.add_all(screening_data)
        db.flush()

        follow_ups = [
            FollowUp(
                mother_id=mothers[1].id,
                asha_id=asha.id,
                status="Pending",
                notes="Follow-up recommended after increased EPDS score.",
                follow_up_date=now + timedelta(days=2),
            ),
            FollowUp(
                mother_id=mothers[2].id,
                asha_id=asha.id,
                status="Scheduled",
                notes="Discuss wellbeing and connect with appropriate support.",
                follow_up_date=now + timedelta(days=1),
            ),
            FollowUp(
                mother_id=mothers[4].id,
                asha_id=asha.id,
                status="Urgent",
                notes="Safety-focused follow-up required.",
                follow_up_date=now,
            ),
        ]

        db.add_all(follow_ups)
        db.commit()

        print("BloomHer database created successfully.")
        print("Demo accounts (password for all: BloomHer@123):")
        print("Mother: priya@bloomher.demo")
        print("ASHA: asha@bloomher.demo")
        print("Healthcare professional: doctor@bloomher.demo")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()