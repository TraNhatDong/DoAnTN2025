# Meeting Management System (DoAnTN2025)

**Tóm tắt:**
Hệ thống quản lý và tóm tắt cuộc họp offline theo kiến trúc **Microservices**, sử dụng **AI / NLP** để tạo biên bản tự động. Hệ thống hỗ trợ lập lịch họp, quản lý phòng, xử lý audio → chuyển thành văn bản (Speech-to-Text), tóm tắt (NLP), và ký số biên bản (GnuPG).

---

## Mục tiêu dự án

* Xây dựng hệ thống quản lý cuộc họp: lịch họp, phòng họp, người tham dự, biên bản.
* Áp dụng **Microservices** để tách rời các chức năng theo service.
* Ứng dụng **Speech-to-Text**, **Speaker Diarization** và **NLP Summarization** để tự động tạo biên bản tiếng Việt từ file audio.
* Đảm bảo tính toàn vẹn và giá trị pháp lý của biên bản bằng **ký số GnuPG**.

---

## Kiến trúc & thành phần chính

Hệ thống được chia thành các microservice sau:

* **User Service**
  Quản lý tài khoản, phân quyền (user[chủ trì, thư ký, thành viên], admin).

* **Meeting Service**
  CRUD cuộc họp, tìm kiếm cuộc họp, quản lý lịch và phòng họp.

* **Room Service**
  Quản lý trạng thái phòng (còn trống, đang sử dụng).

* **Audio / Transcript Service**
  Nhận file audio, xử lý Speech-to-Text (Whisper), lưu transcript.

* **Summarization Service**
  Tóm tắt transcript, sinh biên bản ngắn gọn (sử dụng viT5 ).

* **Signature Service**
  Ký số biên bản bằng **GnuPG** để đảm bảo tính toàn vẹn và tính pháp lý.

* **Notification Service**
  Gửi email thông báo & chia sẻ biên bản (PDF) tới người tham dự.

* **API Gateway** (Spring Cloud Gateway)
  Tập trung endpoint, điều phối request tới các microservice.

* **Service Discovery** (Eureka)
  Tự động phát hiện service trong môi trường microservices.

* **Message Broker** (RabbitMQ )
  Dùng cho giao tiếp bất đồng bộ giữa các service (ví dụ: audio upload → publish event → transcript service xử lý).

---

## Công nghệ sử dụng

* Backend: **Spring Boot**, Spring Cloud (Eureka, Gateway), RESTful API,FastApier Service**
  Quản lý tài khoản, phân quyền (user[chủ trì, thư ký, thành viên], admin).

* **Meeting Service**
  CRUD cuộc họp, tìm kiếm cuộc họp, quản lý lịch và phòng họp.

* **Room Service**
  Quản lý trạng thái phòng (còn trống, đang sử dụng).

* **Audio / Transcript Service**
  Nhận file audio, xử lý Speech-to-Text (Whisper), lưu transcript.

* **Summarization Service**
  Tóm tắt transcript, sinh biên bản ngắn gọn (sử dụng viT5 ).

* **Signature Service**
  Ký số biên bản bằng **GnuPG** để đảm bảo tính toàn vẹn và tính pháp lý.

* **Notification Service**
  Gửi email thông báo & chia sẻ biên bản (PDF) tới người tham dự.

* **API Gateway** (Spring Cloud Gateway)
  Tập trung endpoint, điều phối request tới các microservice.

* **Service Discovery** (Eureka)
  Tự động phát hiện service trong môi trường microservices.

* **Message Broker** (RabbitMQ )
  Dùng cho giao tiếp bất đồng bộ giữa các service (ví dụ: audio upload → publish event → transcript service xử lý).

---

## Công nghệ sử dụng

* Backend: **Spring Boot**, Spring Cloud (Eureka, Gateway), RESTful API,FastAPI
* Message Broker: **RabbitMQ** 
* Database: **MySQL** 
* Frontend: **React** (+ MUI)
* Containerization: **Docker** (và Docker Compose để chạy local multi-container)
* Speech-to-Text: **Whisper**
* Speaker Diarization: **pyannote.audio**
* NLP Summarization: **viT5** 
* Digital Signature: **GnuPG**
* Optional: MinIO (object storage)

---

## Tính năng (người dùng — thư ký / thành viên)

* Thư ký:

  * Đặt lịch họp, mời tham dự, chọn phòng.
  * Upload file audio sau họp để chuyển thành transcript và tóm tắt.
  * Duyệt & phát hành biên bản (PDF), ký số và gửi email cho người tham dự.
* Chủ trì:

  * Xác nhận tổ chức cuộc họp.
  * Xem transcript chi tiết và bản tóm tắt; xác nhận/đồng ý biên bản.

* Thành viên:
  
  * Xem lịch họp, nhận thông báo.
  * Xem transcript chi tiết và bản tóm tắt; xác nhận/đồng ý biên bản.

---

## Hướng dẫn cấu trúc repository (gợi ý)

Monorepo (khuyến nghị):

```
DoAnTN2025/
  ├── my-app/       
  ├── backend/         
  │    ├── user-service/
  │    ├── meeting-service/
  │    ├── room-service/
  │    ├── audio-service/
  │    ├── summarization-service/
  │    ├── signature-service/
  │    └── notification-service/
  ├── docker-compose.yml
  └── README.md
```

---

## Hướng dẫn chạy (mô tả ngắn)

> **Lưu ý:** Các lệnh dưới là mẫu — điều chỉnh theo cấu hình project của bạn.

1. **Chuẩn bị environment**

   * Cài đặt Docker & Docker Compose (đề xuất cho local multi-service).
   * Cài đặt Java 17+, Maven/Gradle cho backend.
   * Cài Node.js cho frontend.

2. **Chạy database & message broker**

   * Dùng docker-compose để khởi chạy MySQL + RabbitMQ/Kafka:

     ```bash
     docker-compose up -d mysql rabbitmq
     ```

3. **Chạy từng microservice (backend)**

   * Vào folder service, build & chạy:

     ```bash
     cd backend/meeting-service
     ./mvnw spring-boot:run
     ```
   * Hoặc dùng Docker image cho mỗi service:

     ```bash
     docker build -t doantn/meeting-service .
     docker run --env-file .env doantn/meeting-service
     ```

4. **Chạy frontend**

   ```bash
   cd my-app
   npm install
   npm run dev   # or npm start
   ```

5. **Pipeline xử lý audio → transcript → summary**

   * Người dùng upload audio → audio-service lưu file (MinIO / storage) → publish event → transcript service xử lý STT → lưu transcript → publish event → summarization service tóm tắt → lưu biên bản → signature service ký khi thư ký duyệt → notification service gửi email.

---

## Cấu hình AI / NLP (ghi chú)

* **Speech-to-Text**: thử nghiệm Whisper để accuracy, Vosk cho offline nhẹ, Google STT cho production nếu cần độ chính xác cao.
* **Speaker Diarization**: pyannote.audio (cần GPU nếu xử lý chất lượng cao).
* **Summarization**: dùng BART / T5; với tiếng Việt nên thử viT5 hoặc fine-tune/adapter để có kết quả tốt hơn.
* Xem xét pipeline tiền xử lý tiếng Việt (normalize, remove filler words, punctuation restoration).

---

## Ký số & bảo mật

* Sử dụng **GnuPG** để ký file PDF biên bản (detached signature hoặc embed vào PDF).
* Lưu private key an toàn (ví dụ: vault / secure storage).
* Cân nhắc HTTPS cho API Gateway và xác thực (JWT/OAuth2).



* Chọn license phù hợp (MIT / Apache-2.0) và thêm file `LICENSE`.
