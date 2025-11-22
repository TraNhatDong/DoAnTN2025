# Summarization Service (CPU-only)

## Build
```bash
docker build -t summarization-service .
```

## Run
```bash
docker run -d -p 8000:8000 summarization-service
```

## Test API
```bash
curl -X POST "http://localhost:8000/summarize"     -H "Content-Type: application/json"     -d '{"meeting_id":"1234","transcript":"Hôm nay chúng ta bàn về kế hoạch triển khai hệ thống microservices..."}'
```

## Notes
- Torch CPU-only được cài bằng `--index-url https://download.pytorch.org/whl/cpu`
- Model `VietAI/vit5-base` sẽ được tải về lần đầu (~500MB)
