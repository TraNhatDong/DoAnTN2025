Audio/Transcript Service (FastAPI + Worker)

Files:
- Dockerfile
- requirements.txt
- main.py (FastAPI upload endpoint)
- worker.py (RabbitMQ consumer, runs STT)
- db.py (SQLAlchemy model for transcripts)
- db_init.sql (create database + table)

How to run (with docker-compose):
1. Put this folder into your project and reference service in docker-compose.yml with:
    - minio (minio:9000)
    - rabbitmq (rabbitmq:5672)
    - mysql (mysql:3306) with DB created from db_init.sql
2. docker-compose up --build
3. Upload audio:
    curl -X POST "http://localhost:8104/audio/upload" -F "meeting_id=meeting-1" -F "file=@/path/to/sample.wav"
