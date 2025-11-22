# main.py
import os
import uuid
import socket
import json
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from minio import Minio
import pika
from db import init_db, SessionLocal, AudioFile, AudioStatus
import py_eureka_client.eureka_client as eureka_client
from sqlalchemy.exc import SQLAlchemyError

app = FastAPI(title="Audio Service")

# init DB
init_db()

# MinIO config
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "meeting-audio")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

minio_client = Minio(
    endpoint=MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

# ensure bucket exists
try:
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)
        print("✅ MinIO bucket created:", MINIO_BUCKET)
except Exception as e:
    print("❌ MinIO check error:", e)

# RabbitMQ config
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
AUDIO_QUEUE = os.getenv("AUDIO_QUEUE", "audio_uploaded")


def publish_audio_uploaded(payload: dict):
    try:
        conn = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
        ch = conn.channel()
        ch.queue_declare(queue=AUDIO_QUEUE, durable=True)
        ch.basic_publish(
            exchange="",
            routing_key=AUDIO_QUEUE,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        conn.close()
    except Exception as e:
        print("❌ Failed to publish audio_uploaded:", e)
        # In production, consider retry / dead-letter / logging


@app.on_event("startup")
async def register_to_eureka():
    try:
        await eureka_client.init_async(
            eureka_server=os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka/"),
            app_name="AUDIO-SERVICE",
            instance_host=socket.gethostbyname(socket.gethostname()),
            instance_port=int(os.getenv("PORT", "8080")),
        )
        print("✅ Registered AUDIO-SERVICE to Eureka")
    except Exception as e:
        print("❌ Eureka registration failed:", e)


@app.post("/audio/upload")
async def upload_audio(
    meeting_id: str = Form(...),
    created_by: str = Form(...),  # uploader user id (required)
    file: UploadFile = File(...)
):
    if not file:
        raise HTTPException(status_code=400, detail="file required")

    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    local_path = os.path.join(UPLOAD_DIR, filename)

    # Save locally first
    try:
        contents = await file.read()
        with open(local_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save incoming file: {e}")

    # Upload to MinIO
    try:
        file_size = os.path.getsize(local_path)
        with open(local_path, "rb") as f:
            minio_client.put_object(
                MINIO_BUCKET,
                filename,
                f,
                file_size,
                content_type=file.content_type
            )
        # file_url that other services can use to fetch (internal URL)
        file_url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{filename}"
    except Exception as e:
        # cleanup local file
        try:
            os.remove(local_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"MinIO upload failed: {e}")

    # Persist metadata to DB
    db = SessionLocal()
    try:
        record = AudioFile(
            id=file_id,
            meeting_id=meeting_id,
            file_name=filename,
            file_url=file_url,
            status="PENDING",
            created_by=created_by
        )
        db.add(record)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB error: {e}")
    finally:
        db.close()

    # Publish event for workers
    publish_audio_uploaded({
        "id": file_id,
        "meeting_id": meeting_id,
        "file_name": filename,
        "file_url": file_url,
        "created_by": created_by,
        "language": "vi"
    })

    return {"id": file_id, "file_name": filename, "file_url": file_url}
