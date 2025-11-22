# worker.py
import os
import json
import time
import uuid
import traceback
import pika
from minio import Minio
from db import init_db, SessionLocal, AudioFile, AudioStatus
from sqlalchemy.exc import SQLAlchemyError

# Try to import whisper (optional)
try:
    import whisper
    WHISPER_AVAILABLE = True
    model = whisper.load_model("small")
except Exception as e:
    print("⚠️ Whisper not available:", e)
    WHISPER_AVAILABLE = False
    model = None

# Config
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "meeting-audio")
DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", "/app/uploads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
AUDIO_QUEUE = os.getenv("AUDIO_QUEUE", "audio_uploaded")
SUMMARIZATION_QUEUE = os.getenv("SUMMARIZATION_QUEUE", "summarization_queue")

# clients
minio_client = Minio(endpoint=MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)

init_db()  # ensure tables

def publish_to_transcript_queue(payload: dict):
    try:
        conn = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
        ch = conn.channel()
        ch.queue_declare(queue=SUMMARIZATION_QUEUE, durable=True)
        ch.basic_publish(
            exchange='',
            routing_key=SUMMARIZATION_QUEUE,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        conn.close()
    except Exception as e:
        print("❌ Failed to publish to transcript_queue:", e)

def transcribe(local_path, language="vi"):
    if WHISPER_AVAILABLE and model:
        try:
            res = model.transcribe(local_path, language=language)
            return res.get("text", "")
        except Exception as e:
            print("Transcription error:", e)
            return f"[ERROR TRANSCRIBING: {e}]"
    else:
        # fallback stub
        return f"[STUB TRANSCRIPT for {os.path.basename(local_path)}]"

def cleanup_file(path):
    try:
        if os.path.exists(path):
            os.remove(path)
            print("Removed:", path)
    except Exception as e:
        print("Cleanup error:", e)

def on_message(ch, method, properties, body):
    data = json.loads(body)
    file_name = data.get("file_name")
    audio_id = data.get("id")
    meeting_id = data.get("meeting_id")
    language = data.get("language", "vi")
    file_key = file_name
    local_path = os.path.join(DOWNLOAD_DIR, file_name)

    db = SessionLocal()
    audio_record = None
    try:
        # mark processing
        audio_record = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
        if audio_record:
            audio_record.status = AudioStatus.PROCESSING
            db.commit()
            print(f"Audio {audio_id} marked PROCESSING")

        # download from minio (if not exists)
        if not os.path.exists(local_path):
            try:
                print("Downloading from MinIO:", file_key)
                minio_client.fget_object(MINIO_BUCKET, file_key, local_path)
            except Exception as e:
                print("MinIO download failed:", e)
                if audio_record:
                    audio_record.status = AudioStatus.FAILED
                    db.commit()
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

        # transcribe
        transcript_text = transcribe(local_path, language=language)

        # publish to transcript queue for transcript-service to persist/process
        publish_to_transcript_queue({
            "audio_id": audio_id,
            "meeting_id": meeting_id,
            "transcript": transcript_text,
            "file_name": file_name,
            "language": language
        })
        print(f"Published transcript_created for audio {audio_id}")

        # update audio record => COMPLETED
        if audio_record:
            audio_record.status = AudioStatus.COMPLETED
            # optionally set duration if you compute it
            db.commit()
            print(f"Audio {audio_id} marked COMPLETED")

    except Exception as e:
        print("Processing error:", e)
        traceback.print_exc()
        if audio_record:
            audio_record.status = AudioStatus.FAILED
            audio_record.file_url = (audio_record.file_url or "") + f" | error:{str(e)}"
            db.commit()
    finally:
        cleanup_file(local_path)
        db.close()
        ch.basic_ack(delivery_tag=method.delivery_tag)

def start_worker():
    while True:
        try:
            conn = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
            ch = conn.channel()
            ch.queue_declare(queue=AUDIO_QUEUE, durable=True)
            ch.basic_qos(prefetch_count=1)
            ch.basic_consume(queue=AUDIO_QUEUE, on_message_callback=on_message)
            print("Audio worker listening on queue:", AUDIO_QUEUE)
            ch.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            print("RabbitMQ connection error:", e)
            time.sleep(10)
        except KeyboardInterrupt:
            print("Worker stopped")
            break
        except Exception as e:
            print("Worker unexpected error:", e)
            time.sleep(5)

if __name__ == "__main__":
    start_worker()
