FROM python:3.11-slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg build-essential libsndfile1 git \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# use pypi mirror and longer timeout to avoid build-time network issues
RUN pip install --upgrade pip setuptools wheel \
 && pip install --no-cache-dir --default-timeout=100 -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY . .

RUN mkdir -p /app/uploads

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
