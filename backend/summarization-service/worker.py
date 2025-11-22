import os
import json
import re
import time
import pika
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from db import Base, Transcript, Summary

# =============================
# Config
# =============================
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
DB_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@mysql:3306/meetingdb")

# =============================
# DB setup
# =============================
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)
Base.metadata.create_all(engine)

# =============================
# Model setup
# =============================
MODEL_NAME = "VietAI/vit5-base-vietnews-summarization"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# =============================
# Utils
# =============================
def summarize_text(text: str) -> str:
    inputs = tokenizer(
        "summarize: " + text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    )
    outputs = model.generate(
        inputs["input_ids"],
        max_length=150,
        min_length=40,
        num_beams=5,
        no_repeat_ngram_size=3,
        repetition_penalty=2.0,
        length_penalty=1.5,
        early_stopping=True
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def clean_text(text: str) -> str:
    text = re.sub(r"[^0-9A-Za-zÀ-ỹ\s.,!?]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# =============================
# Notification publisher
# =============================
def publish_notification(transcript_id, summary_id, summary_text):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()

    exchange = "meeting.exchange"
    routing_key = "notification.key"

    payload = {
        "type": "SUMMARY_READY",
        "transcriptId": transcript_id,
        "summaryId": summary_id,
        "summary": summary_text
    }

    channel.basic_publish(
        exchange=exchange,
        routing_key=routing_key,
        body=json.dumps(payload),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    connection.close()
    print(f"📤 Notification sent for transcript {transcript_id}")


# =============================
# RabbitMQ callback
# =============================
def callback(ch, method, properties, body):
    data = json.loads(body)
    session = Session()
    start_time = time.time()

    try:
        meeting_id = data.get("meeting_id")
        audio_id = data.get("audio_id")
        transcript_text = data.get("transcript")
        created_by = data.get("created_by", "AI")

        if not meeting_id or not audio_id or not transcript_text:
            print("⚠️ Invalid message:", data)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        # 1️⃣ Tạo mới hoặc cập nhật Transcript
        transcript = session.query(Transcript).filter_by(audio_id=audio_id).first()
        if not transcript:
            transcript = Transcript(
                meeting_id=meeting_id,
                audio_id=audio_id,
                content=transcript_text,
                created_by=created_by,
                status="PROCESSING"
            )
            session.add(transcript)
        else:
            transcript.content = transcript_text
            transcript.status = "PROCESSING"
        session.commit()
        print(f"📝 Transcript processing: {transcript.id}")

        # 2️⃣ Sinh bản tóm tắt (summary)
        try:
            start = time.time()
            summary_text = clean_text(summarize_text(transcript_text))
            elapsed = (time.time() - start) * 1000

            summary = Summary(
                meeting_id=meeting_id,
                transcript_id=transcript.id,
                content=summary_text,
                created_by="AI",
                status="PENDING_REVIEW"
            )
            transcript.status = "COMPLETED"
            session.add(summary)
            session.commit()

            print(f"✅ Summary saved ({elapsed:.2f} ms): {summary.id}")

            # 3️⃣ Gửi thông báo
            try:
                publish_notification(transcript.id, summary.id, summary_text)
            except Exception as notify_err:
                print("⚠️ Notification failed:", notify_err)

        except Exception as summarize_err:
            print("❌ Summarization failed:", summarize_err)
            transcript.status = "FAILED"
            session.commit()

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"⏱️ Done in {(time.time() - start_time)*1000:.2f} ms")

    except Exception as e:
        print("❌ Fatal error while processing:", e)
        session.rollback()
        # Nếu transcript đã tạo, cập nhật FAILED
        try:
            audio_id = data.get("audio_id")
            if audio_id:
                transcript = session.query(Transcript).filter_by(audio_id=audio_id).first()
                if transcript:
                    transcript.status = "FAILED"
                    session.commit()
        except Exception as rollback_err:
            print("⚠️ Could not update transcript to FAILED:", rollback_err)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    finally:
        session.close()

# =============================
# Main
# =============================
def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue="summarization_queue", durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue="summarization_queue", on_message_callback=callback, auto_ack=False)
    print(" [*] Waiting for messages on summarization_queue. Press CTRL+C to exit")
    channel.start_consuming()


if __name__ == "__main__":
    main()
