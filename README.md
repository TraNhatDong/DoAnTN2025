# Meeting Management System (DoAnTN2025)

**Hệ thống quản lý và tóm tắt cuộc họp offline** theo kiến trúc **Microservices**, ứng dụng **AI/NLP** để tự động tạo biên bản từ file ghi âm. Hệ thống hỗ trợ lập lịch họp, quản lý phòng họp, xử lý âm thanh → chuyển thành văn bản (Speech-to-Text), tách người nói (Speaker Diarization), tóm tắt nội dung và ký số biên bản (GnuPG).

---

##  Mục tiêu dự án

* Xây dựng hệ thống quản lý lịch họp, phòng họp, người tham dự và biên bản.
* Ứng dụng kiến trúc **Microservices** để đảm bảo khả năng mở rộng, dễ bảo trì.
* Tự động xử lý audio để tạo transcript và bản tóm tắt tiếng Việt bằng AI.
* Đảm bảo tính toàn vẹn và tính pháp lý của biên bản bằng **chữ ký số GnuPG**.

---

##  Kiến trúc hệ thống

Hệ thống gồm các Microservice độc lập:

### **1. User Service**

* Quản lý tài khoản, vai trò (Admin, Chủ trì, Thư ký, Thành viên).
* Xác thực & phân quyền.

### **2. Meeting Service**

* CRUD cuộc họp, mời tham dự, kiểm tra phòng trống.
* Quản lý trạng thái cuộc họp.

### **3. Room Service**

* Quản lý phòng họp (trống / đã đặt / đang họp).

### **4. Audio Service**

* Nhận file audio từ người dùng.
* Gửi sự kiện để Trigger xử lý STT.

### **5. Transcript Service**

* Chuyển audio → text bằng **Whisper**.
* Tạo metadata timestamp, speaker.

### **6. Summarization Service**

* Tóm tắt transcript bằng mô hình **viT5**.
* Sinh bản tóm tắt ngắn gọn, rõ ý.

### **7. Signature Service**

* Ký số biên bản bằng **GnuPG** (detached signature hoặc embed PDF).
* Lưu trữ & verify signature.

### **8. Notification Service**

* Gửi email thông báo: mời họp, biên bản, file PDF đã ký.

### **9. API Gateway (Spring Cloud Gateway)**

* Điểm vào duy nhất của toàn hệ thống.
* Routing + load balancing.

### **10. Eureka Service Discovery**

* Tự động phát hiện và đăng ký dịch vụ.

### **11. RabbitMQ**

* Event-driven workflow:

  ```
  audio_uploaded → transcript_created → summary_created → signature_ready
  ```

---

##  Công nghệ sử dụng

### **Backend**

* Spring Boot, Spring Cloud (Gateway, Eureka)
* FastAPI cho Audio/AI microservices
* RESTful API

### **Frontend**

* React + MUI

### **AI / NLP**

* Whisper: Speech-to-Text
* pyannote.audio: Speaker Diarization
* viT5: Summarization
* Punctuation Restoration (optional)

### **Hạ tầng**

* MySQL
* RabbitMQ
* Docker & Docker Compose
* MinIO (optional – lưu file audio/transcript/PDF)

### **Bảo mật & chữ ký số**

* GnuPG

---

##  Tính năng theo vai trò

### **Thư ký**

* Lập lịch họp, đặt phòng.
* Upload file ghi âm sau cuộc họp.
* Duyệt, chỉnh sửa và phát hành biên bản.
* Ký số PDF → gửi cho người tham dự.

### **Chủ trì**

* Xác nhận tổ chức cuộc họp.
* Xem transcript/tóm tắt.
* Duyệt biên bản cuối cùng.

### **Thành viên**

* Nhận thông báo mời họp.
* Xem lịch.
* Xem transcript & bản tóm tắt.

---

##  Kiến trúc thư mục (gợi ý)

```
DoAnTN2025/
  ├── my-app/               # Frontend React
  ├── backend/
  │    ├── user-service/
  │    ├── meeting-service/
  │    ├── room-service/
  │    ├── audio-service/
  │    ├── transcript-service/
  │    ├── summarization-service/
  │    ├── signature-service/
  │    └── notification-service/
  ├── docker-compose.yml
  └── README.md
```

---

##  Hướng dẫn chạy hệ thống

### **1. Chuẩn bị môi trường**

* Docker + Docker Compose
* Java 17+, Maven/Gradle
* Node.js
* Python 3.10+ (cho audio + AI services)

### **2. Chạy MySQL & RabbitMQ**

```bash
docker-compose up -d mysql rabbitmq
```

### **3. Chạy các microservice backend**

```bash
cd backend/meeting-service
./mvnw spring-boot:run
```

Hoặc chạy bằng Docker:

```bash
docker build -t doantn/meeting-service .
docker run --env-file .env doantn/meeting-service
```

### **4. Chạy dịch vụ AI (FastAPI)**

```bash
uvicorn app.main:app --reload --port 8002
```

### **5. Chạy frontend**

```bash
cd my-app
npm install
npm run dev
```

---

##  Pipeline xử lý Audio → Transcript → Summary → Signature

1. **Upload audio**
2. Audio Service lưu file, publish sự kiện `audio_uploaded`
3. Transcript Service xử lý Whisper → transcript
4. Publish `transcript_created`
5. Summarization Service tóm tắt bằng viT5 → tạo biên bản
6. Publish `summary_created`
7. Signature Service ký số bằng GnuPG
8. Notification gửi email + PDF

---

##  Ký số & bảo mật

* Ký số PDF bằng **GnuPG** (RSA 4096 recommended).
* Lưu private key trong Vault / encrypted volume.
* Hỗ trợ verify signature khi tải xuống.
* JWT cho Authentication.
* HTTPS tại API Gateway.

---

##  License

Bạn có thể chọn:

* MIT (tự do thương mại, mở)
* Apache 2.0 (thêm bảo vệ bằng sáng chế)

---
