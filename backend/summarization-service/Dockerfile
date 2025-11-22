FROM python:3.11-slim-bullseye

WORKDIR /app
COPY requirements.txt .

# Cài torch CPU-only từ index-url chính thức của PyTorch
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Preload model VietAI/vit5-base-vietnews-summarization vào cache HuggingFace
RUN python -c "from transformers import AutoTokenizer, AutoModelForSeq2SeqLM; \
    AutoTokenizer.from_pretrained('VietAI/vit5-base-vietnews-summarization'); \
    AutoModelForSeq2SeqLM.from_pretrained('VietAI/vit5-base-vietnews-summarization')"

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
