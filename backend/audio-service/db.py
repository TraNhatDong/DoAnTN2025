# db.py
import os
import time
import uuid
import enum
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    Integer,
    Enum as SAEnum,
    TIMESTAMP,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from sqlalchemy.exc import OperationalError

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
            # Test connection
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


class AudioStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)
    status = Column(SAEnum(AudioStatus, native_enum=False), nullable=False, server_default=AudioStatus.PENDING.value)
    created_by = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ DB tables created/checked")
    except Exception as e:
        print("❌ init_db error:", e)
        raise
