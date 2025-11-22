# transcript_models.py

import os
import time
import uuid
import enum
from sqlalchemy import (
    create_engine,
    Column,
    Boolean,
    String,
    Text,
    ForeignKey,
    CheckConstraint,
    TIMESTAMP,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from sqlalchemy.sql import func
from sqlalchemy.exc import OperationalError

# =============================
# 1️⃣ Kết nối Database (giống db.py)
# =============================
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@mysql:3306/meetingdb")


def create_engine_with_retry():
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            engine = create_engine(
                DATABASE_URL,
                echo=True,
                future=True,
                pool_pre_ping=True,
            )
            with engine.connect() as conn:
                print("✅ Connected to DB")
                return engine
        except OperationalError as e:
            print(f"❌ DB connection failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise


engine = create_engine_with_retry()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


# =============================
# 2️⃣ Enum cho status
# =============================
# =============================
# 2️⃣ Enum cho status
# =============================
class TranscriptStatus(str, enum.Enum):
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED="FAILED"

class SummaryStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    REVISED = "REVISED"
    PENDING_CHAIR_APPROVAL = "PENDING_CHAIR_APPROVAL"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"

class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"


# =============================
# 3️⃣ Transcripts
# =============================
class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), nullable=False)
    audio_id = Column(String(36), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(SAEnum(TranscriptStatus, native_enum=False), nullable=False, server_default=TranscriptStatus.PROCESSING.value)
    created_by = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    summaries = relationship("Summary", back_populates="transcript", cascade="all, delete-orphan")


# =============================
# 4️⃣ Summaries
# =============================
class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), nullable=False)
    transcript_id = Column(String(36), ForeignKey("transcripts.id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(SAEnum(SummaryStatus, native_enum=False), nullable=False, server_default=SummaryStatus.DRAFT.value)
    created_by = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    transcript = relationship("Transcript", back_populates="summaries")
    reviews = relationship("SummaryReview", back_populates="summary", cascade="all, delete-orphan")


# =============================
# 5️⃣ Summary Reviews
# =============================
class SummaryReview(Base):
    __tablename__ = "summary_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    summary_id = Column(String(36), ForeignKey("summaries.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    status = Column(SAEnum(ReviewStatus, native_enum=False), nullable=False, server_default=ReviewStatus.PENDING.value)
    comment = Column(Text, nullable=True)
    reviewed_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    handled = Column(Boolean, nullable=True)


    summary = relationship("Summary", back_populates="reviews")


# =============================
# 6️⃣ Hàm khởi tạo DB
# =============================
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ DB tables created/checked")
    except Exception as e:
        print("❌ init_db error:", e)
        raise
